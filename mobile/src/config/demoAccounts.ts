// MÓDULO PROTEGIDO: conexión y modo demostración. No modificar sin actualizar mobile/CONNECTION.md y scripts/verify-connection.mjs

export interface DemoAccount {
  rol: 'Admin' | 'Mozo' | 'Cocinero' | 'Cajero';
  usuario: string;
  contrasena: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { rol: 'Admin', usuario: 'admin', contrasena: 'Password123!' },
  { rol: 'Mozo', usuario: 'lperez', contrasena: 'Password123!' },
  { rol: 'Cocinero', usuario: 'msoto', contrasena: 'Password123!' },
  { rol: 'Cajero', usuario: 'atorres', contrasena: 'Password123!' },
];
