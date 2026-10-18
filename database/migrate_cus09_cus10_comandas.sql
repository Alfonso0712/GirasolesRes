-- Migración para soporte de aviso y estados de comandas (CUS09 / CUS10)
ALTER TABLE comandas ADD COLUMN IF NOT EXISTS cmd_modificada boolean NOT NULL DEFAULT false;
ALTER TABLE comandas ADD COLUMN IF NOT EXISTS cmd_aviso_visto boolean NOT NULL DEFAULT false;
ALTER TABLE comandas ADD COLUMN IF NOT EXISTS cmd_fec_aviso_visto_utc timestamp with time zone NULL;
ALTER TABLE comandas ADD COLUMN IF NOT EXISTS cmd_nom_usuario_aviso_visto character varying(50) NULL;
ALTER TABLE comandas ADD COLUMN IF NOT EXISTS cmd_fec_inicio_preparacion_utc timestamp with time zone NULL;
ALTER TABLE comandas ADD COLUMN IF NOT EXISTS cmd_nom_usuario_preparacion character varying(50) NULL;
ALTER TABLE comandas ADD COLUMN IF NOT EXISTS cmd_fec_lista_utc timestamp with time zone NULL;
ALTER TABLE comandas ADD COLUMN IF NOT EXISTS cmd_nom_usuario_lista character varying(50) NULL;
ALTER TABLE comandas ADD COLUMN IF NOT EXISTS cmd_estado_anterior character varying(20) NULL;
ALTER TABLE comandas ADD COLUMN IF NOT EXISTS cmd_fec_ultimo_cambio_estado_utc timestamp with time zone NULL;
