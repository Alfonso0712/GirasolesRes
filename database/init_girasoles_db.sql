--
-- PostgreSQL database dump
--

\restrict s2IxRl8H7IGGHgN0nS99jo20X68RTuC7dUbLbkDuW3h3OPrmqnhMNVQQsFbMyHe

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

ALTER TABLE IF EXISTS ONLY public.pedidos DROP CONSTRAINT IF EXISTS fk_pedidos_usuario;
ALTER TABLE IF EXISTS ONLY public.pedidos DROP CONSTRAINT IF EXISTS fk_pedidos_mesa;
ALTER TABLE IF EXISTS ONLY public.menus_dia DROP CONSTRAINT IF EXISTS fk_menus_dia_desayuno;
ALTER TABLE IF EXISTS ONLY public.menu_dia_platos DROP CONSTRAINT IF EXISTS fk_menu_dia_platos_producto;
ALTER TABLE IF EXISTS ONLY public.menu_dia_platos DROP CONSTRAINT IF EXISTS fk_menu_dia_platos_menu;
ALTER TABLE IF EXISTS ONLY public.detalles_pedido DROP CONSTRAINT IF EXISTS fk_detalles_pedido_producto;
ALTER TABLE IF EXISTS ONLY public.detalles_pedido DROP CONSTRAINT IF EXISTS fk_detalles_pedido_pedido;
ALTER TABLE IF EXISTS ONLY public.detalles_comanda DROP CONSTRAINT IF EXISTS fk_detalles_comanda_producto;
ALTER TABLE IF EXISTS ONLY public.detalles_comanda DROP CONSTRAINT IF EXISTS fk_detalles_comanda_comanda;
ALTER TABLE IF EXISTS ONLY public.comandas DROP CONSTRAINT IF EXISTS fk_comandas_pedido;
DROP INDEX IF EXISTS public.ix_tokens_revocados_usuario;
DROP INDEX IF EXISTS public.ix_tokens_revocados_jti;
DROP INDEX IF EXISTS public.ix_productos_nom_normalizado;
DROP INDEX IF EXISTS public.ix_pedidos_solicitud_id;
DROP INDEX IF EXISTS public.ix_pedidos_mesa_estado;
DROP INDEX IF EXISTS public.ix_pedidos_fecha_numero;
DROP INDEX IF EXISTS public.ix_mesas_nom_mesa_normalizado;
DROP INDEX IF EXISTS public.ix_detalles_pedido_pedido;
DROP INDEX IF EXISTS public.ix_detalles_comanda_comanda;
DROP INDEX IF EXISTS public.ix_comandas_pedido;
DROP INDEX IF EXISTS public.ix_auditorias_nom_afectado;
DROP INDEX IF EXISTS public.ix_auditorias_nom_admin;
DROP INDEX IF EXISTS public."IX_usuarios_nom_usuario";
DROP INDEX IF EXISTS public."IX_usuarios_cor_usuario";
DROP INDEX IF EXISTS public."IX_menus_dia_fec_menu";
DROP INDEX IF EXISTS public."IX_menu_dia_platos_menu_producto";
DROP INDEX IF EXISTS public."IX_codigos_recuperacion_cor_usuario";
ALTER TABLE IF EXISTS ONLY public.tokens_revocados DROP CONSTRAINT IF EXISTS tokens_revocados_pkey;
ALTER TABLE IF EXISTS ONLY public.productos DROP CONSTRAINT IF EXISTS pk_productos;
ALTER TABLE IF EXISTS ONLY public.pedidos DROP CONSTRAINT IF EXISTS pk_pedidos;
ALTER TABLE IF EXISTS ONLY public.mesas DROP CONSTRAINT IF EXISTS pk_mesas;
ALTER TABLE IF EXISTS ONLY public.detalles_pedido DROP CONSTRAINT IF EXISTS pk_detalles_pedido;
ALTER TABLE IF EXISTS ONLY public.detalles_comanda DROP CONSTRAINT IF EXISTS pk_detalles_comanda;
ALTER TABLE IF EXISTS ONLY public.comandas DROP CONSTRAINT IF EXISTS pk_comandas;
ALTER TABLE IF EXISTS ONLY public.auditorias_pedido DROP CONSTRAINT IF EXISTS pk_auditorias_pedido;
ALTER TABLE IF EXISTS ONLY public.auditorias_mesa DROP CONSTRAINT IF EXISTS pk_auditorias_mesa;
ALTER TABLE IF EXISTS ONLY public.menus_dia DROP CONSTRAINT IF EXISTS menus_dia_pkey;
ALTER TABLE IF EXISTS ONLY public.menu_dia_platos DROP CONSTRAINT IF EXISTS menu_dia_platos_pkey;
ALTER TABLE IF EXISTS ONLY public.auditorias_usuario DROP CONSTRAINT IF EXISTS auditorias_usuario_pkey;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS "PK_usuarios";
ALTER TABLE IF EXISTS ONLY public.registros_ingreso DROP CONSTRAINT IF EXISTS "PK_registros_ingreso";
ALTER TABLE IF EXISTS ONLY public.codigos_recuperacion DROP CONSTRAINT IF EXISTS "PK_codigos_recuperacion";
DROP TABLE IF EXISTS public.usuarios;
DROP TABLE IF EXISTS public.tokens_revocados;
DROP TABLE IF EXISTS public.registros_ingreso;
DROP TABLE IF EXISTS public.productos;
DROP TABLE IF EXISTS public.pedidos;
DROP TABLE IF EXISTS public.mesas;
DROP TABLE IF EXISTS public.menus_dia;
DROP TABLE IF EXISTS public.menu_dia_platos;
DROP TABLE IF EXISTS public.detalles_pedido;
DROP TABLE IF EXISTS public.detalles_comanda;
DROP TABLE IF EXISTS public.comandas;
DROP TABLE IF EXISTS public.codigos_recuperacion;
DROP TABLE IF EXISTS public.auditorias_usuario;
DROP TABLE IF EXISTS public.auditorias_pedido;
DROP TABLE IF EXISTS public.auditorias_mesa;
SET default_tablespace = '';

SET default_table_access_method = heap;

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
    cmd_nom_usuario_aviso_visto character varying(50)
);


ALTER TABLE public.comandas OWNER TO postgres;

--
-- Name: detalles_comanda; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalles_comanda (
    id_detalle_comanda uuid NOT NULL,
    id_comanda uuid NOT NULL,
    id_producto uuid NOT NULL,
    dtc_nombre_producto character varying(100) NOT NULL,
    dtc_cantidad integer NOT NULL,
    dtc_observacion character varying(100),
    fec_creacion_utc timestamp with time zone NOT NULL
);


ALTER TABLE public.detalles_comanda OWNER TO postgres;

--
-- Name: detalles_pedido; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalles_pedido (
    id_detalle uuid NOT NULL,
    id_pedido uuid NOT NULL,
    id_producto uuid NOT NULL,
    det_cantidad integer NOT NULL,
    det_precio_unitario numeric(8,2) NOT NULL,
    det_subtotal numeric(8,2) NOT NULL,
    det_observacion character varying(100),
    fec_creacion_utc timestamp with time zone NOT NULL
);


ALTER TABLE public.detalles_pedido OWNER TO postgres;

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
    cat_producto integer NOT NULL,
    pre_producto numeric(8,2) NOT NULL,
    est_producto boolean DEFAULT true NOT NULL,
    fec_creacion_utc timestamp with time zone NOT NULL,
    fec_actualizacion_utc timestamp with time zone
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
-- Data for Name: auditorias_mesa; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: auditorias_pedido; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.auditorias_pedido VALUES ('8f676370-8fbc-4e1a-8c8f-b7ae78f85307', 'lperez', 'RegistroPedido', 'Mesa 1', 1, 'Pedido #1 registrado para Mesa 1. Líneas: 2. Total: S/ 18.00', '2026-10-17 20:12:10.591844-05', '::1');
INSERT INTO public.auditorias_pedido VALUES ('40d6cd8a-e55c-4eca-8632-06a6b5cce8cf', 'lperez', 'RegistroPedido', 'Mesa 2', 2, 'Pedido #2 registrado para Mesa 2. Líneas: 2. Total: S/ 18.00', '2026-10-17 20:17:14.158608-05', '::1');
INSERT INTO public.auditorias_pedido VALUES ('9ad60234-e725-4b93-82f1-0fc3930b0501', 'lperez', 'RegistroPedido', 'Mesa 4', 3, 'Pedido #3 registrado para Mesa 4. Líneas: 2. Total: S/ 18.00', '2026-10-17 20:19:02.541797-05', '::1');
INSERT INTO public.auditorias_pedido VALUES ('1ab25e6f-731d-4edb-9faa-1caff1644c59', 'lperez', 'AmpliacionPedido', 'Mesa 4', 3, 'Ampliación de pedido #3 con 1 nuevas líneas. Nuevo total: S/ 23.00', '2026-10-17 20:19:02.770753-05', '::1');
INSERT INTO public.auditorias_pedido VALUES ('7e3c0444-30a7-4c1c-84a2-f6a7e57f7ee4', 'atorres', 'RegistroPedidoLlevar', 'Para llevar', 4, 'Pedido para llevar #4 registrado (Ref: Sra. Rosa). Líneas: 1. Total: S/ 10.00', '2026-10-17 21:02:43.800509-05', '::1');
INSERT INTO public.auditorias_pedido VALUES ('7e9e1786-f0e4-471e-9a88-bac59c3d5e24', 'atorres', 'RegistroPedidoLlevar', 'Para llevar', 5, 'Pedido para llevar #5 registrado (Ref: Test Idempotencia). Líneas: 1. Total: S/ 5.00', '2026-10-17 21:05:01.774801-05', '::1');


