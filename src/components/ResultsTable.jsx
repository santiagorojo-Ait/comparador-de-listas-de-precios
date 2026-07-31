import { useState, useEffect } from 'react'

const STATUS_CONFIG = {
  ok:   { label: '✓ Igual',      cls: 'bg-accent-dim text-accent' },
  diff: { label: '✕ Diferencia', cls: 'bg-danger-dim text-danger' },
}

const ROW_BG = {
  ok:   '',
  diff: 'bg-danger/5',
}

const PAGE_SIZE = 10

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
  const [page, setPage] = useState(1)

  useEffect(() => { setPage(1) }, [rows])

  if (rows.length === 0) {
    return (
      <div className="text-center py-12 text-muted text-sm">
        Sin resultados para este filtro
      </div>
    )
  }

  const totalPages = Math.ceil(rows.length / PAGE_SIZE)
  const visible = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const cols = ['Código', 'Estado', nameA, nameB, 'Δ %']

  return (
    <div>
      <div className="rounded-xl border border-app-border overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-surface2">
              {cols.map((h, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs uppercase tracking-widest text-muted font-semibold whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => {
              const cfg = STATUS_CONFIG[r.status]
              return (
                <tr key={i} className={`border-t border-app-border ${ROW_BG[r.status]}`}>
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 px-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-xs px-3 py-1.5 rounded-md border border-app-border text-muted hover:border-accent hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>
          <span className="text-xs text-muted">
            Página <span className="text-prose font-semibold">{page}</span> de <span className="text-prose font-semibold">{totalPages}</span>
            <span className="ml-2 text-muted/60">({rows.length} artículos)</span>
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-xs px-3 py-1.5 rounded-md border border-app-border text-muted hover:border-accent hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}
