const RELEASE_NOTES = {
  '2.0': [
    'Comparación ampliada al 85% de los artículos de cada lista (antes era una muestra de 20–30)',
    'Tabla de resultados paginada — 10 artículos por página, sin scroll',
    'Panel de artículos exclusivos: artículos que existen en una lista pero no en la otra',
    'Validación de tipo de archivo: no se puede comparar un PDF contra un Excel/CSV',
    'Mensajes contextuales bajo el botón de comparar indicando qué falta para habilitarlo',
    'Indicador de versión en la esquina superior izquierda',
  ],
  '2.1': [
    'Paneles renombrados a "Lista A" y "Lista B" para uso más genérico',
    'Indicador de éxito cuando todos los artículos coinciden entre las dos listas',
    'Modo "Comparar solo códigos" — verifica presencia sin comparar precios',
    'Corrección: precios con formato argentino (10.350,00) y estadounidense (10,350.00) ahora se comparan correctamente',
    'Detección de códigos duplicados post-comparación: aviso unificado con selector de lista para encontrar qué columna usar como código original',
    'Tolerancia de $1 en comparación de precios para evitar falsos positivos por redondeo',
  ],
}

export default function WhatsNewModal({ version, onClose }) {
  const minorVersion = version.split('.').slice(0, 2).join('.')
  const notes = RELEASE_NOTES[minorVersion]
  if (!notes) return null

  return (
    <div
      className="fixed inset-0 bg-bg/80 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-surface border border-app-border rounded-2xl max-w-md w-full shadow-2xl">
        <div className="px-6 pt-6 pb-4 border-b border-app-border flex items-start justify-between gap-4">
          <div>
            <span className="text-xs text-muted uppercase tracking-widest font-semibold">Novedades</span>
            <h2 className="text-lg font-bold text-accent mt-0.5">Versión {minorVersion}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-prose transition-colors text-2xl leading-none mt-0.5 shrink-0"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <ul className="px-6 py-5 space-y-3">
          {notes.map((note, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-prose">
              <span className="text-accent mt-0.5 shrink-0 select-none">✦</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>

        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full bg-accent text-bg font-bold py-2.5 rounded-lg text-sm tracking-wide hover:opacity-90 transition-opacity"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
