#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Automatización Documental: Conversión de Markdown a DOCX bajo Estándar IEEE y Calidad ISO/IEC 25010.
Proyecto: GirasolesRes - Restaurante Girasoles.
"""

import os
import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

MD_PATH = r"E:\Downloads\GirasolesRes\docs\DOCUMENTO_TECNICO_GIRASOLESRES_IEEE.md"
DOCX_PATH = r"E:\Downloads\GirasolesRes\docs\DOCUMENTO_TECNICO_GIRASOLESRES_IEEE.docx"

# Colores corporativos y académicos
COLOR_PRIMARY = RGBColor(0x3A, 0x22, 0x11)     # Marrón oscuro corporativo (#3A2211)
COLOR_SECONDARY = RGBColor(0xD3, 0x54, 0x00)   # Naranja cálido (#D35400)
COLOR_TEXT = RGBColor(0x22, 0x22, 0x22)        # Texto cuerpo (#222222)
COLOR_MUTED = RGBColor(0x7C, 0x6F, 0x66)       # Texto secundario (#7C6F66)
HEX_HEADER_BG = "3A2211"                        # Fondo cabecera tabla
HEX_ROW_ALT = "FAF7F4"                          # Fondo fila alterna
HEX_BOX_BG = "FBF9F7"                           # Fondo caja captura
HEX_BOX_BORDER = "C4B5A5"                       # Borde caja captura

def set_cell_background(cell, fill_hex):
    """Aplica color de fondo a una celda de tabla."""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=160, right=160):
    """Establece padding interno en dxa (1 pt = 20 dxa)."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_table_borders(table, color="D5CCC3", sz="4", val="single"):
    """Aplica bordes finos a una tabla."""
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'  <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def set_callout_box_borders(table, color="C4B5A5", sz="8", val="dashed"):
    """Aplica borde punteado/discontinuo a la caja de captura."""
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'  <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:insideH w:val="none"/>'
        f'  <w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def clean_inline_math(text):
    """Reemplaza secuencias matemáticas LaTeX simples por caracteres Unicode."""
    text = text.replace(r"$\ge$", "≥")
    text = text.replace(r"\ge", "≥")
    text = text.replace(r"$\rightarrow$", "→")
    text = text.replace(r"\rightarrow", "→")
    text = text.replace(r"$", "")
    return text

def add_formatted_runs(paragraph, text, base_font="Arial", base_size=Pt(11), default_color=COLOR_TEXT, base_italic=False):
    """
    Parsea tokens inline de Markdown (**negrita**, *cursiva*, `código`) y añade runs formateados.
    """
    text = clean_inline_math(text)
    
    # Expresión regular que detecta: `code`, **bold**, *italic*
    pattern = re.compile(r'(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)')
    tokens = pattern.split(text)
    
    for token in tokens:
        if not token:
            continue
        run = paragraph.add_run()
        run.font.name = base_font
        run.font.size = base_size
        run.font.color.rgb = default_color
        run.italic = base_italic
        
        if token.startswith("`") and token.endswith("`"):
            run.text = token[1:-1]
            run.font.name = "Consolas"
            run.font.size = Pt(base_size.pt - 1)
            run.font.color.rgb = RGBColor(0x8B, 0x3A, 0x1A)
        elif token.startswith("**") and token.endswith("**"):
            run.text = token[2:-2]
            run.bold = True
        elif token.startswith("*") and token.endswith("*"):
            run.text = token[1:-1]
            run.italic = True
        else:
            run.text = token

