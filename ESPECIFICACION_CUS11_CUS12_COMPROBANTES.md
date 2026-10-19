# Especificación Técnica: Boleta Simple, Boleta con DNI y Factura con RUC (CUS 11 y CUS 12)
**Proyecto:** Restaurante Girasoles (`GirasolesRes`)  
**Arquitectura:** Clean Architecture en 4 capas (.NET 8 + EF Core / Npgsql) + Frontend (React 19 + TypeScript + Vite + Tailwind CSS)  
**Objetivo:** Extender la emisión de comprobantes en el proceso de Cobro (CUS 11) y la gestión/auditoría de ventas (CUS 12), incorporando validación y autocompletado de documentos mediante API externa (SUNAT / RENIEC).

---

## 1. Alcance y Principios de Diseño

1. **Responsabilidad Única (SRP):**
   - La selección y emisión del comprobante tributario se realiza **exclusivamente en el CUS 11 (Cobro de Pedidos)**.
   - Tanto la toma de pedidos en salón (**CUS 07**) como la toma de pedidos para llevar (**CUS 08**) permanecen desacopladas de la facturación y simplemente derivan el pedido pendiente al módulo de Cobro (`onNavigateToCobro`).
2. **Tipos de Comprobante Soportados:**
   - **Ticket Interno (`T001`):** Documento sin validez fiscal para control interno o clientes que no soliciten comprobante tributario.
   - **Boleta de Venta Simple (`B001`):** Emisión a consumidor final genérico ("Clientes Varios" / Sin documento, permitido por SUNAT para montos menores a S/ 700.00).
   - **Boleta de Venta con DNI (`B001`):** Emisión a persona natural con DNI (8 dígitos) verificado, autocompletando nombres y apellidos.
   - **Factura Electrónica (`F001`):** Emisión a persona jurídica o natural con negocio con RUC (11 dígitos), autocompletando Razón Social y Dirección Fiscal.
3. **Seguridad y Resiliencia en Consultas de Identidad:**
   - **Prohibido consultar la API externa directamente desde el navegador:** La API Key y URL del proveedor externo jamás deben exponerse en el cliente.
   - El backend expondrá un controlador proxy seguro (`ConsultasController`) que validará formato, consumirá el proveedor externo con timeout defensivo y retornará DTOs normalizados.

---

## 2. Modificaciones en Base de Datos (PostgreSQL)

### 2.1 Script de Migración (`database/migrate_cus11_comprobantes_fiscales.sql`)
La tabla `comprobantes` debe actualizarse para almacenar los atributos tributarios y asegurar correlatividad independiente por serie:

```sql
BEGIN;

-- 1. Nuevas columnas en tabla comprobantes
ALTER TABLE comprobantes
    ADD COLUMN IF NOT EXISTS com_tipo_comprobante VARCHAR(20) NOT NULL DEFAULT 'Ticket', -- 'Ticket', 'Boleta', 'Factura'
    ADD COLUMN IF NOT EXISTS com_tipo_doc_receptor VARCHAR(10) NULL,                    -- 'DNI', 'RUC'
    ADD COLUMN IF NOT EXISTS com_num_doc_receptor VARCHAR(15) NULL,
    ADD COLUMN IF NOT EXISTS com_razon_social_receptor VARCHAR(200) NULL,
    ADD COLUMN IF NOT EXISTS com_direccion_receptor VARCHAR(300) NULL,
    ADD COLUMN IF NOT EXISTS com_op_gravada NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS com_igv NUMERIC(10, 2) NOT NULL DEFAULT 0.00;

-- 2. Actualizar series y leyendas existentes
UPDATE comprobantes SET com_tipo_comprobante = 'Ticket', com_serie = 'T001' WHERE com_tipo_comprobante IS NULL;

-- 3. Índices para optimizar correlatividad y búsquedas
CREATE INDEX IF NOT EXISTS ix_comprobantes_tipo_serie_numero 
    ON comprobantes (com_tipo_comprobante, com_serie, com_numero);

CREATE INDEX IF NOT EXISTS ix_comprobantes_doc_receptor 
    ON comprobantes (com_num_doc_receptor);

COMMIT;
```

---

## 3. Especificación Backend (.NET 8 / Clean Architecture)

### 3.1 Capa de Dominio (`GirasolesRes.Domain`)

