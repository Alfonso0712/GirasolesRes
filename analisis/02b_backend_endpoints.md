# Endpoints de la API Backend (GirasolesRes)

Este documento detalla la totalidad de los controladores REST y sus endpoints expuestos en `backend/GirasolesRes.API/Controllers/`, con cita textual de archivo, línea de código, atributos de autorización, DTOs de entrada y códigos HTTP de respuesta.

---

## 1. Resumen General de Controladores

| Controlador | Archivo | Cantidad de Endpoints | Área Funcional |
|---|---|:---:|---|
| `AuthController` | `Controllers/AuthController.cs` | 6 | Autenticación, sesión, logout y recuperación |
| `AvisosController` | `Controllers/AvisosController.cs` | 2 | Notificaciones y avisos de comandas listas |
| `CajaController` | `Controllers/CajaController.cs` | 8 | Apertura, cierre, arqueo, historial y PDF de caja |
| `CobrosController` | `Controllers/CobrosController.cs` | 4 | Procesamiento de cobro (Cajero), comprobantes y PDF |
| `ComandasController` | `Controllers/ComandasController.cs` | 3 | KDS de cocina, avance de estados y deshacer |
| `ConsultasController` | `Controllers/ConsultasController.cs` | 2 | Consulta de DNI y RUC con padrón SUNAT/RENIEC |
| `InicioController` | `Controllers/InicioController.cs` | 2 | Dashboard y paneles de inicio por rol |
| `MenuDiaController` | `Controllers/MenuDiaController.cs` | 4 | Menú del día, opciones, platos agotados |
| `MenusCompletosController` | `Controllers/MenusCompletosController.cs` | 4 | Configuración, precios y estado de menús completos |
| `MesasController` | `Controllers/MesasController.cs` | 5 | Salón, CRUD de mesas, cambio de estado |
| `PedidosController` | `Controllers/PedidosController.cs` | 9 | Pedidos de mesa y para llevar, líneas, anulación, activos por mesa |
| `PerfilController` | `Controllers/PerfilController.cs` | 2 | Cambio de contraseña y preferencia de tema visual |
| `ProductosController` | `Controllers/ProductosController.cs` | 6 | Carta, catálogo, productos activos/agotados |
| `ReportesController` | `Controllers/ReportesController.cs` | 4 | Ventas por rango, platos más vendidos, exportación |
| `UsuariosController` | `Controllers/UsuariosController.cs` | 6 | Gestión de personal, cuentas y roles |
| `VentasController` | `Controllers/VentasController.cs` | 4 | Historial de ventas, anulación y ticket |

*Total Endpoints Implementados:* **71 acciones HTTP en 16 controladores**.

---

## 2. Detalle Exhaustivo por Controlador

### 2.1 `AuthController` (`backend/GirasolesRes.API/Controllers/AuthController.cs`)
- `POST /api/auth/login` (L:29)
  - **Autorización:** Anónimo.
  - **Entrada:** `LoginRequest` (`Usuario`, `Contrasena`).
  - **Respuestas:** `200 OK` (`LoginResponse`: token JWT, rol, nombre, preferencia de tema); `400 BadRequest` (MSG_01, MSG_02, MSG_03); `401 Unauthorized` (MSG_04); `403 Forbidden` (MSG_05); `423 Locked` (MSG_06).
- `POST /api/auth/forgot-password` (L:104)
  - **Autorización:** Anónimo.
  - **Entrada:** `ForgotPasswordRequest` (`Correo`).
  - **Respuestas:** `200 OK` (MSG_11 genérico para evitar enumeración); `400 BadRequest` (MSG_10).
- `POST /api/auth/reset-password` (L:152)
  - **Autorización:** Anónimo.
  - **Entrada:** `ResetPasswordRequest` (`Correo`, `Codigo`, `NuevaContrasena`).
  - **Respuestas:** `200 OK` (MSG_16); `400 BadRequest` (MSG_13, MSG_14, MSG_15).
- `GET /api/auth/me` (L:200)
  - **Autorización:** `[Authorize]` (Cualquier rol autenticado).
  - **Respuestas:** `200 OK` (Datos del usuario extraídos de los Claims del JWT: id, nombre, usuario, rol, tema).
