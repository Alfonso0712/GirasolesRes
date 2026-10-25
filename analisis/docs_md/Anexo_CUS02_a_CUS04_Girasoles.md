RESTAURANTE GIRASOLES
Anexo: CUS02 a CUS04 – Gestión de usuarios, de productos y del menú del día
Casos de uso, interfaz, reglas, API, pruebas y trazabilidad · Metodología XP · Estructura única por CUS

# Correspondencia de numeración vigente

Este anexo usa la numeración definitiva de 35 RF, 35 HU y los CUS sin el antiguo CUS03 (Perfil). Los códigos de reglas (RV, RN, RNF), mensajes (MSG) y escenarios (E) se conservan sin cambios para no romper las referencias cruzadas entre los CUS.

<!-- tabla 1 -->
| CUS vigente | Contenido | HU | RF | Antes |
|---|---|---|---|---|
| CUS02 | Gestión de usuarios (CUS02.1 a 02.6) | HU02 a HU06 y HU08 | RF-02 a RF-06 y RF-08 | CUS02 y CUS03.2 (cambiar contraseña) |
| — | Cerrar sesión y barra superior: lineamiento de diseño (Anexo A), ya no es CUS ni RF | — | — | CUS03.1 / HU08 / RF-02 |
| CUS03 | Gestión de productos (CUS03.1 a 03.5) | HU09 a HU12 y HU35 | RF-09 a RF-12 y RF-35 | CUS04 |
| CUS04 | Gestión del menú del día (CUS04.1 y 04.2) | HU13 y HU14 | RF-13 y RF-14 | CUS05 |

Referencias a CUS posteriores (pedidos, cocina, cobro, ventas, caja, reportes y dashboard): la numeración baja una unidad (antes CUS07 = ahora CUS06, y así hasta CUS15 = CUS14). La generación de la comanda, el aviso de comanda lista, el método de pago y la liberación de la mesa son pasos de los CUS de registro de pedido, listado de pedidos y cobro, no CUS propios.

# CUS02: Gestión de usuarios


## 1. Ficha del CUS general


<!-- tabla 2 -->
| Campo | Detalle |
|---|---|
| CUS general | CUS02: Gestión de usuarios |
| Interfaz (GUI) | Interfaz 2: Gestión de usuarios |
| Actor(es) | Administrador |
| HU / RF de origen | HU02 a HU06 y HU08 / RF-02 a RF-06 y RF-08 |
| Descripción | Interfaz única del módulo de usuarios. Desde la lista, la administradora busca, filtra, registra, edita, activa, desactiva y elimina usuarios sin salir de la pantalla, y cambia su propia contraseña; los formularios y confirmaciones se abren sobre la lista. |
| Fuera de alcance | Cerrar sesión, la barra superior y la expiración de sesión son lineamientos de diseño y seguridad (Anexo A), no casos de uso. |


<!-- tabla 3 -->
| CUS | Título | HU | RF | Prioridad | Iteración | Complejidad |
|---|---|---|---|---|---|---|
| CUS02.1 | Listar y buscar usuarios | HU03 | RF-03 | Alta (Must) | 1/3 | Baja |
| CUS02.2 | Registrar usuario | HU02 | RF-02 | Alta (Must) | 1/3 | Media |
| CUS02.3 | Editar usuario | HU04 | RF-04 | Media (Should) | 2/3 | Media |
| CUS02.4 | Activar o desactivar usuario | HU05 | RF-05 | Media (Should) | 2/3 | Baja |
| CUS02.5 | Eliminar usuario | HU08 | RF-08 | Baja (Could) | 3/3 | Media |
| CUS02.6 | Cambiar contraseña | HU06 | RF-06 | Media (Should) | 2/3 | Baja |

Criterio: la prioridad se obtiene de la validación MoSCoW de la HU (Must = Alta, Should = Media, Could = Baja) y la iteración sigue la prioridad (Alta = 1/3, Media = 2/3, Baja = 3/3).

## 2. Decisiones adoptadas


<!-- tabla 4 -->
| Tema | Decisión | Vacío que cubre |
|---|---|---|
| Acceso al módulo | Solo el rol Administrador. Los demás roles no ven la opción y el servidor responde 403 si acceden por URL. | RN de permisos |
| Campos del usuario | Nombre completo, usuario único, correo, contraseña, rol y estado. El correo es obligatorio para el Administrador (lo exige RF-07) y opcional para los demás roles. | RF-02 y RF-04 no incluyen correo |
| Contraseña inicial | La asigna la administradora al registrar (8 a 64 caracteres) y se guarda con hash. En la edición es opcional: vacía = no cambia. | RF-04 |
| Listado | Orden alfabético por nombre, 10 usuarios por página, columnas Nombre, Usuario, Rol, Estado y Acciones. | RF-03 |
| Búsqueda y filtros | Búsqueda por nombre o usuario (sin distinguir mayúsculas ni tildes, máx. 50 caracteres) y filtros por rol y estado, combinables. | HU03 |
| Registro de usuario nuevo | Se crea siempre con estado Activo. | RF-02 |
| Protección del administrador | Nadie puede desactivarse ni eliminarse a sí mismo, y siempre debe existir al menos un administrador activo. | HU05 y HU08 |
| Qué es "movimiento" | Registros del usuario en ventas, pedidos o caja. El historial de ingresos y la auditoría guardan el nombre de usuario como texto y no impiden eliminar. | RF-08 |
| Eliminación | Física, solo para usuarios sin movimientos; en otro caso se debe desactivar. | RF-08 |
| Cambios de estado y rol | El servidor valida el estado activo en cada solicitud (un usuario desactivado pierde el acceso de inmediato). El cambio de rol rige desde el siguiente inicio de sesión. | Faltaba definir el efecto |
| Auditoría | Se registra quién, cuándo y sobre qué usuario se registró, editó, cambió contraseña, activó, desactivó o eliminó. | Control de la dueña |
| Cambio de contraseña | Solo el Administrador, con contraseña actual, nueva (8 a 64 caracteres, distinta de la actual) y confirmación. | RF-06 y política de la dueña |
| Intentos fallidos al cambiar | 5 contraseñas actuales incorrectas consecutivas cierran la sesión. | Faltaba política |
| Tras cambiar la contraseña | La sesión continúa con un token nuevo y los tokens anteriores del usuario quedan invalidados. | Faltaba definir el efecto |


## 3. Análisis del usuario (Diseño Centrado en el Usuario)


<!-- tabla 5 -->
| Aspecto | Descripción |
|---|---|
| Quién usa la interfaz | La administradora del restaurante (dueña), con experiencia tecnológica básica, desde la computadora del local o su celular. |
| Necesidades | Ver rápido quién tiene acceso y con qué rol; dar de alta al personal nuevo; dar de baja a quien se va sin perder su historial; corregir datos; restablecer contraseñas olvidadas. |
| Dificultades previsibles | Crear un usuario duplicado; eliminar por error a quien tiene historial; desactivar su propia cuenta; no encontrar a alguien en la lista; olvidar la contraseña que asignó; no distinguir entre desactivar y eliminar. |
| Contexto de uso | Tareas poco frecuentes y de corta duración, fuera de las horas pico de atención. |
| Cambio de contraseña propia | La administradora cambia su contraseña desde la barra superior; mozo, cajero y cocinero no la cambian, la pide a la administradora (RN-13, RN-16). Dificultades previsibles: escribir mal la contraseña nueva y confundir la actual con la nueva. |


## 4. Plantillas de casos de uso


### CUS02.1: Listar y buscar usuarios


<!-- tabla 6 -->
| Código: CUS02.1 | Título: Listar y buscar usuarios (Vista 2.1) | Fecha: 15.10.2026 | Iteración: 1/3 |
|---|---|---|---|
| Actor(es): Administrador |  |  |  |
| Prioridad: Alta (Must) | Complejidad: Baja |  |  |
| Historia de usuario: HU03 · Listar y buscar usuarios |  |  |  |
| Requerimiento de origen: RF-03 |  |  |  |
| Descripción: Permite a la administradora visualizar la lista paginada de usuarios con nombre, usuario, rol y estado, y buscarlos o filtrarlos por rol y estado. |  |  |  |
| Precondición: La administradora tiene sesión iniciada con rol Administrador y accede desde la opción USUARIOS del menú. |  |  |  |
| Flujo principal:<br>1. Entra a USUARIOS; el sistema muestra "Cargando usuarios…" y luego la lista ordenada alfabéticamente, de 10 en 10, con Nombre, Usuario, Rol, Estado y Acciones.<br>2. Opcionalmente escribe en Buscar o elige filtros de rol y estado.<br>3. El sistema actualiza la lista tras 300 ms y mantiene los criterios mientras navega por las páginas. |  |  |  |
| Flujo alterno:<br>Sin resultados de búsqueda o filtro: MSG-36 y opción "Quitar filtros".<br>Un usuario sin rol Administrador intenta entrar por URL: MSG-39 (403); la opción no aparece en su menú. |  |  |  |
| Postcondición: La lista refleja los criterios aplicados. |  |  |  |
| Excepciones:<br>Falla al cargar la lista: MSG-37 con Reintentar; los filtros se conservan.<br>Pérdida de conexión: MSG-09. |  |  |  |
| Reglas y mensajes aplicables: RV-22; RN-07; RNF-05 a RNF-07; MSG-36, 37, 39 y 09. |  |  |  |


### CUS02.2: Registrar usuario


<!-- tabla 7 -->
| Código: CUS02.2 | Título: Registrar usuario (Vista 2.2) | Fecha: 15.10.2026 | Iteración: 1/3 |
|---|---|---|---|
| Actor(es): Administrador |  |  |  |
| Prioridad: Alta (Must) | Complejidad: Media |  |  |
| Historia de usuario: HU02 · Registrar usuario |  |  |  |
| Requerimiento de origen: RF-02 |  |  |  |
| Descripción: Permite a la administradora crear la cuenta de un trabajador con su nombre, usuario, correo, contraseña y rol. |  |  |  |
| Precondición: La administradora tiene sesión iniciada con rol Administrador y está en la lista de usuarios. |  |  |  |
| Flujo principal:<br>1. Pulsa NUEVO USUARIO; el sistema abre el formulario con el foco en Nombre.<br>2. Completa nombre, usuario, correo (obligatorio si el rol es Administrador), contraseña, confirmación y rol.<br>3. Pulsa GUARDAR o presiona Enter; el sistema recorta espacios, valida (RV-11 a RV-18) y deshabilita el botón (RV-19).<br>4. El servidor crea el usuario con estado Activo y lo registra en auditoría.<br>5. El sistema cierra el formulario, muestra MSG-25 y actualiza la lista resaltando al nuevo usuario. |  |  |  |
| Flujo alterno:<br>Usuario o correo duplicado: MSG-21 o MSG-24; el formulario sigue abierto con los datos escritos.<br>Campos vacíos o inválidos: MSG-19, 20, 22, 23, 03, 12, 14 o 15 junto al campo y foco en el primero.<br>Rol Administrador sin correo: MSG-23.<br>Cancelar (botón o Esc): se cierra sin guardar y el foco vuelve a NUEVO USUARIO. |  |  |  |
| Postcondición: El usuario queda registrado, activo y con su rol; la operación queda en auditoría. |  |  |  |
| Excepciones:<br>Falla al guardar: MSG-38; no se crea la cuenta y se conserva lo escrito.<br>Pérdida de conexión: MSG-09. |  |  |  |
| Reglas y mensajes aplicables: RV-11 a RV-19; RN-07 a RN-09, RN-14; RNF-06; MSG-19 a 25, 38 (y MSG-01, 03, 09, 12, 14, 15). |  |  |  |


### CUS02.3: Editar usuario


<!-- tabla 8 -->
| Código: CUS02.3 | Título: Editar usuario (Vista 2.3) | Fecha: 15.10.2026 | Iteración: 2/3 |
|---|---|---|---|
| Actor(es): Administrador |  |  |  |
| Prioridad: Media (Should) | Complejidad: Media |  |  |
| Historia de usuario: HU04 · Editar usuario |  |  |  |
| Requerimiento de origen: RF-04 |  |  |  |
| Descripción: Permite a la administradora modificar los datos, el rol y la contraseña de un usuario para mantener actualizada la información del personal. |  |  |  |
| Precondición: La administradora tiene sesión iniciada con rol Administrador y el usuario existe. |  |  |  |
| Flujo principal:<br>1. Pulsa EDITAR en la fila; el sistema abre el formulario con los datos actuales y la contraseña vacía.<br>2. Modifica nombre, usuario, correo, rol o escribe una nueva contraseña (opcional).<br>3. Pulsa GUARDAR CAMBIOS; el sistema valida (RV-11 a RV-18) y deshabilita el botón.<br>4. El servidor actualiza y registra el cambio en auditoría.<br>5. El sistema muestra MSG-26 y actualiza la fila. |  |  |  |
| Flujo alterno:<br>Usuario o correo ya asignado a otra cuenta: MSG-21 o MSG-24.<br>Campos vacíos o inválidos: mensaje junto al campo (MSG-19, 20, 22, 23, 03, 12, 14, 15).<br>Se intenta quitar el rol Administrador al único administrador activo: MSG-32; no se modifica.<br>Contraseña vacía: no cambia.<br>Cancelar (botón o Esc): se descartan los cambios. |  |  |  |
| Postcondición: Los datos, el rol y la contraseña (si se escribió una) quedan actualizados; el nuevo rol rige desde el siguiente inicio de sesión del usuario (RN-15). |  |  |  |
| Excepciones:<br>Falla al actualizar: MSG-38; se conservan los datos anteriores y lo escrito.<br>Pérdida de conexión: MSG-09. |  |  |  |
| Reglas y mensajes aplicables: RV-11 a RV-19; RN-08, RN-10, RN-13 a RN-15; MSG-20 a 24, 26, 32, 38. |  |  |  |


### CUS02.4: Activar o desactivar usuario


<!-- tabla 9 -->
| Código: CUS02.4 | Título: Activar o desactivar usuario (Vista 2.4) | Fecha: 15.10.2026 | Iteración: 2/3 |
|---|---|---|---|
| Actor(es): Administrador |  |  |  |
| Prioridad: Media (Should) | Complejidad: Baja |  |  |
| Historia de usuario: HU05 · Activar o desactivar usuarios |  |  |  |
| Requerimiento de origen: RF-05 |  |  |  |
| Descripción: Permite a la administradora habilitar o bloquear el acceso de un usuario sin perder su historial. |  |  |  |
| Precondición: La administradora tiene sesión iniciada con rol Administrador y el usuario existe. |  |  |  |
| Flujo principal:<br>1. Pulsa DESACTIVAR (o ACTIVAR) en la fila del usuario.<br>2. El sistema muestra la confirmación MSG-27 (o MSG-28) con el nombre del usuario y el foco en CANCELAR.<br>3. La administradora confirma; el servidor cambia el estado y lo registra en auditoría.<br>4. El sistema muestra MSG-29 (o MSG-30) y refleja el estado en la lista. |  |  |  |
| Flujo alterno:<br>Intento de desactivar su propia cuenta: MSG-31.<br>Intento de dejar el sistema sin administrador activo: MSG-32.<br>Cancelar (botón o Esc): el estado no cambia. |  |  |  |
| Postcondición: El usuario queda activo o inactivo; un usuario inactivo pierde el acceso de inmediato y conserva su historial (RN-12). |  |  |  |
| Excepciones:<br>Falla al cambiar el estado: MSG-38; se conserva el estado anterior.<br>Pérdida de conexión: MSG-09. |  |  |  |
| Reglas y mensajes aplicables: RV-20, RV-21; RN-10, RN-12, RN-14; MSG-27 a 32, 38. |  |  |  |


### CUS02.5: Eliminar usuario


<!-- tabla 10 -->
| Código: CUS02.5 | Título: Eliminar usuario (Vista 2.5) | Fecha: 15.10.2026 | Iteración: 3/3 |
|---|---|---|---|
| Actor(es): Administrador |  |  |  |
| Prioridad: Baja (Could) | Complejidad: Media |  |  |
| Historia de usuario: HU08 · Eliminar usuarios |  |  |  |
| Requerimiento de origen: RF-08 |  |  |  |
| Descripción: Permite a la administradora depurar usuarios creados por error y sin movimientos registrados. |  |  |  |
| Precondición: La administradora tiene sesión iniciada con rol Administrador y el usuario existe. |  |  |  |
| Flujo principal:<br>1. Pulsa ELIMINAR en la fila; el sistema muestra MSG-33 con el nombre del usuario y el foco en CANCELAR.<br>2. La administradora confirma; el servidor verifica que no tenga movimientos (ventas, pedidos o caja), elimina y registra en auditoría.<br>3. El sistema muestra MSG-35 y quita al usuario de la lista. |  |  |  |
| Flujo alterno:<br>El usuario tiene movimientos: MSG-34 y se ofrece DESACTIVAR (CUS02.4).<br>Intento de eliminar su propia cuenta: MSG-31.<br>Intento de dejar el sistema sin administrador activo: MSG-32.<br>Cancelar (botón o Esc): no se elimina. |  |  |  |
| Postcondición: El usuario eliminado deja de aparecer en la lista y no puede iniciar sesión. |  |  |  |
| Excepciones:<br>Falla al eliminar: MSG-38; se conserva el registro.<br>Pérdida de conexión: MSG-09. |  |  |  |
| Reglas y mensajes aplicables: RV-20, RV-21; RN-10, RN-11, RN-14; MSG-31 a 35, 38. |  |  |  |


### CUS02.6: Cambiar contraseña


<!-- tabla 11 -->
| Código: CUS02.6 | Título: Cambiar contraseña (Vista 2.6) | Fecha: 15.10.2026 | Iteración: 2/3 |
|---|---|---|---|
| Actor(es): Administrador |  |  |  |
| Prioridad: Media (Should) | Complejidad: Baja |  |  |
| Historia de usuario: HU06 · Cambiar contraseña |  |  |  |
| Requerimiento de origen: RF-06 |  |  |  |
| Descripción: Permite a la administradora cambiar su propia contraseña para mantener segura su cuenta. El acceso es la opción CAMBIAR CONTRASEÑA de la barra superior (Anexo A). |  |  |  |
| Precondición: La administradora tiene sesión iniciada con rol Administrador. |  |  |  |
| Flujo principal:<br>1. Pulsa CAMBIAR CONTRASEÑA; el sistema abre el formulario con el foco en Contraseña actual.<br>2. Escribe la contraseña actual, la nueva y la confirmación (puede usar "Mostrar" en cada campo).<br>3. Pulsa GUARDAR o presiona Enter; el sistema valida (RV-23 a RV-27) y deshabilita el botón (RV-28).<br>4. El servidor verifica la contraseña actual, guarda la nueva con hash, invalida los tokens anteriores, entrega uno nuevo y registra el cambio en auditoría.<br>5. El sistema cierra la ventana y muestra MSG-47; la sesión continúa. |  |  |  |
| Flujo alterno:<br>Contraseña actual vacía o incorrecta: MSG-44 o MSG-45; no se cambia nada, se conserva lo escrito en los demás campos y se cuenta un intento fallido.<br>Cinco intentos fallidos consecutivos: el sistema cierra la sesión y muestra MSG-48 en el login.<br>Nueva contraseña fuera de rango, sin coincidir o igual a la actual: MSG-14, MSG-15 o MSG-46 junto al campo.<br>Un usuario sin rol Administrador intenta cambiarla: MSG-49 (403); la opción no aparece en su barra.<br>Cancelar (botón o Esc): se cierra sin cambios. |  |  |  |
| Postcondición: La contraseña queda actualizada, la sesión continúa con un token nuevo y los anteriores quedan invalidados. |  |  |  |
| Excepciones:<br>Falla al cambiar la contraseña: MSG-38; se conserva la contraseña anterior y lo escrito.<br>Pérdida de conexión: MSG-09. |  |  |  |
| Reglas y mensajes aplicables: RV-23 a RV-30; RN-16 a RN-18, RN-21, RN-22; RNF-10; MSG-14, 15, 38, 44 a 49 y 09. |  |  |  |


## 5. Interfaz (GUI)


<!-- tabla 12 -->
| Interfaz | RF | HU | CUS | Qué se hace dentro de la interfaz |
|---|---|---|---|---|
| 2. Gestión de usuarios | RF-02 a RF-06, RF-08 | HU02 a HU06, HU08 | CUS02 (02.1 a 02.6) | Listar y buscar (pantalla base), registrar, editar (datos, rol y contraseña), activar o desactivar, eliminar y cambiar la propia contraseña. |


### Vista 2.1: Lista de usuarios, pantalla base (CUS02.1) — restaurante.app/usuarios


<!-- tabla 13 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 14 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Menú "Usuarios" | Opción del menú lateral, visible solo para el Administrador. |
| 2 | Botón "Nuevo usuario" | Abre el formulario de registro (CUS02.2). |
| 3 | Búsqueda y filtros | Buscador por nombre o usuario (máx. 50 caracteres) y filtros por rol y estado. |
| 4 | Tabla de usuarios | Nombre, usuario, rol, estado (insignia con texto) y acciones EDITAR, ACTIVAR / DESACTIVAR y ELIMINAR; en móvil se muestra como tarjetas. |
| 5 | Paginación | De 10 en 10; mantiene los criterios de búsqueda y filtro. |


### Vista 2.2: Registrar usuario (CUS02.2) — restaurante.app/usuarios/nuevo


<!-- tabla 15 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 16 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Nombre completo | Campo de texto; muestra MSG-19 o MSG-20. |
| 2 | Usuario | Nombre de usuario único; muestra MSG-01, MSG-03 o MSG-21. |
| 3 | Correo | Obligatorio si el rol es Administrador; muestra MSG-12, MSG-23 o MSG-24. |
| 4 | Contraseña y Confirmar | Campos ocultos con "Mostrar"; muestran MSG-14 o MSG-15. |
| 5 | Rol | Lista cerrada: Administrador, Cajero, Mozo o Cocinero; muestra MSG-22. |
| 6 | Botón GUARDAR | Valida y registra al usuario; muestra "Guardando…" mientras procesa. |
| 7 | Botón Cancelar | Cierra el formulario sin guardar. |


### Vista 2.3: Editar usuario (CUS02.3) — restaurante.app/usuarios/editar


<!-- tabla 17 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 18 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Título | Encabezado "Editar usuario". |
| 2 | Nombre, usuario y correo | Campos con los datos actuales, editables. |
| 3 | Rol | Lista cerrada; el cambio rige desde el siguiente ingreso del usuario. |
| 4 | Nueva contraseña (opcional) | Vacía = no cambia; con valor, se valida (8 a 64 caracteres). |
| 5 | Botón GUARDAR CAMBIOS | Valida y actualiza los datos. |
| 6 | Botón Cancelar | Descarta los cambios. |


### Vista 2.4: Activar o desactivar usuario (CUS02.4) — restaurante.app/usuarios


<!-- tabla 19 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 20 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Acción en la fila | "Desactivar" (usuario activo) o "Activar" (usuario inactivo). |
| 2 | Diálogo de confirmación | MSG-27 o MSG-28 con el nombre del usuario. |
| 3 | Botón Confirmar | Aplica el cambio de estado. |
| 4 | Botón Cancelar | Cierra el diálogo sin cambios; es el botón por defecto. |
| 5 | Aviso sobre la lista | MSG-31 o MSG-32 si se intenta desactivar la propia cuenta o al último administrador. |


### Vista 2.5: Eliminar usuario (CUS02.5) — restaurante.app/usuarios


<!-- tabla 21 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 22 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Acción "Eliminar" | En rojo y separada de las demás acciones de la fila. |
| 2 | Diálogo de confirmación | MSG-33: advierte que la acción no se puede deshacer. |
| 3 | Mensaje de error | MSG-34 si el usuario tiene movimientos (con la opción de desactivar) o MSG-31 / MSG-32. |
| 4 | Botón Confirmar | Elimina al usuario y actualiza la lista. |
| 5 | Botón Cancelar | Cierra el diálogo sin cambios; es el botón por defecto. |


### Vista 2.6: Cambiar contraseña (CUS02.6) — restaurante.app/perfil/contrasena


