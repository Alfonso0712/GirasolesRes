RESTAURANTE GIRASOLES
Anexo: CUS07 – Registro de pedido para llevar
Casos de uso, interfaz, reglas, API, pruebas y trazabilidad · Metodología XP · Estructura única por CUS

# Correspondencia de numeración vigente

Este anexo continúa los CUS05 y CUS06 con la misma numeración definitiva y los mismos ajustes de códigos, para que sean únicos en todo el documento de construcción:

<!-- tabla 1 -->
| Elemento | Antes | Ahora | Motivo |
|---|---|---|---|
| CUS | CUS08 (sin subcaso) | CUS07 con el caso CUS07.1 | Se retiró el antiguo CUS03 (Perfil) y todos los CUS usan subcasos |
| HU / RF | HU21 / RF-21 | HU20 / RF-20 | Numeración de 35 RF y 35 HU |
| Escenarios | E-144 a E-165 | E-166 a E-187 | E-95 a E-116 son del Menú del día (CUS04) y E-117 a E-165 de mesas y pedido de mesa |
| Requerimientos no funcionales | RNF-24 a RNF-26 | RNF-25 a RNF-27 | RNF-17 es del Menú del día y el pedido de mesa ya usa RNF-18 a RNF-24 |
| Mensaje de plato agotado | MSG-79 | MSG-225 | MSG-79 es «No hay menú definido para hoy» (CUS04) |
| Generar comanda, aviso de comanda lista y liberar mesa | CUS10.1, RF-24, RF-27 y CUS11.4 | Pasos del registro de pedido, del listado de pedidos (CUS08.1) y del cobro (CUS10.1) | No son RF ni CUS propios |

Los códigos de reglas (RV, RN), mensajes (MSG) y demás escenarios se conservan.

# CUS07: Registro de pedido para llevar


## 1. Ficha del CUS general


<!-- tabla 2 -->
| Campo | Detalle |
|---|---|
| CUS general | CUS07: Registro de pedido para llevar |
| Interfaz (GUI) | Interfaz 7: Pedido para llevar |
| Actor(es) | Cajero |
| HU / RF de origen | HU20 / RF-20 |
| Descripción | Una sola pantalla de toma de pedido (Vista 7.1) con su confirmación (Vista 7.2). Reutiliza la mecánica del pedido de mesa (CUS06) sin la mesa: el cajero arma menús completos y productos de carta, registra el pedido y el sistema genera la comanda para cocina. |
| Alcance | No usa ni ocupa mesas y no se amplía con más productos (RN-61). La generación de la comanda es un paso de este CUS (no hay CUS propio). |


<!-- tabla 3 -->
| CUS | Título | HU | RF | Prioridad | Iteración | Complejidad |
|---|---|---|---|---|---|---|
| CUS07.1 | Registrar pedido para llevar | HU20 | RF-20 | Alta (Must) | 1/3 | Media |

Criterio: la prioridad se obtiene de la validación MoSCoW de la HU (Must = Alta, Should = Media, Could = Baja) y la iteración sigue la prioridad (Alta = 1/3, Media = 2/3, Baja = 3/3).

## 2. Decisiones adoptadas


