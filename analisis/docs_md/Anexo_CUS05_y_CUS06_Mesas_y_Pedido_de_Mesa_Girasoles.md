RESTAURANTE GIRASOLES
Anexo: CUS05 y CUS06 – Gestión de mesas y registro de pedido de mesa
Casos de uso, interfaz, reglas, API, pruebas y trazabilidad · Metodología XP · Estructura única por CUS

# Correspondencia de numeración vigente

Este anexo continúa los CUS02 a CUS04 con la numeración definitiva (35 RF, 35 HU y CUS sin el antiguo Perfil). Para que los códigos sean únicos en todo el documento de construcción se ajustaron los siguientes:

<!-- tabla 1 -->
| Elemento | Antes | Ahora | Motivo |
|---|---|---|---|
| CUS | CUS06 Gestión de mesas · CUS07 Pedido de mesa | CUS05 · CUS06 | Se retiró el antiguo CUS03 (Perfil) |
| HU / RF | HU16 a HU18 · HU19 y HU20 (RF-16 a RF-20) | HU15 a HU17 · HU18 y HU19 (RF-15 a RF-19) | Numeración de 35 RF y 35 HU |
| Escenarios | E-95 a E-143 | E-117 a E-165 | E-95 a E-116 ya pertenecen al Menú del día (CUS04) |
| Requerimientos no funcionales | RNF-17 a RNF-23 | RNF-18 a RNF-24 | RNF-17 ya pertenece al Menú del día (CUS04) |
| Mensaje de plato agotado | MSG-79 | MSG-225 | MSG-79 es «No hay menú definido para hoy» (CUS04) |
| Generar comanda y liberar mesa | CUS10.1 y CUS11.4 (RF-24 y RF-31) | Pasos del registro de pedido (CUS06) y del cobro (CUS10.1) | No son RF ni CUS propios |

Los códigos de reglas (RV, RN), mensajes (MSG) y demás escenarios se conservan.

# CUS05: Gestión de mesas


## 1. Ficha del CUS general


<!-- tabla 2 -->
| Campo | Detalle |
|---|---|
| CUS general | CUS05: Gestión de mesas |
| Interfaz (GUI) | Interfaz 5: Gestión de mesas |
| Actor(es) | Administrador (gestión) y Cajero y Mozo (consulta del estado) |
| HU / RF de origen | HU15 a HU17 / RF-15 a RF-17 |
| Descripción | Una sola pantalla: la cuadrícula de mesas (Vista 5.1) es la pantalla base y desde ella el Administrador abre el formulario de nueva mesa (Vista 5.2), el de edición (Vista 5.3) y la confirmación de estado (Vista 5.4). Mozo y cajero la usan para ver qué mesa está libre u ocupada. |
| Alcance | Las mesas solo aplican a pedidos de mesa; el pedido para llevar no usa mesas. |


<!-- tabla 3 -->
| CUS | Título | Actor | HU | RF | Prioridad | Iteración | Complejidad |
|---|---|---|---|---|---|---|---|
| CUS05.1 | Registrar mesa | Administrador | HU15 | RF-15 | Alta (Must) | 1/3 | Baja |
| CUS05.2 | Ver mesas y su estado | Administrador, Cajero y Mozo | HU16 | RF-16 | Alta (Must) | 1/3 | Baja |
| CUS05.3 | Editar o desactivar mesa | Administrador | HU17 | RF-17 | Baja (Could) | 3/3 | Baja |

Criterio: la prioridad se obtiene de la validación MoSCoW de la HU (Must = Alta, Should = Media, Could = Baja) y la iteración sigue la prioridad (Alta = 1/3, Media = 2/3, Baja = 3/3).

## 2. Decisiones adoptadas


<!-- tabla 4 -->
| Tema | Decisión | Vacío que cubre |
|---|---|---|
| Datos de la mesa | Solo el número o nombre (1 a 20 caracteres, por ejemplo "1", "Mesa 5" o "Patio 2"), único sin distinguir mayúsculas ni espacios de más. Sin capacidad ni plano. | RF-15 |
| Dos estados distintos | Ocupación (Libre / Ocupada) y vigencia (Activa / Inactiva). Una mesa nueva se registra Activa y Libre. | RF-16 y RF-17 |
| Quién cambia Libre / Ocupada | Solo el sistema, nunca a mano: la mesa pasa a Ocupada al registrarse un pedido de mesa y a Libre al pagarse o anularse el último de sus pedidos abiertos (regla de negocio del cobro, RF-25). | Faltaba la regla |
| Varios pedidos por mesa | Una mesa puede tener varios pedidos abiertos al mismo tiempo (por ejemplo, un comensal que se suma después o un pedido aparte de bebidas); cada pedido se cobra por separado. Para sumar productos al mismo pedido se usa CUS06.2; para un pedido distinto se registra uno nuevo (CUS06.1). | RF-18 y RF-19 |
| Vista de mesas | Cuadrícula de tarjetas (sin plano), en orden natural (Mesa 2 antes que Mesa 10), con resumen "Libres 8 · Ocupadas 4" y la hora de la última actualización. Muestra solo las mesas activas. | CUS05.2 |
| Acción al tocar una mesa | Mozo o Administrador: REGISTRAR PEDIDO (CUS06.1) con la mesa libre u ocupada y, con la mesa ocupada, también AGREGAR PRODUCTOS (CUS06.2). Cajero con mesa ocupada: COBRAR (CUS10.1); si hay varios pedidos, elige cuál. Administrador: además EDITAR. | CUS05.2 solo cubría dos casos |
| Administrador | Además de lo anterior, ve y gestiona las mesas inactivas con un interruptor "Mostrar inactivas". | RF-17 |
| Actualización | La vista se refresca sola cada 15 segundos y al volver a la pantalla; hay un botón Actualizar. El servidor valida el estado real al registrar un pedido. | Faltaba definir la sincronización |
| Eliminación | No existe eliminar mesa; solo desactivar, para conservar el historial. | RF-17 |
| Desactivar una mesa | Solo si está Libre. Una mesa inactiva no aparece al registrar pedidos ni a mozo y cajero. Se puede renombrar una mesa ocupada: el historial la referencia por su identificador. | CUS05.3 |
| Auditoría | Se registra quién, cuándo y qué cambió al registrar, editar, activar o desactivar mesas. | Control de la dueña |


## 3. Análisis del usuario (Diseño Centrado en el Usuario)


<!-- tabla 5 -->
| Aspecto | Descripción |
|---|---|
| Quién usa la interfaz | El mozo (celular), el cajero (computadora o celular) y la administradora, que además configura las mesas del local. |
| Necesidades | Mozo: saber qué mesa está libre y abrir su pedido sin errores. Cajero: saber qué mesa tiene un pedido por cobrar. Administradora: reflejar la distribución real del local. |
| Dificultades previsibles | Ver información desactualizada y tomar un pedido en una mesa que ya se ocupó; leer solo por color; tocar tarjetas pequeñas con prisa; que "Mesa 10" aparezca antes que "Mesa 2"; desactivar por error una mesa en uso. |
| Contexto de uso | Hora pico con movimiento constante, uso con una sola mano, ruido y conexión inestable. Hoy el restaurante no usa mesas en su proceso manual, por lo que el personal las aprenderá desde cero. |


## 4. Plantillas de casos de uso


### CUS05.1: Registrar mesa


<!-- tabla 6 -->
| Código: CUS05.1 | Título: Registrar mesa (Vista 5.2) | Fecha: 17.10.2026 | Iteración: 1/3 |
|---|---|---|---|
| Actor(es): Administrador |  |  |  |
| Prioridad: Alta (Must) | Complejidad: Baja |  |  |
| Historia de usuario: HU15 Registrar mesas (M) |  |  |  |
| Requerimiento de origen: RF-15 |  |  |  |
| Descripción: Permite al administrador registrar las mesas del restaurante con un número o nombre, para poder asignar cada pedido a una mesa. |  |  |  |
| Precondición: El administrador tiene sesión iniciada y accede desde la opción MESAS del menú. |  |  |  |
| Flujo principal:<br>1. El administrador accede a MESAS y el sistema muestra la cuadrícula de mesas (Vista 5.1).<br>2. Pulsa NUEVA MESA; el sistema abre el formulario con el foco en Nombre.<br>3. Escribe el número o nombre de la mesa (por ejemplo, "Mesa 5").<br>4. Pulsa GUARDAR o presiona Enter; el sistema recorta los espacios, valida (RV-168 a RV-171) y deshabilita el botón.<br>5. El servidor verifica que el nombre no esté repetido, registra la mesa como Activa y Libre y la anota en auditoría.<br>6. El sistema cierra el formulario, muestra MSG-84 y agrega la tarjeta resaltada en su posición. |  |  |  |
| Flujo alterno:<br>Nombre repetido: MSG-83; el formulario sigue abierto con lo escrito.<br>Campo vacío o de más de 20 caracteres: MSG-81 o MSG-82 junto al campo.<br>Cancelar (botón o Esc): regresa a la cuadrícula sin guardar y el foco vuelve a NUEVA MESA.<br>Usuario sin rol Administrador intenta registrar por URL o servicio: MSG-39 (403). |  |  |  |
| Postcondición: La mesa queda registrada, activa y en estado Libre. |  |  |  |
| Excepciones:<br>Falla al guardar: MSG-38; no se crea el registro, lo escrito se conserva y se registra el incidente.<br>Pérdida de conexión: MSG-09. |  |  |  |
| Reglas y mensajes aplicables: RV-168 a RV-172; RN-143, RN-145, RN-146, RN-47; RNF-20; MSG-81 a MSG-84, MSG-38, MSG-39. |  |  |  |


### CUS05.2: Ver mesas y su estado


<!-- tabla 7 -->
| Código: CUS05.2 | Título: Ver mesas y su estado (Vista 5.1) | Fecha: 17.10.2026 | Iteración: 1/3 |
|---|---|---|---|
| Actor(es): Administrador, Cajero y Mozo |  |  |  |
| Prioridad: Alta (Must) | Complejidad: Baja |  |  |
| Historia de usuario: HU16 Ver mesas y su estado (M) |  |  |  |
| Requerimiento de origen: RF-16 |  |  |  |
| Descripción: Permite visualizar todas las mesas activas con su estado (libre u ocupada) para saber cuáles pueden atenderse y cuáles tienen un pedido pendiente de cobro. |  |  |  |
| Precondición: El usuario tiene sesión iniciada con rol Administrador, Cajero o Mozo y existen mesas registradas. |  |  |  |
| Flujo principal:<br>1. El usuario accede a MESAS; el sistema muestra "Cargando mesas…".<br>2. El sistema consulta las mesas activas.<br>3. Las muestra como tarjetas en orden natural, con nombre y estado (texto y color), el resumen "Libres / Ocupadas" y la hora de actualización.<br>4. Opcionalmente elige el filtro Libres u Ocupadas; el sistema actualiza la vista sin recargar.<br>5. El sistema se refresca solo cada 15 segundos.<br>6. Opcionalmente selecciona una mesa y el sistema ofrece la acción que corresponde a su rol. |  |  |  |
| Flujo alterno:<br>No hay mesas registradas: MSG-91 (Administrador) o MSG-92 (Mozo y Cajero).<br>Ningún resultado con el filtro: MSG-93 y "Ver todas".<br>Mozo selecciona una mesa libre: se ofrece REGISTRAR PEDIDO (CUS06.1).<br>Mozo o Administrador selecciona una mesa ocupada: se ofrece REGISTRAR PEDIDO NUEVO (CUS06.1) o AGREGAR PRODUCTOS (CUS06.2).<br>Cajero selecciona una mesa ocupada: se ofrece COBRAR (CUS10.1); si tiene varios pedidos, elige cuál cobrar.<br>El estado cambió mientras el usuario miraba la pantalla: se corrige en la siguiente actualización; registrar un pedido en una mesa que se ocupó entretanto es válido y queda como un pedido separado (MSG-95).<br>Usuario Cocinero entra por URL: MSG-39 (403); la opción no aparece en su menú. |  |  |  |
| Postcondición: El estado actual de las mesas queda visible y actualizado. |  |  |  |
| Excepciones:<br>Falla al obtener los datos: MSG-94 con Reintentar; si había datos previos se mantienen con el aviso de antigüedad.<br>Pérdida de conexión: MSG-09. |  |  |  |
| Reglas y mensajes aplicables: RV-58, RV-59; RN-144, RN-147, RN-45, RN-46; RNF-18 a RNF-20; MSG-91 a MSG-95, MSG-39. |  |  |  |


