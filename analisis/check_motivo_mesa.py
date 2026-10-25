import json

with open(r'e:\Downloads\GirasolesRes\analisis\inventario_definiciones.json', encoding='utf-8') as f:
    inv = json.load(f)

# Motivo comparison
for item in inv['rv']:
    if 'motivo' in item['texto'].lower():
        print(f"{item['id']} ({item['definido_en']}): {item['texto']}")

# Nombre mesa comparison
for item in inv['rv']:
    if 'mesa' in item['texto'].lower() and ('nombre' in item['texto'].lower() or 'caracter' in item['texto'].lower()):
        print(f"{item['id']} ({item['definido_en']}): {item['texto']}")
