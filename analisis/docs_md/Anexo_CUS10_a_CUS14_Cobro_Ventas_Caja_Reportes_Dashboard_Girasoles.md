RESTAURANTE GIRASOLES
Anexo: CUS10 a CUS14 – Cobro, ventas, caja, reportes y dashboard
Casos de uso, interfaz, reglas, API, pruebas y trazabilidad · Metodología XP · Estructura única por CUS

# Correspondencia de numeración vigente

Este anexo cierra la serie de CUS con la misma numeración definitiva (35 RF, 35 HU y CUS sin el antiguo Perfil) y los mismos ajustes de códigos que los anexos anteriores, para que sean únicos en todo el documento de construcción:

<!-- tabla 1 -->
| Elemento | Antes | Ahora | Motivo |
|---|---|---|---|
| CUS | CUS11 a CUS15 | CUS10 a CUS14 | Se retiró el antiguo CUS03 (Perfil) |
| Subcasos de cobro | CUS11.1, 11.2, 11.3 y 11.4 | CUS10.1 (cobrar, con método de pago, vuelto y liberación de la mesa) y CUS10.2 (comprobante) | Método de pago y liberación de la mesa son pasos del cobro, no CUS |
| Subcasos de dashboard | CUS15.1 y CUS15.2 | CUS14.1; el panel por rol del Cajero, Mozo y Cocinero pasa al Anexo B | RF-40 es navegación y no es RF ni CUS |
| HU / RF | HU28 a HU39 / RF-28 a RF-39 | HU25 a HU34 / RF-25 a RF-34 | Numeración de 35 RF y 35 HU |
| Escenarios | E-223 a E-345 · E-346 a E-370 | E-245 a E-367 · E-405 a E-429 | Los anteriores ya ocupan hasta E-244 y E-371 a E-404 son del ajuste de menús completos |
| Requerimientos no funcionales | RNF-35 a RNF-53 · RNF-54 a RNF-57 | RNF-36 a RNF-54 · RNF-62 a RNF-65 | RNF-58 a RNF-61 son del ajuste de menús completos |
| Mensajes de documento de identidad | MSG-166 a MSG-170 (cobro) | MSG-226 a MSG-230 | MSG-166 a MSG-189 ya son de caja (CUS12) |

Los códigos de reglas (RV, RN) y los demás mensajes se conservan.

# CUS10: Cobro de pedidos


## 1. Ficha del CUS general


<!-- tabla 2 -->
| Campo | Detalle |
|---|---|
| CUS general | CUS10: Cobro de pedidos |
| Interfaz (GUI) | Interfaz 10: Cobro |
| Actor(es) | Cajero |
| HU / RF de origen | HU25 y HU26 / RF-25 y RF-26 |
| Descripción | Flujo de tres pasos: detalle y total (Vista 10.1), método de pago y vuelto (Vista 10.2) y comprobante (Vista 10.3). Es el CUS central del sistema: reemplaza el cálculo manual del cobro que hoy hace la dueña. |
| Alcance | Registrar el método de pago y el vuelto y liberar la mesa al pagar son pasos del cobro, no CUS propios. Solo el Cajero cobra y solo con la caja del día abierta (CUS12.1). |


<!-- tabla 3 -->
| CUS | Título | Actor | HU | RF | Prioridad | Iteración | Complejidad |
|---|---|---|---|---|---|---|---|
| CUS10.1 | Cobrar pedido (método de pago, vuelto y liberación de la mesa) | Cajero | HU25 | RF-25 | Alta (Must) | 1/3 | Alta |
| CUS10.2 | Emitir comprobante de pago | Cajero | HU26 | RF-26 | Alta (Must) | 1/3 | Media |

Criterio: la prioridad se obtiene de la validación MoSCoW de la HU (Must = Alta, Should = Media, Could = Baja) y la iteración sigue la prioridad (Alta = 1/3, Media = 2/3, Baja = 3/3).

## 2. Decisiones adoptadas


<!-- tabla 4 -->
| Tema | Decisión | Vacío que cubre |
|---|---|---|
| Quién cobra | Solo el Cajero y solo con la caja del día abierta (CUS12.1). | RF-25 |
| Cómo se llega al cobro | Desde la opción COBRAR (lista de pedidos pendientes de cobro, de mesa y para llevar), desde una mesa ocupada (CUS05.2), desde COBRAR AHORA (CUS07) o desde la lista de pedidos (CUS08.1). | CUS10.1 |
| Pasos del cobro | Tres pasos con progreso visible: 1 Detalle y total, 2 Método de pago, 3 Comprobante. Se puede volver del paso 2 al 1 sin perder datos. | CUS10.1 a CUS10.2 |
| Total | Lo calcula el servidor con el precio guardado en cada línea (RN-51), incluye las ampliaciones y no se edita. Sin descuentos ni propinas. | RF-25 |
| Total que cambia durante el cobro | Si el mozo agrega productos mientras el cajero cobra, el servidor rechaza el pago y muestra el total nuevo para revisarlo. | Faltaba la regla |
| Pedido aún no listo | Se advierte con el estado actual y se puede continuar con confirmación (útil si el cliente para llevar paga al pedir). | CUS10.1 |
| Medios de pago | Efectivo y Yape únicamente (sin tarjeta); un pedido se paga con un solo medio. | RF-25 |
| Efectivo | Monto recibido (obligatorio, mayor o igual al total, hasta 9,999.99), con botones rápidos "Exacto", S/ 10, 20, 50, 100 y 200 (solo los que cubren el total). El vuelto se calcula al instante y se muestra en grande. | RF-25 |
| Yape | El cajero marca que confirmó la recepción del pago; la referencia de la operación es opcional (hasta 20 caracteres). | RF-25 |
| Registro del cobro | Una sola operación: registra el pago, crea la venta, pasa el pedido a "Pagado", asigna el número de comprobante y libera la mesa. Si falla, no se registra nada. Un doble clic no duplica el cobro. | CUS10.1 a CUS10.1 |
| Liberación de la mesa | La ocupación de la mesa se calcula a partir de sus pedidos (libre si no tiene ninguno por cobrar), por lo que liberar la mesa forma parte de la misma operación y no existe liberación manual. | Regla de negocio del cobro (antes un caso aparte) |
| Tipos de comprobante | Se ofrecen cuatro opciones al cobrar: Ticket interno (sin validez fiscal), Boleta de venta simple (sin datos del cliente, hasta S/ 699.99), Boleta de venta con DNI (persona natural) y Factura (persona jurídica o con RUC). | RF-26 |
| Series y correlativos | Cada tipo de comprobante maneja serie y correlativo independiente de 6 dígitos sin vacíos: T001 para tickets, B001 para boletas y F001 para facturas. | RF-26 |
| Consulta automática de DNI/RUC | El cajero ingresa el DNI (8 dígitos) o RUC (11 dígitos) y el sistema consulta una API externa para autocompletar en tiempo real los nombres o la razón social y dirección fiscal, evitando errores manuales. | CUS10.1 / Heurística 5 |
| Límite legal para Boleta Simple | Por disposición de SUNAT, compras iguales o superiores a S/ 700.00 bloquean la emisión de "Boleta Simple" y obligan a ingresar DNI o RUC. | Normativa SUNAT / RV |
| Cálculo de impuestos | Todos los precios de los platos incluyen IGV. En Boletas y Facturas el sistema desglosa automáticamente la Operación Gravada (Total / 1.18) y el IGV (18%). En tickets internos no se muestra desglose tributario. | RF-26 |
| Impresión y descarga | IMPRIMIR usa la impresión del navegador con diseño para papel de 80 mm; DESCARGAR genera un PDF idéntico a la vista previa. No hay impresión directa a la impresora térmica. | RF-26 |
| Reimpresión | Desde el listado de ventas (CUS11.1), con la marca "COPIA". | CUS10.2 |
| Pedido pagado | Ya no se modifica ni se anula; un cobro equivocado se corrige anulando la venta (RF-27, CUS11.2). | CUS08.2 |
| Auditoría | Se registran cajero, fecha, hora, medio de pago, montos y comprobante de cada cobro. | Control de la dueña |
| Quién cobra | Solo el Cajero cobra, abre y cierra la caja (decisión de la dueña). El Administrador no cobra; si la dueña atiende caja, lo hace con un usuario con rol Cajero. | Decisión sobre los actores |
| Alcance de la emisión | La boleta y la factura que emite el sistema desglosan el IGV (RN-92). Su emisión electrónica ante SUNAT no está en el alcance de esta versión: se tratan como comprobantes del sistema y no como comprobantes electrónicos. | Decisión sobre el desglose de IGV |


## 3. Análisis del usuario (Diseño Centrado en el Usuario)


<!-- tabla 5 -->
| Aspecto | Descripción |
|---|---|
| Quién usa la interfaz | El cajero, con experiencia tecnológica básica, con el cliente esperando frente a él y normalmente desde una computadora o tablet. |
| Necesidades | Ver el total correcto sin sumar; entregar el vuelto exacto; separar lo cobrado en efectivo y por Yape para cuadrar la caja; entregar un comprobante; cobrar rápido cuando hay cola. |
| Dificultades previsibles | Errores de suma o de vuelto bajo presión; confundir el medio de pago; cobrar un pedido equivocado, ya pagado o anulado; que el total cambie sin darse cuenta; que no haya impresora; cobrar sin caja abierta. |
| Contexto de uso | Hora pico con cola, ruido y prisa. Hoy la dueña cuenta el dinero al final del día y suele equivocarse al sumar; este cobro es el origen de los datos de la caja. |


## 4. Plantillas de casos de uso


### CUS10.1: Cobrar pedido (método de pago, vuelto y liberación de la mesa)


<!-- tabla 6 -->
| Código: CUS10.1 | Título: Cobrar pedido (Vistas 10.1 y 10.2) | Fecha: 21.10.2026 | Iteración: 1/3 |
|---|---|---|---|
| Actor(es): Cajero |  |  |  |
| Prioridad: Alta (Must) | Complejidad: Alta |  |  |
| Historia de usuario: HU25 · Cobrar un pedido, registrando el método de pago y el vuelto (M) |  |  |  |
| Requerimiento de origen: RF-25 (incluye el método de pago, el vuelto y la liberación de la mesa) |  |  |  |
| Descripción: Permite al cajero cobrar un pedido de mesa o para llevar con el total calculado automáticamente, elegir el tipo de comprobante y registrar si el cliente paga en efectivo o por Yape y, en efectivo, el monto recibido y el vuelto, para separar lo cobrado por cada medio y cuadrar la caja. Al pagar, la mesa se libera sola. |  |  |  |
| Precondición: El cajero tiene sesión iniciada, la caja del día está abierta (CUS12.1) y el pedido no está pagado ni anulado. |  |  |  |
| Flujo principal:<br>1. El cajero accede a COBRAR (lista de pedidos por cobrar), o llega con un pedido ya elegido desde una mesa ocupada (CUS05.2), COBRAR AHORA (CUS07.1) o la lista de pedidos (CUS08.1).<br>2. El sistema muestra los pedidos pendientes de cobro con su total.<br>3. El cajero selecciona el pedido.<br>4. El sistema muestra el paso 1 (Vista 10.1): el detalle de los platos con cantidades, precios unitarios e importes (los menús completos con su precio y sus opciones elegidas como detalle sin precio) y el total a pagar calculado por el servidor.<br>5. El cajero selecciona el tipo de comprobante: Ticket (sin datos del cliente); Boleta Simple (sin datos del cliente, bloqueada si el total es igual o superior a S/ 700.00, RV-105-C); Boleta con DNI (al ingresar 8 dígitos se consulta el padrón y se autocompleta el nombre); o Factura (al ingresar 11 dígitos se autocompleta la Razón Social y la Dirección Fiscal).<br>6. Verifica el detalle y pulsa CONTINUAR AL PAGO.<br>7. El sistema muestra el paso 2 (Vista 10.2): las opciones EFECTIVO y YAPE con el total siempre visible; el cajero elige el método de pago.<br>8. En efectivo, ingresa el monto recibido (o toca un botón rápido como "Exacto" o "S/ 50") y el sistema calcula y muestra el vuelto al instante. En Yape, marca que confirmó la recepción del pago y, si desea, escribe la referencia de la operación.<br>9. Pulsa CONFIRMAR PAGO; el sistema valida (RV-98 a RV-100) y deshabilita el botón (RV-102).<br>10. El servidor revalida el total (RV-101) y, en una sola operación, registra el pago (método, monto recibido y vuelto), crea la venta, pasa el pedido a "Pagado", asigna el número de comprobante y recalcula la ocupación de la mesa: si no tiene otros pedidos pendientes de cobro, queda "Libre" (RN-88, RN-89).<br>11. El sistema muestra MSG-146 y pasa al comprobante (CUS10.2); la vista de mesas (CUS05.2) muestra la mesa libre en 15 segundos o menos. |  |  |  |
| Flujo alterno:<br>La caja del día no está abierta: MSG-135 con el botón ABRIR CAJA; no se puede cobrar.<br>El pedido está pagado o anulado: MSG-137. No hay pedidos por cobrar: MSG-136.<br>El pedido aún no está listo: MSG-138; si el cajero confirma, continúa.<br>El total cambió porque se agregaron productos (CUS06.2): MSG-139; no se registra el pago hasta revisar el nuevo total y se regresa al paso 1.<br>Cancelar con datos ingresados: MSG-150; el pedido sigue pendiente de cobro. Volver al paso 1: se conserva lo ingresado.<br>DNI con formato inválido: MSG-226. RUC inválido: MSG-227. Documento no encontrado en el padrón: MSG-228; se permite ingresar la razón social o el nombre manualmente. Total igual o superior a S/ 700.00 con Boleta Simple: MSG-229; se exige DNI o RUC. Servicio de consulta de identidad no disponible: MSG-230; los datos se ingresan manualmente.<br>Sin método seleccionado: MSG-140. Monto vacío, inválido o con más de 2 decimales: MSG-141 o MSG-142; mayor a 9,999.99: MSG-152. Monto recibido menor al total: MSG-143 y no se confirma. Yape sin confirmar: MSG-144. Referencia de más de 20 caracteres: MSG-151.<br>Doble clic en CONFIRMAR PAGO: se registra un solo pago (RV-102).<br>Pedido de mesa con otros pedidos sin cobrar en la misma mesa: la mesa se mantiene Ocupada. Pedido para llevar: no se afecta ninguna mesa.<br>Un usuario sin rol Cajero intenta cobrar por URL o servicio: MSG-39 (403). |  |  |  |
| Postcondición: La venta queda registrada con el total del pedido, el método de pago, el monto recibido y el vuelto; el pedido queda en estado "Pagado" y la mesa, libre si no tiene otros pedidos por cobrar. |  |  |  |
| Excepciones:<br>Falla al registrar el cobro: MSG-147; no se registra nada (ni pago, ni venta, ni liberación de la mesa), el pedido sigue pendiente de cobro y se registra el incidente.<br>Pérdida de conexión: MSG-09 y MSG-147; al reintentar no se duplica el cobro. |  |  |  |
| Reglas y mensajes aplicables: RV-95 a RV-104, RV-105-A a RV-105-D, RV-106; RN-84 a RN-95, RN-95-B; RNF-36 a RNF-40; MSG-135 a 144, 146, 147, 150 a 152, 226 a 230, 09, 39. |  |  |  |


### CUS10.2: Emitir comprobante de pago


<!-- tabla 7 -->
| Código: CUS10.2 | Título: Emitir comprobante de pago (Vista 10.3) | Fecha: 21.10.2026 | Iteración: 1/3 |
|---|---|---|---|
| Actor(es): Cajero |  |  |  |
| Prioridad: Alta (Must) | Complejidad: Media |  |  |
| Historia de usuario: HU26 Emitir comprobante de pago (M) |  |  |  |
| Requerimiento de origen: RF-26 |  |  |  |
| Descripción: Permite al cajero generar un comprobante de pago (ticket interno, boleta de venta o factura) para entregarlo al cliente, imprimirlo o descargarlo, y llevar un registro numerado de las ventas. La línea de un menú completo muestra el menú con su precio y sus opciones como detalle sin precio. |  |  |  |
| Precondición: El pago del pedido se ha registrado (CUS10.1). |  |  |  |
| Flujo principal:<br>1. Una vez confirmado el pago (Efectivo o Yape), el sistema genera atómicamente la venta y el comprobante con la serie correspondiente (T001-XXXXXX, B001-XXXXXX o F001-XXXXXX).<br>2. El sistema muestra la vista previa con los datos del restaurante, serie y número, fecha y hora, número de pedido, mesa o "Para llevar", cajero, datos del cliente (DNI, RUC o razón social, según el tipo), ítems (los menús completos con su precio y sus opciones elegidas como detalle sin precio), desglose de Operación Gravada, IGV y Total (en Boletas y Facturas), método de pago y, en efectivo, monto recibido y vuelto; el Ticket lleva la leyenda "Documento sin validez tributaria".<br>3. El cajero pulsa IMPRIMIR o DESCARGAR.<br>4. El sistema abre la impresión con formato de 80 mm o descarga el PDF.<br>5. El cajero entrega el comprobante al cliente y pulsa NUEVO COBRO o VER PEDIDOS. |  |  |  |
| Flujo alterno:<br>No hay impresora disponible: MSG-149 y se ofrece DESCARGAR.<br>El cajero necesita una copia: reimprime desde el listado de ventas (CUS11.1) con la marca "COPIA".<br>El cajero cierra la vista previa sin imprimir: el comprobante queda guardado y accesible en el listado de ventas. |  |  |  |
| Postcondición: El comprobante queda emitido con un número correlativo único y asociado a la venta. |  |  |  |
| Excepciones:<br>Falla al generar la vista o el PDF: MSG-148; la venta y su número se conservan y se puede regenerar desde el listado de ventas. |  |  |  |
| Reglas y mensajes aplicables: RV-105, RV-105-A a RV-105-D; RN-91, RN-92, RN-95-B; RNF-38; MSG-146, 148, 149. |  |  |  |


## 5. Interfaz (GUI)


<!-- tabla 8 -->
| Interfaz | RF | HU | CUS | Qué se hace dentro de la interfaz |
|---|---|---|---|---|
| 10. Cobro | RF-25 y RF-26 | HU25 y HU26 | CUS10 (10.1 y 10.2) | Elegir el pedido, ver el detalle y el total, elegir el tipo de comprobante, registrar el método de pago y el vuelto, y emitir, imprimir o descargar el comprobante. |


### Vista 10.1: Detalle y total del cobro (CUS10.1) — restaurante.app/cobro


<!-- tabla 9 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 10 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Encabezado | "Paso 1 de 3" y el total siempre visible (RV-103). |
| 2 | Lista de pedidos por cobrar | N.º, mesa o "Para llevar", estado y total; MSG-136 si no hay pedidos y MSG-135 con ABRIR CAJA si la caja está cerrada. |
| 3 | Detalle del pedido | Platos con cantidad, precio unitario e importe; los menús completos con su precio y sus opciones como detalle sin precio; total calculado por el servidor. |
| 4 | Tipo de comprobante | Ticket, Boleta Simple (bloqueada desde S/ 700.00, MSG-229), Boleta con DNI y Factura. |
| 5 | Campos DNI / RUC | Con botón CONSULTAR y autocompletado de nombre o razón social y dirección; MSG-226, 227, 228 y 230. |
| 6 | Botón CONTINUAR AL PAGO | Pasa al paso 2; muestra MSG-138 si el pedido aún no está listo y MSG-139 si el total cambió. |


### Vista 10.2: Método de pago y vuelto (CUS10.1) — restaurante.app/cobro/pago


<!-- tabla 11 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 12 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Selector de método | EFECTIVO o YAPE; muestra MSG-140. |
| 2 | Efectivo | Monto recibido con teclado numérico y botones "Exacto", S/ 10, 20, 50, 100 y 200 (solo los que cubren el total); el vuelto en grande; MSG-141, 142, 143 y 152. |
| 3 | Yape | Casilla de confirmación de recepción (MSG-144) y referencia opcional de hasta 20 caracteres (MSG-151). |
| 4 | Botón CONFIRMAR PAGO | Muestra "Registrando pago…"; MSG-147 si falla. |
| 5 | Botón Volver / Cancelar | Vuelve al paso 1 conservando lo ingresado o cancela con confirmación (MSG-150). |


### Vista 10.3: Comprobante de pago (CUS10.2) — restaurante.app/cobro/comprobante


<!-- tabla 13 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 14 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Vista previa | Datos del restaurante, serie y número, fecha y hora, pedido, mesa o "Para llevar", cajero, datos del cliente, ítems, desglose de Operación Gravada e IGV (Boleta y Factura), método de pago, monto recibido y vuelto; el Ticket lleva "Documento sin validez tributaria". |
| 2 | Línea de menú completo | El menú con su precio y sus opciones como detalle sin precio. |
| 3 | Botones IMPRIMIR y DESCARGAR | Impresión de 80 mm o PDF idéntico; MSG-148 y MSG-149 si falla. |
| 4 | Botones NUEVO COBRO y VER PEDIDOS | Cierran el flujo del cobro. |


## 6. Estados de la interfaz


<!-- tabla 15 -->
| Estado | Comportamiento visual |
|---|---|
| Cargando | "Cargando pedidos por cobrar…" con marcadores de posición. |
| Lista por cobrar | Pedidos de mesa y para llevar con número, mesa o referencia, hora, estado y total; los listos resaltados; botón COBRAR en cada fila. |
| Sin pedidos por cobrar | MSG-136. |
| Caja cerrada | Lista bloqueada con MSG-135 y botón ABRIR CAJA (CUS12.1). |
| Paso 1: detalle | Líneas con cantidad, producto, precio e importe; total grande; botones CANCELAR y CONTINUAR AL PAGO. |
| Pedido no listo | Diálogo MSG-138 con CANCELAR y COBRAR DE TODOS MODOS. |
| Total cambió | Aviso MSG-139 y detalle actualizado; el cajero debe revisarlo antes de continuar. |
| Paso 2: método | Dos botones grandes EFECTIVO y YAPE con el total siempre visible. |
| Efectivo | Campo Monto recibido con teclado numérico y botones rápidos; el vuelto aparece grande al escribir; si el monto es menor, se muestra MSG-143. |
| Yape | Casilla "Confirmo que recibí S/ [total] por Yape" y campo Referencia opcional. |
| Confirmando pago | Botón "Registrando pago…" deshabilitado (RV-102). |
| Paso 3: comprobante | MSG-146, vista previa del ticket y botones IMPRIMIR, DESCARGAR, NUEVO COBRO y VER PEDIDOS. |
| Error | MSG-147 sobre el botón, el pedido sigue por cobrar y lo ingresado se conserva para reintentar. |
| Móvil y tablet | Una columna, total fijo en la parte superior y botones de al menos 44 px. |


## 7. Reglas de validación (RV)


<!-- tabla 16 -->
| Código | Regla | Elemento UI | Mensaje |
|---|---|---|---|
| RV-95 | Solo se cobran pedidos pendientes de cobro (ni pagados ni anulados) y con la caja del día abierta. | Botón COBRAR | MSG-135, 137 |
| RV-96 | El total lo calcula el servidor (precio por cantidad de cada línea), se muestra con 2 decimales y no se puede editar. | Resumen del cobro | — |
| RV-97 | Si el pedido aún no está listo, se advierte con su estado y se permite continuar con confirmación. | Diálogo de advertencia | MSG-138 |
| RV-98 | El método de pago es obligatorio: Efectivo o Yape. | Selector de método | MSG-140 |
| RV-99 | En efectivo, el monto recibido es obligatorio, numérico, con hasta 2 decimales (punto o coma), mayor o igual al total y de hasta 9,999.99; el vuelto se calcula automáticamente. | Campo Monto recibido y Vuelto | MSG-141, 142, 143, 152 |
| RV-100 | En Yape, se debe marcar la confirmación de recepción del pago; la referencia es opcional, de hasta 20 caracteres. | Casilla y campo Referencia | MSG-144, 151 |
| RV-101 | Antes de registrar, el servidor verifica que el total no haya cambiado desde que se mostró; si cambió, no registra y muestra el total nuevo. | Paso 1 del cobro | MSG-139 |
| RV-102 | Mientras se registra el pago, el botón queda deshabilitado con "Registrando pago…" y el envío lleva un identificador único: un solo cobro por pedido. | Botón CONFIRMAR PAGO | — |
| RV-103 | Cada paso muestra el progreso ("Paso 1 de 3") y el total siempre visible; se puede volver del paso 2 al 1 sin perder lo ingresado. | Encabezado del cobro | — |
| RV-104 | Los botones rápidos de efectivo ("Exacto", S/ 10, 20, 50, 100 y 200) solo aparecen si cubren el total. | Botones rápidos | — |
| RV-105 | En el Ticket interno, el comprobante muestra la leyenda "Documento sin validez tributaria", no se puede editar y la vista previa es idéntica a lo impreso o descargado. | Vista previa del comprobante | — |
| RV-105-A | Si se selecciona Boleta con DNI, el DNI debe contener exactamente 8 dígitos numéricos. | Campo DNI | MSG-226 |
| RV-105-B | Si se selecciona Factura, el RUC debe contener exactamente 11 dígitos numéricos y comenzar con 10 o 20. | Campo RUC | MSG-227 |
| RV-105-C | Para montos totales iguales o superiores a S/ 700.00, la opción Boleta Simple queda inhabilitada; se exige comprobante con documento (DNI o RUC). | Selector de comprobante | MSG-229 |
| RV-105-D | Si la consulta externa del documento no arroja resultados en el padrón, se notifica y se permite el ingreso manual de la Razón Social / Nombre. | Botón Consultar / Input | MSG-228, 170 |
| RV-106 | Si el cajero cancela con datos ingresados, se pide confirmar; el pedido sigue pendiente de cobro. | Botón CANCELAR | MSG-150 |


## 8. Reglas de negocio y requerimientos no funcionales


