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
2. **Cobro Rápido y Comprobante:** En pestaña *Cobros*, pulsa cuenta pendiente → selecciona *Efectivo* (con cálculo automático de vuelto) o *Yape/Plin* → emite comprobante y visualiza la hoja de éxito (`CobroExitoSheet`) con el número, tipo, destino, total, vuelto y acciones directas sobre el PDF (*Imprimir*, *Guardar PDF*, *Compartir PDF* y *WhatsApp*).
3. **Mesa Ocupada:** En *Salón*, al pulsar una mesa ocupada dispone de acceso directo *Ir a cobrar*.
4. **Para Llevar:** En pestaña *Llevar*, registra pedidos directos de mostrador.
5. **Reimpresión desde Ventas:** En *Caja > Ventas*, el Cajero y el Administrador pueden abrir el detalle de cualquier venta *Vigente* para reimprimir, guardar o compartir la copia en PDF (`copia=true`). Si la venta está *Anulada*, las acciones permanecen deshabilitadas (*"Comprobante anulado."*).
6. **Cierre de Caja:** En *Caja*, ejecuta arqueo con efectivo contado, detección de diferencias (*Cuadra*, *Sobrante*, *Faltante*) y genera acta.

### 3.3 Flujo del Cocinero
1. **KDS Táctil:** En pestaña *Cocina*, visualiza comandas entrantes con alertas visuales de tiempo de espera (>=10 min advertencia, >=20 min crítico).
2. **Avance de Estados:** Botones táctiles de 56 px aptos para guantes: *Empezar Preparación* (pasa a *En preparación*) y *Marcar Listo para Servir* (pasa a *Listo*). Sondeo automático cada 5 s con pausa reactiva en segundo plano.
3. **Control de Platos:** En pestaña *Platos*, marca platos como agotados para bloquear inmediatamente su venta en salón.

### 3.4 Flujo del Administrador
1. **Inicio:** Dashboard ejecutivo con métricas del día (ventas totales, efectivo, Yape, ticket promedio, mesas ocupadas y estado de caja), alertas críticas y accesos rápidos.
2. **Supervisión de Salón y Caja:** Monitorea mesas y consulta el turno actual en solo lectura (*"La apertura y el cierre de caja los realiza el Cajero"*), junto con el registro de ventas e historial de cierres.
3. **Reportes:** Consulta métricas de rendimiento por período (*Hoy*, *7 Días*, *Este Mes*) y platos más vendidos.

---

## 4. Avisos de Cocina en Tiempo Real y Limitación de Notificaciones

1. **Sondeo en Primer Plano:** El cliente móvil consulta activamente el endpoint `/api/avisos` cada 5 segundos mediante el hook `useKitchenNotifications` (activo para roles *Mozo*, *Cajero* y *Administrador*).
2. **Alertas Sensoriales:** Al detectarse un nuevo pedido listo, se dispara una respuesta táctil (`triggerSuccess`), alerta sonora sintetizada (`reproducirSonidoKds('lista')`) y una notificación toast interactiva (*"Pedido N.º {n} de {mesa} está listo para recoger."*).
3. **Insignias y Banners:** Se actualiza en tiempo real el distintivo numérico de la barra inferior (*Pedidos* para Mozo y *Cobros* para Cajero) y el banner superior en `MisPedidosView` (*"¡Tiene N pedidos listos en cocina!"*).
4. **Limitación de Notificaciones en Segundo Plano:** El sistema de avisos opera exclusivamente mientras la aplicación se encuentra **abierta o en primer plano**. Por arquitectura desacoplada y ligera, el cliente móvil no incorpora servicios push en segundo plano (FCM/APNs) ni daemons persistentes del sistema operativo cuando la aplicación está cerrada o suspendida en segundo plano.

---

## 5. Comprobantes

1. **Emisión tras el Cobro (`Cajero`):** Al confirmar un cobro se abre `CobroExitoSheet` con el resumen fiscal y las 4 acciones de comprobante (`ComprobanteAcciones`), que descargan por única vez el PDF original (`GET /api/cobros/comprobantes/{ventaId}/pdf?copia=false`) y reutilizan el `Blob` en memoria mientras la hoja permanece abierta.
2. **Reimpresión desde Ventas (`Cajero` y `Administrador`):** Desde el detalle de una venta *Vigente* en *Caja > Ventas* (`VentaDetalleSheet`), se descarga el PDF con marca de copia (`GET /api/ventas/{id}/ticket?copia=true`). Los roles *Mozo* y *Cocinero* no tienen acceso a estas acciones.
3. **Limitaciones Reales del Entorno Móvil:**
   - **WhatsApp no adjunta archivos por enlace:** Los enlaces `https://wa.me` solo permiten prellenar el texto resumen del comprobante; para enviar el archivo PDF al cliente se debe usar el botón *«Compartir PDF»*. El número de celular ingresado nunca se almacena en el dispositivo ni en el servidor.
   - **Impresión mediante el visor del sistema:** El botón *«Imprimir»* abre el PDF en el visor nativo del sistema operativo (`@capacitor-community/file-opener`, o la hoja de compartir como respaldo), desde donde el usuario selecciona la impresora configurada en Android.
   - **Sin impresora térmica directa:** La aplicación móvil no se conecta directamente por Bluetooth/USB/ESC-POS a impresoras térmicas de 80 mm; toda impresión se delega al servicio de impresión del sistema Android sobre el PDF vectorial generado por el backend.
