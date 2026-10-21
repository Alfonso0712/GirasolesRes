# Diccionario de Datos — Base de Datos PostgreSQL `girasoles_db`
**Sistema:** Software GirasolesRes para el Control de Venta del Restaurante Girasoles  
**Motor:** PostgreSQL 16 / 18  
**Arquitectura de Datos:** Modelo Relacional Normalizado con Auditoría e Integridad Referencial  

---

## Índice de Tablas (24 Entidades)

1. [usuarios](#1-usuarios)
2. [tokens_revocados](#2-tokens_revocados)
3. [codigos_recuperacion](#3-codigos_recuperacion)
4. [registros_ingreso](#4-registros_ingreso)
5. [mesas](#5-mesas)
6. [productos](#6-productos)
7. [menus_completos](#7-menus_completos)
8. [menu_completo_partes](#8-menu_completo_partes)
9. [menus_dia](#9-menus_dia)
10. [menu_dia_platos](#10-menu_dia_platos)
11. [menu_dia_menus_completos](#11-menu_dia_menus_completos)
12. [pedidos](#12-pedidos)
13. [detalles_pedido](#13-detalles_pedido)
14. [lineas_pedido_opciones](#14-lineas_pedido_opciones)
15. [comandas](#15-comandas)
16. [detalles_comanda](#16-detalles_comanda)
17. [cajas](#17-cajas)
18. [ventas](#18-ventas)
19. [comprobantes](#19-comprobantes)
20. [auditoria_cobros](#20-auditoria_cobros)
21. [auditoria_mesas](#21-auditoria_mesas)
22. [auditoria_pedidos](#22-auditoria_pedidos)
23. [auditoria_reportes](#23-auditoria_reportes)
24. [auditoria_usuarios](#24-auditoria_usuarios)

---

### 1. `usuarios`
Almacena las credenciales de acceso, perfil operativo y estado del personal del restaurante.

| Columna | Tipo de Dato | Nulo | Clave / Restricción | Descripción |
| :--- | :--- | :---: | :---: | :--- |
| `id_usuario` | `UUID` | No | PK | Identificador único del usuario. |
| `usu_nombre_usuario` | `VARCHAR(50)` | No | UNIQUE | Nombre de usuario para login. |
| `usu_nombres` | `VARCHAR(100)` | No | — | Nombres del trabajador. |
| `usu_apellidos` | `VARCHAR(100)` | No | — | Apellidos del trabajador. |
| `usu_correo` | `VARCHAR(150)` | No | UNIQUE | Correo electrónico institucional. |
| `usu_password_hash` | `VARCHAR(512)` | No | — | Hash de contraseña con PBKDF2 (100k iteraciones). |
| `usu_rol` | `VARCHAR(30)` | No | CHECK | Rol asignado: 'Administrador', 'Cajero', 'Mozo', 'Cocinero'. |
| `usu_activo` | `BOOLEAN` | No | DEFAULT true | Estado de habilitación del usuario. |
| `fec_creacion_utc` | `TIMESTAMPTZ` | No | DEFAULT NOW() | Fecha de registro en el sistema. |
| `fec_actualizacion_utc` | `TIMESTAMPTZ` | Sí | — | Fecha de última modificación. |

---

### 2. `tokens_revocados`
Lista negra de tokens JWT invalidados por cierre de sesión explícito.

| Columna | Tipo de Dato | Nulo | Clave / Restricción | Descripción |
| :--- | :--- | :---: | :---: | :--- |
| `id_token_revocado` | `UUID` | No | PK | Identificador único del registro. |
| `tok_jti` | `VARCHAR(100)` | No | UNIQUE | Identificador único del token JWT (Claim JTI). |
| `fec_expiracion_utc` | `TIMESTAMPTZ` | No | — | Fecha en que el token expira naturalmente. |
| `fec_revocacion_utc` | `TIMESTAMPTZ` | No | DEFAULT NOW() | Fecha y hora en que se ejecutó la revocación. |

---

### 3. `codigos_recuperacion`
Almacena los códigos OTP temporales emitidos para el restablecimiento de contraseñas.

| Columna | Tipo de Dato | Nulo | Clave / Restricción | Descripción |
| :--- | :--- | :---: | :---: | :--- |
| `id_codigo` | `UUID` | No | PK | Identificador del registro. |
| `id_usuario` | `UUID` | No | FK → `usuarios` | Usuario solicitante. |
| `cod_valor` | `VARCHAR(10)` | No | — | Código numérico de verificación. |
| `cod_utilizado` | `BOOLEAN` | No | DEFAULT false | Indica si el código ya fue canjeado. |
| `fec_expiracion_utc` | `TIMESTAMPTZ` | No | — | Límite temporal de vigencia del código (15 min). |
| `fec_creacion_utc` | `TIMESTAMPTZ` | No | DEFAULT NOW() | Fecha de emisión. |

---

### 4. `registros_ingreso`
Bitácora de autenticación e intentos de inicio de sesión de los operadores.

| Columna | Tipo de Dato | Nulo | Clave / Restricción | Descripción |
| :--- | :--- | :---: | :---: | :--- |
| `id_registro_ingreso` | `UUID` | No | PK | Identificador del evento de login. |
| `id_usuario` | `UUID` | Sí | FK → `usuarios` | Usuario autenticado (nulo si falló). |
| `reg_nombre_usuario` | `VARCHAR(50)` | No | — | Usuario ingresado en el formulario. |
| `reg_exitoso` | `BOOLEAN` | No | — | Resultado de la autenticación. |
| `reg_ip_origen` | `VARCHAR(45)` | Sí | — | Dirección IP de la solicitud. |
| `reg_user_agent` | `TEXT` | Sí | — | Navegador y dispositivo cliente. |
| `fec_ingreso_utc` | `TIMESTAMPTZ` | No | DEFAULT NOW() | Fecha y hora del intento. |

---

### 5. `mesas`
Catálogo de mesas físicas del salón comedor.

| Columna | Tipo de Dato | Nulo | Clave / Restricción | Descripción |
| :--- | :--- | :---: | :---: | :--- |
| `id_mesa` | `UUID` | No | PK | Identificador único de la mesa. |
| `mes_numero` | `INT` | No | UNIQUE | Número visible de la mesa (1, 2, 3...). |
| `mes_capacidad` | `INT` | No | CHECK (>0) | Capacidad máxima de comensales. |
| `est_ocupacion` | `VARCHAR(20)` | No | DEFAULT 'Libre' | Estado operativo: 'Libre', 'Ocupada', 'Reservada'. |
| `fec_creacion_utc` | `TIMESTAMPTZ` | No | DEFAULT NOW() | Fecha de alta de la mesa. |
| `fec_actualizacion_utc` | `TIMESTAMPTZ` | Sí | — | Fecha de último cambio de estado. |

---

### 6. `productos`
Catálogo de platos a la carta, bebidas y componentes culinarios.

| Columna | Tipo de Dato | Nulo | Clave / Restricción | Descripción |
| :--- | :--- | :---: | :---: | :--- |
| `id_producto` | `UUID` | No | PK | Identificador del producto. |
| `pro_codigo` | `VARCHAR(30)` | No | UNIQUE | Código interno (ej. 'ENT-001', 'BEB-002'). |
| `pro_nombre` | `VARCHAR(150)` | No | — | Nombre del plato o bebida. |
| `pro_categoria` | `VARCHAR(50)` | No | — | Categoría culinaria (Entrada, Segundo, etc.). |
| `pro_precio` | `NUMERIC(10,2)` | No | CHECK (>=0) | Precio unitario de venta al público. |
| `pro_activo` | `BOOLEAN` | No | DEFAULT true | Disponibilidad en carta. |
| `pro_es_componente` | `BOOLEAN` | No | DEFAULT false | Indica si es parte de un menú completo del día. |
| `fec_creacion_utc` | `TIMESTAMPTZ` | No | DEFAULT NOW() | Fecha de registro. |

---

### 7. `menus_completos`
Estructura base de paquetes de menú del día con precio cerrado.

| Columna | Tipo de Dato | Nulo | Clave / Restricción | Descripción |
| :--- | :--- | :---: | :---: | :--- |
| `id_menu_completo` | `UUID` | No | PK | Identificador del paquete de menú. |
| `men_nombre` | `VARCHAR(100)` | No | — | Nombre descriptivo (ej. 'Menú Ejecutivo'). |
| `men_precio` | `NUMERIC(10,2)` | No | CHECK (>0) | Precio global del paquete completo. |
| `men_activo` | `BOOLEAN` | No | DEFAULT true | Estado del paquete. |

---

### 8. `menu_completo_partes`
Define las partes obligatorias de un menú completo (ej. Entrada, Segundo, Refresco).

| Columna | Tipo de Dato | Nulo | Clave / Restricción | Descripción |
| :--- | :--- | :---: | :---: | :--- |
| `id_parte` | `UUID` | No | PK | Identificador de la parte del menú. |
| `id_menu_completo` | `UUID` | No | FK → `menus_completos` | Menú completo al que pertenece. |
| `par_nombre` | `VARCHAR(50)` | No | — | Nombre de la parte (ej. 'Entrada', 'Segundo'). |
| `par_orden` | `INT` | No | — | Secuencia de selección en comanda. |

---

### 9. `menus_dia`
Registro y activación de la carta del día para una fecha operativa específica.

| Columna | Tipo de Dato | Nulo | Clave / Restricción | Descripción |
| :--- | :--- | :---: | :---: | :--- |
| `id_menu_dia` | `UUID` | No | PK | Identificador del menú diario. |
| `mnd_fecha` | `DATE` | No | UNIQUE | Fecha operativa del menú. |
| `mnd_activo` | `BOOLEAN` | No | DEFAULT true | Estado de publicación en el salón. |

---

### 10. `menu_dia_platos`
Asociación de platos individuales ofrecidos en la carta del día.

| Columna | Tipo de Dato | Nulo | Clave / Restricción | Descripción |
| :--- | :--- | :---: | :---: | :--- |
| `id_menu_dia_plato` | `UUID` | No | PK | Identificador de la relación. |
| `id_menu_dia` | `UUID` | No | FK → `menus_dia` | Menú del día correspondiente. |
| `id_producto` | `UUID` | No | FK → `productos` | Plato asignado a la fecha. |

---

### 11. `menu_dia_menus_completos`
Vinculación de paquetes de menú completo disponibles en la fecha del menú del día.

| Columna | Tipo de Dato | Nulo | Clave / Restricción | Descripción |
| :--- | :--- | :---: | :---: | :--- |
| `id_relacion` | `UUID` | No | PK | Identificador de la relación. |
| `id_menu_dia` | `UUID` | No | FK → `menus_dia` | Menú del día. |
| `id_menu_completo` | `UUID` | No | FK → `menus_completos` | Paquete habilitado. |

---

### 12. `pedidos`
Cabecera principal de las órdenes tomadas en el restaurante.

| Columna | Tipo de Dato | Nulo | Clave / Restricción | Descripción |
| :--- | :--- | :---: | :---: | :--- |
| `id_pedido` | `UUID` | No | PK | Identificador único del pedido. |
| `ped_codigo` | `VARCHAR(30)` | No | UNIQUE | Código de comanda (ej. 'PED-20261020-001'). |
| `id_mesa` | `UUID` | Sí | FK → `mesas` | Mesa asignada (nulo si es para llevar). |
| `id_mozo` | `UUID` | No | FK → `usuarios` | Mozo o cajero que registró el pedido. |
| `ped_tipo` | `VARCHAR(20)` | No | CHECK | Tipo: 'Mesa' o 'Llevar'. |
| `ped_estado` | `VARCHAR(20)` | No | DEFAULT 'Pendiente' | Estado: 'Pendiente', 'En Preparación', 'Listo', 'Pagado', 'Anulado'. |
| `ped_total` | `NUMERIC(10,2)` | No | CHECK (>=0) | Monto total acumulado. |
| `ped_nombre_cliente` | `VARCHAR(100)` | Sí | — | Nombre del cliente para pedidos para llevar. |
| `ped_fecha_operativa` | `DATE` | No | — | Fecha operativa contable. |
| `fec_creacion_utc` | `TIMESTAMPTZ` | No | DEFAULT NOW() | Timestamp de registro. |

---

### 13. `detalles_pedido`
Líneas de productos o menús que componen un pedido.

| Columna | Tipo de Dato | Nulo | Clave / Restricción | Descripción |
| :--- | :--- | :---: | :---: | :--- |
| `id_detalle_pedido` | `UUID` | No | PK | Identificador de la línea. |
| `id_pedido` | `UUID` | No | FK → `pedidos` | Pedido al que pertenece. |
| `id_producto` | `UUID` | Sí | FK → `productos` | Producto de venta individual (si aplica). |
| `id_menu_completo` | `UUID` | Sí | FK → `menus_completos` | Menú completo (si aplica). |
| `det_cantidad` | `INT` | No | CHECK (>0) | Cantidad de porciones. |
| `det_precio_unitario`| `NUMERIC(10,2)` | No | CHECK (>=0) | Precio unitario cobrado. |
| `det_subtotal` | `NUMERIC(10,2)` | No | CHECK (>=0) | Importe acumulado de la línea. |
| `det_observacion` | `TEXT` | Sí | — | Indicaciones especiales para cocina. |

---

### 14. `lineas_pedido_opciones`
Registra los componentes seleccionados para cada menú completo ordenado.

| Columna | Tipo de Dato | Nulo | Clave / Restricción | Descripción |
| :--- | :--- | :---: | :---: | :--- |
| `id_linea_opcion` | `UUID` | No | PK | Identificador del registro. |
| `id_detalle_pedido` | `UUID` | No | FK → `detalles_pedido` | Línea de menú completa padre. |
| `id_producto_componente` | `UUID` | No | FK → `productos` | Plato componente seleccionado. |

---

### 15. `comandas`
Órdenes de cocina enviadas al KDS para su preparación y despacho.

| Columna | Tipo de Dato | Nulo | Clave / Restricción | Descripción |
| :--- | :--- | :---: | :---: | :--- |
| `id_comanda` | `UUID` | No | PK | Identificador único de la comanda. |
| `id_pedido` | `UUID` | No | FK → `pedidos` | Pedido asociado. |
| `cmd_codigo` | `VARCHAR(30)` | No | — | Código visible en pantalla KDS. |
| `cmd_estado` | `VARCHAR(20)` | No | DEFAULT 'Pendiente' | Estado: 'Pendiente', 'En Preparación', 'Listo', 'Cancelada'. |
| `fec_creacion_utc` | `TIMESTAMPTZ` | No | DEFAULT NOW() | Hora de ingreso a cocina. |
| `fec_preparacion_utc`| `TIMESTAMPTZ` | Sí | — | Hora de inicio de preparación en fogón. |
| `fec_listo_utc` | `TIMESTAMPTZ` | Sí | — | Hora de despacho hacia el mozo. |

---

### 16. `detalles_comanda`
Ítems culinarios específicos a preparar dentro de una comanda de cocina.

| Columna | Tipo de Dato | Nulo | Clave / Restricción | Descripción |
| :--- | :--- | :---: | :---: | :--- |
| `id_detalle_comanda`| `UUID` | No | PK | Identificador de la comanda individual. |
| `id_comanda` | `UUID` | No | FK → `comandas` | Comanda padre. |
| `id_producto` | `UUID` | No | FK → `productos` | Plato a preparar. |
| `dtc_cantidad` | `INT` | No | CHECK (>0) | Porciones a elaborar. |
| `dtc_notas` | `TEXT` | Sí | — | Especificaciones del comensal. |

---

### 17. `cajas`
Control del ciclo de turnos, arqueo y liquidación de caja registradora.

| Columna | Tipo de Dato | Nulo | Clave / Restricción | Descripción |
| :--- | :--- | :---: | :---: | :--- |
| `id_caja` | `UUID` | No | PK | Identificador del turno de caja. |
| `id_cajero` | `UUID` | No | FK → `usuarios` | Cajero responsable del turno. |
| `caj_monto_inicial` | `NUMERIC(10,2)` | No | CHECK (>=0) | Saldo base de apertura de gaveta. |
| `caj_monto_cierre` | `NUMERIC(10,2)` | Sí | — | Efectivo físico contado en arqueo. |
| `caj_diferencia` | `NUMERIC(10,2)` | Sí | — | Faltante o sobrante calculado. |
| `caj_estado` | `VARCHAR(20)` | No | DEFAULT 'Abierta' | Estado: 'Abierta', 'Cerrada'. |
| `fec_apertura_utc` | `TIMESTAMPTZ` | No | DEFAULT NOW() | Fecha y hora de apertura. |
| `fec_cierre_utc` | `TIMESTAMPTZ` | Sí | — | Fecha y hora de cierre. |

---

### 18. `ventas`
Registro de la transacción económica y liquidación de un pedido.

| Columna | Tipo de Dato | Nulo | Clave / Restricción | Descripción |
| :--- | :--- | :---: | :---: | :--- |
| `id_venta` | `UUID` | No | PK | Identificador de la venta. |
| `id_pedido` | `UUID` | No | UNIQUE, FK → `pedidos` | Pedido cancelado. |
| `id_caja` | `UUID` | No | FK → `cajas` | Turno de caja en que ingresó el dinero. |
| `vnt_metodo_pago` | `VARCHAR(30)` | No | CHECK | 'Efectivo', 'Yape', 'Plin', 'Tarjeta'. |
| `vnt_total` | `NUMERIC(10,2)` | No | CHECK (>0) | Monto total cobrado. |
| `vnt_monto_recibido`| `NUMERIC(10,2)` | Sí | — | Efectivo entregado por el cliente. |
| `vnt_vuelto` | `NUMERIC(10,2)` | Sí | — | Cambio entregado al cliente. |
| `fec_venta_utc` | `TIMESTAMPTZ` | No | DEFAULT NOW() | Timestamp exacto de la transacción. |

---

### 19. `comprobantes`
Registro fiscal de los documentos de pago emitidos ante la administración tributaria.

| Columna | Tipo de Dato | Nulo | Clave / Restricción | Descripción |
| :--- | :--- | :---: | :---: | :--- |
| `id_comprobante` | `UUID` | No | PK | Identificador del comprobante. |
| `id_venta` | `UUID` | No | UNIQUE, FK → `ventas` | Venta asociada. |
| `cmp_tipo` | `VARCHAR(30)` | No | CHECK | 'Ticket', 'Boleta', 'Factura'. |
| `cmp_serie` | `VARCHAR(10)` | No | — | Serie (ej. 'B001', 'F001', 'T001'). |
| `cmp_numero` | `INT` | No | — | Número correlativo secuencial. |
| `cmp_doc_cliente` | `VARCHAR(20)` | Sí | — | DNI o RUC del adquirente. |
| `cmp_nombre_cliente`| `VARCHAR(200)` | Sí | — | Nombre o Razón Social del cliente. |
| `cmp_subtotal` | `NUMERIC(10,2)` | No | — | Base imponible. |
| `cmp_igv` | `NUMERIC(10,2)` | No | — | Impuesto General a las Ventas (18%). |
| `cmp_total` | `NUMERIC(10,2)` | No | — | Total liquidado. |
| `fec_emision_utc` | `TIMESTAMPTZ` | No | DEFAULT NOW() | Fecha y hora de emisión. |

---

### 20. `auditoria_cobros`
Registro inmutable de auditoría para operaciones de cobranza y facturación.

| Columna | Tipo de Dato | Nulo | Clave / Restricción | Descripción |
| :--- | :--- | :---: | :---: | :--- |
| `id_auditoria_cobro`| `UUID` | No | PK | Identificador del log. |
| `id_pedido` | `UUID` | No | — | Pedido involucrado. |
| `id_usuario` | `UUID` | No | — | Cajero o administrador ejecutor. |
| `aud_accion` | `VARCHAR(50)` | No | — | Acción ('CobroRegistrado', 'ComprobanteEmitido'). |
| `aud_detalle` | `TEXT` | Sí | — | Datos serializados de la transacción. |
| `fec_evento_utc` | `TIMESTAMPTZ` | No | DEFAULT NOW() | Momento de la operación. |

---

### 21. `auditoria_mesas`
Trazabilidad de cambios de asignación y estado físico de mesas.

| Columna | Tipo de Dato | Nulo | Clave / Restricción | Descripción |
| :--- | :--- | :---: | :---: | :--- |
| `id_auditoria_mesa` | `UUID` | No | PK | Identificador de auditoría. |
| `id_mesa` | `UUID` | No | — | Mesa intervenida. |
| `id_usuario` | `UUID` | No | — | Mozo o supervisor que originó el cambio. |
| `aud_estado_anterior`| `VARCHAR(20)` | No | — | Estado previo de ocupación. |
| `aud_estado_nuevo` | `VARCHAR(20)` | No | — | Estado resultante. |
| `fec_evento_utc` | `TIMESTAMPTZ` | No | DEFAULT NOW() | Momento del cambio. |

---

### 22. `auditoria_pedidos`
Historial de modificaciones, anulaciones y transiciones de pedidos.

| Columna | Tipo de Dato | Nulo | Clave / Restricción | Descripción |
| :--- | :--- | :---: | :---: | :--- |
| `id_auditoria_pedido`| `UUID` | No | PK | Identificador del log. |
| `id_pedido` | `UUID` | No | — | Pedido afectado. |
| `id_usuario` | `UUID` | No | — | Operador responsable. |
| `aud_accion` | `VARCHAR(50)` | No | — | 'Creacion', 'Modificacion', 'Anulacion'. |
| `aud_motivo` | `TEXT` | Sí | — | Justificación obligatoria en anulaciones. |
| `fec_evento_utc` | `TIMESTAMPTZ` | No | DEFAULT NOW() | Fecha de registro del evento. |

---

### 23. `auditoria_reportes`
Registro de consultas analíticas y exportaciones de actas financieras y cierres.

| Columna | Tipo de Dato | Nulo | Clave / Restricción | Descripción |
| :--- | :--- | :---: | :---: | :--- |
| `id_auditoria_reporte`| `UUID` | No | PK | Identificador de la consulta. |
| `id_usuario` | `UUID` | No | — | Administrador que emitió el reporte. |
| `aud_tipo_reporte` | `VARCHAR(50)` | No | — | 'CuadraturaCaja', 'VentasPorMozo', 'CierrePdf'. |
| `fec_consulta_utc` | `TIMESTAMPTZ` | No | DEFAULT NOW() | Fecha y hora de generación. |

---

### 24. `auditoria_usuarios`
Registro de altas, bajas lógicas y modificaciones de permisos en perfiles de usuario.

| Columna | Tipo de Dato | Nulo | Clave / Restricción | Descripción |
| :--- | :--- | :---: | :---: | :--- |
| `id_auditoria_usuario`| `UUID` | No | PK | Identificador del log. |
| `id_usuario_afectado`| `UUID` | No | — | Usuario modificado o desactivado. |
| `id_usuario_autor` | `UUID` | No | — | Administrador que ejecutó el cambio. |
| `aud_accion` | `VARCHAR(50)` | No | — | 'UsuarioCreado', 'UsuarioInactivado', 'RolModificado'. |
| `fec_evento_utc` | `TIMESTAMPTZ` | No | DEFAULT NOW() | Fecha del evento. |