<!-- tabla 23 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 24 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Opción "Cambiar contraseña" | En la barra superior; solo para el Administrador (Anexo A). |
| 2 | Contraseña actual | Campo oculto con "Mostrar"; muestra MSG-44 o MSG-45. |
| 3 | Nueva contraseña y confirmación | Campos ocultos con "Mostrar"; muestran MSG-14, MSG-15 o MSG-46. |
| 4 | Botón GUARDAR | Valida y actualiza la contraseña; muestra MSG-47. |
| 5 | Botón Cancelar | Cierra la ventana sin cambios. |


## 6. Estados de la interfaz


<!-- tabla 25 -->
| Estado | Comportamiento visual |
|---|---|
| Cargando lista | Texto "Cargando usuarios…" con marcadores de posición; botones de acción deshabilitados. |
| Lista con datos | Tabla con insignia de estado (Activo en verde, Inactivo en gris, con texto además del color) y paginación de 10 en 10. |
| Sin resultados | MSG-36 y botón "Quitar filtros". |
| Error de carga | MSG-37 con botón Reintentar; los filtros se conservan. |
| Formulario abierto | Ventana sobre la lista; foco en el primer campo; Esc o CANCELAR la cierran y el foco regresa al botón que la abrió; Enter guarda. |
| Guardando | Botón "Guardando…" deshabilitado (RV-19). |
| Éxito | Aviso temporal (MSG-25, 26, 29, 30, 35) y fila afectada resaltada unos segundos. |
| Confirmación | Diálogo que nombra al usuario; botón por defecto CANCELAR; la acción de eliminar en rojo y separada de las demás. |
| Móvil | Cada usuario se muestra como tarjeta con nombre, usuario, rol, estado y acciones; controles de al menos 44 px. |
| Formulario de contraseña | Ventana con tres campos y "Mostrar" en cada uno; foco en Contraseña actual; Esc cancela; Enter guarda. |
| Error al cambiar la contraseña | Texto junto al campo (MSG-44, 45, 46, 14, 15); lo escrito en los otros campos se conserva. |


## 7. Reglas de validación (RV)


<!-- tabla 26 -->
| Código | Regla | Elemento UI | Mensaje |
|---|---|---|---|
| RV-11 | El nombre completo es obligatorio: 3 a 60 caracteres, solo letras, tildes y espacios. | Campo Nombre | MSG-19, 20 |
| RV-12 | El usuario es obligatorio, con el formato del CUS01 (3 a 30 caracteres, sin espacios) y único sin distinguir mayúsculas. | Campo Usuario | MSG-01, 03, 21 |
| RV-13 | La contraseña es obligatoria al registrar (8 a 64 caracteres) y opcional al editar. | Campo Contraseña | MSG-14 |
| RV-14 | La confirmación debe ser igual a la contraseña. | Campo Confirmar | MSG-15 |
| RV-15 | El rol es obligatorio y se elige de una lista cerrada (Administrador, Cajero, Mozo, Cocinero). | Lista Rol | MSG-22 |
| RV-16 | El correo tiene formato válido, es único y máx. 100 caracteres; es obligatorio si el rol es Administrador. | Campo Correo | MSG-12, 23, 24 |
| RV-17 | Se eliminan los espacios al inicio y al final de nombre, usuario y correo antes de validar. | Campos de texto | — |
| RV-18 | Los errores se muestran junto al campo y dicen qué corregir; no se guarda con errores y el foco va al primer campo con error. | Texto de error / botón GUARDAR | MSG-19 a 24 |
| RV-19 | Mientras se guarda, el botón queda deshabilitado con "Guardando…" para evitar duplicados. | Botón GUARDAR | — |
| RV-20 | Desactivar y eliminar piden confirmación que nombra al usuario; el botón por defecto es Cancelar. | Diálogo de confirmación | MSG-27, 28, 33 |
| RV-21 | El administrador no puede desactivar ni eliminar su propia cuenta ni dejar el sistema sin administrador activo. | Acciones de la fila | MSG-31, 32 |
| RV-22 | El texto de búsqueda admite hasta 50 caracteres y se aplica al escribir (espera de 300 ms). | Campo Buscar | MSG-36 |
| RV-23 | La contraseña actual es obligatoria. | Campo Contraseña actual | MSG-44 |
| RV-24 | La nueva contraseña es obligatoria y tiene entre 8 y 64 caracteres. | Campo Nueva contraseña | MSG-14 |
| RV-25 | La confirmación debe ser igual a la nueva contraseña. | Campo Confirmar | MSG-15 |
| RV-26 | La nueva contraseña debe ser distinta de la actual. | Campo Nueva contraseña | MSG-46 |
| RV-27 | Los errores se muestran junto al campo y dicen qué corregir; no se envía con errores y el foco va al primer campo con error. | Texto de error / botón GUARDAR | MSG-14, 15, 44, 46 |
| RV-28 | Mientras se guarda, el botón queda deshabilitado con "Guardando…". | Botón GUARDAR | — |
| RV-29 | Las tres contraseñas se muestran ocultas por defecto, cada una con su botón "Mostrar". | Campos de contraseña | — |
| RV-30 | El error de contraseña actual no revela información adicional y no borra lo escrito en los demás campos. | Texto bajo Contraseña actual | MSG-45 |


## 8. Reglas de negocio y requerimientos no funcionales


<!-- tabla 27 -->
| Código | Regla |
|---|---|
| RN-07 | Solo el Administrador accede al módulo de usuarios. |
| RN-08 | El nombre de usuario y el correo son únicos en el sistema. |
| RN-09 | Todo usuario nuevo se registra con estado Activo. |
| RN-10 | Siempre debe existir al menos un administrador activo; el administrador no puede desactivarse ni eliminarse a sí mismo. |
| RN-11 | Solo se elimina un usuario sin movimientos (ventas, pedidos o caja); en otro caso debe desactivarse. |
| RN-12 | Un usuario desactivado conserva su historial y no puede iniciar sesión; el servidor valida el estado en cada solicitud. |
| RN-13 | Solo la administradora cambia las contraseñas de los demás usuarios (desde la edición). |
| RN-14 | Registrar, editar, cambiar contraseña, activar, desactivar y eliminar se registran en auditoría. |
| RN-15 | El cambio de rol rige desde el siguiente inicio de sesión del usuario. |
| RNF-05 | La lista responde en menos de 2 segundos con hasta 100 usuarios y se pagina de 10 en 10. |
| RNF-06 | El servidor valida token y rol Administrador en cada endpoint del módulo (RNF-02) y las contraseñas se guardan con hash (RNF-01). |
| RNF-07 | La interfaz es adaptable a móvil (tarjetas en lugar de tabla) y operable con teclado (RNF-04). |
| RN-16 | Solo el Administrador puede cambiar su contraseña desde la barra superior; el personal pide el restablecimiento a la administradora (RN-02 y RN-13). |
| RN-17 | Cinco intentos consecutivos con la contraseña actual incorrecta cierran la sesión. |
| RN-18 | La nueva contraseña debe ser distinta de la actual. |
| RN-21 | Los cierres de sesión (con su motivo) y los cambios de contraseña se registran en auditoría. |
| RN-22 | Al cambiar la contraseña, los tokens anteriores del usuario quedan invalidados y se entrega uno nuevo. |
| RNF-10 | La contraseña nueva se guarda con hash (RNF-01) y el cambio responde en menos de 2 segundos. |


## 9. Catálogo de mensajes

Se reutilizan MSG-01 y 03 (usuario), MSG-12 (formato de correo), MSG-14 y 15 (contraseña) y MSG-09 (conexión) del CUS01. Los mensajes de cierre y de expiración de sesión (MSG-40 a 43 y 50) están en el Anexo A.

<!-- tabla 28 -->
| Código | Mensaje (texto al usuario) | Tipo | Ubicación |
|---|---|---|---|
| MSG-19 | Ingrese el nombre completo. | Error | Bajo el campo Nombre |
| MSG-20 | El nombre debe tener entre 3 y 60 caracteres y solo letras y espacios. | Error | Bajo el campo Nombre |
| MSG-21 | Ese usuario ya está registrado. Elija otro nombre de usuario. | Error | Bajo el campo Usuario |
| MSG-22 | Seleccione un rol. | Error | Bajo la lista Rol |
| MSG-23 | El correo es obligatorio para el administrador. | Error | Bajo el campo Correo |
| MSG-24 | Ese correo ya está asignado a otro usuario. | Error | Bajo el campo Correo |
| MSG-25 | Usuario registrado correctamente. | Éxito | Aviso temporal (4 s) |
| MSG-26 | Cambios guardados correctamente. | Éxito | Aviso temporal (4 s) |
| MSG-27 | ¿Desactivar a [nombre]? No podrá iniciar sesión, pero se conservará su historial. | Confirmación | Diálogo |
| MSG-28 | ¿Activar a [nombre]? Podrá iniciar sesión nuevamente. | Confirmación | Diálogo |
| MSG-29 | Usuario desactivado. | Éxito | Aviso temporal |
| MSG-30 | Usuario activado. | Éxito | Aviso temporal |
| MSG-31 | No puede desactivar ni eliminar su propia cuenta. | Error | Aviso sobre la lista |
| MSG-32 | Debe haber al menos un administrador activo. | Error | Aviso sobre la lista |
| MSG-33 | ¿Eliminar a [nombre]? Esta acción no se puede deshacer. | Confirmación | Diálogo |
| MSG-34 | No se puede eliminar: el usuario tiene movimientos registrados. Desactívelo para conservar su historial. | Error | Diálogo |
| MSG-35 | Usuario eliminado correctamente. | Éxito | Aviso temporal |
| MSG-36 | No se encontraron usuarios con ese criterio. Pruebe con otro nombre o quite los filtros. | Informativo | En la lista |
| MSG-37 | No se pudo cargar la lista de usuarios. Intente nuevamente. (botón Reintentar) | Error | En la lista |
| MSG-38 | No se pudo completar la operación. Intente nuevamente. | Error | Formulario o diálogo |
| MSG-39 | No tiene permiso para usar esta función. | Error | Pantalla de acceso denegado |
| MSG-44 | Ingrese su contraseña actual. | Error | Bajo Contraseña actual |
| MSG-45 | La contraseña actual no es correcta. Revise lo escrito e intente nuevamente. | Error | Bajo Contraseña actual |
| MSG-46 | La nueva contraseña debe ser distinta de la actual. | Error | Bajo Nueva contraseña |
| MSG-47 | Contraseña actualizada correctamente. | Éxito | Aviso temporal (4 s) |
| MSG-48 | Por seguridad se cerró su sesión tras varios intentos fallidos. Inicie sesión nuevamente. | Informativo | Pantalla de login |
| MSG-49 | No tiene permiso para cambiar la contraseña. Pida a la administradora que la restablezca. | Error | Aviso |


## 10. Diccionario de datos


<!-- tabla 29 -->
| Campo | Tipo | Obligatorio | Longitud / formato | Notas |
|---|---|---|---|---|
| Nombre completo | Texto | Sí | 3–60; letras, tildes y espacios | Se recorta |
| Usuario | Texto | Sí | 3–30; letras, números, . - _ | Único; no distingue mayúsculas |
| Correo | Texto | Solo Administrador | Formato de correo, máx. 100 | Único; sirve para RF-07 |
| Contraseña | Texto | Sí al registrar; opcional al editar | 8–64 | Hash; no se muestra después |
| Confirmar contraseña | Texto | Si hay contraseña | Igual a Contraseña | No se envía al servidor |
| Rol | Lista | Sí | Administrador, Cajero, Mozo, Cocinero | Rige desde el siguiente ingreso |
| Estado | Lista | Automático | Activo / Inactivo | Nuevo = Activo |
| Fecha de creación | Fecha y hora | Automático | — | No editable |
| Búsqueda | Texto | No | Máx. 50 | Nombre o usuario |
| Filtros Rol / Estado | Lista | No | Todos / valor | Combinables con la búsqueda |
| Contraseña actual | Texto | Sí | Sin límite de validación | Oculta; no se registra |
| Nueva contraseña | Texto | Sí | 8–64; distinta de la actual | Se guarda con hash |
| Confirmar nueva contraseña | Texto | Sí | Igual a Nueva contraseña | No se envía al servidor |


## 11. Contrato de API

Todos los endpoints de /api/usuarios exigen token JWT con rol Administrador: 401 sin token válido y 403 con otro rol. El endpoint de contraseña exige token vigente de un Administrador.

<!-- tabla 30 -->
| Endpoint | Entrada | Respuestas |
|---|---|---|
| GET /api/usuarios | busqueda, rol, estado, pagina, tamano (10) | 200: { items[{id, nombre, usuario, correo, rol, activo}], total }. |
| GET /api/usuarios/{id} | — | 200: datos del usuario (sin contraseña). 404: no existe. |
| POST /api/usuarios | { nombre, usuario, correo, contrasena, rol } | 201: usuario creado. 400: datos inválidos. 409: usuario o correo duplicado. |
| PUT /api/usuarios/{id} | { nombre, usuario, correo, rol, contrasena? } | 200: actualizado. 400: datos inválidos. 404: no existe. 409: duplicado o sin administrador activo. |
| PATCH /api/usuarios/{id}/estado | { activo } | 200: estado actualizado. 404: no existe. 409: propia cuenta o último administrador activo. |
| DELETE /api/usuarios/{id} | — | 204: eliminado. 404: no existe. 409: tiene movimientos, es su propia cuenta o último administrador. |
| PUT /api/perfil/contrasena | { contrasenaActual, nuevaContrasena } | 204: actualizada (se entrega token nuevo). 400: datos inválidos, nueva igual a la actual o actual incorrecta (con el campo afectado). 403: rol no permitido. 423: sesión cerrada por intentos fallidos. |


## 12. Escenarios de validación y criterios de aceptación


<!-- tabla 31 -->
| ID | Entrada / acción | Resultado esperado | Reglas | HU |
|---|---|---|---|---|
| E-16 | Entrar al módulo con usuarios registrados | Lista alfabética, 10 por página, con Nombre, Usuario, Rol, Estado y Acciones. | RN-07, RNF-05 | HU03 |
| E-17 | Buscar por un nombre existente | Se muestran solo las coincidencias, sin distinguir mayúsculas ni tildes. | RV-22 | HU03 |
| E-18 | Buscar algo que no existe | MSG-36 y "Quitar filtros". | RV-22 | HU03 |
| E-19 | Filtrar por rol y estado a la vez | La lista muestra solo los usuarios que cumplen ambos. | — | HU03 |
| E-20 | Registrar con datos válidos | MSG-25; usuario Activo en la lista y resaltado. | RN-09, RN-14 | HU02 |
| E-21 | Registrar con campos vacíos | Mensaje junto a cada campo; no se guarda; foco en el primero. | RV-11 a 18 | HU02 |
| E-22 | Registrar con un usuario ya existente | MSG-21 y el formulario sigue abierto. | RV-12, RN-08 | HU02 |
| E-23 | Contraseña corta o confirmación distinta | MSG-14 o MSG-15. | RV-13, 14 | HU02 |
| E-24 | Rol Administrador sin correo | MSG-23. | RV-16 | HU02 |
| E-25 | Editar nombre o rol con contraseña vacía | MSG-26; la contraseña no cambia. | RV-13 | HU04 |
| E-26 | Editar con nueva contraseña | MSG-26; el usuario ingresa con la nueva y no con la anterior. | RN-13, RN-14 | HU04 |
| E-27 | Editar a un usuario o correo ya existente | MSG-21 o MSG-24. | RV-12, 16 | HU04 |
| E-28 | Desactivar a un usuario | Confirmación MSG-27, luego MSG-29; el usuario ve MSG-05 al ingresar y pierde el acceso de inmediato. | RN-12 | HU05 |
| E-29 | Activar a un usuario inactivo | Confirmación MSG-28, luego MSG-30; puede ingresar. | RN-12 | HU05 |
| E-30 | Desactivar su propia cuenta | MSG-31; no se modifica. | RV-21, RN-10 | HU05 |
| E-31 | Desactivar o eliminar al único administrador activo | MSG-32; no se modifica. | RV-21, RN-10 | HU05, HU08 |
| E-32 | Eliminar a un usuario sin movimientos | Confirmación MSG-33; MSG-35 y desaparece de la lista. | RN-11 | HU08 |
| E-33 | Eliminar a un usuario con movimientos | MSG-34 y opción de desactivar. | RN-11 | HU08 |
| E-34 | Cancelar un formulario o confirmación (botón o Esc) | No hay cambios y el foco vuelve al botón de origen. | RV-20 | HU02, HU04, HU05 y HU08 |
| E-35 | Un mozo entra por URL a /usuarios | MSG-39 (403); la opción no aparece en su menú. | RN-07 | HU03 |
| E-36 | Falla del servidor al cargar o guardar | MSG-37 o MSG-38; se conservan los datos escritos. | RNF-06 | HU02 a HU05 y HU08 |
| E-37 | Solo teclado | Tab recorre controles y filas; el formulario atrapa el foco; Enter guarda; Esc cierra. | RNF-07 | HU02 a HU05 y HU08 |
| E-46 | Cambiar la contraseña con datos válidos | MSG-47; ingresa con la nueva y no con la anterior. | RN-21, 22 | HU06 |
| E-47 | Contraseña actual incorrecta | MSG-45; no cambia y se conservan los otros campos. | RV-30 | HU06 |
| E-48 | Campos vacíos | Mensaje junto a cada campo; foco en el primero. | RV-23, 24, 27 | HU06 |
| E-49 | Nueva contraseña corta o confirmación distinta | MSG-14 o MSG-15. | RV-24, 25 | HU06 |
| E-50 | Nueva contraseña igual a la actual | MSG-46. | RV-26, RN-18 | HU06 |
| E-51 | Cinco contraseñas actuales incorrectas seguidas | Se cierra la sesión con MSG-48. | RN-17 | HU06 |
| E-52 | Mozo, cajero o cocinero intenta cambiar la contraseña | No ve la opción; si llama al servicio, 403 y MSG-49. | RN-16 | HU06 |
| E-53 | Cancelar el cambio de contraseña | Se cierra sin cambios. | — | HU06 |


## 13. Matriz de justificación de usabilidad


<!-- tabla 32 -->
| Principio aplicado | Elemento de la interfaz | Decisión adoptada | Justificación |
|---|---|---|---|
| ISO 9241 – Eficacia | Mensajes y confirmaciones | Errores junto al campo; MSG-34 sugiere desactivar | La administradora completa cada tarea sin ayuda |
| ISO 9241 – Eficiencia | Búsqueda, filtros y acciones en la fila | Todo se hace sobre la misma pantalla; Enter guarda | Menos pasos y tiempo por tarea |
| ISO 9241 – Satisfacción | Insignias de estado y avisos de éxito | Estado con color y texto; avisos breves | Interacción clara y predecible |
| Nielsen 1 – Visibilidad del estado | Carga, guardado y resaltado | "Cargando…", "Guardando…" y fila resaltada | Siempre sabe qué ocurre y qué cambió |
| Nielsen 2 – Mundo real | Textos de acciones | "Desactivar" explica que se conserva el historial; "Eliminar" advierte que no se deshace | Lenguaje de la dueña, sin términos técnicos |
| Nielsen 3 – Control y libertad | Cancelar, Esc y Activar | Salir de cualquier formulario sin guardar; desactivar es reversible | Puede deshacer sin penalización |
| Nielsen 4 – Consistencia | Botones, colores y diálogos | Mismos componentes que el login y los demás módulos | Evita reaprendizaje |
| Nielsen 5 – Prevención de errores | Confirmaciones y reglas de protección | Confirmación con nombre; no permite autoeliminarse ni dejar el sistema sin administrador | Evita errores graves e irreversibles |
| Nielsen 6 – Reconocimiento | Lista con rol y estado visibles | Etiquetas visibles y datos en la fila; el diálogo nombra al usuario | No obliga a recordar |
| Nielsen 8 – Minimalismo | Tabla de 5 columnas | Solo los datos necesarios; formularios cortos | Sin distracciones |
| Nielsen 9 – Recuperarse de errores | Mensajes de error | Indican qué hacer (MSG-21, 34, 36, 37) | Facilita corregir |
| Shneiderman 1 – Consistencia | Estilo y acciones | Mismo patrón lista + ventana para todas las acciones | Comportamiento predecible |
| Shneiderman 2 – Usabilidad universal | Teclado, contraste y móvil | Foco atrapado en ventanas, contraste 4.5:1, tarjetas en móvil | Atiende distintos dispositivos y niveles |
| Shneiderman 3 – Retroalimentación | Avisos y estados | Respuesta a cada acción | Sabe qué pasó |
| Shneiderman 4 – Cierre | Avisos de éxito | La ventana se cierra y la lista muestra el resultado | Indica que la tarea terminó |
| Shneiderman 5 – Prevenir errores | Validación y protección | No guarda con errores; botón bloqueado al enviar | Evita duplicados e inválidos |
| Shneiderman 6 – Reversión | Cancelar y Activar | Cancelar sin cambios; reactivar un usuario | Acciones reversibles |
| Shneiderman 7 – Control del usuario | Todo el módulo | Cada acción la inicia la administradora; nada ocurre automáticamente | Mantiene el control |
| Shneiderman 8 – Memoria a corto plazo | Lista y confirmaciones | Datos visibles en pantalla; el diálogo repite el nombre | No debe recordar datos entre pasos |


## 14. Matriz de trazabilidad


### 14.1 Requerimiento → historia → caso de uso → vista → prueba


<!-- tabla 33 -->
| RF | HU | CUS | Vista | Reglas / mensajes | API | Escenarios |
|---|---|---|---|---|---|---|
| RF-03 Listar y buscar usuarios | HU03 | CUS02.1 | 2.1 | RV-22; RN-07; MSG-36, 37, 39 | GET /api/usuarios | E-16 a E-19, E-35, E-36 |
| RF-02 Registrar usuarios | HU02 | CUS02.2 | 2.2 | RV-11 a 19; RN-08, 09, 14; MSG-19 a 25, 38 | POST /api/usuarios | E-20 a E-24 |
| RF-04 Editar datos, rol y contraseña | HU04 | CUS02.3 | 2.3 | RV-11 a 19; RN-13, 14, 15; MSG-20 a 24, 26 | GET y PUT /api/usuarios/{id} | E-25 a E-27 |
| RF-05 Activar o desactivar | HU05 | CUS02.4 | 2.4 | RV-20, 21; RN-10, 12; MSG-27 a 32 | PATCH /api/usuarios/{id}/estado | E-28 a E-31 |
| RF-08 Eliminar usuarios | HU08 | CUS02.5 | 2.5 | RV-20, 21; RN-10, 11; MSG-31 a 35 | DELETE /api/usuarios/{id} | E-31 a E-33 |
| RF-06 Cambiar contraseña (Administrador) | HU06 | CUS02.6 | 2.6 | RV-23 a 30; RN-16 a 18, 21, 22; RNF-10; MSG-14, 15, 44 a 49 | PUT /api/perfil/contrasena | E-46 a E-53 |


### 14.2 Regla → elemento de interfaz → escenario


<!-- tabla 34 -->
| Regla | Elemento de interfaz | Escenario |
|---|---|---|
| RV-11 a 16 | Campos del formulario de registro y edición, con texto de error | E-21 a E-24, E-27 |
| RV-17 | Recorte automático al salir del campo y al guardar | E-20 |
| RV-18 / RV-19 | Texto de error por campo y botón GUARDAR en "Guardando…" | E-21, E-36 |
| RV-20 | Diálogo de confirmación con botón por defecto CANCELAR | E-28, E-32, E-34 |
| RV-21 / RN-10 | Avisos MSG-31 y MSG-32 en las acciones de la fila | E-30, E-31 |
| RV-22 | Campo Buscar con espera de 300 ms | E-17, E-18 |
| RN-07 | Opción USUARIOS visible solo para el Administrador; 403 en el servidor | E-35 |
| RN-11 | Mensaje MSG-34 al eliminar con movimientos | E-33 |
| RN-12 | Estado Activo/Inactivo en la fila; bloqueo de ingreso (MSG-05 del CUS01) | E-28, E-29 |
| RNF-07 | Orden de tabulación, foco en ventanas y vista móvil | E-37 |
| RV-23 a 26 | Campos Contraseña actual, Nueva y Confirmar, con texto de error | E-47 a E-50 |
| RV-27 / RV-28 | Texto de error por campo y botón en "Guardando…" | E-48 |
| RV-29 | Botón "Mostrar" en cada campo | E-46 |
| RN-16 | Opción "Cambiar contraseña" solo para el Administrador; 403 en el servidor | E-38, E-52 |
| RN-17 | Cierre de sesión con MSG-48 | E-51 |


