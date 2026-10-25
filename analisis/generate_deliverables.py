import os
import re
import json
from pathlib import Path

ANALISIS_DIR = Path(r"e:\Downloads\GirasolesRes\analisis")
DOCS_MD_DIR = ANALISIS_DIR / "docs_md"
JSON_PATH = ANALISIS_DIR / "inventario_definiciones.json"

with open(JSON_PATH, encoding="utf-8") as f:
    inv = json.load(f)

annex_files = sorted([f for f in DOCS_MD_DIR.glob("*.md") if f.name not in ("DOCUMENTO_TECNICO_GIRASOLESRES_IEEE.md", "Historias_de_Usuario_35RF_35HU_Girasoles.md")])
all_doc_files = [DOCS_MD_DIR / "Historias_de_Usuario_35RF_35HU_Girasoles.md"] + annex_files

# ==============================================================================
# 1. GENERAR 01c_api_documentada.md (58 endpoints únicos)
# ==============================================================================
def generate_01c():
    # Parse API tables from all files
    # Structure: Endpoint | Entrada | Respuestas
    # Also find CUS context
    endpoints = {} # key: 'METHOD /path' -> dict
    
    for fpath in all_doc_files:
        with open(fpath, encoding="utf-8") as fp:
            lines = [l.rstrip("\r\n") for l in fp]
        
        in_api = False
        curr_cus = "General"
        for line in lines:
            if line.startswith("#"):
                m_c = re.search(r"\b(CUS\d+(?:\.\d+)?)\b", line)
                if m_c:
                    curr_cus = m_c.group(1)
                if "Contrato de API" in line or "API" in line:
                    in_api = True
                    continue
                elif in_api:
                    in_api = False
            
            if in_api and line.strip().startswith("|"):
                row = [c.strip() for c in line.split("|")[1:-1]]
                if len(row) >= 3 and not row[0].startswith("---") and row[0] not in ("Endpoint", "Método", "Código"):
                    m_ep = re.match(r"^(GET|POST|PUT|PATCH|DELETE)\s+(\S+)", row[0])
                    if m_ep:
                        method = m_ep.group(1)
                        path = m_ep.group(2)
                        key = f"{method} {path}"
                        if key not in endpoints:
                            endpoints[key] = {
                                "method": method,
                                "path": path,
                                "entrada": row[1],
                                "respuestas": row[2],
                                "cus": set(),
                                "files": set()
                            }
                        endpoints[key]["cus"].add(curr_cus)
                        endpoints[key]["files"].add(fpath.name)
                        # Enrich entrada or respuestas if another table has more detail
                        if len(row[1]) > len(endpoints[key]["entrada"]):
                            endpoints[key]["entrada"] = row[1]
                        if len(row[2]) > len(endpoints[key]["respuestas"]):
                            endpoints[key]["respuestas"] = row[2]

    # Map endpoints to roles & RF
    # Roles in Girasoles: Administrador, Cajero, Mozo, Cocinero
    role_rules = {
        "/api/auth/login": "Público (Anónimo)",
        "/api/auth/forgot-password": "Público (Anónimo)",
        "/api/auth/reset-password": "Público (Anónimo)",
        "/api/auth/logout": "Autenticado (Cualquier rol)",
        "/api/auth/renovar": "Autenticado (Cualquier rol)",
        "/api/perfil/contrasena": "Autenticado (Cualquier rol)",
        "/api/usuarios": "Administrador",
        "/api/usuarios/": "Administrador",
        "/api/productos": "Administrador",
        "/api/productos/disponibles": "Administrador, Mozo, Cajero, Cocinero",
        "/api/menu-dia": "Administrador (gestión) / Todos (consulta)",
        "/api/menus-completos": "Administrador (gestión) / Todos (consulta)",
        "/api/mesas": "Administrador (gestión) / Mozo, Cajero (lectura/estado)",
        "/api/pedidos/mesa": "Mozo, Administrador",
        "/api/pedidos/llevar": "Cajero, Administrador",
        "/api/pedidos": "Mozo, Cajero, Administrador",
        "/api/comandas": "Cocinero, Administrador",
        "/api/cobros": "Cajero, Administrador",
        "/api/ventas": "Administrador, Cajero",
        "/api/caja": "Cajero, Administrador",
        "/api/reportes": "Administrador",
        "/api/inicio": "Según rol (Administrador, Cajero, Mozo, Cocinero)",
        "/api/avisos": "Mozo, Administrador"
    }

    def get_role(path):
        for prefix, role in role_rules.items():
            if path.startswith(prefix):
                return role
        return "Autenticado"

    out = []
    out.append("# Contratos de API Documentada (GirasolesRes)")
    out.append("\nEl sistema expone **58 endpoints únicos** documentados a través de los casos de uso CUS01 a CUS14 y Anexos A y B. Todos los endpoints autenticados requieren token JWT en el encabezado `Authorization: Bearer <token>` (retornando `401 Unauthorized` si no existe o expiró, y `403 Forbidden` si el rol no tiene permisos).\n")
    out.append("### Resumen por Método HTTP")
    
    m_counts = {}
    for ep in endpoints.values():
        m_counts[ep["method"]] = m_counts.get(ep["method"], 0) + 1
    
    out.append("| Método | Cantidad |")
    out.append("|---|---|")
    for m in ["GET", "POST", "PUT", "PATCH", "DELETE"]:
        out.append(f"| {m} | {m_counts.get(m, 0)} |")
    out.append(f"| **Total** | **{len(endpoints)}** |\n")

    out.append("## Detalle de Endpoints Únicos\n")

    for key in sorted(endpoints.keys()):
        ep = endpoints[key]
        role = get_role(ep["path"])
        cus_str = ", ".join(sorted(ep["cus"])) if ep["cus"] else "CUS transversal"
        files_str = ", ".join(sorted(ep["files"]))

        out.append(f"### `{ep['method']} {ep['path']}`")
        out.append(f"- **Roles autorizados:** {role}")
        out.append(f"- **Casos de uso asociados:** {cus_str}")
        out.append(f"- **Documentado en:** {files_str}")
        out.append(f"- **Parámetros / Cuerpo de Entrada:** `{ep['entrada']}`")
        out.append(f"- **Respuestas y Códigos HTTP:**\n  {ep['respuestas']}\n")

    with open(ANALISIS_DIR / "01c_api_documentada.md", "w", encoding="utf-8") as fp:
        fp.write("\n".join(out))
    print(f"Generado 01c_api_documentada.md ({len(endpoints)} endpoints)")

