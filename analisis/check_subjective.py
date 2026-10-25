import json

with open(r'e:\Downloads\GirasolesRes\analisis\inventario_definiciones.json', encoding='utf-8') as f:
    inv = json.load(f)

# Collect all non-functional rules or subjective terms
for cat in ['rnf', 'rv', 'rn']:
    for item in inv[cat]:
        t = item['texto'].lower()
        if 'discreto' in t or 'audible' in t or 'usable' in t or 'claro' in t or 'suficiente' in t or 'rápido' in t or 'cómodo' in t:
            print(f"[{item['id']}]: {item['texto']}")
