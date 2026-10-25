import json, sys, pathlib
path = r"e:\Downloads\GirasolesRes\analisis\01_inventario_documentacion.json"
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)
print('HU', len(data.get('hu', [])))
print('RF', len(data.get('rf', [])))
print('CUS', len(data.get('cus', [])))