- `POST /api/auth/logout` (L:225)
  - **Autorización:** `[Authorize]`.
  - **Entrada:** `LogoutRequest?` (`Motivo`).
  - **Respuestas:** `200 OK` (Token agregado a lista negra `TokenRevocadoRepository`).
- `POST /api/auth/renovar` (L:262)
  - **Autorización:** `[Authorize]`.
  - **Respuestas:** `200 OK` (Nuevo token JWT renovado por 30 minutos).

### 2.2 `AvisosController` (`backend/GirasolesRes.API/Controllers/AvisosController.cs`)
- `GET /api/avisos` (L:28)
  - **Autorización:** `[Authorize]` (Roles: `Mozo`, `Administrador`).
  - **Respuestas:** `200 OK` (Lista `AvisoComandaDto[]` con avisos de comandas listas para servir).
- `POST /api/avisos/{id:guid}/visto` (L:60)
  - **Autorización:** `[Authorize]` (Roles: `Mozo`, `Administrador`).
  - **Respuestas:** `200 OK`; `404 NotFound`.

### 2.3 `CajaController` (`backend/GirasolesRes.API/Controllers/CajaController.cs`)
- `GET /api/caja/actual` (L:34)
  - **Autorización:** `[Authorize]` (Roles: `Cajero`, `Administrador`).
  - **Respuestas:** `200 OK` (`CajaActualDto`: estado de jornada, total efectivo, total Yape, cantidad de ventas).
- `POST /api/caja/abrir` (L:66)
  - **Autorización:** `[Authorize]` (Roles: `Cajero`).
  - **Entrada:** `AbrirCajaRequestDto` (`MontoInicial`).
  - **Respuestas:** `200 OK`; `400 BadRequest` (Monto negativo o superior a S/ 5000); `409 Conflict` (Ya existe caja abierta).
- `GET /api/caja/cierre/resumen` (L:176)
  - **Autorización:** `[Authorize]` (Roles: `Cajero`).
  - **Respuestas:** `200 OK` (`ResumenCierreDto`: pre-cierre con arqueo teórico calculado por el sistema).
- `POST /api/caja/cerrar` (L:209)
  - **Autorización:** `[Authorize]` (Roles: `Cajero`).
  - **Entrada:** `CerrarCajaRequestDto` (`MontoEfectivoReal`, `Observaciones`).
  - **Respuestas:** `200 OK` (Cierre efectuado y descuadre calculado); `409 Conflict` (Pedidos pendientes sin cobrar o comandas abiertas).
- `GET /api/caja/cierres` (L:367)
  - **Autorización:** `[Authorize]` (Roles: `Administrador`).
  - **Parámetros:** `fechaInicio`, `fechaFin`, `cajeroId`, `pagina`, `tamano`.
  - **Respuestas:** `200 OK` (`HistorialCierresPaginadoDto`: historial paginado de turnos y cierres de caja).
- `GET /api/caja/cierres/{id:guid}` (L:459)
  - **Autorización:** `[Authorize]` (Roles: `Administrador`).
  - **Respuestas:** `200 OK` (`CierreDetalleDto`: detalle de cierre, platos vendidos y ajustes posteriores); `404 NotFound`.
- `GET /api/caja/cierres/{id:guid}/pdf` (L:490)
  - **Autorización:** `[Authorize]` (Roles: `Cajero`, `Administrador`).
  - **Respuestas:** `200 OK` (`application/pdf` con acta de cierre generada por `PdfCanvasBuilder`).
- `GET /api/caja/estado` (L:530)
  - **Autorización:** `[Authorize]` (Roles: `Cajero`, `Administrador`).
  - **Respuestas:** `200 OK` (`{ abierta: bool, cajaId: Guid? }`).

### 2.4 `CobrosController` (`backend/GirasolesRes.API/Controllers/CobrosController.cs`)
- `GET /api/cobros/pendientes` (L:52)
  - **Autorización:** `[Authorize]` (Roles: `Cajero`, `Administrador`).
  - **Respuestas:** `200 OK` (`PedidoPendienteCobroDto[]`: lista de pedidos listos o entregados pendientes de facturación).
