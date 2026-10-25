# Matriz de Funcionalidades Implementadas por Módulo (GirasolesRes)

Esta matriz mapea cada funcionalidad del sistema contra su código backend y frontend, indicando el estado real verificado en código.

| Módulo / Funcionalidad | Backend (Archivo:Línea) | Frontend (Archivo) | Estado Real | Evidencia en Código |
|---|---|---|:---:|---|
| **Iniciar Sesión** | `Controllers/AuthController.cs:28` | `pages/LoginPage.tsx` | **Completa** | PBKDF2 100k iter, JWT 30m, bloqueo tras 5 intentos. |
| **Recuperar Contraseña** | `Controllers/AuthController.cs:103` | `pages/ForgotPasswordPage.tsx` | **Completa** | Código de 6 dígitos, expira en 15 min, un solo uso. |
| **Cambiar Contraseña (Perfil)** | `Controllers/PerfilController.cs:29` | `components/usuarios/ChangePasswordModal.tsx` | **Completa** | Exige contraseña actual y valida complejidad. |
| **Cerrar Sesión (Logout)** | `Controllers/AuthController.cs:216` | `components/layout/LogoutModal.tsx` | **Completa** | Token revocado en BD e invalidación en cliente. |
| **Control de Inactividad** | `JwtGenerator.cs:25` | `layouts/MainLayout.tsx`, `HomePage.tsx:40` | **Completa** | Alerta a los 28m, cierre forzado a los 30m. |
| **CRUD de Usuarios** | `Controllers/UsuariosController.cs:28` | `pages/UsersPage.tsx` | **Completa** | Alta, edición, activación, borrado sin movimientos. |
| **CRUD de Productos** | `Controllers/ProductosController.cs:29` | `pages/ProductsPage.tsx` | **Completa** | 6 categorías, precios S/ 0.50 a 500, toggle estado. |
| **Menús Completos (Precios)** | `Controllers/MenusCompletosController.cs:30` | `pages/ProductsPage.tsx` | **Completa** | Precios configurables para Desayuno, Almuerzo y Segundo. |
| **Definir Menú del Día** | `Controllers/MenuDiaController.cs:80` | `pages/MenuDiaPage.tsx` | **Completa** | Opciones por rol de componente y productos habilitados. |
| **Marcar Platos Agotados** | `Controllers/MenuDiaController.cs:126` | `pages/MenuDiaPage.tsx` | **Completa** | Toggle instantáneo disponible/agotado en KDS y Menú. |
| **Gestión de Mesas** | `Controllers/MesasController.cs:30` | `pages/MesasPage.tsx` | **Completa** | Cuadrícula Libre/Ocupada/Inactiva, capacidad 1-20. |
| **Pedido de Mesa** | `Controllers/PedidosController.cs:31` | `pages/PedidoMesaPage.tsx` | **Completa** | Comanda automática, armado de menú completo guiado. |
| **Agregar Productos a Mesa** | `Controllers/PedidosController.cs:339` | `pages/PedidoMesaPage.tsx` | **Completa** | Agrega líneas a pedido abierto y emite nueva comanda. |
| **Pedido para Llevar** | `Controllers/PedidosController.cs:95` | `pages/PedidoLlevarPage.tsx` | **Completa** | Asocia cliente, empaque para llevar, sin ocupar mesa. |
| **Listar y Filtrar Pedidos** | `Controllers/PedidosController.cs:155` | `pages/PedidosPage.tsx` | **Completa** | Filtro por estado, detalle de líneas y tiempos. |
| **Modificar Pedido** | `Controllers/PedidosController.cs:209` | `pages/PedidosPage.tsx` | **Completa** | Bloqueado si cocina ya inició la preparación. |
| **Anular Pedido** | `Controllers/PedidosController.cs:274` | `pages/PedidosPage.tsx` | **Completa** | Motivo obligatorio, permisos según rol. |
| **KDS Pantalla de Cocina** | `Controllers/ComandasController.cs:30` | `pages/CocinaPage.tsx` | **Completa** | Cronómetro, alerta demora >15m, estados secuenciales. |
| **Deshacer Estado Comanda** | `Controllers/ComandasController.cs:101` | `pages/CocinaPage.tsx` | **Completa** | Permitido estrictamente dentro de los primeros 60s. |
| **Avisos de Comanda Lista** | `Controllers/AvisosController.cs:29` | `components/cocina/AvisoComandaModal.tsx` | **Completa** | Notificación emergente sonora/visual para el mozo. |
| **Apertura de Caja** | `Controllers/CajaController.cs:68` | `pages/CobrosPage.tsx`, `HomePage.tsx` | **Completa** | Monto inicial en efectivo, bloqueo si ya hay abierta. |
| **Cobro de Pedido** | `Controllers/CobrosController.cs:70` | `components/cobros/CobroModal.tsx` | **Completa** | Efectivo/Yape, vuelto, validación atómica. |
| **Liberación de Mesa al Pagar** | `CobroService.cs:185` | `components/cobros/CobroModal.tsx` | **Completa** | Pasa mesa a Libre automáticamente tras cobro total. |
| **Emisión de Comprobantes** | `Controllers/CobrosController.cs:122` | `components/cobros/TicketComprobanteModal.tsx`| **Completa** | Ticket (T001), Boleta (B001), Factura (F001). |
| **Regla Fiscal SUNAT ≥ S/ 700**| `CobroService.cs:95` | `components/cobros/CobroModal.tsx` | **Completa** | Inhabilita Boleta Simple y exige DNI o RUC. |
| **Consulta DNI / RUC** | `Controllers/ConsultasController.cs:24` | `components/cobros/CobroModal.tsx` | **Completa** | Autocompleta razón social y dirección del receptor. |
| **Cierre y Arqueo de Caja** | `Controllers/CajaController.cs:211` | `components/caja/CerrarCajaModal.tsx` | **Completa** | Conteo físico, cálculo de descuadre y bloqueo. |
| **Historial de Cierres** | `Controllers/CajaController.cs:369` | `pages/HistorialCierresPage.tsx` | **Completa** | Consulta de auditoría, descarga de acta en PDF. |
| **Historial de Ventas** | `Controllers/VentasController.cs:60` | `pages/VentasPage.tsx` | **Completa** | Filtro por fecha, comprobante, receptor y descarga PDF. |
| **Anular Venta** | `Controllers/VentasController.cs:118` | `pages/VentasPage.tsx` | **Completa** | Solo Administrador, motivo obligatorio, ajuste en caja. |
| **Reporte de Ventas por Rango**| `Controllers/ReportesController.cs:52` | `pages/ReportesPage.tsx` | **Completa** | Tarjetas KPI, desglose por día, etiqueta «Con ajustes».|
| **Reporte de Platos Vendidos** | `Controllers/ReportesController.cs:86` | `pages/ReportesPage.tsx` | **Completa** | Cantidad y recaudación por plato y menú completo. |
| **Exportación de Reportes PDF**| `Controllers/ReportesController.cs:125`| `pages/ReportesPage.tsx` | **Completa** | Generación binaria directa con `PdfCanvasBuilder`. |
| **Dashboard de Inicio por Rol** | `Controllers/InicioController.cs:40` | `pages/DashboardPage.tsx` | **Completa** | Métricas específicas para Admin, Cajero, Mozo y Cocina. |
