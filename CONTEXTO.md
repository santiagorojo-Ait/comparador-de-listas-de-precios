# Contexto del Proyecto: Comparador de Listas de Precios

## Descripción general

Herramienta web interactiva construida con React + Tailwind CSS que permite comparar una lista de precios del drive de proveedores contra la lista del cliente, en formato Excel (.xlsx, .xls), CSV o PDF. El usuario sube ambos archivos, elige qué columna corresponde al código de artículo y al precio en cada uno, y obtiene una tabla de resultados con coincidencias y diferencias de precio.

## Estado actual

El proyecto está migrado a React + Vite + Tailwind CSS y es funcional. Incluye:

- Carga de archivos por drag & drop o clic (.xlsx, .xls, .csv, .pdf)
- Soporte de PDF con texto extraíble (pdfjs-dist v3): extrae tablas, detecta cabeceras y asigna columnas por posición
- Detectección inteligente de fila de cabeceras: escanea las primeras 20 filas y elige la que mejor coincide con keywords de código/precio (maneja archivos donde las primeras filas tienen metadata o nombre de proveedor)
- Selectores independientes de columna (código y precio) para cada lista
- Auto-detección de columnas por nombres comunes (código, precio, SKU, etc.) — solo acepta nombres cortos (≤ 40 caracteres) para evitar falsos positivos con párrafos
- Alertas visuales de validación con dos niveles:
  - **Error (rojo)**: formato no soportado, archivo sin datos, PDF escaneado/sin texto, PDF dañado
  - **Advertencia (amarillo)**: sin columnas de código ni precio detectadas (archivo incorrecto), pocas filas detectadas
- Validación de tipo de archivo al comparar: ambas listas deben ser del mismo tipo (PDF o Excel/CSV); se puede cargar cualquier archivo, pero el botón "Comparar" se bloquea si los tipos no coinciden
- Mensajes contextuales bajo el botón "Comparar" que indican exactamente qué falta (tipo de archivo, columnas sin seleccionar, falta subir archivo)
- Comparación sobre el **85% de los artículos** de la lista A, seleccionados aleatoriamente (Fisher-Yates shuffle)
  - Filtra automáticamente filas de sub-cabecera de sección (ej: "Código ADITIVOS OTROS ACEITES")
  - Solo reporta artículos presentes en ambas listas; los que no tienen par se muestran en panel separado
- Panel de artículos sin coincidencia: muestra los artículos de cada lista que no tienen par en la otra, con código y precio, paginados por 10
  - Si solo una lista tiene faltantes: panel simple
  - Si ambas listas tienen faltantes: tabs con nombre de lista y badge de conteo
- Tabla de resultados **paginada** (10 filas por página, con controles Anterior / Siguiente):
  - Badge de estado: ✓ Igual / ✕ Diferencia
  - Precios de ambas listas por artículo
  - Delta porcentual (Δ%) con barra visual
  - La paginación se resetea automáticamente al cambiar filtros o búsqueda
- Filtros por estado (Todos / Coinciden / Diferencias) y búsqueda por código
- Loader al cambiar filtros (overlay con spinner sobre la tabla)
- Loaders al cargar archivos (spinner en drop zone) y al comparar (spinner en botón)
- Tarjetas de resumen con conteo por categoría
- Ícono "?" en esquina superior derecha con instrucciones de uso en hover
- Badge de versión (vN) en esquina superior izquierda, fijo sobre el contenido
- Modal de novedades ("¿Qué hay de nuevo?"): aparece automáticamente cuando el usuario vuelve con una versión nueva (compara `localStorage.lastSeenVersion` con la versión major actual); no se muestra en la primera visita; se cierra con botón, ×, o click fuera
- Visita guiada para usuarios nuevos: tour de 4 pasos con spotlight (box-shadow) sobre cada elemento relevante — bienvenida, panel A, panel B, botón comparar; incluye indicadores de progreso, botones Atrás / Siguiente / Omitir; el tooltip se posiciona automáticamente y se clampa al viewport; solo se muestra en la primera visita (`localStorage.lastSeenVersion === null`)
- Diseño dark mode (fondo azul-pizarra, acento verde-lima, tipografía monoespaciada para códigos)

