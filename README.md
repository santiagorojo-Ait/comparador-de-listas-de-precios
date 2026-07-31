# Comparador de Listas de Precios

Herramienta web para comparar una lista de precios de proveedores (drive) contra la lista del cliente, artículo por artículo. Desarrollada con React + Tailwind CSS y sin backend — corre completamente en el navegador.

## Funcionalidades

- Carga de archivos por drag & drop o clic (.xlsx, .xls, .csv, .pdf)
- **Soporte de PDF**: extrae tablas de PDFs con texto, detecta cabeceras y asigna columnas por posición
- **Detección inteligente de cabeceras**: escanea las primeras filas del archivo y elige automáticamente la que corresponde al encabezado de la tabla, incluso cuando hay filas de metadata o nombre de proveedor antes del header real
- Auto-detección de columnas de código y precio
- Selectores independientes de columna para cada lista
- **Alertas visuales de validación** al cargar archivos:
  - **Error (rojo)**: formato no soportado, PDF escaneado/sin texto, PDF dañado, archivo sin datos
  - **Advertencia (amarillo)**: no se detectaron columnas de código ni precio, pocas filas detectadas
- **Validación de tipo de archivo**: ambas listas deben ser del mismo tipo (PDF o Excel/CSV) para poder comparar; el botón se bloquea con mensaje explicativo si no coinciden, pero la carga de archivos nunca se bloquea
- **Mensajes contextuales** bajo el botón de comparación que indican exactamente qué falta (tipo de archivo, columnas sin seleccionar, falta un archivo)
- Comparación sobre el **85% de los artículos** seleccionados aleatoriamente:
  - Filtra automáticamente filas de sub-cabecera de sección (ej: "Código ADITIVOS OTROS ACEITES")
  - Solo reporta artículos presentes en ambas listas; los sin par van al panel de faltantes
- **Panel de artículos sin coincidencia**: muestra los artículos que existen en una lista pero no en la otra, con código y precio, organizado en tabs por lista y paginado
- Tabla de resultados **paginada** (10 filas por página) — sin scroll, con controles Anterior / Siguiente:
  - **✓ Igual** — precio coincide en ambas listas
  - **✕ Diferencia** — precio distinto entre las listas
  - Delta porcentual (Δ%) con barra visual por cada diferencia
- Tarjetas de resumen con conteo por categoría
- Filtros por estado y búsqueda por código
- Loader al cambiar filtros para listas grandes
- Normalización de precios: acepta formato local (coma decimal, símbolo $)
- Ícono de ayuda (?) con instrucciones de uso en hover
- Diseño dark mode

## Stack técnico

