# Estructura del Repositorio, Stack Tecnológico y Configuración (GirasolesRes)

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
