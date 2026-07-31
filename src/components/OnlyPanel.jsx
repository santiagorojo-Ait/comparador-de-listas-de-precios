import { useState } from 'react'

const PAGE_SIZE = 10

function formatPrice(val) {
  if (isNaN(val)) return <span className="text-muted italic">—</span>
  return '$' + val.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function ArticleList({ items }) {
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(items.length / PAGE_SIZE)
  const visible = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <div className="rounded-lg border border-app-border overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-surface2">
              <th className="px-4 py-2.5 text-left text-xs uppercase tracking-widest text-muted font-semibold">Código</th>
              <th className="px-4 py-2.5 text-left text-xs uppercase tracking-widest text-muted font-semibold">Precio</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item, i) => (
              <tr key={i} className="border-t border-app-border">
                <td className="px-4 py-2 font-mono text-xs">{item.code}</td>
                <td className="px-4 py-2 font-mono text-xs">{formatPrice(item.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-2.5 px-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-xs px-3 py-1.5 rounded-md border border-app-border text-muted hover:border-accent hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>
          <span className="text-xs text-muted">
            Página <span className="text-prose font-semibold">{page}</span> de <span className="text-prose font-semibold">{totalPages}</span>
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

export default function OnlyPanel({ onlyA, onlyB, nameA, nameB }) {
  const [activeTab, setActiveTab] = useState(onlyA.length > 0 ? 'A' : 'B')

  const tabs = [
    { key: 'A', label: nameA, count: onlyA.length, items: onlyA },
    { key: 'B', label: nameB, count: onlyB.length, items: onlyB },
  ].filter(t => t.count > 0)

  const active = tabs.find(t => t.key === activeTab) ?? tabs[0]

  return (
    <div className="mt-8 bg-surface border border-app-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-warn text-base leading-none">!</span>
        <h3 className="text-sm font-semibold text-prose">Artículos sin coincidencia</h3>
        <span className="ml-auto text-xs text-muted">
          {onlyA.length + onlyB.length} artículo{onlyA.length + onlyB.length !== 1 ? 's' : ''} en total
        </span>
      </div>

      {tabs.length > 1 && (
        <div className="flex gap-1 mb-4 border-b border-app-border">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={[
                'px-3 py-2 text-xs font-medium rounded-t-md -mb-px border border-transparent transition-colors',
                activeTab === t.key
                  ? 'border-app-border border-b-surface bg-surface text-prose'
                  : 'text-muted hover:text-prose',
              ].join(' ')}
            >
              {t.label}
              <span className={[
                'ml-1.5 inline-block px-1.5 py-0.5 rounded text-xs font-bold',
                activeTab === t.key ? 'bg-warn-dim text-warn' : 'bg-surface2 text-muted',
              ].join(' ')}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {tabs.length === 1 && (
        <p className="text-xs text-muted mb-3">
          Solo en <span className="text-prose font-medium">{active.label}</span>
          <span className="ml-1.5 inline-block px-1.5 py-0.5 rounded bg-warn-dim text-warn text-xs font-bold">{active.count}</span>
        </p>
      )}

      <ArticleList key={active.key} items={active.items} />
    </div>
  )
}
