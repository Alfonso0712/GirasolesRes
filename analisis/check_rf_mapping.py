import csv

with open('analisis/03a_matriz_trazabilidad.csv', 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

# Let's map each CUS to its definitive Annex document
annex_map = {
    'CUS01': 'Anexo_CUS01_Inicio_de_Sesion_Girasoles.md',
    'CUS02': 'Anexo_CUS02_a_CUS04_Girasoles.md',
    'CUS03': 'Anexo_CUS02_a_CUS04_Girasoles.md',
    'CUS04': 'Anexo_CUS02_a_CUS04_Girasoles.md',
    'CUS05': 'Anexo_CUS05_y_CUS06_Mesas_y_Pedido_de_Mesa_Girasoles.md',
    'CUS06': 'Anexo_CUS05_y_CUS06_Mesas_y_Pedido_de_Mesa_Girasoles.md',
    'CUS07': 'Anexo_CUS07_Pedido_para_Llevar_Girasoles.md',
    'CUS08': 'Anexo_CUS08_Gestion_de_Pedidos_Girasoles.md',
    'CUS09': 'Anexo_CUS09_Comandas_de_Cocina_Girasoles.md',
    'CUS10': 'Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md',
    'CUS11': 'Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md',
    'CUS12': 'Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md',
    'CUS13': 'Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md',
    'CUS14': 'Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md',
    'CUS15': 'Anexo_CUS10_a_CUS14_Cobro_Ventas_Caja_Reportes_Dashboard_Girasoles.md'
}

print(f"Total filas en matriz 03a: {len(rows)}")
for i, r in enumerate(rows, 1):
    cus_prefix = r['cus'].split('.')[0]
    annex = annex_map.get(cus_prefix, 'Historias_de_Usuario_35RF_35HU_Girasoles.md')
    print(f"{i:2d}. RF: {r['rf']} | HU: {r['hu']} | CUS: {r['cus']} | {r['nombre']} -> {annex}")
