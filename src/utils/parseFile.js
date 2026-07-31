import * as XLSX from 'xlsx'
import { parsePDF } from './parsePDF'
import { validateResult } from './validateResult'

const CODE_KW = ['codigo', 'code', 'cod', 'articulo', 'id', 'sku', 'referencia', 'ref', 'item', 'part']
const PRICE_KW = ['precio', 'price', 'importe', 'valor', 'costo', 'pvp', 'monto', 'lista', 'unitario', 'unit']

function norm(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
}

function findHeaderRow(rows) {
  let bestScore = 0
  let bestIndex = 0

  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const cells = rows[i]
    let score = 0
    for (const cell of cells) {
      const t = norm(cell)
      const wordCount = t.split(/\s+/).filter(Boolean).length
      // Real column headers are short labels (≤4 words). Long text is merged-cell content.
      const headerWeight = wordCount <= 2 ? 1.0 : wordCount <= 4 ? 0.5 : 0.0
      if (CODE_KW.some(k => t.includes(k))) score += 3 * headerWeight
      if (PRICE_KW.some(k => t.includes(k))) score += 3 * headerWeight
      if (t && isNaN(parseFloat(t.replace(',', '.')))) score += 0.3
    }
    // More non-empty columns = more likely to be a real header row
    score += Math.min(cells.filter(c => String(c).trim()).length * 0.6, 4)
    if (score > bestScore) {
      bestScore = score
      bestIndex = i
    }
  }

  return bestIndex
}

function rowsToData(rows, headerIdx) {
  const rawHeaders = rows[headerIdx].map(h => String(h).trim())

  const seen = {}
  const headers = rawHeaders.map((h, i) => {
    const key = h || `Col${i + 1}`
    if (seen[key] === undefined) { seen[key] = 0; return key }
    seen[key]++
    return `${key}_${seen[key]}`
  })

  const data = []
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i]
    if (row.every(c => c === '' || c === null || c === undefined)) continue
    const obj = {}
    headers.forEach((h, idx) => { obj[h] = row[idx] !== undefined ? row[idx] : '' })
    data.push(obj)
  }

  const activeHeaders = headers.filter(h => data.some(r => String(r[h]).trim() !== ''))
  return { data, headers: activeHeaders }
}

export function parseFile(file, callback) {
  const name = file.name.toLowerCase()

  if (name.endsWith('.pdf')) {
    parsePDF(file, callback)
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    let wb
    if (name.endsWith('.csv')) {
      wb = XLSX.read(e.target.result, { type: 'string' })
    } else {
      wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' })
    }
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

    const headerIdx = findHeaderRow(rawRows)
    const { data, headers } = rowsToData(rawRows, headerIdx)
    callback(data, headers, validateResult(data, headers, false))
  }

  if (name.endsWith('.csv')) {
    reader.readAsText(file, 'UTF-8')
  } else {
    reader.readAsArrayBuffer(file)
  }
}
