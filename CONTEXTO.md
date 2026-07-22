# Contexto del Proyecto: Comparador de Listas de Precios

## Descripción general

Herramienta web interactiva construida con React + Tailwind CSS que permite comparar una lista de precios del drive de proveedores contra la lista del cliente, ambas en formato Excel (.xlsx, .xls) o CSV. El usuario sube ambos archivos, elige qué columna corresponde al código de artículo y al precio en cada uno, y obtiene una tabla de resultados con coincidencias y diferencias de precio.

## Estado actual

El proyecto está migrado a React + Vite + Tailwind CSS y es funcional. Incluye:

- Carga de archivos por drag & drop o clic (usando SheetJS/XLSX como dependencia npm)
- Selectores independientes de columna (código y precio) para cada lista
- Auto-detección de columnas por nombres comunes (código, precio, SKU, etc.)
- Comparación sobre una **muestra aleatoria de 20 a 30 artículos**:
  - Excluye los primeros 10 artículos de cada lista
  - Garantiza que no haya artículos consecutivos en la muestra
  - Solo compara artículos presentes en ambas listas (no muestra "solo en A" ni "solo en B")
- Tabla de resultados con:
  - Badge de estado: ✓ Igual / ✕ Diferencia
  - Precios de ambas listas por artículo
  - Delta porcentual (Δ%) con barra visual
- Filtros por estado (Todos / Coinciden / Diferencias) y búsqueda por código
- Loader al cambiar filtros (overlay con spinner sobre la tabla)
- Loaders al cargar archivos (spinner en drop zone) y al comparar (spinner en botón)
- Tarjetas de resumen con conteo por categoría
- Ícono "?" en esquina superior derecha con instrucciones de uso en hover
- Diseño dark mode (fondo azul-pizarra, acento verde-lima, tipografía monoespaciada para códigos)

## Stack técnico

- React 18 + Vite 5
- Tailwind CSS 3 con colores custom (bg, surface, accent, danger, etc.)
- SheetJS XLSX 0.18.5 (npm) para parseo de Excel y CSV
- Sin backend — corre directo en el navegador

## Lógica de comparación

1. Se parsean ambos archivos con `XLSX.utils.sheet_to_json()`
2. Se toma una muestra aleatoria de 20–30 artículos de la lista A (excluyendo los primeros 10, sin consecutivos, usando Fisher-Yates shuffle)
3. Se construye un índice de la Lista B a partir del índice 10 (`.trim().toUpperCase()`)
4. Se itera sobre la muestra buscando cada código en el índice de B:
   - `ok`: existe en ambas, precio igual (diferencia < 0.001)
   - `diff`: existe en ambas, precio diferente
   - Si no existe en B: se omite (no se reporta)
5. Los precios se normalizan con `parsePrice()` que limpia símbolos de moneda y convierte coma a punto decimal

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
    │   ├── FilePanel.jsx    ← panel de carga con drag & drop y loader
    │   ├── HelpTooltip.jsx  ← ícono ? con instrucciones en hover
    │   ├── StatsBar.jsx     ← chips de resumen
    │   ├── FilterBar.jsx    ← filtros por estado
    │   ├── ResultsTable.jsx ← tabla con badges, barra Δ% y scroll en tbody
    │   └── Spinner.jsx      ← spinner reutilizable (sm / md / lg)
    └── utils/
        ├── parseFile.js     ← lectura de xlsx/csv
        └── compare.js       ← lógica de comparación y muestreo aleatorio
```

## Contexto de uso

Herramienta de uso interno para comparar listas de precios de proveedores en el rubro autopartes (Argentina). Los archivos suelen tener columnas con nombres en español, acentos, y precios en formato local (coma decimal, signo $).

## Posibles mejoras / pendientes

- Exportar resultados a Excel o CSV
- Soporte multi-hoja (actualmente toma siempre la primera hoja)
- Tolerancia configurable para diferencias de precio (ej: ignorar diferencias < 1%)
- Normalización de códigos configurable (ej: ignorar ceros a la izquierda)
- Configurar el tamaño y criterios de la muestra desde la UI
