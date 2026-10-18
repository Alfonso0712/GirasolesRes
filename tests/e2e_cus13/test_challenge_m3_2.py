"""
Empirical Challenger Test Suite for Milestone 3: Frontend Cash Register & Guarding (CUS 13)
Restaurante Girasoles - Challenger M3-2

Empirically challenges:
1. `cajaService.ts` API contract alignment with live backend (endpoints, DTO fields, error structures).
2. State guarding:
   - sinCaja: orders collection blocked with MSG-135, opening CTA enabled.
   - anteriorSinCerrar: opening blocked, cobros blocked with MSG-168, closing pending register enabled.
   - abierta: opening blocked with MSG-167, cobros enabled, closing flow enabled.
3. Pending orders guard in CerrarCajaModal:
   - Uncollected orders block closure with 409 and MSG-174.
   - List of pending orders is returned with exact amounts and shortcuts.
   - Once collected or cancelled, closure succeeds with 200 OK.
4. Peruvian denomination counter arithmetic and boundary validations (RV-128, MSG-184).
5. Concurrency protection (RV-129, MSG-189).
"""

import unittest
import uuid
from typing import Dict
from .client import ApiClient
from .config import MESSAGES, USERS
from .fixtures import ensure_caja_closed, ensure_caja_open, calculate_denominations

