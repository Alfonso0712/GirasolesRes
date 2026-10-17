--
-- PostgreSQL database dump
--


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

DROP INDEX IF EXISTS public.ix_tokens_revocados_usuario;
DROP INDEX IF EXISTS public.ix_tokens_revocados_jti;
DROP INDEX IF EXISTS public.ix_auditorias_nom_afectado;
DROP INDEX IF EXISTS public.ix_auditorias_nom_admin;
DROP INDEX IF EXISTS public."IX_usuarios_nom_usuario";
DROP INDEX IF EXISTS public."IX_usuarios_cor_usuario";
DROP INDEX IF EXISTS public."IX_codigos_recuperacion_cor_usuario";
ALTER TABLE IF EXISTS ONLY public.tokens_revocados DROP CONSTRAINT IF EXISTS tokens_revocados_pkey;
ALTER TABLE IF EXISTS ONLY public.auditorias_usuario DROP CONSTRAINT IF EXISTS auditorias_usuario_pkey;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS "PK_usuarios";
ALTER TABLE IF EXISTS ONLY public.registros_ingreso DROP CONSTRAINT IF EXISTS "PK_registros_ingreso";
ALTER TABLE IF EXISTS ONLY public.codigos_recuperacion DROP CONSTRAINT IF EXISTS "PK_codigos_recuperacion";
DROP TABLE IF EXISTS public.usuarios;
DROP TABLE IF EXISTS public.tokens_revocados;
DROP TABLE IF EXISTS public.registros_ingreso;
DROP TABLE IF EXISTS public.codigos_recuperacion;
DROP TABLE IF EXISTS public.auditorias_usuario;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: auditorias_usuario; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: codigos_recuperacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.codigos_recuperacion (
    id_codigo uuid NOT NULL,
    cor_usuario character varying(100) NOT NULL,
    cod_recuperacion character varying(6) NOT NULL,
    fec_expiracion_utc timestamp with time zone NOT NULL,
    es_usado boolean NOT NULL,
    fec_creacion_utc timestamp with time zone NOT NULL
);


--
-- Name: registros_ingreso; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.registros_ingreso (
    id_registro uuid NOT NULL,
    nom_usuario character varying(50) NOT NULL,
    fec_hora_utc timestamp with time zone NOT NULL,
    es_exitoso boolean NOT NULL,
    det_resultado character varying(250),
    dir_ip character varying(50)
);


--
-- Name: tokens_revocados; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tokens_revocados (
    id_token_revocado uuid NOT NULL,
    jti_token character varying(100) NOT NULL,
    nom_usuario character varying(50) NOT NULL,
    fec_expiracion_utc timestamp with time zone NOT NULL,
    fec_revocacion_utc timestamp with time zone NOT NULL,
    mot_revocacion character varying(50) NOT NULL
);


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
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


--
-- Data for Name: auditorias_usuario; Type: TABLE DATA; Schema: public; Owner: -
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
\.


--
-- Data for Name: codigos_recuperacion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.codigos_recuperacion (id_codigo, cor_usuario, cod_recuperacion, fec_expiracion_utc, es_usado, fec_creacion_utc) FROM stdin;
\.


--
-- Data for Name: registros_ingreso; Type: TABLE DATA; Schema: public; Owner: -
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
\.