<!-- tabla 4 -->
| Tema | Decisión | Vacío que cubre |
|---|---|---|
| Quién registra | Solo el Cajero. Los demás roles no ven la opción y el servidor responde 403. | RF-20 |
| Contenido del pedido | Una o más líneas, cada una de un producto de carta o de un menú completo con una opción por parte, con cantidad de 1 a 20 y observación opcional de hasta 100 caracteres, con las mismas reglas que el pedido de mesa (CUS06). No lleva mesa. | RF-20 |
| Referencia del cliente | Campo opcional de hasta 30 caracteres (por ejemplo, "Sra. Rosa") para llamar al cliente cuando el pedido esté listo. Sin referencia, el pedido se identifica por su número. | RF-20 no identifica al cliente |
| Tipo y estado | Se registra como "Para llevar" y en estado "pendiente"; nunca ocupa ni libera una mesa. | CUS07 |
| Productos disponibles | Los productos de carta del menú del día, las opciones del día y los menús completos habilitados que no estén agotados; sin menú definido, todo lo activo (RN-35 y RN-142). Lo agotado se muestra «Agotado» y no se puede elegir. | CUS04 |
| Registro atómico y sin duplicados | Guardar el pedido y generar la comanda (con las opciones elegidas) ocurren juntos; si algo falla, no se crea el pedido. Cada envío lleva un identificador único para que un doble toque o un reintento no duplique el pedido. | Excepciones del CUS07 |
| Numeración | Mismo correlativo diario que los pedidos de mesa (por ejemplo, N.º 13), que se muestra en la comanda y en la lista. | Faltaba la regla |
| Cobro | Después de registrar, la confirmación ofrece COBRAR AHORA (CUS10.1), NUEVO PEDIDO y VER PEDIDOS; el cobro también puede hacerse más tarde desde la lista de pedidos. Ninguna acción es obligatoria. | RF-25 cubre mesa y para llevar |
| Ampliar un pedido | Un pedido para llevar no se amplía con más productos; si el cliente pide más, se registra otro pedido. | No existe un RF equivalente a RF-19 |
| Auditoría | Se registra quién y cuándo registró cada pedido para llevar. | Control de la dueña |
| Armado de menús completos | Igual que en el pedido de mesa: una opción por parte, línea con el precio del menú y REPETIR (RV-163 a RV-165, RN-133). | Ajuste de menús completos |


## 3. Análisis del usuario (Diseño Centrado en el Usuario)


<!-- tabla 5 -->
| Aspecto | Descripción |
|---|---|
| Quién usa la interfaz | El cajero, con experiencia tecnológica básica, atendiendo a un cliente que espera frente a él, normalmente desde una computadora o tablet. |
| Necesidades | Registrar rápido lo que el cliente lleva; ver el total para decírselo; que cocina reciba el pedido sin avisarle de palabra; cobrar enseguida o después; identificar el pedido cuando esté listo. |
| Dificultades previsibles | Presión de tener al cliente esperando; ofrecer un plato que se agotó; duplicar el pedido por un doble clic; confundir pedidos para llevar con pedidos de mesa; no recordar a quién pertenece cada pedido. |
| Contexto de uso | Hora pico con cola en la caja, ruido y conexión inestable. Hoy el pedido se comunica de palabra y no queda registro. |


## 4. Plantillas de casos de uso


### CUS07.1: Registrar pedido para llevar


