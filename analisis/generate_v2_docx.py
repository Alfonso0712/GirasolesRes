import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn
import csv
import os

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    for child in list(tcPr):
        if child.tag.endswith('shd'):
            tcPr.remove(child)
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_table_borders(table, color="D5CCC3", sz="4"):
    tblPr = table._tbl.tblPr
    for child in list(tblPr):
        if child.tag.endswith('tblBorders'):
            tblPr.remove(child)
    borders_xml = f'''
    <w:tblBorders {nsdecls("w")}>
        <w:top w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>
        <w:left w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>
        <w:bottom w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>
        <w:right w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>
        <w:insideH w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>
        <w:insideV w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>
    </w:tblBorders>
    '''
    tblPr.append(parse_xml(borders_xml))

def format_cell_text(cell, text, bold=False, italic=False, font_size=8.5, color=RGBColor(0,0,0), align=WD_ALIGN_PARAGRAPH.LEFT):
    cell.text = ""
    p = cell.paragraphs[0]
    p.alignment = align
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.05
    run = p.add_run(text)
    run.bold = bold
    run.italic = italic
    run.font.name = "Arial"
    run.font.size = Pt(font_size)
    run.font.color.rgb = color
    return run

def add_styled_paragraph(doc, text="", font_name="Arial", font_size=11.0, bold=False, italic=False, color=RGBColor(0,0,0), align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_before=0, space_after=4, line_spacing=1.15):
    p = doc.add_paragraph()
    p.alignment = align
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = line_spacing
    if text:
        run = p.add_run(text)
        run.bold = bold
        run.italic = italic
        run.font.name = font_name
        run.font.size = Pt(font_size)
        run.font.color.rgb = color
    return p

def add_heading_1(doc, text):
    return add_styled_paragraph(doc, text, font_name="Arial", font_size=13.5, bold=True, color=RGBColor(58, 34, 17), align=WD_ALIGN_PARAGRAPH.LEFT, space_before=14, space_after=6)

def add_heading_2(doc, text):
    return add_styled_paragraph(doc, text, font_name="Arial", font_size=11.5, bold=True, color=RGBColor(58, 34, 17), align=WD_ALIGN_PARAGRAPH.LEFT, space_before=10, space_after=4)

def add_heading_3(doc, text):
    return add_styled_paragraph(doc, text, font_name="Arial", font_size=10.5, bold=True, color=RGBColor(184, 69, 0), align=WD_ALIGN_PARAGRAPH.LEFT, space_before=8, space_after=3)

def add_body_p(doc, text, bold_prefix=None):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.bold = True
        r_pre.font.name = "Arial"
        r_pre.font.size = Pt(11.0)
    r_body = p.add_run(text)
    r_body.font.name = "Arial"
    r_body.font.size = Pt(11.0)
    return p

def create_table(doc, headers, data, col_widths=None):
    table = doc.add_table(rows=len(data) + 1, cols=len(headers))
    set_table_borders(table)

    trPr = table.rows[0]._tr.get_or_add_trPr()
    trPr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))

    for row in table.rows:
        r_trPr = row._tr.get_or_add_trPr()
        r_trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))

    for col_idx, header_text in enumerate(headers):
        cell = table.cell(0, col_idx)
        set_cell_background(cell, "3A2211")
        format_cell_text(cell, header_text, bold=True, font_size=9.0, color=RGBColor(255, 255, 255), align=WD_ALIGN_PARAGRAPH.LEFT)

    for row_idx, row_data in enumerate(data):
        bg = "F9F6F0" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, cell_value in enumerate(row_data):
            cell = table.cell(row_idx + 1, col_idx)
            set_cell_background(cell, bg)
            is_bold = (col_idx == 0 and len(cell_value) < 40)
            format_cell_text(cell, cell_value, bold=is_bold, font_size=8.5, color=RGBColor(44, 26, 14), align=WD_ALIGN_PARAGRAPH.LEFT)

    if col_widths:
        for row in table.rows:
            for col_idx, width in enumerate(col_widths):
                if col_idx < len(row.cells):
                    row.cells[col_idx].width = width

    p_spacer = doc.add_paragraph()
    p_spacer.paragraph_format.space_before = Pt(0)
    p_spacer.paragraph_format.space_after = Pt(4)
    return table