<!-- tabla 17 -->
| Código | Regla |
|---|---|
| RN-84 | Solo el Cajero cobra pedidos, y solo con la caja del día abierta (CUS12.1). |
| RN-85 | Se cobran pedidos de mesa o para llevar que no estén pagados ni anulados; un pedido que aún no está listo puede cobrarse con confirmación. |
| RN-86 | Los medios de pago son Efectivo y Yape únicamente; un pedido se paga con un solo medio. |
| RN-87 | El total del cobro es el del pedido: suma de las líneas con su precio guardado (RN-51), incluidas las ampliaciones; no admite descuentos ni propinas. |
| RN-88 | Registrar el cobro es una sola operación: registra el pago, crea la venta, pasa el pedido a "Pagado", asigna el número de comprobante y libera la mesa. Si falla, no se registra nada. |
| RN-89 | La ocupación de una mesa se calcula a partir de sus pedidos: está libre cuando no tiene ninguno pendiente de cobro (RN-147). Un pedido para llevar no afecta a ninguna mesa. |
| RN-90 | Mientras un cobro está en curso el pedido puede recibir productos (CUS06.2); si el total cambia, el servidor rechaza el pago y muestra el total nuevo. |
| RN-91 | Series y correlatividad tributaria: el sistema asigna un correlativo ascendente, único y sin vacíos según la serie del comprobante elegido (T001 para Tickets, B001 para Boletas, F001 para Facturas). La numeración de una serie no se reinicia entre días, es independiente entre tipos de comprobante y puede reimprimirse con la marca "COPIA" (CUS11.1). |
| RN-92 | Desglose tributario oficial: para Boletas y Facturas, la Operación Gravada se calcula como redondeo(Total / 1.18, 2) y el IGV como Total − Operación Gravada. En el Ticket interno no se desglosa IGV y la leyenda obligatoria es "Documento sin validez tributaria". |
| RN-93 | Un pedido pagado no se modifica ni se anula; la corrección se hace anulando la venta (RF-27, CUS11.2). |
| RN-94 | En efectivo se guardan el total cobrado, el monto recibido y el vuelto; la caja suma el total cobrado por medio de pago (CUS12). |
| RN-95 | Cada cobro se registra en auditoría con cajero, fecha, hora, medio, montos y número de comprobante; la venta no se edita. |
| RN-95-B | Exigencia de identidad desde S/ 700.00: ningún cobro cuyo monto final sea igual o superior a S/ 700.00 podrá emitirse como consumidor final anónimo. El sistema requiere DNI o RUC válido y registrado. |
| RNF-36 | Confirmar el pago responde en menos de 2 segundos; el vuelto se calcula en pantalla al instante. |
| RNF-37 | Los cálculos de dinero usan tipo decimal (nunca punto flotante) y redondeo a 2 decimales, en pantalla y en el servidor. |
| RNF-38 | La impresión usa la función del navegador con diseño de 80 mm y la descarga genera un PDF; la vista previa es idéntica a ambos. |
| RNF-39 | La pantalla es usable en computadora, tablet y móvil, con controles de al menos 44 px, teclado numérico para los montos y operable con teclado (Enter confirma, Esc cancela). |
| RNF-40 | El servidor valida token, rol Cajero y estado de la caja en cada endpoint; la operación de cobro es atómica e idempotente (RNF-02). |


## 9. Catálogo de mensajes

Se reutilizan MSG-09 (conexión), MSG-39 (sin permiso) y MSG-135 (caja cerrada, también usado por el dashboard). Los mensajes de documento de identidad pasan de MSG-166 a 170 a MSG-226 a 230 porque MSG-166 a 189 pertenecen a la gestión de caja (CUS12).

<!-- tabla 18 -->
| Código | Mensaje (texto al usuario) | Tipo | Ubicación |
|---|---|---|---|
| MSG-135 | Debe abrir la caja antes de cobrar. (botón ABRIR CAJA) | Error | Sobre la lista de cobros |
| MSG-136 | No hay pedidos pendientes de cobro. | Informativo | En la lista |
| MSG-137 | El pedido N.º [n] no puede cobrarse: ya fue pagado o anulado. | Error | Aviso |
| MSG-138 | El pedido N.º [n] aún no está listo ([estado]). ¿Desea cobrarlo de todos modos? | Confirmación | Diálogo |
| MSG-139 | El total del pedido cambió a S/ [x]. Revise el detalle antes de cobrar. | Aviso | Paso 1 del cobro |
| MSG-140 | Seleccione el método de pago. | Error | Sobre el selector |
| MSG-141 | Ingrese el monto recibido. | Error | Bajo el campo Monto |
| MSG-142 | Ingrese un monto válido, con hasta 2 decimales (ejemplo: 20.00). | Error | Bajo el campo Monto |
| MSG-143 | El monto recibido es menor al total. Falta S/ [x]. | Error | Bajo el campo Monto |
| MSG-144 | Confirme que recibió el pago por Yape. | Error | Sobre la casilla |
| MSG-146 | Cobro registrado. Comprobante [serie-número] por S/ [x]. | Éxito | Paso 3 del cobro |
| MSG-147 | No se pudo registrar el cobro. El pedido sigue pendiente de cobro; intente nuevamente. | Error | Sobre el botón CONFIRMAR PAGO |
| MSG-148 | No se pudo generar la vista del comprobante. La venta está registrada; regenérelo desde Ventas. | Error | Paso 3 del cobro |
| MSG-149 | No se encontró una impresora disponible. Descargue el comprobante. | Aviso | Paso 3 del cobro |
| MSG-150 | ¿Cancelar el cobro? El pedido seguirá pendiente de cobro. | Confirmación | Diálogo |
| MSG-151 | La referencia de Yape no puede superar los 20 caracteres. | Error | Bajo el campo Referencia |
| MSG-152 | El monto recibido no puede superar S/ 9,999.99. | Error | Bajo el campo Monto |
| MSG-226 | El DNI debe tener exactamente 8 dígitos numéricos. | Error | Bajo el campo DNI |
| MSG-227 | El RUC debe tener 11 dígitos numéricos y comenzar con 10 o 20. | Error | Bajo el campo RUC |
| MSG-228 | Documento no encontrado en el padrón oficial. Puede ingresar la razón social manualmente. | Advertencia | Bajo el botón Consultar |
| MSG-229 | Por normativa tributaria (SUNAT), ventas iguales o superiores a S/ 700.00 requieren DNI o RUC. | Advertencia | Bajo el selector de comprobante |
| MSG-230 | Servicio de consulta de identidad no disponible en este momento. Verifique la conexión o ingrese los datos manualmente. | Aviso | Sobre el botón Consultar |


## 10. Diccionario de datos


<!-- tabla 19 -->
| Campo | Tipo | Obligatorio | Longitud / formato | Notas |
|---|---|---|---|---|
| Pedido a cobrar | Selección | Sí | Pendiente de cobro | Número, tipo, mesa o referencia, hora, estado y total |
| Total | Decimal (8,2) | Automático | S/ 0.00 | Calculado por el servidor; no editable |
| Método de pago | Lista | Sí | Efectivo / Yape | Uno por pedido |
| Monto recibido | Decimal (8,2) | Sí si es efectivo | ≥ total y ≤ 9,999.99; 2 decimales | Punto o coma |
| Vuelto | Decimal (8,2) | Calculado | Monto recibido − total | Se muestra antes de confirmar |
| Confirmación de Yape | Casilla | Sí si es Yape | Marcada / sin marcar | — |
| Referencia de Yape | Texto | No | 0–20 alfanuméricos | Para conciliar con la caja |
| Venta | Registro | Automático | Una por pedido cobrado | Incluye cajero, fecha y hora |
| Tipo de comprobante | Lista | Sí | Ticket / Boleta simple / Boleta con DNI / Factura | Boleta simple bloqueada si el total es ≥ S/ 700.00 |
| DNI del cliente | Texto numérico | Sí si es Boleta con DNI | 8 dígitos | Consulta automática del nombre |
| RUC del cliente | Texto numérico | Sí si es Factura | 11 dígitos; empieza con 10 o 20 | Autocompleta razón social y dirección fiscal |
| Nombre o razón social y dirección fiscal | Texto | Automático | — | Resultado de la consulta; ingreso manual si no se encuentra (MSG-228) |
| Comprobante | Registro | Automático | Serie T001, B001 o F001 + correlativo de 6 dígitos | Continuo y único por serie |
| Identificador de solicitud | Texto único | Automático | — | Evita cobros duplicados |


## 11. Contrato de API

Todos los endpoints exigen token JWT (401 sin token válido) y validan el rol Cajero y el estado de la caja en el servidor (403 si no corresponde). La liberación de la mesa no tiene endpoint propio: ocurre dentro de la operación de cobro.

<!-- tabla 20 -->
| Endpoint | Entrada | Respuestas |
|---|---|---|
| GET /api/cobros/pendientes | — | 200: [{ pedidoId, numero, tipo, mesa, referencia, hora, estado, total }] pendientes de cobro. 409: caja cerrada (caja_cerrada). Rol: Cajero. |
| GET /api/pedidos/{id} | — | 200: detalle del pedido con líneas y total (definido en CUS06 y CUS08). 404: no existe. |
| POST /api/cobros | { solicitudId, pedidoId, totalMostrado, metodo (efectivo \| yape), montoRecibido?, yapeConfirmado?, yapeReferencia? } | 201: { ventaId, comprobante{ serie, numero, fechaHora }, vuelto }. 400: método o monto inválido, monto_insuficiente. 404: no existe. 409: caja_cerrada, pedido_no_cobrable (pagado o anulado) o total_cambio (con totalActual). 403: rol no permitido. Idempotente por solicitudId. Rol: Cajero. |
| GET /api/comprobantes/{ventaId} | — | 200: datos del comprobante para la vista previa. 404: no existe. Roles: Cajero y Administrador. |
| GET /api/comprobantes/{ventaId}/pdf | copia=true\|false | 200: PDF del comprobante (con marca COPIA si copia=true). 404: no existe. Roles: Cajero y Administrador. |


## 12. Escenarios de validación y criterios de aceptación


<!-- tabla 21 -->
| ID | Entrada / acción | Resultado esperado | Reglas | HU |
|---|---|---|---|---|
| E-245 | El cajero entra a COBRAR | Lista de pedidos por cobrar (mesa y para llevar) con total y estado. | RN-85 | HU25 |
| E-246 | No hay pedidos por cobrar | MSG-136. | — | HU25 |
| E-247 | Cobrar desde una mesa ocupada, desde COBRAR AHORA o desde la lista de pedidos | Se abre el cobro de ese pedido en el paso 1. | RN-84 | HU25 |
| E-248 | Pedido de 2 almuerzos completos (S/ 8.00) y 1 desayuno completo (S/ 7.00) | El detalle muestra las líneas y el total S/ 23.00 calculado por el servidor. | RV-96, RN-87 | HU25 |
| E-249 | La caja del día está cerrada | MSG-135 con ABRIR CAJA; no se puede cobrar. | RV-95, RN-84 | HU25 |
| E-250 | Cobrar un pedido ya pagado o anulado | MSG-137. | RV-95, RN-85 | HU25 |
| E-251 | Cobrar un pedido que aún no está listo | MSG-138; al confirmar continúa, al cancelar vuelve a la lista. | RV-97 | HU25 |
| E-252 | El mozo agrega productos mientras el cajero cobra | Al confirmar el pago, MSG-139 con el total nuevo y no se registra el cobro. | RV-101, RN-90 | HU25 |
| E-253 | Confirmar sin elegir método de pago | MSG-140. | RV-98 | HU25 |
| E-254 | Efectivo con el botón "Exacto" | Monto igual al total y vuelto S/ 0.00. | RV-99, RV-104 | HU25 |
| E-255 | Efectivo: S/ 50 recibidos con total S/ 23.00 | Vuelto S/ 27.00 mostrado en grande antes de confirmar. | RV-99, RNF-37 | HU25 |
| E-256 | Efectivo con monto menor al total | MSG-143; no se confirma. | RV-99 | HU25 |
| E-257 | Monto vacío, "abc", 3 decimales o mayor a 9,999.99 | MSG-141, MSG-142 o MSG-152. | RV-99 | HU25 |
| E-258 | Monto escrito con coma ("23,50") | Se normaliza a 23.50. | RV-99 | HU25 |
| E-259 | Yape sin marcar la confirmación; luego con confirmación y referencia | MSG-144; con confirmación, se registra el pago. | RV-100 | HU25 |
| E-260 | Referencia de Yape de más de 20 caracteres | MSG-151. | RV-100 | HU25 |
| E-261 | Confirmar el pago | MSG-146; pedido "Pagado"; venta con número; mesa libre si era de mesa; se muestra el comprobante. | RN-88, RN-89 | HU25 |
| E-262 | Confirmar el pago de un pedido para llevar | Se registra la venta; ninguna mesa cambia. | RN-89 | HU25 |
| E-263 | Doble clic en CONFIRMAR PAGO | Se registra una sola venta. | RV-102, RNF-40 | HU25 |
| E-264 | Falla al registrar el cobro | MSG-147; el pedido sigue pendiente de cobro y no se registra nada. | RN-88 | HU25 |
| E-265 | Se pierde la conexión al confirmar | MSG-147; lo ingresado se conserva; al reintentar no se duplica. | RNF-40 | HU25 |
| E-266 | Revisar la vista previa del comprobante | Muestra número T001 correlativo, fecha y hora, pedido, mesa o "Para llevar", cajero, líneas, total, método, recibido y vuelto, y "Documento sin validez tributaria". | RV-105, RN-91, RN-92 | HU26 |
| E-267 | Pulsar IMPRIMIR con y sin impresora | Abre la impresión con formato de 80 mm; sin impresora, MSG-149 y se ofrece DESCARGAR. | RNF-38 | HU26 |
| E-268 | Pulsar DESCARGAR | Se descarga un PDF idéntico a la vista previa. | RNF-38 | HU26 |
| E-269 | Cerrar la vista previa sin imprimir | El comprobante queda guardado y se puede reimprimir con "COPIA" desde ventas. | RN-91 | HU26 |
| E-270 | Falla al generar la vista del comprobante | MSG-148; la venta y su número se conservan. | RN-88 | HU26 |
| E-271 | Emitir dos comprobantes seguidos | Los números son consecutivos, sin saltos ni duplicados. | RN-91 | HU26 |
| E-272 | Cancelar el cobro con datos ingresados | MSG-150; el pedido sigue pendiente de cobro. | RV-106 | HU25 |
| E-273 | Volver del paso 2 al paso 1 | Se conserva lo ingresado y el total sigue visible. | RV-103 | HU25 |
| E-274 | Un mozo, el cocinero o el administrador intenta cobrar por URL o servicio | 403 y MSG-39; la opción no aparece en su menú. | RN-84 | HU25 |
| E-275 | Intentar modificar o anular un pedido ya pagado (CUS08.2) | No se permite; la corrección se hace anulando la venta. | RN-93 | HU25 |
| E-276 | La mesa tiene otro pedido pendiente de cobro | Se paga uno y la mesa sigue Ocupada. | RN-89 | HU25 |
| E-277 | Solo teclado | Tab recorre botones y campos; los números se escriben con el teclado; Enter confirma; Esc cancela. | RNF-39 | HU25 y HU26 |
| E-278 | La administradora cambia un precio después de registrado el pedido | El total del pedido no cambia. | RN-87, RN-51 | HU25 |
| E-399 | Imprimir el comprobante | La línea muestra el menú con su precio y las opciones como detalle sin precio. | RF-26 | HU26 |


## 13. Matriz de justificación de usabilidad


<!-- tabla 22 -->
| Principio aplicado | Elemento de la interfaz | Decisión adoptada | Justificación |
|---|---|---|---|
| ISO 9241 – Eficacia | Total del servidor y vuelto automático | El cajero no suma ni calcula el vuelto; el servidor revalida el total antes de registrar | Elimina los errores de suma que motivan el sistema |
| ISO 9241 – Eficiencia | Botones rápidos y flujo de tres pasos | Un cobro en efectivo exacto se hace con COBRAR, EXACTO, CONFIRMAR PAGO e IMPRIMIR (cuatro toques) | Menos tiempo con la cola esperando |
| ISO 9241 – Satisfacción | Vuelto grande y confirmación clara | El vuelto se ve de lejos; el comprobante cierra el proceso | El cajero actúa con seguridad |
| Nielsen 1 – Visibilidad del estado | Progreso, total fijo y "Registrando pago…" | "Paso 1 de 3", total siempre visible e indicadores de proceso | Siempre sabe en qué paso está y cuánto cobra |
| Nielsen 2 – Mundo real | Textos y botones | EFECTIVO, YAPE, "Exacto", "Vuelto", "Comprobante" | Mismo lenguaje de la caja |
| Nielsen 3 – Control y libertad | Volver y cancelar | Regresar del paso 2 al 1 sin perder datos; cancelar con confirmación | Corrige sin penalización |
| Nielsen 4 – Consistencia | Botones, avisos y diálogos | Mismos componentes y colores que el resto del sistema | Evita reaprendizaje |
| Nielsen 5 – Prevención de errores | Validación del monto y estado del pedido | No confirma un monto menor al total; bloquea pedidos pagados o anulados; avisa si el total cambió | Evita cobros equivocados |
| Nielsen 6 – Reconocimiento | Detalle del pedido | Líneas con cantidad, precio e importe antes de cobrar | No obliga a recordar lo pedido |
| Nielsen 7 – Flexibilidad y eficiencia | Cuatro puntos de entrada | Se cobra desde la lista, la mesa, COBRAR AHORA o la lista de pedidos | Se adapta a cada forma de trabajar |
| Nielsen 8 – Minimalismo | Pantalla de pago | Solo método, monto, vuelto y confirmación | Sin distracciones |
| Nielsen 9 – Recuperarse de errores | Mensajes MSG-139, 143 y 147 | Indican cuánto falta o qué cambió y conservan lo ingresado | Facilita corregir |
| Shneiderman 1 – Consistencia | Estilo y acciones | Misma paleta, botones y mensajes del sistema | Comportamiento predecible |
| Shneiderman 2 – Usabilidad universal | Teclado numérico, contraste y tamaño | Teclado numérico en montos, controles de 44 px, contraste 4.5:1, navegación por teclado | Atiende distintos dispositivos y niveles |
| Shneiderman 3 – Retroalimentación | Vuelto en vivo y avisos | El vuelto se actualiza al escribir; MSG-146 confirma el cobro | Sabe qué pasó |
| Shneiderman 4 – Cierre | Comprobante | El flujo termina con el comprobante y NUEVO COBRO | Indica que la tarea concluyó |
| Shneiderman 5 – Prevenir errores | Validaciones y botón único | No registra montos inválidos ni dobles cobros | Evita datos erróneos y duplicados |
| Shneiderman 6 – Reversión | Volver y cancelar | Pasos reversibles hasta confirmar el pago; luego, anular la venta (CUS11.2) | Acciones reversibles mientras es posible |
| Shneiderman 7 – Control del usuario | Todo el flujo | Cada paso lo inicia el cajero; el cobro no se registra solo | Mantiene el control |
| Shneiderman 8 – Memoria a corto plazo | Total fijo y detalle | Total y datos visibles en cada paso | No debe recordar la cuenta |


## 14. Matriz de trazabilidad


### 14.1 Requerimiento → historia → caso de uso → vista → prueba


<!-- tabla 23 -->
| RF | HU | CUS | Vista | Reglas / mensajes | API | Escenarios |
|---|---|---|---|---|---|---|
| RF-25 Cobrar un pedido, registrando el método de pago y el vuelto (y liberar la mesa) | HU25 (M) | CUS10.1 | 10.1 y 10.2 | RV-95 a 104, 105-A a 105-D, 106; RN-84 a 95, 95-B; RNF-36 a 40; MSG-135 a 144, 146, 147, 150 a 152, 226 a 230 | GET /api/cobros/pendientes y POST /api/cobros | E-245 a E-265, E-272 a E-278 |
| RF-26 Emitir el comprobante de pago | HU26 (M) | CUS10.2 | 10.3 | RV-105, 105-A a 105-D; RN-91, 92, 95-B; RNF-38; MSG-146, 148, 149 | GET /api/comprobantes/{id} y /pdf | E-266 a E-271, E-277, E-399 |


### 14.2 Regla → elemento de interfaz → escenario


<!-- tabla 24 -->
| Regla | Elemento de interfaz | Escenario |
|---|---|---|
| RV-95 / RN-84 | Botón COBRAR, MSG-135 y botón ABRIR CAJA | E-249, E-250, E-274 |
| RV-96 / RN-87 | Detalle del pedido con total grande | E-248, E-278 |
| RV-97 | Diálogo MSG-138 | E-251 |
| RV-98 | Botones EFECTIVO y YAPE | E-253 |
| RV-99 / RNF-37 | Campo Monto recibido y Vuelto grande | E-255 a E-258 |
| RV-100 | Casilla de confirmación y campo Referencia de Yape | E-259, E-260 |
| RV-101 / RN-90 | Aviso MSG-139 en el paso 1 | E-252 |
| RV-102 / RNF-40 | Botón "Registrando pago…" e identificador de solicitud | E-263, E-265 |
| RV-103 | Encabezado "Paso n de 3" y botón Volver | E-273 |
| RV-104 | Botones rápidos de efectivo | E-254 |
| RV-105 / RN-91 / RN-92 | Vista previa del comprobante con la leyenda y el correlativo | E-266, E-271 |
| RN-88 / RN-89 | Operación única de cobro con liberación de mesa | E-261, E-262, E-264, E-276 |
| RNF-38 | Botones IMPRIMIR y DESCARGAR | E-267, E-268 |


## 15. Evaluación del prototipo y mejoras incorporadas

Aún no hay prototipo del cobro; las decisiones siguientes aplican lo aprendido en los CUS anteriores.

<!-- tabla 25 -->
| Riesgo previsto | Principio | Decisión de diseño incorporada |
|---|---|---|
| Error de suma o de vuelto bajo presión | Nielsen 5; Shneiderman 5 | Total del servidor, vuelto automático y grande, y validación del monto |
| Cola de clientes esperando | Nielsen 7; Shneiderman 2 | Botones rápidos de efectivo, tres pasos claros y cobro exacto en cuatro toques |
| Cobrar el pedido equivocado | Nielsen 5 y 6 | Detalle con líneas y total antes de continuar, y filtro de pedidos ya pagados o anulados |
| Que el total cambie sin darse cuenta | Nielsen 1 y 9 | Revalidación en el servidor y aviso MSG-139 con el total nuevo |
| Doble clic al confirmar el pago | Nielsen 5; Shneiderman 5 | Botón "Registrando pago…" e identificador único de solicitud |
| No saber en qué paso está | Nielsen 1; Shneiderman 4 | Encabezado "Paso n de 3" y total siempre visible |
| Estilo distinto al resto del sistema | Shneiderman 1; Nielsen 4 | Reutilizar paleta, botones, diálogos y avisos de los CUS anteriores |


## 16. Dependencias con otros casos de uso


<!-- tabla 26 -->
| CUS relacionado | Relación con el CUS10 |
|---|---|
| CUS05 Mesas | COBRAR desde una mesa ocupada; al pagar, la mesa queda libre (RN-89). |
| CUS06 y CUS07 Pedidos | Origen de los pedidos y sus totales; COBRAR AHORA abre el cobro; las ampliaciones durante un cobro cambian el total (RN-90). |
| CUS08 Gestión de pedidos | COBRAR desde la lista; un pedido pagado no se modifica ni se anula (RN-93) y su estado debe mostrar también el avance de preparación. |
| CUS09 Cocina | No se puede deshacer una comanda lista si el pedido ya está pagado (RN-79). |
| CUS11 Ventas | Cada cobro crea una venta; el listado permite reimprimir con "COPIA" (CUS11.1) y anular una venta con motivo (CUS11.2). |
| CUS12 Caja | El cobro exige la caja abierta (CUS12.1); la caja suma el total cobrado por medio de pago (RN-94) para el cuadre. |
| CUS13 Reportes | Ventas por día, medio de pago y producto salen de las ventas registradas aquí. |


<!-- tabla 27 -->
| N.º | Punto | Decisión adoptada o tarea |
|---|---|---|
| 1 | Decisión: solo el Cajero cobra, abre y cierra la caja; el Administrador no cobra. Si la dueña atiende caja, usa un usuario con rol Cajero. | Reflejarlo en la gestión de usuarios (CUS02.2) y en el panel que ve cada rol (CUS14). |
| 2 | Un pedido para llevar pagado al pedir sigue en cocina, pero CUS08 (RN-64) hace que "Pagado" fije el estado y se pierda el avance de preparación. | Decisión: el pedido pagado muestra "Pagado" junto con su estado de preparación; RN-64 se ajusta en consecuencia. |
| 3 | No están en los RF el pago mixto (parte efectivo y parte Yape), los descuentos ni las propinas. | Decisión: fuera de alcance en esta versión: un solo método de pago por venta, sin descuentos ni propinas (RN-87). |
| 4 | La referencia de Yape, los botones rápidos de efectivo y el rechazo por total cambiado amplían RF-25. | Decisión: se aceptan las ampliaciones (referencia de Yape, botones rápidos de efectivo y rechazo por total cambiado). |
| 5 | Datos del local en el ticket y los comprobantes. | Decisión: el nombre, RUC, dirección y teléfono del local son parámetros de configuración que se cargan al instalar. El ticket no tiene validez tributaria y no desglosa IGV; la boleta y la factura sí lo desglosan (RN-92). La emisión electrónica ante SUNAT queda fuera del alcance de esta versión. |
| 6 | IMPRIMIR usa la impresión del navegador y no la impresora térmica directamente. | Decisión: IMPRIMIR usa la impresión del navegador (80 mm) y, si no hay impresora térmica, se usa DESCARGAR PDF. |
| 7 | El cobro depende de abrir la caja (CUS12.1). | Resuelto: CUS12.1 está en la iteración 1/3. |
| 8 | El formato del comprobante (serie T001 y 6 dígitos) es una propuesta. | Decisión: se adopta el formato propuesto (series T001, B001 y F001 con 6 dígitos). |
| 9 | Aún no existen bocetos de las Vistas 10.1 a 10.3. | Diseñarlas en Figma con los estados de la sección 7 y el ticket de 80 mm. |


# CUS11: Gestión de ventas


## 1. Ficha del CUS general


<!-- tabla 28 -->
| Campo | Detalle |
|---|---|
| CUS general | CUS11: Gestión de ventas |
| Interfaz (GUI) | Interfaz 11: Ventas |
| Actor(es) | Administrador y Cajero |
| HU / RF de origen | HU27 y HU28 / RF-27 y RF-28 |
| Descripción | Una sola pantalla con dos casos de uso: la lista con búsqueda y detalle de ventas (CUS11.1, Vistas 11.1 y 11.2) y la anulación de una venta (CUS11.2, Vista 11.3, un diálogo sobre el detalle). Cada cobro crea una venta; aquí se revisan, se reimprimen sus comprobantes y, solo el Administrador, se anulan. |
| Alcance | Los comprobantes no se eliminan ni se editan: solo cambian de estado. |


<!-- tabla 29 -->
| CUS | Título | Actor | HU | RF | Prioridad | Iteración | Complejidad |
|---|---|---|---|---|---|---|---|
| CUS11.1 | Listar y buscar ventas | Administrador y Cajero | HU28 | RF-28 | Alta (Must) | 1/3 | Baja |
| CUS11.2 | Anular venta | Administrador | HU27 | RF-27 | Alta (Must) | 1/3 | Media |

Criterio: la prioridad se obtiene de la validación MoSCoW de la HU (Must = Alta, Should = Media, Could = Baja) y la iteración sigue la prioridad (Alta = 1/3, Media = 2/3, Baja = 3/3).

## 2. Decisiones adoptadas