<!-- tabla 6 -->
| Código: CUS07.1 | Título: Registrar pedido para llevar (Vistas 7.1 y 7.2) | Fecha: 21.10.2026 | Iteración: 1/3 |
|---|---|---|---|
| Actor(es): Cajero |  |  |  |
| Prioridad: Alta (Must) | Complejidad: Media |  |  |
| Historia de usuario: HU20 · Registrar pedido para llevar (M) |  |  |  |
| Requerimiento de origen: RF-20 (ampliado con menús completos y generación de la comanda) |  |  |  |
| Descripción: Permite al cajero registrar el pedido de un cliente que lleva su comida, con menús completos y productos de carta, cantidades y observaciones, y enviarlo a cocina. |  |  |  |
| Precondición: El cajero tiene sesión iniciada y existen opciones disponibles (del menú del día o, sin menú definido, todas las activas). |  |  |  |
| Flujo principal:<br>1. El cajero accede a la opción PEDIDO PARA LLEVAR; el sistema muestra "Cargando menú…".<br>2. El sistema muestra las tarjetas de los menús completos disponibles, los productos de carta agrupados por categoría y el resumen vacío del pedido.<br>3. Opcionalmente escribe la referencia del cliente (por ejemplo, "Sra. Rosa").<br>4. Para un menú completo, lo toca, elige una opción por parte y pulsa AGREGAR (MSG-222). En productos de carta toca + y ajusta la cantidad de cada uno.<br>5. Opcionalmente pulsa "Nota" y escribe una observación (por ejemplo, "presa de milanesa" o "sin ensalada").<br>6. El sistema calcula y muestra el total en el resumen.<br>7. El cajero revisa el detalle y pulsa REGISTRAR PEDIDO; el sistema valida (RV-61 a RV-65, RV-73, RV-163 a RV-165) y deshabilita el botón.<br>8. El servidor revalida la disponibilidad (incluidas las opciones elegidas) y, en una sola operación, guarda el pedido como "pendiente" y tipo "Para llevar", con su número, y genera la comanda para cocina con las opciones.<br>9. El sistema muestra la confirmación MSG-110 con el número del pedido, el total y los botones COBRAR AHORA (CUS10.1), NUEVO PEDIDO y VER PEDIDOS. |  |  |  |
| Flujo alterno:<br>No se agregó ningún producto: MSG-97 y el botón queda deshabilitado.<br>No se completó una parte de un menú completo: MSG-221; no se agrega la línea.<br>Un menú completo «No disponible hoy»: MSG-220; no se puede tocar.<br>Cantidad fuera de 1 a 20 o no entera: MSG-98 junto a la línea.<br>Observación de más de 100 caracteres: MSG-99. Referencia de más de 30 caracteres: MSG-109.<br>Un plato u opción figura «Agotado»: no se puede seleccionar. Si se agota mientras se arma el pedido, el servidor lo rechaza al registrar, se marcan las líneas con MSG-225 o MSG-223 y MSG-103, y el cajero las quita o cambia.<br>No hay productos disponibles: MSG-107.<br>Doble clic en REGISTRAR PEDIDO o reintento tras perder la conexión: se crea un solo pedido (RV-67, RNF-22).<br>Cancelar con productos en el pedido (botón o Esc): MSG-102; si confirma, se descarta sin guardar.<br>El cajero pulsa COBRAR AHORA: se abre el cobro del pedido (CUS10.1). Si pulsa NUEVO PEDIDO, la pantalla queda limpia para el siguiente cliente.<br>Usuario sin rol Cajero intenta registrar por URL o servicio: MSG-39 (403). |  |  |  |
| Postcondición: El pedido para llevar queda registrado en estado "pendiente", con su número, sus menús completos y opciones, y cocina recibe la comanda marcada como "para llevar". |  |  |  |
| Excepciones:<br>Falla al guardar o al enviar la comanda: MSG-111; no se crea el pedido, el pedido en armado se conserva en pantalla y se registra el incidente.<br>Pérdida de conexión: MSG-09 y MSG-111; al reintentar no se duplica el pedido. |  |  |  |
| Reglas y mensajes aplicables: RV-61 a RV-68, RV-70 a RV-74, RV-159, RV-163 a RV-166; RN-35, RN-36, RN-50, RN-51, RN-54, RN-57 a RN-62, RN-133, RN-136, RN-137, RN-141, RN-142; RNF-22, RNF-25 a RNF-27, RNF-58, RNF-59; MSG-97 a 99, 102, 103, 107, 109 a 111, 220 a 223, 225, 39. |  |  |  |


## 5. Interfaz (GUI)


<!-- tabla 7 -->
| Interfaz | RF | HU | CUS | Qué se hace dentro de la interfaz |
|---|---|---|---|---|
| 7. Pedido para llevar | RF-20 | HU20 | CUS07 (07.1) | Armar el pedido sin mesa con menús completos y productos de carta, registrarlo y ver la confirmación con el cobro inmediato. |


### Vista 7.1: Armado del pedido para llevar (CUS07.1) — restaurante.app/pedidos/llevar


<!-- tabla 8 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 9 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Encabezado | "Pedido para llevar"; no hay selector de mesa (RV-72). |
| 2 | Referencia del cliente | Campo opcional de hasta 30 caracteres; muestra MSG-109. |
| 3 | Tarjetas de menús completos | Con su precio; «No disponible hoy» si falta una parte (MSG-220); al tocarlas se abre el armado por partes (MSG-221, 222, 223). |
| 4 | Productos de carta | Agrupados por categoría con nombre, precio y botones + y −; los agotados con el texto «Agotado» y deshabilitados. |
| 5 | Resumen del pedido | Líneas con cantidad, subtotal, "Nota" y Quitar, el total y el botón REGISTRAR PEDIDO ("Registrando…" mientras procesa); en computadora va a la derecha y en móvil fijo abajo. |


### Vista 7.2: Confirmación del pedido para llevar (CUS07.1) — restaurante.app/pedidos/llevar/confirmacion


