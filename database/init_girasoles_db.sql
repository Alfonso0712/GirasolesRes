--
-- PostgreSQL database dump
--

\restrict 5xSqPnw85Tgc95L9ChlVwrs0AZUXLMGVmQr6Gs2wP7tJqjs4mmV4YyjtmghwEhT

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.menus_completos_partes DROP CONSTRAINT IF EXISTS menus_completos_partes_id_menu_completo_fkey;
ALTER TABLE IF EXISTS ONLY public.menu_dia_menus_completos DROP CONSTRAINT IF EXISTS menu_dia_menus_completos_id_menu_fkey;
ALTER TABLE IF EXISTS ONLY public.menu_dia_menus_completos DROP CONSTRAINT IF EXISTS menu_dia_menus_completos_id_menu_completo_fkey;
ALTER TABLE IF EXISTS ONLY public.lineas_pedido_opciones DROP CONSTRAINT IF EXISTS lineas_pedido_opciones_id_producto_fkey;
ALTER TABLE IF EXISTS ONLY public.lineas_pedido_opciones DROP CONSTRAINT IF EXISTS lineas_pedido_opciones_id_detalle_fkey;
ALTER TABLE IF EXISTS ONLY public.ventas DROP CONSTRAINT IF EXISTS fk_ventas_usuario;
ALTER TABLE IF EXISTS ONLY public.ventas DROP CONSTRAINT IF EXISTS fk_ventas_pedido;
ALTER TABLE IF EXISTS ONLY public.ventas DROP CONSTRAINT IF EXISTS fk_ventas_caja;
ALTER TABLE IF EXISTS ONLY public.pedidos DROP CONSTRAINT IF EXISTS fk_pedidos_usuario;
ALTER TABLE IF EXISTS ONLY public.pedidos DROP CONSTRAINT IF EXISTS fk_pedidos_mesa;
ALTER TABLE IF EXISTS ONLY public.menus_dia DROP CONSTRAINT IF EXISTS fk_menus_dia_desayuno;
ALTER TABLE IF EXISTS ONLY public.menu_dia_platos DROP CONSTRAINT IF EXISTS fk_menu_dia_platos_producto;
ALTER TABLE IF EXISTS ONLY public.menu_dia_platos DROP CONSTRAINT IF EXISTS fk_menu_dia_platos_menu;
ALTER TABLE IF EXISTS ONLY public.detalles_pedido DROP CONSTRAINT IF EXISTS fk_detalles_pedido_producto;
ALTER TABLE IF EXISTS ONLY public.detalles_pedido DROP CONSTRAINT IF EXISTS fk_detalles_pedido_pedido;
ALTER TABLE IF EXISTS ONLY public.detalles_comanda DROP CONSTRAINT IF EXISTS fk_detalles_comanda_producto;
ALTER TABLE IF EXISTS ONLY public.detalles_comanda DROP CONSTRAINT IF EXISTS fk_detalles_comanda_comanda;
ALTER TABLE IF EXISTS ONLY public.comprobantes DROP CONSTRAINT IF EXISTS fk_comprobantes_venta;
ALTER TABLE IF EXISTS ONLY public.comandas DROP CONSTRAINT IF EXISTS fk_comandas_pedido;
ALTER TABLE IF EXISTS ONLY public.cajas DROP CONSTRAINT IF EXISTS fk_cajas_usuario_cierre;
ALTER TABLE IF EXISTS ONLY public.cajas DROP CONSTRAINT IF EXISTS fk_cajas_usuario;
ALTER TABLE IF EXISTS ONLY public.detalles_pedido DROP CONSTRAINT IF EXISTS detalles_pedido_id_menu_completo_fkey;
ALTER TABLE IF EXISTS ONLY public.detalles_comanda DROP CONSTRAINT IF EXISTS detalles_comanda_id_menu_completo_fkey;
DROP INDEX IF EXISTS public.uq_cajas_solo_una_abierta;
DROP INDEX IF EXISTS public.uq_cajas_solicitud_id;
DROP INDEX IF EXISTS public.ix_ventas_usuario;
DROP INDEX IF EXISTS public.ix_ventas_pedido;
DROP INDEX IF EXISTS public.ix_ventas_fecha;
DROP INDEX IF EXISTS public.ix_ventas_caja_estado_metodo;
DROP INDEX IF EXISTS public.ix_ventas_caja;
DROP INDEX IF EXISTS public.ix_tokens_revocados_usuario;
DROP INDEX IF EXISTS public.ix_tokens_revocados_jti;
DROP INDEX IF EXISTS public.ix_productos_nom_normalizado_tip_producto;
DROP INDEX IF EXISTS public.ix_pedidos_solicitud_id;
DROP INDEX IF EXISTS public.ix_pedidos_mesa_estado;
DROP INDEX IF EXISTS public.ix_pedidos_fecha_numero;
DROP INDEX IF EXISTS public.ix_mesas_nom_mesa_normalizado;
DROP INDEX IF EXISTS public.ix_menu_dia_menus_completos_id_menu;
DROP INDEX IF EXISTS public.ix_detalles_pedido_pedido;
DROP INDEX IF EXISTS public.ix_detalles_comanda_comanda;
DROP INDEX IF EXISTS public.ix_comprobantes_venta;
DROP INDEX IF EXISTS public.ix_comprobantes_tipo_serie;
DROP INDEX IF EXISTS public.ix_comprobantes_doc_receptor;
DROP INDEX IF EXISTS public.ix_comandas_pedido;
DROP INDEX IF EXISTS public.ix_cajas_usuario_cierre;
DROP INDEX IF EXISTS public.ix_cajas_usuario;
DROP INDEX IF EXISTS public.ix_cajas_solicitud_id_cierre;
DROP INDEX IF EXISTS public.ix_cajas_fec_cierre;
DROP INDEX IF EXISTS public.ix_cajas_fec_apertura;
DROP INDEX IF EXISTS public.ix_cajas_estado_fec_apertura;
DROP INDEX IF EXISTS public.ix_cajas_estado;
DROP INDEX IF EXISTS public.ix_auditorias_nom_afectado;
DROP INDEX IF EXISTS public.ix_auditorias_nom_admin;
DROP INDEX IF EXISTS public.ix_auditorias_cobro_pedido;
DROP INDEX IF EXISTS public.ix_auditorias_cobro_cajero;
DROP INDEX IF EXISTS public.idx_lpo_id_producto;
DROP INDEX IF EXISTS public.idx_lpo_id_detalle;
DROP INDEX IF EXISTS public.idx_auditorias_reporte_usuario;
DROP INDEX IF EXISTS public.idx_auditorias_reporte_fecha;
DROP INDEX IF EXISTS public."IX_usuarios_nom_usuario";
DROP INDEX IF EXISTS public."IX_usuarios_cor_usuario";
DROP INDEX IF EXISTS public."IX_menus_dia_fec_menu";
DROP INDEX IF EXISTS public."IX_menu_dia_platos_menu_producto";
DROP INDEX IF EXISTS public."IX_codigos_recuperacion_cor_usuario";
ALTER TABLE IF EXISTS ONLY public.ventas DROP CONSTRAINT IF EXISTS uq_ventas_solicitud;
ALTER TABLE IF EXISTS ONLY public.menu_dia_menus_completos DROP CONSTRAINT IF EXISTS uq_menu_dia_menu_completo;
ALTER TABLE IF EXISTS ONLY public.comprobantes DROP CONSTRAINT IF EXISTS uq_comprobantes_serie_numero;
ALTER TABLE IF EXISTS ONLY public.tokens_revocados DROP CONSTRAINT IF EXISTS tokens_revocados_pkey;
ALTER TABLE IF EXISTS ONLY public.ventas DROP CONSTRAINT IF EXISTS pk_ventas;
ALTER TABLE IF EXISTS ONLY public.productos DROP CONSTRAINT IF EXISTS pk_productos;
ALTER TABLE IF EXISTS ONLY public.pedidos DROP CONSTRAINT IF EXISTS pk_pedidos;
ALTER TABLE IF EXISTS ONLY public.mesas DROP CONSTRAINT IF EXISTS pk_mesas;
ALTER TABLE IF EXISTS ONLY public.detalles_pedido DROP CONSTRAINT IF EXISTS pk_detalles_pedido;
ALTER TABLE IF EXISTS ONLY public.detalles_comanda DROP CONSTRAINT IF EXISTS pk_detalles_comanda;
ALTER TABLE IF EXISTS ONLY public.comprobantes DROP CONSTRAINT IF EXISTS pk_comprobantes;
ALTER TABLE IF EXISTS ONLY public.comandas DROP CONSTRAINT IF EXISTS pk_comandas;
ALTER TABLE IF EXISTS ONLY public.cajas DROP CONSTRAINT IF EXISTS pk_cajas;
ALTER TABLE IF EXISTS ONLY public.auditorias_pedido DROP CONSTRAINT IF EXISTS pk_auditorias_pedido;
ALTER TABLE IF EXISTS ONLY public.auditorias_mesa DROP CONSTRAINT IF EXISTS pk_auditorias_mesa;
ALTER TABLE IF EXISTS ONLY public.auditorias_cobro DROP CONSTRAINT IF EXISTS pk_auditorias_cobro;
ALTER TABLE IF EXISTS ONLY public.menus_dia DROP CONSTRAINT IF EXISTS menus_dia_pkey;
ALTER TABLE IF EXISTS ONLY public.menus_completos DROP CONSTRAINT IF EXISTS menus_completos_pkey;
ALTER TABLE IF EXISTS ONLY public.menus_completos_partes DROP CONSTRAINT IF EXISTS menus_completos_partes_pkey;
ALTER TABLE IF EXISTS ONLY public.menu_dia_platos DROP CONSTRAINT IF EXISTS menu_dia_platos_pkey;
ALTER TABLE IF EXISTS ONLY public.menu_dia_menus_completos DROP CONSTRAINT IF EXISTS menu_dia_menus_completos_pkey;
ALTER TABLE IF EXISTS ONLY public.lineas_pedido_opciones DROP CONSTRAINT IF EXISTS lineas_pedido_opciones_pkey;
ALTER TABLE IF EXISTS ONLY public.auditorias_usuario DROP CONSTRAINT IF EXISTS auditorias_usuario_pkey;
ALTER TABLE IF EXISTS ONLY public.auditorias_reporte DROP CONSTRAINT IF EXISTS auditorias_reporte_pkey;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS "PK_usuarios";
ALTER TABLE IF EXISTS ONLY public.registros_ingreso DROP CONSTRAINT IF EXISTS "PK_registros_ingreso";
ALTER TABLE IF EXISTS ONLY public.codigos_recuperacion DROP CONSTRAINT IF EXISTS "PK_codigos_recuperacion";
ALTER TABLE IF EXISTS public.menus_completos_partes ALTER COLUMN id_parte DROP DEFAULT;
DROP TABLE IF EXISTS public.ventas;
DROP TABLE IF EXISTS public.usuarios;
DROP TABLE IF EXISTS public.tokens_revocados;
DROP TABLE IF EXISTS public.registros_ingreso;
DROP TABLE IF EXISTS public.productos;
DROP TABLE IF EXISTS public.pedidos;
DROP TABLE IF EXISTS public.mesas;
DROP TABLE IF EXISTS public.menus_dia;
DROP SEQUENCE IF EXISTS public.menus_completos_partes_id_parte_seq;
DROP TABLE IF EXISTS public.menus_completos_partes;
DROP TABLE IF EXISTS public.menus_completos;
DROP TABLE IF EXISTS public.menu_dia_platos;
DROP TABLE IF EXISTS public.menu_dia_menus_completos;
DROP TABLE IF EXISTS public.lineas_pedido_opciones;
DROP TABLE IF EXISTS public.detalles_pedido;
DROP TABLE IF EXISTS public.detalles_comanda;
DROP TABLE IF EXISTS public.comprobantes;
DROP TABLE IF EXISTS public.comandas;
DROP TABLE IF EXISTS public.codigos_recuperacion;
DROP TABLE IF EXISTS public.cajas;
DROP TABLE IF EXISTS public.auditorias_usuario;
DROP TABLE IF EXISTS public.auditorias_reporte;
DROP TABLE IF EXISTS public.auditorias_pedido;
DROP TABLE IF EXISTS public.auditorias_mesa;
DROP TABLE IF EXISTS public.auditorias_cobro;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: auditorias_cobro; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auditorias_cobro (
    id_auditoria uuid NOT NULL,
    nom_cajero character varying(50) NOT NULL,
    accion_realizada character varying(50) NOT NULL,
    num_pedido integer NOT NULL,
    comprobante character varying(30) NOT NULL,
    medio_pago character varying(20) NOT NULL,
    total numeric(8,2) NOT NULL,
    monto_recibido numeric(8,2),
    vuelto numeric(8,2),
    detalle character varying(500),
    fec_registro_utc timestamp with time zone NOT NULL,
    dir_ip character varying(50)
);


ALTER TABLE public.auditorias_cobro OWNER TO postgres;

--
-- Name: auditorias_mesa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auditorias_mesa (
    id_auditoria uuid NOT NULL,
    nom_admin character varying(50) NOT NULL,
    accion_realizada character varying(50) NOT NULL,
    nom_mesa character varying(50) NOT NULL,
    detalle character varying(500),
    fec_registro_utc timestamp with time zone NOT NULL,
    dir_ip character varying(50)
);


ALTER TABLE public.auditorias_mesa OWNER TO postgres;

--
-- Name: auditorias_pedido; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auditorias_pedido (
    id_auditoria uuid NOT NULL,
    nom_usuario character varying(50) NOT NULL,
    accion_realizada character varying(50) NOT NULL,
    nom_mesa character varying(50) NOT NULL,
    num_pedido integer NOT NULL,
    detalle character varying(500),
    fec_registro_utc timestamp with time zone NOT NULL,
    dir_ip character varying(50)
);


ALTER TABLE public.auditorias_pedido OWNER TO postgres;

--
-- Name: auditorias_reporte; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auditorias_reporte (
    id_auditoria uuid NOT NULL,
    nom_usuario character varying(50) NOT NULL,
    tip_reporte character varying(50) NOT NULL,
    ran_reporte character varying(100) NOT NULL,
    for_reporte character varying(20) NOT NULL,
    fec_registro_utc timestamp with time zone NOT NULL,
    dir_ip character varying(50)
);


ALTER TABLE public.auditorias_reporte OWNER TO postgres;

--
-- Name: auditorias_usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auditorias_usuario (
    id_auditoria uuid NOT NULL,
    nom_admin character varying(50) NOT NULL,
    accion_realizada character varying(50) NOT NULL,
    nom_usuario_afectado character varying(50) NOT NULL,
    detalle character varying(500),
    fec_registro_utc timestamp with time zone NOT NULL,
    dir_ip character varying(50)
);


ALTER TABLE public.auditorias_usuario OWNER TO postgres;

--
-- Name: cajas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cajas (
    id_caja uuid NOT NULL,
    id_usuario uuid NOT NULL,
    caj_monto_apertura numeric(10,2) NOT NULL,
    caj_monto_cierre numeric(10,2),
    caj_fec_apertura_utc timestamp with time zone NOT NULL,
    caj_fec_cierre_utc timestamp with time zone,
    caj_estado character varying(20) NOT NULL,
    fec_creacion_utc timestamp with time zone NOT NULL,
    fec_actualizacion_utc timestamp with time zone,
    caj_mon_esperado numeric(10,2),
    caj_diferencia numeric(10,2),
    caj_tot_efectivo numeric(10,2) DEFAULT 0,
    caj_tot_yape numeric(10,2) DEFAULT 0,
    caj_tot_ventas numeric(10,2) DEFAULT 0,
    caj_can_ventas integer DEFAULT 0,
    caj_observacion character varying(200),
    caj_id_usu_cierre uuid,
    caj_solicitud_id character varying(100) DEFAULT (gen_random_uuid())::text,
    caj_solicitud_id_cierre character varying(100)
);


ALTER TABLE public.cajas OWNER TO postgres;

--
-- Name: codigos_recuperacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.codigos_recuperacion (
    id_codigo uuid NOT NULL,
    cor_usuario character varying(100) NOT NULL,
    cod_recuperacion character varying(6) NOT NULL,
    fec_expiracion_utc timestamp with time zone NOT NULL,
    es_usado boolean NOT NULL,
    fec_creacion_utc timestamp with time zone NOT NULL
);


ALTER TABLE public.codigos_recuperacion OWNER TO postgres;

--
-- Name: comandas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comandas (
    id_comanda uuid NOT NULL,
    id_pedido uuid NOT NULL,
    cmd_numero_diario integer NOT NULL,
    cmd_fecha_hora_utc timestamp with time zone NOT NULL,
    cmd_estado character varying(20) NOT NULL,
    cmd_es_adicional boolean DEFAULT false NOT NULL,
    cmd_nombre_mesa character varying(50) NOT NULL,
    fec_creacion_utc timestamp with time zone NOT NULL,
    cmd_modificada boolean DEFAULT false NOT NULL,
    cmd_aviso_visto boolean DEFAULT false NOT NULL,
    cmd_fec_aviso_visto_utc timestamp with time zone,
    cmd_nom_usuario_aviso_visto character varying(50),
    cmd_fec_inicio_preparacion_utc timestamp with time zone,
    cmd_nom_usuario_preparacion character varying(50),
    cmd_fec_lista_utc timestamp with time zone,
    cmd_nom_usuario_lista character varying(50),
    cmd_estado_anterior character varying(20),
    cmd_fec_ultimo_cambio_estado_utc timestamp with time zone
);


ALTER TABLE public.comandas OWNER TO postgres;

--
-- Name: comprobantes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comprobantes (
    id_comprobante uuid NOT NULL,
    id_venta uuid NOT NULL,
    com_tipo character varying(20) DEFAULT 'Ticket'::character varying NOT NULL,
    com_serie character varying(10) DEFAULT 'T001'::character varying NOT NULL,
    com_numero integer NOT NULL,
    com_total numeric(8,2) NOT NULL,
    com_metodo_pago character varying(20) NOT NULL,
    com_fec_hora_utc timestamp with time zone NOT NULL,
    com_leyenda character varying(100) DEFAULT 'Documento sin validez tributaria'::character varying NOT NULL,
    com_estado character varying(20) DEFAULT 'Emitido'::character varying NOT NULL,
    fec_creacion_utc timestamp with time zone NOT NULL,
    com_tipo_doc_receptor character varying(10),
    com_num_doc_receptor character varying(15),
    com_razon_social_receptor character varying(200),
    com_direccion_receptor character varying(300),
    com_op_gravada numeric(8,2) DEFAULT 0.00 NOT NULL,
    com_igv numeric(8,2) DEFAULT 0.00 NOT NULL
);


ALTER TABLE public.comprobantes OWNER TO postgres;

--
-- Name: detalles_comanda; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalles_comanda (
    id_detalle_comanda uuid NOT NULL,
    id_comanda uuid NOT NULL,
    id_producto uuid,
    dtc_nombre_producto character varying(100) NOT NULL,
    dtc_cantidad integer NOT NULL,
    dtc_observacion character varying(100),
    fec_creacion_utc timestamp with time zone NOT NULL,
    id_menu_completo integer,
    dtc_elecciones character varying(250),
    dtc_incluye character varying(100)
);


ALTER TABLE public.detalles_comanda OWNER TO postgres;

--
-- Name: detalles_pedido; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalles_pedido (
    id_detalle uuid NOT NULL,
    id_pedido uuid NOT NULL,
    id_producto uuid,
    det_cantidad integer NOT NULL,
    det_precio_unitario numeric(8,2) NOT NULL,
    det_subtotal numeric(8,2) NOT NULL,
    det_observacion character varying(100),
    fec_creacion_utc timestamp with time zone NOT NULL,
    id_menu_completo integer,
    det_nombre character varying(100),
    det_incluye character varying(100)
);


ALTER TABLE public.detalles_pedido OWNER TO postgres;

--
-- Name: lineas_pedido_opciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lineas_pedido_opciones (
    id_linea_pedido_opcion uuid NOT NULL,
    id_detalle uuid NOT NULL,
    lpo_parte_nombre character varying(50) NOT NULL,
    id_producto uuid NOT NULL,
    lpo_producto_nombre character varying(100) NOT NULL,
    fec_creacion_utc timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL
);


ALTER TABLE public.lineas_pedido_opciones OWNER TO postgres;

