function parsePrice(val) {
  if (val === null || val === undefined || val === '') return NaN
  const str = String(val).replace(/[^\d.,\-]/g, '').replace(',', '.')
  return parseFloat(str)
}

function sampleNonConsecutive(data, count) {
  if (data.length <= 10) return []
  // Eligible: skip the first 10 rows
  const eligible = data.slice(10)
  // Shuffle eligible indices
  const shuffled = eligible.map((row, i) => ({ row, origIdx: i + 10 }))
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  // Pick up to `count` items with no two consecutive original indices
  const selected = []
  const excludedIdx = new Set()
  for (const item of shuffled) {
    if (selected.length >= count) break
    if (excludedIdx.has(item.origIdx)) continue
    selected.push(item.row)
    excludedIdx.add(item.origIdx - 1)
    excludedIdx.add(item.origIdx + 1)
  }
  return selected
}

export function compareFiles(sideA, sideB) {
  const { data: dataA, codeCol: codeA, priceCol: priceA } = sideA
  const { data: dataB, codeCol: codeB, priceCol: priceB } = sideB

  const sampleSize = Math.floor(Math.random() * 11) + 20 // entre 20 y 30
  const sampledA = sampleNonConsecutive(dataA, sampleSize)

  const mapB = {}
  dataB.slice(10).forEach(row => {
    const key = String(row[codeB] || '').trim().toUpperCase()
    if (key) mapB[key] = row
  })

  const results = []
  const seenKeys = new Set()

  sampledA.forEach(rowA => {
    const key = String(rowA[codeA] || '').trim().toUpperCase()
    if (!key) return
    seenKeys.add(key)
    const pA = parsePrice(rowA[priceA])
    const rowB = mapB[key]
    if (!rowB) return
    const pB = parsePrice(rowB[priceB])
    const equal = !isNaN(pA) && !isNaN(pB) && Math.abs(pA - pB) < 0.001
    results.push({ code: key, priceA: pA, priceB: pB, status: equal ? 'ok' : 'diff' })
  })

  return results
}
