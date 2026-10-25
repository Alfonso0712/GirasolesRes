import json

with open(r'e:\Downloads\GirasolesRes\analisis\inventario_definiciones.json', encoding='utf-8') as f:
    inv = json.load(f)

# Let us check names, prices, lengths
for cat in ['rv', 'rn']:
    for item in inv[cat]:
        t = item['texto'].lower()
        if 'nombre' in t or 'usuario' in t or 'contraseña' in t or 'mesa' in t or 'motivo' in t or 'precio' in t:
            print(f"[{item['id']}]: {item['texto']}")