--
-- Name: menu_dia_menus_completos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_dia_menus_completos (
    id_menu_dia_menu_completo uuid DEFAULT gen_random_uuid() NOT NULL,
    id_menu uuid NOT NULL,
    id_menu_completo integer NOT NULL,
    fec_creacion_utc timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.menu_dia_menus_completos OWNER TO postgres;

--
-- Name: menu_dia_platos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_dia_platos (
    id_menu_plato uuid NOT NULL,
    id_menu uuid NOT NULL,
    id_producto uuid NOT NULL,
    est_agotado boolean DEFAULT false NOT NULL,
    fec_cambio_disponibilidad_utc timestamp with time zone,
    nom_usuario_disponibilidad character varying(50)
);


ALTER TABLE public.menu_dia_platos OWNER TO postgres;

--
-- Name: menus_completos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menus_completos (
    id_menu_completo integer NOT NULL,
    nom_menu_completo character varying(100) NOT NULL,
    pre_menu_completo numeric(8,2) NOT NULL,
    est_menu_completo boolean DEFAULT true NOT NULL,
    det_incluye character varying(200),
    fec_actualizacion_utc timestamp with time zone
);


ALTER TABLE public.menus_completos OWNER TO postgres;

--
-- Name: menus_completos_partes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menus_completos_partes (
    id_parte integer NOT NULL,
    id_menu_completo integer NOT NULL,
    nom_parte character varying(100) NOT NULL,
    num_orden integer DEFAULT 1 NOT NULL,
    roles_permitidos character varying(100) NOT NULL
);


ALTER TABLE public.menus_completos_partes OWNER TO postgres;

--
-- Name: menus_completos_partes_id_parte_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.menus_completos_partes_id_parte_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.menus_completos_partes_id_parte_seq OWNER TO postgres;

--
-- Name: menus_completos_partes_id_parte_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.menus_completos_partes_id_parte_seq OWNED BY public.menus_completos_partes.id_parte;


--
-- Name: menus_dia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menus_dia (
    id_menu uuid NOT NULL,
    fec_menu date NOT NULL,
    id_desayuno uuid,
    nom_usuario_creacion character varying(50) NOT NULL,
    nom_usuario_actualizacion character varying(50),
    fec_creacion_utc timestamp with time zone NOT NULL,
    fec_actualizacion_utc timestamp with time zone
);


ALTER TABLE public.menus_dia OWNER TO postgres;

--
-- Name: mesas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mesas (
    id_mesa uuid NOT NULL,
    nom_mesa character varying(20) NOT NULL,
    nom_mesa_normalizado character varying(20) NOT NULL,
    est_ocupacion character varying(20) NOT NULL,
    est_activa boolean DEFAULT true NOT NULL,
    fec_creacion_utc timestamp with time zone NOT NULL,
    fec_actualizacion_utc timestamp with time zone
);


ALTER TABLE public.mesas OWNER TO postgres;

--
-- Name: pedidos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedidos (
    id_pedido uuid NOT NULL,
    ped_numero_diario integer NOT NULL,
    ped_fecha_operativa date NOT NULL,
    ped_fecha_hora_utc timestamp with time zone NOT NULL,
    ped_tipo character varying(20) NOT NULL,
    ped_estado character varying(20) NOT NULL,
    ped_total numeric(8,2) NOT NULL,
    ped_notas character varying(250),
    id_mesa uuid,
    id_usuario uuid NOT NULL,
    ped_solicitud_id character varying(100) NOT NULL,
    fec_creacion_utc timestamp with time zone NOT NULL,
    fec_actualizacion_utc timestamp with time zone,
    ped_motivo_anulacion character varying(100)
);


ALTER TABLE public.pedidos OWNER TO postgres;

--
-- Name: productos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.productos (
    id_producto uuid NOT NULL,
    nom_producto character varying(50) NOT NULL,
    nom_normalizado character varying(50) NOT NULL,
    cat_producto integer,
    pre_producto numeric(8,2),
    est_producto boolean DEFAULT true NOT NULL,
    fec_creacion_utc timestamp with time zone NOT NULL,
    fec_actualizacion_utc timestamp with time zone,
    tip_producto integer DEFAULT 1 NOT NULL,
    rol_componente integer
);


ALTER TABLE public.productos OWNER TO postgres;

--
-- Name: registros_ingreso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registros_ingreso (
    id_registro uuid NOT NULL,
    nom_usuario character varying(50) NOT NULL,
    fec_hora_utc timestamp with time zone NOT NULL,
    es_exitoso boolean NOT NULL,
    det_resultado character varying(250),
    dir_ip character varying(50)
);


ALTER TABLE public.registros_ingreso OWNER TO postgres;

--
-- Name: tokens_revocados; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tokens_revocados (
    id_token_revocado uuid NOT NULL,
    jti_token character varying(100) NOT NULL,
    nom_usuario character varying(50) NOT NULL,
    fec_expiracion_utc timestamp with time zone NOT NULL,
    fec_revocacion_utc timestamp with time zone NOT NULL,
    mot_revocacion character varying(50) NOT NULL
);


ALTER TABLE public.tokens_revocados OWNER TO postgres;

--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id_usuario uuid NOT NULL,
    nom_usuario character varying(30) NOT NULL,
    nom_completo character varying(150) NOT NULL,
    cor_usuario character varying(100),
    has_usuario text NOT NULL,
    rol_usuario integer NOT NULL,
    est_usuario boolean DEFAULT true NOT NULL,
    int_fallidos integer DEFAULT 0 NOT NULL,
    bloq_hasta_utc timestamp with time zone,
    fec_creacion_utc timestamp with time zone NOT NULL,
    fec_actualizacion_utc timestamp with time zone
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: ventas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ventas (
    id_venta uuid NOT NULL,
    id_pedido uuid NOT NULL,
    id_usuario uuid NOT NULL,
    id_caja uuid NOT NULL,
    ven_total numeric(8,2) NOT NULL,
    ven_metodo_pago character varying(20) NOT NULL,
    ven_monto_recibido numeric(8,2),
    ven_vuelto numeric(8,2),
    ven_yape_confirmado boolean DEFAULT false NOT NULL,
    ven_yape_referencia character varying(20),
    ven_solicitud_id character varying(100) NOT NULL,
    ven_estado character varying(20) DEFAULT 'Vigente'::character varying NOT NULL,
    ven_fecha_hora_utc timestamp with time zone NOT NULL,
    fec_creacion_utc timestamp with time zone NOT NULL,
    ven_motivo_anulacion character varying(200),
    ven_usuario_anulacion character varying(100),
    ven_fec_anulacion_utc timestamp with time zone,
    ven_destino_pedido character varying(20)
);


ALTER TABLE public.ventas OWNER TO postgres;

--
-- Name: menus_completos_partes id_parte; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menus_completos_partes ALTER COLUMN id_parte SET DEFAULT nextval('public.menus_completos_partes_id_parte_seq'::regclass);


--
-- Data for Name: auditorias_cobro; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auditorias_cobro (id_auditoria, nom_cajero, accion_realizada, num_pedido, comprobante, medio_pago, total, monto_recibido, vuelto, detalle, fec_registro_utc, dir_ip) FROM stdin;
59912459-69d5-4108-8f7f-05e232972470	admin	COBRAR_PEDIDO	1	T001-000001	Efectivo	18.00	18.00	0.00	Cobro exitoso Pedido #1 (Mesa 1). Comprobante: T001-000001.	2026-10-18 17:35:58.023929-05	::1
\.


--
-- Data for Name: auditorias_mesa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auditorias_mesa (id_auditoria, nom_admin, accion_realizada, nom_mesa, detalle, fec_registro_utc, dir_ip) FROM stdin;
\.


--
-- Data for Name: auditorias_pedido; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auditorias_pedido (id_auditoria, nom_usuario, accion_realizada, nom_mesa, num_pedido, detalle, fec_registro_utc, dir_ip) FROM stdin;
8f676370-8fbc-4e1a-8c8f-b7ae78f85307	lperez	RegistroPedido	Mesa 1	1	Pedido #1 registrado para Mesa 1. Líneas: 2. Total: S/ 18.00	2026-10-17 20:12:10.591844-05	::1
40d6cd8a-e55c-4eca-8632-06a6b5cce8cf	lperez	RegistroPedido	Mesa 2	2	Pedido #2 registrado para Mesa 2. Líneas: 2. Total: S/ 18.00	2026-10-17 20:17:14.158608-05	::1
9ad60234-e725-4b93-82f1-0fc3930b0501	lperez	RegistroPedido	Mesa 4	3	Pedido #3 registrado para Mesa 4. Líneas: 2. Total: S/ 18.00	2026-10-17 20:19:02.541797-05	::1
1ab25e6f-731d-4edb-9faa-1caff1644c59	lperez	AmpliacionPedido	Mesa 4	3	Ampliación de pedido #3 con 1 nuevas líneas. Nuevo total: S/ 23.00	2026-10-17 20:19:02.770753-05	::1
7e3c0444-30a7-4c1c-84a2-f6a7e57f7ee4	atorres	RegistroPedidoLlevar	Para llevar	4	Pedido para llevar #4 registrado (Ref: Sra. Rosa). Líneas: 1. Total: S/ 10.00	2026-10-17 21:02:43.800509-05	::1
7e9e1786-f0e4-471e-9a88-bac59c3d5e24	atorres	RegistroPedidoLlevar	Para llevar	5	Pedido para llevar #5 registrado (Ref: Test Idempotencia). Líneas: 1. Total: S/ 5.00	2026-10-17 21:05:01.774801-05	::1
1e77761b-43c7-47f0-bc2f-89d8adb05729	admin	RegistroPedidoLlevar	Para llevar	6	Pedido para llevar #6 registrado (Ref: Elena Flores). Líneas: 2. Total: S/ 13,00	2026-10-17 22:02:09.022881-05	::1
3a035948-729f-4d61-b54b-348287639414	msoto	INICIAR_PREPARACION_COMANDA	Mesa 1	1	Comanda N.º 1 en preparación.	2026-10-17 22:26:54.1028-05	\N
d5cd8afa-5945-43a0-a4a8-260100940417	msoto	INICIAR_PREPARACION_COMANDA	Mesa 2	1	Comanda N.º 1 en preparación.	2026-10-17 22:27:01.69904-05	\N
dc76481f-6205-4c49-bd0f-1def7e727052	msoto	INICIAR_PREPARACION_COMANDA	Mesa 4	1	Comanda N.º 1 en preparación.	2026-10-17 22:27:12.816681-05	\N
328dbba9-a976-42be-abdb-7f64ea54602d	msoto	MARCAR_COMANDA_LISTA	Mesa 1	1	Comanda N.º 1 marcada como lista. Se avisó a el mozo.	2026-10-17 22:30:28.190322-05	\N
7f5aee35-d9be-4770-a899-8d21bcf735ff	msoto	MARCAR_COMANDA_LISTA	Mesa 2	1	Comanda N.º 1 marcada como lista. Se avisó a el mozo.	2026-10-17 22:30:33.810172-05	\N
c7da5e15-30be-4213-a8f7-1783bb471297	lperez	Aviso de comanda visto	Mesa 2	2	Aviso de comanda lista visto y cerrado por lperez.	2026-10-17 22:30:43.661029-05	::1
1a0bbfc3-f570-4361-b92a-94d10d732a81	lperez	Aviso de comanda visto	Mesa 1	1	Aviso de comanda lista visto y cerrado por lperez.	2026-10-17 22:30:44.910809-05	::1
2a896651-c8ae-4dee-be0a-941adb3b831c	admin	RegistroPedidoLlevar	Para llevar	7	Pedido para llevar #7 registrado. Líneas: 2. Total: S/ 13,00	2026-10-17 22:44:33.653178-05	::1
248fa0e9-6992-4151-b8c6-80d8f965dc28	msoto	INICIAR_PREPARACION_COMANDA	Mesa 4	1	Comanda N.º 1 en preparación.	2026-10-17 23:07:36.960521-05	\N
ea52cce6-c311-4694-88c1-97d3c1158edf	msoto	INICIAR_PREPARACION_COMANDA	Para llevar - Test Idempotencia	1	Comanda N.º 1 en preparación.	2026-10-17 23:07:39.171705-05	\N
e43832a0-4c9d-4397-ae44-97c8e4b729bd	msoto	INICIAR_PREPARACION_COMANDA	Para llevar - Elena Flores	1	Comanda N.º 1 en preparación.	2026-10-17 23:07:42.332107-05	\N
e5ab9a17-583f-4e7f-b24c-0975b3aa15b2	msoto	INICIAR_PREPARACION_COMANDA	Para llevar - Sra. Rosa	1	Comanda N.º 1 en preparación.	2026-10-17 23:07:43.567335-05	\N
5985bdef-75c7-414c-9324-f502e1cb16e0	msoto	INICIAR_PREPARACION_COMANDA	Para llevar	1	Comanda N.º 1 en preparación.	2026-10-17 23:07:44.737463-05	\N
b9b21234-dcdd-42d5-bc30-bba20431e8f4	msoto	MARCAR_COMANDA_LISTA	Mesa 4	1	Comanda N.º 1 marcada como lista. Se avisó a el mozo.	2026-10-17 23:07:48.396862-05	\N
88134ff1-c998-4f09-9be9-0dc3c30aae6b	msoto	MARCAR_COMANDA_LISTA	Mesa 4	1	Comanda N.º 1 marcada como lista. Se avisó a el mozo.	2026-10-17 23:07:49.151491-05	\N
132ebfb3-98a7-463e-af7d-480716fd3440	msoto	MARCAR_COMANDA_LISTA	Para llevar - Sra. Rosa	1	Comanda N.º 1 marcada como lista. Se avisó a el cajero.	2026-10-17 23:07:49.663016-05	\N
3d71cbc9-cba3-43dc-ac59-cfb76803cb23	msoto	MARCAR_COMANDA_LISTA	Para llevar - Test Idempotencia	1	Comanda N.º 1 marcada como lista. Se avisó a el cajero.	2026-10-17 23:07:50.11747-05	\N
9bacdcf3-9909-4233-ad16-9227cc02690c	msoto	MARCAR_COMANDA_LISTA	Para llevar - Elena Flores	1	Comanda N.º 1 marcada como lista. Se avisó a el cajero.	2026-10-17 23:07:50.516632-05	\N
13d985d8-712d-49d4-addd-f8dd58698c20	msoto	MARCAR_COMANDA_LISTA	Para llevar	1	Comanda N.º 1 marcada como lista. Se avisó a el cajero.	2026-10-17 23:07:51.094075-05	\N
41bea9f1-63e7-46ee-899d-97d3475dec9d	admin	RegistroPedido	Mesa 1	1	Pedido #1 registrado para Mesa 1. Líneas: 1. Total: S/ 8,00	2026-10-19 11:52:28.84478-05	::1
0fedd3c0-9e6c-4595-94db-b04f3b1610a9	admin	INICIAR_PREPARACION_COMANDA	Mesa 1	1	Comanda N.º 1 en preparación.	2026-10-19 11:52:44.066854-05	\N
a016280d-fa30-4bef-aa0e-058a2230d248	admin	RegistroPedido	Mesa 8	2	Pedido #2 registrado para Mesa 8. Líneas: 4. Total: S/ 31,00	2026-10-19 11:55:08.276356-05	::1
1e7778d2-d7bf-4295-b7bc-9d0c07965983	admin	MARCAR_COMANDA_LISTA	Mesa 1	1	Comanda N.º 1 marcada como lista. Se avisó a el mozo.	2026-10-19 11:57:36.664726-05	\N
\.


--
-- Data for Name: auditorias_reporte; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auditorias_reporte (id_auditoria, nom_usuario, tip_reporte, ran_reporte, for_reporte, fec_registro_utc, dir_ip) FROM stdin;
\.


--
-- Data for Name: auditorias_usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auditorias_usuario (id_auditoria, nom_admin, accion_realizada, nom_usuario_afectado, detalle, fec_registro_utc, dir_ip) FROM stdin;
9828bdf8-472c-4fef-96b3-041005213c66	admin	REGISTRO	dramos	Rol asignado: Mozo	2026-10-16 17:45:59.571128-05	::1
27d6f6b3-6218-4992-ae86-d56be23bf164	admin	EDICION_Y_PASSWORD	dramos	Rol: Mozo	2026-10-16 17:45:59.761011-05	::1
aca124a4-6948-493c-898d-6feb21700962	admin	DESACTIVACION	dramos	Estado cambiado a Inactivo	2026-10-16 17:45:59.789542-05	::1
db1ce097-0559-4bfa-9967-1a0d0465cde3	admin	ACTIVACION	dramos	Estado cambiado a Activo	2026-10-16 17:45:59.800107-05	::1
4a015e9b-f377-4ebf-867f-3421b1ab53b9	admin	ELIMINACION	dramos	Eliminación física del usuario sin movimientos	2026-10-16 17:45:59.889374-05	::1
47b5cd02-2d30-4de9-abad-dc50b14c9b6e	admin	REGISTRO	dramos	Rol asignado: Mozo	2026-10-16 17:46:13.952926-05	::1
6c96395b-3765-4f30-8a7c-e3c9cc663554	admin	EDICION_Y_PASSWORD	dramos	Rol: Mozo	2026-10-16 17:46:14.005161-05	::1
c9d9d031-4f35-4904-bf3c-29747dcfcd9a	admin	DESACTIVACION	dramos	Estado cambiado a Inactivo	2026-10-16 17:46:14.014901-05	::1
3ee32020-29a0-4cc8-b76c-0a28c36cfa8a	admin	ACTIVACION	dramos	Estado cambiado a Activo	2026-10-16 17:46:14.025161-05	::1
21d685c2-004e-49a6-a202-1322d19c662b	admin	REGISTRO	useruuxx	Rol asignado: Mozo	2026-10-16 17:47:15.837625-05	::1
293e66d0-a4c1-4c65-9aea-d68c56f9a7c2	admin	EDICION_Y_PASSWORD	useruuxx	Rol: Mozo	2026-10-16 17:47:15.883332-05	::1
5d512099-c591-42b8-a6d3-4a1360eb1511	admin	DESACTIVACION	useruuxx	Estado cambiado a Inactivo	2026-10-16 17:47:15.891515-05	::1
579f9220-824f-462d-b67f-dab5ba5447c4	admin	ACTIVACION	useruuxx	Estado cambiado a Activo	2026-10-16 17:47:15.899596-05	::1
684f228e-e3f1-4977-9047-500064ca76ee	admin	ELIMINACION	useruuxx	Eliminación física del usuario sin movimientos	2026-10-16 17:47:15.919711-05	::1
5c616396-f79a-4670-947c-5a95723f6349	admin	CIERRE_SESION	admin	Cierre por 5 intentos fallidos consecutivos al cambiar contraseña	2026-10-16 18:31:03.03906-05	::1
b4eb06a2-c115-4a05-8b90-84995d0a3d18	admin	CAMBIO_PASSWORD_PROPIA	admin	Cambio de contraseña exitoso desde perfil (barra superior)	2026-10-16 18:31:03.166805-05	::1
5d70339a-6e53-4ec5-8747-278689c3f40a	admin	CAMBIO_PASSWORD_PROPIA	admin	Cambio de contraseña exitoso desde perfil (barra superior)	2026-10-16 18:31:03.273654-05	::1
71982919-152a-42af-801f-97cb7d7268fa	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-16 18:31:03.294138-05	::1
1c343b5e-8738-4382-a235-e42e3107fb5a	admin	CAMBIO_PASSWORD_PROPIA	admin	Cambio de contraseña exitoso desde perfil (barra superior)	2026-10-16 18:31:28.951371-05	::1
f24816a0-7615-4e0c-85a4-103c92ad2f5b	admin	CAMBIO_PASSWORD_PROPIA	admin	Cambio de contraseña exitoso desde perfil (barra superior)	2026-10-16 18:31:34.279343-05	::1
ca1b88c5-c638-4872-8d19-fc31bac837c1	admin	CIERRE_SESION	admin	Cierre por 5 intentos fallidos consecutivos al cambiar contraseña	2026-10-16 18:31:59.840119-05	::1
0cfe83a3-a322-4fb9-a0f9-fe9923f42d5d	admin	CAMBIO_PASSWORD_PROPIA	admin	Cambio de contraseña exitoso desde perfil (barra superior)	2026-10-16 18:31:59.951453-05	::1
3e80b74b-60b0-434b-8fe1-1005b42f3391	admin	CAMBIO_PASSWORD_PROPIA	admin	Cambio de contraseña exitoso desde perfil (barra superior)	2026-10-16 18:32:00.059989-05	::1
912483f5-e8cf-4a4c-8405-cf15499cf94b	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-16 18:32:00.066223-05	::1
f9205382-e42f-4799-a31d-d2eb0abce749	admin	CIERRE_SESION	admin	Cierre por 5 intentos fallidos consecutivos al cambiar contraseña	2026-10-16 18:32:06.588246-05	::1
df4cab78-dcee-49c6-b50a-ca9e1cfe6070	admin	CIERRE_SESION	admin	Cierre por 5 intentos fallidos consecutivos al cambiar contraseña	2026-10-16 18:32:16.262804-05	::1
8653969d-41c9-4ad6-8f81-e7f0981303c4	admin	CAMBIO_PASSWORD_PROPIA	admin	Cambio de contraseña exitoso desde perfil (barra superior)	2026-10-16 18:32:16.373409-05	::1
00192c46-4f81-44c4-99f4-c63b6b7e9fef	admin	CAMBIO_PASSWORD_PROPIA	admin	Cambio de contraseña exitoso desde perfil (barra superior)	2026-10-16 18:32:16.481747-05	::1
56c713aa-a8a2-4993-9202-d724074dedd9	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-16 18:32:16.488229-05	::1
e8e84bc6-8ddb-48c8-beb3-b0a42e43c7a0	admin	CIERRE_SESION	admin	Cierre por 5 intentos fallidos consecutivos al cambiar contraseña	2026-10-17 10:31:48.107233-05	::1
eb7f8e8d-3741-4521-aa9a-fcde11877420	admin	CAMBIO_PASSWORD_PROPIA	admin	Cambio de contraseña exitoso desde perfil (barra superior)	2026-10-17 10:31:48.285187-05	::1
b2316fd7-6422-4772-a688-7e2674d15ad7	admin	CAMBIO_PASSWORD_PROPIA	admin	Cambio de contraseña exitoso desde perfil (barra superior)	2026-10-17 10:31:48.422941-05	::1
31b0aa3f-7e2e-44f2-af42-33edf09faf30	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-17 10:31:48.451836-05	::1
66c7a909-d2b7-42c5-8739-5e462dd12330	admin	EDICION	dramos	Rol: Mozo	2026-10-17 11:03:53.379952-05	::1
b092c7ea-b69c-47f7-8f85-f49fd4fdb254	admin	EDICION	msoto	Rol: Cocinero	2026-10-17 11:04:09.421169-05	::1
47cce813-8a0a-42aa-8319-7d786faf5cec	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-17 11:06:17.681518-05	::1
79da0405-cd06-49a6-b8bb-acdf12bd8116	atorres	CIERRE_SESION	atorres	Cierre de sesión motivo: manual	2026-10-17 11:07:51.13902-05	::1
d0e268e8-5741-4d58-8e8a-398a638ae88b	admin	CIERRE_SESION	admin	Cierre por 5 intentos fallidos consecutivos al cambiar contraseña	2026-10-17 11:10:16.350586-05	::1
a7127869-9cd1-4108-be6e-517d26f23ed5	admin	CAMBIO_PASSWORD_PROPIA	admin	Cambio de contraseña exitoso desde perfil (barra superior)	2026-10-17 11:10:16.47598-05	::1
ada14d6c-96a2-41f4-bfa1-2bd01b3591fb	admin	CAMBIO_PASSWORD_PROPIA	admin	Cambio de contraseña exitoso desde perfil (barra superior)	2026-10-17 11:10:16.594056-05	::1
aa558490-a500-4286-9638-f3dbf5d143f3	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-17 11:10:16.601691-05	::1
cf471a27-dc30-416c-bb99-f968e2a5958a	admin	CIERRE_SESION	admin	Cierre por 5 intentos fallidos consecutivos al cambiar contraseña	2026-10-17 11:16:18.571489-05	::1
6f3eb5b4-7014-4331-805c-24e8ead8f915	admin	CAMBIO_PASSWORD_PROPIA	admin	Cambio de contraseña exitoso desde perfil (barra superior)	2026-10-17 11:16:18.703175-05	::1
52d29af1-fcfe-4561-b535-4932199c4088	admin	CAMBIO_PASSWORD_PROPIA	admin	Cambio de contraseña exitoso desde perfil (barra superior)	2026-10-17 11:16:18.831357-05	::1
d902b860-e628-485b-822a-51b12b71b779	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-17 11:16:18.840147-05	::1
ce26fed5-653c-4677-b57a-24a331f7e42f	admin	CIERRE_SESION	admin	Cierre por 5 intentos fallidos consecutivos al cambiar contraseña	2026-10-17 11:22:56.686076-05	::1
e5b7c72e-dfd2-44cc-868c-701c8477ce33	admin	CAMBIO_PASSWORD_PROPIA	admin	Cambio de contraseña exitoso desde perfil (barra superior)	2026-10-17 11:22:56.815812-05	::1
8bb10d77-c5c9-4a39-b1e3-2c72095ffba5	admin	CAMBIO_PASSWORD_PROPIA	admin	Cambio de contraseña exitoso desde perfil (barra superior)	2026-10-17 11:22:56.95204-05	::1
cab3fac4-43cc-4ac5-ab7c-610b312a637a	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-17 11:22:56.95963-05	::1
f91dd7b5-7d9a-4358-9c63-25fc5018e4a8	admin	CIERRE_SESION	admin	Cierre por 5 intentos fallidos consecutivos al cambiar contraseña	2026-10-17 11:37:44.342677-05	::1
4bce712a-7fd9-4d49-8833-9bc60a532e89	admin	CAMBIO_PASSWORD_PROPIA	admin	Cambio de contraseña exitoso desde perfil (barra superior)	2026-10-17 11:37:44.442218-05	::1
f2ab0136-9300-45a1-8e4e-739003528f89	admin	CAMBIO_PASSWORD_PROPIA	admin	Cambio de contraseña exitoso desde perfil (barra superior)	2026-10-17 11:37:44.553552-05	::1
41c62ffa-6c00-43fb-91e7-17dbfc0ae203	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-17 11:37:44.560213-05	::1
414fc684-1e7b-4ca1-8ed4-471756deecb3	admin	CIERRE_SESION	admin	Cierre por 5 intentos fallidos consecutivos al cambiar contraseña	2026-10-17 11:48:49.538588-05	::1
ec03b266-548e-4ee7-ba37-2040d58a12c4	admin	CAMBIO_PASSWORD_PROPIA	admin	Cambio de contraseña exitoso desde perfil (barra superior)	2026-10-17 11:48:49.653483-05	::1
3386002f-d4e9-4b1d-a826-ce0f12e2d079	admin	CAMBIO_PASSWORD_PROPIA	admin	Cambio de contraseña exitoso desde perfil (barra superior)	2026-10-17 11:48:49.769169-05	::1
92658216-c7e5-4797-a35a-18ff5c89c839	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-17 11:48:49.774776-05	::1
2d126ba8-b378-4349-8eae-76e973053b3a	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-17 11:54:46.580732-05	::1
15314d70-9d05-4b1d-88dc-e7fde993253b	atorres	CIERRE_SESION	atorres	Cierre de sesión motivo: manual	2026-10-17 11:55:01.958667-05	::1
62f0c9fb-c5b7-404f-9265-20bd5918f856	admin	CIERRE_SESION	admin	Cierre por 5 intentos fallidos consecutivos al cambiar contraseña	2026-10-17 11:55:29.285075-05	::1
b475c4e4-9a4d-428e-b671-b70683ffd9dc	admin	CAMBIO_PASSWORD_PROPIA	admin	Cambio de contraseña exitoso desde perfil (barra superior)	2026-10-17 11:55:29.404377-05	::1
4cae8d36-ee15-4422-9ee3-2f3c7a503798	admin	CAMBIO_PASSWORD_PROPIA	admin	Cambio de contraseña exitoso desde perfil (barra superior)	2026-10-17 11:55:29.539851-05	::1
ac0a5465-5229-4da4-a373-116580ee9bb6	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-17 11:55:29.550326-05	::1
ab2b6d5c-dc40-49b4-ab30-8a3681e2c413	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-17 11:56:40.770077-05	::1
598a7707-7ca2-409a-9638-b1e6a369a64e	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-17 12:01:12.068563-05	::1
2883b41d-b30d-4ebb-92ad-5f84ad751b90	admin	CIERRE_SESION	admin	Cierre por 5 intentos fallidos consecutivos al cambiar contraseña	2026-10-17 12:05:32.134417-05	::1
468545e4-5e44-4ef6-98fb-25bc2cc00c53	admin	CAMBIO_PASSWORD_PROPIA	admin	Cambio de contraseña exitoso desde perfil (barra superior)	2026-10-17 12:05:32.264003-05	::1
a546658f-6391-42b0-8070-7a246d7c7900	admin	CAMBIO_PASSWORD_PROPIA	admin	Cambio de contraseña exitoso desde perfil (barra superior)	2026-10-17 12:05:32.378304-05	::1
7d0ddc79-afa7-45f8-8701-fa2dde1390fd	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-17 12:05:32.388906-05	::1
5f0fea88-4883-474d-aa08-3ce629b4421a	admin	CIERRE_SESION	admin	Cierre por 5 intentos fallidos consecutivos al cambiar contraseña	2026-10-17 12:29:03.462641-05	::1
f3775592-e1ef-4e9f-871f-b19116b16898	admin	CAMBIO_PASSWORD_PROPIA	admin	Cambio de contraseña exitoso desde perfil (barra superior)	2026-10-17 12:29:03.583093-05	::1
f768d2c4-9bf2-4158-81cd-d3f790d4d529	admin	CAMBIO_PASSWORD_PROPIA	admin	Cambio de contraseña exitoso desde perfil (barra superior)	2026-10-17 12:29:03.716947-05	::1
f7f2950a-b756-43c0-9ca9-e206daf3670d	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-17 12:29:03.724709-05	::1
3c8879a2-a66b-4d5c-bd4c-0f4714480f2e	admin	CIERRE_SESION	admin	Cierre por 5 intentos fallidos consecutivos al cambiar contraseña	2026-10-17 12:34:05.059451-05	::1
458a6d2f-85f4-4bea-be9e-6325969ac5b5	admin	CAMBIO_PASSWORD_PROPIA	admin	Cambio de contraseña exitoso desde perfil (barra superior)	2026-10-17 12:34:05.171194-05	::1
26552f5d-2aba-46ec-a3ce-8f9dcc0b7cff	admin	CAMBIO_PASSWORD_PROPIA	admin	Cambio de contraseña exitoso desde perfil (barra superior)	2026-10-17 12:34:05.276135-05	::1
b5b92cdf-539a-4cd4-b1c8-7ee6759a4c4f	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-17 12:34:05.286287-05	::1
9a9d9fc7-5ea1-4d27-afb5-778339f4f76c	atorres	CIERRE_SESION	atorres	Cierre de sesión motivo: manual	2026-10-17 21:09:17.061388-05	::1
0d2b241e-0b9c-4b76-8fe1-6c136f39a845	lperez	CIERRE_SESION	lperez	Cierre de sesión motivo: manual	2026-10-17 21:09:28.496951-05	::1
587b2666-6190-443e-a258-1ecef61dc804	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-17 22:26:36.651846-05	::1
de5538fa-86db-4625-8c2c-b0d46751d9d7	msoto	CIERRE_SESION	msoto	Cierre de sesión motivo: manual	2026-10-17 22:30:36.13322-05	::1
e74629a3-099e-4d62-a795-47e6a31917d3	lperez	CIERRE_SESION	lperez	Cierre de sesión motivo: manual	2026-10-17 22:31:21.999813-05	::1
363a1c32-a314-4f4d-9e02-462ad64c1e9e	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-17 22:51:12.909842-05	::1
383f3fdb-a7e0-4670-ad1c-095f0bd17967	lperez	CIERRE_SESION	lperez	Cierre de sesión motivo: manual	2026-10-17 22:52:13.740937-05	::1
d63465a7-9038-40fa-8dd7-613ca801bb10	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-17 22:55:40.285171-05	::1
4e9bb002-f1ed-42b0-a603-a5114903290d	atorres	CIERRE_SESION	atorres	Cierre de sesión motivo: manual	2026-10-17 22:58:39.548223-05	::1
62759837-1fdf-4b95-91eb-03a9412b18ab	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-17 23:06:59.790734-05	::1
43dd836c-795a-4c77-bfcf-16059d7eba36	lperez	CIERRE_SESION	lperez	Cierre de sesión motivo: manual	2026-10-17 23:07:11.122359-05	::1
8c4761ca-d6a9-4978-80b9-c6199407668c	msoto	CIERRE_SESION	msoto	Cierre de sesión motivo: manual	2026-10-17 23:08:32.476095-05	::1
b1c2376f-5b5f-43ec-9241-63eb830c9ea1	msoto	CIERRE_SESION	msoto	Cierre de sesión motivo: manual	2026-10-17 23:13:43.563661-05	::1
1287b8fa-f4f6-49f7-a1cd-960e278b714c	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-18 13:20:40.82407-05	::1
a43848ca-73f8-49b5-855f-2ea1feed29bd	atorres	CIERRE_SESION	atorres	Cierre de sesión motivo: manual	2026-10-18 13:21:06.128871-05	::1
b538db16-a22c-4e25-b583-ee103fdc920d	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-18 13:24:45.45238-05	::1
d7abb132-c33b-4fd0-b5bd-157456ce4272	atorres	CIERRE_SESION	atorres	Cierre de sesión motivo: manual	2026-10-18 13:37:14.362029-05	::1
54ac11fb-971e-4c34-90fc-191906b72ef4	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-18 14:02:04.009934-05	::1
d9e92e62-76f8-416b-86c2-accda80cfafa	atorres	CIERRE_SESION	atorres	Cierre de sesión motivo: manual	2026-10-18 14:02:21.532302-05	::1
f1b3ebe2-dc16-4113-80ea-25f836b20cde	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-18 14:54:22.454599-05	::1
6c7a36d3-d24f-45cc-9c1e-beb10fac7e4d	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-18 17:38:47.762809-05	::1
6d7735dd-0a03-41c7-904f-af81c7fc1c10	atorres	CIERRE_SESION	atorres	Cierre de sesión motivo: manual	2026-10-18 17:39:17.09952-05	::1
95b6b170-5d34-408c-ae28-3aab809c6902	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-18 17:42:56.058032-05	::1
b3c35a86-87b5-4486-b414-e782d6458582	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-19 00:54:49.131937-05	::1
05430975-25e2-42ad-a826-256e61810688	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-19 11:57:41.664529-05	::1
6375dba0-b1ed-4a6b-806d-174d7ada3db7	lperez	CIERRE_SESION	lperez	Cierre de sesión motivo: manual	2026-10-19 12:07:50.586104-05	::1
b01e551d-f38d-4e58-a633-40e3d7ef8071	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-19 12:36:25.805299-05	::1
698f0fb3-7041-41ad-a078-99789fd9823d	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-19 13:01:06.061029-05	::1
77aab37c-7295-492d-8059-8e56b149f7b6	atorres	CIERRE_SESION	atorres	Cierre de sesión motivo: manual	2026-10-19 13:01:33.14649-05	::1
49618e98-fc5a-4028-960d-6c6fea65951b	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-19 13:16:14.244489-05	::1
47d763ed-836f-4a43-afe7-31a6557c5b7e	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-19 13:24:48.984005-05	::1
d0b483de-ccca-454c-a7b6-e985e3a0afbf	admin	CIERRE_SESION	admin	Cierre de sesión motivo: manual	2026-10-19 13:40:27.09034-05	::1
\.


--
-- Data for Name: cajas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cajas (id_caja, id_usuario, caj_monto_apertura, caj_monto_cierre, caj_fec_apertura_utc, caj_fec_cierre_utc, caj_estado, fec_creacion_utc, fec_actualizacion_utc, caj_mon_esperado, caj_diferencia, caj_tot_efectivo, caj_tot_yape, caj_tot_ventas, caj_can_ventas, caj_observacion, caj_id_usu_cierre, caj_solicitud_id, caj_solicitud_id_cierre) FROM stdin;
7626c8ac-835b-400c-9462-847bc031401b	920ba4f1-d552-4c76-b1c0-087b3b75770c	68.00	\N	2026-10-19 13:01:15.975085-05	\N	Abierta	2026-10-19 13:01:15.975332-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	79e4c614-8f24-49d1-9d51-5dbde47885dc	\N
2ce4ef96-2d32-4e3a-b70c-90ffaf48c4e3	920ba4f1-d552-4c76-b1c0-087b3b75770c	50.00	68.00	2026-10-18 13:25:21.153568-05	2026-10-18 17:43:21.208942-05	Cerrada	2026-10-18 13:25:21.154262-05	2026-10-18 17:43:21.209093-05	68.00	0.00	18.00	0.00	18.00	1	\N	920ba4f1-d552-4c76-b1c0-087b3b75770c	8eea75b5-38f2-4cad-bb53-5bc7591c2100	09379d77-2c33-44d2-ac4f-49e9804f7ea7
\.


--
-- Data for Name: codigos_recuperacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.codigos_recuperacion (id_codigo, cor_usuario, cod_recuperacion, fec_expiracion_utc, es_usado, fec_creacion_utc) FROM stdin;
\.


--
-- Data for Name: comandas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comandas (id_comanda, id_pedido, cmd_numero_diario, cmd_fecha_hora_utc, cmd_estado, cmd_es_adicional, cmd_nombre_mesa, fec_creacion_utc, cmd_modificada, cmd_aviso_visto, cmd_fec_aviso_visto_utc, cmd_nom_usuario_aviso_visto, cmd_fec_inicio_preparacion_utc, cmd_nom_usuario_preparacion, cmd_fec_lista_utc, cmd_nom_usuario_lista, cmd_estado_anterior, cmd_fec_ultimo_cambio_estado_utc) FROM stdin;
315a1286-3bee-4681-98a6-7cdba2d8a001	03876d35-b378-4772-98cb-50238d1188e0	1	2026-10-17 20:12:10.349546-05	Lista	f	Mesa 1	2026-10-17 20:12:10.349688-05	f	t	2026-10-17 22:30:44.90899-05	lperez	2026-10-17 22:26:53.950773-05	msoto	2026-10-17 22:30:28.18203-05	msoto	EnPreparacion	2026-10-17 22:30:28.182584-05
85fba1d3-9ac2-40ec-8e19-ef30cfdf7de7	222f091e-3836-4241-9d74-aaaaa52e8ee3	2	2026-10-19 11:55:08.246986-05	Pendiente	f	Mesa 8	2026-10-19 11:55:08.246986-05	f	f	\N	\N	\N	\N	\N	\N	\N	\N
46c3fa97-1a5c-40d5-abba-adf6731fe8cf	17641da5-54b7-4f44-943b-5675a9b7988e	1	2026-10-19 11:52:28.501423-05	Lista	f	Mesa 1	2026-10-19 11:52:28.50186-05	f	f	\N	\N	2026-10-19 11:52:44.029363-05	admin	2026-10-19 11:57:36.652713-05	admin	EnPreparacion	2026-10-19 11:57:36.653109-05
a80962ee-a6fd-4f90-98bf-094544763051	d58ffebd-c2b7-445d-a3e3-dfd5742c33fc	1	2026-10-17 20:17:13.935934-05	Cancelada	f	Mesa 2	2026-10-17 20:17:13.936083-05	f	t	2026-10-17 22:30:43.652823-05	lperez	2026-10-17 22:27:01.690213-05	msoto	2026-10-17 22:30:33.804156-05	msoto	EnPreparacion	2026-10-17 22:30:33.804157-05
31baa64b-40c7-47c9-b3ba-dbf16b10e2f6	3a24ca76-f431-4600-9c84-f10fc239a053	1	2026-10-17 20:19:02.343073-05	Cancelada	f	Mesa 4	2026-10-17 20:19:02.343208-05	f	f	\N	\N	2026-10-17 22:27:12.702438-05	msoto	2026-10-17 23:07:48.393988-05	msoto	EnPreparacion	2026-10-17 23:07:48.393989-05
0ced0c10-64ea-4065-9103-c39af5f68bda	3a24ca76-f431-4600-9c84-f10fc239a053	1	2026-10-17 20:19:02.728114-05	Cancelada	t	Mesa 4	2026-10-17 20:19:02.728115-05	f	f	\N	\N	2026-10-17 23:07:36.953673-05	msoto	2026-10-17 23:07:49.146032-05	msoto	EnPreparacion	2026-10-17 23:07:49.146033-05
a3fe21ae-7949-4a7b-bdef-42e50d7afa56	75ce0236-ebdc-4810-9204-df2bb000f4f7	1	2026-10-17 21:02:43.632278-05	Cancelada	f	Para llevar - Sra. Rosa	2026-10-17 21:02:43.632449-05	f	f	\N	\N	2026-10-17 23:07:43.561088-05	msoto	2026-10-17 23:07:49.657068-05	msoto	EnPreparacion	2026-10-17 23:07:49.657069-05
5c383c73-bba0-46b8-b422-fb365faad080	9ff6d8bb-1c9b-49ee-bb96-b6c0e00c9f37	1	2026-10-17 21:05:01.770938-05	Cancelada	f	Para llevar - Test Idempotencia	2026-10-17 21:05:01.770938-05	f	f	\N	\N	2026-10-17 23:07:39.165175-05	msoto	2026-10-17 23:07:50.110642-05	msoto	EnPreparacion	2026-10-17 23:07:50.110645-05
77a87aa4-a3e9-483d-a740-acdc4d1ae0f0	5847ea15-dba5-4440-8344-fbf8fc238d78	1	2026-10-17 22:02:08.760149-05	Cancelada	f	Para llevar - Elena Flores	2026-10-17 22:02:08.760482-05	f	f	\N	\N	2026-10-17 23:07:42.322421-05	msoto	2026-10-17 23:07:50.5108-05	msoto	EnPreparacion	2026-10-17 23:07:50.510802-05
d8fac8a7-f511-421b-aecf-b93a48a4afd1	e0e1adea-5a2a-4ec8-b746-b244178e84c0	1	2026-10-17 22:44:33.514747-05	Cancelada	f	Para llevar	2026-10-17 22:44:33.515015-05	f	f	\N	\N	2026-10-17 23:07:44.73183-05	msoto	2026-10-17 23:07:51.087547-05	msoto	EnPreparacion	2026-10-17 23:07:51.087548-05
\.


--
-- Data for Name: comprobantes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comprobantes (id_comprobante, id_venta, com_tipo, com_serie, com_numero, com_total, com_metodo_pago, com_fec_hora_utc, com_leyenda, com_estado, fec_creacion_utc, com_tipo_doc_receptor, com_num_doc_receptor, com_razon_social_receptor, com_direccion_receptor, com_op_gravada, com_igv) FROM stdin;
fc4efc63-0c40-4768-be9e-66e5a97fa3de	88f44142-8871-46f3-b4a5-f92b464c3700	Ticket	T001	1	18.00	Efectivo	2026-10-18 17:35:58.001996-05	Documento sin validez tributaria	Emitido	2026-10-18 17:35:58.002126-05	\N	\N	\N	\N	15.25	2.75
\.


--
-- Data for Name: detalles_comanda; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalles_comanda (id_detalle_comanda, id_comanda, id_producto, dtc_nombre_producto, dtc_cantidad, dtc_observacion, fec_creacion_utc, id_menu_completo, dtc_elecciones, dtc_incluye) FROM stdin;
70c6ebd5-fcb7-4ff1-b791-4d14301e7557	315a1286-3bee-4681-98a6-7cdba2d8a001	c475030b-7c73-4853-9e94-1bd161492287	Café pasado con sándwich mixto	2	Sin picante	2026-10-17 20:12:10.350506-05	\N	\N	\N
de0efde0-afc4-4829-93e1-cded72eba0fe	315a1286-3bee-4681-98a6-7cdba2d8a001	d7456e1d-1043-46b9-87aa-30c16b598f2e	Menú almuerzo	1	Bien caliente	2026-10-17 20:12:10.350546-05	\N	\N	\N
a950a156-3160-4011-8bd2-147dcef40f07	a80962ee-a6fd-4f90-98bf-094544763051	d7456e1d-1043-46b9-87aa-30c16b598f2e	Menú almuerzo	1	Bien caliente	2026-10-17 20:17:13.93715-05	\N	\N	\N
f0fa25cf-f8e4-48a1-8c28-53d330170513	a80962ee-a6fd-4f90-98bf-094544763051	c475030b-7c73-4853-9e94-1bd161492287	Café pasado con sándwich mixto	2	Sin picante	2026-10-17 20:17:13.937108-05	\N	\N	\N
a5fa07e6-4667-42ab-9d61-bb066508aed0	31baa64b-40c7-47c9-b3ba-dbf16b10e2f6	c475030b-7c73-4853-9e94-1bd161492287	Café pasado con sándwich mixto	2	Sin picante	2026-10-17 20:19:02.3441-05	\N	\N	\N
faa5594f-9087-464d-b65a-9b0f367ee9b4	31baa64b-40c7-47c9-b3ba-dbf16b10e2f6	d7456e1d-1043-46b9-87aa-30c16b598f2e	Menú almuerzo	1	Bien caliente	2026-10-17 20:19:02.344139-05	\N	\N	\N
998e2db2-7b41-40f9-b852-760a0b0f14e5	0ced0c10-64ea-4065-9103-c39af5f68bda	c475030b-7c73-4853-9e94-1bd161492287	Café pasado con sándwich mixto	1	Para llevar adicional	2026-10-17 20:19:02.728145-05	\N	\N	\N
3d64b0a0-cdc7-434e-beee-ebfe0118fa24	a3fe21ae-7949-4a7b-bdef-42e50d7afa56	c475030b-7c73-4853-9e94-1bd161492287	Café pasado con sándwich mixto	2	sin ensalada	2026-10-17 21:02:43.633674-05	\N	\N	\N
1d5745f2-11d2-4eb2-a747-b85a105dc500	5c383c73-bba0-46b8-b422-fb365faad080	c475030b-7c73-4853-9e94-1bd161492287	Café pasado con sándwich mixto	1	sin cebolla	2026-10-17 21:05:01.770941-05	\N	\N	\N
3b6035f7-777b-4977-aa9c-7312987cd2f9	77a87aa4-a3e9-483d-a740-acdc4d1ae0f0	d7456e1d-1043-46b9-87aa-30c16b598f2e	Menú almuerzo	1	\N	2026-10-17 22:02:08.762482-05	\N	\N	\N
63fefeea-5c5a-495f-abd8-df9df9ccc8ab	77a87aa4-a3e9-483d-a740-acdc4d1ae0f0	c475030b-7c73-4853-9e94-1bd161492287	Café pasado con sándwich mixto	1	\N	2026-10-17 22:02:08.762393-05	\N	\N	\N
b0479b79-d5a6-493b-83bb-d1c7c19e8be0	d8fac8a7-f511-421b-aecf-b93a48a4afd1	d7456e1d-1043-46b9-87aa-30c16b598f2e	Menú almuerzo	1	\N	2026-10-17 22:44:33.516148-05	\N	\N	\N
dec836dd-73b6-42ce-b031-2182860118bb	d8fac8a7-f511-421b-aecf-b93a48a4afd1	c475030b-7c73-4853-9e94-1bd161492287	Café pasado con sándwich mixto	1	\N	2026-10-17 22:44:33.516082-05	\N	\N	\N
b3ca9989-0d9d-4c57-9fbe-a43c6225d819	46c3fa97-1a5c-40d5-abba-adf6731fe8cf	\N	Almuerzo completo	1	Parte pecho	2026-10-19 11:52:28.512435-05	2	Ocopa arequipeña (Entrada) + Seco de pollo	Refresco del día
049c1f0f-dd58-456d-8757-757e8cceafdc	85fba1d3-9ac2-40ec-8e19-ef30cfdf7de7	\N	Almuerzo completo	1	\N	2026-10-19 11:55:08.251977-05	2	Ocopa arequipeña (Entrada) + Lomo saltado	Refresco del día
1364b85e-6904-470f-9567-213fde1448eb	85fba1d3-9ac2-40ec-8e19-ef30cfdf7de7	\N	Almuerzo completo	1	\N	2026-10-19 11:55:08.248183-05	2	Sopa a la minuta + Lomo saltado	Refresco del día
6cb7f0b1-607c-4b78-b93f-21e076e8a28b	85fba1d3-9ac2-40ec-8e19-ef30cfdf7de7	\N	Desayuno completo	1	\N	2026-10-19 11:55:08.247049-05	1	Quaker con leche + Pan con palta	Pan
c8f2742a-8dd7-4e36-b415-d14478ea0786	85fba1d3-9ac2-40ec-8e19-ef30cfdf7de7	\N	Almuerzo completo	1	\N	2026-10-19 11:55:08.251965-05	2	Sopa a la minuta + Bistec a lo pobre	Refresco del día
\.


--
-- Data for Name: detalles_pedido; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalles_pedido (id_detalle, id_pedido, id_producto, det_cantidad, det_precio_unitario, det_subtotal, det_observacion, fec_creacion_utc, id_menu_completo, det_nombre, det_incluye) FROM stdin;
cb6b4551-ee0a-49b8-9855-afb24bb9cd9f	e0e1adea-5a2a-4ec8-b746-b244178e84c0	c475030b-7c73-4853-9e94-1bd161492287	1	5.00	5.00	\N	2026-10-17 22:44:33.512024-05	\N	Café pasado con sándwich mixto	\N
85ee4979-d93d-4304-9538-34baadc5c855	5847ea15-dba5-4440-8344-fbf8fc238d78	c475030b-7c73-4853-9e94-1bd161492287	1	5.00	5.00	\N	2026-10-17 22:02:08.756717-05	\N	Café pasado con sándwich mixto	\N
58fd4518-a29f-4911-a851-e99e449b7073	9ff6d8bb-1c9b-49ee-bb96-b6c0e00c9f37	c475030b-7c73-4853-9e94-1bd161492287	1	5.00	5.00	sin cebolla	2026-10-17 21:05:01.770919-05	\N	Café pasado con sándwich mixto	\N
f97dd0f9-5acb-45dd-9ffa-f673013b86ae	75ce0236-ebdc-4810-9204-df2bb000f4f7	c475030b-7c73-4853-9e94-1bd161492287	2	5.00	10.00	sin ensalada	2026-10-17 21:02:43.630294-05	\N	Café pasado con sándwich mixto	\N
25814731-7388-495e-83f6-0a5b71289ed8	3a24ca76-f431-4600-9c84-f10fc239a053	c475030b-7c73-4853-9e94-1bd161492287	1	5.00	5.00	Para llevar adicional	2026-10-17 20:19:02.728131-05	\N	Café pasado con sándwich mixto	\N
cd7b8ce0-3192-46c3-820c-972814519550	3a24ca76-f431-4600-9c84-f10fc239a053	c475030b-7c73-4853-9e94-1bd161492287	2	5.00	10.00	Sin picante	2026-10-17 20:19:02.34103-05	\N	Café pasado con sándwich mixto	\N
f6f2de8c-8d2b-4ce7-bb29-e188cf0d2c76	d58ffebd-c2b7-445d-a3e3-dfd5742c33fc	c475030b-7c73-4853-9e94-1bd161492287	2	5.00	10.00	Sin picante	2026-10-17 20:17:13.933886-05	\N	Café pasado con sándwich mixto	\N
feccabb8-7641-47b5-9f26-3acac31e18c8	03876d35-b378-4772-98cb-50238d1188e0	c475030b-7c73-4853-9e94-1bd161492287	2	5.00	10.00	Sin picante	2026-10-17 20:12:10.34726-05	\N	Café pasado con sándwich mixto	\N
d23a83b6-094b-460f-b694-d71f87ecc905	e0e1adea-5a2a-4ec8-b746-b244178e84c0	d7456e1d-1043-46b9-87aa-30c16b598f2e	1	8.00	8.00	\N	2026-10-17 22:44:33.51424-05	\N	Menú almuerzo	\N
3358bfaf-06cf-4b5f-91bf-23e46aaaf4e8	5847ea15-dba5-4440-8344-fbf8fc238d78	d7456e1d-1043-46b9-87aa-30c16b598f2e	1	8.00	8.00	\N	2026-10-17 22:02:08.759569-05	\N	Menú almuerzo	\N
23e5699d-1502-400e-a25c-27bf7ef0b401	3a24ca76-f431-4600-9c84-f10fc239a053	d7456e1d-1043-46b9-87aa-30c16b598f2e	1	8.00	8.00	Bien caliente	2026-10-17 20:19:02.342782-05	\N	Menú almuerzo	\N
25216f2f-382d-4feb-90b0-1435b0160895	d58ffebd-c2b7-445d-a3e3-dfd5742c33fc	d7456e1d-1043-46b9-87aa-30c16b598f2e	1	8.00	8.00	Bien caliente	2026-10-17 20:17:13.935653-05	\N	Menú almuerzo	\N
873ec609-3c26-47ff-9182-50aca2a649c5	03876d35-b378-4772-98cb-50238d1188e0	d7456e1d-1043-46b9-87aa-30c16b598f2e	1	8.00	8.00	Bien caliente	2026-10-17 20:12:10.349203-05	\N	Menú almuerzo	\N
01457a74-e987-4dd2-9518-33a2fc1582f1	17641da5-54b7-4f44-943b-5675a9b7988e	\N	1	8.00	8.00	Parte pecho	2026-10-19 11:52:28.505848-05	2	Almuerzo completo	Refresco del día
5aee2752-5802-4c07-aa9f-85549926ed7e	222f091e-3836-4241-9d74-aaaaa52e8ee3	\N	1	8.00	8.00	\N	2026-10-19 11:55:08.248166-05	2	Almuerzo completo	Refresco del día
80d5e4b5-5aab-4d70-b8cf-48bcf3aa59a9	222f091e-3836-4241-9d74-aaaaa52e8ee3	\N	1	8.00	8.00	\N	2026-10-19 11:55:08.251948-05	2	Almuerzo completo	Refresco del día
a96b10e0-6dd4-4ae0-b7f4-11fc69cc9224	222f091e-3836-4241-9d74-aaaaa52e8ee3	\N	1	7.00	7.00	\N	2026-10-19 11:55:08.246995-05	1	Desayuno completo	Pan
cce0c53a-e9c8-4578-8506-19be5a3df66c	222f091e-3836-4241-9d74-aaaaa52e8ee3	\N	1	8.00	8.00	\N	2026-10-19 11:55:08.251972-05	2	Almuerzo completo	Refresco del día
\.


--
-- Data for Name: lineas_pedido_opciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lineas_pedido_opciones (id_linea_pedido_opcion, id_detalle, lpo_parte_nombre, id_producto, lpo_producto_nombre, fec_creacion_utc) FROM stdin;
365fb5b8-e966-4211-9077-4defdd69eee0	01457a74-e987-4dd2-9518-33a2fc1582f1	Segundo	b43c9a72-8799-41a2-8a07-5269e3716ac2	Seco de pollo	2026-10-19 11:52:28.507591-05
91b5df80-407e-479c-a312-9d978eb85bf6	01457a74-e987-4dd2-9518-33a2fc1582f1	Sopa o entrada	358ce54a-9e8a-47f9-80dd-b03b2a667f77	Ocopa arequipeña (Entrada)	2026-10-19 11:52:28.507506-05
1c7310e7-6614-4f92-bd17-ba5189318f2a	5aee2752-5802-4c07-aa9f-85549926ed7e	Sopa o entrada	fb3caee0-bdae-4765-ad08-1af93d2a1332	Sopa a la minuta	2026-10-19 11:55:08.248168-05
23eb84a3-a404-4062-be67-484e7bdb376a	cce0c53a-e9c8-4578-8506-19be5a3df66c	Sopa o entrada	358ce54a-9e8a-47f9-80dd-b03b2a667f77	Ocopa arequipeña (Entrada)	2026-10-19 11:55:08.251973-05
35290028-ee9f-4c0b-8423-314493024fb2	80d5e4b5-5aab-4d70-b8cf-48bcf3aa59a9	Segundo	f812d341-aeff-40c6-a494-6c56d34bac5b	Bistec a lo pobre	2026-10-19 11:55:08.251952-05
60654e89-5491-4364-bb82-8ccc461d421f	a96b10e0-6dd4-4ae0-b7f4-11fc69cc9224	Plato	25bad812-03f3-43c3-9bae-b94bf470cadd	Pan con palta	2026-10-19 11:55:08.246998-05
85cf70ea-1656-474e-9ae3-7a80a003aeca	5aee2752-5802-4c07-aa9f-85549926ed7e	Segundo	a0a1a55a-44b6-445c-ab4a-0df9f5e2fb6f	Lomo saltado	2026-10-19 11:55:08.248171-05
aa5c388b-a1a2-4728-96a1-38bdda926526	cce0c53a-e9c8-4578-8506-19be5a3df66c	Segundo	a0a1a55a-44b6-445c-ab4a-0df9f5e2fb6f	Lomo saltado	2026-10-19 11:55:08.251975-05
c21c3422-0ff7-4ff9-8b8e-1370640e5b26	a96b10e0-6dd4-4ae0-b7f4-11fc69cc9224	Bebida	50200e19-6d75-468e-8fd5-d645d4beb620	Quaker con leche	2026-10-19 11:55:08.246996-05
c67ec8b7-8995-4c03-bc33-e31862b8d28f	80d5e4b5-5aab-4d70-b8cf-48bcf3aa59a9	Sopa o entrada	fb3caee0-bdae-4765-ad08-1af93d2a1332	Sopa a la minuta	2026-10-19 11:55:08.25195-05
\.


--
-- Data for Name: menu_dia_menus_completos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menu_dia_menus_completos (id_menu_dia_menu_completo, id_menu, id_menu_completo, fec_creacion_utc) FROM stdin;
b11c2374-fc8b-440a-a04d-128696b3bd31	12eda018-7e58-474b-b43d-7ff6fbfa7c04	1	2026-10-19 03:46:27.262062-05
9a386ede-3c9d-4b4d-9da4-4602294aae80	12eda018-7e58-474b-b43d-7ff6fbfa7c04	2	2026-10-19 03:46:27.262062-05
08202455-f962-4ae6-97c0-69e2e2b91300	12eda018-7e58-474b-b43d-7ff6fbfa7c04	3	2026-10-19 03:46:27.262062-05
8323caf4-d17d-48ab-9693-c57d561d4c8d	57cd9055-9971-42ee-9269-117869eebe7a	3	2026-10-18 23:12:59.275893-05
856e53d4-eb4e-4027-9beb-61af3d04350f	57cd9055-9971-42ee-9269-117869eebe7a	1	2026-10-18 23:12:59.275688-05
e737357e-923f-4468-a382-bf90a380023c	57cd9055-9971-42ee-9269-117869eebe7a	2	2026-10-18 23:12:59.275892-05
02eab5bf-28f7-48a2-928d-e2b3b3573122	0c1359c5-0dfc-4e72-8bc9-d56d8cfcc425	2	2026-10-19 11:48:08.875954-05
3860c7d0-2280-4b51-b3f4-78fcd5a8e961	0c1359c5-0dfc-4e72-8bc9-d56d8cfcc425	1	2026-10-19 11:48:08.875478-05
f5d383f6-0d3c-42be-adb2-20394413d93c	0c1359c5-0dfc-4e72-8bc9-d56d8cfcc425	3	2026-10-19 11:48:08.875955-05
\.


--
-- Data for Name: menu_dia_platos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menu_dia_platos (id_menu_plato, id_menu, id_producto, est_agotado, fec_cambio_disponibilidad_utc, nom_usuario_disponibilidad) FROM stdin;
2ef3900d-f8f8-493c-92d7-4eca6a782667	12eda018-7e58-474b-b43d-7ff6fbfa7c04	d7456e1d-1043-46b9-87aa-30c16b598f2e	f	\N	\N
8c8a025a-945f-42ac-a3d5-d1914df0d2c7	12eda018-7e58-474b-b43d-7ff6fbfa7c04	8c621cd4-f5cb-49a5-bb62-a02b7e647a8a	f	2026-10-17 14:13:22.52412-05	admin
eba1a7af-7334-4bb5-8077-07b50ba7e5b0	12eda018-7e58-474b-b43d-7ff6fbfa7c04	37935ec3-c4af-471f-a38f-7905028874ee	f	2026-10-17 14:29:42.822954-05	admin
0e5767b4-84db-4f55-ac16-4f90951fa864	57cd9055-9971-42ee-9269-117869eebe7a	8daead53-dc59-4f7d-8b7e-0f93c772fdef	f	\N	\N
49ad5b72-b0e4-469a-833e-950b489680fc	57cd9055-9971-42ee-9269-117869eebe7a	2a16424d-251a-45f8-bd34-4fde0fc402d2	f	\N	\N
6961d4b8-de39-470a-a344-2313be2ff7bd	57cd9055-9971-42ee-9269-117869eebe7a	fb3caee0-bdae-4765-ad08-1af93d2a1332	f	\N	\N
93ba5e6a-8fbc-425c-8c06-46baa3ce3ba1	57cd9055-9971-42ee-9269-117869eebe7a	eda143bb-e66a-4d64-8c1b-b22cd31b611b	f	\N	\N
9d62eb9b-ce5c-431f-99cf-3493d03e9b30	57cd9055-9971-42ee-9269-117869eebe7a	eb1babc4-e6ef-4482-9296-be74a93fe91b	f	\N	\N
a0e12302-b073-434d-8d1f-517d2630f9db	57cd9055-9971-42ee-9269-117869eebe7a	76604e3d-e02e-478b-bc62-a698f55f5b75	f	\N	\N
aaee371a-2842-4f1a-82ed-1726df612d2c	57cd9055-9971-42ee-9269-117869eebe7a	358ce54a-9e8a-47f9-80dd-b03b2a667f77	f	\N	\N
c1594be3-8dad-4254-b0d7-4781505e4d55	57cd9055-9971-42ee-9269-117869eebe7a	f52f0fae-b038-44a8-a8db-78b369c7cb7c	f	\N	\N
d309970a-3198-4740-806b-ca0c09c893bd	57cd9055-9971-42ee-9269-117869eebe7a	1e0295a4-6336-4ffa-953f-c401e7f4ccb5	f	\N	\N
d595e49c-7964-44d9-9bc4-59da34f28c84	57cd9055-9971-42ee-9269-117869eebe7a	c475030b-7c73-4853-9e94-1bd161492287	f	\N	\N
e07eff8c-b342-4462-b7e3-738447e4496b	57cd9055-9971-42ee-9269-117869eebe7a	adfd6445-a472-4c0a-b542-58410234e1c2	f	\N	\N
b59015e7-65b8-449f-8e13-1f05e40eea65	57cd9055-9971-42ee-9269-117869eebe7a	f812d341-aeff-40c6-a494-6c56d34bac5b	t	2026-10-18 23:13:40.798325-05	admin
e0135cdc-2c52-4f0c-acc1-bca746826089	57cd9055-9971-42ee-9269-117869eebe7a	8228706d-c8a4-4922-af09-4c04d6b49027	f	2026-10-18 23:13:40.832119-05	admin
29879fe1-3ec1-4691-a303-36ac7b96c33f	0c1359c5-0dfc-4e72-8bc9-d56d8cfcc425	fb3caee0-bdae-4765-ad08-1af93d2a1332	f	\N	\N
93e3702c-3017-43c2-9114-42ba922b2722	0c1359c5-0dfc-4e72-8bc9-d56d8cfcc425	358ce54a-9e8a-47f9-80dd-b03b2a667f77	f	\N	\N
a3dc5935-e03b-48c1-9df7-81208e75a276	0c1359c5-0dfc-4e72-8bc9-d56d8cfcc425	f812d341-aeff-40c6-a494-6c56d34bac5b	f	\N	\N
b857cd7c-21f8-454f-b903-9cf56377091f	0c1359c5-0dfc-4e72-8bc9-d56d8cfcc425	25bad812-03f3-43c3-9bae-b94bf470cadd	f	\N	\N
b9e2fb8c-13cc-4626-a923-cdeb75cddc13	0c1359c5-0dfc-4e72-8bc9-d56d8cfcc425	b9e4e533-5140-444a-a26f-37e37b906b80	f	\N	\N
bf98922c-87a3-4ac0-9e94-d2cbb6209adc	0c1359c5-0dfc-4e72-8bc9-d56d8cfcc425	a0a1a55a-44b6-445c-ab4a-0df9f5e2fb6f	f	\N	\N
c17f298d-e7a0-4a17-a342-ee57e359ca3f	0c1359c5-0dfc-4e72-8bc9-d56d8cfcc425	b43c9a72-8799-41a2-8a07-5269e3716ac2	f	\N	\N
ece2527b-7787-45a5-b1ee-5f587f69df8b	0c1359c5-0dfc-4e72-8bc9-d56d8cfcc425	887a5161-b0e3-4db0-83db-d08d79b23d75	f	\N	\N
ecfdc50e-a5d4-4c32-9f19-59aafe10f924	0c1359c5-0dfc-4e72-8bc9-d56d8cfcc425	f5a9e866-6b53-4f38-8dce-6677713f36a2	f	\N	\N
fd01e04b-da77-4a8b-bde9-4d2fcb97d3f8	0c1359c5-0dfc-4e72-8bc9-d56d8cfcc425	50200e19-6d75-468e-8fd5-d645d4beb620	f	\N	\N
18ef9e44-0f2c-4921-8894-ecd61f5a3f21	0c1359c5-0dfc-4e72-8bc9-d56d8cfcc425	c475030b-7c73-4853-9e94-1bd161492287	f	\N	\N
98bb14df-5ff2-4285-a58b-12f49c37688d	0c1359c5-0dfc-4e72-8bc9-d56d8cfcc425	8daead53-dc59-4f7d-8b7e-0f93c772fdef	f	\N	\N
d78a36f0-bb0b-4fc5-b735-3dcee2d7cb7d	0c1359c5-0dfc-4e72-8bc9-d56d8cfcc425	eda143bb-e66a-4d64-8c1b-b22cd31b611b	f	\N	\N
98a38203-df20-468d-af45-44ab393474d7	0c1359c5-0dfc-4e72-8bc9-d56d8cfcc425	d7456e1d-1043-46b9-87aa-30c16b598f2e	f	\N	\N
e6a6e510-32a1-4851-bc4e-5ea0bbb5bcac	0c1359c5-0dfc-4e72-8bc9-d56d8cfcc425	8c621cd4-f5cb-49a5-bb62-a02b7e647a8a	f	\N	\N
87015f0e-bf49-47d2-8520-52fe5a58d30a	0c1359c5-0dfc-4e72-8bc9-d56d8cfcc425	0cf858b2-006a-4e61-be1f-0ec64a585025	f	\N	\N
30e373fa-f920-470e-829f-ea521387153e	0c1359c5-0dfc-4e72-8bc9-d56d8cfcc425	a653a228-09f1-4a96-a74a-97723e256ef9	f	\N	\N
4cd992e8-b0a6-437b-8eec-85bde370e276	0c1359c5-0dfc-4e72-8bc9-d56d8cfcc425	777b6841-8d0b-492c-91da-8fab2eb45d8b	f	\N	\N
51e15799-2559-4034-9bf5-ede29b7158f2	0c1359c5-0dfc-4e72-8bc9-d56d8cfcc425	2a2a3d0c-77f8-420b-9a63-5549c69d72b9	f	\N	\N
\.


--
-- Data for Name: menus_completos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menus_completos (id_menu_completo, nom_menu_completo, pre_menu_completo, est_menu_completo, det_incluye, fec_actualizacion_utc) FROM stdin;
1	Desayuno completo	7.00	t	Pan	2026-10-18 22:10:53.169304-05
2	Almuerzo completo	8.00	t	Refresco del día	2026-10-18 22:10:53.169304-05
3	Solo segundo	7.00	t	Refresco del día	2026-10-18 22:10:53.169304-05
\.


--
-- Data for Name: menus_completos_partes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menus_completos_partes (id_parte, id_menu_completo, nom_parte, num_orden, roles_permitidos) FROM stdin;
1	1	Bebida	1	1
2	1	Plato	2	2
3	2	Sopa o entrada	1	3,4
4	2	Segundo	2	5
5	3	Segundo	1	5
\.


--
-- Data for Name: menus_dia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menus_dia (id_menu, fec_menu, id_desayuno, nom_usuario_creacion, nom_usuario_actualizacion, fec_creacion_utc, fec_actualizacion_utc) FROM stdin;
12eda018-7e58-474b-b43d-7ff6fbfa7c04	2026-10-17	c475030b-7c73-4853-9e94-1bd161492287	admin	admin	2026-10-17 14:01:32.589742-05	2026-10-17 14:29:42.822955-05
57cd9055-9971-42ee-9269-117869eebe7a	2026-10-18	\N	admin	admin	2026-10-18 17:39:31.22313-05	2026-10-18 23:13:40.832119-05
0c1359c5-0dfc-4e72-8bc9-d56d8cfcc425	2026-10-19	\N	admin	admin	2026-10-19 11:48:08.870257-05	2026-10-19 11:48:30.149916-05
\.


--
-- Data for Name: mesas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mesas (id_mesa, nom_mesa, nom_mesa_normalizado, est_ocupacion, est_activa, fec_creacion_utc, fec_actualizacion_utc) FROM stdin;
3666dec9-1a05-48de-9643-23fecf7fd167	Mesa 10	MESA 10	Libre	t	2026-10-17 17:57:04.459078-05	\N
598985b2-fc3e-4f3b-ba38-c5ba264a4666	Mesa 9	MESA 9	Libre	t	2026-10-17 17:57:04.459072-05	\N
6734a319-ddf2-476d-beda-ec2ac27cedd0	Mesa 7	MESA 7	Ocupada	t	2026-10-17 17:57:04.459063-05	2026-10-17 17:57:04.459063-05
6a617660-9592-44d4-8d15-9c225cb4f133	Patio 2	PATIO 2	Libre	f	2026-10-17 17:57:04.459088-05	2026-10-17 17:57:04.459541-05
c7ab6d48-fdbb-4390-b83c-22db58739237	Mesa 3	MESA 3	Ocupada	t	2026-10-17 17:57:04.458692-05	2026-10-17 17:57:04.458897-05
cece6ca8-921e-4ea4-90c1-6055011bddc1	Mesa 5	MESA 5	Libre	t	2026-10-17 17:57:04.459054-05	\N
dc56cf12-fb4d-4da6-bf2d-f6818fd94b23	Patio 1	PATIO 1	Libre	t	2026-10-17 17:57:04.459083-05	\N
fdf88ec4-9aec-4efd-ba77-2c2284d05c45	Mesa 6	MESA 6	Libre	t	2026-10-17 17:57:04.459058-05	\N
d0ceb30b-0322-474f-9da5-e5d72de0f66a	Mesa 1	MESA 1	Ocupada	t	2026-10-17 17:57:04.458417-05	2026-10-19 11:52:28.512896-05
c1fea4f5-11e0-40b3-a449-f52164e8dd2e	Mesa 8	MESA 8	Ocupada	t	2026-10-17 17:57:04.459068-05	2026-10-19 11:55:08.251979-05
a970b954-bdd5-44b7-bd73-8ec860f54541	Mesa 2	MESA 2	Libre	t	2026-10-17 17:57:04.458686-05	2026-10-19 14:41:16.945571-05
67ae29b1-17c8-4988-b129-de60b17c3849	Mesa 4	MESA 4	Libre	t	2026-10-17 17:57:04.459048-05	2026-10-19 14:41:16.945571-05
\.


--
-- Data for Name: pedidos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pedidos (id_pedido, ped_numero_diario, ped_fecha_operativa, ped_fecha_hora_utc, ped_tipo, ped_estado, ped_total, ped_notas, id_mesa, id_usuario, ped_solicitud_id, fec_creacion_utc, fec_actualizacion_utc, ped_motivo_anulacion) FROM stdin;
03876d35-b378-4772-98cb-50238d1188e0	1	2026-10-17	2026-10-17 20:12:10.345954-05	Mesa	Pagado	18.00	Mesa cerca a la ventana	d0ceb30b-0322-474f-9da5-e5d72de0f66a	fdfbc247-2349-4bab-9d92-cc595b7a34d8	b0992399-6d3c-45f6-a589-6b9909cfc4a8	2026-10-17 20:12:10.346251-05	2026-10-18 17:35:58.002496-05	\N
222f091e-3836-4241-9d74-aaaaa52e8ee3	2	2026-10-19	2026-10-19 11:55:08.246983-05	Mesa	Pendiente	31.00	\N	c1fea4f5-11e0-40b3-a449-f52164e8dd2e	05c84bab-bb5e-479f-8a19-f309b7fde947	ce24ae73-6d0b-453d-a86b-3edf8b102b0f	2026-10-19 11:55:08.246984-05	2026-10-19 11:55:08.251978-05	\N
17641da5-54b7-4f44-943b-5675a9b7988e	1	2026-10-19	2026-10-19 11:52:28.499882-05	Mesa	Listo	8.00	\N	d0ceb30b-0322-474f-9da5-e5d72de0f66a	05c84bab-bb5e-479f-8a19-f309b7fde947	943545bd-fb3c-40c3-9dfd-d54606056412	2026-10-19 11:52:28.500543-05	2026-10-19 11:57:36.661769-05	\N
d58ffebd-c2b7-445d-a3e3-dfd5742c33fc	2	2026-10-17	2026-10-17 20:17:13.932125-05	Mesa	Anulado	18.00	Mesa cerca a la ventana	a970b954-bdd5-44b7-bd73-8ec860f54541	fdfbc247-2349-4bab-9d92-cc595b7a34d8	509db897-fb42-46a4-8786-a71b292217db	2026-10-17 20:17:13.932473-05	2026-10-19 14:41:16.945571-05	Saneamiento administrativo: Pedido huérfano de prueba de fecha anterior
3a24ca76-f431-4600-9c84-f10fc239a053	3	2026-10-17	2026-10-17 20:19:02.339038-05	Mesa	Anulado	23.00	Mesa cerca a la ventana	67ae29b1-17c8-4988-b129-de60b17c3849	fdfbc247-2349-4bab-9d92-cc595b7a34d8	f1c11a58-23d2-4202-a4ca-64d503c7c135	2026-10-17 20:19:02.339519-05	2026-10-19 14:41:16.945571-05	Saneamiento administrativo: Pedido huérfano de prueba de fecha anterior
75ce0236-ebdc-4810-9204-df2bb000f4f7	4	2026-10-17	2026-10-17 21:02:43.628892-05	ParaLlevar	Anulado	10.00	Sra. Rosa	\N	920ba4f1-d552-4c76-b1c0-087b3b75770c	102ffbd5-99a2-4d27-9e96-a980770d1fc6	2026-10-17 21:02:43.629212-05	2026-10-19 14:41:16.945571-05	Saneamiento administrativo: Pedido huérfano de prueba de fecha anterior
9ff6d8bb-1c9b-49ee-bb96-b6c0e00c9f37	5	2026-10-17	2026-10-17 21:05:01.770911-05	ParaLlevar	Anulado	5.00	Test Idempotencia	\N	920ba4f1-d552-4c76-b1c0-087b3b75770c	57848b97-dd22-4935-9510-626d3556d52c	2026-10-17 21:05:01.770912-05	2026-10-19 14:41:16.945571-05	Saneamiento administrativo: Pedido huérfano de prueba de fecha anterior
5847ea15-dba5-4440-8344-fbf8fc238d78	6	2026-10-17	2026-10-17 22:02:08.75442-05	ParaLlevar	Anulado	13.00	Elena Flores	\N	05c84bab-bb5e-479f-8a19-f309b7fde947	70058240-8088-4586-bad3-6ca3a0c5447a	2026-10-17 22:02:08.755092-05	2026-10-19 14:41:16.945571-05	Saneamiento administrativo: Pedido huérfano de prueba de fecha anterior
e0e1adea-5a2a-4ec8-b746-b244178e84c0	7	2026-10-17	2026-10-17 22:44:33.5095-05	ParaLlevar	Anulado	13.00	\N	\N	05c84bab-bb5e-479f-8a19-f309b7fde947	6f1ea598-97de-4a7b-9b59-03f1b6c19349	2026-10-17 22:44:33.510086-05	2026-10-19 14:41:16.945571-05	Saneamiento administrativo: Pedido huérfano de prueba de fecha anterior
\.


--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productos (id_producto, nom_producto, nom_normalizado, cat_producto, pre_producto, est_producto, fec_creacion_utc, fec_actualizacion_utc, tip_producto, rol_componente) FROM stdin;
37935ec3-c4af-471f-a38f-7905028874ee	Sopa a la minuta especial	sopa a la minuta especial	2	10.00	t	2026-10-17 13:04:47.131836-05	\N	1	\N
8c621cd4-f5cb-49a5-bb62-a02b7e647a8a	Ejecutivo del día	ejecutivo del dia	2	12.00	t	2026-10-17 13:04:47.131829-05	\N	1	\N
ab587619-835c-4472-9a16-fc52afdfa2d1	Quaker con leche y pan	quaker con leche y pan	1	3.50	t	2026-10-17 13:04:47.13183-05	\N	1	\N
b39aaede-072c-414a-951b-49047194e280	Quinua carretillera con pan	quinua carretillera con pan	1	3.00	t	2026-10-17 13:04:47.13183-05	\N	1	\N
c475030b-7c73-4853-9e94-1bd161492287	Café pasado con sándwich mixto	cafe pasado con sandwich mixto	1	5.00	t	2026-10-17 13:04:47.131832-05	\N	1	\N
d7456e1d-1043-46b9-87aa-30c16b598f2e	Menú almuerzo	menu almuerzo	2	8.00	t	2026-10-17 13:04:47.13175-05	\N	1	\N
d1da6dd9-3333-4feb-90a2-42ef0806f14d	Caldo de gallina criollo (Plato fuerte)	caldo de gallina criollo (plato fuerte)	3	10.00	t	2026-10-17 13:04:47.131838-05	2026-10-18 21:13:10.276728-05	1	\N
18858d56-9234-4862-a00b-b6663476e306	Gaseosa 500ml	gaseosa 500ml	5	3.50	t	2026-10-17 13:04:47.131837-05	2026-10-18 21:13:10.276728-05	1	\N
e7db20df-a11f-4ee4-9286-cc21f772389c	Agua mineral 600ml	agua mineral 600ml	5	2.50	t	2026-10-17 13:04:47.131837-05	2026-10-18 21:13:10.276728-05	1	\N
fc21cda6-b12b-4f09-a807-df1218c7bb78	Jarra de chicha morada 1L	jarra de chicha morada 1l	5	6.00	t	2026-10-17 13:04:47.131834-05	2026-10-18 21:13:10.276728-05	1	\N
f1c6d752-3760-4e57-85b0-141472f6232f	Porción extra de papas fritas	porcion extra de papas fritas	6	4.00	t	2026-10-17 13:04:47.131836-05	2026-10-18 21:13:10.276728-05	1	\N
eda143bb-e66a-4d64-8c1b-b22cd31b611b	Café pasado	cafe pasado	1	3.50	t	2026-10-18 21:13:10.276728-05	\N	1	\N
8b8213d8-006e-4d2d-9e5b-06a01a2b7304	Té e infusiones variadas	te e infusiones variadas	1	2.50	t	2026-10-18 21:13:10.276728-05	\N	1	\N
af361fd7-ae55-47d3-ae02-9503b2f15baa	Quaker con leche	quaker con leche	1	3.50	t	2026-10-18 21:13:10.276728-05	\N	1	\N
dd5d518b-568c-4081-b4eb-b7f3f8798e52	Quinua carretillera	quinua carretillera	1	3.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
1f44d7c7-a01e-4ab2-90c2-50a44e57b01e	Jugo surtido	jugo surtido	1	6.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
8daead53-dc59-4f7d-8b7e-0f93c772fdef	Jugo de papaya	jugo de papaya	1	5.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
c59853f2-250b-4c47-b7b4-6a531de5676c	Pan con palta	pan con palta	1	3.50	t	2026-10-18 21:13:10.276728-05	\N	1	\N
73e12672-d125-48ad-8d22-dc171056e7fa	Pan con queso	pan con queso	1	3.50	t	2026-10-18 21:13:10.276728-05	\N	1	\N
1a7dc654-9ce9-4a32-8512-8f53e63b435b	Pan con chicharrón	pan con chicharron	1	8.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
ccac737f-676a-4e56-a5e5-4b74ddfdb5b7	Pan con huevo frito	pan con huevo frito	1	3.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
5f5911bf-9bcd-4a16-8fe1-8098309acdf1	Pan con salchipollo	pan con salchipollo	1	4.50	t	2026-10-18 21:13:10.276728-05	\N	1	\N
7eb7b4ac-e829-4aae-ae44-9133f679805b	Pan con pollo deshilachado	pan con pollo deshilachado	1	4.50	t	2026-10-18 21:13:10.276728-05	\N	1	\N
d455cb01-0a82-4508-a476-dbd5ea344fd0	Caldo de gallina (Entrada)	caldo de gallina (entrada)	2	5.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
34727469-ddad-4875-8579-2d34308b01ea	Sopa a la minuta	sopa a la minuta	2	7.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
bd72b1da-df4e-48e5-8847-876cae032a15	Sopa criolla	sopa criolla	2	8.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
e5b991e0-1cbc-4495-9403-53539d46ef6e	Papa a la huancaína (Entrada)	papa a la huancaina (entrada)	2	5.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
d2781ed2-8abb-4529-a9f1-529a7d8a106e	Ocopa arequipeña (Entrada)	ocopa arequipena (entrada)	2	5.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
6ed7669a-ffab-4fcc-a505-76c6d5d875e9	Menú ejecutivo de la casa	menu ejecutivo de la casa	2	14.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
1e151027-d367-4841-8ed4-4c05e84198b8	Lomo saltado	lomo saltado	3	25.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
510fcd14-e694-4304-bb1e-d9f6c78962f5	Ceviche mixto	ceviche mixto	3	28.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
5362b8a8-9fe0-46be-b1a0-2229fbad2203	Ceviche de trucha	ceviche de trucha	3	24.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
3797436d-5496-45c2-a702-5eec81e85c95	Bistec a lo pobre	bistec a lo pobre	3	26.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
73295161-407f-4e5f-bea0-0333976b62b5	Pollo a la plancha	pollo a la plancha	3	20.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
1c09481a-1961-4df8-9402-186e3b3df163	Arroz chaufa de pollo	arroz chaufa de pollo	3	18.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
9fa54c92-20eb-45a7-a015-eaac1ef631e5	Arroz chaufa de carne	arroz chaufa de carne	3	22.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
3f311031-3b03-49be-995c-cd3940be48bb	Seco de pollo	seco de pollo	3	20.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
b117c70a-671e-496c-aee0-49966f639d2c	Seco de res	seco de res	3	24.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
db1ea6cb-3ebb-4ebb-b7cd-ce43536911b7	Tallarines verdes con bistec	tallarines verdes con bistec	3	25.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
0cf858b2-006a-4e61-be1f-0ec64a585025	Dúo marino (Arroz con mariscos + ceviche)	duo marino (arroz con mariscos + ceviche)	4	32.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
f29d2228-f781-49c2-947c-9bdde0267a1d	Chaufa con chicharrón de pollo	chaufa con chicharron de pollo	4	22.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
46402c75-ec65-40c1-ac3b-dca9e4d3df32	Chaufa + Ceviche clásico	chaufa + ceviche clasico	4	28.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
48102d53-5f6e-4f45-b8ce-209237cbf873	Coca-Cola Personal 500ml	coca-cola personal 500ml	5	3.50	t	2026-10-18 21:13:10.276728-05	\N	1	\N
777b6841-8d0b-492c-91da-8fab2eb45d8b	Coca-Cola Familiar 1.5L	coca-cola familiar 1.5l	5	9.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
4485a556-af24-4012-ae30-e37306536e96	Inca Kola Personal 500ml	inca kola personal 500ml	5	3.50	t	2026-10-18 21:13:10.276728-05	\N	1	\N
9b897dff-4464-4fa5-90d3-7e027cec00c0	Inca Kola Familiar 1.5L	inca kola familiar 1.5l	5	9.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
4e3f0920-56c6-4c5e-8bd5-63a5dada6e92	Agua mineral 700ml	agua mineral 700ml	5	3.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
2a2a3d0c-77f8-420b-9a63-5549c69d72b9	Jarra de chicha morada 500ml	jarra de chicha morada 500ml	5	4.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
166fd199-f82a-4103-9573-12775f270e19	Jarra de maracuyá 500ml	jarra de maracuya 500ml	5	4.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
1f347663-50f1-42a3-b0fe-3271d80797fc	Jarra de maracuyá 1L	jarra de maracuya 1l	5	7.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
68b36cdc-ccb4-48ef-949c-f85485eda617	Jarra de limonada clásica 500ml	jarra de limonada clasica 500ml	5	4.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
a653a228-09f1-4a96-a74a-97723e256ef9	Jarra de limonada clásica 1L	jarra de limonada clasica 1l	5	7.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
0ec2d19a-c0d1-46ee-8554-0a8e3489b410	Jarra de limonada frozen 500ml	jarra de limonada frozen 500ml	5	5.50	t	2026-10-18 21:13:10.276728-05	\N	1	\N
db9a6b27-f4bb-4a18-b1df-b36b2c141848	Jarra de limonada frozen 1L	jarra de limonada frozen 1l	5	9.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
08fd014b-654c-4b3e-aa89-78cff81d470d	Porción de arroz blanco	porcion de arroz blanco	6	3.00	t	2026-10-18 21:13:10.276728-05	\N	1	\N
65f8c9a2-f128-4561-83e0-0b87974745e1	Porción de canchita serrana	porcion de canchita serrana	6	2.50	t	2026-10-18 21:13:10.276728-05	\N	1	\N
adfd6445-a472-4c0a-b542-58410234e1c2	Café pasado	cafe pasado	\N	\N	t	2026-10-18 22:10:53.169304-05	\N	2	1
66e61321-1496-49d4-bbba-2324c9eb6a25	Té e infusiones variadas	te e infusiones variadas	\N	\N	t	2026-10-18 22:10:53.169304-05	\N	2	1
50200e19-6d75-468e-8fd5-d645d4beb620	Quaker con leche	quaker con leche	\N	\N	t	2026-10-18 22:10:53.169304-05	\N	2	1
f2579797-7e26-41b9-8668-0911cc1dd6fd	Quinua carretillera	quinua carretillera	\N	\N	t	2026-10-18 22:10:53.169304-05	\N	2	1
7e31c469-b0ed-4710-ad06-d28132ed5974	Jugo surtido	jugo surtido	\N	\N	t	2026-10-18 22:10:53.169304-05	\N	2	1
eb1babc4-e6ef-4482-9296-be74a93fe91b	Jugo de papaya	jugo de papaya	\N	\N	t	2026-10-18 22:10:53.169304-05	\N	2	1
25bad812-03f3-43c3-9bae-b94bf470cadd	Pan con palta	pan con palta	\N	\N	t	2026-10-18 22:10:53.169304-05	\N	2	2
c4e0703b-697b-495f-9606-2c5b1b827f43	Pan con queso	pan con queso	\N	\N	t	2026-10-18 22:10:53.169304-05	\N	2	2
2a16424d-251a-45f8-bd34-4fde0fc402d2	Pan con chicharrón	pan con chicharron	\N	\N	t	2026-10-18 22:10:53.169304-05	\N	2	2
1e0295a4-6336-4ffa-953f-c401e7f4ccb5	Pan con huevo frito	pan con huevo frito	\N	\N	t	2026-10-18 22:10:53.169304-05	\N	2	2
6e91c095-0520-4b81-8e25-b17471152fe0	Pan con salchipollo	pan con salchipollo	\N	\N	t	2026-10-18 22:10:53.169304-05	\N	2	2
887a5161-b0e3-4db0-83db-d08d79b23d75	Pan con pollo deshilachado	pan con pollo deshilachado	\N	\N	t	2026-10-18 22:10:53.169304-05	\N	2	2
f52f0fae-b038-44a8-a8db-78b369c7cb7c	Caldo de gallina (Entrada)	caldo de gallina (entrada)	\N	\N	t	2026-10-18 22:10:53.169304-05	\N	2	3
fb3caee0-bdae-4765-ad08-1af93d2a1332	Sopa a la minuta	sopa a la minuta	\N	\N	t	2026-10-18 22:10:53.169304-05	\N	2	3
44878261-d4e1-4ef1-98c4-3c317d083085	Sopa criolla	sopa criolla	\N	\N	t	2026-10-18 22:10:53.169304-05	\N	2	3
76604e3d-e02e-478b-bc62-a698f55f5b75	Papa a la huancaína (Entrada)	papa a la huancaina (entrada)	\N	\N	t	2026-10-18 22:10:53.169304-05	\N	2	4
358ce54a-9e8a-47f9-80dd-b03b2a667f77	Ocopa arequipeña (Entrada)	ocopa arequipena (entrada)	\N	\N	t	2026-10-18 22:10:53.169304-05	\N	2	4
a0a1a55a-44b6-445c-ab4a-0df9f5e2fb6f	Lomo saltado	lomo saltado	\N	\N	t	2026-10-18 22:10:53.169304-05	\N	2	5
b43c9a72-8799-41a2-8a07-5269e3716ac2	Seco de pollo	seco de pollo	\N	\N	t	2026-10-18 22:10:53.169304-05	\N	2	5
b9e4e533-5140-444a-a26f-37e37b906b80	Seco de res	seco de res	\N	\N	t	2026-10-18 22:10:53.169304-05	\N	2	5
8228706d-c8a4-4922-af09-4c04d6b49027	Arroz chaufa de pollo	arroz chaufa de pollo	\N	\N	t	2026-10-18 22:10:53.169304-05	\N	2	5
f0fe0f3b-1169-4948-8d5b-ef68e4b451d0	Pollo a la plancha	pollo a la plancha	\N	\N	t	2026-10-18 22:10:53.169304-05	\N	2	5
f812d341-aeff-40c6-a494-6c56d34bac5b	Bistec a lo pobre	bistec a lo pobre	\N	\N	t	2026-10-18 22:10:53.169304-05	\N	2	5
f5a9e866-6b53-4f38-8dce-6677713f36a2	Tallarines verdes con bistec	tallarines verdes con bistec	\N	\N	t	2026-10-18 22:10:53.169304-05	\N	2	5
\.


--
-- Data for Name: registros_ingreso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registros_ingreso (id_registro, nom_usuario, fec_hora_utc, es_exitoso, det_resultado, dir_ip) FROM stdin;
d1064e3b-3b91-4aa0-ba6d-00e66806f219	admin	2026-10-16 11:16:19.233491-05	t	Ingreso exitoso	::1
e5cb3f02-f640-4da5-8318-4e8e3e233d70	ass	2026-10-16 12:27:17.191882-05	f	Usuario inexistente	::1
3eb5bd1d-5c27-4de8-9e28-3ed4d5ca7b11	atorres	2026-10-16 13:08:10.965472-05	t	Ingreso exitoso	::1
9cccc5b9-c42c-45cd-84bb-735adbe83c94	atorres	2026-10-16 13:58:19.678797-05	t	Ingreso exitoso	::1
d07e4c9c-0613-44c6-8c6c-c77353d8d92e	sfs	2026-10-16 14:31:19.659955-05	f	Usuario inexistente	::1
34da16f8-fe5f-4f0c-bd4d-c67498fe0cca	admin	2026-10-16 17:45:59.022179-05	t	Ingreso exitoso	::1
88d25f86-64e2-4499-8a00-b2abcd408b2c	admin	2026-10-16 17:46:13.905562-05	t	Ingreso exitoso	::1
1e9558cf-8173-4e53-9b25-a392b6cca1b9	admin	2026-10-16 17:46:27.453129-05	t	Ingreso exitoso	::1
8335f6cd-a772-403c-8862-d8c458e897e7	lperez	2026-10-16 17:46:27.523627-05	t	Ingreso exitoso	::1
b578cdd6-3178-4e9c-a4cb-b6c14243a682	admin	2026-10-16 17:46:58.408278-05	t	Ingreso exitoso	::1
8e2d3725-188d-4e00-94c7-ce9603f40004	lperez	2026-10-16 17:46:58.467788-05	t	Ingreso exitoso	::1
fa6e7e3d-8c03-4495-aaf9-25fba7632794	admin	2026-10-16 17:47:15.793266-05	t	Ingreso exitoso	::1
f1354035-80a7-4d81-8866-80bda7251ee5	lperez	2026-10-16 17:47:15.954536-05	t	Ingreso exitoso	::1
00c76aa7-7471-402c-8312-e6b141bdd334	admin	2026-10-16 18:30:44.251697-05	t	Ingreso exitoso	::1
680983e6-6a71-4bf8-b588-ccae8239dd79	admin	2026-10-16 18:31:02.666477-05	t	Ingreso exitoso	::1
c0c34a30-21e4-4094-b0b5-7b9e7c66757e	atorres	2026-10-16 18:31:02.797901-05	t	Ingreso exitoso	::1
5d07d09c-7403-4f49-b40c-a51181eafd4d	admin	2026-10-16 18:31:02.885368-05	t	Ingreso exitoso	::1
6ae77da0-6d8c-4cae-982a-4184e4645385	admin	2026-10-16 18:31:03.098935-05	t	Ingreso exitoso	::1
94c975d7-2c84-4006-aded-8bbcf3aeed5e	admin	2026-10-16 18:31:03.200725-05	t	Ingreso exitoso	::1
e58b431c-a10b-4e49-83ad-bed7f7072423	admin	2026-10-16 18:31:11.136251-05	t	Ingreso exitoso	::1
30d10d8c-8ab4-48ab-b263-337ab9531a7e	atorres	2026-10-16 18:31:17.212461-05	t	Ingreso exitoso	::1
7d1d9a64-0400-4959-90d5-c4e595d101ca	admin	2026-10-16 18:31:22.450682-05	t	Ingreso exitoso	::1
880c10b2-a26c-430a-a0d8-ef04c3836321	admin	2026-10-16 18:31:28.884349-05	t	Ingreso exitoso	::1
70b4000b-cbed-4627-b50c-f203426f68c2	admin	2026-10-16 18:31:34.211143-05	t	Ingreso exitoso	::1
d3e3c2f4-e795-4a1c-9e24-71b3a147e833	admin	2026-10-16 18:31:59.627542-05	t	Ingreso exitoso	::1
69a81e6a-5152-4d94-acac-69aea677cea3	atorres	2026-10-16 18:31:59.660461-05	t	Ingreso exitoso	::1
0dcf038b-5a11-4a88-8d5e-bac00ebb4786	admin	2026-10-16 18:31:59.701015-05	t	Ingreso exitoso	::1
9a48b6a7-1f82-4bd6-8698-a06923eb40f5	admin	2026-10-16 18:31:59.870835-05	t	Ingreso exitoso	::1
ad99439e-09ff-48a2-bc54-2271b0e3d94d	admin	2026-10-16 18:31:59.981369-05	t	Ingreso exitoso	::1
88415e03-e0cd-40b4-ace8-d5d4d13fbc4a	admin	2026-10-16 18:32:06.454686-05	t	Ingreso exitoso	::1
85fe1afe-2a54-47f2-9d43-2428369a6560	admin	2026-10-16 18:32:16.047934-05	t	Ingreso exitoso	::1
af28b7f6-8db4-4084-95b7-4a5328cecccb	atorres	2026-10-16 18:32:16.08418-05	t	Ingreso exitoso	::1
0bba76f1-d2f7-4f3d-91f6-807a296538f3	admin	2026-10-16 18:32:16.128574-05	t	Ingreso exitoso	::1
5c344c84-8b17-40d2-9d5d-f0ceb16796a1	admin	2026-10-16 18:32:16.30328-05	t	Ingreso exitoso	::1
7f5ae8a0-52a7-468c-b461-b4f79a759ad8	admin	2026-10-16 18:32:16.406346-05	t	Ingreso exitoso	::1
b33865c9-2f45-4708-b7c5-097734b51799	admin	2026-10-17 10:20:56.950064-05	t	Ingreso exitoso	::1
a918bffa-22cb-4201-859c-f83a973758fc	admin	2026-10-17 10:31:47.389967-05	t	Ingreso exitoso	::1
b5aaaec5-86c5-4869-a0f7-201ba8482a67	atorres	2026-10-17 10:31:47.776137-05	t	Ingreso exitoso	::1
65bb14bd-b421-4bf6-bf4f-3beb834ca640	admin	2026-10-17 10:31:47.894337-05	t	Ingreso exitoso	::1
cd40fde0-3015-47d4-87b9-789b214f41f3	admin	2026-10-17 10:31:48.196497-05	t	Ingreso exitoso	::1
c054366f-d2a3-4dfc-964c-b615a52a3cc9	admin	2026-10-17 10:31:48.331352-05	t	Ingreso exitoso	::1
cb03a4b6-beb1-449d-9ef2-18837b30b7e0	admin	2026-10-17 10:57:38.806997-05	t	Ingreso exitoso	::1
cf5844b1-4076-48f5-8d83-96243a57cab2	crojas	2026-10-17 11:06:28.13479-05	f	Cuenta desactivada	::1
20ddc59a-f603-44f5-b750-362809074bfb	crojas	2026-10-17 11:06:33.218339-05	f	Cuenta desactivada	::1
7f41fad7-7004-4807-8395-c06d5c9db05a	atorres	2026-10-17 11:07:25.723279-05	t	Ingreso exitoso	::1
f7f9381e-afd5-498e-b7c0-224592a788a6	admin	2026-10-17 11:07:55.973297-05	t	Ingreso exitoso	::1
f0a802c8-26ab-495b-9597-8db01cf69282	admin	2026-10-17 11:10:16.099305-05	t	Ingreso exitoso	::1
c42cfdca-9700-4154-ad47-0f56f1f21b5a	atorres	2026-10-17 11:10:16.140024-05	t	Ingreso exitoso	::1
f318af00-67db-40ee-951f-f6fb3e1f417c	admin	2026-10-17 11:10:16.188023-05	t	Ingreso exitoso	::1
ed844a7b-763c-4b59-868d-aa33564493f6	admin	2026-10-17 11:10:16.389663-05	t	Ingreso exitoso	::1
1959d817-a919-4d4a-b2b4-e50af3670cd0	admin	2026-10-17 11:10:16.51175-05	t	Ingreso exitoso	::1
3703b64d-6142-43f4-9e73-11773581111d	admin	2026-10-17 11:16:18.29506-05	t	Ingreso exitoso	::1
7474adfc-3dcd-41d3-8b52-6af2be739fa4	atorres	2026-10-17 11:16:18.339538-05	t	Ingreso exitoso	::1
79e32c05-834a-46b3-8103-4312dfccfa82	admin	2026-10-17 11:16:18.388518-05	t	Ingreso exitoso	::1
6648d043-0404-4b1c-b9d8-e46a24940d30	admin	2026-10-17 11:16:18.615962-05	t	Ingreso exitoso	::1
656cd8f4-e6cf-4f7c-a2fc-6f1dda899a7d	admin	2026-10-17 11:16:18.742173-05	t	Ingreso exitoso	::1
4d5d5f8d-471b-44d8-b316-44393c0d917f	admin	2026-10-17 11:22:56.43472-05	t	Ingreso exitoso	::1
3ddb4b13-c3cd-48bf-a237-3d05847b7272	atorres	2026-10-17 11:22:56.474422-05	t	Ingreso exitoso	::1
40de67a7-6d72-4af9-9b3a-b2a43909a4f8	admin	2026-10-17 11:22:56.519713-05	t	Ingreso exitoso	::1
99b8202f-e21d-49f4-b584-a93b0e611392	admin	2026-10-17 11:22:56.726335-05	t	Ingreso exitoso	::1
f6927886-0279-4125-a2d3-0b15c7f1d75a	admin	2026-10-17 11:22:56.858034-05	t	Ingreso exitoso	::1
1f058cf0-1195-4262-8491-581e41146e7e	admin	2026-10-17 11:37:44.15265-05	t	Ingreso exitoso	::1
87739b83-aecb-43a3-b800-701a71369733	atorres	2026-10-17 11:37:44.185342-05	t	Ingreso exitoso	::1
9a54c7d3-aeb9-4e32-ba4b-d069f12dbfd1	admin	2026-10-17 11:37:44.223181-05	t	Ingreso exitoso	::1
b294324b-410d-470f-b5a3-939b56b67ee0	admin	2026-10-17 11:37:44.373457-05	t	Ingreso exitoso	::1
8992e98b-51b7-4811-97fc-3fcf81848c35	admin	2026-10-17 11:37:44.480674-05	t	Ingreso exitoso	::1
7ab2bd1f-2347-471e-8714-cba50b652a95	admin	2026-10-17 11:48:49.323739-05	t	Ingreso exitoso	::1
0b5e47aa-c2a3-48c3-bada-77ce92f200d5	atorres	2026-10-17 11:48:49.362054-05	t	Ingreso exitoso	::1
ce3cc2b5-fc69-47e1-8760-0ce16ecf5a57	admin	2026-10-17 11:48:49.40273-05	t	Ingreso exitoso	::1
d914e59e-f113-4fb3-9e4d-07e9bda525a9	admin	2026-10-17 11:48:49.574608-05	t	Ingreso exitoso	::1
17409432-fe5f-47e2-bd98-3210723bb5c0	admin	2026-10-17 11:48:49.687635-05	t	Ingreso exitoso	::1
b21f0c17-1c77-4ab0-a42e-adc6e1b4547b	admind	2026-10-17 11:51:34.221698-05	f	Usuario inexistente	::1
3a4f7f03-ba47-44a4-9dff-78f3aa6b5fc0	admin	2026-10-17 11:52:07.37081-05	t	Ingreso exitoso	::1
914d0c91-ecac-4c0c-b200-b388d30f894f	atorres	2026-10-17 11:54:50.633676-05	t	Ingreso exitoso	::1
e2d5dc28-61fd-4aab-8133-bbc696b88538	admin	2026-10-17 11:55:07.510239-05	t	Ingreso exitoso	::1
6c569c81-0722-4f96-a944-fac84387ea3f	admin	2026-10-17 11:55:29.006897-05	t	Ingreso exitoso	::1
627338fd-0ecb-4bc7-a29c-066aa4d91827	atorres	2026-10-17 11:55:29.043842-05	t	Ingreso exitoso	::1
d3bc7233-1934-4644-9102-240691ac53d0	admin	2026-10-17 11:55:29.09129-05	t	Ingreso exitoso	::1
744027d7-1332-4f3e-814a-2f64fb20003c	admin	2026-10-17 11:55:29.32303-05	t	Ingreso exitoso	::1
74ab7c9a-a59f-4df1-b27b-ab8bf5b29005	admin	2026-10-17 11:55:29.44846-05	t	Ingreso exitoso	::1
43a9ee04-d7c2-4bf4-b3ef-41107e20d367	admin	2026-10-17 12:00:31.670031-05	t	Ingreso exitoso	::1
f103f73d-096e-4065-b15a-c65b63bd4070	admin	2026-10-17 12:05:31.84907-05	t	Ingreso exitoso	::1
7bf59e56-fb17-4300-a278-8d27d98425ed	atorres	2026-10-17 12:05:31.878249-05	t	Ingreso exitoso	::1
ea3e75c3-9a38-4190-85d1-4a844f5c5194	admin	2026-10-17 12:05:31.97193-05	t	Ingreso exitoso	::1
6908a643-3093-4327-8450-f101578cccaf	admin	2026-10-17 12:05:32.175976-05	t	Ingreso exitoso	::1
3413df76-cbce-4509-9df9-86abc7a59689	admin	2026-10-17 12:05:32.295743-05	t	Ingreso exitoso	::1
b363243b-53a9-47d4-b476-b5906cf0ad6c	admin	2026-10-17 12:13:37.700668-05	t	Ingreso exitoso	::1
4823e025-5e8c-45ac-bba0-ca356d7c64d0	admin	2026-10-17 12:29:03.201462-05	t	Ingreso exitoso	::1
864c519d-253f-4a45-bf92-21944e7beb6d	atorres	2026-10-17 12:29:03.240933-05	t	Ingreso exitoso	::1
b1377c8c-2025-46d9-aa8f-4be02b378a8a	admin	2026-10-17 12:29:03.289322-05	t	Ingreso exitoso	::1
87fdf121-5587-4f5c-817d-9556ab70e691	admin	2026-10-17 12:29:03.50272-05	t	Ingreso exitoso	::1
204185dc-1d84-4020-a012-5e92a4efd81c	admin	2026-10-17 12:29:03.626699-05	t	Ingreso exitoso	::1
3843cfd0-84e8-4c9e-9847-23fa00857ac4	admin	2026-10-17 12:34:04.837607-05	t	Ingreso exitoso	::1
4448f1a9-b12c-4328-b0f3-72c8f0503890	atorres	2026-10-17 12:34:04.877619-05	t	Ingreso exitoso	::1
7795c6c7-dc65-41b3-bf6a-ed9a8f87ee39	admin	2026-10-17 12:34:04.917895-05	t	Ingreso exitoso	::1
9ec4f3b4-ff22-48c5-a93f-bc3dba2e09fb	admin	2026-10-17 12:34:05.095316-05	t	Ingreso exitoso	::1
73504b90-61e9-4283-abb5-e1174a798aa1	admin	2026-10-17 12:34:05.203781-05	t	Ingreso exitoso	::1
718d4143-4007-4799-925a-b55205f9acc1	admin	2026-10-17 12:49:17.065055-05	t	Ingreso exitoso	::1
0db1ca96-e52b-42aa-83a8-ef1b4b22e81f	admin	2026-10-17 13:05:11.172415-05	t	Ingreso exitoso	::1
836ab92b-5796-4971-8c3d-6409d4155e82	admin	2026-10-17 13:16:33.647304-05	t	Ingreso exitoso	::1
a8aef4dc-4228-49be-8a30-8f3a36fc81df	admin	2026-10-17 13:16:50.282709-05	t	Ingreso exitoso	::1
67a72c21-b879-4e77-96e1-fe44ce11fa7c	admin	2026-10-17 13:17:12.668203-05	t	Ingreso exitoso	::1
e415d4a6-4b65-433a-8450-fc50735e8034	admin	2026-10-17 13:17:36.469517-05	t	Ingreso exitoso	::1
ea1d5011-9272-4477-adc6-5f690945f756	admin	2026-10-17 13:20:27.418781-05	t	Ingreso exitoso	::1
cbd4957c-31cf-4a5a-aab7-81737cbcb114	admin	2026-10-17 14:01:31.71617-05	t	Ingreso exitoso	::1
45b17792-0f38-4d1c-b234-10f6a681d6bd	msoto	2026-10-17 14:01:32.937694-05	t	Ingreso exitoso	::1
278bed51-bb3d-40df-9fa7-76e80cafc5f7	admin	2026-10-17 14:09:25.106682-05	t	Ingreso exitoso	::1
01536e66-401e-4efe-949f-d1b225868208	msoto	2026-10-17 14:09:25.474718-05	t	Ingreso exitoso	::1
e6cb280a-603f-4a3e-bd37-efe2b9c9bd3c	admin	2026-10-17 14:11:22.397251-05	t	Ingreso exitoso	::1
ccd8ef99-1943-4542-bfa9-341ae02606ee	admin	2026-10-17 18:55:49.525722-05	t	Ingreso exitoso	::1
4ee59c9c-bbf1-4d47-a8da-731d9673c5c4	admin	2026-10-17 19:44:09.065641-05	t	Ingreso exitoso	::1
776a740e-71dc-4a9f-b12a-409145dc2e89	admin	2026-10-17 19:44:25.079435-05	t	Ingreso exitoso	::1
87a4c782-8c1f-4212-8d8d-b9513901c493	lperez	2026-10-17 20:11:32.080366-05	t	Ingreso exitoso	::1
dbc9e158-d80b-47bd-ad9d-0767f349f636	lperez	2026-10-17 20:12:10.035279-05	t	Ingreso exitoso	::1
f52bc8b2-00c8-4094-90d1-927e0007901a	lperez	2026-10-17 20:17:12.99798-05	t	Ingreso exitoso	::1
8d19ec2e-8394-4dfa-b4d2-0ccf211b0a7a	lperez	2026-10-17 20:19:01.507465-05	t	Ingreso exitoso	::1
ce41bb74-2826-433e-a07d-db0fa93c4303	lperez	2026-10-17 20:26:53.487058-05	t	Ingreso exitoso	::1
b3204bb7-1efb-47b2-b764-01d88cb897ad	atorres	2026-10-17 21:02:43.212813-05	t	Ingreso exitoso	::1
b5b6f16d-097a-43c8-a6d5-b9fdd734be87	atorres	2026-10-17 21:05:01.641974-05	t	Ingreso exitoso	::1
bec7cf92-4b42-4eb9-a1aa-57cccdf4a3af	atorres	2026-10-17 21:06:13.133626-05	t	Ingreso exitoso	::1
7bb0f060-bace-4641-99b9-e63a776059a6	lperez	2026-10-17 21:09:21.222787-05	t	Ingreso exitoso	::1
6a1bbff8-280f-4942-8dc4-b93d12695bfe	atorres	2026-10-17 21:12:51.840249-05	t	Ingreso exitoso	::1
1dd43bf8-be68-4075-90ec-218b5f954da1	admin	2026-10-17 21:30:04.592687-05	t	Ingreso exitoso	::1
5e4a5b9a-ce80-45ec-9812-0dc24cd51fb3	admin	2026-10-17 21:48:39.109332-05	t	Ingreso exitoso	::1
53ed5d6c-87c8-4187-bb54-222be1bc8af0	admin	2026-10-17 21:48:52.383135-05	t	Ingreso exitoso	::1
8a7cfc42-894f-4d0f-a541-395cc23e37bb	lperez	2026-10-17 21:49:03.453742-05	t	Ingreso exitoso	::1
9a32a1f5-290f-4378-83fd-39bb99741deb	admin	2026-10-17 22:01:36.208983-05	t	Ingreso exitoso	::1
061c3157-691e-47da-8384-5400330e71dc	msoto	2026-10-17 22:26:42.614504-05	t	Ingreso exitoso	::1
8ff48f91-8a19-44e0-b2be-493c723c573f	lperez	2026-10-17 22:30:39.6016-05	t	Ingreso exitoso	::1
93b50c2e-8441-458a-accd-450a574a3696	admin	2026-10-17 22:31:25.088487-05	t	Ingreso exitoso	::1
034719cc-01dc-4d3a-aa2d-7634551a5656	lperez	2026-10-17 22:51:15.415574-05	t	Ingreso exitoso	::1
77c71889-ffc9-4644-bacc-428ff4dbee9f	admin	2026-10-17 22:52:54.008138-05	t	Ingreso exitoso	::1
fb854d9d-d36b-44df-97c0-bcf2b731ec9d	atorres	2026-10-17 22:55:43.212935-05	t	Ingreso exitoso	::1
fdc695ee-2371-4f08-a5b6-a74e0a747046	admin	2026-10-17 22:58:43.029463-05	t	Ingreso exitoso	::1
9c6d1fac-5d27-4397-924f-548e4ad98350	lperez	2026-10-17 23:07:04.449906-05	t	Ingreso exitoso	::1
87610ea3-adfb-4159-9389-5e22f19feffe	msoto	2026-10-17 23:07:19.561823-05	t	Ingreso exitoso	::1
4ab044b6-c5a2-4d82-95bd-dde83c44b4c4	msoto	2026-10-17 23:09:54.967169-05	t	Ingreso exitoso	::1
70b49077-988b-45f9-ac31-c69de8f1c07d	admin	2026-10-17 23:13:46.523046-05	t	Ingreso exitoso	::1
38e81570-6af7-44c6-99ad-c9e954024d13	admin	2026-10-18 13:15:32.48559-05	t	Ingreso exitoso	::1
d55da203-8f05-4550-b689-3726cbac5dcd	admin	2026-10-18 13:18:17.812943-05	t	Ingreso exitoso	::1
26c767f7-66b9-4eb7-8f8a-3dfb34df4aea	admin	2026-10-18 13:19:26.024295-05	t	Ingreso exitoso	::1
69483dc8-1e0a-4fae-a87f-199e4519b087	atorres	2026-10-18 13:20:43.097441-05	t	Ingreso exitoso	::1
30783c2e-697a-435e-889c-fb70a8fe1c85	admin	2026-10-18 13:21:13.862957-05	t	Ingreso exitoso	::1
1c00be8f-4487-4e87-9d95-0dd8a6035375	atorres	2026-10-18 13:24:50.898098-05	t	Ingreso exitoso	::1
bbd9271e-2a98-40e9-b69f-dbc59f88d4f0	admin	2026-10-18 13:37:17.841673-05	t	Ingreso exitoso	::1
19d35ab1-b34b-4527-b65e-5b1b4c460b7a	atorres	2026-10-18 14:02:07.702686-05	t	Ingreso exitoso	::1
80532c83-5b3a-4fee-90e4-188bcae29bc0	admin	2026-10-18 14:09:17.146992-05	t	Ingreso exitoso	::1
f3476ed4-5361-41a6-9671-9b613f5687ce	admin	2026-10-18 14:40:50.169911-05	t	Ingreso exitoso	::1
d6833493-83e6-430d-82c0-8aa83f81d69d	admin	2026-10-18 14:54:25.057139-05	t	Ingreso exitoso	::1
5f3b3f43-5de4-4c28-af16-e47d126dfcca	admin	2026-10-18 17:11:00.054675-05	t	Ingreso exitoso	::1
f04a80b7-e95f-4379-a210-bec2f7101873	atorres	2026-10-18 17:38:50.913379-05	t	Ingreso exitoso	::1
d68bd093-f6f9-469a-bfd5-da2c446a7319	admin	2026-10-18 17:39:19.872637-05	t	Ingreso exitoso	::1
660ba87e-f78f-4653-9373-90bff2aa77aa	atorres	2026-10-18 17:42:58.187268-05	t	Ingreso exitoso	::1
27e02f89-ead1-4f41-a008-7dbade3c09d3	admin	2026-10-18 21:16:32.505917-05	t	Ingreso exitoso	::1
0475b746-14ec-4123-ab3f-7dbaa793b35a	admin	2026-10-18 22:00:02.226515-05	t	Ingreso exitoso	::1
28474eeb-cb21-45bd-933f-fb0fb1197492	admin	2026-10-18 22:36:15.074576-05	t	Ingreso exitoso	::1
cc91d7cc-ad6a-4d7a-9298-8ff3927e8574	admin	2026-10-18 22:36:19.322427-05	t	Ingreso exitoso	::1
f7577e14-1af3-4b21-aeba-9391705733f5	admin	2026-10-18 22:36:25.90391-05	t	Ingreso exitoso	::1
99a3db56-e86c-49b8-8fce-95227ce1e86c	admin	2026-10-18 22:36:31.591896-05	t	Ingreso exitoso	::1
b7e3669b-9c30-43c7-8373-44056e53ca6f	admin	2026-10-18 22:36:37.015249-05	t	Ingreso exitoso	::1
b6e11577-d835-4456-a289-95172dae5577	admin	2026-10-18 22:41:23.797786-05	t	Ingreso exitoso	::1
b1ce78aa-f7cb-4d70-bbb6-d42324018b42	admin	2026-10-18 22:55:41.176319-05	t	Ingreso exitoso	::1
3935ade4-3915-4223-9aaa-ab069fa314f6	admin	2026-10-18 22:55:51.694863-05	t	Ingreso exitoso	::1
1a53b108-581f-49ed-89b0-f9cbd6015603	admin	2026-10-18 23:00:54.51508-05	t	Ingreso exitoso	::1
dda0483d-c284-4254-bb16-9b92e9230187	admin	2026-10-18 23:01:07.601844-05	t	Ingreso exitoso	::1
7210b3d0-3143-49eb-90c5-3bcf6d909355	admin	2026-10-18 23:04:03.625359-05	t	Ingreso exitoso	::1
8307fbe8-e004-4ba3-8ca0-d081c626b0b4	admin	2026-10-18 23:04:19.136546-05	t	Ingreso exitoso	::1
cda1eddf-23dd-4bae-9268-fd0943da23ce	admin	2026-10-18 23:07:16.479424-05	t	Ingreso exitoso	::1
2e33c435-9324-45bd-847c-015a0db7e6ca	admin	2026-10-18 23:07:30.241263-05	t	Ingreso exitoso	::1
badb215d-78df-48b4-ad31-a96e6a9d755c	admin	2026-10-18 23:07:44.184062-05	t	Ingreso exitoso	::1
6104aebb-9088-4487-a23a-f79b0b7a9db9	admin	2026-10-18 23:11:41.996126-05	f	Contraseña incorrecta	::1
70658547-05c3-48bb-a67d-c77c2f4437dd	admin	2026-10-18 23:12:07.120507-05	t	Ingreso exitoso	::1
ed8d1389-66ba-48c0-abc0-bed9c5935ba7	admin	2026-10-18 23:12:28.642393-05	t	Ingreso exitoso	::1
00f3226e-1d07-4e85-81c4-4a130fac5a54	admin	2026-10-18 23:12:58.746865-05	t	Ingreso exitoso	::1
18fed83d-2af7-4271-b83d-b4eba2930bdd	admin	2026-10-18 23:13:07.855009-05	t	Ingreso exitoso	::1
f6b4654d-f359-4575-aa14-8b3a9a19b9ea	admin	2026-10-18 23:13:19.076772-05	t	Ingreso exitoso	::1
7390f090-c3d6-4e78-af5a-d0b083e666f8	admin	2026-10-18 23:13:40.70848-05	t	Ingreso exitoso	::1
c03b75d4-0063-4f0c-9536-1731a7f5f060	admin	2026-10-19 00:43:01.344108-05	t	Ingreso exitoso	::1
72ef95b2-4a06-4f9a-80f7-91a4e8df28cc	admin	2026-10-19 00:54:52.662753-05	t	Ingreso exitoso	::1
1295aef0-5e80-4ce4-abcf-f5abb871df68	admin	2026-10-19 09:23:45.703993-05	t	Ingreso exitoso	::1
9259b4be-07ff-416f-a4ce-24455a50d3ac	admin	2026-10-19 09:55:54.517176-05	t	Ingreso exitoso	::1
2dea84a3-990a-4948-af67-c7aeed230888	admin	2026-10-19 10:28:03.580881-05	t	Ingreso exitoso	::1
6c00ca56-7836-432c-a227-13d850a02f3f	admin	2026-10-19 10:59:07.405608-05	t	Ingreso exitoso	::1
6382e5ee-20a4-4b47-999d-45441d6ed117	admin	2026-10-19 11:29:54.634282-05	t	Ingreso exitoso	::1
0da1eeb0-b3cc-4c2d-ad87-a65a529f4a9a	lperez	2026-10-19 11:57:44.772897-05	t	Ingreso exitoso	::1
7f6377b9-10f7-4df3-bcc7-60c2c37cf787	admin	2026-10-19 12:07:54.338461-05	t	Ingreso exitoso	::1
39f74d92-a73e-4253-aa7e-c18d03f2b23e	admin	2026-10-19 12:40:54.162459-05	t	Ingreso exitoso	::1
e757b889-fb24-44c3-86dc-7c7cd253211e	atorres	2026-10-19 13:01:07.996056-05	t	Ingreso exitoso	::1
8d527169-ab38-4eef-bf4c-05a7900d226f	admin	2026-10-19 13:01:35.347277-05	t	Ingreso exitoso	::1
7baa5750-b81c-4582-a08a-03c6841eb85b	admin	2026-10-19 13:18:05.29408-05	t	Ingreso exitoso	::1
a76143c3-b086-4571-88d1-f9b186abef74	admin	2026-10-19 13:24:57.740267-05	t	Ingreso exitoso	::1
593f0466-7dd1-4281-8aa9-2ecb5b9c83f0	admin	2026-10-19 13:40:30.424718-05	t	Ingreso exitoso	::1
\.


--
-- Data for Name: tokens_revocados; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tokens_revocados (id_token_revocado, jti_token, nom_usuario, fec_expiracion_utc, fec_revocacion_utc, mot_revocacion) FROM stdin;
7e510d7e-2b89-43c6-8cd0-24c0dd6102fc	a17bca05-9da3-47a6-847c-d453b5245328	admin	2026-10-16 19:01:02-05	2026-10-16 18:31:03.017969-05	INTENTOS_FALLIDOS
1f921700-46d7-40e9-8248-e30fcc4e5718	560c7fb3-8bc7-49cb-b60c-eb6d1c19e74d	admin	2026-10-16 19:01:03-05	2026-10-16 18:31:03.165311-05	CAMBIO_CONTRASENA
9c4ae942-4528-4583-b3a2-9392aa2951e9	99732e16-48cf-4ee0-bafc-9d516406f172	admin	2026-10-16 19:01:03-05	2026-10-16 18:31:03.272107-05	CAMBIO_CONTRASENA
a36550f4-610b-407b-bbca-f7020f320bec	97a5b180-7b5a-44e9-ae51-85080b4e827b	admin	2026-10-16 19:01:03-05	2026-10-16 18:31:03.292326-05	MANUAL
ad6ac54d-001c-4665-bb85-b300aba7ac3e	0e24b953-0f07-4f80-ad8c-5a2a56fc0017	admin	2026-10-16 19:01:28-05	2026-10-16 18:31:28.94976-05	CAMBIO_CONTRASENA
0f049a18-dfea-4ba1-8edd-66cc7b7cc2f6	d8c8b361-fbaa-49da-8df1-004f7548bbe6	admin	2026-10-16 19:01:34-05	2026-10-16 18:31:34.277839-05	CAMBIO_CONTRASENA
afdc35f0-388c-4659-9586-e366ef0e316d	eb72d107-fafa-460c-b1b1-8c135cbc51db	admin	2026-10-16 19:01:59-05	2026-10-16 18:31:59.838556-05	INTENTOS_FALLIDOS
5e652c83-eb1f-4778-a067-344fedc860b3	43c3aac2-f882-47cf-979a-92767cc7cb6c	admin	2026-10-16 19:01:59-05	2026-10-16 18:31:59.950127-05	CAMBIO_CONTRASENA
91888580-27d0-4b68-9c72-808bd9ba3748	b393ae23-2df0-44f4-8c3b-1ec685223859	admin	2026-10-16 19:01:59-05	2026-10-16 18:32:00.058875-05	CAMBIO_CONTRASENA
fba3e616-08ae-41f8-a7ab-4870642fb28e	253b8557-355d-4df2-8f95-889c934a0c28	admin	2026-10-16 19:02:00-05	2026-10-16 18:32:00.065304-05	MANUAL
afd303a2-9f8b-4087-be76-1a61219a6dcc	bcbbef95-9edd-46ea-8063-d3b5be86a439	admin	2026-10-16 19:02:06-05	2026-10-16 18:32:06.586955-05	INTENTOS_FALLIDOS
38b07bf4-126b-4889-9745-e10bad2191a1	e7ed04a0-bb4c-40a9-aa8c-3f65f142c5bf	admin	2026-10-16 19:02:16-05	2026-10-16 18:32:16.261528-05	INTENTOS_FALLIDOS
df2ea466-73b3-4538-8072-e726705bf576	d396f96c-3efa-4f69-95e3-87eb4a58b4e1	admin	2026-10-16 19:02:16-05	2026-10-16 18:32:16.372499-05	CAMBIO_CONTRASENA
8956df9d-207c-4fe1-aa9e-f20ebc9133e2	2d93b22e-0efa-45ae-94ab-e31b76bc9a99	admin	2026-10-16 19:02:16-05	2026-10-16 18:32:16.480656-05	CAMBIO_CONTRASENA
1d88afc2-883b-4f26-9874-3a0b87b8dc2b	23c43463-7004-4b9e-b9cf-6931131b242f	admin	2026-10-16 19:02:16-05	2026-10-16 18:32:16.487328-05	MANUAL
27ffb0d9-0f7b-4545-b294-af5ee1d573ee	98b7a452-a71a-4373-b899-6a043b676d4b	admin	2026-10-17 11:01:47-05	2026-10-17 10:31:48.077683-05	INTENTOS_FALLIDOS
50315f96-c8bf-4f17-b846-dc13db5678bb	a6a34986-84bd-4138-a4aa-9a77657f8c8c	admin	2026-10-17 11:01:48-05	2026-10-17 10:31:48.283277-05	CAMBIO_CONTRASENA
6c5f9bf6-7eb4-4db8-af35-f95fd5fd5ee6	f7b8c6ea-a703-4ccc-b100-9207f1f9c9f2	admin	2026-10-17 11:01:48-05	2026-10-17 10:31:48.42108-05	CAMBIO_CONTRASENA
cb45b392-e78d-45cc-8761-bd2b6cbf7c2b	5ff0aeb6-a428-41a1-9979-bddd3f2b8772	admin	2026-10-17 11:01:48-05	2026-10-17 10:31:48.449375-05	MANUAL
30c0c87e-dbda-4c6e-b6b8-592f2d3fae54	af5e3188-ef2b-4a31-9b48-9c433dd32d98	admin	2026-10-17 11:27:38-05	2026-10-17 11:06:17.6796-05	MANUAL
2da301cc-2683-4ef9-9bee-017737141685	82b58ade-cc1b-41a8-b0ea-1ac8d7a078c4	atorres	2026-10-17 11:37:25-05	2026-10-17 11:07:51.137297-05	MANUAL
9abbcbbc-2f4c-41af-b792-f3294beb08a2	e2138dba-229e-407a-a12f-94f43a0eb1dd	admin	2026-10-17 11:40:16-05	2026-10-17 11:10:16.347786-05	INTENTOS_FALLIDOS
66bea00f-e0d1-423c-944d-34e48bf0510c	804248b1-6e6d-4c7d-9c34-b16421d3dee6	admin	2026-10-17 11:40:16-05	2026-10-17 11:10:16.474326-05	CAMBIO_CONTRASENA
9728476f-8749-4832-8fae-0ce6544a3e34	12732784-f688-4592-a347-ead818b39851	admin	2026-10-17 11:40:16-05	2026-10-17 11:10:16.592777-05	CAMBIO_CONTRASENA
777199a9-52ce-41f6-9576-beac432267b3	caf8d7c2-0422-4e35-9d52-e63d98800221	admin	2026-10-17 11:40:16-05	2026-10-17 11:10:16.600387-05	MANUAL
fa00db7f-b35f-4350-a3ff-3343b0527291	148d36ec-a103-4a20-8745-3bfcf5b343a6	admin	2026-10-17 11:46:18-05	2026-10-17 11:16:18.568973-05	INTENTOS_FALLIDOS
8eac768b-98cf-4bae-9475-0d0d5614baa7	4405233d-1436-45f5-b41d-61d2531f91f4	admin	2026-10-17 11:46:18-05	2026-10-17 11:16:18.701704-05	CAMBIO_CONTRASENA
9cb8a1d9-39c3-4222-87ae-d52c30b859b4	4434bba1-d153-4704-8cdc-792fb775f229	admin	2026-10-17 11:46:18-05	2026-10-17 11:16:18.829899-05	CAMBIO_CONTRASENA
a9a9b20c-7d20-4da0-af2f-5be0de265211	51004e37-9323-4aca-9e96-f3d8ca50b93d	admin	2026-10-17 11:46:18-05	2026-10-17 11:16:18.838863-05	MANUAL
75592b0f-2e16-4a96-98a1-94b74a3c534a	5c8394b7-c022-4c48-9be6-d18ab3216044	admin	2026-10-17 11:52:56-05	2026-10-17 11:22:56.683775-05	INTENTOS_FALLIDOS
8e7be0ab-52d7-474f-8dc0-b843f0b8a713	f42d5ae3-34da-445f-8968-9b78be4e5a70	admin	2026-10-17 11:52:56-05	2026-10-17 11:22:56.814053-05	CAMBIO_CONTRASENA
f8001b3e-f7e9-402d-8cab-ffb2d1e43dfc	9edf4421-e355-4509-be33-42e89bde1262	admin	2026-10-17 11:52:56-05	2026-10-17 11:22:56.950783-05	CAMBIO_CONTRASENA
e70394b3-a32f-47a0-b9f1-a71fe2127a15	c5dc8b24-a8b9-40c1-ad98-c501f0e85bdf	admin	2026-10-17 11:52:56-05	2026-10-17 11:22:56.958405-05	MANUAL
6abe3bde-f7d3-4299-b30c-3c81886d511d	ca321d2f-3b60-425b-8742-ef43fb31a1cb	admin	2026-10-17 12:07:44-05	2026-10-17 11:37:44.341364-05	INTENTOS_FALLIDOS
06e88b70-bfe7-4bb8-9bd7-60d6e6600319	0fa742be-63b8-41a5-b072-a42903d409d5	admin	2026-10-17 12:07:44-05	2026-10-17 11:37:44.440398-05	CAMBIO_CONTRASENA
e5de6043-f024-41ef-9571-11c3405c8dc1	b6be8d45-408a-4026-b1ba-f78dd369e20e	admin	2026-10-17 12:07:44-05	2026-10-17 11:37:44.552341-05	CAMBIO_CONTRASENA
9d05759a-3fd6-4084-8322-6bb0b6253a72	12fbc018-e53c-4902-a3ca-f5a815801e5e	admin	2026-10-17 12:07:44-05	2026-10-17 11:37:44.559188-05	MANUAL
ab9dcb06-459b-4fd7-8254-42842ff34dd5	c085db99-a9bc-40e1-82ab-83bfbd7fd491	admin	2026-10-17 12:18:49-05	2026-10-17 11:48:49.537065-05	INTENTOS_FALLIDOS
b2a9a5a7-eb7c-4bc9-8f6c-28583590326e	ee15bafb-d84d-4740-b8bd-b9b6b2068050	admin	2026-10-17 12:18:49-05	2026-10-17 11:48:49.652483-05	CAMBIO_CONTRASENA
d772567b-393e-4658-8b24-2b1694a9d1f8	5d18273d-f48a-429c-a5da-6cfa72cb29d2	admin	2026-10-17 12:18:49-05	2026-10-17 11:48:49.768262-05	CAMBIO_CONTRASENA
69a1d3fe-7fb7-4f5d-9280-2758c52bec21	06105437-889c-4c79-a9c6-ffc8ca527594	admin	2026-10-17 12:18:49-05	2026-10-17 11:48:49.773903-05	MANUAL
e4c47ad9-2f10-40c5-90d9-620489fde771	6c0b50fe-a594-470b-955b-7a421f27ca4f	admin	2026-10-17 12:22:07-05	2026-10-17 11:54:46.578119-05	MANUAL
8e2cd624-d580-4bfc-8b85-5a58fe4d3227	9b717001-344e-469f-b49c-232b914a8d93	atorres	2026-10-17 12:24:50-05	2026-10-17 11:55:01.957425-05	MANUAL
5e80405b-80b1-49a9-b004-933172407849	66e0b8e6-3914-424f-8e57-69d36bd892d5	admin	2026-10-17 12:25:29-05	2026-10-17 11:55:29.283122-05	INTENTOS_FALLIDOS
8c6e3925-ea92-429a-a824-314d748f52bf	2dbfeb47-b362-4d3d-a636-2ecffefe4820	admin	2026-10-17 12:25:29-05	2026-10-17 11:55:29.40349-05	CAMBIO_CONTRASENA
485d7f06-395e-4035-a777-205186e38e02	ca160730-5e69-4fab-82aa-edfd6bcc0c4b	admin	2026-10-17 12:25:29-05	2026-10-17 11:55:29.538512-05	CAMBIO_CONTRASENA
a6016c97-d6a4-41b5-babe-6c95d2f33706	98b5c2aa-2482-45b7-bdd1-918c098bdbd3	admin	2026-10-17 12:25:29-05	2026-10-17 11:55:29.548215-05	MANUAL
8a5379fd-750c-432c-8e11-ff05ee52739f	e9417ca7-8894-4283-b253-3c3b8f78d6cb	admin	2026-10-17 12:25:07-05	2026-10-17 11:56:40.768976-05	MANUAL
a51ba970-d4d1-456e-954f-31e2265e20cd	8dd235cb-5bd4-477a-913e-841879f2325e	admin	2026-10-17 12:30:31-05	2026-10-17 12:01:12.06728-05	MANUAL
583cdcae-2af4-459b-af70-87b7d7694ca0	696cc5c8-c169-47a6-a133-b2d5011ca7a0	admin	2026-10-17 12:35:31-05	2026-10-17 12:05:32.132888-05	INTENTOS_FALLIDOS
d15d0983-750a-4a40-9196-8605bddea556	06615781-910b-46c3-b369-028191cb6d26	admin	2026-10-17 12:35:32-05	2026-10-17 12:05:32.263103-05	CAMBIO_CONTRASENA
b7b4cb14-3c65-406c-9d35-2de7a57571ed	b0fe215b-e8fc-4a96-b7c2-9d6dfabf6df9	admin	2026-10-17 12:35:32-05	2026-10-17 12:05:32.376773-05	CAMBIO_CONTRASENA
31c931d7-d217-432f-a963-51c73d652f49	da3f7a5c-63e7-45b5-b605-16484ae3189c	admin	2026-10-17 12:35:32-05	2026-10-17 12:05:32.387677-05	MANUAL
f9ca3219-5385-46f2-8762-23b18192b333	2032f27d-5e0a-44e6-930c-e05ac8bf06ba	admin	2026-10-17 12:59:03-05	2026-10-17 12:29:03.46098-05	INTENTOS_FALLIDOS
ce43da83-f41e-4d91-9c9d-dc0a081fbd0d	8761c217-9e7f-41d1-bff9-8ace969211a3	admin	2026-10-17 12:59:03-05	2026-10-17 12:29:03.58202-05	CAMBIO_CONTRASENA
07000a28-8b23-4f5d-a39c-838351a8c52a	e7909e47-b1bd-45f2-9249-3f546e1f08a7	admin	2026-10-17 12:59:03-05	2026-10-17 12:29:03.715835-05	CAMBIO_CONTRASENA
7df74d20-a763-485c-ae08-07cff744eb58	83e4d80f-c983-4ec5-bea7-e5787df1f890	admin	2026-10-17 12:59:03-05	2026-10-17 12:29:03.723587-05	MANUAL
cabfae63-b267-40c0-8406-9bad17c4cfab	9c130035-09ae-499b-ad71-01bbd7e08bfc	admin	2026-10-17 13:04:04-05	2026-10-17 12:34:05.057681-05	INTENTOS_FALLIDOS
041f76ab-f69c-42f3-8365-a683a68d3f37	54052cd5-b86f-4801-af83-b004b3368fb3	admin	2026-10-17 13:04:05-05	2026-10-17 12:34:05.170141-05	CAMBIO_CONTRASENA
6b5ce865-9c1c-41f7-87fd-20751e4008fd	efd57a67-7e83-43fd-ae4c-3250566cccd0	admin	2026-10-17 13:04:05-05	2026-10-17 12:34:05.275035-05	CAMBIO_CONTRASENA
18c0c6d7-9804-46a9-bc28-c22faa9efcb1	3d67e2c7-7cc6-4177-ae1c-24bbf21d059b	admin	2026-10-17 13:04:05-05	2026-10-17 12:34:05.284208-05	MANUAL
5abb6f99-e351-4a2e-ab19-7920002f61d3	d4622df4-426e-488e-8c14-4a37c35948eb	atorres	2026-10-17 21:36:13-05	2026-10-17 21:09:17.040434-05	MANUAL
1cc40a8a-49b0-41d2-80a5-76c4926b0da5	b246b50c-179c-4ff4-8ecd-b8e53e60f510	lperez	2026-10-17 21:39:21-05	2026-10-17 21:09:28.495719-05	MANUAL
952f2019-c418-40dd-b56e-31dd8ed84339	15d438f8-79d4-4c84-9b85-aea1586d0072	admin	2026-10-17 22:31:36-05	2026-10-17 22:26:36.464623-05	MANUAL
2f971f6e-7f63-47d4-af77-1adc1044ea95	a7a08f92-5b3b-4a69-a14b-21f03777411c	msoto	2026-10-17 22:56:42-05	2026-10-17 22:30:36.129976-05	MANUAL
c0e5b57a-999d-4f8a-b682-1b90d3d4cfc8	aed9cdb0-6fc6-405b-bbd2-c46df0ed1339	lperez	2026-10-17 23:00:39-05	2026-10-17 22:31:21.997729-05	MANUAL
31826274-1141-495b-acbd-d3f03db9a23e	51078db3-45f9-4460-868d-5a7eff8a39c2	admin	2026-10-17 23:01:25-05	2026-10-17 22:51:12.895745-05	MANUAL
220104f8-103d-4299-8081-1b18bf4c0545	665cf2eb-f249-4b64-b9d0-556b24ef39cf	lperez	2026-10-17 23:21:15-05	2026-10-17 22:52:13.737145-05	MANUAL
ca728529-dbfb-4646-bc81-6fe629471f34	490e2a15-e02a-4cef-853f-3536dbd14d57	admin	2026-10-17 23:22:54-05	2026-10-17 22:55:40.282411-05	MANUAL
8b198b50-d9d1-4059-bb34-a32bc50b71bd	b2fd0980-c67c-4853-9dd0-ca2dcf9c53dd	atorres	2026-10-17 23:25:43-05	2026-10-17 22:58:39.545406-05	MANUAL
d4af3e70-3067-4db7-9ec4-5767360fccb0	03b54fdf-4cb1-47dc-aaec-aa44a173feec	admin	2026-10-17 23:28:43-05	2026-10-17 23:06:59.787415-05	MANUAL
c3c757a8-8128-406e-936d-103838b4de11	50c5637a-9e21-4e48-b850-410c9675e859	lperez	2026-10-17 23:37:04-05	2026-10-17 23:07:11.120637-05	MANUAL
ceb3ff87-24cc-4931-8395-6f059e5d760c	22a86a1c-6199-4c01-a6f7-67f306613d5e	msoto	2026-10-17 23:37:19-05	2026-10-17 23:08:32.474222-05	MANUAL
1b91c667-888d-47b6-a6c7-d976becdde0f	b02c577e-316f-4dad-b098-cf8c21d895fe	msoto	2026-10-17 23:39:54-05	2026-10-17 23:13:43.56087-05	MANUAL
19c4e84e-72ed-4e0d-a519-8d1f6c977d5f	00f5bcda-9a50-48cc-8a86-4ad6a2ca4c28	admin	2026-10-18 13:49:26-05	2026-10-18 13:20:40.772933-05	MANUAL
7c3c3e93-a897-412f-9289-daeba2efb74d	9801d7cc-02bd-4a47-bc42-8a27eb876844	atorres	2026-10-18 13:50:43-05	2026-10-18 13:21:06.125354-05	MANUAL
9cb4d8c8-0957-490e-a696-53e05ec0c25b	d3bc771f-942b-4daa-a200-7644170c5265	admin	2026-10-18 13:51:13-05	2026-10-18 13:24:45.448843-05	MANUAL
cc4e6d2f-2920-4c75-a414-14482c05360c	6ccc04a4-1363-4b87-9d3a-7c97261501d6	atorres	2026-10-18 13:54:50-05	2026-10-18 13:37:14.357821-05	MANUAL
0ac349c1-0cdb-4138-957a-06eaa4130567	927891f9-616d-4b8c-807a-f4eafbdcd112	admin	2026-10-18 14:07:17-05	2026-10-18 14:02:04.006387-05	MANUAL
78477f13-12dc-4886-9100-f5dc8ff9f1ad	bb54ad12-cf16-4be2-95db-2edeaaf959ae	atorres	2026-10-18 14:32:07-05	2026-10-18 14:02:21.530242-05	MANUAL
2c928d0b-b645-4441-8a0b-637324d9c874	90113b69-2871-4840-951a-4535f38c2595	admin	2026-10-18 15:10:50-05	2026-10-18 14:54:22.2858-05	MANUAL
c6451a66-45a5-4847-aaa3-1e93156556ab	ae500481-2ba8-4397-9692-3fc3bc4aab87	admin	2026-10-18 17:41:00-05	2026-10-18 17:38:47.701999-05	MANUAL
0a0c1ff2-39da-477f-be7e-36fbdd1a340c	eabf9dd4-0453-4544-9608-0f50f22ac748	atorres	2026-10-18 18:08:50-05	2026-10-18 17:39:17.095271-05	MANUAL
57f4eb12-1bfa-4367-8c84-1480f480abc2	8371c713-bc8a-4f83-877b-372421a7f231	admin	2026-10-18 18:09:19-05	2026-10-18 17:42:56.053154-05	MANUAL
72399955-ae08-4fa8-90cf-d325fbd16b9f	6cc4da7c-2123-4838-8727-cac8edefc7da	admin	2026-10-19 01:13:01-05	2026-10-19 00:54:48.946985-05	MANUAL
2d80811c-813e-4bfa-b9f4-42174973d0e4	f9874667-a352-4234-813d-b21f0d49ea15	admin	2026-10-19 11:59:54-05	2026-10-19 11:57:41.615615-05	MANUAL
b1324c4a-c260-4080-827b-fe2d1a6c2127	4bc6695c-0327-4d2f-8b83-93f55f5c6be4	lperez	2026-10-19 12:27:44-05	2026-10-19 12:07:50.582617-05	MANUAL
5157c4a3-e86b-4563-b324-d6cdf93bd726	37bf256b-3875-4912-8b9b-2a36187d2bff	admin	2026-10-19 12:37:54-05	2026-10-19 12:36:25.80065-05	MANUAL
e73a8000-2232-4ca9-83af-3c7899e9c4c9	4e233eea-edb8-435a-903f-11626f930f7c	admin	2026-10-19 13:10:54-05	2026-10-19 13:01:06.058166-05	MANUAL
701810c8-2ca2-4886-a85a-b50a9b2cda86	66221bde-3610-4415-912e-3c116cd37a89	atorres	2026-10-19 13:31:07-05	2026-10-19 13:01:33.14518-05	MANUAL
c3823d11-efdd-419e-8131-cf9024a30024	e1462c8e-66fe-401b-beef-48e4bcdccc40	admin	2026-10-19 13:31:35-05	2026-10-19 13:16:14.238242-05	MANUAL
f53f64f0-730e-4333-b0f2-2db7b51070cf	cf85b519-39df-4327-bb75-efa5deea31a1	admin	2026-10-19 13:48:05-05	2026-10-19 13:24:48.980537-05	MANUAL
ecd42742-5577-44d2-9a73-9dca4a82706d	4534cc14-04a8-4dcc-9ed7-2c409a19fefc	admin	2026-10-19 13:54:57-05	2026-10-19 13:40:27.087367-05	MANUAL
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id_usuario, nom_usuario, nom_completo, cor_usuario, has_usuario, rol_usuario, est_usuario, int_fallidos, bloq_hasta_utc, fec_creacion_utc, fec_actualizacion_utc) FROM stdin;
6010e97d-9fbb-4df6-b51f-ebd34b6d9433	crojas	Carlos Rojas (Inactivo)	crojas@girasoles.com	100000.osJuAs2gM4bBVq2C+vxRwQ==.zG/wiHDtZssoRvB3atxuGciNknbazMjt+oGZpd7JZS8=	3	f	0	\N	2026-10-16 10:55:25.222549-05	\N
757dee14-699f-470d-a65b-6ae01a46d5ac	dramos	Diego Ramos	dramos.nuevo@girasoles.com	100000.uwBgvjThaWU59T48FLoDtA==.RNQ0hHFQ8QPq2Hj/1sQh9j6/9/2cFNGDRnIMqo3/X/k=	3	t	0	\N	2026-10-16 17:46:13.949806-05	2026-10-17 11:03:53.373788-05
fdfbc247-2349-4bab-9d92-cc595b7a34d8	lperez	Luis Pérez	lperez@girasoles.com	100000.osJuAs2gM4bBVq2C+vxRwQ==.zG/wiHDtZssoRvB3atxuGciNknbazMjt+oGZpd7JZS8=	3	t	0	\N	2026-10-16 10:55:25.222548-05	2026-10-19 11:57:44.769155-05
920ba4f1-d552-4c76-b1c0-087b3b75770c	atorres	Ana Torres	atorres@girasoles.com	100000.osJuAs2gM4bBVq2C+vxRwQ==.zG/wiHDtZssoRvB3atxuGciNknbazMjt+oGZpd7JZS8=	2	t	0	\N	2026-10-16 10:55:25.222546-05	2026-10-19 13:01:07.993606-05
05c84bab-bb5e-479f-8a19-f309b7fde947	admin	Administradora General	admin@girasoles.com	100000.GUgXNk6jusz9ZqECzj039A==.oK8dwnfLNIiH5SnNIqPUGhkN65JeZAh/5wOHWVIZ0a4=	1	t	0	\N	2026-10-16 10:55:25.22248-05	2026-10-19 13:40:30.422265-05
89d58dff-4e1b-414c-8bf9-d59d098ec29f	msoto	María Soto A	msoto@girasoles.com	100000.osJuAs2gM4bBVq2C+vxRwQ==.zG/wiHDtZssoRvB3atxuGciNknbazMjt+oGZpd7JZS8=	4	t	0	\N	2026-10-16 10:55:25.222548-05	2026-10-17 23:09:54.965215-05
\.


