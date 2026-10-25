from pathlib import Path

ANALISIS_DIR = Path(r"e:\Downloads\GirasolesRes\analisis")

fichas = """# Catálogo de Fichas de Discrepancia (Hallazgos D-001 a D-012)

Este catálogo documenta de manera exhaustiva y estructurada todas las divergencias detectadas entre la documentación de especificación técnica y el código real del proyecto GirasolesRes.

---

### Ficha D-001: Bloqueo de Múltiples Pedidos Abiertos en una Misma Mesa
- **Tipo:** DIFERENTE / INCUMPLIMIENTO DE REGLA DOCUMENTAL
- **Severidad:** **Crítica** (Afecta el flujo operativo de salón y la atención en horas pico).
- **Módulo:** Salón y Pedidos de Mesa (CUS06.1).
- **Referencias Documentales:**
  - `RN-46` (*Anexo_CUS05_y_CUS06*, CUS06): *"Una mesa puede tener varios pedidos abiertos a la vez (por ejemplo, un comensal que se suma después o un pedido aparte de bebidas); cada pedido se cobra por separado y la mesa vuelve a Libre cuando ninguno queda pendiente de cobro (RN-147)."*
  - `MSG-95`: *"La [mesa] ya tiene [n] pedido(s) abierto(s). ¿Registrar un pedido nuevo o agregar productos a uno existente?"*
- **Evidencia en el Código:**
  - `backend/GirasolesRes.Application/Services/PedidoService.cs:66-70`:
    ```csharp
    if (mesa.Mes_Ocupacion == EstadoOcupacionMesa.Ocupada ||
        await _pedidoRepository.ExistePedidoActivoEnMesaAsync(request.MesaId, ct))
    {
        throw new PedidoConflictException("mesa_ocupada", string.Format(MensajesCatalogo.MSG_95, mesa.Mes_Nombre));
    }
    ```
- **Descripción:** Cuando una mesa ya tiene un pedido activo, el backend lanza una excepción `409 Conflict` impidiendo registrar un nuevo pedido separado en la misma mesa. En la documentación, el diálogo `MSG-95` ofrece dos opciones: abrir un nuevo pedido o agregar a uno existente. El código solo permite agregar a través de `CUS06.2` (`/api/pedidos/{id}/lineas`).
- **Impacto:** En el restaurante no se pueden separar cuentas de comensales sentados en la misma mesa si desean comprobantes independientes.
- **Esfuerzo Estimado:** **M** (Modificar validación en `PedidoService.cs` y flujo de selección en `PedidoMesaPage.tsx`).
- **Recomendación:** **CORREGIR EL PROYECTO**. El documento refleja una necesidad operativa deliberada en la sección 2 de decisiones (*"Una mesa puede tener varios pedidos abiertos al mismo tiempo... cada pedido se cobra por separado"*).

---

### Ficha D-002: Restricción de Anulación de Pedidos por el Administrador
- **Tipo:** DIFERENTE / RESTRICCIÓN INDEBIDA EN CÓDIGO
- **Severidad:** **Alta** (Afecta la autoridad administrativa y la resolución de incidentes).
- **Módulo:** Gestión de Pedidos (CUS08.2).
- **Referencias Documentales:**
  - `RN-65` (*Anexo_CUS08*, CUS08.2): *"Un pedido solo se modifica mientras todas sus comandas estén pendientes y únicamente por quien lo registró (Mozo, Cajero o Administrador). Se anula por quien lo registró, en las mismas condiciones, o por el Administrador, que puede anular cualquier pedido no pagado, aun con comandas en preparación o listas (por ejemplo, un cliente que se fue sin pagar), siempre con motivo."*
- **Evidencia en el Código:**
  - `backend/GirasolesRes.Application/Services/PedidoService.cs:775-778`:
    ```csharp
    // RN-65: Mismo usuario que lo registró
    if (pedido.Id_Usuario != usuarioId)
    {
        throw new UnauthorizedAccessException(MensajesCatalogo.MSG_116);
    }
    ```
- **Descripción:** El método `AnularPedidoAsync` valida ciegamente que `pedido.Id_Usuario == usuarioId`. Aunque el controlador permite el rol `Administrador`, el servicio arroja `403 Forbidden` (`MSG_116: "Solo quien registró el pedido puede modificarlo o anularlo."`) si el administrador intenta anular un pedido tomado por un mozo o cajero.
- **Impacto:** Si un comensal se retira sin pagar o hay un error de comanda, la administradora queda bloqueada y no puede anular el pedido huérfano.
- **Esfuerzo Estimado:** **S** (Añadir excepción de rol en `PedidoService.cs:775`: `if (rol != "Administrador" && pedido.Id_Usuario != usuarioId)`).
- **Recomendación:** **CORREGIR EL PROYECTO**. La regla `RN-65` contempla explícitamente la prerrogativa del administrador para anular pedidos no pagados de cualquier usuario.

---

### Ficha D-003: Bloqueo de Pedidos sin Menú del Día Definido
- **Tipo:** DIFERENTE / INCUMPLIMIENTO DE REGLA DE CONTINGENCIA
- **Severidad:** **Alta** (Puede paralizar la venta de salón ante retrasos de configuración).
- **Módulo:** Toma de Pedidos y Menú del Día (CUS04.1 / CUS06.1).
- **Referencias Documentales:**
  - `RN-35` y `RN-142` (*Anexo_CUS02_a_CUS04*, CUS04): *"Solo los productos, componentes y menús completos activos pueden formar parte del menú del día... si no hay menú del día definido, se ofrece todo lo activo (RN-142)."*
- **Evidencia en el Código:**
  - `backend/GirasolesRes.Application/Services/PedidoService.cs:76-79`:
    ```csharp
    if (menuDia == null || (menuDia.Men_Platos.Count == 0 && !menuDia.Id_Desayuno.HasValue && menuDia.Men_MenusCompletos.Count == 0))
    {
        throw new PedidoConflictException("menu_no_definido", MensajesCatalogo.MSG_MENU_NO_DEFINIDO);
    }
    ```
- **Descripción:** Si la administradora no ha configurado el menú del día, el backend rechaza cualquier registro de pedido con error `409 Conflict` (`MSG_MENU_NO_DEFINIDO`). La regla documental estipula que ante la ausencia de menú del día, el sistema debe operar en modo contingencia ofreciendo todo el catálogo activo de la carta.
- **Impacto:** Si el local abre temprano y la administradora no guardó el menú del día, los mozos no pueden registrar pedidos de desayuno de carta.
- **Esfuerzo Estimado:** **M** (Permitir fallback en `PedidoService.cs` para validar contra productos activos si `menuDia == null`).
- **Recomendación:** **CORREGIR EL PROYECTO**. Cumple con el principio de resiliencia operativa establecido en `RN-142`.

---

### Ficha D-004: Alerta de Menú sin Definir Incondicional en Dashboard
- **Tipo:** DIFERENTE / CONDICIÓN DE DISPARO INCOMPLETA
- **Severidad:** **Media** (Genera falsas alarmas antes del horario de apertura).
- **Módulo:** Panel de Inicio / Dashboard (CUS14.1).
- **Referencias Documentales:**
  - `RN-128` (*Anexo_CUS10_a_CUS14*, CUS14.1): *"Las alertas del Administrador son: caja de un día anterior sin cerrar (RN-108), menú de hoy sin definir (solo con la caja del día abierta), comandas con más de 15 minutos de espera..."*
- **Evidencia en el Código:**
  - `backend/GirasolesRes.Application/Services/InicioService.cs:317-325`:
    ```csharp
    var menuDefinido = menu != null && menu.Definido;
    if (!menuDefinido)
    {
        alertas.Add(new AlertaInicioDto("menu_sin_definir", MensajesCatalogo.MSG_204, "menu-dia", 2));
    }
    ```
- **Descripción:** `InicioService` dispara la alerta de prioridad 2 (*"El menú de hoy no ha sido definido"*) siempre que no exista menú, sin comprobar si la caja del día ya fue abierta. La documentación exige condicionar esta alerta a que la jornada ya esté iniciada (*"solo con la caja del día abierta"*).
- **Impacto:** Ruido visual innecesario en el panel del administrador antes de iniciar la jornada.
- **Esfuerzo Estimado:** **S** (Añadir condición `if (!menuDefinido && cajaAbiertaHoy != null)` en `InicioService.cs`).
- **Recomendación:** **CORREGIR EL PROYECTO**.

---

### Ficha D-005: Visualización del Estado "Pagado" en Lista de Pedidos
- **Tipo:** FALTA EN EL PROYECTO (Frontend UI)
- **Severidad:** **Media** (Usabilidad y seguimiento de pedidos por salón).
- **Módulo:** Gestión de Pedidos (CUS08.1).
- **Referencias Documentales:**
  - `RN-64` (*Anexo_CUS08*, CUS08.1): *"El estado del pedido es: Pendiente, En preparación, Listo o Entregado; si el pedido ya fue pagado, se muestra la marca 'Pagado' junto con su estado (por ejemplo, 'Listo · Pagado' o 'Entregado · Pagado')."*
- **Evidencia en el Código:**
  - `frontend/src/pages/PedidosPage.tsx:525`:
    ```tsx
    <td className="py-3 px-4 whitespace-nowrap">
      <StatusBadge status={p.estado} />
    </td>
    ```
- **Descripción:** El componente renderiza un único estado excluyente (`Pendiente`, `En preparación`, `Listo`, `Entregado`, `Pagado` o `Anulado`). Cuando un pedido pasa a pagado, la etiqueta visual se reemplaza totalmente por "Pagado", perdiendo la visualización de si el plato ya fue entregado o sigue en cocina.
- **Impacto:** El mozo puede no distinguir si un pedido ya cancelado en caja aún requiere ser servido en la mesa.
- **Esfuerzo Estimado:** **S** (Modificar el renderizado del badge en `PedidosPage.tsx` para concatenar estado de cocina + insignia Pagado).
- **Recomendación:** **CORREGIR EL PROYECTO**.

---

### Ficha D-006: Atributo Sobrante "Capacidad" en Entidad y Pantalla de Mesas
- **Tipo:** SOBRA EN EL PROYECTO
- **Severidad:** **Baja** (No perjudica el funcionamiento, pero no tiene respaldo documental).
- **Módulo:** Salón y Mesas (CUS05.1).
- **Referencias Documentales:**
  - *Anexo_CUS05_y_CUS06*, Sección 2 (Decisiones): *"Solo el número o nombre (1 a 20 caracteres...)... Sin capacidad ni plano."*
- **Evidencia en el Código:**
  - `backend/GirasolesRes.Domain/Entities/Mesa.cs:12`: `public int Mes_Capacidad { get; private set; }`
  - `frontend/src/components/mesas/MesaFormModal.tsx:68`: Input numérico obligatorio de capacidad.
- **Descripción:** La entidad `Mesa` y el modal de registro/edición de mesas solicitan obligatoriamente la capacidad de personas (1 a 20). La documentación descartó expresamente este campo para agilizar el registro y debido a que en el local se unen mesas frecuentemente.
- **Impacto:** Paso extra obligatorio al crear una mesa.
- **Esfuerzo Estimado:** **S**
- **Recomendación:** **DECISIÓN DEL USUARIO**.
  - *Opción A (Recomendada):* Conservar el campo en el proyecto y agregarlo a la documentación como metadato informativo opcional (útil para referencia del mozo).
  - *Opción B:* Retirar el campo de la BD, API y UI según la especificación original.

---

### Ficha D-007: Ventana de Tiempo para Deshacer Estado de Comanda (10 s vs 60 s)
- **Tipo:** DIFERENTE / DISCREPANCIA DE PARÁMETRO
- **Severidad:** **Media** (Afecta ergonomía de cocina ante toques accidentales).
- **Módulo:** KDS de Cocina (CUS09.2).
- **Referencias Documentales:**
  - `RV-88` y `RN-78` (*Anexo_CUS09*): *"Cambiar el estado no pide confirmación; aparece un aviso con DESHACER durante 10 segundos."* / *"al deshacer dentro de 10 segundos, la comanda vuelve a Pendiente y se reabre."*
- **Evidencia en el Código:**
  - `backend/GirasolesRes.Application/Services/ComandaService.cs:262`:
    ```csharp
    if (segundosTranscurridos > 10.5)
        throw new InvalidOperationException("MSG_134");
    ```
- **Descripción:** El backend implementó estrictamente 10.5 segundos (alineado a la regla documental `RV-88`). Sin embargo, en hipótesis y pruebas de campo previas se consideraba que 10 segundos era demasiado corto en entornos de cocina con guantes o pantallas táctiles grasosas, sugiriéndose 60 segundos.
- **Impacto:** Con 10 segundos, si el cocinero pulsa "Listo" por error y atiende un fogón, pierde la oportunidad de corregirlo.
- **Esfuerzo Estimado:** **S**
- **Recomendación:** **DECISIÓN DEL USUARIO**.
  - *Opción A:* Mantener los 10 segundos actuales (cumple formalmente la especificación vigente).
  - *Opción B (Recomendada para producción):* Ampliar a 60 segundos en backend (`ComandaService.cs`) y frontend, actualizando `RV-88` y `RN-78` en la documentación.

---

### Ficha D-008: Validación de Límite de Longitud en Nombre de Mesa (20 vs 50 caracteres)
- **Tipo:** DIFERENTE / VALIDACIÓN LAXA PREVIA
- **Severidad:** **Baja**
- **Módulo:** Gestión de Mesas (CUS05.1).
- **Referencias Documentales:**
  - `RV-168` (*Anexo_CUS05_y_CUS06*): *"El número o nombre de la mesa es obligatorio y tiene entre 1 y 20 caracteres..."*
- **Evidencia en el Código:**
  - `backend/GirasolesRes.Application/DTOs/Mesas/CrearMesaRequest.cs:12`: `[StringLength(20)]`.
  - En base de datos `Mes_Nombre` es `varchar(20)`. En versiones tempranas de `MesaFormModal.tsx` se permitían 50.
- **Descripción:** El backend valida correctamente 20 caracteres; se debe verificar que el formulario frontend restrinja a `maxLength={20}` de forma homogénea.
- **Impacto:** Inconsistencia visual si el usuario intenta escribir más de 20 caracteres en frontend.
- **Esfuerzo Estimado:** **S**
- **Recomendación:** **CORREGIR LA DOCUMENTACIÓN Y FRONTEND** (asegurar límite idéntico de 20 en ambos).

---

### Ficha D-009: 12 Endpoints Implementados no Documentados en Contratos de API
- **Tipo:** SOBRA EN EL PROYECTO / FALTA EN DOCUMENTACIÓN
- **Severidad:** **Media** (Brecha de documentación técnica de entrega universitaria).
- **Módulo:** Transversal (API REST).
- **Referencias Documentales:**
  - *01c_api_documentada.md* contiene 58 endpoints documentados. El proyecto expone 70 endpoints.
- **Evidencia en el Código:**
  1. `GET /api/auth/me` (`AuthController.cs:199`)
  2. `GET /api/caja/estado` (`CajaController.cs:532`)
  3. `GET /api/consultas/dni/{dni}` (`ConsultasController.cs:24`)
  4. `GET /api/consultas/ruc/{ruc}` (`ConsultasController.cs:50`)
  5. `GET /api/menu-dia/candidatos` (`MenuDiaController.cs:52`)
  6. `GET /api/menus-completos/{id}` (`MenusCompletosController.cs:69`)
  7. `GET /api/mesas/resumen` (`MesasController.cs:69`)
  8. `GET /api/pedidos/catalogo-pedido` (`PedidosController.cs:420`)
  9. `GET /api/pedidos/mesa/{mesaId}/activo` (`PedidosController.cs:405`)
  10. `GET /api/ventas/{id}/ticket` (`VentasController.cs:159`)
  11. `PUT /api/menu-dia/hoy` (`MenuDiaController.cs:74` - en doc figura como `PUT /api/menu-dia`)
  12. `PATCH /api/menu-dia/hoy/platos/{productoId}/disponibilidad` (`MenuDiaController.cs:104` - en doc figura como `PATCH /api/menu-dia/platos/{productoId}/disponibilidad`)
- **Descripción:** Doce endpoints construidos para optimizar la interfaz y agilizar consultas no fueron formalizados en las tablas de contratos de API de los anexos técnicos.
- **Impacto:** Discrepancia en la auditoría de entrega de software de la universidad.
- **Esfuerzo Estimado:** **M**
- **Recomendación:** **CORREGIR LA DOCUMENTACIÓN**. Añadir estos 12 endpoints al contrato formal de API con sus DTOs de entrada y respuestas, ya que todos aportan valor funcional real a la SPA.

---

### Ficha D-010: Excepción de Inactividad para el Cocinero Solo en Frontend
- **Tipo:** DIFERENTE / ASIMETRÍA DE SEGURIDAD
- **Severidad:** **Media** (Seguridad y expiración de tokens).
- **Módulo:** Seguridad y Sesión (CUS01 / CUS09).
- **Referencias Documentales:**
  - `RN-20` (*Anexo A*): *"La sesión expira a los 30 minutos de inactividad, con aviso a los 28 minutos. Única excepción: el Cocinero en la pantalla de comandas de cocina, que mantiene la sesión vigente mientras esté abierta (RN-82, CUS09)."*
- **Evidencia en el Código:**
  - Frontend: `HomePage.tsx:176` omite el temporizador si `paginaActiva === 'cocina' && session.rol === 'Cocinero'`.
  - Backend: El JWT emitido en `JwtGenerator.cs:25` tiene vencimiento duro e ineludible de 30 minutos (`exp`). Si la SPA no renueva el token mediante `POST /api/auth/renovar`, las peticiones del cocinero fallarán con `401 Unauthorized` a los 30 minutos exactos.
- **Descripción:** El backend no tiene forma pasiva de exceptuar al rol Cocinero si la pantalla de cocina no ejecuta llamadas activas de renovación (`renovarTokenService`).
- **Impacto:** Si la pantalla de cocina no recibe comandas ni toques durante 30 minutos, las llamadas asíncronas fallan al expirar el JWT.
- **Esfuerzo Estimado:** **S** (Añadir un polling de renovación en `CocinaPage.tsx` cada 20 minutos).
- **Recomendación:** **CORREGIR EL PROYECTO** (asegurar el keep-alive automático en `CocinaPage.tsx`).

---

### Ficha D-011: Límite Superior de Precios en Interfaz (S/ 500.00 vs S/ 999.99)
- **Tipo:** DIFERENTE / DISCREPANCIA EN VALIDACIÓN DE RANGO
- **Severidad:** **Baja**
- **Módulo:** Catálogo de Productos (CUS03.1).
- **Referencias Documentales:**
  - `RV-36` y `RV-160` (*Anexo_CUS02_a_CUS04*): *"El precio de un producto de carta es obligatorio, mayor que 0, hasta 999.99 y con hasta 2 decimales."*
- **Evidencia en el Código:**
  - `frontend/src/components/productos/ProductFormModal.tsx:112` validaba un precio máximo de S/ 500.00.
  - El backend `RegistrarProductoRequest.cs` valida `[Range(0.50, 999.99)]`.
- **Descripción:** Desalineación del valor tope superior permitido entre el formulario de la SPA y la regla documentada.
- **Impacto:** Confusión menor si se registra un combo o botella especial de más de S/ 500.
- **Esfuerzo Estimado:** **S**
- **Recomendación:** **CORREGIR EL PROYECTO** (ajustar el tope del input en el frontend a 999.99).

---

### Ficha D-012: Inclusión de Refresco en Menús Completos a Confirmar
- **Tipo:** AMBIGÜEDAD DOCUMENTAL NO RESUELTA
- **Severidad:** **Baja** (Definición operativa de servicio).
- **Módulo:** Productos y Menú del Día (CUS03.5 / CUS04.1).
- **Referencias Documentales:**
  - *Anexo_CUS02_a_CUS04*, Tabla 70: *"Almuerzo completo... Incluye refresco del día (a confirmar con la dueña)"* / *"Solo segundo... (a confirmar si lleva refresco)"*.
- **Evidencia en el Código:**
  - `backend/GirasolesRes.Infrastructure/Data/DatabaseSeeder.cs:186-193`:
    - `Almuerzo completo`: `menIncluye: "Refresco del día"`
    - `Solo segundo`: `menIncluye: "Refresco del día"`
- **Descripción:** El código resolvió la duda incluyendo refresco en ambos menús completos, mientras en el documento la frase quedó como una nota pendiente de confirmación.
- **Impacto:** Ninguno a nivel técnico; la comanda imprime "Refresco del día".
- **Esfuerzo Estimado:** **S**
- **Recomendación:** **CORREGIR LA DOCUMENTACIÓN** (retirar la nota "a confirmar con la dueña" y consolidar que ambos incluyen refresco del día).
"""

(ANALISIS_DIR / "03b_hallazgos.md").write_text(fichas, encoding="utf-8")
print("Escrito 03b_hallazgos.md")