## 15. Evaluación del prototipo y mejoras incorporadas


<!-- tabla 35 -->
| Hallazgo en el prototipo | Principio | Mejora incorporada |
|---|---|---|
| La lista solo ofrece "Editar"; faltan activar, desactivar y eliminar | Nielsen 6; RF-05 y RF-08 | Acciones en la fila: Editar, Activar/Desactivar y Eliminar |
| Eliminar y desactivar pueden confundirse | Nielsen 2 y 5 | Textos explicativos en las confirmaciones; Eliminar en rojo y separado |
| No hay confirmaciones ni protección de la propia cuenta | Nielsen 5; Shneiderman 5 | Diálogos con el nombre del usuario y reglas RV-21 |
| Sin estados de carga, vacío, error ni éxito | Nielsen 1 y 9; Shneiderman 3 y 4 | Estados de la sección 6 |
| El formulario de edición no permite cambiar rol ni contraseña (RF-04) | Trazabilidad | Campos Rol y Contraseña (opcional) en la Vista 2.3 |
| La vista móvil oculta columnas (Usuario y Acciones) | Shneiderman 2 | Tarjetas con todos los datos y acciones |
| Sin paginación | Nielsen 8; RNF-05 | Paginación de 10 en 10 |
| Estilo gris distinto al diseño final del login | Shneiderman 1; Nielsen 4 | Reutilizar los componentes y la paleta del login |
| Falta el boceto del cambio de contraseña | Trazabilidad | Vista 2.6 con tres campos, "Mostrar" y estados de error |


## 16. Dependencias con otros casos de uso


<!-- tabla 36 -->
| N.º | Punto | Decisión adoptada o tarea | CUS relacionado |
|---|---|---|---|
| 1 | Correo del usuario | Decisión: el correo se registra y edita en CUS02.2 y CUS02.3 (obligatorio para el Administrador); RF-02 y RF-04 lo incluyen. | CUS01.2, CUS02.2, CUS02.3 |
| 2 | HU03 incluye búsqueda y filtros por rol y estado. | Resuelto: RF-03 se redacta "listar usuarios con búsqueda y filtros por rol y estado". | CUS02.1 |
| 3 | Movimientos del usuario | La verificación de RN-11 depende de ventas, pedidos y caja; se implementa como un servicio que devuelve "sin movimientos" hasta que existan esas tablas. | CUS02.5 |
| 4 | Contraseña del personal | Solo la administradora cambia contraseñas (RN-13, RN-16); mozo, cajero y cocinero la piden a la administradora. Limitación aceptada. | CUS02.3, CUS02.6 |
| 5 | Sesión y barra superior | Cerrar sesión, expiración por inactividad y barra superior no son CUS ni RF: ver Anexo A (RN-19, RN-20, RNF-08, RNF-09). | Anexo A |
| 6 | Bocetos | Rediseñar en Figma las Vistas 2.1 a 2.6 con los estados de la sección 6 y el rol "Cocinero". | CUS02 |
| 7 | Rol Cajero | Es actor de CUS01.1; sus funciones se documentan en los CUS de pedidos, cobro y caja. | CUS de pedidos, cobro y caja |


# CUS03: Gestión de productos


## 1. Ficha del CUS general


<!-- tabla 37 -->
| Campo | Detalle |
|---|---|
| CUS general | CUS03: Gestión de productos |
| Interfaz (GUI) | Interfaz 3: Gestión de productos |
| Actor(es) | Administrador |
| HU / RF de origen | HU09 a HU12 y HU35 / RF-09 a RF-12 y RF-35 |
| Descripción | Módulo con el que el administrador mantiene la carta del restaurante Girasoles: registra, consulta, edita, activa y desactiva productos de carta (con categoría y precio) y componentes de menú (con rol y sin precio), y gestiona el precio y el estado de los menús completos (desayuno completo, almuerzo completo y solo segundo). |
| Alcance | Define la clasificación que consumen el Menú del día (CUS04), los pedidos (CUS06 y CUS07), la cocina (CUS09), las ventas (CUS11) y los reportes (CUS13). No incluye definir el menú del día ni armar pedidos. |


<!-- tabla 38 -->
| CUS | Título | HU | RF | Prioridad | Iteración | Complejidad |
|---|---|---|---|---|---|---|
| CUS03.1 | Registrar producto o componente | HU09 | RF-09 | Alta (Must) | 1/3 | Media |
| CUS03.2 | Listar y buscar productos | HU10 | RF-10 | Media (Should) | 2/3 | Baja |
| CUS03.3 | Editar producto | HU11 | RF-11 | Media (Should) | 2/3 | Baja |
| CUS03.4 | Activar o desactivar producto | HU12 | RF-12 | Media (Should) | 2/3 | Baja |
| CUS03.5 | Gestionar menús completos | HU35 | RF-35 | Media (Should) | 2/3 (precios iniciales en 1/3) | Baja |


## 2. Decisiones adoptadas


<!-- tabla 39 -->
| Tema | Decisión |
|---|---|
| Acceso al módulo | Solo el rol Administrador. Los demás roles no ven la opción PRODUCTOS y el servidor responde 403 si acceden por URL. Los demás roles solo consultan los productos disponibles desde el menú del día y los pedidos. |
| Datos del producto | Nombre, tipo (de carta o componente de menú), categoría (producto de carta) o rol (componente), precio (solo de carta) y estado. No incluye descripción ni imagen. |
| Categorías | Lista cerrada de seis categorías para los productos de carta, con valores estables: Desayuno (1), Almuerzo (2), Platos Extras / A la Carta (3), Combinados (4), Bebidas y Refrescos (5) y Otro (6). Los componentes no tienen categoría: tienen un rol (sección 10.2). |
| Nombre | 3 a 50 caracteres, único dentro de su tipo sin distinguir mayúsculas ni tildes: un producto de carta y un componente pueden llamarse igual (RN-139). |
| Precio | Precio final de venta al cliente de los productos de carta y de los menús completos, en soles (S/), mayor que 0, hasta 999.99 y con hasta 2 decimales. Se acepta punto o coma decimal y se normaliza. Los componentes no llevan precio. |
| Precio histórico | El pedido guarda el precio unitario al registrarse (del producto o del menú completo). Cambiar el precio solo afecta a los pedidos nuevos. |
| Eliminación | No existe eliminar producto; solo desactivar, para conservar el historial. |
| Producto inactivo | Un producto, componente o menú completo inactivo no aparece al definir el menú del día ni al registrar pedidos. Si está en el menú vigente, se advierte y se retira al confirmar. Los pedidos ya registrados lo conservan. |
| Productos y componentes | Los platos, bebidas y adicionales que se venden solos son productos de carta (con precio y categoría). Las opciones que forman parte de un menú completo (quaker, quinua, soya, anís, seco de pollo, asado de pollo, sopas, entradas y segundos) son componentes: no tienen precio y solo se piden dentro de un menú completo. |
| Caldo de gallina | Se maneja como dos productos distintos por nombre y categoría: "Caldo de gallina (Entrada)" y "Caldo de gallina criollo (Plato fuerte)". |
| Listado | Orden por tipo, luego por categoría o rol y luego por nombre; 10 por página; columnas Producto, Tipo, Categoría o rol, Precio, Estado y Acciones. |
| Búsqueda y filtros | Búsqueda por nombre (máx. 50 caracteres, sin distinguir mayúsculas ni tildes) y filtros combinables por tipo, categoría o rol y estado. |
| Presentación de la categoría | Insignia de tamaño normativo (w-28 h-7 text-xs font-semibold) con un color propio por categoría. Los componentes muestran una insignia gris con la palabra «Componente» y su rol. |
| Tipo de producto | Todo producto es «De carta» (con categoría y precio, se vende solo) o «Componente de menú» (con rol y sin precio, solo se usa dentro de un menú completo). Por defecto, «De carta». Se elige en el mismo formulario de Productos; no hay un módulo aparte. |
| Roles de componente | Bebida de desayuno, Plato de desayuno, Sopa, Entrada y Segundo. |
| Menús completos | Tres, cargados al inicio: Desayuno completo (S/ 7.00), Almuerzo completo (S/ 8.00) y Solo segundo (S/ 7.00). Cada uno cobra su precio fijo y se arma eligiendo una opción por parte entre las del día. La estructura de partes es fija; la administradora edita el precio y el estado (CUS03.5). |
| Cambio de tipo | No se puede cambiar el tipo de un producto que ya tiene pedidos: se desactiva y se crea otro. |
| Migración | Los productos actuales pasan a «De carta» y los pedidos y ventas existentes no cambian. El producto «Menú almuerzo» (S/ 8.00) se desactiva y lo reemplaza el Almuerzo completo. |
| Auditoría | Se registra quién, cuándo y qué cambió al registrar, editar (con precio anterior y nuevo) y activar o desactivar productos, componentes y menús completos. |


## 3. Análisis del usuario (Diseño Centrado en el Usuario)


<!-- tabla 40 -->
| Aspecto | Descripción |
|---|---|
| Quién usa la interfaz | La administradora (dueña), con experiencia tecnológica básica, desde la computadora del local o su celular. |
| Necesidades | Mantener la carta completa (desayunos, almuerzos, platos a la carta, combinados, bebidas y adicionales) con su precio; registrar las opciones de los menús (quaker, quinua, soya, anís, sopas, entradas y segundos) sin ponerles precio; cambiar el precio del desayuno y del almuerzo completos en un solo lugar; corregir un precio cuando suba el mercado; retirar un producto que ya no se vende sin perder las ventas pasadas; ubicar rápido un producto por categoría. |
| Dificultades previsibles | Digitar mal un precio (8.00 por 80); duplicar un producto; confundir desactivar con eliminar; no saber si un cambio de precio afecta lo ya vendido; desactivar un producto que está en el menú de hoy; elegir una categoría equivocada entre seis opciones; confundir un componente (sin precio) con un producto de carta; no entender por qué un componente no se puede pedir solo. |
| Contexto de uso | Tareas poco frecuentes, antes de abrir el local o fuera de la hora de atención. |


## 4. Plantillas de casos de uso


### CUS03.1: Registrar producto o componente


<!-- tabla 41 -->
| Código: CUS03.1 | Título: Registrar producto o componente (Vista 3.2) | Fecha: 19.10.2026 | Iteración: 1/3 |
|---|---|---|---|
| Actor(es): Administrador |  |  |  |
| Prioridad: Alta (Must) | Complejidad: Media |  |  |
| Historia de usuario: HU09 Registrar productos (M) |  |  |  |
| Requerimiento de origen: RF-09 |  |  |  |
| Descripción: Permite al administrador registrar un producto de carta (con nombre, categoría y precio) o un componente de menú (con nombre y rol, sin precio), para incluirlos en el menú del día, tomar pedidos, armar menús completos y calcular cobros. |  |  |  |
| Precondición: El administrador tiene sesión iniciada y accede desde la opción PRODUCTOS (Carta y menú). Existe conexión con el servidor. |  |  |  |
| Flujo principal:<br>1. El administrador accede a PRODUCTOS y el sistema muestra la lista de productos (Vista 3.1).<br>2. Pulsa NUEVO PRODUCTO; el sistema abre el formulario con el foco en Nombre.<br>3. Escribe el nombre y elige el tipo: «Producto de carta (se vende solo, con precio)» o «Componente de menú (sin precio)».<br>4. Si es de carta, elige la categoría entre las seis opciones (cada una con su subtítulo descriptivo) e ingresa el precio; por ejemplo: "Lomo saltado", Platos Extras / A la Carta, 25.00.<br>5. Si es componente, elige el rol (Bebida de desayuno, Plato de desayuno, Sopa, Entrada o Segundo) y el sistema oculta la categoría y el precio; por ejemplo: "Quinua", Bebida de desayuno.<br>6. Pulsa GUARDAR o presiona Enter; el sistema recorta los espacios del nombre, valida los datos (RV-33 a RV-38 y RV-155 a RV-157) y deshabilita el botón (RV-39).<br>7. El servidor repite la validación, interpreta la categoría (RV-43), verifica que el nombre no esté repetido dentro de su tipo, registra el producto con estado Activo y anota la operación en auditoría.<br>8. El sistema cierra el formulario, muestra MSG-57 y actualiza la lista resaltando el registro. |  |  |  |
| Flujo alterno:<br>Nombre repetido dentro del mismo tipo (sin distinguir mayúsculas ni tildes): MSG-53; el formulario permanece abierto con los datos escritos. El mismo nombre en el otro tipo se permite.<br>Tipo sin elegir: MSG-213. Componente sin rol: MSG-214.<br>Campos obligatorios vacíos en un producto de carta: MSG-51, MSG-54 o MSG-55 junto al campo correspondiente; el foco pasa al primero con error.<br>Precio enviado en un componente (solicitud directa a la API): 400 indicando el campo "precio" (MSG-215); no se guarda.<br>Categoría ajena a las seis definidas (solicitud directa a la API): respuesta 400 indicando el campo "categoria" (MSG-54); no se guarda.<br>Precio cero, negativo, no numérico, con más de 2 decimales o mayor que 999.99: MSG-56.<br>Precio con coma decimal (8,50): el sistema lo normaliza a 8.50 y continúa.<br>Cancelar (botón o Esc): regresa a la lista sin guardar y el foco vuelve a NUEVO PRODUCTO. |  |  |  |
| Postcondición: El producto o componente queda registrado y activo. Un producto de carta queda asignado a una de las seis categorías y puede usarse en el menú del día y en los pedidos de mesa y para llevar (CUS04, CUS06 y CUS07); un componente queda disponible como opción de su rol para el menú del día y el armado de menús completos. |  |  |  |
| Excepciones:<br>Falla al guardar: MSG-38; no se crea el registro, lo escrito se conserva y se registra el incidente.<br>Pérdida de conexión: MSG-09. |  |  |  |
| Reglas y mensajes aplicables: RV-33 a RV-39, RV-43 y RV-155 a RV-157; RN-23 a RN-25, RN-29 a RN-31, RN-130, RN-131 y RN-139; RNF-12 y RNF-13; MSG-51 a MSG-57, MSG-213 a MSG-215, MSG-38 y MSG-09. |  |  |  |
| Componentes de implementación:<br>Interfaz: ProductFormModal.tsx; types/producto.ts.<br>Aplicación: ProductoDTOs.cs (CrearProductoRequest.Validate); ProductoService.RegistrarProductoAsync.<br>Dominio: CategoriaProducto.cs (CategoriaProducto y CategoriaProductoExtensions).<br>Pruebas: ProductoServiceUnitTests.cs.<br>Por implementar (ajuste): TipoProducto.cs y RolComponente.cs (Dominio); validación de tipo y rol en CrearProductoRequest.Validate; selector de tipo y de rol en ProductFormModal.tsx; migración con las columnas tipo y rol y precio opcional. |  |  |  |


### CUS03.2: Listar y buscar productos


<!-- tabla 42 -->
| Código: CUS03.2 | Título: Listar y buscar productos (Vista 3.1) | Fecha: 19.10.2026 | Iteración: 2/3 |
|---|---|---|---|
| Actor(es): Administrador |  |  |  |
| Prioridad: Media (Should) | Complejidad: Baja |  |  |
| Historia de usuario: HU10 Listar y buscar productos (S) |  |  |  |
| Requerimiento de origen: RF-10 |  |  |  |
| Descripción: Permite al administrador visualizar los productos y componentes con su nombre, tipo, categoría o rol (insignia), precio y estado, y buscarlos o filtrarlos por nombre, tipo, categoría o rol y estado. |  |  |  |
| Precondición: El administrador tiene sesión iniciada y accede desde la opción PRODUCTOS. |  |  |  |
| Flujo principal:<br>1. El administrador accede a PRODUCTOS; el sistema muestra "Cargando productos…".<br>2. El sistema muestra la lista ordenada por tipo, luego por categoría o rol y luego por nombre, con las columnas Producto, Tipo, Categoría o rol, Precio, Estado y Acciones, de 10 en 10; en los componentes el precio se muestra como «—».<br>3. Opcionalmente escribe en Buscar o elige filtros: tipo (Todos, De carta o Componente), categoría (productos de carta) o rol (componentes) y estado.<br>4. El sistema actualiza la lista tras 300 ms y conserva los criterios al cambiar de página. El servidor acepta la categoría en formato numérico o textual (por ejemplo, ?categoria=Combinados). |  |  |  |
| Flujo alterno:<br>Sin coincidencias: MSG-66 y opción "Quitar filtros".<br>No hay productos registrados: MSG-65 con el botón NUEVO PRODUCTO.<br>Usuario sin rol Administrador que ingresa por URL: MSG-39 (403). |  |  |  |
| Postcondición: La lista queda visible y refleja los criterios aplicados; cada fila muestra la insignia de su categoría (producto de carta) o la insignia gris «Componente» con su rol. |  |  |  |
| Excepciones:<br>Falla al obtener los datos: MSG-67 con botón Reintentar; los filtros se conservan y se registra el incidente. |  |  |  |
| Reglas y mensajes aplicables: RV-40, RV-43 y RV-155; RN-23, RN-31, RN-33 y RN-130; RNF-11 a RNF-13; MSG-65 a MSG-67 y MSG-39. |  |  |  |
| Componentes de implementación:<br>Interfaz: ProductsPage.tsx; types/producto.ts (CATEGORIAS_PRODUCTO, CATEGORIA_LABELS, CATEGORIA_BADGE_LABELS).<br>Aplicación: ProductoService.ListarProductosAsync.<br>Evidencia: Vista 3.1, Figuras 1 a 6.<br>Por implementar (ajuste): filtros de tipo y rol en ProductsPage.tsx; parámetros tipo y rol en ProductoService.ListarProductosAsync. |  |  |  |


### CUS03.3: Editar producto


<!-- tabla 43 -->
| Código: CUS03.3 | Título: Editar producto (Vista 3.3) | Fecha: 19.10.2026 | Iteración: 2/3 |
|---|---|---|---|
| Actor(es): Administrador |  |  |  |
| Prioridad: Media (Should) | Complejidad: Baja |  |  |
| Historia de usuario: HU11 Editar producto (S) |  |  |  |
| Requerimiento de origen: RF-11 |  |  |  |
| Descripción: Permite al administrador modificar el nombre, la categoría y el precio de un producto de carta, o el nombre y el rol de un componente, para mantener actualizada la carta y los menús. |  |  |  |
| Precondición: El administrador tiene sesión iniciada. El producto existe. |  |  |  |
| Flujo principal:<br>1. El administrador pulsa EDITAR en la fila del producto o componente.<br>2. El sistema abre el formulario con los datos actuales y el foco en Nombre.<br>3. Modifica nombre y categoría o precio (producto de carta), o nombre y rol (componente); si cambia el precio, el sistema muestra MSG-59.<br>4. Pulsa GUARDAR CAMBIOS; el sistema valida (RV-33 a RV-38 y RV-155 a RV-158).<br>5. El servidor interpreta la categoría (RV-43), verifica que el nombre no pertenezca a otro registro del mismo tipo, actualiza y anota en auditoría el valor anterior y el nuevo.<br>6. El sistema cierra el formulario, muestra MSG-58 y actualiza la fila. |  |  |  |
| Flujo alterno:<br>Nombre que ya pertenece a otro registro del mismo tipo: MSG-53.<br>Campos vacíos o precio no válido: MSG-51, 52, 54, 55 o 56 junto al campo.<br>Intento de cambiar el tipo de un producto con pedidos registrados: MSG-216; se debe desactivar y crear otro.<br>Se cambia el rol de un componente que está en el menú de hoy: se retira de ese menú y debe volver a seleccionarse en su nueva sección.<br>Cancelar (botón o Esc): se descartan los cambios.<br>El registro ya no existe: MSG-38 y se actualiza la lista. |  |  |  |
| Postcondición: Los datos quedan actualizados. El nuevo precio se aplica solo a los pedidos futuros; los pedidos y ventas ya registrados conservan su precio y los nombres de las opciones con que se registraron (RN-141). El cambio de categoría se refleja en la lista, en la sección correspondiente del menú del día (CUS04) y en los reportes (CUS13). |  |  |  |
| Excepciones:<br>Falla al actualizar: MSG-38; se conservan los datos anteriores y se registra el incidente.<br>Pérdida de conexión: MSG-09. |  |  |  |
| Reglas y mensajes aplicables: RV-33 a RV-39, RV-42, RV-43 y RV-155 a RV-158; RN-23 a RN-26, RN-30 a RN-32 y RN-141; MSG-51 a MSG-59, MSG-216 y MSG-38. |  |  |  |
| Componentes de implementación:<br>Interfaz: ProductFormModal.tsx.<br>Aplicación: ProductoDTOs.cs (ActualizarProductoRequest.Validate); ProductoService.ActualizarProductoAsync.<br>Pruebas: ProductoServiceUnitTests.cs. |  |  |  |


### CUS03.4: Activar o desactivar producto


<!-- tabla 44 -->
| Código: CUS03.4 | Título: Activar o desactivar producto (Vista 3.4) | Fecha: 19.10.2026 | Iteración: 2/3 |
|---|---|---|---|
| Actor(es): Administrador |  |  |  |
| Prioridad: Media (Should) | Complejidad: Baja |  |  |
| Historia de usuario: HU12 Activar o desactivar productos (S) |  |  |  |
| Requerimiento de origen: RF-12 |  |  |  |
| Descripción: Permite al administrador retirar de la carta un producto o componente que ya no se usa, o volver a habilitarlo, sin perder su historial de ventas. |  |  |  |
| Precondición: El administrador tiene sesión iniciada. El producto existe. |  |  |  |
| Flujo principal:<br>1. El administrador pulsa DESACTIVAR (o ACTIVAR) en la fila del producto.<br>2. El sistema muestra la confirmación MSG-60 (o MSG-61) con el nombre del producto y el foco en CANCELAR.<br>3. El administrador confirma.<br>4. El servidor cambia el estado y lo anota en auditoría.<br>5. El sistema muestra MSG-63 (o MSG-64) y refleja el estado en la lista. |  |  |  |
| Flujo alterno:<br>Cancelar (botón o Esc): el estado no cambia.<br>El producto o componente forma parte del menú del día vigente: el diálogo agrega MSG-62 y, al confirmar, el servidor lo retira de ese menú.<br>Se retira un componente que era la única opción de una parte de un menú completo habilitado hoy: ese menú queda como «No disponible hoy» (CUS04).<br>El registro ya no existe: MSG-38 y se actualiza la lista. |  |  |  |
| Postcondición: El producto o componente queda activo o inactivo. Un registro inactivo no aparece al definir el menú del día ni al registrar pedidos o armar menús completos, y su historial se conserva. |  |  |  |
| Excepciones:<br>Falla al cambiar el estado: MSG-38; el estado anterior se conserva y se registra el incidente.<br>Pérdida de conexión: MSG-09. |  |  |  |
| Reglas y mensajes aplicables: RV-41; RN-23, RN-27, RN-28, RN-30 y RN-134; MSG-60 a MSG-64 y MSG-38. |  |  |  |
| Componentes de implementación:<br>Interfaz: ProductsPage.tsx (botón de estado y diálogo de confirmación).<br>API: PATCH /api/productos/{id}/estado (ProductoService). |  |  |  |


### CUS03.5: Gestionar menús completos