<!-- tabla 10 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 11 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Mensaje de éxito | MSG-110 con el número del pedido y el total. |
| 2 | Botón COBRAR AHORA | Abre el cobro del pedido (CUS10.1); es opcional. |
| 3 | Botón NUEVO PEDIDO | Deja la pantalla limpia para el siguiente cliente. |
| 4 | Botón VER PEDIDOS | Abre la lista de pedidos (CUS08.1). |


## 6. Estados de la interfaz


<!-- tabla 12 -->
| Estado | Comportamiento visual |
|---|---|
| Cargando | "Cargando menú…" con marcadores de posición. |
| Pantalla de pedido | Encabezado "Pedido para llevar", campo opcional Referencia del cliente, lista de productos por categoría con + y −, y el resumen del pedido con el total. |
| Disposición en computadora | Dos columnas: productos a la izquierda y resumen fijo del pedido a la derecha. |
| Disposición en móvil | Una columna con el resumen fijo en la parte inferior. |
| Producto agotado | Texto "Agotado" y no seleccionable; si se agota con el pedido en armado, su línea se marca en rojo con MSG-225. |
| Pedido vacío | Botón REGISTRAR PEDIDO deshabilitado y texto de ayuda MSG-97. |
| Registrando | Botón "Registrando…" deshabilitado; el pedido no se puede editar. |
| Éxito | Confirmación con MSG-110, número del pedido, total y los botones COBRAR AHORA, NUEVO PEDIDO y VER PEDIDOS. |
| Error al registrar | MSG-111; el pedido en armado se conserva y se puede reintentar sin duplicar. |
| Descartar | Diálogo MSG-102 con el foco en CANCELAR. |
| Armado de menú completo | Fila de opciones por parte; AGREGAR S/ n se habilita al completar todas; sin completar muestra MSG-221. |
| Menú completo no disponible | Tarjeta atenuada con MSG-220; no se puede tocar. |


## 7. Reglas de validación (RV)

Se aplican también las reglas del pedido de mesa (CUS06): RV-61 a RV-68, RV-70 y RV-71 (al menos un producto, cantidad entera de 1 a 20, productos no agotados, observación de hasta 100 caracteres, revalidación en el servidor, total visible, un solo envío, confirmación al descartar y edición de líneas antes de registrar) y las del armado de menús completos: RV-159 y RV-163 a RV-166. Reglas propias de este CUS:

<!-- tabla 13 -->
| Código | Regla | Elemento UI | Mensaje |
|---|---|---|---|
| RV-72 | El pedido para llevar no requiere mesa: no hay selector de mesa y el pedido se registra como "Para llevar". | Encabezado de la pantalla | — |
| RV-73 | La referencia del cliente es opcional, de hasta 30 caracteres (letras, números, espacios, tildes, guion y punto), y se recortan los espacios de los extremos. | Campo Referencia del cliente | MSG-109 |
| RV-74 | Al terminar el registro, la confirmación muestra el número del pedido, el total y las acciones COBRAR AHORA, NUEVO PEDIDO y VER PEDIDOS. | Pantalla de confirmación | MSG-110 |


## 8. Reglas de negocio y requerimientos no funcionales

Se aplican también RN-35, RN-36, RN-50, RN-51 y RN-54 (menú del día, platos agotados, operación atómica, precio vigente y rechazo del servidor), RNF-22 (idempotencia) y las reglas del armado de menús completos RN-133, RN-136, RN-137, RN-141, RN-142, RNF-58 y RNF-59 (CUS06). Reglas propias de este CUS:

<!-- tabla 14 -->
| Código | Regla |
|---|---|
| RN-57 | Solo el Cajero registra pedidos para llevar. |
| RN-58 | Un pedido para llevar se registra en estado "pendiente", con tipo "Para llevar", cajero, fecha y hora, número correlativo diario (el mismo de los pedidos de mesa) y referencia opcional del cliente. |
| RN-59 | El pedido para llevar no usa ni ocupa mesas. |
| RN-60 | Registrar el pedido y generar la comanda ocurren juntos: si falla alguno, no se crea el pedido. |
| RN-61 | Un pedido para llevar no se amplía con productos; si el cliente pide más, se registra otro pedido. |
| RN-62 | El registro de cada pedido para llevar se registra en auditoría con usuario, fecha y número de pedido. |
| RNF-25 | El registro responde en menos de 2 segundos; la interfaz es usable en computadora, tablet y móvil, con controles de al menos 44 px y el total siempre visible. |
| RNF-26 | El servidor valida token y rol Cajero en cada endpoint y repite todas las validaciones (RNF-02). |
| RNF-27 | La pantalla comparte con el pedido de mesa los componentes de catálogo, líneas y resumen, para no duplicar código. |