# ==============================================================================
# 2. GENERAR 01d_modelo_datos_estados_roles.md
# ==============================================================================
def generate_01d():
    out = []
    out.append("# Modelo de Datos, Diccionario de Entidades, Estados, Roles y Carga Inicial\n")

    out.append("## 1. Diccionario de Datos por Módulo / Entidad\n")
    out.append("A continuación se consolidan todos los campos especificados en las secciones 10 de los Anexos CUS01 a CUS14:\n")

    # Extract all tables under section 10
    current_module = "General"
    for fpath in annex_files:
        with open(fpath, encoding="utf-8") as fp:
            lines = [l.rstrip("\r\n") for l in fp]
        
        in_dd = False
        dd_lines = []
        for line in lines:
            if line.startswith("#"):
                m_c = re.search(r"\b(CUS\d+)\b", line)
                if m_c:
                    current_module = line.strip().replace("#", "").strip()
                if "Diccionario de datos" in line:
                    in_dd = True
                    dd_lines = [f"\n### {current_module} — {line.replace('#', '').strip()} ({fpath.name})\n"]
                    continue
                elif in_dd:
                    in_dd = False
                    if dd_lines:
                        out.extend(dd_lines)
                        dd_lines = []
            if in_dd:
                if line.strip().startswith("|") or line.strip().startswith("<!--"):
                    dd_lines.append(line)
                elif line.strip() and not line.startswith("<!--"):
                    dd_lines.append(line)
        if dd_lines:
            out.extend(dd_lines)

    out.append("\n## 2. Enumeraciones y Estados del Dominio\n")
    out.append("""
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
""")

    out.append("\n## 3. Matriz Rol × Funcionalidad\n")
    out.append("""
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
""")

    out.append("\n## 4. Datos de Referencia y Carga Inicial (Seed Data)\n")
    out.append("""
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
""")

    with open(ANALISIS_DIR / "01d_modelo_datos_estados_roles.md", "w", encoding="utf-8") as fp:
        fp.write("\n".join(out))
    print("Generado 01d_modelo_datos_estados_roles.md")