### CUS05.3: Editar o desactivar mesa


<!-- tabla 8 -->
| Código: CUS05.3 | Título: Editar o desactivar mesa (Vistas 5.3 y 5.4) | Fecha: 17.10.2026 | Iteración: 3/3 |
|---|---|---|---|
| Actor(es): Administrador |  |  |  |
| Prioridad: Baja (Could) | Complejidad: Baja |  |  |
| Historia de usuario: HU17 Editar y desactivar mesas (C) |  |  |  |
| Requerimiento de origen: RF-17 |  |  |  |
| Descripción: Permite al administrador modificar el número o nombre de una mesa y activarla o desactivarla para adaptar el sistema a la distribución del local. |  |  |  |
| Precondición: El administrador tiene sesión iniciada y la mesa existe. |  |  |  |
| Flujo principal:<br>A. Editar (Vista 5.3)<br>1. El administrador selecciona EDITAR en la mesa deseada.<br>2. El sistema abre el formulario con el nombre actual y el foco en Nombre.<br>3. Modifica el nombre y pulsa GUARDAR CAMBIOS; el sistema valida (RV-168 a RV-171).<br>4. El servidor verifica que el nombre no pertenezca a otra mesa, actualiza y registra el cambio.<br>5. El sistema muestra MSG-85 y actualiza la tarjeta.<br>B. Activar o desactivar (Vista 5.4)<br>1. El administrador selecciona DESACTIVAR (o ACTIVAR) en la mesa.<br>2. El sistema muestra la confirmación MSG-86 (o MSG-87) con el nombre de la mesa y el foco en CANCELAR.<br>3. Confirma; el servidor verifica que la mesa esté Libre, cambia la vigencia y lo registra.<br>4. El sistema muestra MSG-89 (o MSG-90) y actualiza la vista. |  |  |  |
| Flujo alterno:<br>Mesa ocupada al desactivar: MSG-88; el estado no cambia.<br>Nombre que ya pertenece a otra mesa: MSG-83.<br>Nombre vacío o demasiado largo: MSG-81 o MSG-82.<br>Cancelar (botón o Esc): se descartan los cambios.<br>La mesa se ocupó entre la confirmación y la acción: el servidor la rechaza y se muestra MSG-88. |  |  |  |
| Postcondición: La mesa queda actualizada; una mesa desactivada no aparece al registrar pedidos ni para mozo y cajero. |  |  |  |
| Excepciones:<br>Falla al actualizar: MSG-38; se conservan los datos anteriores y se registra el incidente.<br>Pérdida de conexión: MSG-09. |  |  |  |
| Reglas y mensajes aplicables: RV-168 a RV-172, RV-56, RV-57; RN-143, RN-145, RN-148, RN-45, RN-47; MSG-81 a MSG-83, MSG-85 a MSG-90, MSG-38. |  |  |  |


## 5. Interfaz (GUI)


<!-- tabla 9 -->
| Interfaz | RF | HU | CUS | Qué se hace dentro de la interfaz |
|---|---|---|---|---|
| 5. Gestión de mesas | RF-15 a RF-17 | HU15 a HU17 | CUS05 (05.1 a 05.3) | Ver el estado de las mesas (pantalla base), registrar, editar, activar o desactivar mesas y abrir la acción según el rol. |


### Vista 5.1: Cuadrícula de mesas, pantalla base (CUS05.2) — restaurante.app/mesas


<!-- tabla 10 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 11 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Menú "Mesas" | Visible para Administrador, Cajero y Mozo; el Cocinero no usa esta pantalla. |
| 2 | Resumen y actualización | "Libres 8 · Ocupadas 4", "Actualizado hace X s" y botón Actualizar; se refresca solo cada 15 segundos. |
| 3 | Filtro de estado | Todas, Libres u Ocupadas; para el Administrador, interruptor "Mostrar inactivas". |
| 4 | Tarjeta de mesa | Nombre y estado con texto e ícono (Libre en verde, Ocupada en naranja, Inactiva atenuada), en orden natural. |
| 5 | Acción según el rol | Mozo y Administrador: REGISTRAR PEDIDO (mesa libre u ocupada) y AGREGAR PRODUCTOS (mesa ocupada); Cajero: COBRAR (si hay varios pedidos, elige cuál); Administrador: además EDITAR. |
| 6 | Botón NUEVA MESA | Solo Administrador; abre la Vista 5.2. |


### Vista 5.2: Registrar mesa (CUS05.1) — restaurante.app/mesas/nueva


<!-- tabla 12 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 13 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Nombre de la mesa | Número o nombre de 1 a 20 caracteres; muestra MSG-81, MSG-82 o MSG-83. |
| 2 | Botón GUARDAR | Valida y registra; muestra "Guardando…". |
| 3 | Botón Cancelar | Cierra el formulario sin guardar. |


### Vista 5.3: Editar mesa (CUS05.3) — restaurante.app/mesas/editar


<!-- tabla 14 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 15 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Nombre de la mesa | Campo con el nombre actual, editable (también si la mesa está ocupada). |
| 2 | Botón GUARDAR CAMBIOS | Valida y actualiza; muestra MSG-85. |
| 3 | Botón Cancelar | Descarta los cambios. |


### Vista 5.4: Activar o desactivar mesa (CUS05.3) — restaurante.app/mesas


<!-- tabla 16 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 17 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Acción en la tarjeta | DESACTIVAR (mesa libre) o ACTIVAR (mesa inactiva). |
| 2 | Diálogo de confirmación | MSG-86 o MSG-87 con el nombre de la mesa; foco inicial en CANCELAR. |
| 3 | Mensaje de error | MSG-88 si la mesa está ocupada; no hay botón de confirmar. |
| 4 | Botones Confirmar y Cancelar | Aplican o descartan el cambio de vigencia. |


## 6. Estados de la interfaz


<!-- tabla 18 -->
| Estado | Comportamiento visual |
|---|---|
| Cargando | "Cargando mesas…" con marcadores de posición. |
| Cuadrícula con mesas | Tarjetas en orden natural con nombre y estado (insignia con texto); resumen "Libres 8 · Ocupadas 4"; texto "Actualizado hace X s" y botón Actualizar. |
| Mesa libre | Tarjeta en tono verde con el texto "Libre" y un ícono. |
| Mesa ocupada | Tarjeta en tono naranja con el texto "Ocupada" y un ícono distinto al de libre. |
| Mesa inactiva (solo Administrador) | Tarjeta atenuada con el texto "Inactiva". |
| Mesa seleccionada | Muestra la acción según el rol: REGISTRAR PEDIDO, AGREGAR PRODUCTOS, COBRAR o EDITAR (en móvil, como botón dentro de la tarjeta o en una hoja inferior). |
| Sin mesas | MSG-91 (con botón NUEVA MESA) o MSG-92. |
| Sin resultados del filtro | MSG-93 y botón "Ver todas". |
| Error de carga | MSG-94 con botón Reintentar; si ya había datos, se mantienen visibles con el aviso "Sin conexión, datos de hace X s". |
| Formulario abierto | Ventana con foco en Nombre; Esc o CANCELAR la cierran y el foco regresa al botón de origen; Enter guarda. |
| Guardando | Botón "Guardando…" deshabilitado (RV-172). |
| Éxito | Aviso temporal (MSG-84, 85, 89, 90) y tarjeta afectada resaltada unos segundos. |
| Confirmación | Diálogo que nombra la mesa; foco inicial en CANCELAR; si está ocupada, muestra MSG-88 y sin botón de confirmar. |
| Móvil | Cuadrícula de dos columnas con tarjetas de al menos 44 px de alto. |


## 7. Reglas de validación (RV)


<!-- tabla 19 -->
| Código | Regla | Elemento UI | Mensaje |
|---|---|---|---|
| RV-168 | El número o nombre de la mesa es obligatorio y tiene entre 1 y 20 caracteres (letras, números, espacios, tildes, guion y punto). | Campo Nombre de la mesa | MSG-81, 82 |
| RV-169 | El nombre es único sin distinguir mayúsculas, tildes ni espacios de más. | Campo Nombre de la mesa | MSG-83 |
| RV-170 | Se eliminan los espacios al inicio y al final y los espacios repetidos antes de validar. | Campo Nombre de la mesa | — |
| RV-171 | Los errores se muestran junto al campo y dicen qué corregir; no se guarda con errores y el foco va al primer campo con error. | Texto de error / botón GUARDAR | MSG-81 a 83 |
| RV-172 | Mientras se guarda, el botón queda deshabilitado con "Guardando…". | Botón GUARDAR | — |
| RV-56 | Una mesa ocupada no se puede desactivar. | Acción DESACTIVAR | MSG-88 |
| RV-57 | Activar y desactivar piden confirmación que nombra la mesa; el foco inicial queda en CANCELAR. | Diálogo de confirmación | MSG-86, 87 |
| RV-58 | El estado de cada mesa se muestra con texto ("Libre" / "Ocupada" / "Inactiva") además del color. | Tarjeta de la mesa | — |
| RV-59 | El filtro por estado (Todas, Libres, Ocupadas) se aplica sin recargar la página y conserva el orden. | Filtro de estado | MSG-93 |


## 8. Reglas de negocio y requerimientos no funcionales


