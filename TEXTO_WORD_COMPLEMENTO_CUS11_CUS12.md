# Anexo de Modificaciones para los Documentos Word de CUS11 y CUS12
**Proyecto:** Restaurante Girasoles  
**Destino:** Documentos `Complemento_CUS11_Cobro_de_Pedidos_Girasoles.docx` y `Complemento_CUS12_Gestion_de_Ventas_Girasoles.docx`  
**Objetivo:** Texto listo para copiar y pegar directamente en las secciones correspondientes de los Word del curso (Metodología XP, Tablas de Decisiones, RV, RN, MSG y Pasos).

---

# PARTE 1: Modificaciones para el Word de CUS11 (Cobro de pedidos)

### 1.1 Para la Sección «1. Decisiones adoptadas (propuesta para cerrar vacíos)»
*Copiar y reemplazar o insertar las siguientes filas en la tabla de decisiones:*

| Tema | Decisión | Origen del vacío |
| :--- | :--- | :--- |
| **Tipos de comprobante** | Se ofrecen cuatro opciones al cobrar: **Ticket interno** (sin validez fiscal), **Boleta de venta simple** (sin datos del cliente, hasta S/ 699.99), **Boleta de venta con DNI** (persona natural) y **Factura** (persona jurídica o con RUC). | RF-30 |
| **Series y correlativos** | Cada tipo de comprobante maneja serie y correlativo independiente de 6 dígitos sin vacíos: `T001` para tickets, `B001` para boletas y `F001` para facturas. | RF-30 |
| **Consulta automática de DNI/RUC** | El cajero ingresa el DNI (8 dígitos) o RUC (11 dígitos) y el sistema consulta una API externa para autocompletar en tiempo real los nombres o la razón social y dirección fiscal, evitando errores manuales. | CUS11.1 / Heurística 5 |
| **Límite legal para Boleta Simple** | Por disposición de SUNAT, compras iguales o superiores a S/ 700.00 bloquean la emisión de "Boleta Simple" y obligan a ingresar DNI o RUC. | Normativa SUNAT / RV |
| **Cálculo de impuestos** | Todos los precios de los platos incluyen IGV. En Boletas y Facturas el sistema desglosa automáticamente la Operación Gravada ($\text{Total} / 1.18$) y el IGV ($18\%$). En tickets internos no se muestra desglose tributario. | RF-30 |

---

### 1.2 Para la Sección «3. Reglas de validación (RV)»
*Agregar las siguientes reglas a la tabla de Reglas de Validación de CUS11:*

| Código | Regla | Elemento UI | Mensaje |
| :--- | :--- | :--- | :--- |
| **RV-105-A** | Si se selecciona **Boleta con DNI**, el DNI debe contener exactamente 8 dígitos numéricos. | Campo DNI | `MSG-166` |
| **RV-105-B** | Si se selecciona **Factura**, el RUC debe contener exactamente 11 dígitos numéricos y comenzar con 10 o 20. | Campo RUC | `MSG-167` |
| **RV-105-C** | Para montos totales iguales o superiores a S/ 700.00, la opción **Boleta Simple** queda inhabilitada; se exige comprobante con documento (DNI o RUC). | Selector de comprobante | `MSG-169` |
| **RV-105-D** | Si la consulta externa del documento no arroja resultados en el padrón, se notifica y se permite el ingreso manual de la Razón Social / Nombre. | Botón Consultar / Input | `MSG-168` |

---

### 1.3 Para la Sección «4. Reglas de negocio (RN)»
*Reemplazar o complementar la RN-91 y RN-92 con lo siguiente:*

- **RN-91 (Series y Correlatividad Tributaria):**  
  El sistema asigna un correlativo ascendente, único y sin vacíos según la serie del comprobante elegido (`T001` para Tickets, `B001` para Boletas, `F001` para Facturas). La numeración de una serie no se reinicia entre días y es independiente entre tipos de comprobante.
- **RN-92 (Desglose Tributario Oficial):**  
  Para Boletas y Facturas, la Operación Gravada e IGV se calculan como:
  $$\text{Operación Gravada} = \text{round}\left(\frac{\text{Total}}{1.18}, 2\right)$$
  $$\text{IGV} = \text{Total} - \text{Operación Gravada}$$
  En el Ticket interno la leyenda obligatoria es: *"Documento sin validez tributaria"*.
- **RN-95-B (Exigencia de Identidad $\ge$ S/ 700.00):**  
  Ningún cobro cuyo monto final sea igual o superior a S/ 700.00 podrá ser emitido como consumidor final anónimo. El sistema requiere DNI o RUC válido y registrado.

---

### 1.4 Para la Sección «6. Catálogo de mensajes (MSG)»
*Agregar los siguientes códigos a la tabla de mensajes:*

| Código | Texto del mensaje | Tipo |
| :--- | :--- | :--- |
| **MSG-166** | El DNI debe tener exactamente 8 dígitos numéricos. | Error de validación |
| **MSG-167** | El RUC debe tener 11 dígitos numéricos y comenzar con 10 o 20. | Error de validación |
| **MSG-168** | Documento no encontrado en el padrón oficial. Puede ingresar la razón social manualmente. | Advertencia |
| **MSG-169** | Por normativa tributaria (SUNAT), ventas iguales o superiores a S/ 700.00 requieren DNI o RUC. | Advertencia / Restricción |
| **MSG-170** | Servicio de consulta de identidad no disponible en este momento. Verifique la conexión o ingrese los datos manualmente. | Alerta de sistema |