- `POST /api/cobros` (L:82)
  - **Autorización:** `[Authorize]` (Rol estricto: `Cajero` por RBAC).
  - **Entrada:** `CobroRequest` (`PedidoId`, `Metodo`, `MontoRecibido`, `TotalMostrado`, `TipoComprobante`, `TipoDocReceptor`, `NumDocReceptor`, `RazonSocialReceptor`, `DireccionReceptor`).
  - **Respuestas:** `200 OK` (`CobroResponseDto`: comprobante emitido, mesa liberada si no quedan otros pedidos activos); `400 BadRequest` (Monto insuficiente, RUC inválido); `403 Forbidden` (Si el rol no es Cajero); `409 Conflict` (Pedido ya pagado o caja cerrada).
- `GET /api/cobros/comprobantes/{ventaId:guid}` (L:134)
  - **Autorización:** `[Authorize]` (Roles: `Cajero`, `Administrador`).
  - **Parámetros:** `copia` (bool).
  - **Respuestas:** `200 OK` (`ComprobanteDetalleDto`); `404 NotFound`.
- `GET /api/cobros/comprobantes/{ventaId:guid}/pdf` (L:158)
  - **Autorización:** `[Authorize]` (Roles: `Cajero`, `Administrador`).
  - **Parámetros:** `copia` (bool).
  - **Respuestas:** `200 OK` (`application/pdf` del comprobante de pago electrónico en formato ticket 80mm).

### 2.5 `ComandasController` (`backend/GirasolesRes.API/Controllers/ComandasController.cs`)
- `GET /api/comandas` (L:29)
  - **Autorización:** `[Authorize]` (Roles: `Cocinero`, `Administrador`).
  - **Parámetros:** `estado` (Pendiente, EnPreparacion, Lista).
  - **Respuestas:** `200 OK` (`ListarComandasResponseDto`: comandas activas con cálculo de demora `>= 15 min`).
- `PATCH /api/comandas/{id:guid}/estado` (L:54)
  - **Autorización:** `[Authorize]` (Roles: `Cocinero`, `Administrador`).
  - **Entrada:** `ActualizarEstadoComandaRequest` (`NuevoEstado`: EnPreparacion o Listo).
  - **Respuestas:** `200 OK`; `400 BadRequest` (Transición inválida); `404 NotFound`.
- `POST /api/comandas/{id:guid}/deshacer` (L:100)
  - **Autorización:** `[Authorize]` (Roles: `Cocinero`, `Administrador`).
  - **Respuestas:** `200 OK` (Revierte estado si han pasado ≤ 60 segundos según `RestauranteConstantes.SegundosVentanaDeshacerComanda`); `400 BadRequest` (MSG_125 si expiró el tiempo de gracia).

### 2.6 `ConsultasController` (`backend/GirasolesRes.API/Controllers/ConsultasController.cs`)
- `GET /api/consultas/dni/{dni}` (L:23)
  - **Autorización:** `[Authorize]` (Roles: `Cajero`, `Administrador`).
  - **Respuestas:** `200 OK` (`ConsultaDniResponseDto`: `{ nombres, apellidoPaterno, apellidoMaterno }`); `400 BadRequest`; `404 NotFound`.
- `GET /api/consultas/ruc/{ruc}` (L:49)
  - **Autorización:** `[Authorize]` (Roles: `Cajero`, `Administrador`).
  - **Respuestas:** `200 OK` (`ConsultaRucResponseDto`: `{ razonSocial, direccion, estado, condicion }`); `400 BadRequest`; `404 NotFound`.

### 2.7 `InicioController` (`backend/GirasolesRes.API/Controllers/InicioController.cs`)
- `GET /api/inicio` (L:39)
  - **Autorización:** `[Authorize]` (Responde datos según rol extraído del JWT: Mozo, Cajero, Cocinero, Administrador).
  - **Respuestas:** `200 OK` (`InicioDto`: KPIs gerenciales, estado de caja, comandas activas, alertas condicionales).
- `GET /api/inicio/{bloque}` (L:74)
  - **Autorización:** `[Authorize]`.
  - **Respuestas:** `200 OK` (`BloqueInicioDto`: refresco granular de alertas, métricas o estado).

