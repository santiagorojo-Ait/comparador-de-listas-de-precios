import { useEffect } from 'react'

const DOCS_URL = 'https://claude.ai/code/artifact/6946668d-de20-4578-887f-b9adeb4af000'

const STEPS = [
  { n: '1', title: 'Subí la Lista A', body: 'En el panel izquierdo, arrastrá el archivo o hacé clic para buscarlo. Acepta .xlsx, .xls, .csv y .pdf. Una vez cargado, el nombre aparece en verde. Si la lista tiene códigos repetidos, aparece una advertencia con el detalle.' },
  { n: '2', title: 'Subí la Lista B', body: 'Lo mismo en el panel derecho. Ambos archivos tienen que ser del mismo tipo: los dos Excel/CSV, o los dos PDF.' },
  { n: '3', title: 'Verificá las columnas', body: 'La herramienta detecta automáticamente la columna de código y la de precio. Si no es correcto, usá los selectores para elegirlas manualmente.' },
  { n: '4', title: 'Elegí el modo de comparación', body: 'Por defecto compara códigos y precios. Si solo querés verificar que los mismos códigos existen en ambas listas, activá el check "Comparar solo códigos (ignorar precios)".' },
  { n: '5', title: 'Hacé clic en "Comparar listas →"', body: 'El botón se habilita cuando ambos archivos están cargados, son del mismo tipo y tienen las columnas seleccionadas. Un mensaje debajo indica qué falta si no se habilita.' },
  { n: '6', title: 'Explorá los resultados', body: 'Aparece la tabla con coincidencias y diferencias de precio, un resumen con conteos y el panel de artículos sin par. Si todo coincide, aparece un mensaje de confirmación. Podés filtrar por estado y buscar por código.' },
]

const FORMATS = [
  { icon: '📊', ext: '.xlsx / .xls', desc: 'Excel — formato recomendado' },
  { icon: '📄', ext: '.csv', desc: 'Texto separado por comas' },
  { icon: '📑', ext: '.pdf', desc: 'PDF con texto (no escaneado)' },
]

const FAQS = [
  {
    q: '¿Los datos se suben a algún servidor?',
    a: 'No. Todo el procesamiento ocurre directamente en tu navegador. Los archivos nunca salen de tu computadora.',
  },
  {
    q: 'La herramienta detectó mal las columnas, ¿qué hago?',
    a: 'Usá los selectores desplegables debajo del área de carga para elegir manualmente las columnas correctas.',
  },
  {
    q: '¿Por qué no se compara el 100% de los artículos?',
    a: 'Se compara el 85% de los artículos de la lista del proveedor, seleccionados aleatoriamente. Esto da una muestra representativa sin afectar la velocidad. Los artículos sin par igual aparecen en el panel de "sin coincidencia".',
  },
  {
    q: 'El botón "Comparar" está deshabilitado, ¿por qué?',
    a: 'Hay tres motivos posibles: falta subir uno de los archivos, las listas son de tipos distintos (PDF vs Excel), o no se seleccionaron las columnas en ambos paneles. El mensaje debajo del botón indica cuál es el caso.',
  },
  {
    q: '¿Qué pasa si un artículo existe en una lista pero no en la otra?',
    a: 'Aparece en el Panel de artículos sin coincidencia, debajo de la tabla principal, con su código y precio.',
  },
  {
    q: '¿Qué significa el modo "solo códigos"?',
    a: 'Al activar "Comparar solo códigos (ignorar precios)", la herramienta verifica únicamente si los mismos códigos existen en ambas listas, sin comparar precios. Útil para auditar catálogos o detectar artículos faltantes.',
  },
  {
    q: '¿Qué pasa si hay códigos repetidos en un archivo?',
    a: 'Al cargar el archivo, aparece una advertencia en amarillo con los códigos que están repetidos. La comparación igual se puede hacer, pero el resultado puede ser impreciso si el mismo código tiene precios distintos dentro de la misma lista.',
  },
  {
    q: '¿Los precios con coma decimal funcionan?',
    a: 'Sí. Se aceptan precios en formato local (coma decimal, símbolo $) como $1.234,56. Luego se redondean automáticamente antes de comparar.',
  },
  {
    q: '¿Por qué se redondean los precios?',
    a: 'Para evitar falsos positivos por diferencias de centavos entre archivos generados en distintos momentos o sistemas. La comparación se hace sobre el precio entero más cercano: menos de $0,50 redondea abajo, $0,50 o más redondea arriba.',
  },
]

