import { describe, it, expect } from 'vitest';
import { puede, type Accion } from './permisos';
import type { RolUsuario } from '../types/auth';

describe('permisos - Matriz RBAC', () => {
  const roles: RolUsuario[] = ['Mozo', 'Cajero', 'Cocinero', 'Administrador'];

  it('debe denegar cualquier acción cuando el rol es nulo o indefinido', () => {
    expect(puede(undefined, 'mesas.ver')).toBe(false);
    expect(puede(null, 'caja.ver')).toBe(false);
  });

  describe('Permisos del Mozo', () => {
    const rol: RolUsuario = 'Mozo';

    it('debe tener acceso a salón y toma/modificación de pedidos de mesa', () => {
      expect(puede(rol, 'mesas.ver')).toBe(true);
      expect(puede(rol, 'pedidoMesa.crear')).toBe(true);
      expect(puede(rol, 'pedidos.ver')).toBe(true);
      expect(puede(rol, 'pedidos.modificar')).toBe(true);
      expect(puede(rol, 'pedidos.anular')).toBe(true);
    });

    it('no debe tener acceso a caja, dinero, comandas de cocina ni administración', () => {
      expect(puede(rol, 'caja.ver')).toBe(false);
      expect(puede(rol, 'caja.abrir')).toBe(false);
      expect(puede(rol, 'caja.cerrar')).toBe(false);
      expect(puede(rol, 'cobros.procesar')).toBe(false);
      expect(puede(rol, 'ventas.ver')).toBe(false);
      expect(puede(rol, 'ventas.anular')).toBe(false);
      expect(puede(rol, 'comandas.gestionar')).toBe(false);
      expect(puede(rol, 'reportes.ver')).toBe(false);
      expect(puede(rol, 'mesas.gestionar')).toBe(false);
    });
  });

  describe('Permisos del Cajero', () => {
    const rol: RolUsuario = 'Cajero';

    it('debe tener acceso a caja, cobros, pedidos para llevar y ver ventas', () => {
      expect(puede(rol, 'caja.ver')).toBe(true);
      expect(puede(rol, 'caja.abrir')).toBe(true);
      expect(puede(rol, 'caja.cerrar')).toBe(true);
      expect(puede(rol, 'cobros.procesar')).toBe(true);
      expect(puede(rol, 'pedidoLlevar.crear')).toBe(true);
      expect(puede(rol, 'ventas.ver')).toBe(true);
      expect(puede(rol, 'mesas.ver')).toBe(true);
    });

    it('no debe tener autorización para anular ventas ni ver reportes gerenciales', () => {
      expect(puede(rol, 'ventas.anular')).toBe(false);
      expect(puede(rol, 'cierres.ver')).toBe(false);
      expect(puede(rol, 'reportes.ver')).toBe(false);
      expect(puede(rol, 'mesas.gestionar')).toBe(false);
      expect(puede(rol, 'comandas.gestionar')).toBe(false);
    });
  });

  describe('Permisos del Cocinero', () => {
    const rol: RolUsuario = 'Cocinero';

    it('debe tener acceso exclusivo a gestionar comandas y disponibilidad de platos', () => {
      expect(puede(rol, 'comandas.gestionar')).toBe(true);
      expect(puede(rol, 'platos.disponibilidad')).toBe(true);
    });

    it('no debe tener acceso a salón, caja, pedidos ni definir el menú del día', () => {
      expect(puede(rol, 'mesas.ver')).toBe(false);
      expect(puede(rol, 'pedidoMesa.crear')).toBe(false);
      expect(puede(rol, 'caja.ver')).toBe(false);
      expect(puede(rol, 'cobros.procesar')).toBe(false);
      expect(puede(rol, 'reportes.ver')).toBe(false);
      expect(puede(rol, 'menuDia.definir')).toBe(false);
    });
  });

  describe('Permisos del Administrador', () => {
    const rol: RolUsuario = 'Administrador';

    it('debe tener permisos de supervisión, reportes, gestión de mesas, menú del día y anulación de ventas', () => {
      expect(puede(rol, 'inicio.ver')).toBe(true);
      expect(puede(rol, 'reportes.ver')).toBe(true);
      expect(puede(rol, 'mesas.gestionar')).toBe(true);
      expect(puede(rol, 'ventas.anular')).toBe(true);
      expect(puede(rol, 'cierres.ver')).toBe(true);
      expect(puede(rol, 'caja.ver')).toBe(true);
      expect(puede(rol, 'ventas.ver')).toBe(true);
      expect(puede(rol, 'platos.gestionar')).toBe(true);
      expect(puede(rol, 'menuDia.definir')).toBe(true);
      expect(puede(rol, 'platos.disponibilidad')).toBe(true);
    });

    it('no debe abrir/cerrar caja directamente (tarea exclusiva del Cajero en turno)', () => {
      expect(puede(rol, 'caja.abrir')).toBe(false);
      expect(puede(rol, 'caja.cerrar')).toBe(false);
      expect(puede(rol, 'cobros.procesar')).toBe(false);
    });
  });

  describe('Verificación completa de integridad de la matriz', () => {
    const todasLasAcciones: Accion[] = [
      'mesas.ver',
      'mesas.gestionar',
      'pedidoMesa.crear',
      'pedidoLlevar.crear',
      'pedidos.ver',
      'pedidos.modificar',
      'pedidos.anular',
      'comandas.gestionar',
      'platos.disponibilidad',
      'platos.gestionar',
      'menuDia.definir',
      'caja.ver',
      'caja.abrir',
      'caja.cerrar',
      'cobros.procesar',
      'ventas.ver',
      'ventas.anular',
      'cierres.ver',
      'reportes.ver',
      'inicio.ver',
    ];

    it('cada acción debe ser evaluable sin lanzar excepciones para todos los roles', () => {
      todasLasAcciones.forEach((accion) => {
        roles.forEach((rol) => {
          const resultado = puede(rol, accion);
          expect(typeof resultado).toBe('boolean');
        });
      });
    });
  });
});
