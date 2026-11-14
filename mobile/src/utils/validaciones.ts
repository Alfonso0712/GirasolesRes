/**
 * Utilidades de validación para montos, comprobantes (DNI, RUC, Boleta S/ 700)
 * y operaciones de cobro y caja en la aplicación móvil de Restaurante Girasoles.
 */

export interface ValidacionResultado {
  valido: boolean;
  error?: string;
}

/**
 * Valida un número de DNI peruano (exactamente 8 dígitos numéricos).
 */
export function validarDni(dni: string): ValidacionResultado {
  const limpio = (dni || '').trim();
  if (!limpio) {
    return { valido: false, error: 'Ingrese el número de DNI.' };
  }
  if (!/^\d{8}$/.test(limpio)) {
    return { valido: false, error: 'El DNI debe tener 8 dígitos numéricos.' };
  }
  return { valido: true };
}

/**
 * Valida un número de RUC peruano (11 dígitos numéricos que comiencen con 10 o 20).
 */
export function validarRuc(ruc: string): ValidacionResultado {
  const limpio = (ruc || '').trim();
  if (!limpio) {
    return { valido: false, error: 'Ingrese el número de RUC.' };
  }
  if (!/^\d{11}$/.test(limpio)) {
    return { valido: false, error: 'El RUC debe tener 11 dígitos numéricos.' };
  }
  if (!/^(10|20)\d{9}$/.test(limpio)) {
    return { valido: false, error: 'El RUC debe comenzar con 10 o 20.' };
  }
  return { valido: true };
}

/**
 * Determina si una boleta requiere DNI obligatorio por superar o igualar S/ 700.00 (norma SUNAT).
 */
export function requiereDniBoleta(total: number): boolean {
  return typeof total === 'number' && !isNaN(total) && total >= 700;
}

/**
 * Valida los datos requeridos para la emisión de una boleta de venta.
 * Si el importe es >= S/ 700, el DNI es obligatorio y debe tener 8 dígitos.
 */
export function validarBoleta(total: number, documentoCliente?: string): ValidacionResultado {
  if (requiereDniBoleta(total)) {
    const doc = (documentoCliente || '').trim();
    if (!doc) {
      return {
        valido: false,
        error: 'Las boletas de S/ 700 o más exigen el DNI del cliente (8 dígitos).',
      };
    }
    const valDni = validarDni(doc);
    if (!valDni.valido) {
      return {
        valido: false,
        error: 'Las boletas de S/ 700 o más exigen el DNI del cliente (8 dígitos).',
      };
    }
  }
  return { valido: true };
}

/**
 * Valida un monto monetario en el rango permitido.
 */
export function validarMonto(
  monto: number | string,
  min: number = 0,
  max: number = 99999.99
): ValidacionResultado {
  const num = typeof monto === 'number' ? monto : parseFloat(monto);
  if (isNaN(num)) {
    return { valido: false, error: 'Ingrese un monto numérico válido.' };
  }
  if (num < min) {
    return { valido: false, error: `El monto no puede ser menor a S/ ${min.toFixed(2)}.` };
  }
  if (num > max) {
    return { valido: false, error: `El monto no puede exceder S/ ${max.toFixed(2)}.` };
  }
  return { valido: true };
}