--
-- Data for Name: tokens_revocados; Type: TABLE DATA; Schema: public; Owner: -
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
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuarios (id_usuario, nom_usuario, nom_completo, cor_usuario, has_usuario, rol_usuario, est_usuario, int_fallidos, bloq_hasta_utc, fec_creacion_utc, fec_actualizacion_utc) FROM stdin;
6010e97d-9fbb-4df6-b51f-ebd34b6d9433	crojas	Carlos Rojas (Inactivo)	crojas@girasoles.com	100000.osJuAs2gM4bBVq2C+vxRwQ==.zG/wiHDtZssoRvB3atxuGciNknbazMjt+oGZpd7JZS8=	3	f	0	\N	2026-10-16 10:55:25.222549-05	\N
757dee14-699f-470d-a65b-6ae01a46d5ac	dramos	Diego Ramos	dramos.nuevo@girasoles.com	100000.uwBgvjThaWU59T48FLoDtA==.RNQ0hHFQ8QPq2Hj/1sQh9j6/9/2cFNGDRnIMqo3/X/k=	3	t	0	\N	2026-10-16 17:46:13.949806-05	2026-10-17 11:03:53.373788-05
89d58dff-4e1b-414c-8bf9-d59d098ec29f	msoto	María Soto A	msoto@girasoles.com	100000.osJuAs2gM4bBVq2C+vxRwQ==.zG/wiHDtZssoRvB3atxuGciNknbazMjt+oGZpd7JZS8=	4	t	0	\N	2026-10-16 10:55:25.222548-05	2026-10-17 11:04:09.418724-05
920ba4f1-d552-4c76-b1c0-087b3b75770c	atorres	Ana Torres	atorres@girasoles.com	100000.osJuAs2gM4bBVq2C+vxRwQ==.zG/wiHDtZssoRvB3atxuGciNknbazMjt+oGZpd7JZS8=	2	t	0	\N	2026-10-16 10:55:25.222546-05	2026-10-17 12:34:04.87552-05
fdfbc247-2349-4bab-9d92-cc595b7a34d8	lperez	Luis Pérez	lperez@girasoles.com	100000.osJuAs2gM4bBVq2C+vxRwQ==.zG/wiHDtZssoRvB3atxuGciNknbazMjt+oGZpd7JZS8=	3	t	0	\N	2026-10-16 10:55:25.222548-05	2026-10-16 17:47:15.951963-05
05c84bab-bb5e-479f-8a19-f309b7fde947	admin	Administradora General	admin@girasoles.com	100000.GUgXNk6jusz9ZqECzj039A==.oK8dwnfLNIiH5SnNIqPUGhkN65JeZAh/5wOHWVIZ0a4=	1	t	0	\N	2026-10-16 10:55:25.22248-05	2026-10-17 12:34:05.271648-05
\.


--
-- Name: codigos_recuperacion PK_codigos_recuperacion; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.codigos_recuperacion
    ADD CONSTRAINT "PK_codigos_recuperacion" PRIMARY KEY (id_codigo);


--
-- Name: registros_ingreso PK_registros_ingreso; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registros_ingreso
    ADD CONSTRAINT "PK_registros_ingreso" PRIMARY KEY (id_registro);


--
-- Name: usuarios PK_usuarios; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "PK_usuarios" PRIMARY KEY (id_usuario);


--
-- Name: auditorias_usuario auditorias_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditorias_usuario
    ADD CONSTRAINT auditorias_usuario_pkey PRIMARY KEY (id_auditoria);


--
-- Name: tokens_revocados tokens_revocados_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tokens_revocados
    ADD CONSTRAINT tokens_revocados_pkey PRIMARY KEY (id_token_revocado);


--
-- Name: IX_codigos_recuperacion_cor_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_codigos_recuperacion_cor_usuario" ON public.codigos_recuperacion USING btree (cor_usuario);


--
-- Name: IX_usuarios_cor_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_usuarios_cor_usuario" ON public.usuarios USING btree (cor_usuario);


--
-- Name: IX_usuarios_nom_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IX_usuarios_nom_usuario" ON public.usuarios USING btree (nom_usuario);


--
-- Name: ix_auditorias_nom_admin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_auditorias_nom_admin ON public.auditorias_usuario USING btree (nom_admin);


--
-- Name: ix_auditorias_nom_afectado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_auditorias_nom_afectado ON public.auditorias_usuario USING btree (nom_usuario_afectado);


--
-- Name: ix_tokens_revocados_jti; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_tokens_revocados_jti ON public.tokens_revocados USING btree (jti_token);


--
-- Name: ix_tokens_revocados_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_tokens_revocados_usuario ON public.tokens_revocados USING btree (nom_usuario);


--
-- PostgreSQL database dump complete
--

\unrestrict BEntGCEexEDHwk1xR9QffhcbfKamxPfnxgx0ogaa1vDCG5Lfea8PiOHQu0X11tX

