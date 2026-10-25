RESTAURANTE GIRASOLES
Anexo: CUS08 – Gestión de pedidos
Casos de uso, interfaz, reglas, API, pruebas y trazabilidad · Metodología XP · Estructura única por CUS

# Correspondencia de numeración vigente

Este anexo continúa los CUS05 a CUS07 con la misma numeración definitiva y los mismos ajustes de códigos, para que sean únicos en todo el documento de construcción:

<!-- tabla 1 -->
| Elemento | Antes | Ahora | Motivo |
|---|---|---|---|
| CUS | CUS09.1, CUS09.2 y CUS09.3 | CUS08.1 (listar pedidos y aviso de comanda lista) y CUS08.2 (modificar o anular) | Se retiró el antiguo CUS03 (Perfil); el aviso de comanda lista no es un CUS propio |
| HU / RF | HU22, HU23 y HU27 / RF-22, RF-23 y RF-27 | HU21 (modificar o anular) y HU22 (listar con aviso) / RF-21 y RF-22 | Numeración de 35 RF y 35 HU; RF-27 se fusionó con listar pedidos |
| Escenarios | E-166 a E-197 | E-188 a E-219 | E-166 a E-187 ya son del pedido para llevar (CUS07) |
| Requerimientos no funcionales | RNF-27 a RNF-30 | RNF-28 a RNF-31 | El pedido para llevar ya usa hasta RNF-27 |
| Mensaje de plato agotado | MSG-79 | MSG-225 | MSG-79 es «No hay menú definido para hoy» (CUS04) |
| Referencias a cocina | CUS10.2 y CUS10.3 | CUS09.1 y CUS09.2 | Numeración vigente de los CUS |

Los códigos de reglas (RV, RN), mensajes (MSG) y demás escenarios se conservan.

# CUS08: Gestión de pedidos


## 1. Ficha del CUS general


<!-- tabla 2 -->
| Campo | Detalle |
|---|---|
| CUS general | CUS08: Gestión de pedidos |
| Interfaz (GUI) | Interfaz 8: Pedidos |
| Actor(es) | Administrador, Cajero y Mozo (el aviso de comanda lista es para quien registró el pedido) |
| HU / RF de origen | HU21 y HU22 / RF-21 y RF-22 |
| Descripción | Una sola pantalla con dos casos de uso: la lista de pedidos con su detalle y el aviso de comanda lista (CUS08.1, Vistas 8.1, 8.2 y 8.5) y la modificación y anulación de pedidos (CUS08.2, Vistas 8.3 y 8.4). Es la pantalla que más se consulta durante el servicio. |
| Alcance | El aviso de comanda lista no es una pantalla separada: aparece sobre cualquier pantalla y en la lista, y es parte de CUS08.1. |


<!-- tabla 3 -->
| CUS | Título | Actor | HU | RF | Prioridad | Iteración | Complejidad |
|---|---|---|---|---|---|---|---|
| CUS08.1 | Listar pedidos con su estado y avisar comanda lista | Administrador, Cajero y Mozo | HU22 | RF-22 | Alta (Must) | 1/3 | Media |
| CUS08.2 | Modificar o anular pedido | Mozo, Cajero y Administrador | HU21 | RF-21 | Alta (Must) | 1/3 | Media |

Criterio: la prioridad se obtiene de la validación MoSCoW de la HU (Must = Alta, Should = Media, Could = Baja) y la iteración sigue la prioridad (Alta = 1/3, Media = 2/3, Baja = 3/3).

## 2. Decisiones adoptadas


<!-- tabla 4 -->
| Tema | Decisión | Vacío que cubre |
|---|---|---|
| Lista de pedidos | Pedidos del día, los más recientes primero, de 20 en 20, con N.º, mesa o "Para llevar" (y referencia), hora, total, estado y acciones. Encima, contadores por estado que también sirven de filtro. Se refresca cada 15 segundos. | RF-22 |
| Filtros | Estado, tipo (mesa o para llevar), mesa y "Solo mis pedidos". El Administrador además elige una fecha (un día); Mozo y Cajero solo ven el día de hoy. | CUS08.1 |
| Estado del pedido | Se deriva de sus comandas: si alguna está en preparación, "En preparación"; si no, si alguna está pendiente, "Pendiente"; si todas están listas, "Listo". "Pagado" y "Anulado" los fijan el cobro y la anulación; si un pedido pagado aún tiene comandas pendientes o en preparación (por ejemplo, un pedido para llevar cobrado al pedir), se muestra "Pagado" junto con su estado de preparación. | Faltaba una definición única |
| Detalle del pedido | Desde cada fila se abre el detalle: líneas con observaciones, total, estado de cada comanda, quién y cuándo lo registró y, si está anulado, su motivo. | RF-22 no incluye el detalle |
| Cuándo se modifica o anula | Modificar: solo quien lo registró (Mozo, Cajero o Administrador) y mientras todas las comandas sigan pendientes. Anular: quien lo registró, en las mismas condiciones, o el Administrador en cualquier pedido no pagado. Si no corresponde, los botones aparecen deshabilitados con el motivo. | RF-21 |
| Modificar | Se reutiliza la pantalla del pedido (CUS06): cambiar cantidades u observaciones, quitar o agregar productos. Las líneas conservan su precio; los productos nuevos toman el precio vigente. Para quitar todo, se anula. | CUS08.2 |
| Anular | Exige un motivo de 5 a 100 caracteres, con motivos rápidos que lo rellenan ("Cliente se retiró", "Error al registrar", "Plato agotado"). El pedido anulado queda en la lista con su motivo y no suma a los totales. | CUS08.2 |
| Efecto en cocina y mesa | Una comanda modificada se muestra en cocina con la etiqueta "Modificada"; una anulada deja de verse. Al anular el único pedido abierto de una mesa, la mesa queda Libre. | CUS08.2 |
| Aviso de comanda lista | Aparece en pantalla al responsable (el usuario que registró el pedido de mesa, Mozo o Administrador, o el cajero si es para llevar), con el número y la mesa o "Para llevar". No desaparece solo: se cierra con un botón y queda como visto. | CUS08.1 |
| Cómo llega el aviso | La aplicación consulta los avisos cada 15 segundos en cualquier pantalla y muestra un contador en el menú ("PEDIDOS · 2 listos"). Si el mozo responsable no tiene sesión, el aviso va a cualquier mozo con sesión. | Faltaba definir el mecanismo |
| Estado "Listo" | El estado lo fija la cocina (CUS09.2); el aviso solo notifica. El estado sigue siendo "Listo" hasta el cobro. | Orden confuso en CUS08.1 |
| Auditoría | Se registran las modificaciones (antes y después), las anulaciones con su motivo y los avisos vistos. | Control de la dueña |
| Opciones de menús completos al modificar | Mientras todas las comandas estén pendientes se pueden cambiar las opciones de un menú completo; el precio de la línea no cambia (RN-133). | Ajuste de menús completos |


