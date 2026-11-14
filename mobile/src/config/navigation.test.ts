import { describe, it, expect } from 'vitest';
import {
  PESTANAS_POR_ROL,
  pestanaInicial,
  obtenerPestanasParaRol,
} from './navigation';
import type { RolUsuario } from '../types/auth';

describe('navigation - Catálogo canónico de pestañas', () => {
  const roles: RolUsuario[] = ['Mozo', 'Cajero', 'Cocinero', 'Administrador'];

  describe('pestanaInicial', () => {
    it('debe devolver la pestaña inicial correcta por rol', () => {
      expect(pestanaInicial('Administrador')).toBe('inicio');
      expect(pestanaInicial('Cajero')).toBe('caja');
      expect(pestanaInicial('Cocinero')).toBe('cocina');
      expect(pestanaInicial('Mozo')).toBe('salon');
    });

    it('debe tener fallback a "salon" para roles desconocidos', () => {
      expect(pestanaInicial('Desconocido' as unknown as RolUsuario)).toBe('salon');
    });
  });

  describe('obtenerPestanasParaRol', () => {
    it('debe devolver las pestañas del rol solicitado', () => {
      const mozoTabs = obtenerPestanasParaRol('Mozo');
      expect(mozoTabs.map((t) => t.id)).toEqual(['salon', 'pedidos', 'perfil']);

      const cajeroTabs = obtenerPestanasParaRol('Cajero');
      expect(cajeroTabs.map((t) => t.id)).toEqual(['caja', 'cobros', 'llevar', 'salon', 'perfil']);

      const cocineroTabs = obtenerPestanasParaRol('Cocinero');
      expect(cocineroTabs.map((t) => t.id)).toEqual(['cocina', 'platos', 'perfil']);
      expect(cocineroTabs.find((t) => t.id === 'platos')?.etiqueta).toBe('Menú');

      const adminTabs = obtenerPestanasParaRol('Administrador');
      expect(adminTabs.map((t) => t.id)).toEqual(['inicio', 'salon', 'caja', 'reportes', 'mas']);
      expect(adminTabs.find((t) => t.id === 'mas')?.etiqueta).toBe('Más');
    });

    it('todas las pestañas deben tener etiquetas de máximo 9 caracteres según glosario web', () => {
      roles.forEach((rol) => {
        const tabs = PESTANAS_POR_ROL[rol];
        tabs.forEach((tab) => {
          expect(tab.etiqueta.length).toBeLessThanOrEqual(9);
          expect(tab.id).toBeDefined();
          expect(tab.icono).toBeDefined();
          expect(tab.vista).toBeDefined();
        });
      });
    });
  });
});