<!-- tabla 45 -->
| Código: CUS03.5 | Título: Gestionar menús completos (Vista 3.5) | Fecha: 19.10.2026 | Iteración: 2/3 (los precios iniciales se cargan en 1/3) |
|---|---|---|---|
| Actor(es): Administrador |  |  |  |
| Prioridad: Media (Should) | Complejidad: Baja |  |  |
| Historia de usuario: HU35 Gestionar menús completos (S) |  |  |  |
| Requerimiento de origen: RF-35 |  |  |  |
| Descripción: Permite al administrador consultar los tres menús completos (desayuno completo, almuerzo completo y solo segundo) y editar su precio y su estado, sin modificar su estructura, para actualizar lo que cobra por el desayuno y el almuerzo sin tocar cada plato. |  |  |  |
| Precondición: El administrador tiene sesión iniciada y accede a la pestaña «Menús completos» de PRODUCTOS. Existe conexión con el servidor. |  |  |  |
| Flujo principal:<br>1. El administrador abre la pestaña «Menús completos»; el sistema muestra una tarjeta por menú con nombre, precio, partes, lo que incluye y estado.<br>2. Pulsa EDITAR PRECIO en un menú; el sistema abre el campo de precio con el valor actual y la ayuda MSG-59.<br>3. Ingresa el nuevo precio y pulsa GUARDAR; el sistema valida (RV-160) y deshabilita el botón (RV-39).<br>4. El servidor actualiza el precio y anota en auditoría el valor anterior y el nuevo.<br>5. El sistema muestra MSG-217 y la tarjeta actualizada.<br>6. Para retirar un menú, pulsa DESACTIVAR; el sistema muestra MSG-218 con el foco en CANCELAR, el administrador confirma y el menú deja de aparecer en el menú del día y en el armado de pedidos. |  |  |  |
| Flujo alterno:<br>Precio vacío, cero, mayor que 999.99 o con más de 2 decimales: MSG-55 o MSG-56.<br>Se desactiva un menú habilitado hoy: el diálogo lo advierte y, al confirmar, se retira del menú de hoy.<br>Cancelar (botón o Esc): no hay cambios.<br>Un usuario sin rol Administrador intenta editar por URL o servicio: MSG-39 (403). |  |  |  |
| Postcondición: El menú completo queda con su precio o estado actualizado. Los pedidos ya registrados conservan el precio anterior (RN-140); los nuevos usan el precio vigente. |  |  |  |
| Excepciones:<br>Falla al guardar: MSG-38; se conserva el precio anterior y se registra el incidente.<br>Pérdida de conexión: MSG-09. |  |  |  |
| Reglas y mensajes aplicables: RV-39 y RV-160; RN-30, RN-132, RN-133, RN-134 y RN-140; RNF-61; MSG-55, MSG-56, MSG-59, MSG-217, MSG-218, MSG-38 y MSG-39. |  |  |  |
| Componentes de implementación:<br>Por implementar: MenuCompleto.cs y MenuCompletoParte.cs (Dominio); MenusCompletosService.cs (Aplicación).<br>API: GET /api/menus-completos; PUT /api/menus-completos/{id}; PATCH /api/menus-completos/{id}/estado.<br>Interfaz: pestaña «Menús completos» de ProductsPage.tsx y MenuCompletoCard.tsx.<br>Datos iniciales: DatabaseSeeder.cs (tres menús con sus precios). |  |  |  |


## 5. Interfaz (GUI)


<!-- tabla 46 -->
| Interfaz | RF | HU | CUS | Qué se hace dentro de la interfaz |
|---|---|---|---|---|
| 3. Gestión de productos | RF-09 a RF-12 y RF-35 | HU09 a HU12 y HU35 | CUS03 (03.1 a 03.5) | Listar y buscar (pantalla base), registrar producto o componente, editar, activar o desactivar y gestionar los menús completos en la pestaña "Menús completos". |


### Vista 3.1: Lista de productos y componentes, pantalla base (CUS03.2) — restaurante.app/productos

Evidencia de la lista en ejecución, con los filtros por categoría (versión previa al ajuste de componentes y menús completos, que agrega la columna Tipo y el filtro por tipo y rol).
Figura 1. Lista de productos, filtro "Todas las categorías".
Figura 2. Filtro Desayuno: 15 productos, página 1 de 2.
Figura 3. Filtro Almuerzo: 9 productos (8 activos tras desactivar "Menú almuerzo").
Figura 4. Filtro Platos Extras / A la Carta: 11 productos, página 1 de 2.
Figura 5. Filtro Combinados: 3 productos.
Figura 6. Filtro Otro: 3 productos.

<!-- tabla 47 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Menú "Productos" | Opción del menú lateral (Carta y menú), visible solo para el Administrador. |
| 2 | Botón "Nuevo producto" | Abre el formulario de registro (CUS03.1). |
| 3 | Búsqueda y filtros | Buscador por nombre (máx. 50 caracteres) y filtros combinables por tipo, categoría o rol y estado. |
| 4 | Tabla de productos | Producto, tipo, categoría o rol (insignia de color o insignia gris «Componente»), precio («—» en componentes), estado y acciones EDITAR y ACTIVAR / DESACTIVAR; en móvil, tarjetas. |
| 5 | Paginación | De 10 en 10; conserva los criterios. |


### Vista 3.2: Registrar producto o componente (CUS03.1) — restaurante.app/productos/nuevo


<!-- tabla 48 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 49 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Nombre | Campo de texto de 3 a 50 caracteres; muestra MSG-51, MSG-52 o MSG-53. |
| 2 | Tipo | Selector: «Producto de carta (se vende solo, con precio)» o «Componente de menú (sin precio)»; muestra MSG-213. |
| 3 | Categoría (de carta) | Lista de seis categorías con subtítulo descriptivo; muestra MSG-54. |
| 4 | Precio de venta (de carta) | Campo decimal en S/ con teclado numérico; muestra MSG-55 o MSG-56. |
| 5 | Rol (componente) | Aparece al elegir «Componente»: Bebida de desayuno, Plato de desayuno, Sopa, Entrada o Segundo; oculta categoría y precio; ayuda MSG-215; muestra MSG-214. |
| 6 | Botón GUARDAR | Valida y registra; muestra "Guardando…". |
| 7 | Botón Cancelar | Cierra el formulario sin guardar. |


### Vista 3.3: Editar producto o componente (CUS03.3) — restaurante.app/productos/editar


<!-- tabla 50 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 51 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Título | Encabezado "Editar producto". |
| 2 | Nombre, categoría o rol, precio | Campos con los datos actuales; si cambia el precio, aparece MSG-59. |
| 3 | Tipo | No se puede cambiar si el producto ya tiene pedidos (MSG-216). |
| 4 | Botón GUARDAR CAMBIOS | Valida y actualiza; muestra MSG-58. |
| 5 | Botón Cancelar | Descarta los cambios. |


### Vista 3.4: Activar o desactivar producto (CUS03.4) — restaurante.app/productos


<!-- tabla 52 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 53 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Acción en la fila | "Desactivar" (activo) o "Activar" (inactivo). |
| 2 | Diálogo de confirmación | MSG-60 o MSG-61 con el nombre del producto; agrega MSG-62 si está en el menú de hoy. |
| 3 | Botón Confirmar | Aplica el cambio de estado. |
| 4 | Botón Cancelar | Cierra el diálogo sin cambios; es el botón por defecto. |


### Vista 3.5: Menús completos (CUS03.5) — restaurante.app/productos (pestaña "Menús completos")

Vista pendiente de diseñar; los elementos descritos son la propuesta para su elaboración.

<!-- tabla 54 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 55 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Pestaña "Menús completos" | Junto a la lista de productos; una tarjeta por menú. |
| 2 | Tarjeta de menú completo | Nombre, precio, partes que se eligen, lo que incluye y estado. |
| 3 | Botón EDITAR PRECIO | Abre el campo de precio con el valor actual y la ayuda MSG-59. |
| 4 | Botones GUARDAR y CANCELAR | Validan el precio (RV-160) y confirman con MSG-217. |
| 5 | Botón ACTIVAR / DESACTIVAR | Pide confirmación MSG-218 con el foco en CANCELAR. |


## 6. Estados de la interfaz


<!-- tabla 56 -->
| Estado | Comportamiento visual |
|---|---|
| Cargando lista | "Cargando productos…" con marcadores de posición; botones de acción deshabilitados. |
| Lista con datos | Tabla con precio alineado a la derecha (S/ 8.00; «—» en los componentes), columna Tipo, insignia de categoría con color propio o insignia gris «Componente» con su rol, insignia de estado con texto (Activo / Inactivo) y paginación de 10 en 10. |
| Sin productos | MSG-65 y botón NUEVO PRODUCTO. |
| Sin resultados | MSG-66 y botón "Quitar filtros". |
| Error de carga | MSG-67 con botón Reintentar; los filtros se conservan. |
| Formulario abierto | Ventana sobre la lista; foco en Nombre; selector de tipo; en productos de carta, selector de categoría con las seis opciones y sus subtítulos y campo de precio; Esc o CANCELAR cierran y el foco regresa al botón de origen; Enter guarda. |
| Formulario de componente | Al elegir «Componente de menú», se ocultan la categoría y el precio y aparece el selector de rol, con MSG-215 como ayuda. |
| Guardando | Botón "Guardando…" deshabilitado (RV-39). |
| Éxito | Aviso temporal (MSG-57, 58, 63, 64) y fila afectada resaltada unos segundos. |
| Confirmación | Diálogo que nombra el producto; botón por defecto CANCELAR; si está en el menú de hoy, muestra además MSG-62. |
| Móvil | Cada producto como tarjeta con nombre, categoría, precio, estado y acciones; controles de al menos 44 px. |
| Pestaña Menús completos | Tres tarjetas con nombre, precio, partes, lo que incluye, estado y los botones EDITAR PRECIO y ACTIVAR / DESACTIVAR. |
| Editando el precio del menú | Campo de precio con el valor actual, MSG-59 como ayuda y los botones CANCELAR y GUARDAR. |


## 7. Reglas de validación (RV)


<!-- tabla 57 -->
| Código | Regla | Elemento UI | Mensaje |
|---|---|---|---|
| RV-33 | El nombre es obligatorio: 3 a 50 caracteres (letras, números, espacios, tildes y . , - ( )). | Campo Nombre | MSG-51, 52 |
| RV-34 | El nombre es único dentro de su tipo, sin distinguir mayúsculas ni tildes (véase RV-157). | Campo Nombre | MSG-53 |
| RV-35 | La categoría de un producto de carta es obligatoria y se elige de la lista cerrada de seis categorías: Desayuno, Almuerzo, Platos Extras / A la Carta, Combinados, Bebidas y Refrescos y Otro. | Lista Categoría | MSG-54 |
| RV-36 | El precio de un producto de carta es obligatorio, mayor que 0, hasta 999.99 y con hasta 2 decimales; acepta punto o coma. | Campo Precio | MSG-55, 56 |
| RV-37 | Se eliminan los espacios al inicio y al final del nombre antes de validar. | Campo Nombre | — |
| RV-38 | Los errores se muestran junto al campo y dicen qué corregir; no se guarda con errores y el foco va al primer campo con error. | Texto de error / GUARDAR | MSG-51 a 56 |
| RV-39 | Mientras se guarda, el botón queda deshabilitado con "Guardando…". | Botón GUARDAR | — |
| RV-40 | La búsqueda admite hasta 50 caracteres y se aplica tras 300 ms. | Campo Buscar | MSG-66 |
| RV-41 | Activar y desactivar piden confirmación que nombra el producto; el botón por defecto es CANCELAR. | Diálogo de confirmación | MSG-60, 61 |
| RV-42 | Si el precio cambia en la edición, el formulario informa que solo se aplicará a los pedidos nuevos. | Texto bajo el precio | MSG-59 |
| RV-43 | El servidor interpreta la categoría de un producto de carta de forma flexible: acepta el valor numérico (1 a 6), la clave del enum o la etiqueta textual, sin distinguir mayúsculas ni acentos. Cualquier otro valor se rechaza con 400. | API / Validate() de los DTO | MSG-54 |
| RV-155 | El tipo del producto es obligatorio: «De carta» o «Componente de menú»; por defecto «De carta». | Selector de tipo | MSG-213 |
| RV-156 | Un producto de carta exige categoría y precio (RV-35 y RV-36); un componente exige rol y no lleva precio. | Formulario de producto | MSG-214, 215 |
| RV-157 | El nombre es único dentro de su tipo: un producto de carta y un componente pueden llamarse igual (amplía RV-34). | Campo Nombre | MSG-53 |
| RV-158 | No se puede cambiar el tipo de un producto que ya tiene pedidos registrados. | Selector de tipo (edición) | MSG-216 |
| RV-160 | El precio de un menú completo es obligatorio, mayor que 0, hasta 999.99 y con hasta 2 decimales; solo se editan su precio y su estado. | Campo Precio del menú | MSG-55, 56 |


## 8. Reglas de negocio y requerimientos no funcionales


<!-- tabla 58 -->
| Código | Regla |
|---|---|
| RN-23 | Solo el Administrador accede a la gestión de productos. |
| RN-24 | El nombre de un producto es único dentro de su tipo (RN-139). |
| RN-25 | El precio de un producto de carta o de un menú completo es el precio final de venta, en soles, mayor que 0 y con hasta 2 decimales. Los componentes no tienen precio. |
| RN-26 | El nuevo precio se aplica solo a los pedidos futuros; los pedidos y ventas ya registrados conservan el precio con que se registraron. |
| RN-27 | Los productos no se eliminan; solo se desactivan, para conservar el historial. |
| RN-28 | Un producto, componente o menú completo inactivo no aparece al definir el menú del día ni al registrar pedidos o armar menús completos; si está en el menú vigente, se retira al desactivarlo. |
| RN-29 | Todo producto nuevo se registra con estado Activo. |
| RN-30 | Registrar, editar (con precio anterior y nuevo) y activar o desactivar productos se registra en auditoría. |
| RN-31 | Todo producto de carta pertenece a una y solo una de las seis categorías: Desayuno = 1, Almuerzo = 2, Platos Extras = 3, Combinados = 4, Bebidas = 5, Otro = 6. Los valores numéricos son estables y no se reutilizan ni se reordenan. |
| RN-32 | La categoría de un producto puede cambiarse sin afectar el historial: los detalles de pedido, las comandas y los menús del día ya registrados mantienen su integridad referencial con el producto. |
| RN-33 | El caldo de gallina se maneja como dos productos independientes: "Caldo de gallina (Entrada)" a S/ 5.00 en Almuerzo y "Caldo de gallina criollo (Plato fuerte)" a S/ 10.00 en Platos Extras / A la Carta. |
| RN-34 | Los reportes de ventas por categoría consolidan siempre las seis categorías vigentes; además cuentan por separado los menús completos vendidos y las veces que se eligió cada componente (CUS13). |
| RN-35 | Solo los productos, componentes y menús completos activos pueden formar parte del menú del día, y los pedidos de mesa y para llevar solo ofrecen lo que esté en el menú vigente y no esté agotado; si no hay menú del día definido, se ofrece todo lo activo (RN-142). En el menú del día, los productos de carta se agrupan según su categoría (todas de selección múltiple), los componentes por rol y los menús completos se habilitan con un interruptor. |
| RN-130 | Todo producto es «De carta» (con precio, se vende solo) o «Componente» (sin precio, solo se usa dentro de un menú completo). |
| RN-131 | Los roles de componente son: Bebida de desayuno, Plato de desayuno, Sopa, Entrada y Segundo. |
| RN-132 | Existen tres menús completos con estructura fija: Desayuno completo (bebida y plato; incluye pan), Almuerzo completo (sopa o entrada, y segundo; incluye refresco del día) y Solo segundo (segundo). La administradora edita su precio y su estado. |
| RN-133 | El precio de una línea de menú completo es el precio vigente del menú al agregarse (RN-51); las opciones no suman ni restan. |
| RN-134 | Los componentes y los menús completos inactivos no aparecen en el menú del día ni en el armado; los pedidos ya registrados los conservan (RN-27, RN-28). |
| RN-139 | Un producto de carta y un componente con el mismo nombre son productos distintos. |
| RN-140 | El nuevo precio de un menú completo solo aplica a los pedidos nuevos (RN-26). |
| RN-141 | Las opciones elegidas se guardan con su nombre en la línea del pedido; editar o desactivar el componente después no cambia el historial. |
| RNF-11 | La lista responde en menos de 2 segundos con hasta 200 productos y se pagina de 10 en 10. |
| RNF-12 | El servidor valida token y rol Administrador en cada endpoint de administración de productos (RNF-02); la validación de nombre, precio y categoría se repite en el servidor. |
| RNF-13 | La interfaz es adaptable a móvil (tarjetas en lugar de tabla), usa teclado numérico decimal en el precio y es operable con teclado (RNF-04). |
| RNF-61 | La migración conserva todos los pedidos y ventas existentes sin cambios: los productos actuales pasan a «De carta» y los tres menús completos se cargan con sus precios iniciales. |


## 9. Catálogo de mensajes

Se reutilizan MSG-09 (conexión), MSG-38 (operación fallida) y MSG-39 (sin permiso) del CUS02.

<!-- tabla 59 -->
| Código | Mensaje (texto al usuario) | Tipo | Ubicación |
|---|---|---|---|
| MSG-51 | Ingrese el nombre del producto. | Error | Bajo Nombre |
| MSG-52 | El nombre debe tener entre 3 y 50 caracteres. | Error | Bajo Nombre |
| MSG-53 | Ese producto ya está registrado. Use otro nombre o edite el existente. | Error | Bajo Nombre |
| MSG-54 | Seleccione una categoría. | Error | Bajo Categoría |
| MSG-55 | Ingrese el precio. | Error | Bajo Precio |
| MSG-56 | Ingrese un precio válido, mayor a S/ 0.00 y con hasta 2 decimales (ejemplo: 8.00). | Error | Bajo Precio |
| MSG-57 | Producto registrado correctamente. | Éxito | Aviso temporal (4 s) |
| MSG-58 | Producto actualizado correctamente. | Éxito | Aviso temporal (4 s) |
| MSG-59 | El nuevo precio se aplicará solo a los pedidos nuevos. Los pedidos y ventas ya registrados no cambian. | Informativo | Bajo Precio |
| MSG-60 | ¿Desactivar [producto]? Dejará de aparecer al tomar pedidos y en el menú del día, pero se conservará su historial. | Confirmación | Diálogo |
| MSG-61 | ¿Activar [producto]? Volverá a estar disponible para pedidos y para el menú del día. | Confirmación | Diálogo |
| MSG-62 | [Producto] forma parte del menú de hoy. Al desactivarlo se retirará del menú. | Advertencia | Diálogo |
| MSG-63 | Producto desactivado. | Éxito | Aviso temporal |
| MSG-64 | Producto activado. | Éxito | Aviso temporal |
| MSG-65 | No hay productos registrados. Use "Nuevo producto" para crear el primero. | Informativo | En la lista |
| MSG-66 | No se encontraron productos con ese criterio. Pruebe con otro nombre o quite los filtros. | Informativo | En la lista |
| MSG-67 | No se pudo cargar la lista de productos. Intente nuevamente. (botón Reintentar) | Error | En la lista |
| MSG-213 | Seleccione el tipo de producto. | Error | Bajo Tipo |
| MSG-214 | Seleccione el rol del componente. | Error | Bajo Rol |
| MSG-215 | Los componentes no llevan precio: se usan dentro de un menú completo. | Informativo | Formulario |
| MSG-216 | No se puede cambiar el tipo: el producto ya tiene pedidos. Desactívelo y cree uno nuevo. | Error | Formulario de edición |
| MSG-217 | Menú completo actualizado correctamente. | Éxito | Aviso temporal (4 s) |
| MSG-218 | ¿Desactivar el menú completo [nombre]? No se podrá pedir hasta activarlo, pero se conservará su historial. | Confirmación | Diálogo |


## 10. Diccionario de datos


<!-- tabla 60 -->
| Campo | Tipo | Obligatorio | Longitud / formato | Notas |
|---|---|---|---|---|
| Nombre | Texto | Sí | 3–50 | Único; se recorta |
| Tipo | Enum TipoProducto | Sí | Carta / Componente | Por defecto Carta; no cambia si hay pedidos |
| Categoría | Enum CategoriaProducto | Sí (solo de carta) | Valores 1 a 6 | Lista cerrada (sección 10.1) |
| Precio | Decimal (8,2) | Sí (solo de carta y menú completo) | > 0 y ≤ 999.99; 2 decimales | En soles; punto o coma |
| Rol | Enum RolComponente | Sí (solo componente) | Valores 1 a 5 | Sección 10.2 |
| Estado | Lista | Automático | Activo / Inactivo | Nuevo producto = Activo |
| Fecha de creación | Fecha y hora | Automático | — | No editable |
| Última modificación | Fecha y hora | Automático | — | Se actualiza al editar |
| Búsqueda | Texto | No | Máx. 50 | Por nombre |
| Filtros Tipo / Categoría o rol / Estado | Lista | No | Todos / valor | Combinables con la búsqueda |
| Menú completo | Entidad MenuCompleto | — | Nombre, precio, activo, incluye | Tres filas iniciales; solo Precio y Activo son editables |
| Parte del menú completo | Entidad MenuCompletoParte | — | Nombre, roles permitidos, orden | Fija; no editable |


### 10.1 Categorías de productos

Los productos de carta se organizan en seis categorías. La clave y el valor numérico son los del dominio (enum CategoriaProducto); la etiqueta es el texto que ve el usuario. Los componentes usan roles (10.2).

<!-- tabla 61 -->
| Valor | Clave | Etiqueta | Contenido | Color de la insignia |
|---|---|---|---|---|
| 1 | Desayuno | Desayuno | Bebidas de desayuno, panes y acompañamientos que se venden solos y a su precio (café, quaker con leche, quinua carretillera, pan con chicharrón, palta, queso, etc.). | Ámbar |
| 2 | Almuerzo | Almuerzo | Sopas y entradas con precio propio (sopa a la minuta, papa a la huancaína, ocopa, caldo de gallina como entrada) y menús ejecutivos de la carta. El menú de S/ 8.00 y el solo segundo ya no son productos: son menús completos (sección 10.4). | Naranja |
| 3 | PlatosExtras | Platos Extras / A la Carta | Platos a la carta: lomo saltado, ceviches, bistec a lo pobre, pollo a la plancha, chaufas, secos, tallarines y caldo de gallina criollo como plato fuerte. | Rosa |
| 4 | Combinados | Combinados | Platos compuestos: dúo marino, chaufa con chicharrón de pollo y chaufa + ceviche clásico. | Morado |
| 5 | Bebidas | Bebidas y Refrescos | Gaseosas personales (500 ml) y familiares (1.5 L), agua mineral y jarras artesanales de 500 ml y 1 L. | Esmeralda |
| 6 | Otro | Otro | Guarniciones y adicionales: porción de papas fritas, arroz blanco y canchita serrana. | Azul cielo |


### 10.2 Roles de componente


<!-- tabla 62 -->
| Valor | Clave | Etiqueta | Contenido | Insignia |
|---|---|---|---|---|
| 1 | BebidaDesayuno | Bebida de desayuno | Bases del desayuno completo: quaker, quinua, soya, anís. | Gris «Componente» |
| 2 | PlatoDesayuno | Plato de desayuno | Platos que acompañan al desayuno completo: seco de pollo, asado de pollo. | Gris «Componente» |
| 3 | Sopa | Sopa | Sopas del almuerzo completo (sin precio): sopa a la minuta, sopa criolla. | Gris «Componente» |
| 4 | Entrada | Entrada | Entradas que reemplazan a la sopa en el almuerzo completo: papa a la huancaína, ocopa. | Gris «Componente» |
| 5 | Segundo | Segundo | Segundos del almuerzo completo y del solo segundo: lomo saltado, seco de res, milanesa. | Gris «Componente» |


### 10.3 Carta de productos de referencia (carga inicial)

La carta contiene 56 productos cargados: 55 activos en las seis categorías y «Menú almuerzo» (S/ 8.00) desactivado porque lo reemplaza el Almuerzo completo.
Desayuno (15 productos)

