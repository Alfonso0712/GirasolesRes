import json
import re

with open(r'e:\Downloads\GirasolesRes\analisis\inventario_definiciones.json', encoding='utf-8') as f:
    inv = json.load(f)

keywords = ["caracteres", "dígitos", "segundos", "minutos", "días", "s/", "hasta"]

all_rules = []
for cat in ['rv', 'rn', 'rnf']:
    for item in inv[cat]:
        text_lower = item['texto'].lower()
        if any(kw in text_lower for kw in keywords):
            all_rules.append((item['id'], item['texto']))

print(f"Total matching rules: {len(all_rules)}")

# Classify by field/concept
def classify(rid, text):
    t = text.lower()
    if 'usuario' in t and ('3–30' in t or '3 a 30' in t or 'formato' in t):
        return 'Usuario (Nombre de usuario / Login)'
    if 'contraseña' in t and ('8 a 64' in t or '8–64' in t):
        return 'Contraseña'
    if 'nombre completo' in t or ('nombre' in t and '3 a 60' in t):
        return 'Nombre de Personal / Usuario'
    if 'nombre' in t and '3 a 50' in t:
        return 'Nombre de Producto'
    if 'mesa' in t and ('1 y 20' in t or '1 a 20' in t or 'nombre' in t):
        return 'Nombre o Número de Mesa'
    if 'capacidad' in t or 'personas' in t or 'sillas' in t:
        return 'Capacidad de Mesa'
    if 'precio' in t and ('999.99' in t or 'mayor que 0' in t or 's/' in t):
        return 'Precio de Producto / Menú'
    if 'motivo de anulación' in t or 'motivo' in t and '5 a 100' in t:
        return 'Motivo de Anulación'
    if 'observación' in t and '200 caracteres' in t:
        return 'Observación de Cierre / Línea'
    if 'referencia' in t and '20 caracteres' in t:
        return 'Referencia de Pago (Yape)'
    if 'dni' in t and '8 dígitos' in t:
        return 'DNI del Cliente'
    if 'ruc' in t and '11 dígitos' in t:
        return 'RUC del Cliente'
    if '700' in t:
        return 'Límite Boleta Simple / Exigencia Documento (S/ 700.00)'
    if 'monto inicial' in t:
        return 'Monto Inicial de Caja'
    if 'efectivo contado' in t:
        return 'Efectivo Contado en Cierre de Caja'
    if 'deshacer' in t and ('segundo' in t or '10' in t or '60' in t):
        return 'Tiempo para Deshacer Estado de Comanda'
    if 'inactividad' in t or 'expirar' in t or 'minutos' in t and 'sesión' in t:
        return 'Tiempo de Sesión e Inactividad'
    if 'rango' in t and ('días' in t or '366' in t or '31' in t):
        return 'Rango de Fechas (Reportes / Ventas)'
    if 'tiempo' in t or 'segundo' in t or 'minuto' in t or 'hora' in t:
        return 'Tiempos de Respuesta y Rendimiento (RNF)'
    if 's/' in t:
        return 'Montos y Valores Monetarios'
    return 'Otros Límites'

groups = {}
for rid, text in all_rules:
    g = classify(rid, text)
    if g not in groups:
        groups[g] = []
    groups[g].append((rid, text))

for g, items in sorted(groups.items()):
    print(f"\n### {g} ({len(items)} reglas)")
    for rid, txt in items:
        print(f"  - [{rid}]: \"{txt}\"")
