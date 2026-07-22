const CHIPS = [
  { key: 'ok', label: 'Coinciden', color: 'text-accent' },
  { key: 'diff', label: 'Diferencias', color: 'text-danger' },
]

export default function StatsBar({ counts }) {
  return (
    <div className="flex gap-4 mb-6 flex-wrap">
      {CHIPS.map(({ key, label, color }) => (
        <div key={key} className="bg-surface border border-app-border rounded-lg px-4 py-3 flex-1 min-w-[130px] text-center">
          <div className={`text-3xl font-bold font-mono leading-none ${color}`}>{counts[key]}</div>
          <div className="text-xs text-muted mt-1">{label}</div>
        </div>
      ))}
    </div>
  )
}