#### Entidad `Comprobante.cs`
- **Enum `TipoComprobante`:** `Ticket = 1`, `Boleta = 2`, `Factura = 3`.
- **Propiedades requeridas:**
  - `Com_TipoComprobante` (TipoComprobante)
  - `Com_Serie` (string: "T001", "B001", "F001")
  - `Com_Numero` (int: Correlativo continuo e ininterrumpido por serie)
  - `Com_TipoDocReceptor` (string?: "DNI", "RUC")
  - `Com_NumDocReceptor` (string?)
  - `Com_RazonSocialReceptor` (string?)
  - `Com_DireccionReceptor` (string?)
  - `Com_OpGravada` (decimal: Subtotal antes de impuestos)
  - `Com_Igv` (decimal: 18% del subtotal)
  - `Com_Total` (decimal: OpGravada + IGV)
  - `Com_Leyenda` (string)
- **Invariantes y Reglas de Negocio:**
  - Cálculo de impuestos: En Perú el total de la venta ya contiene IGV:
    $$\text{OpGravada} = \text{round}\left(\frac{\text{Total}}{1.18}, 2\right)$$
    $$\text{IGV} = \text{Total} - \text{OpGravada}$$
  - **Factura:** Exige `Com_TipoDocReceptor == "RUC"`, `Com_NumDocReceptor` de 11 dígitos numéricos válidos (prefijo 10 o 20) y `Com_RazonSocialReceptor` no vacío.
  - **Boleta con DNI:** Exige `Com_TipoDocReceptor == "DNI"`, 8 dígitos numéricos y nombre del receptor.
  - **Boleta Simple:** Si el `Total >= 700.00`, SUNAT exige obligatoriamente DNI y nombre del cliente (lanzar excepción si se intenta emitir simple para $\ge$ S/ 700).

---

### 3.2 Capa de Infraestructura (`GirasolesRes.Infrastructure`)

#### 1. Servicio de Integración para Consulta DNI / RUC
- Interfaz en Application: `IConsultaDocumentoService`
- Implementación en Infrastructure: `ConsultaDocumentoService` utilizando `HttpClientFactory`.
- Configuración en `appsettings.json`:
  ```json
  "ApiConsultaDocumento": {
    "BaseUrl": "https://api.tuproveedor.com/v1",
    "Token": "TU_API_TOKEN_AQUI",
    "TimeoutSeconds": 5
  }
  ```
- DTOs retornados:
  ```csharp
  public record ResultadoConsultaDniDto(string Dni, string Nombres, string ApellidoPaterno, string ApellidoMaterno, string NombreCompleto);
  public record ResultadoConsultaRucDto(string Ruc, string RazonSocial, string Estado, string Condicion, string Direccion);
  ```

#### 2. Correlatividad en `CobroRepository.cs`
- Obtención del último número correlativo mediante consulta pesimista bloqueante o transacción serializada para garantizar que no existan huecos ni duplicados:
  ```csharp
  // SELECT COALESCE(MAX(com_numero), 0) + 1 FROM comprobantes WHERE com_serie = @serie
  ```

---

### 3.3 Capa de Aplicación (`GirasolesRes.Application`)

#### `CobroRequest.cs` (Actualización de DTO)
```csharp
public class CobroRequest
{
    [Required]
    public string SolicitudId { get; set; } = string.Empty;

    [Required]
    public Guid PedidoId { get; set; }

    [Required]
    public decimal TotalMostrado { get; set; }

    [Required]
    public string Metodo { get; set; } = string.Empty; // "Efectivo", "Yape"

    public decimal? MontoRecibido { get; set; }
    public bool? YapeConfirmado { get; set; }
    public string? YapeReferencia { get; set; }

    // Nuevos campos tributarios
    [Required]
    public string TipoComprobante { get; set; } = "Ticket"; // "Ticket", "Boleta", "Factura"

    public string? TipoDocReceptor { get; set; } // "DNI", "RUC"
    public string? NumDocReceptor { get; set; }
    public string? RazonSocialReceptor { get; set; }
    public string? DireccionReceptor { get; set; }
}
```

---

### 3.4 Capa API (`GirasolesRes.API`)

#### Nuevo Controlador: `ConsultasController.cs`
- Protegido con `[Authorize]`.
- Endpoints:
  - `GET /api/consultas/dni/{dni}`: Valida que `dni` tenga 8 dígitos; llama a `IConsultaDocumentoService.ConsultarDniAsync(dni)`.
  - `GET /api/consultas/ruc/{ruc}`: Valida que `ruc` tenga 11 dígitos; llama a `IConsultaDocumentoService.ConsultarRucAsync(ruc)`.
  - Respuestas HTTP: `200 OK` con datos; `400 Bad Request` formato inválido; `404 Not Found` no encontrado en padrón; `503 Service Unavailable` si la API externa cae.

