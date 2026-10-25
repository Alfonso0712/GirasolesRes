RESTAURANTE GIRASOLES
Anexo: CUS01 – Inicio de sesión (Interfaz 1: Login)
Casos de uso, interfaz, reglas, API, pruebas y trazabilidad · Metodología XP · Iteraciones 1/3 y 2/3

# 1. Ficha del CUS general


<!-- tabla 1 -->
| Campo | Detalle |
|---|---|
| CUS general | CUS01: Inicio de sesión |
| Interfaz (GUI) | Interfaz 1: Login |
| Actor(es) | Administrador, Cajero, Mozo y Cocinero |
| HU / RF de origen | HU01, HU07 / RF-01, RF-07 |
| Descripción | Interfaz de acceso al sistema. Agrupa el inicio de sesión de los cuatro roles y la recuperación de contraseña del administrador. |
| Fuera de alcance | Cerrar sesión, el acceso denegado por rol y la expiración de sesión no son casos de uso: forman parte de la navegación y del diseño transversal (ver RN-06 y RNF-02). Cambiar contraseña se documenta en el CUS02.6. |


<!-- tabla 2 -->
| CUS | Título | HU | RF | Prioridad | Iteración | Complejidad |
|---|---|---|---|---|---|---|
| CUS01.1 | Iniciar sesión | HU01 | RF-01 | Alta (Must) | 1/3 | Media |
| CUS01.2 | Recuperar contraseña | HU07 | RF-07 | Media (Should) | 2/3 | Media |

Criterio: la prioridad se obtiene de la validación MoSCoW de la HU (Must = Alta, Should = Media, Could = Baja) y la iteración sigue la prioridad (Alta = 1/3, Media = 2/3, Baja = 3/3).

# 2. Decisiones adoptadas

Estas decisiones cierran los valores abiertos del CUS01 y son la base de la construcción. Si se modifican, debe actualizarse este anexo.

<!-- tabla 3 -->
| Tema | Decisión | Vacío que cubre |
|---|---|---|
| Identificador de acceso | Usuario (texto), no correo. El correo se usa solo para recuperar la contraseña. | El diseño del login pide "Usuario" |
| Formato de usuario | 3 a 30 caracteres, letras, números, punto, guion y guion bajo; sin espacios internos. | Faltaba regla de formato |
| Contraseña (login) | Obligatoria; no se valida longitud al ingresar. Al crear o cambiar: mínimo 8 caracteres, máximo 64. | "Requisitos mínimos" sin valor |
| Bloqueo por intentos | 5 intentos fallidos consecutivos bloquean el acceso 15 minutos. | Faltaba política |
| Sesión | Token JWT con expiración de 30 minutos de inactividad; al vencer se pide iniciar sesión. | "Sesión expiró" sin tiempo |
| Almacenamiento de contraseñas | Hash con PasswordHasher de ASP.NET Identity (PBKDF2). Nunca texto plano. | Faltaba RNF |
| Recuperación | Código numérico de 6 dígitos enviado al correo registrado, válido 15 minutos y de un solo uso. | CUS01.2 mezclaba enlace y código |
| Destino tras el login | Todos los roles ingresan a /inicio; el menú muestra solo los módulos del rol. | "Menú principal" sin definir |
| Acceso de demostración | Solo en entorno de desarrollo (variable de configuración); no existe en producción. | No estaba en tablas ni RF |


# 3. Análisis del usuario (Diseño Centrado en el Usuario)


<!-- tabla 4 -->
| Aspecto | Descripción |
|---|---|
| Quién usa el formulario | Administradora (dueña), cajero, mozos y cocinero de Girasoles. Experiencia tecnológica básica; uso en computadora del local y en celular; muchas veces con prisa durante el servicio. |
| Necesidades | Ingresar rápido; saber si escribió bien sus datos; ver la contraseña para verificarla; saber qué hacer si la olvida o si su cuenta no funciona; usar el formulario con el celular. |
| Dificultades previsibles | Errores al teclear en pantallas pequeñas; Bloq Mayús activado; olvido de contraseña (solo la administradora puede restablecerla); presionar varias veces INGRESAR sin respuesta; no entender mensajes técnicos. |
| Contexto de uso | Local de atención al público con ruido e interrupciones; conexión a internet que puede ser inestable. |


# 4. Plantillas de casos de uso


## CUS01.1: Iniciar sesión