<!-- tabla 30 -->
| Tema | Decisión | Vacío que cubre |
|---|---|---|
| Quién usa la pantalla | El Administrador y el Cajero listan y buscan ventas y reimprimen comprobantes; solo el Administrador anula ventas. | RF-27 y RF-28 |
| Lista de ventas | Ventas de hoy por defecto, las más recientes primero, de 20 en 20, con comprobante (T001-000123), fecha y hora, pedido N.º, mesa o "Para llevar", total, método de pago, cajero y estado (Vigente o Anulada). | RF-28 |
| Búsqueda | Por número de comprobante completo ("T001-000123") o solo el correlativo ("123"), y por una fecha o un rango de fechas (máximo 31 días, sin fechas futuras). | CUS11.1 |
| Filtro por tipo de comprobante | Se incorpora un filtro desplegable para listar ventas según comprobante: Todos, Tickets (T001), Boletas (B001) y Facturas (F001). | RF-27 / Usabilidad |
| Búsqueda por documento del cliente | Se permite buscar ventas tanto por número correlativo como por el DNI o RUC del cliente receptor. | RF-27 |
| Límite del Cajero | El Cajero consulta hasta 7 días atrás; el Administrador, cualquier fecha. | Faltaba la regla |
| Resumen del filtro | Encima de la lista: cantidad y total de ventas vigentes, total en efectivo y total por Yape, y cuántas anuladas. Las anuladas no suman. | Ayuda al control y al cuadre; no está en el RF |
| Detalle de la venta | Comprobante, fecha y hora, pedido, líneas, total, método, monto recibido y vuelto, referencia de Yape, cajero y estado; si está anulada, motivo, quién la anuló y cuándo. | CUS11.1 |
| Reimprimir | Desde el detalle, con la marca "COPIA" (o "ANULADO" si la venta está anulada); la reimpresión queda registrada con usuario, fecha y hora. También permite regenerar un comprobante que falló al emitirse (CUS10.2). | CUS10.2 |
| Reimpresión tributaria | La reimpresión muestra el comprobante idéntico al original, con la leyenda destacada "COPIA" para evitar doble crédito fiscal o confusión. | RF-29 |
| Anular venta | Solo el Administrador, solo ventas vigentes y sin posibilidad de deshacer. Exige un motivo de 5 a 100 caracteres (con motivos rápidos) y una confirmación que nombra el comprobante y el monto. | CUS11.2 |
| Qué pasa con el pedido | Al anular, el Administrador elige: "Dejar el pedido por cobrar" (por defecto, para cobrarlo de nuevo con otro método o monto y otro comprobante) o "Anular también el pedido". | CUS11.2 no lo definía |
| Qué pasa con el comprobante | Se marca como anulado; su número se conserva y no se reutiliza. Un nuevo cobro genera un número nuevo. | CUS11.2 |
| Caja cerrada | Si la venta pertenece a una caja ya cerrada, se anula igualmente, el cierre original no cambia y se deja constancia del ajuste en los reportes. | CUS11.2 |
| Actualización | Sin refresco automático: botón ACTUALIZAR y recarga al aplicar filtros. | Poco volumen y sin urgencia |
| Auditoría | Se registran las anulaciones (motivo y destino del pedido) y las reimpresiones. Las ventas y comprobantes nunca se eliminan ni se editan. | Control de la dueña |


## 3. Análisis del usuario (Diseño Centrado en el Usuario)


<!-- tabla 31 -->
| Aspecto | Descripción |
|---|---|
| Quién usa la interfaz | La administradora (dueña), que revisa lo vendido y corrige errores, y el cajero, que ubica comprobantes cuando un cliente los pide. |
| Necesidades | Ver rápido cuánto se vendió y por qué medio; encontrar un comprobante por su número o por fecha; reimprimir una copia; corregir un cobro equivocado sin perder el rastro de lo ocurrido. |
| Dificultades previsibles | Anular la venta equivocada; no saber qué pasó con el pedido ni con el dinero; olvidar el motivo; buscar un comprobante sin recordar el formato del número; confundir una copia con el original. |
| Contexto de uso | Consultas ocasionales, a veces con un cliente esperando (reimpresión) y a veces al final del día (revisión de la dueña). |


## 4. Plantillas de casos de uso


### CUS11.1: Listar y buscar ventas


<!-- tabla 32 -->
| Código: CUS11.1 | Título: Listar y buscar ventas (Vistas 11.1 y 11.2) | Fecha: 21.10.2026 | Iteración: 1/3 |
|---|---|---|---|
| Actor(es): Administrador y Cajero |  |  |  |
| Prioridad: Alta (Must) | Complejidad: Baja |  |  |
| Historia de usuario: HU28 Listar y buscar ventas (M) |  |  |  |
| Requerimiento de origen: RF-28 |  |  |  |
| Descripción: Permite visualizar las ventas registradas y buscarlas por fecha, número de comprobante, tipo de comprobante o DNI/RUC del cliente para revisar lo vendido y ubicar un comprobante cuando el cliente lo necesite. El detalle de la venta muestra cada menú completo con su precio y sus opciones elegidas como texto sin precio. |  |  |  |
| Precondición: El usuario tiene sesión iniciada con rol Administrador o Cajero. |  |  |  |
| Flujo principal:<br>1. El usuario accede a la opción VENTAS; el sistema muestra "Cargando ventas…".<br>2. El sistema consulta las ventas de hoy.<br>3. Muestra la lista (más recientes primero) con las columnas Hora, Comprobante (con insignia distintiva: Ticket, Boleta o Factura), Cliente / Documento, Pedido, Mesa o Para llevar, Método de pago, Total y Estado, junto con el resumen del filtro.<br>4. Opcionalmente busca por número de comprobante o por el DNI/RUC del cliente, filtra por tipo de comprobante (Todos, Ticket, Boleta o Factura) o por una fecha o un rango de fechas.<br>5. El sistema valida el criterio (RV-108, RV-108-B, RV-109) y actualiza la lista y el resumen.<br>6. Opcionalmente selecciona una venta; el sistema muestra su detalle (con los datos del receptor y el desglose de IGV si es Factura o Boleta con DNI, RV-118-B) y las acciones REIMPRIMIR y DESCARGAR.<br>7. Reimpresión: el usuario selecciona la acción REIMPRIMIR sobre la venta.<br>8. El sistema abre la vista previa del comprobante original con la marca "COPIA", preservando exactamente la serie (T001, B001 o F001), el número, el desglose de IGV y los datos del cliente; si la venta está anulada, el documento lleva la marca de agua "ANULADO - SIN EFECTO TRIBUTARIO" (RN-97-B).<br>9. Se registra en auditoría el usuario, la fecha y la hora de la reimpresión. |  |  |  |
| Flujo alterno:<br>Sin ventas hoy: MSG-154. Sin coincidencias: MSG-153 y "Quitar filtros".<br>Número o documento con formato inválido: MSG-156. Rango incorrecto: MSG-157 o MSG-158.<br>El Cajero pide una fecha de más de 7 días atrás: MSG-159.<br>Si el usuario es Cajero, el detalle solo ofrece REIMPRIMIR y DESCARGAR; ANULAR VENTA se muestra únicamente al Administrador.<br>Reimprimir: el comprobante sale con la marca "COPIA" (o "ANULADO") y la reimpresión se registra; sin impresora, MSG-149 y se ofrece DESCARGAR.<br>Regenerar: si el comprobante falló al emitirse en el cobro (CUS10.2), el usuario lo regenera desde el detalle.<br>Un usuario sin rol Administrador ni Cajero entra por URL o servicio: MSG-39 (403). |  |  |  |
| Postcondición: La lista de ventas queda visible y el comprobante puede reimprimirse. |  |  |  |
| Excepciones:<br>Falla al obtener los datos: MSG-155 con Reintentar; se registra el incidente.<br>Falla al generar el comprobante: MSG-148; la venta no se altera.<br>Pérdida de conexión: MSG-09. |  |  |  |
| Reglas y mensajes aplicables: RV-107 a RV-112, RV-108-B, RV-117, RV-118, RV-118-B; RN-96, RN-97, RN-97-B, RN-100, RN-104; RNF-41 a RNF-44; MSG-153 a 159, 148, 149, 155, 09, 39. |  |  |  |


### CUS11.2: Anular venta


<!-- tabla 33 -->
| Código: CUS11.2 | Título: Anular venta (Vista 11.3) | Fecha: 21.10.2026 | Iteración: 1/3 |
|---|---|---|---|
| Actor(es): Administrador |  |  |  |
| Prioridad: Alta (Must) | Complejidad: Media |  |  |
| Historia de usuario: HU27 Anular una venta (M) |  |  |  |
| Requerimiento de origen: RF-27 |  |  |  |
| Descripción: Permite al administrador anular una venta registrada por error, indicando el motivo y decidiendo qué hacer con el pedido, manteniendo el control de lo ocurrido. |  |  |  |
| Precondición: El administrador tiene sesión iniciada y la venta existe y está vigente. |  |  |  |
| Flujo principal:<br>1. El administrador abre el detalle de una venta vigente (CUS11.1).<br>2. Pulsa ANULAR VENTA; el sistema abre el diálogo con los motivos rápidos, el campo Motivo y las opciones sobre el pedido.<br>3. Elige un motivo rápido o escribe uno (5 a 100 caracteres) y elige "Dejar el pedido por cobrar" (por defecto) o "Anular también el pedido".<br>4. Pulsa ANULAR VENTA; el sistema muestra la confirmación MSG-161, que nombra el comprobante y el monto, con el foco en CANCELAR.<br>5. El administrador confirma; el sistema deshabilita el botón.<br>6. El servidor, en una sola operación, marca la venta y su comprobante como "Anulada", la excluye de los totales y registra usuario, fecha, hora, motivo y destino del pedido.<br>7. Según lo elegido, el pedido vuelve a "pendiente de cobro" o queda "Anulado" (y, si era el único pedido abierto de su mesa, la mesa queda libre).<br>8. El sistema muestra MSG-162 y la venta como "Anulada" en la lista. |  |  |  |
| Flujo alterno:<br>Motivo vacío o de menos de 5 caracteres: MSG-160.<br>La venta ya fue anulada: MSG-163.<br>La venta pertenece a una caja ya cerrada: el diálogo muestra MSG-165; la venta se anula, el cierre original queda sin cambios y el ajuste queda registrado para los reportes.<br>La caja del día sigue abierta: la venta deja de sumar en el cuadre de caja.<br>El pedido vuelve a "pendiente de cobro" y su mesa tiene otros pedidos: la mesa queda Ocupada hasta que ninguno quede sin cobrar o anular (RN-103, RN-147).<br>Doble clic en ANULAR VENTA: se registra una sola anulación.<br>Cancelar (botón o Esc): la venta sigue vigente.<br>Un usuario sin rol Administrador intenta anular por URL o servicio: MSG-39 (403). |  |  |  |
| Postcondición: La venta queda anulada con su motivo registrado y deja de sumar en los totales, el cierre de caja y los reportes; el pedido queda por cobrar o anulado según lo elegido. |  |  |  |
| Excepciones:<br>Falla al anular: MSG-164; la venta se mantiene vigente, no se cambia el pedido y se registra el incidente.<br>Pérdida de conexión: MSG-09 y MSG-164; al reintentar no se duplica la anulación. |  |  |  |
| Reglas y mensajes aplicables: RV-112 a RV-116; RN-98 a RN-103, RN-105; RNF-43, RNF-44; MSG-160 a 165, 09, 39. |  |  |  |


## 5. Interfaz (GUI)


<!-- tabla 34 -->
| Interfaz | RF | HU | CUS | Qué se hace dentro de la interfaz |
|---|---|---|---|---|
| 11. Ventas | RF-27 y RF-28 | HU27 y HU28 | CUS11 (11.1 y 11.2) | Listar y buscar ventas, ver el detalle, reimprimir comprobantes y anular una venta (solo el Administrador). |


### Vista 11.1: Lista de ventas, pantalla base (CUS11.1) — restaurante.app/ventas


<!-- tabla 35 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 36 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Menú "Ventas" | Visible para Administrador y Cajero. |
| 2 | Resumen del filtro | Cantidad y total de ventas vigentes, total en efectivo y por Yape y cuántas anuladas. |
| 3 | Búsqueda y filtros | Por número de comprobante o correlativo, DNI o RUC del cliente, tipo de comprobante y fecha o rango (el Cajero hasta 7 días atrás). |
| 4 | Tabla de ventas | Hora, comprobante con insignia (Ticket, Boleta o Factura), cliente o documento, pedido, mesa o "Para llevar", método de pago, total y estado (Vigente o Anulada); en móvil, tarjetas. |
| 5 | Botón ACTUALIZAR | Recarga la lista; no hay refresco automático. |


### Vista 11.2: Detalle de la venta (CUS11.1) — restaurante.app/ventas/{id}


<!-- tabla 37 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 38 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Datos de la venta | Comprobante, fecha y hora, pedido, líneas (los menús completos con sus opciones sin precio), total, método, monto recibido y vuelto, referencia de Yape, cajero y estado. |
| 2 | Datos del receptor | En Factura o Boleta con DNI: DNI o RUC, razón social, dirección y desglose de IGV (RV-118-B). |
| 3 | Botones REIMPRIMIR y DESCARGAR | Comprobante con la marca "COPIA" (o "ANULADO"); la reimpresión queda registrada. |
| 4 | Botón ANULAR VENTA | Solo para el Administrador y solo en ventas vigentes. |


### Vista 11.3: Anular venta (CUS11.2) — restaurante.app/ventas/{id}/anular


<!-- tabla 39 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 40 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Motivos rápidos | Rellenan el campo Motivo. |
| 2 | Campo Motivo | De 5 a 100 caracteres; muestra MSG-160. |
| 3 | Destino del pedido | "Dejar el pedido por cobrar" (por defecto) o "Anular también el pedido". |
| 4 | Diálogo de confirmación | MSG-161 con el comprobante y el monto; foco inicial en CANCELAR. |
| 5 | Botón ANULAR VENTA | "Anulando…" mientras procesa; MSG-164 si falla. |


## 6. Estados de la interfaz


<!-- tabla 41 -->
| Estado | Comportamiento visual |
|---|---|
| Cargando | "Cargando ventas…" con marcadores de posición. |
| Lista con ventas | Filas con comprobante, fecha y hora, total, método y estado; resumen del filtro encima; paginación de 20 en 20; botón ACTUALIZAR. |
| Venta anulada | Fila atenuada con el texto "Anulada"; el resumen no la suma. |
| Sin ventas hoy | MSG-154. |
| Sin resultados | MSG-153 y botón "Quitar filtros". |
| Filtro inválido | MSG-156, 157, 158 o 159 bajo el campo; la lista no cambia. |
| Error de carga | MSG-155 con Reintentar. |
| Detalle | Panel o ventana con todos los datos de la venta y los botones REIMPRIMIR, DESCARGAR y, solo para el Administrador en ventas vigentes, ANULAR VENTA. |
| Anulando (diálogo) | Campo Motivo con motivos rápidos, opciones sobre el pedido, aviso MSG-165 si la caja está cerrada y botones CANCELAR y ANULAR VENTA con el foco en CANCELAR. |
| Guardando | Botón "Anulando…" deshabilitado (RV-116). |
| Éxito | Aviso MSG-162 y fila actualizada como "Anulada". |
| Reimprimiendo | Vista previa del comprobante con la marca "COPIA" o "ANULADO"; sin impresora, MSG-149 y DESCARGAR. |
| Móvil | Cada venta como tarjeta de una columna; controles de al menos 44 px. |


## 7. Reglas de validación (RV)


<!-- tabla 42 -->
| Código | Regla | Elemento UI | Mensaje |
|---|---|---|---|
| RV-107 | Por defecto la lista muestra las ventas de hoy, las más recientes primero, de 20 en 20. | Lista de ventas | MSG-154 |
| RV-108 | La búsqueda por número acepta el número completo ("T001-000123") o solo el correlativo ("123" o "000123"); se recortan los espacios y admite hasta 15 caracteres. | Campo Buscar | MSG-153, 156 |
| RV-108-B | El filtro de búsqueda por comprobante acepta formato completo (B001-000045, F001-000012, T001-000123), solo el correlativo (45, 12) o el DNI/RUC del cliente (8 u 11 dígitos). | Campo Buscar | MSG-156 |
| RV-109 | El filtro de fecha admite una fecha o un rango: "desde" no puede ser posterior a "hasta", ninguna fecha puede ser futura y el rango máximo es de 31 días; el Cajero solo puede consultar hasta 7 días atrás. | Campos Desde y Hasta | MSG-157, 158, 159 |
| RV-110 | El resumen del filtro suma solo las ventas vigentes (total, efectivo y Yape) y cuenta aparte las anuladas. | Resumen de la lista | — |
| RV-111 | El estado se muestra con texto además del color (Vigente / Anulada); la venta anulada se muestra atenuada. | Insignia de estado | — |
| RV-112 | El botón ANULAR VENTA solo aparece para el Administrador y solo en ventas vigentes. | Detalle de la venta | MSG-163, 39 |
| RV-113 | El motivo de anulación es obligatorio, de 5 a 100 caracteres, con motivos rápidos que lo rellenan; se recortan los espacios de los extremos. | Campo Motivo | MSG-160 |
| RV-114 | La anulación pide confirmación que nombra el comprobante y el monto, advierte que no se puede deshacer y tiene el foco inicial en CANCELAR. | Diálogo de anulación | MSG-161 |
| RV-115 | Al anular, el Administrador elige qué hacer con el pedido: "Dejar el pedido por cobrar" (por defecto) o "Anular también el pedido". | Opciones del diálogo | — |
| RV-116 | Mientras se anula, el botón queda deshabilitado con "Anulando…" y el envío lleva un identificador único: una sola anulación por venta. | Botón ANULAR VENTA | — |
| RV-117 | REIMPRIMIR y DESCARGAR usan el comprobante original con la marca "COPIA" (o "ANULADO" si la venta está anulada) y quedan registrados. | Botones REIMPRIMIR y DESCARGAR | MSG-148, 149 |
| RV-118 | Los filtros se aplican sin recargar la página, son combinables y conservan el orden. | Filtros | MSG-153 |
| RV-118-B | En el detalle de la venta, si el comprobante emitido fue Factura o Boleta con DNI, se deben exhibir de forma obligatoria los datos del receptor (DNI/RUC, Razón Social, Dirección) y el desglose de IGV. | Detalle de la venta | — |


## 8. Reglas de negocio y requerimientos no funcionales


<!-- tabla 43 -->
| Código | Regla |
|---|---|
| RN-96 | El Administrador y el Cajero listan y buscan las ventas; solo el Administrador las anula. |
| RN-97 | El Cajero consulta las ventas de hoy y de los últimos 7 días; el Administrador, cualquier fecha. |
| RN-97-B | Integridad de comprobantes en reimpresión y anulación: las ventas anuladas conservan el comprobante emitido en estado "Anulado". Al reimprimir un comprobante anulado, el documento se genera con una marca de agua visible de "ANULADO - SIN EFECTO TRIBUTARIO". |
| RN-98 | Solo se anulan ventas vigentes; la anulación no se puede deshacer. |
| RN-99 | Toda anulación exige un motivo y registra usuario, fecha, hora y motivo. |
| RN-100 | Una venta anulada y su comprobante dejan de sumar en los totales, el cierre de caja y los reportes; el número del comprobante se conserva y no se reutiliza. |
| RN-101 | Si la venta pertenece a una caja ya cerrada, se anula, el cierre original queda sin cambios y se deja constancia del ajuste en los reportes (CUS13). |
| RN-102 | Al anular una venta, el Administrador decide sobre el pedido: dejarlo "pendiente de cobro" para cobrarlo de nuevo (con otro método o monto y otro comprobante) o anularlo también. |
| RN-103 | Si el pedido vuelve a "pendiente de cobro", la mesa pasa a Ocupada y sigue así mientras tenga algún pedido sin cobrar o anular (RN-147). |
| RN-104 | Las reimpresiones se registran con usuario, fecha y hora, y llevan la marca "COPIA" (o "ANULADO"). |
| RN-105 | Las anulaciones (con motivo y destino del pedido) y las reimpresiones se registran en auditoría. |
| RNF-41 | La consulta responde en menos de 2 segundos con hasta 3,000 ventas en el rango (paginada en el servidor); el comprobante se genera en menos de 3 segundos. |
| RNF-42 | La interfaz es adaptable a móvil (filas como tarjetas), con controles de al menos 44 px, y operable con teclado (RNF-04). |
| RNF-43 | El servidor valida token, rol y el límite de fechas por rol en cada endpoint; la anulación es atómica e idempotente (RNF-02). |
| RNF-44 | Las ventas y los comprobantes nunca se eliminan ni se editan: solo cambian de estado. |


## 9. Catálogo de mensajes

Se reutilizan MSG-09 (conexión), MSG-39 (sin permiso), MSG-148 y MSG-149 (comprobante e impresión).

<!-- tabla 44 -->
| Código | Mensaje (texto al usuario) | Tipo | Ubicación |
|---|---|---|---|
| MSG-153 | No se encontraron ventas con ese criterio. Pruebe con otra fecha o número de comprobante. | Informativo | En la lista |
| MSG-154 | Todavía no hay ventas registradas hoy. | Informativo | En la lista |
| MSG-155 | No se pudieron cargar las ventas. Intente nuevamente. (botón Reintentar) | Error | En la lista |
| MSG-156 | El número de comprobante no es válido. Use el formato T001-000123 o solo el correlativo. | Error | Bajo el campo Buscar |
| MSG-157 | La fecha "desde" no puede ser posterior a "hasta". | Error | Bajo los campos de fecha |
| MSG-158 | El rango no puede superar los 31 días ni incluir fechas futuras. | Error | Bajo los campos de fecha |
| MSG-159 | Solo puede consultar las ventas de los últimos 7 días. | Error | Bajo los campos de fecha |
| MSG-160 | Indique el motivo de la anulación (entre 5 y 100 caracteres). | Error | Bajo el campo Motivo |
| MSG-161 | ¿Anular la venta [comprobante] por S/ [x]? No se puede deshacer y quedará registrada con su motivo. | Confirmación | Diálogo |
| MSG-162 | Venta [comprobante] anulada. [El pedido N.º [n] volvió a pendiente de cobro. / El pedido N.º [n] fue anulado.] | Éxito | Aviso temporal (4 s) |
| MSG-163 | La venta ya fue anulada. | Error | Aviso |
| MSG-164 | No se pudo anular la venta. La venta sigue vigente; intente nuevamente. | Error | Sobre el botón ANULAR VENTA |
| MSG-165 | La venta pertenece a una caja cerrada: se anulará y el ajuste quedará registrado en los reportes. | Advertencia | Diálogo de anulación |


## 10. Diccionario de datos


<!-- tabla 45 -->
| Campo | Tipo | Obligatorio | Longitud / formato | Notas |
|---|---|---|---|---|
| Comprobante | Texto | Automático | T001-000123 / B001-000045 / F001-000012 | Serie y correlativo continuo y único |
| Fecha y hora, pedido, tipo, mesa o referencia, cajero | Varios | Automático | — | Datos de la venta; no editables |
| Total | Decimal (8,2) | Automático | S/ 0.00 | — |
| Método de pago, monto recibido, vuelto y referencia de Yape | Varios | Automático | Efectivo / Yape | Registrados en el cobro (CUS10) |
| Estado | Lista | Automático | Vigente / Anulada | Solo pasa de Vigente a Anulada |
| Motivo de anulación | Texto | Sí al anular | 5–100 | Con motivos rápidos; se recorta |
| Destino del pedido | Lista | Sí al anular | Dejar por cobrar / Anular también | Por defecto: dejar por cobrar |
| Anulada por, fecha y hora | Texto y fecha | Automático | — | Para auditoría |
| Búsqueda | Texto | No | Máx. 15 | Número completo, correlativo o DNI/RUC del cliente |
| Tipo de comprobante (filtro) | Lista | No | Todos / Tickets / Boletas / Facturas | Por defecto: Todos |
| Fechas Desde y Hasta | Fecha | No | Máx. 31 días; sin futuras | Cajero: hasta 7 días atrás |
| Resumen del filtro | Calculado | Automático | Cantidad y totales | Solo ventas vigentes |


## 11. Contrato de API

Todos los endpoints exigen token JWT (401 sin token válido) y validan el rol y el límite de fechas por rol en el servidor (403 si no corresponde).

<!-- tabla 46 -->
| Endpoint | Entrada | Respuestas |
|---|---|---|
| GET /api/ventas | busqueda?, desde?, hasta?, pagina, tamano (20) | 200: { items[{ ventaId, comprobante, fechaHora, pedidoNumero, tipo, mesa, referencia, total, metodo, cajero, estado }], total, resumen{ vigentes, totalVigente, efectivo, yape, anuladas } }. 400: búsqueda o rango inválidos. 403: el Cajero pide más de 7 días atrás. Roles: Administrador y Cajero. |
| GET /api/ventas/{id} | — | 200: detalle con líneas, montos, método, referencia de Yape, cajero, estado y, si está anulada, motivo, usuario, fecha y destino del pedido. 404: no existe. Roles: Administrador y Cajero. |
| POST /api/ventas/{id}/anular | { solicitudId, motivo, destinoPedido: porCobrar \| anular } | 200: { estado, pedidoEstado }. 400: motivo inválido. 404: no existe. 409: la venta ya está anulada. 403: rol no permitido. Idempotente por solicitudId. Rol: Administrador. |
| GET /api/comprobantes/{ventaId}/pdf | copia=true | 200: PDF con la marca COPIA (o ANULADO) y registra la reimpresión. 404: no existe. Roles: Administrador y Cajero. |


## 12. Escenarios de validación y criterios de aceptación


<!-- tabla 47 -->
| ID | Entrada / acción | Resultado esperado | Reglas | HU |
|---|---|---|---|---|
| E-279 | Entrar a VENTAS | Ventas de hoy, las más recientes primero, con comprobante, fecha y hora, total, método y estado, y el resumen. | RV-107 | HU28 |
| E-280 | No hay ventas hoy | MSG-154. | RV-107 | HU28 |
| E-281 | Buscar "123" y luego "T001-000123" | Ambas búsquedas encuentran la misma venta. | RV-108 | HU28 |
| E-282 | Buscar un número que no existe | MSG-153 y "Quitar filtros". | RV-108 | HU28 |
| E-283 | Buscar con un formato inválido (por ejemplo, "ab#") | MSG-156; la lista no cambia. | RV-108 | HU28 |
| E-284 | Filtrar por una fecha y por un rango | La lista y el resumen muestran solo ese período. | RV-109, RV-118 | HU28 |
| E-285 | Rango invertido; rango futuro o de más de 31 días | MSG-157 o MSG-158. | RV-109 | HU28 |
| E-286 | El Cajero consulta hace 10 días; el Administrador lo hace igual | El Cajero recibe MSG-159 (403 si fuerza el servicio); el Administrador ve esa fecha. | RN-97 | HU28 |
| E-287 | Revisar el resumen con ventas anuladas | Suma solo las vigentes (total, efectivo y Yape) y cuenta las anuladas aparte. | RV-110, RN-100 | HU28 |
| E-288 | Abrir el detalle de una venta anulada | Muestra todos los datos, el motivo, quién la anuló, cuándo y el destino del pedido. | RN-99 | HU28 |
| E-289 | El Cajero abre un detalle | Ve REIMPRIMIR y DESCARGAR, pero no ANULAR VENTA; por servicio, 403 y MSG-39. | RV-112, RN-96 | HU28 |
| E-290 | Reimprimir una venta vigente | El ticket sale con el mismo número y la marca "COPIA"; la reimpresión queda registrada. | RV-117, RN-104 | HU28 |
| E-291 | Reimprimir una venta anulada | El ticket sale con la marca "ANULADO". | RV-117 | HU28 |
| E-292 | Reimprimir sin impresora | MSG-149 y se ofrece DESCARGAR. | RV-117 | HU28 |
| E-293 | Regenerar un comprobante que falló al emitirse | Se genera desde el detalle; la venta y su número no cambian. | RN-91, CUS10.2 | HU28 |
| E-294 | Anular una venta vigente con motivo y "Dejar el pedido por cobrar" | MSG-161 y luego MSG-162; la venta queda "Anulada", ya no suma y el pedido aparece de nuevo en COBRAR. | RN-98 a RN-102 | HU27 |
| E-295 | Anular con "Anular también el pedido" | El pedido queda "Anulado" y, si era el único de su mesa, la mesa queda libre. | RN-102 | HU27 |
| E-296 | Anular sin motivo o con menos de 5 caracteres | MSG-160; no se anula. | RV-113 | HU27 |
| E-297 | Anular una venta que ya está anulada | MSG-163. | RN-98 | HU27 |
| E-298 | Anular una venta de una caja ya cerrada | El diálogo muestra MSG-165; el cierre original no cambia y el ajuste queda registrado. | RN-101 | HU27 |
| E-299 | Anular una venta con la caja del día abierta | La venta deja de sumar en el cuadre de la caja. | RN-100 | HU27 |
| E-300 | Cobrar de nuevo el pedido devuelto | Se crea otra venta con un comprobante nuevo; el anulado conserva su número. | RN-100, RN-102 | HU27 |
| E-301 | El pedido devuelto tiene su mesa con otro pedido | La mesa sigue ocupada hasta resolver ambos. | RN-103 | HU27 |
| E-302 | Falla al anular | MSG-164; la venta sigue vigente y el pedido no cambia. | RN-98 | HU27 |
| E-303 | Doble clic en ANULAR VENTA | Se registra una sola anulación. | RV-116, RNF-43 | HU27 |
| E-304 | Cancelar la anulación (botón o Esc) | La venta sigue vigente. | RV-114 | HU27 |
| E-305 | Falla al cargar la lista | MSG-155 con Reintentar. | RNF-41 | HU28 |
| E-306 | Solo teclado | Tab recorre filtros, filas, botones y el diálogo; Enter confirma; Esc cancela. | RNF-42 | HU27, HU28 |
| E-307 | Un mozo o el cocinero entra a VENTAS por URL o servicio | 403 y MSG-39; la opción no aparece en su menú. | RN-96 | HU28 |


