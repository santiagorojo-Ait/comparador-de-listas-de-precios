import { useState, useCallback, useEffect } from 'react'
import { version } from '../package.json'
import FilePanel from './components/FilePanel'
import StatsBar from './components/StatsBar'
import FilterBar from './components/FilterBar'
import ResultsTable from './components/ResultsTable'
import Spinner from './components/Spinner'
import HelpTooltip from './components/HelpTooltip'
import TourOverlay from './components/TourOverlay'
import { compareFiles } from './utils/compare'

const INITIAL_SIDE = { data: null, headers: [], file: null, codeCol: '', priceCol: '' }
const LABEL_A = 'Lista en drive de proveedores'
const LABEL_B = 'Lista del cliente'

export default function App() {
  const [sideA, setSideA] = useState(INITIAL_SIDE)
  const [sideB, setSideB] = useState(INITIAL_SIDE)
  const [results, setResults] = useState([])
  const [filteredResults, setFilteredResults] = useState([])
  const [hasCompared, setHasCompared] = useState(false)
  const [showTour, setShowTour] = useState(false)
  const [comparing, setComparing] = useState(false)
  const [filtering, setFiltering] = useState(false)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

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
    const currentMajor = version.split('.')[0]
    const lastSeen = localStorage.getItem('lastSeenVersion')
    if (lastSeen === null) setShowTour(true)
    localStorage.setItem('lastSeenVersion', currentMajor)
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

  const canCompare =
    sideA.data && sideB.data &&
    sideA.codeCol && sideA.priceCol &&
    sideB.codeCol && sideB.priceCol

  const compare = async () => {
    setComparing(true)
    await new Promise(resolve => setTimeout(resolve, 30))
    setResults(compareFiles(sideA, sideB))
    setHasCompared(true)
    setFilter('all')
    setSearch('')
    setComparing(false)
  }

  const counts = {
    ok:   results.filter(r => r.status === 'ok').length,
    diff: results.filter(r => r.status === 'diff').length,
  }

  const nameA = sideA.file ? sideA.file.name.replace(/\.[^.]+$/, '') : LABEL_A
  const nameB = sideB.file ? sideB.file.name.replace(/\.[^.]+$/, '') : LABEL_B

  return (
    <>
    {showTour && <TourOverlay onFinish={() => setShowTour(false)} />}
    <div className="min-h-screen bg-bg text-prose font-sans px-6 py-8 pb-16">
      <span className="fixed top-4 left-4 z-50 text-xs text-muted border border-app-border rounded-full px-2 py-0.5 bg-surface select-none">
        v{version.split('.')[0]}
      </span>
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
      </div>

      {hasCompared && results.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <StatsBar counts={counts} />
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
            <ResultsTable rows={filteredResults} nameA={nameA} nameB={nameB} />
          </div>
        </div>
      )}
    </div>
    </>
  )
}
