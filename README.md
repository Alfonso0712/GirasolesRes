# GirasolesRes — Sistema de Gestión Gastronómica, Punto de Venta (POS) y Control Operativo

[![Build and Test CI](https://github.com/Alfonso0712/GirasolesRes/actions/workflows/ci.yml/badge.svg)](https://github.com/Alfonso0712/GirasolesRes/actions/workflows/ci.yml)
[![Tests Passing](https://img.shields.io/badge/xUnit%20Tests-271%20Passing-brightgreen.svg?logo=dotnet)](tests/GirasolesRes.Tests/)
[![.NET 8](https://img.shields.io/badge/.NET-8.0%20LTS-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![React 19](https://img.shields.io/badge/React-19.2.8-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind%20CSS-4.3.3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

Plataforma web transaccional integral diseñada para optimizar el ciclo operativo, sincronizar en tiempo real el salón, la cocina (KDS) y la caja registradora, y garantizar el cumplimiento tributario (SUNAT) y la cuadratura financiera del restaurante **"Girasoles"**.

---

## Índice

- [1. Stack Tecnológico](#1-stack-tecnológico)
- [2. Arquitectura del Sistema](#2-arquitectura-del-sistema)
- [3. Módulos Funcionales (11 Módulos / CUS01 a CUS15)](#3-módulos-funcionales-11-módulos--cus01-a-cus15)
- [4. Requisitos Previos](#4-requisitos-previos)
- [5. Inicio Rápido](#5-inicio-rápido)
  - [Opción A: Despliegue con Docker Compose (Recomendado)](#opción-a-despliegue-con-docker-compose-recomendado)
  - [Opción B: Despliegue en Entorno Local](#opción-b-despliegue-en-entorno-local)
- [6. Integración Continua (CI) y Suite de Pruebas Automatizadas](#6-integración-continua-ci-y-suite-de-pruebas-automatizadas)
- [7. Cuentas Semilla de Desarrollo (`Seed`)](#7-cuentas-semilla-de-desarrollo-seed)
- [8. Seguridad y Configuración](#8-seguridad-y-configuración)
- [9. Arquitectura y Gobernanza](#9-arquitectura-y-gobernanza)

---

## 1. Stack Tecnológico

| Capa / Componente | Tecnología | Versión | Rol Arquitectónico |
| :--- | :--- | :---: | :--- |
| **Backend Framework** | ASP.NET Core Web API | `8.0.6` | API RESTful con inyección de dependencias nativa y middleware modular. |
| **Lenguaje Backend** | C# | `12.0` | Tipado estricto, pattern matching y records inmutables. |
| **Acceso a Datos (ORM)**| Entity Framework Core & Npgsql | `9.0.2` | Consultas tipadas en LINQ, migraciones y transacciones ACID. |
| **Base de Datos** | PostgreSQL | `18` | Motor relacional con integridad referencial, auditoría inmutable por triggers y respaldo lógico. |
| **Seguridad y Cripto** | JWT Bearer & PBKDF2 | `9.0.0` | Tokens firmados con HS256 y hashing de claves (100k iteraciones, salt 128b). |
| **Generador PDF** | `PdfCanvasBuilder` | Nativo C# | Motor vectorial de bajo nivel sin librerías de terceros (comprobantes y actas). |
| **Frontend Framework**| React | `19.2.8` | UI declarativa basada en componentes y hooks de ciclo de vida. |
| **Lenguaje Frontend** | TypeScript | `6.0.2` | Verificación estática de tipos en tiempo de compilación. |
| **Build Tool / Bundler**| Vite | `8.3.0` | Compilador ultrarrápido ESM con tiempos de build < 2.5s. |
| **Framework CSS** | Tailwind CSS | `4.3.3` | Estilos de utilidad con compilador nativo `@tailwindcss/vite`. |
| **Testing** | xUnit & Moq | `2.9.2` | Suite de 96 pruebas unitarias y de integración sobre casos de uso. |
| **Integración Continua**| GitHub Actions CI | `v4` | Pipeline automatizado de restore, build y test en cada push/PR. |

---

## 2. Arquitectura del Sistema

El proyecto implementa una arquitectura cliente-servidor desacoplada siguiendo los principios de **Clean Architecture** en el backend y **Arquitectura Basada en Componentes (Component-Based Architecture)** en el frontend:

```text
GirasolesRes/
├── .github/workflows/          # Integración Continua (GitHub Actions CI)
├── docker-compose.yml          # Orquestación de PostgreSQL 18 y API REST
├── GirasolesRes.sln            # Solución .NET estándar
├── CHANGELOG.md                # Historial de cambios y entregas (SemVer)
├── AGENTS.md                   # Reglas y gobernanza de arquitectura y desarrollo
├── database/                   # Scripts de inicialización y migraciones SQL
│   ├── init_girasoles_db.sql
│   ├── cleanup_orphaned_orders.sql
│   └── README.md
├── backend/                    # Backend ASP.NET Core 8 (Clean Architecture)
│   ├── GirasolesRes.Domain/          # Núcleo: Entidades POCO (24) y Enums
│   ├── GirasolesRes.Application/     # Casos de uso, DTOs, Result<T>, Interfaces
│   ├── GirasolesRes.Infrastructure/  # EF Core, Npgsql, Repositorios, Seguridad, PDF
│   └── GirasolesRes.API/             # 16 Controladores REST, Middleware, Swagger
├── frontend/                   # Frontend React 19 + TypeScript + Vite + Tailwind 4
│   ├── src/
│   │   ├── components/         # Arquitectura Basada en Componentes
│   │   │   ├── ui/             # Componentes base reutilizables (Button, Modal, StatCard, Badge...)
│   │   │   ├── layout/         # Componentes estructurales (Header, Sidebar, PageHeader...)
│   │   │   └── <dominio>/      # Bloques de dominio (mesas/, cocina/, caja/, pedidos/, cobros/...)
│   │   ├── layouts/            # Layouts base (MainLayout, AuthLayout 60/40)
│   │   ├── pages/              # Vistas contenedoras / orquestadores de páginas
│   │   ├── services/           # Cliente HTTP centralizado (apiClient.ts) y APIs tipadas
│   │   ├── hooks/              # Custom hooks de lógica de negocio desacoplada
│   │   ├── types/              # Contratos tipados en TypeScript
│   │   └── utils/              # Utilidades puras de moneda y fechas
└── tests/                      # Suite de Pruebas Automatizadas (96 Tests)
    └── GirasolesRes.Tests/     # Pruebas de Dominio, Aplicación, Casos de Uso y Result
```

---

## 3. Módulos Funcionales (11 Módulos / CUS01 a CUS15)

1. **Seguridad y Accesos (CUS01, CUS01.1, CUS01.2):** Login con diseño corporativo 60/40, JWT, control de roles (RBAC), recuperación de clave y caducidad por inactividad a los 30 min.
2. **Salón y Mesas (CUS02):** Distribución visual de mesas con estados dinámicos (Libre, Ocupada, Reservada) y bloqueo de borrado con pedidos activos.
3. **Carta y Productos (CUS04):** Categorías gastronómicas, precios unitarios, disponibilidad y diferenciación de productos a la carta vs. componentes de menú.
4. **Menú del Día y Menús Completos (CUS04.1, CUS05):** Parametrización diaria de menú compuesto con precio cerrado y partes obligatorias (Entrada, Segundo, Refresco).
5. **Toma de Pedidos en Mesa (CUS07):** Captura táctil ergonómica con asistente de selección de partes de menú, notas de cocina y cálculo de subtotales.
6. **Pedidos Para Llevar (CUS08):** Atención acelerada en mostrador sin retención de mesa física y generación de ticket de despacho.
7. **Monitoreo de Pedidos (CUS06):** Grilla operativa en tiempo real con transiciones de estado (Pendiente, En Preparación, Listo, Pagado, Anulado) y motivos de cancelación.
8. **KDS de Cocina (CUS09, CUS10):** Pantalla de cocina digitalizada con comandas cronológicas, semáforo visual de demoras y avisos sonoros de despacho.
9. **Caja y Cobros (CUS11):** Liquidación multicanal (Efectivo con cálculo de vuelto, Yape, Plin, Tarjeta POS), validación en línea de DNI (RENIEC) y RUC (SUNAT), validación fiscal estricta ($\ge$ S/ 700.00) y emisión de PDF vectorial.
10. **Arqueo y Cierre de Caja (CUS13):** Apertura de turno con monto inicial, arqueo físico con desglose de billetes/monedas y acta oficial de cierre en PDF.
11. **Auditoría, Reportes y Dashboard (CUS12, CUS14, CUS15):** Reporte de cuadratura financiera, ranking de platos más vendidos, métricas de mozos y dashboard en tiempo real.

---

## 4. Requisitos Previos e Instalación por Sistema

- [.NET SDK 8.0 LTS](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 22 LTS](https://nodejs.org/) y npm (compatibles con frontend web y cliente móvil)
- [PostgreSQL 18](https://www.postgresql.org/) (motor y herramientas cliente `psql`, `pg_dump`, `pg_restore`, versión unificada con CI y volcado oficial)
- [Docker y Docker Compose](https://www.docker.com/) *(opcional, recomendado para despliegue en contenedores)*

### Instalación rápida en Windows (PowerShell con `winget`)

```powershell
winget install Microsoft.DotNet.SDK.8
winget install OpenJS.NodeJS.LTS
winget install PostgreSQL.PostgreSQL.18
# Opcional para Android: Java JDK 17 y Android Studio
```

### Instalación rápida en Linux (Ubuntu / Debian)

```bash
# .NET 8 SDK
sudo apt-get update && sudo apt-get install -y dotnet-sdk-8.0

# Node.js 22 LTS (vía repositorio oficial NodeSource)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL 18 (repositorio PGDG oficial)
sudo apt-get install -y curl ca-certificates
sudo install -d /usr/share/postgresql-common/pgdg
sudo curl -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc --fail https://www.postgresql.org/media/keys/ACCC4CF8.asc
echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list
sudo apt-get update && sudo apt-get install -y postgresql-18 postgresql-client-18
```

---

## 5. Inicio Rápido

### Opción A: Despliegue con Docker Compose (Recomendado)

1. Copia `.env.example` a `.env` en la raíz y completa tus credenciales (`POSTGRES_PASSWORD`, `JWT_SECRET_KEY`, `APISPERU_TOKEN`, etc.).
2. Levanta PostgreSQL y la API configurados mediante variables de entorno:

```bash
cp .env.example .env
docker compose up -d
```

La base de datos estará disponible en `127.0.0.1:5432` y la API en `http://localhost:5050` (en `Production`, Swagger queda deshabilitado por defecto).

Luego, si deseas ejecutar Backend y Frontend manualmente en desarrollo:

```bash
# 1. Configura tus user-secrets de desarrollo (sin guardar secretos en appsettings.json):
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<SU_CADENA_CONEXION_POSTGRESQL>" --project backend/GirasolesRes.API
dotnet user-secrets set "Jwt:SecretKey" "<SU_CLAVE_JWT_MINIMO_32_CARACTERES>" --project backend/GirasolesRes.API
dotnet user-secrets set "Seed:PasswordInicial" "<SU_PASSWORD_INICIAL_DESARROLLO>" --project backend/GirasolesRes.API
dotnet user-secrets set "ApisPeru:Token" "<SU_TOKEN_APISPERU>" --project backend/GirasolesRes.API

# 2. En una terminal (Backend en Development):
dotnet run --project backend/GirasolesRes.API/GirasolesRes.API.csproj

# 3. En otra terminal (Frontend):
cd frontend
npm install
npm run dev
```

- **Frontend:** `http://localhost:5173`
- **Backend API & Swagger UI (solo Development):** `http://localhost:5050/swagger`

---

### Opción B: Despliegue en Entorno Local

1. **Configurar la base de datos:**  
   Restaura el script de inicialización en tu instancia de PostgreSQL local:
   ```bash
   psql -U postgres -d girasoles_db -f database/init_girasoles_db.sql
   ```

2. **Ejecutar el Backend:**
   ```bash
   dotnet restore GirasolesRes.sln
   dotnet run --project backend/GirasolesRes.API/GirasolesRes.API.csproj
   ```

3. **Ejecutar el Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 6. Integración Continua (CI) y Suite de Pruebas Automatizadas

La insignia `Build and Test CI` al inicio de este documento refleja el estado del workflow [.github/workflows/ci.yml](.github/workflows/ci.yml) sobre la rama `main` (`push` y `pull_request`):

- **`backend-ci` (.NET 8 + PostgreSQL 18):** compila la solución en `Release`, inicializa el esquema con `database/init_girasoles_db.sql`, ejecuta todas las pruebas xUnit recolectando cobertura (`XPlat Code Coverage` vía `coverlet.collector`), publica el resumen de conteos en el job y sube el artefacto `backend-coverage`.
- **`frontend-ci` (Node 20):** ejecuta `npm run lint` (`oxlint`), `npm test` (`vitest run`) y `npm run build` (`tsc -b && vite build`).
- **`mobile-ci` (Node 22):** ejecuta `npm run verify:todo` (ESLint + `jsx-a11y`, cobertura Vitest, builds producción/demo, `verify-connection.mjs`, reglas de layout y arquitectura) y `npm run check:budget`.
- **Dependabot (`.github/dependabot.yml`):** revisión semanal automática para NuGet (`backend/` y `tests/`), npm (`frontend/` y `mobile/`) y `github-actions`.

```bash
# Ejecutar suite backend localmente (requiere cadena de pruebas en TEST_CONNECTION_STRING)
dotnet test GirasolesRes.sln
```

---

## 7. Cuentas Semilla de Desarrollo (`Seed`)

Cuando `Seed__Habilitado=true` (valor por defecto únicamente en `Development`; en `Production` es `false`) y la tabla `usuarios` está vacía, el inicializador crea las cuentas base usando la contraseña definida obligatoriamente en `Seed__PasswordInicial` (vía `user-secrets` o variable de entorno; sin valor por defecto en código y sin modificar usuarios existentes):

| Rol | Usuario | Contraseña | Permisos Operativos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin` | `<Seed__PasswordInicial>` | Acceso irrestricto: Usuarios, Carta, Salón, Caja, Reportes y Auditoría. |
| **Cajero** | `atorres` | `<Seed__PasswordInicial>` | Apertura/cierre de caja, liquidación de pedidos y emisión de comprobantes. |
| **Mozo** | `lperez` | `<Seed__PasswordInicial>` | Mapa de salón, toma de pedidos en mesa y mostrador. |
| **Cocinero** | `msoto` | `<Seed__PasswordInicial>` | Pantalla KDS de cocina, preparación y despacho de comandas. |

---

## 8. Seguridad y Configuración

### Política de Secretos y Arranque Seguro

- Ningún archivo versionado (`appsettings.json`, código C#, `docker-compose.yml`) contiene contraseñas, tokens ni claves reales. Use las plantillas [backend/GirasolesRes.API/appsettings.Example.json](backend/GirasolesRes.API/appsettings.Example.json) y [.env.example](.env.example).
- Al arrancar, la API valida que existan `ConnectionStrings:DefaultConnection` y `Jwt:SecretKey` (mínimo 32 caracteres y no débil/marcador) y que, si `Seed:Habilitado` es `true`, esté definida `Seed:PasswordInicial`. Si falta o es inválida, la aplicación detiene el arranque sin imprimir el valor secreto.
- En producción (`ASPNETCORE_ENVIRONMENT=Production`), `Swagger` y el sembrado de usuarios (`Seed__Habilitado`) quedan deshabilitados por defecto, y se habilita `HSTS`. `UseHttpsRedirection` se omite deliberadamente porque Kestrel atiende HTTP local detrás del túnel HTTPS Cloudflare, evitando bucles de redirección.

### Cómo generar una clave JWT segura (sin ejemplos reales)

Genere al menos 32 bytes aleatorios criptográficos (mínimo 256 bits) y guárdelos únicamente en `user-secrets` (desarrollo) o variables de entorno (servidor):

```bash
# Linux / macOS / Git Bash (OpenSSL):
openssl rand -base64 48
```

```powershell
# Windows PowerShell (.NET):
[Convert]::ToBase64String((1..48 | ForEach-Object { [byte](Get-Random -Minimum 0 -Maximum 256) }))
```

*(Para máxima entropía en PowerShell con CSPRNG, use `[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(48))`.)*

### Configuración local en Desarrollo (`dotnet user-secrets`)

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<SU_CADENA_CONEXION_POSTGRESQL>" --project backend/GirasolesRes.API
dotnet user-secrets set "Jwt:SecretKey" "<SU_CLAVE_JWT_GENERADA>" --project backend/GirasolesRes.API
dotnet user-secrets set "Seed:PasswordInicial" "<SU_PASSWORD_INICIAL_DESARROLLO>" --project backend/GirasolesRes.API
dotnet user-secrets set "ApisPeru:Token" "<SU_TOKEN_APISPERU>" --project backend/GirasolesRes.API
dotnet user-secrets set "Email:ApiKey" "<SU_API_KEY_MAILJET>" --project backend/GirasolesRes.API
dotnet user-secrets set "Email:SecretKey" "<SU_SECRET_KEY_MAILJET>" --project backend/GirasolesRes.API
dotnet user-secrets set "Email:DestinatarioDePrueba" "<SU_CORREO_PRUEBA_DEV>" --project backend/GirasolesRes.API
```

### Variables de Entorno Requeridas en el Servidor Real (`Production`)

| Variable | Obligatoria | Valor por defecto | Descripción |
| :--- | :---: | :--- | :--- |
| `ASPNETCORE_ENVIRONMENT` | Sí | `Production` | Define el modo de ejecución del servidor. |
| `ConnectionStrings__DefaultConnection` | Sí | *(ninguno)* | Cadena de conexión a PostgreSQL. |
| `Jwt__SecretKey` | Sí | *(ninguno)* | Clave aleatoria HMAC-SHA256 ($\ge 32$ caracteres). |
| `Jwt__Issuer` | No | `GirasolesRes` | Emisor del token JWT. |
| `Jwt__Audience` | No | `GirasolesResApp` | Audiencia válida del token JWT. |
| `Jwt__ExpiracionMinutos` | No | `30` | Vigencia del token JWT en minutos (`1..1440`). |
| `ApisPeru__BaseUrl` | No | `https://dniruc.apisperu.com/api/v1` | URL base para consultas RENIEC/SUNAT. |
| `ApisPeru__Token` | Recomendada | *(vacío)* | Token de ApisPeru para DNI/RUC en cobros. |
| `Email__ApiKey` | Recomendada | *(vacío)* | API Key de Mailjet para recuperación de contraseña. |
| `Email__SecretKey` | Recomendada | *(vacío)* | Secret Key de Mailjet. |
| `Email__FromEmail` | No | `no-reply@girasolesres.pp.ua` | Dirección remitente verificada. |
| `Email__FromName` | No | `Restaurante Girasoles` | Nombre visible del remitente. |
| `Email__DestinatarioDePrueba` | No | *(ignorado en Prod)* | Redirección de correos válida solo en `Development`. |
| `Seed__Habilitado` | No | `false` (Prod) / `true` (Dev) | Controla la creación inicial de usuarios si la tabla está vacía. |
| `Seed__PasswordInicial` | Si `Seed=true` | *(ninguno)* | Contraseña inicial mínima de 8 caracteres para cuentas semilla nuevas. |
| `Swagger__Habilitado` | No | `false` (Prod) / `true` (Dev) | Habilita o deshabilita Swagger UI. |
| `RateLimit__Autenticacion__PermitLimit` | No | `10` | Intentos permitidos por ventana en `/api/auth/login`, `/forgot-password`, `/reset-password`. |
| `RateLimit__Autenticacion__VentanaSegundos` | No | `60` | Duración de la ventana fija de autenticación en segundos. |
| `RateLimit__Global__PermitLimit` | No | `300` | Límite global generoso por usuario autenticado o IP. |
| `RateLimit__Global__VentanaSegundos` | No | `60` | Ventana del límite global en segundos. |
| `Seguridad__LimpiezaTokensDias` | No | `7` | Periodicidad en días para purgar `tokens_revocados` expirados. |

---

## 9. Arquitectura y Gobernanza

- 📐 **Estándares y Reglas de Desarrollo:** [AGENTS.md](AGENTS.md)
- 📜 **Historial de Versiones:** [CHANGELOG.md](CHANGELOG.md)
- 🗄️ **Base de Datos y Scripts:** [database/README.md](database/README.md)