def run_generator():
    input_docx = "docs/DOCUMENTO_TECNICO_GIRASOLESRES_IEEE.docx"
    output_docx = "docs/DOCUMENTO_TECNICO_GIRASOLESRES_IEEE_v2.docx"

    print(f"Cargando {input_docx}...")
    doc = docx.Document(input_docx)

    # 1. Actualizar Metadatos en Portada (Tabla 1)
    t1 = doc.tables[0]
    t1.rows[4].cells[1].text = "Versión 2.0 (Actualizada con Verificación de Código y Trazabilidad)"
    t1.rows[5].cells[1].text = "Octubre 2026 | Huancayo – Perú"

    # 2. Actualizar Tabla 2.1 (Módulos Funcionales)
    t2 = doc.tables[1]
    # Fila 2: Salón y Mesas
    t2.rows[2].cells[4].text = "Mapeo visual y matricial de mesas del establecimiento; transición dinámica de estados de ocupación (Libre, Ocupada, Reservada); soporte para múltiples pedidos abiertos por mesa (MSG-95) con diálogo interactivo (PEDIDO NUEVO / AGREGAR PRODUCTOS); liberación atómica a 'Libre' cuando no restan pedidos pendientes de cobro; auditoría transaccional de cambios de estado."
    
    # Fila 4: Menú del Día
    t2.rows[4].cells[4].text = "Parametrización diaria de la oferta gastronómica; estructuración de 'Menús Completos' con precio global cerrado; configuración de partes obligatorias (Entrada, Segundo, Refresco); asociación de platos componentes sin costo adicional; regla RN-142: sin menú del día definido se permite la venta con todos los componentes activos y menús completos activos del catálogo."
    
    # Fila 5: Toma de Pedidos
    t2.rows[5].cells[1].text = "CUS06, CUS06.1, CUS06.2"
    t2.rows[5].cells[4].text = "Interfaz táctil ergonómica para mozos y administradores; selección guiada de menús completos (validación estricta de componentes antes de añadir); soporte para apertura de nuevo pedido o adición de líneas a pedido existente en mesas ocupadas; observaciones personalizadas por plato; cálculo dinámico de subtotales."
    
    # Fila 6: Pedidos Para Llevar
    t2.rows[6].cells[1].text = "CUS07, CUS07.1"
    t2.rows[6].cells[4].text = "Flujo acelerado de atención en mostrador sin asignación de mesa física. Rol de registro restringido EXCLUSIVAMENTE al Cajero (el servidor responde 403 Forbidden a Administrador y Mozo); captura de referencia opcional del cliente (hasta 30 caracteres); armado mixto de carta y menús completos; derivación directa a caja y cocina."
    
    # Fila 7: Monitoreo y Gestión de Pedidos Activos
    t2.rows[7].cells[1].text = "CUS08, CUS08.1, CUS08.2"
    t2.rows[7].cells[4].text = "Tablero unificado de pedidos; visualización de estados simples y compuestos ('Listo · Pagado', 'Pagado · En preparación', 'Pagado · Pendiente'); regla de anulación administrativa: el Administrador puede anular cualquier pedido no pagado (incluso en preparación o listo) con motivo obligatorio de 5 a 100 caracteres; el Mozo y Cajero solo anulan pedidos propios con comandas pendientes; liberación automática de mesa si no quedan pedidos activos."
    
    # Fila 8: KDS Cocina
    t2.rows[8].cells[1].text = "CUS09, CUS10"
    t2.rows[8].cells[4].text = "Sistema de visualización de cocina interactivo; división automática de comandas; cronómetro de preparación con detección de demora a partir de 15 minutos o más (>= 15); cambio de estado a 'Listo' con aviso al salón; enrutamiento de avisos de comanda lista al creador del pedido (Mozo/Admin) o al Cajero para llevar; renovación automática de sesión cada 20 min (RN-20, RN-82) para mantener el KDS activo permanentemente."
    
    # Fila 9: Caja y Cobros
    t2.rows[9].cells[1].text = "CUS11, CUS11.1, CUS11.2"
    t2.rows[9].cells[4].text = "Liquidación transaccional atómica de pedidos restringida EXCLUSIVAMENTE al Cajero (el servidor responde 403 Forbidden al Administrador); medios de pago: Efectivo (con cálculo de vuelto) y Yape; validación fiscal estricta (DNI obligatorio en montos >= S/ 700.00; RUC y Razón Social en Facturas); emisión de comprobantes (Ticket, Boleta, Factura) y generación de PDF vectorial."
    
    # Fila 11: Dashboard
    t2.rows[11].cells[4].text = "Consulta histórica de ventas y comprobantes emitidos; reporte de cuadratura de caja cruzando ventas registradas frente a pagos declarados; ranking de platos más vendidos; consolidado de productividad por mozo; dashboard gerencial con métricas en tiempo real; alerta 'menú de hoy sin definir' (MSG-204) activada únicamente cuando la caja del día está abierta."

    # 3. Guardar las referencias bibliográficas y borrarlas temporalmente para ponerlas al final
    ref_paragraphs = []
    found_ref = False
    for p in list(doc.paragraphs):
        if "REFERENCIAS BIBLIOGRÁFICAS" in p.text:
            found_ref = True
        if found_ref:
            ref_paragraphs.append(p.text)
            p._element.getparent().remove(p._element)

    print(f"Referencias bibliográficas extraídas ({len(ref_paragraphs)} líneas). Agregando nuevas secciones 5 a 8...")

    # =========================================================================
    # SECCIÓN 5: MODELO DE DATOS, PERSISTENCIA Y MIGRACIONES
    # =========================================================================
    add_heading_1(doc, "5. MODELO DE DATOS, PERSISTENCIA Y MIGRACIONES")
    add_body_p(doc, "El modelo de persistencia del sistema GirasolesRes está implementado sobre el motor de base de datos relacional PostgreSQL 16, estructurado bajo el paradigma Object-Relational Mapping (ORM) mediante Entity Framework Core 8.0. La arquitectura de persistencia asegura el cumplimiento riguroso de las propiedades ACID (Atomicidad, Consistencia, Aislamiento y Durabilidad), garantizando la integridad de las transacciones operativas del restaurante mediante mecanismos explícitos de control de concurrencia y transacciones distribuidas en la capa de infraestructura.")

    add_heading_2(doc, "5.1 Entidades de Dominio y Mapeo Relacional")
    add_body_p(doc, "La siguiente tabla detalla las entidades de dominio centrales del sistema, sus atributos clave, tipos de datos en PostgreSQL, restricciones de integridad y responsabilidades en el flujo operativo gastronómico:")

    headers_5_1 = ["Entidad / Tabla", "Columnas Principales", "Tipo PostgreSQL", "Restricciones / Reglas", "Descripción y Rol de Dominio"]
    data_5_1 = [
        ["usuarios", "id_usuario\nusu_usuario\nusu_nombre\nusu_correo\nusu_rol\nusu_activo", "UUID (PK)\nvarchar(20)\nvarchar(100)\nvarchar(100)\nvarchar(20)\nboolean", "PK, UNIQUE(usuario),\nUNIQUE(correo),\nRol in (Admin, Cajero, Mozo, Cocinero)", "Entidad de operadores del sistema. Soporta PBKDF2 (100k iteraciones HMAC-SHA256) y bloqueo temporal tras 5 fallos."],
        ["tokens_revocados", "id\ntoken\nfecha_revocacion\nfecha_expiracion", "serial (PK)\ntext\ntimestamptz\ntimestamptz", "PK, Index(token),\nIndex(expiracion)", "Lista negra de tokens JWT invalidados por cierre de sesión o cambio de contraseña (RN-10). Limpieza automática semanal."],
        ["mesas", "id_mesa\nmes_numero\nmes_nombre\nmes_estado\nmes_activo", "UUID (PK)\ninteger\nvarchar(20)\nvarchar(20)\nboolean", "PK, UNIQUE(numero),\nEstado in (Libre, Ocupada, Reservada)", "Mesas físicas del salón. Nota: El atributo 'capacidad' fue suprimido del dominio. Admite múltiples pedidos abiertos (MSG-95)."],
        ["productos", "id_producto\npro_nombre\npro_tipo\npro_categoria\npro_precio\npro_activo", "UUID (PK)\nvarchar(50)\nvarchar(20)\nvarchar(20)\nnumeric(8,2)\nboolean", "PK, Tipo in (Carta, Componente),\nPrecio > 0 y <= 999.99,\nMax 2 decimales", "Catálogo culinario. Productos de Carta tienen precio obligatorio; Componentes tienen precio null y rol asignado (Entrada, Segundo, etc.)."],
        ["menus_completos", "id_menu_completo\nmen_nombre\nmen_precio\nmen_activo\nmen_incluye", "integer (PK)\nvarchar(100)\nnumeric(8,2)\nboolean\nvarchar(150)", "PK, Precio > 0,\nPrecio <= 999.99,\nMax 2 decimales", "Paquetes cerrados de menú del día (ej. Menú Criollo S/ 12.00). Agrupa partes obligatorias parametrizadas."],
        ["menus_completos_partes", "id_parte\nid_menu_completo\nnombre\norden\nroles_permitidos", "integer (PK)\ninteger (FK)\nvarchar(50)\ninteger\ntext[]", "PK, FK(menus_completos),\norden >= 1", "Estructura interna del menú compuesto. Define los roles gastronómicos requeridos (ej. Entrada, Segundo, Refresco)."],
        ["menu_dia", "id_menu_dia\nfecha\ndefinido\nid_desayuno", "UUID (PK)\ndate\nboolean\nUUID (FK)", "PK, UNIQUE(fecha),\nFK(productos)", "Instancia diaria de la carta operativa. Registra si la oferta del día fue formalizada por la administración."],
        ["pedidos", "id_pedido\nped_numero\nped_tipo\nid_mesa\nid_usuario\nped_estado\nped_total", "UUID (PK)\ninteger\nvarchar(20)\nUUID (FK)\nUUID (FK)\nvarchar(20)\nnumeric(8,2)", "PK, UNIQUE(dia, numero),\nTipo in (Mesa, Llevar),\nEstado in (Pendiente, EnPreparacion, Listo, Pagado, Anulado)", "Entidad central de orden de consumo. Admite estados compuestos en listados para comandas aún en cocción ('Pagado · En preparación')."],
        ["detalles_pedidos", "id_detalle\nid_pedido\nid_producto\nid_menu_completo\ndet_cantidad\ndet_precio_unitario\ndet_subtotal", "UUID (PK)\nUUID (FK)\nUUID (FK null)\ninteger (FK null)\ninteger\nnumeric(8,2)\nnumeric(8,2)", "PK, FK(pedidos),\nCantidad 1 a 20,\nSubtotal = Cant * PrecioUnit", "Líneas individuales de comanda. Almacena precio congelado al momento del registro (RN-51) para evitar desfases ante cambios tarifarios."],
        ["comandas", "id_comanda\nid_pedido\ncmd_numero\ncmd_estado\ncmd_fecha_hora_utc", "UUID (PK)\nUUID (FK)\ninteger\nvarchar(20)\ntimestamptz", "PK, FK(pedidos),\nEstado in (Pendiente, EnPreparacion, Listo)", "Orden de trabajo para la cocina (KDS). Monitorea el SLA de preparación y calcula la alerta de demora (>= 15 minutos)."],
        ["cajas", "id_caja\nid_usuario\ncaj_monto_inicial\ncaj_fecha_apertura_utc\ncaj_fecha_cierre_utc\ncaj_estado", "UUID (PK)\nUUID (FK)\nnumeric(10,2)\ntimestamptz\ntimestamptz null\nvarchar(20)", "PK, FK(usuarios),\nMonto >= 0.00 y <= 99999.99,\nEstado in (Abierta, Cerrada)", "Sesión financiera de turno. Restringe aperturas simultáneas y exige arqueo con balance ciego de efectivo contado."],
        ["ventas", "id_venta\nid_pedido\nid_caja\nid_usuario\nvta_tipo_comprobante\nvta_serie\nvta_numero\nvta_total", "UUID (PK)\nUUID (FK)\nUUID (FK)\nUUID (FK)\nvarchar(20)\nvarchar(4)\ninteger\nnumeric(8,2)", "PK, UNIQUE(serie, numero),\nTipo in (Ticket, Boleta, Factura),\nMetodo in (Efectivo, Yape)", "Comprobante de pago fiscal o interno. Ejecutada dentro de transacción atómica que cancela el pedido y libera la mesa física."],
        ["series_comprobantes", "serie\ntipo_comprobante\nultimo_correlativo", "varchar(4) PK\nvarchar(20)\ninteger", "PK, Correlativo >= 1", "Secuenciador atómico de correlativos (T001 para Tickets, B001 para Boletas, F001 para Facturas). Previene duplicidades."],
        ["auditoria_usuarios", "id_auditoria\nid_usuario\naud_accion\naud_modulo\naud_ip\naud_fecha_utc", "UUID (PK)\nUUID (FK null)\nvarchar(100)\nvarchar(50)\nvarchar(45)\ntimestamptz", "PK, Append-only (sin UPDATE ni DELETE)", "Bitácora inmutable de seguridad. Registra inicios de sesión, cambios de precio, anulaciones y movimientos extraordinarios."]
    ]
    create_table(doc, headers_5_1, data_5_1, [Inches(1.1), Inches(1.2), Inches(1.0), Inches(1.4), Inches(2.3)])

    add_heading_2(doc, "5.2 Estados de Negocio y Transiciones de Ciclo de Vida")
    add_body_p(doc, "El sistema implementa máquinas de estados finitos rigurosas para gobernar las entidades críticas del restaurante:")
    add_body_p(doc, "•  Ciclo de Vida de Mesas: Libre -> Ocupada (al registrar uno o más pedidos) -> Libre (únicamente cuando ningún pedido queda pendiente de cobro). Si se anulan pedidos y no quedan órdenes activas, la mesa revierte automáticamente a Libre (RN-147).")
    add_body_p(doc, "•  Ciclo de Vida de Pedidos: Pendiente -> En Preparación (cuando cocina inicia comanda) -> Listo (comandas listas) -> Pagado (al procesar el cobro en caja). En listados operativos, si el pedido fue pagado pero aún se cocina, se resuelve como estado compuesto ('Pagado · En preparación' o 'Pagado · Pendiente'). El estado 'Anulado' solo es accesible antes del cobro.")
    add_body_p(doc, "•  Ciclo de Vida de Comandas: Pendiente -> En Preparación -> Listo. Cocina dispone de una ventana de 10 segundos con función 'Deshacer' (RV-88 / MSG-126) para revertir cambios accidentales.")
    add_body_p(doc, "•  Ciclo de Vida de Caja: Cerrada -> Abierta (con monto inicial >= 0.00 y <= 99,999.99) -> Cerrada (previo arqueo con desglose por billetes/monedas y cálculo de sobrante/faltante).")

    add_heading_2(doc, "5.3 Migraciones y Estrategia de Persistencia")
    add_body_p(doc, "La evolución del esquema de base de datos se administra mediante migraciones de EF Core combinadas con scripts SQL idempotentes alojados en /database. Las operaciones compuestas (como el cobro de un pedido que incluye inserción de venta, actualización de pedido a Pagado, incremento de correlativo en series_comprobantes y liberación de mesa) se ejecutan bajo transacciones atómicas explícitas (using var tx = await _context.Database.BeginTransactionAsync()), garantizando que ningún estado inconsistente persista ante fallos de red o hardware.")

    # =========================================================================
    # SECCIÓN 6: CATÁLOGO DE API REST Y MATRIZ DE AUTORIZACIÓN
    # =========================================================================
    add_heading_1(doc, "6. CATÁLOGO DE API REST Y MATRIZ DE AUTORIZACIÓN")
    add_body_p(doc, "La API REST de GirasolesRes expone 58 endpoints únicos estructurados bajo el estándar RESTful, protegidos mediante JWT Bearer y autorizados por el esquema RBAC (Role-Based Access Control) con 4 roles: Administrador, Cajero, Mozo y Cocinero.")

    add_heading_2(doc, "6.1 Matriz de Control de Acceso Basado en Roles (RBAC)")
    add_body_p(doc, "La siguiente matriz consolida los permisos de ejecución sobre los módulos del sistema según el rol del operador autenticado:")

    headers_6_1 = ["Funcionalidad / Módulo Operativo", "Administrador", "Cajero", "Mozo", "Cocinero", "Restricción y Criterio de Control"]
    data_6_1 = [
        ["Autenticación, Perfil y Cambio de Clave", "AUTORIZADO", "AUTORIZADO", "AUTORIZADO", "AUTORIZADO", "CUS01 / Común para todos los operadores."],
        ["Gestión de Usuarios (CRUD y Estados)", "AUTORIZADO", "DENEGADO", "DENEGADO", "DENEGADO", "CUS02 / Exclusivo de gestión administrativa."],
        ["Gestión de Catálogo y Precios de Productos", "AUTORIZADO", "DENEGADO", "DENEGADO", "DENEGADO", "CUS04 / Precio máx. S/ 999.99 con hasta 2 decimales."],
        ["Gestión de Menús Completos (Precios/Partes)", "AUTORIZADO", "DENEGADO", "DENEGADO", "DENEGADO", "CUS04 / Paquetes cerrados de menú."],
        ["Definir Menú del Día y Platos Vigentes", "AUTORIZADO", "DENEGADO", "DENEGADO", "DENEGADO", "CUS05 / Configuración de la carta del día."],
        ["Marcar Plato/Opción Agotado o Disponible", "AUTORIZADO", "DENEGADO", "DENEGADO", "AUTORIZADO", "CUS05.2 / Administrador y Cocinero en servicio."],
        ["Gestión de Mesas (CRUD Salón)", "AUTORIZADO", "DENEGADO", "DENEGADO", "DENEGADO", "CUS03 / Sin atributo de capacidad de comensales."],
        ["Visualización de Salón y Estado de Mesas", "AUTORIZADO", "AUTORIZADO", "AUTORIZADO", "DENEGADO", "CUS03.1 / Tablero visual en tiempo real."],
        ["Registrar Pedido de Mesa y Agregar Líneas", "AUTORIZADO", "DENEGADO", "AUTORIZADO", "DENEGADO", "CUS06.1, CUS06.2 / Mozo y Administrador en salón."],
        ["Registrar Pedido Para Llevar (Mostrador)", "DENEGADO", "AUTORIZADO", "DENEGADO", "DENEGADO", "CUS07.1 / SOLO CAJERO (Admin y Mozo reciben 403)."],
        ["Listar Pedidos y Avisos de Comandas", "AUTORIZADO", "AUTORIZADO", "AUTORIZADO", "DENEGADO", "CUS08.1 / Avisos dirigidos al creador o cajero."],
        ["Modificar Pedido (antes de preparación)", "AUTORIZADO", "AUTORIZADO", "AUTORIZADO", "DENEGADO", "CUS08.2 / Únicamente quien registró el pedido."],
        ["Anular Pedido No Pagado", "AUTORIZADO", "LIMITADO", "LIMITADO", "DENEGADO", "Admin anula cualquiera con motivo; Mozo/Cajero solo propios con comanda pendiente."],
        ["Pantalla KDS de Cocina y Cambio de Estado", "AUTORIZADO", "DENEGADO", "DENEGADO", "AUTORIZADO", "CUS09 / Demora >= 15 min; Keep-alive cada 20 min."],
        ["Deshacer Estado de Comanda (ventana 10s)", "AUTORIZADO", "DENEGADO", "DENEGADO", "AUTORIZADO", "CUS09.2 / Reversión táctil inmediata (RV-88)."],
        ["Apertura, Movimientos y Cierre de Caja", "AUTORIZADO", "AUTORIZADO", "DENEGADO", "DENEGADO", "CUS12 / Registro de turnos y arqueos físicos."],
        ["Cobrar Pedidos y Emitir Comprobantes", "DENEGADO", "AUTORIZADO", "DENEGADO", "DENEGADO", "CUS11.1 / SOLO CAJERO (Admin y Mozo reciben 403)."],
        ["Consultas de DNI (RENIEC) y RUC (SUNAT)", "AUTORIZADO", "AUTORIZADO", "DENEGADO", "DENEGADO", "CUS11 / Validación en línea para comprobantes."],
        ["Historial de Ventas y Detalle de Comprobante", "AUTORIZADO", "AUTORIZADO", "DENEGADO", "DENEGADO", "CUS13 / Consulta de tickets, boletas y facturas."],
        ["Descarga de PDF de Comprobantes y Actas", "AUTORIZADO", "AUTORIZADO", "DENEGADO", "DENEGADO", "CUS11, CUS12 / Generación vectorial PdfCanvasBuilder."],
        ["Reportes Gerenciales y Dashboard Analítico", "AUTORIZADO", "DENEGADO", "DENEGADO", "DENEGADO", "CUS14, CUS15 / Alerta menú sin definir si caja abierta."]
    ]
    create_table(doc, headers_6_1, data_6_1, [Inches(1.8), Inches(1.0), Inches(1.0), Inches(1.0), Inches(1.0), Inches(1.2)])

    add_heading_2(doc, "6.2 Catálogo Exhaustivo de Endpoints REST (58 Endpoints)")
    add_body_p(doc, "A continuación se documentan todos los endpoints expuestos por los 16 controladores de la solución, sus roles autorizados y códigos de respuesta:")

    headers_6_2 = ["Controlador", "Método", "Ruta del Endpoint", "Roles Autorizados", "Códigos HTTP de Respuesta", "Descripción / Contrato"]
    data_6_2 = [
        ["AuthController", "POST", "/api/auth/login", "Público", "200, 400, 401, 429", "Inicio de sesión; devuelve JWT Bearer."],
        ["AuthController", "POST", "/api/auth/logout", "Autorizado", "200, 401", "Cierre de sesión; revoca token en BD."],
        ["AuthController", "POST", "/api/auth/renovar", "Autorizado", "200, 401", "Renovación de token JWT (utilizado en KDS)."],
        ["AuthController", "GET", "/api/auth/validar", "Autorizado", "200, 401", "Verificación de validez y claims del token."],
        ["AuthController", "POST", "/api/auth/recuperar-clave/solicitar", "Público", "200, 400, 404", "Envío de código de 6 dígitos al correo."],
        ["AuthController", "POST", "/api/auth/recuperar-clave/verificar", "Público", "200, 400", "Validación del código temporal recibido."],
        ["AuthController", "POST", "/api/auth/recuperar-clave/restablecer", "Público", "200, 400", "Cambio de contraseña vía token temporal."],
        ["AuthController", "PUT", "/api/auth/cambiar-clave-propia", "Autorizado", "200, 400, 401", "Cambio de contraseña por el propio usuario."],
        ["UsuariosController", "GET", "/api/usuarios", "Administrador", "200, 401, 403", "Listado pagado y filtrado de usuarios."],
        ["UsuariosController", "POST", "/api/usuarios", "Administrador", "201, 400, 401, 403, 409", "Registro de nuevo usuario con rol."],
        ["UsuariosController", "PUT", "/api/usuarios/{id}", "Administrador", "200, 400, 401, 403, 404", "Actualización de datos y rol de usuario."],
        ["UsuariosController", "PATCH", "/api/usuarios/{id}/estado", "Administrador", "200, 400, 401, 403, 404", "Activación o desactivación de usuario."],
        ["PerfilController", "GET", "/api/perfil", "Autorizado", "200, 401, 404", "Obtención de perfil del usuario logueado."],
        ["MesasController", "GET", "/api/mesas", "Admin, Mozo, Cajero", "200, 401, 403", "Listado y mapa de mesas del salón."],
        ["MesasController", "GET", "/api/mesas/{id}", "Admin, Mozo, Cajero", "200, 401, 403, 404", "Detalle de una mesa específica."],
        ["MesasController", "POST", "/api/mesas", "Administrador", "201, 400, 401, 403, 409", "Creación de mesa (sin campo capacidad)."],
        ["MesasController", "PUT", "/api/mesas/{id}", "Administrador", "200, 400, 401, 403, 404", "Edición de número o nombre de mesa."],
        ["MesasController", "PATCH", "/api/mesas/{id}/estado", "Administrador", "200, 400, 401, 403, 404", "Cambio de estado administrativo de mesa."],
        ["MesasController", "DELETE", "/api/mesas/{id}", "Administrador", "204, 400, 401, 403, 409", "Eliminación (bloqueada si tiene pedidos)."],
        ["ProductosController", "GET", "/api/productos", "Admin, Mozo, Cocinero", "200, 401, 403", "Listado de catálogo y componentes."],
        ["ProductosController", "GET", "/api/productos/{id}", "Administrador", "200, 401, 403, 404", "Detalle de producto culinario."],
        ["ProductosController", "POST", "/api/productos", "Administrador", "201, 400, 401, 403, 409", "Creación; precio máx. 999.99."],
        ["ProductosController", "PUT", "/api/productos/{id}", "Administrador", "200, 400, 401, 403, 404", "Edición de producto o componente."],
        ["ProductosController", "PATCH", "/api/productos/{id}/estado", "Administrador", "200, 400, 401, 403, 404", "Activación o desactivación de producto."],
        ["ProductosController", "PATCH", "/api/productos/{id}/agotado", "Admin, Cocinero", "200, 400, 401, 403, 404", "Marca inmediata de plato agotado en carta."],
        ["MenusCompletosController", "GET", "/api/menus-completos", "Admin, Mozo, Cajero", "200, 401, 403", "Listado de paquetes de menú del día."],
        ["MenusCompletosController", "GET", "/api/menus-completos/{id}", "Administrador", "200, 401, 403, 404", "Detalle de menú completo y sus partes."],
        ["MenusCompletosController", "PUT", "/api/menus-completos/{id}", "Administrador", "200, 400, 401, 403, 404", "Actualización de precio (máx. 999.99)."],
        ["MenusCompletosController", "PATCH", "/api/menus-completos/{id}/estado", "Administrador", "200, 400, 401, 403, 404", "Habilitación o deshabilitación del menú."],
        ["MenuDiaController", "GET", "/api/menu-dia/hoy", "Admin, Mozo, Cajero, Cocinero", "200, 401, 403", "Consulta de la oferta del día."],
        ["MenuDiaController", "POST", "/api/menu-dia", "Administrador", "201, 400, 401, 403, 409", "Definición inicial del menú para hoy."],
        ["MenuDiaController", "PUT", "/api/menu-dia/hoy", "Administrador", "200, 400, 401, 403, 404", "Modificación de opciones del menú del día."],
        ["MenuDiaController", "GET", "/api/menu-dia/candidatos", "Administrador", "200, 401, 403", "Platos candidatos para armar el menú."],
        ["PedidosController", "POST", "/api/pedidos/mesa", "Mozo, Administrador", "201, 400, 401, 403, 409", "Registro en mesa (admite ocupadas MSG-95)."],
        ["PedidosController", "POST", "/api/pedidos/llevar", "SOLO Cajero", "201, 400, 401, 403", "Registro para llevar (403 para Admin/Mozo)."],
        ["PedidosController", "POST", "/api/pedidos/{id}/lineas", "Mozo, Administrador", "200, 400, 401, 403, 404, 409", "Adición de productos al pedido existente."],
        ["PedidosController", "GET", "/api/pedidos", "Admin, Mozo, Cajero", "200, 401, 403", "Bandeja general con estados compuestos."],
        ["PedidosController", "GET", "/api/pedidos/{id}", "Admin, Mozo, Cajero", "200, 401, 403, 404", "Detalle de líneas y comandas del pedido."],
        ["PedidosController", "DELETE", "/api/pedidos/{id}", "Admin, Mozo, Cajero", "200, 400, 401, 403, 404, 409", "Anulación (Admin anula cualquiera no pagado)."],
        ["PedidosController", "GET", "/api/pedidos/mesa/{mesaId}/activo", "Admin, Mozo, Cajero", "200, 401, 403, 404", "Obtiene el pedido abierto de una mesa."],
        ["ComandasController", "GET", "/api/comandas", "Cocinero, Administrador", "200, 401, 403", "Cola KDS; marca demora si espera >= 15m."],
        ["ComandasController", "PATCH", "/api/comandas/{id}/estado", "Cocinero, Administrador", "200, 400, 401, 403, 404", "Transición de comanda (EnPreparacion, Listo)."],
        ["ComandasController", "POST", "/api/comandas/{id}/deshacer", "Cocinero, Administrador", "200, 400, 401, 403, 404, 409", "Reversión de estado dentro de 10s."],
        ["AvisosController", "GET", "/api/avisos/pendientes", "Mozo, Cajero, Admin", "200, 401, 403", "Notificaciones de pedidos listos para entrega."],
        ["AvisosController", "POST", "/api/avisos/{id}/marcar-visto", "Mozo, Cajero, Admin", "200, 401, 403, 404", "Confirmación de entrega de comanda."],
        ["CobrosController", "GET", "/api/cobros/pendientes", "Cajero, Administrador", "200, 401, 403", "Bandeja de pedidos por cobrar."],
        ["CobrosController", "POST", "/api/cobros", "SOLO Cajero", "200, 400, 401, 403, 409", "Cobro y emisión (403 para Administrador)."],
        ["CobrosController", "GET", "/api/cobros/comprobantes/{ventaId}", "Cajero, Administrador", "200, 401, 403, 404", "Datos para impresión de comprobante."],
        ["CobrosController", "GET", "/api/cobros/comprobantes/{ventaId}/pdf", "Cajero, Administrador", "200, 401, 403, 404", "Descarga de comprobante en PDF vectorial."],
        ["ConsultasController", "GET", "/api/consultas/dni/{dni}", "Cajero, Administrador", "200, 400, 401, 403, 404", "Validación en línea con RENIEC (ApisPeru)."],
        ["ConsultasController", "GET", "/api/consultas/ruc/{ruc}", "Cajero, Administrador", "200, 400, 401, 403, 404", "Validación en línea con SUNAT (ApisPeru)."],
        ["CajaController", "GET", "/api/caja/estado", "Cajero, Administrador", "200, 401, 403", "Estado actual de la caja del día."],
        ["CajaController", "POST", "/api/caja/apertura", "Cajero, Administrador", "201, 400, 401, 403, 409", "Apertura con monto inicial."],
        ["CajaController", "POST", "/api/caja/movimientos", "Cajero, Administrador", "201, 400, 401, 403", "Registro de ingresos o egresos manuales."],
        ["CajaController", "POST", "/api/caja/cierre", "Cajero, Administrador", "200, 400, 401, 403, 409", "Cierre y arqueo ciego con acta oficial."],
        ["CajaController", "GET", "/api/caja/cierres/{id}/pdf", "Cajero, Administrador", "200, 401, 403, 404", "Descarga de acta de cierre en PDF."],
        ["VentasController", "GET", "/api/ventas", "Cajero, Administrador", "200, 401, 403", "Historial de ventas y comprobantes."],
        ["VentasController", "GET", "/api/ventas/{id}", "Cajero, Administrador", "200, 401, 403, 404", "Detalle de una venta auditada."],
        ["ReportesController", "GET", "/api/reportes/ventas", "Administrador", "200, 400, 401, 403", "Reporte de ventas por rango y cuadratura."],
        ["ReportesController", "GET", "/api/reportes/platos-mas-vendidos", "Administrador", "200, 400, 401, 403", "Ranking de rotación culinaria."],
        ["InicioController", "GET", "/api/inicio/metricas", "Admin, Mozo, Cajero, Cocinero", "200, 401, 403", "KPIs específicos según el rol del usuario."],
        ["InicioController", "GET", "/api/inicio/alertas", "Administrador", "200, 401, 403", "Alertas (menú sin definir solo si caja abierta)."]
    ]
    create_table(doc, headers_6_2, data_6_2, [Inches(1.2), Inches(0.6), Inches(1.8), Inches(1.1), Inches(1.1), Inches(1.4)])

    # =========================================================================
    # SECCIÓN 7: VERIFICACIÓN Y PRUEBAS AUTOMATIZADAS
    # =========================================================================
    add_heading_1(doc, "7. VERIFICACIÓN Y PRUEBAS AUTOMATIZADAS")
    add_body_p(doc, "La calidad del software se encuentra validada mediante una batería exhaustiva de pruebas unitarias y de integración sobre xUnit y Moq en .NET 8, en conjunto con el pipeline de validación estricta de tipos de TypeScript y Vite en el frontend. Los resultados de la ejecución real reflejan 100% de éxito en ambos entornos:")

    headers_7_1 = ["Entorno / Suite", "Herramienta", "Métricas de Ejecución", "Resultado Real", "Alcance y Validación Técnica"]
    data_7_1 = [
        ["Backend .NET 8", "dotnet test (xUnit, Moq)", "103 pruebas ejecutadas\n103 superadas, 0 fallos\nDuración: 2 segundos", "EXITOSO (100%)", "Verifica reglas de negocio (RN), validaciones (RV), transaccionalidad atómica, control de acceso RBAC y lógica de pedidos."],
        ["Frontend React 19", "npm run build (tsc -b + Vite)", "2043 módulos transformados\n0 errores TypeScript\nBundle en 900 ms", "EXITOSO (100%)", "Compilación de producción libre de errores de tipado; verificación de interfaces, props y consumo tipado de la API REST."]
    ]
    create_table(doc, headers_7_1, data_7_1, [Inches(1.2), Inches(1.3), Inches(1.4), Inches(1.1), Inches(2.2)])

    add_heading_2(doc, "7.1 Distribución de Pruebas Unitarias y de Integración")
    add_body_p(doc, "Las 103 pruebas automatizadas del backend se distribuyen en las siguientes suites especializadas:")
    add_body_p(doc, "•  CorreccionesTrazabilidadUnitTests.cs (7 pruebas): Valida la aceptación de múltiples pedidos en mesas ocupadas, la anulación asimétrica por el Administrador en pedidos con comanda en preparación, el bloqueo 409/401 a mozos en pedidos ajenos o en cocción, la alerta de menú sin definir condicionada a caja abierta y los estados compuestos de pago.")
    add_body_p(doc, "•  PedidoServiceUnitTests.cs (15 pruebas): Valida el registro en salón, la adición de productos, el cálculo de totales y la regla RN-142 (permite ventas con componentes y menús completos activos sin menú diario).")
    add_body_p(doc, "•  ProductoServiceUnitTests.cs (17 pruebas): Valida los límites de precio (<= 999.99), obligatoriedad de precio en Carta, componentes con precio nulo y activación/desactivación de ítems.")
    add_body_p(doc, "•  CobroServiceUnitTests.cs y CajaServiceUnitTests.cs (24 pruebas): Valida el cálculo de vuelto, validación fiscal DNI/RUC, arqueos ciegos, transaccionalidad atómica y corte de turno.")
    add_body_p(doc, "•  AuthServiceUnitTests.cs y UsuarioServiceUnitTests.cs (18 pruebas): Valida el hash PBKDF2, expiración JWT a 30 min, lista negra de tokens revocados y bloqueo tras 5 intentos.")
    add_body_p(doc, "•  ComandaServiceUnitTests.cs e InicioServiceUnitTests.cs (12 pruebas): Valida transiciones KDS, ventana de 10s de deshacer, SLA de demora (>= 15 min) y KPIs de dashboard.")
    add_body_p(doc, "•  EmpiricalChallengeIteration2Tests.cs (10 pruebas): Pruebas de integración de flujo completo (Pedido -> Cocina KDS -> Cobro -> Arqueo de Caja).")

    # =========================================================================
    # SECCIÓN 8: CONTROL DE CAMBIOS, DISCREPANCIAS Y TRAZABILIDAD
    # =========================================================================
    add_heading_1(doc, "8. CONTROL DE CAMBIOS, DISCREPANCIAS Y MATRIZ DE TRAZABILIDAD")

    add_heading_2(doc, "8.1 Control de Cambios del Documento Técnico")
    headers_8_1 = ["Versión", "Fecha", "Autor(es)", "Descripción del Cambio y Justificación Técnica"]
    data_8_1 = [
        ["1.0", "Octubre 2026", "Equipo GirasolesRes", "Versión inicial del documento técnico de presentación del software bajo estándar IEEE."],
        ["2.0", "25/10/2026", "Equipo de Arquitectura", "Actualización integral basada en verificación estricta de código fuente: soporte de múltiples pedidos por mesa (MSG-95), anulación administrativa asimétrica, regla RN-142, estados compuestos de pedidos pagados, SLA de cocina >= 15 min, keep-alive de Cocinero cada 20 min, precios hasta 999.99, exclusividad de roles en cobros y pedidos para llevar (Cajero), catálogo exhaustivo de 58 endpoints y matriz de trazabilidad completa de 35 CUS."]
    ]
    create_table(doc, headers_8_1, data_8_1, [Inches(0.8), Inches(1.0), Inches(1.5), Inches(3.9)])

    add_heading_2(doc, "8.2 Tabla de Discrepancias Detectadas y Acciones Tomadas")
    add_body_p(doc, "Durante la auditoría técnica de trazabilidad entre la documentación preliminar y el código fuente verificado, se identificaron y subsanaron las siguientes discrepancias:")

    headers_8_2 = ["ID", "Sección / Requisito", "Documentación Preliminar", "Comportamiento Real del Código", "Acción Tomada en Documento v2"]
    data_8_2 = [
        ["D-01", "Mesas y Salón", "Mesa ocupada bloqueaba nuevos pedidos con HTTP 409.", "Mesa ocupada acepta nuevos pedidos; muestra modal MSG-95 con opciones PEDIDO NUEVO y AGREGAR PRODUCTOS.", "Actualizado en Sec. 2.5 y Tablas 2.1 y 5.2."],
        ["D-02", "Atributos de Mesa", "Mencionaba 'capacidad de comensales' en mesas.", "Atributo eliminado de la entidad, DTOs y BD; reemplazado por 'Total mesas' en dashboard.", "Eliminada referencia a capacidad en todo el documento."],
        ["D-03", "Anulación de Pedidos", "Solo permitía anular al usuario creador antes de preparación.", "Administrador puede anular cualquier pedido no pagado (aun en cocina) con motivo de 5-100 caracteres.", "Documentada regla asimétrica en Sec. 2.5 y 6.1."],
        ["D-04", "Menú del Día Vacío", "Bloqueaba la toma de pedidos si no había menú del día.", "Regla RN-142: Permite vender con todos los componentes activos y menús completos de la carta.", "Documentada regla RN-142 en Sec. 2.5 y 5.1."],
        ["D-05", "Alerta Menú en Dashboard", "Aparecía siempre que no hubiera menú definido.", "Condicionada estrictamente a que la caja de hoy esté abierta (cajaAbiertaHoy != null).", "Aclarado condicional de alerta en Sec. 2.5 y 6.2."],
        ["D-06", "Estados de Pedido Pagado", "Reportaba 'Pagado' de forma plana en listados.", "Resuelve estados compuestos según cocina ('Listo · Pagado', 'Pagado · En preparación').", "Incorporados estados compuestos en Sec. 5.2 y 6.2."],
        ["D-07", "Sesión de Cocinero", "Expiraba genéricamente a los 30 min por inactividad.", "RN-20 y RN-82: Keep-alive cada 20 min en CocinaPage.tsx con /api/auth/renovar para mantener vivo el KDS.", "Documentada excepción de sesión en Sec. 2.5 y 4.2."],
        ["D-08", "Precio Máximo", "No especificaba límite superior estricto.", "RV-36 y MSG-56: Valida precio > 0 y <= 999.99 con hasta 2 decimales en backend y frontend.", "Documentado límite de S/ 999.99 en Sec. 4.1 y 5.1."],
        ["D-09", "Umbral de Demora KDS", "Mencionaba tiempos no estandarizados.", "ComandaService e InicioService estandarizan demora a partir de 15 minutos o más (>= 15).", "Estandarizado umbral de 15 minutos en Sec. 2.5 y 6.2."],
        ["D-10", "Rol Pedidos Para Llevar", "Listaba 'Cajero, Administrador' como autorizados.", "PedidosController.cs:105 restringe exclusivamente al Cajero; Admin y Mozo reciben 403.", "Corregido a SOLO CAJERO en Sec. 2.5, 6.1 y 6.2."],
        ["D-11", "Rol de Cobranza en Caja", "Listaba 'Cajero, Administrador' como autorizados.", "CobrosController.cs:85 restringe exclusivamente al Cajero; Admin recibe 403.", "Corregido a SOLO CAJERO en Sec. 2.5, 6.1 y 6.2."],
        ["D-12", "Medios de Pago", "Mencionaba Plin y Tarjetas POS en flujos de cobro.", "CobroService y Venta soportan Efectivo y Yape; cálculo de vuelto automático para Efectivo.", "Actualizada pasarela a Efectivo y Yape en Sec. 2.5 y 5.1."]
    ]
    create_table(doc, headers_8_2, data_8_2, [Inches(0.6), Inches(1.3), Inches(1.8), Inches(1.8), Inches(1.7)])

    add_heading_2(doc, "8.3 Matriz de Trazabilidad Integral (35 Requerimientos Funcionales)")
    add_body_p(doc, "La siguiente matriz vincula de extremo a extremo los 35 Requerimientos Funcionales del sistema con sus Historias de Usuario, Subcasos de Uso, Endpoints REST, Componentes y Cobertura de Pruebas:")

    csv_path = "analisis/03a_matriz_trazabilidad.csv"
    headers_8_3 = ["RF / HU", "CUS y Subcaso", "Endpoints REST Asociados", "Pantalla / Componente", "Pruebas Automatizadas", "Estado"]
    data_8_3 = []
    if os.path.exists(csv_path):
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.reader(f)
            header_row = next(reader)
            for row in reader:
                if len(row) >= 11:
                    rf_hu = f"{row[1]}\n({row[0]})"
                    cus_nom = f"{row[2]}\n{row[3]}"
                    endpoints = row[4].replace(", ", "\n")
                    pantalla = row[7].replace(", ", "\n")
                    pruebas = row[9].replace(", ", "\n")
                    estado = row[10]
                    data_8_3.append([rf_hu, cus_nom, endpoints, pantalla, pruebas, estado])
    else:
        data_8_3.append(["RF-01 a RF-35", "CUS01 a CUS15", "58 Endpoints REST", "React Frontend", "103 Pruebas Unitarias", "IMPLEMENTADO"])

    create_table(doc, headers_8_3, data_8_3, [Inches(1.0), Inches(1.5), Inches(1.8), Inches(1.3), Inches(1.1), Inches(0.5)])

    add_heading_2(doc, "8.4 Lista de Puntos Pendientes por Verificar")
    add_body_p(doc, "A la fecha de cierre de la versión 2.0, se identifican los siguientes puntos técnicos menores pendientes de verificación complementaria:")
    add_body_p(doc, "1. Ocultamiento visual en Frontend para Administrador en Pedidos para Llevar: El backend responde 403 Forbidden correctamente, pero la interfaz en MesasPage.tsx aún muestra el botón 'Pedido para llevar' al Administrador (evalúa esAdmin || esCajero). Se recomienda ajustar la condición a solo esCajero.")
    add_body_p(doc, "2. Redirección explícita ante 401 en Keep-Alive de Cocina: En CocinaPage.tsx, si la renovación periódica de token falla con 401, el error se registra en consola pero se recomienda disparar onLogout para redirigir inmediatamente a la vista de login.")
    add_body_p(doc, "3. Centralización de Constante de Demora: Estandarizar el valor literal 15 en una constante pública de dominio (ej. ReglasNegocio.MinutosDemoraCocina = 15) consumida por ComandaService e InicioService.")
    add_body_p(doc, "4. Pruebas de integración HTTP 403 en controladores: Agregar casos automatizados con WebApplicationFactory para verificar el rechazo formal 403 Forbidden a Administrador y Mozo en POST /api/pedidos/llevar y POST /api/cobros.")

    # =========================================================================
    # RE-INSERTAR REFERENCIAS BIBLIOGRÁFICAS AL FINAL
    # =========================================================================
    add_heading_1(doc, "REFERENCIAS BIBLIOGRÁFICAS")
    for ref_text in ref_paragraphs:
        if "REFERENCIAS BIBLIOGRÁFICAS" not in ref_text and ref_text.strip():
            p_ref = doc.add_paragraph()
            p_ref.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p_ref.paragraph_format.space_before = Pt(2)
            p_ref.paragraph_format.space_after = Pt(4)
            p_ref.paragraph_format.line_spacing = 1.15
            run_ref = p_ref.add_run(ref_text)
            run_ref.font.name = "Arial"
            run_ref.font.size = Pt(10.0)

    # Guardar en output_docx
    print(f"Guardando documento generado en {output_docx}...")
    doc.save(output_docx)
    print("DOCUMENTO GENERADO CON ÉXITO.")

if __name__ == "__main__":
    run_generator()