## 3. Análisis del usuario (Diseño Centrado en el Usuario)


<!-- tabla 5 -->
| Aspecto | Descripción |
|---|---|
| Quién usa la interfaz | Mozos (celular), cajero (computadora) y administradora. Es la pantalla que más se consulta durante el servicio. |
| Necesidades | Mozo: saber cuándo su pedido está listo y corregir un error rápido. Cajero: ubicar el pedido que debe cobrar. Administradora: ver qué pasó en el día y quién anuló qué. |
| Dificultades previsibles | Perder un aviso en medio del ruido; modificar un pedido que cocina ya empezó; anular el pedido equivocado; no saber por qué un botón no funciona; encontrar un pedido entre muchos; ver información desactualizada. |
| Contexto de uso | Hora pico, ruido, movimiento constante, una sola mano y conexión inestable. Hoy el aviso es verbal y el control, un cuaderno. |


## 4. Plantillas de casos de uso


### CUS08.1: Listar pedidos con su estado y avisar comanda lista


<!-- tabla 6 -->
| Código: CUS08.1 | Título: Listar pedidos con su estado y avisar comanda lista (Vistas 8.1, 8.2 y 8.5) | Fecha: 21.10.2026 | Iteración: 1/3 |
|---|---|---|---|
| Actor(es): Administrador, Cajero y Mozo (aviso: quien registró el pedido) |  |  |  |
| Prioridad: Alta (Must) | Complejidad: Media |  |  |
| Historia de usuario: HU22 · Listar pedidos con su estado y mostrar el aviso de comanda lista (M) |  |  |  |
| Requerimiento de origen: RF-22 (ampliado con el aviso de comanda lista) |  |  |  |
| Descripción: Permite visualizar los pedidos del día con su estado y filtrarlos, y recibir un aviso visible cuando cocina marca una comanda como lista, para saber cuáles están en curso, cuáles recoger y cuáles cobrar. |  |  |  |
| Precondición: El usuario tiene sesión iniciada con rol Administrador, Cajero o Mozo. |  |  |  |
| Flujo principal:<br>1. El usuario accede a la opción PEDIDOS; el sistema muestra "Cargando pedidos…".<br>2. El sistema consulta los pedidos del día.<br>3. Muestra la lista (más recientes primero) con número, mesa o "Para llevar", hora, total y estado, junto con los contadores por estado y la hora de actualización.<br>4. Opcionalmente filtra por estado (también tocando un contador), por tipo, por mesa o con "Solo mis pedidos"; el Administrador además elige la fecha.<br>5. El sistema actualiza la lista según el criterio sin recargar la página y se refresca solo cada 15 segundos.<br>6. Opcionalmente selecciona un pedido y el sistema muestra su detalle (líneas, observaciones, opciones de los menús completos, total, estado de cada comanda y quién lo registró).<br>7. Cuando el cocinero marca una comanda como "lista" (CUS09.2), el pedido pasa a "Listo" según RN-64 y el sistema identifica al responsable: el usuario que registró el pedido de mesa (Mozo o Administrador) o el cajero si es para llevar.<br>8. En 15 segundos o menos, el sistema muestra sobre la pantalla en uso una ventana emergente con MSG-123 (número, mesa o "Para llevar" y referencia) y suma uno al contador del menú ("PEDIDOS · 2 listos").<br>9. El usuario recoge el pedido en cocina y pulsa CERRAR; el sistema marca el aviso como visto, baja el contador y quita el resaltado de "Listo" en la lista. |  |  |  |
| Flujo alterno:<br>Sin pedidos hoy: MSG-113. Ningún pedido con el filtro: MSG-112 y "Quitar filtros".<br>Si el usuario es mozo, el sistema destaca sus propios pedidos con la etiqueta "Mío".<br>Si el usuario es administrador, puede consultar fechas anteriores; si un Mozo o Cajero lo intenta por servicio, el servidor responde 403 con MSG-39.<br>El pedido está anulado: se muestra atenuado con su motivo en el detalle.<br>Desde la fila el usuario accede a las acciones que le corresponden: MODIFICAR o ANULAR (CUS08.2), AGREGAR PRODUCTOS (Mozo o Administrador, CUS06.2) o COBRAR (Cajero, CUS10.1).<br>El usuario no tiene abierta la pantalla de pedidos: el aviso se muestra igualmente sobre la pantalla en uso o, si no hay sesión, al ingresar.<br>El usuario que registró el pedido no tiene sesión activa: el aviso se muestra a cualquier mozo con sesión y, al cerrarlo uno, desaparece para todos.<br>El usuario no ve el aviso: el estado "Listo" y el contador siguen visibles en el menú y en la lista.<br>Se agrega una comanda adicional a un pedido ya listo (CUS06.2): el pedido vuelve a "Pendiente" y se genera un nuevo aviso cuando esa comanda esté lista. |  |  |  |
| Postcondición: La lista de pedidos con su estado actual queda visible y el mozo o cajero queda informado de que el pedido está listo; el aviso queda registrado como visto. |  |  |  |
| Excepciones:<br>Falla al obtener los datos: MSG-114 con Reintentar; si había datos previos se mantienen con el aviso de antigüedad y se registra el incidente.<br>Falla al generar el aviso: el estado "Listo" igual se actualiza en la lista de pedidos y se registra el incidente.<br>Pérdida de conexión: MSG-09; el aviso llega al recuperarla y aparece el texto "Sin conexión, datos de hace X s". |  |  |  |
| Reglas y mensajes aplicables: RV-81 a RV-83; RN-63, RN-64, RN-66, RN-71 a RN-73; RNF-28 a RNF-31; MSG-112 a 114, 123, 39, 09. |  |  |  |