### 2.8 `MenuDiaController` (`backend/GirasolesRes.API/Controllers/MenuDiaController.cs`)
- `GET /api/menu-dia` (L:28)
  - **Autorización:** `[Authorize]` (Roles: `Administrador`, `Cajero`, `Mozo`, `Cocinero`).
  - **Respuestas:** `200 OK` (`MenuDiaResponseDto`: fecha operativa, platos agrupados por rol, estado de publicación).
- `GET /api/menu-dia/candidatos` (L:50)
  - **Autorización:** `[Authorize]` (Roles: `Administrador`).
  - **Respuestas:** `200 OK` (`CandidatosMenuDiaResponseDto`: productos disponibles para armar la carta del día).
- `PUT /api/menu-dia/hoy` (L:72)
  - **Autorización:** `[Authorize]` (Roles: `Administrador`).
  - **Entrada:** `GuardarMenuDiaRequest` (`DesayunoId`, `EntradasIds`, `SopasIds`, `SegundosIds`).
  - **Respuestas:** `200 OK`; `400 BadRequest`.
- `PATCH /api/menu-dia/hoy/platos/{productoId:guid}/disponibilidad` (L:102)
  - **Autorización:** `[Authorize]` (Roles: `Administrador`, `Cocinero`).
  - **Entrada:** `ActualizarDisponibilidadPlatoRequest` (`Disponible`: bool).
  - **Respuestas:** `200 OK` (Marca plato agotado o restablece disponibilidad).

### 2.9 `MenusCompletosController` (`backend/GirasolesRes.API/Controllers/MenusCompletosController.cs`)
- `GET /api/menus-completos` (L:29)
  - **Autorización:** `[Authorize]` (Roles: `Administrador`, `Cajero`, `Mozo`, `Cocinero`).
  - **Parámetros:** `soloActivos` (bool?).
  - **Respuestas:** `200 OK` (`MenuCompletoDto[]`: Desayuno completo, Almuerzo completo, Solo segundo).
- `GET /api/menus-completos/{id:int}` (L:67)
  - **Autorización:** `[Authorize]` (Roles: `Administrador`).
  - **Respuestas:** `200 OK` (`MenuCompletoDto`); `404 NotFound`.
- `PUT /api/menus-completos/{id:int}` (L:87)
  - **Autorización:** `[Authorize]` (Roles: `Administrador`).
  - **Entrada:** `ActualizarPrecioMenuCompletoRequest` (`Precio`).
  - **Respuestas:** `200 OK`; `400 BadRequest` (Precio fuera de rango S/ 1 a S/ 100).
- `PATCH /api/menus-completos/{id:int}/estado` (L:132)
  - **Autorización:** `[Authorize]` (Roles: `Administrador`).
  - **Entrada:** `CambiarEstadoMenuCompletoRequest` (`Activo`).
  - **Respuestas:** `200 OK`.

### 2.10 `MesasController` (`backend/GirasolesRes.API/Controllers/MesasController.cs`)
- `GET /api/mesas` (L:28)
  - **Autorización:** `[Authorize]` (Roles: `Administrador`, `Cajero`, `Mozo`).
  - **Parámetros:** `ocupacion`, `soloActivas`.
  - **Respuestas:** `200 OK` (`MesaDto[]`: lista de mesas con ordenamiento natural: Mesa 1, Mesa 2, Mesa 10).
- `GET /api/mesas/resumen` (L:67)
  - **Autorización:** `[Authorize]` (Roles: `Administrador`, `Cajero`, `Mozo`).
  - **Respuestas:** `200 OK` (`ResumenMesasDto`: total, libres, ocupadas, inactivas).
- `POST /api/mesas` (L:88)
  - **Autorización:** `[Authorize]` (Roles: `Administrador`).
  - **Entrada:** `CrearMesaRequest` (`Nombre`: máx. 20 caracteres RV-168 / D-008).
  - **Respuestas:** `201 Created` (`MesaDto`); `400 BadRequest` (MSG_81, MSG_82); `409 Conflict` (MSG_83 nombre duplicado).
- `PUT /api/mesas/{id:guid}` (L:169)
  - **Autorización:** `[Authorize]` (Roles: `Administrador`).
  - **Entrada:** `ActualizarMesaRequest` (`Nombre`: máx. 20 caracteres).
  - **Respuestas:** `200 OK` (`MesaDto`); `400 BadRequest`; `409 Conflict` (Duplicado MSG_83 o mesa ocupada).