## 13. Matriz de justificación de usabilidad


<!-- tabla 48 -->
| Principio aplicado | Elemento de la interfaz | Decisión adoptada | Justificación |
|---|---|---|---|
| ISO 9241 – Eficacia | Búsqueda flexible y anulación guiada | El número se encuentra completo o solo con el correlativo; la anulación explica qué pasa con el pedido | El usuario completa la tarea sin conocer el formato interno |
| ISO 9241 – Eficiencia | Ventas de hoy por defecto y motivos rápidos | Lo habitual aparece sin filtrar; un toque para el motivo | Menos pasos en consultas frecuentes |
| ISO 9241 – Satisfacción | Resumen y estados claros | Totales por medio de pago y ventas anuladas atenuadas | La dueña entiende de un vistazo |
| Nielsen 1 – Visibilidad del estado | Resumen, estados y avisos | Resumen del filtro, insignia con texto y MSG-162 | Siempre sabe qué ventas suman y cuáles no |
| Nielsen 2 – Mundo real | Textos | "Anular", "Copia", "Pendiente de cobro", "Vigente" | Mismo lenguaje del negocio |
| Nielsen 3 – Control y libertad | Cancelar y Esc | Salir del diálogo sin efecto; elegir qué hacer con el pedido | Decide con calma |
| Nielsen 4 – Consistencia | Diálogos y botones | Mismo patrón de anulación con motivo que en los pedidos (CUS08.2) | Evita reaprendizaje |
| Nielsen 5 – Prevención de errores | Confirmación y reglas de rol | Foco en CANCELAR, nombre y monto en el diálogo, ANULAR solo para el Administrador | Evita anular la venta equivocada |
| Nielsen 6 – Reconocimiento | Fila y detalle | Comprobante, fecha, total y método visibles; detalle completo | No obliga a recordar |
| Nielsen 7 – Flexibilidad y eficiencia | Filtros combinables | Número, fecha o rango, según lo que recuerde el usuario | Cada usuario llega por su camino |
| Nielsen 8 – Minimalismo | Lista | Solo las columnas necesarias | Sin distracciones |
| Nielsen 9 – Recuperarse de errores | Mensajes MSG-153, 156 y 164 | Explican qué pasó y qué hacer | Facilita corregir |
| Shneiderman 1 – Consistencia | Estilo y acciones | Misma paleta, botones y mensajes del sistema | Comportamiento predecible |
| Shneiderman 2 – Usabilidad universal | Móvil y teclado | Tarjetas de 44 px, estado con texto, contraste 4.5:1, teclado | Atiende distintos dispositivos y niveles |
| Shneiderman 3 – Retroalimentación | Avisos | MSG-162 indica qué pasó con la venta y con el pedido | Sabe qué pasó |
| Shneiderman 4 – Cierre | Mensajes finales | La anulación termina con un aviso y la lista actualizada | Indica que la tarea concluyó |
| Shneiderman 5 – Prevenir errores | Validaciones | Motivo obligatorio, botón bloqueado, venta ya anulada no se repite | Evita anulaciones accidentales o duplicadas |
| Shneiderman 6 – Reversión | Cancelar y reintegro al cobro | Cancelar antes de confirmar; el pedido puede cobrarse de nuevo | Se puede rehacer el cobro correcto |
| Shneiderman 7 – Control del usuario | Todo el flujo | La administradora decide el motivo y el destino del pedido; nada se anula solo | Mantiene el control |
| Shneiderman 8 – Memoria a corto plazo | Diálogo de anulación | Repite el comprobante y el monto antes de confirmar | No debe recordar qué venta eligió |


## 14. Matriz de trazabilidad


### 14.1 Requerimiento → historia → caso de uso → vista → prueba


<!-- tabla 49 -->
| RF | HU | CUS | Vista | Reglas / mensajes | API | Escenarios |
|---|---|---|---|---|---|---|
| RF-28 Listar y buscar ventas | HU28 (M) | CUS11.1 | 11.1 y 11.2 | RV-107 a 112, 117, 118; RN-96, 97, 100, 104; MSG-153 a 159, 148, 149 | GET /api/ventas, /{id} y comprobantes/pdf | E-279 a E-293, E-305 a E-307 |
| RF-27 Anular una venta | HU27 (M) | CUS11.2 | 11.3 | RV-112 a 116; RN-98 a 103, 105; MSG-160 a 165 | POST /api/ventas/{id}/anular | E-294 a E-304 |


### 14.2 Regla → elemento de interfaz → escenario


<!-- tabla 50 -->
| Regla | Elemento de interfaz | Escenario |
|---|---|---|
| RV-107 | Lista de ventas del día | E-279, E-280 |
| RV-108 | Campo Buscar con formato flexible | E-281 a E-283 |
| RV-109 / RN-97 | Campos Desde y Hasta con sus límites | E-284 a E-286 |
| RV-110 / RN-100 | Resumen del filtro con solo vigentes | E-287, E-299 |
| RV-112 / RN-96 | ANULAR VENTA visible solo para el Administrador | E-289, E-307 |
| RV-113 | Campo Motivo y motivos rápidos | E-296 |
| RV-114 | Diálogo con comprobante, monto y foco en CANCELAR | E-294, E-304 |
| RV-115 / RN-102 | Opciones sobre el pedido | E-294, E-295, E-300 |
| RV-116 / RNF-43 | Botón "Anulando…" e identificador de solicitud | E-303 |
| RV-117 / RN-104 | Botones REIMPRIMIR y DESCARGAR con marca COPIA o ANULADO | E-290 a E-293 |
| RN-101 | Aviso MSG-165 y ajuste en reportes | E-298 |
| RN-103 | Mesa que sigue ocupada | E-301 |


## 15. Evaluación del prototipo y mejoras incorporadas

Aún no hay prototipo de la gestión de ventas; las decisiones siguientes aplican lo aprendido en los CUS anteriores.

<!-- tabla 51 -->
| Riesgo previsto | Principio | Decisión de diseño incorporada |
|---|---|---|
| Anular la venta equivocada | Nielsen 5; Shneiderman 5 | Diálogo con comprobante y monto, motivo obligatorio y foco en CANCELAR |
| No saber qué pasa con el pedido al anular | Nielsen 1 y 2 | Opciones explicadas ("Dejar por cobrar" o "Anular también") y MSG-162 con el resultado |
| No recordar el formato del comprobante | Nielsen 6 y 7 | Búsqueda por el número completo o solo por el correlativo |
| Confundir copias, originales y anulados | Nielsen 1 | Marcas "COPIA" y "ANULADO" en el ticket y estado con texto en la lista |
| Perder el rastro de lo ocurrido | Shneiderman 4 | Detalle con motivo, usuario, fecha y destino del pedido |
| Estilo distinto al resto del sistema | Shneiderman 1; Nielsen 4 | Reutilizar paleta, botones, diálogos y avisos de los CUS anteriores |


## 16. Dependencias con otros casos de uso


<!-- tabla 52 -->
| CUS relacionado | Relación con el CUS11 |
|---|---|
| CUS10 Cobro | Cada cobro crea una venta; CUS10.2 depende de este listado para reimprimir y regenerar comprobantes; un pedido devuelto a "pendiente de cobro" se cobra de nuevo en CUS10.1. |
| CUS08 Gestión de pedidos | Anular también el pedido lo deja "Anulado"; el pedido devuelto reaparece como pendiente de cobro. |
| CUS05 Mesas | Anular el único pedido abierto de una mesa la libera; si hay otro pedido, la mesa sigue ocupada (RN-103). |
| CUS12 Caja | Una venta anulada deja de sumar en el cuadre; las ventas de una caja cerrada generan un ajuste sin tocar el cierre (RN-101). |
| CUS13 Reportes | Las anuladas no suman en los totales y los ajustes posteriores al cierre deben mostrarse en los reportes. |


<!-- tabla 53 -->
| N.º | Punto | Decisión adoptada o tarea |
|---|---|---|
| 1 | CUS11.2 no definía qué pasa con el pedido al anular la venta; sin esa decisión, un pedido ya servido quedaría pagado sin venta o bloqueado. | Decisión: se adopta el destino del pedido definido en RN-102 y RN-103. |
| 2 | La devolución de dinero al cliente (efectivo que sale de la caja) no queda registrada por la anulación. | Decisión: no se registran egresos en esta versión; la devolución de dinero por una anulación se anota en la observación del cierre de caja (CUS12.2). |
| 3 | La "constancia del ajuste en los reportes" para ventas de cajas cerradas depende de CUS13. | Resuelto: el reporte marca "Con ajustes" los días con anulaciones posteriores al cierre (RN-121, CUS13.1). |
| 4 | El límite de 7 días para el Cajero, el resumen del filtro y el registro de reimpresiones amplían RF-28. | Decisión: se aceptan las ampliaciones (límite de 7 días para el Cajero, resumen del filtro y registro de reimpresiones). |
| 5 | Reimprimir sin límite podría usarse para entregar duplicados del comprobante. | Aceptarlo con la marca "COPIA" y el registro de cada reimpresión (RN-104). |
| 6 | El listado no se exporta a Excel ni a PDF; eso corresponde a reportes (CUS13). | Decisión: la exportación a Excel y PDF se hace en reportes (CUS13). |
| 7 | Aún no existen bocetos de las Vistas 11.1 a 11.3. | Diseñarlas en Figma con los estados de la sección 7, empezando por el diálogo de anulación. |


# CUS12: Gestión de caja


## 1. Ficha del CUS general


<!-- tabla 54 -->
| Campo | Detalle |
|---|---|
| CUS general | CUS12: Gestión de caja |
| Interfaz (GUI) | Interfaz 12: Caja |
| Actor(es) | Cajero (abrir y cerrar) y Administrador (historial de cierres) |
| HU / RF de origen | HU29 a HU31 / RF-29 a RF-31 |
| Descripción | Una sola pantalla con tres casos de uso: abrir la caja (CUS12.1, Vista 12.1), cerrar la caja y cuadrar (CUS12.2, Vista 12.2) y consultar el historial de cierres (CUS12.3, Vistas 12.3 y 12.4). Resuelve el problema principal de Girasoles: el conteo manual del dinero y el cuaderno. |
| Alcance | El cobro de pedidos exige la caja abierta (CUS10.1). |


<!-- tabla 55 -->
| CUS | Título | Actor | HU | RF | Prioridad | Iteración | Complejidad |
|---|---|---|---|---|---|---|---|
| CUS12.1 | Abrir caja | Cajero | HU29 | RF-29 | Alta (Must) | 1/3 | Baja |
| CUS12.2 | Cerrar caja y cuadrar | Cajero | HU30 | RF-30 | Alta (Must) | 1/3 | Alta |
| CUS12.3 | Consultar historial de cierres | Administrador | HU31 | RF-31 | Media (Should) | 2/3 | Baja |

Criterio: la prioridad se obtiene de la validación MoSCoW de la HU (Must = Alta, Should = Media, Could = Baja) y la iteración sigue la prioridad (Alta = 1/3, Media = 2/3, Baja = 3/3).

## 2. Decisiones adoptadas


<!-- tabla 56 -->
| Tema | Decisión | Vacío que cubre |
|---|---|---|
| Quién usa la pantalla | El Cajero abre y cierra la caja. El Administrador solo consulta el historial de cierres. | RF-29 a RF-31 |
| Caja abierta única | Solo puede haber una caja abierta a la vez; cada caja pertenece a la fecha de su apertura. Se permiten varias cajas el mismo día, una después de otra (por ejemplo, desayuno y almuerzo). | "Caja del día" |
| Caja sin cerrar de un día anterior | El sistema avisa y bloquea los cobros y la nueva apertura hasta cerrarla, para no mezclar días. | Faltaba la regla |
| Monto inicial | Efectivo desde S/ 0.00 hasta S/ 99,999.99, con hasta 2 decimales. Se sugiere el efectivo contado en el último cierre (editable). | CUS12.1 |
| Pantalla con la caja abierta | Muestra desde qué hora y por quién se abrió, el monto inicial y un resumen parcial (ventas, efectivo, Yape y total) y el botón CERRAR CAJA. | No estaba definido |
| Cálculo del cierre | Lo hace el servidor con las ventas vigentes de la caja: efectivo esperado = monto inicial + ventas en efectivo; el Yape se muestra aparte; también la cantidad de ventas y los platos vendidos por producto. | RF-30 |
| Pedidos sin cobrar | Impiden el cierre; se listan con su pedido, mesa o "Para llevar" y total para cobrarlos o anularlos primero. | CUS12.2 |
| Efectivo contado | Campo numérico, o el contador opcional de billetes y monedas (S/ 200, 100, 50, 20, 10, 5, 2, 1, 0.50, 0.20 y 0.10) que suma solo y llena el campo. El desglose no se guarda. | Los errores de suma son el problema de origen |
| Diferencia | Efectivo contado − efectivo esperado, calculada al instante: "Cuadra", "Sobrante S/ x" o "Faltante S/ x", con texto, color y signo. La observación es opcional (hasta 200 caracteres) pero se recomienda si hay diferencia. | CUS12.2 |
| Confirmar el cierre | Pide confirmación con el resumen y la advertencia de que no se puede deshacer ni cobrar hasta una nueva apertura; el foco inicial queda en CANCELAR. | Acción irreversible |
| Después del cierre | Se muestra el resumen del cierre con IMPRIMIR y DESCARGAR PDF, para reemplazar la anotación en el cuaderno. | Faltaba el entregable del cierre |
| Cierre cerrado | No se edita ni se deshace. Una venta anulada después del cierre no cambia el cierre original; el ajuste se muestra aparte (RN-101, CUS11.2). | CUS11.2 |
| Historial | Para el Administrador: cierres recientes primero, de 20 en 20, con fecha, cajero, monto inicial, efectivo, Yape, total, efectivo contado y diferencia, filtro por fecha o rango y detalle. Las diferencias y los cierres "Con ajustes" se resaltan. La caja abierta aparece como primera fila "Abierta". | CUS12.3 |
| Auditoría | Se registran aperturas y cierres con usuario, fecha y hora, montos y diferencia. | Control de la dueña |


## 3. Análisis del usuario (Diseño Centrado en el Usuario)


<!-- tabla 57 -->
| Aspecto | Descripción |
|---|---|
| Quién usa la interfaz | El cajero al empezar y terminar la jornada, y la administradora para revisar los cierres. Experiencia tecnológica básica. |
| Necesidades | Empezar el día con el sencillo registrado; al terminar, contar el efectivo sin equivocarse y saber al instante si cuadra con lo vendido; saber cuánto entró por Yape; conservar un registro en lugar del cuaderno; revisar días anteriores. |
| Dificultades previsibles | Errores al sumar billetes y monedas; olvidar abrir o cerrar la caja; cerrar por error antes de cobrar todo; no entender si la diferencia es sobrante o faltante; cansancio al final del día; salidas de dinero que el sistema no conoce. |
| Contexto de uso | Apertura antes de atender y cierre al terminar, con cansancio y prisa; el dinero se cuenta a mano. Hoy la dueña suma en el cuaderno y, si se equivoca, repite todo. |


## 4. Plantillas de casos de uso


### CUS12.1: Abrir caja


<!-- tabla 58 -->
| Código: CUS12.1 | Título: Abrir caja (Vista 12.1) | Fecha: 17.10.2026 | Iteración: 1/3 |
|---|---|---|---|
| Actor(es): Cajero |  |  |  |
| Prioridad: Alta (Must) | Complejidad: Baja |  |  |
| Historia de usuario: HU29 Abrir caja (M) |  |  |  |
| Requerimiento de origen: RF-29 |  |  |  |
| Descripción: Permite al cajero abrir la caja indicando el monto inicial, que sirve como punto de partida para cuadrar el dinero al cierre. |  |  |  |
| Precondición: El cajero tiene sesión iniciada y no existe una caja abierta. |  |  |  |
| Flujo principal:<br>1. El cajero accede a la opción CAJA; el sistema muestra "Cargando caja…".<br>2. El sistema muestra MSG-166 y el botón ABRIR CAJA.<br>3. El cajero pulsa ABRIR CAJA; el sistema abre el diálogo con el campo Monto inicial y la sugerencia del último efectivo contado.<br>4. El cajero ingresa o acepta el monto y pulsa CONFIRMAR; el sistema valida (RV-120) y pide la confirmación MSG-172.<br>5. El cajero confirma; el sistema deshabilita el botón.<br>6. El servidor registra la apertura con fecha, hora, usuario y monto inicial y la anota en auditoría.<br>7. El sistema muestra MSG-173 y la pantalla con la caja abierta y su resumen parcial. |  |  |  |
| Flujo alterno:<br>Ya existe una caja abierta: MSG-167 con la hora y el usuario.<br>Hay una caja de un día anterior sin cerrar: MSG-168; se debe cerrar antes de abrir otra y los cobros siguen bloqueados.<br>Monto vacío, negativo, no numérico o con más de 2 decimales: MSG-169 o MSG-170; mayor a 99,999.99: MSG-171.<br>Doble clic en CONFIRMAR: se registra una sola apertura.<br>Cancelar (botón o Esc): la caja no se abre.<br>Un usuario sin rol Cajero intenta abrir por URL o servicio: MSG-39 (403). |  |  |  |
| Postcondición: La caja queda abierta con su monto inicial y se habilita el cobro de pedidos. |  |  |  |
| Excepciones:<br>Falla al abrir la caja: MSG-182; no se registra la apertura y se registra el incidente.<br>Pérdida de conexión: MSG-09 y MSG-182; al reintentar no se duplica la apertura. |  |  |  |
| Reglas y mensajes aplicables: RV-119 a RV-121, RV-132; RN-106 a RN-108, RN-114, RN-115; RNF-45 a RNF-48; MSG-166 a 173, 182, 09, 39. |  |  |  |


### CUS12.2: Cerrar caja y cuadrar


<!-- tabla 59 -->
| Código: CUS12.2 | Título: Cerrar caja y cuadrar (Vista 12.2) | Fecha: 21.10.2026 | Iteración: 1/3 |
|---|---|---|---|
| Actor(es): Cajero |  |  |  |
| Prioridad: Alta (Must) | Complejidad: Alta |  |  |
| Historia de usuario: HU30 Cerrar caja y cuadrar (M) |  |  |  |
| Requerimiento de origen: RF-30 |  |  |  |
| Descripción: Permite al cajero cerrar la caja: el sistema calcula el total vendido por método de pago, el cajero ingresa el efectivo contado y el sistema muestra la diferencia, reemplazando el conteo manual del cuaderno. |  |  |  |
| Precondición: El cajero tiene sesión iniciada y la caja está abierta. |  |  |  |
| Flujo principal:<br>1. El cajero accede a CAJA y pulsa CERRAR CAJA.<br>2. El sistema verifica que no haya pedidos pendientes de cobro (RV-122).<br>3. El sistema calcula y muestra el resumen: monto inicial, ventas en efectivo, ventas por Yape, total general, efectivo esperado, cantidad de ventas y platos vendidos por producto de carta, los menús completos vendidos (con monto) y las veces que se eligió cada componente (sin monto, RN-138).<br>4. El cajero cuenta el dinero e ingresa el efectivo contado, o usa CONTAR BILLETES Y MONEDAS y pulsa USAR ESTE TOTAL.<br>5. El sistema calcula al instante la diferencia y la muestra como "Cuadra", "Sobrante" o "Faltante".<br>6. Opcionalmente escribe una observación (se recomienda si hay diferencia).<br>7. Pulsa CONFIRMAR CIERRE; el sistema muestra la confirmación MSG-180 con el resumen y el foco en CANCELAR.<br>8. El cajero confirma; el servidor recalcula el resumen (RV-129), cierra la caja y registra fecha, hora, usuario, totales, efectivo contado, diferencia y observación.<br>9. El sistema muestra MSG-181 con el resumen final y los botones IMPRIMIR, DESCARGAR y VOLVER A CAJA. |  |  |  |
| Flujo alterno:<br>Hay pedidos pendientes de cobro: MSG-174 con su lista; el cierre queda deshabilitado hasta cobrarlos o anularlos.<br>Efectivo contado vacío, inválido o fuera de rango: MSG-175, MSG-170 o MSG-171.<br>Diferencia distinta de cero: se resalta con MSG-177 o MSG-178 y se recomienda la observación. Observación de más de 200 caracteres: MSG-179.<br>Cantidad inválida en el contador de billetes y monedas: MSG-184.<br>Los totales cambiaron mientras se contaba (por una anulación o un cobro): MSG-189 y se muestra el nuevo resumen.<br>Doble clic en CONFIRMAR CIERRE: se registra un solo cierre.<br>Cancelar (botón o Esc): la caja se mantiene abierta.<br>Un usuario sin rol Cajero intenta cerrar por URL o servicio: MSG-39 (403). |  |  |  |
| Postcondición: La caja queda cerrada, no se permiten más cobros hasta una nueva apertura y el cierre queda guardado en el historial. |  |  |  |
| Excepciones:<br>Falla al calcular o registrar el cierre: MSG-183; la caja sigue abierta y se registra el incidente.<br>Pérdida de conexión: MSG-09 y MSG-183; al reintentar no se duplica el cierre. |  |  |  |
| Reglas y mensajes aplicables: RV-122 a RV-129, RV-132; RN-109 a RN-115, RN-138; RNF-45 a RNF-49; MSG-174 a 181, 183, 184, 189, 09, 39. |  |  |  |


### CUS12.3: Consultar historial de cierres


<!-- tabla 60 -->
| Código: CUS12.3 | Título: Consultar historial de cierres (Vistas 12.3 y 12.4) | Fecha: 17.10.2026 | Iteración: 2/3 |
|---|---|---|---|
| Actor(es): Administrador |  |  |  |
| Prioridad: Media (Should) | Complejidad: Baja |  |  |
| Historia de usuario: HU31 Consultar cierres de caja (S) |  |  |  |
| Requerimiento de origen: RF-31 |  |  |  |
| Descripción: Permite al administrador consultar el historial de cierres de caja para revisar cuánto se vendió cada día y si hubo diferencias. |  |  |  |
| Precondición: El administrador tiene sesión iniciada. |  |  |  |
| Flujo principal:<br>1. El administrador accede a HISTORIAL DE CIERRES; el sistema muestra "Cargando cierres…".<br>2. El sistema consulta los cierres registrados y la caja abierta, si existe.<br>3. Muestra la lista (más recientes primero) con fecha, cajero, monto inicial, total en efectivo, total en Yape, total general, efectivo contado y diferencia; la caja abierta aparece como primera fila "Abierta".<br>4. Opcionalmente filtra por una fecha o un rango de fechas; el sistema valida (RV-130) y actualiza la lista.<br>5. Opcionalmente abre el detalle de un cierre: todos sus datos, la observación, los platos vendidos y los ajustes posteriores por anulación. |  |  |  |
| Flujo alterno:<br>No hay cierres con el filtro: MSG-185. Aún no hay cierres: MSG-187.<br>Rango incorrecto: MSG-188.<br>Un cierre con diferencia se resalta con texto y color; uno con anulaciones posteriores muestra "Con ajustes".<br>Un usuario sin rol Administrador entra por URL o servicio: MSG-39 (403). |  |  |  |
| Postcondición: El historial de cierres queda visible para el administrador. |  |  |  |
| Excepciones:<br>Falla al obtener los datos: MSG-186 con Reintentar; se registra el incidente.<br>Pérdida de conexión: MSG-09. |  |  |  |
| Reglas y mensajes aplicables: RV-130, RV-131; RN-106, RN-113; RNF-45, RNF-47, RNF-48; MSG-185 a 188, 09, 39. |  |  |  |


## 5. Interfaz (GUI)


<!-- tabla 61 -->
| Interfaz | RF | HU | CUS | Qué se hace dentro de la interfaz |
|---|---|---|---|---|
| 12. Caja | RF-29 a RF-31 | HU29 a HU31 | CUS12 (12.1 a 12.3) | Abrir la caja con su monto inicial, cerrarla cuadrando el efectivo y consultar el historial de cierres. |


### Vista 12.1: Abrir caja (CUS12.1) — restaurante.app/caja


<!-- tabla 62 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 63 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Estado de la caja | MSG-166 si no hay caja abierta; MSG-167 o MSG-168 si ya existe una abierta o una de un día anterior sin cerrar. |
| 2 | Botón ABRIR CAJA | Abre el diálogo con el campo Monto inicial. |
| 3 | Campo Monto inicial | De 0.00 a 99,999.99 con sugerencia del último efectivo contado; MSG-169, 170 y 171. |
| 4 | Confirmación | MSG-172; el botón queda deshabilitado mientras procesa. |


### Vista 12.2: Cerrar caja y cuadrar (CUS12.2) — restaurante.app/caja/cierre


