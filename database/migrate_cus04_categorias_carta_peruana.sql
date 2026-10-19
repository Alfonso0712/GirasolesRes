-- ==============================================================================
-- RESTAURANTE GIRASOLES
-- Script de Migración y Sembrado: CUS04 - Ampliación de Categorías y Carta Peruana
-- Fecha: 2026-10-18
-- Base de Datos: girasoles_db (PostgreSQL)
-- Descripción:
--   1. Reasigna categorías en registros existentes al nuevo esquema enum (1: Desayuno, 2: Almuerzo, 3: PlatosExtras, 4: Combinados, 5: Bebidas, 6: Otro)
--   2. Registra el catálogo completo de productos tradicionales peruanos en estado Activo.
-- ==============================================================================

BEGIN;

-- 1. Actualización de registros preexistentes a sus categorías correctas
UPDATE productos 
SET nom_producto = 'Caldo de gallina criollo (Plato fuerte)',
    nom_normalizado = 'caldo de gallina criollo (plato fuerte)',
    cat_producto = 3, -- PlatosExtras
    pre_producto = 10.00,
    est_producto = TRUE,
    fec_actualizacion_utc = NOW()
WHERE nom_normalizado = 'caldo de gallina criollo';

UPDATE productos 
SET cat_producto = 5, -- Bebidas
    fec_actualizacion_utc = NOW()
WHERE nom_normalizado IN ('gaseosa 500ml', 'agua mineral 600ml', 'jarra de chicha morada 1l');

UPDATE productos 
SET cat_producto = 6, -- Otro
    fec_actualizacion_utc = NOW()
WHERE nom_normalizado = 'porcion extra de papas fritas';

-- 2. Carga / Upsert del catálogo completo de productos peruanos
-- a) Desayunos individuales y panes/acompañamientos (cat_producto = 1)
INSERT INTO productos (id_producto, nom_producto, nom_normalizado, cat_producto, pre_producto, est_producto, fec_creacion_utc)
VALUES
    (gen_random_uuid(), 'Café pasado', 'cafe pasado', 1, 3.50, TRUE, NOW()),
    (gen_random_uuid(), 'Té e infusiones variadas', 'te e infusiones variadas', 1, 2.50, TRUE, NOW()),
    (gen_random_uuid(), 'Quaker con leche', 'quaker con leche', 1, 3.50, TRUE, NOW()),
    (gen_random_uuid(), 'Quinua carretillera', 'quinua carretillera', 1, 3.00, TRUE, NOW()),
    (gen_random_uuid(), 'Jugo surtido', 'jugo surtido', 1, 6.00, TRUE, NOW()),
    (gen_random_uuid(), 'Jugo de papaya', 'jugo de papaya', 1, 5.00, TRUE, NOW()),
    (gen_random_uuid(), 'Pan con palta', 'pan con palta', 1, 3.50, TRUE, NOW()),
    (gen_random_uuid(), 'Pan con queso', 'pan con queso', 1, 3.50, TRUE, NOW()),
    (gen_random_uuid(), 'Pan con chicharrón', 'pan con chicharron', 1, 8.00, TRUE, NOW()),
    (gen_random_uuid(), 'Pan con huevo frito', 'pan con huevo frito', 1, 3.00, TRUE, NOW()),
    (gen_random_uuid(), 'Pan con salchipollo', 'pan con salchipollo', 1, 4.50, TRUE, NOW()),
    (gen_random_uuid(), 'Pan con pollo deshilachado', 'pan con pollo deshilachado', 1, 4.50, TRUE, NOW())
ON CONFLICT (nom_normalizado) DO UPDATE 
SET nom_producto = EXCLUDED.nom_producto,
    cat_producto = EXCLUDED.cat_producto,
    pre_producto = EXCLUDED.pre_producto,
    est_producto = TRUE,
    fec_actualizacion_utc = NOW();

-- b) Almuerzos y Sopas/Entradas (cat_producto = 2)
INSERT INTO productos (id_producto, nom_producto, nom_normalizado, cat_producto, pre_producto, est_producto, fec_creacion_utc)
VALUES
    (gen_random_uuid(), 'Caldo de gallina (Entrada)', 'caldo de gallina (entrada)', 2, 5.00, TRUE, NOW()),
    (gen_random_uuid(), 'Sopa a la minuta', 'sopa a la minuta', 2, 7.00, TRUE, NOW()),
    (gen_random_uuid(), 'Sopa criolla', 'sopa criolla', 2, 8.00, TRUE, NOW()),
    (gen_random_uuid(), 'Papa a la huancaína (Entrada)', 'papa a la huancaina (entrada)', 2, 5.00, TRUE, NOW()),
    (gen_random_uuid(), 'Ocopa arequipeña (Entrada)', 'ocopa arequipena (entrada)', 2, 5.00, TRUE, NOW()),
    (gen_random_uuid(), 'Menú ejecutivo de la casa', 'menu ejecutivo de la casa', 2, 14.00, TRUE, NOW())
ON CONFLICT (nom_normalizado) DO UPDATE 
SET nom_producto = EXCLUDED.nom_producto,
    cat_producto = EXCLUDED.cat_producto,
    pre_producto = EXCLUDED.pre_producto,
    est_producto = TRUE,
    fec_actualizacion_utc = NOW();

