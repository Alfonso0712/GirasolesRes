import json

with open(r'e:\Downloads\GirasolesRes\analisis\inventario_definiciones.json', encoding='utf-8') as f:
    inv = json.load(f)

# Collect all fields in dictionary tables from 01d
import glob, re
fields = {}
for f in sorted(glob.glob(r'e:\Downloads\GirasolesRes\analisis\docs_md\*.md')):
    if 'IEEE' in f or 'Historias' in f: continue
    with open(f, encoding='utf-8') as fp:
        lines = fp.readlines()
    in_dd = False
    for l in lines:
        if 'Diccionario de datos' in l:
            in_dd = True
            continue
        elif in_dd and l.startswith('#'):
            in_dd = False
            continue
        if in_dd and l.strip().startswith('|'):
            row = [c.strip() for c in l.split('|')[1:-1]]
            if len(row) >= 4 and row[0] not in ('Campo', '---') and not row[0].startswith('---'):
                fields[row[0]] = (f, row)

print(f"Total dictionary fields: {len(fields)}")
for k, (f, r) in list(fields.items())[:15]:
    print(f"{k} -> {r}")
