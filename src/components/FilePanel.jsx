import { useRef, useState } from 'react'
import { parseFile } from '../utils/parseFile'
import Spinner from './Spinner'

const CODE_KEYWORDS = ['codigo', 'code', 'cod', 'articulo', 'id', 'sku', 'referencia', 'ref']
const PRICE_KEYWORDS = ['precio', 'price', 'importe', 'valor', 'costo', 'pvp', 'monto']

function autoDetect(headers, keywords) {
  return headers.find(h => keywords.some(k => h.toLowerCase().includes(k))) || ''
}

export default function FilePanel({ side, label, sideState, onFileLoad, onColChange, ...rest }) {
  const inputRef = useRef()
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLoad = (file) => {
    setLoading(true)
    parseFile(file, (data, headers) => {
      onFileLoad(side, file, data, headers, {
        codeCol: autoDetect(headers, CODE_KEYWORDS),
        priceCol: autoDetect(headers, PRICE_KEYWORDS),
      })
      setLoading(false)
    })
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleLoad(file)
  }

  const dropClass = [
    'border-2 border-dashed rounded-lg p-8 text-center transition-all',
    loading ? 'border-accent/50 cursor-wait' : 'cursor-pointer',
    !loading && dragging ? 'border-accent bg-accent/5' : '',
    !loading && !dragging ? 'border-app-border hover:border-accent hover:bg-accent/5' : '',
    sideState.file && !loading ? '!border-solid !border-accent' : '',
  ].join(' ')

  return (
    <div className="bg-surface border border-app-border rounded-xl p-6" {...rest}>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">{label}</h2>

      <div
        className={dropClass}
        onClick={() => !loading && inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); if (!loading) setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <Spinner size="lg" />
            <p className="text-muted text-sm">Procesando archivo...</p>
          </div>
        ) : (
          <>
            <div className="text-3xl mb-2">📂</div>
            {sideState.file ? (
              <p className="text-accent font-semibold text-sm">{sideState.file.name}</p>
            ) : (
              <>
                <p className="text-muted text-sm">Arrastrá o hacé clic para subir</p>
                <p className="text-muted text-xs mt-1">.xlsx, .xls, .csv</p>
              </>
            )}
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