<!-- tabla 63 -->
| Producto | Precio (S/) |
|---|---|
| Café pasado | 3.50 |
| Café pasado con sándwich mixto | 5.00 |
| Jugo de papaya | 5.00 |
| Jugo surtido | 6.00 |
| Pan con palta | 3.50 |
| Pan con huevo frito | 3.00 |
| Pan con pollo deshilachado | 4.50 |
| Pan con chicharrón | 8.00 |
| Quaker con leche, quinua carretillera, pan con queso, pan con salchipollo, infusiones y demás desayunos de la carta | Según carta |

Almuerzo (8 productos activos)

<!-- tabla 64 -->
| Producto | Precio (S/) |
|---|---|
| Caldo de gallina (Entrada) | 5.00 |
| Papa a la huancaína (Entrada) | 5.00 |
| Ocopa arequipeña (Entrada) | 5.00 |
| Sopa a la minuta | 7.00 |
| Sopa a la minuta especial | 10.00 |
| Menú almuerzo (desactivado: lo reemplaza el Almuerzo completo, sección 10.4) | — |
| Ejecutivo del día | 12.00 |
| Menú ejecutivo de la casa | 14.00 |
| Sopa criolla | Según carta |

Platos Extras / A la Carta (11 productos)

<!-- tabla 65 -->
| Producto | Precio (S/) |
|---|---|
| Lomo saltado | 25.00 |
| Ceviche mixto | 28.00 |
| Ceviche de trucha | 24.00 |
| Bistec a lo pobre | 26.00 |
| Pollo a la plancha | 20.00 |
| Arroz chaufa de carne | 22.00 |
| Arroz chaufa de pollo | 18.00 |
| Caldo de gallina criollo (Plato fuerte) | 10.00 |
| Seco de pollo, seco de res y tallarines verdes con bistec | Según carta |

Combinados (3 productos)

<!-- tabla 66 -->
| Producto | Precio (S/) |
|---|---|
| Chaufa + Ceviche clásico | 28.00 |
| Chaufa con chicharrón de pollo | 22.00 |
| Dúo marino (Arroz con mariscos + ceviche) | 32.00 |

Bebidas y Refrescos (15 productos)

<!-- tabla 67 -->
| Producto | Precio (S/) |
|---|---|
| Coca-Cola e Inca Kola, personal 500 ml y familiar 1.5 L | Según carta |
| Agua mineral 600 ml y 700 ml | Según carta |
| Jarras de 500 ml y 1 L: chicha morada, maracuyá, limonada clásica y limonada frozen | Según carta |

Otro (3 productos)

<!-- tabla 68 -->
| Producto | Precio (S/) |
|---|---|
| Porción de arroz blanco | 3.00 |
| Porción de canchita serrana | 2.50 |
| Porción extra de papas fritas | 4.00 |


### 10.4 Componentes de menú y menús completos (carga inicial)

Los componentes no llevan precio; la lista siguiente es una carga inicial de ejemplo y la lista real la define la administradora desde Productos.

<!-- tabla 69 -->
| Rol | Componentes de ejemplo |
|---|---|
| Bebida de desayuno | Quaker, Quinua, Soya, Anís |
| Plato de desayuno | Seco de pollo, Asado de pollo |
| Sopa | Sopa a la minuta, Sopa criolla |
| Entrada | Papa a la huancaína, Ocopa arequipeña, Caldo de gallina |
| Segundo | Lomo saltado, Seco de pollo, Seco de res, Milanesa de pollo, Pescado frito |


<!-- tabla 70 -->
| Menú completo (precio) | Partes que se eligen e incluye |
|---|---|
| Desayuno completo · S/ 7.00 | Una bebida de desayuno y un plato de desayuno. Incluye pan. |
| Almuerzo completo · S/ 8.00 | Una sopa o una entrada, y un segundo. Incluye refresco del día (a confirmar con la dueña). |
| Solo segundo · S/ 7.00 | Un segundo, sin sopa ni entrada (a confirmar si lleva refresco). |


## 11. Contrato de API

Los endpoints de administración exigen token JWT con rol Administrador (401 sin token válido, 403 con otro rol). El campo tipo se recibe como carta o componente; en los componentes no se envía precio. La categoría se acepta como número (1 a 6), clave del enum o etiqueta textual (RV-43); las respuestas devuelven la clave canónica.

<!-- tabla 71 -->
| Endpoint | Entrada | Respuestas |
|---|---|---|
| GET /api/productos | busqueda, tipo, categoria (numérica o textual), rol, estado, pagina, tamano (10) | 200: { items[{id, nombre, tipo, categoria, rol, precio, activo}], total }. |
| GET /api/productos/{id} | — | 200: datos del producto. 404: no existe. |
| POST /api/productos | { nombre, tipo, categoria?, rol?, precio? } | 201: registro creado y activo. 400: datos inválidos con el campo afectado (categoría desconocida; falta de categoría o precio en un producto de carta; falta de rol o precio presente en un componente). 409: nombre duplicado dentro del tipo. |
| PUT /api/productos/{id} | { nombre, tipo, categoria?, rol?, precio? } | 200: actualizado. 400: datos inválidos. 404: no existe. 409: nombre duplicado dentro del tipo o cambio de tipo con pedidos registrados. |
| PATCH /api/productos/{id}/estado | { activo } | 200: { activo, retiradoDelMenu }. 404: no existe. |
| GET /api/productos/disponibles | categoria o rol (opcional) | 200: solo productos y componentes activos, con su tipo, categoría o rol. Roles: Administrador, Cajero, Mozo y Cocinero. Lo consumen el Menú del día (CUS04) y los pedidos (CUS06 y CUS07). |
| GET /api/menus-completos | — | 200: [{ id, nombre, precio, activo, incluye, partes[{ nombre, roles }] }]. Roles: Administrador (todos); los demás, solo los activos. |
| PUT /api/menus-completos/{id} | { precio } | 200: precio actualizado. 400: precio inválido. 404: no existe. Rol: Administrador. |
| PATCH /api/menus-completos/{id}/estado | { activo } | 200: { activo, retiradoDelMenu }. 404: no existe. Rol: Administrador. |


### 11.1 Componentes de aplicación


<!-- tabla 72 -->
| Componente | Responsabilidad |
|---|---|
| CrearProductoRequest / ActualizarProductoRequest | Validate() verifica nombre, tipo, precio (solo de carta), categoría (solo de carta) y rol (solo componente); la categoría se resuelve con CategoriaProductoExtensions.TryParseFlexible(). |
| ProductoResponseDto | Formato canónico de respuesta: id, nombre, categoria, precio y activo. |
| ProductoService.ListarProductosAsync | Lista con búsqueda, filtros y paginación; el parámetro categoria acepta número o texto. |
| ProductoService.RegistrarProductoAsync / ActualizarProductoAsync | Convierten la etiqueta recibida al enum de dominio, verifican nombre único y registran auditoría. |
| ProductoService.ListarDisponiblesAsync | Expone los productos activos categorizados para el Menú del día (CUS04) y los pedidos. |
| ReporteRepository | Agrega las ventas por categoría recorriendo Enum.GetValues<CategoriaProducto>(). |
| TipoProducto / RolComponente (por implementar) | Enums de dominio con valores estables: tipo (Carta, Componente) y rol (1 a 5). |
| MenusCompletosService (por implementar) | Consulta los tres menús completos, edita su precio y su estado, retira del menú vigente el menú desactivado y registra auditoría. |


## 12. Escenarios de validación y criterios de aceptación


<!-- tabla 73 -->
| ID | Entrada / acción | Resultado esperado | Reglas | HU |
|---|---|---|---|---|
| E-55 | Entrar a PRODUCTOS con productos registrados | Lista por categoría y nombre, con Producto, Categoría, Precio, Estado y Acciones, de 10 en 10. | RN-23, RNF-11 | HU10 |
| E-56 | Buscar por un nombre existente | Solo las coincidencias, sin distinguir mayúsculas ni tildes. | RV-40 | HU10 |
| E-57 | Buscar algo que no existe | MSG-66 y "Quitar filtros". | RV-40 | HU10 |
| E-58 | Filtrar por categoría y estado a la vez | Solo los productos que cumplen ambos criterios. | — | HU10 |
| E-59 | Entrar sin productos registrados | MSG-65 con el botón NUEVO PRODUCTO. | — | HU10 |
| E-60 | Registrar "Lomo saltado", Platos Extras / A la Carta, 25.00 | MSG-57; producto Activo en la lista y resaltado. | RN-29, RN-30 | HU09 |
| E-61 | Registrar con campos vacíos | MSG-51, MSG-54 y MSG-55 junto a cada campo; foco en el primero. | RV-33, 35, 36, 38 | HU09 |
| E-62 | Registrar un nombre repetido del mismo tipo (también "lomo SALTADO") | MSG-53; el formulario sigue abierto. | RV-34, RN-24 | HU09 |
| E-63 | Precio 0, negativo, texto, 8.999 o 1000 | MSG-56; no se guarda. | RV-36 | HU09 |
| E-64 | Precio escrito como 8,50 | Se normaliza a 8.50 y se guarda. | RV-36 | HU09 |
| E-65 | Editar nombre o categoría | MSG-58; la fila se actualiza. | RV-33 a 35 | HU11 |
| E-66 | Editar el precio | Aparece MSG-59; los pedidos nuevos usan el precio nuevo; las ventas registradas no cambian; el cambio queda en auditoría. | RV-42, RN-26, RN-30 | HU11 |
| E-67 | Editar a un nombre que ya tiene otro producto | MSG-53. | RV-34 | HU11 |
| E-68 | Desactivar un producto | Confirmación MSG-60 y luego MSG-63; ya no aparece en pedidos ni en el menú del día. | RN-27, RN-28 | HU12 |
| E-69 | Desactivar un producto que está en el menú de hoy | El diálogo agrega MSG-62; al confirmar se retira del menú. | RN-28 | HU12 |
| E-70 | Activar un producto inactivo | Confirmación MSG-61 y luego MSG-64; vuelve a estar disponible. | RN-28 | HU12 |
| E-71 | Cancelar un formulario o confirmación (botón o Esc) | Sin cambios; el foco vuelve al botón de origen. | RV-41 | HU09 a HU12 |
| E-72 | Un mozo entra por URL a /productos | MSG-39 (403); la opción no aparece en su menú. | RN-23 | HU10 |
| E-73 | Falla del servidor al cargar o guardar | MSG-67 o MSG-38; se conservan los datos escritos. | RNF-12 | HU09 a HU12 |
| E-74 | Uso solo con teclado | Tab recorre controles y filas; el formulario atrapa el foco; Enter guarda; Esc cierra. | RNF-13 | HU09 a HU12 |
| E-75 | Doble clic en GUARDAR | Se crea un solo producto. | RV-39 | HU09 |
| E-76 | Abrir el selector de categoría del formulario | Se muestran exactamente 6 opciones, cada una con su subtítulo descriptivo. | RN-31, RV-35 | HU09, HU11 |
| E-77 | Filtrar la lista por cada una de las 6 categorías | Cantidades de productos de carta activos: Desayuno 15, Almuerzo 8, Platos Extras 11, Combinados 3, Bebidas 15, Otro 3 (55 en total); cada fila muestra la insignia de color de su categoría. | RN-31 | HU10 |
| E-78 | GET /api/productos con categoria = "Platos Extras / A la Carta", sus variantes sin tildes o en minúsculas, o 3 | El mismo resultado en todos los casos. | RV-43 | HU10 |
| E-79 | POST con categoria = "Combinados" o 4 | Producto creado en la categoría Combinados (4). | RV-43, RN-31 | HU09 |
| E-80 | POST o PUT con una categoría inexistente (por ejemplo, "Postres") | 400 indicando el campo categoria; no se guarda. | RV-35, RV-43 | HU09, HU11 |
| E-81 | Consultar los dos productos de caldo de gallina | "Caldo de gallina (Entrada)": S/ 5.00 en Almuerzo. "Caldo de gallina criollo (Plato fuerte)": S/ 10.00 en Platos Extras / A la Carta. Son productos independientes. | RN-33 | HU10 |
| E-82 | Cambiar de categoría un producto que ya tiene pedidos y comandas | El cambio se guarda sin afectar los pedidos, comandas ni menús ya registrados. | RN-26, RN-32 | HU11 |
| E-83 | Abrir el Menú del día (CUS04) | Los productos de carta activos aparecen agrupados por categoría (todas de selección múltiple) y los componentes, por rol, en «Opciones del día»; los menús completos se habilitan con un interruptor. | RN-28, RN-31, RN-35 | HU13 |
| E-84 | Consultar ventas por categoría en Reportes (CUS13) | Se consolidan las métricas de las 6 categorías. | RN-34 | HU33 |
| E-85 | Registrar un pedido de mesa (CUS06) o para llevar (CUS07) | Se ofrecen los productos de carta activos del menú del día y no agotados, y el armado de los menús completos habilitados con sus opciones; un producto o componente inactivo no aparece. | RN-28, RN-35 | HU18, HU20 |
| E-86 | Modificar el precio de un producto con pedidos ya registrados | Los pedidos existentes conservan el precio unitario con que se registraron; los nuevos usan el precio vigente. | RN-26 | HU11, HU18 |
| E-371 | Registrar el componente "Quinua", rol Bebida de desayuno, sin precio | MSG-57; aparece como «Componente · Bebida de desayuno» con «—» en el precio. | RN-130, RV-156 | HU09 |
| E-372 | Enviar un precio en un componente (por servicio) | Se rechaza con MSG-215; no se guarda. | RV-156 | HU09 |
| E-373 | Guardar sin tipo o un componente sin rol | MSG-213 o MSG-214. | RV-155, RV-156 | HU09 |
| E-374 | "Papa a la huancaína" como producto de carta y como componente; luego otro componente con el mismo nombre | Los dos primeros se permiten; el tercero, MSG-53. | RV-157, RN-139 | HU09 |
| E-375 | Cambiar el tipo de un producto que ya tiene pedidos | MSG-216; no cambia. | RV-158 | HU11 |
| E-376 | Filtrar la lista por tipo y por rol | Muestra solo los productos de carta, solo los componentes o solo los de un rol. | RV-155 | HU10 |
| E-377 | Abrir la pestaña Menús completos y cambiar el precio del Desayuno completo de 7.00 a 7.50 | MSG-217; los pedidos nuevos cobran 7.50 y los anteriores conservan 7.00. | RV-160, RN-140 | HU35 |
| E-378 | Precio de un menú completo vacío, cero, 1000 o con 3 decimales | MSG-55 o MSG-56; no se guarda. | RV-160 | HU35 |
| E-379 | Desactivar el Solo segundo | Confirmación MSG-218; no aparece en el menú del día ni en el armado. | RN-134 | HU35 |
| E-380 | Un mozo intenta editar menús completos por URL o servicio | 403 y MSG-39. | RN-23 | HU35 |
| E-402 | Migración a componentes y menús completos | Los pedidos y ventas existentes no cambian y los productos actuales quedan «De carta»; «Menú almuerzo» queda inactivo. | RNF-61 | HU09, HU35 |


## 13. Matriz de justificación de usabilidad


<!-- tabla 74 -->
| Principio aplicado | Elemento de la interfaz | Decisión adoptada | Justificación |
|---|---|---|---|
| ISO 9241 – Eficacia | Formulario con tipo, categoría o rol | El formulario muestra solo los campos que corresponden al tipo elegido | La administradora registra productos y componentes sin errores de datos |
| ISO 9241 – Eficiencia | Búsqueda, filtros y acciones en la fila | Todo se hace sobre la misma pantalla; Enter guarda | Menos pasos por tarea |
| Nielsen 1 – Visibilidad del estado | Insignias, «Guardando…» y fila resaltada | Insignia de categoría, insignia gris «Componente» y estado con texto | Siempre sabe qué es cada registro y qué cambió |
| Nielsen 2 – Mundo real | Textos de tipo y de menús | «Desayuno completo», «Almuerzo completo», «Solo segundo» y «Incluye pan» | Mismo lenguaje del restaurante |
| Nielsen 4 – Consistencia | Botones y diálogos | Mismos componentes que CUS01 y CUS02 | Evita reaprendizaje |
| Nielsen 5 – Prevención de errores | Precio, tipo y desactivación | Validación de precio, bloqueo de cambio de tipo con pedidos y aviso MSG-62 | Evita digitar 80 por 8.00, perder historial o retirar lo que está en el menú de hoy |
| Nielsen 6 – Reconocimiento | Selector de categoría con subtítulos | Seis opciones con descripción de su contenido | No obliga a recordar qué va en cada categoría |
| Nielsen 9 – Recuperarse de errores | Mensajes MSG-53, 56, 216 | Indican qué hacer | Facilita corregir |
| Shneiderman 2 – Usabilidad universal | Móvil, teclado y contraste | Tarjetas en móvil, teclado numérico en el precio y foco atrapado en ventanas | Atiende distintos dispositivos y niveles |
| Shneiderman 3 – Retroalimentación | Avisos de éxito y error | Respuesta a cada acción | Sabe qué pasó |
| Shneiderman 6 – Reversión | Activar y desactivar | Desactivar es reversible y no borra el historial | Acciones reversibles |


## 14. Matriz de trazabilidad


### 14.1 Requerimiento → historia → caso de uso → vista → reglas → API → escenarios


<!-- tabla 75 -->
| RF | HU | CUS | Vista | Reglas / mensajes | API | Escenarios | Prueba |
|---|---|---|---|---|---|---|---|
| RF-09 Registrar productos | HU09 (M) | CUS03.1 | 3.2 | RV-33 a 39, 43, 155 a 157; RN-23 a 25, 29 a 31, 130, 131, 139; MSG-51 a 57, 213 a 215 | POST /api/productos | E-60 a E-64, E-71, E-75, E-76, E-79, E-80, E-371 a E-374, E-402 | ProductoServiceUnitTests |
| RF-10 Listar y buscar productos | HU10 (S) | CUS03.2 | 3.1 | RV-40, 43, 155; RN-23, 31, 33, 130; MSG-65 a 67, 39 | GET /api/productos; GET /api/productos/disponibles | E-55 a E-59, E-72, E-77, E-78, E-81, E-376 | ProductoServiceUnitTests |
| RF-11 Editar datos y precio | HU11 (S) | CUS03.3 | 3.3 | RV-33 a 39, 42, 43, 155 a 158; RN-24 a 26, 30 a 32, 141; MSG-51 a 59, 216 | GET y PUT /api/productos/{id} | E-65 a E-67, E-75, E-76, E-80, E-82, E-86, E-375 | ProductoServiceUnitTests |
| RF-12 Activar o desactivar | HU12 (S) | CUS03.4 | 3.4 | RV-41; RN-27, 28, 30, 134; MSG-60 a 64 | PATCH /api/productos/{id}/estado | E-68 a E-70 | ProductoServiceUnitTests |
| RF-35 Gestionar menús completos | HU35 (S) | CUS03.5 | 3.5 | RV-39, 160; RN-132 a 134, 140; RNF-61; MSG-217, 218 | GET /api/menus-completos; PUT /api/menus-completos/{id}; PATCH /api/menus-completos/{id}/estado | E-377 a E-380, E-402 | Por implementar (MenusCompletosServiceUnitTests) |


### 14.2 Regla → elemento de interfaz → componente → escenario


<!-- tabla 76 -->
| Regla | Elemento de interfaz | Componente | Escenarios | Caso de uso |
|---|---|---|---|---|
| RV-33, 34, 36 | Campos Nombre y Precio con texto de error | ProductFormModal.tsx; ProductoDTOs.cs (Validate) | E-61 a E-64, E-67 | CUS03.1, 04.3 |
| RV-35 | Lista Categoría con 6 opciones y subtítulos | ProductFormModal.tsx; types/producto.ts (CATEGORIAS_PRODUCTO, CATEGORIA_LABELS) | E-61, E-76, E-80 | CUS03.1, 04.3 |
| RV-37 | Recorte automático del nombre | ProductFormModal.tsx | E-60 | CUS03.1 |
| RV-38, RV-39 | Error por campo y botón "Guardando…" | ProductFormModal.tsx | E-61, E-75 | CUS03.1, 04.3 |
| RV-40 | Campo Buscar con espera de 300 ms | ProductsPage.tsx | E-56, E-57 | CUS03.2 |
| RV-41 | Diálogo de confirmación con botón por defecto CANCELAR | ProductsPage.tsx | E-68, E-70, E-71 | CUS03.4 |
| RV-42, RN-26 | Texto MSG-59 bajo el precio | ProductFormModal.tsx | E-66, E-86 | CUS03.3 |
| RV-43 | Interpretación flexible de la categoría | CategoriaProducto.cs (TryParseFlexible); ProductoDTOs.cs; ProductoService.cs | E-78, E-79, E-80 | CUS03.1 a 04.3 |
| RN-23 | PRODUCTOS visible solo para Administrador; 403 en servidor | Menú lateral; autorización de la API | E-72 | CUS03.1 a 04.4 |
| RN-24 | MSG-53 al duplicar un nombre | ProductoService.cs | E-62, E-67 | CUS03.1, 04.3 |
| RN-28 | MSG-62 y retiro del menú vigente | ProductoService.cs; MenuDiaPage.tsx | E-68, E-69, E-85 | CUS03.4 |
| RN-31 | Seis categorías, valores 1 a 6, insignias de color | CategoriaProducto.cs; types/producto.ts (CATEGORIA_BADGE_LABELS); ProductsPage.tsx | E-76, E-77 | CUS03.1 a 04.3 |
| RN-32 | Integridad al cambiar de categoría | ProductoService.cs; base de datos (llaves foráneas de detalles_pedido, detalles_comanda, menu_dia_platos) | E-82 | CUS03.3 |
| RN-33 | Dos productos de caldo de gallina | Carta de productos (DatabaseSeeder.cs) | E-81 | CUS03.2 |
| RN-34 | Ventas por categoría con las 6 categorías | ReporteRepository.cs; ReportesPage.tsx | E-84 | CUS03 / CUS13 |
| RN-35 | Secciones del Menú del día y oferta en pedidos | MenuDiaPage.tsx; GET /api/productos/disponibles | E-83, E-85 | CUS03 / CUS04, 07, 08 |
| RNF-13 | Tab, foco en ventanas, teclado numérico y vista móvil | ProductFormModal.tsx; ProductsPage.tsx | E-74 | CUS03.1 a 04.4 |
| RV-155, 156 | Selector de tipo, selector de rol y precio condicional | ProductFormModal.tsx; ProductoDTOs.cs (Validate); TipoProducto.cs y RolComponente.cs (por implementar) | E-371 a E-373 | CUS03.1, 04.3 |
| RV-157, RN-139 | MSG-53 al duplicar un nombre dentro del tipo | ProductoService.cs | E-374 | CUS03.1, 04.3 |
| RV-158 | MSG-216 al cambiar el tipo con pedidos | ProductoService.cs | E-375 | CUS03.3 |
| RV-160 | Campo Precio del menú en la pestaña Menús completos | MenuCompletoCard.tsx; MenusCompletosService.cs (por implementar) | E-377, E-378 | CUS03.5 |
| RN-130, 131 | Tipo y rol de cada registro; insignia gris «Componente» | TipoProducto.cs; RolComponente.cs; ProductsPage.tsx (por implementar) | E-371, E-376 | CUS03.1 a 04.3 |
| RN-132, 133, 134, 140 | Tres menús completos con precio y estado editables | MenusCompletosService.cs; DatabaseSeeder.cs (por implementar) | E-377 a E-379 | CUS03.5 |


### 14.3 Categoría → dominio → interfaz → menú del día → reportes