<!-- tabla 64 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 65 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Pantalla con la caja abierta | Hora y usuario de apertura, monto inicial, resumen parcial y botón CERRAR CAJA. |
| 2 | Resumen del cierre | Monto inicial, ventas en efectivo y Yape, total, efectivo esperado, cantidad de ventas, platos vendidos por producto de carta, menús completos vendidos (con monto) y componentes elegidos (sin monto). |
| 3 | Pedidos sin cobrar | MSG-174 con su lista; el cierre queda deshabilitado. |
| 4 | Efectivo contado | Campo numérico o contador de billetes y monedas con USAR ESTE TOTAL; MSG-175, 170, 171 y 184. |
| 5 | Diferencia | "Cuadra", "Sobrante" o "Faltante" con texto, color y signo; MSG-177 y 178. |
| 6 | Confirmación y resumen final | Confirmación con foco en CANCELAR; después, el resumen del cierre con IMPRIMIR y DESCARGAR PDF. |


### Vista 12.3: Historial de cierres (CUS12.3) — restaurante.app/caja/historial


<!-- tabla 66 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 67 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Filtro de fechas | Una fecha o un rango; MSG-188 si es incorrecto. |
| 2 | Tabla de cierres | Fecha, cajero, monto inicial, efectivo, Yape, total, efectivo contado y diferencia; la caja abierta como primera fila "Abierta"; las diferencias y los cierres "Con ajustes" resaltados. |
| 3 | Mensajes | MSG-185 sin resultados, MSG-187 sin cierres y MSG-186 si falla. |


### Vista 12.4: Detalle de un cierre (CUS12.3) — restaurante.app/caja/historial/{id}


<!-- tabla 68 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 69 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Detalle | Observación, platos vendidos, menús completos y componentes, y ajustes posteriores. |
| 2 | Botón DESCARGAR PDF | Resumen del cierre de una página. |


## 6. Estados de la interfaz


<!-- tabla 70 -->
| Estado | Comportamiento visual |
|---|---|
| Cargando | "Cargando caja…" con marcadores de posición. |
| Sin caja abierta | Encabezado con MSG-166 y el botón grande ABRIR CAJA; los cobros quedan bloqueados. |
| Caja anterior sin cerrar | Encabezado con MSG-168 y el botón CERRAR CAJA; ABRIR CAJA deshabilitado. |
| Abriendo caja | Diálogo con el campo Monto inicial (con la sugerencia), MSG-172 y los botones CANCELAR y CONFIRMAR. |
| Caja abierta | Encabezado "Caja abierta desde [hora]"; monto inicial; resumen parcial (ventas, efectivo, Yape, total); botón CERRAR CAJA. |
| Cierre con pedidos pendientes | MSG-174 y lista de pedidos con COBRAR (y ANULAR si corresponde); el botón de cierre queda deshabilitado. |
| Cierre: resumen | Monto inicial, ventas en efectivo, ventas por Yape, total, efectivo esperado, cantidad de ventas y platos vendidos por producto, en tarjetas grandes. |
| Cierre: conteo | Campo Efectivo contado (teclado numérico) y botón CONTAR BILLETES Y MONEDAS que abre el contador con la suma en vivo. |
| Diferencia | Indicador grande: "Cuadra" (neutro), "Sobrante S/ x" o "Faltante S/ x" (con signo, texto y color) y el campo Observación. |
| Confirmando cierre | Diálogo con el resumen y MSG-180; el foco inicial en CANCELAR. |
| Guardando | Botones "Abriendo…" o "Cerrando…" deshabilitados. |
| Cierre completado | MSG-181 con el resumen final y los botones IMPRIMIR, DESCARGAR y VOLVER A CAJA. |
| Historial (Administrador) | Lista con la caja abierta como primera fila "Abierta", cierres con diferencia resaltados y "Con ajustes"; filtros por fecha; paginación de 20 en 20. |
| Detalle del cierre | Todos los datos del cierre, la observación, los platos vendidos y los ajustes posteriores por anulación. |
| Error | MSG-182, 183 o 186 según el caso; lo ingresado se conserva para reintentar. |
| Móvil y tablet | Una columna, tarjetas de resumen apiladas y botones de al menos 44 px. |


## 7. Reglas de validación (RV)


<!-- tabla 71 -->
| Código | Regla | Elemento UI | Mensaje |
|---|---|---|---|
| RV-119 | Solo existe una caja abierta a la vez; si hay una de un día anterior sin cerrar, se debe cerrar antes de abrir otra y se bloquean los cobros. | Estado de la caja | MSG-167, 168 |
| RV-120 | El monto inicial es obligatorio, numérico, desde 0, hasta 99,999.99 y con hasta 2 decimales (punto o coma); se sugiere el efectivo contado del último cierre. | Campo Monto inicial | MSG-169, 170, 171 |
| RV-121 | Abrir la caja pide confirmar el monto; el botón queda deshabilitado con "Abriendo…" y el envío lleva un identificador único. | Botón CONFIRMAR | MSG-172 |
| RV-122 | No se puede cerrar con pedidos pendientes de cobro: se impide el cierre y se lista cada pedido con su acción. | Lista de pedidos pendientes | MSG-174 |
| RV-123 | El resumen de cierre lo calcula el servidor con las ventas vigentes: monto inicial, efectivo, Yape, total, efectivo esperado, cantidad de ventas y platos vendidos por producto. | Resumen del cierre | — |
| RV-124 | El efectivo contado es obligatorio, numérico, desde 0, hasta 99,999.99 y con hasta 2 decimales; puede llenarse con el contador de billetes y monedas. | Campo Efectivo contado | MSG-175, 170, 171 |
| RV-125 | La diferencia (contado − esperado) se calcula al instante y se muestra con texto, color y signo: "Cuadra", "Sobrante" o "Faltante". | Indicador de diferencia | MSG-176, 177, 178 |
| RV-126 | La observación es opcional, de hasta 200 caracteres; se recomienda si hay diferencia. | Campo Observación | MSG-179 |
| RV-127 | Confirmar el cierre pide confirmación con el resumen y la advertencia de que no se deshace; el foco inicial queda en CANCELAR; "Cerrando…" deshabilita el botón y el envío lleva un identificador único. | Diálogo de cierre | MSG-180 |
| RV-128 | El contador de billetes y monedas acepta cantidades enteras de 0 a 999 por denominación, suma automáticamente y permite USAR ESTE TOTAL; el desglose no se guarda. | Contador | MSG-184 |
| RV-129 | Antes de cerrar, el servidor recalcula el resumen; si el efectivo esperado cambió desde que se mostró, no cierra y presenta el nuevo resumen. | Resumen del cierre | MSG-189 |
| RV-130 | El historial muestra los últimos cierres, más recientes primero, de 20 en 20; el filtro admite una fecha o un rango, "desde" no puede ser posterior a "hasta" ni futuras. | Filtros del historial | MSG-185, 188 |
| RV-131 | Los cierres con diferencia se resaltan con texto y color; los que tienen anulaciones posteriores muestran "Con ajustes". | Filas del historial | — |
| RV-132 | El encabezado de la pantalla siempre indica el estado: "Caja abierta desde [hora]", "Caja cerrada" o "Caja de [fecha] sin cerrar". | Encabezado | MSG-166, 168 |


## 8. Reglas de negocio y requerimientos no funcionales


<!-- tabla 72 -->
| Código | Regla |
|---|---|
| RN-106 | Solo el Cajero abre y cierra la caja; solo el Administrador consulta el historial de cierres. |
| RN-107 | Solo puede haber una caja abierta; cada caja pertenece a la fecha de su apertura y puede haber varias el mismo día, una a la vez. |
| RN-108 | El cobro de pedidos exige la caja abierta (RN-84); una caja abierta de un día anterior bloquea los cobros y la nueva apertura hasta cerrarla. |
| RN-109 | Efectivo esperado = monto inicial + ventas vigentes en efectivo de la caja; el Yape no forma parte del efectivo. |
| RN-110 | No se puede cerrar la caja con pedidos pendientes de cobro: deben cobrarse o anularse. |
| RN-111 | Diferencia = efectivo contado − efectivo esperado (positiva: sobrante; negativa: faltante; cero: cuadra); se guarda aunque no sea cero. |
| RN-112 | Al cerrar, la caja no admite más cobros; el cierre no se deshace ni se edita. |
| RN-113 | Una venta anulada después del cierre no cambia el cierre original; el ajuste se muestra aparte (RN-101). |
| RN-114 | La apertura guarda fecha, hora, usuario y monto inicial; el cierre guarda fecha, hora, usuario, totales, efectivo esperado, efectivo contado, diferencia y observación. |
| RN-115 | Las aperturas y los cierres se registran en auditoría. |
| RNF-45 | El resumen de cierre se calcula en menos de 2 segundos; la diferencia se calcula al instante en pantalla; los montos usan tipo decimal con redondeo a 2 decimales (RNF-37). |
| RNF-46 | Abrir y cerrar la caja son operaciones atómicas e idempotentes; el servidor bloquea cobros simultáneos durante el cierre para que el resumen sea consistente. |
| RNF-47 | La interfaz es adaptable a computadora, tablet y móvil, con controles de al menos 44 px, teclado numérico para los montos y operable con teclado (RNF-04). |
| RNF-48 | El servidor valida token, rol y estado de la caja en cada endpoint (RNF-02). |
| RNF-49 | El resumen del cierre se puede imprimir o descargar como PDF de una página. |
| RN-138 | Los reportes cuentan por separado los menús completos vendidos (con monto) y las veces que se eligió cada componente (sin monto), solo con ventas vigentes. |


## 9. Catálogo de mensajes

Se reutilizan MSG-09 (conexión) y MSG-39 (sin permiso). MSG-166 a MSG-189 pertenecen a la gestión de caja.

<!-- tabla 73 -->
| Código | Mensaje (texto al usuario) | Tipo | Ubicación |
|---|---|---|---|
| MSG-166 | Todavía no hay caja abierta. Ábrala para empezar a cobrar. | Informativo | Encabezado de la pantalla |
| MSG-167 | Ya existe una caja abierta desde las [hora] por [usuario]. | Error | Aviso |
| MSG-168 | Hay una caja del [fecha] sin cerrar. Ciérrela antes de abrir una nueva o cobrar. (botón CERRAR CAJA) | Advertencia | Encabezado de la pantalla |
| MSG-169 | Ingrese el monto inicial. | Error | Bajo el campo Monto inicial |
| MSG-170 | Ingrese un monto válido, desde S/ 0.00 y con hasta 2 decimales (ejemplo: 50.00). | Error | Bajo el campo de monto |
| MSG-171 | El monto no puede superar S/ 99,999.99. | Error | Bajo el campo de monto |
| MSG-172 | ¿Abrir la caja con S/ [x] de monto inicial? | Confirmación | Diálogo |
| MSG-173 | Caja abierta con S/ [x]. Ya puede cobrar. | Éxito | Aviso temporal (4 s) |
| MSG-174 | No se puede cerrar la caja: hay [n] pedido(s) pendiente(s) de cobro. Cóbrelos o anúlelos primero. | Error | Sobre la lista de pedidos |
| MSG-175 | Ingrese el efectivo contado. | Error | Bajo el campo Efectivo contado |
| MSG-176 | Cuadra: el efectivo contado coincide con el esperado. | Informativo | Indicador de diferencia |
| MSG-177 | Sobrante de S/ [x]. Se recomienda indicar una observación. | Advertencia | Indicador de diferencia |
| MSG-178 | Faltante de S/ [x]. Se recomienda indicar una observación. | Advertencia | Indicador de diferencia |
| MSG-179 | La observación no puede superar los 200 caracteres. | Error | Bajo el campo Observación |
| MSG-180 | ¿Cerrar la caja? No podrá cobrar hasta abrir una nueva y el cierre no se puede deshacer. | Confirmación | Diálogo |
| MSG-181 | Caja cerrada. [Cuadra / Sobrante de S/ x / Faltante de S/ x]. | Éxito | Resumen del cierre |
| MSG-182 | No se pudo abrir la caja. No se registró la apertura; intente nuevamente. | Error | Sobre el botón CONFIRMAR |
| MSG-183 | No se pudo cerrar la caja. La caja sigue abierta; intente nuevamente. | Error | Sobre el botón CONFIRMAR CIERRE |
| MSG-184 | La cantidad debe ser un número entero entre 0 y 999. | Error | Junto a la denominación |
| MSG-185 | No se encontraron cierres de caja con ese criterio. Pruebe con otro rango de fechas. | Informativo | En la lista |
| MSG-186 | No se pudo cargar el historial de cierres. Intente nuevamente. (botón Reintentar) | Error | En la lista |
| MSG-187 | Aún no hay cierres de caja registrados. | Informativo | En la lista |
| MSG-188 | La fecha "desde" no puede ser posterior a "hasta" ni incluir fechas futuras. | Error | Bajo los campos de fecha |
| MSG-189 | Los totales cambiaron mientras contaba (efectivo esperado: S/ [x]). Revise el resumen antes de cerrar. | Aviso | Resumen del cierre |


## 10. Diccionario de datos


<!-- tabla 74 -->
| Campo | Tipo | Obligatorio | Longitud / formato | Notas |
|---|---|---|---|---|
| Estado de la caja | Lista | Automático | Sin caja / Abierta / Anterior sin cerrar / Cerrada | Una sola abierta a la vez |
| Apertura (fecha, hora, usuario) | Varios | Automático | — | No editable |
| Monto inicial | Decimal (8,2) | Sí | 0 a 99,999.99 | Sugerido: último efectivo contado |
| Ventas en efectivo, ventas Yape, total, cantidad de ventas | Decimal / entero | Calculado | S/ 0.00 | Solo ventas vigentes de la caja |
| Platos vendidos por producto | Lista | Calculado | Producto y cantidad | Solo ventas vigentes |
| Efectivo esperado | Decimal (8,2) | Calculado | Monto inicial + efectivo | — |
| Efectivo contado | Decimal (8,2) | Sí al cerrar | 0 a 99,999.99 | Puede venir del contador |
| Cantidad por denominación | Entero | No | 0 a 999 | Solo para sumar; no se guarda |
| Diferencia | Decimal (8,2) | Calculado | Contado − esperado | Sobrante, faltante o cuadra |
| Observación | Texto | No | 0–200 | Se recomienda si hay diferencia |
| Cierre (fecha, hora, usuario) | Varios | Automático | — | No editable |
| Filtros del historial | Fecha | No | Desde y Hasta; sin futuras | — |
| Identificador de solicitud | Texto único | Automático | — | Evita duplicados |


## 11. Contrato de API

Todos los endpoints exigen token JWT (401 sin token válido) y validan el rol y el estado de la caja en el servidor (403 si no corresponde).

<!-- tabla 75 -->
| Endpoint | Entrada | Respuestas |
|---|---|---|
| GET /api/caja/actual | — | 200: { estado (sinCaja \| abierta \| anteriorSinCerrar), apertura{ fechaHora, usuario, montoInicial }, resumenParcial{ ventas, efectivo, yape, total }, sugerenciaMontoInicial }. Rol: Cajero. |
| POST /api/caja/abrir | { solicitudId, montoInicial } | 201: caja abierta. 400: monto inválido. 409: caja_abierta o caja_anterior_sin_cerrar. 403: rol no permitido. Idempotente. Rol: Cajero. |
| GET /api/caja/cierre/resumen | — | 200: { montoInicial, efectivo, yape, total, efectivoEsperado, nVentas, platos[{ producto, cantidad }], menusCompletos[{ menu, cantidad, monto }], componentes[{ componente, veces }], pedidosPendientes[{ pedidoId, numero, tipo, mesa, total }] }. 409: no hay caja abierta. Rol: Cajero. |
| POST /api/caja/cerrar | { solicitudId, efectivoContado, observacion?, efectivoEsperadoMostrado } | 200: { cierreId, efectivoEsperado, diferencia, resultado (cuadra \| sobrante \| faltante) }. 400: monto u observación inválidos. 409: pedidos_pendientes (con lista), sin_caja_abierta o totales_cambiaron (con el resumen nuevo). 403: rol no permitido. Idempotente. Rol: Cajero. |
| GET /api/caja/cierres | desde?, hasta?, pagina, tamano (20) | 200: { items[{ cierreId, fecha, cajero, montoInicial, efectivo, yape, total, efectivoContado, diferencia, conAjustes }], total } y la caja abierta como primera fila. 400: rango inválido. Rol: Administrador. |
| GET /api/caja/cierres/{id} | — | 200: detalle con observación, platos vendidos y ajustes posteriores. 404: no existe. Rol: Administrador. |
| GET /api/caja/cierres/{id}/pdf | — | 200: PDF del resumen del cierre. 404: no existe. Roles: Cajero (su cierre) y Administrador. |


## 12. Escenarios de validación y criterios de aceptación


<!-- tabla 76 -->
| ID | Entrada / acción | Resultado esperado | Reglas | HU |
|---|---|---|---|---|
| E-308 | Entrar a CAJA sin caja abierta | MSG-166 y el botón ABRIR CAJA; los cobros están bloqueados. | RN-108 | HU29 |
| E-309 | Abrir la caja con S/ 50.00 y confirmar | Diálogo MSG-172; luego MSG-173; la caja queda abierta y se habilita el cobro. | RV-120, RV-121 | HU29 |
| E-310 | Abrir la caja con un cierre anterior de S/ 370.00 contados | El campo sugiere S/ 370.00 y se puede cambiar. | RV-120 | HU29 |
| E-311 | Monto vacío, negativo, texto, 3 decimales o mayor a 99,999.99 | MSG-169, MSG-170 o MSG-171; no se abre. | RV-120 | HU29 |
| E-312 | Abrir con otra caja ya abierta | MSG-167. | RV-119, RN-107 | HU29 |
| E-313 | Hay una caja de ayer sin cerrar | MSG-168; los cobros se bloquean (MSG-135) hasta cerrarla. | RV-119, RN-108 | HU29 |
| E-314 | Doble clic en CONFIRMAR | Se registra una sola apertura. | RV-121, RNF-46 | HU29 |
| E-315 | Falla al abrir la caja | MSG-182; no se registra la apertura. | RNF-46 | HU29 |
| E-316 | Intentar cobrar sin caja abierta | MSG-135 con ABRIR CAJA. | RN-108 | HU29 |
| E-317 | Revisar la pantalla con la caja abierta | Muestra hora, usuario, monto inicial y el resumen parcial de ventas. | RV-132 | HU29 |
| E-318 | Cerrar la caja con pedidos pendientes de cobro | MSG-174 con la lista; el cierre queda deshabilitado; al cobrar o anular todos, se habilita. | RV-122, RN-110 | HU30 |
| E-319 | Un pedido pendiente que nadie va a cobrar (cliente que se fue) | Solo puede anularlo quien lo registró o el Administrador (RN-65); hasta entonces no se puede cerrar. | RN-110 | HU30 |
| E-320 | Inicial S/ 50.00, efectivo S/ 320.00 y Yape S/ 180.00 en 58 ventas | Resumen: efectivo esperado S/ 370.00, total vendido S/ 500.00, 58 ventas y platos por producto. | RV-123, RN-109 | HU30 |
| E-321 | Hay una venta anulada del día | No suma en el resumen ni en el efectivo esperado. | RV-123 | HU30 |
| E-322 | Contado S/ 370.00 con esperado S/ 370.00 | "Cuadra" (MSG-176). | RV-125 | HU30 |
| E-323 | Contado S/ 365.00 | "Faltante S/ 5.00" con texto, color y signo (MSG-178). | RV-125, RN-111 | HU30 |
| E-324 | Contado S/ 380.00 | "Sobrante S/ 10.00" (MSG-177). | RV-125, RN-111 | HU30 |
| E-325 | Efectivo contado vacío, inválido o mayor a 99,999.99 | MSG-175, MSG-170 o MSG-171. | RV-124 | HU30 |
| E-326 | Contador: 3 billetes de S/ 100, 1 de S/ 50 y 2 monedas de S/ 5 | Suma S/ 360.00; USAR ESTE TOTAL llena el campo; una cantidad inválida da MSG-184. | RV-128 | HU30 |
| E-327 | Observación de más de 200 caracteres | MSG-179. | RV-126 | HU30 |
| E-328 | Confirmar el cierre | Diálogo MSG-180 con el resumen y foco en CANCELAR; al confirmar, MSG-181 y la caja queda cerrada, sin cobros. | RV-127, RN-112 | HU30 |
| E-329 | Terminar el cierre | Se muestra el resumen con IMPRIMIR y DESCARGAR PDF. | RNF-49 | HU30 |
| E-330 | Cambia el efectivo esperado mientras se cuenta | MSG-189 y se muestra el nuevo resumen; no se cierra. | RV-129 | HU30 |
| E-331 | Doble clic en CONFIRMAR CIERRE | Se registra un solo cierre. | RV-127, RNF-46 | HU30 |
| E-332 | Falla al cerrar | MSG-183; la caja sigue abierta. | RNF-46 | HU30 |
| E-333 | Cancelar el cierre (botón o Esc) | La caja se mantiene abierta sin cambios. | RV-127 | HU30 |
| E-334 | Se anula una venta después del cierre (CUS11.2) | El cierre original no cambia; el historial muestra "Con ajustes". | RN-113, RV-131 | HU30, HU31 |
| E-335 | El administrador abre el historial | Cierres recientes primero con fecha, cajero, inicial, efectivo, Yape, total, contado y diferencia. | RN-106 | HU31 |
| E-336 | Hay cierres con diferencia | Se resaltan con texto y color. | RV-131 | HU31 |
| E-337 | Filtrar por una fecha o un rango; rango sin cierres; rango inválido | La lista se actualiza; sin cierres, MSG-185; rango inválido, MSG-188. | RV-130 | HU31 |
| E-338 | Aún no hay cierres | MSG-187. | — | HU31 |
| E-339 | Abrir el detalle de un cierre | Todos los datos, la observación, los platos vendidos y los ajustes posteriores. | RN-113 | HU31 |
| E-340 | Falla al cargar el historial | MSG-186 con Reintentar. | RNF-48 | HU31 |
| E-341 | Un mozo o el cocinero entra a CAJA, o un cajero entra al historial por URL o servicio | 403 y MSG-39; la opción no aparece en su menú. | RN-106 | HU29 a HU31 |
| E-342 | Hay una caja abierta | Aparece como primera fila "Abierta" en el historial del administrador. | RV-130 | HU31 |
| E-343 | Solo teclado | Tab recorre botones, campos, el contador y los diálogos; los números se escriben con el teclado; Enter confirma; Esc cancela. | RNF-47 | HU29 a HU31 |
| E-401 | Cierre de caja y dashboard | Muestran las mismas cifras de menús completos y de carta. | RN-138 | HU30 |


## 13. Matriz de justificación de usabilidad


<!-- tabla 77 -->
| Principio aplicado | Elemento de la interfaz | Decisión adoptada | Justificación |
|---|---|---|---|
| ISO 9241 – Eficacia | Resumen automático y contador de billetes y monedas | El sistema calcula lo esperado y suma el efectivo contado; la diferencia sale al instante | La dueña sabe si cuadra sin sumar ni rehacer cuentas |
| ISO 9241 – Eficiencia | Sugerencia de monto inicial y botón USAR ESTE TOTAL | No se vuelve a escribir lo que el sistema ya conoce | Menos tiempo al abrir y cerrar |
| ISO 9241 – Satisfacción | Indicador de diferencia y resumen imprimible | "Cuadra", "Sobrante" o "Faltante" con texto y color; resumen en PDF | Reemplaza la anotación en el cuaderno con seguridad |
| Nielsen 1 – Visibilidad del estado | Encabezado y resumen parcial | Estado de la caja siempre visible y ventas acumuladas | Siempre sabe si hay caja abierta y cuánto lleva |
| Nielsen 2 – Mundo real | Textos | "Caja", "Sencillo", "Faltante", "Sobrante", "Billetes y monedas" | Mismo lenguaje del negocio |
| Nielsen 3 – Control y libertad | Cancelar y Esc | Salir del diálogo sin cerrar; la caja sigue abierta | Decide con calma |
| Nielsen 4 – Consistencia | Diálogos y botones | Mismo patrón de confirmación que el resto del sistema | Evita reaprendizaje |
| Nielsen 5 – Prevención de errores | Bloqueos y confirmación | No se cierra con pedidos pendientes; el cierre pide confirmación con el resumen; se avisa si los totales cambiaron | Evita cierres equivocados e irreversibles |
| Nielsen 6 – Reconocimiento | Resumen y lista de pedidos pendientes | Todo lo vendido visible; los pendientes con su acción | No obliga a recordar qué falta cobrar |
| Nielsen 7 – Flexibilidad y eficiencia | Escribir el monto o usar el contador | Dos caminos para ingresar el efectivo contado | Cada persona cuenta a su manera |
| Nielsen 8 – Minimalismo | Pantalla de cierre | Solo el resumen, el campo de conteo y la diferencia | Sin distracciones al terminar el día |
| Nielsen 9 – Recuperarse de errores | Mensajes MSG-168, 174 y 189 | Explican qué falta y cómo resolverlo | Facilita corregir |
| Shneiderman 1 – Consistencia | Estilo y acciones | Misma paleta, botones y mensajes del sistema | Comportamiento predecible |
| Shneiderman 2 – Usabilidad universal | Teclado numérico, contraste y tamaño | Teclado numérico, números grandes, estado con texto, controles de 44 px | Atiende cansancio, daltonismo y distintos dispositivos |
| Shneiderman 3 – Retroalimentación | Diferencia en vivo y avisos | La diferencia se actualiza al escribir; MSG-173 y MSG-181 confirman | Sabe qué pasó |
| Shneiderman 4 – Cierre | Resumen final | El día termina con un resumen que se imprime o descarga | Indica que la tarea concluyó |
| Shneiderman 5 – Prevenir errores | Validaciones y botón único | No acepta montos inválidos; botón bloqueado al enviar; una sola caja abierta | Evita datos erróneos y duplicados |
| Shneiderman 6 – Reversión | Cancelar antes de confirmar | Todo se puede revisar antes del cierre; después se corrige con anulaciones (CUS11.2) | Acciones reversibles mientras es posible |
| Shneiderman 7 – Control del usuario | Todo el flujo | El cajero decide cuándo abrir y cerrar; el sistema solo avisa de lo pendiente | Mantiene el control |
| Shneiderman 8 – Memoria a corto plazo | Resumen y contador | El sistema muestra lo esperado y suma las denominaciones | No debe recordar ni sumar de memoria |


## 14. Matriz de trazabilidad


### 14.1 Requerimiento → historia → caso de uso → vista → prueba


<!-- tabla 78 -->
| RF | HU | CUS | Vista | Reglas / mensajes | API | Escenarios |
|---|---|---|---|---|---|---|
| RF-29 Abrir la caja | HU29 (M) | CUS12.1 | 12.1 | RV-119 a 121, 132; RN-106 a 108, 114, 115; MSG-166 a 173, 182 | GET /api/caja/actual y POST /abrir | E-308 a E-317 |
| RF-30 Cerrar la caja y cuadrar | HU30 (M) | CUS12.2 | 12.2 | RV-122 a 129; RN-109 a 115; MSG-174 a 181, 183, 184, 189 | GET /cierre/resumen, POST /cerrar y /pdf | E-318 a E-334, E-401 |
| RF-31 Consultar el historial de cierres | HU31 (S) | CUS12.3 | 12.3 y 12.4 | RV-130, 131; RN-106, 113; MSG-185 a 188 | GET /api/caja/cierres y /{id} | E-334 a E-342 |


### 14.2 Regla → elemento de interfaz → escenario


