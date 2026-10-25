# Endpoints de la API Backend (GirasolesRes)

Este documento detalla la totalidad de los controladores REST y sus endpoints expuestos en `backend/GirasolesRes.API/Controllers/`, con cita textual de archivo, línea de código, atributos de autorización, DTOs de entrada y códigos HTTP de respuesta.

---

## 1. Resumen General de Controladores

| Controlador | Archivo | Cantidad de Endpoints | Área Funcional |
|---|---|:---:|---|
| `AuthController` | `Controllers/AuthController.cs` | 6 | Autenticación, sesión, logout y recuperación |
| `AvisosController` | `Controllers/AvisosController.cs` | 2 | Notificaciones y avisos de comandas listas |
| `CajaController` | `Controllers/CajaController.cs` | 8 | Apertura, cierre, arqueo, historial y PDF de caja |
| `CobrosController` | `Controllers/CobrosController.cs` | 4 | Procesamiento de cobro, comprobantes y PDF |
| `ComandasController` | `Controllers/ComandasController.cs` | 3 | KDS de cocina, avance de estados y deshacer |
| `ConsultasController` | `Controllers/ConsultasController.cs` | 2 | Consulta de DNI y RUC con padrón SUNAT/RENIEC |
| `InicioController` | `Controllers/InicioController.cs` | 2 | Dashboard y paneles de inicio por rol |
| `MenuDiaController` | `Controllers/MenuDiaController.cs` | 4 | Menú del día, opciones, platos agotados |
| `MenusCompletosController` | `Controllers/MenusCompletosController.cs` | 3 | Configuración y precios de menús completos |
| `MesasController` | `Controllers/MesasController.cs` | 5 | Salón, CRUD de mesas, cambio de estado |
| `PedidosController` | `Controllers/PedidosController.cs` | 9 | Pedidos de mesa y para llevar, líneas, anulación |
| `PerfilController` | `Controllers/PerfilController.cs` | 1 | Cambio de contraseña de usuario autenticado |
| `ProductosController` | `Controllers/ProductosController.cs` | 6 | Carta, catálogo, productos activos/agotados |
| `ReportesController` | `Controllers/ReportesController.cs` | 4 | Ventas por rango, platos más vendidos, exportación |
| `UsuariosController` | `Controllers/UsuariosController.cs` | 6 | Gestión de personal, cuentas y roles |
| `VentasController` | `Controllers/VentasController.cs` | 4 | Historial de ventas, anulación y ticket |

*Total Endpoints Implementados:* **69 acciones HTTP en 16 controladores**.

---

## 2. Detalle Exhaustivo por Controlador

### 2.1 `AuthController` (`backend/GirasolesRes.API/Controllers/AuthController.cs`)
- `POST /api/auth/login` (L:28)
  - **Autorización:** Anónimo.
  - **Entrada:** `LoginRequest` (`Usuario`, `Contrasena`).
  - **Respuestas:** `200 OK` (`LoginResponse`: token JWT, rol, nombre); `400 BadRequest` (MSG_01, MSG_02, MSG_03); `401 Unauthorized` (MSG_04); `403 Forbidden` (MSG_05); `423 Locked` (MSG_06).
- `POST /api/auth/forgot-password` (L:103)
  - **Autorización:** Anónimo.
  - **Entrada:** `ForgotPasswordRequest` (`Correo`).
  - **Respuestas:** `200 OK` (MSG_11 genérico para evitar enumeración); `400 BadRequest` (MSG_10).
- `POST /api/auth/reset-password` (L:151)
  - **Autorización:** Anónimo.
  - **Entrada:** `ResetPasswordRequest` (`Correo`, `Codigo`, `NuevaContrasena`).
  - **Respuestas:** `200 OK` (MSG_16); `400 BadRequest` (MSG_13, MSG_14, MSG_15).
- `GET /api/auth/me` (L:199)
  - **Autorización:** `[Authorize]` (Cualquier rol autenticado).
  - **Respuestas:** `200 OK` (Datos del usuario extraídos de los Claims del JWT).
- `POST /api/auth/logout` (L:216)
  - **Autorización:** `[Authorize]`.
  - **Entrada:** `LogoutRequest` (`Motivo`).
  - **Respuestas:** `200 OK` (Token agregado a lista negra `TokenRevocadoRepository`).
