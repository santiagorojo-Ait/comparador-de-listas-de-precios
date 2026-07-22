import { useState, useCallback } from 'react'
import FilePanel from './components/FilePanel'
import StatsBar from './components/StatsBar'
import FilterBar from './components/FilterBar'
import ResultsTable from './components/ResultsTable'
import { compareFiles } from './utils/compare'

const INITIAL_SIDE = { data: null, headers: [], file: null, codeCol: '', priceCol: '' }

export default function App() {
  const [sideA, setSideA] = useState(INITIAL_SIDE)
  const [sideB, setSideB] = useState(INITIAL_SIDE)
  const [results, setResults] = useState([])
  const [hasCompared, setHasCompared] = useState(false)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

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

  const compare = () => {
    setResults(compareFiles(sideA, sideB))
    setHasCompared(true)
    setFilter('all')
    setSearch('')
  }

  const counts = {
    ok:       results.filter(r => r.status === 'ok').length,
    diff:     results.filter(r => r.status === 'diff').length,
    'only-a': results.filter(r => r.status === 'only-a').length,
    'only-b': results.filter(r => r.status === 'only-b').length,
  }

  const filteredResults = results.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false
    if (search && !r.code.includes(search.toUpperCase())) return false
    return true
  })

  const nameA = sideA.file ? sideA.file.name.replace(/\.[^.]+$/, '') : 'Lista A'
  const nameB = sideB.file ? sideB.file.name.replace(/\.[^.]+$/, '') : 'Lista B'

  return (
    <div className="min-h-screen bg-bg text-prose font-sans px-6 py-8 pb-16">
      <header className="text-center mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-accent">
          Comparador de Listas de Precios
        </h1>
        <p className="text-muted text-sm mt-1">
          Subí dos archivos Excel y verificá si los precios coinciden artículo por artículo
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto mb-8">
        <FilePanel side="A" sideState={sideA} onFileLoad={handleFileLoad} onColChange={handleColChange} />
        <FilePanel side="B" sideState={sideB} onFileLoad={handleFileLoad} onColChange={handleColChange} />
      </div>

      <div className="text-center mb-10">
        <button
          onClick={compare}
          disabled={!canCompare}
          className="bg-accent text-bg font-bold px-10 py-3 rounded-lg text-sm tracking-wide transition-all disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:opacity-90 enabled:hover:-translate-y-px"
        >
          Comparar listas →
        </button>
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
          <ResultsTable rows={filteredResults} nameA={nameA} nameB={nameB} />
        </div>
      )}
    </div>
  )
}
