import { describe, it, expect, beforeEach } from 'vitest';
import { setTheme, toggleTheme, applyThemeClass } from '../useTheme';

describe('useTheme hook y manipulación reactiva de tema', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('debe alternar reactivamente la clase dark en el DOM al llamar a setTheme sin recargar la página', () => {
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    setTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('girasoles_theme')).toBe('dark');

    setTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('girasoles_theme')).toBe('light');
  });

  it('debe alternar entre claro y oscuro al invocar toggleTheme', () => {
    setTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    toggleTheme();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('girasoles_theme')).toBe('dark');

    toggleTheme();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('girasoles_theme')).toBe('light');
  });

  it('applyThemeClass debe manipular la clase dark directamente en documentElement', () => {
    applyThemeClass('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    applyThemeClass('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
