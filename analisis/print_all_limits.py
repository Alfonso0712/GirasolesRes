import json

with open(r'e:\Downloads\GirasolesRes\analisis\inventario_definiciones.json', encoding='utf-8') as f:
    inv = json.load(f)

keywords = ["caracteres", "dígitos", "segundos", "minutos", "días", "s/", "hasta"]

results = []
for cat in ['rv', 'rn', 'rnf']:
    for item in inv[cat]:
        text_lower = item['texto'].lower()
        if any(kw in text_lower for kw in keywords):
            results.append((item['id'], item['texto'], item['definido_en']))

print(f"Total: {len(results)}")
for rid, txt, def_in in results:
    print(f"[{rid}] ({def_in}): {txt}")