<!-- tabla 5 -->
| Código: CUS01.1 | Título: Iniciar sesión (Vista 1.1) | Fecha: 15.10.2026 | Iteración: 1/3 |
|---|---|---|---|
| Actor(es): Administrador, Cajero, Mozo y Cocinero |  |  |  |
| Prioridad: Alta (Must) | Complejidad: Media |  |  |
| Historia de usuario: HU01 · Iniciar sesión |  |  |  |
| Requerimiento de origen: RF-01 |  |  |  |
| Descripción: Permite a los usuarios autenticarse con su usuario y contraseña para acceder a las funciones de su rol. |  |  |  |
| Precondición: El usuario está registrado y activo. No existe una sesión vigente (si existe, se redirige a /inicio). |  |  |  |
| Flujo principal:<br>1. El usuario abre el sistema y visualiza el formulario con el foco en el campo Usuario.<br>2. Ingresa su usuario y su contraseña (opcionalmente pulsa "Mostrar" para verificarla).<br>3. Pulsa INGRESAR o presiona Enter.<br>4. El sistema recorta los espacios del usuario y valida los campos (RV-01 a RV-04).<br>5. El sistema deshabilita el botón y muestra "Ingresando…" (RV-08).<br>6. El servidor verifica el usuario, la contraseña, el estado activo y que la cuenta no esté bloqueada.<br>7. El servidor registra el ingreso, genera el token con el rol y lo devuelve.<br>8. El sistema muestra MSG-08 y redirige a /inicio con el menú según el rol. |  |  |  |
| Flujo alterno:<br>Campos vacíos o con formato inválido: se muestran MSG-01, MSG-02 o MSG-03 junto al campo, no se envía el formulario y el foco va al primer error.<br>Credenciales incorrectas: se muestra MSG-04, se conserva el usuario, se limpia la contraseña, se suma un intento fallido y el foco vuelve a Contraseña.<br>Usuario desactivado: se muestra MSG-05.<br>Cuenta bloqueada (5 intentos fallidos): se muestra MSG-06 y el botón se habilita al terminar el bloqueo.<br>Bloq Mayús activado: se muestra MSG-10 bajo la contraseña.<br>Usuario pulsa "¿Olvidó su contraseña?": pasa al CUS01.2. |  |  |  |
| Postcondición: El usuario queda autenticado, con token vigente y menú habilitado según su rol; el ingreso queda registrado. |  |  |  |
| Excepciones:<br>Falla de conexión o error del servidor: se muestra MSG-09, el botón se habilita y no se pierde el usuario escrito.<br>Respuesta inesperada del servidor: se muestra MSG-09 y se registra el incidente (sin datos sensibles). |  |  |  |
| Reglas y mensajes aplicables: RV-01 a RV-10; RN-01, RN-03, RN-05; RNF-01 a RNF-04; MSG-01 a MSG-10. |  |  |  |


## CUS01.2: Recuperar contraseña


<!-- tabla 6 -->
| Código: CUS01.2 | Título: Recuperar contraseña (Vista 1.2) | Fecha: 15.10.2026 | Iteración: 2/3 |
|---|---|---|---|
| Actor(es): Administrador |  |  |  |
| Prioridad: Media (Should) | Complejidad: Media |  |  |
| Historia de usuario: HU07 · Recuperar contraseña |  |  |  |
| Requerimiento de origen: RF-07 |  |  |  |
| Descripción: Permite a la administradora recuperar su contraseña mediante un código enviado a su correo registrado. |  |  |  |
| Precondición: La administradora tiene un correo registrado y el sistema puede enviar correos. Está en la pantalla de login. |  |  |  |
| Flujo principal:<br>1. Pulsa "¿Olvidó su contraseña?".<br>2. El sistema muestra la Vista 1.2 con el campo Correo y la ayuda MSG-17.<br>3. Ingresa su correo y pulsa ENVIAR CÓDIGO; el sistema valida el formato (RV-03, RV-04).<br>4. El sistema responde siempre con MSG-11 y, si el correo corresponde a la administradora, envía el código de 6 dígitos (RN-02, RN-04).<br>5. Ingresa el código, la nueva contraseña y su confirmación.<br>6. El sistema valida código, vigencia, longitud (8–64) y coincidencia.<br>7. El sistema guarda la nueva contraseña (hash), invalida el código y redirige al login con MSG-16. |  |  |  |
| Flujo alterno:<br>Correo vacío o con formato inválido: MSG-12; no se envía nada.<br>Correo que no corresponde a la administradora: se muestra el mismo MSG-11 y no se envía código (no se revela si existe).<br>Código incorrecto o vencido: MSG-13; puede solicitar uno nuevo (el anterior se invalida).<br>Contraseña fuera de rango o sin coincidir: MSG-14 o MSG-15.<br>Pulsa "Volver al inicio de sesión": regresa al login sin cambios. |  |  |  |
| Postcondición: La contraseña de la administradora queda actualizada, el código invalidado y puede ingresar por el CUS01.1. |  |  |  |
| Excepciones:<br>Falla del envío de correo: MSG-18; no se genera estado pendiente visible.<br>Falla de conexión: MSG-09. |  |  |  |
| Reglas y mensajes aplicables: RV-03, RV-04, RV-06; RN-02, RN-04, RN-05; RNF-01, RNF-03; MSG-09, MSG-11 a MSG-18. |  |  |  |