## Stack técnico

- React 18 + Vite 5
- Tailwind CSS 3 con colores custom (bg, surface, accent, danger, warn, etc.)
- SheetJS XLSX 0.18.5 (npm) para parseo de Excel y CSV
- pdfjs-dist 3.11.174 (npm) para parseo de PDF en el navegador
- Sin backend — corre directo en el navegador

## Lógica de parseo

### Excel / CSV
1. Se leen filas crudas con `XLSX.utils.sheet_to_json(ws, { header: 1 })`
2. Se escanean las primeras 20 filas y se elige la que mejor puntúa según keywords de código y precio (penalizando celdas de más de 4 palabras y bonificando filas con muchas columnas)
3. Las filas siguientes se mapean como datos usando esa fila como header

### PDF
1. Se extraen todos los items de texto con coordenadas XY de todas las páginas (pdfjs-dist)
2. Los items se agrupan en filas por proximidad en Y (tolerancia 4px), ordenados por X
3. Se detecta la fila de cabecera por el mismo algoritmo de scoring (keywords + penalización por celdas largas + bonus por cantidad de columnas)
4. Cada celda de datos se asigna a la columna del header más cercana en X

## Lógica de comparación

1. Se filtran de ambas listas las filas cuyo código sea una sub-cabecera de sección (valor que empieza con "codigo", "code", etc.)
2. Se toma una muestra aleatoria del **85%** de la lista A limpia (Fisher-Yates shuffle, sin restricciones de consecutividad)
3. Se construye un índice de **toda** la lista B limpia (`.trim().toUpperCase()`)
4. Se itera sobre la muestra buscando cada código en el índice de B:
   - `ok`: existe en ambas, precio igual (diferencia < 0.001)
   - `diff`: existe en ambas, precio diferente
   - Si no existe en B: se omite del resultado de comparación
5. Se calculan `onlyA` y `onlyB`: artículos de cada lista completa que no tienen par en la otra
6. Se retorna `{ results, onlyA, onlyB }`
7. Los precios se normalizan con `parsePrice()` que limpia símbolos de moneda y convierte coma a punto decimal

## Estructura del proyecto

```
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx
    ├── App.jsx              ← estado global + lógica
    ├── index.css
    ├── components/
    │   ├── FilePanel.jsx    ← panel de carga, validación de formato y alertas
    │   ├── HelpTooltip.jsx  ← ícono ? con instrucciones en hover
    │   ├── StatsBar.jsx     ← chips de resumen
    │   ├── FilterBar.jsx    ← filtros por estado
    │   ├── ResultsTable.jsx ← tabla paginada con badges y barra Δ%
    │   ├── OnlyPanel.jsx    ← panel de artículos sin coincidencia entre listas
    │   ├── WhatsNewModal.jsx← modal de novedades al detectar nueva versión
    │   ├── TourOverlay.jsx  ← visita guiada con spotlight para usuarios nuevos
    │   └── Spinner.jsx      ← spinner reutilizable (sm / md / lg)
    └── utils/
        ├── parseFile.js     ← lectura de xlsx/csv con detección inteligente de cabeceras
        ├── parsePDF.js      ← extracción de tablas desde PDF
        ├── validateResult.js← validación del resultado del parseo (errores y advertencias)
        └── compare.js       ← lógica de comparación y muestreo aleatorio
```

## Contexto de uso

Herramienta de uso interno para comparar listas de precios de proveedores en el rubro autopartes (Argentina). Los archivos suelen tener columnas con nombres en español, acentos, y precios en formato local (coma decimal, signo $). Los PDFs de proveedores suelen tener sub-cabeceras de sección que se intercalan entre los productos.

## Posibles mejoras / pendientes

- Exportar resultados a Excel o CSV
- Soporte multi-hoja (actualmente toma siempre la primera hoja)
- Tolerancia configurable para diferencias de precio (ej: ignorar diferencias < 1%)
- Normalización de códigos configurable (ej: ignorar ceros a la izquierda)
- Configurar el porcentaje de muestra desde la UI
- Soporte para PDFs escaneados mediante OCR (requeriría backend o servicio externo)
