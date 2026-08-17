import { useState, useCallback, useEffect } from 'react'
import { version } from '../package.json'
import FilePanel from './components/FilePanel'
import StatsBar from './components/StatsBar'
import FilterBar from './components/FilterBar'
import ResultsTable from './components/ResultsTable'
import OnlyPanel from './components/OnlyPanel'
import Spinner from './components/Spinner'
import HelpTooltip from './components/HelpTooltip'
import WhatsNewModal from './components/WhatsNewModal'
import TourOverlay from './components/TourOverlay'
import DocsModal from './components/DocsModal'
import { compareFiles } from './utils/compare'

const INITIAL_SIDE = { data: null, headers: [], file: null, codeCol: '', priceCol: '' }
const LABEL_A = 'Lista A'
const LABEL_B = 'Lista B'

function getCategory(file) {
  if (!file) return null
  const ext = '.' + file.name.split('.').pop().toLowerCase()
  if (ext === '.pdf') return 'pdf'
  return 'spreadsheet'
}

function findDuplicateCodes(data, col) {
  const seen = {}
  data.forEach(row => {
    const k = String(row[col] || '').trim().toUpperCase()
    if (k) seen[k] = (seen[k] || 0) + 1
  })
  return Object.entries(seen).filter(([, c]) => c > 1).map(([k]) => k)
}

function checkUniquenessPerGroup(data, codeCol, checkCol) {
  const groups = {}
  data.forEach(row => {
    const code = String(row[codeCol] || '').trim().toUpperCase()
    const check = String(row[checkCol] || '').trim().toUpperCase()
    if (!code || !check) return
    if (!groups[code]) groups[code] = []
    groups[code].push(check)
  })
  const problems = []
  for (const [code, vals] of Object.entries(groups)) {
    const seen = new Set()
    for (const v of vals) {
      if (seen.has(v)) { problems.push(code); break }
      seen.add(v)
    }
  }
  return problems
}

