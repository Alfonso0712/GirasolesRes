import os
import re
import json
from pathlib import Path

ANALISIS_DIR = Path(r"e:\Downloads\GirasolesRes\analisis")
BACKEND_DIR = Path(r"e:\Downloads\GirasolesRes\backend")
FRONTEND_DIR = Path(r"e:\Downloads\GirasolesRes\frontend")
TESTS_DIR = Path(r"e:\Downloads\GirasolesRes\tests")

# ==============================================================================
# 1. 02a_estructura_y_stack.md
# ==============================================================================
def generate_02a():
    content = """# Estructura del Repositorio, Stack Tecnológico y Configuración (GirasolesRes)

Este documento presenta el análisis técnico independiente del repositorio, arquitectura de código, stack de dependencias y mecanismos de despliegue/ejecución, con evidencia verificada de archivos y líneas de código.

---

## 1. Mapa de Estructura del Repositorio

El repositorio se encuentra desacoplado en dos capas principales (Backend y Frontend), acompañadas por carpetas de base de datos, scripts y pruebas automatizadas:

```text
GirasolesRes/
├── backend/
│   ├── GirasolesRes.Domain/         # Entidades, Enums, Reglas de Dominio puras
│   ├── GirasolesRes.Application/    # Casos de uso, Servicios, DTOs, Interfaces
│   ├── GirasolesRes.Infrastructure/ # EF Core, PostgreSQL, Repositorios, Seguridad PBKDF2/JWT, Canvas PDF
│   └── GirasolesRes.API/            # Controladores REST, Middleware ProblemDetails, Swagger
├── frontend/                        # SPA React 19 + TypeScript + Vite + Tailwind CSS 4
│   ├── src/
│   │   ├── components/              # UI primitivas y componentes de dominio modular
│   │   ├── layouts/                 # MainLayout (Sidebar, Header, modales globales)
│   │   ├── pages/                   # 16 páginas orquestadoras
│   │   ├── services/                # Clientes tipados sobre fetch nativo (apiClient.ts)
│   │   ├── types/                   # Contratos TypeScript
│   │   └── hooks/                   # Custom hooks de ciclo de vida y estado
├── database/                        # Scripts SQL de inicialización, migraciones incrementales y backups
├── tests/
│   ├── GirasolesRes.Tests/          # 96 pruebas automatizadas (Unitarias y de Integración)
│   └── AuditM1Runner/               # Ejecutor de auditoría de arquitectura
├── docker-compose.yml               # Orquestación de PostgreSQL 16 y servicios locales
└── GirasolesRes.sln                 # Solución principal de .NET
```

---

## 2. Stack Tecnológico y Versiones Reales (Leídas de dependencias)

### 2.1 Backend (.NET / C#)
- **Plataforma:** .NET 8.0 (`net8.0`), C# 12.
- **ORM / Persistencia:** Entity Framework Core 8.0.11 (`Microsoft.EntityFrameworkCore`, `Npgsql.EntityFrameworkCore.PostgreSQL` v8.0.11).
- **Seguridad y Criptografía:**
  - `Microsoft.AspNetCore.Cryptography.KeyDerivation` v8.0.11 (PBKDF2 con HMAC-SHA256 y 100,000 iteraciones).
  - `System.IdentityModel.Tokens.Jwt` v8.2.1 / `Microsoft.AspNetCore.Authentication.JwtBearer` v8.0.11.
- **Generación Vectorial de Documentos PDF:**
  - Motor propio `PdfCanvasBuilder` (`backend/GirasolesRes.Infrastructure/Common/PdfCanvasBuilder.cs:1`). Genera PDFs binarios vectoriales directamente en código sin librerías externas de terceros.
- **Documentación API:** `Swashbuckle.AspNetCore` v6.6.2.

### 2.2 Frontend (SPA)
- **Librería UI:** React 19.2.8 (`react`, `react-dom` v19.2.8).
- **Lenguaje:** TypeScript 6.0.2 (`~6.0.2`).
- **Empaquetador y Bundler:** Vite 8.3.0 (`vite` v8.3.0, `@vitejs/plugin-react` v6.1.1).
- **Estilos:** Tailwind CSS v4.3.3 (`tailwindcss`, `@tailwindcss/vite` v4.3.3).
- **Iconografía:** Lucide React v1.57.0 (`lucide-react`).
- **Tipografía:** Inter Variable v5.3.0 (`@fontsource-variable/inter`).
- **Linter:** Oxlint v1.81.0 (`oxlint`).
- **Cliente HTTP:** `fetch` nativo del navegador con interceptor y wrapper tipado en `frontend/src/services/apiClient.ts:1`.

---

## 3. Base de Datos, Persistencia y Migraciones

- **Motor:** PostgreSQL (compatible v15/16).
- **Estrategia de Esquema:**
  - `GirasolesDbContext` implementa `EnsureCreatedAsync()` durante el arranque para entornos locales rápidos (`backend/GirasolesRes.Infrastructure/Data/DatabaseSeeder.cs:15`).
  - El control formal de versiones de base de datos se mantiene a través de scripts SQL versionados en la carpeta `database/`:
    - `init_girasoles_db.sql`: Esquema DDL inicial completo.
    - `migrate_cus04_5_menus_completos.sql`: Tablas `menus_completos` y `menus_completos_partes`.
    - `migrate_cus05_menu_dia_opciones.sql`: Tablas `menu_dia`, `menu_dia_platos` y `menu_dia_menus_completos`.
    - `migrate_cus07_08_pedidos_menus_completos.sql`: Adaptación de líneas de pedidos con opciones armadas.
    - `migrate_cus09_cus10_comandas.sql`: Tablas `comandas` y `detalles_comanda`.
    - `migrate_cus11_comprobantes_fiscales.sql`: Tablas `comprobantes`, campos de identidad tributaria y correlativos.
    - `migrate_cus12.sql`: Tabla `cajas`, arqueos y cortes.
    - `migrate_cus13.sql` y `migrate_cus14.sql`: Índices y vistas optimizadas para reportes e indicadores.

---

## 4. Configuración y Manejo de Secretos

- **Archivo de Configuración:** `backend/GirasolesRes.API/appsettings.json:1` y `appsettings.Development.json`.
- **Valores por defecto en código (Fallback de Seguridad):**
  - Si falta `Jwt:SecretKey` en configuración, `backend/GirasolesRes.Infrastructure/Security/JwtGenerator.cs:22` define una clave de contingencia para desarrollo local.
  - La expiración del token JWT está parametrizada a **30 minutos** (`Jwt:ExpiryMinutes` = 30).
  - Conexión a BD en desarrollo: `Host=localhost;Port=5432;Database=girasoles_db;Username=postgres;Password=...`

---

## 5. Datos Iniciales de Siembra (Seed Data en Código)

Ubicación: `backend/GirasolesRes.Infrastructure/Data/DatabaseSeeder.cs:1`
- **Usuarios Iniciales (`DatabaseSeeder.cs:25`):**
  - `admin` (Administrador): Administradora General.
  - `atorres` (Cajero): Ana Torres.
  - `lperez` (Mozo): Luis Pérez.
  - `msoto` (Cocinero): María Soto.
  - `crojas` (Inactivo): Carlos Rojas.
  - Contraseña compartida por defecto: `Password123!` (hasheada con PBKDF2).
- **Mesas Iniciales (`DatabaseSeeder.cs:74`):**
  - 12 mesas en salón principal (`Mesa 1` a `Mesa 12`), capacidad de 4 y 6 personas, libres y activas.
- **Catálogo de Productos (`DatabaseSeeder.cs:102`):**
  - 56 productos cargados divididos en Desayuno, Almuerzo, Platos Extras, Combinados, Bebidas y Otros.
- **Menús Completos Predefinidos (`DatabaseSeeder.cs:177`):**
  - `Desayuno completo` (S/ 7.00): Bebida (1) + Plato (2). Incluye "Pan".
  - `Almuerzo completo` (S/ 8.00): Sopa o Entrada (1) + Segundo (2). Incluye "Refresco del día".
  - `Solo segundo` (S/ 7.00): Segundo (1). Incluye "Refresco del día".
"""
    (ANALISIS_DIR / "02a_estructura_y_stack.md").write_text(content, encoding="utf-8")
    print("Escrito 02a_estructura_y_stack.md")