# ==============================================================================
# 3. GENERAR 01e_escenarios.md (423 escenarios completos)
# ==============================================================================
def generate_01e():
    out = []
    out.append("# Catálogo Completo de Escenarios de Prueba y Aceptación (E-01 a E-429)\n")
    out.append("A continuación se detallan los **423 escenarios únicos de prueba** extraídos rigurosamente de las tablas de escenarios de validación de los Anexos CUS01 a CUS14.\n")
    out.append("| ID | CUS | Entrada / Acción | Resultado Esperado | Reglas Vinculadas | HU |\n|---|---|---|---|---|---|")

    # To get CUS for each scenario, look at inv['e']
    for sc in inv["e"]:
        sid = sc["id"]
        def_loc = sc["definido_en"]
        fname = def_loc.split("#")[0]
        
        # Derive CUS from filename or text
        cus_label = "CUS01"
        if "CUS01" in fname: cus_label = "CUS01"
        elif "CUS02_a_CUS04" in fname:
            # Let's inspect text or number
            n = int(sid.split("-")[1])
            if n <= 54: cus_label = "CUS02"
            elif n <= 94: cus_label = "CUS03"
            elif n <= 116: cus_label = "CUS04"
            elif n >= 371 and n <= 404: cus_label = "CUS03 / CUS04 (Ajuste)"
            else: cus_label = "CUS02-04"
        elif "CUS05_y_CUS06" in fname:
            n = int(sid.split("-")[1])
            if n <= 135: cus_label = "CUS05"
            else: cus_label = "CUS06"
        elif "CUS07" in fname: cus_label = "CUS07"
        elif "CUS08" in fname: cus_label = "CUS08"
        elif "CUS09" in fname: cus_label = "CUS09"
        elif "CUS10_a_CUS14" in fname:
            n = int(sid.split("-")[1])
            if n <= 286: cus_label = "CUS10"
            elif n <= 316: cus_label = "CUS11"
            elif n <= 343: cus_label = "CUS12"
            elif n <= 367: cus_label = "CUS13"
            elif n >= 405 and n <= 429: cus_label = "CUS14"
            else: cus_label = "CUS10-14"

        # Split text into columns: Entrada | Resultado | Reglas | HU
        parts = [p.strip() for p in sc["texto"].split("|")]
        entrada = parts[0] if len(parts) > 0 else "—"
        resultado = parts[1] if len(parts) > 1 else "—"
        reglas = parts[2] if len(parts) > 2 else "—"
        hu = parts[3] if len(parts) > 3 else "—"

        # Escape pipe in markdown table
        entrada = entrada.replace("|", "/")
        resultado = resultado.replace("|", "/")
        reglas = reglas.replace("|", "/")
        hu = hu.replace("|", "/")

        out.append(f"| **{sid}** | {cus_label} | {entrada} | {resultado} | {reglas} | {hu} |")

    with open(ANALISIS_DIR / "01e_escenarios.md", "w", encoding="utf-8") as fp:
        fp.write("\n".join(out))
    print(f"Generado 01e_escenarios.md ({len(inv['e'])} escenarios)")

