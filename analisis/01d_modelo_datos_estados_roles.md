# Modelo de Datos, Diccionario de Entidades, Estados, Roles y Carga Inicial

## 1. Diccionario de Datos por Módulo / Entidad

A continuación se consolidan todos los campos especificados en las secciones 10 de los Anexos CUS01 a CUS14:


### Vista 1.2: Recuperar contraseña (CUS01.2) — restaurante.app/recuperar — 10. Diccionario de datos (Anexo_CUS01_Inicio_de_Sesion_Girasoles.md)

<!-- tabla 16 -->
| Campo | Tipo | Obligatorio | Longitud / formato | Notas |
|---|---|---|---|---|
| Usuario | Texto | Sí | 3–30; letras, números, . - _ | Se recorta; no distingue mayúsculas |
| Contraseña (login) | Texto | Sí | Sin límite de validación | Oculta por defecto; no se recorta |
| Correo (recuperación) | Texto | Sí | Formato de correo, máx. 100 | Debe existir como dato del usuario (ver sección 16, dependencia 1) |
| Código de recuperación | Numérico | Sí | 6 dígitos | Vence a los 15 min; un solo uso |
| Nueva contraseña | Texto | Sí | 8–64 | Se almacena con hash |
| Confirmar contraseña | Texto | Sí | Igual a Nueva contraseña | No se envía al servidor |

### Vista 2.6: Cambiar contraseña (CUS02.6) — restaurante.app/perfil/contrasena — 10. Diccionario de datos (Anexo_CUS02_a_CUS04_Girasoles.md)

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

### Vista 3.5: Menús completos (CUS03.5) — restaurante.app/productos (pestaña "Menús completos") — 10. Diccionario de datos (Anexo_CUS02_a_CUS04_Girasoles.md)

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

### Vista 4.2: Disponibilidad en servicio (CUS04.2) — restaurante.app/menu-dia (pestaña "Disponibilidad en Servicio") — 10. Diccionario de datos (Anexo_CUS02_a_CUS04_Girasoles.md)

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

### Vista 5.4: Activar o desactivar mesa (CUS05.3) — restaurante.app/mesas — 10. Diccionario de datos (Anexo_CUS05_y_CUS06_Mesas_y_Pedido_de_Mesa_Girasoles.md)

<!-- tabla 22 -->
| Campo | Tipo | Obligatorio | Longitud / formato | Notas |
|---|---|---|---|---|
| Número o nombre | Texto | Sí | 1–20; letras, números, espacios, tildes, - y . | Único; se recorta |
| Ocupación | Lista | Automático | Libre / Ocupada | La cambia el sistema; nueva = Libre |
| Vigencia | Lista | Automático | Activa / Inactiva | Nueva = Activa |
| Fecha de creación y de modificación | Fecha y hora | Automático | — | No editables |
| Filtro de estado | Lista | No | Todas / Libres / Ocupadas | Solo en pantalla |
| Mostrar inactivas | Interruptor | No | Sí / No (por defecto No) | Solo Administrador |

### Vista 6.3: Agregar productos a un pedido abierto (CUS06.2) — restaurante.app/pedidos/mesa/agregar — 10. Diccionario de datos (Anexo_CUS05_y_CUS06_Mesas_y_Pedido_de_Mesa_Girasoles.md)

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

### Vista 7.2: Confirmación del pedido para llevar (CUS07.1) — restaurante.app/pedidos/llevar/confirmacion — 10. Diccionario de datos (Anexo_CUS07_Pedido_para_Llevar_Girasoles.md)

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

### Vista 8.5: Aviso de comanda lista (CUS08.1) — sobre cualquier pantalla — 10. Diccionario de datos (Anexo_CUS08_Gestion_de_Pedidos_Girasoles.md)

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

### Vista 9.2: Acciones de estado de la comanda (CUS09.2) — restaurante.app/comandas — 10. Diccionario de datos (Anexo_CUS09_Comandas_de_Cocina_Girasoles.md)

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

### Vista 10.3: Comprobante de pago (CUS10.2) — restaurante.app/cobro/comprobante — 10. Diccionario de datos (Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md)

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

### Vista 11.3: Anular venta (CUS11.2) — restaurante.app/ventas/{id}/anular — 10. Diccionario de datos (Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md)

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

### Vista 12.4: Detalle de un cierre (CUS12.3) — restaurante.app/caja/historial/{id} — 10. Diccionario de datos (Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md)

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

### Vista 13.3: Detalle de un producto por día (CUS13.2) — restaurante.app/reportes (pestaña "Platos vendidos") — 10. Diccionario de datos (Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md)

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

### Vista 14.1: Panel del Administrador (CUS14.1) — restaurante.app/inicio — 10. Diccionario de datos (Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md)

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

## 2. Enumeraciones y Estados del Dominio


