import json

with open(r'e:\Downloads\GirasolesRes\analisis\inventario_definiciones.json', encoding='utf-8') as f:
    inv = json.load(f)

# Find all occurrences of "capacidad"
for cat in ['rv', 'rn', 'rnf', 'msg']:
    for item in inv[cat]:
        if 'capacidad' in item['texto'].lower() or 'persona' in item['texto'].lower():
            print(f"[{item['id']}]: {item['texto']}")
