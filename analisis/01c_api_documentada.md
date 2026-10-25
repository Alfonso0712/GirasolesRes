# Contratos de API Documentada (GirasolesRes)

El sistema expone **58 endpoints únicos** documentados a través de los casos de uso CUS01 a CUS14 y Anexos A y B. Todos los endpoints autenticados requieren token JWT en el encabezado `Authorization: Bearer <token>` (retornando `401 Unauthorized` si no existe o expiró, y `403 Forbidden` si el rol no tiene permisos).

### Resumen por Método HTTP
| Método | Cantidad |
|---|---|
| GET | 28 |
| POST | 18 |
| PUT | 6 |
| PATCH | 5 |
| DELETE | 1 |
| **Total** | **58** |

## Detalle de Endpoints Únicos

### `DELETE /api/usuarios/{id}`
- **Roles autorizados:** Administrador
- **Casos de uso asociados:** CUS02.6
- **Documentado en:** Anexo_CUS02_a_CUS04_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `—`
- **Respuestas y Códigos HTTP:**
  204: eliminado. 404: no existe. 409: tiene movimientos, es su propia cuenta o último administrador.

### `GET /api/avisos`
- **Roles autorizados:** Mozo, Administrador
- **Casos de uso asociados:** CUS08.1
- **Documentado en:** Anexo_CUS08_Gestion_de_Pedidos_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `estado=pendiente`
- **Respuestas y Códigos HTTP:**
  200: [{ id, pedidoId, numero, tipo, mesa, referencia, hora }] dirigidos al usuario (o a cualquier mozo si el responsable no tiene sesión). Roles: Mozo, Cajero y Administrador.