--
-- Data for Name: ventas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ventas (id_venta, id_pedido, id_usuario, id_caja, ven_total, ven_metodo_pago, ven_monto_recibido, ven_vuelto, ven_yape_confirmado, ven_yape_referencia, ven_solicitud_id, ven_estado, ven_fecha_hora_utc, fec_creacion_utc, ven_motivo_anulacion, ven_usuario_anulacion, ven_fec_anulacion_utc, ven_destino_pedido) FROM stdin;
88f44142-8871-46f3-b4a5-f92b464c3700	03876d35-b378-4772-98cb-50238d1188e0	05c84bab-bb5e-479f-8a19-f309b7fde947	2ce4ef96-2d32-4e3a-b70c-90ffaf48c4e3	18.00	Efectivo	18.00	0.00	f	\N	24644075-1297-413d-9403-ba0063df2035	Vigente	2026-10-18 17:35:57.955593-05	2026-10-18 17:35:57.955731-05	\N	\N	\N	\N
\.


--
-- Name: menus_completos_partes_id_parte_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.menus_completos_partes_id_parte_seq', 5, true);


--
-- Name: codigos_recuperacion PK_codigos_recuperacion; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.codigos_recuperacion
    ADD CONSTRAINT "PK_codigos_recuperacion" PRIMARY KEY (id_codigo);