---

## 4. Especificación Frontend (React + TypeScript)

### 4.1 CUS 11: Cobro de Pedidos ([CobroModal.tsx](file:///c:/Users/cjazz/Documents/2026-II/Construccion%20de%20Software/GirasolesRes/frontend/src/components/CobroModal.tsx))

El modal de cobro opera en 3 pasos:

1. **Paso 1: Detalle y Selección de Comprobante:**
   - Tarjetas de selección con teclado accesible (`Tab` y `Enter`):
     - **Ticket** (Rápido, sin documento).
     - **Boleta Simple** (Sin datos, hasta S/ 699.99).
     - **Boleta con DNI** (Campo de DNI).
     - **Factura** (Campo de RUC).
   - **Formulario Dinámico según selección:**
     - Si es **Boleta con DNI**:
       - Input numérico con límite de 8 caracteres.
       - Botón "Consultar DNI" (o autodisparo al llegar a 8 caracteres) con spinner de carga.
       - Input deshabilitado/readonly "Cliente" autocompletado con el Nombre Completo.
     - Si es **Factura**:
       - Input numérico con límite de 11 caracteres.
       - Botón "Consultar RUC" con spinner de carga.
       - Input "Razón Social" y "Dirección Fiscal" autocompletados.
     - Si el total es $\ge$ S/ 700.00:
       - Deshabilitar la opción "Boleta Simple" y advertir: *"Por disposición de SUNAT, compras iguales o mayores a S/ 700 requieren DNI o RUC"*.

2. **Paso 2: Método de Pago:**
   - Selección existente entre **Efectivo** (con cálculo de vuelto reactivo) y **Yape** (código de referencia y confirmación visual).
   - Resumen del comprobante seleccionado visible en la parte superior.

3. **Paso 3: Emisión y Vista Previa:**
   - Representación visual del comprobante térmico:
     - Cabecera: `RESTAURANTE GIRASOLES` - `RUC: 20XXXXXXXXX`.
     - Serie y Número destacado: `B001-000045` o `F001-000012`.
     - Datos del receptor (DNI / RUC, Razón Social / Nombre, Dirección).
     - Tabla de ítems pedidos.
     - Desglose contable:
       - `Op. Gravada: S/ XX.XX`
       - `I.G.V. (18%): S/ XX.XX`
       - `TOTAL: S/ XX.XX`
     - Botones: "Imprimir Comprobante", "Descargar PDF" y "Finalizar Cobro".

---

### 4.2 CUS 12: Gestión de Ventas ([VentasPage.tsx](file:///c:/Users/cjazz/Documents/2026-II/Construccion%20de%20Software/GirasolesRes/frontend/src/pages/VentasPage.tsx))

1. **Tabla de Ventas:**
   - Columna "Comprobante": Badge con color distintivo según el tipo (`Ticket` gris, `Boleta` azul, `Factura` verde) mostrando `T001-XXXXXX`, `B001-XXXXXX` o `F001-XXXXXX`.
   - Columna "Cliente / Documento": DNI o RUC del cliente si aplica.
2. **Filtros de Búsqueda:**
   - Filtro desplegable por Tipo de Comprobante: `Todos`, `Tickets`, `Boletas`, `Facturas`.
   - Búsqueda por número de comprobante o documento del cliente.
3. **Modal de Detalle de Venta y Reimpresión:**
   - Mostrar el comprobante original idéntico a la emisión, con opción de generar copia reimpresa indicando usuario y marca temporal.

---

## 5. Criterios de Aceptación y Checklist de Calidad

- [ ] **CA-01:** Si el usuario selecciona Factura sin haber completado un RUC válido de 11 dígitos y su razón social, el botón de cobro permanece deshabilitado.
- [ ] **CA-02:** Si el monto total es $\ge$ S/ 700.00, el sistema no permite emitir Boleta Simple sin documento.
- [ ] **CA-03:** Las series de comprobante son independientes (`T001-000001`, `B001-000001`, `F001-000001`) y no generan saltos correlativos en caso de fallo o cancelación.
- [ ] **CA-04:** La llamada a la API externa ocurre exclusivamente en el backend; el token no aparece en las fuentes ni en las peticiones de red del cliente.
- [ ] **CA-05:** La interfaz en frontend cumple estrictamente con accesibilidad de teclado (`Tab`, `Enter`, `Escape`), trampa de foco en modales y cero códigos técnicos en textos visibles.
- [ ] **CA-06:** La suite de pruebas unitarias (`dotnet test` y `npm run build`) compila con 0 errores y 0 advertencias.