<!-- tabla 20 -->
| Código | Regla |
|---|---|
| RN-143 | Solo el Administrador registra, edita, activa y desactiva mesas. |
| RN-144 | El Administrador, el Cajero y el Mozo ven las mesas activas con su estado; el Cocinero no usa esta pantalla. |
| RN-145 | El número o nombre de una mesa es único. |
| RN-146 | Toda mesa nueva se registra Activa y Libre. |
| RN-147 | El estado Libre / Ocupada lo gestiona el sistema: la mesa está Ocupada mientras tenga al menos un pedido de mesa sin pagar ni anular, y pasa a Libre al pagarse o anularse el último (regla de negocio del cobro, RF-25). |
| RN-148 | Una mesa ocupada no puede desactivarse. |
| RN-45 | Una mesa inactiva no aparece al registrar pedidos ni en la vista de mozo y cajero, y su historial se conserva. |
| RN-46 | Una mesa puede tener varios pedidos abiertos a la vez (por ejemplo, un comensal que se suma después o un pedido aparte de bebidas); cada pedido se cobra por separado y la mesa vuelve a Libre cuando ninguno queda pendiente de cobro (RN-147). |
| RN-47 | Registrar, editar, activar y desactivar mesas se registran en auditoría. |
| RNF-18 | La vista carga en menos de 2 segundos con hasta 50 mesas y se refresca cada 15 segundos. |
| RNF-19 | La interfaz es adaptable a móvil (cuadrícula de dos columnas), con tarjetas táctiles de al menos 44 px, y es operable con teclado (RNF-04). |
| RNF-20 | El servidor valida token y rol en cada endpoint y repite las validaciones del nombre y de los estados (RNF-02). |


## 9. Catálogo de mensajes

Se reutilizan MSG-09 (conexión), MSG-38 (operación fallida) y MSG-39 (sin permiso) del CUS02. MSG-95 se usa también en el registro de pedido (CUS06).

<!-- tabla 21 -->
| Código | Mensaje (texto al usuario) | Tipo | Ubicación |
|---|---|---|---|
| MSG-81 | Ingrese el número o nombre de la mesa. | Error | Bajo el campo Nombre |
| MSG-82 | El nombre de la mesa debe tener entre 1 y 20 caracteres. | Error | Bajo el campo Nombre |
| MSG-83 | Esa mesa ya está registrada. Use otro número o nombre. | Error | Bajo el campo Nombre |
| MSG-84 | Mesa registrada correctamente. | Éxito | Aviso temporal (4 s) |
| MSG-85 | Mesa actualizada correctamente. | Éxito | Aviso temporal (4 s) |
| MSG-86 | ¿Desactivar [mesa]? Dejará de aparecer al tomar pedidos, pero se conservará su historial. | Confirmación | Diálogo |
| MSG-87 | ¿Activar [mesa]? Volverá a estar disponible para pedidos. | Confirmación | Diálogo |
| MSG-88 | No se puede desactivar [mesa]: tiene un pedido pendiente de cobro. | Error | Diálogo |
| MSG-89 | Mesa desactivada. | Éxito | Aviso temporal |
| MSG-90 | Mesa activada. | Éxito | Aviso temporal |
| MSG-91 | No hay mesas registradas. Use "Nueva mesa" para crear la primera. | Informativo | En la pantalla (Administrador) |
| MSG-92 | No hay mesas registradas. Pida a la administradora que las registre. | Informativo | En la pantalla (Mozo y Cajero) |
| MSG-93 | No hay mesas con ese estado. Cambie el filtro. | Informativo | En la pantalla |
| MSG-94 | No se pudieron cargar las mesas. Intente nuevamente. (botón Reintentar) | Error | En la pantalla |
| MSG-95 | La [mesa] ya tiene [n] pedido(s) abierto(s). ¿Registrar un pedido nuevo o agregar productos a uno existente? | Aviso | Diálogo al elegir una mesa ocupada |


## 10. Diccionario de datos


<!-- tabla 22 -->
| Campo | Tipo | Obligatorio | Longitud / formato | Notas |
|---|---|---|---|---|
| Número o nombre | Texto | Sí | 1–20; letras, números, espacios, tildes, - y . | Único; se recorta |
| Ocupación | Lista | Automático | Libre / Ocupada | La cambia el sistema; nueva = Libre |
| Vigencia | Lista | Automático | Activa / Inactiva | Nueva = Activa |
| Fecha de creación y de modificación | Fecha y hora | Automático | — | No editables |
| Filtro de estado | Lista | No | Todas / Libres / Ocupadas | Solo en pantalla |
| Mostrar inactivas | Interruptor | No | Sí / No (por defecto No) | Solo Administrador |


## 11. Contrato de API

Todos los endpoints exigen token JWT (401 sin token válido) y validan el rol en el servidor (403 si no corresponde).

<!-- tabla 23 -->
| Endpoint | Entrada | Respuestas |
|---|---|---|
| GET /api/mesas | estado (libre \| ocupada), incluirInactivas (solo Administrador) | 200: [{ id, nombre, ocupacion, activa }] en orden natural. Roles: Administrador, Cajero y Mozo. |
| POST /api/mesas | { nombre } | 201: mesa creada, activa y libre. 400: nombre inválido. 409: nombre duplicado. Rol: Administrador. |
| PUT /api/mesas/{id} | { nombre } | 200: actualizada. 400: nombre inválido. 404: no existe. 409: nombre duplicado. Rol: Administrador. |
| PATCH /api/mesas/{id}/estado | { activa } | 200: vigencia actualizada. 404: no existe. 409: la mesa está ocupada. Rol: Administrador. |

La ocupación no se cambia por esta API: la actualizan los servicios de pedidos (CUS06 y CUS08) y de cobro (CUS10). Una mesa puede recibir varios pedidos (RN-46): el registro de pedido de mesa solo rechaza (409) una mesa inactiva.

## 12. Escenarios de validación y criterios de aceptación


<!-- tabla 24 -->
| ID | Entrada / acción | Resultado esperado | Reglas | HU |
|---|---|---|---|---|
| E-117 | Entrar a MESAS con mesas registradas | Tarjetas en orden natural con nombre, estado, resumen y hora de actualización. | RN-144, RV-58 | HU16 |
| E-118 | Registrar "Mesa 1" | MSG-84; mesa Activa y Libre en la cuadrícula. | RN-146 | HU15 |
| E-119 | Registrar con el campo vacío | MSG-81; no se guarda. | RV-168 | HU15 |
| E-120 | Registrar un nombre repetido ("mesa 1" o " Mesa  1 ") | MSG-83; el formulario sigue abierto. | RV-169, RV-170, RN-145 | HU15 |
| E-121 | Registrar un nombre de más de 20 caracteres | MSG-82. | RV-168 | HU15 |
| E-122 | Filtrar por Libres u Ocupadas | Se muestran solo esas; si no hay, MSG-93. | RV-59 | HU16 |
| E-123 | Entrar sin mesas registradas | MSG-91 con NUEVA MESA para el Administrador; MSG-92 para mozo y cajero. | — | HU16 |
| E-124 | El mozo selecciona una mesa libre | Se ofrece REGISTRAR PEDIDO (CUS06.1). | RN-144 | HU16 |
| E-125 | El mozo registra el pedido | La mesa pasa a Ocupada y los demás usuarios la ven así en 15 segundos o menos. | RN-147, RNF-18 | HU16 |
| E-126 | El mozo selecciona una mesa ocupada | Se ofrece REGISTRAR PEDIDO NUEVO (CUS06.1) o AGREGAR PRODUCTOS (CUS06.2). | RN-46 | HU16 |
| E-127 | El cajero selecciona una mesa ocupada y cobra | Se ofrece COBRAR (CUS10.1); al pagarse, la mesa pasa a Libre. | RN-147 | HU16 |
| E-128 | Se anula el único pedido abierto de una mesa | La mesa vuelve a Libre. | RN-147 | HU16 |
| E-129 | Dos mozos abren un pedido en la misma mesa a la vez | Ambos pedidos se registran por separado y la mesa queda Ocupada con dos pedidos. | RN-46 | HU16 |
| E-130 | Editar el nombre de una mesa | MSG-85; si el nombre ya existe, MSG-83. | RV-169 | HU17 |
| E-131 | Desactivar una mesa libre | Confirmación MSG-86, luego MSG-89; ya no aparece para mozo y cajero ni en pedidos. | RN-45 | HU17 |
| E-132 | Desactivar una mesa ocupada | MSG-88; no cambia. | RV-56, RN-148 | HU17 |
| E-133 | Activar una mesa inactiva | Confirmación MSG-87, luego MSG-90; vuelve a mostrarse. | RN-45 | HU17 |
| E-134 | Cancelar un formulario o confirmación (botón o Esc) | No hay cambios y el foco vuelve al botón de origen. | RV-57 | HU15, HU17 |
| E-135 | Un mozo o cajero intenta registrar o editar mesas por URL o servicio; el cocinero entra a MESAS | 403 y MSG-39; el cocinero no ve la opción. | RN-143, RN-144 | HU15 a HU17 |
| E-136 | Falla del servidor al cargar o guardar | MSG-94 o MSG-38; se conservan los datos escritos. | RNF-20 | HU15 a HU17 |
| E-137 | Solo teclado | Tab recorre filtro, tarjetas y diálogos; Enter confirma; Esc cancela. | RNF-19 | HU15 a HU17 |
| E-138 | Doble clic en GUARDAR | Se crea una sola mesa. | RV-172 | HU15 |
| E-139 | Otro usuario cambia el estado de una mesa con la pantalla abierta | La tarjeta se actualiza sola en 15 segundos o menos y se muestra "Actualizado hace…". | RNF-18 | HU16 |


## 13. Matriz de justificación de usabilidad


<!-- tabla 25 -->
| Principio aplicado | Elemento de la interfaz | Decisión adoptada | Justificación |
|---|---|---|---|
| ISO 9241 – Eficacia | Estado y acción por mesa | Cada rol ve la acción que le corresponde y el servidor valida el estado real | El mozo y el cajero completan su tarea sin errores |
| ISO 9241 – Eficiencia | Cuadrícula con acción directa | Un toque en la mesa ofrece registrar, agregar o cobrar | Pocos pasos en plena hora pico |
| ISO 9241 – Satisfacción | Tarjetas con texto, color e ícono | Estado claro de un vistazo, con avisos breves | Interacción clara y predecible |
| Nielsen 1 – Visibilidad del estado | Resumen y actualización | "Libres 8 · Ocupadas 4" y "Actualizado hace X s" | Sabe qué tan reciente es lo que ve |
| Nielsen 2 – Mundo real | Nombres y estados | Mesas con el nombre que usa el local; "Libre" y "Ocupada" | Mismo lenguaje del restaurante |
| Nielsen 3 – Control y libertad | Cancelar, Esc y Activar | Salir sin guardar; desactivar es reversible | Corrige sin penalización |
| Nielsen 4 – Consistencia | Patrón de pantalla y diálogos | Mismos botones, avisos y confirmaciones que los demás módulos | Evita reaprendizaje |
| Nielsen 5 – Prevención de errores | Reglas de protección | No se desactiva una mesa ocupada; se avisa si la mesa ya tiene pedidos; el estado no se edita a mano | Evita inconsistencias entre mesa y pedido |
| Nielsen 6 – Reconocimiento | Tarjetas y acción contextual | Nombre y estado visibles; la acción aparece en la mesa elegida | No obliga a recordar qué mesa está libre |
| Nielsen 8 – Minimalismo | Tarjeta de mesa | Solo nombre, estado y una acción | Sin distracciones |
| Nielsen 9 – Recuperarse de errores | Mensajes | MSG-83, MSG-88 y MSG-95 indican qué hacer | Facilita corregir |
| Shneiderman 1 – Consistencia | Estilo y acciones | Misma paleta, botones y mensajes del sistema | Comportamiento predecible |
| Shneiderman 2 – Usabilidad universal | Texto, ícono, tamaño y móvil | Estado no solo por color; tarjetas de 44 px; dos columnas en móvil; contraste 4.5:1 | Atiende daltonismo, uso con una mano y distintos dispositivos |
| Shneiderman 3 – Retroalimentación | Avisos y resaltado | MSG-84, 85, 89 y 90 y tarjeta resaltada | Sabe qué pasó |
| Shneiderman 4 – Cierre | Mensajes finales | Cada alta, edición o cambio de estado termina con un aviso y la vista actualizada | Indica que la tarea concluyó |
| Shneiderman 5 – Prevenir errores | Validaciones | No guarda con errores; botón bloqueado al enviar; foco en CANCELAR al desactivar | Evita duplicados y desactivaciones accidentales |
| Shneiderman 6 – Reversión | Cancelar y Activar | Descartar cambios y reactivar una mesa | Acciones reversibles |
| Shneiderman 7 – Control del usuario | Todo el flujo | Cada acción la inicia la persona; el estado cambia solo por pedidos reales | Mantiene el control |
| Shneiderman 8 – Memoria a corto plazo | Vista persistente | La cuadrícula muestra siempre el estado actual, sin recordar qué mesa se ocupó | Reduce la carga de memoria |


