import os
import re
from pathlib import Path

controllers_dir = Path(r"e:\Downloads\GirasolesRes\backend\GirasolesRes.API\Controllers")

for f in sorted(controllers_dir.glob("*.cs")):
    text = f.read_text(encoding="utf-8")
    lines = text.splitlines()
    
    base_route = ""
    for l in lines:
        m = re.search(r'\[Route\("([^"]+)"\)\]', l)
        if m:
            base_route = m.group(1)
            break
            
    print(f"\n--- {f.name} --- (Base: {base_route})")
    
    # Read attributes and methods
    curr_attrs = []
    for i, line in enumerate(lines):
        line_s = line.strip()
        if line_s.startswith("[") and line_s.endswith("]"):
            curr_attrs.append(line_s)
        elif "public " in line_s and ("ActionResult" in line_s or "IActionResult" in line_s or "Task" in line_s):
            # check if there is an http verb in curr_attrs
            verb = ""
            sub_route = ""
            auth = ""
            for a in curr_attrs:
                m_verb = re.search(r'\[Http(Get|Post|Put|Patch|Delete)(?:\("([^"]*)"\))?\]', a)
                if m_verb:
                    verb = m_verb.group(1).upper()
                    sub_route = m_verb.group(2) or ""
                m_auth = re.search(r'\[Authorize(?:\(([^)]*)\))?\]', a)
                if m_auth:
                    auth = m_auth.group(1) or "Authenticated"
            
            if verb:
                full_path = f"{base_route}/{sub_route}".replace("//", "/").rstrip("/")
                # Extract method signature
                print(f"  {verb:<6} {full_path:<40} | Auth: {auth:<25} | {line_s[:60]} (L:{i+1})")
            curr_attrs = []
        elif not line_s.startswith("//") and not line_s.startswith("["):
            curr_attrs = []
