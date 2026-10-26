-- Migración D-013: Eliminación definitiva de id_desayuno en menus_dia
-- Los desayunos se eligen en productos de carta y el desayuno completo es un MenuCompleto.

ALTER TABLE IF EXISTS public.menus_dia 
DROP CONSTRAINT IF EXISTS fk_menus_dia_desayuno;

ALTER TABLE IF EXISTS public.menus_dia 
DROP COLUMN IF EXISTS id_desayuno;
