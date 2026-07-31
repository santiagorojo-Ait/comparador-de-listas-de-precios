import { useState, useEffect } from 'react'

const STEPS = [
  {
    target: null,
    title: '¡Bienvenido al Comparador!',
    body: 'En unos pasos cortos te mostramos cómo usar la herramienta. Podés omitir la visita cuando quieras.',
  },
  {
    target: '[data-tour="panel-a"]',
    title: 'Lista del proveedor',
    body: 'Arrastrá o hacé clic para subir el archivo (.xlsx, .xls o .csv). Una vez cargado, elegí qué columna es el código de artículo y cuál el precio.',
    position: 'bottom',
  },
  {
    target: '[data-tour="panel-b"]',
    title: 'Lista del cliente',
    body: 'Subí aquí el segundo archivo. Ambas listas deben ser del mismo tipo de archivo para habilitar la comparación.',
    position: 'bottom',
  },
  {
    target: '[data-tour="compare-btn"]',
    title: 'Comparar listas',
    body: 'Cuando ambas listas estén cargadas y las columnas seleccionadas, este botón se habilita. El resultado muestra coincidencias y diferencias de precio artículo por artículo.',
    position: 'bottom',
  },
]

const TW = 320
const TH = 220
const GAP = 16

function useTargetRect(selector) {
  const [rect, setRect] = useState(null)
  useEffect(() => {
    if (!selector) { setRect(null); return }
    const update = () => {
      const el = document.querySelector(selector)
      setRect(el ? el.getBoundingClientRect() : null)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [selector])
  return rect
}

function getTooltipStyle(rect, position) {
  if (!rect) {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    }
  }
  const pad = 12
  let top, left
  switch (position) {
    case 'top':
      top = rect.top - TH - GAP
      left = rect.left + rect.width / 2 - TW / 2
      break
    case 'bottom':
    default:
      top = rect.bottom + GAP
      left = rect.left + rect.width / 2 - TW / 2
  }
  left = Math.max(pad, Math.min(left, window.innerWidth - TW - pad))
  top = Math.max(pad, Math.min(top, window.innerHeight - TH - pad))
  return { top, left }
}

export default function TourOverlay({ onFinish }) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const rect = useTargetRect(current.target)
  const tooltipStyle = getTooltipStyle(rect, current.position)

  const next = () => (isLast ? onFinish() : setStep(s => s + 1))
  const prev = () => setStep(s => s - 1)

  return (
    <>
      {!rect && (
        <div className="fixed inset-0 z-40 bg-black/75" />
      )}

      {rect && (
        <div
          className="fixed z-40 rounded-xl"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.75), 0 0 0 2px rgba(163,230,53,0.4)',
            pointerEvents: 'none',
            transition: 'top 0.25s ease, left 0.25s ease, width 0.25s ease, height 0.25s ease',
          }}
        />
      )}

      <div
        className="fixed z-50 bg-surface border border-app-border rounded-2xl shadow-2xl p-5"
        style={{ width: TW, ...tooltipStyle }}
      >
        <div className="flex items-center gap-1.5 mb-3">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-4 bg-accent' : 'w-1.5 bg-muted/30'
              }`}
            />
          ))}
          <span className="ml-auto text-xs text-muted tabular-nums">
            {step + 1} / {STEPS.length}
          </span>
        </div>

        <h3 className="text-sm font-bold text-accent mb-1.5">{current.title}</h3>
        <p className="text-xs text-prose leading-relaxed mb-5">{current.body}</p>

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onFinish}
            className="text-xs text-muted hover:text-prose transition-colors"
          >
            Omitir tour
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={prev}
                className="text-xs px-3 py-1.5 rounded-md border border-app-border text-muted hover:border-accent hover:text-accent transition-colors"
              >
                ← Atrás
              </button>
            )}
            <button
              onClick={next}
              className="text-xs px-4 py-1.5 rounded-md bg-accent text-bg font-bold hover:opacity-90 transition-opacity"
            >
              {isLast ? 'Finalizar' : 'Siguiente →'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
