# Updated script with robust detection logic
import json, re
from pathlib import Path

ROOT = Path(r"e:/Downloads/GirasolesRes/analisis/docs_md")
EXCLUDE = {"DOCUMENTO_TECNICO_GIRASOLESRES_IEEE.md"}

EXPECTED = {
    "hu": 35,
    "rf": 35,
    "cus": 35,
    "rv": 176,
    "rn": 149,
    "rnf": 62,
    "msg": 228,
    "e": 423,
}

definitions = {cat: {} for cat in EXPECTED}

def current_heading(lines, idx):
    for j in range(idx - 1, -1, -1):
        line = lines[j].strip()
        if line.startswith("#"):
            return line.lstrip("# ").strip()
    return ""

def parse_table(block):
    rows = []
    for line in block:
        if re.match(r"^\s*\|?\s*-{3,}\s*\|", line):
            continue
        cols = [c.strip() for c in line.strip("|\n").split("|")]
        rows.append(cols)
    return rows

# Stage 1 – collect definitions
for md_path in ROOT.rglob("*.md"):
    if md_path.name in EXCLUDE:
        continue
    lines = md_path.read_text(encoding="utf-8", errors="ignore").splitlines()
    i = 0
    while i < len(lines):
        if lines[i].strip().startswith("|"):
            block_start = i
            block = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                block.append(lines[i])
                i += 1
            header = [c.strip().lower() for c in block[0].strip("|\n").split("|")]
            if any(col in {"antes", "ahora"} for col in header):
                continue
            rows = parse_table(block[1:])
            # HU definitions (specific file)
            if md_path.name == "Historias_de_Usuario_35RF_35HU_Girasoles.md":
                needed = {"actor", "como", "quiero", "para", "rf de origen", "prioridad", "validación moscow"}
                if needed.intersection(set(header)):
                    hu_id = None
                    for k in range(block_start - 1, max(block_start - 10, -1), -1):
                        m = re.search(r"HU[-\s]?\d+", lines[k], re.IGNORECASE)
                        if m:
                            hu_id = m.group(0).replace(" ", "-").upper()
                            break
                    heading = current_heading(lines, block_start)
                    if hu_id:
                        for row in rows:
                            definitions["hu"][hu_id] = {
                                "id": hu_id,
                                "texto": f"{heading} | " + " | ".join(row),
                                "definido_en": f"{md_path.name}#{heading}",
                                "referenciado_en": []
                            }
                    continue
            # RF definitions – generic header match
            if {"código", "requerimiento", "actor", "hu", "prioridad"}.issubset(set(header)):
                for row in rows:
                    if not row:
                        continue
                    codigo = row[0]
                    definitions["rf"][codigo] = {
                        "id": codigo,
                        "texto": " | ".join(row),
                        "definido_en": md_path.name,
                        "referenciado_en": []
                    }
                continue
            # CUS definitions
            if any("cus" in h for h in header) and any("hu" in h for h in header) and any("rf" in h for h in header) and "prioridad" in header:
                cus_id = None
                for k in range(block_start - 1, max(block_start - 10, -1), -1):
                    m = re.search(r"Código:\s*(CUS\d+(?:\.\d+)?)", lines[k])
                    if m:
                        cus_id = m.group(1)
                        break
                if not cus_id and rows and rows[0] and re.fullmatch(r"CUS\d+(?:\.\d+)?", rows[0][0]):
                    cus_id = rows[0][0]
                heading = current_heading(lines, block_start)
                if cus_id:
                    for row in rows:
                        definitions["cus"][cus_id] = {
                            "id": cus_id,
                            "texto": f"{heading} | " + " | ".join(row),
                            "definido_en": f"{md_path.name}#{heading}",
                            "referenciado_en": []
                        }
                    continue
            # Código | Regla tables (RV, RN, RNF)
            if header and header[0] == "código" and len(header) > 1 and header[1] == "regla":
                for row in rows:
                    if not row:
                        continue
                    codigo = row[0]
                    cat = None
                    if codigo.upper().startswith("RV"):
                        cat = "rv"
                    elif codigo.upper().startswith("RNF"):
                        cat = "rnf"
                    elif codigo.upper().startswith("RN"):
                        cat = "rn"
                    else:
                        lname = md_path.name.lower()
                        if "rv" in lname:
                            cat = "rv"
                        elif "rnf" in lname:
                            cat = "rnf"
                        elif "rn" in lname:
                            cat = "rn"
                    if cat:
                        definitions[cat][codigo] = {
                            "id": codigo,
                            "texto": " | ".join(row),
                            "definido_en": md_path.name,
                            "referenciado_en": []
                        }
                continue
            # MSG definitions
            if header and header[0] == "código" and len(header) > 1 and header[1] == "mensaje":
                for row in rows:
                    if not row:
                        continue
                    codigo = row[0]
                    definitions["msg"][codigo] = {
                        "id": codigo,
                        "texto": " | ".join(row),
                        "definido_en": md_path.name,
                        "referenciado_en": []
                    }
                continue
            # Escenarios E
            if header and header[0] == "id":
                for row in rows:
                    if not row:
                        continue
                    if re.fullmatch(r"E-\d+", row[0]):
                        definitions["e"][row[0]] = {
                            "id": row[0],
                            "texto": " | ".join(row),
                            "definido_en": md_path.name,
                            "referenciado_en": []
                        }
                continue
        else:
            i += 1

# Stage 2 – references
id_patterns = {
    "hu": r"HU[-\s]?\d+",
    "rf": r"RF[-\s]?\d+",
    "cus": r"CUS\d+(?:\.\d+)?",
    "rv": r"RV[-\s]?\d+",
    "rn": r"RN[-\s]?\d+",
    "rnf": r"RNF[-\s]?\d+",
    "msg": r"MSG[-\s]?\d+",
    "e": r"E-\d+",
}
undefined_refs = set()

for md_path in ROOT.rglob("*.md"):
    if md_path.name in EXCLUDE:
        continue
    lines = md_path.read_text(encoding="utf-8", errors="ignore").splitlines()
    for idx, line in enumerate(lines):
        if line.strip().startswith("|"):
            continue
        for cat, pat in id_patterns.items():
            for m in re.finditer(pat, line, re.IGNORECASE):
                id_ = m.group(0).replace(" ", "-").upper()
                heading = current_heading(lines, idx)
                loc = f"{md_path.name}#{heading}" if heading else md_path.name
                if id_ in definitions[cat]:
                    definitions[cat][id_]["referenciado_en"].append(loc)
                else:
                    undefined_refs.add(id_)

# Write JSON
json_path = Path(r"e:/Downloads/GirasolesRes/analisis/inventario_definiciones.json")
json_path.write_text(json.dumps({cat: list(v.values()) for cat, v in definitions.items()}, ensure_ascii=False, indent=2), encoding="utf-8")

# Markdown summary
lines = []
lines.append("| Tipo | Definidas | Esperado | OK |")
lines.append("|------|-----------|----------|----|")
for cat in EXPECTED:
    defined = len(definitions[cat])
    expected = EXPECTED[cat]
    ok = "✅" if defined == expected else f"❌ ({defined}/{expected})"
    lines.append(f"| {cat.upper()} | {defined} | {expected} | {ok} |")
if undefined_refs:
    lines.append("\n**IDs referenced but not defined:**")
    lines.append(", ".join(sorted(undefined_refs)))
only_defined = [id_ for cat in definitions for id_, rec in definitions[cat].items() if not rec["referenciado_en"]]
if only_defined:
    lines.append("\n**Defined IDs never referenced:**")
    lines.append(", ".join(sorted(only_defined)))
print("\n".join(lines))