- `POST /api/auth/renovar` (L:253)
  - **Autorización:** `[Authorize]`.
  - **Respuestas:** `200 OK` (Nuevo token JWT renovado por 30 minutos).

### 2.2 `AvisosController` (`backend/GirasolesRes.API/Controllers/AvisosController.cs`)
- `GET /api/avisos` (L:29)
  - **Autorización:** `[Authorize(Roles = "Mozo,Administrador")]`.
  - **Respuestas:** `200 OK` (Lista de avisos de comandas listas para servir).
- `POST /api/avisos/{id:guid}/visto` (L:61)
  - **Autorización:** `[Authorize(Roles = "Mozo,Administrador")]`.
  - **Respuestas:** `200 OK`; `404 NotFound`.

### 2.3 `CajaController` (`backend/GirasolesRes.API/Controllers/CajaController.cs`)
- `GET /api/caja/actual` (L:36)
  - **Autorización:** `[Authorize(Roles = "Cajero,Administrador")]`.
  - **Respuestas:** `200 OK` (Estado de la jornada, total en efectivo, total Yape, cantidad de ventas).
- `POST /api/caja/abrir` (L:68)
  - **Autorización:** `[Authorize(Roles = "Cajero")]`.
  - **Entrada:** `AbrirCajaRequest` (`MontoInicial`).
  - **Respuestas:** `200 OK`; `400 BadRequest` (Monto negativo o superior a S/ 5000); `409 Conflict` (Ya existe caja abierta).
- `GET /api/caja/cierre/resumen` (L:178)
  - **Autorización:** `[Authorize(Roles = "Cajero")]`.
  - **Respuestas:** `200 OK` (Pre-cierre con arqueo teórico calculado por el sistema).
- `POST /api/caja/cerrar` (L:211)
  - **Autorización:** `[Authorize(Roles = "Cajero")]`.
  - **Entrada:** `CerrarCajaRequest` (`MontoEfectivoReal`, `Observaciones`).
  - **Respuestas:** `200 OK` (Cierre efectuado y descuadre calculado); `409 Conflict` (Pedidos pendientes sin cobrar o comandas abiertas).
- `GET /api/caja/cierres` (L:369)
  - **Autorización:** `[Authorize(Roles = "Administrador")]`.
  - **Respuestas:** `200 OK` (Historial paginado de cierres de caja).
- `GET /api/caja/cierres/{id:guid}` (L:461)
  - **Autorización:** `[Authorize(Roles = "Administrador")]`.
  - **Respuestas:** `200 OK` (Detalle de cierre, platos vendidos y ajustes posteriores); `404 NotFound`.
- `GET /api/caja/cierres/{id:guid}/pdf` (L:492)
  - **Autorización:** `[Authorize(Roles = "Cajero,Administrador")]`.
  - **Respuestas:** `200 OK` (`application/pdf` con acta de cierre generada por `PdfCanvasBuilder`).
- `GET /api/caja/estado` (L:532)
  - **Autorización:** `[Authorize(Roles = "Cajero,Administrador")]`.
  - **Respuestas:** `200 OK` (`{ abierta: bool, cajaId: Guid? }`).

### 2.4 `CobrosController` (`backend/GirasolesRes.API/Controllers/CobrosController.cs`)
- `GET /api/cobros/pendientes` (L:40)
  - **Autorización:** `[Authorize(Roles = "Cajero,Administrador")]`.
  - **Respuestas:** `200 OK` (Lista de pedidos entregados o listos pendientes de facturación).
- `POST /api/cobros` (L:70)
  - **Autorización:** `[Authorize(Roles = "Cajero,Administrador")]`.
  - **Entrada:** `CobrarPedidoRequest` (`PedidoId`, `MetodoPago`, `MontoRecibido`, `TipoComprobante`, `TipoDocumentoReceptor`, `NumeroDocumentoReceptor`, `NombreReceptor`, `DireccionReceptor`).
  - **Respuestas:** `200 OK` (Comprobante emitido, mesa liberada atómicamente); `400 BadRequest` (Vuelto negativo, falta de DNI/RUC cuando total ≥ 700); `409 Conflict` (Pedido ya pagado o caja cerrada).
- `GET /api/cobros/comprobantes/{ventaId:guid}` (L:122)
  - **Autorización:** `[Authorize(Roles = "Cajero,Administrador")]`.
  - **Respuestas:** `200 OK` (Datos del comprobante); `404 NotFound`.