<!-- tabla 79 -->
| Regla | Elemento de interfaz | Escenario |
|---|---|---|
| RV-119 / RN-107 / RN-108 | Encabezado de estado y bloqueo de cobros | E-312, E-313, E-316 |
| RV-120 | Campo Monto inicial con sugerencia | E-309 a E-311 |
| RV-121 / RNF-46 | Botón "Abriendo…" e identificador de solicitud | E-314 |
| RV-122 / RN-110 | Lista de pedidos pendientes y cierre deshabilitado | E-318, E-319 |
| RV-123 / RN-109 | Tarjetas del resumen del cierre | E-320, E-321 |
| RV-124 / RV-128 | Campo Efectivo contado y contador de billetes y monedas | E-325, E-326 |
| RV-125 / RN-111 | Indicador de diferencia con texto, color y signo | E-322 a E-324 |
| RV-126 | Campo Observación | E-327 |
| RV-127 / RN-112 | Diálogo de confirmación con foco en CANCELAR | E-328, E-331, E-333 |
| RV-129 | Aviso MSG-189 y resumen actualizado | E-330 |
| RV-130 / RV-131 | Filtros, filas resaltadas y "Con ajustes" | E-334 a E-337, E-342 |
| RN-113 | Cierre original sin cambios y ajuste aparte | E-334, E-339 |
| RN-106 | Opciones visibles solo para el rol correspondiente; 403 en el servidor | E-341 |
| RNF-49 | Botones IMPRIMIR y DESCARGAR del cierre | E-329 |


## 15. Evaluación del prototipo y mejoras incorporadas

Aún no hay prototipo de la gestión de caja; las decisiones siguientes aplican lo aprendido en los CUS anteriores.

<!-- tabla 80 -->
| Riesgo previsto | Principio | Decisión de diseño incorporada |
|---|---|---|
| Errores al sumar billetes y monedas | Nielsen 5 y 7; Shneiderman 8 | Contador por denominación con suma en vivo y USAR ESTE TOTAL |
| No entender si la diferencia es sobrante o faltante | Nielsen 1 y 2; Shneiderman 2 | Indicador grande con texto, signo y color |
| Cerrar la caja por error o antes de cobrar todo | Nielsen 5; Shneiderman 5 | Bloqueo por pedidos pendientes y confirmación con el resumen y foco en CANCELAR |
| Olvidar abrir o cerrar la caja | Nielsen 1; Shneiderman 3 | Encabezado siempre visible y bloqueo de cobros con aviso claro |
| Cansancio y prisa al final del día | Shneiderman 2 y 8 | Números grandes, teclado numérico y pocos pasos |
| Perder lo escrito si vence la sesión o falla la conexión | Nielsen 9 | Conservar lo ingresado y permitir reintentar sin duplicar |
| Estilo distinto al resto del sistema | Shneiderman 1; Nielsen 4 | Reutilizar paleta, botones, diálogos y avisos de los CUS anteriores |


## 16. Dependencias con otros casos de uso


<!-- tabla 81 -->
| CUS relacionado | Relación con el CUS12 |
|---|---|
| CUS10 Cobro | El cobro exige la caja abierta (RN-84, RN-108); cada venta se suma a la caja abierta por medio de pago (RN-94). Con CUS12.1 en la iteración 1/3 se cumple la observación 9 del CUS10. |
| CUS11 Ventas | Una venta anulada deja de sumar; si es de una caja cerrada genera un ajuste sin tocar el cierre (RN-101, RN-113). |
| CUS08 y CUS06/08 Pedidos | Los pedidos pendientes de cobro impiden el cierre; deben cobrarse (CUS10) o anularse (CUS08.2). |
| CUS13 Reportes | Ventas por rango y platos vendidos usan las mismas ventas; los ajustes posteriores al cierre deben mostrarse en los reportes. |
| CUS03 Perfil | La sesión puede vencer durante el conteo; los datos ingresados no deben perderse (la sesión vence a los 30 minutos de inactividad). |


<!-- tabla 82 -->
| N.º | Punto | Decisión adoptada o tarea |
|---|---|---|
| 1 | Decisión: solo el Cajero abre, cierra y cuadra la caja (decisión de la dueña). El Administrador consulta el historial de cierres (CUS12.3). | Si la dueña atiende caja, usa un usuario con rol Cajero; reflejarlo en la gestión de usuarios (CUS02.2). |
| 2 | Un pedido de mesa sin cobrar (cliente que se fue sin pagar) bloquea el cierre de la caja. | Resuelto: el Administrador puede anular cualquier pedido no pagado, aun en preparación o listo, con motivo (RN-65); así el cierre de caja no queda bloqueado. |
| 3 | Los RF no contemplan egresos (compras de mercado, gas, devoluciones al anular una venta). El efectivo esperado no los descuenta y cualquier salida de dinero aparecerá como faltante. | Decisión: los egresos no se registran en esta versión; cualquier salida de dinero se explica en la observación del cierre. Un RF de egresos queda como mejora futura. |
| 4 | No hay forma de reabrir o corregir un cierre ya hecho si hubo un error de conteo. | Decisión: no se reabre un cierre; el error se corrige anulando ventas (CUS11.2). |
| 5 | El sistema muestra el total en Yape, pero no se compara con lo que indica la aplicación de Yape. | Dejar como mejora futura un campo opcional "Total Yape según su aplicación" con su propia diferencia. |
| 6 | Se asume que puede haber varias cajas el mismo día (por ejemplo, desayuno y almuerzo). | Decisión: puede haber varias cajas el mismo día, una abierta a la vez; los reportes suman los cierres del día. |
| 7 | La observación del cierre es opcional aunque haya diferencia. | Decisión: se mantiene opcional; el sistema sugiere escribirla cuando hay diferencia. |
| 8 | Las siguientes funciones amplían RF-29 y RF-30: sugerencia del monto inicial, resumen parcial con la caja abierta, platos vendidos y cantidad de ventas en el cierre, contador de billetes y monedas, resumen imprimible, bloqueo por caja anterior sin cerrar, fila "Abierta" en el historial y aviso de totales cambiados. | Decisión: se aceptan las ampliaciones de RF-29 y RF-30. |
| 9 | El detalle de platos vendidos en el cierre complementa el RF-33 (CUS13.2), que hoy no tiene fecha de entrega definida. | Reutilizar la misma consulta de platos vendidos en ambos CUS. |
| 10 | Aún no existen bocetos de las Vistas 12.1 a 12.4. | Diseñarlas en Figma con los estados de la sección 7, empezando por el cierre y el contador de billetes y monedas. |


# CUS13: Reportes


## 1. Ficha del CUS general


<!-- tabla 83 -->
| Campo | Detalle |
|---|---|
| CUS general | CUS13: Reportes |
| Interfaz (GUI) | Interfaz 13: Reportes |
| Actor(es) | Administrador |
| HU / RF de origen | HU32 y HU33 / RF-32 y RF-33 |
| Descripción | Una sola pantalla con dos pestañas y dos casos de uso: el reporte de ventas (CUS13.1, Vista 13.1) y los platos vendidos (CUS13.2, Vistas 13.2 y 13.3). Responde a la segunda mitad del problema de Girasoles: saber cuántos platos se venden y comprobar que cuadran con el dinero. |
| Alcance | El Cajero ve el resumen de platos y ventas únicamente al cerrar su caja (CUS12.2). |


<!-- tabla 84 -->
| CUS | Título | Actor | HU | RF | Prioridad | Iteración | Complejidad |
|---|---|---|---|---|---|---|---|
| CUS13.1 | Consultar reporte de ventas | Administrador | HU32 | RF-32 | Media (Should) | 2/3 | Media |
| CUS13.2 | Consultar platos vendidos | Administrador | HU33 | RF-33 | Alta (Must) | 1/3 | Media |

Criterio: la prioridad se obtiene de la validación MoSCoW de la HU (Must = Alta, Should = Media, Could = Baja) y la iteración sigue la prioridad (Alta = 1/3, Media = 2/3, Baja = 3/3).

## 2. Decisiones adoptadas


<!-- tabla 85 -->
| Tema | Decisión | Vacío que cubre |
|---|---|---|
| Quién usa la pantalla | Solo el Administrador (la dueña). El Cajero ve el resumen de platos y ventas únicamente al cerrar su caja (CUS12.2). | RF-32 y RF-33 |
| Estructura | Una sola pantalla con dos pestañas: "Platos vendidos" (CUS13.2, la primera, por ser Must) y "Ventas" (CUS13.1). Ambas comparten los mismos filtros de fecha. | CUS13 |
| Rango por defecto | El día de hoy. Se puede elegir una fecha o un rango (desde–hasta, máximo 366 días, sin fechas futuras) o usar los atajos Hoy, Ayer, Últimos 7 días, Este mes y Mes anterior. | "Por defecto el día" |
| Qué cuenta | Solo ventas vigentes. Las anuladas no suman aunque su caja ya esté cerrada; el reporte de ventas informa aparte cuántas hubo y por cuánto. | CUS11.2 |
| Fecha de una venta | La fecha local (Lima) de su cobro. | Faltaba la regla |
| Reporte de ventas | Cantidad de ventas, total general, total en efectivo, total por Yape y detalle por día (fecha, ventas, efectivo, Yape y total). | RF-32 |
| Diferencia con el cierre de caja | Como el reporte refleja el estado actual, un día puede diferir de su cierre si hubo anulaciones posteriores; esos días se marcan "Con ajustes" con la explicación y el enlace al historial de cierres. | Observación 5 del CUS11 y 5 del CUS12 |
| Platos vendidos | Por producto de carta (categoría, cantidad y monto, con subtotales por categoría), por menú completo (cantidad y monto) y por componente (veces que se eligió, sin monto), con el total de platos y el monto del período. Orden por cantidad (descendente) y ordenable por monto o nombre (RN-138). | RF-33 |
| Detalle de un producto | Al elegir un producto en el filtro (incluye los desactivados que tuvieron ventas) se muestra su cantidad por día dentro del rango. | "Por producto, por día o por rango" |
| Comprobar que cuadra | El reporte de platos compara el monto de los productos de carta y los menús completos con el total del reporte de ventas del mismo rango y muestra "Cuadra con ventas" o la diferencia; los componentes no suman monto. | "Comprobar que cuadran con el dinero" |
| Cuándo se actualiza | Solo al pulsar CONSULTAR (sin refresco automático); si se cambian los filtros después, un aviso lo indica. | Faltaba la regla |
| Exportación | DESCARGAR PDF y DESCARGAR EXCEL (CSV) con exactamente lo consultado; se registra la exportación. | No está en el RF |
| Fuera de alcance | Gráficos, reportes por mozo o por hora y comparación entre períodos: mejoras futuras. | — |


## 3. Análisis del usuario (Diseño Centrado en el Usuario)


<!-- tabla 86 -->
| Aspecto | Descripción |
|---|---|
| Quién usa la interfaz | La administradora (dueña), con experiencia tecnológica básica, desde la computadora del local o su celular, normalmente fuera de la hora pico. |
| Necesidades | Saber cuánto vendió hoy, esta semana o este mes; cuántos platos de cada tipo vendió; qué parte entró en efectivo y cuál por Yape; comprobar que los platos vendidos y el dinero coinciden; reemplazar las sumas del cuaderno. |
| Dificultades previsibles | Elegir mal el rango de fechas; no entender por qué un día no coincide con el cierre de caja; interpretar tablas largas en el celular; no encontrar un producto; confundir ventas con ventas anuladas. |
| Contexto de uso | Revisión tranquila al cierre del día o semanal, con tiempo para leer; hoy no existe ningún control de platos vendidos. |


## 4. Plantillas de casos de uso


### CUS13.1: Consultar reporte de ventas


<!-- tabla 87 -->
| Código: CUS13.1 | Título: Consultar reporte de ventas (Vista 13.1) | Fecha: 17.10.2026 | Iteración: 2/3 |
|---|---|---|---|
| Actor(es): Administrador |  |  |  |
| Prioridad: Media (Should) | Complejidad: Media |  |  |
| Historia de usuario: HU32 Consultar reporte de ventas (S) |  |  |  |
| Requerimiento de origen: RF-32 |  |  |  |
| Descripción: Permite al administrador consultar las ventas de un rango de fechas con el total general y el total por método de pago, para conocer cuánto vende el restaurante en un período. |  |  |  |
| Precondición: El administrador tiene sesión iniciada. |  |  |  |
| Flujo principal:<br>1. El administrador accede a REPORTES y abre la pestaña "Ventas"; el sistema muestra los filtros con el día de hoy.<br>2. Opcionalmente elige un atajo (Ayer, Últimos 7 días, Este mes, Mes anterior) o selecciona las fechas desde y hasta.<br>3. Pulsa CONSULTAR; el sistema valida el rango (RV-134) y deshabilita el botón.<br>4. El servidor consulta las ventas vigentes (excluye las anuladas) del rango.<br>5. El sistema muestra la cantidad de ventas, el total general, el total en efectivo, el total por Yape y el detalle por día, con el pie MSG-199 sobre las ventas anuladas.<br>6. Opcionalmente descarga el reporte en PDF o Excel. |  |  |  |
| Flujo alterno:<br>Fecha inicial mayor que la final: MSG-190. Fechas futuras o más de 366 días: MSG-191.<br>No hay ventas en el rango: MSG-192 con atajos de rango.<br>Si no se selecciona rango, se muestra el día de hoy.<br>Un día con anulaciones posteriores al cierre de caja se marca "Con ajustes" con MSG-200.<br>Se cambian los filtros tras consultar: MSG-196 y el reporte se marca como desactualizado.<br>Falla la descarga: MSG-201.<br>Un usuario sin rol Administrador entra por URL o servicio: MSG-39 (403). |  |  |  |
| Postcondición: El reporte de ventas del rango queda visible para el administrador. |  |  |  |
| Excepciones:<br>Falla al generar el reporte: MSG-194 con Reintentar; se registra el incidente.<br>Pérdida de conexión: MSG-09. |  |  |  |
| Reglas y mensajes aplicables: RV-133 a RV-137, RV-141 a RV-143; RN-116 a RN-118, RN-121 a RN-123; RNF-50 a RNF-54; MSG-190 a 192, 194, 196, 199 a 201, 09, 39. |  |  |  |


### CUS13.2: Consultar platos vendidos


<!-- tabla 88 -->
| Código: CUS13.2 | Título: Consultar platos vendidos (Vistas 13.2 y 13.3) | Fecha: 21.10.2026 | Iteración: 1/3 |
|---|---|---|---|
| Actor(es): Administrador |  |  |  |
| Prioridad: Alta (Must) | Complejidad: Media |  |  |
| Historia de usuario: HU33 Consultar platos vendidos (M) |  |  |  |
| Requerimiento de origen: RF-33 |  |  |  |
| Descripción: Permite al administrador consultar la cantidad de platos vendidos por producto de carta, por menú completo (con monto) y por componente (veces que se eligió, sin monto), por día o por rango de fechas, para saber cuántos platos se venden y comprobar que cuadran con el dinero. |  |  |  |
| Precondición: El administrador tiene sesión iniciada. |  |  |  |
| Flujo principal:<br>1. El administrador accede a REPORTES y abre la pestaña "Platos vendidos"; el sistema muestra los filtros con el día de hoy y el reporte de hoy ya consultado.<br>2. Opcionalmente elige un atajo o las fechas desde y hasta, y un producto del selector.<br>3. Pulsa CONSULTAR; el sistema valida el rango (RV-134) y deshabilita el botón.<br>4. El servidor consulta las ventas vigentes (excluye las anuladas) y agrupa por producto de carta, por menú completo y por componente (RN-138).<br>5. El sistema muestra, por producto, la categoría, la cantidad y el monto, con los subtotales por categoría, el total de platos y el monto del período, y aparte los menús completos vendidos (cantidad y monto) y las veces que se eligió cada componente (cantidad, sin monto).<br>6. El sistema compara el monto total con el total de ventas del rango y muestra "Cuadra con ventas" (MSG-197).<br>7. Si se eligió un producto, muestra además su cantidad por día dentro del rango (Vista 13.3).<br>8. Opcionalmente cambia el orden (cantidad, monto o nombre) o descarga el reporte. |  |  |  |
| Flujo alterno:<br>Rango no válido: MSG-190 o MSG-191.<br>No hay platos vendidos en el período: MSG-193 con atajos de rango.<br>Si no se selecciona fecha, se muestra el día de hoy.<br>Si el monto de los platos no coincide con el total de ventas: MSG-198 con la diferencia.<br>Un producto desactivado con ventas en el rango aparece con la marca "(inactivo)".<br>Se cambian los filtros tras consultar: MSG-196.<br>Falla la descarga: MSG-201.<br>Un usuario sin rol Administrador entra por URL o servicio: MSG-39 (403). |  |  |  |
| Postcondición: La cantidad de platos vendidos por producto queda visible y puede compararse con el total de ventas. |  |  |  |
| Excepciones:<br>Falla al generar la consulta: MSG-195 con Reintentar; se registra el incidente.<br>Pérdida de conexión: MSG-09. |  |  |  |
| Reglas y mensajes aplicables: RV-133 a RV-135, RV-138 a RV-143; RN-116 a RN-123, RN-138; RNF-50 a RNF-54, RNF-60; MSG-190, 191, 193, 195 a 198, 201, 09, 39. |  |  |  |


## 5. Interfaz (GUI)


<!-- tabla 89 -->
| Interfaz | RF | HU | CUS | Qué se hace dentro de la interfaz |
|---|---|---|---|---|
| 13. Reportes | RF-32 y RF-33 | HU32 y HU33 | CUS13 (13.1 y 13.2) | Consultar ventas por rango y platos vendidos (por producto, menú completo y componente), compararlos con el dinero y exportarlos a PDF y Excel (CSV). |


### Vista 13.1: Reporte de ventas (CUS13.1) — restaurante.app/reportes (pestaña "Ventas")


<!-- tabla 90 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 91 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Filtros de fecha | Desde y hasta con atajos Hoy, Ayer, Últimos 7 días, Este mes y Mes anterior; botón CONSULTAR. |
| 2 | Tarjetas de resumen | Cantidad de ventas, total general, efectivo y Yape. |
| 3 | Detalle por día | Fecha, ventas, efectivo, Yape y total; los días con anulaciones posteriores al cierre se marcan "Con ajustes" (MSG-200). |
| 4 | Pie informativo | MSG-199 sobre las ventas anuladas que no suman. |
| 5 | Exportación | DESCARGAR PDF y DESCARGAR EXCEL (CSV) con exactamente lo consultado. |


### Vista 13.2: Platos vendidos (CUS13.2) — restaurante.app/reportes (pestaña "Platos vendidos")


<!-- tabla 92 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 93 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Filtros | Fechas, atajos y selector de producto; botón CONSULTAR y aviso MSG-196 si se cambian después. |
| 2 | Productos de carta | Producto, categoría, cantidad y monto con subtotales por categoría; los desactivados con ventas con la marca "(inactivo)". |
| 3 | Menús completos y componentes | Menús completos con cantidad y monto; componentes con las veces que se eligió, sin monto. |
| 4 | Comprobación | "Cuadra con ventas" o la diferencia (MSG-198). |


### Vista 13.3: Detalle de un producto por día (CUS13.2) — restaurante.app/reportes (pestaña "Platos vendidos")


<!-- tabla 94 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 95 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Producto elegido | Cantidad vendida por día dentro del rango. |
| 2 | Sin ventas | MSG-193 con atajos de rango. |


## 6. Estados de la interfaz


<!-- tabla 96 -->
| Estado | Comportamiento visual |
|---|---|
| Inicial | Pestaña "Platos vendidos" con el día de hoy ya consultado y los atajos de rango visibles. |
| Consultando | Botón "Consultando…" deshabilitado y marcadores de posición en las tablas. |
| Reporte de ventas | Tarjetas grandes con total general, efectivo, Yape y cantidad de ventas; tabla por día; pie con MSG-199; días "Con ajustes" con ícono y texto. |
| Platos vendidos | Tabla por producto con categoría, cantidad y monto; subtotales por categoría; total de platos y monto; indicador "Cuadra con ventas". |
| Un producto elegido | Se agrega la tabla de cantidad por día del producto. |
| Sin datos | MSG-192 o MSG-193 con botones de atajo ("Ayer", "Últimos 7 días"). |
| Rango inválido | MSG-190 o MSG-191 bajo los campos; el reporte anterior se mantiene. |
| Filtros cambiados | MSG-196 junto a CONSULTAR; el reporte mostrado se marca como desactualizado. |
| Error | MSG-194 o MSG-195 con Reintentar; los filtros se conservan. |
| Descargando | Botones de descarga deshabilitados con "Preparando archivo…"; MSG-201 si falla. |
| Móvil | Tarjetas de resumen apiladas y tablas con desplazamiento horizontal; controles de al menos 44 px. |


## 7. Reglas de validación (RV)


<!-- tabla 97 -->
| Código | Regla | Elemento UI | Mensaje |
|---|---|---|---|
| RV-133 | Por defecto ambos reportes muestran el día de hoy. | Filtros de fecha | MSG-192, 193 |
| RV-134 | El rango admite una fecha o desde–hasta: "desde" no puede ser posterior a "hasta", no hay fechas futuras y el máximo es de 366 días; los atajos Hoy, Ayer, Últimos 7 días, Este mes y Mes anterior llenan las fechas. | Campos Desde y Hasta y atajos | MSG-190, 191 |
| RV-135 | Solo se cuentan ventas vigentes; las anuladas no suman, aunque su caja esté cerrada. | Todos los totales | MSG-199 |
| RV-136 | El reporte de ventas muestra cantidad de ventas, total general, total en efectivo, total por Yape y detalle por día; informa aparte las ventas anuladas del rango sin sumarlas. | Pestaña Ventas | MSG-192, 199 |
| RV-137 | Los días cuyo total difiere del cierre de caja por anulaciones posteriores se marcan "Con ajustes" con la explicación. | Fila del día | MSG-200 |
| RV-138 | Platos vendidos agrupa por producto con categoría, cantidad y monto; muestra el total de platos, el monto del período y subtotales por categoría; por defecto ordena por cantidad descendente y se puede ordenar por monto o nombre. | Pestaña Platos vendidos | MSG-193 |
| RV-139 | El filtro de producto permite elegir uno (incluye desactivados con ventas); al elegirlo se muestra su cantidad por día. | Selector de producto | — |
| RV-140 | El reporte de platos indica si su monto total coincide con el total del reporte de ventas del mismo rango y, si no, muestra la diferencia. | Indicador "Cuadra con ventas" | MSG-197, 198 |
| RV-141 | Mientras se consulta, el botón queda deshabilitado con "Consultando…"; si los filtros cambian tras consultar, se avisa que hay que pulsar CONSULTAR. | Botón CONSULTAR | MSG-196 |
| RV-142 | DESCARGAR PDF y DESCARGAR EXCEL exportan exactamente lo que se ve (mismo rango y filtros) e incluyen el rango y la fecha de generación. | Botones de descarga | MSG-201 |
| RV-143 | Los montos se muestran con prefijo "S/" y 2 decimales, y las cantidades como números enteros, alineados a la derecha. | Tablas | — |


## 8. Reglas de negocio y requerimientos no funcionales


<!-- tabla 98 -->
| Código | Regla |
|---|---|
| RN-116 | Solo el Administrador consulta los reportes. |
| RN-117 | Los reportes incluyen únicamente ventas vigentes; las anuladas no suman aunque su caja ya esté cerrada (RN-100). |
| RN-118 | La fecha de una venta es la fecha local (Lima) de su cobro. |
| RN-119 | El monto de un plato es la cantidad por el precio guardado en la línea del pedido (RN-51); un cambio de precio posterior no altera los reportes pasados. |
| RN-120 | Como no hay descuentos ni propinas (RN-87), el monto total de los productos de carta y los menús completos de un período es igual al total de ventas del mismo período; los componentes no suman monto (RN-138). |
| RN-121 | Un reporte puede diferir del cierre de caja de un día cuando hubo anulaciones posteriores; esos días se marcan "Con ajustes" (RN-101, RN-113). |
| RN-122 | Los reportes se calculan al consultar, no guardan copias y no modifican datos. |
| RN-123 | Cada exportación contiene solo lo consultado y se registra en auditoría con usuario, fecha, tipo de reporte y rango. |
| RNF-50 | La consulta responde en menos de 3 segundos con hasta 40,000 ventas en el rango (agregación en la base de datos con índices por fecha). |
| RNF-51 | Los montos usan tipo decimal con redondeo a 2 decimales (RNF-37); los reportes de ventas y de platos usan la misma fuente para que coincidan. |
| RNF-52 | La interfaz es adaptable a computadora, tablet y móvil (tablas con desplazamiento horizontal o tarjetas), con controles de al menos 44 px, encabezados de tabla accesibles y operable con teclado. |
| RNF-53 | El servidor valida token y rol Administrador en cada endpoint (RNF-02). |
| RNF-54 | El PDF es de tamaño A4 y el Excel es un archivo CSV en codificación UTF-8 que se abre en Excel. |
| RN-138 | Los reportes cuentan por separado los menús completos vendidos (con monto) y las veces que se eligió cada componente (sin monto), solo con ventas vigentes. |
| RNF-60 | El reporte por componente usa la tabla de opciones por línea y responde en 3 segundos o menos (RNF-50). |


## 9. Catálogo de mensajes

Se reutilizan MSG-09 (conexión) y MSG-39 (sin permiso).

<!-- tabla 99 -->
| Código | Mensaje (texto al usuario) | Tipo | Ubicación |
|---|---|---|---|
| MSG-190 | La fecha "desde" no puede ser posterior a "hasta". | Error | Bajo los campos de fecha |
| MSG-191 | El rango no puede incluir fechas futuras ni superar los 366 días. | Error | Bajo los campos de fecha |
| MSG-192 | No hay ventas en el rango seleccionado. Pruebe con otras fechas. | Informativo | En el reporte |
| MSG-193 | No hay platos vendidos en el período. Pruebe con otras fechas o con otro producto. | Informativo | En el reporte |
| MSG-194 | No se pudo generar el reporte de ventas. Intente nuevamente. (botón Reintentar) | Error | En el reporte |
| MSG-195 | No se pudieron consultar los platos vendidos. Intente nuevamente. (botón Reintentar) | Error | En el reporte |
| MSG-196 | Los filtros cambiaron. Pulse CONSULTAR para actualizar el reporte. | Aviso | Junto al botón CONSULTAR |
| MSG-197 | Cuadra con ventas: el monto de los platos coincide con el total vendido (S/ [x]). | Informativo | Indicador del reporte de platos |
| MSG-198 | El monto de los platos (S/ [x]) no coincide con el total vendido (S/ [y]). Diferencia: S/ [z]. Informe al equipo técnico. | Advertencia | Indicador del reporte de platos |
| MSG-199 | Incluye [n] venta(s) anulada(s) por S/ [x] que no se suman. | Informativo | Pie del resumen |
| MSG-200 | Este día incluye anulaciones posteriores al cierre de caja. Vea el historial de cierres. | Informativo | Fila del día "Con ajustes" |
| MSG-201 | No se pudo descargar el archivo. Intente nuevamente. | Error | Junto a los botones de descarga |


## 10. Diccionario de datos