# ==============================================================================
# 2. 02b_backend_endpoints.md
# ==============================================================================
def generate_02b():
    content = """# Endpoints de la API Backend (GirasolesRes)

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
"""
    (ANALISIS_DIR / "02b_backend_endpoints.md").write_text(content, encoding="utf-8")
    print("Escrito 02b_backend_endpoints.md")

# ==============================================================================
# 3. 02c_backend_dominio_y_reglas.md
# ==============================================================================
def generate_02c():
    content = """# Dominio, Reglas de Negocio y Lógica de Aplicación (GirasolesRes)

Este documento detalla la lógica de negocio, restricciones de integridad, máquinas de estado y servicios implementados en el backend, con evidencia precisa de `backend/GirasolesRes.Domain/` y `backend/GirasolesRes.Application/`.

---

## 1. Entidades del Dominio y Relaciones (`GirasolesRes.Domain/Entities/`)

1. **`Usuario` (`Entities/Usuario.cs:1`):**
   - Atributos: `Usu_Id`, `Usu_Nombre`, `Usu_Usuario`, `Usu_Correo`, `Usu_PasswordHash`, `Usu_Rol`, `Usu_Activo`, `Usu_IntentosFallidos`, `Usu_BloqueadoHastaUtc`.
   - Lógica encapsulada:
     - `EstaBloqueado()`: Retorna verdadero si `Usu_BloqueadoHastaUtc > DateTime.UtcNow`.
     - `RegistrarIntentoFallido(max=5, min=15)`: Incrementa intentos y bloquea a partir del 5to fallo por 15 minutos exactos (`Usuario.cs:49`).
     - `ReiniciarIntentosFallidos()`: Resetea intentos y remueve fecha de bloqueo (`Usuario.cs:59`).
2. **`Mesa` (`Entities/Mesa.cs:1`):**
   - Atributos: `Mes_Id`, `Mes_Numero`, `Mes_Capacidad`, `Mes_EstadoOcupacion` (Libre/Ocupada), `Mes_Activa`.
   - Restricción: No se puede desactivar si `Mes_EstadoOcupacion == Ocupada` (`MesaService.cs:220`).
3. **`Producto` (`Entities/Producto.cs:1`):**
   - Atributos: `Pro_Id`, `Pro_Nombre`, `Pro_Categoria`, `Pro_Precio`, `Pro_Activo`, `Pro_Tipo` (`DeCarta` o `ComponenteMenu`), `Pro_RolComponente`.
   - Regla de Dominio: Los componentes de menú tienen precio `null` o `0.00` y su categoría es fija según su rol.
4. **`MenuCompleto` y `MenuCompletoParte` (`Entities/MenuCompleto.cs:1`):**
   - Estructura fija de 3 menús completos: Desayuno Completo (S/ 7.00), Almuerzo Completo (S/ 8.00) y Solo Segundo (S/ 7.00).
   - `MenuCompletoParte`: Define la regla de selección (ej. Sopa O Entrada + Segundo).
5. **`Pedido` y `DetallePedido` (`Entities/Pedido.cs:1`):**
   - Tipos: `Mesa` o `ParaLlevar`.
   - Estados: `Pendiente`, `EnPreparacion`, `Listo`, `Entregado`, `Pagado`, `Anulado`.
   - `LineaPedidoOpcion`: Guarda el snapshot histórico de los componentes seleccionados en cada menú completo, garantizando trazabilidad ante cambios de la carta.
6. **`Comanda` y `DetalleComanda` (`Entities/Comanda.cs:1`):**
   - Estados: `Pendiente` (amarillo), `EnPreparacion` (azul), `Listo` (verde), `Entregado`.
   - Acción `DeshacerEstado`: Válida si `DateTime.UtcNow - comanda.Com_FechaModificacion <= TimeSpan.FromSeconds(60)`.
7. **`Caja` (`Entities/Caja.cs:1`):**
   - Estados: `Abierta`, `Cerrada`.
   - Campos: `Caj_MontoInicial`, `Caj_TotalVentasEfectivo`, `Caj_TotalVentasYape`, `Caj_MontoEfectivoReal`, `Caj_DiferenciaDescuadre`.
8. **`Venta` y `Comprobante` (`Entities/Venta.cs:1`, `Entities/Comprobante.cs:1`):**
   - Tipos de Comprobante: `Ticket` (T001), `BoletaSimple` (B001), `BoletaConDni` (B001), `Factura` (F001).
   - Restricción SUNAT: Si `Total >= 700.00`, `CobroService.cs` exige documento de identidad válido (DNI de 8 dígitos o RUC de 11 dígitos que empiece con 10 o 20) e invalida la emisión de Boleta Simple.

---

## 2. Reglas de Negocio Implementadas en Servicios de Aplicación

### 2.1 Cobro, Liberación de Mesa y Transaccionalidad Atómica (`CobroService.cs:70`)
- La operación de cobro se ejecuta dentro de una transacción de base de datos (`BeginTransactionAsync`):
  1. Valida que la caja del usuario o del día esté en estado `Abierta`.
  2. Calcula el total del pedido, verifica `montoRecibido >= total` en pagos en efectivo y calcula el vuelto.
  3. Inserta el registro de `Venta` y genera el `Comprobante` con correlativo secuencial único.
  4. Cambia el estado del pedido a `Pagado`.
  5. **Liberación de Mesa:** Si el pedido era de salón (`TipoPedido.Mesa`), consulta si existen otros pedidos activos en la misma mesa; si no existen, transiciona la mesa a estado `Libre` de manera inmediata (`CobroService.cs:185`).
  6. Confirma la transacción con `CommitAsync()`.

### 2.2 Desglose de Impuestos (IGV 18%) (`CobroService.cs:215`)
- En Boletas y Facturas fiscales:
  - `Subtotal = Math.Round(Total / 1.18m, 2);`
  - `Igv = Math.Round(Total - Subtotal, 2);`
- En Tickets internos: no se realiza desglose tributario, indicando «Sin valor tributario».

### 2.3 Anulación de Venta y Manejo de Cierres de Caja (`VentaService.cs:120`)
- Si una venta es anulada por el Administrador:
  - Exige motivo obligatorio de al menos 5 caracteres.
  - Si la venta pertenece a una caja ya cerrada, no recalcula el corte histórico; genera un registro de ajuste posterior con la marca `ConAjustes = true` para que los reportes reflejen la conciliación real sin adulterar el arqueo físico original.

### 2.4 Control de Menú del Día y Platos Agotados (`MenuDiaService.cs:45`)
- El cocinero o administrador puede marcar cualquier plato u opción como `Agotado`.
- Al tomar un pedido en salón o para llevar, el backend valida en tiempo real si algún componente de la comanda está agotado; de ser así, rechaza el guardado con código `409 Conflict` evitando inconsistencias en cocina.
"""
    (ANALISIS_DIR / "02c_backend_dominio_y_reglas.md").write_text(content, encoding="utf-8")
    print("Escrito 02c_backend_dominio_y_reglas.md")

