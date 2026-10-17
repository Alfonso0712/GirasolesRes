# Sistema de Diseño y Arquitectura UI — Restaurante Girasoles

Este documento establece las directrices y estándares obligatorios de diseño, usabilidad y arquitectura frontend para todas las vistas y módulos del sistema (Usuarios, Productos, Mesas, Pedidos, Ventas, Caja y Reportes).

---

## 1. Arquitectura de Layout Fijo y Responsivo (MainLayout Global)

- **Contenedor Principal (`h-screen`, `overflow-hidden`):**
  - La ventana del navegador nunca debe presentar scroll global ni cortar encabezados/filtros.
- **Barra Lateral (`Sidebar`):**
  - **Desktop (`>= 1024px` / `lg:`):** Permanece 100% fija y estática en pantalla en todo momento (`shrink-0 w-64`).
  - **Móvil y Tablet (`< 1024px`):** Se oculta automáticamente y opera como un drawer deslizante accesible con overlay backdrop, botón hamburguesa en `Header` (`lg:hidden`), cierre con tecla Esc o al tocar un ítem de navegación.
- **Cabecera (`Header`):**
  - Fija en la parte superior (`shrink-0`), incluye botón de menú hamburguesa accesible (`min-h-[44px] min-w-[44px]`) en `< lg`.
- **Contenedor Central (`<main>`):**
  - Posee `min-h-0` y `overflow-hidden`.
  - El desplazamiento vertical independiente (`overflow-y-auto`) queda delegado al contenedor interno de datos o al cuerpo (`<tbody>`) de las tablas.
- **Elementos Siempre Visibles:**
  - Títulos de sección, descripciones, botones de acción principal (e.g. `+ Nuevo`), barras de filtros/búsqueda y paginación inferior nunca deben desaparecer al hacer scroll.

---

## 2. Consistencia Visual y Patrón de Tablas (Regla de Oro de Shneiderman)

El estándar visual consolidado en el módulo de Usuarios es de réplica obligatoria e idéntica en toda tabla del sistema:

### A. Insignias / Pastillas de Clasificación (Rol, Categoría, Estado)
- **Dimensiones Fijas:** `w-28 h-7 inline-flex items-center justify-center rounded-lg text-xs font-semibold`
- **Comportamiento:** Dimensiones idénticas sin importar la longitud del texto para garantizar alineación vertical perfecta en la columna.

### B. Columna de Acciones (Desktop)
- **Patrón de Botones:** Botones cuadrados compactos idénticos de 32x32 px:
  `w-8 h-8 rounded-lg border inline-flex items-center justify-center shadow-2xs transition-colors cursor-pointer`
- **Accesibilidad Completa:** Atributos `title` y `aria-label` descriptivos en cada botón.
- **Semántica de Color e Iconos (Lucide):**
  - **Editar / Modificar:** Fondo neutro/blanco (`bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200`) con icono `Edit2` (`w-4 h-4 text-neutral-600`).
  - **Activar:** Fondo verde esmeralda suave (`bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200`) con icono `Power` (`w-4 h-4`).
  - **Desactivar:** Fondo ámbar suave (`bg-amber-50 hover:bg-amber-100 text-[#B84600] border-amber-200`) con icono `PowerOff` (`w-4 h-4`).
  - **Eliminar / Anular:** Fondo rosa/rojo suave (`bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200`) con icono `Trash2` (`w-4 h-4 text-rose-600`).
  - **Acciones Protegidas / Deshabilitadas:** `bg-neutral-100 border-neutral-200 text-neutral-400 opacity-60 cursor-not-allowed` con tooltip explicativo del bloqueo.

### C. Estilización de Barra de Scroll
- Scrollbar sutil y delgada de 6px:
  `[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 [&::-webkit-scrollbar-track]:bg-transparent`

### D. Adaptabilidad Móvil y Tablets (Tarjetas Verticales)
- En resoluciones menores a `1024px` (`< lg`), las tablas se transforman automáticamente en tarjetas verticales (`lg:hidden`).
- Los botones de acción deben incluir icono + texto con una altura mínima accesible táctil de 38 a 44 px (`min-h-[38px]`).

### E. Modales con Altura Confinada y Teclado Virtual
- Todo modal con formulario debe incluir `max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden`.
- El encabezado del modal y el contenedor de botones de acción deben permanecer fijos (`shrink-0`), delegando el scroll a los campos internos (`flex-1 overflow-y-auto min-h-0`). Esto garantiza que los botones "Guardar" y "Cancelar" nunca queden cortados en laptops de 1366x768 px o en smartphones con teclado desplegado.

---

## 3. Vistas de Autenticación (`LoginPage`, `ForgotPasswordPage`)

- **Contenedor Raíz:** `h-screen max-h-screen overflow-hidden` estricto en pantallas de escritorio (`>= md`).
- **Panel Lateral Informativo (AuthShell):** `hidden md:flex md:w-[48%] lg:w-[45%] h-full overflow-hidden` con padding vertical balanceado (`py-6 lg:py-8` en contenido central).
- **Panel de Formulario:** `flex-1 flex items-center justify-center py-4 px-6 sm:px-10 lg:px-14 overflow-y-auto md:overflow-y-hidden h-full`.
- **Cero Scroll en Desktop:** El contenido del formulario, incluso con banners dinámicos de notificación (`FormMessage` con `mb-3`) y tarjeta de credenciales de demostración (`p-3 mt-4 sm:mt-5`), debe mantener una altura total inferior a 500 px, garantizando ajuste al 100% sin scrollbars en pantallas estándar de laptop (1366x768 px) o monitores Full HD. Desplazamiento vertical (`overflow-y-auto`) habilitado exclusivamente en dispositivos móviles (`< md`).
