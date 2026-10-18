import unittest
import uuid
import concurrent.futures
from .client import ApiClient
from .fixtures import ensure_caja_closed, ensure_caja_open

class TestAdversarialProbeM5(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = ApiClient()

    def _close_all_open_cajas(self):
        history = self.client.get_cierres(tamano=50, as_user="admin")
        items = history.get("items", [])
        for item in items:
            if item.get("estado") == "Abierta":
                self.client.cerrar_caja(efectivo_contado=100.00, as_user="cajero")

    def setUp(self):
        self._close_all_open_cajas()

    def tearDown(self):
        self._close_all_open_cajas()

    # =========================================================================
    # PROBE 1: Concurrency Race Conditions
    # =========================================================================

    def test_01_concurrent_duplicate_closures_different_tokens(self):
        """
        Adversarial Concurrency: 10 simultaneous closing requests with distinct
        solicitudId on a single open register.
        Expected: Exactly ONE request succeeds (200 OK), all remaining 9 fail with 409 Conflict.
        Database state must remain consistent with exactly one closed register.
        """
        ensure_caja_open(self.client, monto_inicial=100.00)

        num_threads = 10
        results = []

        def worker_close(token_idx: int):
            worker_client = ApiClient()
            return worker_client.cerrar_caja(
                efectivo_contado=100.00,
                solicitud_id=f"concurrent-close-{uuid.uuid4()}",
                observacion=f"Concurrent closure test {token_idx}",
                as_user="cajero"
            )

        with concurrent.futures.ThreadPoolExecutor(max_workers=num_threads) as executor:
            futures = [executor.submit(worker_close, i) for i in range(num_threads)]
            for future in concurrent.futures.as_completed(futures):
                results.append(future.result())

        status_codes = [r.status_code for r in results]
        success_count = status_codes.count(200)
        conflict_count = status_codes.count(409)

        # Assert exactly one 200 OK and all others 409 Conflict
        self.assertEqual(success_count, 1, f"Expected exactly 1 successful closing. Status codes: {status_codes}")
        self.assertEqual(conflict_count, num_threads - 1, f"Expected {num_threads - 1} 409 Conflicts. Status codes: {status_codes}")

        # Verify register is now closed
        actual = self.client.get_caja_actual(as_user="cajero")
        self.assertEqual(actual.get("estado"), "sinCaja")

    def test_02_concurrent_duplicate_closures_identical_token_idempotency(self):
        """
        Adversarial Concurrency: 8 simultaneous closing requests sharing the EXACT same
        solicitudId (simulating rapid double/multi-clicks).
        Expected: All requests return 200 OK without deadlocks or server errors.
        """
        ensure_caja_open(self.client, monto_inicial=100.00)

        shared_solicitud_id = f"idempotent-close-{uuid.uuid4()}"
        num_threads = 8
        results = []

        def worker_idempotent_close():
            worker_client = ApiClient()
            return worker_client.cerrar_caja(
                efectivo_contado=100.00,
                solicitud_id=shared_solicitud_id,
                observacion="Multi-click rapid closure test",
                as_user="cajero"
            )

        with concurrent.futures.ThreadPoolExecutor(max_workers=num_threads) as executor:
            futures = [executor.submit(worker_idempotent_close) for _ in range(num_threads)]
            for future in concurrent.futures.as_completed(futures):
                results.append(future.result())

        status_codes = [r.status_code for r in results]
        # All requests must succeed (200 OK) due to idempotency
        self.assertTrue(all(code == 200 for code in status_codes),
                        f"All idempotent requests should return 200 OK. Got: {status_codes}")

    def test_03_concurrent_duplicate_openings_race(self):
        """
        Adversarial Concurrency: 10 simultaneous opening requests with distinct
        solicitudId when no register is open.
        Expected: Exactly ONE request succeeds (201 Created), all remaining 9 fail with 409 Conflict (MSG-167).
        """
        ensure_caja_closed(self.client)

        num_threads = 10
        results = []

        def worker_open(idx: int):
            worker_client = ApiClient()
            return worker_client.abrir_caja(
                monto_inicial=150.00,
                solicitud_id=f"concurrent-open-{uuid.uuid4()}",
                as_user="cajero"
            )

        with concurrent.futures.ThreadPoolExecutor(max_workers=num_threads) as executor:
            futures = [executor.submit(worker_open, i) for i in range(num_threads)]
            for future in concurrent.futures.as_completed(futures):
                results.append(future.result())

        status_codes = [r.status_code for r in results]
        created_count = status_codes.count(201)
        conflict_count = status_codes.count(409)

        self.assertEqual(created_count, 1, f"Expected exactly 1 created register. Status codes: {status_codes}")
        self.assertEqual(conflict_count, num_threads - 1, f"Expected {num_threads - 1} 409 Conflicts. Status codes: {status_codes}")

    # =========================================================================
    # PROBE 2: Boundary Monetary Arithmetic
    # =========================================================================

    def test_04_monetary_zero_initial_cash_accepted(self):
        """
        Boundary: Monto inicial S/ 0.00 is valid (RV-120).
        """
        resp = self.client.abrir_caja(monto_inicial=0.00, as_user="cajero")
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(float(resp.get("montoInicial")), 0.00)

    def test_05_monetary_max_initial_cash_accepted(self):
        """
        Boundary: Monto inicial S/ 99,999.99 is the absolute upper limit (RV-120).
        """
        resp = self.client.abrir_caja(monto_inicial=99999.99, as_user="cajero")
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(float(resp.get("montoInicial")), 99999.99)

    def test_06_monetary_above_max_initial_cash_rejected(self):
        """
        Boundary: Monto inicial S/ 100,000.00 exceeds limit and triggers MSG-171.
        """
        resp = self.client.abrir_caja(monto_inicial=100000.00, as_user="cajero")
        self.assertEqual(resp.status_code, 400)
        self.assertTrue(resp.contains_message("MSG_171"))

    def test_07_monetary_negative_initial_cash_rejected(self):
        """
        Boundary: Monto inicial S/ -0.01 is negative and triggers MSG-170.
        """
        resp = self.client.abrir_caja(monto_inicial=-0.01, as_user="cajero")
        self.assertEqual(resp.status_code, 400)
        self.assertTrue(resp.contains_message("MSG_170"))

    def test_08_monetary_sub_cent_precision_rejected(self):
        """
        Boundary: Sub-cent fractional amounts (e.g. 50.001 or 50.009) exceed 2 decimals
        and must be rejected with 400 (MSG-170).
        """
        resp1 = self.client.abrir_caja(monto_inicial=50.001, as_user="cajero")
        self.assertEqual(resp1.status_code, 400)
        self.assertTrue(resp1.contains_message("MSG_170"))

        resp2 = self.client.abrir_caja(monto_inicial=50.009, as_user="cajero")
        self.assertEqual(resp2.status_code, 400)
        self.assertTrue(resp2.contains_message("MSG_170"))

    def test_09_monetary_negative_difference_faltante(self):
        """
        Arithmetic: Expected S/ 100.00, Counted S/ 40.00 -> Difference = -60.00.
        Must report EstadoCuadre = Faltante and include MSG-178 formatted difference.
        """
        ensure_caja_open(self.client, monto_inicial=100.00)
        resp = self.client.cerrar_caja(efectivo_contado=40.00, as_user="cajero")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(float(resp.get("diferencia")), -60.00)
        self.assertEqual(resp.get("estadoCuadre"), "Faltante")
        self.assertTrue("Faltante" in resp.get("mensaje") and "60" in resp.get("mensaje"))

    def test_10_monetary_positive_difference_sobrante(self):
        """
        Arithmetic: Expected S/ 100.00, Counted S/ 175.50 -> Difference = +75.50.
        Must report EstadoCuadre = Sobrante and include MSG-177 formatted difference.
        """
        ensure_caja_open(self.client, monto_inicial=100.00)
        resp = self.client.cerrar_caja(efectivo_contado=175.50, as_user="cajero")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(float(resp.get("diferencia")), 75.50)
        self.assertEqual(resp.get("estadoCuadre"), "Sobrante")
        self.assertTrue("Sobrante" in resp.get("mensaje") and "75" in resp.get("mensaje"))

    def test_11_monetary_zero_difference_cuadra(self):
        """
        Arithmetic: Expected S/ 100.00, Counted S/ 100.00 -> Difference = 0.00.
        Must report EstadoCuadre = Cuadra and MSG-176.
        """
        ensure_caja_open(self.client, monto_inicial=100.00)
        resp = self.client.cerrar_caja(efectivo_contado=100.00, as_user="cajero")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(float(resp.get("diferencia")), 0.00)
        self.assertEqual(resp.get("estadoCuadre"), "Cuadra")
        self.assertIn("Cuadra", resp.get("mensaje"))

    def test_12_monetary_extreme_difference_boundaries(self):
        """
        Arithmetic: Extreme difference boundary:
        - Monto inicial S/ 0.00, Counted S/ 99,999.99 -> Diff = +99,999.99 (Sobrante).
        - Monto inicial S/ 99,999.99, Counted S/ 0.00 -> Diff = -99,999.99 (Faltante).
        """
        # Case A: Expected 0.00, Counted 99999.99
        self.client.abrir_caja(monto_inicial=0.00, as_user="cajero")
        respA = self.client.cerrar_caja(efectivo_contado=99999.99, as_user="cajero")
        self.assertEqual(respA.status_code, 200)
        self.assertEqual(float(respA.get("diferencia")), 99999.99)
        self.assertEqual(respA.get("estadoCuadre"), "Sobrante")

        # Case B: Expected 99999.99, Counted 0.00
        self.client.abrir_caja(monto_inicial=99999.99, as_user="cajero")
        respB = self.client.cerrar_caja(efectivo_contado=0.00, as_user="cajero")
        self.assertEqual(respB.status_code, 200)
        self.assertEqual(float(respB.get("diferencia")), -99999.99)
        self.assertEqual(respB.get("estadoCuadre"), "Faltante")

    # =========================================================================
    # PROBE 3: SARGable SQL Query Performance & History Integrity
    # =========================================================================

    def test_13_history_query_pagination_consistency(self):
        """
        SARGability & Performance: Query history with pagination tamano=5 and tamano=20.
        Total count must remain consistent across page sizes.
        """
        resp20 = self.client.get_cierres(pagina=1, tamano=20, as_user="admin")
        self.assertEqual(resp20.status_code, 200)
        total20 = resp20.get("total")

        resp5 = self.client.get_cierres(pagina=1, tamano=5, as_user="admin")
        self.assertEqual(resp5.status_code, 200)
        total5 = resp5.get("total")

        self.assertEqual(total20, total5)
        self.assertLessEqual(len(resp5.get("items", [])), 5)

    def test_14_history_query_date_filter_boundary_integrity(self):
        """
        SARGability: Verify that date filtering with desde == hasta (same day)
        correctly translates into UTC without off-by-one timezone errors.
        """
        import datetime
        today_iso = datetime.date.today().isoformat()
        resp = self.client.get_cierres(desde=today_iso, hasta=today_iso, as_user="admin")
        self.assertEqual(resp.status_code, 200)
        self.assertIsInstance(resp.get("items"), list)

    # =========================================================================
    # PROBE 4: PDF Generation Stream Safety & Exception Handling
    # =========================================================================

    def test_15_pdf_stream_safety_valid_header_and_single_page(self):
        """
        PDF Safety: Valid closed register generates a conforming 1-page PDF stream.
        Must begin with '%PDF-1.4', contain '/Count 1' in page tree, and end with '%%EOF'.
        """
        ensure_caja_open(self.client, monto_inicial=120.00)
        close_resp = self.client.cerrar_caja(efectivo_contado=120.00, as_user="cajero")
        caja_id = close_resp.get("cajaId")

        pdf_resp = self.client.get_cierre_pdf(caja_id, as_user="cajero")
        self.assertEqual(pdf_resp.status_code, 200)
        self.assertIn("application/pdf", pdf_resp.headers.get("Content-Type", ""))

        pdf_bytes = pdf_resp.data
        self.assertIsInstance(pdf_bytes, bytes)
        self.assertTrue(pdf_bytes.startswith(b"%PDF-1.4"), "PDF stream must start with %PDF-1.4")
        self.assertTrue(b"%%EOF" in pdf_bytes, "PDF stream must contain %%EOF marker")
        self.assertTrue(b"/Count 1" in pdf_bytes, "PDF must strictly specify /Count 1 (single-page voucher, RNF-48)")

    def test_16_pdf_with_special_characters_in_observation(self):
        """
        PDF Safety: Register closed with complex observation (accents, quotation marks,
        parentheses, brackets, colons, emojis) must generate PDF cleanly without stream corruption.
        """
        ensure_caja_open(self.client, monto_inicial=100.00)
        special_obs = "Arqueo: (Cuadre OK) [Fondo $100] \"Turno #1\" - Cajero: José Peña (¡Éxito!)"
        close_resp = self.client.cerrar_caja(
            efectivo_contado=100.00,
            observacion=special_obs,
            as_user="cajero"
        )
        caja_id = close_resp.get("cajaId")

        pdf_resp = self.client.get_cierre_pdf(caja_id, as_user="cajero")
        self.assertEqual(pdf_resp.status_code, 200)
        self.assertTrue(pdf_resp.data.startswith(b"%PDF-1.4"))
        self.assertTrue(b"%%EOF" in pdf_resp.data)

    def test_17_pdf_on_open_register_rejected_with_400(self):
        """
        PDF Exception Handling: Attempting to generate PDF for an OPEN register must fail (400 Bad Request).
        """
        _, caja_id = ensure_caja_open(self.client, monto_inicial=100.00)
        pdf_resp = self.client.get_cierre_pdf(caja_id, as_user="cajero")
        self.assertEqual(pdf_resp.status_code, 400)

    def test_18_pdf_on_nonexistent_register_returns_404(self):
        """
        PDF Exception Handling: Attempting to generate PDF for a non-existent GUID returns 404 Not Found.
        """
        random_id = str(uuid.uuid4())
        pdf_resp = self.client.get_cierre_pdf(random_id, as_user="cajero")
        self.assertEqual(pdf_resp.status_code, 404)

if __name__ == "__main__":
    unittest.main()
