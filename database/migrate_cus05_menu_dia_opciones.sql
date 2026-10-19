-- Migración CUS05: Soporte para menús completos habilitados por fecha en el Menú del Día
BEGIN;

CREATE TABLE IF NOT EXISTS menu_dia_menus_completos (
    id_menu_dia_menu_completo UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_menu UUID NOT NULL REFERENCES menus_dia(id_menu) ON DELETE CASCADE,
    id_menu_completo INTEGER NOT NULL REFERENCES menus_completos(id_menu_completo) ON DELETE CASCADE,
    fec_creacion_utc TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_menu_dia_menu_completo UNIQUE (id_menu, id_menu_completo)
);

CREATE INDEX IF NOT EXISTS ix_menu_dia_menus_completos_id_menu ON menu_dia_menus_completos(id_menu);

-- Asociar los 3 menús completos por defecto a los menús del día ya existentes si no los tenían
INSERT INTO menu_dia_menus_completos (id_menu, id_menu_completo)
SELECT md.id_menu, mc.id_menu_completo
FROM menus_dia md
CROSS JOIN menus_completos mc
ON CONFLICT (id_menu, id_menu_completo) DO NOTHING;

COMMIT;