- `PATCH /api/mesas/{id:guid}/estado` (L:259)
  - **Autorización:** `[Authorize]` (Roles: `Administrador`).
  - **Entrada:** `CambiarEstadoMesaRequest` (`Activa`: bool).
  - **Respuestas:** `200 OK`; `409 Conflict` (Prohibido desactivar mesa ocupada con pedidos pendientes).

### 2.11 `PedidosController` (`backend/GirasolesRes.API/Controllers/PedidosController.cs`)
- `POST /api/pedidos/mesa` (L:30)
  - **Autorización:** `[Authorize]` (Roles: `Mozo`, `Administrador`).
  - **Entrada:** `RegistrarPedidoMesaRequest` (`SolicitudId`, `MesaId`, `Lineas`, `Notas`).
  - **Respuestas:** `201 Created` (`RegistrarPedidoResultDto`: comanda generada automáticamente); `409 Conflict` (Plato agotado o mesa inactiva). Nota: Mesas ocupadas aceptan pedidos adicionales independientes (RN-46).
- `POST /api/pedidos/llevar` (L:94)
  - **Autorización:** `[Authorize]` (Rol estricto: `Cajero` por RBAC).
  - **Entrada:** `RegistrarPedidoLlevarRequest` (`SolicitudId`, `Referencia`, `Lineas`).
  - **Respuestas:** `201 Created` (`RegistrarPedidoLlevarResultDto`); `403 Forbidden` (Si el rol no es Cajero).
- `GET /api/pedidos` (L:153)
  - **Autorización:** `[Authorize]` (Roles: `Mozo`, `Cajero`, `Administrador`).
  - **Parámetros:** `Fecha`, `Estado`, `Tipo`, `MesaId`, `SoloMios`, `Pagina`, `Tamano`.
  - **Respuestas:** `200 OK` (`ListarPedidosResponseDto`: lista paginada y resumen de contadores por estado derivado dual: ej. "Listo · Pagado").
- `GET /api/pedidos/{id:guid}` (L:184)
  - **Autorización:** `[Authorize]` (Roles: `Mozo`, `Cajero`, `Administrador`).
  - **Respuestas:** `200 OK` (`DetallePedidoCompletoDto`: líneas, elecciones de menú completo, comandas asociadas); `404 NotFound`.
- `PUT /api/pedidos/{id:guid}` (L:207)
  - **Autorización:** `[Authorize]` (Roles: `Mozo`, `Cajero`, `Administrador`).
  - **Entrada:** `ModificarPedidoRequest` (`Lineas`).
  - **Respuestas:** `200 OK`; `403 Forbidden` (Solo quien registró); `409 Conflict` (No modificable si comanda ya inició preparación).
- `POST /api/pedidos/{id:guid}/anular` (L:272)
  - **Autorización:** `[Authorize]` (Roles: `Mozo`, `Cajero`, `Administrador`).
  - **Entrada:** `AnularPedidoRequest` (`SolicitudId`, `Motivo`: 5 a 100 caracteres).
  - **Respuestas:** `200 OK`; `403 Forbidden` (Mozo solo antes de cocina; Administrador en cualquier momento mientras no esté pagado, según RN-65).
- `POST /api/pedidos/{id:guid}/lineas` (L:337)
  - **Autorización:** `[Authorize]` (Roles: `Mozo`, `Administrador`).
  - **Entrada:** `AgregarLineasPedidoRequest` (`SolicitudId`, `Lineas`).
  - **Respuestas:** `200 OK` (`AgregarLineasResultDto`: genera comanda adicional para cocina).
- `GET /api/pedidos/mesa/{mesaId:guid}/activo` (L:403)
  - **Autorización:** `[Authorize]` (Roles: `Mozo`, `Cajero`, `Administrador`).
  - **Respuestas:** `200 OK` (`PedidoAbiertoMesaDto[]`: lista de todos los pedidos abiertos de la mesa con `id`, `numero`, `estado` y `total` para alimentar el diálogo `MSG-95`).
- `GET /api/pedidos/catalogo-pedido` (L:413)
  - **Autorización:** `[Authorize]` (Roles: `Mozo`, `Cajero`, `Administrador`).
  - **Respuestas:** `200 OK` (`ProductoMenuPedidoDto[]`: catálogo habilitado para armar pedidos).