---

### 1.5 Para la Sección «7. Pasos del Caso de Uso (CUS11)»
*Actualizar los pasos CUS11.1 y CUS11.3:*

#### **CUS11.1 Selección del pedido y tipo de comprobante**
1. El cajero ingresa a la interfaz de cobro desde la lista de pendientes, desde una mesa o desde pedidos para llevar.
2. El sistema muestra el detalle de los platos, cantidades, precios unitarios y el total a pagar.
3. El cajero selecciona el **Tipo de Comprobante**:
   - **Ticket:** No solicita datos del cliente.
   - **Boleta Simple:** No solicita datos (bloqueado si el total es $\ge$ S/ 700.00).
   - **Boleta con DNI:** Habilita el campo DNI. Al ingresar 8 dígitos, el cajero presiona «Consultar» (o el sistema dispara la consulta) y autocompleta el nombre del cliente.
   - **Factura:** Habilita el campo RUC. Al ingresar 11 dígitos, el sistema consulta el padrón y autocompleta la Razón Social y Dirección Fiscal.
4. El cajero presiona «Continuar al pago» (Paso 2).

#### **CUS11.3 Emisión del comprobante y cierre**
1. Una vez confirmado el pago (Efectivo o Yape), el sistema genera atómicamente la venta y el comprobante con la serie correspondiente (`T001-XXXXXX`, `B001-XXXXXX`, `F001-XXXXXX`).
2. Se muestra la vista previa con los datos del restaurante, serie, datos del cliente (DNI/RUC/Razón Social), ítems, desglose de Op. Gravada, IGV, Total y vuelto si fue en efectivo.
3. El cajero puede presionar **«IMPRIMIR»** (formato ticket 80 mm) o **«DESCARGAR»** (PDF).

---
---

# PARTE 2: Modificaciones para el Word de CUS12 (Gestión de ventas)

### 2.1 Para la Sección «1. Decisiones adoptadas (propuesta para cerrar vacíos)»
*Copiar y agregar en la tabla de decisiones de CUS12:*

| Tema | Decisión | Origen del vacío |
| :--- | :--- | :--- |
| **Filtro por Tipo de Comprobante** | Se incorpora un filtro desplegable para listar ventas según comprobante: *Todos*, *Tickets (`T001`)*, *Boletas (`B001`)* y *Facturas (`F001`)*. | RF-32 / Usabilidad |
| **Búsqueda por Documento del Cliente** | Se permite buscar ventas tanto por número correlativo como por el DNI o RUC del cliente receptor. | RF-32 |
| **Reimpresión tributaria** | La reimpresión muestra el comprobante fiscal idéntico al original, con la leyenda destacada *"COPIA"* para evitar doble crédito fiscal o confusión. | RF-34 |

---

### 2.2 Para la Sección «3. Reglas de validación (RV)»
*Agregar las siguientes reglas a la tabla de CUS12:*

| Código | Regla | Elemento UI | Mensaje |
| :--- | :--- | :--- | :--- |
| **RV-108-B** | El filtro de búsqueda por comprobante acepta formato completo (`B001-000045`, `F001-000012`, `T001-000123`), solo el correlativo (`45`, `12`), o el DNI/RUC del cliente (8 u 11 dígitos). | Campo de búsqueda | `MSG-156` |
| **RV-118-B** | En el detalle de la venta, si el comprobante emitido fue Factura o Boleta con DNI, se deben exhibir de forma obligatoria los datos del receptor (DNI/RUC, Razón Social, Dirección) y el desglose de IGV. | Modal Detalle de Venta | — |

---

### 2.3 Para la Sección «4. Reglas de negocio (RN)»
*Agregar la siguiente precisión:*

- **RN-97-B (Integridad de Comprobantes Fiscales en Reimpresión y Anulación):**  
  Las ventas anuladas conservan el comprobante emitido en estado «Anulado». Al reimprimir un comprobante fiscal anulado, el documento se genera con una marca de agua visible de *"ANULADO - SIN EFECTO TRIBUTARIO"*.

---

### 2.4 Para la Sección «7. Pasos del Caso de Uso (CUS12)»

#### **CUS12.1 Consulta y búsqueda de ventas**
1. El Administrador o Cajero accede a la pantalla de Ventas.
2. El sistema presenta la lista de ventas del día con columnas: *Hora*, *Comprobante (con badge distintivo: Ticket, Boleta, Factura)*, *Cliente / Documento*, *Pedido*, *Mesa / Llevar*, *Medio de pago*, *Total* y *Estado*.
3. El usuario puede filtrar por rango de fechas, por tipo de comprobante (*Boleta*, *Factura*, *Ticket*) o ingresar el DNI/RUC del cliente en la barra de búsqueda.

#### **CUS12.3 Reimpresión de comprobante**
1. El usuario selecciona la acción **«Reimprimir»** en una venta vigente.
2. El sistema abre la vista previa del comprobante original con la marca *"COPIA"*, preservando exactamente la serie (`B001`, `F001`, `T001`), número, desglose de IGV y datos del cliente.
3. Se registra en la auditoría el usuario, fecha y hora de la reimpresión.