## 14. Matriz de trazabilidad


### 14.1 Requerimiento → historia → caso de uso → vista → prueba


<!-- tabla 26 -->
| RF | HU | CUS | Vista | Reglas / mensajes | API | Escenarios |
|---|---|---|---|---|---|---|
| RF-15 Registrar mesas | HU15 (M) | CUS05.1 | 5.2 | RV-168 a 172; RN-143, 145, 146, 47; RNF-20; MSG-81 a 84 | POST /api/mesas | E-118 a E-121, E-138 |
| RF-16 Ver mesas y su estado | HU16 (M) | CUS05.2 | 5.1 | RV-58, 59; RN-144, 147, 45, 46; RNF-18 a 20; MSG-91 a 95 | GET /api/mesas | E-117, E-122 a E-129, E-139 |
| RF-17 Editar y desactivar mesas | HU17 (C) | CUS05.3 | 5.3 y 5.4 | RV-168 a 172, 56, 57; RN-148, 45, 47, 143, 145; MSG-85 a 90 | PUT /api/mesas/{id} y PATCH .../estado | E-130 a E-133 |


### 14.2 Regla → elemento de interfaz → escenario


<!-- tabla 27 -->
| Regla | Elemento de interfaz | Escenario |
|---|---|---|
| RV-168 a RV-170 | Campo Nombre de la mesa, con texto de error y recorte automático | E-119 a E-121 |
| RV-171 / RV-172 | Texto de error por campo y botón en "Guardando…" | E-119, E-138 |
| RV-56 / RN-148 | Mensaje MSG-88 al desactivar una mesa ocupada | E-132 |
| RV-57 | Diálogo con foco en CANCELAR | E-131, E-133, E-134 |
| RV-58 | Insignia con texto Libre / Ocupada / Inactiva | E-117 |
| RV-59 | Filtro de estado | E-122 |
| RN-143 / RN-144 | Botones de gestión solo para el Administrador; 403 en el servidor | E-135 |
| RN-147 | Cambio automático de Libre a Ocupada y viceversa | E-125, E-127, E-128 |
| RN-46 | Aviso MSG-95 al elegir una mesa ocupada; pedidos separados de la misma mesa | E-129, E-147 |
| RNF-18 | Refresco cada 15 s y "Actualizado hace…" | E-125, E-139 |


## 15. Evaluación del prototipo y mejoras incorporadas

Aún no hay prototipo de la gestión de mesas; las decisiones siguientes aplican lo aprendido en los CUS anteriores.

<!-- tabla 28 -->
| Riesgo previsto | Principio | Decisión de diseño incorporada |
|---|---|---|
| Leer el estado solo por color | Shneiderman 2; accesibilidad | Insignia con texto "Libre" / "Ocupada" y un ícono distinto |
| Información desactualizada en hora pico | Nielsen 1 | "Actualizado hace X s", refresco automático y botón Actualizar |
| Tomar un pedido en una mesa que ya se ocupó | Nielsen 5 y 9 | Aviso MSG-95 con las dos salidas: pedido nuevo o agregar productos |
| "Mesa 10" antes que "Mesa 2" | Nielsen 2 | Orden natural por número |
| Tarjetas pequeñas con una sola mano | Shneiderman 2 | Dos columnas en móvil y tarjetas de al menos 44 px |
| Desactivar por error una mesa | Nielsen 5; Shneiderman 5 | No se puede si está ocupada; foco en CANCELAR; reversible |
| Estilo distinto al resto del sistema | Shneiderman 1; Nielsen 4 | Reutilizar paleta, botones, diálogos y avisos de los CUS anteriores |


## 16. Dependencias con otros casos de uso


<!-- tabla 29 -->
| CUS relacionado | Relación con el CUS05 |
|---|---|
| CUS06 Pedido de mesa | Registrar el pedido ocupa la mesa (CUS06.1); una mesa ocupada admite un pedido nuevo (CUS06.1) o agregar productos (CUS06.2). Solo muestra mesas activas. |
| CUS08 Gestión de pedidos | Anular el único pedido abierto de una mesa la libera (RN-147). |
| CUS10 Cobro | El cajero cobra desde la mesa ocupada (CUS10.1) y al pagar la mesa se libera (CUS10.1, RF-25). |


<!-- tabla 30 -->
| N.º | Punto | Decisión adoptada o tarea |
|---|---|---|
| 1 | El estado Libre / Ocupada depende de CUS06, CUS08 y CUS10.1, todos en la iteración 1/3. | Implementar en la iteración 1 la ocupación al registrar y la liberación al pagar o anular. |
| 2 | Hoy el restaurante no usa mesas en su proceso manual. | Decisión: la administradora define el nombre y la cantidad de mesas al instalar (CUS05.1); se prevé una capacitación breve al personal. |
| 3 | Registrar muchas mesas una por una (10 a 15) es lento y no hay RF para registro múltiple. | Decisión: las mesas iniciales se cargan con una lista inicial (seed) editable; no se agrega un RF de registro múltiple. |
| 4 | El refresco cada 15 segundos no es tiempo real. | Decisión: se acepta como solución inicial; el tiempo real (SignalR) queda como mejora futura. |
| 5 | RF-17 junta editar y activar o desactivar en un solo requerimiento, y el pedido para llevar (CUS07) no usa mesas. | Dejarlo documentado: mesas solo aplican a pedidos de mesa. |
| 6 | Aún no existen bocetos de las Vistas 6.1 a 6.4. | Diseñarlas en Figma con los estados de la sección 7, empezando por la vista móvil del mozo. |


# CUS06: Registro de pedido de mesa


## 1. Ficha del CUS general


<!-- tabla 31 -->
| Campo | Detalle |
|---|---|
| CUS general | CUS06: Registro de pedido de mesa |
| Interfaz (GUI) | Interfaz 6: Pedido de mesa |
| Actor(es) | Mozo y Administrador |
| HU / RF de origen | HU18 y HU19 / RF-18 y RF-19 |
| Descripción | Pantalla de toma de pedido con dos modos: pedido nuevo en una mesa libre u ocupada (Vistas 6.1 y 6.2) y ampliación de un pedido abierto (Vista 6.3). El mozo arma menús completos (una opción por parte) y agrega productos de carta; al registrar, el sistema guarda el pedido, ocupa la mesa y genera la comanda para cocina. |
| Alcance | La comanda y el aviso a cocina son pasos de este CUS (no hay CUS propio de generar comanda). Modificar o anular líneas ya registradas se hace en la gestión de pedidos (CUS08.2). |


<!-- tabla 32 -->
| CUS | Título | HU | RF | Prioridad | Iteración | Complejidad |
|---|---|---|---|---|---|---|
| CUS06.1 | Registrar pedido de mesa con menús completos | HU18 | RF-18 | Alta (Must) | 1/3 | Alta |
| CUS06.2 | Agregar productos a un pedido de mesa | HU19 | RF-19 | Media (Should) | 2/3 | Media |

Criterio: la prioridad se obtiene de la validación MoSCoW de la HU (Must = Alta, Should = Media, Could = Baja) y la iteración sigue la prioridad (Alta = 1/3, Media = 2/3, Baja = 3/3).

## 2. Decisiones adoptadas


<!-- tabla 33 -->
| Tema | Decisión | Vacío que cubre |
|---|---|---|
| Quién registra | El Mozo y el Administrador registran pedidos de mesa y les agregan productos. Los demás roles (por ejemplo, el Cajero) no ven la opción y el servidor responde 403. | RF-18 y RF-19 |
| Contenido del pedido | Una mesa y una o más líneas; cada línea es un producto de carta o un menú completo con una opción por parte, con cantidad y una observación opcional (por ejemplo, "presa de pescado" o "sin ají"). | RF-18 |
| Qué productos se ofrecen | Los productos de carta del menú del día, las opciones del día y los menús completos habilitados que no estén agotados. Sin menú definido, todos los productos de carta, los componentes y los menús completos activos (RN-35 y RN-142). Lo agotado se muestra «Agotado» y no se puede elegir. | CUS04 |
| Cantidad y observación | Cantidad entera de 1 a 20 por línea. Observación de hasta 100 caracteres, texto libre y opcional. | CUS06.1: "entero mayor a cero" |
| Líneas repetidas | Agregar el mismo producto (o el mismo menú completo con las mismas opciones) con la misma observación suma la cantidad; con otra observación u otras opciones crea otra línea (RV-165). | Faltaba la regla |
| Precio y total | Cada línea guarda el precio vigente al agregarse (RN-26); la línea de un menú completo guarda el precio del menú y las opciones no suman ni restan (RN-133). El total se calcula en el servidor y siempre se muestra en pantalla. Los precios son finales, sin IGV aparte. | RF-25 y CUS03 |
| Pedido en armado | Vive solo en el dispositivo hasta pulsar REGISTRAR PEDIDO. Antes de registrar, el mozo puede cambiar cantidades o quitar líneas. | Faltaba definir el borrador |
| Registro atómico | Guardar el pedido, ocupar la mesa y generar la comanda (con las opciones elegidas) ocurren juntos; si algo falla, no se guarda nada y la mesa sigue libre. | CUS06.1: excepciones |
| Sin duplicados | Cada envío lleva un identificador único; un doble toque o un reintento tras perder la conexión no crea dos pedidos. | Faltaba la regla |
| Numeración | Cada pedido recibe un número correlativo que se reinicia cada día y se muestra en comandas y listas (por ejemplo, N.º 12). No es el número del comprobante. | Faltaba la regla |
| Ampliar un pedido (CUS06.2) | Permitido mientras no esté pagado ni anulado; genera una comanda adicional solo con los productos nuevos. Si el pedido estaba "listo", vuelve a "pendiente" hasta que cocina marque la comanda adicional. | CUS06.2 |
| Qué no se puede hacer aquí | Modificar o eliminar líneas ya registradas: eso se hace en la gestión de pedidos (CUS08.2) antes de que cocina inicie. | RF-21 |
| Auditoría | Se registra quién, cuándo y sobre qué mesa y pedido se registró o amplió un pedido. | Control de la dueña |
| Armado de menús completos | Al tocar un menú completo, el mozo elige una opción por parte; la línea no se agrega hasta completarlas. Una línea con cantidad N comparte las opciones; para opciones distintas se agregan líneas separadas y REPETIR agrega otra igual con un toque. | Ajuste de menús completos |
| Menú completo disponible | Solo se ofrece si cada parte tiene al menos una opción disponible; si no, aparece como «No disponible hoy» (RN-136). | Ajuste de menús completos |
| Historial | La línea guarda los nombres de las opciones elegidas, aunque después se edite o desactive el componente (RN-141). | Ajuste de menús completos |
| Comanda de un menú completo | Muestra el nombre del menú, las opciones elegidas y lo que incluye; la observación es adicional (RN-137). | Ajuste de menús completos |