function OriginalFinder({ side, sideState, codeCol, onClose }) {
  const otherHeaders = sideState.headers.filter(h => h !== codeCol)
  const [col, setCol] = useState(otherHeaders[0] || '')
  const [problemCodes, setProblemCodes] = useState(() => {
    if (otherHeaders[0] && sideState.data) {
      return checkUniquenessPerGroup(sideState.data, codeCol, otherHeaders[0])
    }
    return []
  })

  const handleChange = (newCol) => {
    setCol(newCol)
    if (sideState.data) {
      setProblemCodes(checkUniquenessPerGroup(sideState.data, codeCol, newCol))
    }
  }

  if (!col) return null
  const hasProblems = problemCodes.length > 0

  return (
    <div className={[
      'mt-2 rounded-lg px-3 py-3 text-xs border',
      hasProblems ? 'bg-warn-dim/40 border-warn/40' : 'bg-accent/5 border-accent/30',
    ].join(' ')}>
      {hasProblems ? (
        <div className="flex items-start gap-2 text-warn mb-2">
          <span className="font-bold shrink-0 mt-px">!</span>
          <span>
            La columna <span className="font-mono font-semibold">"{col}"</span> tiene código repetido en{' '}
            {problemCodes.length} artículo{problemCodes.length !== 1 ? 's' : ''}:{' '}
            {problemCodes.slice(0, 5).join(', ')}{problemCodes.length > 5 ? ' y más...' : ''}
          </span>
        </div>
      ) : (
        <div className="flex items-start gap-2 text-accent mb-2">
          <span className="font-bold shrink-0 mt-px">✓</span>
          <span>
            Podés usar <span className="font-mono font-semibold">"{col}"</span> como código original.
          </span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <span className="text-muted shrink-0">Verificar en:</span>
        <select
          value={col}
          onChange={e => handleChange(e.target.value)}
          className="flex-1 bg-surface2 border border-app-border text-prose rounded-md px-2 py-1 text-xs font-mono focus:outline-none focus:border-accent transition-colors cursor-pointer"
        >
          {otherHeaders.map(h => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

function DupBanner({ dupA, dupB, sideA, sideB, activeSide, onToggle }) {
  if (!dupA && !dupB) return null
  return (
    <div className="mb-6 rounded-xl border border-warn/40 bg-warn-dim/40 px-5 py-4">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-warn font-bold text-base shrink-0 mt-px">!</span>
        <p className="text-sm font-semibold text-warn">Hay códigos de artículos repetidos</p>
      </div>
      <p className="text-xs text-muted mb-3">
        Seleccioná la lista que vas a vincular en el sistema del cliente para buscar qué columna usar como código original.
      </p>
      <div className="flex flex-wrap gap-2">
        {dupA && (
          <button
            onClick={() => onToggle(activeSide === 'A' ? null : 'A')}
            className={[
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              activeSide === 'A'
                ? 'bg-warn text-bg'
                : 'border border-warn/50 text-warn/80 hover:bg-warn/10',
            ].join(' ')}
          >
            Lista A
          </button>
        )}
        {dupB && (
          <button
            onClick={() => onToggle(activeSide === 'B' ? null : 'B')}
            className={[
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              activeSide === 'B'
                ? 'bg-warn text-bg'
                : 'border border-warn/50 text-warn/80 hover:bg-warn/10',
            ].join(' ')}
          >
            Lista B
          </button>
        )}
      </div>
      {activeSide === 'A' && (
        <OriginalFinder side="A" sideState={sideA} codeCol={sideA.codeCol} />
      )}
      {activeSide === 'B' && (
        <OriginalFinder side="B" sideState={sideB} codeCol={sideB.codeCol} />
      )}
    </div>
  )
}

export default function App() {
  const [sideA, setSideA] = useState(INITIAL_SIDE)
  const [sideB, setSideB] = useState(INITIAL_SIDE)
  const [results, setResults] = useState([])
  const [filteredResults, setFilteredResults] = useState([])
  const [onlyA, setOnlyA] = useState([])
  const [onlyB, setOnlyB] = useState([])
  const [hasCompared, setHasCompared] = useState(false)
  const [showWhatsNew, setShowWhatsNew] = useState(false)
  const [showTour, setShowTour] = useState(false)
  const [showDocs, setShowDocs] = useState(false)
  const [compareMode, setCompareMode] = useState('prices')
  const [comparing, setComparing] = useState(false)
  const [filtering, setFiltering] = useState(false)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [dupA, setDupA] = useState(false)
  const [dupB, setDupB] = useState(false)
  const [activeDupSide, setActiveDupSide] = useState(null)

  useEffect(() => {
    if (results.length === 0) { setFilteredResults([]); return }
    setFiltering(true)
    const timer = setTimeout(() => {
      setFilteredResults(results.filter(r => {
        if (filter !== 'all' && r.status !== filter) return false
        if (search && !r.code.includes(search.toUpperCase())) return false
        return true
      }))
      setFiltering(false)
    }, 0)
    return () => clearTimeout(timer)
  }, [filter, search, results])

  useEffect(() => {
    const currentVersion = version.split('.').slice(0, 2).join('.')
    const lastSeen = localStorage.getItem('lastSeenVersion')
    if (lastSeen === null) {
      setShowTour(true)
    } else if (lastSeen !== currentVersion) {
      setShowWhatsNew(true)
    }
    localStorage.setItem('lastSeenVersion', currentVersion)
  }, [])

  const handleFileLoad = useCallback((side, file, data, headers, autoDetected) => {
    const setter = side === 'A' ? setSideA : setSideB
    setter({ data, headers, file, ...autoDetected })
    setHasCompared(false)
  }, [])

  const handleColChange = useCallback((side, field, value) => {
    const setter = side === 'A' ? setSideA : setSideB
    setter(prev => ({ ...prev, [field]: value }))
    setHasCompared(false)
  }, [])

  const typeMismatch =
    sideA.file && sideB.file &&
    getCategory(sideA.file) !== getCategory(sideB.file)

  const canCompare =
    !typeMismatch &&
    sideA.data && sideB.data &&
    sideA.codeCol && sideA.priceCol &&
    sideB.codeCol && sideB.priceCol

  const compare = async () => {
    setComparing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 30))
      const { results, onlyA, onlyB } = compareFiles(sideA, sideB, compareMode)
      setResults(results)
      setOnlyA(onlyA)
      setOnlyB(onlyB)
      setHasCompared(true)
      setFilter('all')
      setSearch('')
      setActiveDupSide(null)
      setDupA(sideA.codeCol ? findDuplicateCodes(sideA.data, sideA.codeCol).length > 0 : false)
      setDupB(sideB.codeCol ? findDuplicateCodes(sideB.data, sideB.codeCol).length > 0 : false)
    } finally {
      setComparing(false)
    }
  }

  const counts = {
    ok:   results.filter(r => r.status === 'ok').length,
    diff: results.filter(r => r.status === 'diff').length,
  }

  const nameA = LABEL_A
  const nameB = LABEL_B

  return (
    <>
    {showTour && <TourOverlay onFinish={() => setShowTour(false)} />}
    {showWhatsNew && (
      <WhatsNewModal version={version} onClose={() => setShowWhatsNew(false)} />
    )}
    {showDocs && <DocsModal onClose={() => setShowDocs(false)} />}
    <div className="min-h-screen bg-bg text-prose font-sans px-6 py-8 pb-16">
      <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
        <span className="text-xs text-muted border border-app-border rounded-full px-2 py-0.5 bg-surface select-none">
          v{version.split('.').slice(0, 2).join('.')}
        </span>
        <button
          onClick={() => setShowDocs(true)}
          className="text-xs text-muted border border-app-border rounded-full px-2 py-0.5 bg-surface hover:border-accent hover:text-accent transition-colors"
        >
          Docs
        </button>
      </div>
      <HelpTooltip />
      <header className="text-center mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-accent">
          Comparador de Listas de Precios
        </h1>
        <p className="text-muted text-sm mt-1">
          Subí dos archivos Excel y verificá si los precios coinciden artículo por artículo
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto mb-8">
        <FilePanel side="A" label={LABEL_A} sideState={sideA} onFileLoad={handleFileLoad} onColChange={handleColChange} data-tour="panel-a" />
        <FilePanel side="B" label={LABEL_B} sideState={sideB} onFileLoad={handleFileLoad} onColChange={handleColChange} data-tour="panel-b" />
      </div>

      <div className="text-center mb-10">
        <span className="inline-block" data-tour="compare-btn">
        <button
          onClick={compare}
          disabled={!canCompare || comparing}
          className="bg-accent text-bg font-bold px-10 py-3 rounded-lg text-sm tracking-wide transition-all disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:opacity-90 enabled:hover:-translate-y-px inline-flex items-center gap-2"
        >
          {comparing ? (
            <>
              <Spinner size="sm" />
              Comparando...
            </>
          ) : (
            'Comparar listas →'
          )}
        </button>
        </span>
        {canCompare && (
          <div className="mt-3 flex items-center justify-center">
            <button
              onClick={() => setCompareMode(prev => prev === 'codes-only' ? 'prices' : 'codes-only')}
              className={[
                'flex items-center gap-2 text-xs transition-colors select-none cursor-pointer',
                compareMode === 'codes-only' ? 'text-accent' : 'text-muted hover:text-prose',
              ].join(' ')}
            >
              <span className={[
                'relative inline-flex items-center w-8 h-4 rounded-full transition-colors duration-200 shrink-0',
                compareMode === 'codes-only' ? 'bg-accent' : 'bg-surface2 border border-app-border',
              ].join(' ')}>
                <span className={[
                  'absolute left-0.5 w-3 h-3 rounded-full bg-prose transition-transform duration-200',
                  compareMode === 'codes-only' ? 'translate-x-4' : 'translate-x-0',
                ].join(' ')} />
              </span>
              Comparar solo códigos (ignorar precios)
            </button>
          </div>
        )}
        {typeMismatch && (
          <p className="mt-3 text-xs text-warn">
            Las listas deben ser del mismo tipo — ambas PDF o ambas Excel/CSV.
          </p>
        )}
        {!typeMismatch && !canCompare && (sideA.file || sideB.file) && (
          <p className="mt-3 text-xs text-muted">
            {!sideA.file || !sideB.file
              ? 'Subí un archivo en cada panel para continuar.'
              : 'Seleccioná las columnas de código y precio en ambas listas.'}
          </p>
        )}
      </div>

      {hasCompared && (
        <div className="max-w-4xl mx-auto">
          <DupBanner
            dupA={dupA} dupB={dupB}
            sideA={sideA} sideB={sideB}
            activeSide={activeDupSide}
            onToggle={setActiveDupSide}
          />

          {results.length === 0 ? (
            <div className="mb-6 rounded-xl border border-app-border bg-surface px-5 py-4 flex items-center gap-3">
              <span className="text-2xl">⚠</span>
              <div>
                <p className="text-sm font-bold text-warn">Sin artículos coincidentes</p>
                <p className="text-xs text-muted mt-0.5">
                  No se encontraron códigos en común entre las dos listas. Verificá que ambas usen el mismo formato de código.
                </p>
              </div>
            </div>
          ) : (
            <>
              {counts.diff === 0 && (
                <div className="mb-6 rounded-xl border border-accent/30 bg-accent/5 px-5 py-4 flex items-center gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <p className="text-sm font-bold text-accent">Todas las listas coinciden</p>
                    <p className="text-xs text-muted mt-0.5">
                      Los {results.length} artículos comparados {compareMode === 'codes-only' ? 'están presentes en ambas listas.' : 'tienen el mismo precio en ambas listas.'}
                    </p>
                  </div>
                </div>
              )}
              <StatsBar counts={counts} compareMode={compareMode} />
              <FilterBar filter={filter} setFilter={setFilter} total={results.length} />
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar por código..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-surface border border-app-border text-prose placeholder:text-muted rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div className="relative">
                {filtering && (
                  <div className="absolute inset-0 bg-bg/60 backdrop-blur-[2px] flex items-center justify-center z-20 rounded-xl">
                    <Spinner size="lg" />
                  </div>
                )}
                <ResultsTable rows={filteredResults} nameA={nameA} nameB={nameB} compareMode={compareMode} />
              </div>
            </>
          )}

          {(onlyA.length > 0 || onlyB.length > 0) && (
            <OnlyPanel onlyA={onlyA} onlyB={onlyB} nameA={nameA} nameB={nameB} />
          )}

        </div>
      )}
    </div>
    </>
  )
}
