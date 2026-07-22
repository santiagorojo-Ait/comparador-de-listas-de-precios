import { useRef, useState } from 'react'
import { parseFile } from '../utils/parseFile'

const CODE_KEYWORDS = ['codigo', 'code', 'cod', 'articulo', 'id', 'sku', 'referencia', 'ref']
const PRICE_KEYWORDS = ['precio', 'price', 'importe', 'valor', 'costo', 'pvp', 'monto']

function autoDetect(headers, keywords) {
  return headers.find(h => keywords.some(k => h.toLowerCase().includes(k))) || ''
}

export default function FilePanel({ side, sideState, onFileLoad, onColChange }) {
  const inputRef = useRef()
  const [dragging, setDragging] = useState(false)

  const handleLoad = (file) => {
    parseFile(file, (data, headers) => {
      onFileLoad(side, file, data, headers, {
        codeCol: autoDetect(headers, CODE_KEYWORDS),
        priceCol: autoDetect(headers, PRICE_KEYWORDS),
      })
    })
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleLoad(file)
  }

  const dropClass = [
    'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all',
    dragging ? 'border-accent bg-accent/5' : 'border-app-border hover:border-accent hover:bg-accent/5',
    sideState.file ? '!border-solid !border-accent' : '',
  ].join(' ')

  return (
    <div className="bg-surface border border-app-border rounded-xl p-6">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">Lista {side}</h2>

      <div
        className={dropClass}
        onClick={() => inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <div className="text-3xl mb-2">📂</div>
        {sideState.file ? (
          <p className="text-accent font-semibold text-sm">{sideState.file.name}</p>
        ) : (
          <>
            <p className="text-muted text-sm">Arrastrá o hacé clic para subir</p>
            <p className="text-muted text-xs mt-1">.xlsx, .xls, .csv</p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".xlsx,.xls,.csv"
        onChange={e => e.target.files[0] && handleLoad(e.target.files[0])}
      />

      <div className="grid grid-cols-2 gap-3 mt-4">
        {[
          ['codeCol', 'Columna de Código'],
          ['priceCol', 'Columna de Precio'],
        ].map(([field, label]) => (
          <div key={field}>
            <label className="block text-xs text-muted mb-1">{label}</label>
            <select
              value={sideState[field]}
              disabled={!sideState.data}
              onChange={e => onColChange(side, field, e.target.value)}
              className="w-full bg-surface2 border border-app-border text-prose rounded-md px-2 py-1.5 text-xs font-mono disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:border-accent transition-colors cursor-pointer"
            >
              <option value="">— elegir —</option>
              {sideState.headers.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}
