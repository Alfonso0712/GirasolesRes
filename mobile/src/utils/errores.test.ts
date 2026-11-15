import { describe, it, expect } from 'vitest';
import {
  extraerEstadoError,
  extraerMensajeError,
  esApiError,
  mensajeDeError,
} from './errores';
import { ApiError } from '../services/apiClient';

describe('utils/errores', () => {
  it('extraerEstadoError retorna el status numerico cuando existe', () => {
    expect(extraerEstadoError({ status: 423 })).toBe(423);
    expect(extraerEstadoError({ status: '423' })).toBeUndefined();
    expect(extraerEstadoError(null)).toBeUndefined();
    expect(extraerEstadoError('error')).toBeUndefined();
  });

  it('extraerMensajeError prioriza mensaje, luego message y finalmente Error', () => {
    expect(extraerMensajeError({ mensaje: 'Bloqueado', message: 'Otro' })).toBe('Bloqueado');
    expect(extraerMensajeError({ message: 'No autorizado' })).toBe('No autorizado');
    expect(extraerMensajeError(new Error('Falla de red'))).toBe('Falla de red');
    expect(extraerMensajeError({ mensaje: '' })).toBeUndefined();
    expect(extraerMensajeError(42)).toBeUndefined();
  });

  it('esApiError distingue ApiError real de errores genericos y objetos simples', () => {
    const apiErr = new ApiError({ status: 422, mensaje: 'MSG-10: Producto agotado.' });
    expect(esApiError(apiErr)).toBe(true);
    expect(esApiError(new ApiError({ status: 0, mensaje: 'Sin conexion', tipo: 'sin-respuesta' }))).toBe(true);
    expect(esApiError(new ApiError({ status: 408, mensaje: 'Tiempo agotado', tipo: 'timeout' }))).toBe(true);
    expect(esApiError(new Error('TypeError: failed to fetch'))).toBe(false);
    expect(esApiError({ name: 'ApiError', status: 500, mensaje: 'No es Error' })).toBe(false);
    expect(esApiError(null)).toBe(false);
  });

  it('mensajeDeError devuelve mensaje de ApiError y cae al porDefecto ante errores tecnicos u otros tipos', () => {
    const apiErr = new ApiError({ status: 400, mensaje: 'El pedido ya esta en preparacion.' });
    expect(mensajeDeError(apiErr, 'Error generico')).toBe('El pedido ya esta en preparacion.');

    const apiSinMensaje = new ApiError({ status: 500, mensaje: '' });
    expect(mensajeDeError(apiSinMensaje, 'Error al guardar.')).toBe('Error al guardar.');

    expect(mensajeDeError(new TypeError('Cannot read properties of undefined'), 'No se pudo procesar el cobro.')).toBe(
      'No se pudo procesar el cobro.'
    );
    expect(mensajeDeError('string tecnico', 'Error al consultar ventas')).toBe('Error al consultar ventas');
    expect(mensajeDeError(undefined, 'Fallback seguro')).toBe('Fallback seguro');
  });

  it('mensajeDeError preserva exactamente los mensajes esperados en los puntos migrados de E-0(c)', () => {
    const fallbacks = [
      'No se pudo generar el reporte en PDF.',
      'Error al consultar ventas',
      'No se pudo obtener el detalle de la venta.',
      'Error al anular la venta.',
      'Error al consultar historial de cierres',
      'No se pudo obtener el detalle del cierre.',
      'Error al abrir caja',
      'No se pudo obtener el resumen de cierre de caja',
      'Error al cerrar caja',
      'No se pudo descargar el acta de cierre en PDF.',
      'No se encontró información para el DNI ingresado.',
      'No se encontró información para el RUC ingresado.',
      'No se pudo procesar el cobro.',
      'Error al actualizar disponibilidad',
      'No se pudo completar la operación. Intente nuevamente.',
      'No se pudo anular el pedido.',
      'Error al consultar el detalle del pedido',
      'Error al cargar los productos disponibles',
      'No se pudo obtener el comprobante en PDF.',
      'No se pudo guardar el menú del día.',
      'Error al cargar las mesas del salón.',
      'Error al registrar el pedido para llevar',
      'Error al agregar platos al pedido',
      'Error al registrar el pedido para la mesa',
      'Error al obtener los datos.',
    ];
    for (const fallback of fallbacks) {
      expect(mensajeDeError(new Error('raw internal error'), fallback)).toBe(fallback);
      expect(mensajeDeError(new ApiError({ status: 400, mensaje: 'MSG-01: Respuesta del servidor' }), fallback)).toBe(
        'MSG-01: Respuesta del servidor'
      );
    }
  });
});
