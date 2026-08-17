const HEADER_KEYWORDS = ['codigo', 'code', 'cod', 'articulo', 'sku', 'referencia', 'ref', 'item', 'id']

function normCode(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
}

// Returns true if the "code" cell is actually a section header repeated in the table
// e.g. "Código", "CÓDIGO ADITIVOS OTROS ACEITES"
function isSectionHeader(codeValue) {
  const n = normCode(codeValue)
  return HEADER_KEYWORDS.some(k => n === k || n.startsWith(k + ' '))
}

function cleanData(data, codeCol) {
  return data.filter(row => {
    const code = String(row[codeCol] || '').trim()
    return code && !isSectionHeader(code)
  })
}

function parsePrice(val) {
  if (val === null || val === undefined || val === '') return NaN
  if (typeof val === 'number') return Math.round(val)

  let str = String(val).replace(/[^\d.,\-]/g, '').trim()
  if (!str) return NaN

  const lastDot   = str.lastIndexOf('.')
  const lastComma = str.lastIndexOf(',')

  if (lastDot !== -1 && lastComma !== -1) {
    if (lastComma > lastDot) {
      str = str.replace(/\./g, '').replace(',', '.') // AR: 10.350,00 → 10350.00
    } else {
      str = str.replace(/,/g, '')                    // US: 10,350.00 → 10350.00
    }
  } else if (lastComma !== -1) {
    const afterComma = str.slice(lastComma + 1)
    str = afterComma.length === 3 ? str.replace(/,/g, '') : str.replace(',', '.')
  } else if (lastDot !== -1) {
    const dotCount = (str.match(/\./g) || []).length
    if (dotCount > 1) {
      str = str.replace(/\./g, '')
    } else {
      const afterDot = str.slice(lastDot + 1)
      if (afterDot.length === 3) str = str.replace('.', '')
    }
  }

  return Math.round(parseFloat(str))
}

function samplePercent(data, pct) {
  const count = Math.max(1, Math.round(data.length * pct))
  const shuffled = [...data]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, count)
}

export function compareFiles(sideA, sideB, mode = 'prices') {
  const { data: dataA, codeCol: codeA, priceCol: priceA } = sideA
  const { data: dataB, codeCol: codeB, priceCol: priceB } = sideB

  const cleanA = cleanData(dataA, codeA)
  const cleanB = cleanData(dataB, codeB)

  const sampledA = samplePercent(cleanA, 0.85)

  const mapB = {}
  cleanB.forEach(row => {
    const key = String(row[codeB] || '').trim().toUpperCase()
    if (key) mapB[key] = row
  })

  const mapA = {}
  cleanA.forEach(row => {
    const key = String(row[codeA] || '').trim().toUpperCase()
    if (key) mapA[key] = row
  })

  const results = []

  sampledA.forEach(rowA => {
    const key = String(rowA[codeA] || '').trim().toUpperCase()
    if (!key) return
    const rowB = mapB[key]
    if (!rowB) return
    if (mode === 'codes-only') {
      results.push({ code: key, priceA: NaN, priceB: NaN, status: 'ok' })
    } else {
      const pA = parsePrice(rowA[priceA])
      const pB = parsePrice(rowB[priceB])
      const equal = !isNaN(pA) && !isNaN(pB) && Math.abs(pA - pB) < 0.001
      results.push({ code: key, priceA: pA, priceB: pB, status: equal ? 'ok' : 'diff' })
    }
  })

  const onlyA = cleanA
    .filter(row => {
      const key = String(row[codeA] || '').trim().toUpperCase()
      return key && !mapB[key]
    })
    .map(row => ({
      code: String(row[codeA] || '').trim().toUpperCase(),
      price: parsePrice(row[priceA]),
    }))

  const onlyB = cleanB
    .filter(row => {
      const key = String(row[codeB] || '').trim().toUpperCase()
      return key && !mapA[key]
    })
    .map(row => ({
      code: String(row[codeB] || '').trim().toUpperCase(),
      price: parsePrice(row[priceB]),
    }))

  return { results, onlyA, onlyB }
}
