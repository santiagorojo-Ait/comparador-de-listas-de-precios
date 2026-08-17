import { useRef, useState } from 'react'
import { parseFile } from '../utils/parseFile'
import Spinner from './Spinner'

function findDuplicateCodes(data, codeCol) {
  const seen = {}
  data.forEach(row => {
    const k = String(row[codeCol] || '').trim().toUpperCase()
    if (k) seen[k] = (seen[k] || 0) + 1
  })
  return Object.entries(seen).filter(([, c]) => c > 1).map(([k]) => k)
}

const CODE_KEYWORDS = ['codigo', 'code', 'cod', 'articulo', 'id', 'sku', 'referencia', 'ref']
const PRICE_KEYWORDS = ['precio', 'price', 'importe', 'valor', 'costo', 'pvp', 'monto']
const VALID_EXTS = ['.xlsx', '.xls', '.csv', '.pdf']

function getCategory(ext) {
  if (ext === '.pdf') return 'pdf'
  if (['.xlsx', '.xls', '.csv'].includes(ext)) return 'spreadsheet'
  return null
}

function autoDetect(headers, keywords) {
  // Only match short header names (real column labels, not paragraph text)
  return headers.find(h =>
    h.length <= 40 && keywords.some(k => h.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(k))
  ) || ''
}

function FileAlert({ status }) {
  if (!status) return null
  const isError = status.type === 'error'
  return (
    <div className={[
      'mt-3 rounded-lg px-3 py-2 text-xs flex items-start gap-2 border',
      isError
        ? 'bg-danger-dim/40 border-danger/40 text-danger'
        : 'bg-warn-dim/40 border-warn/40 text-warn',
    ].join(' ')}>
      <span className="font-bold shrink-0 mt-px">{isError ? '✕' : '!'}</span>
      <span>{status.message}</span>
    </div>
  )
}

export default function FilePanel({ side, label, sideState, onFileLoad, onColChange, ...rest }) {
  const inputRef = useRef()
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fileStatus, setFileStatus] = useState(null)

  const handleLoad = (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase()
    if (!VALID_EXTS.includes(ext)) {
      setFileStatus({
        type: 'error',
        message: `Formato no soportado: "${ext}". Usá .xlsx, .xls, .csv o .pdf.`,
      })
      return
    }

    setFileStatus(null)
    setLoading(true)
    parseFile(file, (data, headers, status) => {
      const detected = {
        codeCol: autoDetect(headers, CODE_KEYWORDS),
        priceCol: autoDetect(headers, PRICE_KEYWORDS),
      }
      onFileLoad(side, file, data, headers, detected)

      const noColumns = data.length > 0 && !detected.codeCol && !detected.priceCol
      let finalStatus = status ?? (noColumns
        ? { type: 'warn', message: 'No se detectaron columnas de código ni precio. El archivo puede no ser una lista de precios.' }
        : null)

      if (!finalStatus && detected.codeCol) {
        const dups = findDuplicateCodes(data, detected.codeCol)
        if (dups.length > 0) {
          const shown = dups.slice(0, 10)
          finalStatus = {
            type: 'warn',
            message: `Hay ${dups.length} código${dups.length > 1 ? 's' : ''} repetido${dups.length > 1 ? 's' : ''} en esta lista: ${shown.join(', ')}${dups.length > 10 ? ' y más...' : ''}`,
          }
        }
      }

      setFileStatus(finalStatus)
      setLoading(false)
    })
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleLoad(file)
  }

  const hasError = fileStatus?.type === 'error'
  const hasWarn  = fileStatus?.type === 'warn'

  const dropClass = [
    'border-2 border-dashed rounded-lg p-8 text-center transition-all',
    loading ? 'border-accent/50 cursor-wait' : 'cursor-pointer',
    !loading && dragging ? 'border-accent bg-accent/5' : '',
    !loading && !dragging && hasError ? '!border-solid !border-danger' : '',
    !loading && !dragging && hasWarn  ? '!border-solid !border-warn'   : '',
    !loading && !dragging && !hasError && !hasWarn && sideState.file ? '!border-solid !border-accent' : '',
    !loading && !dragging && !hasError && !hasWarn && !sideState.file ? 'border-app-border hover:border-accent hover:bg-accent/5' : '',
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
              <p className={[
                'font-semibold text-sm',
                hasError ? 'text-danger' : hasWarn ? 'text-warn' : 'text-accent',
              ].join(' ')}>{sideState.file.name}</p>
            ) : (
              <>
                <p className="text-muted text-sm">Arrastrá o hacé clic para subir</p>
                <p className="text-muted text-xs mt-1">.xlsx, .xls, .csv, .pdf</p>
              </>
            )}
          </>
        )}
      </div>

      <FileAlert status={fileStatus} />

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".xlsx,.xls,.csv,.pdf"
        onChange={e => e.target.files[0] && handleLoad(e.target.files[0])}
      />

      <div className="grid grid-cols-2 gap-3 mt-4">
        {[
          ['codeCol', 'Columna de Código'],
          ['priceCol', 'Columna de Precio'],
        ].map(([field, lbl]) => (
          <div key={field}>
            <label className="block text-xs text-muted mb-1">{lbl}</label>
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