def build_cover_page(doc):
    """Construye la portada formal institucional de la Universidad Peruana Los Andes."""
    # Espaciado superior inicial
    p_init = doc.add_paragraph()
    p_init.paragraph_format.space_before = Pt(10)
    p_init.paragraph_format.space_after = Pt(4)
    p_init.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    run_univ = p_init.add_run("UNIVERSIDAD PERUANA LOS ANDES")
    run_univ.font.name = "Arial"
    run_univ.font.size = Pt(17)
    run_univ.bold = True
    run_univ.font.color.rgb = COLOR_PRIMARY

    p_fac = doc.add_paragraph()
    p_fac.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_fac.paragraph_format.space_after = Pt(2)
    run_fac = p_fac.add_run("FACULTAD DE INGENIERÍA")
    run_fac.font.name = "Arial"
    run_fac.font.size = Pt(13.5)
    run_fac.bold = True
    run_fac.font.color.rgb = COLOR_PRIMARY

    p_esc = doc.add_paragraph()
    p_esc.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_esc.paragraph_format.space_after = Pt(28)
    run_esc = p_esc.add_run("ESCUELA PROFESIONAL DE INGENIERÍA DE SISTEMAS Y COMPUTACIÓN")
    run_esc.font.name = "Arial"
    run_esc.font.size = Pt(11.5)
    run_esc.bold = True
    run_esc.font.color.rgb = COLOR_SECONDARY

    # Separador sutil
    p_sep = doc.add_paragraph()
    p_sep.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sep.paragraph_format.space_after = Pt(24)
    run_sep = p_sep.add_run("—" * 38)
    run_sep.font.color.rgb = RGBColor(0xD5, 0xCC, 0xC3)

    # Título principal del documento
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(10)
    run_title = p_title.add_run("DOCUMENTO TÉCNICO DE PRESENTACIÓN DEL SOFTWARE")
    run_title.font.name = "Arial"
    run_title.font.size = Pt(18)
    run_title.bold = True
    run_title.font.color.rgb = COLOR_PRIMARY

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(8)
    run_sub = p_sub.add_run("Software GirasolesRes para el Control de Venta del Restaurante Girasoles")
    run_sub.font.name = "Arial"
    run_sub.font.size = Pt(13.5)
    run_sub.bold = True
    run_sub.font.color.rgb = COLOR_SECONDARY

    p_norma = doc.add_paragraph()
    p_norma.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_norma.paragraph_format.space_after = Pt(36)
    run_norma = p_norma.add_run("Estructurado bajo el Modelo de Calidad ISO/IEC 25010 y Estándar IEEE")
    run_norma.font.name = "Arial"
    run_norma.font.size = Pt(11.5)
    run_norma.italic = True
    run_norma.font.color.rgb = COLOR_MUTED

    # Tabla formal de metadatos del proyecto
    tbl_meta = doc.add_table(rows=6, cols=2)
    tbl_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_meta, color="D5CCC3", sz="4", val="single")

    meta_data = [
        ("Proyecto:", "Sistema Web de Gestión Gastronómica, POS y Control Operativo (GirasolesRes)"),
        ("Autores:", "VILCAHUAMAN LOZANO, Alfonso Gabriel\nCHUQUI CONTRERAS, Jazztin William\nLOBATON ABREGU, Jhilmar Jaison\nSANTILLAN TRUJILLO, Brandon Kody\nCORONEL GUEVARA, Jack Yhems"),
        ("Institución:", "Universidad Peruana Los Andes – Facultad de Ingeniería"),
        ("Docente / Asesor:", "Ing. Jorge Alberto Vega Flores"),
        ("Versión / Estado:", "Versión 1.0 (Entorno de Producción)"),
        ("Fecha y Sede:", "Octubre 2026  |  Huancayo – Perú")
    ]

    col_widths = [Cm(4.5), Cm(11.5)]
    for i, (label, val) in enumerate(meta_data):
        row = tbl_meta.rows[i]
        
        # Celda Etiqueta
        c_label = row.cells[0]
        c_label.width = col_widths[0]
        set_cell_background(c_label, "F5EFE9")
        set_cell_margins(c_label, top=100, bottom=100, left=140, right=140)
        p_lbl = c_label.paragraphs[0]
        p_lbl.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p_lbl.paragraph_format.space_after = Pt(0)
        p_lbl.paragraph_format.line_spacing = 1.15
        r_lbl = p_lbl.add_run(label)
        r_lbl.font.name = "Arial"
        r_lbl.font.size = Pt(9.5)
        r_lbl.bold = True
        r_lbl.font.color.rgb = COLOR_PRIMARY

        # Celda Valor
        c_val = row.cells[1]
        c_val.width = col_widths[1]
        set_cell_background(c_val, "FFFFFF")
        set_cell_margins(c_val, top=100, bottom=100, left=140, right=140)
        p_val = c_val.paragraphs[0]
        p_val.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p_val.paragraph_format.space_after = Pt(0)
        p_val.paragraph_format.line_spacing = 1.15
        r_val = p_val.add_run(val)
        r_val.font.name = "Arial"
        r_val.font.size = Pt(9.5)
        r_val.font.color.rgb = COLOR_TEXT

    # Salto de página institucional
    doc.add_page_break()

