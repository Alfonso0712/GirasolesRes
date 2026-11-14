/**
 * Utilidades de formateo de fechas y horas en zona horaria America/Lima (UTC-5).
 * Adaptadas de la versión web para evitar mostrar fechas ISO crudas al usuario.
 */

const ZONA_LIMA = 'America/Lima';

function obtenerPartesLima(fecha: Date): Record<string, string> {
  const formatter = new Intl.DateTimeFormat('es-PE', {
    timeZone: ZONA_LIMA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const partes: Record<string, string> = {};
  for (const p of formatter.formatToParts(fecha)) {
    if (p.type !== 'literal') {
      partes[p.type] = p.value;
    }
  }
  return partes;
}

/**
 * Formatea una cadena ISO UTC (ej. "2026-11-14T04:52:13.405267Z") a "13/11/2026 23:52" en America/Lima.
 * Si recibe una fecha ya formateada legible o vacía, retorna el texto limpio o "—".
 */
export function formatLimaFechaHora(iso?: string | null): string {
  if (!iso || !iso.trim()) return '—';
  const limpio = iso.trim();

  // Si ya viene formateada como DD/MM/YYYY HH:mm (sin T ISO)
  if (/^\d{2}\/\d{2}\/\d{4}/.test(limpio) && !limpio.includes('T')) {
    return limpio.replace(',', '');
  }

  try {
    const d = new Date(limpio);
    if (isNaN(d.getTime())) return limpio;
    const p = obtenerPartesLima(d);
    const hora = p.hour === '24' ? '00' : p.hour;
    return `${p.day}/${p.month}/${p.year} ${hora}:${p.minute}`;
  } catch {
    return limpio;
  }
}

/**
 * Formatea una fecha ISO o "AAAA-MM-DD" a "DD/MM/AAAA" en America/Lima.
 */
export function formatLimaFecha(iso?: string | null): string {
  if (!iso || !iso.trim()) return '—';
  const limpio = iso.trim();

  // Si es solo fecha AAAA-MM-DD, evitar desfase de medianoche UTC
  const matchYmd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(limpio);
  if (matchYmd) {
    return `${matchYmd[3]}/${matchYmd[2]}/${matchYmd[1]}`;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(limpio)) {
    return limpio;
  }

  try {
    const d = new Date(limpio);
    if (isNaN(d.getTime())) return limpio;
    const p = obtenerPartesLima(d);
    return `${p.day}/${p.month}/${p.year}`;
  } catch {
    return limpio;
  }
}

/**
 * Formatea una cadena ISO o de hora a "HH:mm" en America/Lima.
 */
export function formatHora(iso?: string | null): string {
  if (!iso || !iso.trim()) return '—';
  const limpio = iso.trim();

  if (/^\d{2}:\d{2}$/.test(limpio)) {
    return limpio;
  }

  try {
    const d = new Date(limpio);
    if (isNaN(d.getTime())) return limpio;
    const p = obtenerPartesLima(d);
    const hora = p.hour === '24' ? '00' : p.hour;
    return `${hora}:${p.minute}`;
  } catch {
    return limpio;
  }
}

/**
 * Retorna la fecha actual (o de referencia) en America/Lima en formato "AAAA-MM-DD".
 */
export function obtenerHoyLimaYMD(refDate: Date = new Date()): string {
  const p = obtenerPartesLima(refDate);
  return `${p.year}-${p.month}-${p.day}`;
}

/**
 * Retorna la fecha en formato "AAAA-MM-DD" restando `diasAtras` días en America/Lima.
 */
export function restarDiasLimaYMD(diasAtras: number, refDate: Date = new Date()): string {
  const copia = new Date(refDate.getTime() - diasAtras * 24 * 60 * 60 * 1000);
  return obtenerHoyLimaYMD(copia);
}