# 5. Interfaz (GUI)


<!-- tabla 7 -->
| Interfaz | RF | HU | CUS | Qué se hace dentro de la interfaz |
|---|---|---|---|---|
| 1. Login | RF-01, RF-07 | HU01, HU07 | CUS01 (01.1, 01.2) | Iniciar sesión con el rol correspondiente y recuperar la contraseña del administrador. |


### Vista 1.1: Iniciar sesión (CUS01.1) — restaurante.app/login


<!-- tabla 8 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 9 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Logo y título | Logo del sistema y encabezado "Iniciar sesión". |
| 2 | Instrucción | Texto guía: "Ingrese su usuario y contraseña para acceder al sistema". |
| 3 | Aviso de error | Aviso sobre el formulario para los mensajes MSG-04, MSG-05, MSG-06 y MSG-09. |
| 4 | Campo Usuario | Entrada de texto obligatoria; muestra MSG-01 o MSG-03 junto al campo. |
| 5 | Campo Contraseña | Entrada oculta por defecto con opción "Mostrar"; muestra MSG-02 y el aviso MSG-10 si las mayúsculas están activadas. |
| 6 | Botón INGRESAR | Envía las credenciales; durante el proceso se deshabilita y muestra "Ingresando…" (MSG-07). |
| 7 | Enlace "¿Olvidó su contraseña?" | Ubicado bajo el botón INGRESAR; abre la Vista 1.2. |
| 8 | Acceso de demostración | Caja visible solo en el entorno de desarrollo; no existe en producción. |


### Vista 1.2: Recuperar contraseña (CUS01.2) — restaurante.app/recuperar


<!-- tabla 10 -->
| [Insertar captura del diseño final en Figma: vista de escritorio y vista móvil, con los elementos numerados] |
|---|


<!-- tabla 11 -->
| N° | Elemento | Descripción |
|---|---|---|
| 1 | Título y ayuda | Encabezado "Recuperar contraseña" y la ayuda MSG-17 dirigida al personal. |
| 2 | Campo Correo electrónico | Entrada del correo registrado; muestra MSG-12 si el formato no es válido. |
| 3 | Botón ENVIAR CÓDIGO | Solicita el código de 6 dígitos; el sistema responde siempre con MSG-11 (o MSG-18 si falla el envío). |
| 4 | Campo Código | Entrada numérica de 6 dígitos; muestra MSG-13 si es incorrecto o venció. |
| 5 | Campo Nueva contraseña | Entrada oculta con opción "Mostrar"; muestra MSG-14 si no tiene entre 8 y 64 caracteres. |
| 6 | Campo Confirmar contraseña | Debe coincidir con la nueva contraseña; muestra MSG-15 si difieren. |
| 7 | Botón GUARDAR | Actualiza la contraseña y regresa al login con MSG-16. |
| 8 | Enlace "Volver al inicio de sesión" | Regresa al login sin guardar cambios. |


# 6. Estados de la interfaz de login