- `GET /api/cobros/comprobantes/{ventaId:guid}/pdf` (L:146)
  - **Autorización:** `[Authorize(Roles = "Cajero,Administrador")]`.
  - **Respuestas:** `200 OK` (`application/pdf` del comprobante fiscal o ticket).

### 2.5 `ComandasController` (`backend/GirasolesRes.API/Controllers/ComandasController.cs`)
- `GET /api/comandas` (L:30)
  - **Autorización:** `[Authorize(Roles = "Cocinero,Administrador")]`.
  - **Respuestas:** `200 OK` (Comandas en estado Pendiente y EnPreparación con cronómetro de tiempo transcurrido).
- `PATCH /api/comandas/{id:guid}/estado` (L:55)
  - **Autorización:** `[Authorize(Roles = "Cocinero,Administrador")]`.
  - **Entrada:** `ActualizarEstadoComandaRequest` (`NuevoEstado`: EnPreparacion o Listo).
  - **Respuestas:** `200 OK`; `400 BadRequest` (Transición inválida).
- `POST /api/comandas/{id:guid}/deshacer` (L:101)
  - **Autorización:** `[Authorize(Roles = "Cocinero,Administrador")]`.
  - **Respuestas:** `200 OK` (Revierte estado si han pasado ≤ 60 segundos); `400 BadRequest` (MSG_125 si expiró el tiempo de gracia).

### 2.6 `ConsultasController` (`backend/GirasolesRes.API/Controllers/ConsultasController.cs`)
- `GET /api/consultas/dni/{dni}` (L:24)
  - **Autorización:** `[Authorize(Roles = "Cajero,Administrador")]`.
  - **Respuestas:** `200 OK` (`{ nombres, apellidoPaterno, apellidoMaterno }`); `404 NotFound`.
- `GET /api/consultas/ruc/{ruc}` (L:50)
  - **Autorización:** `[Authorize(Roles = "Cajero,Administrador")]`.
  - **Respuestas:** `200 OK` (`{ razonSocial, direccion, estado, condicion }`); `404 NotFound`.

### 2.7 `InicioController` (`backend/GirasolesRes.API/Controllers/InicioController.cs`)
- `GET /api/inicio` (L:40)
  - **Autorización:** `[Authorize]` (Responde datos según rol extraído del JWT).
  - **Respuestas:** `200 OK` (Métricas de Administrador, resumen de caja para Cajero, mesas/pedidos para Mozo, KDS para Cocinero).
- `GET /api/inicio/{bloque}` (L:75)
  - **Autorización:** `[Authorize]`.
  - **Respuestas:** `200 OK` (Refresco granular de bloques de interfaz).

### 2.8 `MenuDiaController` (`backend/GirasolesRes.API/Controllers/MenuDiaController.cs`)
- `GET /api/menu-dia` (L:30)
  - **Autorización:** `[Authorize(Roles = "Administrador,Cajero,Mozo,Cocinero")]`.
  - **Respuestas:** `200 OK` (Menú del día vigente con opciones agrupadas por rol de componente).
- `GET /api/menu-dia/candidatos` (L:58)
  - **Autorización:** `[Authorize(Roles = "Administrador")]`.
  - **Respuestas:** `200 OK` (Productos disponibles para armar la carta del día).
- `PUT /api/menu-dia` (L:80)
  - **Autorización:** `[Authorize(Roles = "Administrador")]`.
  - **Entrada:** `DefinirMenuDiaRequest` (`PlatosIds`, `MenusCompletosIds`).
  - **Respuestas:** `200 OK`; `400 BadRequest` (Debe incluir al menos un producto o menú).
- `PATCH /api/menu-dia/platos/{productoId:guid}/disponibilidad` (L:126)
  - **Autorización:** `[Authorize(Roles = "Administrador,Cocinero")]`.
  - **Entrada:** `ActualizarDisponibilidadRequest` (`Disponible`: bool).
  - **Respuestas:** `200 OK` (Marca plato agotado o restablece disponibilidad).

### 2.9 `MenusCompletosController` (`backend/GirasolesRes.API/Controllers/MenusCompletosController.cs`)
- `GET /api/menus-completos` (L:30)
  - **Autorización:** `[Authorize(Roles = "Administrador,Cajero,Mozo,Cocinero")]`.
  - **Respuestas:** `200 OK` (Lista de menús configurados: Desayuno completo, Almuerzo completo, Solo segundo).