## 9. Catálogo de mensajes

Se reutilizan MSG-97 (agregue al menos un producto), MSG-98 (cantidad), MSG-99 (observación), MSG-225 (plato agotado), MSG-102 (descartar), MSG-103 (platos agotados en el pedido), MSG-107 (sin productos disponibles), MSG-220 a MSG-223 (menús completos), MSG-09 (conexión) y MSG-39 (sin permiso).

<!-- tabla 15 -->
| Código | Mensaje (texto al usuario) | Tipo | Ubicación |
|---|---|---|---|
| MSG-109 | La referencia no puede superar los 30 caracteres. | Error | Bajo el campo Referencia |
| MSG-110 | Pedido para llevar N.º [n] registrado. La comanda se envió a cocina. | Éxito | Pantalla de confirmación |
| MSG-111 | No se pudo registrar el pedido para llevar. Su pedido sigue en pantalla; intente nuevamente. | Error | Sobre el botón de registrar |


## 10. Diccionario de datos


<!-- tabla 16 -->
| Campo | Tipo | Obligatorio | Longitud / formato | Notas |
|---|---|---|---|---|
| Tipo de pedido | Fijo | Automático | Para llevar | No editable |
| Referencia del cliente | Texto | No | 0–30 | Se recorta |
| Producto (por línea) | Selección | Sí | Del menú del día, no agotado | — |
| Cantidad (por línea) | Entero | Sí | 1–20 | Por defecto 1 |
| Observación (por línea) | Texto | No | 0–100 | Se recorta |
| Precio unitario, subtotal y total | Decimal (8,2) | Automático | S/ | Precio vigente al agregar la línea |
| Estado del pedido | Lista | Automático | Pendiente al registrar | Luego lo gobiernan cocina y cobro |
| Número del pedido | Entero | Automático | Correlativo diario | Compartido con los pedidos de mesa |
| Cajero, fecha y hora | Texto y fecha | Automático | Del token y del servidor | No editables |
| Identificador de solicitud | Texto único | Automático | — | Evita duplicados |
| Menú completo (por línea) | Selección | Alternativo al producto | Menú completo activo y disponible hoy | Precio fijo del menú; las opciones no suman |
| Opción por parte | Selección | Sí, una por parte | Del menú del día, no agotada | Se guarda con su nombre (RN-141) |

El modelo de datos de la línea de pedido (LineaPedido y LineaPedidoOpcion) es el definido en el CUS06, sección 10.1.

## 11. Contrato de API

Todos los endpoints exigen token JWT (401 sin token válido) y validan el rol en el servidor (403 si no corresponde).

<!-- tabla 17 -->
| Endpoint | Entrada | Respuestas |
|---|---|---|
| GET /api/menu-dia | — | Productos de carta, opciones por rol, menús completos y su disponibilidad (definido en el CUS04). Roles: Administrador, Cajero, Mozo y Cocinero. |
| POST /api/pedidos/llevar | { solicitudId, referencia?, lineas[] } donde cada línea es { productoId, cantidad, observacion? } o { menuCompletoId, elecciones[{ parte, productoId }], cantidad, observacion? } | 201: { pedidoId, numero, total, comandaId }. 400: sin líneas, partes sin elegir, cantidad, observación o referencia inválidas. 409: plato, opción o menú agotado, inactivo o fuera del menú (con la lista). 403: rol no permitido. Rol: Cajero. |


## 12. Escenarios de validación y criterios de aceptación