<!-- tabla 12 -->
| Estado | Comportamiento visual |
|---|---|
| Inicial | Foco en Usuario; campos vacíos; botón habilitado. |
| Foco | Borde del campo resaltado con anillo visible; orden de tabulación: Usuario → Contraseña → Mostrar → INGRESAR → ¿Olvidó su contraseña? |
| Error de campo | Borde rojo, ícono y texto de error bajo el campo; el foco va al primer campo con error. |
| Cargando | Botón deshabilitado con "Ingresando…"; campos de solo lectura. |
| Error de autenticación | Aviso sobre el formulario con MSG-04, MSG-05 o MSG-06; el usuario escrito se conserva y la contraseña se limpia. |
| Éxito | Aviso MSG-08 y redirección a /inicio. |
| Móvil | El panel izquierdo decorativo se oculta; el formulario ocupa todo el ancho; controles de al menos 44 px de alto. |


# 7. Reglas de validación (RV)


<!-- tabla 13 -->
| Código | Regla | Elemento UI | Mensaje |
|---|---|---|---|
| RV-01 | El usuario es obligatorio. | Campo Usuario | MSG-01 |
| RV-02 | La contraseña es obligatoria. | Campo Contraseña | MSG-02 |
| RV-03 | El usuario debe cumplir el formato definido (3–30 caracteres, sin espacios internos). En la recuperación, el correo debe tener formato válido. | Campo Usuario / Correo | MSG-03 / MSG-12 |
| RV-04 | Los espacios al inicio y al final del usuario o correo se eliminan antes de validar y enviar. | Campo Usuario / Correo | — |
| RV-05 | Cada error se muestra junto al campo que lo origina; los errores del servidor, en un aviso sobre el formulario. | Texto de error bajo el campo / banner | MSG-01 a MSG-06 |
| RV-06 | Todo mensaje indica qué debe corregir o hacer el usuario. | Catálogo de mensajes | Sección 5 |
| RV-07 | No se envía el formulario mientras existan errores de validación; el foco pasa al primer campo con error. | Botón INGRESAR | MSG-01 a MSG-03 |
| RV-08 | Durante el procesamiento el botón queda deshabilitado y muestra "Ingresando…" para evitar envíos repetidos. | Botón INGRESAR | MSG-07 |
| RV-09 | La contraseña se muestra oculta por defecto; "Mostrar" la revela solo de forma temporal. | Campo Contraseña / Mostrar | — |
| RV-10 | El error de autenticación no revela si falló el usuario o la contraseña, ni datos internos del sistema. | Banner de error | MSG-04 |


# 8. Reglas de negocio y requerimientos no funcionales de seguridad


<!-- tabla 14 -->
| Código | Regla |
|---|---|
| RN-01 | Solo los usuarios activos pueden iniciar sesión. |
| RN-02 | Solo la Administradora puede recuperar su contraseña por correo; el personal pide el restablecimiento a la administradora (RF-04, módulo de usuarios). |
| RN-03 | Tras 5 intentos fallidos consecutivos la cuenta se bloquea 15 minutos; un ingreso correcto reinicia el contador. |
| RN-04 | El código de recuperación vence a los 15 minutos, es de un solo uso y se invalida al generar uno nuevo. |
| RN-05 | Todo ingreso se registra con usuario, fecha, hora y resultado (exitoso o fallido) para auditoría. |
| RNF-01 | Las contraseñas se almacenan con hash; nunca se guardan ni se registran en texto plano. |
| RNF-02 | La autenticación usa JWT; el servidor valida el token y el rol en cada solicitud. |
| RNF-03 | La comunicación entre cliente y servidor se realiza por HTTPS. |
| RNF-04 | El formulario se adapta a escritorio y móvil, y es operable solo con teclado (Tab, Shift+Tab, Enter). |
| RN-06 | Las restricciones de acceso por rol y la expiración de sesión se gestionan fuera del formulario de login (ver sección 16, dependencia 2). |


# 9. Catálogo de mensajes