### CUS08.2: Modificar o anular pedido


<!-- tabla 7 -->
| Código: CUS08.2 | Título: Modificar o anular pedido (Vistas 8.3 y 8.4) | Fecha: 21.10.2026 | Iteración: 1/3 |
|---|---|---|---|
| Actor(es): Mozo, Cajero y Administrador |  |  |  |
| Prioridad: Alta (Must) | Complejidad: Media |  |  |
| Historia de usuario: HU21 · Modificar o anular un pedido (M) |  |  |  |
| Requerimiento de origen: RF-21 (ampliado a menús completos) |  |  |  |
| Descripción: Permite corregir un pedido (quien lo registró, antes de que cocina inicie su preparación) o anularlo (quien lo registró, en las mismas condiciones, o el Administrador en cualquier pedido no pagado), indicando el motivo en caso de anulación. |  |  |  |
| Precondición: El usuario tiene sesión iniciada y el pedido no está pagado ni anulado; para modificar, o para que un Mozo o Cajero anule, registró el pedido y todas sus comandas siguen pendientes (el Administrador puede anular cualquier pedido no pagado). |  |  |  |
| Flujo principal:<br>A. Modificar (Vista 8.3)<br>1. El usuario pulsa MODIFICAR en el pedido; el sistema verifica que siga sin iniciar en cocina (RV-75; la anulación del Administrador no tiene esta restricción).<br>2. El sistema muestra la pantalla del pedido con sus líneas actuales.<br>3. El usuario cambia cantidades u observaciones, quita líneas, agrega productos o menús completos nuevos (no agotados) o cambia las opciones de un menú completo (RV-167).<br>4. Pulsa GUARDAR; el sistema valida (RV-78) y deshabilita el botón.<br>5. El servidor revalida el estado, actualiza el pedido, recalcula el total y marca la comanda como "Modificada" para cocina (RN-68).<br>6. El sistema muestra MSG-119 y el pedido actualizado en la lista.<br>B. Anular (Vista 8.4)<br>1. El usuario pulsa ANULAR en el pedido; el sistema abre el diálogo con los motivos rápidos y el campo Motivo.<br>2. Elige un motivo rápido o escribe uno (5 a 100 caracteres) y pulsa ANULAR PEDIDO.<br>3. El sistema muestra la confirmación MSG-118 con el foco en CANCELAR; el usuario confirma.<br>4. El servidor marca el pedido como "Anulado" con su motivo, retira la comanda de cocina y, si era el único pedido abierto de una mesa, deja la mesa Libre.<br>5. El sistema muestra MSG-120 y el pedido atenuado en la lista. |  |  |  |
| Flujo alterno:<br>Cocina ya inició alguna comanda: los botones aparecen deshabilitados y, si se fuerza, el servidor responde con MSG-115 sin cambiar nada (no aplica a la anulación del Administrador).<br>El usuario no registró el pedido y no es Administrador: MSG-116.<br>Motivo vacío o de menos de 5 caracteres: MSG-117.<br>Se quitan todos los productos al modificar: MSG-121 (debe anular el pedido).<br>Se agrega un plato agotado: MSG-225.<br>Cocina inicia la preparación mientras el usuario edita: al guardar, el servidor responde MSG-115 y el pedido original queda intacto.<br>El pedido ya fue pagado o anulado: MSG-104.<br>Cancelar con cambios sin guardar (botón o Esc): MSG-102; si confirma, el pedido se mantiene sin cambios.<br>Un usuario sin permiso (Mozo o Cajero que no lo registró, o rol Cocinero) intenta modificar o anular por servicio: MSG-116 o MSG-39 (403). El Administrador solo puede anular pedidos de otros, no modificarlos.<br>Se cambian las opciones de un menú completo con alguna comanda ya en preparación: MSG-115; no cambia. |  |  |  |
| Postcondición: El pedido queda modificado o anulado con su motivo registrado y auditado; cocina ve la comanda actualizada o deja de verla. |  |  |  |
| Excepciones:<br>Falla al actualizar o anular: MSG-122; se conserva el pedido original y se registra el incidente.<br>Pérdida de conexión: MSG-09. |  |  |  |
| Reglas y mensajes aplicables: RV-75 a RV-80, RV-84, RV-167; RN-65 a RN-70, RN-73, RN-133, RN-141; RNF-29, RNF-30; MSG-115 a 122, 97 a 99, 225, 102, 104, 39. |  |  |  |


## 5. Interfaz (GUI)


<!-- tabla 8 -->
| Interfaz | RF | HU | CUS | Qué se hace dentro de la interfaz |
|---|---|---|---|---|
| 8. Pedidos | RF-21 y RF-22 | HU21 y HU22 | CUS08 (08.1 y 08.2) | Listar y filtrar pedidos, ver el detalle, recibir el aviso de comanda lista, modificar y anular pedidos. |


### Vista 8.1: Lista de pedidos, pantalla base (CUS08.1) — restaurante.app/pedidos


<!-- tabla 9 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 10 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Menú "Pedidos" | Con el contador de avisos sin ver ("PEDIDOS · 2 listos") para Mozo, Cajero y Administrador, en todas las pantallas (RNF-31). |
| 2 | Contadores por estado | "Pendiente 3 · En preparación 2 · Listo 1 · Pagado 12 · Anulado 0"; al tocarlos filtran la lista. |
| 3 | Filtros | Estado, tipo (mesa o para llevar), mesa y "Solo mis pedidos"; fecha solo para el Administrador. |
| 4 | Fila de pedido | N.º, mesa o "Para llevar" (y referencia), hora, total, insignia de estado con texto y etiqueta "Mío". |
| 5 | Acciones | MODIFICAR y ANULAR (deshabilitados con el motivo MSG-115 o MSG-116), AGREGAR PRODUCTOS (Mozo o Administrador) y COBRAR (Cajero). |
| 6 | Actualización | "Actualizado hace X s" y refresco automático cada 15 segundos. |


### Vista 8.2: Detalle del pedido (CUS08.1) — restaurante.app/pedidos/{id}