<!-- tabla 18 -->
| ID | Entrada / acción | Resultado esperado | Reglas | HU |
|---|---|---|---|---|
| E-166 | El cajero agrega 2 almuerzos con la nota "sin ensalada" y registra | Total correcto; MSG-110; pedido "pendiente" de tipo "Para llevar" con número; cocina recibe la comanda marcada "para llevar"; ninguna mesa cambia. | RN-58, RN-59, RN-60 | HU20 |
| E-167 | Escribir la referencia "Sra. Rosa" | La referencia aparece en la comanda y en la lista de pedidos. | RV-73 | HU20 |
| E-168 | Registrar sin referencia | El pedido se identifica por su número. | RN-58 | HU20 |
| E-169 | Referencia de más de 30 caracteres | MSG-109. | RV-73 | HU20 |
| E-170 | Intentar registrar sin productos | Botón deshabilitado y MSG-97. | RV-61 | HU20 |
| E-171 | Cantidad 0, 21, 1.5 o texto | MSG-98; no se registra. | RV-62 | HU20 |
| E-172 | Observación de más de 100 caracteres | MSG-99. | RV-64 | HU20 |
| E-173 | Un plato aparece agotado en el catálogo | Se muestra como "Agotado" y no se puede seleccionar. | RV-63 | HU20 |
| E-174 | Un plato se agota mientras se arma el pedido | El servidor rechaza al registrar; MSG-225 y MSG-103 marcan las líneas; el cajero las quita y registra. | RV-65, RN-54 | HU20 |
| E-175 | No hay menú del día definido | El catálogo muestra todos los productos activos. | RN-35 | HU20 |
| E-176 | No hay productos disponibles | MSG-107. | — | HU20 |
| E-177 | Doble clic en REGISTRAR PEDIDO | Se crea un solo pedido. | RV-67, RNF-22 | HU20 |
| E-178 | Se pierde la conexión al registrar | MSG-111; el pedido sigue en pantalla; al reintentar no se duplica. | RNF-22 | HU20 |
| E-179 | Falla el envío de la comanda | No se crea el pedido. | RN-60 | HU20 |
| E-180 | Cancelar con productos en el pedido | MSG-102; al confirmar se descarta. | RV-68 | HU20 |
| E-181 | Pulsar COBRAR AHORA en la confirmación | Se abre el cobro de ese pedido (CUS10.1). | RV-74 | HU20 |
| E-182 | Pulsar NUEVO PEDIDO en la confirmación | Pantalla limpia lista para el siguiente cliente. | RV-74 | HU20 |
| E-183 | Un mozo, el cocinero o el administrador intenta registrar por URL o servicio | 403 y MSG-39; la opción no aparece en su menú. | RN-57 | HU20 |
| E-184 | Cambiar la cantidad o quitar una línea antes de registrar | El total se recalcula. | RV-66, RV-71 | HU20 |
| E-185 | Revisar la lista de pedidos y la pantalla de cocina | El pedido aparece como "Para llevar", sin mesa. | RN-58, RN-59 | HU20 |
| E-186 | Cambiar el precio de un producto después de registrar | El pedido conserva el precio con que se registró. | RN-51 | HU20 |
| E-187 | Solo teclado (computadora) | Tab recorre referencia, productos, cantidades, notas y botones; Enter confirma; Esc cancela. | RNF-25 | HU20 |
| E-394 | El cajero arma un menú completo en un pedido para llevar | Igual que en la mesa; sin mesa. | RV-163, RN-132 | HU20 |


## 13. Matriz de justificación de usabilidad


