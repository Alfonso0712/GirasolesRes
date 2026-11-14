import { describe, it, expect } from 'vitest';
import { DEMO_ACCOUNTS } from './demoAccounts';

describe('demoAccounts - Catálogo de cuentas demostración', () => {
  it('debe contener cuentas para los 4 roles canónicos', () => {
    const roles = DEMO_ACCOUNTS.map((c) => c.rol);
    expect(roles).toContain('Admin');
    expect(roles).toContain('Cajero');
    expect(roles).toContain('Mozo');
    expect(roles).toContain('Cocinero');
  });

  it('cada cuenta debe tener usuario y contrasena configurados', () => {
    DEMO_ACCOUNTS.forEach((cuenta) => {
      expect(cuenta.usuario.length).toBeGreaterThan(0);
      expect(cuenta.contrasena.length).toBeGreaterThanOrEqual(4);
      expect(cuenta.rol).toBeDefined();
    });
  });
});