<!-- tabla 11 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 12 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Líneas del pedido | Productos y menús completos con sus opciones, observaciones y cantidades. |
| 2 | Total y estado | Total y estado de cada comanda. |
| 3 | Registro | Quién y cuándo lo registró y, si está anulado, su motivo. |


### Vista 8.3: Modificar pedido (CUS08.2) — restaurante.app/pedidos/{id}/modificar


<!-- tabla 13 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 14 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Pantalla del pedido | La del CUS06 con las líneas actuales; se pueden cambiar cantidades, observaciones y opciones, quitar o agregar. |
| 2 | Indicador "Cambios sin guardar" | Visible mientras haya cambios; al cancelar pide confirmar el descarte (MSG-102). |
| 3 | Botones GUARDAR y CANCELAR | GUARDAR muestra "Guardando…"; MSG-121 si se quitan todos los productos y MSG-115 si cocina ya inició. |


### Vista 8.4: Anular pedido (CUS08.2) — restaurante.app/pedidos


<!-- tabla 15 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 16 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Motivos rápidos | "Cliente se retiró", "Error al registrar" y "Plato agotado" rellenan el campo. |
| 2 | Campo Motivo | De 5 a 100 caracteres; muestra MSG-117. |
| 3 | Diálogo de confirmación | MSG-118 con el número y la mesa o "Para llevar"; foco inicial en CANCELAR. |
| 4 | Botones CANCELAR y ANULAR PEDIDO | ANULAR PEDIDO muestra "Anulando…"; confirma con MSG-120. |


### Vista 8.5: Aviso de comanda lista (CUS08.1) — sobre cualquier pantalla

El aviso no es una pantalla separada: se muestra sobre la pantalla en uso.

<!-- tabla 17 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 18 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Ventana emergente | MSG-123 con número, mesa o "Para llevar" y referencia; no se cierra sola. |
| 2 | Botón CERRAR | Marca el aviso como visto, baja el contador y quita el resaltado de "Listo". |
| 3 | Contador del menú | Cantidad de avisos sin ver. |


## 6. Estados de la interfaz


<!-- tabla 19 -->
| Estado | Comportamiento visual |
|---|---|
| Cargando | "Cargando pedidos…" con marcadores de posición. |
| Lista con pedidos | Filas con N.º, mesa o "Para llevar", hora, total, insignia de estado y acciones; contadores por estado arriba ("Pendiente 3 · En preparación 2 · Listo 1 · Pagado 12 · Anulado 0"); texto "Actualizado hace X s". |
| Pedidos propios (Mozo) | Etiqueta "Mío" y borde resaltado; filtro "Solo mis pedidos". |
| Pedido listo | Insignia "Listo" resaltada hasta que se cierre su aviso. |
| Pedido anulado | Fila atenuada con el texto "Anulado" y el motivo visible en el detalle. |
| Acciones no disponibles | Botones MODIFICAR y ANULAR deshabilitados con el motivo (MSG-115 o MSG-116) al enfocarlos o tocarlos. |
| Detalle | Panel o ventana con líneas, observaciones, total, estado de cada comanda, registrado por y motivo si está anulado. |
| Modificando | Pantalla del pedido (CUS06) con las líneas actuales; botones GUARDAR y CANCELAR; indicador "Cambios sin guardar". |
| Anulando | Diálogo con motivos rápidos, campo Motivo y botones CANCELAR y ANULAR PEDIDO; foco inicial en CANCELAR. |
| Guardando | Botones "Guardando…" o "Anulando…" deshabilitados (RV-79). |
| Aviso de comanda lista | Ventana emergente con MSG-123 y botón CERRAR; el contador del menú indica cuántos hay sin ver; no se cierra solo. |
| Sin pedidos | MSG-113 (sin filtros) o MSG-112 (con filtros) y botón "Quitar filtros". |
| Error de carga | MSG-114 con Reintentar; si ya había datos, se mantienen con "Sin conexión, datos de hace X s". |
| Móvil | Cada pedido como tarjeta de una columna con sus acciones; controles de al menos 44 px. |


## 7. Reglas de validación (RV)


<!-- tabla 20 -->
| Código | Regla | Elemento UI | Mensaje |
|---|---|---|---|
| RV-75 | Un pedido se modifica solo por quien lo registró y mientras todas sus comandas estén pendientes; se anula por quien lo registró (en las mismas condiciones) o por el Administrador (cualquier pedido no pagado, aun en preparación o listo). Si no corresponde, el botón aparece deshabilitado con el motivo y el servidor también lo rechaza. | Botones MODIFICAR y ANULAR | MSG-115, 116 |
| RV-76 | El motivo de anulación es obligatorio, de 5 a 100 caracteres, con motivos rápidos que lo rellenan; se recortan los espacios de los extremos. | Campo Motivo | MSG-117 |
| RV-77 | Anular pide confirmación que nombra el pedido (número y mesa o "Para llevar"), con el foco inicial en CANCELAR. | Diálogo de anulación | MSG-118 |
| RV-78 | Al modificar rigen las reglas del pedido (RV-61 a RV-66, RV-70 y RV-71 del CUS06): al menos un producto, cantidad de 1 a 20, productos no agotados y observación de hasta 100 caracteres. Quitar todos los productos obliga a anular. | Pantalla de modificación | MSG-97, 98, 99, 79, 121 |
| RV-79 | Mientras se guarda o anula, el botón queda deshabilitado con "Guardando…" o "Anulando…" para evitar envíos repetidos. | Botones GUARDAR y ANULAR PEDIDO | — |
| RV-80 | Antes de guardar, el servidor revalida el estado del pedido y de sus comandas; si cocina ya inició (salvo la anulación del Administrador) o el pedido fue pagado o anulado, rechaza el cambio y no pierde el pedido original. | Pantalla de modificación | MSG-115, 104 |
| RV-81 | Los filtros de la lista (estado, tipo, mesa, solo míos y fecha para el Administrador) se aplican sin recargar la página, son combinables y por defecto muestran los pedidos de hoy. | Filtros y contadores | MSG-112 |
| RV-82 | El estado se muestra con texto además del color: Pendiente, En preparación, Listo, Pagado, Anulado. | Insignia de estado | — |
| RV-83 | El aviso de comanda lista muestra el número, la mesa o "Para llevar" y la referencia; no se cierra solo: lo cierra el usuario con un botón. | Aviso emergente | MSG-123 |
| RV-84 | Si hay cambios sin guardar al modificar y el usuario cancela o sale, se pide confirmar el descarte. | Botón CANCELAR / navegación | MSG-102 |
| RV-167 | Al modificar un pedido se pueden cambiar las opciones de un menú completo mientras todas las comandas estén pendientes (amplía RV-78). | Pantalla de modificación | MSG-115 |


