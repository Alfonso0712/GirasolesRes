import json

with open(r'e:\Downloads\GirasolesRes\analisis\inventario_definiciones.json', encoding='utf-8') as f:
    inv = json.load(f)

# Find all occurrences of "refresco"
for cat in ['rn', 'rv', 'rnf', 'msg']:
    for item in inv[cat]:
        if 'refresco' in item['texto'].lower() or 'dueña' in item['texto'].lower():
            print(f"[{item['id']}]: {item['texto']}")