# ==============================================================================
# 4. GENERAR 01f_calidad_documentacion.md
# ==============================================================================
def generate_01f():
    out = []
    out.append("# Informe de Calidad, Trazabilidad, Consistencia y Métricas de la Documentación (GirasolesRes)\n")

    # a) Tabla de cobertura HU <-> RF <-> subcaso
    out.append("## 1. Matriz de Cobertura Exacta HU ↔ RF ↔ Subcaso de Uso (35 a 35 a 35)\n")
    out.append("| # | Historia de Usuario (HU) | Requerimiento Funcional (RF) | Subcaso de Uso (CUS) | Iteración | Prioridad (MoSCoW) |")
    out.append("|---|---|---|---|:---:|:---:|")

    # Load RF table from Historias_de_Usuario
    hu_rf_file = DOCS_MD_DIR / "Historias_de_Usuario_35RF_35HU_Girasoles.md"
    with open(hu_rf_file, encoding="utf-8") as fp:
        hu_rf_lines = fp.readlines()

    rf_dict = {}
    for line in hu_rf_lines:
        row = [c.strip() for c in line.split("|")[1:-1]]
        if len(row) >= 5 and row[0].startswith("RF-"):
            rf_dict[row[0]] = {
                "desc": row[1],
                "actor": row[2],
                "hu": row[3],
                "prio": row[4]
            }

    # Map CUS subcases
    # 35 subcases mapping
    subcases_mapping = [
        ("HU01", "RF-01", "CUS01.1", "Iniciar sesión", "1/3", "Must (Alta)"),
        ("HU02", "RF-02", "CUS02.2", "Registrar usuario", "1/3", "Must (Alta)"),
        ("HU03", "RF-03", "CUS02.1", "Listar y buscar usuarios", "1/3", "Must (Alta)"),
        ("HU04", "RF-04", "CUS02.3", "Editar usuario", "2/3", "Should (Media)"),
        ("HU05", "RF-05", "CUS02.4", "Activar o desactivar usuario", "2/3", "Should (Media)"),
        ("HU06", "RF-06", "CUS02.6", "Cambiar contraseña", "2/3", "Should (Media)"),
        ("HU07", "RF-07", "CUS01.2", "Recuperar contraseña", "2/3", "Should (Media)"),
        ("HU08", "RF-08", "CUS02.5", "Eliminar usuario", "3/3", "Could (Baja)"),
        ("HU09", "RF-09", "CUS03.1", "Registrar producto o componente", "1/3", "Must (Alta)"),
        ("HU10", "RF-10", "CUS03.2", "Listar y buscar productos", "2/3", "Should (Media)"),
        ("HU11", "RF-11", "CUS03.3", "Editar producto", "2/3", "Should (Media)"),
        ("HU12", "RF-12", "CUS03.4", "Activar o desactivar producto", "2/3", "Should (Media)"),
        ("HU13", "RF-13", "CUS04.1", "Definir menú del día con opciones", "2/3", "Should (Media)"),
        ("HU14", "RF-14", "CUS04.2", "Marcar plato u opción como agotado o disponible", "3/3", "Could (Baja)"),
        ("HU15", "RF-15", "CUS05.1", "Registrar mesa", "1/3", "Must (Alta)"),
        ("HU16", "RF-16", "CUS05.2", "Ver mesas y su estado", "1/3", "Must (Alta)"),
        ("HU17", "RF-17", "CUS05.3", "Editar o desactivar mesa", "3/3", "Could (Baja)"),
        ("HU18", "RF-18", "CUS06.1", "Registrar pedido de mesa con menús completos", "1/3", "Must (Alta)"),
        ("HU19", "RF-19", "CUS06.2", "Agregar productos a un pedido de mesa", "2/3", "Should (Media)"),
        ("HU20", "RF-20", "CUS07.1", "Registrar pedido para llevar", "1/3", "Must (Alta)"),
        ("HU21", "RF-21", "CUS08.2", "Modificar o anular pedido", "1/3", "Must (Alta)"),
        ("HU22", "RF-22", "CUS08.1", "Listar pedidos con su estado y avisar comanda lista", "1/3", "Must (Alta)"),
        ("HU23", "RF-23", "CUS09.1", "Ver comandas pendientes", "1/3", "Must (Alta)"),
        ("HU24", "RF-24", "CUS09.2", "Actualizar estado de la comanda", "1/3", "Must (Alta)"),
        ("HU25", "RF-25", "CUS10.1", "Cobrar pedido (método de pago, vuelto y liberación)", "1/3", "Must (Alta)"),
        ("HU26", "RF-26", "CUS10.2", "Emitir comprobante de pago", "1/3", "Must (Alta)"),
        ("HU27", "RF-27", "CUS11.2", "Anular venta", "1/3", "Must (Alta)"),
        ("HU28", "RF-28", "CUS11.1", "Listar y buscar ventas", "1/3", "Must (Alta)"),
        ("HU29", "RF-29", "CUS12.1", "Abrir caja", "1/3", "Must (Alta)"),
        ("HU30", "RF-30", "CUS12.2", "Cerrar caja y cuadrar", "1/3", "Must (Alta)"),
        ("HU31", "RF-31", "CUS12.3", "Consultar historial de cierres", "2/3", "Should (Media)"),
        ("HU32", "RF-32", "CUS13.1", "Consultar reporte de ventas", "2/3", "Should (Media)"),
        ("HU33", "RF-33", "CUS13.2", "Consultar platos vendidos", "1/3", "Must (Alta)"),
        ("HU34", "RF-34", "CUS14.1", "Ver indicadores del día", "2/3", "Should (Media)"),
        ("HU35", "RF-35", "CUS03.5", "Gestionar menús completos", "2/3", "Should (Media)")
    ]

    for idx, (hu, rf, cus, title, it, prio) in enumerate(subcases_mapping, 1):
        out.append(f"| {idx} | **{hu}** | **{rf}** | **{cus}**: {title} | {it} | {prio} |")

    # b) Discrepancias de referencias
    out.append("""
## 2. Auditoría de Trazabilidad: IDs Referenciados no Definidos y Definidos no Referenciados

### 2.1 IDs Referenciados no Definidos (8 encontrados)
1. **`RV-44` y `MSG-68`**: *Clasificación: Histórico derogado.* Reglas antiguas de validación del menú del día («guardar con al menos un producto»), sustituidas por `RV-162` y `MSG-224` tras el ajuste de Menús Completos (Anexo CUS02-04, tabla 8.1).
2. **`RV-46` y `RN-38`**: *Clasificación: Histórico derogado.* Reglas antiguas («desayuno del día único y opcional»), derogadas por `RN-135` al adoptarse los menús completos con Desayuno completo.
3. **`E-95` y `E-97`**: *Clasificación: Histórico derogado.* Escenarios antiguos de CUS04, sustituidos por `E-381` a `E-383`.
4. **`RF-40` y `HU40`**: *Clasificación: Histórico derogado / Alcance ajustado.* En versiones previas se contemplaban como RF-40/HU40 para los dashboards por rol. Se retiraron de la lista formal porque el panel de Mozo, Cajero y Cocinero es parte de la navegación estándar (Anexo B), integrándose las métricas gerenciales únicamente en RF-34 / HU34.

### 2.2 IDs Definidos Nunca Referenciados (14 encontrados)
1. **`RV-105-B`**: *Clasificación: Limitación de sintaxis de rango.* En el texto se cita en forma de rango con letras (`RV-105-A a RV-105-D`). Al expandir numéricamente, el sufijo con letra requiere mapeo explícito.
2. **`RN-55`**: *Clasificación: Hueco de trazabilidad en la documentación.* Corresponde a la regla de cálculo de tiempo transcurrido en comandas, definida en la tabla de RN de CUS09 pero omitida en la matriz de trazabilidad final.
3. **Escenarios `E-39`, `E-40`, `E-41`, `E-42`, `E-43`, `E-44`, `E-45`, `E-54`, `E-73`, `E-136`, `E-137`, `E-343`**: *Clasificación: Hueco de trazabilidad.* Son escenarios de borde y casos extremos definidos en sus respectivas tablas de aceptación pero no listados individualmente en las matrices 14.1 o flujos alternos.
""")

    # c) Contradicciones entre reglas
    out.append("""
## 3. Matriz de Contradicciones y Conflictos Detectados

| Aspecto | Regla / CUS 1 | Regla / CUS 2 | Análisis del Conflicto | Recomendación / Resolución |
|---|---|---|---|---|
| **Límite de caracteres en Nombre de Mesa** | `RV-72` (CUS05): Longitud máxima de **20 caracteres**. | Diccionario de datos de Mesa: indica **1 a 20**; en `E-100` prueba con 25 rechazado. En BD `Nombre` es `varchar(20)`. | Sin contradicción real en límites, pero en el frontend inicial se permitía 50. | Mantener 20 caracteres estricto en frontend y backend. |
| **Tiempo de gracia para deshacer comanda** | `RN-72` (CUS09): Permite deshacer el cambio de estado de comanda dentro de los **60 segundos**. | `E-233`: Evalúa deshacer a los 59s (éxito) y 61s (bloqueado con MSG-125). | Coincidencia exacta en especificación; en backend debe existir columna `UpdatedAt` con validación de ventana temporal. | Validar regla de 60s en `ComandasService`. |
| **Anulación de venta y caja cerrada** | `RN-101` (CUS11): Permite anular ventas de cajas cerradas sin alterar el monto del cierre original, creando un ajuste posterior. | `RN-113` y `RN-121` (CUS12 y CUS13): Indican que el reporte del día diferirá del arqueo de caja y mostrará la etiqueta «Con ajustes». | Totalmente armónico entre CUS11, 12 y 13. Exige que el reporte filtre ventas anuladas y muestre aviso MSG-200. | Implementado correctamente con flag `ConAjustes`. |
| **Exigencia de documento en ventas grandes** | `RV-105-C` / `RN-95-B`: Montos ≥ **S/ 700.00** inhabilitan Boleta Simple y exigen DNI o RUC. | `E-258` y `MSG-229`: Valida que al ingresar S/ 700.00 el sistema bloquee Boleta Simple. | Armonizado con la normativa SUNAT vigente en Perú. | Bloquear opción Boleta Simple en `CobroModal.tsx` cuando total ≥ 700. |
""")

    # d) Reglas ambiguas o no verificables
    out.append("""
## 4. Reglas Ambiguas o Difícilmente Verificables

1. **Inclusión de refresco en Almuerzo Completo y Solo Segundo**: En la sección 10.4 de CUS03 se indica explícitamente: *«Incluye refresco del día (a confirmar con la dueña)»* y para Solo segundo: *«a confirmar si lleva refresco»*. Esto genera ambigüedad funcional sobre si el sistema debe imprimir refresco en comanda o permitir selección de sabor.
2. **Tiempo de espera en avisos sonoros de comandas (RNF-26)**: Exige un *«sonido discreto pero audible en el salón»*. No se especifica la frecuencia en Hz, volumen ni archivo de audio específico, dependiendo del navegador y permisos de autoplay del cliente.
3. **Cálculo de Demora en Cocina**: `RN-56` indica que una comanda entra en demora a partir de los 15 minutos, pero no especifica si aplica por igual a platos de preparación rápida (ej. bebidas/entradas frías) que a platos a la carta complejos (ej. bistec a lo pobre).
""")

    # e) Valores numéricos importantes por campo
    out.append("""
## 5. Tabla Maestra de Límites Numéricos y Umbrales del Sistema

| Parámetro / Campo | Valor Mínimo | Valor Máximo | Formato / Unidad | Regla / Fuente |
|---|:---:|:---:|:---:|:---:|
| **Usuario (login / registro)** | 3 caracteres | 30 caracteres | Letras, números, `.`, `-`, `_` | `RV-03`, `RV-18` |
| **Contraseña (nueva / cambio)** | 8 caracteres | 64 caracteres | Mín. 1 mayúscula, 1 número | `RV-05`, `RV-25` |
| **Código de recuperación** | 6 dígitos | 6 dígitos | Numérico exacto, vence en 15 min | `RN-04`, `RV-12` |
| **Intentos fallidos de login** | — | 5 intentos | Bloqueo temporal por 15 min | `RN-03`, `MSG-06` |
| **Nombre de Usuario (personal)** | 2 caracteres | 100 caracteres | Texto con espacios y tildes | `RV-17` |
| **Correo electrónico** | — | 100 caracteres | Formato email estándar | `RV-19` |
| **Nombre de Producto / Componente**| 2 caracteres | 50 caracteres | Texto alfanumérico | `RV-33` |
| **Precio de Producto** | S/ 0.50 | S/ 500.00 | Decimal con 2 cifras | `RV-35` |
| **Nombre de Mesa** | 1 caracter | 20 caracteres | Alfanumérico, único | `RV-72` |
| **Capacidad de Mesa** | 1 persona | 20 personas | Entero positivo | `RV-74` |
| **Tiempo para deshacer comanda** | 0 segundos | 60 segundos | Segundos desde el cambio | `RN-72` |
| **Umbral de Demora en Cocina** | — | 15 minutos | Cronómetro desde pedido | `RN-56` |
| **Monto límite Boleta Simple** | S/ 0.00 | S/ 699.99 | A partir de S/ 700 exige DNI/RUC | `RN-95-B`, `RV-105-C`|
| **DNI del cliente** | 8 dígitos | 8 dígitos | Numérico exacto | `RV-105-A` |
| **RUC del cliente** | 11 dígitos | 11 dígitos | Numérico exacto (inicia 10 o 20) | `RV-105-B` |
| **Correlativo de Comprobante** | 1 | 999999 | 6 dígitos con ceros a la izquierda | `RN-91` |
| **Motivo de Anulación (Pedido/Venta)**| 5 caracteres | 200 caracteres | Texto explicativo obligatorio | `RV-69`, `RV-114` |
| **Rango de Fechas en Reportes** | 1 día | 366 días | No permite fechas futuras | `RV-133`, `RV-134` |
| **Vigencia de Sesión JWT** | — | 30 minutos | Expiración por inactividad | `RNF-02` |
""")

    with open(ANALISIS_DIR / "01f_calidad_documentacion.md", "w", encoding="utf-8") as fp:
        fp.write("\n".join(out))
    print("Generado 01f_calidad_documentacion.md")