<!-- tabla 19 -->
| Principio aplicado | Elemento de la interfaz | Decisión adoptada | Justificación |
|---|---|---|---|
| ISO 9241 – Eficacia | Validación en servidor y mensajes | Se revalida la disponibilidad antes de guardar; los mensajes indican qué hacer | El pedido llega correcto a cocina aunque un plato se haya agotado |
| ISO 9241 – Eficiencia | Sin mesa y con COBRAR AHORA | No hay paso de mesa; el cobro se ofrece al terminar; mismos componentes que el pedido de mesa | Menos pasos con el cliente esperando |
| ISO 9241 – Satisfacción | Confirmación y avisos | Pantalla de éxito con número, total y siguiente acción | El cajero sabe que cocina recibió el pedido |
| Nielsen 1 – Visibilidad del estado | Total, "Registrando…" y "Agotado" | Total en vivo; indicadores de proceso; platos agotados marcados | Siempre sabe qué ocurre |
| Nielsen 2 – Mundo real | Textos | "Para llevar", "Referencia", "Nota", "comanda" | Mismo lenguaje del restaurante |
| Nielsen 3 – Control y libertad | Quitar, cambiar cantidad y cancelar | Corregir antes de registrar; descartar con confirmación | Corrige sin penalización |
| Nielsen 4 – Consistencia | Pantalla igual a la del pedido de mesa | Mismos catálogo, líneas, resumen y avisos | Evita reaprendizaje entre mozo y cajero |
| Nielsen 5 – Prevención de errores | Agotados y registro único | Agotados no seleccionables; identificador único; todo o nada | Evita pedidos imposibles y duplicados |
| Nielsen 6 – Reconocimiento | Lista con precios y referencia | Nombre y precio visibles; referencia en comanda y lista | No obliga a recordar a quién pertenece cada pedido |
| Nielsen 7 – Flexibilidad y eficiencia | Acciones posteriores | COBRAR AHORA o cobrar luego; NUEVO PEDIDO inmediato | Se adapta a cobrar al pedir o al recoger |
| Nielsen 8 – Minimalismo | Pantalla | Solo referencia, productos, notas y total | Sin distracciones |
| Nielsen 9 – Recuperarse de errores | Mensajes MSG-103 y MSG-111 | Indican la salida y conservan el pedido | Facilita corregir |
| Shneiderman 1 – Consistencia | Estilo y acciones | Misma paleta, botones y mensajes del sistema | Comportamiento predecible |
| Shneiderman 2 – Usabilidad universal | Computadora, tablet y móvil | Dos columnas en computadora; una en móvil; controles de 44 px; teclado | Atiende distintos dispositivos y niveles |
| Shneiderman 3 – Retroalimentación | Avisos y resaltado | MSG-110 y línea resaltada al agregar | Sabe qué pasó |
| Shneiderman 4 – Cierre | Pantalla de confirmación | Termina con número, total y siguiente acción | Indica que la tarea concluyó |
| Shneiderman 5 – Prevenir errores | Validaciones | No registra vacío ni inválido; botón bloqueado al enviar | Evita datos inválidos y duplicados |
| Shneiderman 6 – Reversión | Quitar y descartar | Deshacer líneas y descartar el pedido en armado | Acciones reversibles antes de registrar |
| Shneiderman 7 – Control del usuario | Todo el flujo | Cada acción la inicia el cajero; el cobro no es obligatorio | Mantiene el control |
| Shneiderman 8 – Memoria a corto plazo | Resumen y referencia | Muestra siempre lo pedido, el total y quién lo pidió | No debe recordar lo anotado |


## 14. Matriz de trazabilidad


### 14.1 Requerimiento → historia → caso de uso → vista → prueba


<!-- tabla 20 -->
| RF | HU | CUS | Vista | Reglas / mensajes | API | Escenarios |
|---|---|---|---|---|---|---|
| RF-20 Registrar pedido para llevar | HU20 (M) | CUS07.1 | 7.1 y 7.2 | RV-61 a 68, 70 a 74, 159, 163 a 166; RN-57 a 62, 133, 136, 137, 141, 142; MSG-97 a 99, 102, 103, 107, 109 a 111, 220 a 223, 225 | POST /api/pedidos/llevar | E-166 a E-187, E-394 |


### 14.2 Regla → elemento de interfaz → escenario


<!-- tabla 21 -->
| Regla | Elemento de interfaz | Escenario |
|---|---|---|
| RV-72 / RN-59 | Pantalla sin selector de mesa; pedido tipo "Para llevar" | E-166, E-185 |
| RV-73 | Campo Referencia del cliente | E-167 a E-169 |
| RV-61 | Botón REGISTRAR PEDIDO deshabilitado sin productos | E-170 |
| RV-62 / RV-64 | Controles de cantidad y campo de nota | E-171, E-172 |
| RV-63 / RV-65 | Productos con el texto "Agotado" y revalidación en el servidor | E-173, E-174 |
| RV-66 / RV-71 | Resumen con el total y controles de la línea | E-184 |
| RV-67 / RNF-22 | Botón en "Registrando…" e identificador de solicitud | E-177, E-178 |
| RV-68 | Diálogo MSG-102 | E-180 |
| RV-74 | Confirmación con COBRAR AHORA, NUEVO PEDIDO y VER PEDIDOS | E-181, E-182 |
| RN-60 | Operación atómica (pedido y comanda) | E-166, E-179 |
| RN-57 | Opción visible solo para el Cajero; 403 en el servidor | E-183 |
| RN-51 | Precio guardado en cada línea | E-186 |


