# Contexto del Proyecto: Comparador de Listas de Precios

## Descripción general

Herramienta web interactiva (archivo HTML standalone) que permite comparar dos listas de precios en formato Excel (.xlsx, .xls) o CSV. El usuario sube ambos archivos, elige qué columna corresponde al código de artículo y al precio en cada uno, y obtiene una tabla de resultados con coincidencias, diferencias y artículos exclusivos de cada lista.

## Estado actual

El archivo `comparador_precios.html` es funcional y está terminado. Incluye:

- Carga de archivos por drag & drop o clic (usando SheetJS/XLSX desde CDN)
- Selectores independientes de columna (código y precio) para cada lista
- Auto-detección de columnas por nombres comunes (código, precio, SKU, etc.)
- Tabla de resultados con:
  - Badge de estado: ✓ Igual / ✕ Diferencia / Solo A / Solo B
  - Precios de ambas listas por artículo
  - Delta porcentual (Δ%) con barra visual
- Filtros por categoría y búsqueda por código
- Tarjetas de resumen con conteo por categoría
- Diseño dark mode (fondo azul-pizarra, acento verde-lima, tipografía monoespaciada para códigos)
- Todo en un único archivo HTML sin dependencias locales

## Stack técnico

- HTML + CSS + JS vanilla (sin frameworks)
- [SheetJS XLSX 0.18.5](https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js) vía CDN para parseo de Excel y CSV
- Sin backend, sin build system — corre directo en el navegador

## Lógica de comparación

1. Se parsean ambos archivos con `XLSX.utils.sheet_to_json()`
2. Se construye un `Map` de la Lista B indexado por código (`.trim().toUpperCase()`)
3. Se itera sobre Lista A buscando cada código en el Map de B
4. Se clasifica cada fila como:
   - `ok`: existe en ambas, precio igual (diferencia < 0.001)
   - `diff`: existe en ambas, precio diferente
   - `only-a`: existe solo en Lista A
   - `only-b`: existe solo en Lista B
5. Los precios se normalizan con `parsePrice()` que limpia símbolos de moneda y convierte coma a punto decimal

## Posibles mejoras / pendientes

- Exportar resultados a Excel o CSV
- Soporte multi-hoja (actualmente toma siempre la primera hoja)
- Tolerancia configurable para diferencias de precio (ej: ignorar diferencias < 1%)
- Normalización de códigos configurable (ej: ignorar ceros a la izquierda)
- Vista previa de las primeras filas del archivo antes de comparar
- Comparación de más de dos listas simultáneamente

## Archivos

| Archivo | Descripción |
|---|---|
| `comparador_precios.html` | Herramienta completa, standalone |

## Contexto de uso

Herramienta de uso interno para comparar listas de precios de proveedores en el rubro autopartes (Argentina). Los archivos suelen tener columnas con nombres en español, acentos, y precios en formato local (coma decimal, signo $).
