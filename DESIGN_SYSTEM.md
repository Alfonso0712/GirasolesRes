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

---

## 4. Estándar Único de Encabezado de Página (Editorial Limpio)

- **Lienzo Libre Directo (`#FAF7F4`):** Todos los módulos del sistema (Usuarios, Productos, Menú del Día, Mesas, Pedidos, Cocina KDS, Caja, Ventas y Reportes) deben colocar su encabezado directamente sobre el fondo crema.
- **Prohibición de Cajas Blancas:** Queda prohibido encerrar el encabezado de página dentro de tarjetas blancas (`PageContainer` o contenedores `bg-white`) o anteponer iconos cuadrados al lado del título.
- **Estructura Obligatoria:**
  1. *Kicker superior de categoría:* `<p className="text-xs font-bold uppercase tracking-wider text-[#D35400] mb-1">[CATEGORÍA]</p>`
  2. *Título principal editorial:* `<h1 className="text-3xl font-brand-serif font-bold text-[#482813] tracking-tight">[Nombre del Módulo]</h1>` (único punto donde se usa Playfair Display).
  3. *Subtítulo claro:* `<p className="text-sm text-neutral-500 mt-1">[Descripción operativa sin códigos técnicos]</p>`
  4. *Acciones a la derecha:* Botón primario (`+ Nuevo...`) en naranja `#D35400` y controles con altura `min-h-[38px]`.

---

## 5. Matriz Estricta de Colorimetría Semántica (Cero Colisión de Colores)

Para prevenir errores operativos graves (Heurística 5 de Nielsen), está prohibido asignar el mismo color a dos botones con propósitos distintos en una misma vista:

1. **Acción Operativa Primaria:** Naranja corporativo sólido (`bg-[#D35400] hover:bg-[#B84600] text-white border-transparent shadow-xs`) — "Pedido / Comanda", "Cobrar", "Confirmar", "+ Nuevo".
2. **Acción de Edición / Modificación:** Blanco / Neutro (`bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900`) — icono `Edit2`.
3. **Acción de Desactivar / Suspender:** Ámbar de advertencia (`bg-amber-50 border-amber-200 text-[#B84600] hover:bg-amber-100`) — icono `PowerOff`.
4. **Acción de Activar / Reanudar:** Verde esmeralda suave (`bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100`) — icono `Power`.
5. **Acción Destructiva / Eliminar:** Rosa suave (`bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100`) — icono `Trash2`.
6. **Acción Bloqueada / Deshabilitada:** `disabled`, fondo `bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed opacity-60` con tooltip (`title`) explicativo.

---

## 6. Legibilidad en Tarjetas Operativas (Mesas, Menú del Día, Cocina KDS)

- **Tipografía Operativa Sans-Serif:** En tarjetas de salón, cocina y pedidos se usa `Plus Jakarta Sans` en negrita con números tabulares (`font-sans font-bold tabular-nums text-lg text-[#2C1A0E]`), nunca Serif.
- **Cero Truncamiento:** Nombres de mesas y pedidos (`Mesa 1`, `Para llevar`) deben mostrarse íntegros sin puntos suspensivos (`...` o `Mes...`).
- **Pastillas de Estado Compactas:** En tarjetas, las pastillas de estado usan ancho dinámico (`w-auto px-2.5 py-0.5 shrink-0`) para no competir horizontalmente con los títulos.

---

## 7. Lenguaje del Mundo Real y Cero Códigos Técnicos en la UI (Heurística 2 Nielsen)

- Queda estrictamente prohibido mostrar identificadores de ingeniería como `(CUS06)`, `(RF-04)` o `(MSG-xx)` en textos visibles al usuario (títulos, subtítulos, descripciones, mensajes de alerta o modales).
- Todos los mensajes deben estar formulados en lenguaje natural, claro y orientado a la operación gastronómica.

---

## 8. Adaptabilidad Multirresolución y Layout Fluido (Monitores 1920x1080+ vs Laptops 1366x768 / 1536x864)

- **Contenedor Fluido Global:**
  - En lugar de `max-w-5xl`, `max-w-6xl` o `max-w-7xl`, todos los módulos dentro de `<main>` implementan `w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10`.
  - Permite aprovechar monitores Full HD y 2K sin bandas vacías gigantes, manteniendo márgenes armónicos en laptops.
- **Barra Lateral (Sidebar) Escalable de Tres Bloques:**
  - Ancho adaptativo `w-60 xl:w-64 2xl:w-72 shrink-0`.
  - Estructura flex con: (1) Cabecera de Logo fija (`shrink-0`); (2) Navegación central con scroll invisible (`[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`) y padding vertical compacto (`py-2 2xl:py-2.5`), garantizando que los 11 accesos del Administrador se visualicen sin barra de scroll gris en pantallas de 768px; (3) Pie fijo "Acceso protegido" (`shrink-0`).
- **Grillas Responsivas Inteligentes:**
  - **Mesas:** `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4`. Evita forzar 5 columnas en anchos de laptop donde las tarjetas se apretaban.
  - **Catálogo de Pedidos (Salón y Llevar):** `grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5`.
  - **Panel de Ticket Derecho:** `w-full lg:w-[340px] xl:w-[380px] 2xl:w-[420px] shrink-0`.
- **Estructura Interna de Acciones en Tarjetas de Mesas:**
  - Fila `flex items-center gap-1.5 sm:gap-2 w-full`.
  - Botones primarios (`Pedido`, `Cobrar`): `flex-1 min-w-0 justify-center text-xs px-2 rounded-lg whitespace-nowrap`.
  - Botones secundarios de icono (`Editar`, `Desactivar`): `w-8 h-8 shrink-0 flex items-center justify-center`.
