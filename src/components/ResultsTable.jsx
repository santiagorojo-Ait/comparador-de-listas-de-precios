const STATUS_CONFIG = {
  ok:   { label: '✓ Igual',      cls: 'bg-accent-dim text-accent' },
  diff: { label: '✕ Diferencia', cls: 'bg-danger-dim text-danger' },
}

const ROW_BG = {
  ok:   '',
  diff: 'bg-danger/5',
}

function formatPrice(val) {
  if (isNaN(val)) return <span className="text-muted italic">—</span>
  return '$' + val.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function Delta({ row }) {
  if (row.status === 'ok') {
    return <span className="text-muted text-xs">0%</span>
  }
  if (row.status !== 'diff' || isNaN(row.priceA) || isNaN(row.priceB) || row.priceA === 0) {
    return <span className="text-muted italic text-xs">—</span>
  }
  const pct = ((row.priceB - row.priceA) / row.priceA) * 100
  const barW = Math.min(Math.abs(pct) * 1.5, 80)
  const sign = pct > 0 ? '+' : ''
  const color = pct > 0 ? 'text-danger' : 'text-accent'
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 rounded-full bg-danger" style={{ width: barW + 'px', minWidth: 4 }} />
      <span className={`text-xs whitespace-nowrap ${color}`}>{sign}{pct.toFixed(1)}%</span>
    </div>
  )
}

export default function ResultsTable({ rows, nameA, nameB }) {
  if (rows.length === 0) {
    return (
      <div className="text-center py-12 text-muted text-sm">
        Sin resultados para este filtro
      </div>
    )
  }

  const cols = ['Código', 'Estado', nameA, nameB, 'Δ %']

  return (
    <div className="rounded-xl border border-app-border overflow-hidden">
      <table className="w-full text-sm table-fixed border-collapse">
        <thead>
          <tr className="bg-surface2">
            {cols.map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-widest text-muted font-semibold whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="block overflow-y-auto max-h-[55vh] w-full">
          {rows.map((r, i) => {
            const cfg = STATUS_CONFIG[r.status]
            return (
              <tr key={i} className={`table w-full table-fixed border-t border-app-border ${ROW_BG[r.status]}`}>
                <td className="px-4 py-2.5 font-mono text-xs">{r.code}</td>
                <td className="px-4 py-2.5">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${cfg.cls}`}>
                    {cfg.label}
                  </span>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs">{formatPrice(r.priceA)}</td>
                <td className="px-4 py-2.5 font-mono text-xs">{formatPrice(r.priceB)}</td>
                <td className="px-4 py-2.5"><Delta row={r} /></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
