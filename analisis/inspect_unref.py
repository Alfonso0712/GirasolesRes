import json

with open(r'e:\Downloads\GirasolesRes\analisis\inventario_definiciones.json', encoding='utf-8') as f:
    inv = json.load(f)

unref_ids = ['E-136', 'E-137', 'E-343', 'E-39', 'E-40', 'E-41', 'E-42', 'E-43', 'E-44', 'E-45', 'E-54', 'E-73', 'RN-55', 'RV-105-B']

for cat in ['e', 'rn', 'rv']:
    for item in inv[cat]:
        if item['id'] in unref_ids:
            print(f"=== {item['id']} ({item['definido_en']}) ===")
            print(item['texto'])
            print()