<!-- tabla 77 -->
| Categoría o rol | Valor | Clave del enum | Insignia | Sección del Menú del día (CUS04) | Reporte (CUS13) |
|---|---|---|---|---|---|
| Desayuno | 1 | Desayuno | Ámbar | Desayunos (múltiple) | Tarjeta y tabla de ventas |
| Almuerzo | 2 | Almuerzo | Naranja | Almuerzos y Segundos | Tarjeta y tabla de ventas |
| Platos Extras / A la Carta | 3 | PlatosExtras | Rosa | Platos Extras / A la Carta | Tarjeta y tabla de ventas |
| Combinados | 4 | Combinados | Morado | Combinados | Tarjeta y tabla de ventas |
| Bebidas y Refrescos | 5 | Bebidas | Esmeralda | Bebidas y Refrescos | Tarjeta y tabla de ventas |
| Otro | 6 | Otro | Azul cielo | Otros | Tarjeta y tabla de ventas |
| Rol: Bebida de desayuno | 1 | BebidaDesayuno | Gris «Componente» | Opciones del día · Bebidas de desayuno | Veces elegido (componente) |
| Rol: Plato de desayuno | 2 | PlatoDesayuno | Gris «Componente» | Opciones del día · Platos de desayuno | Veces elegido (componente) |
| Rol: Sopa | 3 | Sopa | Gris «Componente» | Opciones del día · Sopas | Veces elegido (componente) |
| Rol: Entrada | 4 | Entrada | Gris «Componente» | Opciones del día · Entradas | Veces elegido (componente) |
| Rol: Segundo | 5 | Segundo | Gris «Componente» | Opciones del día · Segundos | Veces elegido (componente) |
| Menú completo | — | MenuCompleto | — | Menús completos (interruptor) | Menús completos vendidos (con monto) |


### 14.4 Componentes de implementación


<!-- tabla 78 -->
| Capa | Archivo | Responsabilidad en el CUS03 |
|---|---|---|
| Dominio | backend/GirasolesRes.Domain/Enums/CategoriaProducto.cs | Enum de 6 categorías y TryParseFlexible (RN-31, RV-43) |
| Aplicación | backend/GirasolesRes.Application/DTOs/Productos/ProductoDTOs.cs | Solicitudes, validación y respuesta canónica (CUS03.1 y 04.3) |
| Aplicación | backend/GirasolesRes.Application/Services/ProductoService.cs | Registro, edición, listado, estado y disponibles (CUS03.1 a 04.4) |
| Infraestructura | backend/GirasolesRes.Infrastructure/Data/DatabaseSeeder.cs | Carga de la carta inicial de 56 productos |
| Infraestructura | backend/GirasolesRes.Infrastructure/Repositories/ReporteRepository.cs | Ventas por categoría (RN-34) |
| Base de datos | database/migrate_cus04_categorias_carta_peruana.sql | Asignación de categorías y siembra de la carta |
| Interfaz | frontend/src/types/producto.ts | Tipos, etiquetas y rótulos de insignia de categoría |
| Interfaz | frontend/src/components/ProductFormModal.tsx | Formulario de registro y edición (Vistas 4.2 y 4.3) |
| Interfaz | frontend/src/pages/ProductsPage.tsx | Lista, filtros, insignias y estado (Vistas 4.1 y 4.4) |
| Interfaz | frontend/src/pages/MenuDiaPage.tsx | Agrupación por categoría en el Menú del día (CUS04) |
| Interfaz | frontend/src/pages/ReportesPage.tsx | Visualización por categoría (CUS13) |
| Dominio | backend/GirasolesRes.Domain/Enums/TipoProducto.cs y RolComponente.cs | Por implementar: enums de tipo y rol (RN-130, RN-131) |
| Dominio | backend/GirasolesRes.Domain/Entities/MenuCompleto.cs y MenuCompletoParte.cs | Por implementar: entidades de los menús completos (RN-132) |
| Aplicación | backend/GirasolesRes.Application/Services/MenusCompletosService.cs | Por implementar: consulta y edición de precio y estado (CUS03.5) |
| Base de datos | database/migrate_cus04_componentes_y_menus_completos.sql | Por implementar: columnas tipo y rol, precio opcional, tablas de menús completos y migración (RNF-61) |
| Interfaz | frontend/src/components/MenuCompletoCard.tsx | Por implementar: tarjeta y edición de precio (Vista 3.5) |
| Pruebas | tests/GirasolesRes.Tests/MenusCompletosServiceUnitTests.cs | Por implementar: pruebas de los menús completos |
| Pruebas | tests/GirasolesRes.Tests/ProductoServiceUnitTests.cs | Pruebas unitarias del servicio de productos |


### 14.5 Verificación del módulo


<!-- tabla 79 -->
| Verificación | Resultado |
|---|---|
| Compilación del backend (.NET 8) (antes del ajuste) | 0 advertencias y 0 errores. |
| Pruebas automatizadas (antes del ajuste) | 66 de 66 pruebas superadas. |
| Compilación del frontend (antes del ajuste) | tsc -b y vite build exitosos. |
| Ejecución local (antes del ajuste) | API en http://localhost:5050 y frontend en http://localhost:5173. |
| Ajuste de componentes y menús completos | Pendiente: implementarlo y volver a ejecutar la compilación, las pruebas automatizadas y la migración. |


## 15. Evaluación del prototipo y mejoras incorporadas


<!-- tabla 80 -->
| Hallazgo | Principio | Mejora incorporada |
|---|---|---|
| Todo se trataba como producto con precio: quaker y quinua serían productos con precio propio | Nielsen 2; modelo del negocio | Tipo «Componente de menú» con rol y sin precio, registrado en la misma pantalla |
| «Menú almuerzo» era un solo producto de S/ 8.00 y no se sabía qué sopa ni qué segundo pidió cada cliente | Trazabilidad; Nielsen 2 | Tres menús completos con precio fijo y partes elegibles, gestionados en la pestaña «Menús completos» |
| El precio de desayuno y almuerzo solo podía cambiarse tocando cada plato | Nielsen 7 | Edición del precio y del estado del menú completo en un solo lugar (CUS03.5) |
| La lista no distinguía productos de carta de opciones de menú | Nielsen 6 | Columna Tipo, filtro por tipo y rol e insignia gris «Componente» |
| Cambiar el tipo de un producto con pedidos podía alterar el historial | Nielsen 5 | Bloqueo del cambio de tipo con pedidos (RV-158, MSG-216) |
| No hay bocetos del formulario con tipo y rol ni de la pestaña Menús completos | Trazabilidad | Diseñar las Vistas 3.2, 3.3 y 3.5 en Figma con los estados de la sección 6 |


## 16. Dependencias con otros casos de uso


<!-- tabla 81 -->
| Caso de uso | Relación con el CUS03 |
|---|---|
| CUS04 Menú del día | Consume los productos y componentes activos (GET /api/productos/disponibles). Los productos de carta se presentan agrupados por categoría (todas de selección múltiple); los componentes, por rol, en «Opciones del día» (bebidas y platos de desayuno, sopas, entradas y segundos); y los menús completos se habilitan con un interruptor. Desactivar un producto o componente que está en el menú vigente lo retira de ese menú. |
| CUS06 Pedido de mesa y CUS07 Pedido para llevar | Ofrecen los productos de carta del menú del día vigente que no estén agotados y el armado de menús completos con las opciones del día. El pedido guarda el precio unitario del producto o del menú completo al registrarse (RN-26 y RN-133) y el nombre de las opciones elegidas (RN-141). |
| CUS10 Cobro y CUS11 Ventas | El detalle de venta y el comprobante conservan el precio con que se registró el pedido y muestran cada menú completo con su precio y sus opciones elegidas, sin precio, aunque el producto cambie de precio o se desactive. |
| CUS13 Reportes | Platos vendidos por producto y por menú completo, veces que se eligió cada componente y ventas por categoría (seis categorías), incluidos los registros luego desactivados. Componentes: ReporteRepository.cs y ReportesPage.tsx. |
| CUS09 Cocina | La comanda muestra cada menú completo con sus opciones elegidas y lo que incluye, además de la observación. |


<!-- tabla 82 -->
| N.º | Punto | Decisión adoptada o tarea |
|---|---|---|
| 1 | Contenido de los menús completos (pan, refresco, sopa o entrada). | Decisión: el texto «Incluye» y las partes de cada menú completo son datos editables con el valor inicial de la sección 10.4; se ajustan sin cambiar el sistema. |
| 2 | Estructura fija de los menús completos | No se pueden crear menús nuevos ni cambiar sus partes; un CRUD de menús completos queda como mejora futura. |
| 3 | Menú almuerzo | Se desactiva y se crean los componentes; las entradas y sopas con precio se mantienen como productos de carta para venta suelta. |
| 4 | Estado de la implementación | El ajuste de componentes y menús completos está pendiente de implementar (ver 14.4 y 14.5). |


# CUS04: Gestión del menú del día


## 1. Ficha del CUS general


<!-- tabla 83 -->
| Campo | Detalle |
|---|---|
| CUS general | CUS04: Gestión del menú del día |
| Interfaz (GUI) | Interfaz 4: Menú del día |
| Actor(es) | Administrador y Cocinero |
| HU / RF de origen | HU13 y HU14 / RF-13 y RF-14 |
| Descripción | Interfaz con la que se determina cada día qué se ofrece (opciones de cada rol, menús completos habilitados y productos de carta) y con la que se controla, durante el servicio, qué se encuentra agotado. |
| Alcance | No incluye el alta ni la edición de productos, componentes y menús completos (CUS03) ni el registro de pedidos (CUS06 y CUS07), que consumen el menú aquí definido. |


<!-- tabla 84 -->
| CUS | Título | Actor | HU | RF | Prioridad | Iteración | Complejidad |
|---|---|---|---|---|---|---|---|
| CUS04.1 | Definir menú del día | Administrador | HU13 | RF-13 | Media (Should) | 2/3 | Alta |
| CUS04.2 | Marcar plato u opción como agotado o disponible | Administrador y Cocinero | HU14 | RF-14 | Baja (Could) | 3/3 | Baja |


## 2. Decisiones adoptadas


<!-- tabla 85 -->
| Tema | Decisión |
|---|---|
| Un menú por fecha | El menú del día corresponde a la fecha actual. Si ya existe, se carga para modificarlo y al guardar se reemplaza. |
| Origen de los platos | Todo ítem del menú es un producto de carta, un componente o un menú completo activo del CUS03; nombre, categoría o rol y precio provienen de ellos. El menú no crea productos. |
| Navegación por categorías | La oferta se organiza en pestañas: Opciones del día (cinco secciones por rol de componente), Menús completos, las seis categorías de la carta y, con el menú definido, Disponibilidad en Servicio. Evita el desplazamiento vertical largo y permite saltar entre pestañas. |
| Vista completa | Una vista alternativa de acordeón muestra todas las categorías en una sola pantalla, con secciones colapsables. Se alterna con el botón VISTA COMPLETA / POR PESTAÑAS sin perder la selección. |
| Contadores | Cada pestaña muestra una insignia con la cantidad de productos seleccionados en su categoría, en tiempo real. |
| Selección masiva | Cada sección de opciones y cada categoría ofrecen SELECCIONAR TODOS / DESMARCAR TODOS. |
| Desayuno del día | Los desayunos individuales de carta son de selección múltiple como las demás categorías. Desaparecen el «desayuno del día» único y la opción «Sin desayuno especial hoy»: el desayuno con bebida y plato se ofrece como Desayuno completo (CUS03.5). |
| Barra inferior fija | Permanece visible en cualquier pestaña y vista; muestra el total en carta, el indicador de cambios sin guardar y los botones GUARDAR MENÚ DEL DÍA y DESCARTAR CAMBIOS. |
| Disponibilidad en servicio | Cada producto de carta y cada opción (componente) del menú guardado tiene estado Disponible o Agotado. Cambiarlo no lo retira del menú y es reversible. Si se agotan todas las opciones de una parte, el menú completo queda «No disponible hoy». |
| Diseño sin desplazamiento global | La página no se desplaza como un todo: el cuerpo de cada pestaña se desplaza de forma interna y la barra inferior queda anclada al pie del contenedor. |
| Menú del día | Define las opciones de cada rol que se ofrecen hoy (selección múltiple), los menús completos habilitados y los productos de carta del día (RN-135). |
| Menú completo disponible | Solo se ofrece si cada parte tiene al menos una opción disponible; si se agotan todas las de una parte, aparece como «No disponible hoy» (RN-136). |
| Sin menú definido | El armado de pedidos ofrece todos los componentes activos de cada rol y todos los menús completos activos (alternativa temporal, RN-142). |
| Actores y permisos | El Administrador define el menú y marca disponibilidad; el Cocinero marca disponibilidad durante el servicio; el Mozo y el Cajero consumen el menú vigente (los agotados aparecen «AGOTADO» y no se pueden seleccionar). |


## 3. Análisis del usuario (Diseño Centrado en el Usuario)


<!-- tabla 86 -->
| Aspecto | Descripción |
|---|---|
| Quién usa la interfaz | La administradora (dueña), antes de abrir el local, y el cocinero durante el servicio para informar los platos agotados. |
| Necesidades | Definir rápido lo que se vende hoy sin recorrer una lista de 55 productos y de opciones; incluir de una vez todas las bebidas o todos los extras; saber cuánto lleva seleccionado; no perder el botón de guardar; avisar al instante que un plato se terminó sin rehacer el menú. |
| Dificultades previsibles | Perder la selección al cambiar de categoría; olvidar guardar; elegir menús sin opciones; guardar un menú vacío; marcar como agotado el plato equivocado; que el mozo ofrezca un plato que ya no hay. |
| Contexto de uso | Tarea diaria y breve en la mañana; cambios de disponibilidad puntuales durante el servicio, a veces en pantallas compactas. |


## 4. Plantillas de casos de uso


### CUS04.1: Definir menú del día


<!-- tabla 87 -->
| Código: CUS04.1 | Título: Definir menú del día con opciones (Vista 4.1) | Fecha: 21.10.2026 | Iteración: 2/3 |
|---|---|---|---|
| Actor(es): Administrador |  |  |  |
| Prioridad: Media (Should) | Complejidad: Alta |  |  |
| Historia de usuario: HU13 · Definir menú del día (S) |  |  |  |
| Requerimiento de origen: RF-13 (ampliado con opciones por rol y menús completos) |  |  |  |
| Descripción: Permite a la administradora definir lo que se vende en la fecha actual: las opciones de cada rol, los menús completos habilitados y los productos de carta del día, para que el mozo y el cajero solo ofrezcan lo que se prepara ese día. |  |  |  |
| Precondición: La administradora tiene sesión iniciada con rol Administrador, accede desde Carta y menú > Menú del día y existen productos, componentes o menús completos activos (CUS03). |  |  |  |
| Flujo principal:<br>1. Accede a MENÚ DEL DÍA; el sistema consulta el menú de la fecha actual y los ítems activos, y muestra la fecha, la insignia de estado ("Menú no definido aún" mientras no exista), el aviso MSG-71, las pestañas con su contador y la barra inferior fija.<br>2. En la pestaña "Opciones del día" elige, en cinco secciones, los componentes de hoy: Bebidas de desayuno, Platos de desayuno, Sopas, Entradas y Segundos (selección múltiple, con SELECCIONAR TODOS).<br>3. En la pestaña "Menús completos" habilita los que se ofrecerán hoy; cada tarjeta muestra el resumen de opciones por parte (por ejemplo, "3 bebidas · 2 platos").<br>4. En las demás pestañas marca los productos de carta del día (desayunos individuales, almuerzos y segundos, platos a la carta, combinados, bebidas y otros), todos de selección múltiple, uno por uno o con SELECCIONAR TODOS.<br>5. Cada cambio actualiza los contadores, el texto "N de M seleccionados", el total en carta y el indicador "Cambios sin guardar" (RV-48, RV-50). Opcionalmente alterna con VISTA COMPLETA (RV-55).<br>6. Pulsa GUARDAR MENÚ DEL DÍA; el sistema valida (RV-161, RV-162) y deshabilita el botón con "Guardando menú…" (RV-52).<br>7. El servidor guarda el menú de la fecha (lo crea o reemplaza) con las opciones, los menús habilitados y los productos de carta.<br>8. El sistema muestra MSG-70, actualiza la insignia a menú definido, retira el indicador de cambios y habilita DISPONIBILIDAD EN SERVICIO. |  |  |  |
| Flujo alterno:<br>Un menú completo habilitado sin opciones en alguna de sus partes: MSG-219; no se guarda.<br>Sin productos de carta ni menús completos habilitados: MSG-224; no se guarda.<br>No existen productos, componentes ni menús activos: MSG-69 con enlace a Productos; no se permite definir el menú.<br>El menú de hoy ya existe: se muestra con lo guardado marcado y, al guardar, se reemplaza.<br>Cambio de pestaña o de vista: la selección se conserva.<br>DESCARTAR CAMBIOS: confirmación MSG-73; al confirmar se restablece el último menú guardado (o se vacía si no hay).<br>Usuario sin rol Administrador que intenta guardar: MSG-39 (403). |  |  |  |
| Postcondición: El menú del día de la fecha queda definido; el armado de menús completos y los pedidos solo ofrecen estas opciones y todo queda con estado Disponible. |  |  |  |
| Excepciones:<br>Falla al guardar: MSG-74; se conserva el menú anterior y la selección en pantalla.<br>Falla al cargar el menú o los ítems: MSG-38.<br>Pérdida de conexión: MSG-09. |  |  |  |
| Reglas y mensajes aplicables: RV-45, RV-47 a RV-52, RV-55, RV-161, RV-162; RN-36, RN-37, RN-39, RN-40, RN-44, RN-135, RN-136, RN-142; RNF-14 a RNF-17; MSG-69 a 74, 219, 224, 09, 38, 39. |  |  |  |
| Componentes de implementación:<br>Interfaz: MenuDiaPage.tsx y hooks/useMenuDiaManagement.ts (pestañas con contadores, acordeón, selección masiva, barra fija); por implementar: pestañas "Opciones del día" y "Menús completos".<br>Datos: GET /api/productos/disponibles y GET /api/menus-completos (CUS03); PUT /api/menu-dia/hoy y GET /api/menu-dia. |  |  |  |


### CUS04.2: Marcar plato u opción como agotado o disponible


<!-- tabla 88 -->
| Código: CUS04.2 | Título: Marcar plato u opción como agotado o disponible (Vista 4.2) | Fecha: 21.10.2026 | Iteración: 3/3 |
|---|---|---|---|
| Actor(es): Administrador y Cocinero |  |  |  |
| Prioridad: Baja (Could) | Complejidad: Baja |  |  |
| Historia de usuario: HU14 · Marcar plato como agotado (C) |  |  |  |
| Requerimiento de origen: RF-14 (ampliado a componentes) |  |  |  |
| Descripción: Permite al administrador o al cocinero alternar el estado de un producto de carta o de una opción (componente) del menú guardado entre Disponible y Agotado durante el servicio, sin retirarlo del menú, para evitar que se tomen pedidos de lo que ya no hay. |  |  |  |
| Precondición: El usuario tiene sesión iniciada con rol Administrador o Cocinero y existe un menú del día definido para la fecha actual (la pestaña DISPONIBILIDAD EN SERVICIO solo se muestra en ese caso). |  |  |  |
| Flujo principal:<br>1. Accede a MENÚ DEL DÍA y abre la pestaña DISPONIBILIDAD EN SERVICIO.<br>2. El sistema muestra los productos de carta y las opciones del menú guardado con su estado (Disponible o Agotado).<br>3. Selecciona MARCAR COMO AGOTADO en el ítem correspondiente.<br>4. El sistema solicita confirmación con el nombre del ítem (MSG-75).<br>5. Confirma; el servidor actualiza el estado y el ítem permanece en el menú guardado.<br>6. El sistema muestra MSG-77 y refleja el estado Agotado sin que el usuario abandone la pantalla. |  |  |  |
| Flujo alterno:<br>Cancelar la confirmación: el ítem sigue Disponible.<br>El ítem ya está Agotado: se ofrece MARCAR COMO DISPONIBLE; tras confirmar (MSG-76) vuelve a ofrecerse y se muestra MSG-78.<br>Se agotan todas las opciones de una parte de un menú completo: el menú queda «No disponible hoy» (MSG-220) hasta reponer.<br>No existe menú definido para hoy: la pestaña no se muestra y, si se solicita por API, MSG-79.<br>Un ítem agotado se muestra «AGOTADO» y no es seleccionable en los pedidos nuevos (CUS06 y CUS07); una opción agotada que ya estaba en un pedido en armado se marca y debe cambiarse (MSG-223). |  |  |  |
| Postcondición: El estado queda actualizado. Un ítem Agotado deja de ser seleccionable en los pedidos nuevos; los pedidos ya registrados no se modifican y el menú guardado no cambia de composición. |  |  |  |
| Excepciones:<br>Falla al actualizar el estado: MSG-80; se conserva el estado anterior.<br>Pérdida de conexión: MSG-09. |  |  |  |
| Reglas y mensajes aplicables: RV-53, RV-54, RV-166; RN-41 a RN-43, RN-136; RNF-14; MSG-75 a 80, 220, 223, 09. |  |  |  |
| Componentes de implementación:<br>Interfaz: MenuDiaPage.tsx (pestaña Disponibilidad en Servicio).<br>Pedidos: validación de disponibilidad en CUS06.1, CUS06.2 y CUS07 (estado "AGOTADO" y revalidación al registrar). |  |  |  |


## 5. Interfaz (GUI)


<!-- tabla 89 -->
| Interfaz | RF | HU | CUS | Qué se hace dentro de la interfaz |
|---|---|---|---|---|
| 4. Menú del día | RF-13, RF-14 | HU13, HU14 | CUS04 (04.1, 04.2) | Definir las opciones por rol, los menús completos habilitados y los productos de carta del día, y marcar ítems como agotados durante el servicio. |


### Vista 4.1: Definir menú del día (CUS04.1) — restaurante.app/menu-dia

La Vista 4.1 está en Carta y menú > Menú del día. Sus zonas son:

<!-- tabla 90 -->
| Zona | Contenido |
|---|---|
| Encabezado | Título "Menú del Día", fecha del servicio, insignia de estado del menú ("Menú no definido aún" mientras no se haya guardado) y descripción. |
| Aviso informativo | MSG-71 mientras el menú no está definido. |
| Barra de pestañas | Opciones del día, Menús completos, Almuerzos y Segundos, Platos Extras / A la Carta, Desayunos, Combinados, Bebidas y Refrescos, y Otros y Guarniciones; con el menú definido se agrega Disponibilidad en Servicio. Cada pestaña muestra un contador y a la derecha está el botón VISTA COMPLETA / POR PESTAÑAS. |
| Opciones del día | Cinco secciones (Bebidas de desayuno, Platos de desayuno, Sopas, Entradas y Segundos) con casillas y SELECCIONAR TODOS / DESMARCAR TODOS. |
| Menús completos | Una tarjeta por menú con interruptor para habilitarlo hoy y el resumen de opciones por parte; si falta una parte, «No disponible hoy» (MSG-220) o MSG-219 al guardar. |
| Panel de categoría | Título, descripción, "N de M seleccionados", SELECCIONAR TODOS / DESMARCAR TODOS y cuadrícula de productos con casilla, nombre y precio; todas las categorías son de selección múltiple. |
| Vista de acordeón | Una sección por categoría con insignia "N seleccionados" y flecha para expandir o colapsar; el cuerpo se desplaza internamente. |
| Barra inferior fija | "Total en carta", indicador "Cambios sin guardar", DESCARTAR CAMBIOS y el botón primario GUARDAR MENÚ DEL DÍA. |

Evidencia de la implementación vigente (versión previa al ajuste de opciones por rol y menús completos): menú aún sin definir.
Figura 1. Pestaña Almuerzos y Segundos y barra inferior fija.
Figura 2. Pestaña Platos Extras / A la Carta: 11 productos.
Figura 3. Pestaña Desayunos (en la versión previa, selección única; ahora selección múltiple).
Figura 4. Pestaña Combinados: 3 productos.
Figura 5. Pestaña Bebidas y Refrescos: 15 productos.
Figura 6. Pestaña Otros y Guarniciones: 3 productos.
Figura 7. Vista completa (acordeón): sección Desayunos y botón POR PESTAÑAS.
Figura 8. Vista completa (acordeón): secciones con desplazamiento interno.

### Vista 4.2: Disponibilidad en servicio (CUS04.2) — restaurante.app/menu-dia (pestaña "Disponibilidad en Servicio")


<!-- tabla 91 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 92 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Pestaña "Disponibilidad en Servicio" | Solo visible si existe menú definido para hoy. |
| 2 | Lista de ítems del menú | Productos de carta y opciones con su estado (Disponible o Agotado) en insignia con texto. |
| 3 | Acción MARCAR COMO AGOTADO / DISPONIBLE | En cada ítem; abre la confirmación. |
| 4 | Diálogo de confirmación | MSG-75 o MSG-76 con el nombre del ítem; botón por defecto CANCELAR. |
| 5 | Aviso de resultado | MSG-77 o MSG-78 sin salir de la pantalla; MSG-80 si falla. |