### 2.12 `PerfilController` (`backend/GirasolesRes.API/Controllers/PerfilController.cs`)
- `PUT /api/perfil/contrasena` (L:28)
  - **Autorización:** `[Authorize]` (Cualquier usuario autenticado).
  - **Entrada:** `CambiarContrasenaPropiaRequest` (`ContrasenaActual`, `NuevaContrasena`, `ConfirmarContrasena`).
  - **Respuestas:** `200 OK`; `400 BadRequest` (Contraseña actual incorrecta, longitud menor a 8 caracteres, complejidad PBKDF2).
- `PATCH /api/perfil/tema` (L:158)
  - **Autorización:** `[Authorize]` (Cualquier usuario autenticado).
  - **Entrada:** `ActualizarTemaRequest` (`Tema`: "light" | "dark").
  - **Respuestas:** `200 OK` (`{ mensaje: string, tema: string }`); `400 BadRequest` (Tema no soportado).

### 2.13 `ProductosController` (`backend/GirasolesRes.API/Controllers/ProductosController.cs`)
- `GET /api/productos` (L:27)
  - **Autorización:** `[Authorize]` (Roles: `Administrador`).
  - **Parámetros:** `categoria`, `soloActivos`, `buscar`, `tipo`.
  - **Respuestas:** `200 OK` (`ProductoDto[]`).
- `GET /api/productos/{id:guid}` (L:77)
  - **Autorización:** `[Authorize]` (Roles: `Administrador`).
  - **Respuestas:** `200 OK` (`ProductoDto`); `404 NotFound`.
- `POST /api/productos` (L:97)
  - **Autorización:** `[Authorize]` (Roles: `Administrador`).
  - **Entrada:** `CrearProductoRequest` (`Nombre`, `Tipo`, `Categoria`, `RolComponente`, `Precio`, `Agotado`).
  - **Respuestas:** `201 Created` (`ProductoDto`); `400 BadRequest`; `409 Conflict` (Nombre duplicado).
- `PUT /api/productos/{id:guid}` (L:150)
  - **Autorización:** `[Authorize]` (Roles: `Administrador`).
  - **Entrada:** `ActualizarProductoRequest` (`Nombre`, `Tipo`, `Categoria`, `RolComponente`, `Precio`, `Agotado`).
  - **Respuestas:** `200 OK` (`ProductoDto`); `400 BadRequest`; `409 Conflict`.
- `PATCH /api/productos/{id:guid}/estado` (L:213)
  - **Autorización:** `[Authorize]` (Roles: `Administrador`).
  - **Entrada:** `CambiarEstadoProductoRequest` (`Activo`: bool).
  - **Respuestas:** `200 OK`.
- `GET /api/productos/disponibles` (L:246)
  - **Autorización:** `[Authorize]` (Roles: `Administrador`, `Cajero`, `Mozo`, `Cocinero`).
  - **Respuestas:** `200 OK` (`ProductoDto[]`: productos activos y no agotados).

### 2.14 `ReportesController` (`backend/GirasolesRes.API/Controllers/ReportesController.cs`)
- `GET /api/reportes/ventas` (L:51)
  - **Autorización:** `[Authorize]` (Roles: `Administrador`).
  - **Parámetros:** `fechaInicio`, `fechaFin`.
  - **Respuestas:** `200 OK` (`ReporteVentasResponseDto`: total ventas, efectivo, Yape, resumen de anulaciones, desglose diario).
- `GET /api/reportes/platos` (L:85)
  - **Autorización:** `[Authorize]` (Roles: `Administrador`).
  - **Parámetros:** `fechaInicio`, `fechaFin`.
  - **Respuestas:** `200 OK` (`ReportePlatosResponseDto`: ranking de platos más vendidos con cantidad y monto).
- `GET /api/reportes/ventas/exportar` (L:124)
  - **Autorización:** `[Authorize]` (Roles: `Administrador`).
  - **Parámetros:** `fechaInicio`, `fechaFin`, `formato` (pdf | excel).
  - **Respuestas:** `200 OK` (`application/pdf` o `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`).
