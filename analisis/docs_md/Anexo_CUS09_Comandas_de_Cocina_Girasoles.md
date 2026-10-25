RESTAURANTE GIRASOLES
Anexo: CUS09 – Gestión de comandas de cocina
Casos de uso, interfaz, reglas, API, pruebas y trazabilidad · Metodología XP · Estructura única por CUS

# Correspondencia de numeración vigente

Este anexo continúa los CUS05 a CUS08 con la misma numeración definitiva y los mismos ajustes de códigos, para que sean únicos en todo el documento de construcción:

<!-- tabla 1 -->
| Elemento | Antes | Ahora | Motivo |
|---|---|---|---|
| CUS | CUS10.1, CUS10.2 y CUS10.3 | CUS09.1 (ver comandas) y CUS09.2 (actualizar estado); CUS10.1 deja de ser CUS | Se retiró el antiguo CUS03 (Perfil); generar la comanda es un paso del registro de pedido |
| HU / RF | HU24, HU25 y HU26 / RF-24, RF-25 y RF-26 | HU23 y HU24 / RF-23 y RF-24; la generación de la comanda se cubre en HU18 a HU20 / RF-18 a RF-20 | Numeración de 35 RF y 35 HU; RF-24 se fusionó con registrar pedido |
| Escenarios | E-198 a E-222 | E-220 a E-244 | E-188 a E-219 ya son de gestión de pedidos (CUS08) |
| Requerimientos no funcionales | RNF-31 a RNF-34 | RNF-32 a RNF-35 | Gestión de pedidos ya usa hasta RNF-31 |

Los códigos de reglas (RV, RN), mensajes (MSG) y demás escenarios se conservan.

# CUS09: Gestión de comandas de cocina


## 1. Ficha del CUS general


<!-- tabla 2 -->
| Campo | Detalle |
|---|---|
| CUS general | CUS09: Gestión de comandas de cocina |
| Interfaz (GUI) | Interfaz 9: Cocina (comandas) |
| Actor(es) | Cocinero |
| HU / RF de origen | HU23 y HU24 / RF-23 y RF-24 |
| Descripción | Una sola pantalla de comandas (Vista 9.1, con las acciones de la Vista 9.2) donde el cocinero ve qué preparar y en qué orden y marca el avance de cada comanda hasta dejarla lista. |
| Alcance | La generación de la comanda es un proceso automático sin pantalla ni CUS propio: forma parte del registro de pedido (CUS06.1, CUS06.2 y CUS07.1) y se describe en la sección 4. Solo el Cocinero ve y cambia las comandas. |


<!-- tabla 3 -->
| CUS | Título | HU | RF | Prioridad | Iteración | Complejidad |
|---|---|---|---|---|---|---|
| CUS09.1 | Ver comandas pendientes | HU23 | RF-23 | Alta (Must) | 1/3 | Baja |
| CUS09.2 | Actualizar estado de la comanda | HU24 | RF-24 | Alta (Must) | 1/3 | Baja |

Criterio: la prioridad se obtiene de la validación MoSCoW de la HU (Must = Alta, Should = Media, Could = Baja) y la iteración sigue la prioridad (Alta = 1/3, Media = 2/3, Baja = 3/3).

## 2. Decisiones adoptadas


<!-- tabla 4 -->
| Tema | Decisión | Vacío que cubre |
|---|---|---|
| Quién usa la pantalla | Solo el Cocinero ve y cambia las comandas. La generación de la comanda es automática y no tiene pantalla. | RF-23 y RF-24 |
| Qué es una comanda | El aviso a cocina de un pedido: tipo (mesa o para llevar), mesa o referencia, hora de llegada, quién lo registró y sus líneas (cantidad, producto y observación). Cada ampliación del pedido genera otra comanda. | RF-18 a RF-20 |
| Identificación | Se identifica con el número del pedido (por ejemplo, N.º 12); las ampliaciones se muestran como "N.º 12 · ADICIONAL 1". No existe una numeración aparte de comandas. | La generación de la comanda hablaba de "número correlativo" |
| Estados de la comanda | Pendiente, En preparación, Lista y Anulada. El estado del pedido se recalcula a partir de ellas (RN-64); cocina no cambia el estado del pedido directamente. | CUS09.2 cambiaba comanda y pedido |
| Cambio de estado | En orden: Pendiente → En preparación → Lista, con un botón grande por paso. No pide confirmación: aparece un aviso con DESHACER durante 10 segundos. | Faltaba una forma de corregir un toque equivocado |
| Qué bloquea iniciar la preparación | Al iniciar la preparación, el pedido ya no se puede modificar ni anular (CUS08.2). Al deshacer, vuelve a Pendiente y se reabre. | RF-21 |
| Pantalla de cocina | Dos zonas, "Pendientes" y "En preparación", con la más antigua primero. Las comandas listas salen de la pantalla. Textos y botones grandes, pensada para tablet horizontal o pantalla fija. | CUS09.1 |
| Datos de cada tarjeta | Número, mesa o "Para llevar" (y referencia), hora y tiempo de espera, quién registró, etiqueta ADICIONAL o MODIFICADA si corresponde, y cada línea con cantidad, producto y la observación destacada; los menús completos muestran sus opciones elegidas y lo que incluyen (RN-137). | CUS09.1 |
| Resumen "Por preparar" | Banda superior con el total por producto de carta y por menú completo de las comandas pendientes y en preparación (por ejemplo, 5 × Almuerzo completo); baja al marcar listas. No agrupa observaciones. | Ayuda a producir por lote; no está en el RF |
| Nuevas comandas | Se actualiza sola cada 5 segundos; la comanda nueva se resalta como "NUEVA" 10 segundos y puede sonar un aviso corto si el cocinero activó el sonido. El orden no salta mientras se toca la pantalla. | "Actualiza automáticamente" sin tiempo |
| Demoras | A partir de 15 minutos de espera, la tarjeta muestra el texto "Demora" además del color. | Faltaba el criterio |
| Sesión en cocina | Mientras la pantalla de comandas esté abierta, la sesión del Cocinero no vence por inactividad (excepción a RN-20 solo en esta pantalla). | La pantalla queda abierta sin tocarse |
| Platos agotados | Un botón PLATOS AGOTADOS abre la disponibilidad del menú (CUS04.2). | Observación 6 del CUS04 |
| Historial | Se guardan la hora de llegada, de inicio y de lista, y el usuario de cada cambio. | Auditoría y reportes futuros |


