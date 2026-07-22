export default function HelpTooltip() {
  return (
    <div className="fixed top-4 right-4 z-50 group">
      <button className="w-7 h-7 rounded-full border border-app-border bg-surface text-muted text-sm font-bold hover:border-accent hover:text-accent transition-colors flex items-center justify-center">
        ?
      </button>
      <div className="absolute right-0 top-9 w-72 bg-surface border border-app-border rounded-xl p-4 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">Cómo usar</p>
        <ol className="text-xs text-prose space-y-2 list-decimal list-inside">
          <li>Subí un archivo Excel o CSV en cada panel</li>
          <li>Elegí las columnas de código y precio de cada lista</li>
          <li>Hacé clic en <span className="text-accent font-semibold">Comparar listas →</span></li>
          <li>Revisá los resultados: coincidencias y diferencias de precio</li>
        </ol>
        <p className="text-xs text-muted mt-3 pt-3 border-t border-app-border">
          La comparación se hace sobre una muestra aleatoria de 20–30 artículos, excluyendo los primeros 10 de cada lista y sin artículos consecutivos.
        </p>
      </div>
    </div>
  )
}