export default function DocsModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[60] bg-bg text-prose overflow-y-auto">
      {/* Top bar */}
      <div className="sticky top-0 z-[61] bg-surface border-b border-app-border flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted">Documentación</span>
          <span className="text-app-border">·</span>
          <span className="text-xs text-muted">Comparador de Listas de Precios</span>
        </div>
        <button
          onClick={onClose}
          className="text-muted hover:text-prose transition-colors text-xl leading-none px-1"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-10 pb-20">

        {/* Intro */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-accent mb-3">Guía de uso</p>
          <h1 className="text-2xl font-bold tracking-tight mb-3">
            Compará listas de precios artículo por artículo, en segundos
          </h1>
          <p className="text-muted text-sm leading-relaxed">
            Esta herramienta toma la lista de precios del proveedor y la del cliente, las cruza por código de artículo y muestra exactamente dónde hay diferencias de precio, qué artículos coinciden y cuáles solo existen en una de las dos listas.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {['Sin instalación', 'Corre en el navegador', 'Excel, CSV y PDF', 'Sin backend'].map(t => (
              <span key={t} className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-surface border border-app-border text-prose">
                <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <hr className="border-app-border mb-10" />

        {/* Qué es */}
        <section className="mb-10">
          <SectionTitle num="01" title="¿Para qué sirve?" />
          <p className="text-sm text-muted leading-relaxed mb-3">
            Resuelve un problema concreto: tenés dos listas de precios (Lista A y Lista B) y necesitás saber si coinciden o si hay diferencias.
          </p>
          <p className="text-sm text-muted leading-relaxed mb-4">
            Hacerlo manualmente en Excel es lento y propenso a errores. Esta herramienta lo hace automáticamente: cargás los dos archivos, elegís las columnas de código y precio, y en segundos tenés un informe completo.
          </p>
          <Callout type="tip" label="Caso de uso típico">
            El proveedor manda una lista en Excel con 800 artículos. El cliente tiene su propia lista en PDF. En lugar de cruzarlos manualmente, se cargan los dos archivos acá y se obtiene la tabla de diferencias en segundos.
          </Callout>
        </section>

        {/* Paso a paso */}
        <section className="mb-10">
          <SectionTitle num="02" title="Paso a paso" />
          <div className="flex flex-col gap-5">
            {STEPS.map(s => (
              <div key={s.n} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full border border-accent text-accent font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 bg-surface">
                  {s.n}
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">{s.title}</p>
                  <p className="text-xs text-muted leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
          <Callout type="warn" label="Si el botón no se habilita">
            Un mensaje debajo del botón indica exactamente qué falta: subir un archivo, tipos distintos entre paneles, o columnas sin seleccionar.
          </Callout>
          <div className="mt-4">
            <Callout type="tip" label="Redondeo de precios">
              Antes de comparar, todos los precios se redondean al peso entero más cercano: menos de $0,50 redondea abajo, $0,50 o más redondea arriba. Esto evita falsos positivos por diferencias mínimas de centavos.
            </Callout>
          </div>
        </section>

        {/* Resultados */}
        <section className="mb-10">
          <SectionTitle num="03" title="Entendiendo los resultados" />
          <p className="text-sm text-muted leading-relaxed mb-4">
            Después de comparar aparecen tres secciones:
          </p>
          <div className="flex flex-col gap-3 mb-4">
            <ResultItem icon="📊" title="Resumen">
              Tarjetas con el total de artículos comparados, cuántos coinciden y cuántos tienen diferencia de precio.
            </ResultItem>
            <ResultItem icon="📋" title="Tabla de resultados">
              Lista paginada (10 por página) con el detalle de cada artículo: código, precio en cada lista, badge de estado (✓ Igual / ✕ Diferencia) y delta porcentual con barra visual.
            </ResultItem>
            <ResultItem icon="🔍" title="Panel de artículos sin coincidencia">
              Aparece si hay artículos que existen en una sola lista. Organizado en pestañas por lista, también paginado.
            </ResultItem>
          </div>
          <Callout type="tip" label="Filtros y búsqueda">
            Podés filtrar la tabla para ver solo coincidencias o diferencias, y buscar un artículo específico por código con la barra de búsqueda.
          </Callout>
        </section>

        {/* Formatos */}
        <section className="mb-10">
          <SectionTitle num="04" title="Formatos de archivo" />
          <div className="grid grid-cols-3 gap-3 mb-4">
            {FORMATS.map(f => (
              <div key={f.ext} className="bg-surface border border-app-border rounded-xl p-4 flex items-center gap-3">
                <span className="text-xl">{f.icon}</span>
                <div>
                  <div className="font-mono text-xs font-bold text-accent">{f.ext}</div>
                  <div className="text-xs text-muted">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <Callout type="warn" label="PDFs escaneados">
            Los PDFs que son fotos o imágenes escaneadas no tienen texto extraíble y no pueden ser leídos. Solo funcionan PDFs generados desde un sistema (con texto real). Además, ambas listas deben ser del mismo tipo: no se puede comparar PDF contra Excel.
          </Callout>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <SectionTitle num="05" title="Preguntas frecuentes" />
          <div className="flex flex-col gap-2">
            {FAQS.map(f => (
              <details key={f.q} className="bg-surface border border-app-border rounded-xl overflow-hidden group">
                <summary className="flex justify-between items-center gap-3 px-4 py-3 cursor-pointer text-sm font-semibold list-none hover:bg-surface/80 transition-colors">
                  {f.q}
                  <span className="text-muted text-lg font-light leading-none flex-shrink-0 group-open:hidden">+</span>
                  <span className="text-muted text-lg font-light leading-none flex-shrink-0 hidden group-open:inline">−</span>
                </summary>
                <p className="px-4 pb-4 text-xs text-muted leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="text-center mt-8">
          <button
            onClick={onClose}
            className="text-xs px-5 py-2 rounded-lg bg-accent text-bg font-bold hover:opacity-90 transition-opacity"
          >
            Volver a la app
          </button>
        </div>

      </div>
    </div>
  )
}

function SectionTitle({ num, title }) {
  return (
    <div className="flex items-baseline gap-3 mb-5 pb-3 border-b border-app-border">
      <span className="font-mono text-xs font-bold text-accent bg-surface border border-accent/40 rounded px-1.5 py-0.5">{num}</span>
      <h2 className="text-base font-bold tracking-tight">{title}</h2>
    </div>
  )
}

function Callout({ type, label, children }) {
  const isWarn = type === 'warn'
  return (
    <div className={`border-l-2 rounded-r-lg px-4 py-3 text-xs leading-relaxed ${
      isWarn
        ? 'border-warn bg-warn/5 text-prose'
        : 'border-accent bg-accent/5 text-prose'
    }`}>
      <span className={`font-bold uppercase tracking-wider text-[10px] block mb-1 ${isWarn ? 'text-warn' : 'text-accent'}`}>
        {label}
      </span>
      {children}
    </div>
  )
}

function ResultItem({ icon, title, children }) {
  return (
    <div className="bg-surface border border-app-border rounded-xl p-4 flex gap-3 items-start">
      <span className="text-lg flex-shrink-0">{icon}</span>
      <div>
        <p className="text-sm font-semibold mb-1">{title}</p>
        <p className="text-xs text-muted leading-relaxed">{children}</p>
      </div>
    </div>
  )
}