--
-- Data for Name: auditorias_usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.auditorias_usuario VALUES ('9828bdf8-472c-4fef-96b3-041005213c66', 'admin', 'REGISTRO', 'dramos', 'Rol asignado: Mozo', '2026-10-16 17:45:59.571128-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('27d6f6b3-6218-4992-ae86-d56be23bf164', 'admin', 'EDICION_Y_PASSWORD', 'dramos', 'Rol: Mozo', '2026-10-16 17:45:59.761011-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('aca124a4-6948-493c-898d-6feb21700962', 'admin', 'DESACTIVACION', 'dramos', 'Estado cambiado a Inactivo', '2026-10-16 17:45:59.789542-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('db1ce097-0559-4bfa-9967-1a0d0465cde3', 'admin', 'ACTIVACION', 'dramos', 'Estado cambiado a Activo', '2026-10-16 17:45:59.800107-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('4a015e9b-f377-4ebf-867f-3421b1ab53b9', 'admin', 'ELIMINACION', 'dramos', 'Eliminación física del usuario sin movimientos', '2026-10-16 17:45:59.889374-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('47b5cd02-2d30-4de9-abad-dc50b14c9b6e', 'admin', 'REGISTRO', 'dramos', 'Rol asignado: Mozo', '2026-10-16 17:46:13.952926-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('6c96395b-3765-4f30-8a7c-e3c9cc663554', 'admin', 'EDICION_Y_PASSWORD', 'dramos', 'Rol: Mozo', '2026-10-16 17:46:14.005161-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('c9d9d031-4f35-4904-bf3c-29747dcfcd9a', 'admin', 'DESACTIVACION', 'dramos', 'Estado cambiado a Inactivo', '2026-10-16 17:46:14.014901-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('3ee32020-29a0-4cc8-b76c-0a28c36cfa8a', 'admin', 'ACTIVACION', 'dramos', 'Estado cambiado a Activo', '2026-10-16 17:46:14.025161-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('21d685c2-004e-49a6-a202-1322d19c662b', 'admin', 'REGISTRO', 'useruuxx', 'Rol asignado: Mozo', '2026-10-16 17:47:15.837625-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('293e66d0-a4c1-4c65-9aea-d68c56f9a7c2', 'admin', 'EDICION_Y_PASSWORD', 'useruuxx', 'Rol: Mozo', '2026-10-16 17:47:15.883332-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('5d512099-c591-42b8-a6d3-4a1360eb1511', 'admin', 'DESACTIVACION', 'useruuxx', 'Estado cambiado a Inactivo', '2026-10-16 17:47:15.891515-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('579f9220-824f-462d-b67f-dab5ba5447c4', 'admin', 'ACTIVACION', 'useruuxx', 'Estado cambiado a Activo', '2026-10-16 17:47:15.899596-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('684f228e-e3f1-4977-9047-500064ca76ee', 'admin', 'ELIMINACION', 'useruuxx', 'Eliminación física del usuario sin movimientos', '2026-10-16 17:47:15.919711-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('5c616396-f79a-4670-947c-5a95723f6349', 'admin', 'CIERRE_SESION', 'admin', 'Cierre por 5 intentos fallidos consecutivos al cambiar contraseña', '2026-10-16 18:31:03.03906-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('b4eb06a2-c115-4a05-8b90-84995d0a3d18', 'admin', 'CAMBIO_PASSWORD_PROPIA', 'admin', 'Cambio de contraseña exitoso desde perfil (barra superior)', '2026-10-16 18:31:03.166805-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('5d70339a-6e53-4ec5-8747-278689c3f40a', 'admin', 'CAMBIO_PASSWORD_PROPIA', 'admin', 'Cambio de contraseña exitoso desde perfil (barra superior)', '2026-10-16 18:31:03.273654-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('71982919-152a-42af-801f-97cb7d7268fa', 'admin', 'CIERRE_SESION', 'admin', 'Cierre de sesión motivo: manual', '2026-10-16 18:31:03.294138-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('1c343b5e-8738-4382-a235-e42e3107fb5a', 'admin', 'CAMBIO_PASSWORD_PROPIA', 'admin', 'Cambio de contraseña exitoso desde perfil (barra superior)', '2026-10-16 18:31:28.951371-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('f24816a0-7615-4e0c-85a4-103c92ad2f5b', 'admin', 'CAMBIO_PASSWORD_PROPIA', 'admin', 'Cambio de contraseña exitoso desde perfil (barra superior)', '2026-10-16 18:31:34.279343-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('ca1b88c5-c638-4872-8d19-fc31bac837c1', 'admin', 'CIERRE_SESION', 'admin', 'Cierre por 5 intentos fallidos consecutivos al cambiar contraseña', '2026-10-16 18:31:59.840119-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('0cfe83a3-a322-4fb9-a0f9-fe9923f42d5d', 'admin', 'CAMBIO_PASSWORD_PROPIA', 'admin', 'Cambio de contraseña exitoso desde perfil (barra superior)', '2026-10-16 18:31:59.951453-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('3e80b74b-60b0-434b-8fe1-1005b42f3391', 'admin', 'CAMBIO_PASSWORD_PROPIA', 'admin', 'Cambio de contraseña exitoso desde perfil (barra superior)', '2026-10-16 18:32:00.059989-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('912483f5-e8cf-4a4c-8405-cf15499cf94b', 'admin', 'CIERRE_SESION', 'admin', 'Cierre de sesión motivo: manual', '2026-10-16 18:32:00.066223-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('f9205382-e42f-4799-a31d-d2eb0abce749', 'admin', 'CIERRE_SESION', 'admin', 'Cierre por 5 intentos fallidos consecutivos al cambiar contraseña', '2026-10-16 18:32:06.588246-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('df4cab78-dcee-49c6-b50a-ca9e1cfe6070', 'admin', 'CIERRE_SESION', 'admin', 'Cierre por 5 intentos fallidos consecutivos al cambiar contraseña', '2026-10-16 18:32:16.262804-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('8653969d-41c9-4ad6-8f81-e7f0981303c4', 'admin', 'CAMBIO_PASSWORD_PROPIA', 'admin', 'Cambio de contraseña exitoso desde perfil (barra superior)', '2026-10-16 18:32:16.373409-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('00192c46-4f81-44c4-99f4-c63b6b7e9fef', 'admin', 'CAMBIO_PASSWORD_PROPIA', 'admin', 'Cambio de contraseña exitoso desde perfil (barra superior)', '2026-10-16 18:32:16.481747-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('56c713aa-a8a2-4993-9202-d724074dedd9', 'admin', 'CIERRE_SESION', 'admin', 'Cierre de sesión motivo: manual', '2026-10-16 18:32:16.488229-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('e8e84bc6-8ddb-48c8-beb3-b0a42e43c7a0', 'admin', 'CIERRE_SESION', 'admin', 'Cierre por 5 intentos fallidos consecutivos al cambiar contraseña', '2026-10-17 10:31:48.107233-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('eb7f8e8d-3741-4521-aa9a-fcde11877420', 'admin', 'CAMBIO_PASSWORD_PROPIA', 'admin', 'Cambio de contraseña exitoso desde perfil (barra superior)', '2026-10-17 10:31:48.285187-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('b2316fd7-6422-4772-a688-7e2674d15ad7', 'admin', 'CAMBIO_PASSWORD_PROPIA', 'admin', 'Cambio de contraseña exitoso desde perfil (barra superior)', '2026-10-17 10:31:48.422941-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('31b0aa3f-7e2e-44f2-af42-33edf09faf30', 'admin', 'CIERRE_SESION', 'admin', 'Cierre de sesión motivo: manual', '2026-10-17 10:31:48.451836-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('66c7a909-d2b7-42c5-8739-5e462dd12330', 'admin', 'EDICION', 'dramos', 'Rol: Mozo', '2026-10-17 11:03:53.379952-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('b092c7ea-b69c-47f7-8f85-f49fd4fdb254', 'admin', 'EDICION', 'msoto', 'Rol: Cocinero', '2026-10-17 11:04:09.421169-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('47cce813-8a0a-42aa-8319-7d786faf5cec', 'admin', 'CIERRE_SESION', 'admin', 'Cierre de sesión motivo: manual', '2026-10-17 11:06:17.681518-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('79da0405-cd06-49a6-b8bb-acdf12bd8116', 'atorres', 'CIERRE_SESION', 'atorres', 'Cierre de sesión motivo: manual', '2026-10-17 11:07:51.13902-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('d0e268e8-5741-4d58-8e8a-398a638ae88b', 'admin', 'CIERRE_SESION', 'admin', 'Cierre por 5 intentos fallidos consecutivos al cambiar contraseña', '2026-10-17 11:10:16.350586-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('a7127869-9cd1-4108-be6e-517d26f23ed5', 'admin', 'CAMBIO_PASSWORD_PROPIA', 'admin', 'Cambio de contraseña exitoso desde perfil (barra superior)', '2026-10-17 11:10:16.47598-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('ada14d6c-96a2-41f4-bfa1-2bd01b3591fb', 'admin', 'CAMBIO_PASSWORD_PROPIA', 'admin', 'Cambio de contraseña exitoso desde perfil (barra superior)', '2026-10-17 11:10:16.594056-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('aa558490-a500-4286-9638-f3dbf5d143f3', 'admin', 'CIERRE_SESION', 'admin', 'Cierre de sesión motivo: manual', '2026-10-17 11:10:16.601691-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('cf471a27-dc30-416c-bb99-f968e2a5958a', 'admin', 'CIERRE_SESION', 'admin', 'Cierre por 5 intentos fallidos consecutivos al cambiar contraseña', '2026-10-17 11:16:18.571489-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('6f3eb5b4-7014-4331-805c-24e8ead8f915', 'admin', 'CAMBIO_PASSWORD_PROPIA', 'admin', 'Cambio de contraseña exitoso desde perfil (barra superior)', '2026-10-17 11:16:18.703175-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('52d29af1-fcfe-4561-b535-4932199c4088', 'admin', 'CAMBIO_PASSWORD_PROPIA', 'admin', 'Cambio de contraseña exitoso desde perfil (barra superior)', '2026-10-17 11:16:18.831357-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('d902b860-e628-485b-822a-51b12b71b779', 'admin', 'CIERRE_SESION', 'admin', 'Cierre de sesión motivo: manual', '2026-10-17 11:16:18.840147-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('ce26fed5-653c-4677-b57a-24a331f7e42f', 'admin', 'CIERRE_SESION', 'admin', 'Cierre por 5 intentos fallidos consecutivos al cambiar contraseña', '2026-10-17 11:22:56.686076-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('e5b7c72e-dfd2-44cc-868c-701c8477ce33', 'admin', 'CAMBIO_PASSWORD_PROPIA', 'admin', 'Cambio de contraseña exitoso desde perfil (barra superior)', '2026-10-17 11:22:56.815812-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('8bb10d77-c5c9-4a39-b1e3-2c72095ffba5', 'admin', 'CAMBIO_PASSWORD_PROPIA', 'admin', 'Cambio de contraseña exitoso desde perfil (barra superior)', '2026-10-17 11:22:56.95204-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('cab3fac4-43cc-4ac5-ab7c-610b312a637a', 'admin', 'CIERRE_SESION', 'admin', 'Cierre de sesión motivo: manual', '2026-10-17 11:22:56.95963-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('f91dd7b5-7d9a-4358-9c63-25fc5018e4a8', 'admin', 'CIERRE_SESION', 'admin', 'Cierre por 5 intentos fallidos consecutivos al cambiar contraseña', '2026-10-17 11:37:44.342677-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('4bce712a-7fd9-4d49-8833-9bc60a532e89', 'admin', 'CAMBIO_PASSWORD_PROPIA', 'admin', 'Cambio de contraseña exitoso desde perfil (barra superior)', '2026-10-17 11:37:44.442218-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('f2ab0136-9300-45a1-8e4e-739003528f89', 'admin', 'CAMBIO_PASSWORD_PROPIA', 'admin', 'Cambio de contraseña exitoso desde perfil (barra superior)', '2026-10-17 11:37:44.553552-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('41c62ffa-6c00-43fb-91e7-17dbfc0ae203', 'admin', 'CIERRE_SESION', 'admin', 'Cierre de sesión motivo: manual', '2026-10-17 11:37:44.560213-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('414fc684-1e7b-4ca1-8ed4-471756deecb3', 'admin', 'CIERRE_SESION', 'admin', 'Cierre por 5 intentos fallidos consecutivos al cambiar contraseña', '2026-10-17 11:48:49.538588-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('ec03b266-548e-4ee7-ba37-2040d58a12c4', 'admin', 'CAMBIO_PASSWORD_PROPIA', 'admin', 'Cambio de contraseña exitoso desde perfil (barra superior)', '2026-10-17 11:48:49.653483-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('3386002f-d4e9-4b1d-a826-ce0f12e2d079', 'admin', 'CAMBIO_PASSWORD_PROPIA', 'admin', 'Cambio de contraseña exitoso desde perfil (barra superior)', '2026-10-17 11:48:49.769169-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('92658216-c7e5-4797-a35a-18ff5c89c839', 'admin', 'CIERRE_SESION', 'admin', 'Cierre de sesión motivo: manual', '2026-10-17 11:48:49.774776-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('2d126ba8-b378-4349-8eae-76e973053b3a', 'admin', 'CIERRE_SESION', 'admin', 'Cierre de sesión motivo: manual', '2026-10-17 11:54:46.580732-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('15314d70-9d05-4b1d-88dc-e7fde993253b', 'atorres', 'CIERRE_SESION', 'atorres', 'Cierre de sesión motivo: manual', '2026-10-17 11:55:01.958667-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('62f0c9fb-c5b7-404f-9265-20bd5918f856', 'admin', 'CIERRE_SESION', 'admin', 'Cierre por 5 intentos fallidos consecutivos al cambiar contraseña', '2026-10-17 11:55:29.285075-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('b475c4e4-9a4d-428e-b671-b70683ffd9dc', 'admin', 'CAMBIO_PASSWORD_PROPIA', 'admin', 'Cambio de contraseña exitoso desde perfil (barra superior)', '2026-10-17 11:55:29.404377-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('4cae8d36-ee15-4422-9ee3-2f3c7a503798', 'admin', 'CAMBIO_PASSWORD_PROPIA', 'admin', 'Cambio de contraseña exitoso desde perfil (barra superior)', '2026-10-17 11:55:29.539851-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('ac0a5465-5229-4da4-a373-116580ee9bb6', 'admin', 'CIERRE_SESION', 'admin', 'Cierre de sesión motivo: manual', '2026-10-17 11:55:29.550326-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('ab2b6d5c-dc40-49b4-ab30-8a3681e2c413', 'admin', 'CIERRE_SESION', 'admin', 'Cierre de sesión motivo: manual', '2026-10-17 11:56:40.770077-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('598a7707-7ca2-409a-9638-b1e6a369a64e', 'admin', 'CIERRE_SESION', 'admin', 'Cierre de sesión motivo: manual', '2026-10-17 12:01:12.068563-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('2883b41d-b30d-4ebb-92ad-5f84ad751b90', 'admin', 'CIERRE_SESION', 'admin', 'Cierre por 5 intentos fallidos consecutivos al cambiar contraseña', '2026-10-17 12:05:32.134417-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('468545e4-5e44-4ef6-98fb-25bc2cc00c53', 'admin', 'CAMBIO_PASSWORD_PROPIA', 'admin', 'Cambio de contraseña exitoso desde perfil (barra superior)', '2026-10-17 12:05:32.264003-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('a546658f-6391-42b0-8070-7a246d7c7900', 'admin', 'CAMBIO_PASSWORD_PROPIA', 'admin', 'Cambio de contraseña exitoso desde perfil (barra superior)', '2026-10-17 12:05:32.378304-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('7d0ddc79-afa7-45f8-8701-fa2dde1390fd', 'admin', 'CIERRE_SESION', 'admin', 'Cierre de sesión motivo: manual', '2026-10-17 12:05:32.388906-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('5f0fea88-4883-474d-aa08-3ce629b4421a', 'admin', 'CIERRE_SESION', 'admin', 'Cierre por 5 intentos fallidos consecutivos al cambiar contraseña', '2026-10-17 12:29:03.462641-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('f3775592-e1ef-4e9f-871f-b19116b16898', 'admin', 'CAMBIO_PASSWORD_PROPIA', 'admin', 'Cambio de contraseña exitoso desde perfil (barra superior)', '2026-10-17 12:29:03.583093-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('f768d2c4-9bf2-4158-81cd-d3f790d4d529', 'admin', 'CAMBIO_PASSWORD_PROPIA', 'admin', 'Cambio de contraseña exitoso desde perfil (barra superior)', '2026-10-17 12:29:03.716947-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('f7f2950a-b756-43c0-9ca9-e206daf3670d', 'admin', 'CIERRE_SESION', 'admin', 'Cierre de sesión motivo: manual', '2026-10-17 12:29:03.724709-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('3c8879a2-a66b-4d5c-bd4c-0f4714480f2e', 'admin', 'CIERRE_SESION', 'admin', 'Cierre por 5 intentos fallidos consecutivos al cambiar contraseña', '2026-10-17 12:34:05.059451-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('458a6d2f-85f4-4bea-be9e-6325969ac5b5', 'admin', 'CAMBIO_PASSWORD_PROPIA', 'admin', 'Cambio de contraseña exitoso desde perfil (barra superior)', '2026-10-17 12:34:05.171194-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('26552f5d-2aba-46ec-a3ce-8f9dcc0b7cff', 'admin', 'CAMBIO_PASSWORD_PROPIA', 'admin', 'Cambio de contraseña exitoso desde perfil (barra superior)', '2026-10-17 12:34:05.276135-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('b5b92cdf-539a-4cd4-b1c8-7ee6759a4c4f', 'admin', 'CIERRE_SESION', 'admin', 'Cierre de sesión motivo: manual', '2026-10-17 12:34:05.286287-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('9a9d9fc7-5ea1-4d27-afb5-778339f4f76c', 'atorres', 'CIERRE_SESION', 'atorres', 'Cierre de sesión motivo: manual', '2026-10-17 21:09:17.061388-05', '::1');
INSERT INTO public.auditorias_usuario VALUES ('0d2b241e-0b9c-4b76-8fe1-6c136f39a845', 'lperez', 'CIERRE_SESION', 'lperez', 'Cierre de sesión motivo: manual', '2026-10-17 21:09:28.496951-05', '::1');


--
-- Data for Name: codigos_recuperacion; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: comandas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.comandas VALUES ('315a1286-3bee-4681-98a6-7cdba2d8a001', '03876d35-b378-4772-98cb-50238d1188e0', 1, '2026-10-17 20:12:10.349546-05', 'Pendiente', false, 'Mesa 1', '2026-10-17 20:12:10.349688-05', false, false, NULL, NULL);
INSERT INTO public.comandas VALUES ('a80962ee-a6fd-4f90-98bf-094544763051', 'd58ffebd-c2b7-445d-a3e3-dfd5742c33fc', 1, '2026-10-17 20:17:13.935934-05', 'Pendiente', false, 'Mesa 2', '2026-10-17 20:17:13.936083-05', false, false, NULL, NULL);
INSERT INTO public.comandas VALUES ('31baa64b-40c7-47c9-b3ba-dbf16b10e2f6', '3a24ca76-f431-4600-9c84-f10fc239a053', 1, '2026-10-17 20:19:02.343073-05', 'Pendiente', false, 'Mesa 4', '2026-10-17 20:19:02.343208-05', false, false, NULL, NULL);
INSERT INTO public.comandas VALUES ('0ced0c10-64ea-4065-9103-c39af5f68bda', '3a24ca76-f431-4600-9c84-f10fc239a053', 1, '2026-10-17 20:19:02.728114-05', 'Pendiente', true, 'Mesa 4', '2026-10-17 20:19:02.728115-05', false, false, NULL, NULL);
INSERT INTO public.comandas VALUES ('a3fe21ae-7949-4a7b-bdef-42e50d7afa56', '75ce0236-ebdc-4810-9204-df2bb000f4f7', 1, '2026-10-17 21:02:43.632278-05', 'Pendiente', false, 'Para llevar - Sra. Rosa', '2026-10-17 21:02:43.632449-05', false, false, NULL, NULL);
INSERT INTO public.comandas VALUES ('5c383c73-bba0-46b8-b422-fb365faad080', '9ff6d8bb-1c9b-49ee-bb96-b6c0e00c9f37', 1, '2026-10-17 21:05:01.770938-05', 'Pendiente', false, 'Para llevar - Test Idempotencia', '2026-10-17 21:05:01.770938-05', false, false, NULL, NULL);


--
-- Data for Name: detalles_comanda; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.detalles_comanda VALUES ('70c6ebd5-fcb7-4ff1-b791-4d14301e7557', '315a1286-3bee-4681-98a6-7cdba2d8a001', 'c475030b-7c73-4853-9e94-1bd161492287', 'Café pasado con sándwich mixto', 2, 'Sin picante', '2026-10-17 20:12:10.350506-05');
INSERT INTO public.detalles_comanda VALUES ('de0efde0-afc4-4829-93e1-cded72eba0fe', '315a1286-3bee-4681-98a6-7cdba2d8a001', 'd7456e1d-1043-46b9-87aa-30c16b598f2e', 'Menú almuerzo', 1, 'Bien caliente', '2026-10-17 20:12:10.350546-05');
INSERT INTO public.detalles_comanda VALUES ('a950a156-3160-4011-8bd2-147dcef40f07', 'a80962ee-a6fd-4f90-98bf-094544763051', 'd7456e1d-1043-46b9-87aa-30c16b598f2e', 'Menú almuerzo', 1, 'Bien caliente', '2026-10-17 20:17:13.93715-05');
INSERT INTO public.detalles_comanda VALUES ('f0fa25cf-f8e4-48a1-8c28-53d330170513', 'a80962ee-a6fd-4f90-98bf-094544763051', 'c475030b-7c73-4853-9e94-1bd161492287', 'Café pasado con sándwich mixto', 2, 'Sin picante', '2026-10-17 20:17:13.937108-05');
INSERT INTO public.detalles_comanda VALUES ('a5fa07e6-4667-42ab-9d61-bb066508aed0', '31baa64b-40c7-47c9-b3ba-dbf16b10e2f6', 'c475030b-7c73-4853-9e94-1bd161492287', 'Café pasado con sándwich mixto', 2, 'Sin picante', '2026-10-17 20:19:02.3441-05');
INSERT INTO public.detalles_comanda VALUES ('faa5594f-9087-464d-b65a-9b0f367ee9b4', '31baa64b-40c7-47c9-b3ba-dbf16b10e2f6', 'd7456e1d-1043-46b9-87aa-30c16b598f2e', 'Menú almuerzo', 1, 'Bien caliente', '2026-10-17 20:19:02.344139-05');
INSERT INTO public.detalles_comanda VALUES ('998e2db2-7b41-40f9-b852-760a0b0f14e5', '0ced0c10-64ea-4065-9103-c39af5f68bda', 'c475030b-7c73-4853-9e94-1bd161492287', 'Café pasado con sándwich mixto', 1, 'Para llevar adicional', '2026-10-17 20:19:02.728145-05');
INSERT INTO public.detalles_comanda VALUES ('3d64b0a0-cdc7-434e-beee-ebfe0118fa24', 'a3fe21ae-7949-4a7b-bdef-42e50d7afa56', 'c475030b-7c73-4853-9e94-1bd161492287', 'Café pasado con sándwich mixto', 2, 'sin ensalada', '2026-10-17 21:02:43.633674-05');
INSERT INTO public.detalles_comanda VALUES ('1d5745f2-11d2-4eb2-a747-b85a105dc500', '5c383c73-bba0-46b8-b422-fb365faad080', 'c475030b-7c73-4853-9e94-1bd161492287', 'Café pasado con sándwich mixto', 1, 'sin cebolla', '2026-10-17 21:05:01.770941-05');


--
-- Data for Name: detalles_pedido; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.detalles_pedido VALUES ('873ec609-3c26-47ff-9182-50aca2a649c5', '03876d35-b378-4772-98cb-50238d1188e0', 'd7456e1d-1043-46b9-87aa-30c16b598f2e', 1, 8.00, 8.00, 'Bien caliente', '2026-10-17 20:12:10.349203-05');
INSERT INTO public.detalles_pedido VALUES ('feccabb8-7641-47b5-9f26-3acac31e18c8', '03876d35-b378-4772-98cb-50238d1188e0', 'c475030b-7c73-4853-9e94-1bd161492287', 2, 5.00, 10.00, 'Sin picante', '2026-10-17 20:12:10.34726-05');
INSERT INTO public.detalles_pedido VALUES ('25216f2f-382d-4feb-90b0-1435b0160895', 'd58ffebd-c2b7-445d-a3e3-dfd5742c33fc', 'd7456e1d-1043-46b9-87aa-30c16b598f2e', 1, 8.00, 8.00, 'Bien caliente', '2026-10-17 20:17:13.935653-05');
INSERT INTO public.detalles_pedido VALUES ('f6f2de8c-8d2b-4ce7-bb29-e188cf0d2c76', 'd58ffebd-c2b7-445d-a3e3-dfd5742c33fc', 'c475030b-7c73-4853-9e94-1bd161492287', 2, 5.00, 10.00, 'Sin picante', '2026-10-17 20:17:13.933886-05');
INSERT INTO public.detalles_pedido VALUES ('23e5699d-1502-400e-a25c-27bf7ef0b401', '3a24ca76-f431-4600-9c84-f10fc239a053', 'd7456e1d-1043-46b9-87aa-30c16b598f2e', 1, 8.00, 8.00, 'Bien caliente', '2026-10-17 20:19:02.342782-05');
INSERT INTO public.detalles_pedido VALUES ('cd7b8ce0-3192-46c3-820c-972814519550', '3a24ca76-f431-4600-9c84-f10fc239a053', 'c475030b-7c73-4853-9e94-1bd161492287', 2, 5.00, 10.00, 'Sin picante', '2026-10-17 20:19:02.34103-05');
INSERT INTO public.detalles_pedido VALUES ('25814731-7388-495e-83f6-0a5b71289ed8', '3a24ca76-f431-4600-9c84-f10fc239a053', 'c475030b-7c73-4853-9e94-1bd161492287', 1, 5.00, 5.00, 'Para llevar adicional', '2026-10-17 20:19:02.728131-05');
INSERT INTO public.detalles_pedido VALUES ('f97dd0f9-5acb-45dd-9ffa-f673013b86ae', '75ce0236-ebdc-4810-9204-df2bb000f4f7', 'c475030b-7c73-4853-9e94-1bd161492287', 2, 5.00, 10.00, 'sin ensalada', '2026-10-17 21:02:43.630294-05');
INSERT INTO public.detalles_pedido VALUES ('58fd4518-a29f-4911-a851-e99e449b7073', '9ff6d8bb-1c9b-49ee-bb96-b6c0e00c9f37', 'c475030b-7c73-4853-9e94-1bd161492287', 1, 5.00, 5.00, 'sin cebolla', '2026-10-17 21:05:01.770919-05');


--
-- Data for Name: menu_dia_platos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.menu_dia_platos VALUES ('2ef3900d-f8f8-493c-92d7-4eca6a782667', '12eda018-7e58-474b-b43d-7ff6fbfa7c04', 'd7456e1d-1043-46b9-87aa-30c16b598f2e', false, NULL, NULL);
INSERT INTO public.menu_dia_platos VALUES ('8c8a025a-945f-42ac-a3d5-d1914df0d2c7', '12eda018-7e58-474b-b43d-7ff6fbfa7c04', '8c621cd4-f5cb-49a5-bb62-a02b7e647a8a', false, '2026-10-17 14:13:22.52412-05', 'admin');
INSERT INTO public.menu_dia_platos VALUES ('eba1a7af-7334-4bb5-8077-07b50ba7e5b0', '12eda018-7e58-474b-b43d-7ff6fbfa7c04', '37935ec3-c4af-471f-a38f-7905028874ee', false, '2026-10-17 14:29:42.822954-05', 'admin');


--
-- Data for Name: menus_dia; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.menus_dia VALUES ('12eda018-7e58-474b-b43d-7ff6fbfa7c04', '2026-10-17', 'c475030b-7c73-4853-9e94-1bd161492287', 'admin', 'admin', '2026-10-17 14:01:32.589742-05', '2026-10-17 14:29:42.822955-05');


--
-- Data for Name: mesas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.mesas VALUES ('3666dec9-1a05-48de-9643-23fecf7fd167', 'Mesa 10', 'MESA 10', 'Libre', true, '2026-10-17 17:57:04.459078-05', NULL);
INSERT INTO public.mesas VALUES ('598985b2-fc3e-4f3b-ba38-c5ba264a4666', 'Mesa 9', 'MESA 9', 'Libre', true, '2026-10-17 17:57:04.459072-05', NULL);
INSERT INTO public.mesas VALUES ('6734a319-ddf2-476d-beda-ec2ac27cedd0', 'Mesa 7', 'MESA 7', 'Ocupada', true, '2026-10-17 17:57:04.459063-05', '2026-10-17 17:57:04.459063-05');
INSERT INTO public.mesas VALUES ('6a617660-9592-44d4-8d15-9c225cb4f133', 'Patio 2', 'PATIO 2', 'Libre', false, '2026-10-17 17:57:04.459088-05', '2026-10-17 17:57:04.459541-05');
INSERT INTO public.mesas VALUES ('c1fea4f5-11e0-40b3-a449-f52164e8dd2e', 'Mesa 8', 'MESA 8', 'Libre', true, '2026-10-17 17:57:04.459068-05', NULL);
INSERT INTO public.mesas VALUES ('c7ab6d48-fdbb-4390-b83c-22db58739237', 'Mesa 3', 'MESA 3', 'Ocupada', true, '2026-10-17 17:57:04.458692-05', '2026-10-17 17:57:04.458897-05');
INSERT INTO public.mesas VALUES ('cece6ca8-921e-4ea4-90c1-6055011bddc1', 'Mesa 5', 'MESA 5', 'Libre', true, '2026-10-17 17:57:04.459054-05', NULL);
INSERT INTO public.mesas VALUES ('dc56cf12-fb4d-4da6-bf2d-f6818fd94b23', 'Patio 1', 'PATIO 1', 'Libre', true, '2026-10-17 17:57:04.459083-05', NULL);
INSERT INTO public.mesas VALUES ('fdf88ec4-9aec-4efd-ba77-2c2284d05c45', 'Mesa 6', 'MESA 6', 'Libre', true, '2026-10-17 17:57:04.459058-05', NULL);
INSERT INTO public.mesas VALUES ('d0ceb30b-0322-474f-9da5-e5d72de0f66a', 'Mesa 1', 'MESA 1', 'Ocupada', true, '2026-10-17 17:57:04.458417-05', '2026-10-17 20:12:10.350724-05');
INSERT INTO public.mesas VALUES ('a970b954-bdd5-44b7-bd73-8ec860f54541', 'Mesa 2', 'MESA 2', 'Ocupada', true, '2026-10-17 17:57:04.458686-05', '2026-10-17 20:17:13.937331-05');
INSERT INTO public.mesas VALUES ('67ae29b1-17c8-4988-b129-de60b17c3849', 'Mesa 4', 'MESA 4', 'Ocupada', true, '2026-10-17 17:57:04.459048-05', '2026-10-17 20:19:02.344374-05');


--
-- Data for Name: pedidos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.pedidos VALUES ('03876d35-b378-4772-98cb-50238d1188e0', 1, '2026-10-17', '2026-10-17 20:12:10.345954-05', 'Mesa', 'Pendiente', 18.00, 'Mesa cerca a la ventana', 'd0ceb30b-0322-474f-9da5-e5d72de0f66a', 'fdfbc247-2349-4bab-9d92-cc595b7a34d8', 'b0992399-6d3c-45f6-a589-6b9909cfc4a8', '2026-10-17 20:12:10.346251-05', '2026-10-17 20:12:10.350627-05', NULL);
INSERT INTO public.pedidos VALUES ('d58ffebd-c2b7-445d-a3e3-dfd5742c33fc', 2, '2026-10-17', '2026-10-17 20:17:13.932125-05', 'Mesa', 'Pendiente', 18.00, 'Mesa cerca a la ventana', 'a970b954-bdd5-44b7-bd73-8ec860f54541', 'fdfbc247-2349-4bab-9d92-cc595b7a34d8', '509db897-fb42-46a4-8786-a71b292217db', '2026-10-17 20:17:13.932473-05', '2026-10-17 20:17:13.937237-05', NULL);
INSERT INTO public.pedidos VALUES ('3a24ca76-f431-4600-9c84-f10fc239a053', 3, '2026-10-17', '2026-10-17 20:19:02.339038-05', 'Mesa', 'Pendiente', 23.00, 'Mesa cerca a la ventana', '67ae29b1-17c8-4988-b129-de60b17c3849', 'fdfbc247-2349-4bab-9d92-cc595b7a34d8', 'f1c11a58-23d2-4202-a4ca-64d503c7c135', '2026-10-17 20:19:02.339519-05', '2026-10-17 20:19:02.728146-05', NULL);
INSERT INTO public.pedidos VALUES ('75ce0236-ebdc-4810-9204-df2bb000f4f7', 4, '2026-10-17', '2026-10-17 21:02:43.628892-05', 'ParaLlevar', 'Pendiente', 10.00, 'Sra. Rosa', NULL, '920ba4f1-d552-4c76-b1c0-087b3b75770c', '102ffbd5-99a2-4d27-9e96-a980770d1fc6', '2026-10-17 21:02:43.629212-05', '2026-10-17 21:02:43.633805-05', NULL);
INSERT INTO public.pedidos VALUES ('9ff6d8bb-1c9b-49ee-bb96-b6c0e00c9f37', 5, '2026-10-17', '2026-10-17 21:05:01.770911-05', 'ParaLlevar', 'Pendiente', 5.00, 'Test Idempotencia', NULL, '920ba4f1-d552-4c76-b1c0-087b3b75770c', '57848b97-dd22-4935-9510-626d3556d52c', '2026-10-17 21:05:01.770912-05', '2026-10-17 21:05:01.770942-05', NULL);


--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.productos VALUES ('18858d56-9234-4862-a00b-b6663476e306', 'Gaseosa 500ml', 'gaseosa 500ml', 3, 3.50, true, '2026-10-17 13:04:47.131837-05', NULL);
INSERT INTO public.productos VALUES ('37935ec3-c4af-471f-a38f-7905028874ee', 'Sopa a la minuta especial', 'sopa a la minuta especial', 2, 10.00, true, '2026-10-17 13:04:47.131836-05', NULL);
INSERT INTO public.productos VALUES ('8c621cd4-f5cb-49a5-bb62-a02b7e647a8a', 'Ejecutivo del día', 'ejecutivo del dia', 2, 12.00, true, '2026-10-17 13:04:47.131829-05', NULL);
INSERT INTO public.productos VALUES ('ab587619-835c-4472-9a16-fc52afdfa2d1', 'Quaker con leche y pan', 'quaker con leche y pan', 1, 3.50, true, '2026-10-17 13:04:47.13183-05', NULL);
INSERT INTO public.productos VALUES ('b39aaede-072c-414a-951b-49047194e280', 'Quinua carretillera con pan', 'quinua carretillera con pan', 1, 3.00, true, '2026-10-17 13:04:47.13183-05', NULL);
INSERT INTO public.productos VALUES ('c475030b-7c73-4853-9e94-1bd161492287', 'Café pasado con sándwich mixto', 'cafe pasado con sandwich mixto', 1, 5.00, true, '2026-10-17 13:04:47.131832-05', NULL);
INSERT INTO public.productos VALUES ('d1da6dd9-3333-4feb-90a2-42ef0806f14d', 'Caldo de gallina criollo', 'caldo de gallina criollo', 1, 10.00, false, '2026-10-17 13:04:47.131838-05', NULL);
INSERT INTO public.productos VALUES ('d7456e1d-1043-46b9-87aa-30c16b598f2e', 'Menú almuerzo', 'menu almuerzo', 2, 8.00, true, '2026-10-17 13:04:47.13175-05', NULL);
INSERT INTO public.productos VALUES ('e7db20df-a11f-4ee4-9286-cc21f772389c', 'Agua mineral 600ml', 'agua mineral 600ml', 3, 2.50, true, '2026-10-17 13:04:47.131837-05', NULL);
INSERT INTO public.productos VALUES ('f1c6d752-3760-4e57-85b0-141472f6232f', 'Porción extra de papas fritas', 'porcion extra de papas fritas', 3, 4.00, true, '2026-10-17 13:04:47.131836-05', NULL);
INSERT INTO public.productos VALUES ('fc21cda6-b12b-4f09-a807-df1218c7bb78', 'Jarra de chicha morada 1L', 'jarra de chicha morada 1l', 3, 6.00, true, '2026-10-17 13:04:47.131834-05', NULL);


--
-- Data for Name: registros_ingreso; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.registros_ingreso VALUES ('d1064e3b-3b91-4aa0-ba6d-00e66806f219', 'admin', '2026-10-16 11:16:19.233491-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('e5cb3f02-f640-4da5-8318-4e8e3e233d70', 'ass', '2026-10-16 12:27:17.191882-05', false, 'Usuario inexistente', '::1');
INSERT INTO public.registros_ingreso VALUES ('3eb5bd1d-5c27-4de8-9e28-3ed4d5ca7b11', 'atorres', '2026-10-16 13:08:10.965472-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('9cccc5b9-c42c-45cd-84bb-735adbe83c94', 'atorres', '2026-10-16 13:58:19.678797-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('d07e4c9c-0613-44c6-8c6c-c77353d8d92e', 'sfs', '2026-10-16 14:31:19.659955-05', false, 'Usuario inexistente', '::1');
INSERT INTO public.registros_ingreso VALUES ('34da16f8-fe5f-4f0c-bd4d-c67498fe0cca', 'admin', '2026-10-16 17:45:59.022179-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('88d25f86-64e2-4499-8a00-b2abcd408b2c', 'admin', '2026-10-16 17:46:13.905562-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('1e9558cf-8173-4e53-9b25-a392b6cca1b9', 'admin', '2026-10-16 17:46:27.453129-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('8335f6cd-a772-403c-8862-d8c458e897e7', 'lperez', '2026-10-16 17:46:27.523627-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('b578cdd6-3178-4e9c-a4cb-b6c14243a682', 'admin', '2026-10-16 17:46:58.408278-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('8e2d3725-188d-4e00-94c7-ce9603f40004', 'lperez', '2026-10-16 17:46:58.467788-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('fa6e7e3d-8c03-4495-aaf9-25fba7632794', 'admin', '2026-10-16 17:47:15.793266-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('f1354035-80a7-4d81-8866-80bda7251ee5', 'lperez', '2026-10-16 17:47:15.954536-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('00c76aa7-7471-402c-8312-e6b141bdd334', 'admin', '2026-10-16 18:30:44.251697-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('680983e6-6a71-4bf8-b588-ccae8239dd79', 'admin', '2026-10-16 18:31:02.666477-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('c0c34a30-21e4-4094-b0b5-7b9e7c66757e', 'atorres', '2026-10-16 18:31:02.797901-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('5d07d09c-7403-4f49-b40c-a51181eafd4d', 'admin', '2026-10-16 18:31:02.885368-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('6ae77da0-6d8c-4cae-982a-4184e4645385', 'admin', '2026-10-16 18:31:03.098935-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('94c975d7-2c84-4006-aded-8bbcf3aeed5e', 'admin', '2026-10-16 18:31:03.200725-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('e58b431c-a10b-4e49-83ad-bed7f7072423', 'admin', '2026-10-16 18:31:11.136251-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('30d10d8c-8ab4-48ab-b263-337ab9531a7e', 'atorres', '2026-10-16 18:31:17.212461-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('7d1d9a64-0400-4959-90d5-c4e595d101ca', 'admin', '2026-10-16 18:31:22.450682-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('880c10b2-a26c-430a-a0d8-ef04c3836321', 'admin', '2026-10-16 18:31:28.884349-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('70b4000b-cbed-4627-b50c-f203426f68c2', 'admin', '2026-10-16 18:31:34.211143-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('d3e3c2f4-e795-4a1c-9e24-71b3a147e833', 'admin', '2026-10-16 18:31:59.627542-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('69a81e6a-5152-4d94-acac-69aea677cea3', 'atorres', '2026-10-16 18:31:59.660461-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('0dcf038b-5a11-4a88-8d5e-bac00ebb4786', 'admin', '2026-10-16 18:31:59.701015-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('9a48b6a7-1f82-4bd6-8698-a06923eb40f5', 'admin', '2026-10-16 18:31:59.870835-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('ad99439e-09ff-48a2-bc54-2271b0e3d94d', 'admin', '2026-10-16 18:31:59.981369-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('88415e03-e0cd-40b4-ace8-d5d4d13fbc4a', 'admin', '2026-10-16 18:32:06.454686-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('85fe1afe-2a54-47f2-9d43-2428369a6560', 'admin', '2026-10-16 18:32:16.047934-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('af28b7f6-8db4-4084-95b7-4a5328cecccb', 'atorres', '2026-10-16 18:32:16.08418-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('0bba76f1-d2f7-4f3d-91f6-807a296538f3', 'admin', '2026-10-16 18:32:16.128574-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('5c344c84-8b17-40d2-9d5d-f0ceb16796a1', 'admin', '2026-10-16 18:32:16.30328-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('7f5ae8a0-52a7-468c-b461-b4f79a759ad8', 'admin', '2026-10-16 18:32:16.406346-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('b33865c9-2f45-4708-b7c5-097734b51799', 'admin', '2026-10-17 10:20:56.950064-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('a918bffa-22cb-4201-859c-f83a973758fc', 'admin', '2026-10-17 10:31:47.389967-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('b5aaaec5-86c5-4869-a0f7-201ba8482a67', 'atorres', '2026-10-17 10:31:47.776137-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('65bb14bd-b421-4bf6-bf4f-3beb834ca640', 'admin', '2026-10-17 10:31:47.894337-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('cd40fde0-3015-47d4-87b9-789b214f41f3', 'admin', '2026-10-17 10:31:48.196497-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('c054366f-d2a3-4dfc-964c-b615a52a3cc9', 'admin', '2026-10-17 10:31:48.331352-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('cb03a4b6-beb1-449d-9ef2-18837b30b7e0', 'admin', '2026-10-17 10:57:38.806997-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('cf5844b1-4076-48f5-8d83-96243a57cab2', 'crojas', '2026-10-17 11:06:28.13479-05', false, 'Cuenta desactivada', '::1');
INSERT INTO public.registros_ingreso VALUES ('20ddc59a-f603-44f5-b750-362809074bfb', 'crojas', '2026-10-17 11:06:33.218339-05', false, 'Cuenta desactivada', '::1');
INSERT INTO public.registros_ingreso VALUES ('7f41fad7-7004-4807-8395-c06d5c9db05a', 'atorres', '2026-10-17 11:07:25.723279-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('f7f9381e-afd5-498e-b7c0-224592a788a6', 'admin', '2026-10-17 11:07:55.973297-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('f0a802c8-26ab-495b-9597-8db01cf69282', 'admin', '2026-10-17 11:10:16.099305-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('c42cfdca-9700-4154-ad47-0f56f1f21b5a', 'atorres', '2026-10-17 11:10:16.140024-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('f318af00-67db-40ee-951f-f6fb3e1f417c', 'admin', '2026-10-17 11:10:16.188023-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('ed844a7b-763c-4b59-868d-aa33564493f6', 'admin', '2026-10-17 11:10:16.389663-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('1959d817-a919-4d4a-b2b4-e50af3670cd0', 'admin', '2026-10-17 11:10:16.51175-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('3703b64d-6142-43f4-9e73-11773581111d', 'admin', '2026-10-17 11:16:18.29506-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('7474adfc-3dcd-41d3-8b52-6af2be739fa4', 'atorres', '2026-10-17 11:16:18.339538-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('79e32c05-834a-46b3-8103-4312dfccfa82', 'admin', '2026-10-17 11:16:18.388518-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('6648d043-0404-4b1c-b9d8-e46a24940d30', 'admin', '2026-10-17 11:16:18.615962-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('656cd8f4-e6cf-4f7c-a2fc-6f1dda899a7d', 'admin', '2026-10-17 11:16:18.742173-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('4d5d5f8d-471b-44d8-b316-44393c0d917f', 'admin', '2026-10-17 11:22:56.43472-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('3ddb4b13-c3cd-48bf-a237-3d05847b7272', 'atorres', '2026-10-17 11:22:56.474422-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('40de67a7-6d72-4af9-9b3a-b2a43909a4f8', 'admin', '2026-10-17 11:22:56.519713-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('99b8202f-e21d-49f4-b584-a93b0e611392', 'admin', '2026-10-17 11:22:56.726335-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('f6927886-0279-4125-a2d3-0b15c7f1d75a', 'admin', '2026-10-17 11:22:56.858034-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('1f058cf0-1195-4262-8491-581e41146e7e', 'admin', '2026-10-17 11:37:44.15265-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('87739b83-aecb-43a3-b800-701a71369733', 'atorres', '2026-10-17 11:37:44.185342-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('9a54c7d3-aeb9-4e32-ba4b-d069f12dbfd1', 'admin', '2026-10-17 11:37:44.223181-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('b294324b-410d-470f-b5a3-939b56b67ee0', 'admin', '2026-10-17 11:37:44.373457-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('8992e98b-51b7-4811-97fc-3fcf81848c35', 'admin', '2026-10-17 11:37:44.480674-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('7ab2bd1f-2347-471e-8714-cba50b652a95', 'admin', '2026-10-17 11:48:49.323739-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('0b5e47aa-c2a3-48c3-bada-77ce92f200d5', 'atorres', '2026-10-17 11:48:49.362054-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('ce3cc2b5-fc69-47e1-8760-0ce16ecf5a57', 'admin', '2026-10-17 11:48:49.40273-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('d914e59e-f113-4fb3-9e4d-07e9bda525a9', 'admin', '2026-10-17 11:48:49.574608-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('17409432-fe5f-47e2-bd98-3210723bb5c0', 'admin', '2026-10-17 11:48:49.687635-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('b21f0c17-1c77-4ab0-a42e-adc6e1b4547b', 'admind', '2026-10-17 11:51:34.221698-05', false, 'Usuario inexistente', '::1');
INSERT INTO public.registros_ingreso VALUES ('3a4f7f03-ba47-44a4-9dff-78f3aa6b5fc0', 'admin', '2026-10-17 11:52:07.37081-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('914d0c91-ecac-4c0c-b200-b388d30f894f', 'atorres', '2026-10-17 11:54:50.633676-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('e2d5dc28-61fd-4aab-8133-bbc696b88538', 'admin', '2026-10-17 11:55:07.510239-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('6c569c81-0722-4f96-a944-fac84387ea3f', 'admin', '2026-10-17 11:55:29.006897-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('627338fd-0ecb-4bc7-a29c-066aa4d91827', 'atorres', '2026-10-17 11:55:29.043842-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('d3bc7233-1934-4644-9102-240691ac53d0', 'admin', '2026-10-17 11:55:29.09129-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('744027d7-1332-4f3e-814a-2f64fb20003c', 'admin', '2026-10-17 11:55:29.32303-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('74ab7c9a-a59f-4df1-b27b-ab8bf5b29005', 'admin', '2026-10-17 11:55:29.44846-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('43a9ee04-d7c2-4bf4-b3ef-41107e20d367', 'admin', '2026-10-17 12:00:31.670031-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('f103f73d-096e-4065-b15a-c65b63bd4070', 'admin', '2026-10-17 12:05:31.84907-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('7bf59e56-fb17-4300-a278-8d27d98425ed', 'atorres', '2026-10-17 12:05:31.878249-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('ea3e75c3-9a38-4190-85d1-4a844f5c5194', 'admin', '2026-10-17 12:05:31.97193-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('6908a643-3093-4327-8450-f101578cccaf', 'admin', '2026-10-17 12:05:32.175976-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('3413df76-cbce-4509-9df9-86abc7a59689', 'admin', '2026-10-17 12:05:32.295743-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('b363243b-53a9-47d4-b476-b5906cf0ad6c', 'admin', '2026-10-17 12:13:37.700668-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('4823e025-5e8c-45ac-bba0-ca356d7c64d0', 'admin', '2026-10-17 12:29:03.201462-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('864c519d-253f-4a45-bf92-21944e7beb6d', 'atorres', '2026-10-17 12:29:03.240933-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('b1377c8c-2025-46d9-aa8f-4be02b378a8a', 'admin', '2026-10-17 12:29:03.289322-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('87fdf121-5587-4f5c-817d-9556ab70e691', 'admin', '2026-10-17 12:29:03.50272-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('204185dc-1d84-4020-a012-5e92a4efd81c', 'admin', '2026-10-17 12:29:03.626699-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('3843cfd0-84e8-4c9e-9847-23fa00857ac4', 'admin', '2026-10-17 12:34:04.837607-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('4448f1a9-b12c-4328-b0f3-72c8f0503890', 'atorres', '2026-10-17 12:34:04.877619-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('7795c6c7-dc65-41b3-bf6a-ed9a8f87ee39', 'admin', '2026-10-17 12:34:04.917895-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('9ec4f3b4-ff22-48c5-a93f-bc3dba2e09fb', 'admin', '2026-10-17 12:34:05.095316-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('73504b90-61e9-4283-abb5-e1174a798aa1', 'admin', '2026-10-17 12:34:05.203781-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('718d4143-4007-4799-925a-b55205f9acc1', 'admin', '2026-10-17 12:49:17.065055-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('0db1ca96-e52b-42aa-83a8-ef1b4b22e81f', 'admin', '2026-10-17 13:05:11.172415-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('836ab92b-5796-4971-8c3d-6409d4155e82', 'admin', '2026-10-17 13:16:33.647304-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('a8aef4dc-4228-49be-8a30-8f3a36fc81df', 'admin', '2026-10-17 13:16:50.282709-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('67a72c21-b879-4e77-96e1-fe44ce11fa7c', 'admin', '2026-10-17 13:17:12.668203-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('e415d4a6-4b65-433a-8450-fc50735e8034', 'admin', '2026-10-17 13:17:36.469517-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('ea1d5011-9272-4477-adc6-5f690945f756', 'admin', '2026-10-17 13:20:27.418781-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('cbd4957c-31cf-4a5a-aab7-81737cbcb114', 'admin', '2026-10-17 14:01:31.71617-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('45b17792-0f38-4d1c-b234-10f6a681d6bd', 'msoto', '2026-10-17 14:01:32.937694-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('278bed51-bb3d-40df-9fa7-76e80cafc5f7', 'admin', '2026-10-17 14:09:25.106682-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('01536e66-401e-4efe-949f-d1b225868208', 'msoto', '2026-10-17 14:09:25.474718-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('e6cb280a-603f-4a3e-bd37-efe2b9c9bd3c', 'admin', '2026-10-17 14:11:22.397251-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('ccd8ef99-1943-4542-bfa9-341ae02606ee', 'admin', '2026-10-17 18:55:49.525722-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('4ee59c9c-bbf1-4d47-a8da-731d9673c5c4', 'admin', '2026-10-17 19:44:09.065641-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('776a740e-71dc-4a9f-b12a-409145dc2e89', 'admin', '2026-10-17 19:44:25.079435-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('87a4c782-8c1f-4212-8d8d-b9513901c493', 'lperez', '2026-10-17 20:11:32.080366-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('dbc9e158-d80b-47bd-ad9d-0767f349f636', 'lperez', '2026-10-17 20:12:10.035279-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('f52bc8b2-00c8-4094-90d1-927e0007901a', 'lperez', '2026-10-17 20:17:12.99798-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('8d19ec2e-8394-4dfa-b4d2-0ccf211b0a7a', 'lperez', '2026-10-17 20:19:01.507465-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('ce41bb74-2826-433e-a07d-db0fa93c4303', 'lperez', '2026-10-17 20:26:53.487058-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('b3204bb7-1efb-47b2-b764-01d88cb897ad', 'atorres', '2026-10-17 21:02:43.212813-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('b5b6f16d-097a-43c8-a6d5-b9fdd734be87', 'atorres', '2026-10-17 21:05:01.641974-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('bec7cf92-4b42-4eb9-a1aa-57cccdf4a3af', 'atorres', '2026-10-17 21:06:13.133626-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('7bb0f060-bace-4641-99b9-e63a776059a6', 'lperez', '2026-10-17 21:09:21.222787-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('6a1bbff8-280f-4942-8dc4-b93d12695bfe', 'atorres', '2026-10-17 21:12:51.840249-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('1dd43bf8-be68-4075-90ec-218b5f954da1', 'admin', '2026-10-17 21:30:04.592687-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('5e4a5b9a-ce80-45ec-9812-0dc24cd51fb3', 'admin', '2026-10-17 21:48:39.109332-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('53ed5d6c-87c8-4187-bb54-222be1bc8af0', 'admin', '2026-10-17 21:48:52.383135-05', true, 'Ingreso exitoso', '::1');
INSERT INTO public.registros_ingreso VALUES ('8a7cfc42-894f-4d0f-a541-395cc23e37bb', 'lperez', '2026-10-17 21:49:03.453742-05', true, 'Ingreso exitoso', '::1');


--
-- Data for Name: tokens_revocados; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.tokens_revocados VALUES ('7e510d7e-2b89-43c6-8cd0-24c0dd6102fc', 'a17bca05-9da3-47a6-847c-d453b5245328', 'admin', '2026-10-16 19:01:02-05', '2026-10-16 18:31:03.017969-05', 'INTENTOS_FALLIDOS');
INSERT INTO public.tokens_revocados VALUES ('1f921700-46d7-40e9-8248-e30fcc4e5718', '560c7fb3-8bc7-49cb-b60c-eb6d1c19e74d', 'admin', '2026-10-16 19:01:03-05', '2026-10-16 18:31:03.165311-05', 'CAMBIO_CONTRASENA');
INSERT INTO public.tokens_revocados VALUES ('9c4ae942-4528-4583-b3a2-9392aa2951e9', '99732e16-48cf-4ee0-bafc-9d516406f172', 'admin', '2026-10-16 19:01:03-05', '2026-10-16 18:31:03.272107-05', 'CAMBIO_CONTRASENA');
INSERT INTO public.tokens_revocados VALUES ('a36550f4-610b-407b-bbca-f7020f320bec', '97a5b180-7b5a-44e9-ae51-85080b4e827b', 'admin', '2026-10-16 19:01:03-05', '2026-10-16 18:31:03.292326-05', 'MANUAL');
INSERT INTO public.tokens_revocados VALUES ('ad6ac54d-001c-4665-bb85-b300aba7ac3e', '0e24b953-0f07-4f80-ad8c-5a2a56fc0017', 'admin', '2026-10-16 19:01:28-05', '2026-10-16 18:31:28.94976-05', 'CAMBIO_CONTRASENA');
INSERT INTO public.tokens_revocados VALUES ('0f049a18-dfea-4ba1-8edd-66cc7b7cc2f6', 'd8c8b361-fbaa-49da-8df1-004f7548bbe6', 'admin', '2026-10-16 19:01:34-05', '2026-10-16 18:31:34.277839-05', 'CAMBIO_CONTRASENA');
INSERT INTO public.tokens_revocados VALUES ('afdc35f0-388c-4659-9586-e366ef0e316d', 'eb72d107-fafa-460c-b1b1-8c135cbc51db', 'admin', '2026-10-16 19:01:59-05', '2026-10-16 18:31:59.838556-05', 'INTENTOS_FALLIDOS');
INSERT INTO public.tokens_revocados VALUES ('5e652c83-eb1f-4778-a067-344fedc860b3', '43c3aac2-f882-47cf-979a-92767cc7cb6c', 'admin', '2026-10-16 19:01:59-05', '2026-10-16 18:31:59.950127-05', 'CAMBIO_CONTRASENA');
INSERT INTO public.tokens_revocados VALUES ('91888580-27d0-4b68-9c72-808bd9ba3748', 'b393ae23-2df0-44f4-8c3b-1ec685223859', 'admin', '2026-10-16 19:01:59-05', '2026-10-16 18:32:00.058875-05', 'CAMBIO_CONTRASENA');
INSERT INTO public.tokens_revocados VALUES ('fba3e616-08ae-41f8-a7ab-4870642fb28e', '253b8557-355d-4df2-8f95-889c934a0c28', 'admin', '2026-10-16 19:02:00-05', '2026-10-16 18:32:00.065304-05', 'MANUAL');
INSERT INTO public.tokens_revocados VALUES ('afd303a2-9f8b-4087-be76-1a61219a6dcc', 'bcbbef95-9edd-46ea-8063-d3b5be86a439', 'admin', '2026-10-16 19:02:06-05', '2026-10-16 18:32:06.586955-05', 'INTENTOS_FALLIDOS');
INSERT INTO public.tokens_revocados VALUES ('38b07bf4-126b-4889-9745-e10bad2191a1', 'e7ed04a0-bb4c-40a9-aa8c-3f65f142c5bf', 'admin', '2026-10-16 19:02:16-05', '2026-10-16 18:32:16.261528-05', 'INTENTOS_FALLIDOS');
INSERT INTO public.tokens_revocados VALUES ('df2ea466-73b3-4538-8072-e726705bf576', 'd396f96c-3efa-4f69-95e3-87eb4a58b4e1', 'admin', '2026-10-16 19:02:16-05', '2026-10-16 18:32:16.372499-05', 'CAMBIO_CONTRASENA');
INSERT INTO public.tokens_revocados VALUES ('8956df9d-207c-4fe1-aa9e-f20ebc9133e2', '2d93b22e-0efa-45ae-94ab-e31b76bc9a99', 'admin', '2026-10-16 19:02:16-05', '2026-10-16 18:32:16.480656-05', 'CAMBIO_CONTRASENA');
INSERT INTO public.tokens_revocados VALUES ('1d88afc2-883b-4f26-9874-3a0b87b8dc2b', '23c43463-7004-4b9e-b9cf-6931131b242f', 'admin', '2026-10-16 19:02:16-05', '2026-10-16 18:32:16.487328-05', 'MANUAL');
INSERT INTO public.tokens_revocados VALUES ('27ffb0d9-0f7b-4545-b294-af5ee1d573ee', '98b7a452-a71a-4373-b899-6a043b676d4b', 'admin', '2026-10-17 11:01:47-05', '2026-10-17 10:31:48.077683-05', 'INTENTOS_FALLIDOS');
INSERT INTO public.tokens_revocados VALUES ('50315f96-c8bf-4f17-b846-dc13db5678bb', 'a6a34986-84bd-4138-a4aa-9a77657f8c8c', 'admin', '2026-10-17 11:01:48-05', '2026-10-17 10:31:48.283277-05', 'CAMBIO_CONTRASENA');
INSERT INTO public.tokens_revocados VALUES ('6c5f9bf6-7eb4-4db8-af35-f95fd5fd5ee6', 'f7b8c6ea-a703-4ccc-b100-9207f1f9c9f2', 'admin', '2026-10-17 11:01:48-05', '2026-10-17 10:31:48.42108-05', 'CAMBIO_CONTRASENA');
INSERT INTO public.tokens_revocados VALUES ('cb45b392-e78d-45cc-8761-bd2b6cbf7c2b', '5ff0aeb6-a428-41a1-9979-bddd3f2b8772', 'admin', '2026-10-17 11:01:48-05', '2026-10-17 10:31:48.449375-05', 'MANUAL');
INSERT INTO public.tokens_revocados VALUES ('30c0c87e-dbda-4c6e-b6b8-592f2d3fae54', 'af5e3188-ef2b-4a31-9b48-9c433dd32d98', 'admin', '2026-10-17 11:27:38-05', '2026-10-17 11:06:17.6796-05', 'MANUAL');
INSERT INTO public.tokens_revocados VALUES ('2da301cc-2683-4ef9-9bee-017737141685', '82b58ade-cc1b-41a8-b0ea-1ac8d7a078c4', 'atorres', '2026-10-17 11:37:25-05', '2026-10-17 11:07:51.137297-05', 'MANUAL');
INSERT INTO public.tokens_revocados VALUES ('9abbcbbc-2f4c-41af-b792-f3294beb08a2', 'e2138dba-229e-407a-a12f-94f43a0eb1dd', 'admin', '2026-10-17 11:40:16-05', '2026-10-17 11:10:16.347786-05', 'INTENTOS_FALLIDOS');
INSERT INTO public.tokens_revocados VALUES ('66bea00f-e0d1-423c-944d-34e48bf0510c', '804248b1-6e6d-4c7d-9c34-b16421d3dee6', 'admin', '2026-10-17 11:40:16-05', '2026-10-17 11:10:16.474326-05', 'CAMBIO_CONTRASENA');
INSERT INTO public.tokens_revocados VALUES ('9728476f-8749-4832-8fae-0ce6544a3e34', '12732784-f688-4592-a347-ead818b39851', 'admin', '2026-10-17 11:40:16-05', '2026-10-17 11:10:16.592777-05', 'CAMBIO_CONTRASENA');
INSERT INTO public.tokens_revocados VALUES ('777199a9-52ce-41f6-9576-beac432267b3', 'caf8d7c2-0422-4e35-9d52-e63d98800221', 'admin', '2026-10-17 11:40:16-05', '2026-10-17 11:10:16.600387-05', 'MANUAL');
INSERT INTO public.tokens_revocados VALUES ('fa00db7f-b35f-4350-a3ff-3343b0527291', '148d36ec-a103-4a20-8745-3bfcf5b343a6', 'admin', '2026-10-17 11:46:18-05', '2026-10-17 11:16:18.568973-05', 'INTENTOS_FALLIDOS');
INSERT INTO public.tokens_revocados VALUES ('8eac768b-98cf-4bae-9475-0d0d5614baa7', '4405233d-1436-45f5-b41d-61d2531f91f4', 'admin', '2026-10-17 11:46:18-05', '2026-10-17 11:16:18.701704-05', 'CAMBIO_CONTRASENA');
INSERT INTO public.tokens_revocados VALUES ('9cb8a1d9-39c3-4222-87ae-d52c30b859b4', '4434bba1-d153-4704-8cdc-792fb775f229', 'admin', '2026-10-17 11:46:18-05', '2026-10-17 11:16:18.829899-05', 'CAMBIO_CONTRASENA');
INSERT INTO public.tokens_revocados VALUES ('a9a9b20c-7d20-4da0-af2f-5be0de265211', '51004e37-9323-4aca-9e96-f3d8ca50b93d', 'admin', '2026-10-17 11:46:18-05', '2026-10-17 11:16:18.838863-05', 'MANUAL');
INSERT INTO public.tokens_revocados VALUES ('75592b0f-2e16-4a96-98a1-94b74a3c534a', '5c8394b7-c022-4c48-9be6-d18ab3216044', 'admin', '2026-10-17 11:52:56-05', '2026-10-17 11:22:56.683775-05', 'INTENTOS_FALLIDOS');
INSERT INTO public.tokens_revocados VALUES ('8e7be0ab-52d7-474f-8dc0-b843f0b8a713', 'f42d5ae3-34da-445f-8968-9b78be4e5a70', 'admin', '2026-10-17 11:52:56-05', '2026-10-17 11:22:56.814053-05', 'CAMBIO_CONTRASENA');
INSERT INTO public.tokens_revocados VALUES ('f8001b3e-f7e9-402d-8cab-ffb2d1e43dfc', '9edf4421-e355-4509-be33-42e89bde1262', 'admin', '2026-10-17 11:52:56-05', '2026-10-17 11:22:56.950783-05', 'CAMBIO_CONTRASENA');
INSERT INTO public.tokens_revocados VALUES ('e70394b3-a32f-47a0-b9f1-a71fe2127a15', 'c5dc8b24-a8b9-40c1-ad98-c501f0e85bdf', 'admin', '2026-10-17 11:52:56-05', '2026-10-17 11:22:56.958405-05', 'MANUAL');
INSERT INTO public.tokens_revocados VALUES ('6abe3bde-f7d3-4299-b30c-3c81886d511d', 'ca321d2f-3b60-425b-8742-ef43fb31a1cb', 'admin', '2026-10-17 12:07:44-05', '2026-10-17 11:37:44.341364-05', 'INTENTOS_FALLIDOS');
INSERT INTO public.tokens_revocados VALUES ('06e88b70-bfe7-4bb8-9bd7-60d6e6600319', '0fa742be-63b8-41a5-b072-a42903d409d5', 'admin', '2026-10-17 12:07:44-05', '2026-10-17 11:37:44.440398-05', 'CAMBIO_CONTRASENA');
INSERT INTO public.tokens_revocados VALUES ('e5de6043-f024-41ef-9571-11c3405c8dc1', 'b6be8d45-408a-4026-b1ba-f78dd369e20e', 'admin', '2026-10-17 12:07:44-05', '2026-10-17 11:37:44.552341-05', 'CAMBIO_CONTRASENA');
INSERT INTO public.tokens_revocados VALUES ('9d05759a-3fd6-4084-8322-6bb0b6253a72', '12fbc018-e53c-4902-a3ca-f5a815801e5e', 'admin', '2026-10-17 12:07:44-05', '2026-10-17 11:37:44.559188-05', 'MANUAL');
INSERT INTO public.tokens_revocados VALUES ('ab9dcb06-459b-4fd7-8254-42842ff34dd5', 'c085db99-a9bc-40e1-82ab-83bfbd7fd491', 'admin', '2026-10-17 12:18:49-05', '2026-10-17 11:48:49.537065-05', 'INTENTOS_FALLIDOS');
INSERT INTO public.tokens_revocados VALUES ('b2a9a5a7-eb7c-4bc9-8f6c-28583590326e', 'ee15bafb-d84d-4740-b8bd-b9b6b2068050', 'admin', '2026-10-17 12:18:49-05', '2026-10-17 11:48:49.652483-05', 'CAMBIO_CONTRASENA');
INSERT INTO public.tokens_revocados VALUES ('d772567b-393e-4658-8b24-2b1694a9d1f8', '5d18273d-f48a-429c-a5da-6cfa72cb29d2', 'admin', '2026-10-17 12:18:49-05', '2026-10-17 11:48:49.768262-05', 'CAMBIO_CONTRASENA');
INSERT INTO public.tokens_revocados VALUES ('69a1d3fe-7fb7-4f5d-9280-2758c52bec21', '06105437-889c-4c79-a9c6-ffc8ca527594', 'admin', '2026-10-17 12:18:49-05', '2026-10-17 11:48:49.773903-05', 'MANUAL');
INSERT INTO public.tokens_revocados VALUES ('e4c47ad9-2f10-40c5-90d9-620489fde771', '6c0b50fe-a594-470b-955b-7a421f27ca4f', 'admin', '2026-10-17 12:22:07-05', '2026-10-17 11:54:46.578119-05', 'MANUAL');
INSERT INTO public.tokens_revocados VALUES ('8e2cd624-d580-4bfc-8b85-5a58fe4d3227', '9b717001-344e-469f-b49c-232b914a8d93', 'atorres', '2026-10-17 12:24:50-05', '2026-10-17 11:55:01.957425-05', 'MANUAL');
INSERT INTO public.tokens_revocados VALUES ('5e80405b-80b1-49a9-b004-933172407849', '66e0b8e6-3914-424f-8e57-69d36bd892d5', 'admin', '2026-10-17 12:25:29-05', '2026-10-17 11:55:29.283122-05', 'INTENTOS_FALLIDOS');
INSERT INTO public.tokens_revocados VALUES ('8c6e3925-ea92-429a-a824-314d748f52bf', '2dbfeb47-b362-4d3d-a636-2ecffefe4820', 'admin', '2026-10-17 12:25:29-05', '2026-10-17 11:55:29.40349-05', 'CAMBIO_CONTRASENA');
INSERT INTO public.tokens_revocados VALUES ('485d7f06-395e-4035-a777-205186e38e02', 'ca160730-5e69-4fab-82aa-edfd6bcc0c4b', 'admin', '2026-10-17 12:25:29-05', '2026-10-17 11:55:29.538512-05', 'CAMBIO_CONTRASENA');
INSERT INTO public.tokens_revocados VALUES ('a6016c97-d6a4-41b5-babe-6c95d2f33706', '98b5c2aa-2482-45b7-bdd1-918c098bdbd3', 'admin', '2026-10-17 12:25:29-05', '2026-10-17 11:55:29.548215-05', 'MANUAL');
INSERT INTO public.tokens_revocados VALUES ('8a5379fd-750c-432c-8e11-ff05ee52739f', 'e9417ca7-8894-4283-b253-3c3b8f78d6cb', 'admin', '2026-10-17 12:25:07-05', '2026-10-17 11:56:40.768976-05', 'MANUAL');
INSERT INTO public.tokens_revocados VALUES ('a51ba970-d4d1-456e-954f-31e2265e20cd', '8dd235cb-5bd4-477a-913e-841879f2325e', 'admin', '2026-10-17 12:30:31-05', '2026-10-17 12:01:12.06728-05', 'MANUAL');
INSERT INTO public.tokens_revocados VALUES ('583cdcae-2af4-459b-af70-87b7d7694ca0', '696cc5c8-c169-47a6-a133-b2d5011ca7a0', 'admin', '2026-10-17 12:35:31-05', '2026-10-17 12:05:32.132888-05', 'INTENTOS_FALLIDOS');
INSERT INTO public.tokens_revocados VALUES ('d15d0983-750a-4a40-9196-8605bddea556', '06615781-910b-46c3-b369-028191cb6d26', 'admin', '2026-10-17 12:35:32-05', '2026-10-17 12:05:32.263103-05', 'CAMBIO_CONTRASENA');
INSERT INTO public.tokens_revocados VALUES ('b7b4cb14-3c65-406c-9d35-2de7a57571ed', 'b0fe215b-e8fc-4a96-b7c2-9d6dfabf6df9', 'admin', '2026-10-17 12:35:32-05', '2026-10-17 12:05:32.376773-05', 'CAMBIO_CONTRASENA');
INSERT INTO public.tokens_revocados VALUES ('31c931d7-d217-432f-a963-51c73d652f49', 'da3f7a5c-63e7-45b5-b605-16484ae3189c', 'admin', '2026-10-17 12:35:32-05', '2026-10-17 12:05:32.387677-05', 'MANUAL');
INSERT INTO public.tokens_revocados VALUES ('f9ca3219-5385-46f2-8762-23b18192b333', '2032f27d-5e0a-44e6-930c-e05ac8bf06ba', 'admin', '2026-10-17 12:59:03-05', '2026-10-17 12:29:03.46098-05', 'INTENTOS_FALLIDOS');
INSERT INTO public.tokens_revocados VALUES ('ce43da83-f41e-4d91-9c9d-dc0a081fbd0d', '8761c217-9e7f-41d1-bff9-8ace969211a3', 'admin', '2026-10-17 12:59:03-05', '2026-10-17 12:29:03.58202-05', 'CAMBIO_CONTRASENA');
INSERT INTO public.tokens_revocados VALUES ('07000a28-8b23-4f5d-a39c-838351a8c52a', 'e7909e47-b1bd-45f2-9249-3f546e1f08a7', 'admin', '2026-10-17 12:59:03-05', '2026-10-17 12:29:03.715835-05', 'CAMBIO_CONTRASENA');
INSERT INTO public.tokens_revocados VALUES ('7df74d20-a763-485c-ae08-07cff744eb58', '83e4d80f-c983-4ec5-bea7-e5787df1f890', 'admin', '2026-10-17 12:59:03-05', '2026-10-17 12:29:03.723587-05', 'MANUAL');
INSERT INTO public.tokens_revocados VALUES ('cabfae63-b267-40c0-8406-9bad17c4cfab', '9c130035-09ae-499b-ad71-01bbd7e08bfc', 'admin', '2026-10-17 13:04:04-05', '2026-10-17 12:34:05.057681-05', 'INTENTOS_FALLIDOS');
INSERT INTO public.tokens_revocados VALUES ('041f76ab-f69c-42f3-8365-a683a68d3f37', '54052cd5-b86f-4801-af83-b004b3368fb3', 'admin', '2026-10-17 13:04:05-05', '2026-10-17 12:34:05.170141-05', 'CAMBIO_CONTRASENA');
INSERT INTO public.tokens_revocados VALUES ('6b5ce865-9c1c-41f7-87fd-20751e4008fd', 'efd57a67-7e83-43fd-ae4c-3250566cccd0', 'admin', '2026-10-17 13:04:05-05', '2026-10-17 12:34:05.275035-05', 'CAMBIO_CONTRASENA');
INSERT INTO public.tokens_revocados VALUES ('18c0c6d7-9804-46a9-bc28-c22faa9efcb1', '3d67e2c7-7cc6-4177-ae1c-24bbf21d059b', 'admin', '2026-10-17 13:04:05-05', '2026-10-17 12:34:05.284208-05', 'MANUAL');
INSERT INTO public.tokens_revocados VALUES ('5abb6f99-e351-4a2e-ab19-7920002f61d3', 'd4622df4-426e-488e-8c14-4a37c35948eb', 'atorres', '2026-10-17 21:36:13-05', '2026-10-17 21:09:17.040434-05', 'MANUAL');
INSERT INTO public.tokens_revocados VALUES ('1cc40a8a-49b0-41d2-80a5-76c4926b0da5', 'b246b50c-179c-4ff4-8ecd-b8e53e60f510', 'lperez', '2026-10-17 21:39:21-05', '2026-10-17 21:09:28.495719-05', 'MANUAL');


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.usuarios VALUES ('6010e97d-9fbb-4df6-b51f-ebd34b6d9433', 'crojas', 'Carlos Rojas (Inactivo)', 'crojas@girasoles.com', '100000.osJuAs2gM4bBVq2C+vxRwQ==.zG/wiHDtZssoRvB3atxuGciNknbazMjt+oGZpd7JZS8=', 3, false, 0, NULL, '2026-10-16 10:55:25.222549-05', NULL);
INSERT INTO public.usuarios VALUES ('757dee14-699f-470d-a65b-6ae01a46d5ac', 'dramos', 'Diego Ramos', 'dramos.nuevo@girasoles.com', '100000.uwBgvjThaWU59T48FLoDtA==.RNQ0hHFQ8QPq2Hj/1sQh9j6/9/2cFNGDRnIMqo3/X/k=', 3, true, 0, NULL, '2026-10-16 17:46:13.949806-05', '2026-10-17 11:03:53.373788-05');
INSERT INTO public.usuarios VALUES ('89d58dff-4e1b-414c-8bf9-d59d098ec29f', 'msoto', 'María Soto A', 'msoto@girasoles.com', '100000.osJuAs2gM4bBVq2C+vxRwQ==.zG/wiHDtZssoRvB3atxuGciNknbazMjt+oGZpd7JZS8=', 4, true, 0, NULL, '2026-10-16 10:55:25.222548-05', '2026-10-17 14:09:25.473055-05');
INSERT INTO public.usuarios VALUES ('920ba4f1-d552-4c76-b1c0-087b3b75770c', 'atorres', 'Ana Torres', 'atorres@girasoles.com', '100000.osJuAs2gM4bBVq2C+vxRwQ==.zG/wiHDtZssoRvB3atxuGciNknbazMjt+oGZpd7JZS8=', 2, true, 0, NULL, '2026-10-16 10:55:25.222546-05', '2026-10-17 21:12:51.833152-05');
INSERT INTO public.usuarios VALUES ('05c84bab-bb5e-479f-8a19-f309b7fde947', 'admin', 'Administradora General', 'admin@girasoles.com', '100000.GUgXNk6jusz9ZqECzj039A==.oK8dwnfLNIiH5SnNIqPUGhkN65JeZAh/5wOHWVIZ0a4=', 1, true, 0, NULL, '2026-10-16 10:55:25.22248-05', '2026-10-17 21:48:52.379548-05');
INSERT INTO public.usuarios VALUES ('fdfbc247-2349-4bab-9d92-cc595b7a34d8', 'lperez', 'Luis Pérez', 'lperez@girasoles.com', '100000.osJuAs2gM4bBVq2C+vxRwQ==.zG/wiHDtZssoRvB3atxuGciNknbazMjt+oGZpd7JZS8=', 3, true, 0, NULL, '2026-10-16 10:55:25.222548-05', '2026-10-17 21:49:03.451388-05');


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
-- Name: auditorias_usuario auditorias_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditorias_usuario
    ADD CONSTRAINT auditorias_usuario_pkey PRIMARY KEY (id_auditoria);


--
-- Name: menu_dia_platos menu_dia_platos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_dia_platos
    ADD CONSTRAINT menu_dia_platos_pkey PRIMARY KEY (id_menu_plato);


--
-- Name: menus_dia menus_dia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menus_dia
    ADD CONSTRAINT menus_dia_pkey PRIMARY KEY (id_menu);


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
-- Name: comandas pk_comandas; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comandas
    ADD CONSTRAINT pk_comandas PRIMARY KEY (id_comanda);


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
-- Name: tokens_revocados tokens_revocados_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tokens_revocados
    ADD CONSTRAINT tokens_revocados_pkey PRIMARY KEY (id_token_revocado);


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
-- Name: ix_auditorias_nom_admin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_auditorias_nom_admin ON public.auditorias_usuario USING btree (nom_admin);


--
-- Name: ix_auditorias_nom_afectado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_auditorias_nom_afectado ON public.auditorias_usuario USING btree (nom_usuario_afectado);


--
-- Name: ix_comandas_pedido; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comandas_pedido ON public.comandas USING btree (id_pedido);


--
-- Name: ix_detalles_comanda_comanda; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_detalles_comanda_comanda ON public.detalles_comanda USING btree (id_comanda);


--
-- Name: ix_detalles_pedido_pedido; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_detalles_pedido_pedido ON public.detalles_pedido USING btree (id_pedido);


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
-- Name: ix_productos_nom_normalizado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_productos_nom_normalizado ON public.productos USING btree (nom_normalizado);


--
-- Name: ix_tokens_revocados_jti; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_tokens_revocados_jti ON public.tokens_revocados USING btree (jti_token);


--
-- Name: ix_tokens_revocados_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_tokens_revocados_usuario ON public.tokens_revocados USING btree (nom_usuario);


--
-- Name: comandas fk_comandas_pedido; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comandas
    ADD CONSTRAINT fk_comandas_pedido FOREIGN KEY (id_pedido) REFERENCES public.pedidos(id_pedido) ON DELETE CASCADE;


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
-- PostgreSQL database dump complete
--

\unrestrict s2IxRl8H7IGGHgN0nS99jo20X68RTuC7dUbLbkDuW3h3OPrmqnhMNVQQsFbMyHe

