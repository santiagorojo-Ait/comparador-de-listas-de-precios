import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url'
import { validateResult } from './validateResult'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

const Y_TOLERANCE = 4

const CODE_KW = ['codigo', 'code', 'cod', 'articulo', 'id', 'sku', 'referencia', 'ref', 'item', 'part']
const PRICE_KW = ['precio', 'price', 'importe', 'valor', 'costo', 'pvp', 'monto', 'lista', 'unitario', 'unit']

function norm(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
}

function clusterIntoRows(items) {
  if (!items.length) return []
  const sorted = [...items].sort((a, b) => a.y - b.y)
  const rows = []
  let currentRow = [sorted[0]]
  let rowY = sorted[0].y

  for (let i = 1; i < sorted.length; i++) {
    if (Math.abs(sorted[i].y - rowY) <= Y_TOLERANCE) {
      currentRow.push(sorted[i])
    } else {
      rows.push(currentRow.sort((a, b) => a.x - b.x))
      currentRow = [sorted[i]]
      rowY = sorted[i].y
    }
  }
  rows.push(currentRow.sort((a, b) => a.x - b.x))
  return rows
}

function findHeaderRowIndex(rows) {
  let bestScore = 0
  let bestIndex = 0

  for (let i = 0; i < Math.min(rows.length, 30); i++) {
    const texts = rows[i].map(item => norm(item.str))
    let score = 0
    for (const t of texts) {
      const wordCount = t.split(/\s+/).filter(Boolean).length
      // Real column headers are short labels (≤4 words). Long text is paragraph content.
      const headerWeight = wordCount <= 2 ? 1.0 : wordCount <= 4 ? 0.5 : 0.0
      if (CODE_KW.some(k => t.includes(k))) score += 3 * headerWeight
      if (PRICE_KW.some(k => t.includes(k))) score += 3 * headerWeight
      if (t && isNaN(parseFloat(t.replace(',', '.')))) score += 0.3
    }
    // More columns = more likely to be a real table header row
    score += Math.min(rows[i].length * 0.6, 4)
    if (score > bestScore) {
      bestScore = score
      bestIndex = i
    }
  }

  return bestIndex
}

function buildData(rows, headerIdx) {
  const headerItems = rows[headerIdx].filter(item => item.str.trim())
  const rawHeaders = headerItems.map(item => item.str.trim())
  const headerXs = headerItems.map(item => item.x)

  // Deduplicate header names
  const seen = {}
  const headers = rawHeaders.map(h => {
    if (seen[h] === undefined) { seen[h] = 0; return h }
    seen[h]++
    return `${h}_${seen[h]}`
  })

  const data = []
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row.length) continue

    const obj = {}
    headers.forEach(h => { obj[h] = '' })

    for (const item of row) {
      const text = item.str.trim()
      if (!text) continue
      // Assign cell to nearest header column by X position
      let minDist = Infinity
      let nearestIdx = 0
      headerXs.forEach((hx, idx) => {
        const dist = Math.abs(item.x - hx)
        if (dist < minDist) { minDist = dist; nearestIdx = idx }
      })
      const col = headers[nearestIdx]
      obj[col] = obj[col] ? `${obj[col]} ${text}` : text
    }

    if (Object.values(obj).every(v => !v)) continue
    data.push(obj)
  }

  return { data, headers }
}

export function parsePDF(file, callback) {
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const typedArray = new Uint8Array(e.target.result)
      const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise
      const allItems = []

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale: 1 })
        const pageHeight = viewport.height
        const pageOffset = (pageNum - 1) * pageHeight
        const textContent = await page.getTextContent()

        for (const item of textContent.items) {
          if (!item.str.trim()) continue
          // Convert PDF coords (y from bottom) to screen coords (y from top), stack pages
          const x = item.transform[4]
          const y = pageOffset + (pageHeight - item.transform[5])
          allItems.push({ str: item.str, x: Math.round(x), y: Math.round(y) })
        }
      }

      const rows = clusterIntoRows(allItems)
      if (!rows.length) {
        callback([], [], { type: 'error', message: 'El PDF no tiene texto extraíble. Probablemente es un documento escaneado (imagen).' })
        return
      }

      const headerIdx = findHeaderRowIndex(rows)
      const { data, headers } = buildData(rows, headerIdx)
      callback(data, headers, validateResult(data, headers, true))
    } catch (err) {
      console.error('Error al parsear PDF:', err)
      callback([], [], { type: 'error', message: 'No se pudo leer el PDF. El archivo puede estar dañado o protegido.' })
    }
  }
  reader.readAsArrayBuffer(file)
}
