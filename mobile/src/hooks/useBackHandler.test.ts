import { describe, it, expect, vi } from 'vitest';
import { pushBackHandler, executeTopBackHandler } from './useBackHandler';

describe('useBackHandler - Pila LIFO del Botón Atrás', () => {
  it('debe ejecutar primero el último manejador registrado (LIFO)', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    const unreg1 = pushBackHandler(handler1);
    const unreg2 = pushBackHandler(handler2);

    const manejado = executeTopBackHandler();

    expect(manejado).toBe(true);
    expect(handler2).toHaveBeenCalledTimes(1);
    expect(handler1).not.toHaveBeenCalled();

    unreg1();
    unreg2();
  });

  it('debe propagar al manejador previo si el tope retorna false', () => {
    const handlerFondo = vi.fn().mockReturnValue(true);
    const handlerTopePasa = vi.fn().mockReturnValue(false);

    const unreg1 = pushBackHandler(handlerFondo);
    const unreg2 = pushBackHandler(handlerTopePasa);

    const manejado = executeTopBackHandler();

    expect(manejado).toBe(true);
    expect(handlerTopePasa).toHaveBeenCalledTimes(1);
    expect(handlerFondo).toHaveBeenCalledTimes(1);

    unreg1();
    unreg2();
  });

  it('debe desuscribir correctamente el manejador al llamar la función unregister', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    const unreg1 = pushBackHandler(handler1);
    const unreg2 = pushBackHandler(handler2);

    // Desuscribimos el tope
    unreg2();

    const manejado = executeTopBackHandler();

    expect(manejado).toBe(true);
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).not.toHaveBeenCalled();

    unreg1();
  });

  it('debe retornar false si no hay manejadores registrados', () => {
    expect(executeTopBackHandler()).toBe(false);
  });
});
