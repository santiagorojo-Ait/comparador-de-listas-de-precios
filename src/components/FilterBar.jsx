const FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'ok', label: 'Coinciden' },
  { value: 'diff', label: 'Diferencias' },
  { value: 'only-a', label: 'Solo en A' },
  { value: 'only-b', label: 'Solo en B' },
]

export default function FilterBar({ filter, setFilter, total }) {
  return (
    <div className="flex gap-2 mb-4 flex-wrap">
      {FILTERS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setFilter(value)}
          className={`px-4 py-1.5 rounded-full text-xs transition-all border ${
            filter === value
              ? 'border-accent text-accent bg-accent/10'
              : 'border-app-border text-muted bg-surface hover:border-accent/50'
          }`}
        >
          {label}{value === 'all' ? ` (${total})` : ''}
        </button>
      ))}
    </div>
  )
}