## 3. Análisis del usuario (Diseño Centrado en el Usuario)


<!-- tabla 5 -->
| Aspecto | Descripción |
|---|---|
| Quién usa la interfaz | El cocinero, con experiencia tecnológica básica, que hoy recibe los pedidos de palabra y no usa pantallas. |
| Necesidades | Saber qué preparar y en qué orden; ver con claridad las observaciones (por ejemplo, "presa de pescado"); marcar el avance sin perder tiempo; saber cuántos platos faltan; avisar cuando se agota un plato. |
| Dificultades previsibles | Manos mojadas o con grasa; lectura a distancia; ruido que tapa los avisos; tocar el botón equivocado; perder de vista una comanda antigua o una modificada; pantalla que se mueve mientras se toca; conexión inestable. |
| Contexto de uso | Cocina con calor, ruido y mucho movimiento, con una tablet o pantalla fija siempre encendida. En hora pico entran varias comandas seguidas. |


## 4. Plantillas de casos de uso


### CUS09.1: Ver comandas pendientes


<!-- tabla 6 -->
| Código: CUS09.1 | Título: Ver comandas pendientes (Vista 9.1) | Fecha: 21.10.2026 | Iteración: 1/3 |
|---|---|---|---|
| Actor(es): Cocinero |  |  |  |
| Prioridad: Alta (Must) | Complejidad: Baja |  |  |
| Historia de usuario: HU23 · Visualizar comandas pendientes (M) |  |  |  |
| Requerimiento de origen: RF-23 |  |  |  |
| Descripción: Permite al cocinero visualizar las comandas pendientes y en preparación en orden de llegada, con la mesa o "para llevar", los productos (menús completos con sus opciones) y las observaciones, para preparar los pedidos en el orden correcto. Las comandas llegan desde el registro de pedido (CUS06.1, CUS06.2 y CUS07.1), que las genera automáticamente. |  |  |  |
| Precondición: El cocinero tiene sesión iniciada. |  |  |  |
| Flujo principal:<br>1. El cocinero accede a la opción COMANDAS; el sistema muestra "Cargando comandas…".<br>2. El sistema consulta las comandas pendientes y en preparación.<br>3. Las muestra en las zonas "Pendientes" y "En preparación", la más antigua primero, con número, mesa o "Para llevar", tiempo de espera, productos (los menús completos con sus opciones elegidas y lo que incluyen, RN-137), cantidades, observaciones destacadas y estado.<br>4. El sistema muestra la banda "Por preparar" con el total por producto.<br>5. La pantalla se actualiza sola cada 5 segundos; las comandas nuevas se resaltan como "NUEVA" y, si el sonido está activado, suena un aviso corto. |  |  |  |
| Flujo alterno:<br>Si no hay comandas, se muestra MSG-124.<br>Si una comanda es adicional, se identifica con la etiqueta ADICIONAL n; si fue modificada, con MODIFICADA y MSG-129.<br>Si una comanda fue anulada, se retira de la pantalla con MSG-128.<br>Si una comanda supera los 15 minutos de espera, se muestra "Demora".<br>Si se pierde la conexión, se muestra MSG-132 y se conservan las comandas visibles.<br>El cocinero pulsa PLATOS AGOTADOS: se abre la disponibilidad del menú (CUS04.2).<br>Un Mozo, Cajero o Administrador entra por URL o servicio: MSG-39 (403). |  |  |  |
| Postcondición: El cocinero visualiza las comandas por preparar en orden de llegada. |  |  |  |
| Excepciones:<br>Falla al obtener las comandas: MSG-125 con Reintentar; se registra el incidente.<br>Pérdida de conexión: MSG-09 y MSG-132. |  |  |  |
| Reglas y mensajes aplicables: RV-85, RV-86, RV-90 a RV-94; RN-75, RN-80, RN-82, RN-83, RN-137; RNF-32 a RNF-34; MSG-124, 125, 128, 129, 132, 133, 39. |  |  |  |


### CUS09.2: Actualizar estado de la comanda


