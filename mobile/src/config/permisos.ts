import type { RolUsuario } from '../types/auth';

export type Accion =
  | 'mesas.ver'
  | 'mesas.gestionar'
  | 'pedidoMesa.crear'
  | 'pedidoLlevar.crear'
  | 'pedidos.ver'
  | 'pedidos.modificar'
  | 'pedidos.anular'
  | 'comandas.gestionar'
  | 'platos.disponibilidad'
  | 'platos.gestionar'
  | 'caja.ver'
  | 'caja.abrir'
  | 'caja.cerrar'
  | 'cobros.procesar'
  | 'ventas.ver'
  | 'ventas.anular'
  | 'cierres.ver'
  | 'reportes.ver'
  | 'inicio.ver';

/**
 * Matriz estricta de permisos por rol derivada exclusivamente de los atributos
 * [Authorize(Roles = "...")] de los controladores backend de ASP.NET Core 8.
 * Esta es la ÚNICA fuente de verdad para validaciones RBAC en el cliente móvil.
 */
const MATRIZ_PERMISOS: Record<Accion, readonly RolUsuario[]> = {
  // MesasController: [Authorize(Roles = "Administrador,Cajero,Mozo")]
  'mesas.ver': ['Administrador', 'Cajero', 'Mozo'],
  // MesasController POST/PUT/PATCH: [Authorize(Roles = "Administrador")]
  'mesas.gestionar': ['Administrador'],

  // PedidosController POST /mesa y /lineas: [Authorize(Roles = "Mozo,Administrador")]
  'pedidoMesa.crear': ['Administrador', 'Mozo'],
  // PedidosController POST /llevar: [Authorize(Roles = "Cajero")]
  'pedidoLlevar.crear': ['Cajero'],
  // PedidosController GET: [Authorize(Roles = "Mozo,Cajero,Administrador")]
  'pedidos.ver': ['Administrador', 'Cajero', 'Mozo'],
  // PedidosController PUT /{id}: [Authorize(Roles = "Mozo,Cajero")]
  'pedidos.modificar': ['Mozo', 'Cajero'],
  // PedidosController POST /{id}/anular: [Authorize(Roles = "Mozo,Cajero,Administrador")]
  'pedidos.anular': ['Administrador', 'Cajero', 'Mozo'],

  // ComandasController: [Authorize(Roles = "Cocinero")]
  'comandas.gestionar': ['Cocinero'],

  // MenuDiaController PATCH .../disponibilidad: [Authorize(Roles = "Administrador,Cocinero")]
  'platos.disponibilidad': ['Administrador', 'Cocinero'],
  // MenuDiaController PUT /hoy: [Authorize(Roles = "Administrador")]
  'platos.gestionar': ['Administrador'],

  // CajaController GET /actual y /estado: [Authorize(Roles = "Cajero,Administrador")]
  'caja.ver': ['Administrador', 'Cajero'],
  // CajaController POST /abrir: [Authorize(Roles = "Cajero")]
  'caja.abrir': ['Cajero'],
  // CajaController POST /cerrar: [Authorize(Roles = "Cajero")]
  'caja.cerrar': ['Cajero'],

  // CobrosController: [Authorize(Roles = "Cajero")]
  'cobros.procesar': ['Cajero'],

  // VentasController GET: [Authorize(Roles = "Cajero,Administrador")]
  'ventas.ver': ['Administrador', 'Cajero'],
  // VentasController POST /{id}/anular: [Authorize(Roles = "Administrador")]
  'ventas.anular': ['Administrador'],

  // CajaController GET /cierres: [Authorize(Roles = "Administrador")]
  'cierres.ver': ['Administrador'],

  // ReportesController: [Authorize(Roles = "Administrador")]
  'reportes.ver': ['Administrador'],

  // InicioController (dashboard admin): Administrador
  'inicio.ver': ['Administrador'],
};

/**
 * Evalúa si un rol tiene autorización formal para ejecutar una acción específica.
 */
export function puede(rol: RolUsuario | undefined | null, accion: Accion): boolean {
  if (!rol) return false;
  const rolesAutorizados = MATRIZ_PERMISOS[accion];
  return rolesAutorizados ? rolesAutorizados.includes(rol) : false;
}