<!-- tabla 15 -->
| Código | Mensaje (texto al usuario) | Tipo | Ubicación |
|---|---|---|---|
| MSG-01 | Ingrese su usuario. | Error | Bajo el campo Usuario |
| MSG-02 | Ingrese su contraseña. | Error | Bajo el campo Contraseña |
| MSG-03 | El usuario debe tener entre 3 y 30 caracteres, sin espacios. | Error | Bajo el campo Usuario |
| MSG-04 | Usuario o contraseña incorrectos. Revise sus datos e intente nuevamente. | Error | Aviso sobre el formulario |
| MSG-05 | Su cuenta está desactivada. Comuníquese con la administradora. | Error | Aviso sobre el formulario |
| MSG-06 | Demasiados intentos. Intente nuevamente en 15 minutos. | Error | Aviso sobre el formulario |
| MSG-07 | Ingresando… (texto del botón mientras se valida) | Estado | Botón INGRESAR |
| MSG-08 | Ingreso correcto. Redirigiendo… | Éxito | Aviso sobre el formulario |
| MSG-09 | No se pudo conectar con el servidor. Verifique su conexión e intente nuevamente. | Error | Aviso sobre el formulario |
| MSG-10 | Mayúsculas activadas. | Aviso | Bajo el campo Contraseña |
| MSG-11 | Si el correo está registrado, recibirá un código de 6 dígitos en unos minutos. | Éxito | Vista 1.2 |
| MSG-12 | Ingrese un correo válido, por ejemplo: nombre@dominio.com. | Error | Bajo el campo Correo |
| MSG-13 | El código es incorrecto o ha vencido. Solicite uno nuevo. | Error | Bajo el campo Código |
| MSG-14 | La contraseña debe tener entre 8 y 64 caracteres. | Error | Bajo Nueva contraseña |
| MSG-15 | Las contraseñas no coinciden. | Error | Bajo Confirmar contraseña |
| MSG-16 | Contraseña actualizada. Ya puede iniciar sesión. | Éxito | Login (tras redirigir) |
| MSG-17 | Si es personal del restaurante, pida a la administradora que restablezca su contraseña. | Ayuda | Vista 1.2 |
| MSG-18 | No se pudo enviar el código. Intente nuevamente. | Error | Vista 1.2 |


# 10. Diccionario de datos


<!-- tabla 16 -->
| Campo | Tipo | Obligatorio | Longitud / formato | Notas |
|---|---|---|---|---|
| Usuario | Texto | Sí | 3–30; letras, números, . - _ | Se recorta; no distingue mayúsculas |
| Contraseña (login) | Texto | Sí | Sin límite de validación | Oculta por defecto; no se recorta |
| Correo (recuperación) | Texto | Sí | Formato de correo, máx. 100 | Debe existir como dato del usuario (ver sección 16, dependencia 1) |
| Código de recuperación | Numérico | Sí | 6 dígitos | Vence a los 15 min; un solo uso |
| Nueva contraseña | Texto | Sí | 8–64 | Se almacena con hash |
| Confirmar contraseña | Texto | Sí | Igual a Nueva contraseña | No se envía al servidor |


# 11. Contrato de API


<!-- tabla 17 -->
| Endpoint | Entrada | Respuestas |
|---|---|---|
| POST /api/auth/login | { usuario, contrasena } | 200: { token, rol, nombre }. 400: datos inválidos. 401: credenciales incorrectas. 403: usuario inactivo. 423: cuenta bloqueada. 500: error interno. |
| POST /api/auth/forgot-password | { correo } | 200: siempre el mismo cuerpo (MSG-11). 400: formato inválido. 500: error de envío. |
| POST /api/auth/reset-password | { correo, codigo, nuevaContrasena } | 200: contraseña actualizada. 400: código incorrecto/vencido o contraseña inválida. 500: error interno. |


# 12. Escenarios de validación y criterios de aceptación


<!-- tabla 18 -->
| ID | Entrada / acción | Resultado esperado | Reglas | HU |
|---|---|---|---|---|
| E-01 | Usuario y contraseña vacíos | MSG-01 y MSG-02 junto a cada campo; no se envía; foco en Usuario. | RV-01, 02, 05, 07 | HU01 |
| E-02 | Usuario con formato incorrecto (ej. "a b") | MSG-03 bajo Usuario; no se envía. | RV-03, 07 | HU01 |
| E-03 | Usuario válido y contraseña vacía | MSG-02 bajo Contraseña; foco en Contraseña. | RV-02, 07 | HU01 |
| E-04 | Credenciales incorrectas | MSG-04 sin indicar cuál dato falló; usuario conservado; contraseña limpia. | RV-06, 10 | HU01 |
| E-05 | Credenciales correctas | MSG-08 y redirección a /inicio con menú del rol. | RN-05 | HU01 |
| E-06 | Activa Mostrar/Ocultar | La contraseña se revela y se oculta; el valor no cambia. | RV-09 | HU01 |
| E-07 | Envía mientras se procesa | Botón deshabilitado con MSG-07; un solo envío. | RV-08 | HU01 |
| E-08 | Solo teclado | Tab recorre Usuario → Contraseña → Mostrar → INGRESAR → enlace; Enter envía; el foco es visible. | RNF-04 | HU01 |
| E-09 | Usuario desactivado | MSG-05. | RN-01 | HU01 |
| E-10 | Cinco intentos fallidos | MSG-06; acceso bloqueado 15 minutos. | RN-03 | HU01 |
| E-11 | Usuario con espacios al inicio/fin | Se recortan y el ingreso continúa normalmente. | RV-04 | HU01 |
| E-12 | Servidor no disponible | MSG-09; el usuario escrito se conserva. | RV-06 | HU01 |
| E-13 | Recuperar contraseña con código válido | Contraseña actualizada y MSG-16 en el login. | RN-02, 04 | HU07 |
| E-14 | Código vencido o incorrecto | MSG-13; permite solicitar otro. | RN-04 | HU07 |
| E-15 | Correo no registrado | MSG-11 (misma respuesta); no se envía código. | RV-10, RN-02 | HU07 |


