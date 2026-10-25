# Frontend: Pantallas, Componentes, Flujos y Experiencia de Usuario (GirasolesRes)

Este documento describe la arquitectura de la interfaz de usuario en React 19, sus 16 vistas/páginas, control de acceso por rol y validaciones en cliente, con evidencia en `frontend/src/`.

---

## 1. Arquitectura de Navegación y Control de Acceso por Rol

El sistema orquesta la interfaz a través de `frontend/src/App.tsx:1` y `frontend/src/pages/HomePage.tsx:1`:
- **Persistencia de Sesión:** `localStorage.getItem('girasoles_session')`. Si el token expira, el interceptor `apiClient.ts` captura el `401 Unauthorized`, limpia la sesión y redirige al Login con banner de aviso.
- **Inactividad del Usuario (`HomePage.tsx:40`):**
  - Temporizador de 28 minutos de inactividad: Despliega `InactivityModal.tsx` con cuenta regresiva.
  - A los 30 minutos sin interacción: Dispara logout automático y revoca el token en el backend.
- **Enrutamiento y Guards por Rol en `HomePage.tsx`:**
  - `Administrador`: Acceso a todas las pestañas (Usuarios, Productos, Menú del Día, Mesas, Pedidos, Caja, Ventas, Historial de Cierres, Reportes, Dashboard completo).
  - `Cajero`: Acceso a Mesas (consulta), Pedido para Llevar, Pedidos, Caja (abrir/cerrar/arqueo), Ventas, Cobros.
  - `Mozo`: Acceso a Salón de Mesas, Pedido de Mesa, Agregar productos, Pedidos en curso y Avisos de cocina.
  - `Cocinero`: Acceso exclusivo a Pantalla de Cocina (KDS) y Disponibilidad de Platos en Menú del Día.

---

## 2. Catálogo de Vistas y Páginas (`frontend/src/pages/`)

1. **`LoginPage.tsx`:** Formulario de inicio de sesión, botón Mostrar/Ocultar contraseña, bloqueo visual tras 5 intentos fallidos y enlace a recuperación.
2. **`ForgotPasswordPage.tsx`:** Solicitud de código de 6 dígitos al correo y restablecimiento seguro con confirmación de clave.
3. **`DashboardPage.tsx`:** Renderiza `DashboardAdminView`, `DashboardCajeroView`, `DashboardMozoView` o `DashboardCocineroView` según el rol activo.
4. **`UsersPage.tsx`:** Gestión de personal, modal de creación/edición, filtro por rol y estado, modal de confirmación de desactivación/eliminación.
5. **`ProductsPage.tsx`:** Catálogo de productos en 6 pestañas, gestión de componentes de menú y pestaña especializada de "Menús completos".
6. **`MenuDiaPage.tsx`:** Configuración de opciones del día por rol y pestaña "Disponibilidad en Servicio" para marcar platos agotados con interruptor rápido.
7. **`MesasPage.tsx`:** Salón interactivo con cuadrícula de mesas en tarjetas verdes (Libres), naranjas (Ocupadas) y atenuadas (Inactivas). Permite crear y editar mesas (solo Administrador).
8. **`PedidoMesaPage.tsx`:** Flujo de comanda de salón: selección de mesa, comensales, productos de carta y armado guiado de menús completos (modal `ArmarMenuCompletoModal.tsx`).
9. **`PedidoLlevarPage.tsx`:** Registro de pedidos para llevar con nombre del cliente, tipo de empaque y emisión directa a cocina.
10. **`PedidosPage.tsx`:** Monitor de todos los pedidos, filtros por estado (`Pendiente`, `EnPreparacion`, `Listo`, `Entregado`, `Pagado`, `Anulado`), detalle y anulación con motivo.
11. **`CocinaPage.tsx`:** Pantalla KDS táctil con tarjetas de comanda, semáforo de tiempo (verde <10 min, naranja 10-15 min, rojo con aviso de "Demora" >15 min), botones grandes "Preparar" y "Listo", y botón "Deshacer" disponible durante 60 segundos.
12. **`CobrosPage.tsx`:** Módulo de cobranza: selección de pedido, modal de cobro (`CobroModal.tsx`), selección de efectivo o Yape, cálculo automático de vuelto, consulta automática de DNI/RUC vía API y emisión de comprobante.
13. **`VentasPage.tsx`:** Historial de comprobantes emitidos, visor de detalle fiscal, descarga de ticket PDF y modal de anulación con motivo obligatorio.
14. **`HistorialCierresPage.tsx`:** Arqueos de caja pasados, detalle de descuadres, desglose de ventas en efectivo/Yape y descarga de actas de cierre en PDF.
15. **`ReportesPage.tsx`:** Gráficos y tablas de ventas por rango de fechas (máx. 366 días), platos más vendidos y exportación a PDF.
16. **`HomePage.tsx`:** Marco principal contenedor, barra superior de usuario, notificaciones sonoras/visuales de comandas (`AvisoComandaModal.tsx`) y navegación responsiva.

---

## 3. Experiencia Móvil y Accesibilidad

- **Diseño Adaptativo (Mobile-First):** Cuadrícula de mesas adaptada a 2 columnas en teléfonos, menú inferior colapsable, tamaños táctiles de al menos 44×44 px en botones de KDS y toma de pedidos.
- **Accesibilidad:** Uso de atributos semánticos HTML5, soporte de navegación por teclado (foco visible, cierre con tecla Escape, confirmación con Enter) y contraste cromático auditado en `DESIGN_SYSTEM.md`.
