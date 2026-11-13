# Sistema de Diseño Móvil - Restaurante Girasoles

Guía técnica y normativa de interfaz para la aplicación móvil (React 19 + TypeScript + Vite + Tailwind CSS 4 + Capacitor Android).

---

## 1. Tokens de Color y Superficies

Definidos en `mobile/src/index.css` bajo directiva `@theme` con soporte reactivo para `html.dark`:

| Categoría | Modo Claro | Modo Oscuro (`html.dark`) | Uso Canónico |
| :--- | :--- | :--- | :--- |
| **Corporativo Primario** | `--color-primary`: `#C74E00` | `#C74E00` | Fondos de botones primarios e indicadores de navegación activos. |
| **Acento de Marca** | `--color-accent`: `#B84500` | `#E8B49A` | Textos destacados, iconos, montos monetarios y enlaces (> 4.5:1 AA). |
| **Marca Oscura** | `--color-brand-dark`: `#482813` | `#1F1D1B` | Fondo de cabecera superior `AppHeader` y splash de arranque. |
| **Lienzo (Canvas)** | `--color-canvas`: `#FAF7F4` | `#1B1A19` | Fondo general de la aplicación y contenedores empotrados. |
| **Superficie** | `--color-surface`: `#FFFFFF` | `#252320` | Tarjetas `Card`, hojas inferiores `BottomSheet` y barras fijas. |
| **Tipografía Ink** | `--color-ink`: `#2C1A0E` | `#F5F5F5` | Texto principal de títulos, valores y etiquetas. |
| **Tipografía Muted** | `--color-ink-muted`: `#574C45` | `#B0B0B0` | Subtítulos, metadatos y descripciones secundarias. |
| **Líneas y Bordes** | `--color-line`: `#E5E0DB` | `#3A3634` | Separadores y bordes estructurales de componentes. |
| **Éxito / Libre** | `--color-success`: `#059669` / `#ECFDF5` | `#34D399` / `#102418` | Mesas libres, comandas listas y confirmaciones. |
| **Aviso / Ocupada** | `--color-warning`: `#D97706` / `#FFFBEB` | `#FBBF24` / `#2A2412` | Mesas ocupadas y pedidos pendientes. |
| **Peligro / Agotado** | `--color-danger`: `#E11D48` / `#FFF1F2` | `#F87171` / `#2A1414` | Platos agotados, cancelaciones y botones destructivos. |
| **Información** | `--color-info`: `#2563EB` / `#EFF6FF` | `#60A5FA` / `#141E2E` | Comandas en preparación y avisos de sistema. |

---

## 2. Escala Tipográfica (Inter Variable)

- **Tipografía Base:** `Inter Variable`, sans-serif.
- **Tamaño Mínimo Absoluto:** `text-xs` (12px / 0.75rem). Prohibido terminantemente el uso de `text-[10px]`, `text-[11px]` o `text-[Npx]`.
- **Escala Autorizada:** `text-xs` (12px), `text-sm` (14px), `text-base` (16px), `text-lg` (18px), `text-xl` (20px), `text-2xl` (24px), `text-3xl` (30px).
- **Montos Monetarios y Contadores:** Siempre utilizar clase `tabular-nums` para alineación visual correcta de dígitos.

---

## 3. Catálogo de Componentes Compartidos

Ubicados en `src/components/ui/` y `src/components/layout/`:

1. **`AppHeader`:** Barra superior global fija. Logotipo de 32x32px, título, rol/usuario truncado e `IconButton` de alternancia de tema claro/oscuro.
2. **`BottomNav`:** Barra de navegación fija con objetivo táctil por pestaña >= 48x56px, soporte de badge numérico y haptic feedback.
3. **`PageHeader`:** Encabezado interno con soporte de botón volver, título (`text-xl font-bold`), subtítulo con tiempo relativo y botón de refresco accesible.
4. **`Button`:** Variantes `primary`, `secondary`, `outline`, `danger`, `ghost`. Tamaños `sm` (>= 44px), `md` (48px), `lg` (56px) con spinner accesible.
5. **`IconButton`:** Botón circular/cuadrado con `aria-label` obligatorio y dimensión mínima garantizada de 44x44px.
6. **`Card`:** Superficie elevada con variantes interactiva/estática y borde izquierdo semántico (`accent="success|warning|danger|info"`).
7. **`FilterChipBar` / `FilterChip`:** Fila horizontal táctil con scroll suave e indicador activo automático.
8. **`StatusBadge`:** Insignia de estado que resuelve icono y contraste WCAG AA automático para mesas, comandas y caja.
9. **`StatCard`:** Tarjeta de métricas gerenciales con título, valor monetario/numérico e icono contextual.
10. **`Skeleton` / `SkeletonList`:** Indicador de carga accesible que respeta `prefers-reduced-motion`.
11. **`BottomSheet` / `ConfirmSheet`:** Diálogos modales accesibles con `role="dialog"`, trampa de foco y compatibilidad con botón Atrás de Android.
12. **`ToastProvider` / `useToast()`:** Avisos flotantes accesibles con `role="status"` ubicados sobre la barra de navegación inferior.

---

## 4. Regla de Contraste y Accesibilidad (WCAG AA)

- **Regla del Color Acento:** En textos e iconos sobre fondos oscuros o superficies elevadas, **jamás usar `text-primary`** (produce ratio insuficiente de 3.74:1). Usar siempre `text-accent` (ratio > 8.5:1 en modo oscuro).
- **Objetivo Táctil Mínimo:** Todo elemento interactivo (botones, switches, chips, inputs) debe medir al menos **44x44 px** de área física efectiva.
- **Iconos sin Texto:** Requieren obligatoriamente atributo `aria-label` descriptivo en español formal.
- **Formularios e Inputs:** Deben incluir `inputMode` semántico (`numeric`, `email`, `text`), `autoComplete` estándar y etiqueta asociada.

---

## 5. Glosario Canónico de Estados y Terminología

Los textos mostrados al usuario deben apegarse estrictamente a la nomenclatura oficial del restaurante:

- **Mesas:** `Libre`, `Ocupada`, `Inactiva`.
- **Pedidos / Comandas:** `Pendiente`, `En preparación`, `Listo`, `Pagado`, `Anulado`.
- **Caja y Turno:** `Abierta`, `Cerrada`.
- **Métodos de Pago:** `Efectivo`, `Yape`.
- **Comprobantes:** `Ticket` (terminal móvil), `Boleta` / `Factura` (sistema web).

---

## 6. Pauta de Redacción y Tono Formal (USTED)

- Toda comunicación dirigida al personal del restaurante debe emplear el pronombre **USTED** (ej. *"¿Está seguro de asentar el cierre definitivo de caja?"*, *"Tendrá que ingresar nuevamente sus credenciales"*).
- Prohibido el uso de modismos regionales, lenguaje informal o atribuciones automáticas.
- Mensajes de confirmación claros, concisos y con advertencia de irreversibilidad en operaciones críticas.