- `PUT /api/menus-completos/{id:int}` (L:56)
  - **Autorización:** `[Authorize(Roles = "Administrador")]`.
  - **Entrada:** `ActualizarMenuCompletoRequest` (`Precio`, `Activo`).
  - **Respuestas:** `200 OK`; `400 BadRequest` (Precio fuera de rango S/ 1 a S/ 100).
- `PATCH /api/menus-completos/{id:int}/estado` (L:103)
  - **Autorización:** `[Authorize(Roles = "Administrador")]`.
  - **Entrada:** `CambiarEstadoMenuCompletoRequest` (`Activo`).
  - **Respuestas:** `200 OK`.

### 2.10 `MesasController` (`backend/GirasolesRes.API/Controllers/MesasController.cs`)
- `GET /api/mesas` (L:30)
  - **Autorización:** `[Authorize(Roles = "Administrador,Cajero,Mozo")]`.
  - **Respuestas:** `200 OK` (Lista de mesas del salón con estado Libre, Ocupada o Inactiva).
- `GET /api/mesas/{id:guid}` (L:80)
  - **Autorización:** `[Authorize(Roles = "Administrador,Cajero,Mozo")]`.
  - **Respuestas:** `200 OK`; `404 NotFound`.
- `POST /api/mesas` (L:105)
  - **Autorización:** `[Authorize(Roles = "Administrador")]`.
  - **Entrada:** `CrearMesaRequest` (`Nombre`, `Capacidad`).
  - **Respuestas:** `201 Created`; `400 BadRequest`; `409 Conflict` (Nombre duplicado).
- `PUT /api/mesas/{id:guid}` (L:160)
  - **Autorización:** `[Authorize(Roles = "Administrador")]`.
  - **Entrada:** `ActualizarMesaRequest` (`Nombre`, `Capacidad`).
  - **Respuestas:** `200 OK`; `409 Conflict` (Duplicado o mesa ocupada).
- `PATCH /api/mesas/{id:guid}/estado` (L:218)
  - **Autorización:** `[Authorize(Roles = "Administrador")]`.
  - **Entrada:** `CambiarEstadoMesaRequest` (`Activa`: bool).
  - **Respuestas:** `200 OK`; `409 Conflict` (Prohibido desactivar mesa ocupada).

### 2.11 `PedidosController` (`backend/GirasolesRes.API/Controllers/PedidosController.cs`)
- `POST /api/pedidos/mesa` (L:31)
  - **Autorización:** `[Authorize(Roles = "Mozo,Administrador")]`.
  - **Entrada:** `RegistrarPedidoMesaRequest` (`MesaId`, `Lineas`).
  - **Respuestas:** `201 Created` (Comanda generada automáticamente); `409 Conflict` (Plato agotado o mesa inactiva).
- `POST /api/pedidos/llevar` (L:95)
  - **Autorización:** `[Authorize(Roles = "Cajero,Administrador")]`.
  - **Entrada:** `RegistrarPedidoLlevarRequest` (`NombreCliente`, `Lineas`).
  - **Respuestas:** `201 Created`.
- `GET /api/pedidos` (L:155)
  - **Autorización:** `[Authorize(Roles = "Mozo,Cajero,Administrador")]`.
  - **Respuestas:** `200 OK` (Lista filtrable por estado y tipo).
- `GET /api/pedidos/{id:guid}` (L:186)
  - **Autorización:** `[Authorize(Roles = "Mozo,Cajero,Administrador")]`.
  - **Respuestas:** `200 OK` (Detalle con desglose de opciones y comandas).
- `PUT /api/pedidos/{id:guid}` (L:209)
  - **Autorización:** `[Authorize(Roles = "Mozo,Cajero,Administrador")]`.
  - **Entrada:** `ModificarPedidoRequest`.
  - **Respuestas:** `200 OK`; `409 Conflict` (No se puede modificar si cocina ya inició la preparación).
- `POST /api/pedidos/{id:guid}/anular` (L:274)
  - **Autorización:** `[Authorize(Roles = "Mozo,Cajero,Administrador")]`.
  - **Entrada:** `AnularPedidoRequest` (`Motivo`).
  - **Respuestas:** `200 OK`; `403 Forbidden` (Mozo solo puede anular antes de cocina; Administrador en cualquier momento no pagado).