### `GET /api/caja/actual`
- **Roles autorizados:** Cajero, Administrador
- **Casos de uso asociados:** CUS12.3
- **Documentado en:** Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `—`
- **Respuestas y Códigos HTTP:**
  200: { estado (sinCaja \

### `GET /api/caja/cierre/resumen`
- **Roles autorizados:** Cajero, Administrador
- **Casos de uso asociados:** CUS12.3
- **Documentado en:** Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `—`
- **Respuestas y Códigos HTTP:**
  200: { montoInicial, efectivo, yape, total, efectivoEsperado, nVentas, platos[{ producto, cantidad }], menusCompletos[{ menu, cantidad, monto }], componentes[{ componente, veces }], pedidosPendientes[{ pedidoId, numero, tipo, mesa, total }] }. 409: no hay caja abierta. Rol: Cajero.

### `GET /api/caja/cierres`
- **Roles autorizados:** Cajero, Administrador
- **Casos de uso asociados:** CUS12.3
- **Documentado en:** Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `desde?, hasta?, pagina, tamano (20)`
- **Respuestas y Códigos HTTP:**
  200: { items[{ cierreId, fecha, cajero, montoInicial, efectivo, yape, total, efectivoContado, diferencia, conAjustes }], total } y la caja abierta como primera fila. 400: rango inválido. Rol: Administrador.

### `GET /api/caja/cierres/{id}`
- **Roles autorizados:** Cajero, Administrador
- **Casos de uso asociados:** CUS12.3
- **Documentado en:** Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `—`
- **Respuestas y Códigos HTTP:**
  200: detalle con observación, platos vendidos y ajustes posteriores. 404: no existe. Rol: Administrador.

### `GET /api/caja/cierres/{id}/pdf`
- **Roles autorizados:** Cajero, Administrador
- **Casos de uso asociados:** CUS12.3
- **Documentado en:** Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `—`
- **Respuestas y Códigos HTTP:**
  200: PDF del resumen del cierre. 404: no existe. Roles: Cajero (su cierre) y Administrador.

### `GET /api/cobros/pendientes`
- **Roles autorizados:** Cajero, Administrador
- **Casos de uso asociados:** CUS10.2
- **Documentado en:** Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `—`
- **Respuestas y Códigos HTTP:**
  200: [{ pedidoId, numero, tipo, mesa, referencia, hora, estado, total }] pendientes de cobro. 409: caja cerrada (caja_cerrada). Rol: Cajero.

### `GET /api/comandas`
- **Roles autorizados:** Cocinero, Administrador
- **Casos de uso asociados:** CUS09.2
- **Documentado en:** Anexo_CUS09_Comandas_de_Cocina_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `estado=pendiente,enPreparacion`
- **Respuestas y Códigos HTTP:**
  200: { items[{ id, pedidoNumero, tipo, mesa, referencia, horaLlegada, estado, etiqueta, registradoPor, lineas[{ producto, cantidad, observacion }] (las líneas de menú completo incluyen nombre, elecciones e incluye) }], resumen[{ producto, cantidad }] }, ordenado por horaLlegada. Rol: Cocinero.

### `GET /api/comprobantes/{ventaId}`
- **Roles autorizados:** Autenticado
- **Casos de uso asociados:** CUS10.2
- **Documentado en:** Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `—`
- **Respuestas y Códigos HTTP:**
  200: datos del comprobante para la vista previa. 404: no existe. Roles: Cajero y Administrador.

### `GET /api/comprobantes/{ventaId}/pdf`
- **Roles autorizados:** Autenticado
- **Casos de uso asociados:** CUS10.2, CUS11.2
- **Documentado en:** Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `copia=true\`
- **Respuestas y Códigos HTTP:**
  200: PDF con la marca COPIA (o ANULADO) y registra la reimpresión. 404: no existe. Roles: Administrador y Cajero.

### `GET /api/inicio`
- **Roles autorizados:** Según rol (Administrador, Cajero, Mozo, Cocinero)
- **Casos de uso asociados:** CUS14.1
- **Documentado en:** Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `—`
- **Respuestas y Códigos HTTP:**
  200: { rol, fecha, bloques{ … } }, donde cada bloque es independiente { estado (ok \

### `GET /api/inicio/{bloque}`
- **Roles autorizados:** Según rol (Administrador, Cajero, Mozo, Cocinero)
- **Casos de uso asociados:** CUS14.1
- **Documentado en:** Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `bloque (nombre del bloque)`
- **Respuestas y Códigos HTTP:**
  200: solo ese bloque, para el botón Reintentar. 403: el rol no puede ver ese bloque. 404: bloque inexistente.

### `GET /api/menu-dia`
- **Roles autorizados:** Administrador (gestión) / Todos (consulta)
- **Casos de uso asociados:** CUS06.2, CUS07.1
- **Documentado en:** Anexo_CUS05_y_CUS06_Mesas_y_Pedido_de_Mesa_Girasoles.md, Anexo_CUS07_Pedido_para_Llevar_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `—`
- **Respuestas y Códigos HTTP:**
  Productos de carta, opciones por rol, menús completos y su disponibilidad (definido en el CUS04). Roles: Administrador, Cajero, Mozo y Cocinero.

### `GET /api/menus-completos`
- **Roles autorizados:** Administrador (gestión) / Todos (consulta)
- **Casos de uso asociados:** CUS03.5
- **Documentado en:** Anexo_CUS02_a_CUS04_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `—`
- **Respuestas y Códigos HTTP:**
  200: [{ id, nombre, precio, activo, incluye, partes[{ nombre, roles }] }]. Roles: Administrador (todos); los demás, solo los activos.

### `GET /api/mesas`
- **Roles autorizados:** Administrador (gestión) / Mozo, Cajero (lectura/estado)
- **Casos de uso asociados:** CUS05.3, CUS06.2
- **Documentado en:** Anexo_CUS05_y_CUS06_Mesas_y_Pedido_de_Mesa_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `estado (libre \`
- **Respuestas y Códigos HTTP:**
  Mesas libres para el selector (definido en el CUS05).

### `GET /api/pedidos`
- **Roles autorizados:** Mozo, Cajero, Administrador
- **Casos de uso asociados:** CUS08.1
- **Documentado en:** Anexo_CUS08_Gestion_de_Pedidos_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `fecha?, estado?, tipo?, mesaId?, soloMios?, pagina, tamano (20)`
- **Respuestas y Códigos HTTP:**
  200: { items[{ id, numero, tipo, mesa, referencia, hora, total, estado, registradoPor, esMio }], total, resumen{ pendiente, enPreparacion, listo, pagado, anulado } }. 403: fecha anterior para un rol distinto del Administrador. Roles: Administrador, Cajero y Mozo.

### `GET /api/pedidos/{id}`
- **Roles autorizados:** Mozo, Cajero, Administrador
- **Casos de uso asociados:** CUS06.2, CUS08.1, CUS10.2
- **Documentado en:** Anexo_CUS05_y_CUS06_Mesas_y_Pedido_de_Mesa_Girasoles.md, Anexo_CUS08_Gestion_de_Pedidos_Girasoles.md, Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `—`
- **Respuestas y Códigos HTTP:**
  200: detalle con líneas, opciones de los menús completos, observaciones, total, estado de cada comanda, registrado por y motivo. 404: no existe.

### `GET /api/productos`
- **Roles autorizados:** Administrador
- **Casos de uso asociados:** CUS03.5
- **Documentado en:** Anexo_CUS02_a_CUS04_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `busqueda, tipo, categoria (numérica o textual), rol, estado, pagina, tamano (10)`
- **Respuestas y Códigos HTTP:**
  200: { items[{id, nombre, tipo, categoria, rol, precio, activo}], total }.

### `GET /api/productos/disponibles`
- **Roles autorizados:** Administrador
- **Casos de uso asociados:** CUS03.5
- **Documentado en:** Anexo_CUS02_a_CUS04_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `categoria o rol (opcional)`
- **Respuestas y Códigos HTTP:**
  200: solo productos y componentes activos, con su tipo, categoría o rol. Roles: Administrador, Cajero, Mozo y Cocinero. Lo consumen el Menú del día (CUS04) y los pedidos (CUS06 y CUS07).

### `GET /api/productos/{id}`
- **Roles autorizados:** Administrador
- **Casos de uso asociados:** CUS03.5
- **Documentado en:** Anexo_CUS02_a_CUS04_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `—`
- **Respuestas y Códigos HTTP:**
  200: datos del producto. 404: no existe.

### `GET /api/reportes/platos`
- **Roles autorizados:** Administrador
- **Casos de uso asociados:** CUS13.2
- **Documentado en:** Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `desde, hasta, productoId?`
- **Respuestas y Códigos HTTP:**
  200: { totalPlatos, totalMonto, totalVentas, coincide, subtotales[{ categoria, cantidad, monto }], menusCompletos[{ menu, cantidad, monto }], componentes[{ rol, componente, veces }], items[{ productoId, producto, categoria, activo, cantidad, monto }], porDia[{ fecha, cantidad }] (solo con productoId) }. 400: rango inválido. 404: producto no existe.

### `GET /api/reportes/platos/exportar`
- **Roles autorizados:** Administrador
- **Casos de uso asociados:** CUS13.2
- **Documentado en:** Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `desde, hasta, productoId?, formato (pdf \`
- **Respuestas y Códigos HTTP:**
  csv)

### `GET /api/reportes/ventas`
- **Roles autorizados:** Administrador
- **Casos de uso asociados:** CUS13.2
- **Documentado en:** Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `desde, hasta`
- **Respuestas y Códigos HTTP:**
  200: { desde, hasta, nVentas, total, efectivo, yape, anuladas{ cantidad, monto }, porDia[{ fecha, nVentas, efectivo, yape, total, conAjustes }] }. 400: rango inválido (desde_mayor, futuro o rango_largo).

### `GET /api/reportes/ventas/exportar`
- **Roles autorizados:** Administrador
- **Casos de uso asociados:** CUS13.2
- **Documentado en:** Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `desde, hasta, formato (pdf \`
- **Respuestas y Códigos HTTP:**
  csv)

### `GET /api/usuarios`
- **Roles autorizados:** Administrador
- **Casos de uso asociados:** CUS02.6
- **Documentado en:** Anexo_CUS02_a_CUS04_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `busqueda, rol, estado, pagina, tamano (10)`
- **Respuestas y Códigos HTTP:**
  200: { items[{id, nombre, usuario, correo, rol, activo}], total }.

### `GET /api/usuarios/{id}`
- **Roles autorizados:** Administrador
- **Casos de uso asociados:** CUS02.6
- **Documentado en:** Anexo_CUS02_a_CUS04_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `—`
- **Respuestas y Códigos HTTP:**
  200: datos del usuario (sin contraseña). 404: no existe.

### `GET /api/ventas`
- **Roles autorizados:** Administrador, Cajero
- **Casos de uso asociados:** CUS11.2
- **Documentado en:** Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `busqueda?, desde?, hasta?, pagina, tamano (20)`
- **Respuestas y Códigos HTTP:**
  200: { items[{ ventaId, comprobante, fechaHora, pedidoNumero, tipo, mesa, referencia, total, metodo, cajero, estado }], total, resumen{ vigentes, totalVigente, efectivo, yape, anuladas } }. 400: búsqueda o rango inválidos. 403: el Cajero pide más de 7 días atrás. Roles: Administrador y Cajero.

### `GET /api/ventas/{id}`
- **Roles autorizados:** Administrador, Cajero
- **Casos de uso asociados:** CUS11.2
- **Documentado en:** Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `—`
- **Respuestas y Códigos HTTP:**
  200: detalle con líneas, montos, método, referencia de Yape, cajero, estado y, si está anulada, motivo, usuario, fecha y destino del pedido. 404: no existe. Roles: Administrador y Cajero.

### `PATCH /api/comandas/{id}/estado`
- **Roles autorizados:** Cocinero, Administrador
- **Casos de uso asociados:** CUS09.2
- **Documentado en:** Anexo_CUS09_Comandas_de_Cocina_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `{ estado: enPreparacion \`
- **Respuestas y Códigos HTTP:**
  lista }

### `PATCH /api/menus-completos/{id}/estado`
- **Roles autorizados:** Administrador (gestión) / Todos (consulta)
- **Casos de uso asociados:** CUS03.5
- **Documentado en:** Anexo_CUS02_a_CUS04_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `{ activo }`
- **Respuestas y Códigos HTTP:**
  200: { activo, retiradoDelMenu }. 404: no existe. Rol: Administrador.

### `PATCH /api/mesas/{id}/estado`
- **Roles autorizados:** Administrador (gestión) / Mozo, Cajero (lectura/estado)
- **Casos de uso asociados:** CUS05.3
- **Documentado en:** Anexo_CUS05_y_CUS06_Mesas_y_Pedido_de_Mesa_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `{ activa }`
- **Respuestas y Códigos HTTP:**
  200: vigencia actualizada. 404: no existe. 409: la mesa está ocupada. Rol: Administrador.

### `PATCH /api/productos/{id}/estado`
- **Roles autorizados:** Administrador
- **Casos de uso asociados:** CUS03.5
- **Documentado en:** Anexo_CUS02_a_CUS04_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `{ activo }`
- **Respuestas y Códigos HTTP:**
  200: { activo, retiradoDelMenu }. 404: no existe.

### `PATCH /api/usuarios/{id}/estado`
- **Roles autorizados:** Administrador
- **Casos de uso asociados:** CUS02.6
- **Documentado en:** Anexo_CUS02_a_CUS04_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `{ activo }`
- **Respuestas y Códigos HTTP:**
  200: estado actualizado. 404: no existe. 409: propia cuenta o último administrador activo.

### `POST /api/auth/forgot-password`
- **Roles autorizados:** Público (Anónimo)
- **Casos de uso asociados:** CUS01.2
- **Documentado en:** Anexo_CUS01_Inicio_de_Sesion_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `{ correo }`
- **Respuestas y Códigos HTTP:**
  200: siempre el mismo cuerpo (MSG-11). 400: formato inválido. 500: error de envío.

### `POST /api/auth/login`
- **Roles autorizados:** Público (Anónimo)
- **Casos de uso asociados:** CUS01.2
- **Documentado en:** Anexo_CUS01_Inicio_de_Sesion_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `{ usuario, contrasena }`
- **Respuestas y Códigos HTTP:**
  200: { token, rol, nombre }. 400: datos inválidos. 401: credenciales incorrectas. 403: usuario inactivo. 423: cuenta bloqueada. 500: error interno.

### `POST /api/auth/logout`
- **Roles autorizados:** Autenticado (Cualquier rol)
- **Casos de uso asociados:** CUS03
- **Documentado en:** Anexo_CUS02_a_CUS04_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `{ motivo: manual \`
- **Respuestas y Códigos HTTP:**
  inactividad }

### `POST /api/auth/renovar`
- **Roles autorizados:** Autenticado (Cualquier rol)
- **Casos de uso asociados:** CUS03
- **Documentado en:** Anexo_CUS02_a_CUS04_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `—`
- **Respuestas y Códigos HTTP:**
  200: { token } nuevo (acción CONTINUAR). 401: sesión vencida.

### `POST /api/auth/reset-password`
- **Roles autorizados:** Público (Anónimo)
- **Casos de uso asociados:** CUS01.2
- **Documentado en:** Anexo_CUS01_Inicio_de_Sesion_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `{ correo, codigo, nuevaContrasena }`
- **Respuestas y Códigos HTTP:**
  200: contraseña actualizada. 400: código incorrecto/vencido o contraseña inválida. 500: error interno.

### `POST /api/avisos/{id}/visto`
- **Roles autorizados:** Mozo, Administrador
- **Casos de uso asociados:** CUS08.1
- **Documentado en:** Anexo_CUS08_Gestion_de_Pedidos_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `—`
- **Respuestas y Códigos HTTP:**
  204: aviso marcado como visto. 404: no existe o ya fue visto.

### `POST /api/caja/abrir`
- **Roles autorizados:** Cajero, Administrador
- **Casos de uso asociados:** CUS12.3
- **Documentado en:** Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `{ solicitudId, montoInicial }`
- **Respuestas y Códigos HTTP:**
  201: caja abierta. 400: monto inválido. 409: caja_abierta o caja_anterior_sin_cerrar. 403: rol no permitido. Idempotente. Rol: Cajero.

### `POST /api/caja/cerrar`
- **Roles autorizados:** Cajero, Administrador
- **Casos de uso asociados:** CUS12.3
- **Documentado en:** Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `{ solicitudId, efectivoContado, observacion?, efectivoEsperadoMostrado }`
- **Respuestas y Códigos HTTP:**
  200: { cierreId, efectivoEsperado, diferencia, resultado (cuadra \

### `POST /api/cobros`
- **Roles autorizados:** Cajero, Administrador
- **Casos de uso asociados:** CUS10.2
- **Documentado en:** Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `{ solicitudId, pedidoId, totalMostrado, metodo (efectivo \`
- **Respuestas y Códigos HTTP:**
  yape), montoRecibido?, yapeConfirmado?, yapeReferencia? }

### `POST /api/comandas/{id}/deshacer`
- **Roles autorizados:** Cocinero, Administrador
- **Casos de uso asociados:** CUS09.2
- **Documentado en:** Anexo_CUS09_Comandas_de_Cocina_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `—`
- **Respuestas y Códigos HTTP:**
  200: { estado } anterior. 409: pasaron más de 10 segundos, el pedido está pagado o anulado, o el estado ya cambió. 404: no existe. Rol: Cocinero.

### `POST /api/mesas`
- **Roles autorizados:** Administrador (gestión) / Mozo, Cajero (lectura/estado)
- **Casos de uso asociados:** CUS05.3
- **Documentado en:** Anexo_CUS05_y_CUS06_Mesas_y_Pedido_de_Mesa_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `{ nombre }`
- **Respuestas y Códigos HTTP:**
  201: mesa creada, activa y libre. 400: nombre inválido. 409: nombre duplicado. Rol: Administrador.

### `POST /api/pedidos/llevar`
- **Roles autorizados:** Cajero, Administrador
- **Casos de uso asociados:** CUS07.1
- **Documentado en:** Anexo_CUS07_Pedido_para_Llevar_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `{ solicitudId, referencia?, lineas[] } donde cada línea es { productoId, cantidad, observacion? } o { menuCompletoId, elecciones[{ parte, productoId }], cantidad, observacion? }`
- **Respuestas y Códigos HTTP:**
  201: { pedidoId, numero, total, comandaId }. 400: sin líneas, partes sin elegir, cantidad, observación o referencia inválidas. 409: plato, opción o menú agotado, inactivo o fuera del menú (con la lista). 403: rol no permitido. Rol: Cajero.

### `POST /api/pedidos/mesa`
- **Roles autorizados:** Mozo, Administrador
- **Casos de uso asociados:** CUS06.2
- **Documentado en:** Anexo_CUS05_y_CUS06_Mesas_y_Pedido_de_Mesa_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `{ solicitudId, mesaId, lineas[] } donde cada línea es { productoId, cantidad, observacion? } o { menuCompletoId, elecciones[{ parte, productoId }], cantidad, observacion? }`
- **Respuestas y Códigos HTTP:**
  201: { pedidoId, numero, total, comandaId }. 400: sin líneas, partes sin elegir, cantidad u observación inválidas. 404: la mesa no existe. 409: mesa inactiva, plato, opción o menú agotado, inactivo o fuera del menú (con la lista). 403: rol no permitido. Roles: Mozo y Administrador.

### `POST /api/pedidos/{id}/anular`
- **Roles autorizados:** Mozo, Cajero, Administrador
- **Casos de uso asociados:** CUS08.1
- **Documentado en:** Anexo_CUS08_Gestion_de_Pedidos_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `{ solicitudId, motivo }`
- **Respuestas y Códigos HTTP:**
  200: pedido anulado. 400: motivo inválido. 403: no es su pedido y no es Administrador. 409: pedido pagado o anulado, o cocina ya inició (no aplica al Administrador). Roles: Mozo, Cajero y Administrador.

### `POST /api/pedidos/{id}/lineas`
- **Roles autorizados:** Mozo, Cajero, Administrador
- **Casos de uso asociados:** CUS06.2
- **Documentado en:** Anexo_CUS05_y_CUS06_Mesas_y_Pedido_de_Mesa_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `{ solicitudId, lineas[] } con el mismo formato de línea que POST /api/pedidos/mesa`
- **Respuestas y Códigos HTTP:**
  200: { total, comandaId }. 400: datos inválidos. 404: no existe. 409: pedido pagado o anulado (pedido_cerrado), plato agotado o inactivo. Roles: Mozo y Administrador.

### `POST /api/productos`
- **Roles autorizados:** Administrador
- **Casos de uso asociados:** CUS03.5
- **Documentado en:** Anexo_CUS02_a_CUS04_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `{ nombre, tipo, categoria?, rol?, precio? }`
- **Respuestas y Códigos HTTP:**
  201: registro creado y activo. 400: datos inválidos con el campo afectado (categoría desconocida; falta de categoría o precio en un producto de carta; falta de rol o precio presente en un componente). 409: nombre duplicado dentro del tipo.

### `POST /api/usuarios`
- **Roles autorizados:** Administrador
- **Casos de uso asociados:** CUS02.6
- **Documentado en:** Anexo_CUS02_a_CUS04_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `{ nombre, usuario, correo, contrasena, rol }`
- **Respuestas y Códigos HTTP:**
  201: usuario creado. 400: datos inválidos. 409: usuario o correo duplicado.

### `POST /api/ventas/{id}/anular`
- **Roles autorizados:** Administrador, Cajero
- **Casos de uso asociados:** CUS11.2
- **Documentado en:** Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `{ solicitudId, motivo, destinoPedido: porCobrar \`
- **Respuestas y Códigos HTTP:**
  anular }

### `PUT /api/menus-completos/{id}`
- **Roles autorizados:** Administrador (gestión) / Todos (consulta)
- **Casos de uso asociados:** CUS03.5
- **Documentado en:** Anexo_CUS02_a_CUS04_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `{ precio }`
- **Respuestas y Códigos HTTP:**
  200: precio actualizado. 400: precio inválido. 404: no existe. Rol: Administrador.

### `PUT /api/mesas/{id}`
- **Roles autorizados:** Administrador (gestión) / Mozo, Cajero (lectura/estado)
- **Casos de uso asociados:** CUS05.3
- **Documentado en:** Anexo_CUS05_y_CUS06_Mesas_y_Pedido_de_Mesa_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `{ nombre }`
- **Respuestas y Códigos HTTP:**
  200: actualizada. 400: nombre inválido. 404: no existe. 409: nombre duplicado. Rol: Administrador.

### `PUT /api/pedidos/{id}`
- **Roles autorizados:** Mozo, Cajero, Administrador
- **Casos de uso asociados:** CUS08.1
- **Documentado en:** Anexo_CUS08_Gestion_de_Pedidos_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `{ lineas[] } donde cada línea es { productoId, cantidad, observacion? } o { menuCompletoId, elecciones[{ parte, productoId }], cantidad, observacion? }`
- **Respuestas y Códigos HTTP:**
  200: { total }. 400: datos inválidos. 403: no es el pedido del usuario o rol no permitido. 409: cocina ya inició, pedido pagado o anulado, o plato agotado. Roles: Mozo, Cajero y Administrador.

### `PUT /api/perfil/contrasena`
- **Roles autorizados:** Autenticado (Cualquier rol)
- **Casos de uso asociados:** CUS02.6
- **Documentado en:** Anexo_CUS02_a_CUS04_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `{ contrasenaActual, nuevaContrasena }`
- **Respuestas y Códigos HTTP:**
  204: actualizada (se entrega token nuevo). 400: datos inválidos, nueva igual a la actual o actual incorrecta (con el campo afectado). 403: rol no permitido. 423: sesión cerrada por intentos fallidos.

### `PUT /api/productos/{id}`
- **Roles autorizados:** Administrador
- **Casos de uso asociados:** CUS03.5
- **Documentado en:** Anexo_CUS02_a_CUS04_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `{ nombre, tipo, categoria?, rol?, precio? }`
- **Respuestas y Códigos HTTP:**
  200: actualizado. 400: datos inválidos. 404: no existe. 409: nombre duplicado dentro del tipo o cambio de tipo con pedidos registrados.

### `PUT /api/usuarios/{id}`
- **Roles autorizados:** Administrador
- **Casos de uso asociados:** CUS02.6
- **Documentado en:** Anexo_CUS02_a_CUS04_Girasoles.md
- **Parámetros / Cuerpo de Entrada:** `{ nombre, usuario, correo, rol, contrasena? }`
- **Respuestas y Códigos HTTP:**
  200: actualizado. 400: datos inválidos. 404: no existe. 409: duplicado o sin administrador activo.