## 3. Análisis del usuario (Diseño Centrado en el Usuario)


<!-- tabla 34 -->
| Aspecto | Descripción |
|---|---|
| Quién usa la interfaz | El mozo, con experiencia tecnológica básica, que toma pedidos de pie y con el celular en una mano. |
| Necesidades | Registrar rápido lo que pide el cliente (por ejemplo, un desayuno completo con quaker y seco de pollo, o 2 almuerzos completos con el tipo de presa); ver el total; estar seguro de que cocina lo recibió; agregar un pedido adicional sin empezar de cero. |
| Dificultades previsibles | Pedir un plato que ya se agotó; equivocar la mesa o la cantidad; tocar dos veces por la prisa y duplicar el pedido; perder lo escrito si falla la conexión; escribir observaciones largas con el teclado del celular. |
| Contexto de uso | Hora pico, ruido, interrupciones, mesas llenas y conexión inestable. Hoy el mozo no anota nada y avisa de palabra al cocinero. |


## 4. Plantillas de casos de uso


### CUS06.1: Registrar pedido de mesa con menús completos


<!-- tabla 35 -->
| Código: CUS06.1 | Título: Registrar pedido de mesa con menús completos (Vistas 6.1 y 6.2) | Fecha: 21.10.2026 | Iteración: 1/3 |
|---|---|---|---|
| Actor(es): Mozo o Administrador |  |  |  |
| Prioridad: Alta (Must) | Complejidad: Alta |  |  |
| Historia de usuario: HU18 · Registrar pedido de mesa (M) |  |  |  |
| Requerimiento de origen: RF-18 (ampliado con menús completos y generación de la comanda) |  |  |  |
| Descripción: Permite al mozo registrar el pedido de una mesa armando menús completos (una opción por parte) y agregando productos de carta con cantidades y observaciones, para que cocina reciba exactamente lo que pidió el cliente. |  |  |  |
| Precondición: El mozo tiene sesión iniciada, la mesa está activa (libre u ocupada) y existen opciones disponibles (del menú del día o, sin menú definido, todas las activas). |  |  |  |
| Flujo principal:<br>1. El mozo selecciona una mesa (libre u ocupada) en la vista de mesas (CUS05.2) o pulsa NUEVO PEDIDO. Si la mesa ya tiene pedidos abiertos (un comensal que se suma o un pedido aparte), el sistema muestra MSG-95 y el mozo elige PEDIDO NUEVO (continúa este flujo) o AGREGAR PRODUCTOS (CUS06.2).<br>2. El sistema muestra "Cargando menú…", luego la mesa elegida (o el selector de mesas libres), las tarjetas de los menús completos disponibles y los productos de carta agrupados por categoría.<br>3. Para un menú completo (por ejemplo, Desayuno completo S/ 7.00), lo toca y el sistema abre el armado con una fila de opciones por parte: Bebida y Plato.<br>4. Toca una opción en cada parte (por ejemplo, Quaker y Seco de pollo); el sistema muestra lo que incluye ("pan") y habilita AGREGAR S/ 7.00.<br>5. Pulsa AGREGAR; el sistema suma la línea con el menú, sus opciones y el precio del menú, y muestra MSG-222. Para otro igual pulsa REPETIR; para otro distinto repite el armado.<br>6. Opcionalmente toca + y − en productos de carta, ajusta cantidades y pulsa "Nota" para escribir una observación por línea (por ejemplo, "presa de pescado" o "sin ají").<br>7. El sistema calcula y muestra el total en el resumen fijo.<br>8. El mozo revisa el detalle y pulsa REGISTRAR PEDIDO; el sistema valida (RV-60 a RV-65, RV-163 a RV-165) y deshabilita el botón (RV-67).<br>9. El servidor revalida mesa y disponibilidad (incluidas las opciones elegidas) y, en una sola operación, guarda el pedido como "pendiente" con su número, ocupa la mesa y genera la comanda para cocina con las opciones.<br>10. El sistema muestra la confirmación MSG-100 con el número del pedido y los botones NUEVO PEDIDO y VER MESAS. |  |  |  |
| Flujo alterno:<br>La mesa ya tiene pedidos abiertos (incluso si otro mozo la ocupó mientras se armaba): MSG-95 con PEDIDO NUEVO y AGREGAR PRODUCTOS (CUS06.2); el pedido en armado no se pierde.<br>No se completó una parte de un menú completo: MSG-221; no se agrega la línea.<br>Un menú completo «No disponible hoy» (sin opciones en alguna parte): MSG-220; no se puede tocar.<br>Una opción o un plato se agotó mientras se armaba: MSG-223 o MSG-225 y debe elegirse otra; si el servidor lo rechaza al registrar, se marcan las líneas con MSG-225 y MSG-103.<br>No se agregó ningún producto: MSG-97 y el botón queda deshabilitado.<br>Cantidad fuera de 1 a 20 o no entera: MSG-98 junto a la línea. Observación de más de 100 caracteres: MSG-99.<br>No hay mesa seleccionada: MSG-96. No hay mesas activas: MSG-108. No hay productos disponibles: MSG-107.<br>Doble toque en REGISTRAR PEDIDO o reintento tras perder la conexión: se crea un solo pedido (RV-67).<br>Cancelar con productos en el pedido (botón o Esc): MSG-102; si confirma, se descarta sin guardar.<br>Usuario sin rol Mozo ni Administrador (por ejemplo, un Cajero) intenta registrar por URL o servicio: MSG-39 (403). |  |  |  |
| Postcondición: El pedido queda registrado en estado "pendiente" con sus menús completos y opciones, la mesa queda ocupada y cocina recibe la comanda. |  |  |  |
| Excepciones:<br>Falla al guardar o al enviar la comanda: MSG-105; no se guarda nada, la mesa no se ocupa, el pedido en armado se conserva en pantalla y se registra el incidente.<br>Pérdida de conexión: MSG-09 y MSG-105; al reintentar no se duplica el pedido. |  |  |  |
| Reglas y mensajes aplicables: RV-60 a RV-68, RV-70, RV-71, RV-159, RV-163 a RV-166; RN-48 a RN-51, RN-54, RN-56, RN-133, RN-136, RN-137, RN-141, RN-142; RNF-21 a RNF-24, RNF-58, RNF-59; MSG-95 a 100, 102, 103, 105, 107, 108, 220 a 223, 225, 39. |  |  |  |


### CUS06.2: Agregar productos a un pedido de mesa


<!-- tabla 36 -->
| Código: CUS06.2 | Título: Agregar productos a un pedido de mesa (Vista 6.3) | Fecha: 21.10.2026 | Iteración: 2/3 |
|---|---|---|---|
| Actor(es): Mozo o Administrador |  |  |  |
| Prioridad: Media (Should) | Complejidad: Media |  |  |
| Historia de usuario: HU19 · Agregar productos a un pedido de mesa (S) |  |  |  |
| Requerimiento de origen: RF-19 (ampliado con menús completos) |  |  |  |
| Descripción: Permite al mozo agregar productos o menús completos a un pedido de mesa aún no pagado cuando el cliente pide algo adicional, sin crear un pedido aparte. |  |  |  |
| Precondición: El mozo tiene sesión iniciada y la mesa tiene un pedido que no está pagado ni anulado. |  |  |  |
| Flujo principal:<br>1. El mozo selecciona la mesa ocupada en la vista de mesas (o el pedido desde la lista de pedidos).<br>2. El sistema muestra el detalle del pedido actual (líneas, estado y total) y la lista de productos y menús completos disponibles.<br>3. El mozo elige los productos nuevos o arma menús completos (una opción por parte), sus cantidades y, si desea, una nota por línea.<br>4. El sistema muestra el total actualizado en el resumen fijo.<br>5. Pulsa AGREGAR AL PEDIDO; el sistema valida (RV-61 a RV-65, RV-69, RV-163 a RV-165) y deshabilita el botón.<br>6. El servidor revalida el estado del pedido y la disponibilidad, añade las líneas, recalcula el total y genera una comanda adicional solo con los productos nuevos.<br>7. El sistema muestra MSG-101 y el detalle actualizado del pedido. |  |  |  |
| Flujo alterno:<br>El pedido ya fue pagado o anulado: MSG-104 y no se modifica.<br>No se seleccionó ningún producto: MSG-97. No se completó una parte de un menú completo: MSG-221.<br>Un plato u opción se agotó mientras se armaba la ampliación: se rechaza y se marcan las líneas con MSG-225 o MSG-223 y MSG-103.<br>El pedido estaba "listo": al agregar productos vuelve a "pendiente" hasta que cocina marque la comanda adicional como lista (RN-53).<br>Dos mozos agregan productos casi a la vez: ambas ampliaciones se guardan y el total suma las dos.<br>Cancelar con productos elegidos (botón o Esc): MSG-102; el pedido se mantiene sin cambios.<br>Usuario sin rol Mozo ni Administrador (por ejemplo, un Cajero) intenta agregar por URL o servicio: MSG-39 (403). |  |  |  |
| Postcondición: El pedido queda con los nuevos productos y el total actualizado; cocina recibe una comanda adicional. |  |  |  |
| Excepciones:<br>Falla al agregar productos: MSG-106; el pedido se mantiene igual, lo elegido se conserva en pantalla y se registra el incidente.<br>Pérdida de conexión: MSG-09; al reintentar no se duplican los productos (RNF-22). |  |  |  |
| Reglas y mensajes aplicables: RV-61 a RV-71, RV-163 a RV-166; RN-48, RN-51 a RN-54, RN-56, RN-133, RN-137, RN-141; RNF-21 a RNF-24, RNF-58, RNF-59; MSG-97, 101 a 104, 106, 221 a 223, 225, 39. |  |  |  |


## 5. Interfaz (GUI)


<!-- tabla 37 -->
| Interfaz | RF | HU | CUS | Qué se hace dentro de la interfaz |
|---|---|---|---|---|
| 6. Pedido de mesa | RF-18 y RF-19 | HU18 y HU19 | CUS06 (06.1 y 06.2) | Armar el pedido con menús completos y productos de carta, registrarlo, ver la confirmación y agregar productos a un pedido abierto. |


### Vista 6.1: Armado del pedido (CUS06.1) — restaurante.app/pedidos/mesa


