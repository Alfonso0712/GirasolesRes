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
   - [[#2.5 Estándar Único de Encabezado de Página (Editorial Limpio)]]
   - [[#2.6 Matriz Estricta de Colorimetría Semántica (Cero Colisión de Colores - Heurística 5 Nielsen)]]
   - [[#2.7 Legibilidad de Tarjetas Operativas (Mesas, Menú del Día, Cocina KDS)]]
3. [[#3. Fundamentos de Usabilidad y Experiencia de Usuario (Sustento Teórico)]]
4. [[#4. Estándares de Arquitectura y Clean Code (Frontend)]]
5. [[#5. Trazabilidad de Requerimientos y Manejo de Errores]]
6. [[#6. Guía Rápida de Replicación para Nuevos Módulos]]
7. [[#7. Estándar de Dominio Backend (.NET 10) y Regla Anti-Deuda Técnica]]
8. [[#8. Directriz Permanente de Arquitectura y Código (Regla Inquebrantable)]]

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

### 2.5 Estándar Único de Encabezado de Página (Editorial Limpio)

> [!IMPORTANT]
> **REGLA DE ENCABEZADO EDITORIAL LIBRE:**
> Queda estrictamente prohibido encerrar el título del módulo o su encabezado dentro de contenedores o tarjetas blancas (`PageContainer`, `bg-white p-6 rounded-xl border`), así como colocar iconos cuadrados decorativos al lado del título. 
> Todo encabezado de página debe ubicarse **directamente sobre el lienzo crema (`#FAF7F4`)**, asegurando ligereza visual y consistencia global (Regla 1 de Shneiderman).

#### Estructura Jerárquica del Encabezado:
1. **Kicker Superior de Categoría:**
   ```tsx
   <p className="text-xs font-bold uppercase tracking-wider text-[#D35400] mb-1">
     [CATEGORÍA DEL MÓDULO]
   </p>
   ```
   *Ejemplos:* `GESTIÓN DE ACCESO` (Usuarios), `GESTIÓN DE LA CARTA` (Productos), `OPERACIÓN DE SALÓN` (Mesas, Pedidos), `COCINA Y SERVICIO` (Cocina KDS), `GESTIÓN DE CAJA` (Caja).
2. **Título Principal con Tipografía Serif Editorial:**
   ```tsx
   <h1 className="text-3xl font-brand-serif font-bold text-[#482813] tracking-tight">
     [Nombre del Módulo]
   </h1>
   ```
   *Nota:* Este es el único lugar de la pantalla de datos donde se permite `Playfair Display` (`font-brand-serif`). Puede ir acompañado a su derecha por pastillas resumen informativas compactas (e.g., fecha del día, contador de mesas libres/ocupadas o comandas pendientes).
3. **Subtítulo Descriptivo en Lenguaje del Mundo Real (Heurística 2 de Nielsen):**
   ```tsx
   <p className="text-sm text-neutral-500 mt-1">
     [Descripción operativa clara y concisa en lenguaje humano]
   </p>
   ```
   *Prohibición Estricta:* Jamás incluir códigos de requerimiento o casos de uso en el texto visible (`(CUS06)`, `(RF-04)`, `(MSG-39)`).
4. **Bloque de Acciones y Controles a la Derecha:**
   - Botón primario de alta (`+ Nuevo...`) en color naranja institucional sólido (`bg-[#D35400] hover:bg-[#B84600] text-white`).
   - Controles de refresco, filtros rápidos o indicadores temporales con altura estándar `min-h-[38px]`.

---

### 2.6 Matriz Estricta de Colorimetría Semántica (Cero Colisión de Colores - Heurística 5 Nielsen)

> [!WARNING]
> **PREVENCIÓN DE ERRORES Y JERARQUÍA CROMÁTICA:**
> Queda terminantemente prohibido utilizar el mismo color o tonalidad para dos botones con objetivos distintos dentro de una misma tarjeta, fila o barra de acciones (por ejemplo, pintar del mismo color ámbar la toma de pedido y la desactivación de la mesa). Cada acción tiene un peso visual unívoco.

| Jerarquía de Acción | Color y Clases Tailwind | Icono Semántico | Aplicación Operativa |
| :--- | :--- | :--- | :--- |
| **1. Operativa Primaria** | `bg-[#D35400] hover:bg-[#B84600] text-white border-transparent shadow-xs` | `Plus`, `Flame`, `ReceiptText` | Acción principal de negocio: "Pedido / Comanda", "Cobrar", "Confirmar", "+ Nuevo". |
| **2. Edición / Modificación** | `bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900` | `Edit2` | Edición de datos maestros o apertura de formularios. |
| **3. Advertencia / Desactivar** | `bg-amber-50 border-amber-200 text-[#B84600] hover:bg-amber-100` | `PowerOff`, `AlertTriangle` | Desactivación o suspensión temporal de entidades libres o activas. |
| **4. Reactivación / Habilitar**| `bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100` | `Power`, `Check` | Reanudación o reactivación de registros inactivos. |
| **5. Peligro / Eliminación** | `bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100` | `Trash2`, `XCircle` | Anulación definitiva de pedidos o eliminación de registros sin dependencias. |
| **6. Acción Bloqueada / Deshabilitada** | `bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed opacity-60` | Mismo icono de la acción | Estado `disabled` cuando la regla de negocio prohíbe la acción (e.g. desactivar una mesa ocupada o eliminar un usuario con historial). Siempre con atributo `title` explicativo. |

---

### 2.7 Legibilidad de Tarjetas Operativas (Mesas, Menú del Día, Cocina KDS)

1. **Tipografía Operativa Sin Serif:**
   - Dentro de las tarjetas operativas (mesas, pedidos, comandas, platos del día), los títulos, códigos de comanda y números de mesa deben utilizar **exclusivamente** `Plus Jakarta Sans` en negrita con espaciado numérico uniforme:
     ```tsx
     className="font-sans font-bold text-lg text-[#2C1A0E] tabular-nums"
     ```
   - Queda estrictamente prohibido usar fuentes Serif (`Playfair Display`) dentro de tarjetas operativas o estados vacíos.
2. **Prohibición de Texto Truncado (`truncate`) en Nombres de Tarjetas:**
   - Los identificadores de entidades operativas (`Mesa 1`, `Mesa 12`, `Para llevar (Juan)`) deben renderizarse íntegros en una línea sin ser cortados con puntos suspensivos (`...` o `Mes...`).
3. **Pastillas Compactas de Estado en Tarjetas:**
   - A diferencia de las tablas donde el ancho es fijo (`w-28 h-7`), dentro de las tarjetas operativas las pastillas de estado usan ancho dinámico ajustado a su contenido (`px-2.5 py-0.5 text-xs w-auto shrink-0`), impidiendo que desplacen o aplasten el título de la tarjeta.

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

---

## 7. Estándar de Dominio Backend (.NET 10) y Regla Anti-Deuda Técnica

> [!CAUTION]
> **REGLA DE ORO DE MODELADO RELACIONAL Y DOMINIO (NO NEGOCIABLE):**
> **ESTÁ TERMINANTEMENTE PROHIBIDO crear propiedades puente (`=>`) o mantener dos convenciones de nombres en paralelo dentro de las entidades de Dominio o DTOs.**

### 7.1 Convención Obligatoria de Cátedra (Prefijo Trilateral + PascalCase)
Todas las entidades del Dominio y sus mapeos en Entity Framework Core deben definir **única y exclusivamente** sus propiedades reales con `{ get; private set; }` bajo el estándar de prefijo trilateral:

| Entidad | Prefijo | Propiedades de Dominio Obligatorias |
| :--- | :--- | :--- |
| **Usuario** | `Usu` | `Id_Usuario`, `Usu_Nombre`, `Usu_Usuario`, `Usu_Correo`, `Usu_PasswordHash`, `Usu_Rol`, `Usu_Activo`, `Usu_IntentosFallidos`, `Usu_BloqueadoHastaUtc`, `Usu_FechaCreacionUtc`, `Usu_FechaActualizacionUtc` |
| **Mesa** | `Mes` | `Id_Mesa`, `Mes_Nombre`, `Mes_NombreNormalizado`, `Mes_Ocupacion`, `Mes_Activa`, `Mes_FechaCreacionUtc`, `Mes_FechaActualizacionUtc` |
| **Producto** | `Pro` | `Id_Producto`, `Pro_Nombre`, `Pro_Descripcion`, `Pro_Precio`, `Pro_Stock`, `Pro_Estado`, `Pro_FechaCreacionUtc`, `Id_Categoria` |
| **Categoría**| `Cat` | `Id_Categoria`, `Cat_Nombre`, `Cat_Descripcion`, `Cat_Activa`, `Cat_FechaCreacionUtc` |
| **Pedido** | `Ped` | `Id_Pedido`, `Ped_FechaHoraUtc`, `Ped_Estado`, `Ped_Total`, `Ped_Notas`, `Id_Mesa`, `Id_Usuario` |
| **Comprobante / Venta** | `Ven` / `Com` | `Id_Comprobante`, `Com_Tipo`, `Com_Serie`, `Com_Numero`, `Com_Total`, `Com_MetodoPago`, `Com_FechaHoraUtc`, `Id_Pedido` |
| **Caja** | `Caj` | `Id_Caja`, `Caj_MontoApertura`, `Caj_MontoCierre`, `Caj_FechaAperturaUtc`, `Caj_FechaCierreUtc`, `Caj_Estado`, `Id_Usuario` |

### 7.2 Reglas de Implementación en Capas
1. **Dominio Limpio:** Cero propiedades puente, cero alias. El constructor y los métodos de negocio (`ActualizarDatos`, `CambiarEstado`) operan únicamente con las propiedades de cátedra.
2. **Persistencia (EF Core):** `GirasolesDbContext` configura `HasKey(e => e.Id_[Entidad])` e índices mapeando directamente a estas propiedades.
3. **Mapeo en DTOs:** Los DTOs de salida y entrada exponen contratos limpios en camelCase / PascalCase hacia el frontend (`[JsonPropertyName("nombre")]`), y el mapeo explícito se resuelve en los servicios de aplicación (`UsuarioService`, `MesaService`, etc.) sin duplicar propiedades en la entidad.
4. **Futuros Módulos:** Todo nuevo módulo (**Productos, Categorías, Pedidos, Caja, Ventas y Reportes**) debe nacer desde cero cumpliendo estrictamente con este estándar sin excepciones.

---

## 8. Directriz Permanente de Arquitectura y Código (Regla Inquebrantable)

> [!IMPORTANT]
> **DIRECTRIZ ACTIVA Y VINCULANTE PARA TODOS LOS MÓDULOS DEL PROYECTO RESTAURANTE GIRASOLES:**
> A partir de este momento, **TODO** código nuevo, módulo, entidad, servicio o interfaz que se construya para el proyecto (incluyendo Productos, Categorías, Mesas, Pedidos/Comandas, Caja, Ventas y Reportes) nace aplicando de forma estricta y obligatoria estas 4 reglas desde la primera línea.

### 8.1 Pilar 1: Estándar de Nomenclatura en Dominio y Base de Datos (Backend C#)
- **Entidades de Dominio (`Domain/Entities`):** Únicamente la convención de cátedra con prefijo trilateral:
  * **Llave Primaria:** `Id_[Entidad]` (ej. `Id_Producto`, `Id_Categoria`, `Id_Mesa`, `Id_Pedido`, `Id_Comprobante`, `Id_Usuario`).
  * **Atributos:** `[Prefijo]_[Atributo]` en PascalCase (ej. `Pro_Nombre`, `Pro_Precio`, `Pro_Stock`, `Pro_Estado`; `Mes_Numero`, `Mes_Capacidad`, `Mes_Estado`; `Ped_Total`, `Ped_Fecha`).
- **Prohibición Total:** Terminantemente prohibido crear propiedades con nombres genéricos antiguos o "propiedades puente" (`=>`) dentro del dominio.
- **Persistencia (`Infrastructure/Data` y `Repositories`):** En `GirasolesDbContext` y repositorios, todas las llaves (`HasKey`), índices únicos (`HasIndex`), relaciones y consultas LINQ (`Where`, `OrderBy`, `FirstOrDefaultAsync`) operan directamente con estas propiedades prefijadas.

### 8.2 Pilar 2: Desacoplamiento en Capa de Aplicación (DTOs y Services)
- **DTOs Semánticos (`Application/DTOs`):** Usan nombres limpios (`Id`, `Nombre`, `Precio`, `Estado`, `Usuario`, `Correo`, `Rol`, `Activo`) para comunicarse con el Frontend en React sin filtrar nomenclatura interna de BD.
- **Mapeo Explícito (`Application/Services`):** El mapeo entre la Entidad prefijada (`Pro_Nombre`) y el DTO limpio (`Nombre`) se realiza siempre de forma explícita en métodos privados o funciones de mapeo del Servicio de Aplicación (`MapearADto`).
- **Validación Estricta:** Todo DTO de entrada lleva `DataAnnotations` rigurosas y sanitización con `.Trim()` en cadenas.

### 8.3 Pilar 3: Clean Architecture y Clean Code (Uncle Bob)
- **Dirección de Dependencias Estricta:** `API -> Infrastructure -> Application -> Domain`.
- **Desacoplamiento por Interfaces:**
  * Controladores solo interactúan con `I[Entidad]Service`.
  * Servicios de aplicación solo interactúan con `I[Entidad]Repository`.
- **Principios Clave:**
  * Responsabilidad Única (SRP) en cada clase y método.
  * Separación de Comandos y Consultas (CQS).
  * **Prohibición de retornar `null` en colecciones:** Retornar siempre colecciones vacías (`Enumerable.Empty<T>()` o `new List<T>()`).

### 8.4 Pilar 4: Consistencia Absoluta en Frontend (React + TypeScript + Tailwind)
- **Layout Fijo Global:** `MainLayout` con `Sidebar` y `Header` estáticos en `h-screen overflow-hidden`; scroll vertical confinado exclusivamente al contenedor de datos o al `<tbody>` de la tabla con scrollbar estilizada de 6px.
- **Tipografía Híbrida Oficial:**
  * `.font-brand-serif` (`Playfair Display`) de uso **exclusivo** para títulos principales de módulo.
  * `Plus Jakarta Sans` con clase `tabular-nums` para todo dato operativo, números de mesas, precios, comandas, montos y tablas.
- **Estandarización de Tablas:**
  * **Badges/Pastillas:** Ancho y alto fijos e idénticos (`w-28 h-7 inline-flex items-center justify-center rounded-lg text-xs font-semibold`) para mantener alineación tabular perfecta.
  * **Columna de Acciones:** Botones cuadrados compactos de solo icono (`w-8 h-8 rounded-lg border`), colores semánticos (verde esmeralda, ámbar, rojo rose, gris neutro) y atributos obligatorios `title` y `aria-label`.