## 6. Estados de la interfaz


<!-- tabla 93 -->
| Estado | Comportamiento visual |
|---|---|
| Menú no definido | Insignia "Menú no definido aún", aviso MSG-71, contadores en 0 y total en carta "0 productos". No se muestra la pestaña Disponibilidad en Servicio. |
| Menú definido sin cambios | Insignia de menú definido; productos guardados marcados y contadores con su cantidad; sin indicador de cambios; pestaña Disponibilidad en Servicio visible. |
| Con cambios sin guardar | Indicador pulsante "Cambios sin guardar" y botón DESCARTAR CAMBIOS en la barra inferior. |
| Guardando | Botón "Guardando menú…" deshabilitado (RV-52). |
| Éxito | MSG-70; desaparece el indicador de cambios. |
| Error | MSG-74 o MSG-80; se conserva la selección en pantalla o el estado anterior. |
| Por pestañas | Un panel de categoría a la vez; pestaña activa con borde. |
| Vista completa | Acordeón con todas las categorías; cuerpo con desplazamiento interno y barra inferior fija. |
| Pantalla compacta | Barra de pestañas con desplazamiento horizontal; controles de al menos 44 px. |
| Menú completo sin opciones | Tarjeta atenuada con MSG-220 («No disponible hoy») cuando una parte no tiene opciones disponibles; al habilitarlo sin opciones se muestra MSG-219 y no se guarda. |


## 7. Reglas de validación (RV)


<!-- tabla 94 -->
| Código | Regla | Elemento UI | Mensaje |
|---|---|---|---|
| RV-45 | Solo se ofrecen productos activos; si no existen productos activos no se permite definir el menú. | Paneles de categoría | MSG-69 |
| RV-47 | SELECCIONAR TODOS y DESMARCAR TODOS actúan solo sobre los ítems de la sección o pestaña activa. El botón alterna su texto según todos estén o no marcados. | Botón de selección masiva | — |
| RV-48 | Cada pestaña muestra el número de productos seleccionados de su categoría, actualizado en tiempo real; se resalta si es mayor que 0 y se muestra en gris neutro si es 0. | Insignia de la pestaña | — |
| RV-49 | La barra inferior permanece visible sin importar la pestaña, la vista o el desplazamiento, y muestra el total en carta. | Barra inferior fija | — |
| RV-50 | El indicador "Cambios sin guardar" aparece solo cuando la selección en pantalla difiere de la guardada, y desaparece al guardar o descartar. | Barra inferior | MSG-72 |
| RV-51 | Descartar cambios requiere confirmación. | Diálogo de confirmación | MSG-73 |
| RV-52 | Mientras se guarda, el botón queda deshabilitado con "Guardando menú…". | Botón GUARDAR MENÚ DEL DÍA | — |
| RV-53 | Marcar un plato como agotado o como disponible requiere confirmación que nombra el plato y solo procede sobre platos del menú guardado. | Diálogo de confirmación | MSG-75, 76 |
| RV-54 | Al registrar un pedido, el sistema revalida la disponibilidad de cada plato; un plato Agotado no puede seleccionarse, se muestra como "AGOTADO" y, si se agota durante el armado del pedido, se advierte al pulsar REGISTRAR PEDIDO. | Pedidos (CUS06 y CUS07) | Mensaje de CUS06 |
| RV-55 | Alternar entre POR PESTAÑAS y VISTA COMPLETA no modifica la selección ni el estado guardado. | Botón de vista | — |
| RV-161 | Un menú completo solo se habilita en el menú del día si cada una de sus partes tiene al menos una opción seleccionada. | Pestaña Menús completos | MSG-219 |
| RV-162 | Para guardar el menú del día debe haber al menos un producto de carta o un menú completo habilitado (reemplaza a RV-44). | Botón GUARDAR MENÚ DEL DÍA | MSG-224 |
| RV-166 | Una opción agotada no se puede elegir; si ya estaba en un pedido en armado, su línea se marca y debe cambiarse. | Armado y líneas del pedido | MSG-223, 79 |


## 8. Reglas de negocio y requerimientos no funcionales