<!-- tabla 7 -->
| Código: CUS09.2 | Título: Actualizar estado de la comanda (Vista 9.2) | Fecha: 21.10.2026 | Iteración: 1/3 |
|---|---|---|---|
| Actor(es): Cocinero |  |  |  |
| Prioridad: Alta (Must) | Complejidad: Baja |  |  |
| Historia de usuario: HU24 · Actualizar el estado de la comanda (M) |  |  |  |
| Requerimiento de origen: RF-24 |  |  |  |
| Descripción: Permite al cocinero cambiar el estado de una comanda a "en preparación" y a "lista" para informar el avance del pedido y avisar cuándo puede llevarse al cliente. |  |  |  |
| Precondición: El cocinero tiene sesión iniciada y la comanda existe y no está anulada. |  |  |  |
| Flujo principal:<br>1. El cocinero ve una comanda "pendiente" y pulsa INICIAR PREPARACIÓN.<br>2. El sistema cambia la comanda a "en preparación", recalcula el estado del pedido (RN-64), bloquea su modificación y anulación, y muestra MSG-126 con DESHACER.<br>3. Al terminar de servir, el cocinero pulsa MARCAR COMO LISTA.<br>4. El sistema cambia la comanda a "lista", recalcula el estado del pedido (queda "Listo" si todas sus comandas están listas) y muestra MSG-127 con DESHACER.<br>5. El sistema genera el aviso al mozo o cajero (CUS08.1) y retira la comanda de la pantalla. |  |  |  |
| Flujo alterno:<br>DESHACER dentro de 10 segundos: la comanda vuelve al estado anterior y, si el aviso no fue visto, se retira.<br>Si pasaron más de 10 segundos o el pedido ya fue pagado o anulado: MSG-134.<br>Si la comanda fue anulada: MSG-128 y no se puede cambiar su estado.<br>Si se intenta marcar como lista una comanda que no está en preparación (por servicio o pantalla desactualizada): MSG-130.<br>Doble toque en un botón: se registra un solo cambio (RV-89). |  |  |  |
| Postcondición: La comanda y el pedido quedan con el nuevo estado y el mozo o cajero es avisado cuando la comanda está lista. |  |  |  |
| Excepciones:<br>Falla al cambiar el estado: MSG-131; se conserva el estado anterior y se registra el incidente.<br>Pérdida de conexión: MSG-09 y MSG-132; el cambio no se aplica y se puede reintentar. |  |  |  |
| Reglas y mensajes aplicables: RV-87 a RV-90, RV-93; RN-76 a RN-79, RN-81; RNF-32 a RNF-34; MSG-126 a MSG-128, 130, 131, 134, 09. |  |  |  |


### Generación de la comanda (paso de CUS06.1, CUS06.2 y CUS07.1, no es un caso de uso)


<!-- tabla 8 -->
| Aspecto | Descripción |
|---|---|
| Qué es | Proceso automático que genera la comanda y la envía a cocina al registrar un pedido de mesa (CUS06.1), al ampliarlo (CUS06.2) o al registrar un pedido para llevar (CUS07.1), reemplazando el aviso verbal al cocinero. Sin pantalla ni endpoint propio. |
| Cuándo ocurre | En la misma operación que guarda el pedido (RN-50): si no puede generarse, el pedido no se registra y la mesa no se ocupa. |
| Contenido | Número del pedido, tipo, mesa o referencia, hora de llegada, quién registró y las líneas (producto, cantidad y observación); los menús completos con sus opciones elegidas y lo que incluyen (RN-137). Estado inicial: "pendiente". |
| Casos especiales | Ampliación: otra comanda "ADICIONAL n" con solo los productos nuevos. Modificación antes de iniciar la preparación: etiqueta MODIFICADA (CUS08.2). Anulación antes de iniciar: la comanda pasa a "anulada" y se retira de cocina (CUS08.2). |
| Falla | No se guarda el pedido ni se ocupa la mesa; MSG-105 o MSG-111 al mozo o cajero y se registra el incidente. |
| Reglas y mensajes | RN-74, RN-75, RN-80; RNF-32, RNF-35; MSG-100, 101, 105, 110, 111; escenarios E-220 a E-223. |


## 5. Interfaz (GUI)


<!-- tabla 9 -->
| Interfaz | RF | HU | CUS | Qué se hace dentro de la interfaz |
|---|---|---|---|---|
| 9. Cocina (comandas) | RF-23 y RF-24 | HU23 y HU24 | CUS09 (09.1 y 09.2) | Ver las comandas pendientes y en preparación, iniciar la preparación, marcar como lista y deshacer. |


### Vista 9.1: Pantalla de comandas (CUS09.1) — restaurante.app/comandas


<!-- tabla 10 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 11 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Encabezado | Botón SONIDO (activado o desactivado) y botón PLATOS AGOTADOS, que abre la disponibilidad del menú (CUS04.2). |
| 2 | Banda "Por preparar" | Total por producto de carta y por menú completo de las comandas pendientes y en preparación. |
| 3 | Zonas "Pendientes" y "En preparación" | Dos columnas en tablet horizontal o una en móvil, con la más antigua primero; sin comandas muestra MSG-124. |
| 4 | Tarjeta de comanda | N.º del pedido (con ADICIONAL n), mesa o "Para llevar" (y referencia), hora y tiempo de espera ("Demora" desde 15 minutos), quién registró, etiquetas NUEVA, ADICIONAL o MODIFICADA y las líneas con cantidad, producto (los menús completos con sus opciones y lo que incluyen) y observación destacada. |
| 5 | Franja de conexión | MSG-132 cuando se pierde la conexión; se conservan las comandas visibles. |


