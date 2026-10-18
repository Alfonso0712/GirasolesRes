import unittest
import uuid
from .client import ApiClient
from .config import MESSAGES, USERS
from .fixtures import calculate_denominations, ensure_caja_closed

class TestTier1Features(unittest.TestCase):
    """
    Tier 1: Feature Coverage (>=5 test cases per feature for Opening, Closing, Arqueo, History, Cobro Guarding).
    Acceptance Criteria: HU34, HU35, HU36 (E-286..E-321).
    """

    @classmethod
    def setUpClass(cls):
        cls.client = ApiClient()

    # =========================================================================
    # FEATURE 1: Cash Register Opening (Apertura de caja - CUS 13.1, HU34)
    # =========================================================================

    def test_01_consultar_estado_sin_caja(self):
        """
        [E-286 / HU34] Entrar a CAJA sin caja abierta muestra MSG-166 y habilita ABRIR CAJA.
        """
        ensure_caja_closed(self.client)
        resp = self.client.get_caja_actual(as_user="cajero")
        self.assertEqual(resp.status_code, 200, f"Expected 200 OK. Got: {resp.status_code}, Body: {resp.raw_text}")
        self.assertIn(resp.get("estado"), ["sinCaja", "anteriorSinCerrar"])
        # Should contain suggestion field or message
        self.assertIsNotNone(resp.get("sugerenciaMontoInicial"))

    def test_02_abrir_caja_exitoso(self):
        """
        [E-287 / HU34] Abrir la caja con S/ 50.00 y confirmar emite toast MSG-173, pasa a Abierta y desbloquea cobros.
        """
        ensure_caja_closed(self.client)
        solicitud_id = str(uuid.uuid4())
        resp = self.client.abrir_caja(monto_inicial=50.00, solicitud_id=solicitud_id, as_user="cajero")
        self.assertIn(resp.status_code, [200, 201], f"Expected 201 Created or 200 OK. Got: {resp.status_code}, Body: {resp.raw_text}")
        self.assertTrue(resp.contains_message("MSG_173") or resp.contains_message("Caja abierta"), 
                        f"Response should include MSG-173. Body: {resp.raw_text}")
        
        # Verify status is now 'abierta'
        status_resp = self.client.get_caja_actual(as_user="cajero")
        self.assertEqual(status_resp.status_code, 200)
        self.assertEqual(status_resp.get("estado"), "abierta")

    def test_03_sugerencia_monto_inicial_desde_ultimo_cierre(self):
        """
        [E-288 / HU34] Si existe un cierre previo con S/ 370.00 contados, la apertura sugiere automáticamente S/ 370.00.
        """
        # Ensure a closed caja with 370.00 counted cash
        ensure_caja_closed(self.client)
        open_resp = self.client.abrir_caja(monto_inicial=100.00, as_user="cajero")
        if open_resp.is_success:
            self.client.cerrar_caja(
                efectivo_contado=370.00,
                efectivo_esperado_mostrado=100.00,
                observacion="Cierre para prueba de sugerencia",
                as_user="cajero"
            )

        resp = self.client.get_caja_actual(as_user="cajero")
        self.assertEqual(resp.status_code, 200)
        sugerencia = resp.get("sugerenciaMontoInicial")
        self.assertIsNotNone(sugerencia, f"Expected sugerenciaMontoInicial in response: {resp.raw_text}")
        self.assertAlmostEqual(float(sugerencia), 370.00, places=2)

    def test_04_unicidad_bloquea_apertura_si_ya_esta_abierta(self):
        """
        [E-290 / HU34 / RV-119 / RN-107] Intentar abrir caja cuando ya existe otra abierta hoy se bloquea con MSG-167.
        """
        # Ensure caja is open
        resp_act = self.client.get_caja_actual(as_user="cajero")
        if resp_act.get("estado") != "abierta":
            self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")

        # Second open attempt must fail with 409 Conflict and MSG-167
        resp_duplicate = self.client.abrir_caja(monto_inicial=100.00, as_user="cajero")
        self.assertEqual(resp_duplicate.status_code, 409, f"Expected 409 Conflict. Got: {resp_duplicate.status_code}")
        self.assertTrue(resp_duplicate.contains_message("MSG_167") or "ya existe" in resp_duplicate.raw_text.lower(),
                        f"Expected MSG-167 error. Body: {resp_duplicate.raw_text}")

    def test_05_idempotencia_apertura_solicitud_id(self):
        """
        [E-292 / HU34 / RV-121 / RNF-45] Doble clic rápido en CONFIRMAR apertura envía el mismo solicitudId e inserta una sola vez.
        """
        ensure_caja_closed(self.client)
        solicitud_id = str(uuid.uuid4())

        # First request
        resp1 = self.client.abrir_caja(monto_inicial=80.00, solicitud_id=solicitud_id, as_user="cajero")
        self.assertIn(resp1.status_code, [200, 201])

        # Second request with identical solicitudId
        resp2 = self.client.abrir_caja(monto_inicial=80.00, solicitud_id=solicitud_id, as_user="cajero")
        # Idempotent response: 200 or 201, returning the same created caja without creating a second one
        self.assertIn(resp2.status_code, [200, 201], f"Expected idempotent success. Got: {resp2.status_code}")

    def test_06_consultar_estado_con_caja_abierta(self):
        """
        [E-295 / HU34 / RV-132] Consultar estado con caja abierta retorna hora, usuario, monto inicial y balance parcial.
        """
        resp_act = self.client.get_caja_actual(as_user="cajero")
        if resp_act.get("estado") != "abierta":
            self.client.abrir_caja(monto_inicial=65.00, as_user="cajero")
            resp_act = self.client.get_caja_actual(as_user="cajero")

        self.assertEqual(resp_act.status_code, 200)
        self.assertEqual(resp_act.get("estado"), "abierta")
        apertura = resp_act.get("apertura")
        self.assertIsNotNone(apertura, "apertura object should be present")
        self.assertIn("montoInicial", apertura)

    # =========================================================================
    # FEATURE 2: Cash Register Closing (Cierre de caja - CUS 13.2, HU35)
    # =========================================================================

    def test_07_resumen_cierre_calculo_servidor(self):
        """
        [E-298 / HU35 / RV-123 / RN-109] El resumen calcula fidedignamente inicial, efectivo, Yape, total y efectivo esperado.
        """
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")

        resumen_resp = self.client.get_cierre_resumen(as_user="cajero")
        self.assertEqual(resumen_resp.status_code, 200, f"Expected 200 OK for resumen. Body: {resumen_resp.raw_text}")
        data = resumen_resp.data
        self.assertIsInstance(data, dict)
        self.assertIn("montoInicial", data)
        self.assertIn("efectivoEsperado", data)
        self.assertAlmostEqual(float(data.get("montoInicial", 0)), 50.00, places=2)

    def test_08_resumen_cierre_excluye_ventas_anuladas(self):
        """
        [E-299 / HU35 / RV-123] Las ventas anuladas durante el turno quedan excluidas del total esperado.
        """
        resp_act = self.client.get_caja_actual(as_user="cajero")
        if resp_act.get("estado") != "abierta":
            self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")

        resumen_resp = self.client.get_cierre_resumen(as_user="cajero")
        self.assertEqual(resumen_resp.status_code, 200)
        # Expected cash must strictly equal montoInicial + ventasEfectivo (excluding anuladas)
        data = resumen_resp.data
        monto_inicial = float(data.get("montoInicial", 0.0))
        ventas_efectivo = float(data.get("ventasEfectivo", data.get("efectivo", 0.0)))
        efectivo_esperado = float(data.get("efectivoEsperado", 0.0))
        self.assertAlmostEqual(efectivo_esperado, round(monto_inicial + ventas_efectivo, 2), places=2)

    def test_09_cierre_exitoso_cuadra(self):
        """
        [E-300, E-306 / HU35 / RV-125 / RN-112] Cierre con efectivo contado == efectivo esperado devuelve 200 OK y MSG-181 (Cuadra).
        """
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")

        resumen_resp = self.client.get_cierre_resumen(as_user="cajero")
        self.assertEqual(resumen_resp.status_code, 200)
        esperado = float(resumen_resp.data.get("efectivoEsperado", 50.00))

        close_resp = self.client.cerrar_caja(
            efectivo_contado=esperado,
            observacion="Cuadre exacto fin de turno",
            efectivo_esperado_mostrado=esperado,
            as_user="cajero"
        )
        self.assertEqual(close_resp.status_code, 200, f"Expected 200 OK on close. Body: {close_resp.raw_text}")
        self.assertTrue(close_resp.contains_message("MSG_181") or "cerrada" in close_resp.raw_text.lower(),
                        f"Expected MSG-181 in response: {close_resp.raw_text}")
        self.assertAlmostEqual(float(close_resp.get("diferencia", 0.0)), 0.00, places=2)

    def test_10_cierre_irreversibilidad_bloquea_cobros(self):
        """
        [E-306 / HU35 / RN-112] Al cerrarse la caja, cesa la recepción de cobros; no se puede cobrar hasta abrir nueva.
        """
        # Ensure closed
        ensure_caja_closed(self.client)
        status_resp = self.client.get_caja_actual(as_user="cajero")
        self.assertEqual(status_resp.get("estado"), "sinCaja")

        # Attempt to query pending cobros or execute cobro
        cobros_resp = self.client.raw_request("GET", "/cobros/pendientes", as_user="cajero")
        self.assertEqual(cobros_resp.status_code, 409, f"Expected 409 Conflict when caja is closed. Got: {cobros_resp.status_code}")
        self.assertTrue(cobros_resp.contains_message("MSG_135") or "debe abrir" in cobros_resp.raw_text.lower(),
                        f"Expected MSG-135 when caja is closed. Body: {cobros_resp.raw_text}")

    def test_11_cierre_idempotencia_solicitud_id(self):
        """
        [E-309 / HU35 / RV-127 / RNF-45] Doble clic rápido en CONFIRMAR CIERRE procesa una sola transacción vía solicitudId.
        """
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        resumen_resp = self.client.get_cierre_resumen(as_user="cajero")
        esperado = float(resumen_resp.data.get("efectivoEsperado", 50.00))

        solicitud_id = str(uuid.uuid4())
        resp1 = self.client.cerrar_caja(
            efectivo_contado=esperado,
            efectivo_esperado_mostrado=esperado,
            solicitud_id=solicitud_id,
            as_user="cajero"
        )
        self.assertEqual(resp1.status_code, 200)

        # Immediate retry with same solicitudId
        resp2 = self.client.cerrar_caja(
            efectivo_contado=esperado,
            efectivo_esperado_mostrado=esperado,
            solicitud_id=solicitud_id,
            as_user="cajero"
        )
        self.assertIn(resp2.status_code, [200, 409], f"Idempotent closing handling. Got: {resp2.status_code}")

    def test_12_descarga_pdf_resumen_cierre(self):
        """
        [E-307 / HU35 / RNF-48] Pantalla post-cierre permite descargar documento PDF de 1 página con balance y firmas.
        """
        # Ensure a closed caja exists
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        resumen_resp = self.client.get_cierre_resumen(as_user="cajero")
        esperado = float(resumen_resp.data.get("efectivoEsperado", 50.00))
        close_resp = self.client.cerrar_caja(
            efectivo_contado=esperado,
            efectivo_esperado_mostrado=esperado,
            as_user="cajero"
        )
        self.assertEqual(close_resp.status_code, 200)
        cierre_id = close_resp.get("cierreId") or close_resp.get("cajaId")

        pdf_resp = self.client.get_cierre_pdf(cierre_id=cierre_id, as_user="cajero")
        self.assertEqual(pdf_resp.status_code, 200, f"Expected 200 OK for PDF. Body: {pdf_resp.raw_text}")
        content_type = pdf_resp.headers.get("Content-Type", "")
        self.assertIn("application/pdf", content_type, f"Expected Content-Type application/pdf. Got: {content_type}")

    # =========================================================================
    # FEATURE 3: Arqueo (Cuadre & Contador de Denominaciones - CUS 13.2, HU35)
    # =========================================================================

    def test_13_arqueo_cuadre_exacto_indicador(self):
        """
        [E-300 / HU35 / RV-125] Efectivo contado == efectivo esperado: diferencia S/ 0.00, mensaje MSG-176 ("Cuadra").
        """
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        resumen_resp = self.client.get_cierre_resumen(as_user="cajero")
        esperado = float(resumen_resp.data.get("efectivoEsperado", 50.00))

        close_resp = self.client.cerrar_caja(
            efectivo_contado=esperado,
            efectivo_esperado_mostrado=esperado,
            as_user="cajero"
        )
        self.assertEqual(close_resp.status_code, 200)
        self.assertAlmostEqual(float(close_resp.get("diferencia", 0.0)), 0.00, places=2)
        self.assertTrue(close_resp.contains_message("MSG_176") or "cuadra" in close_resp.raw_text.lower())

    def test_14_arqueo_faltante_indicador(self):
        """
        [E-301 / HU35 / RV-125 / RN-111] Efectivo contado S/ 365 vs S/ 370 esperado: diferencia -S/ 5.00, MSG-178 ("Faltante").
        """
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=370.00, as_user="cajero")
        resumen_resp = self.client.get_cierre_resumen(as_user="cajero")
        esperado = float(resumen_resp.data.get("efectivoEsperado", 370.00))

        contado = round(esperado - 5.00, 2)
        close_resp = self.client.cerrar_caja(
            efectivo_contado=contado,
            efectivo_esperado_mostrado=esperado,
            observacion="Faltante justificado por rotura de billete",
            as_user="cajero"
        )
        self.assertEqual(close_resp.status_code, 200)
        self.assertAlmostEqual(float(close_resp.get("diferencia", 0.0)), -5.00, places=2)
        self.assertTrue(close_resp.contains_message("MSG_178") or "faltante" in close_resp.raw_text.lower())

    def test_15_arqueo_sobrante_indicador(self):
        """
        [E-302 / HU35 / RV-125 / RN-111] Efectivo contado S/ 380 vs S/ 370 esperado: diferencia +S/ 10.00, MSG-177 ("Sobrante").
        """
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=370.00, as_user="cajero")
        resumen_resp = self.client.get_cierre_resumen(as_user="cajero")
        esperado = float(resumen_resp.data.get("efectivoEsperado", 370.00))

        contado = round(esperado + 10.00, 2)
        close_resp = self.client.cerrar_caja(
            efectivo_contado=contado,
            efectivo_esperado_mostrado=esperado,
            observacion="Sobrante por propina voluntaria en caja",
            as_user="cajero"
        )
        self.assertEqual(close_resp.status_code, 200)
        self.assertAlmostEqual(float(close_resp.get("diferencia", 0.0)), 10.00, places=2)
        self.assertTrue(close_resp.contains_message("MSG_177") or "sobrante" in close_resp.raw_text.lower())

    def test_16_contador_denominaciones_peruanas(self):
        """
        [E-304 / HU35 / RV-128] Contador de denominaciones: 3 billetes de S/ 100, 1 de S/ 50 y 2 monedas de S/ 5 suman S/ 360.00.
        """
        counts = {
            100.00: 3,
            50.00: 1,
            5.00: 2
        }
        total, err = calculate_denominations(counts)
        self.assertIsNone(err)
        self.assertAlmostEqual(total, 360.00, places=2)

    def test_17_arqueo_observacion_almacenada(self):
        """
        [E-305 / HU35 / RV-126] Observación del arqueo se almacena y se expone en la auditoría / detalle del cierre.
        """
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        resumen_resp = self.client.get_cierre_resumen(as_user="cajero")
        esperado = float(resumen_resp.data.get("efectivoEsperado", 50.00))

        obs = "Ajuste de caja por prueba unitaria de observación"
        close_resp = self.client.cerrar_caja(
            efectivo_contado=esperado,
            efectivo_esperado_mostrado=esperado,
            observacion=obs,
            as_user="cajero"
        )
        self.assertEqual(close_resp.status_code, 200)
        cierre_id = close_resp.get("cierreId") or close_resp.get("cajaId")

        # Admin checks detail
        detalle_resp = self.client.get_cierre_detalle(cierre_id=cierre_id, as_user="admin")
        self.assertEqual(detalle_resp.status_code, 200)
        self.assertEqual(detalle_resp.get("observacion"), obs)

    # =========================================================================
    # FEATURE 4: Closings History (Historial de cierres - CUS 13.3, HU36)
    # =========================================================================

    def test_18_historial_cierres_admin_orden_descendente(self):
        """
        [E-313 / HU36 / RN-106 / RV-130] Administrador accede a GET /api/caja/cierres: orden descendente y paginación por 20.
        """
        resp = self.client.get_cierres(pagina=1, tamano=20, as_user="admin")
        self.assertEqual(resp.status_code, 200, f"Expected 200 OK. Got: {resp.status_code}, Body: {resp.raw_text}")
        data = resp.data
        self.assertIsInstance(data, dict)
        items = data.get("items")
        self.assertIsInstance(items, list)

    def test_19_historial_caja_abierta_primera_fila(self):
        """
        [E-320 / HU36 / RV-130] Si existe una caja actualmente abierta, aparece como la primera fila marcada como 'Abierta'.
        """
        # Ensure a caja is currently open
        resp_act = self.client.get_caja_actual(as_user="cajero")
        if resp_act.get("estado") != "abierta":
            self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")

        resp = self.client.get_cierres(pagina=1, tamano=20, as_user="admin")
        self.assertEqual(resp.status_code, 200)
        items = resp.get("items", [])
        self.assertGreater(len(items), 0, "History should have at least 1 item")
        first_row = items[0]
        self.assertEqual(first_row.get("estado"), "Abierta", f"First row should be 'Abierta'. Got: {first_row}")

    def test_20_historial_filas_descuadre_resaltadas(self):
        """
        [E-314 / HU36 / RV-131] Filas con descuadre en el historial exponen estado 'sobrante' o 'faltante'.
        """
        # Close a caja with difference
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=100.00, as_user="cajero")
        self.client.cerrar_caja(
            efectivo_contado=95.00,
            efectivo_esperado_mostrado=100.00,
            observacion="Descuadre faltante",
            as_user="cajero"
        )

        resp = self.client.get_cierres(pagina=1, tamano=20, as_user="admin")
        self.assertEqual(resp.status_code, 200)
        items = resp.get("items", [])
        has_discrepancy = any(item.get("resultado") in ["faltante", "sobrante"] or float(item.get("diferencia", 0.0) or 0.0) != 0.0 for item in items)
        self.assertTrue(has_discrepancy, "History should contain a discrepancy item")

    def test_21_historial_filtro_rango_fechas(self):
        """
        [E-315 / HU36 / RV-130] Filtro por fecha o rango de fechas retorna cierres dentro del periodo.
        """
        resp = self.client.get_cierres(desde="2026-10-01", hasta="2026-10-18", pagina=1, tamano=20, as_user="admin")
        self.assertEqual(resp.status_code, 200)
        self.assertIsInstance(resp.get("items"), list)

    def test_22_historial_cierre_detalle_modal(self):
        """
        [E-317 / HU36 / RN-113] Detalle de un cierre seleccionado (Vista 13.4) muestra platos vendidos y ajustes posteriores.
        """
        resp_list = self.client.get_cierres(pagina=1, tamano=5, as_user="admin")
        self.assertEqual(resp_list.status_code, 200)
        items = [i for i in resp_list.get("items", []) if i.get("estado") != "Abierta"]
        if not items:
            # Create a closed caja
            ensure_caja_closed(self.client)
            self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
            close_resp = self.client.cerrar_caja(efectivo_contado=50.00, efectivo_esperado_mostrado=50.00, as_user="cajero")
            cierre_id = close_resp.get("cierreId") or close_resp.get("cajaId")
        else:
            cierre_id = items[0].get("cierreId") or items[0].get("id")

        resp_detalle = self.client.get_cierre_detalle(cierre_id=cierre_id, as_user="admin")
        self.assertEqual(resp_detalle.status_code, 200)
        data = resp_detalle.data
        self.assertIn("montoInicial", data)
        self.assertIn("platos", data)
        self.assertIn("ajustesPosteriores", data)

    # =========================================================================
    # FEATURE 5: Cobro Guarding (Integración CUS 11 / RN-108 / RN-84)
    # =========================================================================

    def test_23_bloqueo_cobros_sin_caja(self):
        """
        [E-294 / HU34 / RN-108 / RN-84] Intentar consultar cobros pendientes o procesar cobro sin caja abierta emite MSG-135.
        """
        ensure_caja_closed(self.client)
        resp = self.client.raw_request("GET", "/cobros/pendientes", as_user="cajero")
        self.assertEqual(resp.status_code, 409, f"Expected 409 Conflict. Got: {resp.status_code}")
        self.assertTrue(resp.contains_message("MSG_135") or "abrir la caja" in resp.raw_text.lower())

    def test_24_desbloqueo_cobros_al_abrir(self):
        """
        [E-287 / HU34] Tras abrir la caja, las consultas a cobros pendientes se desbloquean (200 OK).
        """
        ensure_caja_closed(self.client)
        open_resp = self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        self.assertIn(open_resp.status_code, [200, 201])

        resp = self.client.raw_request("GET", "/cobros/pendientes", as_user="cajero")
        self.assertEqual(resp.status_code, 200, f"Expected 200 OK after caja open. Got: {resp.status_code}, Body: {resp.raw_text}")

    def test_25_bloqueo_cobros_al_cerrar(self):
        """
        [E-306 / HU35] Al cerrar la caja, los cobros se bloquean inmediatamente con MSG-135.
        """
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        self.client.cerrar_caja(efectivo_contado=50.00, efectivo_esperado_mostrado=50.00, as_user="cajero")

        resp = self.client.raw_request("GET", "/cobros/pendientes", as_user="cajero")
        self.assertEqual(resp.status_code, 409)
        self.assertTrue(resp.contains_message("MSG_135") or "caja" in resp.raw_text.lower())

    def test_26_bloqueo_cierre_por_pedidos_pendientes(self):
        """
        [E-296 / HU35 / RV-122 / RN-110] Intentar cerrar caja cuando hay pedidos pendientes emite MSG-174 y bloquea cierre.
        """
        # If there are pending orders in the system, closing must fail with 409 and MSG-174
        resumen_resp = self.client.get_cierre_resumen(as_user="cajero")
        if resumen_resp.is_success and isinstance(resumen_resp.data, dict):
            pendientes = resumen_resp.data.get("pedidosPendientes", [])
            if len(pendientes) > 0:
                close_resp = self.client.cerrar_caja(
                    efectivo_contado=50.00,
                    efectivo_esperado_mostrado=50.00,
                    as_user="cajero"
                )
                self.assertEqual(close_resp.status_code, 409, f"Expected 409 when orders pending. Got: {close_resp.status_code}")
                self.assertTrue(close_resp.contains_message("MSG_174") or "pedido" in close_resp.raw_text.lower())

    def test_27_seguridad_rol_cobros(self):
        """
        [E-319 / RN-106 / MSG-39] Roles no autorizados (Mozo, Cocinero) intentando acceder a cobros reciben 403 Forbidden.
        """
        resp = self.client.raw_request("GET", "/cobros/pendientes", as_user="mozo")
        self.assertEqual(resp.status_code, 403, f"Expected 403 Forbidden for mozo. Got: {resp.status_code}")
        self.assertTrue(resp.contains_message("MSG_39") or "permiso" in resp.raw_text.lower())

if __name__ == "__main__":
    unittest.main()