## 15. Evaluación del prototipo y mejoras incorporadas

Aún no hay prototipo del pedido para llevar; las decisiones siguientes aplican lo aprendido en los CUS anteriores.

<!-- tabla 22 -->
| Riesgo previsto | Principio | Decisión de diseño incorporada |
|---|---|---|
| Cliente esperando y cola en la caja | Nielsen 7; Shneiderman 2 | Pantalla sin mesa, botones + y − grandes, total siempre visible y COBRAR AHORA al terminar |
| Ofrecer un plato agotado | Nielsen 5 y 9 | Platos agotados visibles y deshabilitados, y revalidación en el servidor |
| Duplicar el pedido por doble clic | Nielsen 5; Shneiderman 5 | Botón "Registrando…" e identificador único de solicitud |
| Confundir pedidos para llevar con los de mesa | Nielsen 1 y 4 | Encabezado "Pedido para llevar" y etiqueta "Para llevar" en la lista y en la comanda |
| No saber a quién pertenece cada pedido | Nielsen 6; Shneiderman 8 | Referencia opcional y número de pedido visibles en la confirmación |
| Perder lo escrito si falla la conexión | Nielsen 9 | El pedido se conserva en pantalla y se puede reintentar sin duplicar |
| Estilo distinto al pedido de mesa | Shneiderman 1; Nielsen 4 | Reutilizar los mismos componentes, paleta y mensajes del CUS06 |


## 16. Dependencias con otros casos de uso


<!-- tabla 23 -->
| CUS relacionado | Relación con el CUS07 |
|---|---|
| CUS03 y CUS04 | Productos activos, precio vigente, menú del día y platos agotados. |
| CUS06 Pedido de mesa | Comparte la mecánica de armado del pedido (catálogo, líneas y resumen); conviene un componente común. |
| CUS08 Gestión de pedidos | Lista el pedido como "Para llevar" y permite modificarlo o anularlo antes de que cocina inicie (CUS08.2). |
| CUS09 Cocina | Recibe la comanda marcada "para llevar" y avisa al cajero cuando esté lista (aviso de comanda lista en el listado de pedidos, CUS08.1). |
| CUS10 Cobro | COBRAR AHORA abre el cobro del pedido (CUS10.1); al pagar un pedido para llevar no se libera ninguna mesa (la regla de liberación del cobro no aplica). |


<!-- tabla 24 -->
| N.º | Punto | Decisión adoptada o tarea |
|---|---|---|
| 1 | Decisión: solo el Cajero registra y cobra pedidos para llevar. Si la dueña atiende ese puesto, lo hace con un usuario con rol Cajero. | Reflejarlo en la lista de actores y en la gestión de usuarios (CUS02.2). |
| 2 | RF-20 no prevé identificar al cliente; se agregó una referencia opcional para llamarlo cuando el pedido esté listo. | Decisión: se acepta la referencia opcional (hasta 30 caracteres) para llamar al cliente. |
| 3 | No está definido cuándo paga un cliente para llevar (al pedir o al recoger). | Decisión: el cliente puede pagar al pedir (COBRAR AHORA) o al recoger; ambos casos están cubiertos. |
| 4 | Si el restaurante cobra envases o tápers, no hay dónde registrarlos. | Decisión: un envase que se cobre se registra como producto de categoría Otro (CUS03). |
| 5 | No existe un RF para ampliar un pedido para llevar (RN-61). | Documentarlo como decisión de diseño: si el cliente pide más, se registra otro pedido. |
| 6 | La pantalla es casi igual a la del pedido de mesa (CUS06.1). | Implementar un componente compartido (RNF-27) para cumplir con evitar duplicación de código. |
| 7 | Aún no existen bocetos de las Vistas 7.1 y 7.2. | Diseñarlas en Figma con los estados de la sección 7, reutilizando los de CUS06. |
| 8 | La mecánica de armado de menús completos es la del CUS06; sin menú definido rige RN-142, ya incorporada en RN-35. | Implementar el componente compartido de armado (RNF-27) y las reglas RV-163 a RV-165 una sola vez. |