### Vista 9.2: Acciones de estado de la comanda (CUS09.2) — restaurante.app/comandas


<!-- tabla 12 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 13 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Botón INICIAR PREPARACIÓN | En comandas pendientes; de 56 px o más y ancho completo de la tarjeta. |
| 2 | Botón MARCAR COMO LISTA | En comandas en preparación; la comanda sale de la pantalla. |
| 3 | Aviso inferior con DESHACER | Durante 10 segundos con MSG-126 o MSG-127. |
| 4 | Mensajes de error | MSG-130 (paso fuera de orden), MSG-131 (falla) y MSG-134 (no se puede deshacer). |


## 6. Estados de la interfaz


<!-- tabla 14 -->
| Estado | Comportamiento visual |
|---|---|
| Cargando | "Cargando comandas…" con marcadores de posición. |
| Sin comandas | MSG-124 con un ícono tranquilo y el resumen en cero. |
| Con comandas | Banda "Por preparar", zonas "Pendientes" y "En preparación" en dos columnas (tablet horizontal) o una columna (móvil), con la más antigua primero. |
| Comanda pendiente | Tarjeta con el botón grande INICIAR PREPARACIÓN. |
| Comanda en preparación | Tarjeta en tono distinto con el texto "En preparación" y el botón grande MARCAR COMO LISTA. |
| Comanda nueva | Etiqueta "NUEVA" 10 segundos, resaltado y sonido corto si está activado. |
| Comanda adicional o modificada | Etiqueta ADICIONAL n o MODIFICADA bien visible junto al número. |
| Comanda con demora | Texto "Demora" y tono de alerta desde los 15 minutos de espera. |
| Cambiando estado | Botón deshabilitado con "Actualizando…" (RV-89). |
| Aviso con DESHACER | Aviso inferior de 10 segundos con MSG-126 o MSG-127 y el botón DESHACER. |
| Comanda anulada | La tarjeta se retira con el aviso MSG-128. |
| Sin conexión | Franja MSG-132; se conservan las comandas visibles y se reintenta solo. |
| Error de carga | MSG-125 con Reintentar. |
| Encabezado | Botón SONIDO (activado o desactivado) y botón PLATOS AGOTADOS. |


## 7. Reglas de validación (RV)


<!-- tabla 15 -->
| Código | Regla | Elemento UI | Mensaje |
|---|---|---|---|
| RV-85 | Las comandas se muestran ordenadas por hora de llegada, la más antigua primero, separadas en "Pendientes" y "En preparación". | Zonas de la pantalla | MSG-124 |
| RV-86 | Cada comanda muestra número, mesa o "Para llevar" (y referencia), hora y tiempo de espera, quién registró, etiqueta ADICIONAL o MODIFICADA, y cada línea con cantidad, producto y observación destacada; los menús completos con sus opciones elegidas y lo que incluyen (RN-137). | Tarjeta de comanda | — |
| RV-87 | El estado cambia solo en orden: Pendiente → En preparación → Lista; no se salta un paso ni se retrocede, salvo con DESHACER. | Botones de estado | MSG-130 |
| RV-88 | Cambiar el estado no pide confirmación; aparece un aviso con DESHACER durante 10 segundos. | Aviso con DESHACER | MSG-126, 127 |
| RV-89 | Mientras se cambia el estado, el botón queda deshabilitado y la acción es idempotente, para que un doble toque no repita el cambio. | Botones de estado | — |
| RV-90 | No se cambia el estado de una comanda anulada; si el servidor la rechaza, se retira de la pantalla con aviso. | Tarjeta de comanda | MSG-128 |
| RV-91 | El tiempo de espera se muestra en minutos; desde los 15 minutos se resalta con el texto "Demora" además del color. | Tarjeta de comanda | — |
| RV-92 | Una comanda nueva se resalta como "NUEVA" durante 10 segundos y, si el sonido está activado, suena un aviso corto. | Tarjeta y botón SONIDO | MSG-133 |
| RV-93 | Los botones de estado miden al menos 56 px de alto y los textos de las comandas son grandes (al menos 18 px). | Botones y textos | — |
| RV-94 | La actualización automática cada 5 segundos no cambia de lugar la tarjeta que el cocinero está tocando ni reinicia el desplazamiento. | Zonas de la pantalla | — |


## 8. Reglas de negocio y requerimientos no funcionales