## 8. Reglas de negocio y requerimientos no funcionales


<!-- tabla 21 -->
| Código | Regla |
|---|---|
| RN-63 | El Administrador, el Cajero y el Mozo listan los pedidos; por defecto los del día. Solo el Administrador consulta fechas anteriores. |
| RN-64 | El estado del pedido se deriva de sus comandas: "En preparación" si alguna lo está; si no, "Pendiente" si alguna lo está; "Listo" si todas están listas. "Pagado" y "Anulado" los fijan el cobro y la anulación; si un pedido pagado aún tiene comandas pendientes o en preparación (por ejemplo, un pedido para llevar cobrado al pedir), se muestra "Pagado" junto con su estado de preparación. |
| RN-65 | Un pedido solo se modifica mientras todas sus comandas estén pendientes y únicamente por quien lo registró (Mozo, Cajero o Administrador). Se anula por quien lo registró, en las mismas condiciones, o por el Administrador, que puede anular cualquier pedido no pagado, aun con comandas en preparación o listas (por ejemplo, un cliente que se fue sin pagar), siempre con motivo. |
| RN-66 | Toda anulación exige un motivo; el pedido anulado permanece en la lista con su motivo y no suma a los totales de ventas del día. |
| RN-67 | Al anular un pedido de mesa que era el único abierto de la mesa, la mesa vuelve a Libre (RN-147). |
| RN-68 | Modificar un pedido actualiza su comanda, que cocina ve como "Modificada"; anular un pedido retira su comanda de cocina. |
| RN-69 | Las líneas modificadas conservan su precio original; los productos nuevos toman el precio vigente (RN-51). |
| RN-70 | Un pedido pagado o anulado no se puede modificar ni anular. |
| RN-71 | El aviso de comanda lista se dirige al usuario que registró el pedido de mesa (Mozo o Administrador) o al cajero si es para llevar; si ese usuario no tiene sesión, a cualquier mozo con sesión. |
| RN-72 | El aviso permanece hasta que el destinatario lo cierra y queda registrado como visto; el estado "Listo" se mantiene hasta el cobro. |
| RN-73 | Las modificaciones (antes y después), las anulaciones (con motivo) y los avisos vistos se registran en auditoría. |
| RNF-28 | La lista carga en menos de 2 segundos con hasta 200 pedidos del día y se refresca cada 15 segundos; los avisos se consultan en el mismo ciclo, por lo que aparecen en 15 segundos o menos. |
| RNF-29 | La interfaz es adaptable a móvil (filas como tarjetas), con controles de al menos 44 px, y operable con teclado (RNF-04). |
| RNF-30 | El servidor valida token, rol y propiedad del pedido en cada endpoint (RNF-02); modificar y anular son operaciones atómicas. |
| RNF-31 | El contador de avisos se muestra en el menú de Mozo, Cajero y Administrador en todas las pantallas. |


## 9. Catálogo de mensajes

Se reutilizan MSG-225 (plato agotado), MSG-97 a MSG-99 (productos, cantidad y observación), MSG-102 (descartar), MSG-104 (pedido pagado o anulado), MSG-09 (conexión) y MSG-39 (sin permiso).

<!-- tabla 22 -->
| Código | Mensaje (texto al usuario) | Tipo | Ubicación |
|---|---|---|---|
| MSG-112 | No se encontraron pedidos con ese criterio. Pruebe con otro filtro. | Informativo | En la lista |
| MSG-113 | Todavía no hay pedidos hoy. | Informativo | En la lista |
| MSG-114 | No se pudieron cargar los pedidos. Intente nuevamente. (botón Reintentar) | Error | En la lista |
| MSG-115 | El pedido ya está en preparación y no puede modificarse. Avise a cocina. | Error | Aviso / botón deshabilitado |
| MSG-116 | Solo puede modificar los pedidos que usted registró; anular pedidos de otros es función del Administrador. | Error | Aviso / botón deshabilitado |
| MSG-117 | Indique el motivo de la anulación (entre 5 y 100 caracteres). | Error | Bajo el campo Motivo |
| MSG-118 | ¿Anular el pedido N.º [n] ([mesa o Para llevar])? No se podrá deshacer y quedará registrado con su motivo. | Confirmación | Diálogo |
| MSG-119 | Pedido N.º [n] modificado. Cocina verá la comanda actualizada. | Éxito | Aviso temporal (4 s) |
| MSG-120 | Pedido N.º [n] anulado. | Éxito | Aviso temporal (4 s) |
| MSG-121 | Para quitar todos los productos, anule el pedido. | Error | Sobre el botón GUARDAR |
| MSG-122 | No se pudo actualizar el pedido. El pedido original no cambió; intente nuevamente. | Error | Pantalla de modificación o diálogo |
| MSG-123 | Pedido N.º [n] listo para recoger: [mesa o Para llevar y referencia]. | Aviso | Aviso emergente |


## 10. Diccionario de datos


<!-- tabla 23 -->
| Campo | Tipo | Obligatorio | Longitud / formato | Notas |
|---|---|---|---|---|
| Número del pedido | Entero | Automático | Correlativo diario | Se muestra en lista, comanda y avisos |
| Tipo | Lista | Automático | Mesa / Para llevar | — |
| Mesa y referencia | Texto | Según tipo | — | Mesa si es de mesa; referencia opcional si es para llevar |
| Hora, total y registrado por | Hora, decimal y texto | Automático | S/ 0.00 | No editables |
| Estado | Lista | Automático | Pendiente, En preparación, Listo, Pagado, Anulado | Derivado (RN-64) |
| Motivo de anulación | Texto | Sí al anular | 5–100 | Con motivos rápidos; se recorta |
| Filtros | Listas | No | Estado, tipo, mesa, solo míos, fecha (Administrador) | Combinables |
| Aviso | Registro | Automático | Pedido, destinatario, visto / no visto, hora | Se cierra con un botón |


