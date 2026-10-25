# Resumen Ejecutivo de Trazabilidad y Calidad (GirasolesRes)

Este informe sintetiza la auditoría integral de trazabilidad entre la documentación formal (especificación de 35 HU, 35 RF y 35 CUS) y la base de código real del sistema gastronómico GirasolesRes.

---

## 1. Métricas de Cobertura y Trazabilidad

### 1.1 Cobertura de Subcasos de Uso (35 Subcasos)
- **Implementados Completamente y Alineados:** **30 subcasos (85.7%)**
- **Implementados con Divergencias Operativas:** **4 subcasos (11.4%)**
  - `CUS04.1` (Ruta y contingencia de menú no definido)
  - `CUS05.1` (Campo capacidad de mesa no documentado)
  - `CUS06.1` (Bloqueo de múltiples pedidos en mesa ocupada)
  - `CUS08.2` (Restricción de anulación administrativa)
- **Implementados Parcialmente (Detalle de UI):** **1 subcaso (2.9%)**
  - `CUS08.1` (Falta badge dual "Listo · Pagado")
- **No Implementados:** **0 subcasos (0.0%)**

### 1.2 Cobertura por Prioridad MoSCoW
- **Must (Alta):** 20 subcasos evaluados $ightarrow$ **18 completamente implementados (90.0%)**, **2 con discrepancias operativas (CUS06.1 y CUS08.2)**.
- **Should (Media):** 12 subcasos evaluados $ightarrow$ **11 implementados (91.7%)**, **1 con discrepancia (CUS04.1)**.
- **Could (Baja):** 3 subcasos evaluados $ightarrow$ **2 implementados (66.7%)**, **1 con discrepancia (CUS05.1)**.

### 1.3 Endpoints del Backend
- **Total endpoints implementados:** **70 endpoints** en 16 controladores.
- **Endpoints con respaldo documental formal:** **58 endpoints (82.9%)**.
- **Endpoints sobrantes útiles (sin respaldo en tabla):** **12 endpoints (17.1%)** (consultas DNI/RUC, tickets térmicos, resúmenes de KPIs).

---

## 2. Los 10 Hallazgos Principales de la Auditoría

1. **Bloqueo de pedidos adicionales en mesa ocupada (D-001 - Crítica):** `PedidoService.cs:66` arroja `409 Conflict` si una mesa ya está ocupada, impidiendo emitir cuentas separadas para comensales en la misma mesa (vulnera `RN-46`).
2. **Impedimento al Administrador para anular pedidos no pagados (D-002 - Alta):** `PedidoService.cs:775` exige que el usuario que anula sea el mismo que creó el pedido, bloqueando a la administradora para anular órdenes de mozos que se retiraron o clientes que no pagaron (vulnera `RN-65`).
3. **Falta de contingencia ante Menú del Día no definido (D-003 - Alta):** `PedidoService.cs:76` bloquea todas las ventas de salón con `409` si no se guardó el menú del día, impidiendo la venta de carta de contingencia estipulada en `RN-142`.
4. **Alerta de Menú sin Definir incondicional (D-004 - Media):** `InicioService.cs:317` genera alerta de menú sin verificar si la caja de la jornada está abierta (vulnera `RN-128`).
5. **Estado visual "Pagado" no dual (D-005 - Media):** `PedidosPage.tsx:525` oculta el estado de preparación cuando se paga el pedido, impidiendo al mozo saber si el plato ya fue servido (vulnera `RN-64`).
6. **12 Endpoints no formalizados en contratos (D-009 - Media):** Rutas clave como `/api/consultas/dni/{dni}` y `/api/ventas/{id}/ticket` no están en las tablas documentales.
7. **Excepción de inactividad de Cocina asimétrica (D-010 - Media):** La SPA exceptúa al cocinero en `HomePage.tsx:176`, pero el backend expira el token JWT a los 30 minutos sin keep-alive automático.
8. **Campo Capacidad de Mesa sobrante en BD y UI (D-006 - Baja):** Se registra capacidad en `Mesa.cs`, cuando la decisión CUS05 indicaba prescindir de ella.
9. **Desalineación en tope de precio de productos (D-011 - Baja):** El modal de frontend limita a S/ 500 mientras la regla documental permite hasta S/ 999.99.
10. **Refresco del día en menús completos sembrado en código pero ambiguo en texto (D-012 - Baja):** Resuelto en código pero con nota pendiente en el documento.

---

## 3. Plan de Corrección Sugerido (Ruta Crítica)

### Fase 1: Correcciones Urgentes en el Código (Bloqueantes Must)
1. **Permitir múltiples pedidos por mesa en `PedidoService.cs`:** Ajustar la validación de mesa ocupada para que permita asociar un nuevo `Pedido` con ID de mesa independiente, liberando la mesa únicamente cuando no queden pedidos activos.
2. **Autorizar anulación administrativa en `PedidoService.cs`:** Agregar excepción para el rol `Administrador` en `AnularPedidoAsync`.
3. **Habilitar venta de carta cuando no hay Menú del Día:** En `PedidoService.cs`, si `menuDia == null`, validar que los productos agregados pertenezcan a la carta activa (`RN-142`).
4. **Agregar Keep-Alive en `CocinaPage.tsx`:** Polling automático cada 20 minutos invocando `/api/auth/renovar` para cumplir de forma robusta la regla `RN-20`.

### Fase 2: Decisiones y Sincronización de Documentación
1. **Ratificar Capacidad de Mesa:** Conservar `Mes_Capacidad` en el código e incorporar la columna en el diccionario de datos de CUS05.
2. **Formalizar los 12 Endpoints:** Agregar las tablas de `/api/consultas`, `/api/caja/estado`, `/api/mesas/resumen` y variantes en el documento técnico IEEE y Anexo CUS10-14.
3. **Cerrar ambigüedad de refrescos:** Retirar la frase "(a confirmar con la dueña)" y asentar que los menús completos incluyen Refresco del día.
