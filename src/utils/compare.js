function parsePrice(val) {
  if (val === null || val === undefined || val === '') return NaN
  const str = String(val).replace(/[^\d.,\-]/g, '').replace(',', '.')
  return parseFloat(str)
}

export function compareFiles(sideA, sideB) {
  const { data: dataA, codeCol: codeA, priceCol: priceA } = sideA
  const { data: dataB, codeCol: codeB, priceCol: priceB } = sideB

  const mapB = {}
  dataB.forEach(row => {
    const key = String(row[codeB] || '').trim().toUpperCase()
    if (key) mapB[key] = row
  })

  const results = []
  const seenKeys = new Set()

  dataA.forEach(rowA => {
    const key = String(rowA[codeA] || '').trim().toUpperCase()
    if (!key) return
    seenKeys.add(key)
    const pA = parsePrice(rowA[priceA])
    const rowB = mapB[key]
    if (!rowB) {
      results.push({ code: key, priceA: pA, priceB: NaN, status: 'only-a' })
      return
    }
    const pB = parsePrice(rowB[priceB])
    const equal = !isNaN(pA) && !isNaN(pB) && Math.abs(pA - pB) < 0.001
    results.push({ code: key, priceA: pA, priceB: pB, status: equal ? 'ok' : 'diff' })
  })

  Object.keys(mapB).forEach(key => {
    if (!seenKeys.has(key)) {
      const pB = parsePrice(mapB[key][priceB])
      results.push({ code: key, priceA: NaN, priceB: pB, status: 'only-b' })
    }
  })

  return results
}