# 13. Matriz de justificación de usabilidad


<!-- tabla 19 -->
| Principio aplicado | Elemento del formulario | Decisión adoptada | Justificación |
|---|---|---|---|
| ISO 9241 – Eficacia | Validación en línea y mensajes | Errores junto al campo con indicación de qué corregir | Permite completar el ingreso sin ayuda externa |
| ISO 9241 – Eficiencia | Foco inicial, Enter, autocompletado del navegador | Foco en Usuario; Enter envía; atributos autocomplete | Reduce acciones y tiempo durante el servicio |
| ISO 9241 – Satisfacción | Diseño y lenguaje | Paleta de la marca, mensajes en lenguaje simple y estados claros | Interacción clara y predecible para personal con poca experiencia |
| Nielsen 1 – Visibilidad del estado | Botón INGRESAR | Muestra "Ingresando…" y se deshabilita | El usuario sabe que el sistema está procesando |
| Nielsen 2 – Mundo real | Textos | Español simple, "Usuario" y "Contraseña", sin términos técnicos | Coincide con el lenguaje del personal |
| Nielsen 3 – Control y libertad | Vista 1.2 | Enlace "Volver al inicio de sesión" | Permite salir de la recuperación sin penalización |
| Nielsen 4 – Consistencia | Controles y colores | Mismos botones, campos y colores en todos los módulos | Evita reaprendizaje |
| Nielsen 5 – Prevención de errores | Mostrar, aviso Bloq Mayús, recorte de espacios | Revelar contraseña temporalmente y avisar mayúsculas | Evita errores de tecleo antes de enviar |
| Nielsen 6 – Reconocimiento | Etiquetas, íconos y asterisco | Etiqueta visible sobre cada campo y marca de obligatorio | No obliga a recordar qué ingresar |
| Nielsen 8 – Minimalismo | Formulario | Solo los campos y acciones necesarios; panel decorativo oculto en móvil | Sin distracciones |
| Nielsen 9 – Recuperarse de errores | Mensajes | Texto que indica qué hacer (MSG-01 a MSG-06) | Facilita el diagnóstico y la corrección |
| Shneiderman 1 – Consistencia | Estilo visual | Componentes y mensajes con el mismo formato en todo el sistema | Comportamiento predecible |
| Shneiderman 2 – Usabilidad universal | Teclado, contraste, móvil | Navegación por teclado, contraste mínimo 4.5:1, controles de 44 px | Atiende distintos niveles de experiencia y dispositivos |
| Shneiderman 3 – Retroalimentación | Estados y avisos | Respuesta a cada acción (error, carga, éxito) | El usuario siempre sabe qué pasó |
| Shneiderman 4 – Cierre | Éxito y recuperación | MSG-08 con redirección; MSG-16 al terminar la recuperación | Indica que el proceso concluyó |
| Shneiderman 5 – Prevenir errores | Validación antes de enviar | No se envía con errores; botón bloqueado al enviar | Evita envíos inválidos o repetidos |
| Shneiderman 6 – Reversión | Vista 1.2 y Mostrar/Ocultar | Volver al login; ocultar la contraseña de nuevo | Acciones fáciles de deshacer |
| Shneiderman 7 – Control del usuario | Todo el flujo | El usuario inicia cada acción; sin acciones automáticas inesperadas | Mantiene el control |
| Shneiderman 8 – Memoria a corto plazo | Formulario de una sola pantalla | Campos mínimos y ayuda en MSG-17 | Reduce lo que hay que recordar |


