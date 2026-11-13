# Reglas de Arquitectura y Guía para Agentes y Desarrolladores (AGENTS.md)

Este documento establece los principios de arquitectura, patrones de diseño y estándares de desarrollo obligatorios para cualquier colaborador o agente de inteligencia artificial que trabaje en el proyecto **GirasolesRes**.

---

## 1. Visión General de la Arquitectura

El sistema está estructurado bajo un paradigma de **Arquitectura Cliente-Servidor Desacoplada**:
- **Backend:** Clean Architecture en ASP.NET Core 8 (.NET 8, C# 12, Entity Framework Core 8, PostgreSQL).
- **Frontend:** Arquitectura Basada en Componentes (*Component-Based Architecture*) sobre React 19, TypeScript, Vite y Tailwind CSS 4.

---

## 2. Estándares del Backend (Clean Architecture)

### 2.1 Estructura de Capas
1. **`GirasolesRes.Domain` (Núcleo):**
   - Entidades POCO puras y Enumeraciones de dominio.
   - Sin dependencias de frameworks externos o librerías de persistencia.
2. **`GirasolesRes.Application` (Casos de Uso):**
   - Contratos e interfaces (`Interfaces/Persistence/`, `Interfaces/Services/`).
   - DTOs de entrada y salida (`DTOs/`).
   - Casos de uso y servicios de aplicación (`Services/`).
   - Manejo de flujo y errores mediante el patrón `Result<T>`.
3. **`GirasolesRes.Infrastructure` (Implementación Técnica):**
   - Implementación de persistencia con EF Core (`ApplicationDbContext.cs`, `Repositories/`).
   - Seguridad criptográfica (PBKDF2 con HMAC-SHA256, JWT Bearer).
   - Generación vectorial de comprobantes y actas PDF (`PdfCanvasBuilder`).
4. **`GirasolesRes.API` (Punto de Entrada HTTP):**
   - 16 Controladores REST delgados (*Thin Controllers*).
   - Middleware de manejo global de excepciones y validaciones RFC 7807 (*ProblemDetails*).

### 2.2 Reglas Estrictas del Backend
- **Prohibido colocar lógica de negocio en los controladores:** Los controladores únicamente reciben requests, validan ModelState, delegan al servicio de aplicación y retornan el código HTTP correspondiente (`200 OK`, `201 Created`, `400 BadRequest`, `404 NotFound`).
- **Uso estricto de DTOs:** Jamás exponer entidades de dominio directamente en las respuestas de la API.
- **Transacciones Atómicas:** Las operaciones compuestas (ej. cobro de pedidos con cambio de estado de mesa y generación de comprobante) deben ejecutarse dentro de transacciones de base de datos (`BeginTransactionAsync`).
- **Pruebas Automatizadas:** Toda nueva regla o corrección debe contar con cobertura en `tests/GirasolesRes.Tests/`. La suite completa debe compilar y pasar al 100% (`dotnet test GirasolesRes.sln`).

---

## 3. Estándares del Frontend (Arquitectura Basada en Componentes)

### 3.1 Estructura Modular de `frontend/src/`
```text
frontend/src/
├── components/
│   ├── ui/             # Componentes base reutilizables de interfaz
│   ├── layout/         # Componentes estructurales de marco y navegación
│   ├── mesas/          # Componentes de dominio: Salón y Mesas
│   ├── menu-dia/       # Componentes de dominio: Menú del Día y Platos Agotados
│   ├── pedidos/        # Componentes de dominio: Toma de Pedidos (Mesa / Llevar)
│   ├── cocina/         # Componentes de dominio: Pantalla KDS y Comandas
│   ├── caja/           # Componentes de dominio: Apertura, Arqueo y Cierre de Caja
│   ├── cobros/         # Componentes de dominio: Módulo de Cobranza y Comprobantes
│   ├── ventas/         # Componentes de dominio: Historial y Anulación de Ventas
│   ├── productos/      # Componentes de dominio: Catálogo de Productos y Carta
│   ├── usuarios/       # Componentes de dominio: Gestión de Usuarios y Accesos
│   ├── reportes/       # Componentes de dominio: Reportes Gerenciales y KPIs
│   └── dashboard/      # Vistas específicas de Dashboard por rol de usuario
├── layouts/            # Plantillas estructurales (MainLayout, AuthLayout)
├── pages/              # Vistas contenedoras / orquestadores de páginas (Pages)
├── services/           # Cliente HTTP (apiClient.ts) y servicios tipados
├── hooks/              # Custom hooks de lógica de negocio y efectos asíncronos
├── types/              # Contratos e interfaces TypeScript
└── utils/              # Utilidades puras (formato de moneda, fechas)
```

### 3.2 Clasificación de Componentes
1. **`components/ui/` (UI Primitiva y Reutilizable):**
   - Componentes agnósticos al dominio gastronómico (`Button`, `ActionButton`, `InputField`, `FormMessage`, `StatusBadge`, `StatCard`, `EmptyState`, `FilterBar`, `ModalWrapper`, `ConfirmModal`, `DiscardChangesModal`).
   - Puramente presentacionales: reciben propiedades (`Props`) y emiten eventos (`onClick`, `onChange`). Sin acoplamiento a servicios o llamadas HTTP.
2. **`components/layout/` (Marco Estructural):**
   - Componentes que componen la estructura de la aplicación (`Header`, `Sidebar`, `PageHeader`, `PageContainer`, `InactivityModal`, `LogoutModal`).
3. **`components/<dominio>/` (Componentes de Negocio):**
   - Desacoplan el renderizado específico de cada módulo funcional (`ComandaCard`, `MesaCard`, `ArmarMenuCompletoModal`, `CobroModal`, `DashboardAdminView`, etc.).
   - Utilizan contratos `Props` fuertemente tipados.
4. **`pages/` (Orquestadores / Containers):**
   - Las páginas en `src/pages/*.tsx` deben actuar **única y exclusivamente** como orquestadores.
   - Consumen *custom hooks* y servicios para obtener datos y despachar acciones.
   - Delegan toda la renderización de la interfaz a los componentes de dominio y UI base.
   - **Regla de Oro:** Queda estrictamente prohibido incrustar árboles de HTML masivos o modales complejos de cientos de líneas directamente dentro de los archivos de página.

### 3.3 Reglas Estrictas del Frontend
- **Fidelidad Visual Absoluta (Pixel-Perfect):** Al refactorizar o extraer componentes, nunca modificar clases de Tailwind CSS, jerarquías de elementos, márgenes o colores preexistentes.
- **Tipado Estricto de TypeScript:** No utilizar `any`. Todos los contratos deben estar tipados en `src/types/` o en las interfaces `Props` de cada componente. Respetar `verbatimModuleSyntax` usando `import type` para importaciones puras de tipos.
- **Cliente HTTP Nativo:** Utilizar siempre `services/apiClient.ts` basado en `window.fetch`. No introducir Axios ni otras librerías HTTP no autorizadas.
- **Compilación Limpia:** Cada cambio debe compilar con 0 errores y 0 advertencias (`npm run build`).

---

## 4. Convenciones de Control de Versiones (Git)

- **Formato de Commits:** Usar estrictamente **Conventional Commits** (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `perf:`).
- **Prohibición de Atribución AI:** Está terminantemente prohibido incluir `"Co-Authored-By"` o cualquier mención de asistentes o herramientas de IA en los mensajes de commit.
- **Pipeline de CI:** Todo commit en la rama `main` debe pasar en verde el workflow de GitHub Actions (`.github/workflows/ci.yml`), el cual compila y prueba tanto el backend (.NET) como el frontend (Vite/TypeScript).

---

## 5. Módulo de Conexión Móvil Protegido

### 5.1 Definición y Dirección Oficial
- **API real de backend:** `https://girasoles.astrazynk.pp.ua/api` (ASP.NET Core 8).
- **Sitio web institucional:** `https://girasolesres.pp.ua` (portal institucional, **no es la API** y está prohibido como dirección de servidor).

### 5.2 Archivos Protegidos
Los siguientes archivos componen el núcleo de conexión y modo demostración del cliente móvil:
- `mobile/src/config/serverConfig.ts`
- `mobile/src/config/appConfig.ts`
- `mobile/src/config/demoAccounts.ts`
- `mobile/src/components/auth/ServidorConfigSheet.tsx`
- `mobile/src/services/apiClient.ts`
- `mobile/scripts/verify-connection.mjs`
- `mobile/CONNECTION.md`

### 5.3 Reglas Estrictas del Módulo
- **Inmutabilidad de conexión:** Ningún cambio en el código del móvil puede alterar la URL por defecto, el modo demostración ni el acceso rápido sin actualizar formalmente `mobile/CONNECTION.md` y `mobile/scripts/verify-connection.mjs`.
- **Verificación obligatoria de compilación:** Toda tarea o cambio que afecte a `mobile/` debe ejecutar y pasar al 100% en verde antes de terminar:
  1. `npm --prefix mobile run build` (compilación y verificación de distribución de producción limpia de secretos).
  2. `npm --prefix mobile run build:demo` (compilación y verificación de distribución de demostración).

---

## 6. Reglas de Trabajo del Móvil

1. **Sin dependencias nuevas:** Salvo que una fase lo autorice expresamente. Prohibido ejecutar `npx cap sync`, `gradle` o `adb` durante fases de lógica o presentación. Prohibido mover, renombrar o borrar archivos existentes.
2. **Módulos protegidos de conexión:** Mantener inmutable el comportamiento de `config/appConfig.ts`, `config/serverConfig.ts`, `config/demoAccounts.ts`, `components/auth/ServidorConfigSheet.tsx`, `services/apiClient.ts` (solo ampliaciones compatibles; nunca la URL, su resolución ni la protección contra el sitio web), el acceso rápido y la línea de servidor del login, `scripts/verify-connection.mjs`, `CONNECTION.md` y los `.env.*`. Antes de finalizar cualquier tarea, ejecutar `npm --prefix mobile run build` y `npm --prefix mobile run build:demo`: ambos deben terminar con la verificación en verde.
3. **Reutilización de componentes y tokens:** Emplear los componentes base (`AppHeader`, `BottomNav`, `PageHeader`, `Card`, `FilterChipBar`, `StatusBadge`, `StatCard`, `Skeleton`, `EmptyState`, `ErrorState`, `IconButton`, `Button`, `BottomSheet`, `ConfirmSheet`, `ToastProvider`). Sin clases de color arbitrarias (`text-[#...]`) ni tamaños mágicos (`text-[Npx]`). Fuente Inter, tamaño mínimo 12 px, objetivos táctiles mínimos de 44 px, trato formal en USTED y glosario canónico (*Libre, Ocupada, Inactiva, Pendiente, En preparación, Listo, Pagado, Anulado, Abierta, Cerrada, Efectivo, Yape*; roles *Administrador, Cajero, Mozo, Cocinero*).
4. **Fidelidad al backend:** Rutas, verbos HTTP y contratos DTO alineados estrictamente a los controladores de ASP.NET Core 8. Replicar el servicio equivalente de `frontend/src/services`. Prohibidas las rutas de respaldo y los datos simulados en producción.
5. **Arquitectura y orquestación:** Cumplir la estructura modular (`pages/` como orquestadores de hook + vista, `hooks/` para ciclo de vida y sondeo, `services/` para transporte HTTP y `components/` puramente presentacionales sin lógica de carga propia). Respetar los mensajes MSG y reglas de negocio del backend.
6. **Disciplina de Git:** Trabajar en la rama autorizada desde `main` con árbol limpio. Realizar un commit atómico por subpaso usando `git add` de RUTAS EXACTAS (prohibido `git add .` o `-A`). No realizar `push` ni `merge` sin instrucción explícita.
7. **Resolución de contradicciones y seguridad:** Si algún requisito contradice los controladores del backend o la arquitectura del repositorio, detenerse y consultar. Prohibido imprimir contraseñas, tokens JWT o credenciales en registros e informes.