--
-- Name: registros_ingreso PK_registros_ingreso; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registros_ingreso
    ADD CONSTRAINT "PK_registros_ingreso" PRIMARY KEY (id_registro);


--
-- Name: usuarios PK_usuarios; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "PK_usuarios" PRIMARY KEY (id_usuario);


--
-- Name: auditorias_reporte auditorias_reporte_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditorias_reporte
    ADD CONSTRAINT auditorias_reporte_pkey PRIMARY KEY (id_auditoria);


--
-- Name: auditorias_usuario auditorias_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditorias_usuario
    ADD CONSTRAINT auditorias_usuario_pkey PRIMARY KEY (id_auditoria);


--
-- Name: lineas_pedido_opciones lineas_pedido_opciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lineas_pedido_opciones
    ADD CONSTRAINT lineas_pedido_opciones_pkey PRIMARY KEY (id_linea_pedido_opcion);


--
-- Name: menu_dia_menus_completos menu_dia_menus_completos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_dia_menus_completos
    ADD CONSTRAINT menu_dia_menus_completos_pkey PRIMARY KEY (id_menu_dia_menu_completo);


--
-- Name: menu_dia_platos menu_dia_platos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_dia_platos
    ADD CONSTRAINT menu_dia_platos_pkey PRIMARY KEY (id_menu_plato);


