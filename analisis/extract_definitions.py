import os
import re
import json
import glob
from pathlib import Path

DOCS_MD_DIR = Path(r"e:\Downloads\GirasolesRes\analisis\docs_md")
OUTPUT_JSON = Path(r"e:\Downloads\GirasolesRes\analisis\inventario_definiciones.json")

# Regex patterns
P_DEF_ID = re.compile(r"^(RNF|RN|RV|MSG)-(\d+)(-[A-Z])?$")
P_E_ID = re.compile(r"^E-(\d+)$")

# Match all single references:
P_REF_SINGLE = re.compile(r"\b(RNF|RN|RV|MSG)-(\d+)(-[A-Z])?\b|\b(E)-(\d+)\b|\b(CUS\d+(?:\.\d+)?)\b|\b(RF-\d+)\b|\b(HU\d+)\b")

# Match range references:
P_RANGE = re.compile(r"\b(RNF|RN|RV|MSG|E)-(\d+)\s+a\s+(?:(RNF|RN|RV|MSG|E)-)?(\d+)\b")

def format_id_num(prefix, num):
    if num < 10:
        return f"{prefix}-0{num}"
    return f"{prefix}-{num}"

def run_extraction():
    definitions = {}
    
    # 1. Process Historias_de_Usuario_35RF_35HU_Girasoles.md for HU and RF
    hu_rf_file = DOCS_MD_DIR / "Historias_de_Usuario_35RF_35HU_Girasoles.md"
    with open(hu_rf_file, encoding="utf-8") as f:
        hu_rf_lines = [l.rstrip("\r\n") for l in f]

    # Extract RF
    in_rf = False
    for line in hu_rf_lines:
        row = [c.strip() for c in line.split("|")[1:-1]]
        if not row:
            in_rf = False
            continue
        if len(row) >= 5 and row[0] == "Código" and row[1] == "Requerimiento" and row[3] == "HU":
            in_rf = True
            continue
        if in_rf:
            if row[0].startswith("RF-"):
                rf_id = row[0]
                rf_text = " | ".join(row[1:])
                definitions[rf_id] = {
                    "id": rf_id,
                    "texto": rf_text,
                    "definido_en": f"{hu_rf_file.name}#Tabla_RF",
                    "referenciado_en": set()
                }

    # Extract HU
    for i, line in enumerate(hu_rf_lines):
        m = re.match(r"^(HU\d+)\s*[·•-]\s*(.*)", line.strip())
        if m:
            hid = m.group(1)
            htitle = m.group(2).strip()
            # check if subsequent table has 'RF de origen'
            found_rf_origen = False
            table_lines = []
            for j in range(i + 1, min(i + 20, len(hu_rf_lines))):
                if hu_rf_lines[j].startswith("|"):
                    table_lines.append(hu_rf_lines[j])
                    if "RF de origen" in hu_rf_lines[j]:
                        found_rf_origen = True
                elif table_lines and not hu_rf_lines[j].strip():
                    break
            if found_rf_origen:
                # Build text
                hu_text = htitle
                row_dict = {}
                for tl in table_lines:
                    cols = [c.strip() for c in tl.split("|")[1:-1]]
                    if len(cols) >= 2 and cols[0] not in ("---", ""):
                        row_dict[cols[0]] = cols[1]
                if row_dict:
                    hu_text = f"{htitle} | " + " | ".join(f"{k}: {v}" for k, v in row_dict.items() if not k.startswith("-"))
                definitions[hid] = {
                    "id": hid,
                    "texto": hu_text,
                    "definido_en": f"{hu_rf_file.name}#{hid}",
                    "referenciado_en": set()
                }

    # 2. Process all other annex files for CUS subcases, RV, RN, RNF, MSG, E
    annex_files = sorted([f for f in DOCS_MD_DIR.glob("*.md") if f.name not in ("DOCUMENTO_TECNICO_GIRASOLESRES_IEEE.md", "Historias_de_Usuario_35RF_35HU_Girasoles.md")])
    
    # Track which table lines belong to definitions so we don't treat them as references
    # (file_name, line_index) -> set of def IDs defined there
    def_lines_by_file = {f.name: set() for f in [hu_rf_file] + annex_files}

    for fpath in annex_files:
        with open(fpath, encoding="utf-8") as f:
            lines = [l.rstrip("\r\n") for l in f]

        in_regla_table = False
        in_msg_table = False
        in_e_table = False

        for l_idx, line in enumerate(lines):
            # Check CUS subcase template: | Código: CUSxx.x | Título: ... |
            m_cus = re.search(r"Código:\s*(CUS\d+\.\d+)\s*\|\s*Título:\s*([^|]+)", line)
            if m_cus:
                cus_id = m_cus.group(1)
                cus_title = m_cus.group(2).strip()
                definitions[cus_id] = {
                    "id": cus_id,
                    "texto": f"{cus_title} | {line.strip()}",
                    "definido_en": f"{fpath.name}#{cus_id}",
                    "referenciado_en": set()
                }
                def_lines_by_file[fpath.name].add(l_idx)
                continue

            row = [c.strip() for c in line.split("|")[1:-1]]
            if not row:
                in_regla_table = False
                in_msg_table = False
                in_e_table = False
                continue

            # Exclude correspondence tables (Elemento | Antes | Ahora | Motivo)
            if "Antes" in row or "Ahora" in row:
                in_regla_table = False
                in_msg_table = False
                in_e_table = False
                continue

            # Check table headers
            if len(row) >= 2 and row[0] == "Código":
                if row[1].startswith("Regla"):
                    in_regla_table = True
                    in_msg_table = False
                    in_e_table = False
                    continue
                elif row[1].startswith("Mensaje"):
                    in_msg_table = True
                    in_regla_table = False
                    in_e_table = False
                    continue
            if len(row) >= 1 and row[0] == "ID":
                in_e_table = True
                in_regla_table = False
                in_msg_table = False
                continue

            if in_regla_table:
                cid = row[0]
                m_match = P_DEF_ID.match(cid)
                if m_match:
                    def_lines_by_file[fpath.name].add(l_idx)
                    definitions[cid] = {
                        "id": cid,
                        "texto": " | ".join(row[1:]),
                        "definido_en": f"{fpath.name}#{cid}",
                        "referenciado_en": set()
                    }
            elif in_msg_table:
                cid = row[0]
                m_match = P_DEF_ID.match(cid)
                if m_match and cid.startswith("MSG-"):
                    def_lines_by_file[fpath.name].add(l_idx)
                    definitions[cid] = {
                        "id": cid,
                        "texto": " | ".join(row[1:]),
                        "definido_en": f"{fpath.name}#{cid}",
                        "referenciado_en": set()
                    }
            elif in_e_table:
                cid = row[0]
                if P_E_ID.match(cid):
                    def_lines_by_file[fpath.name].add(l_idx)
                    definitions[cid] = {
                        "id": cid,
                        "texto": " | ".join(row[1:]),
                        "definido_en": f"{fpath.name}#{cid}",
                        "referenciado_en": set()
                    }

    # 3. Now collect references across all files
    # Exclude:
    # - The exact definition line of an ID
    # - Correspondence tables (Antes / Ahora) and columns "Antes"
    all_files = [hu_rf_file] + annex_files
    referenced_unknown = set()

    for fpath in all_files:
        with open(fpath, encoding="utf-8") as f:
            lines = [l.rstrip("\r\n") for l in f]

        in_corresp_table = False

        for l_idx, line in enumerate(lines):
            row = [c.strip() for c in line.split("|")[1:-1]]
            if not row:
                in_corresp_table = False
            else:
                if "Antes" in row or "Ahora" in row:
                    in_corresp_table = True
                    continue

            # If in correspondence table, ignore the entire row (contains historical 'Antes')
            if in_corresp_table:
                continue

            # Check if this line is a definition line in this file
            is_def_line = l_idx in def_lines_by_file[fpath.name]

            # Collect references from this line
            line_refs = set()

            # 1. Ranges
            for m in P_RANGE.finditer(line):
                prefix1, start_str, prefix2, end_str = m.groups()
                prefix = prefix1
                start, end = int(start_str), int(end_str)
                if start <= end and (end - start) < 400:
                    for num in range(start, end + 1):
                        rid = format_id_num(prefix, num)
                        line_refs.add(rid)

            # 2. Singles
            for m in P_REF_SINGLE.finditer(line):
                # groups:
                # 1: RNF|RN|RV|MSG, 2: digits, 3: suffix
                # 4: E, 5: digits
                # 6: CUS
                # 7: RF
                # 8: HU
                if m.group(1):
                    suffix = m.group(3) or ""
                    num = int(m.group(2))
                    rid = f"{m.group(1)}-{m.group(2)}{suffix}"
                    line_refs.add(rid)
                elif m.group(4):
                    rid = f"E-{m.group(5)}"
                    line_refs.add(rid)
                elif m.group(6):
                    line_refs.add(m.group(6))
                elif m.group(7):
                    line_refs.add(m.group(7))
                elif m.group(8):
                    line_refs.add(m.group(8))

            # Now record references
            ref_location = f"{fpath.name}:L{l_idx+1}"
            for rid in line_refs:
                if rid in definitions:
                    # If this line is the definition line of `rid`, do NOT add as reference
                    # Check if rid was defined at this line
                    def_loc = definitions[rid]["definido_en"]
                    if def_loc.startswith(fpath.name) and is_def_line:
                        # If the line defines `rid`, check if rid matches row[0]
                        if row and row[0] == rid:
                            continue
                        if f"Código: {rid}" in line:
                            continue
                        if f"{rid} ·" in line:
                            continue
                    definitions[rid]["referenciado_en"].add(ref_location)
                else:
                    # Ignore pure CUS whole numbers like CUS01 (since subcases are CUS01.1) unless specified
                    # Or record them in referenced_unknown
                    referenced_unknown.add(rid)

    # Convert sets to sorted lists for JSON serialization
    json_output = {
        "hu": [],
        "rf": [],
        "cus": [],
        "rv": [],
        "rn": [],
        "rnf": [],
        "msg": [],
        "e": []
    }

    counts = {
        "HU": 0,
        "RF": 0,
        "CUS": 0,
        "RV": 0,
        "RN": 0,
        "RNF": 0,
        "MSG": 0,
        "E": 0
    }

    defined_unreferenced = []

    for item_id, item_data in sorted(definitions.items(), key=lambda x: x[0]):
        item_obj = {
            "id": item_data["id"],
            "texto": item_data["texto"],
            "definido_en": item_data["definido_en"],
            "referenciado_en": sorted(list(item_data["referenciado_en"]))
        }
        if len(item_obj["referenciado_en"]) == 0:
            defined_unreferenced.append(item_id)

        if item_id.startswith("HU"):
            json_output["hu"].append(item_obj)
            counts["HU"] += 1
        elif item_id.startswith("RF"):
            json_output["rf"].append(item_obj)
            counts["RF"] += 1
        elif item_id.startswith("CUS"):
            json_output["cus"].append(item_obj)
            counts["CUS"] += 1
        elif item_id.startswith("RNF-"):
            json_output["rnf"].append(item_obj)
            counts["RNF"] += 1
        elif item_id.startswith("RN-"):
            json_output["rn"].append(item_obj)
            counts["RN"] += 1
        elif item_id.startswith("RV-"):
            json_output["rv"].append(item_obj)
            counts["RV"] += 1
        elif item_id.startswith("MSG-"):
            json_output["msg"].append(item_obj)
            counts["MSG"] += 1
        elif item_id.startswith("E-"):
            json_output["e"].append(item_obj)
            counts["E"] += 1

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(json_output, f, indent=2, ensure_ascii=False)

    expected = {
        "HU": 35,
        "RF": 35,
        "CUS": 35,
        "RV": 176,
        "RN": 149,
        "RNF": 62,
        "MSG": 228,
        "E": 423
    }

    print("\n### Tabla de Definiciones Únicas vs Esperado\n")
    print("| Elemento | Definidos | Esperado | Estado |")
    print("|---|---|---|---|")
    all_ok = True
    for k in ["HU", "RF", "CUS", "RV", "RN", "RNF", "MSG", "E"]:
        found = counts[k]
        exp = expected[k]
        status = "✅ OK" if found == exp else f"❌ ({found}/{exp})"
        if found != exp:
            all_ok = False
        print(f"| {k} | {found} | {exp} | {status} |")

    print(f"\nTotal definiciones únicas: {len(definitions)}")
    print(f"Archivo generado: {OUTPUT_JSON} ({OUTPUT_JSON.stat().st_size:,} bytes)")

    print(f"\n### IDs definidos nunca referenciados ({len(defined_unreferenced)}):")
    if defined_unreferenced:
        print(", ".join(defined_unreferenced[:100]))
        if len(defined_unreferenced) > 100:
            print(f"... y {len(defined_unreferenced)-100} más.")
    else:
        print("Ninguno.")

    # Filter referenced_unknown: exclude CUS root IDs like CUS01 (which are module codes, not subcases)
    # Also ignore historical or other patterns if needed
    unknown_filtered = sorted([uid for uid in referenced_unknown if not re.match(r"^CUS\d+$", uid)])
    print(f"\n### IDs referenciados no definidos ({len(unknown_filtered)}):")
    if unknown_filtered:
        print(", ".join(unknown_filtered[:100]))
        if len(unknown_filtered) > 100:
            print(f"... y {len(unknown_filtered)-100} más.")
    else:
        print("Ninguno.")

if __name__ == "__main__":
    run_extraction()