- `GET /api/reportes/platos/exportar` (L:172)
  - **Autorización:** `[Authorize]` (Roles: `Administrador`).
  - **Parámetros:** `fechaInicio`, `fechaFin`, `formato` (pdf | excel).
  - **Respuestas:** `200 OK` (`application/pdf` o Excel binario).

### 2.15 `UsuariosController` (`backend/GirasolesRes.API/Controllers/UsuariosController.cs`)
- `GET /api/usuarios` (L:27)
  - **Autorización:** `[Authorize(Roles = "Administrador")]`.
  - **Parámetros:** `rol`, `activo`, `buscar`, `pagina`, `tamano`.
  - **Respuestas:** `200 OK` (`PaginacionUsuariosResponse`: lista paginada de usuarios).
- `GET /api/usuarios/{id:guid}` (L:72)
  - **Autorización:** `[Authorize(Roles = "Administrador")]`.
  - **Respuestas:** `200 OK` (`UsuarioResponseDto`); `404 NotFound`.
- `POST /api/usuarios` (L:91)
  - **Autorización:** `[Authorize(Roles = "Administrador")]`.
  - **Entrada:** `CrearUsuarioRequest` (`Nombre`, `Username`, `Email`, `Password`, `Rol`).
  - **Respuestas:** `201 Created` (`UsuarioResponseDto`); `400 BadRequest` (MSG_17, MSG_18, MSG_19, MSG_20); `409 Conflict` (MSG_24 username/correo duplicado).
- `PUT /api/usuarios/{id:guid}` (L:152)
  - **Autorización:** `[Authorize(Roles = "Administrador")]`.
  - **Entrada:** `ActualizarUsuarioRequest` (`Nombre`, `Username`, `Email`, `Password` opcional, `Rol`).
  - **Respuestas:** `200 OK` (`UsuarioResponseDto`); `400 BadRequest`; `409 Conflict`.
- `PATCH /api/usuarios/{id:guid}/estado` (L:224)
  - **Autorización:** `[Authorize(Roles = "Administrador")]`.
  - **Entrada:** `CambiarEstadoRequest` (`Activo`: bool).
  - **Respuestas:** `200 OK`; `400 BadRequest` (MSG_30 auto-desactivación del propio administrador bloqueada).
- `DELETE /api/usuarios/{id:guid}` (L:284)
  - **Autorización:** `[Authorize(Roles = "Administrador")]`.
  - **Respuestas:** `200 OK`; `400 BadRequest` (MSG_30 auto-eliminación); `409 Conflict` (MSG_32 si el usuario tiene transacciones o pedidos asociados; en tal caso solo permite desactivación lógica).

### 2.16 `VentasController` (`backend/GirasolesRes.API/Controllers/VentasController.cs`)
- `GET /api/ventas` (L:59)
  - **Autorización:** `[Authorize]` (Roles: `Cajero`, `Administrador`).
  - **Parámetros:** `fechaInicio`, `fechaFin`, `cajeroId`, `tipoComprobante`, `estado`, `pagina`, `tamano`.
  - **Respuestas:** `200 OK` (`ListarVentasPaginadasDto`: historial paginado con filtros).
- `GET /api/ventas/{id:guid}` (L:93)
  - **Autorización:** `[Authorize]` (Roles: `Cajero`, `Administrador`).
  - **Respuestas:** `200 OK` (`VentaDetalleDto`: detalle de la venta, comprobante, comanda y líneas); `404 NotFound`.
- `POST /api/ventas/{id:guid}/anular` (L:117)
  - **Autorización:** `[Authorize]` (Rol estricto: `Administrador`).
  - **Entrada:** `AnularVentaRequest` (`SolicitudId`, `Motivo`: 5 a 100 caracteres).
  - **Respuestas:** `200 OK` (Venta anulada, comprobante marcado anulado); `400 BadRequest` (MSG_100, MSG_101); `403 Forbidden` (Solo Administrador); `409 Conflict` (Caja ya cerrada o venta ya anulada).
- `GET /api/ventas/{id:guid}/ticket` (L:158)
  - **Autorización:** `[Authorize]` (Roles: `Cajero`, `Administrador`).
  - **Respuestas:** `200 OK` (`application/pdf` con ticket térmico de 80mm generado por `PdfCanvasBuilder`).
