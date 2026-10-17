---
title: "Manual Oficial de Estándares de Diseño UI/UX y Programación Frontend"
sistema: "Sistema de Restaurante Girasoles"
version: "2.0.0"
fecha: "2026-10-17"
estado: "Aprobado / Oficial"
autor: "Equipo de Arquitectura de Software & UI/UX"
tags:
  - frontend
  - react
  - tailwindcss
  - clean-architecture
  - design-system
  - ux-heuristics
  - obsidian
  - solid
---

# 🌻 Sistema de Restaurante Girasoles
## Manual Oficial de Estándares de Diseño UI/UX y Programación Frontend

> [!IMPORTANT]
> **PROPÓSITO Y OBLIGATORIEDAD:**
> Este documento establece las directrices normativas, tokens de diseño, heurísticas de usabilidad y patrones arquitectónicos que rigen el frontend del Sistema de Restaurante Girasoles. 
> Todos los módulos del sistema (**Usuarios, Productos, Mesas, Pedidos, Caja, Ventas y Reportes**) deben desarrollarse replicando estrictamente estas especificaciones para asegurar una experiencia de usuario homogénea, accesible, robusta y libre de deuda técnica.

---

## 📑 Tabla de Contenidos
1. [[#1. Colorimetría y Tokens de Diseño (Design System)]]
2. [[#2. Reglas de Layout y Consistencia Visual (UI)]]
3. [[#3. Fundamentos de Usabilidad y Experiencia de Usuario (Sustento Teórico)]]
4. [[#4. Estándares de Arquitectura y Clean Code (Frontend)]]
5. [[#5. Trazabilidad de Requerimientos y Manejo de Errores]]
6. [[#6. Guía Rápida de Replicación para Nuevos Módulos]]

---

## 1. Colorimetría y Tokens de Diseño (Design System)

La identidad visual combina la calidez gastronómica con la solidez institucional. Cada color cumple un rol semántico inalterable.

### 1.1 Paleta Institucional (Brand Tokens)

| Token Semántico | Código HEX | Variable Tailwind / CSS | Aplicación en Interfaz |
| :--- | :--- | :--- | :--- |
| **Primario (Accent)** | `#D35400` | `text-[#D35400]`, `bg-[#D35400]` | Botones principales, enlaces clave, destacados, badges de alerta suave. |
| **Primario Hover** | `#B84600` | `hover:bg-[#B84600]`, `text-[#B84600]` | Estado `:hover` y `:active` de botones primarios y acentos interactivos. |
| **Marrón Corporativo** | `#482813` | `bg-[#482813]`, `text-[#482813]` | Fondo de la Barra Lateral (`Sidebar`), encabezados Auth y títulos de panel. |
| **Marrón Hover** | `#5A351D` | `hover:bg-[#5A351D]` | Ítems de navegación activos o en hover dentro del Sidebar. |
| **Texto Principal** | `#2C1A0E` | `text-[#2C1A0E]` | Títulos principales `<h1>`, `<h2>`, etiquetas de inputs y datos de alto contraste. |
| **Texto Secundario** | `#7C6F66` | `text-[#7C6F66]` | Párrafos descriptivos, subtítulos, placeholders y metadata auxiliar. |
| **Fondo Crema (Canvas)** | `#FAF7F4` | `bg-[#FAF7F4]` | Fondo global de la aplicación (evita el deslumbramiento del blanco puro `#FFF`). |
| **Fondo Superficie (Card)**| `#FFFFFF` | `bg-white` | Contenedores de tablas, modales y tarjetas con bordes sutiles `border-neutral-200/80`. |

```css
/* Variables CSS oficiales */
:root {
  --color-primary: #D35400;
  --color-primary-hover: #B84600;
  --color-brand-dark: #482813;
  --color-brand-surface: #5A351D;
  --color-text-main: #2C1A0E;
  --color-text-muted: #7C6F66;
  --color-canvas: #FAF7F4;
}
```

---

### 1.2 Semántica de Estados y Acciones

Queda prohibido el uso arbitrario de colores. Toda pastilla, botón o alerta debe respetar la siguiente matriz:

| Estado / Acción | Fondo | Texto | Borde | Icono Lucide |
| :--- | :--- | :--- | :--- | :--- |
| **Activo / Éxito** | `bg-emerald-50` | `text-emerald-700` | `border-emerald-200` | `CheckCircle2` / `Power` |
| **Inactivo / Advertencia** | `bg-amber-50` | `text-[#B84600]` / `text-amber-800` | `border-amber-200` | `AlertCircle` / `PowerOff` |
| **Eliminar / Peligro / Error** | `bg-rose-50` | `text-rose-600` | `border-rose-200` | `Trash2` / `AlertTriangle` |
| **Neutro / Edición / Rol** | `bg-white` / `bg-neutral-50` | `text-neutral-700` | `border-neutral-200` | `Edit2` / `Shield` |

> [!TIP]
> **Accesibilidad WCAG 2.1 AA:** Todas las combinaciones de color texto/fondo garantizan un ratio de contraste mínimo de **4.5:1** para texto normal y **3:1** para componentes visuales interactivos.

---

### 1.3 Tipografía Oficial

El sistema implementa una combinación tipográfica jerárquica:

1. **Titulares y Encabezados de Módulo (Serif):**
   - **Fuente:** `Playfair Display`, `Georgia`, `serif`
   - **Clases:** `font-serif font-bold text-[#2C1A0E] tracking-tight`
   - **Uso:** Título del módulo (`h1`), encabezados de modales (`h2`), titulares de autenticación.
2. **Cuerpo, Formularios, Tablas y Controles (Sans-Serif):**
   - **Fuente:** `Plus Jakarta Sans`, `system-ui`, `sans-serif`
   - **Clases:** `font-sans text-sm text-[#7C6F66] antialiased`
   - **Uso:** Tablas de datos, celdas, botones, campos de entrada, mensajes flotantes y menús.

---

## 2. Reglas de Layout y Consistencia Visual (UI)

### 2.1 Arquitectura de Layout Fijo (Zero Global Scroll)

> [!IMPORTANT]
> **REGLA DE ORO DE PANTALLA FIJA:**
> En pantallas de escritorio (`>= 1024px`), la ventana del navegador **NUNCA** debe tener scroll vertical ni horizontal global (`overflow-hidden`). Los encabezados, barras de búsqueda y paginaciones jamás deben perderse de vista al navegar o consultar datos.

```
┌────────────────────────────────────────────────────────────────────────┐
│  h-screen overflow-hidden (Contenedor Raíz)                            │
│  ┌──────────────┬────────────────────────────────────────────────────┐ │
│  │              │  Header (shrink-0, h-16, Fijo)                     │ │
│  │              ├────────────────────────────────────────────────────┤ │
│  │  Sidebar     │  <main> (flex-1 flex flex-col min-h-0 overflow-hidden│
│  │  (w-64,      │  ┌───────────────────────────────────────────────┐ │ │
│  │   h-full,    │  │  Título de Módulo + Botón Primario (shrink-0) │ │ │
│  │   shrink-0,  │  ├───────────────────────────────────────────────┤ │ │
│  │   Fijo 100%) │  │  Filtros + Búsqueda con Debounce (shrink-0)   │ │ │
│  │              │  ├───────────────────────────────────────────────┤ │ │
│  │              │  │  Contenedor Blanco Tabla (flex-1, min-h-0):   │ │ │
│  │              │  │  ┌──────────────────────────────────────────┐ │ │ │
│  │              │  │  │ <thead> (sticky top-0 z-10)              │ │ │ │
│  │              │  │  ├──────────────────────────────────────────┤ │ │ │
│  │              │  │  │ <tbody> (flex-1 overflow-y-auto, scroll 6px│ │ │
│  │              │  │  └──────────────────────────────────────────┘ │ │ │
│  │              │  │  Paginación Footer (shrink-0, border-t)     │ │ │ │
│  │              │  └───────────────────────────────────────────────┘ │ │
│  └──────────────┴────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

#### Especificación de Clases Tailwind:
- **`MainLayout.tsx`:**
  - Contenedor raíz: `flex h-screen overflow-hidden bg-[#FAF7F4]`
  - Sidebar: `fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#482813] text-white h-full shrink-0 select-none`
  - Contenedor derecho: `flex-1 flex flex-col min-w-0 h-full overflow-hidden`
  - Header: `bg-white border-b border-neutral-200 px-4 sm:px-8 py-3.5 shrink-0 relative`
  - Main: `p-4 sm:p-6 md:p-8 flex-1 flex flex-col min-h-0 overflow-hidden`

---

### 2.2 Vistas de Autenticación (`LoginPage` y `ForgotPasswordPage`)

- **Cero Scroll en Escritorio:** El contenedor raíz debe ser `h-screen max-h-screen overflow-hidden`.
- **Panel de Formulario:** `flex-1 flex items-center justify-center py-4 px-6 sm:px-10 lg:px-14 overflow-y-auto md:overflow-y-hidden h-full`.
- **Ajuste en 100vh:** Todo el bloque central (título, banner de error/éxito, inputs, botón de ingreso y tarjeta demo) debe tener una altura total inferior a `480px`, manteniéndose 100% visible en laptops de resolución compacta (`1366x768 px`) sin activar scrollbar.
- **Scroll Exclusivo en Móviles:** Únicamente en `< md` se permite el scroll natural táctil si la altura del smartphone es reducida.

---

### 2.3 Estandarización de Tablas de Datos (Data Grids)

Toda tabla del sistema (Usuarios, Productos, Mesas, Pedidos, Caja) debe implementar exactamente estas tres directrices:

#### A. Pastillas/Badges de Clasificación (Rol, Categoría, Estado)
Para evitar que la tabla "baile" o se desalinee según la longitud de cada palabra:
```tsx
// Dimensiones obligatorias idénticas para todo badge
className="w-28 h-7 inline-flex items-center justify-center rounded-lg text-xs font-semibold border shadow-2xs"
```

#### B. Columna de Acciones (Desktop)
Botones cuadrados compactos idénticos de 32x32 px:
```tsx
// Botón de solo icono estandarizado
className="w-8 h-8 rounded-lg border inline-flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
```
- **Atributos de Accesibilidad Obligatorios:** Todo botón debe incluir `title="Descripción clara"` y `aria-label="Descripción clara"`.
- **Protección de Cuenta Propia (RN-10):** Si la fila pertenece al usuario en sesión, los botones de desactivar y eliminar deben renderizarse deshabilitados:
  ```tsx
  className="w-8 h-8 rounded-lg border border-neutral-200 bg-neutral-100 text-neutral-400 opacity-60 cursor-not-allowed"
  title="No puede desactivar su propia cuenta en sesión"
  disabled
  ```

#### C. Barra de Scroll Sutil Personalizada
Queda prohibido el scroll nativo gris y grueso de Windows/Linux. Se usa una barra delgada de 6px:
```tsx
className="[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 [&::-webkit-scrollbar-track]:bg-transparent"
```

#### D. Adaptabilidad Móvil (Responsive Cards)
- En pantallas grandes (`>= 1024px` / `lg:`): se renderiza la tabla clásica con encabezados `sticky top-0 bg-neutral-50/90 backdrop-blur-xs z-10`.
- En tablets y móviles (`< 1024px` / `< lg`): la tabla se oculta (`hidden lg:block`) y se transforma automáticamente en tarjetas verticales (`lg:hidden`). Cada tarjeta muestra los datos en bloques y los botones de acción se expanden con **icono + texto** con una altura táctil accesible (`min-h-[40px]`).

---

### 2.4 Modales con Altura Confinada y Teclado Virtual

Para evitar que los modales se desborden en pantallas pequeñas o cuando el teclado de una tablet/celular se despliega:
```tsx
<div className="bg-white rounded-2xl max-w-lg w-full max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden shadow-2xl">
  {/* Encabezado fijo */}
  <div className="shrink-0 p-5 border-b border-neutral-100 flex justify-between items-center">...</div>
  
  {/* Campos con scroll interior independiente */}
  <div className="flex-1 overflow-y-auto p-5 min-h-0 space-y-4">...</div>
  
  {/* Botones de acción siempre visibles al pie */}
  <div className="shrink-0 p-5 border-t border-neutral-100 flex justify-end gap-3 bg-neutral-50/50">...</div>
</div>
```

---

## 3. Fundamentos de Usabilidad y Experiencia de Usuario (Sustento Teórico)

Cada componente de la interfaz responde a un principio formal de la ingeniería de usabilidad:

### 3.1 Don Norman — The Design of Everyday Things
- **Affordance (Asequibilidad):** Los botones no son enlaces planos; tienen bordes (`border`), sombras sutiles (`shadow-2xs`), elevación en hover y esquinas redondeadas (`rounded-xl` / `rounded-lg`) que comunican de inmediato su condición de ser presionados.
- **Signifiers (Significadores):** Cada acción va acompañada de un icono unívoco de Lucide (`Plus` para crear, `Edit2` para modificar, `Trash2` para borrar, `Lock` para contraseña). Los campos obligatorios se señalan con asterisco y `Campo obligatorio`.
- **Feedback Inmediato:** Indicadores visuales en tiempo real ante cada evento: botones con spinner animado (`animate-spin`) y texto en gerundio (*"Guardando…"*, *"Ingresando…"*, *"Cargando usuarios…"*) desactivando el elemento para impedir doble clic.
- **Mapping (Mapeo Natural):** El botón "Cancelar" se ubica en el lado pasivo (izquierda) y el botón de acción principal o confirmación en el lado activo (derecha).

### 3.2 Jakob Nielsen — 10 Heurísticas de Usabilidad
- **H-01: Visibilidad del Estado del Sistema:** Skeleton loaders (marcadores de posición pulsantes) mientras cargan las tablas; spinners en mutaciones; banners flotantes Toast de 4 segundos con animación de entrada y salida ante operaciones exitosas.
- **H-05: Prevención de Errores:** Bloqueo de auto-eliminación o auto-desactivación del administrador logueado; validación de movimientos previos antes de eliminar (MSG-34); advertencia visual interactiva si `CapsLock` (Bloq Mayús) está encendido en el Login (MSG-10).
- **H-06: Reconocimiento antes que Recuerdo:** Filtros desplegables con valores predeterminados explícitos (*"Todos los roles"*, *"Todos los estados"*); placeholders explicativos; credenciales de acceso rápido pre-cargadas en tarjetas de demostración.
- **H-08: Estética y Diseño Minimalista:** Eliminación de clutter visual. Diálogos modales concisos; espacios en blanco balanceados; eliminación de barras de scroll dobles.

### 3.3 Ben Shneiderman — 8 Reglas de Oro del Diseño de Interfaces
- **Regla 1: Consistencia Estricta:** Mismos colores, mismos tamaños de badges (`w-28 h-7`), mismos botones de 32x32 px y misma tipografía en todos los módulos.
- **Regla 2: Usabilidad Universal y Teclado:** Toda la interfaz es operable mediante teclado (`Tab`, `Shift+Tab`, `Enter`, `Escape`). Los modales implementan trampa de foco accesible (Focus Trap) para que la navegación con tabulador no se escape al fondo de la pantalla.
- **Regla 3: Ofrecer Retroalimentación Informativa:** Cada consulta sin resultados muestra el estado vacío formal con icono explicativo y botón para *"Quitar filtros"* (MSG-36).
- **Regla 5: Prevención y Manejo Sencillo de Errores:** Mensajes de error claros redactados en lenguaje humano, indicando exactamente qué campo corregir y enfocando programáticamente el primer input con error (`ref.current.focus()`).
- **Regla 7: Soporte de Locus de Control Interno:** El usuario tiene siempre el control para cerrar modales (`Escape` o botón `X`), descartar alertas o volver a la vista anterior.

### 3.4 Estándar Internacional ISO 9241-11
- **Eficacia:** Validación exhaustiva en frontend de longitudes, formatos de correo y reglas de negocio antes de consultar la base de datos.
- **Eficiencia:** Sanitización y trim automático con `normalizeText()` en `onBlur` (eliminando espacios redundantes sin molestar mientras se escribe) y búsqueda en tiempo real con debounce de 300 ms (reduciendo en un 80% las peticiones innecesarias al servidor).
- **Satisfacción:** Interfaz moderna, paleta cálida gastronómica, transiciones suaves (`duration-200`) y ausencia de saltos visuales bruscos.

---

## 4. Estándares de Arquitectura y Clean Code (Frontend)

El frontend sigue el patrón **Clean Frontend Architecture** y el principio de **Responsabilidad Única (SRP)**:

```
frontend/src/
├── assets/          # Recursos gráficos estáticos (logos, isotipos, svg)
├── components/      # Componentes UI Puros y Presentacionales (Dumb Components)
│   ├── Button.tsx
│   ├── InputField.tsx
│   ├── FormMessage.tsx
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── UserFormModal.tsx
│   └── ConfirmModal.tsx
├── hooks/           # Custom Hooks de Lógica y Estado (Separación de Negocio)
│   └── useUsersManagement.ts
├── layouts/         # Orquestadores Estructurales
│   ├── MainLayout.tsx   # Layout privado fijo (Sidebar + Header + Main)
│   └── AuthLayout.tsx   # Layout público de autenticación (Brand Shell)
├── pages/           # Vistas Contenedoras (Smart Components)
│   ├── LoginPage.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── HomePage.tsx
│   └── UsersPage.tsx
├── services/        # Capa de Transporte y Comunicación HTTP (Aislamiento Total)
│   ├── apiClient.ts     # Cliente HTTP genérico (fetch unificado)
│   ├── authService.ts   # Métodos de autenticación y token
│   └── usuarioService.ts# Métodos CRUD de usuarios
├── types/           # Contratos, Modelos de Dominio y DTOs tipados en TypeScript
│   ├── auth.ts
│   └── usuario.ts
└── utils/           # Funciones Puras Utilitarias
    ├── avatar.ts        # Cálculo de iniciales para avatares
    └── normalizeText.ts # Normalización y trim de strings
```

### 4.1 Principios SOLID Aplicados

1. **S — Single Responsibility (Responsabilidad Única):**
   - Los componentes de `components/` solo renderizan UI y reciben callbacks.
   - Las páginas delegan su estado a un Custom Hook (`useUsersManagement.ts`).
   - Los servicios en `services/` solo saben comunicarse por red con el backend.
2. **O — Open/Closed (Abierto/Cerrado):**
   - `Button.tsx` e `InputField.tsx` admiten variantes, iconos izquierdos/derechos y deshabilitación mediante props polimórficas sin modificar su código interno.
3. **D — Dependency Inversion (Inversión de Dependencias):**
   - La capa visual no depende de la implementación concreta de transporte. Consume los servicios a través de firmas de función tipadas e inyecta dependencias por props.

---

## 5. Trazabilidad de Requerimientos y Manejo de Errores

### 5.1 Convenciones de Nomenclatura del Proyecto

Todo commit, comentario de código o prueba debe estar vinculado a los códigos oficiales de ingeniería de requerimientos:
- **RF-XX:** Requerimiento Funcional (ej. `RF-01: Iniciar Sesión`).
- **RNF-XX:** Requerimiento No Funcional (ej. `RNF-02: Expiración de JWT en 30 minutos`).
- **HU-XX:** Historia de Usuario (ej. `HU-02: Gestión de Cuentas`).
- **CUS-XX:** Caso de Uso del Sistema (ej. `CUS-01: Autenticación`, `CUS-02: Gestión de Usuarios`, `CUS-03: Perfil`).
- **RV-XX:** Regla de Validación (ej. `RV-11: Nombre completo`, `RV-22: Debounce de 300ms`).
- **RN-XX:** Regla de Negocio (ej. `RN-10: Protección cuenta propia`, `RN-12: Expiración de sesión`).
- **MSG-XX:** Código de Mensaje en Catálogo (ej. `MSG-25: Usuario registrado`, `MSG-34: Usuario con movimientos`).

---

### 5.2 Manejo de Errores y Sesión Expirada (HTTP 401 vs. HTTP 500)

> [!CAUTION]
> **COMPORTAMIENTO OBLIGATORIO ANTE ERROR 401:**
> Queda terminantemente prohibido mostrar mensajes genéricos con botones de "Reintentar" cuando un token JWT expira o es revocado.

1. **Detección de Error 401 (Sesión Vencida):**
   - El cliente `apiClient.ts` mapea `response.status === 401`.
   - La vista o hook intercepta el error con `esErrorSesionVencida(err)`.
2. **Cierre y Redirección Inmediata:**
   - Se omite guardar el error en `errorCarga` (para no renderizar el contenedor de fallo).
   - Se cierran los modales activos.
   - Se dispara la función de cierre de sesión:
     ```ts
     onLogout({
       type: 'warning',
       message: 'Su sesión expiró. Ingrese nuevamente.'
     });
     ```
   - Esto limpia el `localStorage`, anula la sesión y monta `LoginPage.tsx` exhibiendo el banner amarillo de advertencia (RN-12).
3. **Uso Exclusivo de "Reintentar":**
   - El botón visual de "Reintentar" (`RotateCcw`) queda reservado estrictamente para caídas del servidor (HTTP 500) o desconexiones de red (MSG-37).

---

## 6. Guía Rápida de Replicación para Nuevos Módulos

Al programar los módulos de **Productos, Mesas, Pedidos, Caja, Ventas o Reportes**, sigue esta lista de comprobación:

### Checklist de Calidad para Cada Nuevo Módulo:
- [ ] **Estructura de Carpeta:**
  - Crear DTOs en `src/types/[modulo].ts`.
  - Crear servicio en `src/services/[modulo]Service.ts` usando `apiClient.get/post/put/delete`.
  - Crear Custom Hook en `src/hooks/use[Modulo]Management.ts`.
  - Crear vista en `src/pages/[Modulo]Page.tsx`.
- [ ] **Layout Confinado:**
  - Contenedor con `h-full flex flex-col overflow-hidden gap-4`.
  - Encabezado con título serif `text-2xl sm:text-3xl font-serif font-bold text-[#482813]`.
  - Filtros y búsqueda con debounce en contenedor estático `shrink-0`.
  - Tabla blanca con `flex-1 flex flex-col min-h-0 overflow-hidden bg-white rounded-2xl border border-neutral-200/80`.
- [ ] **Cuerpo de Tabla con Scroll:**
  - Contenedor de tabla con `flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-1.5...`
  - Encabezados `<th>` con `sticky top-0 bg-neutral-50/90 backdrop-blur-xs z-10`.
  - Badges de estado/categoría con ancho y alto fijo: `w-28 h-7 inline-flex items-center justify-center`.
  - Botones de acción compactos: `w-8 h-8 rounded-lg border` con `title` y `aria-label`.
- [ ] **Soporte Móvil:**
  - Tabla oculta en desktop: `hidden lg:block`.
  - Tarjetas verticales en móvil: `lg:hidden` con botones táctiles `min-h-[40px]`.
- [ ] **Modales Accesibles:**
  - Formulario modal con `max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden`.
  - Foco inicial en el primer campo; trampa de foco con tecla `Tab`; cierre con `Escape`.
- [ ] **Intercepción 401:**
  - Conectar `onLogout` para redirigir a Login con advertencia si expira el token.
