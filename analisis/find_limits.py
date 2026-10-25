import json
import re

with open(r'e:\Downloads\GirasolesRes\analisis\inventario_definiciones.json', encoding='utf-8') as f:
    inv = json.load(f)

keywords = ["caracteres", "dígitos", "segundos", "minutos", "días", "s/", "hasta"]

results = []

for cat in ['rv', 'rn', 'rnf']:
    for item in inv[cat]:
        text_lower = item['texto'].lower()
        if any(kw in text_lower for kw in keywords):
            results.append({
                'id': item['id'],
                'cat': cat.upper(),
                'texto': item['texto'],
                'definido_en': item['definido_en']
            })

print(f"Total reglas con límites/valores numéricos encontradas: {len(results)}")
for r in results[:20]:
    print(f"{r['id']} ({r['definido_en']}): {r['texto'][:100]}")