<!-- tabla 16 -->
| Código | Regla |
|---|---|
| RN-74 | La comanda se genera automáticamente al registrar un pedido (CUS06.1 y CUS07) y al ampliarlo (CUS06.2), en la misma operación (RN-50); si no puede generarse, el pedido no se registra. |
| RN-75 | La comanda contiene número del pedido, tipo, mesa o referencia, hora de llegada, quién registró y las líneas (producto, cantidad, observación). Las ampliaciones se identifican como "ADICIONAL 1", "ADICIONAL 2", y contienen solo los productos nuevos. Un menú completo muestra su nombre, las opciones elegidas y lo que incluye, y la observación va aparte (RN-137). |
| RN-76 | Los estados de la comanda son Pendiente, En preparación, Lista y Anulada. El estado del pedido se recalcula a partir de ellas (RN-64); cocina no lo cambia directamente. |
| RN-77 | Solo el Cocinero cambia el estado de las comandas, en orden Pendiente → En preparación → Lista. |
| RN-78 | Iniciar la preparación bloquea la modificación y anulación del pedido (RN-65); al deshacer dentro de 10 segundos, la comanda vuelve a Pendiente y se reabre. |
| RN-79 | Marcar una comanda como Lista genera el aviso al responsable (RN-71); si se deshace antes de que lo vea, el aviso se retira. No se puede deshacer si el pedido ya fue pagado o anulado. |
| RN-80 | Una comanda modificada (CUS08.2) se muestra con la etiqueta MODIFICADA; una anulada deja de mostrarse (RN-68). |
| RN-81 | Las comandas listas salen de la pantalla. Se guardan las horas de llegada, de inicio y de lista, y el usuario de cada cambio. |
| RN-82 | Mientras la pantalla de comandas esté abierta, la sesión del Cocinero se mantiene vigente: es la única excepción a la expiración por inactividad de RN-20 (Anexo A del CUS02). |
| RN-83 | El Cocinero puede abrir la disponibilidad de platos (CUS04.2) desde la pantalla de comandas. |
| RNF-32 | Una comanda nueva aparece en la pantalla de cocina en 5 segundos o menos; cambiar el estado responde en menos de 1 segundo. |
| RNF-33 | La pantalla está pensada para tablet o pantalla fija en horizontal, con textos grandes y botones de 56 px; también es usable en móvil y con teclado (RNF-04). |
| RNF-34 | El servidor valida token y rol Cocinero en cada endpoint; los cambios de estado son atómicos e idempotentes (RNF-02). |
| RNF-35 | Generar la comanda forma parte de la misma transacción que registrar el pedido: si falla, no se guarda nada. |


## 9. Catálogo de mensajes

Se reutilizan MSG-105 y MSG-111 (no se pudo registrar el pedido, que cubren el fallo al generar la comanda), MSG-100, MSG-101 y MSG-110 (pedido enviado a cocina), MSG-09 (conexión) y MSG-39 (sin permiso).

<!-- tabla 17 -->
| Código | Mensaje (texto al usuario) | Tipo | Ubicación |
|---|---|---|---|
| MSG-124 | No hay comandas pendientes. Todo al día. | Informativo | En la pantalla |
| MSG-125 | No se pudieron cargar las comandas. Intente nuevamente. (botón Reintentar) | Error | En la pantalla |
| MSG-126 | Comanda N.º [n] en preparación. (botón DESHACER) | Aviso (10 s) | Aviso inferior |
| MSG-127 | Comanda N.º [n] marcada como lista. Se avisó a [mozo o cajero]. (botón DESHACER) | Aviso (10 s) | Aviso inferior |
| MSG-128 | La comanda N.º [n] fue anulada y se retiró de la pantalla. | Informativo | Aviso |
| MSG-129 | El pedido N.º [n] fue modificado. Revise los cambios. | Aviso | Aviso y etiqueta MODIFICADA |
| MSG-130 | Primero debe iniciar la preparación de la comanda. | Error | Aviso |
| MSG-131 | No se pudo actualizar la comanda. El estado anterior se conserva; intente nuevamente. | Error | Aviso |
| MSG-132 | Sin conexión: las comandas pueden estar desactualizadas (datos de hace [x] s). | Aviso | Franja superior |
| MSG-133 | Nueva comanda N.º [n] ([mesa o Para llevar]). | Aviso | Etiqueta NUEVA y aviso |
| MSG-134 | No se puede deshacer: el pedido ya fue pagado, anulado o pasó el tiempo permitido. | Error | Aviso |


## 10. Diccionario de datos


<!-- tabla 18 -->
| Campo | Tipo | Obligatorio | Longitud / formato | Notas |
|---|---|---|---|---|
| Comanda | Registro | Automático | Una por registro o ampliación | Vinculada a un pedido |
| Número | Texto | Automático | N.º del pedido (+ "ADICIONAL n") | Sin numeración propia |
| Tipo, mesa y referencia | Texto | Automático | Mesa o Para llevar | Copiados del pedido |
| Líneas | Lista | Automático | Producto, cantidad, observación; menú completo con opciones y qué incluye | Solo las líneas nuevas en las adicionales |
| Estado | Lista | Automático | Pendiente, En preparación, Lista, Anulada | Lo cambia el Cocinero en orden |
| Etiqueta | Lista | Automático | Ninguna, ADICIONAL n, MODIFICADA | — |
| Hora de llegada, inicio y lista | Fecha y hora | Automático | — | Para auditoría y reportes futuros |
| Tiempo de espera | Minutos | Calculado | Desde la hora de llegada | Demora desde 15 minutos |
| Resumen por producto | Lista | Calculado | Producto y cantidad | Solo pendientes y en preparación |
| Sonido | Preferencia | No | Activado / Desactivado | Se guarda en el dispositivo |


## 11. Contrato de API

Todos los endpoints exigen token JWT (401 sin token válido) y validan el rol Cocinero en el servidor (403 si no corresponde). La generación de la comanda no tiene endpoint propio: la ejecutan los servicios de pedidos dentro de la misma transacción.

