-- =========================================================================
-- MIGRACIÓN CUS12: GESTIÓN DE VENTAS Y ANULACIÓN
-- =========================================================================

ALTER TABLE public.ventas ADD COLUMN IF NOT EXISTS ven_motivo_anulacion VARCHAR(200);
ALTER TABLE public.ventas ADD COLUMN IF NOT EXISTS ven_usuario_anulacion VARCHAR(100);
ALTER TABLE public.ventas ADD COLUMN IF NOT EXISTS ven_fec_anulacion_utc TIMESTAMPTZ;
ALTER TABLE public.ventas ADD COLUMN IF NOT EXISTS ven_destino_pedido VARCHAR(20);
