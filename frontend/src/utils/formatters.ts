import { formatCategoriaLabel } from './formatCategory';

/**
 * Formatea un monto numérico a moneda peruana (ej. 12.5 -> "S/ 12.50").
 * Si el monto es nulo o indefinido, retorna "S/ 0.00".
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return 'S/ 0.00';
  return `S/ ${amount.toFixed(2)}`;
}

/**
 * Formatea un monto numérico con 2 decimales sin el prefijo "S/ " (ej. 12.5 -> "12.50").
 * Si el monto es nulo o indefinido, retorna "0.00".
 */
export function formatDecimal(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '0.00';
  return amount.toFixed(2);
}

/**
 * Formatea un objeto Date a formato ISO "YYYY-MM-DD" usando fecha local.
 */
export function formatDateIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Retorna la fecha actual en la zona horaria de Lima (UTC-5) en formato "YYYY-MM-DD".
 */
export function getFechaActualLimaStr(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/**
 * Retorna una fecha restando días en la zona horaria de Lima en formato "YYYY-MM-DD".
 */
export function restarDiasLimaStr(diasAtras: number): string {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * Formatea una fecha UTC a formato local legible de Lima ("DD/MM/YYYY, HH:mm").
 * Si no es válida o está vacía, devuelve el valor original o "—".
 */
export function formatLimaFecha(fechaUtc?: string | null): string {
  if (!fechaUtc) return '—';
  try {
    const d = new Date(fechaUtc);
    if (isNaN(d.getTime())) return fechaUtc;
    return new Intl.DateTimeFormat('es-PE', {
      timeZone: 'America/Lima',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return fechaUtc;
  }
}

/**
 * Formatea amigablemente una hora de apertura de caja.
 */
export function formatearHoraApertura(isoDate?: string, localStr?: string): string {
  if (localStr) return localStr;
  if (!isoDate) return '--:--';
  try {
    const d = new Date(isoDate);
    return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoDate;
  }
}

/**
 * Formatea una fecha en formato extendido español (ej. "viernes, 30 de octubre de 2026").
 */
export function formatFechaLarga(fecha?: Date | string | null): string {
  try {
    const d = typeof fecha === 'string' ? new Date(fecha) : (fecha || new Date());
    return d.toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return 'Fecha actual';
  }
}

/**
 * Formatea los minutos de espera de una comanda (ej. 8 -> "8 min").
 */
export function formatMinutosEspera(minutos: number | null | undefined): string {
  if (minutos == null || isNaN(minutos)) return '0 min';
  return `${minutos} min`;
}

/**
 * Formatea la etiqueta de hora de llegada de una comanda (ej. "13:45" -> "Llegó: 13:45").
 */
export function formatHoraLlegada(hora?: string | null): string {
  return hora ? `Llegó: ${hora}` : '';
}

export { formatCategoriaLabel };
