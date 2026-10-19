-- ==============================================================================
-- RESTAURANTE GIRASOLES
-- Script de Migración y Sembrado: CUS04 y CUS04.5 - Componentes y Menús Completos
-- Fecha: 2026-10-18
-- Base de Datos: girasoles_db (PostgreSQL)
-- Descripción:
--   1. Añade tip_producto (1: Carta, 2: Componente) y rol_componente (1..5) a tabla productos.
--   2. Permite cat_producto y pre_producto nulos para componentes de menú.
--   3. Actualiza el índice único a (nom_normalizado, tip_producto).
--   4. Crea tablas menus_completos y menus_completos_partes.
--   5. Siembra los 3 menús completos base (Desayuno completo S/7, Almuerzo completo S/8, Solo segundo S/7).
--   6. Siembra los componentes del menú del día.
-- ==============================================================================

BEGIN;

-- 1. Modificación de tabla productos
ALTER TABLE productos ADD COLUMN IF NOT EXISTS tip_producto integer NOT NULL DEFAULT 1;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS rol_componente integer NULL;
ALTER TABLE productos ALTER COLUMN cat_producto DROP NOT NULL;
ALTER TABLE productos ALTER COLUMN pre_producto DROP NOT NULL;

-- 2. Índice único por nombre normalizado y tipo de producto (RV-157 / RN-139)
DROP INDEX IF EXISTS ix_productos_nom_normalizado;
CREATE UNIQUE INDEX IF NOT EXISTS ix_productos_nom_normalizado_tip_producto 
ON productos (nom_normalizado, tip_producto);

-- 3. Creación de tablas para menús completos
CREATE TABLE IF NOT EXISTS menus_completos (
    id_menu_completo integer PRIMARY KEY,
    nom_menu_completo varchar(100) NOT NULL,
    pre_menu_completo numeric(8,2) NOT NULL,
    est_menu_completo boolean NOT NULL DEFAULT true,
    det_incluye varchar(200) NULL,
    fec_actualizacion_utc timestamp with time zone NULL
);

CREATE TABLE IF NOT EXISTS menus_completos_partes (
    id_parte serial PRIMARY KEY,
    id_menu_completo integer NOT NULL REFERENCES menus_completos(id_menu_completo) ON DELETE CASCADE,
    nom_parte varchar(100) NOT NULL,
    num_orden integer NOT NULL DEFAULT 1,
    roles_permitidos varchar(100) NOT NULL
);

-- 4. Sembrado de los 3 menús completos predeterminados
INSERT INTO menus_completos (id_menu_completo, nom_menu_completo, pre_menu_completo, est_menu_completo, det_incluye, fec_actualizacion_utc)
VALUES
    (1, 'Desayuno completo', 7.00, true, 'Pan', NOW()),
    (2, 'Almuerzo completo', 8.00, true, 'Refresco del día', NOW()),
    (3, 'Solo segundo', 7.00, true, 'Refresco del día', NOW())
ON CONFLICT (id_menu_completo) DO UPDATE
SET nom_menu_completo = EXCLUDED.nom_menu_completo,
    pre_menu_completo = EXCLUDED.pre_menu_completo,
    est_menu_completo = EXCLUDED.est_menu_completo,
    det_incluye = EXCLUDED.det_incluye;

-- Limpiar partes previas para asegurar consistencia
DELETE FROM menus_completos_partes WHERE id_menu_completo IN (1, 2, 3);

-- Partes del Desayuno completo (1)
-- 1: Bebida (BebidaDesayuno = 1)
-- 2: Plato (PlatoDesayuno = 2)
INSERT INTO menus_completos_partes (id_menu_completo, nom_parte, num_orden, roles_permitidos)
VALUES
    (1, 'Bebida', 1, '1'),
    (1, 'Plato', 2, '2');

-- Partes del Almuerzo completo (2)
-- 1: Sopa o entrada (Sopa = 3, Entrada = 4)
-- 2: Segundo (Segundo = 5)
INSERT INTO menus_completos_partes (id_menu_completo, nom_parte, num_orden, roles_permitidos)
VALUES
    (2, 'Sopa o entrada', 1, '3,4'),
    (2, 'Segundo', 2, '5');

-- Partes del Solo segundo (3)
-- 1: Segundo (Segundo = 5)
INSERT INTO menus_completos_partes (id_menu_completo, nom_parte, num_orden, roles_permitidos)
VALUES
    (3, 'Segundo', 1, '5');

-- 5. Sembrado de componentes de menú (tip_producto = 2, sin precio ni categoría)
-- a) Bebidas de desayuno (rol_componente = 1)
INSERT INTO productos (id_producto, nom_producto, nom_normalizado, tip_producto, rol_componente, cat_producto, pre_producto, est_producto, fec_creacion_utc)
VALUES
    (gen_random_uuid(), 'Café pasado', 'cafe pasado', 2, 1, NULL, NULL, TRUE, NOW()),
    (gen_random_uuid(), 'Té e infusiones variadas', 'te e infusiones variadas', 2, 1, NULL, NULL, TRUE, NOW()),
    (gen_random_uuid(), 'Quaker con leche', 'quaker con leche', 2, 1, NULL, NULL, TRUE, NOW()),
    (gen_random_uuid(), 'Quinua carretillera', 'quinua carretillera', 2, 1, NULL, NULL, TRUE, NOW()),
    (gen_random_uuid(), 'Jugo surtido', 'jugo surtido', 2, 1, NULL, NULL, TRUE, NOW()),
    (gen_random_uuid(), 'Jugo de papaya', 'jugo de papaya', 2, 1, NULL, NULL, TRUE, NOW())