## 11. Contrato de API

Todos los endpoints exigen token JWT (401 sin token válido) y validan rol y propiedad del pedido en el servidor (403 si no corresponde).

<!-- tabla 24 -->
| Endpoint | Entrada | Respuestas |
|---|---|---|
| GET /api/pedidos | fecha?, estado?, tipo?, mesaId?, soloMios?, pagina, tamano (20) | 200: { items[{ id, numero, tipo, mesa, referencia, hora, total, estado, registradoPor, esMio }], total, resumen{ pendiente, enPreparacion, listo, pagado, anulado } }. 403: fecha anterior para un rol distinto del Administrador. Roles: Administrador, Cajero y Mozo. |
| GET /api/pedidos/{id} | — | 200: detalle con líneas, opciones de los menús completos, observaciones, total, estado de cada comanda, registrado por y motivo. 404: no existe. |
| PUT /api/pedidos/{id} | { lineas[] } donde cada línea es { productoId, cantidad, observacion? } o { menuCompletoId, elecciones[{ parte, productoId }], cantidad, observacion? } | 200: { total }. 400: datos inválidos. 403: no es el pedido del usuario o rol no permitido. 409: cocina ya inició, pedido pagado o anulado, o plato agotado. Roles: Mozo, Cajero y Administrador. |
| POST /api/pedidos/{id}/anular | { solicitudId, motivo } | 200: pedido anulado. 400: motivo inválido. 403: no es su pedido y no es Administrador. 409: pedido pagado o anulado, o cocina ya inició (no aplica al Administrador). Roles: Mozo, Cajero y Administrador. |
| GET /api/avisos | estado=pendiente | 200: [{ id, pedidoId, numero, tipo, mesa, referencia, hora }] dirigidos al usuario (o a cualquier mozo si el responsable no tiene sesión). Roles: Mozo, Cajero y Administrador. |
| POST /api/avisos/{id}/visto | — | 204: aviso marcado como visto. 404: no existe o ya fue visto. |


## 12. Escenarios de validación y criterios de aceptación


<!-- tabla 25 -->
| ID | Entrada / acción | Resultado esperado | Reglas | HU |
|---|---|---|---|---|
| E-188 | Entrar a PEDIDOS | Lista del día, más recientes primero, con contadores por estado y "Actualizado hace…". | RN-63, RNF-28 | HU22 |
| E-189 | Tocar el contador "Listo" | La lista muestra solo los pedidos listos. | RV-81 | HU22 |
| E-190 | Filtrar por tipo y por mesa | Se muestran solo los pedidos que cumplen ambos criterios. | RV-81 | HU22 |
| E-191 | Entrar sin pedidos hoy; luego filtrar sin coincidencias | MSG-113; con filtro, MSG-112 y "Quitar filtros". | RV-81 | HU22 |
| E-192 | Un mozo abre la lista | Sus pedidos aparecen con "Mío" y puede filtrar "Solo mis pedidos". | RN-63 | HU22 |
| E-193 | El administrador elige una fecha anterior; un mozo lo intenta por servicio | El administrador ve esa fecha; el mozo recibe 403. | RN-63 | HU22 |
| E-194 | Abrir el detalle de un pedido | Muestra líneas, observaciones, total, estado de cada comanda, registrado por y, si es anulado, su motivo. | RN-66 | HU22 |
| E-195 | Un pedido con una comanda en preparación | Estado "En preparación". | RN-64 | HU22 |
| E-196 | Se agregan productos a un pedido listo (CUS06.2) | El pedido pasa a "Pendiente" hasta que cocina marque la comanda adicional. | RN-64 | HU22 |
| E-197 | Falla del servidor al cargar | MSG-114 con Reintentar; se conservan los datos previos. | RNF-30 | HU22 |
| E-198 | Cocina cambia un estado con la lista abierta | La lista se actualiza sola en 15 segundos o menos. | RNF-28 | HU22 |
| E-199 | El mozo modifica su pedido pendiente (cantidad y observación) | MSG-119; total recalculado; cocina ve la comanda "Modificada". | RN-68, RN-69 | HU21 |
| E-200 | Quitar todos los productos al modificar | MSG-121; debe anular el pedido. | RV-78 | HU21 |
| E-201 | Agregar un plato agotado al modificar | MSG-225. | RV-78 | HU21 |
| E-202 | Intentar modificar un pedido en preparación | Botones deshabilitados con el motivo; si se fuerza, 409 y MSG-115. | RV-75, RN-65 | HU21 |
| E-203 | Cocina inicia mientras el usuario edita | Al guardar, MSG-115 y el pedido original intacto. | RV-80 | HU21 |
| E-204 | Un mozo intenta modificar el pedido de otro mozo | Botones deshabilitados; si se fuerza, 403 y MSG-116. | RN-65 | HU21 |
| E-205 | Anular con motivo y confirmar | MSG-118, luego MSG-120; el pedido queda "Anulado" con su motivo, cocina deja de verlo y no suma a los totales. | RN-66, RN-68 | HU21 |
| E-206 | Anular sin motivo o con menos de 5 caracteres | MSG-117; no se anula. | RV-76 | HU21 |
| E-207 | Anular el único pedido abierto de una mesa | La mesa vuelve a Libre. | RN-67 | HU21 |
| E-208 | Anular o modificar un pedido pagado | MSG-104; no cambia. | RN-70 | HU21 |
| E-209 | Cancelar la modificación con cambios sin guardar | MSG-102; el pedido queda como estaba. | RV-84 | HU21 |
| E-210 | El cajero modifica un pedido para llevar propio y luego intenta con uno de mesa | Puede con el propio; con el de mesa, MSG-116. | RN-65 | HU21 |
| E-211 | El administrador anula un pedido que ya está en preparación o listo (el cliente se fue sin pagar) | Puede anularlo con motivo: cocina deja de verlo y, si era el único pedido abierto de la mesa, la mesa queda Libre. No puede modificar pedidos de otros (403 y MSG-116). | RN-65 | HU21 |
| E-212 | Cocina marca lista la comanda de un pedido de mesa | En 15 segundos o menos quien lo registró ve el aviso con número y mesa; permanece hasta cerrarlo. | RN-71, RV-83 | HU22 |
| E-213 | Cocina marca lista la comanda de un pedido para llevar | El cajero recibe el aviso con "Para llevar" y la referencia. | RN-71 | HU22 |
| E-214 | El mozo responsable no tiene sesión | Cualquier mozo con sesión recibe el aviso; al cerrarlo uno, desaparece para todos. | RN-71 | HU22 |
| E-215 | Cerrar el aviso | Queda como visto, baja el contador del menú y se quita el resaltado de "Listo". | RN-72 | HU22 |
| E-216 | El usuario está en otra pantalla | El aviso aparece sobre esa pantalla y el contador del menú aumenta. | RNF-31 | HU22 |
| E-217 | Falla al generar el aviso | El estado "Listo" igual se actualiza en la lista. | RNF-30 | HU22 |
| E-218 | Doble clic en ANULAR PEDIDO | Se registra una sola anulación. | RV-79 | HU21 |
| E-219 | Solo teclado | Tab recorre filtros, filas, acciones, diálogos y el aviso; Enter confirma; Esc cancela. | RNF-29 | HU21, HU22, HU22 |
| E-396 | Modificar un pedido pendiente cambiando Quaker por Quinua | La comanda queda "Modificada" y el precio no cambia. | RV-167 | HU21 |
| E-397 | Intentar modificar las opciones con la comanda en preparación | MSG-115; no cambia. | RV-167 | HU21 |


