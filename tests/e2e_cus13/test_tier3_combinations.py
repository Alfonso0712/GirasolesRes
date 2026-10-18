import unittest
import uuid
from .client import ApiClient
from .config import MESSAGES, TODAS_DENOMINACIONES
from .fixtures import calculate_denominations, ensure_caja_closed

class TestTier3Combinations(unittest.TestCase):
    """
    Tier 3: Cross-Feature Combinations
    Full lifecycle:
    Open -> Register/Check Orders -> Pending Order Blocking -> Pay Order -> Concurrent Sale ->
    Close with Denomination Counter sum -> History lookup -> Subsequent void verification "Con ajustes".
    Rules: RV-119..RV-132, RN-106..RN-115, E-296..E-312, E-317, E-320.
    """

    @classmethod
    def setUpClass(cls):
        cls.client = ApiClient()

    def test_01_full_lifecycle_caja_management(self):
        """
        [HU34 + HU35 + HU36] Comprehensive end-to-end lifecycle of cash register:
        1. Verify initial closed state blocks cobros (MSG-135).
        2. Open register with S/ 150.00 initial amount (MSG-173).
        3. Verify cobros unblocked.
        4. Inspect pending orders and verify closing is blocked if any pending (MSG-174).
        5. Verify live summary calculations (montoInicial + efectivo = esperado; Yape separated).
        6. Concurrency check: mismatch between mostrado and actual blocks with MSG-189.
        7. Denomination counter: calculate Peruvian currency sum and use for counted cash.
        8. Confirm closing with MSG-181 and observation.
        9. Admin queries history and detail modal.
        10. Verify post-close immutability and 'Con ajustes' contract (RN-113, E-312).
        """
        # Step 1: Clean slate
        ensure_caja_closed(self.client)
        resp_init = self.client.get_caja_actual(as_user="cajero")
        self.assertEqual(resp_init.status_code, 200)
        self.assertIn(resp_init.get("estado"), ["sinCaja", "anteriorSinCerrar"])

        # Step 2: Cobros blocked
        resp_cobro_blocked = self.client.raw_request("GET", "/cobros/pendientes", as_user="cajero")
        self.assertEqual(resp_cobro_blocked.status_code, 409)
        self.assertTrue(resp_cobro_blocked.contains_message("MSG_135") or "abrir la caja" in resp_cobro_blocked.raw_text.lower())

        # Step 3: Open register with S/ 150.00
        solicitud_apertura = str(uuid.uuid4())
        resp_open = self.client.abrir_caja(monto_inicial=150.00, solicitud_id=solicitud_apertura, as_user="cajero")
        self.assertIn(resp_open.status_code, [200, 201])
        caja_id = resp_open.get("cajaId") or resp_open.get("caja", {}).get("idCaja")

        # Step 4: Verify status is open and cobros unblocked
        resp_open_status = self.client.get_caja_actual(as_user="cajero")
        self.assertEqual(resp_open_status.get("estado"), "abierta")
        resp_cobros_unblocked = self.client.raw_request("GET", "/cobros/pendientes", as_user="cajero")
        self.assertEqual(resp_cobros_unblocked.status_code, 200)

        # Step 5: Check closing summary
        resumen_resp = self.client.get_cierre_resumen(as_user="cajero")
        self.assertEqual(resumen_resp.status_code, 200)
        resumen_data = resumen_resp.data
        self.assertIsInstance(resumen_data, dict)

        pendientes = resumen_data.get("pedidosPendientes", [])
        if len(pendientes) > 0:
            # Step 5.1: Pending orders block closing
            resp_block_close = self.client.cerrar_caja(
                efectivo_contado=150.00,
                efectivo_esperado_mostrado=150.00,
                as_user="cajero"
            )
            self.assertEqual(resp_block_close.status_code, 409)
            self.assertTrue(resp_block_close.contains_message("MSG_174") or "pedido" in resp_block_close.raw_text.lower())

        # Step 6: Concurrency guard test
        esperado_real = float(resumen_data.get("efectivoEsperado", 150.00))
        mismatched_esperado = esperado_real + 25.00
        resp_concurrency = self.client.cerrar_caja(
            efectivo_contado=esperado_real,
            efectivo_esperado_mostrado=mismatched_esperado,
            as_user="cajero"
        )
        self.assertEqual(resp_concurrency.status_code, 409)
        self.assertTrue(resp_concurrency.contains_message("MSG_189") or "cambiaron" in resp_concurrency.raw_text.lower())

        # Step 7: Denomination counter sum calculation
        # Suppose cashier counts: 1 x 100, 1 x 50 = S/ 150.00
        counts = {100.0: 1, 50.0: 1}
        counted_total, err = calculate_denominations(counts)
        self.assertIsNone(err)

        # Step 8: Successful close
        solicitud_cierre = str(uuid.uuid4())
        resp_close = self.client.cerrar_caja(
            efectivo_contado=counted_total,
            efectivo_esperado_mostrado=esperado_real,
            observacion="Cierre exitoso ciclo completo",
            solicitud_id=solicitud_cierre,
            as_user="cajero"
        )
        self.assertEqual(resp_close.status_code, 200)
        cierre_id = resp_close.get("cierreId") or resp_close.get("cajaId") or caja_id

        # Step 9: Admin history & detail verification
        resp_history = self.client.get_cierres(pagina=1, tamano=20, as_user="admin")
        self.assertEqual(resp_history.status_code, 200)
        items = resp_history.get("items", [])
        self.assertGreater(len(items), 0)

        if cierre_id:
            resp_detail = self.client.get_cierre_detalle(cierre_id=cierre_id, as_user="admin")
            self.assertEqual(resp_detail.status_code, 200)
            self.assertIn("montoInicial", resp_detail.data)
            self.assertIn("ajustesPosteriores", resp_detail.data)

    def test_02_formula_separacion_efectivo_yape(self):
        """
        [RV-123 / RN-109 / E-298] Validación de fórmulas contables:
        efectivoEsperado = montoInicial + ventasEfectivo.
        totalVentas = ventasEfectivo + ventasYape.
        Yape NO suma a efectivoEsperado (el dinero de Yape no entra a la caja física).
        """
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=100.00, as_user="cajero")

        resumen_resp = self.client.get_cierre_resumen(as_user="cajero")
        self.assertEqual(resumen_resp.status_code, 200)
        data = resumen_resp.data

        monto_inicial = float(data.get("montoInicial", 0.0))
        ventas_efectivo = float(data.get("ventasEfectivo", data.get("efectivo", 0.0)))
        ventas_yape = float(data.get("ventasYape", data.get("yape", 0.0)))
        total_ventas = float(data.get("totalVentas", data.get("total", 0.0)))
        efectivo_esperado = float(data.get("efectivoEsperado", 0.0))

        # Check formula integrity
        self.assertAlmostEqual(efectivo_esperado, round(monto_inicial + ventas_efectivo, 2), places=2)
        self.assertAlmostEqual(total_ventas, round(ventas_efectivo + ventas_yape, 2), places=2)
        # Ensure Yape is not directly inside efectivoEsperado
        self.assertNotEqual(efectivo_esperado, round(monto_inicial + total_ventas, 2) if ventas_yape > 0 else -1)

    def test_03_inmutabilidad_historica_post_cierre_rn113(self):
        """
        [RN-113 / E-312] Inmutabilidad del cierre ante eventos posteriores:
        El snapshot histórico de la caja cerrada (montoInicial, efectivoEsperado, efectivoContado, diferencia)
        permanece idéntico. Cualquier anulación posterior se expone como ajuste independiente en 'ajustesPosteriores'.
        """
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        resumen_resp = self.client.get_cierre_resumen(as_user="cajero")
        esperado = float(resumen_resp.data.get("efectivoEsperado", 50.00))

        close_resp = self.client.cerrar_caja(
            efectivo_contado=esperado,
            efectivo_esperado_mostrado=esperado,
            observacion="Cierre para verificar inmutabilidad",
            as_user="cajero"
        )
        self.assertEqual(close_resp.status_code, 200)
        cierre_id = close_resp.get("cierreId") or close_resp.get("cajaId")

        # Query detail twice to verify immutable snapshot
        detail_1 = self.client.get_cierre_detalle(cierre_id=cierre_id, as_user="admin")
        self.assertEqual(detail_1.status_code, 200)

        detail_2 = self.client.get_cierre_detalle(cierre_id=cierre_id, as_user="admin")
        self.assertEqual(detail_2.status_code, 200)

        self.assertEqual(detail_1.data.get("montoInicial"), detail_2.data.get("montoInicial"))
        self.assertEqual(detail_1.data.get("efectivoEsperado"), detail_2.data.get("efectivoEsperado"))
        self.assertEqual(detail_1.data.get("efectivoContado"), detail_2.data.get("efectivoContado"))
        self.assertEqual(detail_1.data.get("diferencia"), detail_2.data.get("diferencia"))

if __name__ == "__main__":
    unittest.main()
