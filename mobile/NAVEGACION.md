# Arquitectura de Navegación Móvil y Permisos por Rol (NAVEGACION.md)

Este documento especifica la estructura canónica de pestañas, páginas y matriz de permisos RBAC para la aplicación móvil y tablet de Restaurante Girasoles (`mobile/`).

---

## 1. Pestañas y Pantallas por Rol

Todas las etiquetas cumplen el límite estricto de 9 caracteres y el glosario oficial del sistema web:

| Rol | Pestaña Inicial | Pestañas Disponibles (Etiquetas) | Páginas y Orquestadores |
| :--- | :--- | :--- | :--- |
| **Mozo** | Salón | Salón, Pedidos, Perfil | `SalonPage`, `PedidosPage`, `PerfilPage` |
| **Cajero** | Caja | Caja, Cobros, Llevar, Salón, Perfil | `CajaPage`, `CobrosPage`, `LlevarPage`, `SalonPage`, `PerfilPage` |
| **Cocinero** | Cocina | Cocina, Platos, Perfil | `CocinaPage`, `PlatosPage`, `PerfilPage` |
| **Administrador** | Inicio | Inicio, Salón, Caja, Reportes, Perfil | `InicioPage`, `SalonPage`, `CajaPage`, `ReportesPage`, `PerfilPage` |

---

## 2. Matriz de Autorización RBAC (`config/permisos.ts`)

Derivada formalmente de los atributos `[Authorize(Roles = "...")]` de los controladores backend de ASP.NET Core 8:

| Acción | Controlador / Endpoint Backend | Roles Autorizados | Restricción Visual en Móvil |
| :--- | :--- | :--- | :--- |
| `mesas.ver` | `MesasController` (GET) | Admin, Cajero, Mozo | Cocinero bloqueado con `AccesoRestringido` (403 prevenido). |
| `mesas.gestionar` | `MesasController` (POST/PUT/PATCH) | Administrador | Solo gestión administrativa en web. |
| `pedidoMesa.crear` | `PedidosController` (POST `/mesa`, `/lineas`) | Administrador, Mozo | En Salón, Cajero no puede iniciar pedido en mesas Libres. |
| `pedidoLlevar.crear` | `PedidosController` (POST `/llevar`) | Cajero | Pestaña Llevar exclusiva de Cajero. |
| `pedidos.ver` | `PedidosController` (GET) | Admin, Cajero, Mozo | Mozo consulta sus pedidos activos sin ver montos (RV-154). |
| `pedidos.modificar` | `PedidosController` (PUT `/{id}`) | Cajero, Mozo | Ajustes de platos antes de despacho o cobro. |
| `pedidos.anular` | `PedidosController` (POST `/{id}/anular`) | Admin, Cajero, Mozo | Anulación con justificación obligatoria. |
| `comandas.gestionar` | `ComandasController` (GET, PUT) | Cocinero | Pestaña Cocina KDS exclusiva de Cocinero. |
| `platos.disponibilidad`| `MenuDiaController` (PATCH `/disponibilidad`) | Administrador, Cocinero | Alternar estado agotado/disponible de platos. |
| `caja.ver` | `CajaController` (GET `/actual`, `/estado`) | Administrador, Cajero | Consulta de estado y parciales de turno. |
| `caja.abrir` / `.cerrar`| `CajaController` (POST `/abrir`, `/cerrar`)| Cajero | Administrador ve turno en solo lectura sin botones de apertura/cierre. |
| `cobros.procesar` | `CobrosController` (POST) | Cajero | Pestaña Cobros exclusiva de Cajero. |
| `ventas.ver` | `VentasController` (GET) | Administrador, Cajero | Pestaña secundaria de ventas en Caja. |
| `ventas.anular` | `VentasController` (POST `/{id}/anular`) | Administrador | Anulación auditada reservada para Administrador. |
| `cierres.ver` | `CajaController` (GET `/cierres`) | Administrador | Historial de actas de arqueo y cuadre de caja. |
| `reportes.ver` | `ReportesController` (GET) | Administrador | Pestaña Reportes exclusiva de Administrador. |
| `inicio.ver` | `InicioController` (GET `/inicio`) | Administrador | Pestaña Inicio con KPIs ejecutivos y alertas. |

---

## 3. Flujos Principales por Rol

### 3.1 Flujo del Mozo
1. **Salón:** Visualiza grilla de mesas con estado (*Libre* / *Ocupada*).
2. **Toma de Pedido:** Pulsa mesa libre o mesa ocupada (*Agregar Más Platos*) → formulario táctil con selector de categorías y numpad → confirmación.
3. **Retorno Automático:** Al registrar con éxito, retorna inmediatamente al Salón con notificación toast y refresco reactivo.
4. **Seguimiento:** En pestaña *Pedidos*, consulta pedidos en cocina ordenados con los *Listos* al inicio (sin exposición de montos económicos).

### 3.2 Flujo del Cajero
1. **Apertura de Caja:** En pestaña *Caja*, ingresa fondo inicial mediante Numpad → confirma apertura.
2. **Cobro Rápido:** En pestaña *Cobros*, pulsa cuenta pendiente → selecciona *Efectivo* (con cálculo automático de vuelto) o *Yape/Plin* → emite comprobante.
3. **Mesa Ocupada:** En *Salón*, al pulsar una mesa ocupada dispone de acceso directo *Ir a cobrar*.
4. **Para Llevar:** En pestaña *Llevar*, registra pedidos directos de mostrador.
5. **Cierre de Caja:** En *Caja*, ejecuta arqueo con efectivo contado, detección de diferencias (*Cuadra*, *Sobrante*, *Faltante*) y genera acta.

### 3.3 Flujo del Cocinero
1. **KDS Táctil:** En pestaña *Cocina*, visualiza comandas entrantes con alertas visuales de tiempo de espera (>=10 min advertencia, >=20 min crítico).
2. **Avance de Estados:** Botones táctiles de 56 px aptos para guantes: *Empezar Preparación* (pasa a *En preparación*) y *Marcar Listo para Servir* (pasa a *Listo*). Sondeo automático cada 5 s con pausa reactiva en segundo plano.
3. **Control de Platos:** En pestaña *Platos*, marca platos como agotados para bloquear inmediatamente su venta en salón.

### 3.4 Flujo del Administrador
1. **Inicio:** Dashboard ejecutivo con métricas del día (ventas totales, efectivo, Yape, ticket promedio, mesas ocupadas y estado de caja), alertas críticas y accesos rápidos.
2. **Supervisión de Salón y Caja:** Monitorea mesas y consulta el turno actual en solo lectura (*"La apertura y el cierre de caja los realiza el Cajero"*), junto con el registro de ventas e historial de cierres.
3. **Reportes:** Consulta métricas de rendimiento por período (*Hoy*, *7 Días*, *Este Mes*) y platos más vendidos.