--
-- Name: menus_completos_partes menus_completos_partes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menus_completos_partes
    ADD CONSTRAINT menus_completos_partes_pkey PRIMARY KEY (id_parte);


--
-- Name: menus_completos menus_completos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menus_completos
    ADD CONSTRAINT menus_completos_pkey PRIMARY KEY (id_menu_completo);


--
-- Name: menus_dia menus_dia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menus_dia
    ADD CONSTRAINT menus_dia_pkey PRIMARY KEY (id_menu);


--
-- Name: auditorias_cobro pk_auditorias_cobro; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditorias_cobro
    ADD CONSTRAINT pk_auditorias_cobro PRIMARY KEY (id_auditoria);


--
-- Name: auditorias_mesa pk_auditorias_mesa; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditorias_mesa
    ADD CONSTRAINT pk_auditorias_mesa PRIMARY KEY (id_auditoria);


--
-- Name: auditorias_pedido pk_auditorias_pedido; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditorias_pedido
    ADD CONSTRAINT pk_auditorias_pedido PRIMARY KEY (id_auditoria);


--
-- Name: cajas pk_cajas; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cajas
    ADD CONSTRAINT pk_cajas PRIMARY KEY (id_caja);


--
-- Name: comandas pk_comandas; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comandas
    ADD CONSTRAINT pk_comandas PRIMARY KEY (id_comanda);