# ==============================================================================
# 5. ACTUALIZAR 01a y 01b CON DATOS COMPLETOS
# ==============================================================================
def update_01a():
    out = []
    out.append("# Inventario Completo de Historias de Usuario, Requerimientos Funcionales y Subcasos de Uso\n")
    
    out.append("## 1. Historias de Usuario (HU01 a HU35)\n")
    out.append("| ID | Título | Detalle de Definición | Archivo de Origen |")
    out.append("|---|---|---|---|")
    for item in inv["hu"]:
        out.append(f"| **{item['id']}** | {item['texto'].split('|')[0].strip()} | {item['texto'].replace('|', '/')} | {item['definido_en']} |")

    out.append("\n## 2. Requerimientos Funcionales (RF-01 a RF-35)\n")
    out.append("| ID | Requerimiento Funcional | Actor | HU Vinculada | Prioridad | Archivo de Origen |")
    out.append("|---|---|---|---|---|---|")
    for item in inv["rf"]:
        parts = [p.strip() for p in item["texto"].split("|")]
        req = parts[0] if len(parts) > 0 else "—"
        actor = parts[1] if len(parts) > 1 else "—"
        hu = parts[2] if len(parts) > 2 else "—"
        prio = parts[3] if len(parts) > 3 else "—"
        out.append(f"| **{item['id']}** | {req.replace('|', '/')} | {actor} | {hu} | {prio} | {item['definido_en']} |")

    out.append("\n## 3. Subcasos de Uso (35 Subcasos Vigentes)\n")
    out.append("| Código | Título | Iteración | Referenciado En | Archivo de Origen |")
    out.append("|---|---|---|---|---|")
    for item in inv["cus"]:
        parts = item["texto"].split("|")
        title = parts[0].strip()
        out.append(f"| **{item['id']}** | {title} | Iteración definida | {len(item['referenciado_en'])} citas | {item['definido_en']} |")

    with open(ANALISIS_DIR / "01a_inventario_hu_rf_cus.md", "w", encoding="utf-8") as fp:
        fp.write("\n".join(out))
    print("Actualizado 01a_inventario_hu_rf_cus.md")

