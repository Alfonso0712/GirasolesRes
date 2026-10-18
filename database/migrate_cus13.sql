-- =========================================================================
-- MIGRACIÓN CUS13: GESTIÓN DE CAJA (APERTURA, CIERRE, CUADRE E HISTORIAL)
-- =========================================================================

-- 1. Agregar columnas para cuadre, totales de ventas y auditoría de cierre a la tabla 'cajas'
ALTER TABLE public.cajas ADD COLUMN IF NOT EXISTS caj_mon_esperado NUMERIC(10,2);
ALTER TABLE public.cajas ADD COLUMN IF NOT EXISTS caj_diferencia NUMERIC(10,2);
ALTER TABLE public.cajas ADD COLUMN IF NOT EXISTS caj_tot_efectivo NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.cajas ADD COLUMN IF NOT EXISTS caj_tot_yape NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.cajas ADD COLUMN IF NOT EXISTS caj_tot_ventas NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.cajas ADD COLUMN IF NOT EXISTS caj_can_ventas INT DEFAULT 0;
ALTER TABLE public.cajas ADD COLUMN IF NOT EXISTS caj_observacion VARCHAR(200);
ALTER TABLE public.cajas ADD COLUMN IF NOT EXISTS caj_id_usu_cierre UUID;
ALTER TABLE public.cajas ADD COLUMN IF NOT EXISTS caj_solicitud_id VARCHAR(100) DEFAULT gen_random_uuid()::text;
ALTER TABLE public.cajas ADD COLUMN IF NOT EXISTS caj_solicitud_id_cierre VARCHAR(100);

-- Backfill seguro de caj_solicitud_id para filas preexistentes (evita InvalidCastException en EF Core)
UPDATE public.cajas SET caj_solicitud_id = gen_random_uuid()::text WHERE caj_solicitud_id IS NULL;
ALTER TABLE public.cajas ALTER COLUMN caj_solicitud_id SET DEFAULT gen_random_uuid()::text;

-- 2. Armonizar precisión de montos de apertura y cierre a NUMERIC(10,2)
ALTER TABLE public.cajas ALTER COLUMN caj_monto_apertura TYPE NUMERIC(10,2);
ALTER TABLE public.cajas ALTER COLUMN caj_monto_cierre TYPE NUMERIC(10,2);

-- 3. Clave foránea para el usuario de cierre (hacia public.usuarios(id_usuario))
-- NOTA TÉCNICA: usuarios.id_usuario es de tipo UUID en el esquema real del sistema.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_cajas_usuario_cierre'
    ) THEN
        ALTER TABLE public.cajas
        ADD CONSTRAINT fk_cajas_usuario_cierre
        FOREIGN KEY (caj_id_usu_cierre) REFERENCES public.usuarios(id_usuario) ON DELETE RESTRICT;
    END IF;
END $$;

-- 4. Índices para optimizar consultas de CUS 13
CREATE INDEX IF NOT EXISTS ix_cajas_usuario_cierre ON public.cajas (caj_id_usu_cierre);
CREATE INDEX IF NOT EXISTS ix_cajas_fec_apertura ON public.cajas (caj_fec_apertura_utc);
CREATE INDEX IF NOT EXISTS ix_cajas_fec_cierre ON public.cajas (caj_fec_cierre_utc);
CREATE INDEX IF NOT EXISTS ix_cajas_estado_fec_apertura ON public.cajas (caj_estado, caj_fec_apertura_utc DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_cajas_solo_una_abierta ON public.cajas (caj_estado) WHERE caj_estado = 'Abierta';
CREATE UNIQUE INDEX IF NOT EXISTS uq_cajas_solicitud_id ON public.cajas (caj_solicitud_id) WHERE caj_solicitud_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_cajas_solicitud_id_cierre ON public.cajas (caj_solicitud_id_cierre) WHERE caj_solicitud_id_cierre IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_ventas_caja_estado_metodo ON public.ventas (id_caja, ven_estado, ven_metodo_pago);
