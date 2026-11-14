import { formatLimaFechaHora } from './fechas';

export interface DatosMensajeComprobante {
  numero: string;
  total: number | string;
  fecha: string;
}

/**
 * Normaliza un número de celular móvil del Perú.
 * Acepta espacios, guiones, prefijo "+51" o "51" y devuelve exactamente 9 dígitos
 * numéricos que empiecen con 9, o `null` si el formato no es válido.
 */
export function normalizarCelularPeru(entrada: string): string | null {
  if (!entrada || typeof entrada !== 'string') return null;

  let limpio = entrada.trim().replace(/[\s-]+/g, '');
  if (!limpio) return null;

  if (limpio.startsWith('+51')) {
    limpio = limpio.slice(3);
  } else if (limpio.startsWith('51') && limpio.length > 9) {
    limpio = limpio.slice(2);
  }

  if (!/^9\d{8}$/.test(limpio)) {
    return null;
  }

  return limpio;
}

function formatearFechaMensaje(fecha: string): string {
  const formateada = formatLimaFechaHora(fecha);
  // Si trae segundos (dd/mm/aaaa hh:mm:ss), recortar a dd/mm/aaaa hh:mm
  const matchSegundos = /^(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}):\d{2}$/.exec(formateada);
  if (matchSegundos) {
    return matchSegundos[1];
  }
  return formateada;
}

function formatearTotalMensaje(total: number | string): string {
  if (typeof total === 'number') {
    return total.toFixed(2);
  }
  const sinPrefijo = total.replace(/^S\/\s*/i, '').trim();
  const num = Number(sinPrefijo);
  if (!Number.isNaN(num) && sinPrefijo !== '') {
    return num.toFixed(2);
  }
  return sinPrefijo;
}

/**
 * Construye el mensaje resumen del comprobante para envío por WhatsApp.
 * No incluye DNI, RUC ni razón social del cliente por privacidad.
 */
export function armarMensajeComprobante({
  numero,
  total,
  fecha,
}: DatosMensajeComprobante): string {
  const fechaTexto = formatearFechaMensaje(fecha);
  const totalTexto = formatearTotalMensaje(total);
  return `Restaurante Girasoles\nComprobante ${numero.trim()}\nFecha: ${fechaTexto}\nTotal: S/ ${totalTexto}\nGracias por su preferencia.`;
}

/**
 * Genera el enlace oficial `https://wa.me` con el mensaje codificado.
 * Si se proporciona un celular válido de 9 dígitos, dirige al número con prefijo `51`;
 * si es `null` o vacío, abre el selector de contactos de WhatsApp.
 */
export function urlWhatsApp(celular: string | null | undefined, mensaje: string): string {
  const textoCodificado = encodeURIComponent(mensaje);
  if (celular && celular.trim()) {
    const normalizado = normalizarCelularPeru(celular);
    if (normalizado) {
      return `https://wa.me/51${normalizado}?text=${textoCodificado}`;
    }
  }
  return `https://wa.me/?text=${textoCodificado}`;
}
