import json

with open(r'e:\Downloads\GirasolesRes\analisis\inventario_definiciones.json', encoding='utf-8') as f:
    inv = json.load(f)

keywords = ["caracteres", "dígitos", "segundos", "minutos", "días", "s/", "hasta"]

matching = []
for cat in ['rv', 'rn', 'rnf']:
    for item in inv[cat]:
        t = item['texto'].lower()
        if any(kw in t for kw in keywords):
            # clean text
            parts = [p.strip() for p in item['texto'].split('|')]
            regla_text = parts[0]
            matching.append({
                'id': item['id'],
                'cat': cat.upper(),
                'texto_completo': item['texto'],
                'regla_limpia': regla_text,
                'definido_en': item['definido_en']
            })

print(f"Total matching rules: {len(matching)}")

# Field categorization
def get_field(r):
    t = r['regla_limpia'].lower()
    rid = r['id']
    if 'usuario' in t and ('3–30' in t or '3 a 30' in t):
        return 'Usuario (Nombre de usuario / Login)'
    if 'contraseña' in t and ('8 a 64' in t or '8–64' in t):
        return 'Contraseña'
    if 'nombre completo' in t and '3 a 60' in t:
        return 'Nombre de Personal / Usuario'
    if 'nombre' in t and '3 a 50' in t:
        return 'Nombre de Producto o Componente'
    if 'número o nombre de la mesa' in t or ('mesa' in t and '1 y 20' in t):
        return 'Número o Nombre de Mesa'
    if 'correo' in t and '100' in t:
        return 'Correo Electrónico'
    if 'precio' in t and 'producto de carta' in t:
        return 'Precio de Producto de Carta'
    if 'precio' in t and 'menú completo' in t:
        return 'Precio de Menú Completo'
    if 'motivo de anulación' in t:
        return 'Motivo de Anulación (Pedido / Venta)'
    if 'referencia del cliente' in t and '30 caracteres' in t:
        return 'Referencia del Cliente (Pedido para Llevar)'
    if 'referencia' in t and 'yape' in t:
        return 'Referencia de Pago (Yape)'
    if 'observación' in t and '200 caracteres' in t:
        return 'Observación de Cierre de Caja'
    if 'observación' in t and '100 caracteres' in t:
        return 'Observación de Línea de Pedido'
    if 'búsqueda' in t and '15 caracteres' in t:
        return 'Búsqueda por Comprobante (Ventas)'
    if 'búsqueda' in t and '50 caracteres' in t:
        return 'Búsqueda de Texto (Usuarios / Productos)'
    if 'dni' in t and '8 dígitos' in t:
        return 'DNI del Cliente'
    if 'ruc' in t and '11 dígitos' in t:
        return 'RUC del Cliente'
    if '700' in t:
        return 'Límite Boleta Simple / Exigencia Documento (S/ 700.00)'
    if 'monto inicial' in t:
        return 'Monto Inicial de Caja'
    if 'efectivo contado' in t:
        return 'Efectivo Contado (Cierre de Caja)'
    if 'deshacer' in t and '10 segundos' in t:
        return 'Tiempo para Deshacer Estado de Comanda (Cocina)'
    if 'nueva' in t and '10 segundos' in t:
        return 'Tiempo de Resaltado de Comanda Nueva'
    if 'inactividad' in t or 'sesión' in t and ('minutos' in t or '30' in t or '28' in t):
        return 'Tiempo de Sesión e Inactividad'
    if 'intentos fallidos' in t:
        return 'Bloqueo por Intentos Fallidos'
    if 'código de recuperación' in t:
        return 'Vigencia de Código de Recuperación'
    if 'rango' in t and '31 días' in t:
        return 'Rango de Fechas (Consulta de Ventas - Cajero/Admin)'
    if 'rango' in t and '366 días' in t:
        return 'Rango de Fechas (Reportes de Ventas)'
    if 'demora' in t and '15 minutos' in t:
        return 'Umbral de Demora en Cocina'
    if 'caldo de gallina' in t and 's/' in t:
        return 'Precios Fijos de Caldo de Gallina'
    if 'botones rápidos de efectivo' in t:
        return 'Botones Rápidos de Pago en Efectivo'
    if 'formato de montos' in t or ('montos se muestran con prefijo "s/"' in t):
        return 'Formato de Presentación de Montos'
    if '5 segundos' in t and 'comanda nueva' in t:
        return 'Tiempo de Aparición de Comanda en Cocina'
    if '15 segundos' in t:
        return 'Ciclo de Refresco Automático de Vistas'
    if '30 segundos' in t:
        return 'Ciclo de Refresco del Menú del Día en Pedidos'
    if 'menos de 1 segundo' in t or 'menos de 2 segundos' in t or 'menos de 3 segundos' in t or '3 segundos o menos' in t:
        return 'Tiempos de Respuesta del Servidor (RNF)'
    if 'hasta 100 usuarios' in t or 'hasta 200 productos' in t or 'hasta 50 mesas' in t or 'hasta 200 pedidos' in t or 'hasta 3,000 ventas' in t or 'hasta 40,000 ventas' in t:
        return 'Capacidades de Carga y Rendimiento (RNF)'
    return 'Otras Reglas con Valores Numéricos'

classified = {}
for r in matching:
    f = get_field(r)
    if f not in classified:
        classified[f] = []
    classified[f].append(r)

print(f"Total classified fields: {len(classified)}")
for f, items in sorted(classified.items()):
    print(f"\n### Campo: {f} ({len(items)} reglas)")
    for it in items:
        print(f"  - [{it['id']}]: \"{it['regla_limpia']}\"")