- `POST /api/pedidos/{id:guid}/lineas` (L:339)
  - **Autorización:** `[Authorize(Roles = "Mozo,Administrador")]`.
  - **Entrada:** `AgregarLineasPedidoRequest`.
  - **Respuestas:** `200 OK` (Genera comanda adicional para cocina).
- `GET /api/pedidos/mesa/{mesaId:guid}/activo` (L:405)
  - **Autorización:** `[Authorize(Roles = "Mozo,Cajero,Administrador")]`.
  - **Respuestas:** `200 OK` (Pedido en curso en la mesa).
- `GET /api/pedidos/catalogo-pedido` (L:420)
  - **Autorización:** `[Authorize(Roles = "Mozo,Cajero,Administrador")]`.
  - **Respuestas:** `200 OK` (Catálogo habilitado para armar pedidos).

### 2.12 `PerfilController` (`backend/GirasolesRes.API/Controllers/PerfilController.cs`)
- `PUT /api/perfil/contrasena` (L:29)
  - **Autorización:** `[Authorize]`.
  - **Entrada:** `CambiarContrasenaRequest` (`ContrasenaActual`, `NuevaContrasena`).
  - **Respuestas:** `200 OK`; `400 BadRequest` (Contraseña actual errónea o requisitos no cumplidos).

### 2.13 `ProductosController` (`backend/GirasolesRes.API/Controllers/ProductosController.cs`)
- `GET /api/productos` (L:29) — `[Authorize(Roles = "Administrador")]`.
- `GET /api/productos/{id:guid}` (L:79) — `[Authorize(Roles = "Administrador")]`.
- `POST /api/productos` (L:99) — `[Authorize(Roles = "Administrador")]`.
- `PUT /api/productos/{id:guid}` (L:152) — `[Authorize(Roles = "Administrador")]`.
- `PATCH /api/productos/{id:guid}/estado` (L:215) — `[Authorize(Roles = "Administrador")]`.
- `GET /api/productos/disponibles` (L:248) — `[Authorize(Roles = "Administrador,Cajero,Mozo,Cocinero")]`.

### 2.14 `ReportesController` (`backend/GirasolesRes.API/Controllers/ReportesController.cs`)
- `GET /api/reportes/ventas` (L:52) — `[Authorize(Roles = "Administrador")]`.
- `GET /api/reportes/platos` (L:86) — `[Authorize(Roles = "Administrador")]`.
- `GET /api/reportes/ventas/exportar` (L:125) — `[Authorize(Roles = "Administrador")]` (Descarga PDF/Excel).
- `GET /api/reportes/platos/exportar` (L:173) — `[Authorize(Roles = "Administrador")]`.

### 2.15 `UsuariosController` (`backend/GirasolesRes.API/Controllers/UsuariosController.cs`)
- `GET /api/usuarios` (L:28) — `[Authorize(Roles = "Administrador")]`.
- `GET /api/usuarios/{id:guid}` (L:73) — `[Authorize(Roles = "Administrador")]`.
- `POST /api/usuarios` (L:92) — `[Authorize(Roles = "Administrador")]`.
- `PUT /api/usuarios/{id:guid}` (L:153) — `[Authorize(Roles = "Administrador")]`.
- `PATCH /api/usuarios/{id:guid}/estado` (L:225) — `[Authorize(Roles = "Administrador")]`.
- `DELETE /api/usuarios/{id:guid}` (L:285) — `[Authorize(Roles = "Administrador")]` (Solo si no tiene movimientos registrados).

### 2.16 `VentasController` (`backend/GirasolesRes.API/Controllers/VentasController.cs`)
- `GET /api/ventas` (L:60) — `[Authorize(Roles = "Cajero,Administrador")]`.
- `GET /api/ventas/{id:guid}` (L:94) — `[Authorize(Roles = "Cajero,Administrador")]`.
- `POST /api/ventas/{id:guid}/anular` (L:118) — `[Authorize(Roles = "Administrador")]` (Motivo obligatorio).
- `GET /api/ventas/{id:guid}/ticket` (L:159) — `[Authorize(Roles = "Cajero,Administrador")]` (PDF vectorial).