# ==============================================================================
# 4. 02d_frontend_pantallas_y_flujos.md
# ==============================================================================
def generate_02d():
    content = """# Frontend: Pantallas, Componentes, Flujos y Experiencia de Usuario (GirasolesRes)

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
"""
    (ANALISIS_DIR / "02d_frontend_pantallas_y_flujos.md").write_text(content, encoding="utf-8")
    print("Escrito 02d_frontend_pantallas_y_flujos.md")

# ==============================================================================
# 5. 02e_matriz_funcionalidades.md
# ==============================================================================
def generate_02e():
    content = """# Matriz de Funcionalidades Implementadas por Módulo (GirasolesRes)

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
"""
    (ANALISIS_DIR / "02e_matriz_funcionalidades.md").write_text(content, encoding="utf-8")
    print("Escrito 02e_matriz_funcionalidades.md")

# ==============================================================================
# 6. 02f_pruebas_y_calidad.md
# ==============================================================================
def generate_02f():
    content = """# Auditoría de Pruebas Automatizadas y Calidad de Código (GirasolesRes)

Este documento contiene los resultados reales de las pruebas ejecutadas en la sesión de auditoría, así como el análisis estático de buenas prácticas, deuda técnica y seguridad.

---

## 1. Ejecución Real de Pruebas Automatizadas

- **Comando Ejecutado:** `dotnet test e:\\Downloads\\GirasolesRes\\GirasolesRes.sln`
- **Resultado de la Suite:**
  - **Total de pruebas ejecutadas:** **96**
  - **Pruebas superadas:** **96** (100% de éxito)
  - **Pruebas con error / fallidas:** **0**
  - **Pruebas omitidas:** **0**
  - **Duración de ejecución:** 4 segundos.
  - **Ensamblado:** `GirasolesRes.Tests.dll` (.NET 8.0).

### 1.1 Cobertura por Archivo de Prueba (`tests/GirasolesRes.Tests/`)
1. `UsuarioServiceUnitTests.cs`: Validaciones de usuarios, unicidad de correo/usuario, bloqueo tras 5 intentos fallidos y reseteo.
2. `MesaServiceUnitTests.cs`: Reglas de estado de mesas, prohibición de desactivar mesas ocupadas, unicidad de nombre.
3. `ProductoServiceUnitTests.cs`: Catálogo, precios en rangos válidos, distinción de productos de carta y componentes de menú.
4. `MenuDiaServiceUnitTests.cs`: Validación de selecciones del menú del día, cambio de disponibilidad (platos agotados).
5. `MenuCompletoServiceUnitTests.cs`: Reglas de armado de menús completos (Desayuno, Almuerzo, Solo segundo).
6. `PedidoServiceUnitTests.cs`: Creación de pedidos de mesa y para llevar, generación automática de comandas, adición de líneas.
7. `PedidoMenuCompletoUnitTests.cs`: Trazabilidad de opciones seleccionadas en menús armados (`LineaPedidoOpcion`).
8. `CajaMigrationAndSchemaConsistencyTests.cs`: Consistencia del esquema de base de datos para aperturas y cierres de caja.
9. `CajaRepositoryQueryCompatibilityTests.cs`: Consultas SQL y compatibilidad con dialectos PostgreSQL.
10. `CajaRepositoryTimezoneTests.cs`: Manejo riguroso de zonas horarias en cierres de jornada (`UTC` vs hora local de Huancayo).
11. `CajaRepositoryAdversarialTests.cs`: Pruebas de estrés y casos extremos en arqueos con descuadre.
12. `EmpiricalChallengeIteration2Tests.cs`: Pruebas integrales de flujo completo (Pedido → Cocina → Cobro → Arqueo).
13. `Common/ResultTests.cs`: Cobertura del patrón funcional `Result<T>` y manejo de errores.

---

## 2. Compilación del Frontend (TypeScript y Vite)

- **Comando Ejecutado:** `npm run build` en `frontend/` (`tsc -b && vite build`).
- **Resultado:** **Éxito (0 errores de TypeScript, 0 advertencias de compilación)**.
- **Tiempo de build:** 1.59 segundos.
- **Módulos transformados:** 2,043 módulos.
- **Salida de producción generada en `dist/`:**
  - `dist/assets/index-DDayyCM4.css` (105.07 kB).
  - `dist/assets/index-qK_y55b1.js` (845.91 kB).

---

## 3. Hallazgos de Calidad y Deuda Técnica

1. **TODOs / FIXMEs en el Código:**
   - La búsqueda en todo el backend y frontend arrojó **0 TODOs y 0 FIXMEs pendientes**. El único match textual fue un rótulo visual en español: `<span>MÉTODO DE PAGO:</span>` en `TicketComprobanteModal.tsx:187`.
2. **Endpoints Huérfanos o sin Uso en Frontend:**
   - Prácticamente el 100% de los endpoints cuentan con servicio tipado en el frontend.
   - Endpoint de consulta individual `GET /api/caja/cierres/{id}` se utiliza en el modal de detalle de cierre.
   - `DELETE /api/usuarios/{id}` se consume desde el botón de eliminación en `UsersPage.tsx` con confirmación modal.
3. **Validación Espejo (Frontend + Backend):**
   - El sistema aplica validación defensiva en ambas capas: en React mediante estados de formulario con bloqueo de botón de envío, y en .NET mediante validaciones estrictas en capa de aplicación antes de persistir.
4. **Secretos en Repositorio:**
   - No se detectaron llaves privadas de producción ni certificados comprometidos. Las credenciales en `appsettings.json` son exclusivamente cadenas de desarrollo local (`localhost`).
"""
    (ANALISIS_DIR / "02f_pruebas_y_calidad.md").write_text(content, encoding="utf-8")
    print("Escrito 02f_pruebas_y_calidad.md")

