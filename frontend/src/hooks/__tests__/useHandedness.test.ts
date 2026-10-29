import { describe, it, expect, beforeEach } from 'vitest';
import {
  setHandedness,
  getHandednessForUser,
  applyUserHandedness,
  resetHandednessToDefault,
} from '../useHandedness';

describe('useHandedness - Preferencia aislada por usuario', () => {
  beforeEach(() => {
    localStorage.clear();
    resetHandednessToDefault();
  });

  it('guarda la preferencia independientemente por cada usuario', () => {
    // Usuario 1: juan -> zurdo (left)
    setHandedness('left', 'juan');
    // Usuario 2: maria -> diestro (right)
    setHandedness('right', 'maria');

    expect(getHandednessForUser('juan')).toBe('left');
    expect(getHandednessForUser('maria')).toBe('right');
    // Usuario nuevo o no configurado -> diestro por defecto
    expect(getHandednessForUser('carlos')).toBe('right');
  });

  it('applyUserHandedness activa la orientación del usuario y actualiza el DOM', () => {
    setHandedness('left', 'juan');

    // Cambiar a juan
    applyUserHandedness('juan');
    expect(document.documentElement.classList.contains('left-handed')).toBe(true);
    expect(document.documentElement.getAttribute('data-handedness')).toBe('left');

    // Cambiar a maria (diestra)
    applyUserHandedness('maria');
    expect(document.documentElement.classList.contains('left-handed')).toBe(false);
    expect(document.documentElement.getAttribute('data-handedness')).toBe('right');
  });

  it('resetHandednessToDefault restablece a diestro y limpia la clase del DOM', () => {
    setHandedness('left', 'juan');
    applyUserHandedness('juan');
    expect(document.documentElement.classList.contains('left-handed')).toBe(true);

    resetHandednessToDefault();
    expect(document.documentElement.classList.contains('left-handed')).toBe(false);
    expect(document.documentElement.getAttribute('data-handedness')).toBe('right');
  });

  it('persiste la preferencia a nivel de dispositivo para pantallas públicas como el login', () => {
    setHandedness('left');
    expect(localStorage.getItem('girasoles_handedness')).toBe('left');
    expect(getHandednessForUser()).toBe('left');

    setHandedness('right');
    expect(localStorage.getItem('girasoles_handedness')).toBe('right');
    expect(getHandednessForUser()).toBe('right');
  });
});