--
-- Name: comprobantes pk_comprobantes; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comprobantes
    ADD CONSTRAINT pk_comprobantes PRIMARY KEY (id_comprobante);


--
-- Name: detalles_comanda pk_detalles_comanda; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalles_comanda
    ADD CONSTRAINT pk_detalles_comanda PRIMARY KEY (id_detalle_comanda);


--
-- Name: detalles_pedido pk_detalles_pedido; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalles_pedido
    ADD CONSTRAINT pk_detalles_pedido PRIMARY KEY (id_detalle);


--
-- Name: mesas pk_mesas; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mesas
    ADD CONSTRAINT pk_mesas PRIMARY KEY (id_mesa);


--
-- Name: pedidos pk_pedidos; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pk_pedidos PRIMARY KEY (id_pedido);


--
-- Name: productos pk_productos; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT pk_productos PRIMARY KEY (id_producto);


--
-- Name: ventas pk_ventas; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT pk_ventas PRIMARY KEY (id_venta);


--
-- Name: tokens_revocados tokens_revocados_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tokens_revocados
    ADD CONSTRAINT tokens_revocados_pkey PRIMARY KEY (id_token_revocado);


--
-- Name: comprobantes uq_comprobantes_serie_numero; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comprobantes
    ADD CONSTRAINT uq_comprobantes_serie_numero UNIQUE (com_serie, com_numero);