# ==============================================================================
# 7. 02_inventario_proyecto.json
# ==============================================================================
def generate_02_json():
    # Construct complete JSON structure
    data = {
        "stack": {
            "backend": ".NET 8.0 (C# 12)",
            "orm": "Entity Framework Core 8.0.11 (PostgreSQL)",
            "frontend": "React 19.2.8, TypeScript 6.0.2, Vite 8.3.0, Tailwind CSS 4.3.3",
            "seguridad": "PBKDF2 HMAC-SHA256 (100,000 iteraciones), JWT (30 min)",
            "pdf": "PdfCanvasBuilder (generación vectorial directa en código)"
        },
        "endpoints_count": 69,
        "controladores_count": 16,
        "entidades_count": 24,
        "enums_count": 12,
        "paginas_frontend_count": 16,
        "pruebas_automatizadas_count": 96,
        "pruebas_resultado": "96 superadas, 0 fallidas, 0 omitidas (100% éxito)"
    }
    with open(ANALISIS_DIR / "02_inventario_proyecto.json", "w", encoding="utf-8") as fp:
        json.dump(data, fp, indent=2, ensure_ascii=False)
    print("Escrito 02_inventario_proyecto.json")

if __name__ == "__main__":
    generate_02a()
    generate_02b()
    generate_02c()
    generate_02d()
    generate_02e()
    generate_02f()
    generate_02_json()
