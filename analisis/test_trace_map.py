import json

with open(r'e:\Downloads\GirasolesRes\analisis\inventario_definiciones.json', encoding='utf-8') as f:
    inv = json.load(f)

# The 35 CUS
cus_list = inv['cus']
print(f"Total CUS in doc: {len(cus_list)}")

mapping = [
    ("HU01", "RF-01", "CUS01.1", "Iniciar sesión", "POST /api/auth/login", "AuthController.cs:28", "AuthService.cs:40", "Usuario, RegistroIngreso", "LoginPage.tsx"),
    ("HU02", "RF-02", "CUS02.2", "Registrar usuario", "POST /api/usuarios", "UsuariosController.cs:92", "UsuarioService.cs:45", "Usuario", "UsersPage.tsx"),
    ("HU03", "RF-03", "CUS02.1", "Listar y buscar usuarios", "GET /api/usuarios", "UsuariosController.cs:28", "UsuarioService.cs:25", "Usuario", "UsersPage.tsx"),
    ("HU04", "RF-04", "CUS02.3", "Editar usuario", "PUT /api/usuarios/{id}", "UsuariosController.cs:153", "UsuarioService.cs:85", "Usuario", "UsersPage.tsx"),
    ("HU05", "RF-05", "CUS02.4", "Activar o desactivar usuario", "PATCH /api/usuarios/{id}/estado", "UsuariosController.cs:225", "UsuarioService.cs:130", "Usuario", "UsersPage.tsx"),
    ("HU06", "RF-06", "CUS02.6", "Cambiar contraseña", "PUT /api/perfil/contrasena", "PerfilController.cs:29", "PerfilService.cs:20", "Usuario", "ChangePasswordModal.tsx"),
    ("HU07", "RF-07", "CUS01.2", "Recuperar contraseña", "POST /api/auth/forgot-password, POST /api/auth/reset-password", "AuthController.cs:103,151", "AuthService.cs:120", "CodigoRecuperacion, Usuario", "ForgotPasswordPage.tsx"),
    ("HU08", "RF-08", "CUS02.5", "Eliminar usuario", "DELETE /api/usuarios/{id}", "UsuariosController.cs:285", "UsuarioService.cs:160", "Usuario", "UsersPage.tsx"),
    ("HU09", "RF-09", "CUS03.1", "Registrar producto o componente", "POST /api/productos", "ProductosController.cs:99", "ProductoService.cs:45", "Producto", "ProductsPage.tsx"),
    ("HU10", "RF-10", "CUS03.2", "Listar y buscar productos", "GET /api/productos", "ProductosController.cs:29", "ProductoService.cs:25", "Producto", "ProductsPage.tsx"),
    ("HU11", "RF-11", "CUS03.3", "Editar producto", "PUT /api/productos/{id}", "ProductosController.cs:152", "ProductoService.cs:80", "Producto", "ProductsPage.tsx"),
    ("HU12", "RF-12", "CUS03.4", "Activar o desactivar producto", "PATCH /api/productos/{id}/estado", "ProductosController.cs:215", "ProductoService.cs:120", "Producto", "ProductsPage.tsx"),
    ("HU13", "RF-13", "CUS04.1", "Definir menú del día con opciones", "PUT /api/menu-dia/hoy", "MenuDiaController.cs:74", "MenuDiaService.cs:65", "MenuDia, MenuDiaPlato, MenuDiaMenuCompleto", "MenuDiaPage.tsx"),
    ("HU14", "RF-14", "CUS04.2", "Marcar plato u opción como agotado o disponible", "PATCH /api/menu-dia/hoy/platos/{productoId}/disponibilidad", "MenuDiaController.cs:104", "MenuDiaService.cs:110", "MenuDiaPlato", "MenuDiaPage.tsx, CocinaPage.tsx"),
    ("HU15", "RF-15", "CUS05.1", "Registrar mesa", "POST /api/mesas", "MesasController.cs:105", "MesaService.cs:45", "Mesa", "MesasPage.tsx"),
    ("HU16", "RF-16", "CUS05.2", "Ver mesas y su estado", "GET /api/mesas", "MesasController.cs:30", "MesaService.cs:25", "Mesa", "MesasPage.tsx"),
    ("HU17", "RF-17", "CUS05.3", "Editar o desactivar mesa", "PUT /api/mesas/{id}, PATCH /api/mesas/{id}/estado", "MesasController.cs:160,218", "MesaService.cs:80,120", "Mesa", "MesasPage.tsx"),
    ("HU18", "RF-18", "CUS06.1", "Registrar pedido de mesa con menús completos", "POST /api/pedidos/mesa", "PedidosController.cs:31", "PedidoService.cs:45", "Pedido, DetallePedido, LineaPedidoOpcion, Comanda", "PedidoMesaPage.tsx"),
    ("HU19", "RF-19", "CUS06.2", "Agregar productos a un pedido de mesa", "POST /api/pedidos/{id}/lineas", "PedidosController.cs:339", "PedidoService.cs:240", "Pedido, DetallePedido, Comanda", "PedidoMesaPage.tsx"),
    ("HU20", "RF-20", "CUS07.1", "Registrar pedido para llevar", "POST /api/pedidos/llevar", "PedidosController.cs:95", "PedidoService.cs:150", "Pedido, DetallePedido, Comanda", "PedidoLlevarPage.tsx"),
    ("HU21", "RF-21", "CUS08.2", "Modificar o anular pedido", "PUT /api/pedidos/{id}, POST /api/pedidos/{id}/anular", "PedidosController.cs:209,274", "PedidoService.cs:610,770", "Pedido, Comanda, Mesa", "PedidosPage.tsx"),
    ("HU22", "RF-22", "CUS08.1", "Listar pedidos con su estado y avisar comanda lista", "GET /api/pedidos, GET /api/avisos", "PedidosController.cs:155, AvisosController.cs:29", "PedidoService.cs:480", "Pedido, Comanda", "PedidosPage.tsx, AvisoComandaModal.tsx"),
    ("HU23", "RF-23", "CUS09.1", "Ver comandas pendientes", "GET /api/comandas", "ComandasController.cs:30", "ComandaService.cs:35", "Comanda, DetalleComanda", "CocinaPage.tsx"),
    ("HU24", "RF-24", "CUS09.2", "Actualizar estado de la comanda", "PATCH /api/comandas/{id}/estado, POST /api/comandas/{id}/deshacer", "ComandasController.cs:55,101", "ComandaService.cs:85,245", "Comanda, Pedido", "CocinaPage.tsx"),
    ("HU25", "RF-25", "CUS10.1", "Cobrar pedido (método de pago, vuelto y liberación)", "POST /api/cobros", "CobrosController.cs:70", "CobroService.cs:70", "Venta, Comprobante, Pedido, Mesa, Caja", "CobrosPage.tsx, CobroModal.tsx"),
    ("HU26", "RF-26", "CUS10.2", "Emitir comprobante de pago", "GET /api/cobros/comprobantes/{ventaId}/pdf", "CobrosController.cs:146", "CobroService.cs:135, PdfComprobanteService.cs", "Comprobante, Venta", "TicketComprobanteModal.tsx"),
    ("HU27", "RF-27", "CUS11.2", "Anular venta", "POST /api/ventas/{id}/anular", "VentasController.cs:118", "VentaService.cs:80", "Venta, Caja", "VentasPage.tsx"),
    ("HU28", "RF-28", "CUS11.1", "Listar y buscar ventas", "GET /api/ventas, GET /api/ventas/{id}", "VentasController.cs:60,94", "VentaService.cs:35,65", "Venta, Comprobante", "VentasPage.tsx"),
    ("HU29", "RF-29", "CUS12.1", "Abrir caja", "POST /api/caja/abrir", "CajaController.cs:68", "CajaService.cs:45", "Caja", "HomePage.tsx, CobrosPage.tsx"),
    ("HU30", "RF-30", "CUS12.2", "Cerrar caja y cuadrar", "GET /api/caja/cierre/resumen, POST /api/caja/cerrar", "CajaController.cs:178,211", "CajaService.cs:110,165", "Caja", "CerrarCajaModal.tsx"),
    ("HU31", "RF-31", "CUS12.3", "Consultar historial de cierres", "GET /api/caja/cierres, GET /api/caja/cierres/{id}/pdf", "CajaController.cs:369,492", "CajaService.cs:230,270", "Caja", "HistorialCierresPage.tsx"),
    ("HU32", "RF-32", "CUS13.1", "Consultar reporte de ventas", "GET /api/reportes/ventas, GET /api/reportes/ventas/exportar", "ReportesController.cs:52,125", "ReporteService.cs:20,60", "Venta, Caja", "ReportesPage.tsx"),
    ("HU33", "RF-33", "CUS13.2", "Consultar platos vendidos", "GET /api/reportes/platos, GET /api/reportes/platos/exportar", "ReportesController.cs:86,173", "ReporteService.cs:80,120", "DetallePedido, LineaPedidoOpcion", "ReportesPage.tsx"),
    ("HU34", "RF-34", "CUS14.1", "Ver indicadores del día", "GET /api/inicio", "InicioController.cs:40", "InicioService.cs:30", "Usuario, Caja, Pedido, Comanda", "DashboardPage.tsx, DashboardAdminView.tsx"),
    ("HU35", "RF-35", "CUS03.5", "Gestionar menús completos", "GET /api/menus-completos, PUT /api/menus-completos/{id}", "MenusCompletosController.cs:30,56", "MenuCompletoService.cs:25,50", "MenuCompleto, MenuCompletoParte", "ProductsPage.tsx")
]

print(f"Total mapped subcases: {len(mapping)}")