--
-- Name: menu_dia_menus_completos uq_menu_dia_menu_completo; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_dia_menus_completos
    ADD CONSTRAINT uq_menu_dia_menu_completo UNIQUE (id_menu, id_menu_completo);


--
-- Name: ventas uq_ventas_solicitud; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT uq_ventas_solicitud UNIQUE (ven_solicitud_id);


--
-- Name: IX_codigos_recuperacion_cor_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_codigos_recuperacion_cor_usuario" ON public.codigos_recuperacion USING btree (cor_usuario);


--
-- Name: IX_menu_dia_platos_menu_producto; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IX_menu_dia_platos_menu_producto" ON public.menu_dia_platos USING btree (id_menu, id_producto);


--
-- Name: IX_menus_dia_fec_menu; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IX_menus_dia_fec_menu" ON public.menus_dia USING btree (fec_menu);


--
-- Name: IX_usuarios_cor_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_usuarios_cor_usuario" ON public.usuarios USING btree (cor_usuario);


--
-- Name: IX_usuarios_nom_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IX_usuarios_nom_usuario" ON public.usuarios USING btree (nom_usuario);


--
-- Name: idx_auditorias_reporte_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auditorias_reporte_fecha ON public.auditorias_reporte USING btree (fec_registro_utc);


--
-- Name: idx_auditorias_reporte_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auditorias_reporte_usuario ON public.auditorias_reporte USING btree (nom_usuario);


