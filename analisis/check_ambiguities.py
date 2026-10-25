import json

with open(r'e:\Downloads\GirasolesRes\analisis\inventario_definiciones.json', encoding='utf-8') as f:
    inv = json.load(f)

# Let's inspect sections 2 and 16 of Anexo CUS02-04
import glob

for f in sorted(glob.glob(r'e:\Downloads\GirasolesRes\analisis\docs_md\*.md')):
    if 'IEEE' in f: continue
    with open(f, encoding='utf-8') as fp:
        lines = fp.readlines()
    for i, l in enumerate(lines):
        if 'a confirmar' in l.lower() or 'por confirmar' in l.lower() or 'definir con' in l.lower():
            print(f"{f}:{i+1} -> {l.strip()[:100]}")