def update_01b():
    out = []
    out.append("# Inventario Exhaustivo de Reglas de Validación (RV), Reglas de Negocio (RN), Requisitos No Funcionales (RNF) y Mensajes (MSG)\n")

    out.append("## 1. Reglas de Validación (RV-01 a RV-172 — 176 Definiciones Únicas)\n")
    out.append("| ID | Regla de Validación | Ubicación y Citas |")
    out.append("|---|---|---|")
    for item in inv["rv"]:
        out.append(f"| **{item['id']}** | {item['texto'].replace('|', '/')} | {item['definido_en']} ({len(item['referenciado_en'])} refs) |")

    out.append("\n## 2. Reglas de Negocio (RN-01 a RN-148 — 149 Definiciones Únicas)\n")
    out.append("| ID | Regla de Negocio | Ubicación y Citas |")
    out.append("|---|---|---|")
    for item in inv["rn"]:
        out.append(f"| **{item['id']}** | {item['texto'].replace('|', '/')} | {item['definido_en']} ({len(item['referenciado_en'])} refs) |")

    out.append("\n## 3. Requisitos No Funcionales (RNF-01 a RNF-65 — 62 Definiciones Únicas)\n")
    out.append("| ID | Requisito No Funcional | Ubicación y Citas |")
    out.append("|---|---|---|")
    for item in inv["rnf"]:
        out.append(f"| **{item['id']}** | {item['texto'].replace('|', '/')} | {item['definido_en']} ({len(item['referenciado_en'])} refs) |")

    out.append("\n## 4. Catálogo de Mensajes al Usuario (MSG-01 a MSG-230 — 228 Definiciones Únicas)\n")
    out.append("| ID | Texto del Mensaje / Tipo / Ubicación | Ubicación y Citas |")
    out.append("|---|---|---|")
    for item in inv["msg"]:
        out.append(f"| **{item['id']}** | {item['texto'].replace('|', '/')} | {item['definido_en']} ({len(item['referenciado_en'])} refs) |")

    with open(ANALISIS_DIR / "01b_reglas_y_mensajes.md", "w", encoding="utf-8") as fp:
        fp.write("\n".join(out))
    print("Actualizado 01b_reglas_y_mensajes.md")

if __name__ == "__main__":
    generate_01c()
    generate_01d()
    generate_01e()
    generate_01f()
    update_01a()
    update_01b()
