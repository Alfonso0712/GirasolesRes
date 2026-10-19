-- ==============================================================================
-- RESTAURANTE GIRASOLES
-- Script de Migración: CUS11 - Comprobantes Fiscales (Boleta Simple, DNI y Factura)
-- Fecha: 2026-10-18
-- Base de Datos: girasoles_db (PostgreSQL)
-- ==============================================================================

BEGIN;

-- 1. Agregar columnas para comprobantes fiscales y receptor a la tabla comprobantes
ALTER TABLE comprobantes
    ADD COLUMN IF NOT EXISTS com_tipo_doc_receptor VARCHAR(10) NULL,
    ADD COLUMN IF NOT EXISTS com_num_doc_receptor VARCHAR(15) NULL,
    ADD COLUMN IF NOT EXISTS com_razon_social_receptor VARCHAR(200) NULL,
    ADD COLUMN IF NOT EXISTS com_direccion_receptor VARCHAR(300) NULL,
    ADD COLUMN IF NOT EXISTS com_op_gravada NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS com_igv NUMERIC(8, 2) NOT NULL DEFAULT 0.00;

-- 2. Asegurar que los registros previos tengan com_op_gravada e com_igv calculados
UPDATE comprobantes
SET com_op_gravada = ROUND(com_total / 1.18, 2),
    com_igv = ROUND(com_total - ROUND(com_total / 1.18, 2), 2)
WHERE com_op_gravada = 0.00 AND com_total > 0;

-- 3. Índices para optimizar búsquedas por documento y serie
CREATE INDEX IF NOT EXISTS ix_comprobantes_doc_receptor 
    ON comprobantes (com_num_doc_receptor);

CREATE INDEX IF NOT EXISTS ix_comprobantes_tipo_serie 
    ON comprobantes (com_tipo, com_serie);

COMMIT;
