import '@testing-library/jest-dom/vitest';

// Polyfills / mocks para entorno de pruebas jsdom
if (typeof window !== 'undefined') {
  // Mock de matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });

  // Mock de ResizeObserver
  (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  // Mock de scrollTo y scrollIntoView
  window.scrollTo = () => {};
  Element.prototype.scrollIntoView = () => {};
}
