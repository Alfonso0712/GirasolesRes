# Changelog

Todos los cambios notables en este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-20

### Añadido

#### Módulos Operativos y Funcionales (CUS01 al CUS15)
- **Módulo 1: Seguridad, Autenticación y Control de Accesos (CUS01, CUS01.1, CUS01.2):**
  - Autenticación mediante tokens criptográficos JWT Bearer (HS256) con expiración controlada.
  - Cifrado robusto de contraseñas con PBKDF2 (100,000 iteraciones, salt de 128 bits y subkey de 256 bits).
  - Control de Acceso Basado en Roles (RBAC): Administrador, Cajero, Mozo y Cocinero.
  - Control de inactividad de sesión (30 minutos con modal de advertencia preventiva a los 28 minutos).
  - Lista negra y revocación de tokens JWT en base de datos (`TokenRevocado`).
  - Recuperación de contraseñas mediante código temporal de un solo uso enviado por correo electrónico.

- **Módulo 2: Gestión de Salón y Ocupación de Mesas (CUS02):**
  - Mapa interactivo de mesas con badges semánticos de ocupación en tiempo real (Libre, Ocupada, Reservada).
  - Bloqueo de eliminación física sobre mesas con pedidos activos o en curso.
  - Trazabilidad y auditoría de cambios de estado en salón (`AuditoriaMesa`).

- **Módulo 3: Gestión de Carta, Categorías y Productos (CUS04):**
  - Mantenimiento integral de categorías gastronómicas peruanas (Entradas, Segundos, Sopas, Bebidas, etc.).
  - Catálogo de productos con precios unitarios, códigos internos y control de disponibilidad activa/inactiva.
  - Clasificación de productos para venta directa a la carta o como componentes de menú del día.

- **Módulo 4: Menú del Día y Menús Completos Compuestos (CUS04.1, CUS05):**
  - Configuración diaria de la oferta gastronómica del restaurante.
  - Estructuración de "Menús Completos" con precio cerrado y partes parametrizables (Entrada, Segundo, Refresco).
  - Asociación de platos componentes con precio unitario cero dentro del paquete culinario.

- **Módulo 5: Toma de Pedidos en Salón y Armado de Menús (CUS07):**
  - Interfaz táctil ergonómica para mozos con teclado numérico y selector de platos.
  - Asistente guiado de selección con validación estricta de componentes requeridos antes de añadir al pedido.
  - Registro de observaciones de preparación por plato ("sin sal", "bien cocido", etc.).

- **Módulo 6: Registro de Pedidos Para Llevar y Mostrador (CUS08):**
  - Flujo rápido de atención en mostrador sin asignación de mesa física.
  - Captura de nombre del cliente y generación de ticket de empaque para despacho directo.

- **Módulo 7: Monitoreo y Administración de Pedidos Activos (CUS06):**
  - Bandeja centralizada de monitoreo con filtros por estado (Pendiente, En Preparación, Listo, Pagado, Anulado).
  - Anulación controlada de pedidos con registro obligatorio de motivo y liberación atómica de la mesa.

- **Módulo 8: KDS de Cocina y Despacho de Comandas (CUS09, CUS10):**
  - Sistema de Visualización de Cocina (*Kitchen Display System*) en tiempo real.
  - Generación automática de comandas con cronómetros dinámicos y semáforo visual de alerta de demora.
  - Notificaciones sonoras y modales al cambiar el estado de la comanda a "Listo".

- **Módulo 9: Caja, Cobros y Facturación Electrónica (CUS11):**
  - Liquidación multicanal de pedidos (Efectivo con cálculo de vuelto, Yape, Plin y Tarjeta POS).
  - Integración de consulta en línea a padrones de DNI (RENIEC) y RUC (SUNAT).
  - Regla fiscal de validación de DNI obligatorio en boletas simples $\ge$ S/ 700.00.
  - Emisión de comprobantes digitales (Ticket, Boleta Electrónica y Factura Electrónica).
  - Generación de representaciones impresas en PDF vectorial con el motor nativo `PdfCanvasBuilder`.

- **Módulo 10: Arqueo, Control de Turnos y Cierre de Caja (CUS13):**
  - Ciclo de vida completo de caja registradora: apertura con monto inicial y registro auditado de egresos.
  - Arqueo físico con desglose monetario por denominación de billetes y monedas.
  - Cálculo automático de descuadres (faltante/sobrante) y generación de acta oficial de cierre en PDF.

- **Módulo 11: Auditoría de Ventas, Reportes y Dashboard Gerencial (CUS12, CUS14, CUS15):**
  - Consulta histórica de comprobantes emitidos y ventas auditadas.
  - Reporte de cuadratura financiera contrastando ventas registradas frente a pagos declarados.
  - Ranking de productos más vendidos y métricas de productividad de mozos.
  - Dashboard interactivo con KPIs operacionales en tiempo real.

#### Arquitectura, Testing y DevOps
- **Clean Architecture en Backend:** Separación en 4 capas independientes (`Domain`, `Application`, `Infrastructure`, `API`) sobre ASP.NET Core 8.0 y C# 12.
- **Layered Frontend Architecture:** Cliente web modular sobre React 19, TypeScript y Tailwind CSS 4 con `@tailwindcss/vite`.
- **Suite de Pruebas Automatizadas:** 91 pruebas unitarias y de integración en xUnit con Moq y EF Core InMemory.
- **Integración Continua (CI/CD):** Pipeline automatizado en GitHub Actions (`.github/workflows/ci.yml`) que valida compilación y tests en cada push/PR.
- **Contenedorización Docker:** Archivo `docker-compose.yml` para levantar PostgreSQL con script de inicialización automático.
- **Documentación Académica:** Documento técnico formal estructurado bajo el estándar IEEE y el modelo de calidad ISO/IEC 25010 (`docs/DOCUMENTO_TECNICO_GIRASOLESRES_IEEE.md` y `.docx`).

---

### Modificado
- Estandarización de tablas en todos los módulos con escala tipográfica única y números tabulares (`tabular-nums`).
- Armonización de modales y diálogos con paleta corporativa cálida (`#3A2211` y `#D35400`).
- Refactorización de la pantalla de Login a diseño *split-screen* 60/40 sin desbordes verticales y con slot anti-salto de scroll (CLS = 0).

---

### Corregido
- Bloqueo preventivo en backend y frontend para impedir el cobro de pedidos en estado "Pendiente" o "En Preparación" en cocina.
- Saneamiento y anulación atómica de pedidos huérfanos de pruebas anteriores (`database/cleanup_orphaned_orders.sql`).
- Corrección de rutas relativas de assets del logo institucional (`/favicon.png` y `/LOGO_GIRASOLES.png`).
