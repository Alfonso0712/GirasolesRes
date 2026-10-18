-- =========================================================================
-- CUS 14: REPORTES Y AUDITORÍA DE EXPORTACIÓN
-- =========================================================================

CREATE TABLE IF NOT EXISTS auditorias_reporte (
    id_auditoria UUID PRIMARY KEY,
    nom_usuario VARCHAR(50) NOT NULL,
    tip_reporte VARCHAR(50) NOT NULL,
    ran_reporte VARCHAR(100) NOT NULL,
    for_reporte VARCHAR(20) NOT NULL,
    fec_registro_utc TIMESTAMP WITH TIME ZONE NOT NULL,
    dir_ip VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_auditorias_reporte_fecha ON auditorias_reporte(fec_registro_utc);
CREATE INDEX IF NOT EXISTS idx_auditorias_reporte_usuario ON auditorias_reporte(nom_usuario);

-- Ajuste de sincronización de modelo de dominio Pedido (CUS09/CUS14)
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS ped_motivo_anulacion VARCHAR(100);

