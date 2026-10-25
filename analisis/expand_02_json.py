import os
import re
import json
from pathlib import Path

ANALISIS_DIR = Path(r"e:\Downloads\GirasolesRes\analisis")
BACKEND_DIR = Path(r"e:\Downloads\GirasolesRes\backend")
FRONTEND_DIR = Path(r"e:\Downloads\GirasolesRes\frontend")
TESTS_DIR = Path(r"e:\Downloads\GirasolesRes\tests")

# 1. Gather all endpoints detailed
controllers_dir = BACKEND_DIR / "GirasolesRes.API" / "Controllers"
endpoints_list = []
for f in sorted(controllers_dir.glob("*.cs")):
    text = f.read_text(encoding="utf-8")
    lines = text.splitlines()
    base_route = ""
    for l in lines:
        m = re.search(r'\[Route\("([^"]+)"\)\]', l)
        if m:
            base_route = m.group(1)
            break
            
    curr_attrs = []
    for i, line in enumerate(lines):
        line_s = line.strip()
        if line_s.startswith("[") and line_s.endswith("]"):
            curr_attrs.append(line_s)
        elif "public " in line_s and ("ActionResult" in line_s or "IActionResult" in line_s or "Task" in line_s):
            verb = ""
            sub_route = ""
            auth = "Anónimo"
            for a in curr_attrs:
                m_verb = re.search(r'\[Http(Get|Post|Put|Patch|Delete)(?:\("([^"]*)"\))?\]', a)
                if m_verb:
                    verb = m_verb.group(1).upper()
                    sub_route = m_verb.group(2) or ""
                m_auth = re.search(r'\[Authorize(?:\(([^)]*)\))?\]', a)
                if m_auth:
                    auth = m_auth.group(1) or "Autenticado"
            
            if verb:
                full_path = f"{base_route}/{sub_route}".replace("//", "/").rstrip("/")
                full_path = full_path.replace("[controller]", f.stem.replace("Controller", "").lower())
                endpoints_list.append({
                    "controlador": f.name,
                    "metodo": verb,
                    "ruta": "/" + full_path.lstrip("/"),
                    "autorizacion": auth,
                    "firma": line_s,
                    "linea": i + 1,
                    "archivo": f"backend/GirasolesRes.API/Controllers/{f.name}"
                })
            curr_attrs = []
        elif not line_s.startswith("//") and not line_s.startswith("["):
            curr_attrs = []

# 2. Gather entities
entities_dir = BACKEND_DIR / "GirasolesRes.Domain" / "Entities"
entities_list = []
for f in sorted(entities_dir.glob("*.cs")):
    text = f.read_text(encoding="utf-8")
    props = re.findall(r'public\s+([^\s]+)\s+([A-Za-z0-9_]+)\s*\{\s*get;', text)
    entities_list.append({
        "entidad": f.stem,
        "archivo": f"backend/GirasolesRes.Domain/Entities/{f.name}",
        "propiedades": [{"tipo": p[0], "nombre": p[1]} for p in props]
    })

# 3. Gather enums
enums_dir = BACKEND_DIR / "GirasolesRes.Domain" / "Enums"
enums_list = []
for f in sorted(enums_dir.glob("*.cs")):
    text = f.read_text(encoding="utf-8")
    vals = re.findall(r'([A-Za-z0-9_]+)(?:\s*=\s*[0-9]+)?,?', text)
    # clean enum vals
    vals_clean = [v for v in vals if v not in ("namespace", "public", "enum", f.stem, "using", "System")]
    enums_list.append({
        "enum": f.stem,
        "archivo": f"backend/GirasolesRes.Domain/Enums/{f.name}",
        "valores": vals_clean
    })

# 4. Gather frontend pages
pages_dir = FRONTEND_DIR / "src" / "pages"
pages_list = []
for f in sorted(pages_dir.glob("*.tsx")):
    pages_list.append({
        "pagina": f.stem,
        "archivo": f"frontend/src/pages/{f.name}"
    })

full_json = {
    "stack": {
        "backend": ".NET 8.0 (C# 12)",
        "orm": "Entity Framework Core 8.0.11 (PostgreSQL)",
        "frontend": "React 19.2.8, TypeScript 6.0.2, Vite 8.3.0, Tailwind CSS 4.3.3",
        "seguridad": "PBKDF2 HMAC-SHA256 (100,000 iteraciones), JWT (30 min)",
        "pdf": "PdfCanvasBuilder (generación vectorial binaria)"
    },
    "metricas": {
        "endpoints_totales": len(endpoints_list),
        "controladores_totales": len(list(controllers_dir.glob("*.cs"))),
        "entidades_dominio": len(entities_list),
        "enums_dominio": len(enums_list),
        "paginas_frontend": len(pages_list),
        "pruebas_automatizadas": 96,
        "pruebas_resultado": "96 superadas, 0 fallidas, 0 omitidas"
    },
    "endpoints": endpoints_list,
    "entidades": entities_list,
    "enums": enums_list,
    "paginas": pages_list,
    "datos_iniciales_seed": {
        "archivo": "backend/GirasolesRes.Infrastructure/Data/DatabaseSeeder.cs",
        "usuarios": ["admin (Administrador)", "atorres (Cajero)", "lperez (Mozo)", "msoto (Cocinero)", "crojas (Inactivo)"],
        "mesas": 12,
        "productos_carta": 56,
        "menus_completos": ["Desayuno completo (S/ 7.00)", "Almuerzo completo (S/ 8.00)", "Solo segundo (S/ 7.00)"]
    }
}

with open(ANALISIS_DIR / "02_inventario_proyecto.json", "w", encoding="utf-8") as fp:
    json.dump(full_json, fp, indent=2, ensure_ascii=False)

print(f"Generado 02_inventario_proyecto.json ({len(endpoints_list)} endpoints, {len(entities_list)} entidades)")