--
-- Name: idx_lpo_id_detalle; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lpo_id_detalle ON public.lineas_pedido_opciones USING btree (id_detalle);


--
-- Name: idx_lpo_id_producto; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lpo_id_producto ON public.lineas_pedido_opciones USING btree (id_producto);


--
-- Name: ix_auditorias_cobro_cajero; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_auditorias_cobro_cajero ON public.auditorias_cobro USING btree (nom_cajero);


--
-- Name: ix_auditorias_cobro_pedido; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_auditorias_cobro_pedido ON public.auditorias_cobro USING btree (num_pedido);


--
-- Name: ix_auditorias_nom_admin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_auditorias_nom_admin ON public.auditorias_usuario USING btree (nom_admin);


--
-- Name: ix_auditorias_nom_afectado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_auditorias_nom_afectado ON public.auditorias_usuario USING btree (nom_usuario_afectado);


--
-- Name: ix_cajas_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_cajas_estado ON public.cajas USING btree (caj_estado);


--
-- Name: ix_cajas_estado_fec_apertura; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_cajas_estado_fec_apertura ON public.cajas USING btree (caj_estado, caj_fec_apertura_utc DESC);


--
-- Name: ix_cajas_fec_apertura; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_cajas_fec_apertura ON public.cajas USING btree (caj_fec_apertura_utc);


--
-- Name: ix_cajas_fec_cierre; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_cajas_fec_cierre ON public.cajas USING btree (caj_fec_cierre_utc);


--
-- Name: ix_cajas_solicitud_id_cierre; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_cajas_solicitud_id_cierre ON public.cajas USING btree (caj_solicitud_id_cierre) WHERE (caj_solicitud_id_cierre IS NOT NULL);


--
-- Name: ix_cajas_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_cajas_usuario ON public.cajas USING btree (id_usuario);


--
-- Name: ix_cajas_usuario_cierre; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_cajas_usuario_cierre ON public.cajas USING btree (caj_id_usu_cierre);


--
-- Name: ix_comandas_pedido; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comandas_pedido ON public.comandas USING btree (id_pedido);


--
-- Name: ix_comprobantes_doc_receptor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comprobantes_doc_receptor ON public.comprobantes USING btree (com_num_doc_receptor);


--
-- Name: ix_comprobantes_tipo_serie; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comprobantes_tipo_serie ON public.comprobantes USING btree (com_tipo, com_serie);


--
-- Name: ix_comprobantes_venta; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comprobantes_venta ON public.comprobantes USING btree (id_venta);


--
-- Name: ix_detalles_comanda_comanda; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_detalles_comanda_comanda ON public.detalles_comanda USING btree (id_comanda);


--
-- Name: ix_detalles_pedido_pedido; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_detalles_pedido_pedido ON public.detalles_pedido USING btree (id_pedido);


--
-- Name: ix_menu_dia_menus_completos_id_menu; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_menu_dia_menus_completos_id_menu ON public.menu_dia_menus_completos USING btree (id_menu);


--
-- Name: ix_mesas_nom_mesa_normalizado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_mesas_nom_mesa_normalizado ON public.mesas USING btree (nom_mesa_normalizado);


--
-- Name: ix_pedidos_fecha_numero; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_pedidos_fecha_numero ON public.pedidos USING btree (ped_fecha_operativa, ped_numero_diario);


--
-- Name: ix_pedidos_mesa_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_pedidos_mesa_estado ON public.pedidos USING btree (id_mesa, ped_estado);


--
-- Name: ix_pedidos_solicitud_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_pedidos_solicitud_id ON public.pedidos USING btree (ped_solicitud_id);


--
-- Name: ix_productos_nom_normalizado_tip_producto; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_productos_nom_normalizado_tip_producto ON public.productos USING btree (nom_normalizado, tip_producto);


--
-- Name: ix_tokens_revocados_jti; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_tokens_revocados_jti ON public.tokens_revocados USING btree (jti_token);


--
-- Name: ix_tokens_revocados_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_tokens_revocados_usuario ON public.tokens_revocados USING btree (nom_usuario);


--
-- Name: ix_ventas_caja; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ventas_caja ON public.ventas USING btree (id_caja);


--
-- Name: ix_ventas_caja_estado_metodo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ventas_caja_estado_metodo ON public.ventas USING btree (id_caja, ven_estado, ven_metodo_pago);


--
-- Name: ix_ventas_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ventas_fecha ON public.ventas USING btree (ven_fecha_hora_utc);


--
-- Name: ix_ventas_pedido; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ventas_pedido ON public.ventas USING btree (id_pedido);


--
-- Name: ix_ventas_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ventas_usuario ON public.ventas USING btree (id_usuario);


--
-- Name: uq_cajas_solicitud_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_cajas_solicitud_id ON public.cajas USING btree (caj_solicitud_id) WHERE (caj_solicitud_id IS NOT NULL);


--
-- Name: uq_cajas_solo_una_abierta; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_cajas_solo_una_abierta ON public.cajas USING btree (caj_estado) WHERE ((caj_estado)::text = 'Abierta'::text);


--
-- Name: detalles_comanda detalles_comanda_id_menu_completo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalles_comanda
    ADD CONSTRAINT detalles_comanda_id_menu_completo_fkey FOREIGN KEY (id_menu_completo) REFERENCES public.menus_completos(id_menu_completo) ON DELETE RESTRICT;


--
-- Name: detalles_pedido detalles_pedido_id_menu_completo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalles_pedido
    ADD CONSTRAINT detalles_pedido_id_menu_completo_fkey FOREIGN KEY (id_menu_completo) REFERENCES public.menus_completos(id_menu_completo) ON DELETE RESTRICT;


--
-- Name: cajas fk_cajas_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cajas
    ADD CONSTRAINT fk_cajas_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE RESTRICT;


--
-- Name: cajas fk_cajas_usuario_cierre; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cajas
    ADD CONSTRAINT fk_cajas_usuario_cierre FOREIGN KEY (caj_id_usu_cierre) REFERENCES public.usuarios(id_usuario) ON DELETE RESTRICT;


--
-- Name: comandas fk_comandas_pedido; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comandas
    ADD CONSTRAINT fk_comandas_pedido FOREIGN KEY (id_pedido) REFERENCES public.pedidos(id_pedido) ON DELETE CASCADE;


--
-- Name: comprobantes fk_comprobantes_venta; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comprobantes
    ADD CONSTRAINT fk_comprobantes_venta FOREIGN KEY (id_venta) REFERENCES public.ventas(id_venta) ON DELETE CASCADE;


--
-- Name: detalles_comanda fk_detalles_comanda_comanda; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalles_comanda
    ADD CONSTRAINT fk_detalles_comanda_comanda FOREIGN KEY (id_comanda) REFERENCES public.comandas(id_comanda) ON DELETE CASCADE;


--
-- Name: detalles_comanda fk_detalles_comanda_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalles_comanda
    ADD CONSTRAINT fk_detalles_comanda_producto FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto) ON DELETE RESTRICT;


--
-- Name: detalles_pedido fk_detalles_pedido_pedido; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalles_pedido
    ADD CONSTRAINT fk_detalles_pedido_pedido FOREIGN KEY (id_pedido) REFERENCES public.pedidos(id_pedido) ON DELETE CASCADE;


--
-- Name: detalles_pedido fk_detalles_pedido_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalles_pedido
    ADD CONSTRAINT fk_detalles_pedido_producto FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto) ON DELETE RESTRICT;


--
-- Name: menu_dia_platos fk_menu_dia_platos_menu; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_dia_platos
    ADD CONSTRAINT fk_menu_dia_platos_menu FOREIGN KEY (id_menu) REFERENCES public.menus_dia(id_menu) ON DELETE CASCADE;


--
-- Name: menu_dia_platos fk_menu_dia_platos_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_dia_platos
    ADD CONSTRAINT fk_menu_dia_platos_producto FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto) ON DELETE CASCADE;


--
-- Name: menus_dia fk_menus_dia_desayuno; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menus_dia
    ADD CONSTRAINT fk_menus_dia_desayuno FOREIGN KEY (id_desayuno) REFERENCES public.productos(id_producto) ON DELETE SET NULL;


--
-- Name: pedidos fk_pedidos_mesa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT fk_pedidos_mesa FOREIGN KEY (id_mesa) REFERENCES public.mesas(id_mesa) ON DELETE SET NULL;


--
-- Name: pedidos fk_pedidos_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT fk_pedidos_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE RESTRICT;


--
-- Name: ventas fk_ventas_caja; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT fk_ventas_caja FOREIGN KEY (id_caja) REFERENCES public.cajas(id_caja) ON DELETE RESTRICT;


--
-- Name: ventas fk_ventas_pedido; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT fk_ventas_pedido FOREIGN KEY (id_pedido) REFERENCES public.pedidos(id_pedido) ON DELETE RESTRICT;


--
-- Name: ventas fk_ventas_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT fk_ventas_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE RESTRICT;


--
-- Name: lineas_pedido_opciones lineas_pedido_opciones_id_detalle_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lineas_pedido_opciones
    ADD CONSTRAINT lineas_pedido_opciones_id_detalle_fkey FOREIGN KEY (id_detalle) REFERENCES public.detalles_pedido(id_detalle) ON DELETE CASCADE;


--
-- Name: lineas_pedido_opciones lineas_pedido_opciones_id_producto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lineas_pedido_opciones
    ADD CONSTRAINT lineas_pedido_opciones_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto) ON DELETE RESTRICT;


--
-- Name: menu_dia_menus_completos menu_dia_menus_completos_id_menu_completo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_dia_menus_completos
    ADD CONSTRAINT menu_dia_menus_completos_id_menu_completo_fkey FOREIGN KEY (id_menu_completo) REFERENCES public.menus_completos(id_menu_completo) ON DELETE CASCADE;


--
-- Name: menu_dia_menus_completos menu_dia_menus_completos_id_menu_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_dia_menus_completos
    ADD CONSTRAINT menu_dia_menus_completos_id_menu_fkey FOREIGN KEY (id_menu) REFERENCES public.menus_dia(id_menu) ON DELETE CASCADE;


--
-- Name: menus_completos_partes menus_completos_partes_id_menu_completo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menus_completos_partes
    ADD CONSTRAINT menus_completos_partes_id_menu_completo_fkey FOREIGN KEY (id_menu_completo) REFERENCES public.menus_completos(id_menu_completo) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 5xSqPnw85Tgc95L9ChlVwrs0AZUXLMGVmQr6Gs2wP7tJqjs4mmV4YyjtmghwEhT

