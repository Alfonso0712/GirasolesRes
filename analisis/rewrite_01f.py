import re
from pathlib import Path

FILE_PATH = Path(r"e:\Downloads\GirasolesRes\analisis\01f_calidad_documentacion.md")

content = """# Informe de Calidad, Trazabilidad, Consistencia y Métricas de la Documentación (GirasolesRes)

Este documento contiene la auditoría de calidad, trazabilidad y consistencia interna de la documentación vigente, elaborada exclusivamente a partir de los 8 documentos de especificación técnica del sistema (*Historias_de_Usuario_35RF_35HU_Girasoles* y los 7 anexos de casos de uso *CUS01* a *CUS14*).

---

## 1. Matriz de Cobertura Exacta HU ↔ RF ↔ Subcaso de Uso (35 a 35 a 35)

| # | Historia de Usuario (HU) | Requerimiento Funcional (RF) | Subcaso de Uso (CUS) | Iteración | Prioridad (MoSCoW) |
|---|---|---|---|:---:|:---:|
| 1 | **HU01** | **RF-01** | **CUS01.1**: Iniciar sesión | 1/3 | Must (Alta) |
| 2 | **HU02** | **RF-02** | **CUS02.2**: Registrar usuario | 1/3 | Must (Alta) |
| 3 | **HU03** | **RF-03** | **CUS02.1**: Listar y buscar usuarios | 1/3 | Must (Alta) |
| 4 | **HU04** | **RF-04** | **CUS02.3**: Editar usuario | 2/3 | Should (Media) |
| 5 | **HU05** | **RF-05** | **CUS02.4**: Activar o desactivar usuario | 2/3 | Should (Media) |
| 6 | **HU06** | **RF-06** | **CUS02.6**: Cambiar contraseña | 2/3 | Should (Media) |
| 7 | **HU07** | **RF-07** | **CUS01.2**: Recuperar contraseña | 2/3 | Should (Media) |
| 8 | **HU08** | **RF-08** | **CUS02.5**: Eliminar usuario | 3/3 | Could (Baja) |
| 9 | **HU09** | **RF-09** | **CUS03.1**: Registrar producto o componente | 1/3 | Must (Alta) |
| 10 | **HU10** | **RF-10** | **CUS03.2**: Listar y buscar productos | 2/3 | Should (Media) |
| 11 | **HU11** | **RF-11** | **CUS03.3**: Editar producto | 2/3 | Should (Media) |
| 12 | **HU12** | **RF-12** | **CUS03.4**: Activar o desactivar producto | 2/3 | Should (Media) |
| 13 | **HU13** | **RF-13** | **CUS04.1**: Definir menú del día con opciones | 2/3 | Should (Media) |
| 14 | **HU14** | **RF-14** | **CUS04.2**: Marcar plato u opción como agotado o disponible | 3/3 | Could (Baja) |
| 15 | **HU15** | **RF-15** | **CUS05.1**: Registrar mesa | 1/3 | Must (Alta) |
| 16 | **HU16** | **RF-16** | **CUS05.2**: Ver mesas y su estado | 1/3 | Must (Alta) |
| 17 | **HU17** | **RF-17** | **CUS05.3**: Editar o desactivar mesa | 3/3 | Could (Baja) |
| 18 | **HU18** | **RF-18** | **CUS06.1**: Registrar pedido de mesa con menús completos | 1/3 | Must (Alta) |
| 19 | **HU19** | **RF-19** | **CUS06.2**: Agregar productos a un pedido de mesa | 2/3 | Should (Media) |
| 20 | **HU20** | **RF-20** | **CUS07.1**: Registrar pedido para llevar | 1/3 | Must (Alta) |
| 21 | **HU21** | **RF-21** | **CUS08.2**: Modificar o anular pedido | 1/3 | Must (Alta) |
| 22 | **HU22** | **RF-22** | **CUS08.1**: Listar pedidos con su estado y avisar comanda lista | 1/3 | Must (Alta) |
| 23 | **HU23** | **RF-23** | **CUS09.1**: Ver comandas pendientes | 1/3 | Must (Alta) |
| 24 | **HU24** | **RF-24** | **CUS09.2**: Actualizar estado de la comanda | 1/3 | Must (Alta) |
| 25 | **HU25** | **RF-25** | **CUS10.1**: Cobrar pedido (método de pago, vuelto y liberación) | 1/3 | Must (Alta) |
| 26 | **HU26** | **RF-26** | **CUS10.2**: Emitir comprobante de pago | 1/3 | Must (Alta) |
| 27 | **HU27** | **RF-27** | **CUS11.2**: Anular venta | 1/3 | Must (Alta) |
| 28 | **HU28** | **RF-28** | **CUS11.1**: Listar y buscar ventas | 1/3 | Must (Alta) |
| 29 | **HU29** | **RF-29** | **CUS12.1**: Abrir caja | 1/3 | Must (Alta) |
| 30 | **HU30** | **RF-30** | **CUS12.2**: Cerrar caja y cuadrar | 1/3 | Must (Alta) |
| 31 | **HU31** | **RF-31** | **CUS12.3**: Consultar historial de cierres | 2/3 | Should (Media) |
| 32 | **HU32** | **RF-32** | **CUS13.1**: Consultar reporte de ventas | 2/3 | Should (Media) |
| 33 | **HU33** | **RF-33** | **CUS13.2**: Consultar platos vendidos | 1/3 | Must (Alta) |
| 34 | **HU34** | **RF-34** | **CUS14.1**: Ver indicadores del día | 2/3 | Should (Media) |
| 35 | **HU35** | **RF-35** | **CUS03.5**: Gestionar menús completos | 2/3 | Should (Media) |

---

## 2. Auditoría de Trazabilidad: IDs Referenciados no Definidos y Definidos no Referenciados

### 2.1 IDs Referenciados no Definidos (8 encontrados en textos de decisión/cambios)
Corresponden a códigos históricos que aparecen en las secciones explicativas de cambios y tablas de correspondencia de los anexos:
1. **`RV-44` y `MSG-68`**: Reemplazados por `RV-162` y `MSG-224` en el ajuste de menús completos (*Anexo_CUS02_a_CUS04_Girasoles.md*, tabla 8.1).
2. **`RV-46` y `RN-38`**: Derogados por `RN-135` al estructurarse el Desayuno completo (*Anexo_CUS02_a_CUS04_Girasoles.md*, tabla 8.1).
3. **`E-95` y `E-97`**: Reemplazados por `E-381` a `E-383` (*Anexo_CUS02_a_CUS04_Girasoles.md*, tabla 8.1).
4. **`RF-40` y `HU40`**: Retirados del alcance formal al clasificarse el panel por rol como navegación base de la aplicación (*Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md*, sección 16 y Anexo B).

### 2.2 IDs Definidos y Nunca Referenciados Fuera de su Tabla (14 encontrados)
Se revisó la definición de cada uno en su documento de origen:

1. **`E-39`** (*Anexo_CUS02_a_CUS04_Girasoles.md*, tabla de escenarios del Anexo A):
   - Texto exacto: *"Cerrar sesión y confirmar | Vuelve al login con MSG-41; el cierre queda en auditoría. | RN-19, 21 | Anexo A"*.
   - Descripción: Valida la confirmación de cierre voluntario de sesión desde la barra superior de navegación.
2. **`E-40`** (*Anexo_CUS02_a_CUS04_Girasoles.md*, tabla de escenarios del Anexo A):
   - Texto exacto: *"Cancelar el cierre (botón o Esc) | La sesión continúa y el diálogo se cierra. | RV-31 | Anexo A"*.
   - Descripción: Valida que al cancelar el modal de confirmación de salida la sesión permanezca activa.
3. **`E-41`** (*Anexo_CUS02_a_CUS04_Girasoles.md*, tabla de escenarios del Anexo A):
   - Texto exacto: *"Pulsar Atrás tras cerrar sesión | Redirige al login sin mostrar datos. | RNF-09 | Anexo A"*.
   - Descripción: Valida la protección de historial del navegador para evitar ver información de sesión previa tras desautenticarse.
4. **`E-42`** (*Anexo_CUS02_a_CUS04_Girasoles.md*, tabla de escenarios del Anexo A):
   - Texto exacto: *"Usar un token después de cerrar sesión | El servidor responde 401. | RN-19 | Anexo A"*.
   - Descripción: Valida la revocación e invalidación del token JWT tras el logout.
5. **`E-43`** (*Anexo_CUS02_a_CUS04_Girasoles.md*, tabla de escenarios del Anexo A):
   - Texto exacto: *"28 minutos de inactividad y pulsar CONTINUAR | Aparece MSG-42; la sesión se renueva. | RN-20, RV-32 | Anexo A"*.
   - Descripción: Valida la advertencia preventiva a los 28 minutos de inactividad y la renovación exitosa de la sesión.
6. **`E-44`** (*Anexo_CUS02_a_CUS04_Girasoles.md*, tabla de escenarios del Anexo A):
   - Texto exacto: *"30 minutos de inactividad sin responder | Cierra la sesión y muestra MSG-43. | RN-20 | Anexo A"*.
   - Descripción: Valida el cierre automático forzado de sesión al cumplirse 30 minutos sin interacción.
7. **`E-45`** (*Anexo_CUS02_a_CUS04_Girasoles.md*, tabla de escenarios del Anexo A):
   - Texto exacto: *"Cerrar sesión con el servidor caído | Se cierra en el equipo y se muestra MSG-50. | RN-19 | Anexo A"*.
   - Descripción: Valida el cierre de sesión en el cliente local aun ante indisponibilidad del servidor.
8. **`E-54`** (*Anexo_CUS02_a_CUS04_Girasoles.md*, tabla de escenarios del Anexo A):
   - Texto exacto: *"Solo teclado | Tab recorre la barra y los formularios; Enter confirma; Esc cancela; el foco es visible. | RNF-08 | Anexo A"*.
   - Descripción: Prueba de accesibilidad por teclado en la barra superior de navegación.
9. **`E-73`** (*Anexo_CUS02_a_CUS04_Girasoles.md*, tabla de escenarios de CUS03):
   - Texto exacto: *"Falla del servidor al cargar o guardar | MSG-67 o MSG-38; se conservan los datos escritos. | RNF-12 | HU09 a HU12"*.
   - Descripción: Caso de error de red o indisponibilidad del servidor en la gestión de productos preservando los datos ingresados.
10. **`E-136`** (*Anexo_CUS05_y_CUS06_Mesas_y_Pedido_de_Mesa_Girasoles.md*, tabla de escenarios de CUS05):
    - Texto exacto: *"Falla del servidor al cargar o guardar | MSG-94 o MSG-38; se conservan los datos escritos. | RNF-20 | HU15 a HU17"*.
    - Descripción: Caso de error de red o servidor en la gestión de mesas conservando los campos del formulario.
11. **`E-137`** (*Anexo_CUS05_y_CUS06_Mesas_y_Pedido_de_Mesa_Girasoles.md*, tabla de escenarios de CUS05):
    - Texto exacto: *"Solo teclado | Tab recorre filtro, tarjetas y diálogos; Enter confirma; Esc cancela. | RNF-19 | HU15 a HU17"*.
    - Descripción: Prueba de navegación y operación de la cuadrícula de mesas mediante teclado.
12. **`E-343`** (*Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md*, tabla de escenarios de CUS12):
    - Texto exacto: *"Solo teclado | Tab recorre botones, campos, el contador y los diálogos; los números se escriben con el teclado; Enter confirma; Esc cancela. | RNF-47 | HU29 a HU31"*.
    - Descripción: Prueba de accesibilidad y operación por teclado en el módulo de caja y conteo físico.
13. **`RN-55`** (*Anexo_CUS05_y_CUS06_Mesas_y_Pedido_de_Mesa_Girasoles.md*, tabla de reglas de negocio de CUS06):
    - Texto exacto: *"Las líneas ya registradas no se modifican ni se eliminan desde este CUS; se hace desde la gestión de pedidos (CUS08.2) antes de que cocina inicie."*
    - Descripción: Delimita la responsabilidad entre la toma de pedidos (CUS06) y la modificación posterior (CUS08.2).
14. **`RV-105-B`** (*Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md*, tabla de reglas de validación de CUS10):
    - Texto exacto: *"Si se selecciona Factura, el RUC debe contener exactamente 11 dígitos numéricos y comenzar con 10 o 20. | Campo RUC | MSG-227"*.
    - Descripción: Regla de validación de formato para el número de RUC en la emisión de facturas.

---

## 3. Matriz de Búsqueda de Contradicciones entre Reglas de la Documentación

Se realizó la comparación sistemática entre reglas que abordan el mismo campo, límite o comportamiento operativo:

1. **Límite de caracteres en Motivo de Anulación:**
   - `RV-76` (*CUS08.2*): *"El motivo de anulación es obligatorio, de 5 a 100 caracteres, con motivos rápidos que lo rellenan; se recortan los espacios de los extremos."*
   - `RV-113` (*CUS11.2*): *"El motivo de anulación es obligatorio, de 5 a 100 caracteres, con motivos rápidos que lo rellenan; se recortan los espacios de los extremos."*
   - *Resultado:* Idénticos límites (5 a 100 caracteres).
2. **Nombre y número de mesa:**
   - `RV-168` (*CUS05*): *"El número o nombre de la mesa es obligatorio y tiene entre 1 y 20 caracteres (letras, números, espacios, tildes, guion y punto)."*
   - Diccionario de datos de Mesa (*CUS05*, tabla 22): *"1–20; letras, números, espacios, tildes, - y ."*
   - *Resultado:* Consistente (1 a 20 caracteres).
3. **Nombre de producto:**
   - `RV-33` (*CUS03*): *"El nombre es obligatorio: 3 a 50 caracteres (letras, números, espacios, tildes y . , - ( ))."*
   - Diccionario de datos de Producto (*CUS03*, tabla 60): *"3–50; letras, números, espacios, tildes y . , - ( )"*
   - *Resultado:* Consistente (3 a 50 caracteres).
4. **Nombre completo de usuario / personal:**
   - `RV-11` (*CUS02*): *"El nombre completo es obligatorio: 3 a 60 caracteres, solo letras, tildes y espacios."*
   - Diccionario de datos de Usuario (*CUS02*, tabla 15): *"3–60; letras, tildes y espacios"*
   - *Resultado:* Consistente (3 a 60 caracteres).
5. **Nombre de cuenta de usuario:**
   - `RV-03` (*CUS01*): *"El usuario debe cumplir el formato definido (3–30 caracteres, sin espacios internos)."*
   - `RV-12` (*CUS02*): *"El usuario es obligatorio, con el formato del CUS01 (3 a 30 caracteres, sin espacios) y único sin distinguir mayúsculas."*
   - *Resultado:* Consistente (3 a 30 caracteres).
6. **Contraseña:**
   - `RV-13` (*CUS02*): *"La contraseña es obligatoria al registrar (8 a 64 caracteres) y opcional al editar."*
   - `RV-24` (*CUS02*): *"La nueva contraseña es obligatoria y tiene entre 8 y 64 caracteres."*
   - *Resultado:* Consistente (8 a 64 caracteres).
7. **Tiempo para deshacer comanda en cocina:**
   - `RV-88` (*CUS09*): *"Cambiar el estado no pide confirmación; aparece un aviso con DESHACER durante 10 segundos."*
   - `RN-78` (*CUS09*): *"Iniciar la preparación bloquea la modificación y anulación del pedido (RN-65); al deshacer dentro de 10 segundos, la comanda vuelve a Pendiente y se reabre."*
   - *Resultado:* Consistente (10 segundos).
8. **Umbral fiscal de Boleta Simple:**
   - `RV-105-C` (*CUS10*): *"Para montos totales iguales o superiores a S/ 700.00, la opción Boleta Simple queda inhabilitada; se exige comprobante con documento (DNI o RUC)."*
   - `RN-95-B` (*CUS10*): *"Exigencia de identidad desde S/ 700.00: ningún cobro cuyo monto final sea igual o superior a S/ 700.00 podrá emitirse como consumidor final anónimo. El sistema requiere DNI o RUC válido y registrado."*
   - *Resultado:* Consistente (a partir de S/ 700.00).
9. **Inactividad de sesión:**
   - `RN-20` (*Anexo A*): *"La sesión expira a los 30 minutos de inactividad, con aviso a los 28 minutos. Única excepción: el Cocinero en la pantalla de comandas de cocina, que mantiene la sesión vigente mientras esté abierta (RN-82, CUS09)."*
   - `RV-32` (*Anexo A*): *"Dos minutos antes de expirar, se avisa al usuario con la opción CONTINUAR."*
   - *Resultado:* Consistente (aviso a los 28 min, expiración a los 30 min).

**Conclusión:** No se encontraron contradicciones entre las reglas documentadas en los 8 archivos vigentes.

---

## 4. Ambigüedades Identificadas en el Texto de la Documentación

Se registran los puntos textuales donde la propia documentación explicita indeterminación o dependencia de confirmación:

1. **Inclusión de refresco en el Almuerzo Completo:**
   - Texto citado: *"Almuerzo completo · S/ 8.00 \| Una sopa o una entrada, y un segundo. Incluye refresco del día (a confirmar con la dueña)."* (*Anexo_CUS02_a_CUS04_Girasoles.md*, tabla 70).
2. **Inclusión de refresco en el Solo Segundo:**
   - Texto citado: *"Solo segundo · S/ 7.00 \| Un segundo, sin sopa ni entrada (a confirmar si lleva refresco)."* (*Anexo_CUS02_a_CUS04_Girasoles.md*, tabla 70).

---

## 5. Tabla de Límites, Valores Numéricos y Umbrales Extraídos de las Reglas (RV, RN y RNF)

Extracción íntegra de reglas que contienen *"caracteres"*, *"dígitos"*, *"segundos"*, *"minutos"*, *"días"*, *"S/"* o *"hasta"*, ordenadas alfabéticamente por campo:

| Campo / Concepto | Valor / Límite | ID | Texto Citado de la Regla |
|---|---|:---:|---|
| **Bloqueo de cuenta** | 5 intentos, 15 minutos | `RN-03` | *"Tras 5 intentos fallidos consecutivos la cuenta se bloquea 15 minutos; un ingreso correcto reinicia el contador."* |
| **Botones de efectivo** | S/ 10, 20, 50, 100, 200 | `RV-104` | *"Los botones rápidos de efectivo ("Exacto", S/ 10, 20, 50, 100 y 200) solo aparecen si cubren el total."* |
| **Búsqueda de texto** | Hasta 50 caracteres, 300 ms | `RV-22` | *"El texto de búsqueda admite hasta 50 caracteres y se aplica al escribir (espera de 300 ms)."* |
| **Búsqueda de texto** | Hasta 50 caracteres, 300 ms | `RV-40` | *"La búsqueda admite hasta 50 caracteres y se aplica tras 300 ms."* |
| **Búsqueda de ventas** | Hasta 15 caracteres | `RV-108` | *"La búsqueda por número acepta el número completo ("T001-000123") o solo el correlativo ("123" o "000123"); se recortan los espacios y admite hasta 15 caracteres."* |
| **Búsqueda de ventas** | 8 u 11 dígitos | `RV-108-B` | *"El filtro de búsqueda por comprobante acepta formato completo (B001-000045, F001-000012, T001-000123), solo el correlativo (45, 12) o el DNI/RUC del cliente (8 u 11 dígitos)."* |
| **Caldo de gallina** | S/ 5.00 y S/ 10.00 | `RN-33` | *"El caldo de gallina se maneja como dos productos independientes: "Caldo de gallina (Entrada)" a S/ 5.00 en Almuerzo y "Caldo de gallina criollo (Plato fuerte)" a S/ 10.00 en Platos Extras / A la Carta."* |
| **Carga de comandas** | Hasta 200 pedidos, 15 s | `RNF-28` | *"La lista carga en menos de 2 segundos con hasta 200 pedidos del día y se refresca cada 15 segundos; los avisos se consultan en el mismo ciclo, por lo que aparecen en 15 segundos o menos."* |
| **Carga de mesas** | Hasta 50 mesas, 15 s | `RNF-18` | *"La vista carga en menos de 2 segundos con hasta 50 mesas y se refresca cada 15 segundos."* |
| **Carga de productos** | Hasta 200 productos | `RNF-11` | *"La lista responde en menos de 2 segundos con hasta 200 productos y se pagina de 10 en 10."* |
| **Carga de usuarios** | Hasta 100 usuarios | `RNF-05` | *"La lista responde en menos de 2 segundos con hasta 100 usuarios y se pagina de 10 en 10."* |
| **Carga de ventas** | Hasta 3,000 ventas | `RNF-41` | *"La consulta responde en menos de 2 segundos con hasta 3,000 ventas en el rango (paginada en el servidor); el comprobante se genera en menos de 3 segundos."* |
| **Carga de ventas (reporte)** | Hasta 40,000 ventas | `RNF-50` | *"La consulta responde en menos de 3 segundos con hasta 40,000 ventas en el rango (agregación en la base de datos con índices por fecha)."* |
| **Código de recuperación** | 15 minutos | `RN-04` | *"El código de recuperación vence a los 15 minutos, es de un solo uso y se invalida al generar uno nuevo."* |
| **Contraseña** | 8 a 64 caracteres | `RV-13` | *"La contraseña es obligatoria al registrar (8 a 64 caracteres) y opcional al editar."* |
| **Contraseña nueva** | 8 a 64 caracteres | `RV-24` | *"La nueva contraseña es obligatoria y tiene entre 8 y 64 caracteres."* |
| **Correo electrónico** | Máximo 100 caracteres | `RV-16` | *"El correo tiene formato válido, es único y máx. 100 caracteres; es obligatorio si el rol es Administrador."* |
| **Demora en cocina** | Desde 15 minutos | `RV-91` | *"El tiempo de espera se muestra en minutos; desde los 15 minutos se resalta con el texto "Demora" además del color."* |
| **Demora en cocina** | Más de 15 minutos | `RN-128` | *"Las alertas del Administrador son: caja de un día anterior sin cerrar (RN-108), menú de hoy sin definir (solo con la caja del día abierta), comandas con más de 15 minutos de espera, platos agotados, ventas anuladas hoy y último cierre con diferencia."* |
| **Deshacer comanda** | 10 segundos | `RV-88` | *"Cambiar el estado no pide confirmación; aparece un aviso con DESHACER durante 10 segundos."* |
| **Deshacer comanda** | 10 segundos | `RN-78` | *"Iniciar la preparación bloquea la modificación y anulación del pedido (RN-65); al deshacer dentro de 10 segundos, la comanda vuelve a Pendiente y se reabre."* |
| **DNI del cliente** | 8 dígitos | `RV-105-A` | *"Si se selecciona Boleta con DNI, el DNI debe contener exactamente 8 dígitos numéricos."* |
| **Efectivo contado (caja)** | Hasta 99,999.99, 2 decimales | `RV-124` | *"El efectivo contado es obligatorio, numérico, desde 0, hasta 99,999.99 y con hasta 2 decimales; puede llenarse con el contador de billetes y monedas."* |
| **Formato de montos** | Prefijo "S/", 2 decimales | `RV-143` | *"Los montos se muestran con prefijo "S/" y 2 decimales, y las cantidades como números enteros, alineados a la derecha."* |
| **Formato de montos** | Prefijo "S/", 2 decimales | `RV-150` | *"Los montos se muestran con prefijo "S/" y 2 decimales, las cantidades como enteros y los ceros como 0, nunca vacíos."* |
| **Inactividad de sesión** | 30 minutos (aviso a 28) | `RN-20` | *"La sesión expira a los 30 minutos de inactividad, con aviso a los 28 minutos. Única excepción: el Cocinero en la pantalla de comandas de cocina, que mantiene la sesión vigente mientras esté abierta (RN-82, CUS09)."* |
| **Inactividad de sesión** | 2 minutos antes | `RV-32` | *"Dos minutos antes de expirar, se avisa al usuario con la opción CONTINUAR."* |
| **Límite Boleta Simple** | S/ 700.00 | `RV-105-C` | *"Para montos totales iguales o superiores a S/ 700.00, la opción Boleta Simple queda inhabilitada; se exige comprobante con documento (DNI o RUC)."* |
| **Límite Boleta Simple** | S/ 700.00 | `RN-95-B` | *"Exigencia de identidad desde S/ 700.00: ningún cobro cuyo monto final sea igual o superior a S/ 700.00 podrá emitirse como consumidor final anónimo. El sistema requiere DNI o RUC válido y registrado."* |
| **Monto inicial de caja** | Hasta 99,999.99, 2 decimales | `RV-120` | *"El monto inicial es obligatorio, numérico, desde 0, hasta 99,999.99 y con hasta 2 decimales (punto o coma); se sugiere el efectivo contado del último cierre."* |
| **Motivo de anulación** | 5 a 100 caracteres | `RV-76` | *"El motivo de anulación es obligatorio, de 5 a 100 caracteres, con motivos rápidos que lo rellenan; se recortan los espacios de los extremos."* |
| **Motivo de anulación** | 5 a 100 caracteres | `RV-113` | *"El motivo de anulación es obligatorio, de 5 a 100 caracteres, con motivos rápidos que lo rellenan; se recortan los espacios de los extremos."* |
| **Nombre de producto** | 3 a 50 caracteres | `RV-33` | *"El nombre es obligatorio: 3 a 50 caracteres (letras, números, espacios, tildes y . , - ( ))."* |
| **Nombre de usuario** | 3 a 60 caracteres | `RV-11` | *"El nombre completo es obligatorio: 3 a 60 caracteres, solo letras, tildes y espacios."* |
| **Número o nombre de mesa** | 1 a 20 caracteres | `RV-168` | *"El número o nombre de la mesa es obligatorio y tiene entre 1 y 20 caracteres (letras, números, espacios, tildes, guion y punto)."* |
| **Observación de caja** | Hasta 200 caracteres | `RV-126` | *"La observación es opcional, de hasta 200 caracteres; se recomienda si hay diferencia."* |
| **Observación de pedido** | Hasta 100 caracteres | `RV-64` | *"La observación es opcional, de hasta 100 caracteres, y se recortan los espacios de los extremos."* |
| **Observación de pedido** | Hasta 100 caracteres | `RV-78` | *"Al modificar rigen las reglas del pedido (RV-61 a RV-66, RV-70 y RV-71 del CUS06): al menos un producto, cantidad de 1 a 20, productos no agotados y observación de hasta 100 caracteres. Quitar todos los productos obliga a anular."* |
| **Precio de menú completo** | Hasta 999.99, 2 decimales | `RV-160` | *"El precio de un menú completo es obligatorio, mayor que 0, hasta 999.99 y con hasta 2 decimales; solo se editan su precio y su estado."* |
| **Precio de producto** | Hasta 999.99, 2 decimales | `RV-36` | *"El precio de un producto de carta es obligatorio, mayor que 0, hasta 999.99 y con hasta 2 decimales."* |
| **Rango de reportes** | Hasta 366 días | `RV-134` | *"El rango admite una fecha o desde–hasta: "desde" no puede ser posterior a "hasta", no hay fechas futuras y el máximo es de 366 días; los atajos Hoy, Ayer, Últimos 7 días, Este mes y Mes anterior llenan las fechas."* |
| **Rango de ventas** | Máximo 31 días, Cajero 7 días | `RV-109` | *"El filtro de fecha admite una fecha o un rango: "desde" no puede ser posterior a "hasta", ninguna fecha puede ser futura y el rango máximo es de 31 días; el Cajero solo puede consultar hasta 7 días atrás."* |
| **Rango de ventas** | Últimos 7 días | `RN-97` | *"El Cajero consulta las ventas de hoy y de los últimos 7 días; el Administrador, cualquier fecha."* |
| **Referencia de cliente** | Hasta 30 caracteres | `RV-73` | *"La referencia del cliente es opcional, de hasta 30 caracteres (letras, números, espacios, tildes, guion y punto), y se recortan los espacios de los extremos."* |
| **Referencia Yape** | Hasta 20 caracteres | `RV-100` | *"En Yape, se debe marcar la confirmación de recepción del pago; la referencia es opcional, de hasta 20 caracteres."* |
| **Refresco de menú del día** | Cada 30 segundos | `RNF-24` | *"La lista de productos se obtiene del menú del día y se refresca cada 30 segundos (RNF-14) sin perder el pedido en armado."* |
| **Refresco de menú del día** | Cada 30 segundos | `RNF-59` | *"El armado toma las opciones del servicio del menú del día y se refresca cada 30 segundos sin perder lo elegido (RNF-24)."* |
| **Resaltado comanda nueva** | 10 segundos | `RV-92` | *"Una comanda nueva se resalta como "NUEVA" durante 10 segundos y, si el sonido está activado, suena un aviso corto."* |
| **RUC del cliente** | 11 dígitos (inicia 10 o 20) | `RV-105-B` | *"Si se selecciona Factura, el RUC debe contener exactamente 11 dígitos numéricos y comenzar con 10 o 20."* |
| **Tiempo comanda en cocina**| 5 segundos o menos | `RNF-32` | *"Una comanda nueva aparece en la pantalla de cocina en 5 segundos o menos; cambiar el estado responde en menos de 1 segundo."* |
| **Tiempo de respuesta** | Menos de 2 segundos | `RNF-10` | *"La contraseña nueva se guarda con hash (RNF-01) y el cambio responde en menos de 2 segundos."* |
| **Tiempo de respuesta** | Menos de 2 segundos | `RNF-21` | *"El registro responde en menos de 2 segundos; la interfaz es táctil y usable con una mano en móvil, con controles de al menos 44 px y el total siempre visible."* |
| **Tiempo de respuesta** | Menos de 2 segundos | `RNF-25` | *"El registro responde en menos de 2 segundos; la interfaz es usable en computadora, tablet y móvil, con controles de al menos 44 px y el total siempre visible."* |
| **Tiempo de respuesta** | Menos de 2 segundos | `RNF-36` | *"Confirmar el pago responde en menos de 2 segundos; el vuelto se calcula en pantalla al instante."* |
| **Tiempo de respuesta** | Menos de 2 segundos | `RNF-45` | *"El resumen de cierre se calcula en menos de 2 segundos; la diferencia se calcula al instante en pantalla; los montos usan tipo decimal con redondeo a 2 decimales (RNF-37)."* |
| **Tiempo de respuesta** | 3 segundos o menos | `RNF-60` | *"El reporte por componente usa la tabla de opciones por línea y responde en 3 segundos o menos (RNF-50)."* |
| **Tiempo de respuesta** | Menos de 2 segundos | `RNF-62` | *"El panel carga en menos de 2 segundos; cada bloque usa consultas agregadas ya existentes y el servidor no envía datos que el rol no puede ver."* |
| **Usuario (formato)** | 3 a 30 caracteres | `RV-03` | *"El usuario debe cumplir el formato definido (3–30 caracteres, sin espacios internos). En la recuperación, el correo debe tener formato válido."* |
| **Usuario (formato)** | 3 a 30 caracteres | `RV-12` | *"El usuario es obligatorio, con el formato del CUS01 (3 a 30 caracteres, sin espacios) y único sin distinguir mayúsculas."* |
"""

FILE_PATH.write_text(content, encoding="utf-8")
print(f"Reescrito exitosamente {FILE_PATH} ({FILE_PATH.stat().st_size:,} bytes)")