### 2.1 Roles del Sistema (`RolUsuario`)
- `Administrador`: Acceso total a configuración, personal, carta, reportes, anulación de ventas y paneles.
- `Cajero`: Apertura/cierre de caja, cobro de pedidos, emisión de comprobantes, pedidos para llevar y panel de caja.
- `Mozo`: Consulta de salón, registro de pedidos de mesa, agregado de productos y aviso de comandas listas.
- `Cocinero`: Visualización de comandas KDS, avance de preparación, aviso de platos listos y marcado de platos agotados.

### 2.2 Estado de Mesa (`EstadoMesa`)
- `Libre`: Mesa desocupada, disponible para asignar un nuevo pedido. Color verde.
- `Ocupada`: Mesa con comensales y al menos un pedido activo en curso. Color naranja.
- `Inactiva`: Mesa dada de baja temporal o en mantenimiento (solo visible/gestionable por el Administrador). Color atenuado.
*Transiciones:*
- `Libre` → `Ocupada`: Al registrar el primer pedido en la mesa (CUS06.1).
- `Ocupada` → `Libre`: Automática y atómica tras registrar el pago del cobro completo (CUS10.1, RN-93) o tras anular todos los pedidos no pagados (CUS08.2).
- `Libre` ↔ `Inactiva`: Activación o desactivación manual por el Administrador (CUS05.3, RV-80). Prohibido desactivar mesa ocupada.

### 2.3 Estado de Pedido (`EstadoPedido`)
- `Pendiente`: Pedido registrado, enviado a cocina y a la espera de preparación.
- `En preparacion`: Cocina inició la elaboración de una o más comandas asociadas.
- `Listo`: Todas las comandas del pedido fueron completadas por cocina. Genera aviso al mozo/cajero.
- `Entregado`: Pedido servido al comensal o entregado al cliente para llevar.
- `Pagado`: Pedido cobrado con comprobante emitido. Libera la mesa si era pedido de salón.
- `Anulado`: Pedido cancelado con registro de motivo obligatorio.
*Transiciones:*
- `Pendiente` → `En preparacion` → `Listo` → `Entregado` → `Pagado`
- `Pendiente` → `Anulado` (Mozo/Cajero antes de preparación; Administrador en cualquier estado no pagado).

### 2.4 Estado de Comanda de Cocina (`EstadoComanda`)
- `Pendiente`: Comanda recién emitida por registro de pedido (CUS06.1, CUS06.2, CUS07.1). Color amarillo/naranja.
- `En preparacion`: El cocinero pulsó "Preparar". Inicia cronómetro de tiempo en cocina.
- `Listo`: Platos preparados. Dispara aviso visual y sonoro a Mozo/Cajero.
- `Entregado`: Comanda retirada de cocina.
*Acción especial:* Deshacer estado (`POST /api/comandas/{id}/deshacer`), permitida dentro de los primeros 60 segundos por error involuntario de toque.

### 2.5 Estado de Caja (`EstadoCaja`)
- `Cerrada`: No hay jornada activa; no se pueden cobrar pedidos ni registrar ventas.
- `Abierta`: Apertura con monto inicial en efectivo por el Cajero (CUS12.1).
- `Cuadrada / Cerrada`: Cierre con conteo de efectivo, cálculo de ventas del sistema (Efectivo y Yape), determinación de descuadre y bloqueo de operaciones (CUS12.2).
*Ajustes posteriores:* Si una venta se anula después de cerrada la caja (CUS11.2), el cierre original no se altera; se genera un registro de ajuste posterior visible en el historial y reportes.

### 2.6 Estado de Venta (`EstadoVenta`)
- `Emitida`: Venta cobrada con comprobante válido (Ticket, Boleta o Factura).
- `Anulada`: Venta invalidada por el Administrador con motivo mínimo de 5 caracteres. Revierte el estado del pedido a no pagado o anulado y genera ajuste de caja.

### 2.7 Disponibilidad de Productos y Menú del Día
- `Disponible`: Plato u opción habilitado para la comanda.
- `Agotado`: Plato deshabilitado temporalmente en cocina/administración (CUS04.2). Bloquea su selección inmediata en toma de pedidos.
- `Activo / Inactivo`: Vigencia en catálogo (CUS03.4). Inactivo no aparece en carta ni menú del día.


## 3. Matriz Rol × Funcionalidad


