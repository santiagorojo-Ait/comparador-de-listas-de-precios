export function validateResult(data, headers, isPDF = false) {
  if (headers.length === 0 || data.length === 0) {
    if (isPDF) {
      return {
        type: 'error',
        message: 'El PDF no tiene texto extraíble. Probablemente es un documento escaneado (imagen).',
      }
    }
    return {
      type: 'error',
      message: 'No se encontraron datos en el archivo. Verificá que tenga filas con contenido.',
    }
  }
  if (data.length < 3) {
    return {
      type: 'warn',
      message: `Solo se detectaron ${data.length} fila${data.length !== 1 ? 's' : ''} de datos. Verificá que las cabeceras estén bien identificadas.`,
    }
  }
  return null
}