def convert_md_to_docx():
    print(f"Leyendo archivo Markdown desde: {MD_PATH}")
    with open(MD_PATH, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    doc = Document()

    # 1. Configuración de Página A4 y Márgenes Estándar (2.54 cm)
    for section in doc.sections:
        section.page_width = Cm(21.0)
        section.page_height = Cm(29.7)
        section.top_margin = Cm(2.54)
        section.bottom_margin = Cm(2.54)
        section.left_margin = Cm(2.54)
        section.right_margin = Cm(2.54)

    # 2. Configurar Estilo Normal Base
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Arial'
    style_normal.font.size = Pt(11)
    style_normal.font.color.rgb = COLOR_TEXT
    style_normal.paragraph_format.line_spacing = 1.15
    style_normal.paragraph_format.space_after = Pt(6)
    style_normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # 3. Portada
    build_cover_page(doc)

    # 4. Procesamiento de Contenido
    # Omitimos la portada original del markdown y arrancamos desde el índice o contenido
    idx = 0
    total_lines = len(lines)

    # Buscamos dónde termina la portada del markdown original
    while idx < total_lines:
        line_clean = lines[idx].strip()
        if line_clean == "## ÍNDICE GENERAL":
            break
        idx += 1

    in_table = False
    table_lines = []
    current_table_title = None

    while idx < total_lines:
        raw_line = lines[idx]
        line = raw_line.rstrip('\r\n')
        sline = line.strip()

        # Detección de Tabla
        if sline.startswith("|") and sline.endswith("|"):
            in_table = True
            table_lines.append(sline)
            idx += 1
            continue
        elif in_table:
            # Fin de bloque de tabla detectado
            in_table = False
            render_word_table(doc, table_lines, current_table_title)
            table_lines = []
            current_table_title = None
            # Continuamos procesando la línea actual (no incrementamos idx)

        # Detección de Título de Tabla previo
        if sline.startswith("**TABLA ") or (sline.startswith("**TABLA") and "**" in sline):
            title_parts = [sline.replace("**", "").strip()]
            # Chequeamos si la siguiente línea es el subtítulo de la tabla
            if idx + 1 < total_lines and lines[idx + 1].strip().startswith("**"):
                idx += 1
                title_parts.append(lines[idx].strip().replace("**", "").strip())
            current_table_title = " — ".join(title_parts)
            idx += 1
            continue

        # Detección de Marcador de Captura de Figura
        # Formato: > `[INSERTAR CAPTURA AQUÍ: ...]`
        if sline.startswith(">") and "[INSERTAR CAPTURA AQUÍ:" in sline:
            # Extraemos la descripción del marcador
            match = re.search(r'\[INSERTAR CAPTURA AQUÍ:\s*([^\]]+)\]', sline)
            desc_placeholder = match.group(1).strip() if match else "Área designada para captura de pantalla"
            
            # Chequeamos si la siguiente línea es el pie de figura Fig. X.Y.
            caption_text = ""
            if idx + 1 < total_lines and "Fig." in lines[idx + 1]:
                idx += 1
                caption_line = lines[idx].strip().lstrip(">").strip()
                caption_text = caption_line
            elif idx + 2 < total_lines and "Fig." in lines[idx + 2]:
                idx += 2
                caption_line = lines[idx].strip().lstrip(">").strip()
                caption_text = caption_line

            render_figure_box(doc, desc_placeholder, caption_text)
            idx += 1
            continue

        # Líneas horizontales separadoras (---)
        if sline == "---":
            idx += 1
            continue

        # Saltos de línea vacíos
        if not sline:
            idx += 1
            continue

        # Encabezados de Títulos
        if sline.startswith("### "):
            title_text = sline[4:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(10)
            p.paragraph_format.space_after = Pt(3)
            p.paragraph_format.keep_with_next = True
            run = p.add_run(clean_inline_math(title_text))
            run.font.name = "Arial"
            run.font.size = Pt(11.5)
            run.bold = True
            run.font.color.rgb = COLOR_PRIMARY
            idx += 1
            continue

        elif sline.startswith("#### "):
            title_text = sline[5:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.keep_with_next = True
            run = p.add_run(clean_inline_math(title_text))
            run.font.name = "Arial"
            run.font.size = Pt(11)
            run.bold = True
            run.italic = True
            run.font.color.rgb = COLOR_PRIMARY
            idx += 1
            continue

        elif sline.startswith("##### "):
            title_text = sline[6:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(6)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.keep_with_next = True
            run = p.add_run(clean_inline_math(title_text))
            run.font.name = "Arial"
            run.font.size = Pt(10.5)
            run.bold = True
            run.font.color.rgb = COLOR_SECONDARY
            idx += 1
            continue

        elif sline.startswith("## "):
            title_text = sline[3:].strip()
            # Si es un capítulo principal (1., 2., 3., 4., REFERENCIAS) insertamos salto de página previo
            is_major_chapter = any(title_text.startswith(prefix) for prefix in ["1.", "2.", "3.", "4.", "REFERENCIAS"])
            if is_major_chapter:
                doc.add_page_break()

            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(14)
            p.paragraph_format.space_after = Pt(6)
            p.paragraph_format.keep_with_next = True
            run = p.add_run(clean_inline_math(title_text))
            run.font.name = "Arial"
            run.font.size = Pt(13.5)
            run.bold = True
            run.font.color.rgb = COLOR_PRIMARY
            idx += 1
            continue

        # Listas con Viñetas (- o *)
        if re.match(r'^[-*]\s+', sline):
            content = re.sub(r'^[-*]\s+', '', sline).strip()
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Cm(0.75)
            p.paragraph_format.first_line_indent = Cm(-0.45)
            p.paragraph_format.space_after = Pt(4)
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            run_bullet = p.add_run("•  ")
            run_bullet.bold = True
            run_bullet.font.color.rgb = COLOR_SECONDARY
            add_formatted_runs(p, content, base_size=Pt(10.5))
            idx += 1
            continue

        # Listas Numeradas (1. , 2. )
        m_num = re.match(r'^(\d+)\.\s+(.*)$', sline)
        if m_num:
            num_str = m_num.group(1)
            content = m_num.group(2)
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Cm(0.75)
            p.paragraph_format.first_line_indent = Cm(-0.50)
            p.paragraph_format.space_after = Pt(4)
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            run_num = p.add_run(f"{num_str}. ")
            run_num.bold = True
            run_num.font.color.rgb = COLOR_PRIMARY
            add_formatted_runs(p, content, base_size=Pt(10.5))
            idx += 1
            continue

        # Referencias Bibliográficas [X]
        if sline.startswith("- **[") or sline.startswith("**["):
            clean_ref = sline.lstrip("-").strip()
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Cm(1.0)
            p.paragraph_format.first_line_indent = Cm(-0.75)
            p.paragraph_format.space_after = Pt(6)
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            add_formatted_runs(p, clean_ref, base_size=Pt(10))
            idx += 1
            continue

        # Párrafo Normal de Texto
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(6)
        add_formatted_runs(p, sline, base_size=Pt(11))
        idx += 1

    # Si quedó alguna tabla al final
    if in_table and table_lines:
        render_word_table(doc, table_lines, current_table_title)

    # 5. Guardar documento
    doc.save(DOCX_PATH)
    print(f"Documento DOCX generado con éxito en:\n{DOCX_PATH}")

def render_figure_box(doc, placeholder_desc, caption_text):
    """Genera una caja visual demarcada para insertar la captura de pantalla y el pie de figura IEEE."""
    # Tabla contenedora 1x1
    box_table = doc.add_table(rows=1, cols=1)
    box_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_callout_box_borders(box_table, color=HEX_BOX_BORDER, sz="8", val="dashed")
    
    cell = box_table.cell(0, 0)
    cell.width = Cm(15.9)  # Ancho total del área imprimible A4
    set_cell_background(cell, HEX_BOX_BG)
    set_cell_margins(cell, top=260, bottom=260, left=200, right=200)

    p_cell = cell.paragraphs[0]
    p_cell.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cell.paragraph_format.space_after = Pt(4)

    run_icon = p_cell.add_run("📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]\n")
    run_icon.font.name = "Arial"
    run_icon.font.size = Pt(10)
    run_icon.bold = True
    run_icon.font.color.rgb = COLOR_PRIMARY

    run_desc = p_cell.add_run(f"Referencia visual requerida: {placeholder_desc}")
    run_desc.font.name = "Arial"
    run_desc.font.size = Pt(9.5)
    run_desc.italic = True
    run_desc.font.color.rgb = COLOR_MUTED

    # Pie de Figura IEEE debajo de la caja
    if caption_text:
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(4)
        p_cap.paragraph_format.space_after = Pt(12)
        p_cap.paragraph_format.keep_with_next = False
        
        # Parseamos negrita si contiene **Fig. X.Y.**
        clean_cap = caption_text.replace("**", "").strip()
        add_formatted_runs(p_cap, clean_cap, base_size=Pt(9.5), default_color=COLOR_PRIMARY, base_italic=False)

def render_word_table(doc, raw_lines, table_title=None):
    """Convierte líneas de tabla Markdown en una tabla real de Microsoft Word con formato IEEE."""
    if not raw_lines:
        return

    # Parsear filas y celdas
    parsed_rows = []
    for line in raw_lines:
        # Ignorar línea divisoria | :--- | :--- |
        if re.match(r'^\s*\|?\s*:?-+:?\s*(\|?\s*:?-+:?\s*)+\|?\s*$', line):
            continue
        cells = [c.strip() for c in line.strip().strip('|').split('|')]
        parsed_rows.append(cells)

    if not parsed_rows:
        return

    num_rows = len(parsed_rows)
    num_cols = max(len(r) for r in parsed_rows)

    # Título IEEE de la Tabla encima de la misma
    if table_title:
        p_title = doc.add_paragraph()
        p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_title.paragraph_format.space_before = Pt(12)
        p_title.paragraph_format.space_after = Pt(4)
        p_title.paragraph_format.keep_with_next = True
        run_t = p_title.add_run(table_title)
        run_t.font.name = "Arial"
        run_t.font.size = Pt(10)
        run_t.bold = True
        run_t.font.color.rgb = COLOR_PRIMARY

    # Crear tabla Word
    table = doc.add_table(rows=num_rows, cols=num_cols)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table, color="D5CCC3", sz="4", val="single")

    total_width_cm = 15.9
    col_width_cm = total_width_cm / num_cols

    for r_idx, row_data in enumerate(parsed_rows):
        row = table.rows[r_idx]
        is_header = (r_idx == 0)

        for c_idx in range(num_cols):
            cell = row.cells[c_idx]
            cell.width = Cm(col_width_cm)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER

            # Contenido de celda
            cell_text = row_data[c_idx] if c_idx < len(row_data) else ""
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.15
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT

            if is_header:
                set_cell_background(cell, HEX_HEADER_BG)
                set_cell_margins(cell, top=140, bottom=140, left=160, right=160)
                add_formatted_runs(p, cell_text, base_size=Pt(9.5), default_color=RGBColor(0xFF, 0xFF, 0xFF))
                for run in p.runs:
                    run.bold = True
            else:
                bg = HEX_ROW_ALT if (r_idx % 2 == 1) else "FFFFFF"
                set_cell_background(cell, bg)
                set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
                add_formatted_runs(p, cell_text, base_size=Pt(9.0), default_color=COLOR_TEXT)

    # Espacio después de la tabla
    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(2)
    p_after.paragraph_format.space_after = Pt(8)

if __name__ == "__main__":
    convert_md_to_docx()
