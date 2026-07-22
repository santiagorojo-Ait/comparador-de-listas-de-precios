import * as XLSX from 'xlsx'

export function parseFile(file, callback) {
  const reader = new FileReader()
  reader.onload = (e) => {
    let data
    const name = file.name.toLowerCase()
    if (name.endsWith('.csv')) {
      const wb = XLSX.read(e.target.result, { type: 'string' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      data = XLSX.utils.sheet_to_json(ws, { defval: '' })
    } else {
      const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      data = XLSX.utils.sheet_to_json(ws, { defval: '' })
    }
    const headers = data.length > 0 ? Object.keys(data[0]) : []
    callback(data, headers)
  }
  if (file.name.toLowerCase().endsWith('.csv')) {
    reader.readAsText(file, 'UTF-8')
  } else {
    reader.readAsArrayBuffer(file)
  }
}
