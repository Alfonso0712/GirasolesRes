import json
import re

with open(r'e:\Downloads\GirasolesRes\analisis\02_inventario_proyecto.json', encoding='utf-8') as f:
    d2 = json.load(f)

with open(r'e:\Downloads\GirasolesRes\analisis\01c_api_documentada.md', encoding='utf-8') as f:
    t_01c = f.read()

doc_eps = set(re.findall(r'^### `(GET|POST|PUT|PATCH|DELETE)\s+([^`]+)`', t_01c, re.MULTILINE))
print(f"Total documented endpoints in 01c: {len(doc_eps)}")

code_eps = set((e['metodo'], e['ruta']) for e in d2['endpoints'])
print(f"Total code endpoints in 02: {len(code_eps)}")

# Normalize routes for comparison (e.g. {id:guid} -> {id}, {mesaId:guid} -> {mesaId}, /api/caja/cierres/{id:guid} vs /api/caja/cierres/{id})
def norm(r):
    r = re.sub(r'\{(\w+):[^\}]+\}', r'{\1}', r)
    return r

doc_eps_norm = set((m, norm(r)) for m, r in doc_eps)
code_eps_norm = {}
for e in d2['endpoints']:
    key = (e['metodo'], norm(e['ruta']))
    code_eps_norm[key] = e

print(f"Normalized doc endpoints: {len(doc_eps_norm)}")
print(f"Normalized code endpoints: {len(code_eps_norm)}")

extra_in_code = []
for k, e in sorted(code_eps_norm.items()):
    if k not in doc_eps_norm:
        extra_in_code.append((k, e))

print(f"\nEndpoints in code NOT in documentation ({len(extra_in_code)}):")
for (m, r), e in extra_in_code:
    print(f"  {m} {r} -> {e['archivo']}:{e['linea']} ({e['firma'][:50]}...)")

missing_in_code = []
for k in sorted(doc_eps_norm):
    if k not in code_eps_norm:
        missing_in_code.append(k)

print(f"\nEndpoints in doc NOT in code ({len(missing_in_code)}):")
for m, r in missing_in_code:
    print(f"  {m} {r}")