## 13. Matriz de justificación de usabilidad


<!-- tabla 26 -->
| Principio aplicado | Elemento de la interfaz | Decisión adoptada | Justificación |
|---|---|---|---|
| ISO 9241 – Eficacia | Reglas de modificación y anulación | Solo si cocina no inició y es del mismo usuario; el servidor revalida | Se corrige sin afectar lo que cocina ya preparó |
| ISO 9241 – Eficiencia | Contadores filtro y motivos rápidos | Un toque para filtrar por estado y para elegir un motivo de anulación | Menos acciones en plena hora pico |
| ISO 9241 – Satisfacción | Avisos y estados | Aviso que no desaparece solo y estados con texto y color | Interacción clara y sin sorpresas |
| Nielsen 1 – Visibilidad del estado | Contadores, estados y "Actualizado hace…" | Resumen por estado, actualización cada 15 s y contador de avisos en el menú | Siempre sabe qué ocurre con los pedidos |
| Nielsen 2 – Mundo real | Textos y etiquetas | "Mío", "Listo", "Para llevar", "Anular" | Mismo lenguaje del restaurante |
| Nielsen 3 – Control y libertad | Cancelar y Esc | Descartar cambios o cerrar el diálogo sin efecto | Corrige sin penalización |
| Nielsen 4 – Consistencia | Pantalla de modificación | Reutiliza la pantalla del pedido (CUS06) y los mismos diálogos | Evita reaprendizaje |
| Nielsen 5 – Prevención de errores | Botones deshabilitados y confirmación | Deshabilita con el motivo; la anulación nombra el pedido y enfoca CANCELAR | Evita anular el pedido equivocado |
| Nielsen 6 – Reconocimiento | Fila y detalle | Número, mesa, estado y total visibles; detalle con líneas | No obliga a recordar qué se pidió |
| Nielsen 7 – Flexibilidad y eficiencia | Filtros y "Solo mis pedidos" | Atajos para el mozo frecuente y para el cajero | Cada rol llega rápido a lo suyo |
| Nielsen 8 – Minimalismo | Fila de pedido | Solo número, mesa, hora, total, estado y acciones | Sin distracciones |
| Nielsen 9 – Recuperarse de errores | Mensajes MSG-115, 116 y 121 | Explican por qué no se puede y qué hacer | Facilita corregir |
| Shneiderman 1 – Consistencia | Estilo y acciones | Misma paleta, botones y mensajes del sistema | Comportamiento predecible |
| Shneiderman 2 – Usabilidad universal | Móvil, texto y teclado | Tarjetas de 44 px, estado con texto, contraste 4.5:1, teclado | Atiende distintos dispositivos y niveles |
| Shneiderman 3 – Retroalimentación | Avisos y resaltado | MSG-119, 120 y 123 y fila resaltada | Sabe qué pasó |
| Shneiderman 4 – Cierre | Mensajes finales | Cada modificación o anulación termina con un aviso y la lista actualizada | Indica que la tarea concluyó |
| Shneiderman 5 – Prevenir errores | Validaciones | Motivo obligatorio, botones bloqueados al enviar y estados protegidos | Evita anulaciones accidentales y duplicadas |
| Shneiderman 6 – Reversión | Cancelar y modificar | Se puede corregir un pedido pendiente antes de que cocina inicie | Acciones reversibles mientras es posible |
| Shneiderman 7 – Control del usuario | Aviso y acciones | El aviso se cierra por decisión del usuario; nada se anula solo | Mantiene el control |
| Shneiderman 8 – Memoria a corto plazo | Resumen y aviso | Contadores y aviso con mesa y número, sin recordar qué estaba pendiente | Reduce la carga de memoria |


## 14. Matriz de trazabilidad


### 14.1 Requerimiento → historia → caso de uso → vista → prueba


<!-- tabla 27 -->
| RF | HU | CUS | Vista | Reglas / mensajes | API | Escenarios |
|---|---|---|---|---|---|---|
| RF-22 Listar pedidos con su estado y mostrar el aviso de comanda lista | HU22 (M) | CUS08.1 | 8.1, 8.2 y 8.5 | RV-81 a 83; RN-63, 64, 66, 71 a 73; RNF-28 a 31; MSG-112 a 114, 123 | GET /api/pedidos y /{id}; GET /api/avisos; POST .../visto | E-188 a E-198, E-212 a E-217, E-219 |
| RF-21 Modificar o anular un pedido | HU21 (M) | CUS08.2 | 8.3 y 8.4 | RV-75 a 80, 84, 167; RN-65 a 70, 73; MSG-115 a 122 | PUT /api/pedidos/{id} y POST .../anular | E-199 a E-211, E-218, E-219, E-396, E-397 |