-- c) Platos Extras / A la Carta (cat_producto = 3)
INSERT INTO productos (id_producto, nom_producto, nom_normalizado, cat_producto, pre_producto, est_producto, fec_creacion_utc)
VALUES
    (gen_random_uuid(), 'Lomo saltado', 'lomo saltado', 3, 25.00, TRUE, NOW()),
    (gen_random_uuid(), 'Ceviche mixto', 'ceviche mixto', 3, 28.00, TRUE, NOW()),
    (gen_random_uuid(), 'Ceviche de trucha', 'ceviche de trucha', 3, 24.00, TRUE, NOW()),
    (gen_random_uuid(), 'Bistec a lo pobre', 'bistec a lo pobre', 3, 26.00, TRUE, NOW()),
    (gen_random_uuid(), 'Pollo a la plancha', 'pollo a la plancha', 3, 20.00, TRUE, NOW()),
    (gen_random_uuid(), 'Arroz chaufa de pollo', 'arroz chaufa de pollo', 3, 18.00, TRUE, NOW()),
    (gen_random_uuid(), 'Arroz chaufa de carne', 'arroz chaufa de carne', 3, 22.00, TRUE, NOW()),
    (gen_random_uuid(), 'Seco de pollo', 'seco de pollo', 3, 20.00, TRUE, NOW()),
    (gen_random_uuid(), 'Seco de res', 'seco de res', 3, 24.00, TRUE, NOW()),
    (gen_random_uuid(), 'Tallarines verdes con bistec', 'tallarines verdes con bistec', 3, 25.00, TRUE, NOW())
ON CONFLICT (nom_normalizado) DO UPDATE 
SET nom_producto = EXCLUDED.nom_producto,
    cat_producto = EXCLUDED.cat_producto,
    pre_producto = EXCLUDED.pre_producto,
    est_producto = TRUE,
    fec_actualizacion_utc = NOW();

-- d) Combinados (cat_producto = 4)
INSERT INTO productos (id_producto, nom_producto, nom_normalizado, cat_producto, pre_producto, est_producto, fec_creacion_utc)
VALUES
    (gen_random_uuid(), 'Dúo marino (Arroz con mariscos + ceviche)', 'duo marino (arroz con mariscos + ceviche)', 4, 32.00, TRUE, NOW()),
    (gen_random_uuid(), 'Chaufa con chicharrón de pollo', 'chaufa con chicharron de pollo', 4, 22.00, TRUE, NOW()),
    (gen_random_uuid(), 'Chaufa + Ceviche clásico', 'chaufa + ceviche clasico', 4, 28.00, TRUE, NOW())
ON CONFLICT (nom_normalizado) DO UPDATE 
SET nom_producto = EXCLUDED.nom_producto,
    cat_producto = EXCLUDED.cat_producto,
    pre_producto = EXCLUDED.pre_producto,
    est_producto = TRUE,
    fec_actualizacion_utc = NOW();

-- e) Bebidas y Refrescos (cat_producto = 5)
INSERT INTO productos (id_producto, nom_producto, nom_normalizado, cat_producto, pre_producto, est_producto, fec_creacion_utc)
VALUES
    (gen_random_uuid(), 'Coca-Cola Personal 500ml', 'coca-cola personal 500ml', 5, 3.50, TRUE, NOW()),
    (gen_random_uuid(), 'Coca-Cola Familiar 1.5L', 'coca-cola familiar 1.5l', 5, 9.00, TRUE, NOW()),
    (gen_random_uuid(), 'Inca Kola Personal 500ml', 'inca kola personal 500ml', 5, 3.50, TRUE, NOW()),
    (gen_random_uuid(), 'Inca Kola Familiar 1.5L', 'inca kola familiar 1.5l', 5, 9.00, TRUE, NOW()),
    (gen_random_uuid(), 'Agua mineral 700ml', 'agua mineral 700ml', 5, 3.00, TRUE, NOW()),
    (gen_random_uuid(), 'Jarra de chicha morada 500ml', 'jarra de chicha morada 500ml', 5, 4.00, TRUE, NOW()),
    (gen_random_uuid(), 'Jarra de maracuyá 500ml', 'jarra de maracuya 500ml', 5, 4.00, TRUE, NOW()),
    (gen_random_uuid(), 'Jarra de maracuyá 1L', 'jarra de maracuya 1l', 5, 7.00, TRUE, NOW()),
    (gen_random_uuid(), 'Jarra de limonada clásica 500ml', 'jarra de limonada clasica 500ml', 5, 4.00, TRUE, NOW()),
    (gen_random_uuid(), 'Jarra de limonada clásica 1L', 'jarra de limonada clasica 1l', 5, 7.00, TRUE, NOW()),
    (gen_random_uuid(), 'Jarra de limonada frozen 500ml', 'jarra de limonada frozen 500ml', 5, 5.50, TRUE, NOW()),
    (gen_random_uuid(), 'Jarra de limonada frozen 1L', 'jarra de limonada frozen 1l', 5, 9.00, TRUE, NOW())
ON CONFLICT (nom_normalizado) DO UPDATE 
SET nom_producto = EXCLUDED.nom_producto,
    cat_producto = EXCLUDED.cat_producto,
    pre_producto = EXCLUDED.pre_producto,
    est_producto = TRUE,
    fec_actualizacion_utc = NOW();

-- f) Otro (cat_producto = 6)
INSERT INTO productos (id_producto, nom_producto, nom_normalizado, cat_producto, pre_producto, est_producto, fec_creacion_utc)
VALUES
    (gen_random_uuid(), 'Porción de arroz blanco', 'porcion de arroz blanco', 6, 3.00, TRUE, NOW()),
    (gen_random_uuid(), 'Porción de canchita serrana', 'porcion de canchita serrana', 6, 2.50, TRUE, NOW())
ON CONFLICT (nom_normalizado) DO UPDATE 
SET nom_producto = EXCLUDED.nom_producto,
    cat_producto = EXCLUDED.cat_producto,
    pre_producto = EXCLUDED.pre_producto,
    est_producto = TRUE,
    fec_actualizacion_utc = NOW();

COMMIT;
