import json
import re

with open(r'e:\Downloads\GirasolesRes\analisis\inventario_definiciones.json', encoding='utf-8') as f:
    inv = json.load(f)

for item in inv['rn']:
    txt = item['texto']
    if 'deshacer' in txt.lower() or 'segundo' in txt.lower():
        print(f"[{item['id']}]: {txt}")

for item in inv['rv']:
    txt = item['texto']
    if 'deshacer' in txt.lower() or 'segundo' in txt.lower():
        print(f"[{item['id']}]: {txt}")