### 14.2 Regla → elemento de interfaz → escenario


<!-- tabla 28 -->
| Regla | Elemento de interfaz | Escenario |
|---|---|---|
| RV-75 / RN-65 | Botones MODIFICAR y ANULAR deshabilitados con el motivo | E-202, E-204, E-210 |
| RV-76 / RV-77 | Campo Motivo, motivos rápidos y diálogo con foco en CANCELAR | E-205, E-206 |
| RV-78 | Pantalla de modificación con las reglas del pedido | E-200, E-201 |
| RV-79 | Botones en "Guardando…" y "Anulando…" | E-218 |
| RV-80 | Revalidación en el servidor antes de guardar | E-203 |
| RV-81 / RV-82 | Filtros, contadores e insignia de estado con texto | E-188 a E-191 |
| RV-83 / RN-72 | Aviso emergente que se cierra con un botón | E-212, E-215 |
| RN-64 | Estado derivado de las comandas | E-195, E-196 |
| RN-66 / RN-67 | Pedido anulado en la lista y mesa liberada | E-205, E-207 |
| RN-68 | Comanda "Modificada" y comanda anulada retirada de cocina | E-199, E-205 |
| RN-71 | Destinatario del aviso según el tipo de pedido y la sesión | E-212 a E-214 |
| RNF-28 / RNF-31 | Refresco cada 15 s y contador de avisos en el menú | E-198, E-216 |
| RV-167 | Opciones de un menú completo editables mientras todas las comandas estén pendientes | E-396, E-397 |


## 15. Evaluación del prototipo y mejoras incorporadas

Aún no hay prototipo de la gestión de pedidos; las decisiones siguientes aplican lo aprendido en los CUS anteriores.

<!-- tabla 29 -->
| Riesgo previsto | Principio | Decisión de diseño incorporada |
|---|---|---|
| Perder un aviso en medio del ruido | Nielsen 1; Shneiderman 7 | Aviso que no desaparece solo, contador en el menú y resaltado de "Listo" |
| Modificar un pedido que cocina ya empezó | Nielsen 5 y 9 | Botones deshabilitados con el motivo y revalidación en el servidor |
| Anular el pedido equivocado | Nielsen 5; Shneiderman 5 | Diálogo con número y mesa, motivo obligatorio y foco en CANCELAR |
| Encontrar un pedido entre muchos | Nielsen 7 y 8 | Contadores que filtran, "Solo mis pedidos", filtros por tipo y mesa |
| Información desactualizada | Nielsen 1 | "Actualizado hace X s", refresco automático y mensaje de falta de conexión |
| Leer el estado solo por color | Shneiderman 2; accesibilidad | Insignia con texto en todos los estados |
| Estilo distinto al resto del sistema | Shneiderman 1; Nielsen 4 | Reutilizar paleta, botones, diálogos y avisos de los CUS anteriores |


## 16. Dependencias con otros casos de uso


<!-- tabla 30 -->
| CUS relacionado | Relación con el CUS08 |
|---|---|
| CUS05 Mesas | Anular el único pedido abierto de una mesa la libera (RN-67). |
| CUS06 y CUS07 Pedidos | Origen de los pedidos; la modificación reutiliza su pantalla; AGREGAR PRODUCTOS genera una comanda adicional y puede devolver el pedido a "Pendiente". |
| CUS09 Cocina | Cambia el estado de las comandas (CUS09.1 y CUS09.2), muestra las comandas "Modificadas" y retira las anuladas; origina el aviso. |
| CUS10 Cobro | COBRAR desde la lista; pasa el pedido a "Pagado" y bloquea su modificación. |
| CUS13 Reportes | Los pedidos anulados no suman a los totales; la anulación con motivo alimenta el control de la dueña. |


<!-- tabla 31 -->
| N.º | Punto | Decisión adoptada o tarea |
|---|---|---|
| 1 | Quién modifica y anula pedidos. | Decisión: modifica quien lo registró (Mozo, Cajero o Administrador) mientras todas las comandas estén pendientes; anula quien lo registró (en las mismas condiciones) o el Administrador (cualquier pedido no pagado, aun en preparación o listo, con motivo), según RN-65. |
| 2 | El estado del pedido con varias comandas (RN-64) debe coincidir con CUS06 (RN-53) y CUS09. | Usar RN-64 como única definición del estado derivado. |
| 3 | Si un pedido tiene una comanda lista y otra pendiente (por una ampliación), RN-65 impide modificarlo aunque el estado muestre "Pendiente". | Aceptarlo; permitir modificar solo las líneas de comandas pendientes queda como mejora futura. |
| 4 | Cocina (CUS09) debe mostrar "Modificada" y retirar las comandas anuladas; hoy el CUS09 no lo menciona. | Resuelto: el CUS09 muestra la etiqueta MODIFICADA y retira las comandas anuladas (RN-68). |
| 5 | RF-22 no incluía ver el detalle del pedido, pero sin él no se sabe qué se pidió. | Resuelto: RF-22 incluye ver el detalle del pedido (Vista 8.2). |
| 6 | No existe un estado "Entregado": tras cerrar el aviso, el pedido sigue "Listo" hasta el cobro. | Decisión: no se agrega el estado "Entregado" en esta versión; el pedido queda "Listo" hasta el cobro. |
| 7 | El aviso llega con consulta cada 15 segundos, no en tiempo real, y sin sonido; en hora pico un aviso visual puede pasar desapercibido. | Aceptarlo como solución inicial; tiempo real (SignalR) y sonido opcional quedan como mejora futura. |
| 8 | La corrección de un pedido ya pagado no está cubierta (RN-70). | Resuelto: un pedido pagado se corrige anulando la venta (CUS11.2, RN-102). |
| 9 | Aún no existen bocetos de las Vistas 8.1 a 8.5. | Diseñarlas en Figma con los estados de la sección 7, empezando por la vista móvil del mozo. |
| 10 | Se fusionó el antiguo RF-27 (aviso de comanda lista) con listar pedidos; el aviso hereda la prioridad Must de RF-22. | Resuelto: RF-22 se redacta "listar pedidos con su estado, ver su detalle y mostrar el aviso de comanda lista". |