- [React 18](https://react.dev/) + [Vite 5](https://vitejs.dev/)
- [Tailwind CSS 3](https://tailwindcss.com/)
- [SheetJS XLSX 0.18.5](https://sheetjs.com/) para parseo de Excel y CSV
- [pdfjs-dist 3.11.174](https://mozilla.github.io/pdf.js/) para parseo de PDF en el navegador

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

1. **Subir archivos** — arrastrá o hacé clic en cada panel para cargar la lista del drive de proveedores y la lista del cliente. Se aceptan .xlsx, .xls, .csv y .pdf.
2. **Elegir columnas** — seleccioná qué columna corresponde al código de artículo y al precio en cada archivo. La herramienta intenta detectarlas automáticamente por nombre.
3. **Comparar** — hacé clic en **Comparar listas →**. El botón se habilita cuando ambas listas son del mismo tipo de archivo y tienen las columnas seleccionadas. Si falta algo, un mensaje bajo el botón indica qué corregir.
4. **Explorar resultados** — usá los filtros para ver solo coincidencias o diferencias. También podés buscar por código.

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
    │   ├── FilePanel.jsx       # Panel de carga con drag & drop y alertas de validación
    │   ├── HelpTooltip.jsx     # Ícono ? con instrucciones en hover
    │   ├── StatsBar.jsx        # Tarjetas de resumen
    │   ├── FilterBar.jsx       # Filtros por estado
    │   ├── ResultsTable.jsx    # Tabla paginada de resultados
    │   ├── OnlyPanel.jsx       # Panel de artículos sin coincidencia entre listas
    │   └── Spinner.jsx         # Componente de carga reutilizable
    └── utils/
        ├── parseFile.js        # Lectura de xlsx/csv con detección inteligente de cabeceras
        ├── parsePDF.js         # Extracción de tablas desde PDF (pdfjs-dist)
        ├── validateResult.js   # Validación del resultado del parseo
        └── compare.js          # Lógica de comparación y muestreo aleatorio
```

## Contexto de uso

Herramienta de uso interno para comparar listas de precios de proveedores en el rubro autopartes (Argentina). Los archivos suelen tener columnas con nombres en español, acentos y precios en formato local (coma decimal, signo $). Los PDFs de proveedores suelen tener sub-cabeceras de sección que se intercalan entre los productos.

---

## Release Notes

### rama `feature/nuevos-features`

#### Nuevas funcionalidades

**Soporte de PDF**
- Carga y comparación de listas de precios en formato PDF con texto extraíble.
- Extracción de texto con coordenadas XY usando pdfjs-dist v3.
- Agrupamiento de texto en filas por proximidad vertical (tolerancia 4px), ordenado por posición horizontal.
- Asignación de celdas a columnas del header por distancia en X.
- Soporte multi-página: las páginas se apilan verticalmente para procesarlas como un único documento.

**Detección inteligente de fila de cabeceras (xlsx, csv y pdf)**
- El parser ya no asume que la primera fila es el encabezado.
- Escanea las primeras 20 filas (30 en PDF) y elige la que mejor puntúa según:
  - Presencia de keywords de código (codigo, sku, articulo, ref, etc.) y precio (precio, importe, costo, lista, etc.)
  - Penalización de celdas con más de 4 palabras (para distinguir cabeceras de texto de párrafos con keywords)
  - Bonus por cantidad de columnas no vacías
- Resuelve el bug donde archivos con filas de metadata o nombre de proveedor antes del header real quedaban mal interpretados.

**Alertas visuales de validación**
- Badge rojo (error) cuando:
  - El formato del archivo no es soportado (.doc, .jpg, etc.)
  - El PDF no tiene texto extraíble (documento escaneado)
  - El PDF está dañado o protegido
  - El archivo no tiene datos (cero filas después del header)
- Badge amarillo (advertencia) cuando:
  - No se detectaron columnas de código ni precio (el archivo probablemente no es una lista de precios)
  - Se detectaron menos de 3 filas de datos
- El borde del drop zone y el nombre del archivo cambian de color según el estado (rojo/amarillo/verde).

#### Correcciones

**Falso positivo en auto-detección de columnas (PDFs con párrafos)**
- La auto-detección ahora ignora nombres de columna con más de 40 caracteres.
- Evita que párrafos de texto que contengan palabras como "monto" o "costo" sean detectados como columnas de precio, lo que impedía que apareciera la advertencia de "archivo no reconocido como lista de precios".

**Filas de sub-cabecera de sección aparecían como artículos en los resultados**
- Los PDFs de proveedores (ej: Liqui Moly) incluyen filas repetidas del estilo "Código ADITIVOS OTROS ACEITES" entre categorías de productos.
- Estas filas tenían la misma estructura que los datos y eran incluidas como artículos en la comparación, mostrando "CÓDIGO ADITIVOS OTROS ACEITES" como código de producto.
- Se agrega `cleanData()` en la lógica de comparación, que filtra las filas cuyo campo de código empieza con un keyword de encabezado (codigo, code, cod, articulo, sku, etc.).

---

**Comparación al 85% de los artículos**
- Se reemplaza el muestreo fijo de 20–30 artículos por una selección aleatoria del 85% del total de artículos limpios de la lista A.
- Se eliminan las restricciones de "saltar los primeros 10" y "sin artículos consecutivos", que ya no aplican con una cobertura tan alta.
- El índice de la lista B ahora incluye todos sus artículos (antes también saltaba los primeros 10).

**Paginación en la tabla de resultados**
- La tabla pasa de scroll vertical a paginación de 10 filas por página.
- Controles "← Anterior" / "Siguiente →" con indicador "Página X de Y (N artículos)".
- La página se resetea automáticamente al cambiar filtros o al realizar una nueva comparación.
- Se elimina el `sticky thead` (ya no necesario sin scroll).

**Panel de artículos sin coincidencia**
- Al comparar, se detectan los artículos de cada lista completa (no solo la muestra) que no tienen par en la otra.
- Aparece un panel nuevo debajo de la tabla de resultados cuando existen artículos sin coincidencia.
- Si solo una lista tiene faltantes: panel simple con encabezado y conteo.
- Si ambas listas tienen faltantes: tabs con nombre de cada lista y badge con cantidad.
- Cada tab muestra una tabla paginada (10 por página) con código y precio de los artículos huérfanos.

**Validación de tipo de archivo entre paneles**
- Se puede cargar cualquier archivo válido en cualquier momento, sin restricción por lo que hay en el otro panel.
- Si las dos listas cargadas son de tipos distintos (PDF vs Excel/CSV), el botón "Comparar listas" queda deshabilitado y aparece el mensaje: *"Las listas deben ser del mismo tipo — ambas PDF o ambas Excel/CSV."*
- Cuando los tipos coinciden pero faltan columnas, aparece: *"Seleccioná las columnas de código y precio en ambas listas."*
- Cuando falta subir uno de los dos archivos, aparece: *"Subí un archivo en cada panel para continuar."*
