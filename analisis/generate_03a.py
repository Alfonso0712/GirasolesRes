import json
import csv
from pathlib import Path

ANALISIS_DIR = Path(r"e:\Downloads\GirasolesRes\analisis")

trace_data = [
    {
        "hu": "HU01", "rf": "RF-01", "cus": "CUS01.1", "nombre": "Iniciar sesión",
        "endpoints": "POST /api/auth/login",
        "servicios": "AuthService.IniciarSesionAsync (AuthService.cs:40)",
        "entidades": "Usuario, RegistroIngreso, AuditoriaUsuario",
        "pantallas": "LoginPage.tsx",
        "mensajes": "MSG-01 a MSG-08",
        "pruebas": "UsuarioServiceUnitTests.cs, EmpiricalChallengeIteration2Tests.cs",
        "estado": "IMPLEMENTADO",
        "evidencia": "AuthController.cs:28 -> AuthService.cs:40; hash PBKDF2 100k iter, JWT 30 min, bloqueo a los 5 intentos"
    },
    {
        "hu": "HU02", "rf": "RF-02", "cus": "CUS02.2", "nombre": "Registrar usuario",
        "endpoints": "POST /api/usuarios",
        "servicios": "UsuarioService.RegistrarUsuarioAsync (UsuarioService.cs:45)",
        "entidades": "Usuario, AuditoriaUsuario",
        "pantallas": "UsersPage.tsx, UserFormModal.tsx",
        "mensajes": "MSG-19, MSG-21, MSG-22, MSG-23",
        "pruebas": "UsuarioServiceUnitTests.cs",
        "estado": "IMPLEMENTADO",
        "evidencia": "UsuariosController.cs:92 -> UsuarioService.cs:45; valida nombre, usuario único, correo, rol y hash de contraseña"
    },
    {
        "hu": "HU03", "rf": "RF-03", "cus": "CUS02.1", "nombre": "Listar y buscar usuarios",
        "endpoints": "GET /api/usuarios, GET /api/usuarios/{id}",
        "servicios": "UsuarioService.ListarUsuariosAsync (UsuarioService.cs:25)",
        "entidades": "Usuario",
        "pantallas": "UsersPage.tsx",
        "mensajes": "MSG-34, MSG-35",
        "pruebas": "UsuarioServiceUnitTests.cs",
        "estado": "IMPLEMENTADO",
        "evidencia": "UsuariosController.cs:28 -> UsuarioService.cs:25; paginación, filtros por rol y estado, búsqueda por nombre/usuario"
    },
    {
        "hu": "HU04", "rf": "RF-04", "cus": "CUS02.3", "nombre": "Editar usuario",
        "endpoints": "PUT /api/usuarios/{id}",
        "servicios": "UsuarioService.ActualizarUsuarioAsync (UsuarioService.cs:85)",
        "entidades": "Usuario, AuditoriaUsuario",
        "pantallas": "UsersPage.tsx, UserFormModal.tsx",
        "mensajes": "MSG-25, MSG-26",
        "pruebas": "UsuarioServiceUnitTests.cs",
        "estado": "IMPLEMENTADO",
        "evidencia": "UsuariosController.cs:153 -> UsuarioService.cs:85; edición de nombre, correo, rol y contraseña opcional"
    },
    {
        "hu": "HU05", "rf": "RF-05", "cus": "CUS02.4", "nombre": "Activar o desactivar usuario",
        "endpoints": "PATCH /api/usuarios/{id}/estado",
        "servicios": "UsuarioService.CambiarEstadoUsuarioAsync (UsuarioService.cs:130)",
        "entidades": "Usuario, AuditoriaUsuario",
        "pantallas": "UsersPage.tsx, ConfirmModal.tsx",
        "mensajes": "MSG-27, MSG-28, MSG-29, MSG-30",
        "pruebas": "UsuarioServiceUnitTests.cs",
        "estado": "IMPLEMENTADO",
        "evidencia": "UsuariosController.cs:225 -> UsuarioService.cs:130; impide desactivar al propio usuario o último administrador"
    },
    {
        "hu": "HU06", "rf": "RF-06", "cus": "CUS02.6", "nombre": "Cambiar contraseña",
        "endpoints": "PUT /api/perfil/contrasena",
        "servicios": "PerfilService.CambiarContrasenaAsync (PerfilService.cs:20)",
        "entidades": "Usuario, AuditoriaUsuario",
        "pantallas": "ChangePasswordModal.tsx",
        "mensajes": "MSG-44 a MSG-49",
        "pruebas": "UsuarioServiceUnitTests.cs",
        "estado": "IMPLEMENTADO",
        "evidencia": "PerfilController.cs:29 -> PerfilService.cs:20; valida contraseña actual, complejidad y nueva distinta de la actual"
    },
    {
        "hu": "HU07", "rf": "RF-07", "cus": "CUS01.2", "nombre": "Recuperar contraseña",
        "endpoints": "POST /api/auth/forgot-password, POST /api/auth/reset-password",
        "servicios": "AuthService.SolicitarRecuperacionAsync, AuthService.RestablecerContrasenaAsync",
        "entidades": "CodigoRecuperacion, Usuario",
        "pantallas": "ForgotPasswordPage.tsx",
        "mensajes": "MSG-10 a MSG-16",
        "pruebas": "UsuarioServiceUnitTests.cs",
        "estado": "IMPLEMENTADO",
        "evidencia": "AuthController.cs:103,151 -> AuthService.cs:120; código 6 dígitos enviado por email, vence a los 15 min"
    },
    {
        "hu": "HU08", "rf": "RF-08", "cus": "CUS02.5", "nombre": "Eliminar usuario",
        "endpoints": "DELETE /api/usuarios/{id}",
        "servicios": "UsuarioService.EliminarUsuarioAsync (UsuarioService.cs:160)",
        "entidades": "Usuario, AuditoriaUsuario",
        "pantallas": "UsersPage.tsx, ConfirmModal.tsx",
        "mensajes": "MSG-31, MSG-32, MSG-33",
        "pruebas": "UsuarioServiceUnitTests.cs",
        "estado": "IMPLEMENTADO",
        "evidencia": "UsuariosController.cs:285 -> UsuarioService.cs:160; verifica que no tenga pedidos, ventas ni auditorías antes de borrar"
    },
    {
        "hu": "HU09", "rf": "RF-09", "cus": "CUS03.1", "nombre": "Registrar producto o componente",
        "endpoints": "POST /api/productos",
        "servicios": "ProductoService.RegistrarProductoAsync (ProductoService.cs:45)",
        "entidades": "Producto",
        "pantallas": "ProductsPage.tsx, ProductFormModal.tsx",
        "mensajes": "MSG-51, MSG-53, MSG-54, MSG-57",
        "pruebas": "ProductoServiceUnitTests.cs",
        "estado": "IMPLEMENTADO",
        "evidencia": "ProductosController.cs:99 -> ProductoService.cs:45; soporta productos de carta (con precio) y componentes (con rol)"
    },
    {
        "hu": "HU10", "rf": "RF-10", "cus": "CUS03.2", "nombre": "Listar y buscar productos",
        "endpoints": "GET /api/productos, GET /api/productos/{id}",
        "servicios": "ProductoService.ListarProductosAsync (ProductoService.cs:25)",
        "entidades": "Producto",
        "pantallas": "ProductsPage.tsx",
        "mensajes": "MSG-65, MSG-66",
        "pruebas": "ProductoServiceUnitTests.cs",
        "estado": "IMPLEMENTADO",
        "evidencia": "ProductosController.cs:29 -> ProductoService.cs:25; filtrado por categoría, rol de componente y búsqueda de texto"
    },
    {
        "hu": "HU11", "rf": "RF-11", "cus": "CUS03.3", "nombre": "Editar producto",
        "endpoints": "PUT /api/productos/{id}",
        "servicios": "ProductoService.ActualizarProductoAsync (ProductoService.cs:80)",
        "entidades": "Producto",
        "pantallas": "ProductsPage.tsx, ProductFormModal.tsx",
        "mensajes": "MSG-58, MSG-59",
        "pruebas": "ProductoServiceUnitTests.cs",
        "estado": "IMPLEMENTADO",
        "evidencia": "ProductosController.cs:152 -> ProductoService.cs:80; actualización de datos y precios"
    },
    {
        "hu": "HU12", "rf": "RF-12", "cus": "CUS03.4", "nombre": "Activar o desactivar producto",
        "endpoints": "PATCH /api/productos/{id}/estado",
        "servicios": "ProductoService.CambiarEstadoProductoAsync (ProductoService.cs:120)",
        "entidades": "Producto",
        "pantallas": "ProductsPage.tsx, ConfirmModal.tsx",
        "mensajes": "MSG-60 a MSG-63",
        "pruebas": "ProductoServiceUnitTests.cs",
        "estado": "IMPLEMENTADO",
        "evidencia": "ProductosController.cs:215 -> ProductoService.cs:120; conmuta vigencia del producto o componente"
    },
    {
        "hu": "HU13", "rf": "RF-13", "cus": "CUS04.1", "nombre": "Definir menú del día con opciones",
        "endpoints": "GET /api/menu-dia, PUT /api/menu-dia/hoy",
        "servicios": "MenuDiaService.GuardarMenuHoyAsync (MenuDiaService.cs:65)",
        "entidades": "MenuDia, MenuDiaPlato, MenuDiaMenuCompleto",
        "pantallas": "MenuDiaPage.tsx",
        "mensajes": "MSG-68, MSG-69, MSG-70",
        "pruebas": "MenuDiaServiceUnitTests.cs",
        "estado": "DIFERENTE",
        "evidencia": "MenuDiaController.cs:74 usa ruta PUT /api/menu-dia/hoy (en doc se describe PUT /api/menu-dia). Bloquea pedidos si no hay menú definido (RN-142 no cumplida)"
    },
    {
        "hu": "HU14", "rf": "RF-14", "cus": "CUS04.2", "nombre": "Marcar plato u opción como agotado o disponible",
        "endpoints": "PATCH /api/menu-dia/hoy/platos/{productoId}/disponibilidad",
        "servicios": "MenuDiaService.CambiarDisponibilidadAsync (MenuDiaService.cs:110)",
        "entidades": "MenuDiaPlato",
        "pantallas": "MenuDiaPage.tsx, CocinaPage.tsx",
        "mensajes": "MSG-73, MSG-74, MSG-75",
        "pruebas": "MenuDiaServiceUnitTests.cs",
        "estado": "DIFERENTE",
        "evidencia": "MenuDiaController.cs:104 implementa PATCH /api/menu-dia/hoy/platos/{productoId}/disponibilidad. Funcionalidad completa pero ruta especializada"
    },
    {
        "hu": "HU15", "rf": "RF-15", "cus": "CUS05.1", "nombre": "Registrar mesa",
        "endpoints": "POST /api/mesas",
        "servicios": "MesaService.RegistrarMesaAsync (MesaService.cs:45)",
        "entidades": "Mesa, AuditoriaMesa",
        "pantallas": "MesasPage.tsx, MesaFormModal.tsx",
        "mensajes": "MSG-81, MSG-83, MSG-84",
        "pruebas": "MesaServiceUnitTests.cs",
        "estado": "DIFERENTE",
        "evidencia": "MesasController.cs:105 exige campo Capacidad (1-20), mientras en la decisión CUS05 de la documentación se especificó 'Sin capacidad ni plano'"
    },
    {
        "hu": "HU16", "rf": "RF-16", "cus": "CUS05.2", "nombre": "Ver mesas y su estado",
        "endpoints": "GET /api/mesas, GET /api/mesas/resumen",
        "servicios": "MesaService.ListarMesasAsync (MesaService.cs:25)",
        "entidades": "Mesa",
        "pantallas": "MesasPage.tsx",
        "mensajes": "MSG-91 a MSG-94",
        "pruebas": "MesaServiceUnitTests.cs",
        "estado": "IMPLEMENTADO",
        "evidencia": "MesasController.cs:30; cuadrícula de tarjetas con badge de estado Libre, Ocupada, Inactiva y resumen de salón"
    },
    {
        "hu": "HU17", "rf": "RF-17", "cus": "CUS05.3", "nombre": "Editar o desactivar mesa",
        "endpoints": "PUT /api/mesas/{id}, PATCH /api/mesas/{id}/estado",
        "servicios": "MesaService.ActualizarMesaAsync, MesaService.CambiarEstadoMesaAsync",
        "entidades": "Mesa, AuditoriaMesa",
        "pantallas": "MesasPage.tsx, MesaFormModal.tsx",
        "mensajes": "MSG-85 a MSG-90",
        "pruebas": "MesaServiceUnitTests.cs",
        "estado": "IMPLEMENTADO",
        "evidencia": "MesasController.cs:160,218; impide desactivar una mesa si su ocupación es Ocupada"
    },
    {
        "hu": "HU18", "rf": "RF-18", "cus": "CUS06.1", "nombre": "Registrar pedido de mesa con menús completos",
        "endpoints": "POST /api/pedidos/mesa",
        "servicios": "PedidoService.RegistrarPedidoMesaAsync (PedidoService.cs:45)",
        "entidades": "Pedido, DetallePedido, LineaPedidoOpcion, Comanda, Mesa",
        "pantallas": "PedidoMesaPage.tsx, ArmarMenuCompletoModal.tsx",
        "mensajes": "MSG-95 a MSG-103",
        "pruebas": "PedidoServiceUnitTests.cs, PedidoMenuCompletoUnitTests.cs",
        "estado": "DIFERENTE",
        "evidencia": "PedidoService.cs:66 rechaza un segundo pedido sobre una mesa ocupada con 409 (MSG_95), contradiciendo RN-46 que estipula admitir varios pedidos abiertos por mesa"
    },
    {
        "hu": "HU19", "rf": "RF-19", "cus": "CUS06.2", "nombre": "Agregar productos a un pedido de mesa",
        "endpoints": "POST /api/pedidos/{id}/lineas",
        "servicios": "PedidoService.AgregarLineasPedidoAsync (PedidoService.cs:240)",
        "entidades": "Pedido, DetallePedido, Comanda",
        "pantallas": "PedidoMesaPage.tsx",
        "mensajes": "MSG-105 a MSG-110",
        "pruebas": "PedidoServiceUnitTests.cs",
        "estado": "IMPLEMENTADO",
        "evidencia": "PedidosController.cs:339 -> PedidoService.cs:240; genera comanda adicional con etiqueta ADICIONAL N"
    },
    {
        "hu": "HU20", "rf": "RF-20", "cus": "CUS07.1", "nombre": "Registrar pedido para llevar",
        "endpoints": "POST /api/pedidos/llevar",
        "servicios": "PedidoService.RegistrarPedidoLlevarAsync (PedidoService.cs:150)",
        "entidades": "Pedido, DetallePedido, Comanda",
        "pantallas": "PedidoLlevarPage.tsx",
        "mensajes": "MSG-98 a MSG-104",
        "pruebas": "PedidoServiceUnitTests.cs",
        "estado": "IMPLEMENTADO",
        "evidencia": "PedidosController.cs:95; asocia nombre y referencia de cliente, emite comanda y no ocupa mesa"
    },
    {
        "hu": "HU21", "rf": "RF-21", "cus": "CUS08.2", "nombre": "Modificar o anular pedido",
        "endpoints": "PUT /api/pedidos/{id}, POST /api/pedidos/{id}/anular",
        "servicios": "PedidoService.ModificarPedidoAsync, PedidoService.AnularPedidoAsync",
        "entidades": "Pedido, Comanda, Mesa",
        "pantallas": "PedidosPage.tsx, AnularPedidoModal.tsx",
        "mensajes": "MSG-115 a MSG-120",
        "pruebas": "PedidoServiceUnitTests.cs",
        "estado": "DIFERENTE",
        "evidencia": "PedidoService.cs:775 impide que el Administrador anule un pedido registrado por otro usuario (exige pedido.Id_Usuario == usuarioId), contradiciendo RN-65"
    },
    {
        "hu": "HU22", "rf": "RF-22", "cus": "CUS08.1", "nombre": "Listar pedidos con su estado y avisar comanda lista",
        "endpoints": "GET /api/pedidos, GET /api/avisos, POST /api/avisos/{id}/visto",
        "servicios": "PedidoService.ListarPedidosAsync, AvisosService",
        "entidades": "Pedido, Comanda",
        "pantallas": "PedidosPage.tsx, AvisoComandaModal.tsx",
        "mensajes": "MSG-111 a MSG-114",
        "pruebas": "PedidoServiceUnitTests.cs",
        "estado": "PARCIAL",
        "evidencia": "PedidosPage.tsx:525 no renderiza el estado 'Pagado' en combinación con el estado de preparación (RN-64 no completada en UI)"
    },
    {
        "hu": "HU23", "rf": "RF-23", "cus": "CUS09.1", "nombre": "Ver comandas pendientes",
        "endpoints": "GET /api/comandas",
        "servicios": "ComandaService.ListarComandasAsync (ComandaService.cs:35)",
        "entidades": "Comanda, DetalleComanda",
        "pantallas": "CocinaPage.tsx",
        "mensajes": "MSG-123, MSG-124, MSG-133",
        "pruebas": "EmpiricalChallengeIteration2Tests.cs",
        "estado": "IMPLEMENTADO",
        "evidencia": "ComandasController.cs:30; pantalla táctil KDS con tiempos de espera y cronómetros de preparación"
    },
    {
        "hu": "HU24", "rf": "RF-24", "cus": "CUS09.2", "nombre": "Actualizar estado de la comanda",
        "endpoints": "PATCH /api/comandas/{id}/estado, POST /api/comandas/{id}/deshacer",
        "servicios": "ComandaService.ActualizarEstadoComandaAsync, ComandaService.DeshacerEstadoAsync",
        "entidades": "Comanda, Pedido",
        "pantallas": "CocinaPage.tsx",
        "mensajes": "MSG-125 a MSG-130",
        "pruebas": "EmpiricalChallengeIteration2Tests.cs",
        "estado": "IMPLEMENTADO",
        "evidencia": "ComandasController.cs:55,101 -> ComandaService.cs:255; botón Deshacer activo hasta 10.5 segundos (coincide con RV-88 y RN-78)"
    },
    {
        "hu": "HU25", "rf": "RF-25", "cus": "CUS10.1", "nombre": "Cobrar pedido (método de pago, vuelto y liberación)",
        "endpoints": "POST /api/cobros",
        "servicios": "CobroService.ProcesarCobroAsync (CobroService.cs:70)",
        "entidades": "Venta, Comprobante, Pedido, Mesa, Caja",
        "pantallas": "CobrosPage.tsx, CobroModal.tsx",
        "mensajes": "MSG-135 a MSG-151",
        "pruebas": "EmpiricalChallengeIteration2Tests.cs",
        "estado": "IMPLEMENTADO",
        "evidencia": "CobroService.cs:70; transacción atómica con validación de caja abierta, cálculo de vuelto, emisión y liberación de mesa"
    },
    {
        "hu": "HU26", "rf": "RF-26", "cus": "CUS10.2", "nombre": "Emitir comprobante de pago",
        "endpoints": "GET /api/cobros/comprobantes/{ventaId}, GET /api/cobros/comprobantes/{ventaId}/pdf",
        "servicios": "CobroService.ObtenerComprobanteAsync, PdfComprobanteService.GenerarComprobantePdf",
        "entidades": "Comprobante, Venta",
        "pantallas": "TicketComprobanteModal.tsx",
        "mensajes": "MSG-146, MSG-147",
        "pruebas": "EmpiricalChallengeIteration2Tests.cs",
        "estado": "IMPLEMENTADO",
        "evidencia": "CobrosController.cs:122,146; PDF vectorial con desglose de IGV al 18% para Boletas/Facturas y formato Ticket"
    },
    {
        "hu": "HU27", "rf": "RF-27", "cus": "CUS11.2", "nombre": "Anular venta",
        "endpoints": "POST /api/ventas/{id}/anular",
        "servicios": "VentaService.AnularVentaAsync (VentaService.cs:80)",
        "entidades": "Venta, Caja",
        "pantallas": "VentasPage.tsx, AnularVentaModal.tsx",
        "mensajes": "MSG-160 a MSG-165",
        "pruebas": "EmpiricalChallengeIteration2Tests.cs",
        "estado": "IMPLEMENTADO",
        "evidencia": "VentasController.cs:118 -> VentaService.cs:80; solo Administrador, motivo obligatorio, genera ajuste si la caja cerró"
    },
    {
        "hu": "HU28", "rf": "RF-28", "cus": "CUS11.1", "nombre": "Listar y buscar ventas",
        "endpoints": "GET /api/ventas, GET /api/ventas/{id}, GET /api/ventas/{id}/ticket",
        "servicios": "VentaService.ListarVentasAsync, VentaService.ObtenerDetalleVentaAsync",
        "entidades": "Venta, Comprobante",
        "pantallas": "VentasPage.tsx",
        "mensajes": "MSG-153 a MSG-159",
        "pruebas": "EmpiricalChallengeIteration2Tests.cs",
        "estado": "IMPLEMENTADO",
        "evidencia": "VentasController.cs:60,94,159; búsqueda por serie, número, correlativo y documento del cliente"
    },
    {
        "hu": "HU29", "rf": "RF-29", "cus": "CUS12.1", "nombre": "Abrir caja",
        "endpoints": "POST /api/caja/abrir, GET /api/caja/actual, GET /api/caja/estado",
        "servicios": "CajaService.AbrirCajaAsync (CajaService.cs:45)",
        "entidades": "Caja",
        "pantallas": "HomePage.tsx, CobrosPage.tsx, AbrirCajaModal.tsx",
        "mensajes": "MSG-169 a MSG-174",
        "pruebas": "CajaRepositoryAdversarialTests.cs, CajaRepositoryTimezoneTests.cs",
        "estado": "IMPLEMENTADO",
        "evidencia": "CajaController.cs:68 -> CajaService.cs:45; registra monto inicial, bloquea aperturas dobles y valida fecha operativa"
    },
    {
        "hu": "HU30", "rf": "RF-30", "cus": "CUS12.2", "nombre": "Cerrar caja y cuadrar",
        "endpoints": "GET /api/caja/cierre/resumen, POST /api/caja/cerrar",
        "servicios": "CajaService.ObtenerResumenCierreAsync, CajaService.CerrarCajaAsync",
        "entidades": "Caja",
        "pantallas": "CerrarCajaModal.tsx",
        "mensajes": "MSG-175 a MSG-184",
        "pruebas": "CajaRepositoryAdversarialTests.cs, CajaRepositoryQueryCompatibilityTests.cs",
        "estado": "IMPLEMENTADO",
        "evidencia": "CajaController.cs:178,211 -> CajaService.cs:110,165; cálculo automático de ventas Efectivo/Yape y descuadre real"
    },
    {
        "hu": "HU31", "rf": "RF-31", "cus": "CUS12.3", "nombre": "Consultar historial de cierres",
        "endpoints": "GET /api/caja/cierres, GET /api/caja/cierres/{id}, GET /api/caja/cierres/{id}/pdf",
        "servicios": "CajaService.ListarCierresAsync, CajaService.ObtenerDetalleCierreAsync, PdfCierreService",
        "entidades": "Caja",
        "pantallas": "HistorialCierresPage.tsx",
        "mensajes": "MSG-185 a MSG-189",
        "pruebas": "CajaRepositoryQueryCompatibilityTests.cs",
        "estado": "IMPLEMENTADO",
        "evidencia": "CajaController.cs:369,461,492; historial paginado, desglose de descuadres y descarga de acta en PDF"
    },
    {
        "hu": "HU32", "rf": "RF-32", "cus": "CUS13.1", "nombre": "Consultar reporte de ventas",
        "endpoints": "GET /api/reportes/ventas, GET /api/reportes/ventas/exportar",
        "servicios": "ReporteService.ConsultarReporteVentasAsync (ReporteService.cs:20)",
        "entidades": "Venta, Caja, AuditoriaReporte",
        "pantallas": "ReportesPage.tsx",
        "mensajes": "MSG-190 a MSG-200",
        "pruebas": "EmpiricalChallengeIteration2Tests.cs",
        "estado": "IMPLEMENTADO",
        "evidencia": "ReportesController.cs:52,125 -> ReporteService.cs:20; reporte por rango de fechas (hasta 366 días) con etiqueta 'Con ajustes'"
    },
    {
        "hu": "HU33", "rf": "RF-33", "cus": "CUS13.2", "nombre": "Consultar platos vendidos",
        "endpoints": "GET /api/reportes/platos, GET /api/reportes/platos/exportar",
        "servicios": "ReporteService.ConsultarReportePlatosAsync (ReporteService.cs:29)",
        "entidades": "DetallePedido, LineaPedidoOpcion, Producto, MenuCompleto",
        "pantallas": "ReportesPage.tsx",
        "mensajes": "MSG-193 a MSG-199",
        "pruebas": "EmpiricalChallengeIteration2Tests.cs",
        "estado": "IMPLEMENTADO",
        "evidencia": "ReportesController.cs:86,173 -> ReporteRepository.cs:134; menús completos con monto y componentes con S/ 0.00 (RN-138)"
    },
    {
        "hu": "HU34", "rf": "RF-34", "cus": "CUS14.1", "nombre": "Ver indicadores del día",
        "endpoints": "GET /api/inicio, GET /api/inicio/{bloque}",
        "servicios": "InicioService.ObtenerInicioAsync (InicioService.cs:30)",
        "entidades": "Usuario, Caja, Pedido, Comanda",
        "pantallas": "DashboardPage.tsx, DashboardAdminView.tsx",
        "mensajes": "MSG-201 a MSG-208",
        "pruebas": "EmpiricalChallengeIteration2Tests.cs",
        "estado": "DIFERENTE",
        "evidencia": "InicioService.cs:317 emite alerta de 'Menú de hoy sin definir' de forma incondicional, contradiciendo RN-128 que exige mostrarla 'solo con la caja del día abierta'"
    },
    {
        "hu": "HU35", "rf": "RF-35", "cus": "CUS03.5", "nombre": "Gestionar menús completos",
        "endpoints": "GET /api/menus-completos, GET /api/menus-completos/{id}, PUT /api/menus-completos/{id}, PATCH /api/menus-completos/{id}/estado",
        "servicios": "MenuCompletoService (MenuCompletoService.cs:25)",
        "entidades": "MenuCompleto, MenuCompletoParte",
        "pantallas": "ProductsPage.tsx, MenuCompletoCard.tsx",
        "mensajes": "MSG-55, MSG-56, MSG-216 a MSG-219",
        "pruebas": "MenuCompletoServiceUnitTests.cs",
        "estado": "IMPLEMENTADO",
        "evidencia": "MenusCompletosController.cs:30,56,103; configuración de precios de los 3 menús completos"
    }
]