<!-- tabla 19 -->
| Endpoint | Entrada | Respuestas |
|---|---|---|
| GET /api/comandas | estado=pendiente,enPreparacion | 200: { items[{ id, pedidoNumero, tipo, mesa, referencia, horaLlegada, estado, etiqueta, registradoPor, lineas[{ producto, cantidad, observacion }] (las líneas de menú completo incluyen nombre, elecciones e incluye) }], resumen[{ producto, cantidad }] }, ordenado por horaLlegada. Rol: Cocinero. |
| PATCH /api/comandas/{id}/estado | { estado: enPreparacion \| lista } | 200: { estado, deshacerHasta }. 404: no existe. 409: comanda anulada o paso fuera de orden. 403: rol no permitido. Idempotente. Rol: Cocinero. |
| POST /api/comandas/{id}/deshacer | — | 200: { estado } anterior. 409: pasaron más de 10 segundos, el pedido está pagado o anulado, o el estado ya cambió. 404: no existe. Rol: Cocinero. |


## 12. Escenarios de validación y criterios de aceptación


<!-- tabla 20 -->
| ID | Entrada / acción | Resultado esperado | Reglas | HU |
|---|---|---|---|---|
| E-220 | El mozo registra un pedido de mesa | En 5 segundos o menos aparece en "Pendientes" la comanda con número, mesa, líneas y observaciones, con la etiqueta NUEVA. | RN-74, RNF-32 | HU18 |
| E-221 | El cajero registra un pedido para llevar | La comanda muestra "Para llevar" y la referencia. | RN-75 | HU20 |
| E-222 | El mozo agrega productos a un pedido | Aparece otra comanda "ADICIONAL 1" con solo los productos nuevos y el mismo número de pedido. | RN-75 | HU19 |
| E-223 | Falla la generación de la comanda | No se registra el pedido ni se ocupa la mesa; MSG-105 o MSG-111. | RN-74, RNF-35 | HU18, HU19 y HU20 |
| E-224 | El cocinero entra a COMANDAS | Pendientes y en preparación, la más antigua primero. | RV-85 | HU23 |
| E-225 | No hay comandas | MSG-124. | — | HU23 |
| E-226 | Revisar la banda "Por preparar" | Suma por producto las comandas pendientes y en preparación y baja al marcar listas. | RV-86 | HU23 |
| E-227 | Una comanda lleva 15 minutos o más esperando | Muestra el texto "Demora" y tono de alerta. | RV-91 | HU23 |
| E-228 | Llega una comanda con el sonido activado y desactivado | Se resalta como NUEVA; suena solo si el sonido está activado. | RV-92 | HU23 |
| E-229 | La pantalla se actualiza mientras el cocinero toca una tarjeta | La tarjeta no cambia de lugar ni se reinicia el desplazamiento. | RV-94 | HU23 |
| E-230 | Pulsar INICIAR PREPARACIÓN | La comanda pasa a "En preparación"; el pedido, a "En preparación"; MSG-126; el pedido ya no se puede modificar. | RN-76, RN-78 | HU24 |
| E-231 | Pulsar MARCAR COMO LISTA | La comanda sale de la pantalla; el pedido queda "Listo" si todas están listas; el responsable recibe el aviso; MSG-127. | RN-76, RN-79 | HU24 |
| E-232 | Pulsar DESHACER dentro de 10 segundos | La comanda vuelve al estado anterior y el aviso se retira si no fue visto. | RV-88, RN-79 | HU24 |
| E-233 | Pulsar DESHACER después de 10 segundos o con el pedido pagado | No se deshace; MSG-134. | RN-79 | HU24 |
| E-234 | Intentar marcar lista una comanda pendiente (por servicio) | 409 y MSG-130; no hay botón para hacerlo en pantalla. | RV-87 | HU24 |
| E-235 | Se anula el pedido con su comanda en pantalla | La tarjeta se retira con MSG-128. | RV-90, RN-80 | HU23 |
| E-236 | Se modifica el pedido con su comanda pendiente | La tarjeta muestra MODIFICADA con los cambios y MSG-129. | RN-80 | HU23 |
| E-237 | Doble toque en INICIAR PREPARACIÓN | Se registra un solo cambio. | RV-89, RNF-34 | HU24 |
| E-238 | Falla al cambiar el estado | MSG-131; se conserva el estado anterior. | RNF-34 | HU24 |
| E-239 | Se pierde la conexión | Franja MSG-132 con las comandas visibles; al volver se actualiza sola. | RNF-32 | HU23 |
| E-240 | La pantalla queda abierta dos horas sin tocarse | La sesión no vence y las comandas siguen llegando. | RN-82 | HU23 |
| E-241 | Un mozo, cajero o administrador entra a COMANDAS por URL o servicio | 403 y MSG-39; la opción no aparece en su menú. | RN-77, RNF-34 | HU23 |
| E-242 | Pulsar PLATOS AGOTADOS | Se abre la disponibilidad de platos (CUS04.2). | RN-83 | HU23 |
| E-243 | Un pedido con la comanda original lista y la adicional pendiente | El pedido figura "Pendiente"; el aviso llega cuando la adicional esté lista. | RN-64, RN-79 | HU24 |
| E-244 | Solo teclado o tablet | Tab recorre las tarjetas y botones; Enter activa; botones de al menos 56 px. | RNF-33, RV-93 | HU23, HU24 |
| E-398 | Cocina recibe el pedido | La comanda muestra "Desayuno completo: Quaker + Seco de pollo (incluye pan)" y la nota. | RN-137 | HU23 |


## 13. Matriz de justificación de usabilidad