| Módulo / Funcionalidad | Administrador | Cajero | Mozo | Cocinero |
|---|:---:|:---:|:---:|:---:|
| Iniciar sesión / Perfil / Cambiar contraseña | ✅ | ✅ | ✅ | ✅ |
| Gestión de Usuarios (CRUD, Roles, Estados) | ✅ | ❌ | ❌ | ❌ |
| Gestión de Catálogo de Productos y Componentes | ✅ | ❌ | ❌ | ❌ |
| Gestión de Menús Completos (Precios y Partes) | ✅ | ❌ | ❌ | ❌ |
| Definir Menú del Día (Opciones por rol) | ✅ | ❌ | ❌ | ❌ |
| Marcar Plato/Opción Agotado o Disponible | ✅ | ❌ | ❌ | ✅ |
| Gestión de Mesas (Crear, Editar, Activar/Desactivar) | ✅ | ❌ | ❌ | ❌ |
| Ver Salón y Estado de Mesas | ✅ | ✅ | ✅ | ❌ |
| Registrar Pedido de Mesa y Agregar Productos | ✅ | ❌ | ✅ | ❌ |
| Registrar Pedido para Llevar | ✅ | ✅ | ❌ | ❌ |
| Listar Pedidos y Ver Avisos de Comandas Listas | ✅ | ✅ | ✅ | ❌ |
| Modificar Pedido (antes de preparación) | ✅ | ✅ | ✅ | ❌ |
| Anular Pedido No Pagado | ✅ | ✅ (solo propios antes de prep.) | ✅ (solo propios antes de prep.) | ❌ |
| Pantalla KDS de Comandas y Cambio de Estado | ✅ | ❌ | ❌ | ✅ |
| Deshacer Estado de Comanda (≤ 60s) | ✅ | ❌ | ❌ | ✅ |
| Apertura y Cierre / Arqueo de Caja | ✅ | ✅ | ❌ | ❌ |
| Cobrar Pedido y Elegir Medio de Pago | ✅ | ✅ | ❌ | ❌ |
| Emitir Comprobante (Ticket, Boleta, Factura) | ✅ | ✅ | ❌ | ❌ |
| Listar y Consultar Historial de Ventas | ✅ | ✅ | ❌ | ❌ |
| Anular Venta Emitida | ✅ | ❌ | ❌ | ❌ |
| Historial de Cierres de Caja | ✅ | ❌ | ❌ | ❌ |
| Reportes Gerenciales (Ventas por rango, Platos más vendidos) | ✅ | ❌ | ❌ | ❌ |
| Dashboard / Panel de Inicio | ✅ (Métricas completas) | ✅ (Panel de caja y cobros) | ✅ (Mesas y pedidos listos) | ✅ (KDS resumen) |


## 4. Datos de Referencia y Carga Inicial (Seed Data)


### 4.1 Categorías de Productos
1. **Desayuno**: 15 productos en carta de referencia.
2. **Almuerzo**: 8 productos activos (y "Menú almuerzo" desactivado por reemplazo).
3. **Platos Extras / A la Carta**: 11 productos.
4. **Combinados**: 3 productos.
5. **Bebidas y Refrescos**: 15 productos.
6. **Otro**: 3 productos (guarniciones y porciones).
*Total carta cargada:* 56 productos (55 activos, 1 desactivado).

### 4.2 Menús Completos Iniciales
1. **Desayuno completo (S/ 7.00)**:
   - Partes a elegir: 1 Bebida de desayuno + 1 Plato de desayuno.
   - Incluye: Pan.
2. **Almuerzo completo (S/ 8.00)**:
   - Partes a elegir: (1 Sopa o 1 Entrada) + 1 Segundo.
   - Incluye: Refresco del día.
3. **Solo segundo (S/ 7.00)**:
   - Partes a elegir: 1 Segundo (sin sopa ni entrada).
   - Incluye: Refresco del día (por confirmar).

### 4.3 Componentes de Menú (Roles y Ejemplos de Carga Inicial)
- **Bebida de desayuno**: Quaker, Quinua, Soya, Anís.
- **Plato de desayuno**: Seco de pollo, Asado de pollo.
- **Sopa**: Sopa a la minuta, Sopa criolla.
- **Entrada**: Papa a la huancaína, Ocopa arequipeña, Caldo de gallina.
- **Segundo**: Lomo saltado, Seco de pollo, Seco de res, Milanesa de pollo, Pescado frito.

### 4.4 Comprobantes de Pago, Series y Parámetros Fiscales
- **Tipos de Comprobante:**
  1. `Ticket interno`: Serie `T001` + correlativo numérico de 6 dígitos (ej. `T001-000123`). Sin valor tributario.
  2. `Boleta simple`: Serie `B001` + correlativo de 6 dígitos (ej. `B001-000045`). Ventas menores a S/ 700.00 sin exigir documento de identidad.
  3. `Boleta con DNI`: Serie `B001` + correlativo de 6 dígitos. Exige DNI de 8 dígitos numéricos. Obligatoria para ventas ≥ S/ 700.00 (RN-95-B, RV-105-C).
  4. `Factura`: Serie `F001` + correlativo de 6 dígitos (ej. `F001-000012`). Exige RUC de 11 dígitos que comience con 10 o 20 (RV-105-B).
- **Desglose de Impuestos:**
  - IGV legal SUNAT: 18% incluido en el precio final.
  - Subtotal = Total / 1.18.
  - IGV = Total - Subtotal.
- **Datos Fiscales del Emisor (Girasoles Restaurante):**
  - Razón Social / Nombre Comercial: Restaurante Los Girasoles.
  - Dirección del local: Huancayo, Junín, Perú.
  - Parámetros configurables en cabecera de ticket/comprobante PDF.

### 4.5 Configuración de Mesas Iniciales
- Salón principal con mesas numeradas correlativas (Mesa 1 a Mesa 12), capacidad 4 a 6 comensales, estado inicial `Libre`, vigencia `Activa`.