<!-- tabla 38 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 39 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Mesa | Preseleccionada si viene de la vista de mesas; si no, selector de mesas activas (MSG-96; MSG-108 si no hay). |
| 2 | Tarjetas de menús completos | Nombre y precio; atenuadas con «No disponible hoy» si falta una parte (MSG-220). |
| 3 | Armado de un menú completo | Una fila de opciones por parte (botones de 44 px o más), lo que incluye, AGREGAR S/ n y REPETIR; muestra MSG-221, MSG-222 y MSG-223. |
| 4 | Productos de carta | Agrupados por categoría con nombre, precio y botones + y −; los agotados con el texto «Agotado» y deshabilitados. |
| 5 | Líneas del pedido | Producto o menú con sus opciones, cantidad con − y +, subtotal, botón "Nota" (hasta 100 caracteres) y Quitar; las líneas con agotados se marcan en rojo (MSG-225, MSG-103). |
| 6 | Resumen fijo | "N productos · Total S/ n" y el botón REGISTRAR PEDIDO ("Registrando…" mientras procesa); muestra MSG-97 y MSG-105. |


### Vista 6.2: Confirmación del pedido (CUS06.1) — restaurante.app/pedidos/mesa/confirmacion


<!-- tabla 40 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 41 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Mensaje de éxito | MSG-100 con el número del pedido y la mesa. |
| 2 | Botón NUEVO PEDIDO | Reinicia el armado. |
| 3 | Botón VER MESAS | Regresa a la cuadrícula de mesas (CUS05.2). |


### Vista 6.3: Agregar productos a un pedido abierto (CUS06.2) — restaurante.app/pedidos/mesa/agregar


<!-- tabla 42 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 43 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Detalle del pedido actual | Líneas, estado y total. |
| 2 | Lista de productos y menús completos | Igual que en la Vista 6.1. |
| 3 | Resumen fijo | Nuevo total y botón AGREGAR AL PEDIDO. |
| 4 | Mensaje de éxito | MSG-101 y detalle actualizado; MSG-104 si el pedido ya fue pagado o anulado. |


## 6. Estados de la interfaz


<!-- tabla 44 -->
| Estado | Comportamiento visual |
|---|---|
| Cargando | "Cargando menú…" con marcadores de posición. |
| Selección de mesa | Si viene desde la vista de mesas, la mesa ya está elegida; si no, un selector con solo las mesas libres (MSG-108 si no hay). |
| Lista de productos | Agrupados por categoría; cada producto con nombre, precio (S/ 8.00) y botones + y −; los agotados con el texto "Agotado" y deshabilitados. |
| Línea del pedido | Producto, cantidad con − y +, subtotal, botón "Nota" para la observación y botón Quitar. |
| Resumen fijo | Barra inferior siempre visible con "N productos · Total S/ 24.00" y el botón REGISTRAR PEDIDO. |
| Pedido vacío | Botón REGISTRAR PEDIDO deshabilitado y texto de ayuda MSG-97. |
| Plato agotado durante el armado | La tarjeta pasa a "Agotado"; si ya estaba en el pedido, su línea se marca en rojo con el texto "Agotado" y MSG-225; no se elimina sola. |
| Registrando | Botón "Registrando…" deshabilitado (RV-67); el pedido en pantalla no se puede editar. |
| Éxito | Pantalla de confirmación con MSG-100, el número del pedido y botones NUEVO PEDIDO y VER MESAS. |
| Error al registrar | MSG-105 sobre el botón; el pedido en armado se conserva y se puede reintentar. |
| Mesa ocupada | Aviso MSG-95 con PEDIDO NUEVO o AGREGAR PRODUCTOS; si elige agregar, el pedido en armado se traslada a la ampliación. |
| Descartar | Diálogo MSG-102 con el foco en CANCELAR. |
| Agregar productos (CUS06.2) | Detalle del pedido actual (líneas, estado y total) y, debajo, la lista de productos para agregar; el resumen fijo muestra el nuevo total y el botón AGREGAR AL PEDIDO. |
| Móvil | Una columna, resumen fijo en la parte inferior y controles de al menos 44 px. |
| Armado de menú completo | Fila de opciones por parte; AGREGAR S/ n se habilita al completar todas; sin completar muestra MSG-221 bajo la parte. |
| Menú completo no disponible | Tarjeta atenuada con MSG-220; no se puede tocar. |
| Opción agotada durante el armado | La opción pasa a «Agotado»; si ya estaba en una línea, esa línea se marca y se muestra MSG-223 o MSG-225. |


## 7. Reglas de validación (RV)


<!-- tabla 45 -->
| Código | Regla | Elemento UI | Mensaje |
|---|---|---|---|
| RV-60 | La mesa es obligatoria y debe estar activa (libre u ocupada) al registrar un pedido nuevo. | Selector o tarjeta de mesa | MSG-96, 95, 108 |
| RV-61 | El pedido debe tener al menos una línea con producto y cantidad (al registrar y al agregar). | Botón REGISTRAR PEDIDO / AGREGAR AL PEDIDO | MSG-97 |
| RV-62 | La cantidad es un número entero entre 1 y 20 por línea. | Control de cantidad | MSG-98 |
| RV-63 | Solo se eligen productos, opciones y menús completos disponibles hoy y no agotados; los agotados se muestran como "Agotado" y no son seleccionables. | Lista de productos | MSG-225 |
| RV-64 | La observación es opcional, de hasta 100 caracteres, y se recortan los espacios de los extremos. | Campo Observación | MSG-99 |
| RV-65 | Antes de guardar, el servidor valida de nuevo mesa, productos y disponibilidad; si un plato se agotó, no se registra y se marca la línea afectada. | Línea del pedido | MSG-225, 103 |
| RV-66 | El total se calcula automáticamente (precio por cantidad) y permanece visible mientras se arma el pedido. | Resumen fijo | — |
| RV-67 | Mientras se registra, el botón queda deshabilitado con "Registrando…" y el envío lleva un identificador único para evitar duplicados. | Botón REGISTRAR PEDIDO | — |
| RV-68 | Si hay un pedido sin registrar y el mozo cancela o sale de la pantalla, se pide confirmar el descarte. | Botón CANCELAR / navegación | MSG-102 |
| RV-69 | Solo se agregan productos a un pedido que no esté pagado ni anulado. | Botón AGREGAR AL PEDIDO | MSG-104 |
| RV-70 | Los errores se muestran junto a la línea o sección que los origina y dicen qué hacer; el foco va al primer error. | Línea / sección | MSG-96 a 99, 103 |
| RV-71 | Antes de registrar, el mozo puede cambiar la cantidad o quitar cualquier línea; el total se recalcula. | Controles de la línea | — |
| RV-159 | Los componentes no se piden por separado: solo aparecen dentro del armado de un menú completo. | Pantalla de pedidos | — |
| RV-163 | Al armar un menú completo se elige exactamente una opción por parte, entre las disponibles; no se agrega la línea hasta completarlas. | Armado del menú | MSG-221, 223 |
| RV-164 | La línea conserva el nombre del menú, las opciones elegidas y el precio del menú; una línea con cantidad N comparte las opciones. | Línea del pedido | — |
| RV-165 | Agregar el mismo menú completo con las mismas opciones y la misma nota suma la cantidad; con otras opciones crea otra línea. | Botones AGREGAR y REPETIR | MSG-222 |
| RV-166 | Una opción agotada no se puede elegir; si ya estaba en un pedido en armado, su línea se marca y debe cambiarse. | Armado y líneas | MSG-223, 79 |


## 8. Reglas de negocio y requerimientos no funcionales


<!-- tabla 46 -->
| Código | Regla |
|---|---|
| RN-48 | Solo el Mozo y el Administrador registran pedidos de mesa y agregan productos a un pedido de mesa. |
| RN-49 | Un pedido de mesa se registra en estado "pendiente", con mesa, mozo, fecha y hora, y un número correlativo que se reinicia cada día. |
| RN-50 | Registrar el pedido, ocupar la mesa y generar la comanda ocurren juntos: si falla alguno, no se guarda nada y la mesa no se ocupa. |
| RN-51 | Cada línea conserva el precio unitario vigente al agregarse (RN-26) y el servidor calcula el total. |
| RN-52 | Un pedido puede ampliarse mientras no esté pagado ni anulado; cada ampliación genera una comanda adicional solo con los productos nuevos. |
| RN-53 | Si el pedido estaba "listo" y se amplía, vuelve a "pendiente" hasta que cocina marque la comanda adicional como lista. |
| RN-54 | El servidor rechaza el pedido si la mesa está inactiva (409), si un producto, opción o menú completo está inactivo, agotado o fuera del menú (409, RN-36) o si una cantidad es inválida (400). |
| RN-55 | Las líneas ya registradas no se modifican ni se eliminan desde este CUS; se hace desde la gestión de pedidos (CUS08.2) antes de que cocina inicie. |
| RN-56 | El registro y las ampliaciones se registran en auditoría con usuario, fecha, mesa y pedido. |
| RNF-21 | El registro responde en menos de 2 segundos; la interfaz es táctil y usable con una mano en móvil, con controles de al menos 44 px y el total siempre visible. |
| RNF-22 | La operación es atómica e idempotente: el mismo identificador de solicitud devuelve el pedido ya creado sin duplicarlo. |
| RNF-23 | El servidor valida token y rol (Mozo o Administrador) en cada endpoint y repite todas las validaciones (RNF-02). |
| RNF-24 | La lista de productos se obtiene del menú del día y se refresca cada 30 segundos (RNF-14) sin perder el pedido en armado. |
| RN-133 | El precio de una línea de menú completo es el precio vigente del menú al agregarse (RN-51); las opciones no suman ni restan. |
| RN-136 | Un menú completo está disponible solo si cada parte tiene al menos una opción disponible ese día; si no, aparece como "No disponible hoy". |
| RN-137 | La comanda de un menú completo muestra su nombre, las opciones elegidas y lo que incluye; la observación es adicional. |
| RN-141 | Las opciones elegidas se guardan con su nombre en la línea del pedido; editar o desactivar el componente después no cambia el historial. |
| RN-142 | Sin menú del día definido, el armado ofrece todos los componentes activos de cada rol y todos los menús completos activos. |
| RNF-58 | Elegir una opción por parte y agregar la línea requiere un toque por parte y uno para agregar, sin recargar la página. |
| RNF-59 | El armado toma las opciones del servicio del menú del día y se refresca cada 30 segundos sin perder lo elegido (RNF-24). |


## 9. Catálogo de mensajes

Se reutilizan MSG-95 (la mesa ya tiene un pedido abierto), MSG-09 (conexión), MSG-38 (operación fallida), MSG-39 (sin permiso) y MSG-220 (menú no disponible hoy, CUS04). El mensaje de plato agotado pasa a ser MSG-225 porque MSG-79 ya es «No hay menú definido para hoy».

