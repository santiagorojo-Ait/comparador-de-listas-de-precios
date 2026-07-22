# Comparador de Listas de Precios

Herramienta web para comparar dos listas de precios en formato Excel o CSV, artículo por artículo. Desarrollada con React + Tailwind CSS y sin backend — corre completamente en el navegador.

## Funcionalidades

- Carga de archivos por drag & drop o clic (.xlsx, .xls, .csv)
- Auto-detección de columnas de código y precio
- Selectores independientes de columna para cada lista
- Comparación artículo por artículo con clasificación por estado:
  - **✓ Igual** — existe en ambas listas, precio coincide
  - **✕ Diferencia** — existe en ambas listas, precio distinto
  - **Solo A** — existe únicamente en la Lista A
  - **Solo B** — existe únicamente en la Lista B
- Delta porcentual (Δ%) con barra visual por cada diferencia
- Tarjetas de resumen con conteo por categoría
- Filtros por estado y búsqueda por código
- Normalización de precios: acepta formato local (coma decimal, símbolo $)
- Diseño dark mode

## Stack técnico

- [React 18](https://react.dev/) + [Vite 5](https://vitejs.dev/)
- [Tailwind CSS 3](https://tailwindcss.com/)
- [SheetJS XLSX 0.18.5](https://sheetjs.com/) para parseo de Excel y CSV

## Instalación

```bash
npm install
```

## Uso en desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en el navegador.

## Build para producción

```bash
npm run build
```

El output queda en la carpeta `dist/`, lista para deployar en cualquier hosting estático (Netlify, Vercel, GitHub Pages, etc.).

## Cómo usar la herramienta

1. **Subir archivos** — arrastrá o hacé clic en cada panel para cargar la Lista A y la Lista B.
2. **Elegir columnas** — seleccioná qué columna corresponde al código de artículo y al precio en cada archivo. La herramienta intenta detectarlas automáticamente por nombre.
3. **Comparar** — hacé clic en **Comparar listas →**. El botón se habilita cuando ambas listas tienen columnas seleccionadas.
4. **Explorar resultados** — usá los filtros para ver solo diferencias, artículos exclusivos, etc. También podés buscar por código.

## Estructura del proyecto

```
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── components/
    │   ├── FilePanel.jsx       # Panel de carga con drag & drop
    │   ├── StatsBar.jsx        # Tarjetas de resumen
    │   ├── FilterBar.jsx       # Filtros por estado
    │   └── ResultsTable.jsx    # Tabla de resultados
    └── utils/
        ├── parseFile.js        # Lectura de xlsx/csv
        └── compare.js          # Lógica de comparación
```

## Contexto de uso

Herramienta de uso interno para comparar listas de precios de proveedores en el rubro autopartes (Argentina). Los archivos suelen tener columnas con nombres en español, acentos y precios en formato local (coma decimal, signo $).
