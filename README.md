# GirasolesRes — Sistema de Gestión Gastronómica, Punto de Venta (POS) y Control Operativo

[![Build and Test CI](https://github.com/Alfonso0712/GirasolesRes/actions/workflows/ci.yml/badge.svg)](https://github.com/Alfonso0712/GirasolesRes/actions/workflows/ci.yml)
[![Tests Passing](https://img.shields.io/badge/xUnit%20Tests-96%20Passing-brightgreen.svg?logo=dotnet)](tests/GirasolesRes.Tests/)
[![.NET 8](https://img.shields.io/badge/.NET-8.0%20LTS-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![React 19](https://img.shields.io/badge/React-19.2.8-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20%7C%2018-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind%20CSS-4.3.3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Quality Model](https://img.shields.io/badge/Calidad-ISO%2FIEC%2025010-D35400)](docs/DOCUMENTO_TECNICO_GIRASOLESRES_IEEE.md)

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
- [6. Suite de Pruebas Automatizadas (96 Tests)](#6-suite-de-pruebas-automatizadas-96-tests)
- [7. Credenciales de Demostración](#7-credenciales-de-demostración)
- [8. Documentación Académica y Técnica](#8-documentación-académica-y-técnica)

---

## 1. Stack Tecnológico

| Capa / Componente | Tecnología | Versión | Rol Arquitectónico |
| :--- | :--- | :---: | :--- |
| **Backend Framework** | ASP.NET Core Web API | `8.0.6` | API RESTful con inyección de dependencias nativa y middleware modular. |
| **Lenguaje Backend** | C# | `12.0` | Tipado estricto, pattern matching y records inmutables. |
| **Acceso a Datos (ORM)**| Entity Framework Core & Npgsql | `9.0.2` | Consultas tipadas en LINQ, migraciones y transacciones ACID. |
| **Base de Datos** | PostgreSQL | `16 / 18` | Motor relacional con integridad referencial y auditoría transaccional. |
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

El proyecto implementa una arquitectura cliente-servidor desacoplada siguiendo los principios de **Clean Architecture** en el backend y **Layered Architecture** en el frontend:

```text
GirasolesRes/
├── .github/workflows/          # Integración Continua (GitHub Actions CI)
├── docker-compose.yml          # Contenedor de PostgreSQL 16 con init script
├── GirasolesRes.sln            # Solución .NET estándar
├── GirasolesRes.slnx           # Solución moderna de Visual Studio 2022
├── CHANGELOG.md                # Historial de cambios y entregas (SemVer)
├── docs/                       # Documentación técnica formal
│   ├── DOCUMENTO_TECNICO_GIRASOLESRES_IEEE.md
│   ├── DOCUMENTO_TECNICO_GIRASOLESRES_IEEE.docx
│   └── database/DATA_DICTIONARY.md   # Diccionario de 24 tablas PostgreSQL
├── database/                   # Backups y scripts de inicialización SQL
│   ├── init_girasoles_db.sql
│   ├── backup_completo_girasoles_db.sql
│   └── cleanup_orphaned_orders.sql
├── backend/                    # Backend ASP.NET Core 8 (Clean Architecture)
│   ├── GirasolesRes.Domain/          # Núcleo: Entidades POCO (24) y Enums
│   ├── GirasolesRes.Application/     # Casos de uso, DTOs, Result<T>, Interfaces
│   ├── GirasolesRes.Infrastructure/  # EF Core, Npgsql, Repositorios, Seguridad, PDF
│   └── GirasolesRes.API/             # 16 Controladores REST, Middleware, Swagger
├── frontend/                   # Frontend React 19 + TypeScript + Vite + Tailwind 4
│   ├── src/
│   │   ├── components/         # Componentes presentacionales atómicos y modales
│   │   ├── layouts/            # Layouts base (MainLayout, AuthLayout 60/40)
│   │   ├── pages/              # Vistas contenedoras por módulo funcional
│   │   ├── services/           # Cliente HTTP centralizado (apiClient.ts) y APIs
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

## 4. Requisitos Previos

- [.NET SDK 8.0+](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20+ LTS](https://nodejs.org/) y npm
- [Docker y Docker Compose](https://www.docker.com/) (opcional para ejecución en contenedores)
- [PostgreSQL 16 o 18](https://www.postgresql.org/) (si se ejecuta sin Docker)

---

## 5. Inicio Rápido

### Opción A: Despliegue con Docker Compose (Recomendado)

Levanta la base de datos PostgreSQL con el esquema y datos iniciales preconfigurados:

```bash
docker compose up -d
```

La base de datos estará disponible en `localhost:5432` con la base de datos `girasoles_db` ya inicializada.

Luego, inicia el Backend y el Frontend:

```bash
# 1. En una terminal (Backend):
dotnet run --project backend/GirasolesRes.API/GirasolesRes.API.csproj

# 2. En otra terminal (Frontend):
cd frontend
npm install
npm run dev
```

- **Frontend:** `http://localhost:5173`
- **Backend API & Swagger UI:** `http://localhost:5050/swagger`

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

## 6. Suite de Pruebas Automatizadas (96 Tests)

El proyecto cuenta con **96 pruebas unitarias y de integración** formuladas con xUnit, Moq y Microsoft.EntityFrameworkCore.InMemory, validando casos de uso, transacciones atómicas, reglas de negocio y el patrón `Result<T>`:

```bash
dotnet test GirasolesRes.sln
```

Salida esperada:
```text
Correctas! - Con error: 0, Superado: 96, Omitido: 0, Total: 96
```

---

## 7. Credenciales de Demostración

El sistema incluye cuentas de prueba operativas precargadas:

| Rol | Usuario | Contraseña | Permisos Operativos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin` | `Password123!` | Acceso irrestricto: Usuarios, Carta, Salón, Caja, Reportes y Auditoría. |
| **Cajero** | `atorres` | `Password123!` | Apertura/cierre de caja, liquidación de pedidos y emisión de comprobantes. |
| **Mozo** | `lperez` | `Password123!` | Mapa de salón, toma de pedidos en mesa y mostrador. |
| **Cocinero** | `msoto` | `Password123!` | Pantalla KDS de cocina, preparación y despacho de comandas. |

---

## 8. Documentación Académica y Técnica

- 📄 **Documento Técnico Académico (IEEE / ISO/IEC 25010):** [docs/DOCUMENTO_TECNICO_GIRASOLESRES_IEEE.md](docs/DOCUMENTO_TECNICO_GIRASOLESRES_IEEE.md) | Versión Word: [docs/DOCUMENTO_TECNICO_GIRASOLESRES_IEEE.docx](docs/DOCUMENTO_TECNICO_GIRASOLESRES_IEEE.docx)
- 🗄️ **Diccionario de Datos (24 Tablas):** [docs/database/DATA_DICTIONARY.md](docs/database/DATA_DICTIONARY.md)
- 📜 **Historial de Versiones:** [CHANGELOG.md](CHANGELOG.md)
- 🎨 **Sistema de Diseño y Calidad UI/UX:** [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | [MANUAL_ESTANDARES_CALIDAD_UI.md](MANUAL_ESTANDARES_CALIDAD_UI.md)