<!-- tabla 47 -->
| Código | Mensaje (texto al usuario) | Tipo | Ubicación |
|---|---|---|---|
| MSG-96 | Seleccione una mesa. | Error | Sobre el selector de mesa |
| MSG-97 | Agregue al menos un producto al pedido. | Error | Sobre el botón de registrar |
| MSG-98 | La cantidad debe ser un número entero entre 1 y 20. | Error | Junto a la línea |
| MSG-99 | La observación no puede superar los 100 caracteres. | Error | Junto a la línea |
| MSG-100 | Pedido N.º [n] registrado para [mesa]. La comanda se envió a cocina. | Éxito | Pantalla de confirmación |
| MSG-101 | Productos agregados al pedido N.º [n]. Se envió una comanda adicional a cocina. | Éxito | Pantalla de confirmación |
| MSG-102 | Tiene un pedido sin registrar. ¿Desea descartarlo? | Confirmación | Diálogo |
| MSG-103 | Hay platos agotados en su pedido. Quite o cambie las líneas marcadas. | Error | Sobre la lista de líneas |
| MSG-104 | El pedido ya no puede modificarse porque fue pagado o anulado. | Error | Aviso |
| MSG-105 | No se pudo registrar el pedido. Su pedido sigue en pantalla; intente nuevamente. | Error | Sobre el botón de registrar |
| MSG-106 | No se pudieron agregar los productos. El pedido no cambió; intente nuevamente. | Error | Sobre el botón de agregar |
| MSG-107 | No hay productos disponibles para pedir. Avise a la administradora. | Informativo | En la pantalla |
| MSG-108 | No hay mesas activas. Revise la vista de mesas. | Informativo | Selector de mesa |
| MSG-221 | Elija una opción en "[parte]". | Error | Bajo la parte sin elegir |
| MSG-222 | [Menú] agregado: [opción 1] + [opción 2]. | Éxito | Aviso temporal |
| MSG-223 | La opción "[nombre]" se agotó. Elija otra en "[parte]". | Error | Armado y línea |
| MSG-225 | El plato [nombre] se agotó. Elija otro plato. | Error | Armado y línea |


## 10. Diccionario de datos


<!-- tabla 48 -->
| Campo | Tipo | Obligatorio | Longitud / formato | Notas |
|---|---|---|---|---|
| Mesa | Selección | Sí (pedido nuevo) | Mesa activa y libre | Viene de la vista de mesas o del selector |
| Producto (por línea) | Selección | Sí | Del menú del día, no agotado | — |
| Cantidad (por línea) | Entero | Sí | 1–20 | Por defecto 1 |
| Observación (por línea) | Texto | No | 0–100 | Se recorta |
| Precio unitario | Decimal (8,2) | Automático | S/ | Vigente al agregar la línea; no editable |
| Subtotal y total | Decimal (8,2) | Automático | S/ 0.00 | Calculados por el servidor |
| Estado del pedido | Lista | Automático | Pendiente al registrar | Luego lo gobiernan cocina, cobro y anulación |
| Número del pedido | Entero | Automático | Correlativo diario | Se muestra en comandas y listas |
| Mozo, fecha y hora | Texto y fecha | Automático | Del token y del servidor | No editables |
| Identificador de solicitud | Texto único | Automático | — | Evita duplicados |
| Menú completo (por línea) | Selección | Alternativo al producto | Menú completo activo y disponible hoy | Precio fijo del menú; las opciones no suman |
| Opción por parte | Selección | Sí, una por parte | Del menú del día, no agotada | Se guarda con su nombre (RN-141); una fila por parte |


### 10.1 Modelo de datos de la línea de pedido


<!-- tabla 49 -->
| Entidad | Campos | Notas |
|---|---|---|
| LineaPedido (cambia) | Id, PedidoId, ProductoId o MenuCompletoId, Nombre (copia), Cantidad, Precio unitario (copia), Observación | Precio del menú, no suma de opciones |
| LineaPedidoOpcion (nueva) | Id, LineaPedidoId, Parte, ProductoId, Nombre (copia) | Una fila por parte elegida; base de los reportes por componente |


## 11. Contrato de API

Todos los endpoints exigen token JWT (401 sin token válido) y validan el rol en el servidor (403 si no corresponde).

<!-- tabla 50 -->
| Endpoint | Entrada | Respuestas |
|---|---|---|
| GET /api/menu-dia | — | Productos de carta, opciones por rol, menús completos y su disponibilidad (definido en el CUS04). Roles: Administrador, Cajero, Mozo y Cocinero. |
| GET /api/mesas | estado=libre | Mesas libres para el selector (definido en el CUS05). |
| POST /api/pedidos/mesa | { solicitudId, mesaId, lineas[] } donde cada línea es { productoId, cantidad, observacion? } o { menuCompletoId, elecciones[{ parte, productoId }], cantidad, observacion? } | 201: { pedidoId, numero, total, comandaId }. 400: sin líneas, partes sin elegir, cantidad u observación inválidas. 404: la mesa no existe. 409: mesa inactiva, plato, opción o menú agotado, inactivo o fuera del menú (con la lista). 403: rol no permitido. Roles: Mozo y Administrador. |
| GET /api/pedidos/{id} | — | 200: detalle del pedido (líneas, estado, total). 404: no existe. Roles: Administrador, Cajero y Mozo. |
| POST /api/pedidos/{id}/lineas | { solicitudId, lineas[] } con el mismo formato de línea que POST /api/pedidos/mesa | 200: { total, comandaId }. 400: datos inválidos. 404: no existe. 409: pedido pagado o anulado (pedido_cerrado), plato agotado o inactivo. Roles: Mozo y Administrador. |


## 12. Escenarios de validación y criterios de aceptación


<!-- tabla 51 -->
| ID | Entrada / acción | Resultado esperado | Reglas | HU |
|---|---|---|---|---|
| E-140 | El mozo elige una mesa libre, agrega 2 almuerzos y 1 desayuno y registra | Total correcto; MSG-100; pedido "pendiente" con número; la mesa pasa a Ocupada y cocina recibe la comanda. | RN-49, RN-50 | HU18 |
| E-141 | Agregar la observación "presa de pescado" | La observación aparece en la línea y en la comanda. | RV-64 | HU18 |
| E-142 | Intentar registrar sin productos | Botón deshabilitado y MSG-97. | RV-61 | HU18 |
| E-143 | Cantidad 0, 21, 1.5 o texto | MSG-98; no se registra. | RV-62 | HU18 |
| E-144 | Observación de más de 100 caracteres | MSG-99. | RV-64 | HU18 |
| E-145 | Un plato aparece agotado en el catálogo | Se muestra como "Agotado" y no se puede seleccionar. | RV-63 | HU18 |
| E-146 | Un plato se agota mientras el mozo arma el pedido | La línea se marca; al registrar, el servidor rechaza con MSG-225 y MSG-103; el mozo la quita y registra. | RV-65, RN-54 | HU18 |
| E-147 | Otro mozo ocupó la mesa mientras se armaba el pedido | Se registra como pedido separado de la misma mesa; el pedido en armado no se pierde. | RN-54 | HU18 |
| E-148 | Registrar sin mesa seleccionada | MSG-96. | RV-60 | HU18 |
| E-149 | No hay mesas activas | MSG-108 en el selector. | RV-60 | HU18 |
| E-150 | No hay menú del día definido | El catálogo muestra todos los productos activos. | RN-35 | HU18 |
| E-151 | No hay productos disponibles | MSG-107. | — | HU18 |
| E-152 | Doble toque en REGISTRAR PEDIDO | Se crea un solo pedido. | RV-67, RNF-22 | HU18 |
| E-153 | Se pierde la conexión al registrar | MSG-105; el pedido sigue en pantalla; al reintentar no se duplica. | RNF-22 | HU18 |
| E-154 | Falla el envío de la comanda | No se guarda nada y la mesa sigue libre. | RN-50 | HU18 |
| E-155 | Cancelar con productos en el pedido | MSG-102; al confirmar se descarta. | RV-68 | HU18 |
| E-156 | Cambiar la cantidad o quitar una línea antes de registrar | El total se recalcula. | RV-66, RV-71 | HU18 |
| E-157 | La administradora cambia un precio después de registrado el pedido | El pedido conserva el precio con que se registró. | RN-51, RN-26 | HU18 |
| E-158 | Agregar productos a un pedido pendiente | MSG-101; comanda adicional solo con los productos nuevos; total recalculado. | RN-52 | HU19 |
| E-159 | Agregar productos a un pedido "listo" | El pedido vuelve a "pendiente". | RN-53 | HU19 |
| E-160 | Agregar productos a un pedido pagado o anulado | MSG-104; no se modifica. | RV-69 | HU19 |
| E-161 | Agregar sin elegir productos | MSG-97. | RV-61 | HU19 |
| E-162 | Cancelar la ampliación con productos elegidos | MSG-102; el pedido queda igual. | RV-68 | HU19 |
| E-163 | Un cajero, el administrador o el cocinero intenta registrar por URL o servicio | 403 y MSG-39; la opción no aparece en su menú. | RN-48 | HU18, HU19 |
| E-164 | Dos mozos agregan productos al mismo pedido casi a la vez | Se guardan ambas ampliaciones y el total suma las dos. | RN-52 | HU19 |
| E-165 | Solo teclado (computadora) | Tab recorre mesa, productos, cantidades, notas y botones; Enter confirma; Esc cancela. | RNF-21 | HU18, HU19 |
| E-387 | El mozo arma Desayuno completo con Quaker y Seco de pollo | Línea a S/ 7.00 con "incluye pan"; MSG-222; el total suma solo S/ 7.00. | RV-163, RN-133 | HU18 |
| E-388 | Agregar sin elegir una parte | MSG-221; no se agrega. | RV-163 | HU18 |
| E-389 | Dos desayunos: Quaker con Seco de pollo y Anís con Asado de pollo | Dos líneas de S/ 7.00; total S/ 14.00. | RV-164 | HU18 |
| E-390 | El mismo menú con las mismas opciones, con REPETIR | Suma la cantidad a 2 en una sola línea. | RV-165 | HU18 |
| E-391 | Almuerzo completo con Sopa a la minuta más Lomo saltado, y con Papa a la huancaína más Lomo saltado | Ambos a S/ 8.00. | RN-132 | HU18 |
| E-392 | Solo segundo | S/ 7.00 sin sopa ni entrada. | RN-132 | HU18 |
| E-393 | Agregar la nota "sin ají" a un menú completo | La nota va aparte de las opciones y llega a cocina. | RN-137 | HU18 |
| E-395 | Una opción se agota mientras se arma el pedido | MSG-223; el mozo la cambia y registra. | RV-166 | HU18 |


## 13. Matriz de justificación de usabilidad


