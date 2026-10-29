-- =========================================================================
-- MIGRACIÓN: PREFERENCIA DE ORIENTACIÓN (MODO ZURDO / DIESTRO) POR USUARIO
-- Fecha: 2026-10-29
-- Base de Datos: girasoles_db (PostgreSQL)
-- =========================================================================

-- 1. Agregar columna pref_orientacion con valor por defecto 'right' (idempotente)
ALTER TABLE public.usuarios
    ADD COLUMN IF NOT EXISTS pref_orientacion VARCHAR(10) NOT NULL DEFAULT 'right';

-- 2. Agregar restricción CHECK chk_usuarios_pref_orientacion si no existe (idempotente)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_usuarios_pref_orientacion'
    ) THEN
        ALTER TABLE public.usuarios
            ADD CONSTRAINT chk_usuarios_pref_orientacion CHECK (pref_orientacion IN ('right', 'left'));
    END IF;
END $$;
