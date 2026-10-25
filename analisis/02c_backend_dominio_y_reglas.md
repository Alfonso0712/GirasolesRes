# Dominio, Reglas de Negocio y Lógica de Aplicación (GirasolesRes)

Este documento detalla la lógica de negocio, restricciones de integridad, máquinas de estado y servicios implementados en el backend, con evidencia precisa de `backend/GirasolesRes.Domain/` y `backend/GirasolesRes.Application/`.

---

## 1. Entidades del Dominio y Relaciones (`GirasolesRes.Domain/Entities/`)

1. **`Usuario` (`Entities/Usuario.cs:1`):**
   - Atributos: `Usu_Id`, `Usu_Nombre`, `Usu_Usuario`, `Usu_Correo`, `Usu_PasswordHash`, `Usu_Rol`, `Usu_Activo`, `Usu_IntentosFallidos`, `Usu_BloqueadoHastaUtc`.
   - Lógica encapsulada:
     - `EstaBloqueado()`: Retorna verdadero si `Usu_BloqueadoHastaUtc > DateTime.UtcNow`.
     - `RegistrarIntentoFallido(max=5, min=15)`: Incrementa intentos y bloquea a partir del 5to fallo por 15 minutos exactos (`Usuario.cs:49`).
     - `ReiniciarIntentosFallidos()`: Resetea intentos y remueve fecha de bloqueo (`Usuario.cs:59`).
2. **`Mesa` (`Entities/Mesa.cs:1`):**
   - Atributos: `Mes_Id`, `Mes_Numero`, `Mes_Capacidad`, `Mes_EstadoOcupacion` (Libre/Ocupada), `Mes_Activa`.
   - Restricción: No se puede desactivar si `Mes_EstadoOcupacion == Ocupada` (`MesaService.cs:220`).
3. **`Producto` (`Entities/Producto.cs:1`):**
   - Atributos: `Pro_Id`, `Pro_Nombre`, `Pro_Categoria`, `Pro_Precio`, `Pro_Activo`, `Pro_Tipo` (`DeCarta` o `ComponenteMenu`), `Pro_RolComponente`.
   - Regla de Dominio: Los componentes de menú tienen precio `null` o `0.00` y su categoría es fija según su rol.
4. **`MenuCompleto` y `MenuCompletoParte` (`Entities/MenuCompleto.cs:1`):**
   - Estructura fija de 3 menús completos: Desayuno Completo (S/ 7.00), Almuerzo Completo (S/ 8.00) y Solo Segundo (S/ 7.00).
   - `MenuCompletoParte`: Define la regla de selección (ej. Sopa O Entrada + Segundo).
5. **`Pedido` y `DetallePedido` (`Entities/Pedido.cs:1`):**
   - Tipos: `Mesa` o `ParaLlevar`.
   - Estados: `Pendiente`, `EnPreparacion`, `Listo`, `Entregado`, `Pagado`, `Anulado`.
   - `LineaPedidoOpcion`: Guarda el snapshot histórico de los componentes seleccionados en cada menú completo, garantizando trazabilidad ante cambios de la carta.
6. **`Comanda` y `DetalleComanda` (`Entities/Comanda.cs:1`):**
   - Estados: `Pendiente` (amarillo), `EnPreparacion` (azul), `Listo` (verde), `Entregado`.
   - Acción `DeshacerEstado`: Válida si `DateTime.UtcNow - comanda.Com_FechaModificacion <= TimeSpan.FromSeconds(60)`.
7. **`Caja` (`Entities/Caja.cs:1`):**
   - Estados: `Abierta`, `Cerrada`.
   - Campos: `Caj_MontoInicial`, `Caj_TotalVentasEfectivo`, `Caj_TotalVentasYape`, `Caj_MontoEfectivoReal`, `Caj_DiferenciaDescuadre`.
8. **`Venta` y `Comprobante` (`Entities/Venta.cs:1`, `Entities/Comprobante.cs:1`):**
   - Tipos de Comprobante: `Ticket` (T001), `BoletaSimple` (B001), `BoletaConDni` (B001), `Factura` (F001).
   - Restricción SUNAT: Si `Total >= 700.00`, `CobroService.cs` exige documento de identidad válido (DNI de 8 dígitos o RUC de 11 dígitos que empiece con 10 o 20) e invalida la emisión de Boleta Simple.

---

## 2. Reglas de Negocio Implementadas en Servicios de Aplicación

### 2.1 Cobro, Liberación de Mesa y Transaccionalidad Atómica (`CobroService.cs:70`)
- La operación de cobro se ejecuta dentro de una transacción de base de datos (`BeginTransactionAsync`):
  1. Valida que la caja del usuario o del día esté en estado `Abierta`.
  2. Calcula el total del pedido, verifica `montoRecibido >= total` en pagos en efectivo y calcula el vuelto.
  3. Inserta el registro de `Venta` y genera el `Comprobante` con correlativo secuencial único.
  4. Cambia el estado del pedido a `Pagado`.
  5. **Liberación de Mesa:** Si el pedido era de salón (`TipoPedido.Mesa`), consulta si existen otros pedidos activos en la misma mesa; si no existen, transiciona la mesa a estado `Libre` de manera inmediata (`CobroService.cs:185`).
  6. Confirma la transacción con `CommitAsync()`.

### 2.2 Desglose de Impuestos (IGV 18%) (`CobroService.cs:215`)
- En Boletas y Facturas fiscales:
  - `Subtotal = Math.Round(Total / 1.18m, 2);`
  - `Igv = Math.Round(Total - Subtotal, 2);`
- En Tickets internos: no se realiza desglose tributario, indicando «Sin valor tributario».

### 2.3 Anulación de Venta y Manejo de Cierres de Caja (`VentaService.cs:120`)
- Si una venta es anulada por el Administrador:
  - Exige motivo obligatorio de al menos 5 caracteres.
  - Si la venta pertenece a una caja ya cerrada, no recalcula el corte histórico; genera un registro de ajuste posterior con la marca `ConAjustes = true` para que los reportes reflejen la conciliación real sin adulterar el arqueo físico original.

### 2.4 Control de Menú del Día y Platos Agotados (`MenuDiaService.cs:45`)
- El cocinero o administrador puede marcar cualquier plato u opción como `Agotado`.
- Al tomar un pedido en salón o para llevar, el backend valida en tiempo real si algún componente de la comanda está agotado; de ser así, rechaza el guardado con código `409 Conflict` evitando inconsistencias en cocina.
