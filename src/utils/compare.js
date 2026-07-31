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
  const str = String(val).replace(/[^\d.,\-]/g, '').replace(',', '.')
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

export function compareFiles(sideA, sideB) {
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
    const pA = parsePrice(rowA[priceA])
    const rowB = mapB[key]
    if (!rowB) return
    const pB = parsePrice(rowB[priceB])
    const equal = !isNaN(pA) && !isNaN(pB) && Math.abs(pA - pB) < 0.001
    results.push({ code: key, priceA: pA, priceB: pB, status: equal ? 'ok' : 'diff' })
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
