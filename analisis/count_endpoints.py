import glob
import re

controllers = sorted(glob.glob('backend/GirasolesRes.API/Controllers/*Controller.cs'))
operations = []

for c in controllers:
    with open(c, 'r', encoding='utf-8') as f:
        content = f.read()
    
    ctrl_name = re.search(r'class\s+(\w+Controller)', content).group(1)
    prefix = 'api/' + ctrl_name.replace('Controller', '').lower()
    
    action_matches = re.findall(r'\[Http(Get|Post|Put|Delete|Patch)(?:\("([^"]*)"\))?\]\s*(?:\[[^\]]+\]\s*)*public\s+(?:async\s+)?Task<IActionResult>\s+(\w+)', content)
    for verb, sub, method_name in action_matches:
        sub_clean = sub.strip('/') if sub else ''
        full_route = f"/{prefix}/{sub_clean}".rstrip('/')
        operations.append((ctrl_name, verb.upper(), full_route, method_name))

print(f"Total operaciones detectadas con method_name: {len(operations)}")
for op in operations:
    print(f"{op[0]} | {op[1]} {op[2]} ({op[3]})")
