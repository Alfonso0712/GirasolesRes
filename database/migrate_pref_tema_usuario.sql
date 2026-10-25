-- =========================================================================
-- MIGRACIÓN: PREFERENCIA DE TEMA OSCURO POR USUARIO
-- Fecha: 2026-10-25
-- Base de Datos: girasoles_db (PostgreSQL)
-- =========================================================================

-- 1. Agregar columna pref_tema con valor por defecto 'light' (idempotente)
ALTER TABLE public.usuarios
    ADD COLUMN IF NOT EXISTS pref_tema VARCHAR(10) NOT NULL DEFAULT 'light';

-- 2. Agregar restricción CHECK chk_usuarios_pref_tema si no existe (idempotente)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_usuarios_pref_tema'
    ) THEN
        ALTER TABLE public.usuarios
            ADD CONSTRAINT chk_usuarios_pref_tema CHECK (pref_tema IN ('light', 'dark'));
    END IF;
END $$;
