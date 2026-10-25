from pathlib import Path

ANALISIS_DIR = Path(r"e:\Downloads\GirasolesRes\analisis")

decisiones = """# Catálogo de Decisiones Pendientes (GirasolesRes)

Este documento reúne las decisiones clave que el usuario o el equipo responsable del proyecto deben tomar para resolver las discrepancias entre la documentación técnica y la implementación del software. Cada decisión se plantea como una pregunta cerrada con alternativas estructuradas y su correspondiente recomendación técnica.

---

### Decisión 1: Comportamiento ante Mesas Ocupadas (Varios Pedidos Abiertos)
- **Pregunta:** ¿Se debe permitir registrar múltiples pedidos independientes en una misma mesa ocupada para emitir cobros separados (según estipula `RN-46`), o se restringe a un único pedido activo por mesa obligando a usar la función "Agregar productos"?
- **Opciones:**
  - **Opción A (Recomendada):** Permitir varios pedidos abiertos en la misma mesa (corregir `PedidoService.cs:66`). Al tocar una mesa ocupada, el sistema pregunta si se desea abrir un pedido nuevo o agregar productos al existente (`MSG-95`). La mesa solo pasa a `Libre` cuando todos sus pedidos estén pagados (`RN-147`).
  - **Opción B:** Mantener un solo pedido activo por mesa en el código y modificar `RN-46` y `MSG-95` en la documentación para formalizar que en salón rige "una cuenta por mesa".
- **Impacto:** La opción A es más flexible para restaurantes donde comensales de la misma mesa pagan por separado o piden facturas con RUCs distintos.

---

### Decisión 2: Atributo "Capacidad" en la Entidad y Gestión de Mesas
- **Pregunta:** ¿Se formaliza el campo "Capacidad" de mesa en la documentación y base de datos, o se elimina del proyecto para apegarse a la decisión original de "sin capacidad ni plano"?
- **Opciones:**
  - **Opción A (Recomendada):** Conservar el campo en el código (`Mes_Capacidad`) e incorporarlo en la documentación (Ficha CUS05 y Diccionario de datos) como un atributo numérico referencial (1 a 20 personas) que ayuda al mozo a ubicar grupos grandes.
  - **Opción B:** Retirar el campo `Capacidad` de la entidad `Mesa`, DTOs, API y pantalla `MesaFormModal.tsx`.
- **Impacto:** La Opción A no requiere cambios de base de datos ni refactorizaciones de código; solo sincroniza el documento técnico.

---

### Decisión 3: Ventana de Tiempo para Deshacer Estado en Cocina (10 s vs 60 s)
- **Pregunta:** ¿Qué tiempo de gracia debe otorgarse al cocinero para deshacer un cambio accidental de estado en la pantalla KDS?
- **Opciones:**
  - **Opción A:** Mantener 10 segundos (como está en la regla documental `RV-88` y actualmente en `ComandaService.cs:262`).
  - **Opción B (Recomendada para producción):** Ampliar a 60 segundos en el backend y actualizar la redacción de `RV-88` y `RN-78` en la documentación.
- **Impacto:** 10 segundos es muy estrecho para cocinas reales de alto ritmo; 60 segundos brinda una ventana humana suficiente sin comprometer la sincronización de órdenes.

---

### Decisión 4: Incorporación Formal de los 12 Endpoints no Documentados
- **Pregunta:** ¿Se actualizan los contratos de API en la documentación para incorporar formalmente los 12 endpoints implementados en el backend (consulta de DNI/RUC, tickets térmicos, resúmenes de KPIs)?
- **Opciones:**
  - **Opción A (Recomendada):** Sí, incorporar los 12 endpoints a las tablas de contratos de API del informe técnico final, garantizando que el software entregado coincida al 100% con la especificación.
  - **Opción B:** Omitirlos de la documentación y dejarlos como endpoints internos no publicados.
- **Impacto:** La opción A es fundamental para la calificación técnica y auditoría académica de la Universidad Peruana Los Andes.

---

### Decisión 5: Inclusión Definitiva de Refresco en Menús Completos
- **Pregunta:** ¿Se ratifica que tanto el *Almuerzo completo* (S/ 8.00) como el *Solo segundo* (S/ 7.00) incluyen "Refresco del día" como ya está sembrado en el código?
- **Opciones:**
  - **Opción A (Recomendada):** Sí, ratificar en la documentación retirando la frase "(a confirmar con la dueña)" y dejándolo como estándar del negocio.
  - **Opción B:** Excluir el refresco en el Solo segundo y cobrarlo aparte en la carta.
- **Impacto:** La Opción A respalda lo que el seeder de base de datos y la comanda ya imprimen.
"""

(ANALISIS_DIR / "03c_decisiones_pendientes.md").write_text(decisiones, encoding="utf-8")
print("Escrito 03c_decisiones_pendientes.md")