ON CONFLICT (nom_normalizado, tip_producto) DO UPDATE
SET nom_producto = EXCLUDED.nom_producto,
    rol_componente = EXCLUDED.rol_componente,
    cat_producto = NULL,
    pre_producto = NULL,
    est_producto = TRUE;

-- b) Platos de desayuno (rol_componente = 2)
INSERT INTO productos (id_producto, nom_producto, nom_normalizado, tip_producto, rol_componente, cat_producto, pre_producto, est_producto, fec_creacion_utc)
VALUES
    (gen_random_uuid(), 'Pan con palta', 'pan con palta', 2, 2, NULL, NULL, TRUE, NOW()),
    (gen_random_uuid(), 'Pan con queso', 'pan con queso', 2, 2, NULL, NULL, TRUE, NOW()),
    (gen_random_uuid(), 'Pan con chicharrón', 'pan con chicharron', 2, 2, NULL, NULL, TRUE, NOW()),
    (gen_random_uuid(), 'Pan con huevo frito', 'pan con huevo frito', 2, 2, NULL, NULL, TRUE, NOW()),
    (gen_random_uuid(), 'Pan con salchipollo', 'pan con salchipollo', 2, 2, NULL, NULL, TRUE, NOW()),
    (gen_random_uuid(), 'Pan con pollo deshilachado', 'pan con pollo deshilachado', 2, 2, NULL, NULL, TRUE, NOW())
ON CONFLICT (nom_normalizado, tip_producto) DO UPDATE
SET nom_producto = EXCLUDED.nom_producto,
    rol_componente = EXCLUDED.rol_componente,
    cat_producto = NULL,
    pre_producto = NULL,
    est_producto = TRUE;

-- c) Sopas (rol_componente = 3)
INSERT INTO productos (id_producto, nom_producto, nom_normalizado, tip_producto, rol_componente, cat_producto, pre_producto, est_producto, fec_creacion_utc)
VALUES
    (gen_random_uuid(), 'Caldo de gallina (Entrada)', 'caldo de gallina (entrada)', 2, 3, NULL, NULL, TRUE, NOW()),
    (gen_random_uuid(), 'Sopa a la minuta', 'sopa a la minuta', 2, 3, NULL, NULL, TRUE, NOW()),
    (gen_random_uuid(), 'Sopa criolla', 'sopa criolla', 2, 3, NULL, NULL, TRUE, NOW())
ON CONFLICT (nom_normalizado, tip_producto) DO UPDATE
SET nom_producto = EXCLUDED.nom_producto,
    rol_componente = EXCLUDED.rol_componente,
    cat_producto = NULL,
    pre_producto = NULL,
    est_producto = TRUE;

-- d) Entradas (rol_componente = 4)
INSERT INTO productos (id_producto, nom_producto, nom_normalizado, tip_producto, rol_componente, cat_producto, pre_producto, est_producto, fec_creacion_utc)
VALUES
    (gen_random_uuid(), 'Papa a la huancaína (Entrada)', 'papa a la huancaina (entrada)', 2, 4, NULL, NULL, TRUE, NOW()),
    (gen_random_uuid(), 'Ocopa arequipeña (Entrada)', 'ocopa arequipena (entrada)', 2, 4, NULL, NULL, TRUE, NOW())
ON CONFLICT (nom_normalizado, tip_producto) DO UPDATE
SET nom_producto = EXCLUDED.nom_producto,
    rol_componente = EXCLUDED.rol_componente,
    cat_producto = NULL,
    pre_producto = NULL,
    est_producto = TRUE;

-- e) Segundos (rol_componente = 5)
INSERT INTO productos (id_producto, nom_producto, nom_normalizado, tip_producto, rol_componente, cat_producto, pre_producto, est_producto, fec_creacion_utc)
VALUES
    (gen_random_uuid(), 'Lomo saltado', 'lomo saltado', 2, 5, NULL, NULL, TRUE, NOW()),
    (gen_random_uuid(), 'Seco de pollo', 'seco de pollo', 2, 5, NULL, NULL, TRUE, NOW()),
    (gen_random_uuid(), 'Seco de res', 'seco de res', 2, 5, NULL, NULL, TRUE, NOW()),
    (gen_random_uuid(), 'Arroz chaufa de pollo', 'arroz chaufa de pollo', 2, 5, NULL, NULL, TRUE, NOW()),
    (gen_random_uuid(), 'Pollo a la plancha', 'pollo a la plancha', 2, 5, NULL, NULL, TRUE, NOW()),
    (gen_random_uuid(), 'Bistec a lo pobre', 'bistec a lo pobre', 2, 5, NULL, NULL, TRUE, NOW()),
    (gen_random_uuid(), 'Tallarines verdes con bistec', 'tallarines verdes con bistec', 2, 5, NULL, NULL, TRUE, NOW())
ON CONFLICT (nom_normalizado, tip_producto) DO UPDATE
SET nom_producto = EXCLUDED.nom_producto,
    rol_componente = EXCLUDED.rol_componente,
    cat_producto = NULL,
    pre_producto = NULL,
    est_producto = TRUE;

COMMIT;
