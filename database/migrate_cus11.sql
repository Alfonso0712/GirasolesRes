-- =========================================================================
-- MIGRACIÓN CUS11: COBRO DE PEDIDOS, COMPROBANTES Y CONTROL DE CAJA
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.cajas (
    id_caja UUID NOT NULL,
    id_usuario UUID NOT NULL,
    caj_monto_apertura NUMERIC(8,2) NOT NULL,
    caj_monto_cierre NUMERIC(8,2),
    caj_fec_apertura_utc TIMESTAMPTZ NOT NULL,
    caj_fec_cierre_utc TIMESTAMPTZ,
    caj_estado VARCHAR(20) NOT NULL,
    fec_creacion_utc TIMESTAMPTZ NOT NULL,
    fec_actualizacion_utc TIMESTAMPTZ,
    CONSTRAINT pk_cajas PRIMARY KEY (id_caja),
    CONSTRAINT fk_cajas_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS ix_cajas_usuario ON public.cajas (id_usuario);
CREATE INDEX IF NOT EXISTS ix_cajas_estado ON public.cajas (caj_estado);

CREATE TABLE IF NOT EXISTS public.ventas (
    id_venta UUID NOT NULL,
    id_pedido UUID NOT NULL,
    id_usuario UUID NOT NULL,
    id_caja UUID NOT NULL,
    ven_total NUMERIC(8,2) NOT NULL,
    ven_metodo_pago VARCHAR(20) NOT NULL,
    ven_monto_recibido NUMERIC(8,2),
    ven_vuelto NUMERIC(8,2),
    ven_yape_confirmado BOOLEAN NOT NULL DEFAULT FALSE,
    ven_yape_referencia VARCHAR(20),
    ven_solicitud_id VARCHAR(100) NOT NULL,
    ven_estado VARCHAR(20) NOT NULL DEFAULT 'Vigente',
    ven_fecha_hora_utc TIMESTAMPTZ NOT NULL,
    fec_creacion_utc TIMESTAMPTZ NOT NULL,
    CONSTRAINT pk_ventas PRIMARY KEY (id_venta),
    CONSTRAINT uq_ventas_solicitud UNIQUE (ven_solicitud_id),
    CONSTRAINT fk_ventas_pedido FOREIGN KEY (id_pedido) REFERENCES public.pedidos(id_pedido) ON DELETE RESTRICT,
    CONSTRAINT fk_ventas_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE RESTRICT,
    CONSTRAINT fk_ventas_caja FOREIGN KEY (id_caja) REFERENCES public.cajas(id_caja) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS ix_ventas_pedido ON public.ventas (id_pedido);
CREATE INDEX IF NOT EXISTS ix_ventas_usuario ON public.ventas (id_usuario);
CREATE INDEX IF NOT EXISTS ix_ventas_caja ON public.ventas (id_caja);
CREATE INDEX IF NOT EXISTS ix_ventas_fecha ON public.ventas (ven_fecha_hora_utc);

CREATE TABLE IF NOT EXISTS public.comprobantes (
    id_comprobante UUID NOT NULL,
    id_venta UUID NOT NULL,
    com_tipo VARCHAR(20) NOT NULL DEFAULT 'Ticket',
    com_serie VARCHAR(10) NOT NULL DEFAULT 'T001',
    com_numero INT NOT NULL,
    com_total NUMERIC(8,2) NOT NULL,
    com_metodo_pago VARCHAR(20) NOT NULL,
    com_fec_hora_utc TIMESTAMPTZ NOT NULL,
    com_leyenda VARCHAR(100) NOT NULL DEFAULT 'Documento sin validez tributaria',
    com_estado VARCHAR(20) NOT NULL DEFAULT 'Emitido',
    fec_creacion_utc TIMESTAMPTZ NOT NULL,
    CONSTRAINT pk_comprobantes PRIMARY KEY (id_comprobante),
    CONSTRAINT uq_comprobantes_serie_numero UNIQUE (com_serie, com_numero),
    CONSTRAINT fk_comprobantes_venta FOREIGN KEY (id_venta) REFERENCES public.ventas(id_venta) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_comprobantes_venta ON public.comprobantes (id_venta);

CREATE TABLE IF NOT EXISTS public.auditorias_cobro (
    id_auditoria UUID NOT NULL,
    nom_cajero VARCHAR(50) NOT NULL,
    accion_realizada VARCHAR(50) NOT NULL,
    num_pedido INT NOT NULL,
    comprobante VARCHAR(30) NOT NULL,
    medio_pago VARCHAR(20) NOT NULL,
    total NUMERIC(8,2) NOT NULL,
    monto_recibido NUMERIC(8,2),
    vuelto NUMERIC(8,2),
    detalle VARCHAR(500),
    fec_registro_utc TIMESTAMPTZ NOT NULL,
    dir_ip VARCHAR(50),
    CONSTRAINT pk_auditorias_cobro PRIMARY KEY (id_auditoria)
);

CREATE INDEX IF NOT EXISTS ix_auditorias_cobro_cajero ON public.auditorias_cobro (nom_cajero);
CREATE INDEX IF NOT EXISTS ix_auditorias_cobro_pedido ON public.auditorias_cobro (num_pedido);
