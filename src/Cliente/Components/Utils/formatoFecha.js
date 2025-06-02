export function formatearFecha(fechaIso) {
  const opciones = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Date(fechaIso).toLocaleDateString('es-ES', opciones);
}