<!-- tabla 95 -->
| Código | Regla |
|---|---|
| RN-36 | Existe a lo más un menú del día por fecha. El menú vigente es el de la fecha actual; guardar de nuevo reemplaza su contenido. |
| RN-37 | Los productos de carta del menú se agrupan por la categoría que tienen en el CUS03: Desayuno en Desayunos, Almuerzo en Almuerzos y Segundos, Platos Extras / A la Carta en su pestaña, Combinados, Bebidas y Refrescos, y Otro en Otros y Guarniciones. Los componentes se agrupan por rol en Opciones del día y los menús completos en su pestaña. |
| RN-39 | Solo los productos, componentes y menús completos activos (CUS03, RN-28 y RN-134) pueden formar parte del menú. Si uno se desactiva y está en el menú vigente, se retira de él. |
| RN-40 | Los productos se muestran con el precio vigente del CUS03; el menú no define precios. |
| RN-41 | Cada producto de carta y cada opción del menú guardado tiene estado Disponible (por defecto) o Agotado. Cambiar de estado es reversible y no lo retira del menú. Solo puede cambiarse si existe un menú definido para hoy. |
| RN-42 | Un ítem Agotado no se ofrece en los pedidos nuevos de mesa ni para llevar; los pedidos ya registrados no se modifican. |
| RN-43 | El Administrador y el Cocinero pueden alternar la disponibilidad de los platos. |
| RN-44 | Solo el Administrador define el menú del día. El servidor valida token y rol en cada operación. |
| RNF-14 | La interfaz no usa desplazamiento global: solo el cuerpo central se desplaza y la barra inferior permanece anclada al pie del contenedor. |
| RNF-15 | La barra de pestañas es adaptable: en pantallas compactas se desplaza horizontalmente y no se corta. |
| RNF-16 | El botón primario GUARDAR MENÚ DEL DÍA tiene contraste normativo (#D35400), altura táctil mínima de 44 px y estado de carga. |
| RNF-17 | La interfaz es operable con teclado y muestra foco visible en pestañas, opciones y botones (RNF-04). |
| RN-135 | El menú del día define las opciones de cada rol que se ofrecen hoy y los menús completos habilitados; los productos de carta se seleccionan como hasta ahora (todas las categorías de selección múltiple, incluida Desayuno). |
| RN-136 | Un menú completo está disponible solo si cada parte tiene al menos una opción disponible ese día; si no, aparece como "No disponible hoy". |
| RN-142 | Sin menú del día definido, el armado ofrece todos los componentes activos de cada rol y todos los menús completos activos. |


### 8.1 Reglas, mensajes y escenarios reemplazados por el ajuste de menús completos


<!-- tabla 96 -->
| Elemento anterior | Estado | Reemplazo |
|---|---|---|
| RV-44 y MSG-68 (guardar con al menos un producto) | Reemplazados | RV-162 y MSG-224 (producto de carta o menú completo habilitado) |
| RV-46 y RN-38 (desayuno del día único y opcional) | Derogadas | RN-135: los desayunos individuales son de selección múltiple y el desayuno completo se ofrece como menú completo |
| RV-47 (sin selección masiva en Desayunos) | Modificada | SELECCIONAR TODOS aplica a toda sección o pestaña |
| E-87, E-89 y E-90 | Actualizados | Pestañas nuevas y 55 productos de carta activos (Almuerzo = 8) |
| E-95 y E-97 | Reemplazados | E-381 a E-383 |


## 9. Catálogo de mensajes

Se reutilizan MSG-09 (conexión), MSG-38 (operación fallida) y MSG-39 (sin permiso). Los mensajes MSG-221 y MSG-222 pertenecen al armado de pedidos (CUS06).

<!-- tabla 97 -->
| Código | Mensaje (texto al usuario) | Tipo | Ubicación |
|---|---|---|---|
| MSG-69 | Registre productos antes de definir el menú del día. | Informativo | En la pantalla |
| MSG-70 | Menú del día guardado correctamente. | Éxito | Aviso temporal |
| MSG-71 | Todavía no definió el menú de hoy. Seleccione los productos en cada pestaña y pulse "Guardar menú del día". | Informativo | Aviso superior |
| MSG-72 | Cambios sin guardar | Indicador | Barra inferior |
| MSG-73 | ¿Descartar los cambios? Se restablecerá el menú guardado. | Confirmación | Diálogo |
| MSG-74 | No se pudo guardar el menú del día. Intente nuevamente. | Error | Aviso |
| MSG-75 | ¿Marcar [plato] como agotado? No se podrán tomar nuevos pedidos de este plato. | Confirmación | Diálogo |
| MSG-76 | ¿Marcar [plato] como disponible? Volverá a ofrecerse en los pedidos nuevos. | Confirmación | Diálogo |
| MSG-77 | [Plato] marcado como agotado. | Éxito | Aviso temporal |
| MSG-78 | [Plato] marcado como disponible. | Éxito | Aviso temporal |
| MSG-79 | No hay menú definido para hoy. | Informativo | En la pantalla |
| MSG-80 | No se pudo actualizar el plato. Intente nuevamente. | Error | Aviso |
| MSG-219 | [Menú] necesita al menos una opción en "[parte]". Seleccione opciones o quite el menú de hoy. | Error | Pestaña Menús completos |
| MSG-220 | [Menú] no está disponible hoy: no hay opciones en "[parte]". | Informativo | Tarjeta del menú |
| MSG-223 | La opción "[nombre]" se agotó. Elija otra en "[parte]". | Error | Armado y línea |
| MSG-224 | Seleccione al menos un producto de carta o habilite un menú completo con sus opciones. | Error | Sobre el botón GUARDAR MENÚ DEL DÍA |


## 10. Diccionario de datos


<!-- tabla 98 -->
| Campo | Tipo | Obligatorio | Formato | Notas |
|---|---|---|---|---|
| Fecha del menú | Fecha | Sí | Fecha actual | Única por menú |
| Productos de carta del menú | Lista de referencias | Condicional (RV-162) | Productos de carta activos | Del CUS03; todas las categorías de selección múltiple |
| Opciones del día | Lista de referencias por rol | Sí si hay un menú completo habilitado | Componentes activos | Bebida de desayuno, Plato de desayuno, Sopa, Entrada y Segundo |
| Menús completos habilitados | Lista de referencias | Condicional (RV-162) | Menús completos activos | Con cada parte con al menos una opción |
| Disponibilidad del ítem | Lista | Automático | Disponible / Agotado | Por defecto Disponible |
| Cambios sin guardar | Estado de interfaz | Automático | Sí / No | No se persiste |
| Vista | Estado de interfaz | Automático | Por pestañas / Completa | No se persiste |


### 10.1 Matriz de los 56 productos cargados en el menú del día

Cada producto activo se ofrece en la pestaña de su categoría. Son 56 productos cargados y 55 activos: «Menú almuerzo» está desactivado y lo reemplaza el Almuerzo completo (CUS03). Los precios son los vigentes en el CUS03.

<!-- tabla 99 -->
| N.º | Producto | Categoría (CUS03) | Precio (S/) | Pestaña |
|---|---|---|---|---|
| 1 | Caldo de gallina (Entrada) | Almuerzo (2) | 5.00 | Almuerzos y Segundos |
| 2 | Ejecutivo del día | Almuerzo (2) | 12.00 | Almuerzos y Segundos |
| 3 | Menú almuerzo | Almuerzo (2) | 8.00 | — (inactivo) |
| 4 | Menú ejecutivo de la casa | Almuerzo (2) | 14.00 | Almuerzos y Segundos |
| 5 | Ocopa arequipeña (Entrada) | Almuerzo (2) | 5.00 | Almuerzos y Segundos |
| 6 | Papa a la huancaína (Entrada) | Almuerzo (2) | 5.00 | Almuerzos y Segundos |
| 7 | Sopa a la minuta | Almuerzo (2) | 7.00 | Almuerzos y Segundos |
| 8 | Sopa a la minuta especial | Almuerzo (2) | 10.00 | Almuerzos y Segundos |
| 9 | Sopa criolla | Almuerzo (2) | 8.00 | Almuerzos y Segundos |
| 10 | Arroz chaufa de carne | Platos Extras / A la Carta (3) | 22.00 | Platos Extras / A la Carta |
| 11 | Arroz chaufa de pollo | Platos Extras / A la Carta (3) | 18.00 | Platos Extras / A la Carta |
| 12 | Bistec a lo pobre | Platos Extras / A la Carta (3) | 26.00 | Platos Extras / A la Carta |
| 13 | Caldo de gallina criollo (Plato fuerte) | Platos Extras / A la Carta (3) | 10.00 | Platos Extras / A la Carta |
| 14 | Ceviche de trucha | Platos Extras / A la Carta (3) | 24.00 | Platos Extras / A la Carta |
| 15 | Ceviche mixto | Platos Extras / A la Carta (3) | 28.00 | Platos Extras / A la Carta |
| 16 | Lomo saltado | Platos Extras / A la Carta (3) | 25.00 | Platos Extras / A la Carta |
| 17 | Pollo a la plancha | Platos Extras / A la Carta (3) | 20.00 | Platos Extras / A la Carta |
| 18 | Seco de pollo | Platos Extras / A la Carta (3) | 20.00 | Platos Extras / A la Carta |
| 19 | Seco de res | Platos Extras / A la Carta (3) | 24.00 | Platos Extras / A la Carta |
| 20 | Tallarines verdes con bistec | Platos Extras / A la Carta (3) | 25.00 | Platos Extras / A la Carta |
| 21 | Café pasado | Desayuno (1) | 3.50 | Desayunos |
| 22 | Café pasado con sándwich mixto | Desayuno (1) | 5.00 | Desayunos |
| 23 | Jugo de papaya | Desayuno (1) | 5.00 | Desayunos |
| 24 | Jugo surtido | Desayuno (1) | 6.00 | Desayunos |
| 25 | Pan con chicharrón | Desayuno (1) | 8.00 | Desayunos |
| 26 | Pan con huevo frito | Desayuno (1) | 3.00 | Desayunos |
| 27 | Pan con palta | Desayuno (1) | 3.50 | Desayunos |
| 28 | Pan con pollo deshilachado | Desayuno (1) | 4.50 | Desayunos |
| 29 | Pan con queso | Desayuno (1) | 3.50 | Desayunos |
| 30 | Pan con salchipollo | Desayuno (1) | 4.50 | Desayunos |
| 31 | Quaker con leche | Desayuno (1) | 3.50 | Desayunos |
| 32 | Quaker con leche y pan | Desayuno (1) | 3.50 | Desayunos |
| 33 | Quinua carretillera | Desayuno (1) | 3.00 | Desayunos |
| 34 | Quinua carretillera con pan | Desayuno (1) | 3.00 | Desayunos |
| 35 | Té e infusiones variadas | Desayuno (1) | 2.50 | Desayunos |
| 36 | Chaufa + Ceviche clásico | Combinados (4) | 28.00 | Combinados |
| 37 | Chaufa con chicharrón de pollo | Combinados (4) | 22.00 | Combinados |
| 38 | Dúo marino (Arroz con mariscos + ceviche) | Combinados (4) | 32.00 | Combinados |
| 39 | Agua mineral 600ml | Bebidas y Refrescos (5) | 2.50 | Bebidas y Refrescos |
| 40 | Agua mineral 700ml | Bebidas y Refrescos (5) | 3.00 | Bebidas y Refrescos |
| 41 | Coca-Cola Familiar 1.5L | Bebidas y Refrescos (5) | 9.00 | Bebidas y Refrescos |
| 42 | Coca-Cola Personal 500ml | Bebidas y Refrescos (5) | 3.50 | Bebidas y Refrescos |
| 43 | Gaseosa 500ml | Bebidas y Refrescos (5) | 3.50 | Bebidas y Refrescos |
| 44 | Inca Kola Familiar 1.5L | Bebidas y Refrescos (5) | 9.00 | Bebidas y Refrescos |
| 45 | Inca Kola Personal 500ml | Bebidas y Refrescos (5) | 3.50 | Bebidas y Refrescos |
| 46 | Jarra de chicha morada 1L | Bebidas y Refrescos (5) | 6.00 | Bebidas y Refrescos |
| 47 | Jarra de chicha morada 500ml | Bebidas y Refrescos (5) | 4.00 | Bebidas y Refrescos |
| 48 | Jarra de limonada clásica 1L | Bebidas y Refrescos (5) | 7.00 | Bebidas y Refrescos |
| 49 | Jarra de limonada clásica 500ml | Bebidas y Refrescos (5) | 4.00 | Bebidas y Refrescos |
| 50 | Jarra de limonada frozen 1L | Bebidas y Refrescos (5) | 9.00 | Bebidas y Refrescos |
| 51 | Jarra de limonada frozen 500ml | Bebidas y Refrescos (5) | 5.50 | Bebidas y Refrescos |
| 52 | Jarra de maracuyá 1L | Bebidas y Refrescos (5) | 7.00 | Bebidas y Refrescos |
| 53 | Jarra de maracuyá 500ml | Bebidas y Refrescos (5) | 4.00 | Bebidas y Refrescos |
| 54 | Porción de arroz blanco | Otro (6) | 3.00 | Otros y Guarniciones |
| 55 | Porción de canchita serrana | Otro (6) | 2.50 | Otros y Guarniciones |
| 56 | Porción extra de papas fritas | Otro (6) | 4.00 | Otros y Guarniciones |


## 11. Contrato de API

Todas las operaciones exigen token válido (401 sin token). La consulta de productos disponibles pertenece al CUS03; las demás operaciones son del servicio de menú del día.

<!-- tabla 100 -->
| Operación | Entrada | Respuestas |
|---|---|---|
| Consultar productos disponibles (GET /api/productos/disponibles) | categoria o rol (opcional) | 200: solo productos y componentes activos con categoría o rol y precio. Roles: todos. |
| Consultar menús completos (GET /api/menus-completos) | — | 200: menús completos activos con sus partes (CUS03). Roles: todos; el Administrador ve también los inactivos. |
| Consultar el menú del día (GET /api/menu-dia) | fecha (por defecto, hoy) | 200: productos de carta, opciones por rol, menusCompletos[{ id, nombre, precio, incluye, disponible, partes[{ nombre, opciones[{ productoId, nombre, agotado }] }] }] y disponibilidad de cada ítem; o indicación de que no hay menú definido. Roles: todos. |
| Guardar el menú del día (PUT /api/menu-dia/hoy) | { productosCarta[], opciones[] (componentes), menusCompletos[] } | 200: menú guardado. 400: sin productos ni menús (MSG-224), un menú habilitado sin opciones en una parte (MSG-219, con el nombre de la parte) o ítem no activo. 403: rol distinto de Administrador (MSG-39). |
| Cambiar la disponibilidad de un ítem | { producto, disponible } | 200: estado actualizado. 404: no hay menú de hoy o el ítem no pertenece a él (MSG-79). 403: rol no autorizado. Roles: Administrador y Cocinero. |


## 12. Escenarios de validación y criterios de aceptación


<!-- tabla 101 -->
| ID | Entrada / acción | Resultado esperado | Reglas | HU |
|---|---|---|---|---|
| E-87 | Entrar a MENÚ DEL DÍA sin menú definido | Fecha actual, insignia «Menú no definido aún», aviso MSG-71, pestañas Opciones del día, Menús completos y las seis categorías con contador 0, y barra inferior con «Total en carta: 0 productos». | RV-48, RV-49 | HU13 |
| E-88 | Cambiar de pestaña | Se muestra el panel de la categoría elegida con su título, descripción y "N de M seleccionados"; la selección de las otras pestañas se conserva y la página no se desplaza. | RN-37, RV-48 | HU13 |
| E-89 | Abrir Almuerzos y Segundos | Se listan 8 productos activos con su precio y «0 de 8 seleccionados». | RN-37 | HU13 |
| E-90 | Revisar el contenido de cada pestaña de categoría | Almuerzos y Segundos 8; Platos Extras / A la Carta 11; Desayunos 15; Combinados 3; Bebidas y Refrescos 15; Otros y Guarniciones 3 (55 productos de carta activos); Opciones del día con sus cinco secciones. | RN-37 | HU13 |
| E-91 | Marcar un producto | El contador de la pestaña sube y se resalta, el panel muestra "1 de N seleccionados", el total en carta suma 1 y aparece "Cambios sin guardar". | RV-48, RV-50 | HU13 |
| E-92 | Pulsar SELECCIONAR TODOS en Platos Extras / A la Carta | Se marcan los 11 productos; el contador muestra 11 y el botón pasa a DESMARCAR TODOS. | RV-47 | HU13 |
| E-93 | Pulsar DESMARCAR TODOS | Se desmarcan los productos de la pestaña y el contador vuelve a 0. | RV-47 | HU13 |
| E-94 | Seleccionar todos en una pestaña con otras ya seleccionadas | Solo cambia la pestaña activa; las demás conservan su selección. | RV-47 | HU13 |
| E-96 | Pulsar VISTA COMPLETA | Todas las categorías aparecen como secciones colapsables con su contador; la selección se conserva; el botón pasa a POR PESTAÑAS; expandir o colapsar no altera la selección. | RV-55 | HU13 |
| E-98 | Guardar un menú con productos seleccionados | MSG-70; la insignia indica menú definido, desaparece "Cambios sin guardar" y aparece la pestaña Disponibilidad en Servicio. | RN-36 | HU13 |
| E-99 | Desplazarse por una categoría extensa o cambiar de pestaña | La barra inferior con el botón GUARDAR MENÚ DEL DÍA permanece visible en todo momento. | RV-49, RNF-14 | HU13 |
| E-100 | Doble clic en GUARDAR MENÚ DEL DÍA | Se guarda una sola vez; el botón muestra "Guardando menú…" deshabilitado. | RV-52 | HU13 |
| E-101 | Entrar con un menú ya definido y modificarlo | Se muestran marcados los productos guardados; al guardar se reemplaza el menú de la fecha. | RN-36 | HU13 |
| E-102 | Pulsar DESCARTAR CAMBIOS | Se pide confirmación (MSG-73); al confirmar se restablece el menú guardado; al cancelar se conservan los cambios. | RV-51 | HU13 |
| E-103 | Entrar sin productos activos | MSG-69; no se permite definir el menú. | RV-45 | HU13 |
| E-104 | Desactivar en CUS03 un producto que está en el menú de hoy | El producto se retira del menú vigente (E-69 del CUS03) y deja de mostrarse en el menú del día. | RN-39 | HU12, HU13 |
| E-105 | Marcar un plato como agotado | Confirmación MSG-75 y luego MSG-77; el plato sigue en el menú con estado Agotado. | RV-53, RN-41 | HU14 |
| E-106 | Marcar como disponible un plato agotado | Confirmación MSG-76 y luego MSG-78; el plato vuelve a ofrecerse. | RV-53, RN-41 | HU14 |
| E-107 | El cocinero marca un plato como agotado | Se permite; mismo resultado que E-105. | RN-43 | HU14 |
| E-108 | Mozo o cajero arma un pedido con un plato agotado | El plato se muestra "AGOTADO" y no se puede seleccionar (CUS06 y CUS07). | RV-54, RN-42 | HU14, HU18, HU20 |
| E-109 | El cocinero agota un plato mientras el mozo arma el pedido | Al pulsar REGISTRAR PEDIDO el sistema revalida la disponibilidad y advierte que el plato acaba de agotarse (CUS06.1). | RV-54 | HU14, HU18 |
| E-110 | Un plato se agota después de haber sido pedido | Los pedidos ya registrados no se modifican. | RN-42 | HU14 |
| E-111 | Entrar sin menú definido | No aparece la pestaña Disponibilidad en Servicio; un cambio de disponibilidad solicitado por API responde MSG-79. | RN-41 | HU14 |
| E-112 | Falla del servidor al guardar el menú | MSG-74; se conserva la selección en pantalla y el menú anterior. | RNF-12 | HU13 |
| E-113 | Falla del servidor al cambiar la disponibilidad | MSG-80; se conserva el estado anterior. | — | HU14 |
| E-114 | Pantalla de ancho reducido | La barra de pestañas se desplaza horizontalmente sin romper el diseño y la barra inferior sigue visible. | RNF-15 | HU13 |
| E-115 | Uso solo con teclado | Se puede recorrer las pestañas, las opciones y los botones con Tab; el foco es visible. | RNF-17 | HU13, HU14 |
| E-116 | Usuario sin rol autorizado intenta guardar el menú | MSG-39 (403). | RN-44 | HU13 |
| E-381 | Definir el menú con 3 bebidas, 2 platos de desayuno, 1 sopa, 1 entrada, 2 segundos y los 3 menús habilitados | MSG-70; el armado ofrece solo esas opciones. | RV-161, RN-135 | HU13 |
| E-382 | Habilitar el Desayuno completo sin ninguna bebida | MSG-219; no se guarda. | RV-161 | HU13 |
| E-383 | Guardar sin productos de carta ni menús completos | MSG-224. | RV-162 | HU13 |
| E-384 | Marcar "Seco de pollo" como agotado | En 30 segundos el armado ya no lo ofrece; si estaba en un pedido en armado, MSG-223. | RV-166 | HU14 |
| E-385 | Se agotan todas las bebidas | El Desayuno completo queda "No disponible hoy" (MSG-220) hasta reponer. | RN-136 | HU14 |
| E-386 | No hay menú definido | El armado ofrece todos los componentes activos de cada rol. | RN-142 | HU13 |
| E-403 | Desactivar un componente que está en el menú de hoy | Se retira del menú y de las opciones del armado. | RN-134 | HU13 |


## 13. Matriz de justificación de usabilidad


<!-- tabla 102 -->
| Principio aplicado | Elemento de la interfaz | Decisión adoptada | Justificación |
|---|---|---|---|
| ISO 9241 – Eficacia | Pestañas por categoría y por rol | Una pestaña por categoría y una sección por rol de componente | La administradora define el menú sin recorrer una lista larga |
| ISO 9241 – Eficiencia | Selección masiva y barra fija | SELECCIONAR TODOS y GUARDAR siempre visible | Menos pasos para incluir todas las bebidas o todos los extras |
| Nielsen 1 – Visibilidad del estado | Contadores, indicador y insignia del menú | Contador por pestaña, «Cambios sin guardar» y «Menú no definido aún» | Siempre sabe cuánto lleva seleccionado y si falta guardar |
| Nielsen 1 – Visibilidad del estado | «No disponible hoy» y «Agotado» | El menú sin opciones se muestra atenuado con texto | Se entiende por qué no se puede pedir |
| Nielsen 2 – Mundo real | Nombres de menús y secciones | «Desayuno completo», «Almuerzo completo», «Solo segundo», «Incluye pan» | Mismo lenguaje del restaurante |
| Nielsen 3 – Control y libertad | Descartar cambios y vista completa | DESCARTAR CAMBIOS y alternar la vista sin perder la selección | Puede deshacer sin penalización |
| Nielsen 5 – Prevención de errores | Validación al guardar y confirmación de agotado | No guarda un menú completo sin opciones ni un menú vacío; confirma con el nombre del ítem | Evita menús que cocina no puede preparar y agotados por error |
| Nielsen 7 – Flexibilidad y eficiencia | Menús habilitados por día | Lo que no se ofrece hoy no aparece en el armado | Menos ruido en hora pico |
| Shneiderman 2 – Usabilidad universal | Pestañas y controles | Pestañas con desplazamiento horizontal, controles de 44 px o más y foco visible | Atiende pantallas compactas y teclado |
| Shneiderman 3 – Retroalimentación | Avisos MSG-70, 77 y 78 | Respuesta inmediata a cada acción | Sabe qué pasó |
| Shneiderman 6 – Reversión | Disponible / Agotado | Cambiar de estado es reversible | Acciones reversibles |


## 14. Matriz de trazabilidad


### 14.1 Requerimiento → historia → caso de uso → vista → reglas → API → escenarios


<!-- tabla 103 -->
| RF | HU | CUS | Vista | Reglas / mensajes | API | Escenarios | Actor |
|---|---|---|---|---|---|---|---|
| RF-13 Definir menú del día | HU13 (S) | CUS04.1 | 4.1 | RV-45, 47 a 52, 55, 161, 162; RN-36, 37, 39, 40, 44, 135, 136, 142; MSG-69 a 74, 219, 224 | Consultar productos y menús; consultar menú; guardar menú | E-87 a E-94, E-96, E-98 a E-104, E-112, E-114 a E-116, E-381 a E-383, E-386, E-403 | Administrador |
| RF-14 Marcar plato agotado | HU14 (C) | CUS04.2 | 4.2 | RV-53, 54, 166; RN-41 a 43, 136; MSG-75 a 80, 220, 223 | Cambiar disponibilidad | E-105 a E-111, E-113, E-384, E-385 | Administrador y Cocinero |


### 14.2 Regla → elemento de interfaz → componente → escenario


<!-- tabla 104 -->
| Regla | Elemento de interfaz | Componente | Escenarios | Caso de uso |
|---|---|---|---|---|
| RV-45, RN-39 | Paneles de categoría con productos activos | GET /api/productos/disponibles; MenuDiaPage.tsx | E-103, E-104 | CUS04.1 |
| RV-47 | Botón SELECCIONAR TODOS / DESMARCAR TODOS | useMenuDiaManagement.ts (handleSeleccionarVarios, handleDesmarcarVarios) | E-92 a E-94 | CUS04.1 |
| RV-48, RN-37 | Insignia de conteo por pestaña | MenuDiaPage.tsx | E-88 a E-91 | CUS04.1 |
| RV-49, RNF-14 | Barra inferior fija con total en carta | MenuDiaPage.tsx (estructura shrink-0 en contenedor confinado) | E-87, E-99 | CUS04.1 |
| RV-50 | Indicador "Cambios sin guardar" | MenuDiaPage.tsx; useMenuDiaManagement.ts | E-91, E-98 | CUS04.1 |
| RV-51 | Descartar cambios con confirmación | MenuDiaPage.tsx (modal de confirmación) | E-102 | CUS04.1 |
| RV-52 | Botón "Guardando menú…" | MenuDiaPage.tsx | E-100 | CUS04.1 |
| RV-55 | Botón VISTA COMPLETA / POR PESTAÑAS (acordeón) | MenuDiaPage.tsx | E-96 | CUS04.1 |
| RV-53, RN-41 | Pestaña Disponibilidad en Servicio y confirmación | MenuDiaPage.tsx | E-105, E-106, E-111 | CUS04.2 |
| RV-54, RN-42 | Estado "AGOTADO" y revalidación en pedidos | Pantallas de pedido (CUS06 y CUS07) | E-108 a E-110 | CUS04.2 / CUS06, 08 |
| RN-43, RN-44 | Control de rol en cada operación | Autorización de la API | E-107, E-116 | CUS04.1, 05.2 |
| RNF-15, RNF-17 | Barra de pestañas con desplazamiento horizontal; foco visible | MenuDiaPage.tsx | E-114, E-115 | CUS04.1, 05.2 |
| RV-161 | Tarjeta de menú completo y MSG-219 | MenuDiaPage.tsx (por implementar) | E-381, E-382 | CUS04.1 |
| RV-162 | Botón GUARDAR MENÚ DEL DÍA y MSG-224 | MenuDiaPage.tsx (por implementar) | E-383 | CUS04.1 |
| RV-166, RN-136 | Estado «No disponible hoy» y opción agotada | MenuDiaPage.tsx; pantallas de pedido (por implementar) | E-384, E-385 | CUS04.2 |


### 14.3 Categoría del CUS03 → pestaña del CUS04 → productos


<!-- tabla 105 -->
| Categoría (valor CUS03) | Clave del enum | Pestaña del CUS04 | Productos | Selección | Icono |
|---|---|---|---|---|---|
| Desayuno (1) | Desayuno | Desayunos | 15 | Múltiple | Coffee |
| Almuerzo (2) | Almuerzo | Almuerzos y Segundos | 8 | Múltiple | UtensilsCrossed |
| Platos Extras / A la Carta (3) | PlatosExtras | Platos Extras / A la Carta | 11 | Múltiple | Sparkles |
| Combinados (4) | Combinados | Combinados | 3 | Múltiple | Flame |
| Bebidas y Refrescos (5) | Bebidas | Bebidas y Refrescos | 15 | Múltiple | CupSoda |
| Otro (6) | Otro | Otros y Guarniciones | 3 | Múltiple | Layers |
| Total |  |  | 55 |  |  |


### 14.4 Componentes de implementación


<!-- tabla 106 -->
| Capa | Archivo / componente | Responsabilidad en el CUS04 |
|---|---|---|
| Interfaz | frontend/src/pages/MenuDiaPage.tsx | Pestañas con contadores, vista de acordeón, paneles por categoría, pestaña Disponibilidad en Servicio, barra inferior fija, indicador de cambios y confirmaciones |
| Estado | frontend/src/hooks/useMenuDiaManagement.ts | Gestión del estado del menú, selección individual y masiva (handleSeleccionarVarios, handleDesmarcarVarios) y detección de cambios |
| Interfaz | frontend/src/types/producto.ts | Etiquetas de categoría (CATEGORIA_LABELS) usadas en los paneles |
| Aplicación | ProductoService.ListarDisponiblesAsync | Productos activos categorizados que alimentan el menú |
| Interfaz | frontend/src/pages/MenuDiaPage.tsx | Por implementar: pestañas Opciones del día y Menús completos; desayunos de selección múltiple |
| Aplicación | Servicio de menú del día | Por implementar: opciones por rol, menús completos habilitados y disponibilidad de opciones (PUT /api/menu-dia/hoy) |


### 14.5 Verificación del módulo


<!-- tabla 107 -->
| Verificación | Resultado |
|---|---|
| Compilación del frontend | tsc -b y vite build finalizados con código de salida 0. |
| Ejecución local | Pantalla verificada en http://localhost:5173 (capturas de la Vista 4.1). |
| Ajuste de menús completos | Pendiente: implementarlo y volver a ejecutar la compilación y las pruebas. |


## 15. Evaluación del prototipo y mejoras incorporadas


<!-- tabla 108 -->
| Hallazgo | Principio | Mejora incorporada |
|---|---|---|
| Solo existía un «desayuno del día» de selección única; no se podía ofrecer quaker con seco de pollo | Nielsen 2; modelo del negocio | Opciones del día por rol de componente y menús completos habilitados |
| El menú solo elegía entre productos con precio | Trazabilidad | Menús completos con precio fijo y componentes sin precio |
| El mozo podría ofrecer un menú sin sopa o sin bebida disponible | Nielsen 5 | Validación RV-161 y estado «No disponible hoy» |
| Sin menú definido, el armado mostraría listas largas | Nielsen 8 | Alternativa RN-142 y recomendación de definir el menú al inicio del día |
| No hay bocetos de las pestañas Opciones del día y Menús completos | Trazabilidad | Diseñarlos en Figma con los estados de la sección 6 |


## 16. Dependencias con otros casos de uso


<!-- tabla 109 -->
| Caso de uso | Relación con el CUS04 |
|---|---|
| CUS03 Gestión de productos | Provee los productos, componentes y menús completos activos con su categoría o rol y precio. Desactivar uno lo retira del menú vigente (CUS03.4, RN-28); un cambio de categoría reubica el producto en la pestaña correspondiente. |
| CUS06 Pedido de mesa | Ofrece solo los productos del menú vigente. Los platos Agotados se muestran "AGOTADO" y no se pueden seleccionar; al registrar el pedido se revalida la disponibilidad (CUS06.1) y al agregar productos solo se ofrecen los disponibles (CUS06.2). |
| CUS07 Pedido para llevar | Ofrece solo los productos del menú vigente y bloquea los platos Agotados. |


<!-- tabla 110 -->
| N.º | Punto | Decisión adoptada o tarea |
|---|---|---|
| 1 | Iteración de CUS04.1 | Decisión: CUS04.1 queda en 2/3 por la regla Media = 2/3; en la primera entrega el armado usa todo lo activo (RN-142) y los pedidos funcionan sin menú definido. |
| 2 | Interfaz y pruebas ya hechas | La pestaña Desayunos pasa de selección única a múltiple y desaparece «Sin desayuno especial hoy»: ajustar la interfaz y las pruebas del módulo. |
| 3 | Bocetos | Diseñar en Figma el armado de menús completos, la pestaña Menús completos y las secciones por rol del menú del día. |


# Anexo A. Lineamientos transversales de diseño y sesión (no son casos de uso)

Cerrar sesión, la barra superior y la expiración de sesión forman parte de la navegación y de la seguridad del sistema; no son requerimientos funcionales ni casos de uso. Se documentan aquí porque las reglas (RV-31, RV-32; RN-19 a RN-21; RNF-08, RNF-09; MSG-40 a 43 y 50) se aplican a todos los CUS. Cambiar contraseña, que sí es función de negocio, está en el CUS02.6.

## A.1 Decisiones adoptadas


<!-- tabla 111 -->
| Tema | Decisión | Vacío que cubre |
|---|---|---|
| Barra superior | Visible en todas las pantallas autenticadas: muestra nombre y rol del usuario, "Cambiar contraseña" (solo Administrador) y "Cerrar sesión". En móvil se agrupa en un menú de avatar. | No son RF ni tienen CUS propio |
| Cierre de sesión manual | Pide confirmación; el foco inicial queda en CERRAR SESIÓN (Enter confirma) y Esc cancela. Al terminar vuelve al login con un mensaje. | Anexo A |
| Invalidación del acceso | El servidor registra el token como revocado hasta su vencimiento; así el botón Atrás o un token copiado no dan acceso. | Faltaba definir cómo se invalida |
| Inactividad | Sesión de 30 minutos. A los 28 se avisa con la opción CONTINUAR, que renueva el token; si no responde, se cierra la sesión. | "Sesión expiró" sin tiempo ni aviso |
| Auditoría | Se registran los cierres de sesión (manual, inactividad o expiración) y los cambios de contraseña. | Control de la dueña |


## A.2 Comportamiento


<!-- tabla 112 -->
| Situación | Comportamiento |
|---|---|
| Cerrar sesión | 1. El usuario pulsa CERRAR SESIÓN en la barra superior.<br>2. El sistema muestra MSG-40 con el foco en CERRAR SESIÓN.<br>3. Confirma con el botón o con Enter.<br>4. El sistema muestra "Cerrando sesión…" y el servidor revoca el token y registra el cierre.<br>5. El sistema elimina los datos de sesión del equipo, redirige al login y muestra MSG-41. |
| Cierre por inactividad | 1. A los 28 minutos sin actividad, el sistema muestra MSG-42.<br>2. Si pulsa CONTINUAR, el sistema renueva el token y la sesión sigue.<br>3. Si no responde, a los 30 minutos cierra la sesión y muestra MSG-43 en el login. |
| Otros casos | Cancelar el cierre (botón o Esc): la sesión continúa.<br>Retroceder con el navegador después de cerrar sesión: redirige al login sin mostrar datos.<br>Falla del servidor al cerrar: se cierra igualmente en el equipo y se muestra MSG-50.<br>Pérdida de conexión: MSG-09. |


## A.3 Reglas de validación y de negocio


<!-- tabla 113 -->
| Código | Regla | Elemento UI | Mensaje |
|---|---|---|---|
| RV-31 | Cerrar sesión pide confirmación, con foco inicial en CERRAR SESIÓN, Enter para confirmar y Esc para cancelar. | Diálogo de cierre | MSG-40 |
| RV-32 | Dos minutos antes de expirar, se avisa al usuario con la opción CONTINUAR. | Aviso de sesión | MSG-42 |


<!-- tabla 114 -->
| Código | Regla |
|---|---|
| RN-19 | Al cerrar la sesión (manual, por inactividad o expiración) el servidor revoca el token hasta su vencimiento. |
| RN-20 | La sesión expira a los 30 minutos de inactividad, con aviso a los 28 minutos. Única excepción: el Cocinero en la pantalla de comandas de cocina, que mantiene la sesión vigente mientras esté abierta (RN-82, CUS09). |
| RN-21 | Los cierres de sesión (con su motivo) y los cambios de contraseña se registran en auditoría. |
| RNF-08 | La barra superior es visible en todas las pantallas autenticadas, se adapta a móvil (menú de avatar) y es operable con teclado. |
| RNF-09 | Las pantallas protegidas no se guardan en la caché del navegador (Cache-Control: no-store) y cada ruta verifica el token al cargar. |


## A.4 Catálogo de mensajes


<!-- tabla 115 -->
| Código | Mensaje (texto al usuario) | Tipo | Ubicación |
|---|---|---|---|
| MSG-40 | ¿Cerrar sesión? Tendrá que ingresar nuevamente para usar el sistema. | Confirmación | Diálogo |
| MSG-41 | Sesión cerrada correctamente. | Éxito | Pantalla de login |
| MSG-42 | Su sesión vencerá en 2 minutos por inactividad. ¿Desea continuar? (botón CONTINUAR) | Aviso | Ventana de aviso |
| MSG-43 | Su sesión expiró por inactividad. Inicie sesión nuevamente. | Informativo | Pantalla de login |
| MSG-50 | No se pudo cerrar la sesión en el servidor, pero se cerró en este equipo. | Aviso | Pantalla de login |


## A.5 Estados de la interfaz


<!-- tabla 116 -->
| Estado | Comportamiento visual |
|---|---|
| Barra superior | Nombre y rol del usuario, "Cambiar contraseña" (solo Administrador) y "Cerrar sesión"; en móvil, menú de avatar con las mismas opciones. |
| Confirmar cierre | Diálogo MSG-40 con CANCELAR y CERRAR SESIÓN; foco inicial en CERRAR SESIÓN; Esc cancela. |
| Cerrando | Botón "Cerrando sesión…" deshabilitado. |
| Sesión cerrada | Login con MSG-41, MSG-43, MSG-48 o MSG-50 según el motivo. |
| Aviso de expiración | Ventana MSG-42 con cuenta regresiva de 2 minutos y botón CONTINUAR con foco. |


## A.6 Contrato de API


<!-- tabla 117 -->
| Endpoint | Entrada | Respuestas |
|---|---|---|
| POST /api/auth/logout | { motivo: manual \| inactividad } | 204: token revocado y cierre registrado. 401: token inválido (el cliente cierra igualmente). |
| POST /api/auth/renovar | — | 200: { token } nuevo (acción CONTINUAR). 401: sesión vencida. |


## A.7 Escenarios de validación y criterios de aceptación


<!-- tabla 118 -->
| ID | Entrada / acción | Resultado esperado | Reglas | HU |
|---|---|---|---|---|
| E-38 | Revisar la barra superior en cualquier pantalla | Muestra nombre, rol y Cerrar sesión; "Cambiar contraseña" solo para el Administrador. | RN-16, RNF-08 | Anexo A |
| E-39 | Cerrar sesión y confirmar | Vuelve al login con MSG-41; el cierre queda en auditoría. | RN-19, 21 | Anexo A |
| E-40 | Cancelar el cierre (botón o Esc) | La sesión continúa y el diálogo se cierra. | RV-31 | Anexo A |
| E-41 | Pulsar Atrás tras cerrar sesión | Redirige al login sin mostrar datos. | RNF-09 | Anexo A |
| E-42 | Usar un token después de cerrar sesión | El servidor responde 401. | RN-19 | Anexo A |
| E-43 | 28 minutos de inactividad y pulsar CONTINUAR | Aparece MSG-42; la sesión se renueva. | RN-20, RV-32 | Anexo A |
| E-44 | 30 minutos de inactividad sin responder | Cierra la sesión y muestra MSG-43. | RN-20 | Anexo A |
| E-45 | Cerrar sesión con el servidor caído | Se cierra en el equipo y se muestra MSG-50. | RN-19 | Anexo A |
| E-54 | Solo teclado | Tab recorre la barra y los formularios; Enter confirma; Esc cancela; el foco es visible. | RNF-08 | Anexo A |


## A.8 Matriz de justificación de usabilidad


<!-- tabla 119 -->
| Principio aplicado | Elemento de la interfaz | Decisión adoptada | Justificación |
|---|---|---|---|
| ISO 9241 – Eficacia | Barra superior y diálogo de cierre | Opciones siempre visibles y confirmación clara | El usuario cierra sesión o cambia su contraseña sin ayuda |
| ISO 9241 – Eficiencia | Foco y atajos | Foco en CERRAR SESIÓN, Enter confirma, Esc cancela | Pocas acciones para salir del sistema |
| ISO 9241 – Satisfacción | Mensajes y avisos | Textos claros con aviso previo a la expiración | Sin sorpresas durante el servicio |
| Nielsen 1 – Visibilidad del estado | Barra, "Cerrando…", "Guardando…" y aviso | Nombre y rol siempre visibles; indicadores de proceso; cuenta regresiva | Sabe con qué cuenta está y qué ocurre |
| Nielsen 2 – Mundo real | Textos | "Cerrar sesión" y "Cambiar contraseña" en lenguaje cotidiano | Coincide con el vocabulario del personal |
| Nielsen 3 – Control y libertad | Cancelar, Esc y CONTINUAR | Puede cancelar el cierre o prolongar la sesión | Mantiene el control |
| Nielsen 4 – Consistencia | Diálogos y formularios | Mismos botones y patrón que los CUS01 y CUS02 | Evita reaprendizaje |
| Nielsen 5 – Prevención de errores | Mostrar y confirmación | Revelar cada contraseña y confirmar la nueva; confirmar el cierre | Evita contraseñas mal escritas y cierres accidentales |
| Nielsen 6 – Reconocimiento | Barra superior | Nombre y rol visibles en todas las pantallas | No necesita recordar con qué cuenta ingresó |
| Nielsen 8 – Minimalismo | Barra y formulario | Solo dos opciones y tres campos | Sin distracciones |
| Nielsen 9 – Recuperarse de errores | Mensajes | MSG-45 y MSG-49 indican qué hacer | Facilita corregir |
| Shneiderman 1 – Consistencia | Estilo | Misma paleta, botones y mensajes del sistema | Comportamiento predecible |
| Shneiderman 2 – Usabilidad universal | Móvil, teclado y contraste | Menú de avatar en móvil; contraste 4.5:1; orden de tabulación | Atiende distintos dispositivos y niveles |
| Shneiderman 3 – Retroalimentación | Avisos y estados | Respuesta a cada acción | Sabe qué pasó |
| Shneiderman 4 – Cierre | Mensajes finales | MSG-41 y MSG-47 confirman que el proceso terminó | Indica que la tarea concluyó |
| Shneiderman 5 – Prevenir errores | Validación y bloqueo | No envía con errores; cierra la sesión tras 5 intentos fallidos | Evita errores y abusos |
| Shneiderman 6 – Reversión | Cancelar y CONTINUAR | Salir sin cambios o prolongar la sesión | Acciones reversibles |
| Shneiderman 7 – Control del usuario | Aviso de expiración | El usuario decide continuar antes del cierre | Evita cierres inesperados |
| Shneiderman 8 – Memoria a corto plazo | Barra superior | Muestra nombre y rol en vez de pedir recordarlos | Reduce la carga de memoria |


## A.9 Observaciones y decisiones de trazabilidad


<!-- tabla 120 -->
| N.º | Punto | Decisión adoptada o tarea |
|---|---|---|
| 1 | La expiración de sesión por inactividad (RN-20) no tiene un RF que la respalde. | Se documenta como requerimiento no funcional de seguridad; cierra la observación sobre expiración de sesión del CUS01. |
| 2 | Cerrar sesión y la barra superior no tienen pantalla propia. | Se tratan como lineamiento de diseño aplicado a todas las vistas; no son RF ni CUS. |
| 3 | Revocar tokens exige una tabla o caché adicional en el servidor. | Incluir la tarea técnica en la iteración (tabla TokenRevocado con limpieza al vencer). |
| 4 | No hay boceto del aviso de expiración ni del menú de avatar en móvil. | Diseñarlos en Figma con los estados de A.5. |