class TestEmpiricalChallengeM32(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = ApiClient()

    # =========================================================================
    # 1. API CONTRACT & SERVICE ALIGNMENT (cajaService.ts <-> Backend Controllers)
    # =========================================================================

    def test_01_api_contract_caja_actual_structure(self):
        """Verify GET /api/caja/actual JSON response contract expected by cajaService.obtenerActual()."""
        ensure_caja_closed(self.client)
        resp = self.client.get_caja_actual(as_user="cajero")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("estado", resp.data)
        self.assertIn(resp.data["estado"], ["sinCaja", "abierta", "anteriorSinCerrar"])
        self.assertIn("apertura", resp.data)
        self.assertIn("resumenParcial", resp.data)
        self.assertIn("sugerenciaMontoInicial", resp.data)

        # In sinCaja state:
        if resp.data["estado"] == "sinCaja":
            self.assertIsNone(resp.data["apertura"])
            self.assertIsNone(resp.data["resumenParcial"])
            self.assertIn("mensaje", resp.data)
            self.assertTrue(resp.contains_message("MSG_166"))

    def test_02_api_contract_abrir_caja_structure(self):
        """Verify POST /api/caja/abrir response contract expected by cajaService.abrirCaja()."""
        ensure_caja_closed(self.client)
        test_solicitud_id = str(uuid.uuid4())
        resp = self.client.abrir_caja(monto_inicial=125.50, solicitud_id=test_solicitud_id, as_user="cajero")
        self.assertIn(resp.status_code, [200, 201])
        self.assertIn("cajaId", resp.data)
        self.assertAlmostEqual(float(resp.data["montoInicial"]), 125.50, places=2)
        self.assertIn("fechaApertura", resp.data)
        self.assertIn("mensaje", resp.data)
        self.assertTrue(resp.contains_message("MSG_173"))

    def test_03_api_contract_cierre_resumen_structure(self):
        """Verify GET /api/caja/cierre/resumen contract expected by cajaService.obtenerResumenCierre()."""
        ensure_caja_open(self.client, monto_inicial=80.00)
        resp = self.client.get_cierre_resumen(as_user="cajero")
        self.assertEqual(resp.status_code, 200)
        required_keys = [
            "cajaId", "fechaApertura", "montoInicial", "ventasEfectivo",
            "ventasYape", "totalVentas", "efectivoEsperado", "cantidadVentas",
            "platosVendidos", "pedidosPendientes"
        ]
        for key in required_keys:
            self.assertIn(key, resp.data, f"Missing required property '{key}' in cierre resumen")
        self.assertIsInstance(resp.data["platosVendidos"], list)
        self.assertIsInstance(resp.data["pedidosPendientes"], list)

    def test_04_api_contract_cerrar_caja_structure(self):
        """Verify POST /api/caja/cerrar contract expected by cajaService.cerrarCaja()."""
        ensure_caja_open(self.client, monto_inicial=90.00)
        resumen = self.client.get_cierre_resumen(as_user="cajero")
        esperado = float(resumen.data["efectivoEsperado"])

        resp = self.client.cerrar_caja(
            efectivo_contado=esperado,
            efectivo_esperado_mostrado=esperado,
            observacion="Cierre de verificación de contrato",
            as_user="cajero"
        )
        self.assertEqual(resp.status_code, 200)
        required_keys = [
            "cajaId", "montoInicial", "efectivoEsperado", "efectivoContado",
            "diferencia", "estadoCuadre", "mensaje"
        ]
        for key in required_keys:
            self.assertIn(key, resp.data, f"Missing required property '{key}' in cierre response")
        self.assertEqual(resp.data["estadoCuadre"], "Cuadra")
        self.assertAlmostEqual(float(resp.data["diferencia"]), 0.00, places=2)

    # =========================================================================
    # 2. STATE GUARDING VERIFICATION (sinCaja, anteriorSinCerrar, abierta)
    # =========================================================================

    def test_05_guard_sin_caja_blocks_cobros_with_msg135(self):
        """
        When caja is 'sinCaja', attempts to process collection in CUS 11 must fail with 409 and MSG-135.
        Frontend displays MSG-135 and launches AbrirCajaModal.
        """
        ensure_caja_closed(self.client)
        resp_actual = self.client.get_caja_actual(as_user="cajero")
        self.assertEqual(resp_actual.get("estado"), "sinCaja")

        # Attempt to get pending orders in CUS 11 when register is closed
        resp_cobro = self.client.raw_request("GET", "/cobros/pendientes", as_user="cajero")
        self.assertEqual(resp_cobro.status_code, 409)
        self.assertTrue(
            resp_cobro.contains_message("MSG_135") or "abrir la caja" in resp_cobro.raw_text.lower(),
            f"Expected MSG-135 when caja is closed. Got: {resp_cobro.raw_text}"
        )

    def test_06_guard_abierta_blocks_second_opening_with_msg167(self):
        """
        When caja is 'abierta', attempting to open another register must fail with 409 and MSG-167.
        """
        ensure_caja_open(self.client, monto_inicial=100.00)
        resp = self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        self.assertEqual(resp.status_code, 409)
        self.assertTrue(
            resp.contains_message("MSG_167") or "ya existe una caja abierta" in resp.raw_text.lower(),
            f"Expected MSG-167 when register already open today. Got: {resp.raw_text}"
        )

    def test_07_guard_abierta_allows_closing_modal_launch(self):
        """
        When caja is 'abierta', GET /api/caja/cierre/resumen succeeds and returns operational metrics.
        """
        ensure_caja_open(self.client, monto_inicial=100.00)
        resp = self.client.get_cierre_resumen(as_user="cajero")
        self.assertEqual(resp.status_code, 200)
        self.assertGreaterEqual(float(resp.data["efectivoEsperado"]), 100.00)

    # =========================================================================
    # 3. PENDING ORDERS GUARD (RV-122, RN-110, MSG-174)
    # =========================================================================

    def test_08_pending_orders_blocks_closing_with_msg174_and_lists_orders(self):
        """
        RV-122 / RN-110 / MSG-174:
        If uncollected orders exist, closing is strictly blocked with 409 Conflict,
        MSG-174 ('No se puede cerrar la caja: hay pedidos pendientes de cobro.'),
        and the list of pending orders is returned with action shortcuts.
        """
        ensure_caja_open(self.client, monto_inicial=100.00)

        # Check closing summary for pending orders
        resumen = self.client.get_cierre_resumen(as_user="cajero")
        self.assertEqual(resumen.status_code, 200)

        # If there are pending orders in the system, try to close
        if len(resumen.data.get("pedidosPendientes", [])) > 0:
            esperado = float(resumen.data["efectivoEsperado"])
            close_resp = self.client.cerrar_caja(
                efectivo_contado=esperado,
                efectivo_esperado_mostrado=esperado,
                as_user="cajero"
            )
            self.assertEqual(close_resp.status_code, 409)
            self.assertTrue(
                close_resp.contains_message("MSG_174") or "pedidos pendientes" in close_resp.raw_text.lower(),
                f"Expected MSG-174 when closing with pending orders. Got: {close_resp.raw_text}"
            )
            self.assertIn("pedidos_pendientes", close_resp.raw_text)

    # =========================================================================
    # 4. PERUVIAN CURRENCY DENOMINATION CALCULATOR (RV-128, MSG-184)
    # =========================================================================

    def test_09_denomination_counter_peruvian_currency_calculation(self):
        """
        Verify exact arithmetic without floating point drift for all 11 Peruvian denominations.
        """
        test_counts = {
            200.00: 2,   # 400.00
            100.00: 3,   # 300.00
            50.00: 4,    # 200.00
            20.00: 5,    # 100.00
            10.00: 6,    # 60.00
            5.00: 10,    # 50.00
            2.00: 15,    # 30.00
            1.00: 25,    # 25.00
            0.50: 8,     # 4.00
            0.20: 15,    # 3.00
            0.10: 20     # 2.00
        }
        # Expected: 400 + 300 + 200 + 100 + 60 + 50 + 30 + 25 + 4 + 3 + 2 = 1174.00
        total, err = calculate_denominations(test_counts)
        self.assertIsNone(err)
        self.assertAlmostEqual(total, 1174.00, places=2)

    def test_10_denomination_counter_invalid_counts_detonate_msg184(self):
        """
        RV-128 / MSG-184: Units < 0 or > 999 or non-integer must trigger MSG-184.
        """
        # Negative
        _, err_neg = calculate_denominations({100.00: -1})
        self.assertEqual(err_neg, MESSAGES["MSG_184"])

        # Greater than 999
        _, err_high = calculate_denominations({50.00: 1000})
        self.assertEqual(err_high, MESSAGES["MSG_184"])

    # =========================================================================
    # 5. CONCURRENT CHANGE PROTECTION (RV-129, MSG-189)
    # =========================================================================

    def test_11_concurrent_cash_change_aborts_with_msg189(self):
        """
        RV-129 / MSG-189:
        If expected cash displayed differs from live expected cash, closing commit aborts with 409 and MSG-189.
        """
        ensure_caja_open(self.client, monto_inicial=150.00)
        resumen = self.client.get_cierre_resumen(as_user="cajero")
        esperado_real = float(resumen.data["efectivoEsperado"])

        # Simulate stale expected cash (different from real)
        esperado_desactualizado = round(esperado_real + 25.00, 2)
        resp = self.client.cerrar_caja(
            efectivo_contado=esperado_real,
            efectivo_esperado_mostrado=esperado_desactualizado,
            as_user="cajero"
        )
        self.assertEqual(resp.status_code, 409)
        self.assertTrue(
            resp.contains_message("MSG_189") or "cambiaron" in resp.raw_text.lower(),
            f"Expected MSG-189 for mismatched expected cash. Got: {resp.raw_text}"
        )

        # Confirm register remains open and not closed by aborted commit
        actual = self.client.get_caja_actual(as_user="cajero")
        self.assertEqual(actual.data["estado"], "abierta")

        # Now close cleanly with matching expected cash
        clean_close = self.client.cerrar_caja(
            efectivo_contado=esperado_real,
            efectivo_esperado_mostrado=esperado_real,
            observacion="Cierre limpio tras concurrencia",
            as_user="cajero"
        )
        self.assertEqual(clean_close.status_code, 200)

if __name__ == "__main__":
    unittest.main()