<!-- tabla 100 -->
| Campo | Tipo | Obligatorio | Longitud / formato | Notas |
|---|---|---|---|---|
| Desde y Hasta | Fecha | Sí (por defecto, hoy) | Sin fechas futuras; máx. 366 días | Con atajos de rango |
| Producto (filtro) | Lista | No | Todos o uno (incluye desactivados con ventas) | Muestra el detalle por día |
| Orden | Lista | No | Cantidad, Monto o Nombre | Por defecto, cantidad descendente |
| Cantidad de ventas, total general, efectivo y Yape | Entero y decimal (8,2) | Calculado | S/ 0.00 | Solo ventas vigentes |
| Ventas anuladas del rango | Entero y decimal | Calculado | Cantidad y monto | Informativo; no suma |
| Detalle por día | Lista | Calculado | Fecha, ventas, efectivo, Yape, total, "Con ajustes" | — |
| Producto, categoría, cantidad y monto | Texto, texto, entero, decimal | Calculado | Cantidad × precio guardado | Agrupado por producto |
| Total de platos y monto del período; subtotales por categoría | Entero y decimal | Calculado | — | — |
| Coincidencia con ventas | Indicador | Calculado | Cuadra / diferencia | Compara con el reporte de ventas |
| Cantidad por día de un producto | Lista | Calculado | Fecha y cantidad | Solo al elegir un producto |
| Menú completo vendido | Registro | Calculado | Nombre, cantidad y monto | Solo ventas vigentes (RN-138) |
| Componente elegido | Registro | Calculado | Rol, nombre y veces elegido | Sin monto (RN-138) |


## 11. Contrato de API

Todos los endpoints exigen token JWT con rol Administrador (401 sin token válido, 403 con otro rol).

<!-- tabla 101 -->
| Endpoint | Entrada | Respuestas |
|---|---|---|
| GET /api/reportes/ventas | desde, hasta | 200: { desde, hasta, nVentas, total, efectivo, yape, anuladas{ cantidad, monto }, porDia[{ fecha, nVentas, efectivo, yape, total, conAjustes }] }. 400: rango inválido (desde_mayor, futuro o rango_largo). |
| GET /api/reportes/platos | desde, hasta, productoId? | 200: { totalPlatos, totalMonto, totalVentas, coincide, subtotales[{ categoria, cantidad, monto }], menusCompletos[{ menu, cantidad, monto }], componentes[{ rol, componente, veces }], items[{ productoId, producto, categoria, activo, cantidad, monto }], porDia[{ fecha, cantidad }] (solo con productoId) }. 400: rango inválido. 404: producto no existe. |
| GET /api/reportes/ventas/exportar | desde, hasta, formato (pdf \| csv) | 200: archivo con exactamente lo consultado. 400: rango inválido. |
| GET /api/reportes/platos/exportar | desde, hasta, productoId?, formato (pdf \| csv) | 200: archivo con exactamente lo consultado. 400: rango inválido. |


## 12. Escenarios de validación y criterios de aceptación


<!-- tabla 102 -->
| ID | Entrada / acción | Resultado esperado | Reglas | HU |
|---|---|---|---|---|
| E-344 | El administrador entra a REPORTES | Se abre "Platos vendidos" con el día de hoy ya consultado. | RV-133 | HU33 |
| E-345 | Usar los atajos Ayer, Últimos 7 días, Este mes y Mes anterior | Los campos de fecha se llenan con el rango correspondiente. | RV-134 | HU32, HU33 |
| E-346 | Consultar un rango válido en "Ventas" | Muestra cantidad de ventas, total general, efectivo, Yape y el detalle por día. | RV-136 | HU32 |
| E-347 | El rango incluye ventas anuladas | No suman; el pie muestra MSG-199 con su cantidad y monto. | RV-135, RN-117 | HU32 |
| E-348 | Un día tiene una anulación posterior al cierre de caja | El día se marca "Con ajustes" con MSG-200; el total del reporte difiere del cierre original. | RV-137, RN-121 | HU32 |
| E-349 | Rango invertido; rango futuro o de más de 366 días | MSG-190 o MSG-191; el reporte anterior se mantiene. | RV-134 | HU32, HU33 |
| E-350 | Rango sin ventas | MSG-192 en Ventas o MSG-193 en Platos vendidos, con atajos. | RV-133 | HU32, HU33 |
| E-351 | Platos vendidos con 45 "Menú almuerzo" y 18 "Menú desayuno" | Cada producto con su categoría, cantidad y monto, subtotales por categoría, total de platos 63 y el monto del período. | RV-138, RN-119 | HU33 |
| E-352 | Cambiar el orden de la tabla | Por defecto cantidad descendente; también por monto o por nombre. | RV-138 | HU33 |
| E-353 | Elegir un producto en el filtro | Se muestra su cantidad por día dentro del rango. | RV-139 | HU33 |
| E-354 | Un producto desactivado con ventas en el rango | Aparece con la marca "(inactivo)" y se puede elegir. | RV-139 | HU33 |
| E-355 | Comparar platos con ventas en el mismo rango | "Cuadra con ventas" (MSG-197): el monto de los platos es igual al total vendido. | RV-140, RN-120 | HU33 |
| E-356 | Datos inconsistentes (monto de platos distinto del total) | MSG-198 con la diferencia. | RV-140 | HU33 |
| E-357 | La administradora cambia un precio después de las ventas | Los reportes de fechas pasadas conservan sus montos. | RN-119 | HU32, HU33 |
| E-358 | Cambiar los filtros después de consultar | MSG-196; el reporte no se actualiza solo y se marca como desactualizado. | RV-141 | HU32, HU33 |
| E-359 | Doble clic en CONSULTAR | Se hace una sola consulta; el botón muestra "Consultando…". | RV-141 | HU32, HU33 |
| E-360 | Falla del servidor al consultar | MSG-194 o MSG-195 con Reintentar; los filtros se conservan. | RNF-53 | HU32, HU33 |
| E-361 | DESCARGAR PDF | PDF A4 con el mismo contenido, el rango y la fecha de generación. | RV-142, RNF-54 | HU32, HU33 |
| E-362 | DESCARGAR EXCEL | Archivo CSV UTF-8 con las mismas filas y totales. | RV-142, RNF-54 | HU32, HU33 |
| E-363 | Falla la descarga | MSG-201. | RV-142 | HU32, HU33 |
| E-364 | Un cajero, mozo o el cocinero entra a REPORTES por URL o servicio | 403 y MSG-39; la opción no aparece en su menú. | RN-116 | HU32, HU33 |
| E-365 | Consultar el mismo rango en "Ventas" y en "Platos vendidos" | El total general y el monto total de platos son iguales. | RN-120, RNF-51 | HU32, HU33 |
| E-366 | Solo teclado | Tab recorre filtros, pestañas, botones y tablas; Enter consulta; los encabezados de tabla son legibles para lectores de pantalla. | RNF-52 | HU32, HU33 |
| E-367 | Consultar 366 días con unas 100 ventas diarias | La respuesta llega en 3 segundos o menos. | RNF-50 | HU32, HU33 |
| E-400 | Reporte de platos del día | Menús completos con cantidad y monto; componentes con cantidad; "Cuadra con ventas". | RN-138, RNF-60 | HU33 |


## 13. Matriz de justificación de usabilidad


<!-- tabla 103 -->
| Principio aplicado | Elemento de la interfaz | Decisión adoptada | Justificación |
|---|---|---|---|
| ISO 9241 – Eficacia | Indicador "Cuadra con ventas" | El sistema compara platos y dinero y lo dice con palabras | La dueña comprueba el cuadre sin calcular |
| ISO 9241 – Eficiencia | Atajos de rango y reporte de hoy precargado | Un toque para Ayer, Últimos 7 días o Este mes; el día de hoy ya está consultado | Menos pasos para lo más habitual |
| ISO 9241 – Satisfacción | Tarjetas de resumen y subtotales | Total, efectivo y Yape en tarjetas grandes; subtotales por categoría | Lectura clara de un vistazo |
| Nielsen 1 – Visibilidad del estado | Aviso de filtros cambiados y "Consultando…" | El reporte se marca como desactualizado y el botón muestra el proceso | Sabe si lo que ve corresponde a sus filtros |
| Nielsen 2 – Mundo real | Textos y categorías | "Desayuno", "Almuerzo", "Efectivo", "Yape", "Con ajustes" | Mismo lenguaje del negocio |
| Nielsen 3 – Control y libertad | Filtros y ordenamiento | Cambiar rango, producto u orden sin perder la pantalla | Explora sin penalización |
| Nielsen 4 – Consistencia | Filtros y tablas | Mismos filtros de fecha y atajos que ventas y el historial de cierres | Evita reaprendizaje |
| Nielsen 5 – Prevención de errores | Validación del rango | No permite rangos invertidos, futuros ni demasiado largos | Evita consultas inútiles o pesadas |
| Nielsen 6 – Reconocimiento | Atajos y selector de producto | Rangos con nombre propio y lista de productos | No obliga a recordar fechas ni nombres |
| Nielsen 8 – Minimalismo | Dos pestañas | Cada una con solo lo necesario | Sin distracciones |
| Nielsen 9 – Recuperarse de errores | Mensajes MSG-190 a 193 y 198 | Explican qué corregir o intentar | Facilita corregir |
| Shneiderman 1 – Consistencia | Estilo y acciones | Misma paleta, botones y mensajes del sistema | Comportamiento predecible |
| Shneiderman 2 – Usabilidad universal | Tablas accesibles y móvil | Encabezados accesibles, contraste 4.5:1, desplazamiento horizontal y controles de 44 px | Atiende distintos dispositivos y niveles |
| Shneiderman 3 – Retroalimentación | Avisos y estados | MSG-196 a 200 informan cada situación | Sabe qué pasó |
| Shneiderman 4 – Cierre | Reporte completo con totales | Cada consulta termina con totales y comparación | Indica que la tarea concluyó |
| Shneiderman 5 – Prevenir errores | Validaciones | Rango válido y botón bloqueado mientras consulta | Evita consultas duplicadas |
| Shneiderman 6 – Reversión | Atajos y filtros | Volver a "Hoy" con un toque | Acciones reversibles |
| Shneiderman 7 – Control del usuario | Consulta explícita | El reporte cambia solo cuando pulsa CONSULTAR | Mantiene el control |
| Shneiderman 8 – Memoria a corto plazo | Totales, rango y pie visibles | El rango consultado y los totales permanecen a la vista | No debe recordar qué consultó |


## 14. Matriz de trazabilidad


### 14.1 Requerimiento → historia → caso de uso → vista → prueba


<!-- tabla 104 -->
| RF | HU | CUS | Vista | Reglas / mensajes | API | Escenarios |
|---|---|---|---|---|---|---|
| RF-32 Reporte de ventas por rango | HU32 (S) | CUS13.1 | 13.1 | RV-133 a 137, 141 a 143; RN-116 a 118, 121 a 123; MSG-190 a 192, 194, 196, 199 a 201 | GET /api/reportes/ventas y /exportar | E-345 a E-350, E-357 a E-360, E-365, E-367 |
| RF-33 Platos vendidos por producto | HU33 (M) | CUS13.2 | 13.2 y 13.3 | RV-133 a 135, 138 a 143; RN-116 a 123; MSG-190, 191, 193, 195 a 198, 201; RN-138, RNF-60 | GET /api/reportes/platos y /exportar | E-344, E-345, E-349 a E-360, E-365, E-400 |


### 14.2 Regla → elemento de interfaz → escenario


<!-- tabla 105 -->
| Regla | Elemento de interfaz | Escenario |
|---|---|---|
| RV-133 | Filtros precargados con el día de hoy | E-344, E-350 |
| RV-134 | Campos Desde y Hasta y atajos | E-345, E-349 |
| RV-135 / RN-117 | Totales sin ventas anuladas y pie MSG-199 | E-347 |
| RV-136 | Tarjetas y tabla por día del reporte de ventas | E-346 |
| RV-137 / RN-121 | Etiqueta "Con ajustes" y MSG-200 | E-348 |
| RV-138 / RN-119 | Tabla de platos, subtotales y orden | E-351, E-352, E-357 |
| RV-139 | Selector de producto y detalle por día | E-353, E-354 |
| RV-140 / RN-120 | Indicador "Cuadra con ventas" | E-355, E-356, E-365 |
| RV-141 | Botón "Consultando…" y aviso de filtros cambiados | E-358, E-359 |
| RV-142 / RN-123 / RNF-54 | Botones DESCARGAR PDF y DESCARGAR EXCEL | E-361 a E-363 |
| RN-116 | Opción visible solo para el Administrador; 403 en el servidor | E-364 |
| RNF-50 | Agregación en base de datos con índices por fecha | E-367 |
| RNF-52 | Tablas accesibles y orden de tabulación | E-366 |


## 15. Evaluación del prototipo y mejoras incorporadas

Aún no hay prototipo de los reportes; las decisiones siguientes aplican lo aprendido en los CUS anteriores.

<!-- tabla 106 -->
| Riesgo previsto | Principio | Decisión de diseño incorporada |
|---|---|---|
| Elegir mal el rango de fechas | Nielsen 5 y 6 | Atajos con nombre, validación del rango y mensajes claros |
| No entender por qué un día no coincide con el cierre | Nielsen 1 y 9 | Etiqueta "Con ajustes" con su explicación y enlace al historial |
| Tablas largas en el celular | Shneiderman 2 | Tarjetas de resumen arriba y tablas con desplazamiento horizontal |
| Comprobar el cuadre sin saber calcular | Nielsen 1; Shneiderman 8 | Indicador "Cuadra con ventas" con el monto |
| Confundir ventas con ventas anuladas | Nielsen 1 | Totales sin anuladas y un pie aparte con su cantidad y monto |
| Ver datos desactualizados | Nielsen 1; Shneiderman 7 | Aviso de filtros cambiados y consulta solo al pulsar CONSULTAR |
| Estilo distinto al resto del sistema | Shneiderman 1; Nielsen 4 | Reutilizar paleta, botones, filtros y avisos de los CUS anteriores |


## 16. Dependencias con otros casos de uso


<!-- tabla 107 -->
| CUS relacionado | Relación con el CUS13 |
|---|---|
| CUS10 y CUS11 Cobro y ventas | Las ventas vigentes y sus líneas (con el precio guardado) son la fuente de ambos reportes; las anuladas (CUS11.2) no suman. |
| CUS12 Caja | El cierre muestra los mismos platos vendidos (conviene reutilizar la consulta); los días con anulaciones posteriores se marcan "Con ajustes" y se enlazan al historial de cierres. |
| CUS03 Gestión de productos | Los productos y sus categorías; los desactivados con ventas siguen apareciendo en los reportes. |
| CUS06 y CUS07 Pedidos | Las observaciones de texto libre (por ejemplo, "presa de pescado") no se agrupan en los reportes. |


<!-- tabla 108 -->
| N.º | Punto | Decisión adoptada o tarea |
|---|---|---|
| 1 | La dueña quiere saber cuántos platos se venden. Los menús completos y los componentes ya se cuentan por separado (RN-138), pero las variantes escritas como texto libre en la observación (por ejemplo, "presa de pescado") siguen sin agruparse. | Decisión: las variantes en texto libre no se agrupan; las observaciones rápidas quedan como mejora futura. |
| 2 | El reporte de platos vendidos aparece también en el cierre de caja (CUS12.2) y aquí (CUS13.2). | Implementar una sola consulta y reutilizarla en ambas pantallas. |
| 3 | Como los reportes reflejan el estado actual, un día puede diferir de su cierre de caja cuando hubo anulaciones posteriores. | Decisión: se acepta la marca "Con ajustes" (RN-121). |
| 4 | Los RF no incluyen reportes por mozo, por cajero, por hora ni anulaciones por usuario, aunque los datos para varios de ellos ya se guardan. | Decisión: los reportes por mozo, cajero, hora y anulaciones por usuario quedan como mejora futura. |
| 5 | La exportación a PDF y Excel, el aviso de ventas anuladas, los subtotales por categoría, el indicador "Cuadra con ventas" y los atajos de rango amplían RF-32 y RF-33. | Decisión: se aceptan las ampliaciones de RF-32 y RF-33. |
| 6 | Los gráficos no están incluidos. | Dejarlos como mejora futura si sobra tiempo en la tercera iteración. |
| 7 | "Platos" en los reportes. | Resuelto: "platos" son los productos de carta, los menús completos y los componentes (RN-138). |
| 8 | Aún no existen bocetos de las Vistas 13.1 a 13.3. | Diseñarlas en Figma con los estados de la sección 7, empezando por la vista móvil de las tarjetas de resumen. |


# CUS14: Pantalla de inicio (dashboard del Administrador)


## 1. Ficha del CUS general


<!-- tabla 109 -->
| Campo | Detalle |
|---|---|
| CUS general | CUS14: Pantalla de inicio (dashboard del Administrador) |
| Interfaz (GUI) | Interfaz 14: Inicio |
| Actor(es) | Administrador |
| HU / RF de origen | HU34 / RF-34 |
| Descripción | La pantalla de inicio (/inicio) es el destino de todo usuario tras iniciar sesión (CUS01.1). Este CUS define el contenido del panel del Administrador: ventas, platos vendidos, pedidos, mesas, caja, menú del día y alertas, para saber cómo va el negocio sin revisar cada módulo. |
| Alcance | No crea ni modifica datos. El panel de tareas y los accesos rápidos de Cajero, Mozo y Cocinero es navegación y se documenta como lineamiento de diseño en el Anexo B (no es RF ni CUS). |


<!-- tabla 110 -->
| CUS | Título | Actor | HU | RF | Prioridad | Iteración | Complejidad |
|---|---|---|---|---|---|---|---|
| CUS14.1 | Ver indicadores del día | Administrador | HU34 | RF-34 | Media (Should) | 2/3 | Media |

Criterio: la prioridad se obtiene de la validación MoSCoW de la HU (Must = Alta, Should = Media, Could = Baja) y la iteración sigue la prioridad (Alta = 1/3, Media = 2/3, Baja = 3/3).

## 2. Decisiones adoptadas


<!-- tabla 111 -->
| Tema | Decisión | Vacío que cubre |
|---|---|---|
| Qué es | La pantalla de inicio (/inicio): destino de todo usuario tras iniciar sesión. Para el Administrador muestra los indicadores del día; el panel de los demás roles es un lineamiento de diseño (Anexo B). No crea ni modifica datos. | CUS01 y RF-34, RF-40 |
| Administrador | Ventas de hoy (total, efectivo, Yape y cantidad de ventas), platos vendidos hoy (total y los 5 principales entre menús completos y productos de carta, por cantidad), pedidos por estado, mesas libres y ocupadas, estado de la caja, menú de hoy, último cierre y alertas. | RF-34 |
| Alertas del Administrador | En orden de importancia: caja de un día anterior sin cerrar; menú de hoy sin definir (solo con la caja del día abierta); comandas con más de 15 minutos de espera; platos agotados; ventas anuladas hoy; último cierre con diferencia. Cada una con ícono, texto y enlace a su solución. Sin alertas: "Todo en orden". | Faltaba definir qué alerta |
| Misma fuente que los demás CUS | Las cifras salen de las mismas consultas de reportes, pedidos, mesas, comandas, menú y caja, para que coincidan con cada pantalla. | Faltaba la regla |
| Tocar un indicador | Lleva a la pantalla de detalle con el filtro aplicado (por ejemplo, pedidos "Listo" o los platos de hoy en Reportes). | Faltaba la regla |
| Período | Solo el día de hoy (hora de Lima); para otros períodos se usa Reportes (CUS13). Sin gráficos ni comparaciones. | Faltaba el alcance |
| Actualización | Cada 30 segundos para el Administrador y cada 15 para los demás, sin mover lo que se está leyendo; muestra "Actualizado hace X s" y botón ACTUALIZAR; se pausa si la pestaña no está visible. | Faltaba definir la sincronización |
| Bloques independientes | Si un bloque falla, solo ese muestra el error con Reintentar y los demás siguen visibles. | Faltaba la regla |
| Iteración | Iteración 2/3 (regla Media = 2/3). Como el panel resume lo que producen otros CUS, cada bloque es independiente y muestra «—» mientras su origen no esté disponible (RNF-63). Mientras tanto, /inicio muestra el saludo y el menú del rol. | Faltaba la planificación |


## 3. Análisis del usuario (Diseño Centrado en el Usuario)


<!-- tabla 112 -->
| Aspecto | Descripción |
|---|---|
| Quién usa la interfaz | Los cuatro roles: la dueña (Administrador) para tener el panorama del negocio; el cajero, el mozo y el cocinero para saber qué tienen pendiente. Es lo primero que ve cada uno al ingresar. |
| Necesidades | Administrador: saber en cinco segundos cuánto lleva vendido, cuántos platos, qué está pendiente y si algo requiere su atención. Cajero: si la caja está abierta y qué debe cobrar. Mozo: qué mesas están libres y si su pedido ya está listo. Cocinero: cuántas comandas tiene y cuál es la más antigua. |
| Dificultades previsibles | Exceso de información que abruma; no entender un número sin contexto; no saber qué hacer ante una alerta; ver datos desactualizados; leer en una pantalla pequeña; ver información que no le corresponde. |
| Contexto de uso | Primera pantalla del día y pantalla a la que se vuelve muchas veces; lectura rápida, de pie, en celular o computadora, con prisa en hora pico. |


## 4. Plantillas de casos de uso


### CUS14.1: Ver indicadores del día


<!-- tabla 113 -->
| Código: CUS14.1 | Título: Ver indicadores del día (Vista 14.1) | Fecha: 21.10.2026 | Iteración: 2/3 |
|---|---|---|---|
| Actor(es): Administrador |  |  |  |
| Prioridad: Media (Should) | Complejidad: Media |  |  |
| Historia de usuario: HU34 Ver indicadores del día (S) |  |  |  |
| Requerimiento de origen: RF-34 |  |  |  |
| Descripción: Permite al administrador ver al ingresar el resumen del día (ventas, platos vendidos, pedidos, mesas, caja, menú y alertas) para saber cómo va el negocio sin revisar cada módulo. |  |  |  |
| Precondición: El administrador tiene sesión iniciada. |  |  |  |
| Flujo principal:<br>1. El administrador inicia sesión y el sistema lo lleva a su pantalla de inicio; los bloques muestran "Cargando…".<br>2. El sistema consulta, para hoy, las ventas vigentes, los platos vendidos, los pedidos por estado, las mesas, la caja, el menú, el último cierre y las alertas.<br>3. Muestra primero las alertas (o "Todo en orden") y luego las tarjetas: ventas de hoy (total, efectivo, Yape y cantidad), platos vendidos (total y los 5 principales entre menús completos y productos de carta, por cantidad), pedidos por estado, mesas libres y ocupadas, estado de la caja, menú de hoy y último cierre.<br>4. El administrador toca un indicador o una alerta y el sistema abre la pantalla de detalle con el filtro aplicado (Pedidos, Mesas, Caja, Menú, Reportes o Ventas).<br>5. El panel se actualiza solo cada 30 segundos y muestra "Actualizado hace X s"; también puede pulsar ACTUALIZAR. |  |  |  |
| Flujo alterno:<br>Sin ventas hoy: ceros visibles y MSG-202.<br>Sin alertas: MSG-203.<br>Caja de un día anterior sin cerrar: alerta prioritaria con MSG-168 y enlace para cerrarla.<br>Menú de hoy sin definir y caja del día abierta: alerta MSG-204 con enlace a Menú del día.<br>Comandas con más de 15 minutos de espera, platos agotados, ventas anuladas hoy o último cierre con diferencia: alertas MSG-205 a MSG-208.<br>Un bloque no carga: MSG-209 con Reintentar solo en ese bloque; los demás siguen visibles.<br>Falla total o sin conexión: MSG-210, o los últimos datos con la antigüedad.<br>Un usuario sin rol Administrador pide estos datos por servicio: no recibe esos bloques y se responde 403 con MSG-39. |  |  |  |
| Postcondición: El administrador ve el resumen del día y las alertas que requieren su atención, con enlaces para resolverlas. |  |  |  |
| Excepciones:<br>Falla de uno o más bloques: MSG-209 y se registra el incidente.<br>Falla total: MSG-210 con Reintentar.<br>Pérdida de conexión: MSG-09. |  |  |  |
| Reglas y mensajes aplicables: RV-144 a RV-153; RN-124 a RN-129; RNF-62 a RNF-65; MSG-202 a 211, 168, 09, 39. |  |  |  |


## 5. Interfaz (GUI)


<!-- tabla 114 -->
| Interfaz | RF | HU | CUS | Qué se hace dentro de la interfaz |
|---|---|---|---|---|
| 14. Inicio (dashboard) | RF-34 | HU34 | CUS14 (14.1) | Ver el resumen del día del Administrador y llegar con un toque a la pantalla que resuelve cada alerta o indicador. |


### Vista 14.1: Panel del Administrador (CUS14.1) — restaurante.app/inicio


<!-- tabla 115 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 116 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Alertas | Primero, en orden de importancia, con ícono, texto y enlace a su solución (MSG-203 a 208) o "Todo en orden" (MSG-203). |
| 2 | Ventas de hoy | Total, efectivo, Yape y cantidad de ventas; ceros visibles y MSG-202 si no hay ventas. |
| 3 | Platos vendidos | Total y los 5 principales entre menús completos y productos de carta, por cantidad. |
| 4 | Pedidos por estado | Pendiente, en preparación, listo, por cobrar, pagado y anulado; al tocar un estado se abre la lista filtrada (CUS08.1). |
| 5 | Mesas y caja | Mesas libres y ocupadas; estado de la caja con hora, usuario y efectivo esperado. |
| 6 | Menú de hoy y último cierre | Platos del menú y agotados; fecha, resultado y diferencia del último cierre. |
| 7 | Actualización | "Actualizado hace X s", botón ACTUALIZAR y refresco cada 30 segundos; cada bloque con error muestra MSG-209 con Reintentar. |


## 6. Estados de la interfaz


<!-- tabla 117 -->
| Estado | Comportamiento visual |
|---|---|
| Cargando | Marcadores de posición por bloque ("Cargando…"), sin bloquear la pantalla. |
| Panel del Administrador | Alertas arriba; cuatro tarjetas grandes (ventas de hoy, platos vendidos, pedidos, mesas y caja); lista de los 5 productos principales; menú de hoy y último cierre; accesos rápidos. |
| Sin ventas hoy | Ceros visibles y MSG-202. |
| Sin alertas | Bloque con MSG-203 y un ícono tranquilo. |
| Con alertas | Lista ordenada por importancia con ícono, texto y enlace; las que impiden trabajar (caja sin cerrar) arriba y resaltadas. |
| Acceso deshabilitado | Botón atenuado con el motivo al enfocarlo o tocarlo (por ejemplo, MSG-211). |
| Actualizando | Indicador discreto "Actualizando…" sin mover el contenido. |
| Bloque con error | MSG-209 con Reintentar solo en ese bloque. |
| Error total o sin conexión | MSG-210 con Reintentar, o los últimos datos con "Sin conexión, datos de hace X s". |
| Móvil | Una columna: alertas y accesos rápidos primero, luego las tarjetas; controles de al menos 44 px. |


## 7. Reglas de validación (RV)