<!-- tabla 21 -->
| Principio aplicado | Elemento de la interfaz | Decisión adoptada | Justificación |
|---|---|---|---|
| ISO 9241 – Eficacia | Tarjeta de comanda | Observaciones destacadas, etiquetas ADICIONAL y MODIFICADA, y orden por llegada | El cocinero prepara exactamente lo que pidió el cliente |
| ISO 9241 – Eficiencia | Botones grandes y resumen "Por preparar" | Un toque por paso, sin confirmación, y totales por producto | Menos tiempo en la pantalla y más en la cocina |
| ISO 9241 – Satisfacción | Aviso con DESHACER y pantalla estable | Error corregible y contenido que no salta | Interacción tranquila en hora pico |
| Nielsen 1 – Visibilidad del estado | Tiempo de espera, zonas y NUEVA | Minutos de espera, "Demora", zonas por estado y comandas nuevas resaltadas | Siempre sabe qué falta y qué urge |
| Nielsen 2 – Mundo real | Textos | "Comanda", "Pendientes", "Lista", "Para llevar" | Mismo lenguaje de la cocina |
| Nielsen 3 – Control y libertad | DESHACER 10 segundos | Revertir un cambio de estado sin confirmaciones previas | Corrige un toque equivocado sin frenar el trabajo |
| Nielsen 4 – Consistencia | Botones y avisos | Mismos botones, colores de estado y avisos que el resto del sistema | Evita reaprendizaje |
| Nielsen 5 – Prevención de errores | Orden de estados y botones únicos | Un solo botón por estado; no se salta un paso; botón deshabilitado al tocar | Evita cambios erróneos y dobles toques |
| Nielsen 6 – Reconocimiento | Tarjeta completa | Toda la información de la comanda visible sin abrir nada | No obliga a recordar |
| Nielsen 7 – Flexibilidad y eficiencia | Sonido opcional y PLATOS AGOTADOS | El cocinero activa el sonido y llega al menú en un toque | Se adapta a cada cocina |
| Nielsen 8 – Minimalismo | Pantalla | Solo comandas pendientes y en preparación; las listas salen | Sin distracciones |
| Nielsen 9 – Recuperarse de errores | Mensajes MSG-130, 131 y 134 | Explican qué pasó y conservan el estado | Facilita corregir |
| Shneiderman 1 – Consistencia | Estilo y acciones | Misma paleta y mensajes del sistema | Comportamiento predecible |
| Shneiderman 2 – Usabilidad universal | Botones, texto y contraste | Botones de 56 px, textos grandes, contraste 4.5:1, "Demora" con texto | Atiende manos mojadas, distancia y daltonismo |
| Shneiderman 3 – Retroalimentación | Avisos inferiores | MSG-126 y 127 con cada cambio | Sabe qué pasó |
| Shneiderman 4 – Cierre | Comanda lista | La comanda sale y el aviso confirma que se avisó al mozo o cajero | Indica que la tarea concluyó |
| Shneiderman 5 – Prevenir errores | Estados en orden y botones bloqueados | No se salta pasos ni se repite un cambio | Evita estados inconsistentes |
| Shneiderman 6 – Reversión | DESHACER | Revertir iniciar o marcar lista dentro de 10 segundos | Acciones reversibles |
| Shneiderman 7 – Control del usuario | Orden estable y sonido opcional | La pantalla no cambia lo que el cocinero toca; él decide el sonido | Mantiene el control |
| Shneiderman 8 – Memoria a corto plazo | Banda "Por preparar" y tarjetas | El sistema muestra totales y cada comanda completa | No debe recordar qué falta |


## 14. Matriz de trazabilidad


### 14.1 Requerimiento → historia → caso de uso → vista → prueba


<!-- tabla 22 -->
| RF | HU | CUS | Vista | Reglas / mensajes | API | Escenarios |
|---|---|---|---|---|---|---|
| RF-18 a RF-20 Generar y enviar la comanda (paso del registro de pedido) | HU18 a HU20 | CUS06.1, 06.2 y 07.1 | Se ve en 9.1 | RN-74, 75, 80; RNF-32, 35; MSG-100, 101, 105, 110, 111 | Interno (transacción del pedido) | E-220 a E-223 |
| RF-23 Visualizar comandas pendientes | HU23 (M) | CUS09.1 | 9.1 | RV-85, 86, 90 a 94; RN-75, 80, 82, 83, 137; MSG-124, 125, 128, 129, 132, 133 | GET /api/comandas | E-224 a E-229, E-235, E-236, E-239 a E-242, E-398 |
| RF-24 Actualizar el estado de la comanda | HU24 (M) | CUS09.2 | 9.2 | RV-87 a 90, 93; RN-76 a 79, 81; MSG-126 a 128, 130, 131, 134 | PATCH .../estado y POST .../deshacer | E-230 a E-234, E-237, E-238, E-243, E-244 |


### 14.2 Regla → elemento de interfaz → escenario


