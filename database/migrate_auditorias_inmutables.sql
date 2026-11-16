-- =========================================================================
-- MIGRACIÓN: AUDITORÍAS INMUTABLES EN BASE DE DATOS (SOLO INSERCIÓN)
-- Base de Datos: girasoles_db (PostgreSQL)
-- Propósito: Impedir cualquier operación UPDATE o DELETE sobre las 5 tablas
--            de auditoría (auditorias_cobro, auditorias_mesa,
--            auditorias_pedido, auditorias_reporte y auditorias_usuario).
-- =========================================================================

CREATE OR REPLACE FUNCTION public.fn_impedir_modificacion_auditoria()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION 'Operación % prohibida: la tabla de auditoría "%" es de solo inserción e inmutable.',
        TG_OP,
        TG_TABLE_NAME
        USING ERRCODE = '42501';
END;
$$;

DROP TRIGGER IF EXISTS trg_auditorias_cobro_inmutable ON public.auditorias_cobro;
CREATE TRIGGER trg_auditorias_cobro_inmutable
    BEFORE UPDATE OR DELETE ON public.auditorias_cobro
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_impedir_modificacion_auditoria();

DROP TRIGGER IF EXISTS trg_auditorias_mesa_inmutable ON public.auditorias_mesa;
CREATE TRIGGER trg_auditorias_mesa_inmutable
    BEFORE UPDATE OR DELETE ON public.auditorias_mesa
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_impedir_modificacion_auditoria();

DROP TRIGGER IF EXISTS trg_auditorias_pedido_inmutable ON public.auditorias_pedido;
CREATE TRIGGER trg_auditorias_pedido_inmutable
    BEFORE UPDATE OR DELETE ON public.auditorias_pedido
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_impedir_modificacion_auditoria();

DROP TRIGGER IF EXISTS trg_auditorias_reporte_inmutable ON public.auditorias_reporte;
CREATE TRIGGER trg_auditorias_reporte_inmutable
    BEFORE UPDATE OR DELETE ON public.auditorias_reporte
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_impedir_modificacion_auditoria();

DROP TRIGGER IF EXISTS trg_auditorias_usuario_inmutable ON public.auditorias_usuario;
CREATE TRIGGER trg_auditorias_usuario_inmutable
    BEFORE UPDATE OR DELETE ON public.auditorias_usuario
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_impedir_modificacion_auditoria();