# Write CSV
csv_path = ANALISIS_DIR / "03a_matriz_trazabilidad.csv"
with open(csv_path, "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["hu", "rf", "cus", "nombre", "endpoints", "servicios", "entidades", "pantallas", "mensajes", "pruebas", "estado", "evidencia"])
    writer.writeheader()
    for row in trace_data:
        writer.writerow(row)

# Write MD
md_path = ANALISIS_DIR / "03a_matriz_trazabilidad.md"
lines = [
    "# Matriz de Trazabilidad Bidireccional Completa (GirasolesRes)\n",
    "Este documento establece la trazabilidad exhaustiva en ambas direcciones entre los 35 subcasos de uso definidos en la documentación y los artefactos de software reales implementados en el proyecto (Backend, Frontend, Base de Datos y Pruebas Automatizadas).\n",
    "## 1. Trazabilidad Documentación → Proyecto (35 Subcasos)\n",
    "| HU | RF | CUS | Título del Subcaso | Endpoints API | Servicios Backend | Pantallas / Vistas | Pruebas | Estado | Evidencia de Código |",
    "|---|---|---|---|---|---|---|---|:---:|---|"
]

for r in trace_data:
    lines.append(f"| **{r['hu']}** | **{r['rf']}** | **{r['cus']}** | {r['nombre']} | `{r['endpoints']}` | `{r['servicios']}` | `{r['pantallas']}` | `{r['pruebas']}` | **{r['estado']}** | {r['evidencia']} |")

lines.append("\n---\n")
lines.append("## 2. Trazabilidad Proyecto → Documentación (Controladores y Endpoints del Backend)\n")
lines.append("A continuación se lista cada endpoint implementado en el backend y su respaldo en los casos de uso documentados:\n")
lines.append("| Método y Ruta | Controlador y Línea | Roles Autorizados | Casos de Uso Vinculados | Respaldo Documental |")
lines.append("|---|---|---|---|:---:|")

# Load 02_inventario_proyecto.json
with open(ANALISIS_DIR / "02_inventario_proyecto.json", encoding="utf-8") as f:
    d2 = json.load(f)

# Map routes to CUS
def map_route(m, r):
    if "/api/auth" in r: return "CUS01.1, CUS01.2", "Con respaldo (Ficha CUS01 y Anexo A)"
    if "/api/avisos" in r: return "CUS08.1", "Con respaldo (Ficha CUS08 y CUS09)"
    if "/api/caja/cierres" in r: return "CUS12.3", "Con respaldo (Ficha CUS12)"
    if "/api/caja/estado" in r: return "CUS12.1", "SIN RESPALDO EN DOCUMENTACIÓN (Endpoint utilitario frontend)"
    if "/api/caja" in r: return "CUS12.1, CUS12.2", "Con respaldo (Ficha CUS12)"
    if "/api/cobros/comprobantes" in r: return "CUS10.2", "Con respaldo en texto CUS10 (en tabla se listó como /api/comprobantes)"
    if "/api/cobros" in r: return "CUS10.1, CUS10.2", "Con respaldo (Ficha CUS10)"
    if "/api/comandas" in r: return "CUS09.1, CUS09.2", "Con respaldo (Ficha CUS09)"
    if "/api/consultas" in r: return "CUS10.1", "SIN RESPALDO EN DOCUMENTACIÓN (Mencionado en texto, falta en tabla API)"
    if "/api/inicio" in r: return "CUS14.1", "Con respaldo (Ficha CUS14 y Anexo B)"
    if "/api/menu-dia/candidatos" in r: return "CUS04.1", "SIN RESPALDO EN DOCUMENTACIÓN (Endpoint auxiliar de selector)"
    if "/api/menu-dia" in r: return "CUS04.1, CUS04.2", "Con respaldo (Ficha CUS04)"
    if "/api/menus-completos" in r: return "CUS03.5", "Con respaldo (Ficha CUS03)"
    if "/api/mesas/resumen" in r: return "CUS05.2", "SIN RESPALDO EN DOCUMENTACIÓN (Endpoint auxiliar de KPIs)"
    if "/api/mesas" in r: return "CUS05.1, CUS05.2, CUS05.3", "Con respaldo (Ficha CUS05)"
    if "/api/pedidos/catalogo-pedido" in r: return "CUS06.1, CUS07.1", "SIN RESPALDO EN DOCUMENTACIÓN (Endpoint de carga rápida)"
    if "/api/pedidos/mesa" in r and "/activo" in r: return "CUS06.2", "SIN RESPALDO EN DOCUMENTACIÓN (Endpoint de consulta rápida)"
    if "/api/pedidos" in r: return "CUS06.1, CUS06.2, CUS07.1, CUS08.1, CUS08.2", "Con respaldo (Ficha CUS06, 07, 08)"
    if "/api/perfil" in r: return "CUS02.6", "Con respaldo (Ficha CUS02)"
    if "/api/productos" in r: return "CUS03.1, CUS03.2, CUS03.3, CUS03.4", "Con respaldo (Ficha CUS03)"
    if "/api/reportes" in r: return "CUS13.1, CUS13.2", "Con respaldo (Ficha CUS13)"
    if "/api/usuarios" in r: return "CUS02.1, CUS02.2, CUS02.3, CUS02.4, CUS02.5", "Con respaldo (Ficha CUS02)"
    if "/api/ventas" in r and "/ticket" in r: return "CUS11.1", "SIN RESPALDO EN DOCUMENTACIÓN (Endpoint de impresión térmica)"
    if "/api/ventas" in r: return "CUS11.1, CUS11.2", "Con respaldo (Ficha CUS11)"
    return "General", "Con respaldo"

for ep in d2["endpoints"]:
    cus_resp, respaldo = map_route(ep["metodo"], ep["ruta"])
    lines.append(f"| `{ep['metodo']} {ep['ruta']}` | `{ep['controlador']}:{ep['linea']}` | `{ep['autorizacion']}` | {cus_resp} | {respaldo} |")

md_path.write_text("\n".join(lines), encoding="utf-8")
print(f"Generado {csv_path} y {md_path}")