# 14. Matriz de trazabilidad


## 14.1 Requerimiento → historia → caso de uso → vista → prueba


<!-- tabla 20 -->
| RF | HU | CUS | Vista | Reglas / mensajes | API | Escenarios |
|---|---|---|---|---|---|---|
| RF-01 Iniciar sesión | HU01 | CUS01.1 | 1.1 | RV-01 a 10; RN-01, 03, 05; MSG-01 a 10 | POST /api/auth/login | E-01 a E-12 |
| RF-07 Recuperar contraseña | HU07 | CUS01.2 | 1.2 | RV-03, 04; RN-02, 04; MSG-11 a 18 | POST /forgot-password y /reset-password | E-13 a E-15 |


## 14.2 Regla → elemento de interfaz → escenario


<!-- tabla 21 -->
| Regla | Elemento UI (Vista 1.1) | Escenario |
|---|---|---|
| RV-01 / RV-02 | Campos Usuario y Contraseña (asterisco y texto de error) | E-01, E-03 |
| RV-03 | Campo Usuario (formato) | E-02 |
| RV-04 | Recorte automático al salir del campo y al enviar | E-11 |
| RV-05 / RV-06 | Texto de error bajo el campo y aviso sobre el formulario | E-01 a E-04 |
| RV-07 | Botón INGRESAR (no envía con errores) | E-01 a E-03 |
| RV-08 | Botón INGRESAR en estado "Ingresando…" | E-07 |
| RV-09 | Botón Mostrar / Ocultar | E-06 |
| RV-10 | Aviso MSG-04 genérico | E-04 |
| RNF-04 | Orden de tabulación y foco visible | E-08 |
| RN-01 / RN-03 | Avisos MSG-05 y MSG-06 | E-09, E-10 |


# 15. Evaluación del prototipo y mejoras incorporadas


<!-- tabla 22 -->
| Hallazgo en el prototipo | Principio | Mejora incorporada |
|---|---|---|
| Solo existía el estado inicial | Nielsen 1 y 9; Shneiderman 3 | Estados de error, carga y éxito (sección 7) |
| Contraste insuficiente (botón ≈ 4.2:1; enlace, subtítulo y pie ≈ 3.9:1; placeholder ≈ 2.4:1) | Shneiderman 2; accesibilidad | Oscurecer el naranja (ej. #B84600) y el gris (ej. #6B7280) |
| Mensajes en mayúsculas y sin acción | Nielsen 9 | Mensajes en oración con indicación de qué hacer (sección 5) |
| "¿Olvidó su contraseña?" visible para todos, pero solo la administradora recupera | Nielsen 2 y 10; Norman: modelo conceptual | MSG-17 como ayuda en la Vista 1.2 |
| Caja "Acceso de demostración" sin signifier y sin autenticación | Norman; Nielsen 4 y 5 | Solo en desarrollo y documentada |
| Sin atajos de teclado definidos | Shneiderman 2; Nielsen 7 | Foco inicial, Enter, orden de tabulación y autocomplete |
| Panel izquierdo ocupa casi la mitad | Nielsen 8 | Se oculta en móvil |


# 16. Dependencias con otros casos de uso


<!-- tabla 23 -->
| N.º | Punto | Decisión adoptada o tarea | CUS relacionado |
|---|---|---|---|
| 1 | Correo del usuario | Decisión: el correo se registra y edita en CUS02.2 y CUS02.3 (obligatorio para el Administrador); RF-02 y RF-04 lo incluyen. | CUS02.2, CUS02.3 |
| 2 | Acceso denegado y sesión expirada | No tienen RF propio; se cubren con RN-06 y RNF-02 (el servidor valida token y rol en cada solicitud). La Vista 1.3 se retira de este CUS. | Transversal |
| 3 | Acceso de demostración | Solo en desarrollo mediante variable de configuración; no existe en producción. | CUS01.1 |
| 4 | Cerrar sesión y cambiar contraseña | Cerrar sesión es navegación (barra superior) y no es un caso de uso. Cambiar contraseña (RF-06) se documenta como caso de uso del administrador. | CUS02.6 |
| 5 | Rol Cajero | Es actor de CUS01.1; sus funciones se documentan en los CUS de pedidos, cobro y caja. | CUS de pedidos, cobro y caja |
