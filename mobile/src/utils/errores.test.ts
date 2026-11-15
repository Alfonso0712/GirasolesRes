import { describe, it, expect } from 'vitest';
import { extraerEstadoError, extraerMensajeError } from './errores';

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
});
