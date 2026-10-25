import sys, re
from pathlib import Path
from docx import Document
from docx.oxml.ns import qn
from docx.table import Table
from docx.text.paragraph import Paragraph

SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(r"e:\Downloads\GirasolesRes\docs")
DST = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(r"e:\Downloads\GirasolesRes\analisis\docs_md")
DST.mkdir(parents=True, exist_ok=True)

def cell_text(c):
    t = "<br>".join(p.text.strip() for p in c.paragraphs if p.text.strip())
    return t.replace("|", "\\|")

def table_md(t):
    rows = []
    for r in t.rows:
        seen, cells = set(), []
        for c in r.cells:              # evita repetir celdas combinadas
            if id(c._tc) in seen:
                continue
            seen.add(id(c._tc))
            cells.append(cell_text(c))
        rows.append(cells)
    if not rows:
        return ""
    n = max(len(r) for r in rows)
    rows = [r + [""] * (n - len(r)) for r in rows]
    out = ["| " + " | ".join(rows[0]) + " |", "|" + "---|" * n]
    out += ["| " + " | ".join(r) + " |" for r in rows[1:]]
    return "\n".join(out)

def convert(path):
    doc = Document(path)
    md, n_tables, n_heads = [], 0, 0
    for el in doc.element.body.iterchildren():
        if el.tag == qn("w:p"):
            p = Paragraph(el, doc)
            txt = p.text.strip()
            if not txt:
                continue
            style = p.style.name if p.style is not None else ""
            m = re.match(r"Heading (\d)", style)
            if m:
                md.append("\n" + "#" * int(m.group(1)) + " " + txt + "\n"); n_heads += 1
            elif "List" in style:
                md.append("- " + txt)
            else:
                md.append(txt)
        elif el.tag == qn("w:tbl"):
            n_tables += 1
            md.append("\n<!-- tabla %d -->\n%s\n" % (n_tables, table_md(Table(el, doc))))
    return "\n".join(md), n_tables, n_heads

print("%-90s %8s %9s %8s" % ("archivo", "tablas", "titulos", "lineas"))
for f in sorted(SRC.glob("*.docx")):
    if f.name.startswith("~$"):
        continue
    text, nt, nh = convert(f)
    (DST / (f.stem + ".md")).write_text(text, encoding="utf-8")
    print("%-90s %8d %9d %8d" % (f.name, nt, nh, text.count("\n")))