<!-- tabla 23 -->
| Regla | Elemento de interfaz | Escenario |
|---|---|---|
| RV-85 / RV-86 | Zonas "Pendientes" y "En preparación" y tarjeta completa | E-224, E-226 |
| RV-87 / RN-77 | Botones INICIAR PREPARACIÓN y MARCAR COMO LISTA en orden | E-230, E-231, E-234 |
| RV-88 / RN-79 | Aviso inferior con DESHACER de 10 segundos | E-232, E-233 |
| RV-89 | Botón deshabilitado y acción idempotente | E-237 |
| RV-90 / RN-80 | Comanda anulada retirada y comanda MODIFICADA | E-235, E-236 |
| RV-91 | Texto "Demora" desde los 15 minutos | E-227 |
| RV-92 | Etiqueta NUEVA y botón SONIDO | E-220, E-228 |
| RV-93 / RNF-33 | Botones de 56 px y textos grandes | E-244 |
| RV-94 | Actualización sin mover la tarjeta tocada | E-229 |
| RN-74 / RN-75 / RNF-35 | Generación atómica de la comanda con el pedido y comanda adicional | E-220 a E-223 |
| RN-76 / RN-78 | Estado del pedido derivado y bloqueo de modificación | E-230, E-231, E-243 |
| RN-82 | Sesión vigente mientras la pantalla está abierta | E-240 |
| RN-83 | Botón PLATOS AGOTADOS | E-242 |


## 15. Evaluación del prototipo y mejoras incorporadas

Aún no hay prototipo de la pantalla de cocina; las decisiones siguientes aplican lo aprendido en los CUS anteriores.

<!-- tabla 24 -->
| Riesgo previsto | Principio | Decisión de diseño incorporada |
|---|---|---|
| Manos mojadas o con grasa | Shneiderman 2 | Botones de al menos 56 px, de ancho completo en la tarjeta |
| Lectura a distancia | Shneiderman 2; Nielsen 6 | Textos grandes y observaciones en negrita, con contraste alto |
| Ruido que tapa los avisos | Nielsen 1 | Etiqueta NUEVA, resaltado y sonido opcional |
| Tocar el botón equivocado | Nielsen 3 y 5; Shneiderman 6 | Un solo botón por estado y DESHACER durante 10 segundos |
| Pantalla que se mueve al actualizar | Shneiderman 7 | Orden estable y sin reiniciar el desplazamiento |
| Perder de vista una comanda antigua o modificada | Nielsen 1 | Tiempo de espera, "Demora", ADICIONAL y MODIFICADA bien visibles |
| Estilo distinto al resto del sistema | Shneiderman 1; Nielsen 4 | Reutilizar paleta, botones y avisos de los CUS anteriores |


## 16. Dependencias con otros casos de uso


<!-- tabla 25 -->
| CUS relacionado | Relación con el CUS09 |
|---|---|
| CUS06 y CUS07 Pedidos | Disparan la generación de la comanda (RN-74); CUS06.2 genera comandas ADICIONAL. |
| CUS08 Gestión de pedidos | CUS08.2 modifica o anula comandas pendientes; CUS08.1 avisa al mozo o cajero cuando una comanda se marca lista; el estado del pedido se deriva de las comandas (RN-64). |
| CUS04 Menú del día | El cocinero abre la disponibilidad de platos desde la pantalla de comandas (CUS04.2). |
| Anexo A (lineamientos de sesión) | La sesión del Cocinero se mantiene vigente en esta pantalla (RN-82, excepción a RN-20). |
| CUS13 Reportes | Los datos de platos y los tiempos de llegada, inicio y lista alimentan reportes futuros. |


<!-- tabla 26 -->
| N.º | Punto | Decisión adoptada o tarea |
|---|---|---|
| 1 | La pantalla de cocina queda abierta sin tocarse y la sesión vence a los 30 minutos (RN-20). | Aceptar la excepción RN-82 y recomendar un equipo dedicado en cocina con usuario Cocinero; revisar la seguridad. |
| 2 | El Administrador no puede ver la cocina (RF-23 es solo del Cocinero); para la dueña sería útil supervisar demoras. | Decisión: el Administrador supervisa el estado y la demora de los pedidos en la lista de pedidos (CUS08.1) y en las alertas del dashboard (CUS14.1); no ve la pantalla de cocina. |
| 3 | Iniciar la preparación y luego marcar lista son dos pasos; con un solo cocinero pueden resultar lentos, pero iniciar protege el pedido de cambios (RN-78). | Decisión: se mantienen los dos pasos (iniciar y marcar lista). |
| 4 | DESHACER, el resumen "Por preparar", el sonido y el botón PLATOS AGOTADOS amplían RF-23 y RF-24. | Decisión: se aceptan las ampliaciones (DESHACER, resumen "Por preparar", sonido y PLATOS AGOTADOS). |
| 5 | El sonido depende del navegador y exige un primer toque del cocinero para activarse. | Documentarlo en el manual de cocina. |
| 6 | El resumen "Por preparar" no agrupa observaciones, porque son texto libre. | Aceptarlo; las observaciones rápidas (mejora del CUS06) permitirían agruparlas. |
| 7 | Hoy el cocinero no usa pantallas; el calor, las manos mojadas y la conexión pueden dificultar la adopción. | Decisión: la pantalla de cocina requiere una tablet o pantalla fija en cocina; antes de la entrega se prueba con el cocinero. |
| 8 | Aún no existen bocetos de las Vistas 9.1 y 9.2. | Diseñarlas en Figma en horizontal para tablet, con los estados de la sección 7. |
| 9 | El resumen "Por preparar" cuenta los menús completos por nombre; cuántas veces se eligió cada opción (por ejemplo, cuántos Lomo saltado) no está definido. | Decisión: el resumen cuenta los menús completos por nombre; el resumen por opción elegida queda como mejora futura. |
