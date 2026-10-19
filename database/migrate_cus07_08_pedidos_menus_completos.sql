-- Migración: Soporte de Menús Completos y Componentes en Pedidos y Comandas (Fases 3 y 4)
-- Respeta 100% las tablas de Ventas, Comprobantes, Caja, Usuarios y Auditoría.

-- 1. Modificar detalles_pedido para permitir id_producto nulo cuando es un menú completo
ALTER TABLE detalles_pedido ALTER COLUMN id_producto DROP NOT NULL;

ALTER TABLE detalles_pedido 
ADD COLUMN IF NOT EXISTS id_menu_completo integer REFERENCES menus_completos(id_menu_completo) ON DELETE RESTRICT,
ADD COLUMN IF NOT EXISTS det_nombre varchar(100),
ADD COLUMN IF NOT EXISTS det_incluye varchar(100);

-- Actualizar registros históricos con el nombre del producto si estuviera vacío
UPDATE detalles_pedido dp
SET det_nombre = p.nom_producto
FROM productos p
WHERE dp.id_producto = p.id_producto AND (dp.det_nombre IS NULL OR dp.det_nombre = '');

-- 2. Crear tabla de opciones seleccionadas por línea de menú completo
CREATE TABLE IF NOT EXISTS lineas_pedido_opciones (
    id_linea_pedido_opcion uuid PRIMARY KEY,
    id_detalle uuid NOT NULL REFERENCES detalles_pedido(id_detalle) ON DELETE CASCADE,
    lpo_parte_nombre varchar(50) NOT NULL,
    id_producto uuid NOT NULL REFERENCES productos(id_producto) ON DELETE RESTRICT,
    lpo_producto_nombre varchar(100) NOT NULL,
    fec_creacion_utc timestamptz NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')
);

CREATE INDEX IF NOT EXISTS idx_lpo_id_detalle ON lineas_pedido_opciones(id_detalle);
CREATE INDEX IF NOT EXISTS idx_lpo_id_producto ON lineas_pedido_opciones(id_producto);

-- 3. Extender detalles_comanda para menús completos y elecciones
ALTER TABLE detalles_comanda ALTER COLUMN id_producto DROP NOT NULL;

ALTER TABLE detalles_comanda 
ADD COLUMN IF NOT EXISTS id_menu_completo integer REFERENCES menus_completos(id_menu_completo) ON DELETE RESTRICT,
ADD COLUMN IF NOT EXISTS dtc_elecciones varchar(250),
ADD COLUMN IF NOT EXISTS dtc_incluye varchar(100);
