# Catálogo Completo de Escenarios de Prueba y Aceptación (E-01 a E-429)

A continuación se detallan los **423 escenarios únicos de prueba** extraídos rigurosamente de las tablas de escenarios de validación de los Anexos CUS01 a CUS14.

| ID | CUS | Entrada / Acción | Resultado Esperado | Reglas Vinculadas | HU |
|---|---|---|---|---|---|
| **E-01** | CUS01 | Usuario y contraseña vacíos | MSG-01 y MSG-02 junto a cada campo; no se envía; foco en Usuario. | RV-01, 02, 05, 07 | HU01 |
| **E-02** | CUS01 | Usuario con formato incorrecto (ej. "a b") | MSG-03 bajo Usuario; no se envía. | RV-03, 07 | HU01 |
| **E-03** | CUS01 | Usuario válido y contraseña vacía | MSG-02 bajo Contraseña; foco en Contraseña. | RV-02, 07 | HU01 |
| **E-04** | CUS01 | Credenciales incorrectas | MSG-04 sin indicar cuál dato falló; usuario conservado; contraseña limpia. | RV-06, 10 | HU01 |
| **E-05** | CUS01 | Credenciales correctas | MSG-08 y redirección a /inicio con menú del rol. | RN-05 | HU01 |
| **E-06** | CUS01 | Activa Mostrar/Ocultar | La contraseña se revela y se oculta; el valor no cambia. | RV-09 | HU01 |
| **E-07** | CUS01 | Envía mientras se procesa | Botón deshabilitado con MSG-07; un solo envío. | RV-08 | HU01 |
| **E-08** | CUS01 | Solo teclado | Tab recorre Usuario → Contraseña → Mostrar → INGRESAR → enlace; Enter envía; el foco es visible. | RNF-04 | HU01 |
| **E-09** | CUS01 | Usuario desactivado | MSG-05. | RN-01 | HU01 |
| **E-10** | CUS01 | Cinco intentos fallidos | MSG-06; acceso bloqueado 15 minutos. | RN-03 | HU01 |
| **E-100** | CUS04 | Doble clic en GUARDAR MENÚ DEL DÍA | Se guarda una sola vez; el botón muestra "Guardando menú…" deshabilitado. | RV-52 | HU13 |
| **E-101** | CUS04 | Entrar con un menú ya definido y modificarlo | Se muestran marcados los productos guardados; al guardar se reemplaza el menú de la fecha. | RN-36 | HU13 |
| **E-102** | CUS04 | Pulsar DESCARTAR CAMBIOS | Se pide confirmación (MSG-73); al confirmar se restablece el menú guardado; al cancelar se conservan los cambios. | RV-51 | HU13 |
| **E-103** | CUS04 | Entrar sin productos activos | MSG-69; no se permite definir el menú. | RV-45 | HU13 |
| **E-104** | CUS04 | Desactivar en CUS03 un producto que está en el menú de hoy | El producto se retira del menú vigente (E-69 del CUS03) y deja de mostrarse en el menú del día. | RN-39 | HU12, HU13 |
| **E-105** | CUS04 | Marcar un plato como agotado | Confirmación MSG-75 y luego MSG-77; el plato sigue en el menú con estado Agotado. | RV-53, RN-41 | HU14 |
| **E-106** | CUS04 | Marcar como disponible un plato agotado | Confirmación MSG-76 y luego MSG-78; el plato vuelve a ofrecerse. | RV-53, RN-41 | HU14 |
| **E-107** | CUS04 | El cocinero marca un plato como agotado | Se permite; mismo resultado que E-105. | RN-43 | HU14 |
| **E-108** | CUS04 | Mozo o cajero arma un pedido con un plato agotado | El plato se muestra "AGOTADO" y no se puede seleccionar (CUS06 y CUS07). | RV-54, RN-42 | HU14, HU18, HU20 |
| **E-109** | CUS04 | El cocinero agota un plato mientras el mozo arma el pedido | Al pulsar REGISTRAR PEDIDO el sistema revalida la disponibilidad y advierte que el plato acaba de agotarse (CUS06.1). | RV-54 | HU14, HU18 |
| **E-11** | CUS01 | Usuario con espacios al inicio/fin | Se recortan y el ingreso continúa normalmente. | RV-04 | HU01 |
| **E-110** | CUS04 | Un plato se agota después de haber sido pedido | Los pedidos ya registrados no se modifican. | RN-42 | HU14 |
| **E-111** | CUS04 | Entrar sin menú definido | No aparece la pestaña Disponibilidad en Servicio; un cambio de disponibilidad solicitado por API responde MSG-79. | RN-41 | HU14 |
| **E-112** | CUS04 | Falla del servidor al guardar el menú | MSG-74; se conserva la selección en pantalla y el menú anterior. | RNF-12 | HU13 |
| **E-113** | CUS04 | Falla del servidor al cambiar la disponibilidad | MSG-80; se conserva el estado anterior. | — | HU14 |
| **E-114** | CUS04 | Pantalla de ancho reducido | La barra de pestañas se desplaza horizontalmente sin romper el diseño y la barra inferior sigue visible. | RNF-15 | HU13 |
| **E-115** | CUS04 | Uso solo con teclado | Se puede recorrer las pestañas, las opciones y los botones con Tab; el foco es visible. | RNF-17 | HU13, HU14 |
| **E-116** | CUS04 | Usuario sin rol autorizado intenta guardar el menú | MSG-39 (403). | RN-44 | HU13 |
| **E-117** | CUS05 | Entrar a MESAS con mesas registradas | Tarjetas en orden natural con nombre, estado, resumen y hora de actualización. | RN-144, RV-58 | HU16 |
| **E-118** | CUS05 | Registrar "Mesa 1" | MSG-84; mesa Activa y Libre en la cuadrícula. | RN-146 | HU15 |
| **E-119** | CUS05 | Registrar con el campo vacío | MSG-81; no se guarda. | RV-168 | HU15 |
| **E-12** | CUS01 | Servidor no disponible | MSG-09; el usuario escrito se conserva. | RV-06 | HU01 |
| **E-120** | CUS05 | Registrar un nombre repetido ("mesa 1" o " Mesa  1 ") | MSG-83; el formulario sigue abierto. | RV-169, RV-170, RN-145 | HU15 |
| **E-121** | CUS05 | Registrar un nombre de más de 20 caracteres | MSG-82. | RV-168 | HU15 |
| **E-122** | CUS05 | Filtrar por Libres u Ocupadas | Se muestran solo esas; si no hay, MSG-93. | RV-59 | HU16 |
| **E-123** | CUS05 | Entrar sin mesas registradas | MSG-91 con NUEVA MESA para el Administrador; MSG-92 para mozo y cajero. | — | HU16 |
| **E-124** | CUS05 | El mozo selecciona una mesa libre | Se ofrece REGISTRAR PEDIDO (CUS06.1). | RN-144 | HU16 |
| **E-125** | CUS05 | El mozo registra el pedido | La mesa pasa a Ocupada y los demás usuarios la ven así en 15 segundos o menos. | RN-147, RNF-18 | HU16 |
| **E-126** | CUS05 | El mozo selecciona una mesa ocupada | Se ofrece REGISTRAR PEDIDO NUEVO (CUS06.1) o AGREGAR PRODUCTOS (CUS06.2). | RN-46 | HU16 |
| **E-127** | CUS05 | El cajero selecciona una mesa ocupada y cobra | Se ofrece COBRAR (CUS10.1); al pagarse, la mesa pasa a Libre. | RN-147 | HU16 |
| **E-128** | CUS05 | Se anula el único pedido abierto de una mesa | La mesa vuelve a Libre. | RN-147 | HU16 |
| **E-129** | CUS05 | Dos mozos abren un pedido en la misma mesa a la vez | Ambos pedidos se registran por separado y la mesa queda Ocupada con dos pedidos. | RN-46 | HU16 |
| **E-13** | CUS01 | Recuperar contraseña con código válido | Contraseña actualizada y MSG-16 en el login. | RN-02, 04 | HU07 |
| **E-130** | CUS05 | Editar el nombre de una mesa | MSG-85; si el nombre ya existe, MSG-83. | RV-169 | HU17 |
| **E-131** | CUS05 | Desactivar una mesa libre | Confirmación MSG-86, luego MSG-89; ya no aparece para mozo y cajero ni en pedidos. | RN-45 | HU17 |
| **E-132** | CUS05 | Desactivar una mesa ocupada | MSG-88; no cambia. | RV-56, RN-148 | HU17 |
| **E-133** | CUS05 | Activar una mesa inactiva | Confirmación MSG-87, luego MSG-90; vuelve a mostrarse. | RN-45 | HU17 |
| **E-134** | CUS05 | Cancelar un formulario o confirmación (botón o Esc) | No hay cambios y el foco vuelve al botón de origen. | RV-57 | HU15, HU17 |
| **E-135** | CUS05 | Un mozo o cajero intenta registrar o editar mesas por URL o servicio; el cocinero entra a MESAS | 403 y MSG-39; el cocinero no ve la opción. | RN-143, RN-144 | HU15 a HU17 |
| **E-136** | CUS06 | Falla del servidor al cargar o guardar | MSG-94 o MSG-38; se conservan los datos escritos. | RNF-20 | HU15 a HU17 |
| **E-137** | CUS06 | Solo teclado | Tab recorre filtro, tarjetas y diálogos; Enter confirma; Esc cancela. | RNF-19 | HU15 a HU17 |
| **E-138** | CUS06 | Doble clic en GUARDAR | Se crea una sola mesa. | RV-172 | HU15 |
| **E-139** | CUS06 | Otro usuario cambia el estado de una mesa con la pantalla abierta | La tarjeta se actualiza sola en 15 segundos o menos y se muestra "Actualizado hace…". | RNF-18 | HU16 |
| **E-14** | CUS01 | Código vencido o incorrecto | MSG-13; permite solicitar otro. | RN-04 | HU07 |
| **E-140** | CUS06 | El mozo elige una mesa libre, agrega 2 almuerzos y 1 desayuno y registra | Total correcto; MSG-100; pedido "pendiente" con número; la mesa pasa a Ocupada y cocina recibe la comanda. | RN-49, RN-50 | HU18 |
| **E-141** | CUS06 | Agregar la observación "presa de pescado" | La observación aparece en la línea y en la comanda. | RV-64 | HU18 |
| **E-142** | CUS06 | Intentar registrar sin productos | Botón deshabilitado y MSG-97. | RV-61 | HU18 |
| **E-143** | CUS06 | Cantidad 0, 21, 1.5 o texto | MSG-98; no se registra. | RV-62 | HU18 |
| **E-144** | CUS06 | Observación de más de 100 caracteres | MSG-99. | RV-64 | HU18 |
| **E-145** | CUS06 | Un plato aparece agotado en el catálogo | Se muestra como "Agotado" y no se puede seleccionar. | RV-63 | HU18 |
| **E-146** | CUS06 | Un plato se agota mientras el mozo arma el pedido | La línea se marca; al registrar, el servidor rechaza con MSG-225 y MSG-103; el mozo la quita y registra. | RV-65, RN-54 | HU18 |
| **E-147** | CUS06 | Otro mozo ocupó la mesa mientras se armaba el pedido | Se registra como pedido separado de la misma mesa; el pedido en armado no se pierde. | RN-54 | HU18 |
| **E-148** | CUS06 | Registrar sin mesa seleccionada | MSG-96. | RV-60 | HU18 |
| **E-149** | CUS06 | No hay mesas activas | MSG-108 en el selector. | RV-60 | HU18 |
| **E-15** | CUS01 | Correo no registrado | MSG-11 (misma respuesta); no se envía código. | RV-10, RN-02 | HU07 |
| **E-150** | CUS06 | No hay menú del día definido | El catálogo muestra todos los productos activos. | RN-35 | HU18 |
| **E-151** | CUS06 | No hay productos disponibles | MSG-107. | — | HU18 |
| **E-152** | CUS06 | Doble toque en REGISTRAR PEDIDO | Se crea un solo pedido. | RV-67, RNF-22 | HU18 |
| **E-153** | CUS06 | Se pierde la conexión al registrar | MSG-105; el pedido sigue en pantalla; al reintentar no se duplica. | RNF-22 | HU18 |
| **E-154** | CUS06 | Falla el envío de la comanda | No se guarda nada y la mesa sigue libre. | RN-50 | HU18 |
| **E-155** | CUS06 | Cancelar con productos en el pedido | MSG-102; al confirmar se descarta. | RV-68 | HU18 |
| **E-156** | CUS06 | Cambiar la cantidad o quitar una línea antes de registrar | El total se recalcula. | RV-66, RV-71 | HU18 |
| **E-157** | CUS06 | La administradora cambia un precio después de registrado el pedido | El pedido conserva el precio con que se registró. | RN-51, RN-26 | HU18 |
| **E-158** | CUS06 | Agregar productos a un pedido pendiente | MSG-101; comanda adicional solo con los productos nuevos; total recalculado. | RN-52 | HU19 |
| **E-159** | CUS06 | Agregar productos a un pedido "listo" | El pedido vuelve a "pendiente". | RN-53 | HU19 |
| **E-16** | CUS02 | Entrar al módulo con usuarios registrados | Lista alfabética, 10 por página, con Nombre, Usuario, Rol, Estado y Acciones. | RN-07, RNF-05 | HU03 |
| **E-160** | CUS06 | Agregar productos a un pedido pagado o anulado | MSG-104; no se modifica. | RV-69 | HU19 |
| **E-161** | CUS06 | Agregar sin elegir productos | MSG-97. | RV-61 | HU19 |
| **E-162** | CUS06 | Cancelar la ampliación con productos elegidos | MSG-102; el pedido queda igual. | RV-68 | HU19 |
| **E-163** | CUS06 | Un cajero, el administrador o el cocinero intenta registrar por URL o servicio | 403 y MSG-39; la opción no aparece en su menú. | RN-48 | HU18, HU19 |
| **E-164** | CUS06 | Dos mozos agregan productos al mismo pedido casi a la vez | Se guardan ambas ampliaciones y el total suma las dos. | RN-52 | HU19 |
| **E-165** | CUS06 | Solo teclado (computadora) | Tab recorre mesa, productos, cantidades, notas y botones; Enter confirma; Esc cancela. | RNF-21 | HU18, HU19 |
| **E-166** | CUS07 | El cajero agrega 2 almuerzos con la nota "sin ensalada" y registra | Total correcto; MSG-110; pedido "pendiente" de tipo "Para llevar" con número; cocina recibe la comanda marcada "para llevar"; ninguna mesa cambia. | RN-58, RN-59, RN-60 | HU20 |
| **E-167** | CUS07 | Escribir la referencia "Sra. Rosa" | La referencia aparece en la comanda y en la lista de pedidos. | RV-73 | HU20 |
| **E-168** | CUS07 | Registrar sin referencia | El pedido se identifica por su número. | RN-58 | HU20 |
| **E-169** | CUS07 | Referencia de más de 30 caracteres | MSG-109. | RV-73 | HU20 |
| **E-17** | CUS02 | Buscar por un nombre existente | Se muestran solo las coincidencias, sin distinguir mayúsculas ni tildes. | RV-22 | HU03 |
| **E-170** | CUS07 | Intentar registrar sin productos | Botón deshabilitado y MSG-97. | RV-61 | HU20 |
| **E-171** | CUS07 | Cantidad 0, 21, 1.5 o texto | MSG-98; no se registra. | RV-62 | HU20 |
| **E-172** | CUS07 | Observación de más de 100 caracteres | MSG-99. | RV-64 | HU20 |
| **E-173** | CUS07 | Un plato aparece agotado en el catálogo | Se muestra como "Agotado" y no se puede seleccionar. | RV-63 | HU20 |
| **E-174** | CUS07 | Un plato se agota mientras se arma el pedido | El servidor rechaza al registrar; MSG-225 y MSG-103 marcan las líneas; el cajero las quita y registra. | RV-65, RN-54 | HU20 |
| **E-175** | CUS07 | No hay menú del día definido | El catálogo muestra todos los productos activos. | RN-35 | HU20 |
| **E-176** | CUS07 | No hay productos disponibles | MSG-107. | — | HU20 |
| **E-177** | CUS07 | Doble clic en REGISTRAR PEDIDO | Se crea un solo pedido. | RV-67, RNF-22 | HU20 |
| **E-178** | CUS07 | Se pierde la conexión al registrar | MSG-111; el pedido sigue en pantalla; al reintentar no se duplica. | RNF-22 | HU20 |
| **E-179** | CUS07 | Falla el envío de la comanda | No se crea el pedido. | RN-60 | HU20 |
| **E-18** | CUS02 | Buscar algo que no existe | MSG-36 y "Quitar filtros". | RV-22 | HU03 |
| **E-180** | CUS07 | Cancelar con productos en el pedido | MSG-102; al confirmar se descarta. | RV-68 | HU20 |
| **E-181** | CUS07 | Pulsar COBRAR AHORA en la confirmación | Se abre el cobro de ese pedido (CUS10.1). | RV-74 | HU20 |
| **E-182** | CUS07 | Pulsar NUEVO PEDIDO en la confirmación | Pantalla limpia lista para el siguiente cliente. | RV-74 | HU20 |
| **E-183** | CUS07 | Un mozo, el cocinero o el administrador intenta registrar por URL o servicio | 403 y MSG-39; la opción no aparece en su menú. | RN-57 | HU20 |
| **E-184** | CUS07 | Cambiar la cantidad o quitar una línea antes de registrar | El total se recalcula. | RV-66, RV-71 | HU20 |
| **E-185** | CUS07 | Revisar la lista de pedidos y la pantalla de cocina | El pedido aparece como "Para llevar", sin mesa. | RN-58, RN-59 | HU20 |
| **E-186** | CUS07 | Cambiar el precio de un producto después de registrar | El pedido conserva el precio con que se registró. | RN-51 | HU20 |
| **E-187** | CUS07 | Solo teclado (computadora) | Tab recorre referencia, productos, cantidades, notas y botones; Enter confirma; Esc cancela. | RNF-25 | HU20 |
| **E-188** | CUS08 | Entrar a PEDIDOS | Lista del día, más recientes primero, con contadores por estado y "Actualizado hace…". | RN-63, RNF-28 | HU22 |
| **E-189** | CUS08 | Tocar el contador "Listo" | La lista muestra solo los pedidos listos. | RV-81 | HU22 |
| **E-19** | CUS02 | Filtrar por rol y estado a la vez | La lista muestra solo los usuarios que cumplen ambos. | — | HU03 |
| **E-190** | CUS08 | Filtrar por tipo y por mesa | Se muestran solo los pedidos que cumplen ambos criterios. | RV-81 | HU22 |
| **E-191** | CUS08 | Entrar sin pedidos hoy; luego filtrar sin coincidencias | MSG-113; con filtro, MSG-112 y "Quitar filtros". | RV-81 | HU22 |
| **E-192** | CUS08 | Un mozo abre la lista | Sus pedidos aparecen con "Mío" y puede filtrar "Solo mis pedidos". | RN-63 | HU22 |
| **E-193** | CUS08 | El administrador elige una fecha anterior; un mozo lo intenta por servicio | El administrador ve esa fecha; el mozo recibe 403. | RN-63 | HU22 |
| **E-194** | CUS08 | Abrir el detalle de un pedido | Muestra líneas, observaciones, total, estado de cada comanda, registrado por y, si es anulado, su motivo. | RN-66 | HU22 |
| **E-195** | CUS08 | Un pedido con una comanda en preparación | Estado "En preparación". | RN-64 | HU22 |
| **E-196** | CUS08 | Se agregan productos a un pedido listo (CUS06.2) | El pedido pasa a "Pendiente" hasta que cocina marque la comanda adicional. | RN-64 | HU22 |
| **E-197** | CUS08 | Falla del servidor al cargar | MSG-114 con Reintentar; se conservan los datos previos. | RNF-30 | HU22 |
| **E-198** | CUS08 | Cocina cambia un estado con la lista abierta | La lista se actualiza sola en 15 segundos o menos. | RNF-28 | HU22 |
| **E-199** | CUS08 | El mozo modifica su pedido pendiente (cantidad y observación) | MSG-119; total recalculado; cocina ve la comanda "Modificada". | RN-68, RN-69 | HU21 |
| **E-20** | CUS02 | Registrar con datos válidos | MSG-25; usuario Activo en la lista y resaltado. | RN-09, RN-14 | HU02 |
| **E-200** | CUS08 | Quitar todos los productos al modificar | MSG-121; debe anular el pedido. | RV-78 | HU21 |
| **E-201** | CUS08 | Agregar un plato agotado al modificar | MSG-225. | RV-78 | HU21 |
| **E-202** | CUS08 | Intentar modificar un pedido en preparación | Botones deshabilitados con el motivo; si se fuerza, 409 y MSG-115. | RV-75, RN-65 | HU21 |
| **E-203** | CUS08 | Cocina inicia mientras el usuario edita | Al guardar, MSG-115 y el pedido original intacto. | RV-80 | HU21 |
| **E-204** | CUS08 | Un mozo intenta modificar el pedido de otro mozo | Botones deshabilitados; si se fuerza, 403 y MSG-116. | RN-65 | HU21 |
| **E-205** | CUS08 | Anular con motivo y confirmar | MSG-118, luego MSG-120; el pedido queda "Anulado" con su motivo, cocina deja de verlo y no suma a los totales. | RN-66, RN-68 | HU21 |
| **E-206** | CUS08 | Anular sin motivo o con menos de 5 caracteres | MSG-117; no se anula. | RV-76 | HU21 |
| **E-207** | CUS08 | Anular el único pedido abierto de una mesa | La mesa vuelve a Libre. | RN-67 | HU21 |
| **E-208** | CUS08 | Anular o modificar un pedido pagado | MSG-104; no cambia. | RN-70 | HU21 |
| **E-209** | CUS08 | Cancelar la modificación con cambios sin guardar | MSG-102; el pedido queda como estaba. | RV-84 | HU21 |
| **E-21** | CUS02 | Registrar con campos vacíos | Mensaje junto a cada campo; no se guarda; foco en el primero. | RV-11 a 18 | HU02 |
| **E-210** | CUS08 | El cajero modifica un pedido para llevar propio y luego intenta con uno de mesa | Puede con el propio; con el de mesa, MSG-116. | RN-65 | HU21 |
| **E-211** | CUS08 | El administrador anula un pedido que ya está en preparación o listo (el cliente se fue sin pagar) | Puede anularlo con motivo: cocina deja de verlo y, si era el único pedido abierto de la mesa, la mesa queda Libre. No puede modificar pedidos de otros (403 y MSG-116). | RN-65 | HU21 |
| **E-212** | CUS08 | Cocina marca lista la comanda de un pedido de mesa | En 15 segundos o menos quien lo registró ve el aviso con número y mesa; permanece hasta cerrarlo. | RN-71, RV-83 | HU22 |
| **E-213** | CUS08 | Cocina marca lista la comanda de un pedido para llevar | El cajero recibe el aviso con "Para llevar" y la referencia. | RN-71 | HU22 |
| **E-214** | CUS08 | El mozo responsable no tiene sesión | Cualquier mozo con sesión recibe el aviso; al cerrarlo uno, desaparece para todos. | RN-71 | HU22 |
| **E-215** | CUS08 | Cerrar el aviso | Queda como visto, baja el contador del menú y se quita el resaltado de "Listo". | RN-72 | HU22 |
| **E-216** | CUS08 | El usuario está en otra pantalla | El aviso aparece sobre esa pantalla y el contador del menú aumenta. | RNF-31 | HU22 |
| **E-217** | CUS08 | Falla al generar el aviso | El estado "Listo" igual se actualiza en la lista. | RNF-30 | HU22 |
| **E-218** | CUS08 | Doble clic en ANULAR PEDIDO | Se registra una sola anulación. | RV-79 | HU21 |
| **E-219** | CUS08 | Solo teclado | Tab recorre filtros, filas, acciones, diálogos y el aviso; Enter confirma; Esc cancela. | RNF-29 | HU21, HU22, HU22 |
| **E-22** | CUS02 | Registrar con un usuario ya existente | MSG-21 y el formulario sigue abierto. | RV-12, RN-08 | HU02 |
| **E-220** | CUS09 | El mozo registra un pedido de mesa | En 5 segundos o menos aparece en "Pendientes" la comanda con número, mesa, líneas y observaciones, con la etiqueta NUEVA. | RN-74, RNF-32 | HU18 |
| **E-221** | CUS09 | El cajero registra un pedido para llevar | La comanda muestra "Para llevar" y la referencia. | RN-75 | HU20 |
| **E-222** | CUS09 | El mozo agrega productos a un pedido | Aparece otra comanda "ADICIONAL 1" con solo los productos nuevos y el mismo número de pedido. | RN-75 | HU19 |
| **E-223** | CUS09 | Falla la generación de la comanda | No se registra el pedido ni se ocupa la mesa; MSG-105 o MSG-111. | RN-74, RNF-35 | HU18, HU19 y HU20 |
| **E-224** | CUS09 | El cocinero entra a COMANDAS | Pendientes y en preparación, la más antigua primero. | RV-85 | HU23 |
| **E-225** | CUS09 | No hay comandas | MSG-124. | — | HU23 |
| **E-226** | CUS09 | Revisar la banda "Por preparar" | Suma por producto las comandas pendientes y en preparación y baja al marcar listas. | RV-86 | HU23 |
| **E-227** | CUS09 | Una comanda lleva 15 minutos o más esperando | Muestra el texto "Demora" y tono de alerta. | RV-91 | HU23 |
| **E-228** | CUS09 | Llega una comanda con el sonido activado y desactivado | Se resalta como NUEVA; suena solo si el sonido está activado. | RV-92 | HU23 |
| **E-229** | CUS09 | La pantalla se actualiza mientras el cocinero toca una tarjeta | La tarjeta no cambia de lugar ni se reinicia el desplazamiento. | RV-94 | HU23 |
| **E-23** | CUS02 | Contraseña corta o confirmación distinta | MSG-14 o MSG-15. | RV-13, 14 | HU02 |
| **E-230** | CUS09 | Pulsar INICIAR PREPARACIÓN | La comanda pasa a "En preparación"; el pedido, a "En preparación"; MSG-126; el pedido ya no se puede modificar. | RN-76, RN-78 | HU24 |
| **E-231** | CUS09 | Pulsar MARCAR COMO LISTA | La comanda sale de la pantalla; el pedido queda "Listo" si todas están listas; el responsable recibe el aviso; MSG-127. | RN-76, RN-79 | HU24 |
| **E-232** | CUS09 | Pulsar DESHACER dentro de 10 segundos | La comanda vuelve al estado anterior y el aviso se retira si no fue visto. | RV-88, RN-79 | HU24 |
| **E-233** | CUS09 | Pulsar DESHACER después de 10 segundos o con el pedido pagado | No se deshace; MSG-134. | RN-79 | HU24 |
| **E-234** | CUS09 | Intentar marcar lista una comanda pendiente (por servicio) | 409 y MSG-130; no hay botón para hacerlo en pantalla. | RV-87 | HU24 |
| **E-235** | CUS09 | Se anula el pedido con su comanda en pantalla | La tarjeta se retira con MSG-128. | RV-90, RN-80 | HU23 |
| **E-236** | CUS09 | Se modifica el pedido con su comanda pendiente | La tarjeta muestra MODIFICADA con los cambios y MSG-129. | RN-80 | HU23 |
| **E-237** | CUS09 | Doble toque en INICIAR PREPARACIÓN | Se registra un solo cambio. | RV-89, RNF-34 | HU24 |
| **E-238** | CUS09 | Falla al cambiar el estado | MSG-131; se conserva el estado anterior. | RNF-34 | HU24 |
| **E-239** | CUS09 | Se pierde la conexión | Franja MSG-132 con las comandas visibles; al volver se actualiza sola. | RNF-32 | HU23 |
| **E-24** | CUS02 | Rol Administrador sin correo | MSG-23. | RV-16 | HU02 |
| **E-240** | CUS09 | La pantalla queda abierta dos horas sin tocarse | La sesión no vence y las comandas siguen llegando. | RN-82 | HU23 |
| **E-241** | CUS09 | Un mozo, cajero o administrador entra a COMANDAS por URL o servicio | 403 y MSG-39; la opción no aparece en su menú. | RN-77, RNF-34 | HU23 |
| **E-242** | CUS09 | Pulsar PLATOS AGOTADOS | Se abre la disponibilidad de platos (CUS04.2). | RN-83 | HU23 |
| **E-243** | CUS09 | Un pedido con la comanda original lista y la adicional pendiente | El pedido figura "Pendiente"; el aviso llega cuando la adicional esté lista. | RN-64, RN-79 | HU24 |
| **E-244** | CUS09 | Solo teclado o tablet | Tab recorre las tarjetas y botones; Enter activa; botones de al menos 56 px. | RNF-33, RV-93 | HU23, HU24 |
| **E-245** | CUS10 | El cajero entra a COBRAR | Lista de pedidos por cobrar (mesa y para llevar) con total y estado. | RN-85 | HU25 |
| **E-246** | CUS10 | No hay pedidos por cobrar | MSG-136. | — | HU25 |
| **E-247** | CUS10 | Cobrar desde una mesa ocupada, desde COBRAR AHORA o desde la lista de pedidos | Se abre el cobro de ese pedido en el paso 1. | RN-84 | HU25 |
| **E-248** | CUS10 | Pedido de 2 almuerzos completos (S/ 8.00) y 1 desayuno completo (S/ 7.00) | El detalle muestra las líneas y el total S/ 23.00 calculado por el servidor. | RV-96, RN-87 | HU25 |
| **E-249** | CUS10 | La caja del día está cerrada | MSG-135 con ABRIR CAJA; no se puede cobrar. | RV-95, RN-84 | HU25 |
| **E-25** | CUS02 | Editar nombre o rol con contraseña vacía | MSG-26; la contraseña no cambia. | RV-13 | HU04 |
| **E-250** | CUS10 | Cobrar un pedido ya pagado o anulado | MSG-137. | RV-95, RN-85 | HU25 |
| **E-251** | CUS10 | Cobrar un pedido que aún no está listo | MSG-138; al confirmar continúa, al cancelar vuelve a la lista. | RV-97 | HU25 |
| **E-252** | CUS10 | El mozo agrega productos mientras el cajero cobra | Al confirmar el pago, MSG-139 con el total nuevo y no se registra el cobro. | RV-101, RN-90 | HU25 |
| **E-253** | CUS10 | Confirmar sin elegir método de pago | MSG-140. | RV-98 | HU25 |
| **E-254** | CUS10 | Efectivo con el botón "Exacto" | Monto igual al total y vuelto S/ 0.00. | RV-99, RV-104 | HU25 |
| **E-255** | CUS10 | Efectivo: S/ 50 recibidos con total S/ 23.00 | Vuelto S/ 27.00 mostrado en grande antes de confirmar. | RV-99, RNF-37 | HU25 |
| **E-256** | CUS10 | Efectivo con monto menor al total | MSG-143; no se confirma. | RV-99 | HU25 |
| **E-257** | CUS10 | Monto vacío, "abc", 3 decimales o mayor a 9,999.99 | MSG-141, MSG-142 o MSG-152. | RV-99 | HU25 |
| **E-258** | CUS10 | Monto escrito con coma ("23,50") | Se normaliza a 23.50. | RV-99 | HU25 |
| **E-259** | CUS10 | Yape sin marcar la confirmación; luego con confirmación y referencia | MSG-144; con confirmación, se registra el pago. | RV-100 | HU25 |
| **E-26** | CUS02 | Editar con nueva contraseña | MSG-26; el usuario ingresa con la nueva y no con la anterior. | RN-13, RN-14 | HU04 |
| **E-260** | CUS10 | Referencia de Yape de más de 20 caracteres | MSG-151. | RV-100 | HU25 |
| **E-261** | CUS10 | Confirmar el pago | MSG-146; pedido "Pagado"; venta con número; mesa libre si era de mesa; se muestra el comprobante. | RN-88, RN-89 | HU25 |
| **E-262** | CUS10 | Confirmar el pago de un pedido para llevar | Se registra la venta; ninguna mesa cambia. | RN-89 | HU25 |
| **E-263** | CUS10 | Doble clic en CONFIRMAR PAGO | Se registra una sola venta. | RV-102, RNF-40 | HU25 |
| **E-264** | CUS10 | Falla al registrar el cobro | MSG-147; el pedido sigue pendiente de cobro y no se registra nada. | RN-88 | HU25 |
| **E-265** | CUS10 | Se pierde la conexión al confirmar | MSG-147; lo ingresado se conserva; al reintentar no se duplica. | RNF-40 | HU25 |
| **E-266** | CUS10 | Revisar la vista previa del comprobante | Muestra número T001 correlativo, fecha y hora, pedido, mesa o "Para llevar", cajero, líneas, total, método, recibido y vuelto, y "Documento sin validez tributaria". | RV-105, RN-91, RN-92 | HU26 |
| **E-267** | CUS10 | Pulsar IMPRIMIR con y sin impresora | Abre la impresión con formato de 80 mm; sin impresora, MSG-149 y se ofrece DESCARGAR. | RNF-38 | HU26 |
| **E-268** | CUS10 | Pulsar DESCARGAR | Se descarga un PDF idéntico a la vista previa. | RNF-38 | HU26 |
| **E-269** | CUS10 | Cerrar la vista previa sin imprimir | El comprobante queda guardado y se puede reimprimir con "COPIA" desde ventas. | RN-91 | HU26 |
| **E-27** | CUS02 | Editar a un usuario o correo ya existente | MSG-21 o MSG-24. | RV-12, 16 | HU04 |
| **E-270** | CUS10 | Falla al generar la vista del comprobante | MSG-148; la venta y su número se conservan. | RN-88 | HU26 |
| **E-271** | CUS10 | Emitir dos comprobantes seguidos | Los números son consecutivos, sin saltos ni duplicados. | RN-91 | HU26 |
| **E-272** | CUS10 | Cancelar el cobro con datos ingresados | MSG-150; el pedido sigue pendiente de cobro. | RV-106 | HU25 |
| **E-273** | CUS10 | Volver del paso 2 al paso 1 | Se conserva lo ingresado y el total sigue visible. | RV-103 | HU25 |
| **E-274** | CUS10 | Un mozo, el cocinero o el administrador intenta cobrar por URL o servicio | 403 y MSG-39; la opción no aparece en su menú. | RN-84 | HU25 |
| **E-275** | CUS10 | Intentar modificar o anular un pedido ya pagado (CUS08.2) | No se permite; la corrección se hace anulando la venta. | RN-93 | HU25 |
| **E-276** | CUS10 | La mesa tiene otro pedido pendiente de cobro | Se paga uno y la mesa sigue Ocupada. | RN-89 | HU25 |
| **E-277** | CUS10 | Solo teclado | Tab recorre botones y campos; los números se escriben con el teclado; Enter confirma; Esc cancela. | RNF-39 | HU25 y HU26 |
| **E-278** | CUS10 | La administradora cambia un precio después de registrado el pedido | El total del pedido no cambia. | RN-87, RN-51 | HU25 |
| **E-279** | CUS10 | Entrar a VENTAS | Ventas de hoy, las más recientes primero, con comprobante, fecha y hora, total, método y estado, y el resumen. | RV-107 | HU28 |
| **E-28** | CUS02 | Desactivar a un usuario | Confirmación MSG-27, luego MSG-29; el usuario ve MSG-05 al ingresar y pierde el acceso de inmediato. | RN-12 | HU05 |
| **E-280** | CUS10 | No hay ventas hoy | MSG-154. | RV-107 | HU28 |
| **E-281** | CUS10 | Buscar "123" y luego "T001-000123" | Ambas búsquedas encuentran la misma venta. | RV-108 | HU28 |
| **E-282** | CUS10 | Buscar un número que no existe | MSG-153 y "Quitar filtros". | RV-108 | HU28 |
| **E-283** | CUS10 | Buscar con un formato inválido (por ejemplo, "ab#") | MSG-156; la lista no cambia. | RV-108 | HU28 |
| **E-284** | CUS10 | Filtrar por una fecha y por un rango | La lista y el resumen muestran solo ese período. | RV-109, RV-118 | HU28 |
| **E-285** | CUS10 | Rango invertido; rango futuro o de más de 31 días | MSG-157 o MSG-158. | RV-109 | HU28 |
| **E-286** | CUS10 | El Cajero consulta hace 10 días; el Administrador lo hace igual | El Cajero recibe MSG-159 (403 si fuerza el servicio); el Administrador ve esa fecha. | RN-97 | HU28 |
| **E-287** | CUS11 | Revisar el resumen con ventas anuladas | Suma solo las vigentes (total, efectivo y Yape) y cuenta las anuladas aparte. | RV-110, RN-100 | HU28 |
| **E-288** | CUS11 | Abrir el detalle de una venta anulada | Muestra todos los datos, el motivo, quién la anuló, cuándo y el destino del pedido. | RN-99 | HU28 |
| **E-289** | CUS11 | El Cajero abre un detalle | Ve REIMPRIMIR y DESCARGAR, pero no ANULAR VENTA; por servicio, 403 y MSG-39. | RV-112, RN-96 | HU28 |
| **E-29** | CUS02 | Activar a un usuario inactivo | Confirmación MSG-28, luego MSG-30; puede ingresar. | RN-12 | HU05 |
| **E-290** | CUS11 | Reimprimir una venta vigente | El ticket sale con el mismo número y la marca "COPIA"; la reimpresión queda registrada. | RV-117, RN-104 | HU28 |
| **E-291** | CUS11 | Reimprimir una venta anulada | El ticket sale con la marca "ANULADO". | RV-117 | HU28 |
| **E-292** | CUS11 | Reimprimir sin impresora | MSG-149 y se ofrece DESCARGAR. | RV-117 | HU28 |
| **E-293** | CUS11 | Regenerar un comprobante que falló al emitirse | Se genera desde el detalle; la venta y su número no cambian. | RN-91, CUS10.2 | HU28 |
| **E-294** | CUS11 | Anular una venta vigente con motivo y "Dejar el pedido por cobrar" | MSG-161 y luego MSG-162; la venta queda "Anulada", ya no suma y el pedido aparece de nuevo en COBRAR. | RN-98 a RN-102 | HU27 |
| **E-295** | CUS11 | Anular con "Anular también el pedido" | El pedido queda "Anulado" y, si era el único de su mesa, la mesa queda libre. | RN-102 | HU27 |
| **E-296** | CUS11 | Anular sin motivo o con menos de 5 caracteres | MSG-160; no se anula. | RV-113 | HU27 |
| **E-297** | CUS11 | Anular una venta que ya está anulada | MSG-163. | RN-98 | HU27 |
| **E-298** | CUS11 | Anular una venta de una caja ya cerrada | El diálogo muestra MSG-165; el cierre original no cambia y el ajuste queda registrado. | RN-101 | HU27 |
| **E-299** | CUS11 | Anular una venta con la caja del día abierta | La venta deja de sumar en el cuadre de la caja. | RN-100 | HU27 |
| **E-30** | CUS02 | Desactivar su propia cuenta | MSG-31; no se modifica. | RV-21, RN-10 | HU05 |
| **E-300** | CUS11 | Cobrar de nuevo el pedido devuelto | Se crea otra venta con un comprobante nuevo; el anulado conserva su número. | RN-100, RN-102 | HU27 |
| **E-301** | CUS11 | El pedido devuelto tiene su mesa con otro pedido | La mesa sigue ocupada hasta resolver ambos. | RN-103 | HU27 |
| **E-302** | CUS11 | Falla al anular | MSG-164; la venta sigue vigente y el pedido no cambia. | RN-98 | HU27 |
| **E-303** | CUS11 | Doble clic en ANULAR VENTA | Se registra una sola anulación. | RV-116, RNF-43 | HU27 |
| **E-304** | CUS11 | Cancelar la anulación (botón o Esc) | La venta sigue vigente. | RV-114 | HU27 |
| **E-305** | CUS11 | Falla al cargar la lista | MSG-155 con Reintentar. | RNF-41 | HU28 |
| **E-306** | CUS11 | Solo teclado | Tab recorre filtros, filas, botones y el diálogo; Enter confirma; Esc cancela. | RNF-42 | HU27, HU28 |
| **E-307** | CUS11 | Un mozo o el cocinero entra a VENTAS por URL o servicio | 403 y MSG-39; la opción no aparece en su menú. | RN-96 | HU28 |
| **E-308** | CUS11 | Entrar a CAJA sin caja abierta | MSG-166 y el botón ABRIR CAJA; los cobros están bloqueados. | RN-108 | HU29 |
| **E-309** | CUS11 | Abrir la caja con S/ 50.00 y confirmar | Diálogo MSG-172; luego MSG-173; la caja queda abierta y se habilita el cobro. | RV-120, RV-121 | HU29 |
| **E-31** | CUS02 | Desactivar o eliminar al único administrador activo | MSG-32; no se modifica. | RV-21, RN-10 | HU05, HU08 |
| **E-310** | CUS11 | Abrir la caja con un cierre anterior de S/ 370.00 contados | El campo sugiere S/ 370.00 y se puede cambiar. | RV-120 | HU29 |
| **E-311** | CUS11 | Monto vacío, negativo, texto, 3 decimales o mayor a 99,999.99 | MSG-169, MSG-170 o MSG-171; no se abre. | RV-120 | HU29 |
| **E-312** | CUS11 | Abrir con otra caja ya abierta | MSG-167. | RV-119, RN-107 | HU29 |
| **E-313** | CUS11 | Hay una caja de ayer sin cerrar | MSG-168; los cobros se bloquean (MSG-135) hasta cerrarla. | RV-119, RN-108 | HU29 |
| **E-314** | CUS11 | Doble clic en CONFIRMAR | Se registra una sola apertura. | RV-121, RNF-46 | HU29 |
| **E-315** | CUS11 | Falla al abrir la caja | MSG-182; no se registra la apertura. | RNF-46 | HU29 |
| **E-316** | CUS11 | Intentar cobrar sin caja abierta | MSG-135 con ABRIR CAJA. | RN-108 | HU29 |
| **E-317** | CUS12 | Revisar la pantalla con la caja abierta | Muestra hora, usuario, monto inicial y el resumen parcial de ventas. | RV-132 | HU29 |
| **E-318** | CUS12 | Cerrar la caja con pedidos pendientes de cobro | MSG-174 con la lista; el cierre queda deshabilitado; al cobrar o anular todos, se habilita. | RV-122, RN-110 | HU30 |
| **E-319** | CUS12 | Un pedido pendiente que nadie va a cobrar (cliente que se fue) | Solo puede anularlo quien lo registró o el Administrador (RN-65); hasta entonces no se puede cerrar. | RN-110 | HU30 |
| **E-32** | CUS02 | Eliminar a un usuario sin movimientos | Confirmación MSG-33; MSG-35 y desaparece de la lista. | RN-11 | HU08 |
| **E-320** | CUS12 | Inicial S/ 50.00, efectivo S/ 320.00 y Yape S/ 180.00 en 58 ventas | Resumen: efectivo esperado S/ 370.00, total vendido S/ 500.00, 58 ventas y platos por producto. | RV-123, RN-109 | HU30 |
| **E-321** | CUS12 | Hay una venta anulada del día | No suma en el resumen ni en el efectivo esperado. | RV-123 | HU30 |
| **E-322** | CUS12 | Contado S/ 370.00 con esperado S/ 370.00 | "Cuadra" (MSG-176). | RV-125 | HU30 |
| **E-323** | CUS12 | Contado S/ 365.00 | "Faltante S/ 5.00" con texto, color y signo (MSG-178). | RV-125, RN-111 | HU30 |
| **E-324** | CUS12 | Contado S/ 380.00 | "Sobrante S/ 10.00" (MSG-177). | RV-125, RN-111 | HU30 |
| **E-325** | CUS12 | Efectivo contado vacío, inválido o mayor a 99,999.99 | MSG-175, MSG-170 o MSG-171. | RV-124 | HU30 |
| **E-326** | CUS12 | Contador: 3 billetes de S/ 100, 1 de S/ 50 y 2 monedas de S/ 5 | Suma S/ 360.00; USAR ESTE TOTAL llena el campo; una cantidad inválida da MSG-184. | RV-128 | HU30 |
| **E-327** | CUS12 | Observación de más de 200 caracteres | MSG-179. | RV-126 | HU30 |
| **E-328** | CUS12 | Confirmar el cierre | Diálogo MSG-180 con el resumen y foco en CANCELAR; al confirmar, MSG-181 y la caja queda cerrada, sin cobros. | RV-127, RN-112 | HU30 |
| **E-329** | CUS12 | Terminar el cierre | Se muestra el resumen con IMPRIMIR y DESCARGAR PDF. | RNF-49 | HU30 |
| **E-33** | CUS02 | Eliminar a un usuario con movimientos | MSG-34 y opción de desactivar. | RN-11 | HU08 |
| **E-330** | CUS12 | Cambia el efectivo esperado mientras se cuenta | MSG-189 y se muestra el nuevo resumen; no se cierra. | RV-129 | HU30 |
| **E-331** | CUS12 | Doble clic en CONFIRMAR CIERRE | Se registra un solo cierre. | RV-127, RNF-46 | HU30 |
| **E-332** | CUS12 | Falla al cerrar | MSG-183; la caja sigue abierta. | RNF-46 | HU30 |
| **E-333** | CUS12 | Cancelar el cierre (botón o Esc) | La caja se mantiene abierta sin cambios. | RV-127 | HU30 |
| **E-334** | CUS12 | Se anula una venta después del cierre (CUS11.2) | El cierre original no cambia; el historial muestra "Con ajustes". | RN-113, RV-131 | HU30, HU31 |
| **E-335** | CUS12 | El administrador abre el historial | Cierres recientes primero con fecha, cajero, inicial, efectivo, Yape, total, contado y diferencia. | RN-106 | HU31 |
| **E-336** | CUS12 | Hay cierres con diferencia | Se resaltan con texto y color. | RV-131 | HU31 |
| **E-337** | CUS12 | Filtrar por una fecha o un rango; rango sin cierres; rango inválido | La lista se actualiza; sin cierres, MSG-185; rango inválido, MSG-188. | RV-130 | HU31 |
| **E-338** | CUS12 | Aún no hay cierres | MSG-187. | — | HU31 |
| **E-339** | CUS12 | Abrir el detalle de un cierre | Todos los datos, la observación, los platos vendidos y los ajustes posteriores. | RN-113 | HU31 |
| **E-34** | CUS02 | Cancelar un formulario o confirmación (botón o Esc) | No hay cambios y el foco vuelve al botón de origen. | RV-20 | HU02, HU04, HU05 y HU08 |
| **E-340** | CUS12 | Falla al cargar el historial | MSG-186 con Reintentar. | RNF-48 | HU31 |
| **E-341** | CUS12 | Un mozo o el cocinero entra a CAJA, o un cajero entra al historial por URL o servicio | 403 y MSG-39; la opción no aparece en su menú. | RN-106 | HU29 a HU31 |
| **E-342** | CUS12 | Hay una caja abierta | Aparece como primera fila "Abierta" en el historial del administrador. | RV-130 | HU31 |
| **E-343** | CUS12 | Solo teclado | Tab recorre botones, campos, el contador y los diálogos; los números se escriben con el teclado; Enter confirma; Esc cancela. | RNF-47 | HU29 a HU31 |
| **E-344** | CUS13 | El administrador entra a REPORTES | Se abre "Platos vendidos" con el día de hoy ya consultado. | RV-133 | HU33 |
| **E-345** | CUS13 | Usar los atajos Ayer, Últimos 7 días, Este mes y Mes anterior | Los campos de fecha se llenan con el rango correspondiente. | RV-134 | HU32, HU33 |
| **E-346** | CUS13 | Consultar un rango válido en "Ventas" | Muestra cantidad de ventas, total general, efectivo, Yape y el detalle por día. | RV-136 | HU32 |
| **E-347** | CUS13 | El rango incluye ventas anuladas | No suman; el pie muestra MSG-199 con su cantidad y monto. | RV-135, RN-117 | HU32 |
| **E-348** | CUS13 | Un día tiene una anulación posterior al cierre de caja | El día se marca "Con ajustes" con MSG-200; el total del reporte difiere del cierre original. | RV-137, RN-121 | HU32 |
| **E-349** | CUS13 | Rango invertido; rango futuro o de más de 366 días | MSG-190 o MSG-191; el reporte anterior se mantiene. | RV-134 | HU32, HU33 |
| **E-35** | CUS02 | Un mozo entra por URL a /usuarios | MSG-39 (403); la opción no aparece en su menú. | RN-07 | HU03 |
| **E-350** | CUS13 | Rango sin ventas | MSG-192 en Ventas o MSG-193 en Platos vendidos, con atajos. | RV-133 | HU32, HU33 |
| **E-351** | CUS13 | Platos vendidos con 45 "Menú almuerzo" y 18 "Menú desayuno" | Cada producto con su categoría, cantidad y monto, subtotales por categoría, total de platos 63 y el monto del período. | RV-138, RN-119 | HU33 |
| **E-352** | CUS13 | Cambiar el orden de la tabla | Por defecto cantidad descendente; también por monto o por nombre. | RV-138 | HU33 |
| **E-353** | CUS13 | Elegir un producto en el filtro | Se muestra su cantidad por día dentro del rango. | RV-139 | HU33 |
| **E-354** | CUS13 | Un producto desactivado con ventas en el rango | Aparece con la marca "(inactivo)" y se puede elegir. | RV-139 | HU33 |
| **E-355** | CUS13 | Comparar platos con ventas en el mismo rango | "Cuadra con ventas" (MSG-197): el monto de los platos es igual al total vendido. | RV-140, RN-120 | HU33 |
| **E-356** | CUS13 | Datos inconsistentes (monto de platos distinto del total) | MSG-198 con la diferencia. | RV-140 | HU33 |
| **E-357** | CUS13 | La administradora cambia un precio después de las ventas | Los reportes de fechas pasadas conservan sus montos. | RN-119 | HU32, HU33 |
| **E-358** | CUS13 | Cambiar los filtros después de consultar | MSG-196; el reporte no se actualiza solo y se marca como desactualizado. | RV-141 | HU32, HU33 |
| **E-359** | CUS13 | Doble clic en CONSULTAR | Se hace una sola consulta; el botón muestra "Consultando…". | RV-141 | HU32, HU33 |
| **E-36** | CUS02 | Falla del servidor al cargar o guardar | MSG-37 o MSG-38; se conservan los datos escritos. | RNF-06 | HU02 a HU05 y HU08 |
| **E-360** | CUS13 | Falla del servidor al consultar | MSG-194 o MSG-195 con Reintentar; los filtros se conservan. | RNF-53 | HU32, HU33 |
| **E-361** | CUS13 | DESCARGAR PDF | PDF A4 con el mismo contenido, el rango y la fecha de generación. | RV-142, RNF-54 | HU32, HU33 |
| **E-362** | CUS13 | DESCARGAR EXCEL | Archivo CSV UTF-8 con las mismas filas y totales. | RV-142, RNF-54 | HU32, HU33 |
| **E-363** | CUS13 | Falla la descarga | MSG-201. | RV-142 | HU32, HU33 |
| **E-364** | CUS13 | Un cajero, mozo o el cocinero entra a REPORTES por URL o servicio | 403 y MSG-39; la opción no aparece en su menú. | RN-116 | HU32, HU33 |
| **E-365** | CUS13 | Consultar el mismo rango en "Ventas" y en "Platos vendidos" | El total general y el monto total de platos son iguales. | RN-120, RNF-51 | HU32, HU33 |
| **E-366** | CUS13 | Solo teclado | Tab recorre filtros, pestañas, botones y tablas; Enter consulta; los encabezados de tabla son legibles para lectores de pantalla. | RNF-52 | HU32, HU33 |
| **E-367** | CUS13 | Consultar 366 días con unas 100 ventas diarias | La respuesta llega en 3 segundos o menos. | RNF-50 | HU32, HU33 |
| **E-37** | CUS02 | Solo teclado | Tab recorre controles y filas; el formulario atrapa el foco; Enter guarda; Esc cierra. | RNF-07 | HU02 a HU05 y HU08 |
| **E-371** | CUS03 / CUS04 (Ajuste) | Registrar el componente "Quinua", rol Bebida de desayuno, sin precio | MSG-57; aparece como «Componente · Bebida de desayuno» con «—» en el precio. | RN-130, RV-156 | HU09 |
| **E-372** | CUS03 / CUS04 (Ajuste) | Enviar un precio en un componente (por servicio) | Se rechaza con MSG-215; no se guarda. | RV-156 | HU09 |
| **E-373** | CUS03 / CUS04 (Ajuste) | Guardar sin tipo o un componente sin rol | MSG-213 o MSG-214. | RV-155, RV-156 | HU09 |
| **E-374** | CUS03 / CUS04 (Ajuste) | "Papa a la huancaína" como producto de carta y como componente; luego otro componente con el mismo nombre | Los dos primeros se permiten; el tercero, MSG-53. | RV-157, RN-139 | HU09 |
| **E-375** | CUS03 / CUS04 (Ajuste) | Cambiar el tipo de un producto que ya tiene pedidos | MSG-216; no cambia. | RV-158 | HU11 |
| **E-376** | CUS03 / CUS04 (Ajuste) | Filtrar la lista por tipo y por rol | Muestra solo los productos de carta, solo los componentes o solo los de un rol. | RV-155 | HU10 |
| **E-377** | CUS03 / CUS04 (Ajuste) | Abrir la pestaña Menús completos y cambiar el precio del Desayuno completo de 7.00 a 7.50 | MSG-217; los pedidos nuevos cobran 7.50 y los anteriores conservan 7.00. | RV-160, RN-140 | HU35 |
| **E-378** | CUS03 / CUS04 (Ajuste) | Precio de un menú completo vacío, cero, 1000 o con 3 decimales | MSG-55 o MSG-56; no se guarda. | RV-160 | HU35 |
| **E-379** | CUS03 / CUS04 (Ajuste) | Desactivar el Solo segundo | Confirmación MSG-218; no aparece en el menú del día ni en el armado. | RN-134 | HU35 |
| **E-38** | CUS02 | Revisar la barra superior en cualquier pantalla | Muestra nombre, rol y Cerrar sesión; "Cambiar contraseña" solo para el Administrador. | RN-16, RNF-08 | Anexo A |
| **E-380** | CUS03 / CUS04 (Ajuste) | Un mozo intenta editar menús completos por URL o servicio | 403 y MSG-39. | RN-23 | HU35 |
| **E-381** | CUS03 / CUS04 (Ajuste) | Definir el menú con 3 bebidas, 2 platos de desayuno, 1 sopa, 1 entrada, 2 segundos y los 3 menús habilitados | MSG-70; el armado ofrece solo esas opciones. | RV-161, RN-135 | HU13 |
| **E-382** | CUS03 / CUS04 (Ajuste) | Habilitar el Desayuno completo sin ninguna bebida | MSG-219; no se guarda. | RV-161 | HU13 |
| **E-383** | CUS03 / CUS04 (Ajuste) | Guardar sin productos de carta ni menús completos | MSG-224. | RV-162 | HU13 |
| **E-384** | CUS03 / CUS04 (Ajuste) | Marcar "Seco de pollo" como agotado | En 30 segundos el armado ya no lo ofrece; si estaba en un pedido en armado, MSG-223. | RV-166 | HU14 |
| **E-385** | CUS03 / CUS04 (Ajuste) | Se agotan todas las bebidas | El Desayuno completo queda "No disponible hoy" (MSG-220) hasta reponer. | RN-136 | HU14 |
| **E-386** | CUS03 / CUS04 (Ajuste) | No hay menú definido | El armado ofrece todos los componentes activos de cada rol. | RN-142 | HU13 |
| **E-387** | CUS06 | El mozo arma Desayuno completo con Quaker y Seco de pollo | Línea a S/ 7.00 con "incluye pan"; MSG-222; el total suma solo S/ 7.00. | RV-163, RN-133 | HU18 |
| **E-388** | CUS06 | Agregar sin elegir una parte | MSG-221; no se agrega. | RV-163 | HU18 |
| **E-389** | CUS06 | Dos desayunos: Quaker con Seco de pollo y Anís con Asado de pollo | Dos líneas de S/ 7.00; total S/ 14.00. | RV-164 | HU18 |
| **E-39** | CUS02 | Cerrar sesión y confirmar | Vuelve al login con MSG-41; el cierre queda en auditoría. | RN-19, 21 | Anexo A |
| **E-390** | CUS06 | El mismo menú con las mismas opciones, con REPETIR | Suma la cantidad a 2 en una sola línea. | RV-165 | HU18 |
| **E-391** | CUS06 | Almuerzo completo con Sopa a la minuta más Lomo saltado, y con Papa a la huancaína más Lomo saltado | Ambos a S/ 8.00. | RN-132 | HU18 |
| **E-392** | CUS06 | Solo segundo | S/ 7.00 sin sopa ni entrada. | RN-132 | HU18 |
| **E-393** | CUS06 | Agregar la nota "sin ají" a un menú completo | La nota va aparte de las opciones y llega a cocina. | RN-137 | HU18 |
| **E-394** | CUS07 | El cajero arma un menú completo en un pedido para llevar | Igual que en la mesa; sin mesa. | RV-163, RN-132 | HU20 |
| **E-395** | CUS06 | Una opción se agota mientras se arma el pedido | MSG-223; el mozo la cambia y registra. | RV-166 | HU18 |
| **E-396** | CUS08 | Modificar un pedido pendiente cambiando Quaker por Quinua | La comanda queda "Modificada" y el precio no cambia. | RV-167 | HU21 |
| **E-397** | CUS08 | Intentar modificar las opciones con la comanda en preparación | MSG-115; no cambia. | RV-167 | HU21 |
| **E-398** | CUS09 | Cocina recibe el pedido | La comanda muestra "Desayuno completo: Quaker + Seco de pollo (incluye pan)" y la nota. | RN-137 | HU23 |
| **E-399** | CUS10-14 | Imprimir el comprobante | La línea muestra el menú con su precio y las opciones como detalle sin precio. | RF-26 | HU26 |
| **E-40** | CUS02 | Cancelar el cierre (botón o Esc) | La sesión continúa y el diálogo se cierra. | RV-31 | Anexo A |
| **E-400** | CUS10-14 | Reporte de platos del día | Menús completos con cantidad y monto; componentes con cantidad; "Cuadra con ventas". | RN-138, RNF-60 | HU33 |
| **E-401** | CUS10-14 | Cierre de caja y dashboard | Muestran las mismas cifras de menús completos y de carta. | RN-138 | HU30 |
| **E-402** | CUS03 / CUS04 (Ajuste) | Migración a componentes y menús completos | Los pedidos y ventas existentes no cambian y los productos actuales quedan «De carta»; «Menú almuerzo» queda inactivo. | RNF-61 | HU09, HU35 |
| **E-403** | CUS03 / CUS04 (Ajuste) | Desactivar un componente que está en el menú de hoy | Se retira del menú y de las opciones del armado. | RN-134 | HU13 |
| **E-405** | CUS14 | Cualquier usuario inicia sesión | Llega a su pantalla de inicio con el panel de su rol. | RN-124, RV-144 | HU34 |
| **E-406** | CUS14 | El administrador revisa las ventas de hoy | Muestra total, efectivo, Yape y cantidad de ventas, iguales a las del reporte de ventas de hoy. | RV-145, RN-126 | HU34 |
| **E-407** | CUS14 | Hay una venta anulada hoy | No suma en las ventas de hoy y aparece la alerta MSG-207. | RN-128 | HU34 |
| **E-408** | CUS14 | Revisar los platos vendidos de hoy | Total de platos y los 5 principales; "Ver todos" abre Reportes con la fecha de hoy. | RV-146 | HU34 |
| **E-409** | CUS14 | Tocar un contador de pedidos por estado | Abre la lista de pedidos con ese estado ya filtrado. | RV-146 | HU34 |
| **E-41** | CUS02 | Pulsar Atrás tras cerrar sesión | Redirige al login sin mostrar datos. | RNF-09 | Anexo A |
| **E-410** | CUS14 | Revisar las mesas libres y ocupadas | Las cantidades coinciden con la vista de mesas. | RN-126 | HU34 |
| **E-411** | CUS14 | Caja sin abrir, abierta y cerrada | El estado se muestra con texto y enlace a Caja; abierta incluye el efectivo esperado parcial. | RV-152 | HU34 |
| **E-412** | CUS14 | Hay una caja de ayer sin cerrar | Alerta prioritaria arriba con MSG-168 y enlace para cerrarla. | RV-147, RN-128 | HU34 |
| **E-413** | CUS14 | El menú de hoy sin definir, y luego definido | Sin definir y con la caja abierta: alerta MSG-204 con enlace; definido: muestra los platos y cuántos están agotados. | RN-128 | HU34 |
| **E-414** | CUS14 | Hay comandas con más de 15 minutos de espera | Alerta MSG-205 con enlace a la lista de pedidos. | RN-128 | HU34 |
| **E-415** | CUS14 | El último cierre tuvo faltante o sobrante | Alerta MSG-208 con enlace al detalle del cierre. | RN-128 | HU34 |
| **E-416** | CUS14 | No hay alertas | MSG-203 "Todo en orden". | RV-147 | HU34 |
| **E-417** | CUS14 | Todavía no hay ventas hoy | Ceros visibles y MSG-202. | RV-150 | HU34 |
| **E-418** | CUS14 | El panel permanece abierto | Se actualiza solo cada 30 segundos sin mover lo que se lee; muestra "Actualizado hace X s"; ACTUALIZAR lo hace al instante. | RV-148, RNF-65 | HU34 |
| **E-419** | CUS14 | Falla un bloque | Solo ese muestra MSG-209 con Reintentar; los demás siguen visibles. | RV-149, RNF-63 | HU34 |
| **E-42** | CUS02 | Usar un token después de cerrar sesión | El servidor responde 401. | RN-19 | Anexo A |
| **E-420** | CUS14 | Falla total del servidor o sin conexión | MSG-210 con Reintentar, o los últimos datos con su antigüedad. | RV-149 | HU34 |
| **E-421** | CUS14 | El cajero entra a su inicio | Ve el resumen de su caja, pedidos por cobrar y listos; no ve los totales del negocio. | RV-154, RN-125 | Anexo B |
| **E-422** | CUS14 | El cajero entra sin caja abierta | COBRAR aparece deshabilitado con MSG-211 y ABRIR CAJA destacado. | RV-151 | Anexo B |
| **E-423** | CUS14 | El mozo entra a su inicio | Ve las mesas libres y ocupadas y sus pedidos en curso y listos (MSG-212 si no hay); no ve montos. | RV-154, RN-125 | Anexo B |
| **E-424** | CUS14 | El cocinero entra a su inicio | Ve comandas pendientes y en preparación, la más antigua con minutos y "Demora" desde 15, y los platos agotados; no ve montos. | RV-152, RV-154 | Anexo B |
| **E-425** | CUS14 | Un usuario abre por URL un destino que su rol no permite | 403 y MSG-39; los accesos rápidos solo muestran lo permitido. | RV-151, RN-129 | Anexo B |
| **E-426** | CUS14 | Abrir el panel en el celular | Una columna con las alertas y los accesos rápidos primero. | RV-153 | HU34 |
| **E-427** | CUS14 | Solo teclado | Tab recorre alertas, tarjetas y accesos; Enter abre el destino. | RNF-64 | HU34 |
| **E-428** | CUS14 | La pestaña queda oculta y luego se vuelve a ella | La actualización se pausa mientras está oculta y se actualiza al volver. | RNF-65 | HU34 |
| **E-429** | CUS14 | Un mozo pide por servicio los bloques del Administrador | No recibe esos bloques y la respuesta es 403 con MSG-39. | RN-125, RNF-62 | Anexo B |
| **E-43** | CUS02 | 28 minutos de inactividad y pulsar CONTINUAR | Aparece MSG-42; la sesión se renueva. | RN-20, RV-32 | Anexo A |
| **E-44** | CUS02 | 30 minutos de inactividad sin responder | Cierra la sesión y muestra MSG-43. | RN-20 | Anexo A |
| **E-45** | CUS02 | Cerrar sesión con el servidor caído | Se cierra en el equipo y se muestra MSG-50. | RN-19 | Anexo A |
| **E-46** | CUS02 | Cambiar la contraseña con datos válidos | MSG-47; ingresa con la nueva y no con la anterior. | RN-21, 22 | HU06 |
| **E-47** | CUS02 | Contraseña actual incorrecta | MSG-45; no cambia y se conservan los otros campos. | RV-30 | HU06 |
| **E-48** | CUS02 | Campos vacíos | Mensaje junto a cada campo; foco en el primero. | RV-23, 24, 27 | HU06 |
| **E-49** | CUS02 | Nueva contraseña corta o confirmación distinta | MSG-14 o MSG-15. | RV-24, 25 | HU06 |
| **E-50** | CUS02 | Nueva contraseña igual a la actual | MSG-46. | RV-26, RN-18 | HU06 |
| **E-51** | CUS02 | Cinco contraseñas actuales incorrectas seguidas | Se cierra la sesión con MSG-48. | RN-17 | HU06 |
| **E-52** | CUS02 | Mozo, cajero o cocinero intenta cambiar la contraseña | No ve la opción; si llama al servicio, 403 y MSG-49. | RN-16 | HU06 |
| **E-53** | CUS02 | Cancelar el cambio de contraseña | Se cierra sin cambios. | — | HU06 |
| **E-54** | CUS02 | Solo teclado | Tab recorre la barra y los formularios; Enter confirma; Esc cancela; el foco es visible. | RNF-08 | Anexo A |
| **E-55** | CUS03 | Entrar a PRODUCTOS con productos registrados | Lista por categoría y nombre, con Producto, Categoría, Precio, Estado y Acciones, de 10 en 10. | RN-23, RNF-11 | HU10 |
| **E-56** | CUS03 | Buscar por un nombre existente | Solo las coincidencias, sin distinguir mayúsculas ni tildes. | RV-40 | HU10 |
| **E-57** | CUS03 | Buscar algo que no existe | MSG-66 y "Quitar filtros". | RV-40 | HU10 |
| **E-58** | CUS03 | Filtrar por categoría y estado a la vez | Solo los productos que cumplen ambos criterios. | — | HU10 |
| **E-59** | CUS03 | Entrar sin productos registrados | MSG-65 con el botón NUEVO PRODUCTO. | — | HU10 |
| **E-60** | CUS03 | Registrar "Lomo saltado", Platos Extras / A la Carta, 25.00 | MSG-57; producto Activo en la lista y resaltado. | RN-29, RN-30 | HU09 |
| **E-61** | CUS03 | Registrar con campos vacíos | MSG-51, MSG-54 y MSG-55 junto a cada campo; foco en el primero. | RV-33, 35, 36, 38 | HU09 |
| **E-62** | CUS03 | Registrar un nombre repetido del mismo tipo (también "lomo SALTADO") | MSG-53; el formulario sigue abierto. | RV-34, RN-24 | HU09 |
| **E-63** | CUS03 | Precio 0, negativo, texto, 8.999 o 1000 | MSG-56; no se guarda. | RV-36 | HU09 |
| **E-64** | CUS03 | Precio escrito como 8,50 | Se normaliza a 8.50 y se guarda. | RV-36 | HU09 |
| **E-65** | CUS03 | Editar nombre o categoría | MSG-58; la fila se actualiza. | RV-33 a 35 | HU11 |
| **E-66** | CUS03 | Editar el precio | Aparece MSG-59; los pedidos nuevos usan el precio nuevo; las ventas registradas no cambian; el cambio queda en auditoría. | RV-42, RN-26, RN-30 | HU11 |
| **E-67** | CUS03 | Editar a un nombre que ya tiene otro producto | MSG-53. | RV-34 | HU11 |
| **E-68** | CUS03 | Desactivar un producto | Confirmación MSG-60 y luego MSG-63; ya no aparece en pedidos ni en el menú del día. | RN-27, RN-28 | HU12 |
| **E-69** | CUS03 | Desactivar un producto que está en el menú de hoy | El diálogo agrega MSG-62; al confirmar se retira del menú. | RN-28 | HU12 |
| **E-70** | CUS03 | Activar un producto inactivo | Confirmación MSG-61 y luego MSG-64; vuelve a estar disponible. | RN-28 | HU12 |
| **E-71** | CUS03 | Cancelar un formulario o confirmación (botón o Esc) | Sin cambios; el foco vuelve al botón de origen. | RV-41 | HU09 a HU12 |
| **E-72** | CUS03 | Un mozo entra por URL a /productos | MSG-39 (403); la opción no aparece en su menú. | RN-23 | HU10 |
| **E-73** | CUS03 | Falla del servidor al cargar o guardar | MSG-67 o MSG-38; se conservan los datos escritos. | RNF-12 | HU09 a HU12 |
| **E-74** | CUS03 | Uso solo con teclado | Tab recorre controles y filas; el formulario atrapa el foco; Enter guarda; Esc cierra. | RNF-13 | HU09 a HU12 |
| **E-75** | CUS03 | Doble clic en GUARDAR | Se crea un solo producto. | RV-39 | HU09 |
| **E-76** | CUS03 | Abrir el selector de categoría del formulario | Se muestran exactamente 6 opciones, cada una con su subtítulo descriptivo. | RN-31, RV-35 | HU09, HU11 |
| **E-77** | CUS03 | Filtrar la lista por cada una de las 6 categorías | Cantidades de productos de carta activos: Desayuno 15, Almuerzo 8, Platos Extras 11, Combinados 3, Bebidas 15, Otro 3 (55 en total); cada fila muestra la insignia de color de su categoría. | RN-31 | HU10 |
| **E-78** | CUS03 | GET /api/productos con categoria = "Platos Extras / A la Carta", sus variantes sin tildes o en minúsculas, o 3 | El mismo resultado en todos los casos. | RV-43 | HU10 |
| **E-79** | CUS03 | POST con categoria = "Combinados" o 4 | Producto creado en la categoría Combinados (4). | RV-43, RN-31 | HU09 |
| **E-80** | CUS03 | POST o PUT con una categoría inexistente (por ejemplo, "Postres") | 400 indicando el campo categoria; no se guarda. | RV-35, RV-43 | HU09, HU11 |
| **E-81** | CUS03 | Consultar los dos productos de caldo de gallina | "Caldo de gallina (Entrada)": S/ 5.00 en Almuerzo. "Caldo de gallina criollo (Plato fuerte)": S/ 10.00 en Platos Extras / A la Carta. Son productos independientes. | RN-33 | HU10 |
| **E-82** | CUS03 | Cambiar de categoría un producto que ya tiene pedidos y comandas | El cambio se guarda sin afectar los pedidos, comandas ni menús ya registrados. | RN-26, RN-32 | HU11 |
| **E-83** | CUS03 | Abrir el Menú del día (CUS04) | Los productos de carta activos aparecen agrupados por categoría (todas de selección múltiple) y los componentes, por rol, en «Opciones del día»; los menús completos se habilitan con un interruptor. | RN-28, RN-31, RN-35 | HU13 |
| **E-84** | CUS03 | Consultar ventas por categoría en Reportes (CUS13) | Se consolidan las métricas de las 6 categorías. | RN-34 | HU33 |
| **E-85** | CUS03 | Registrar un pedido de mesa (CUS06) o para llevar (CUS07) | Se ofrecen los productos de carta activos del menú del día y no agotados, y el armado de los menús completos habilitados con sus opciones; un producto o componente inactivo no aparece. | RN-28, RN-35 | HU18, HU20 |
| **E-86** | CUS03 | Modificar el precio de un producto con pedidos ya registrados | Los pedidos existentes conservan el precio unitario con que se registraron; los nuevos usan el precio vigente. | RN-26 | HU11, HU18 |
| **E-87** | CUS03 | Entrar a MENÚ DEL DÍA sin menú definido | Fecha actual, insignia «Menú no definido aún», aviso MSG-71, pestañas Opciones del día, Menús completos y las seis categorías con contador 0, y barra inferior con «Total en carta: 0 productos». | RV-48, RV-49 | HU13 |
| **E-88** | CUS03 | Cambiar de pestaña | Se muestra el panel de la categoría elegida con su título, descripción y "N de M seleccionados"; la selección de las otras pestañas se conserva y la página no se desplaza. | RN-37, RV-48 | HU13 |
| **E-89** | CUS03 | Abrir Almuerzos y Segundos | Se listan 8 productos activos con su precio y «0 de 8 seleccionados». | RN-37 | HU13 |
| **E-90** | CUS03 | Revisar el contenido de cada pestaña de categoría | Almuerzos y Segundos 8; Platos Extras / A la Carta 11; Desayunos 15; Combinados 3; Bebidas y Refrescos 15; Otros y Guarniciones 3 (55 productos de carta activos); Opciones del día con sus cinco secciones. | RN-37 | HU13 |
| **E-91** | CUS03 | Marcar un producto | El contador de la pestaña sube y se resalta, el panel muestra "1 de N seleccionados", el total en carta suma 1 y aparece "Cambios sin guardar". | RV-48, RV-50 | HU13 |
| **E-92** | CUS03 | Pulsar SELECCIONAR TODOS en Platos Extras / A la Carta | Se marcan los 11 productos; el contador muestra 11 y el botón pasa a DESMARCAR TODOS. | RV-47 | HU13 |
| **E-93** | CUS03 | Pulsar DESMARCAR TODOS | Se desmarcan los productos de la pestaña y el contador vuelve a 0. | RV-47 | HU13 |
| **E-94** | CUS03 | Seleccionar todos en una pestaña con otras ya seleccionadas | Solo cambia la pestaña activa; las demás conservan su selección. | RV-47 | HU13 |
| **E-96** | CUS04 | Pulsar VISTA COMPLETA | Todas las categorías aparecen como secciones colapsables con su contador; la selección se conserva; el botón pasa a POR PESTAÑAS; expandir o colapsar no altera la selección. | RV-55 | HU13 |
| **E-98** | CUS04 | Guardar un menú con productos seleccionados | MSG-70; la insignia indica menú definido, desaparece "Cambios sin guardar" y aparece la pestaña Disponibilidad en Servicio. | RN-36 | HU13 |
| **E-99** | CUS04 | Desplazarse por una categoría extensa o cambiar de pestaña | La barra inferior con el botón GUARDAR MENÚ DEL DÍA permanece visible en todo momento. | RV-49, RNF-14 | HU13 |