<!-- tabla 52 -->
| Principio aplicado | Elemento de la interfaz | Decisión adoptada | Justificación |
|---|---|---|---|
| ISO 9241 – Eficacia | Validación en servidor y mensajes | Se revalida mesa y disponibilidad antes de guardar; los mensajes indican qué hacer | El pedido llega a cocina correcto aunque el estado haya cambiado |
| ISO 9241 – Eficiencia | Botones + y −, resumen fijo | Cantidad con un toque, total siempre visible, mesa preseleccionada | Pocos pasos por pedido en hora pico |
| ISO 9241 – Satisfacción | Confirmación y avisos | Pantalla de éxito con número de pedido y siguiente acción | El mozo sabe que cocina recibió el pedido |
| Nielsen 1 – Visibilidad del estado | Total, "Registrando…" y "Agotado" | Total en vivo; indicadores de proceso; platos agotados marcados | Siempre sabe qué ocurre |
| Nielsen 2 – Mundo real | Textos | Mesa, almuerzo, desayuno, presa, "comanda" | Mismo lenguaje del restaurante |
| Nielsen 3 – Control y libertad | Quitar, cambiar cantidad y cancelar | Corregir el pedido antes de registrar; descartar con confirmación | Corrige sin penalización |
| Nielsen 4 – Consistencia | Patrón de tarjetas, botones y avisos | Mismos componentes que mesas y menú del día | Evita reaprendizaje |
| Nielsen 5 – Prevención de errores | Agotados, registro único y atomicidad | Platos agotados no seleccionables; identificador único; todo o nada | Evita pedidos imposibles y duplicados |
| Nielsen 6 – Reconocimiento | Lista de productos con precio | Nombre y precio visibles; el detalle se ve antes de registrar | No obliga a recordar precios ni lo pedido |
| Nielsen 7 – Flexibilidad y eficiencia | Acceso desde la mesa | Se puede empezar desde la mesa libre o desde NUEVO PEDIDO | Atajos para el mozo frecuente |
| Nielsen 8 – Minimalismo | Línea de pedido | Solo producto, cantidad, nota y quitar | Sin distracciones |
| Nielsen 9 – Recuperarse de errores | Mensajes MSG-95, 103 y 105 | Indican la salida (agregar productos, quitar la línea, reintentar) sin perder el pedido | Facilita corregir |
| Shneiderman 1 – Consistencia | Estilo y acciones | Misma paleta, botones y mensajes del sistema | Comportamiento predecible |
| Shneiderman 2 – Usabilidad universal | Móvil y atajos | Una columna, controles de 44 px, uso con una mano, teclado en computadora | Atiende distintos dispositivos y niveles |
| Shneiderman 3 – Retroalimentación | Avisos y resaltado | MSG-100 y 101; línea resaltada al agregar | Sabe qué pasó |
| Shneiderman 4 – Cierre | Pantalla de confirmación | Termina con el número del pedido y NUEVO PEDIDO / VER MESAS | Indica que la tarea concluyó |
| Shneiderman 5 – Prevenir errores | Validaciones | No registra vacío ni inválido; botón bloqueado al enviar | Evita datos inválidos y duplicados |
| Shneiderman 6 – Reversión | Quitar y descartar | Deshacer líneas y descartar el pedido en armado | Acciones reversibles antes de registrar |
| Shneiderman 7 – Control del usuario | Todo el flujo | Cada acción la inicia el mozo; el sistema no quita líneas por su cuenta | Mantiene el control |
| Shneiderman 8 – Memoria a corto plazo | Resumen fijo y detalle | Muestra siempre lo pedido y el total | No debe recordar lo anotado |
| ISO 9241 – Eficiencia | Botón REPETIR y precio fijo | Duplicar una configuración con un toque; el total no depende de las opciones | Pedidos de varias personas con pocos toques |
| Norman – Mapping | Partes del menú | La pantalla repite el orden en que se habla: "quaker con seco de pollo y pan" | El armado coincide con el modelo mental del personal |
| Nielsen 1 – Visibilidad del estado | "No disponible hoy" y "Agotado" | El menú sin opciones se muestra atenuado con texto | Se entiende por qué no se puede pedir |
| Nielsen 2 – Mundo real | Nombres | "Desayuno completo", "Almuerzo completo", "Solo segundo", "Incluye pan" | Mismo lenguaje del restaurante |
| Nielsen 5 – Prevención de errores | Elección obligatoria por parte | No agrega una línea incompleta ni una opción agotada | Evita pedidos que cocina no puede preparar |
| Nielsen 6 – Reconocimiento | Opciones visibles | Todas las opciones del día se ven como botones, sin escribir | No obliga a recordar ni a digitar |
| Nielsen 7 – Flexibilidad y eficiencia | Menús habilitados por día | Lo que no se ofrece hoy no aparece | Menos ruido en hora pico |
| Shneiderman 2 – Usabilidad universal | Opciones como botones grandes | Botones de 44 px o más, con texto y no solo color | Uso con una mano y en móvil |
| Shneiderman 8 – Memoria a corto plazo | Línea con sus opciones | El pedido muestra "Quaker + Seco de pollo" en cada línea | No hay que recordar qué pidió cada cliente |


## 14. Matriz de trazabilidad


### 14.1 Requerimiento → historia → caso de uso → vista → prueba


<!-- tabla 53 -->
| RF | HU | CUS | Vista | Reglas / mensajes | API | Escenarios |
|---|---|---|---|---|---|---|
| RF-18 Registrar pedido de mesa | HU18 (M) | CUS06.1 | 6.1 y 6.2 | RV-60 a 68, 70, 71, 159, 163 a 166; RN-48 a 51, 54, 56, 133, 136, 137, 141, 142; MSG-95 a 100, 102, 103, 105, 107, 108, 220 a 223, 225 | POST /api/pedidos/mesa | E-140 a E-157, E-163, E-165, E-387 a E-393, E-395 |
| RF-19 Agregar productos a un pedido | HU19 (S) | CUS06.2 | 6.3 | RV-61 a 71, 163 a 166; RN-52 a 54, 133, 137, 141; MSG-97, 101 a 104, 106, 221 a 223, 225 | GET /api/pedidos/{id} y POST .../lineas | E-158 a E-164 |


### 14.2 Regla → elemento de interfaz → escenario


<!-- tabla 54 -->
| Regla | Elemento de interfaz | Escenario |
|---|---|---|
| RV-60 | Selector o tarjeta de mesa | E-147 a E-149 |
| RV-61 | Botón REGISTRAR PEDIDO deshabilitado sin productos | E-142, E-161 |
| RV-62 / RV-64 | Controles de cantidad y campo de nota | E-143, E-144 |
| RV-63 | Productos con el texto "Agotado" | E-145 |
| RV-65 / RN-54 | Revalidación en el servidor y líneas marcadas | E-146, E-147 |
| RV-66 / RV-71 | Resumen fijo con el total y controles de la línea | E-156 |
| RV-67 / RNF-22 | Botón en "Registrando…" e identificador de solicitud | E-152, E-153 |
| RV-68 | Diálogo MSG-102 | E-155, E-162 |
| RV-69 / RN-52, RN-53 | Detalle del pedido y estado tras ampliar | E-158 a E-160 |
| RV-163 a RV-165 | Armado por partes, AGREGAR y REPETIR | E-387 a E-390 |
| RV-166 / RN-136 | Opción agotada y «No disponible hoy» | E-395 |
| RN-50 | Operación atómica (pedido, mesa y comanda) | E-140, E-154 |
| RN-51 / RN-26 / RN-133 | Precio guardado en cada línea y precio fijo del menú | E-157, E-387, E-391, E-392 |
| RN-48 | Opción visible solo para el Mozo; 403 en el servidor | E-163 |


## 15. Evaluación del prototipo y mejoras incorporadas

Aún no hay prototipo del registro de pedido; las decisiones siguientes aplican lo aprendido en los CUS anteriores.

<!-- tabla 55 -->
| Riesgo previsto | Principio | Decisión de diseño incorporada |
|---|---|---|
| Toma de pedido con prisa y una sola mano | Shneiderman 2; Nielsen 7 | Botones + y − grandes (44 px o más), mesa preseleccionada y resumen fijo abajo |
| Pedir un plato agotado | Nielsen 5 y 9 | Platos agotados visibles y deshabilitados, y revalidación en el servidor |
| Duplicar el pedido por doble toque | Nielsen 5; Shneiderman 5 | Botón "Registrando…" e identificador único de solicitud |
| Perder lo escrito si falla la conexión | Nielsen 9 | El pedido se conserva en pantalla y se puede reintentar sin duplicar |
| Escribir mucho en el celular | Nielsen 7; Shneiderman 8 | Nota opcional y corta (100 caracteres), solo al tocar "Nota" |
| No saber si cocina recibió el pedido | Nielsen 1; Shneiderman 3 y 4 | Pantalla de confirmación con el número del pedido y la mesa |
| Estilo distinto al resto del sistema | Shneiderman 1; Nielsen 4 | Reutilizar paleta, botones, diálogos y avisos de los CUS anteriores |
| Pedir "quaker con seco de pollo" solo como texto libre | Nielsen 2; Nielsen 5 | Armado por partes con una opción por parte y precio fijo del menú |
| Perder de vista qué eligió cada cliente | Shneiderman 8 | Cada línea muestra el menú con sus opciones ("Quaker + Seco de pollo") |


## 16. Dependencias con otros casos de uso


<!-- tabla 56 -->
| CUS relacionado | Relación con el CUS06 |
|---|---|
| CUS03 y CUS04 | Productos activos y precio vigente; el menú del día y los platos agotados definen qué se puede pedir. |
| CUS05 Mesas | Elige la mesa (libre u ocupada); al registrar, la mesa pasa a Ocupada; una mesa ocupada admite un pedido nuevo (CUS06.1) o agregar productos (CUS06.2). |
| CUS08 Gestión de pedidos | Lista el pedido, y permite modificar o anular líneas antes de que cocina inicie (CUS08.2). |
| CUS09 Cocina | Recibe la comanda al registrar y una comanda adicional al ampliar. |
| CUS10 Cobro | Cobra el pedido de la mesa con el total y los precios guardados. |


<!-- tabla 57 -->
| N.º | Punto | Decisión adoptada o tarea |
|---|---|---|
| 1 | Decisión: una mesa puede tener varios pedidos abiertos (un comensal que se suma después o un pedido aparte de bebidas) y cada pedido se cobra por separado. HU19 (agregar productos al mismo pedido) sigue siendo Should porque la alternativa es registrar un pedido nuevo (CUS06.1). | Reflejarlo en RN-46 y en la justificación MoSCoW de HU19; la mesa vuelve a Libre cuando ningún pedido queda pendiente de cobro (RN-147). |
| 2 | Quién registra pedidos de mesa. | Decisión: el Mozo y el Administrador registran pedidos de mesa y les agregan productos; el Cajero no (RN-48, RF-18 y RF-19). |
| 3 | El estado del pedido tras ampliarlo (RN-53) y su cálculo a partir de las comandas deben coincidir con la gestión de pedidos (CUS08) y la cocina (CUS09). | Definir en un solo lugar la tabla de estados del pedido y de la comanda. |
| 4 | El número correlativo diario del pedido (RN-49) no es el número del comprobante de pago (RF-26). | Documentarlo en el modelo de datos para evitar confusión. |
| 5 | Las observaciones ("presa de pescado", "milanesa") son texto libre, lento en el celular. | Mejora futura: observaciones rápidas con botones predefinidos (requeriría un RF). |
| 6 | El pedido en armado vive solo en el dispositivo: si el celular se apaga antes de registrar, se pierde. | Decisión: se acepta como limitación; el pedido se registra en segundos. |
| 7 | Aún no existen bocetos de las Vistas 6.1 a 6.3 ni del armado de menús completos. | Diseñarlos en Figma con los estados de la sección 6, empezando por la vista móvil del mozo. |