<!-- tabla 118 -->
| Código | Regla | Elemento UI | Mensaje |
|---|---|---|---|
| RV-144 | Al iniciar sesión el usuario llega a su pantalla de inicio con solo los bloques de su rol; el servidor decide qué datos envía según el rol. | Pantalla de inicio | MSG-39 |
| RV-145 | Los indicadores del Administrador se calculan para hoy (hora de Lima) con ventas vigentes y coinciden con los reportes del mismo día. | Tarjetas de ventas y platos | MSG-202 |
| RV-146 | Cada indicador muestra título, valor y, cuando corresponde, un enlace a su pantalla de detalle con el filtro aplicado. | Tarjetas | — |
| RV-147 | Las alertas se muestran ordenadas por importancia, con ícono, texto y enlace de solución; sin alertas se muestra "Todo en orden". | Bloque de alertas | MSG-203 a 208 |
| RV-148 | El panel se actualiza solo (cada 30 s el Administrador, cada 15 s los demás) sin mover lo que se está leyendo, y muestra "Actualizado hace X s" con un botón ACTUALIZAR. | Encabezado del panel | — |
| RV-149 | Si un bloque no se puede cargar, solo ese bloque muestra el error con Reintentar y el resto sigue visible. | Bloque afectado | MSG-209, 210 |
| RV-150 | Los montos se muestran con prefijo "S/" y 2 decimales, las cantidades como enteros y los ceros como 0, nunca vacíos. | Tarjetas | MSG-202 |
| RV-151 | Los accesos rápidos solo muestran las funciones permitidas al rol; las que no se pueden usar aparecen deshabilitadas con el motivo. | Botones de acceso rápido | MSG-211 |
| RV-152 | El estado de cada elemento se comunica con texto además del color (Abierta / Cerrada, Libre / Ocupada, Demora, Cuadra / Faltante / Sobrante). | Insignias | — |
| RV-153 | En móvil los bloques se apilan en una columna, con las alertas y los accesos rápidos primero. | Diseño responsivo | — |


## 8. Reglas de negocio y requerimientos no funcionales


<!-- tabla 119 -->
| Código | Regla |
|---|---|
| RN-124 | La pantalla de inicio es el destino de todo usuario tras iniciar sesión (CUS01) y su contenido depende del rol. |
| RN-125 | Solo el Administrador ve los indicadores de ventas del día, los platos vendidos y las alertas de control; el Cajero ve solo el resumen de su caja; el Mozo y el Cocinero no ven montos. |
| RN-126 | El panel no crea ni modifica datos: reutiliza las consultas de reportes, pedidos, mesas, comandas, menú y caja, para que sus cifras coincidan con las de cada pantalla. |
| RN-127 | El panel del Administrador muestra solo el día de hoy; para otros períodos se usa Reportes (CUS13). |
| RN-128 | Las alertas del Administrador son: caja de un día anterior sin cerrar (RN-108), menú de hoy sin definir (solo con la caja del día abierta), comandas con más de 15 minutos de espera, platos agotados, ventas anuladas hoy y último cierre con diferencia. |
| RN-129 | Los accesos rápidos respetan los permisos del rol y el servidor valida cada destino (403 si no corresponde). |
| RNF-62 | El panel carga en menos de 2 segundos; cada bloque usa consultas agregadas ya existentes y el servidor no envía datos que el rol no puede ver. |
| RNF-63 | Un solo endpoint por rol agrupa los bloques, y cada bloque es independiente: si uno falla, los demás llegan. |
| RNF-64 | La interfaz es adaptable a computadora, tablet y móvil, con controles de al menos 44 px, contraste 4.5:1, tarjetas con enlaces accesibles y operable con teclado (RNF-04). |
| RNF-65 | La actualización automática no lanza una nueva consulta mientras otra está en curso y se pausa si la pestaña no está visible. |


## 9. Catálogo de mensajes

Se reutilizan MSG-135 (caja cerrada), MSG-168 (caja de un día anterior sin cerrar, CUS12.1), MSG-09 (conexión) y MSG-39 (sin permiso).

<!-- tabla 120 -->
| Código | Mensaje (texto al usuario) | Tipo | Ubicación |
|---|---|---|---|
| MSG-202 | Todavía no hay ventas registradas hoy. | Informativo | Tarjeta de ventas |
| MSG-203 | Todo en orden: no hay alertas por atender. | Informativo | Bloque de alertas |
| MSG-204 | El menú de hoy aún no está definido. (enlace "Definir menú") | Alerta | Bloque de alertas |
| MSG-205 | [n] comanda(s) llevan más de 15 minutos de espera. (enlace "Ver pedidos") | Alerta | Bloque de alertas |
| MSG-206 | [n] plato(s) agotado(s) hoy. (enlace "Ver menú") | Alerta | Bloque de alertas |
| MSG-207 | [n] venta(s) anulada(s) hoy por S/ [x]. (enlace "Ver ventas") | Alerta | Bloque de alertas |
| MSG-208 | El último cierre ([fecha]) tuvo [faltante / sobrante] de S/ [x]. (enlace "Ver cierre") | Alerta | Bloque de alertas |
| MSG-209 | No se pudo cargar este bloque. Intente nuevamente. (botón Reintentar) | Error | Bloque afectado |
| MSG-210 | No se pudo cargar el panel. Intente nuevamente. (botón Reintentar) | Error | Pantalla de inicio |
| MSG-211 | Abra la caja primero. | Ayuda | Botón COBRAR deshabilitado |


## 10. Diccionario de datos


<!-- tabla 121 -->
| Campo | Tipo | Para quién | Formato | Notas |
|---|---|---|---|---|
| Fecha del panel | Fecha | Todos | Hoy (hora de Lima) | Fija |
| Ventas de hoy (cantidad, total, efectivo, Yape) | Entero y decimal (8,2) | Administrador | S/ 0.00 | Solo ventas vigentes |
| Platos vendidos hoy (total y 5 principales) | Entero y lista | Administrador | Producto y cantidad | Misma fuente que Reportes |
| Pedidos por estado | Enteros | Administrador | Pendiente, En preparación, Listo, Por cobrar, Pagado, Anulado | Cada uno enlaza a la lista filtrada |
| Mesas libres y ocupadas | Enteros | Administrador, Mozo | Cantidad | Misma fuente que Mesas |
| Estado de la caja | Lista y datos | Administrador, Cajero | Sin abrir / Abierta / Cerrada / Anterior sin cerrar | Con resumen parcial para el Cajero |
| Menú de hoy | Datos | Administrador | Definido (platos, agotados) o sin definir | — |
| Último cierre | Datos | Administrador | Fecha, resultado y diferencia | — |
| Alertas | Lista | Administrador | Tipo, texto, enlace, prioridad | Ordenadas por importancia |
| Pedidos por cobrar y listos | Entero y decimal | Cajero | Cantidad y monto | Sin totales del negocio |
| Mis pedidos en curso y listos | Enteros | Mozo | Cantidad | Solo los suyos |
| Comandas y comanda más antigua | Enteros y minutos | Cocinero | Cantidad y minutos | "Demora" desde 15 minutos |
| Accesos rápidos | Lista | Todos | Según el rol | Con motivo si están deshabilitados |


## 11. Contrato de API

Todos los endpoints exigen token JWT (401 sin token válido). El servidor arma la respuesta según el rol del token: no envía bloques que el rol no puede ver (403 si se pide un bloque ajeno). El mismo endpoint sirve el panel de los demás roles (Anexo B).

<!-- tabla 122 -->
| Endpoint | Entrada | Respuestas |
|---|---|---|
| GET /api/inicio | — | 200: { rol, fecha, bloques{ … } }, donde cada bloque es independiente { estado (ok \| error), datos }. Administrador: ventasHoy{ nVentas, total, efectivo, yape }, platosHoy{ total, principales[{ producto, cantidad }] }, pedidosPorEstado{ pendiente, enPreparacion, listo, porCobrar, pagado, anulado }, mesas{ libres, ocupadas }, caja{ estado, desde, usuario, efectivoEsperado }, menu{ definido, platos, agotados }, ultimoCierre{ fecha, resultado, diferencia }, alertas[{ tipo, texto, enlace, prioridad }]. Cajero: caja{ estado, ventas, efectivo, yape, total }, porCobrar{ cantidad, monto }, listos{ cantidad }. Mozo: mesas{ libres, ocupadas }, misPedidosEnCurso, misListos. Cocinero: comandas{ pendientes, enPreparacion, masAntiguaMinutos }, agotados. |
| GET /api/inicio/{bloque} | bloque (nombre del bloque) | 200: solo ese bloque, para el botón Reintentar. 403: el rol no puede ver ese bloque. 404: bloque inexistente. |


## 12. Escenarios de validación y criterios de aceptación


<!-- tabla 123 -->
| ID | Entrada / acción | Resultado esperado | Reglas | HU |
|---|---|---|---|---|
| E-405 | Cualquier usuario inicia sesión | Llega a su pantalla de inicio con el panel de su rol. | RN-124, RV-144 | HU34 |
| E-406 | El administrador revisa las ventas de hoy | Muestra total, efectivo, Yape y cantidad de ventas, iguales a las del reporte de ventas de hoy. | RV-145, RN-126 | HU34 |
| E-407 | Hay una venta anulada hoy | No suma en las ventas de hoy y aparece la alerta MSG-207. | RN-128 | HU34 |
| E-408 | Revisar los platos vendidos de hoy | Total de platos y los 5 principales; "Ver todos" abre Reportes con la fecha de hoy. | RV-146 | HU34 |
| E-409 | Tocar un contador de pedidos por estado | Abre la lista de pedidos con ese estado ya filtrado. | RV-146 | HU34 |
| E-410 | Revisar las mesas libres y ocupadas | Las cantidades coinciden con la vista de mesas. | RN-126 | HU34 |
| E-411 | Caja sin abrir, abierta y cerrada | El estado se muestra con texto y enlace a Caja; abierta incluye el efectivo esperado parcial. | RV-152 | HU34 |
| E-412 | Hay una caja de ayer sin cerrar | Alerta prioritaria arriba con MSG-168 y enlace para cerrarla. | RV-147, RN-128 | HU34 |
| E-413 | El menú de hoy sin definir, y luego definido | Sin definir y con la caja abierta: alerta MSG-204 con enlace; definido: muestra los platos y cuántos están agotados. | RN-128 | HU34 |
| E-414 | Hay comandas con más de 15 minutos de espera | Alerta MSG-205 con enlace a la lista de pedidos. | RN-128 | HU34 |
| E-415 | El último cierre tuvo faltante o sobrante | Alerta MSG-208 con enlace al detalle del cierre. | RN-128 | HU34 |
| E-416 | No hay alertas | MSG-203 "Todo en orden". | RV-147 | HU34 |
| E-417 | Todavía no hay ventas hoy | Ceros visibles y MSG-202. | RV-150 | HU34 |
| E-418 | El panel permanece abierto | Se actualiza solo cada 30 segundos sin mover lo que se lee; muestra "Actualizado hace X s"; ACTUALIZAR lo hace al instante. | RV-148, RNF-65 | HU34 |
| E-419 | Falla un bloque | Solo ese muestra MSG-209 con Reintentar; los demás siguen visibles. | RV-149, RNF-63 | HU34 |
| E-420 | Falla total del servidor o sin conexión | MSG-210 con Reintentar, o los últimos datos con su antigüedad. | RV-149 | HU34 |
| E-426 | Abrir el panel en el celular | Una columna con las alertas y los accesos rápidos primero. | RV-153 | HU34 |
| E-427 | Solo teclado | Tab recorre alertas, tarjetas y accesos; Enter abre el destino. | RNF-64 | HU34 |
| E-428 | La pestaña queda oculta y luego se vuelve a ella | La actualización se pausa mientras está oculta y se actualiza al volver. | RNF-65 | HU34 |


## 13. Matriz de justificación de usabilidad


<!-- tabla 124 -->
| Principio aplicado | Elemento de la interfaz | Decisión adoptada | Justificación |
|---|---|---|---|
| ISO 9241 – Eficacia | Alertas con enlace de solución | Cada alerta dice qué pasa y lleva a donde se resuelve | La dueña actúa sin buscar en los módulos |
| ISO 9241 – Eficiencia | Resumen y accesos rápidos | Lo importante en una sola pantalla y un toque para ir al detalle | Menos pasos desde que se ingresa |
| ISO 9241 – Satisfacción | Tarjetas grandes y "Todo en orden" | Números grandes y un mensaje tranquilizador cuando no hay alertas | Lectura clara y sin ansiedad |
| Nielsen 1 – Visibilidad del estado | Estados y "Actualizado hace X s" | Estado de caja, mesas y comandas siempre visible, con su antigüedad | Sabe qué tan reciente es lo que ve |
| Nielsen 2 – Mundo real | Textos y bloques | "Ventas de hoy", "Por cobrar", "Libres", "Ocupadas", "Demora" | Mismo lenguaje del restaurante |
| Nielsen 3 – Control y libertad | Actualizar y volver | ACTUALIZAR manual y regreso al inicio desde cualquier pantalla | Explora sin perderse |
| Nielsen 4 – Consistencia | Colores, insignias y botones | Mismos estados y colores que mesas, pedidos y caja | Evita reaprendizaje |
| Nielsen 5 – Prevención de errores | Accesos deshabilitados con motivo | COBRAR sin caja abierta explica qué falta | Evita intentos que fallarán |
| Nielsen 6 – Reconocimiento | Tarjetas con título y valor | Cada número lleva su nombre y su enlace | No obliga a recordar qué mide cada cifra |
| Nielsen 7 – Flexibilidad y eficiencia | Accesos por rol | Cada rol llega con un toque a su función principal | Atajos para el uso frecuente |
| Nielsen 8 – Minimalismo | Bloques por rol | Cada rol ve solo lo suyo, sin montos ajenos | Sin distracciones ni datos innecesarios |
| Nielsen 9 – Recuperarse de errores | Error por bloque | Solo falla el bloque afectado y se reintenta ahí | Un error no tumba toda la pantalla |
| Shneiderman 1 – Consistencia | Estilo y acciones | Misma paleta, botones y mensajes del sistema | Comportamiento predecible |
| Shneiderman 2 – Usabilidad universal | Móvil, contraste y teclado | Una columna en móvil, estado con texto, contraste 4.5:1 y teclado | Atiende distintos dispositivos y niveles |
| Shneiderman 3 – Retroalimentación | Indicadores y alertas | Las cifras reflejan cada acción en el siguiente refresco | Sabe qué pasó |
| Shneiderman 4 – Cierre | Alertas que llevan a la solución | El flujo termina en la pantalla donde se resuelve el problema | Indica cómo concluir |
| Shneiderman 5 – Prevenir errores | Permisos por rol | El servidor no envía datos ajenos al rol | Evita ver o hacer lo que no corresponde |
| Shneiderman 6 – Reversión | Navegación | Volver al inicio con un toque | Acciones reversibles |
| Shneiderman 7 – Control del usuario | Actualización sin saltos | El contenido no se mueve mientras se lee | Mantiene el control |
| Shneiderman 8 – Memoria a corto plazo | Panorama en una pantalla | El sistema resume lo pendiente para no recordarlo | Reduce la carga de memoria |


## 14. Matriz de trazabilidad


### 14.1 Requerimiento → historia → caso de uso → vista → prueba


<!-- tabla 125 -->
| RF | HU | CUS | Vista | Reglas / mensajes | API | Escenarios |
|---|---|---|---|---|---|---|
| RF-34 Indicadores del día del administrador | HU34 (S) | CUS14.1 | 14.1 | RV-144 a 153; RN-124 a 129; MSG-202 a 211, 168 | GET /api/inicio y /{bloque} | E-405 a E-420, E-426 a E-428, E-401 |


### 14.2 Regla → elemento de interfaz → escenario


<!-- tabla 126 -->
| Regla | Elemento de interfaz | Escenario |
|---|---|---|
| RV-144 / RN-124 | Destino tras el inicio de sesión y bloques por rol | E-405 |
| RV-145 / RN-126 | Tarjetas de ventas y platos con las mismas cifras que Reportes | E-406, E-408 |
| RV-146 | Enlaces de cada indicador con el filtro aplicado | E-408, E-409 |
| RV-147 / RN-128 | Bloque de alertas ordenado y "Todo en orden" | E-407, E-412 a E-416 |
| RV-148 / RNF-65 | "Actualizado hace X s", ACTUALIZAR y refresco sin saltos | E-418, E-428 |
| RV-149 / RNF-63 | Error y Reintentar por bloque | E-419, E-420 |
| RV-150 | Montos con S/ y ceros visibles | E-417 |
| RV-151 / RN-129 | Accesos rápidos deshabilitados con motivo y 403 en el servidor | E-422, E-425 |
| RV-152 | Insignias con texto | E-411, E-424 |
| RV-153 | Diseño de una columna en móvil | E-426 |
| RV-154 / RN-125 | Cada rol ve solo sus bloques | E-421, E-423, E-424, E-429 |
| RNF-64 | Orden de tabulación y accesibilidad | E-427 |


## 15. Evaluación del prototipo y mejoras incorporadas

Aún no hay prototipo del dashboard; las decisiones siguientes aplican lo aprendido en los CUS anteriores.

<!-- tabla 127 -->
| Riesgo previsto | Principio | Decisión de diseño incorporada |
|---|---|---|
| Exceso de información que abruma | Nielsen 8; Shneiderman 8 | Alertas primero, cuatro tarjetas grandes y solo los bloques del rol |
| No entender un número sin contexto | Nielsen 2 y 6 | Cada cifra con su título, su unidad (S/) y un enlace al detalle |
| No saber qué hacer ante una alerta | Nielsen 9; Shneiderman 4 | Cada alerta con texto claro y enlace a donde se resuelve |
| Ver datos desactualizados | Nielsen 1 | "Actualizado hace X s", refresco automático y botón ACTUALIZAR |
| Un error que tumba toda la pantalla | Nielsen 9 | Bloques independientes con Reintentar por bloque |
| Leer en el celular con prisa | Shneiderman 2 | Una columna, alertas y accesos primero, controles de 44 px |
| Estilo distinto al resto del sistema | Shneiderman 1; Nielsen 4 | Reutilizar paleta, insignias, botones y avisos de los CUS anteriores |


## 16. Dependencias con otros casos de uso


<!-- tabla 128 -->
| CUS relacionado | Relación con el CUS14 |
|---|---|
| CUS01 y CUS-03 | La pantalla de inicio es el destino tras el login; el menú y el perfil se muestran sobre ella. |
| CUS13 Reportes | Ventas y platos vendidos de hoy usan la misma fuente; los enlaces abren Reportes con la fecha de hoy. |
| CUS08 y CUS09 Pedidos y cocina | Pedidos por estado, pedidos listos, comandas y demoras salen de estos módulos. |
| CUS05 Mesas | Mesas libres y ocupadas. |
| CUS12 Caja y CUS11 Ventas | Estado de la caja, último cierre, ventas anuladas hoy y pedidos por cobrar. |
| CUS04 Menú del día y CUS03 Productos | Menú de hoy, platos agotados y nombres de los productos principales. |


<!-- tabla 129 -->
| N.º | Punto | Decisión adoptada o tarea |
|---|---|---|
| 1 | RF-34 y HU34 se incorporan a la lista de RF y de HU; RF-40 y HU40 se retiran. | Resuelto: los documentos de RF y de HU tienen 35 RF y 35 HU. |
| 2 | El dashboard está en la iteración 2/3 y /inicio ya es el destino tras el login desde la 1/3. | Decisión: el dashboard se entrega en la 2/3 (regla Media = 2/3); mientras tanto /inicio muestra el saludo y el menú del rol (CUS01.1). |
| 3 | Decisión: solo el Cajero cobra y cierra la caja. Si la dueña atiende caja con un usuario Cajero, ve el panel del Cajero; con su usuario Administrador ve el panel completo. | Reflejarlo en la gestión de usuarios (CUS02.2). |
| 4 | Los bloques repiten consultas de otros CUS; si se escriben de nuevo, las cifras pueden no coincidir entre pantallas. | Reutilizar los mismos servicios (RN-126) y probar que dashboard, reportes y caja coinciden (E-406). |
| 5 | Los umbrales de las alertas (15 minutos de espera) son fijos y no se pueden configurar. | Aceptarlo en esta versión; configurarlos queda como mejora futura. |
| 6 | La alerta "menú de hoy sin definir" no sabe el horario de atención y podría mostrarse fuera de horario. | Decisión: la alerta "menú de hoy sin definir" se muestra solo con la caja del día abierta. |
| 7 | El refresco es por consulta (30 y 15 segundos), no en tiempo real, y no hay gráficos ni comparaciones con otros días. | Aceptarlo como solución inicial; tiempo real, gráficos y comparaciones quedan como mejoras futuras. |
| 8 | El Cajero ve el resumen de su caja pero no los totales del negocio; el Mozo y el Cocinero no ven montos. | Decisión: se adopta ese nivel de información por rol. |
| 9 | Aún no existen bocetos de las Vistas 14.1 a 14.4. | Diseñarlas en Figma con los estados de la sección 8, empezando por el panel del Administrador en móvil. |
| 10 | El Administrador y el Cajero ven cifras de ventas y de caja distintas según su rol; el Cajero ve solo el resumen de su caja (RN-125). | Verificar en las pruebas que el servidor no envía al Cajero los totales del negocio. |


# Anexo B. Lineamientos de diseño: panel de inicio de Cajero, Mozo y Cocinero (no son RF ni CUS)

El resumen de tareas pendientes y los accesos rápidos del Cajero, el Mozo y el Cocinero son navegación hacia funciones que ya existen en el menú (mesas, pedidos, comandas, cobro y caja). Por eso no son requerimientos funcionales ni casos de uso y se documentan aquí como lineamiento de diseño de la pantalla de inicio. Las reglas RN-124 a RN-126 y RN-129 se aplican junto con el panel del Administrador (CUS14).

## B.1 Decisiones adoptadas


<!-- tabla 130 -->
| Tema | Decisión | Vacío que cubre |
|---|---|---|
| Cajero | Estado de su caja con resumen parcial, pedidos por cobrar (cantidad y monto), pedidos listos y accesos rápidos (COBRAR, PEDIDO PARA LLEVAR, CAJA, VENTAS). No ve los totales del negocio. | RF-40 |
| Mozo | Mesas libres y ocupadas, sus pedidos en curso y listos para recoger y accesos rápidos (MESAS, PEDIDOS). No ve montos. | RF-40 |
| Cocinero | Comandas pendientes y en preparación, tiempo de la más antigua (con "Demora" desde 15 minutos), platos agotados y accesos rápidos (COMANDAS, PLATOS AGOTADOS). No ve montos. | RF-40 |
| Accesos rápidos | Solo los permitidos al rol; si no se pueden usar, aparecen deshabilitados con el motivo (por ejemplo, COBRAR sin caja abierta). | RF-40 |


## B.2 Comportamiento


<!-- tabla 131 -->
| Situación | Comportamiento |
|---|---|
| Flujo principal | 1. El usuario inicia sesión y el sistema lo lleva a su pantalla de inicio; los bloques muestran "Cargando…".<br>2. El sistema consulta solo los datos que corresponden a su rol.<br>3. Cajero: muestra el estado de su caja con el resumen parcial, los pedidos por cobrar (cantidad y monto), los pedidos listos y los accesos COBRAR, PEDIDO PARA LLEVAR, CAJA y VENTAS.<br>4. Mozo: muestra las mesas libres y ocupadas, sus pedidos en curso y listos para recoger, y los accesos MESAS y PEDIDOS.<br>5. Cocinero: muestra las comandas pendientes y en preparación, el tiempo de la más antigua, los platos agotados y los accesos COMANDAS y PLATOS AGOTADOS.<br>6. El usuario toca un indicador o un acceso y el sistema abre la pantalla correspondiente.<br>7. El panel se actualiza solo cada 15 segundos. |
| Casos alternos | El Cajero no tiene caja abierta: el acceso COBRAR aparece deshabilitado con MSG-211 y ABRIR CAJA queda destacado; si hay una caja anterior sin cerrar, se muestra MSG-168.<br>No hay pedidos por cobrar: MSG-136. El Mozo no tiene pedidos listos: MSG-212. No hay comandas: MSG-124.<br>Una comanda lleva 15 minutos o más: se muestra "Demora".<br>Un bloque no carga: MSG-209 con Reintentar solo en ese bloque.<br>Falla total o sin conexión: MSG-210, o los últimos datos con la antigüedad.<br>El usuario abre por URL un destino que su rol no permite: MSG-39 (403). |
| Resultado | El usuario ve sus tareas pendientes y llega a su función principal con un toque, sin ver datos que no le corresponden. |
| Excepciones | Falla de uno o más bloques: MSG-209 y se registra el incidente.<br>Falla total: MSG-210 con Reintentar.<br>Pérdida de conexión: MSG-09. |


## B.3 Reglas y mensajes


<!-- tabla 132 -->
| Código | Regla | Elemento UI | Mensaje |
|---|---|---|---|
| RV-154 | El Cajero ve solo el resumen de su caja, no los totales del negocio; el Mozo y el Cocinero no ven montos. | Bloques por rol | MSG-39 |


<!-- tabla 133 -->
| Código | Mensaje (texto al usuario) | Tipo | Ubicación |
|---|---|---|---|
| MSG-212 | No tiene pedidos listos por recoger. | Informativo | Bloque del Mozo |


## B.4 Escenarios


<!-- tabla 134 -->
| ID | Entrada / acción | Resultado esperado | Reglas | HU |
|---|---|---|---|---|
| E-421 | El cajero entra a su inicio | Ve el resumen de su caja, pedidos por cobrar y listos; no ve los totales del negocio. | RV-154, RN-125 | Anexo B |
| E-422 | El cajero entra sin caja abierta | COBRAR aparece deshabilitado con MSG-211 y ABRIR CAJA destacado. | RV-151 | Anexo B |
| E-423 | El mozo entra a su inicio | Ve las mesas libres y ocupadas y sus pedidos en curso y listos (MSG-212 si no hay); no ve montos. | RV-154, RN-125 | Anexo B |
| E-424 | El cocinero entra a su inicio | Ve comandas pendientes y en preparación, la más antigua con minutos y "Demora" desde 15, y los platos agotados; no ve montos. | RV-152, RV-154 | Anexo B |
| E-425 | Un usuario abre por URL un destino que su rol no permite | 403 y MSG-39; los accesos rápidos solo muestran lo permitido. | RV-151, RN-129 | Anexo B |
| E-429 | Un mozo pide por servicio los bloques del Administrador | No recibe esos bloques y la respuesta es 403 con MSG-39. | RN-125, RNF-62 | Anexo B |


## B.5 Observaciones


<!-- tabla 135 -->
| N.º | Punto | Decisión adoptada o tarea |
|---|---|---|
| 1 | RF-40 y HU40 no son requerimiento ni historia: el panel de Cajero, Mozo y Cocinero es navegación. | Se documentan como lineamiento de diseño y se retiran de la lista de RF y de HU. |
| 2 | El acceso COBRAR aparece deshabilitado sin caja abierta (MSG-211); el Mozo no ve montos. | Verificar en las pruebas que el servidor no envía datos ajenos al rol (RNF-62). |
| 3 | Aún no hay bocetos de los paneles por rol (Vistas 14.2 a 14.4). | Diseñarlos en Figma con los estados de la sección 6 del CUS14. |
