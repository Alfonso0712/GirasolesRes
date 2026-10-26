-- ============================================================================
-- Migración: Asegurar eliminación de columna capacidad de mesas
-- Contexto: La especificación técnica establece salón «sin capacidad ni plano».
-- Idempotente: Si la columna no existe o ya fue eliminada, no genera error.
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'mesas' AND column_name IN ('capacidad_mesa', 'mes_capacidad', 'capacidad')
    ) THEN
        ALTER TABLE mesas DROP COLUMN IF EXISTS capacidad_mesa;
        ALTER TABLE mesas DROP COLUMN IF EXISTS mes_capacidad;
        ALTER TABLE mesas DROP COLUMN IF EXISTS capacidad;
        RAISE NOTICE 'Columna de capacidad eliminada satisfactoriamente de la tabla mesas.';
    ELSE
        RAISE NOTICE 'La tabla mesas ya se encuentra sin columna de capacidad.';
    END IF;
END $$;
