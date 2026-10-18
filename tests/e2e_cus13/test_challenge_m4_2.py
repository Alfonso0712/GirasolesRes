"""
Empirical Challenger Test Suite for Milestone 4: Frontend Closings History, Role Authorization & Detail Modal (CUS 13)
Restaurante Girasoles - Challenger M4-2

Empirically challenges:
1. Role-Based Access Control (RN-106, E-319):
   - Cajero, Mozo, Cocinero strictly prohibited with 403 Forbidden on GET /api/caja/cierres and GET /api/caja/cierres/{id}.
   - Administrador authorized with 200 OK.
2. PDF Action Authorization and State Guarding:
   - PDF download enabled for Administrador and Cajero on closed registers (RNF-48).
   - PDF download strictly prohibited with 403 Forbidden for Mozo and Cocinero.
   - PDF download rejected with 400 Bad Request on open registers ("Solo se puede generar el comprobante de una caja debidamente cerrada.").
3. Detail Modal Data Contract (Vista 13.4, E-317):
   - All 8 financial metrics present and mathematically consistent.
   - Dishes and drinks breakdown structure.
   - Subsequent void adjustments audit list (RN-113).
4. Date Range Filtering Validation (RV-130, MSG-188):
   - Future dates and desde > hasta rejected with 400 and exact MSG-188.
5. Open Register Pinning (RV-130, E-320):
   - Open register appears at top of closing history list labeled "Abierta" without premature closing amounts.
"""

import unittest
import uuid
from .client import ApiClient
from .fixtures import ensure_caja_open, ensure_caja_closed

class TestEmpiricalChallengeM42(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = ApiClient()

    # =========================================================================
    # 1. ROLE-BASED ACCESS CONTROL (RN-106, E-319)
    # =========================================================================

    def test_01_role_isolation_historial_cierres_endpoints_403(self):
        """
        [RN-106 / E-319] Only Administrador can access cash closing history.
        Cajero, Mozo, and Cocinero must receive 403 Forbidden and MSG-39.
        """
        for role in ["cajero", "mozo", "cocinero"]:
            resp = self.client.get_cierres(as_user=role)
            self.assertEqual(
                resp.status_code, 403,
                f"Expected 403 Forbidden on GET /api/caja/cierres for role '{role}', got {resp.status_code}"
            )
            self.assertTrue(
                resp.contains_message("MSG_39") or "permiso" in resp.raw_text.lower(),
                f"Expected MSG-39 in 403 response for role '{role}'. Body: {resp.raw_text}"
            )

        # Administrador must succeed with 200 OK
        resp_admin = self.client.get_cierres(as_user="admin")
        self.assertEqual(resp_admin.status_code, 200)
        self.assertIn("items", resp_admin.data)
        self.assertIn("total", resp_admin.data)

    def test_02_role_isolation_cierre_detalle_endpoint_403(self):
        """
        [RN-106 / E-319] Only Administrador can access cash closing detail modal endpoint.
        Cajero, Mozo, and Cocinero must receive 403 Forbidden.
        """
        # Obtain a valid closing ID
        history = self.client.get_cierres(as_user="admin")
        items = history.data.get("items", [])
        self.assertGreater(len(items), 0, "Precondition failed: At least 1 closure must exist in DB")
        caja_id = items[0]["cajaId"]

        for role in ["cajero", "mozo", "cocinero"]:
            resp = self.client.get_cierre_detalle(caja_id, as_user=role)
            self.assertEqual(
                resp.status_code, 403,
                f"Expected 403 Forbidden on GET /api/caja/cierres/{caja_id} for role '{role}', got {resp.status_code}"
            )
            self.assertTrue(
                resp.contains_message("MSG_39") or "permiso" in resp.raw_text.lower(),
                f"Expected MSG-39 in 403 response for role '{role}'. Body: {resp.raw_text}"
            )

        # Administrador must succeed with 200 OK
        resp_admin = self.client.get_cierre_detalle(caja_id, as_user="admin")
        self.assertEqual(resp_admin.status_code, 200)
        self.assertEqual(resp_admin.data.get("cajaId"), caja_id)

    # =========================================================================
    # 2. PDF ACTION AUTHORIZATION AND STATE GUARDING (RNF-48, Vista 13.4)
    # =========================================================================

    def test_03_role_isolation_pdf_endpoint(self):
        """
        [RNF-48] Single-page closing PDF can be downloaded by Administrador or Cajero.
        Mozo and Cocinero must receive 403 Forbidden.
        """
        # Find a closed register ID
        history = self.client.get_cierres(as_user="admin")
        closed_items = [i for i in history.data.get("items", []) if i.get("estado", "").lower() == "cerrada"]
        self.assertGreater(len(closed_items), 0, "Precondition failed: At least 1 closed register must exist in DB")
        closed_id = closed_items[0]["cajaId"]

        # Admin: 200 OK + PDF stream
        pdf_admin = self.client.get_cierre_pdf(closed_id, as_user="admin")
        self.assertEqual(pdf_admin.status_code, 200)
        self.assertIn("application/pdf", pdf_admin.headers.get("Content-Type", ""))
        self.assertTrue(pdf_admin.data.startswith(b"%PDF"), "Response stream must begin with PDF magic bytes %PDF")

        # Cajero: 200 OK + PDF stream
        pdf_cajero = self.client.get_cierre_pdf(closed_id, as_user="cajero")
        self.assertEqual(pdf_cajero.status_code, 200)
        self.assertIn("application/pdf", pdf_cajero.headers.get("Content-Type", ""))
        self.assertTrue(pdf_cajero.data.startswith(b"%PDF"))

        # Mozo: 403 Forbidden
        pdf_mozo = self.client.get_cierre_pdf(closed_id, as_user="mozo")
        self.assertEqual(pdf_mozo.status_code, 403)

        # Cocinero: 403 Forbidden
        pdf_cocinero = self.client.get_cierre_pdf(closed_id, as_user="cocinero")
        self.assertEqual(pdf_cocinero.status_code, 403)

    def test_04_pdf_blocked_on_open_register_with_400(self):
        """
        Attempting to generate or download closing PDF for an open cash register
        must be rejected with 400 Bad Request and descriptive message.
        """
        ensure_caja_open(self.client, monto_inicial=120.00)
        actual = self.client.get_caja_actual(as_user="cajero")
        open_caja_id = actual.data["apertura"]["cajaId"]

        resp_pdf = self.client.get_cierre_pdf(open_caja_id, as_user="admin")
        self.assertEqual(resp_pdf.status_code, 400)
        self.assertTrue(
            "cerrada" in resp_pdf.raw_text.lower(),
            f"Expected error message indicating register must be closed. Got: {resp_pdf.raw_text}"
        )

        ensure_caja_closed(self.client)

    # =========================================================================
    # 3. DETAIL MODAL DATA CONTRACT & 8 METRICS (Vista 13.4, RN-113)
    # =========================================================================

    def test_05_cierre_detalle_payload_8_metrics_and_dishes(self):
        """
        [Vista 13.4 / E-317] Verify complete 8-metric financial breakdown, dishes, and adjustments list.
        """
        history = self.client.get_cierres(as_user="admin")
        closed_items = [i for i in history.data.get("items", []) if i.get("estado", "").lower() == "cerrada"]
        self.assertGreater(len(closed_items), 0)
        caja_id = closed_items[0]["cajaId"]

        resp = self.client.get_cierre_detalle(caja_id, as_user="admin")
        self.assertEqual(resp.status_code, 200)
        data = resp.data

        # 8 key metrics check
        metric_keys = [
            "montoInicial",        # Metric 1
            "ventasEfectivo",      # Metric 2
            "ventasYape",          # Metric 3
            "totalVentas",         # Metric 4
            "efectivoEsperado",    # Metric 5
            "efectivoContado",     # Metric 6
            "diferencia",          # Metric 7
            "estadoCuadre"         # Metric 8
        ]
        for k in metric_keys:
            self.assertIn(k, data, f"Missing metric '{k}' in closing detail response")

        # Mathematical integrity:
        monto_ini = float(data["montoInicial"])
        v_efectivo = float(data["ventasEfectivo"])
        v_yape = float(data["ventasYape"])
        total_v = float(data["totalVentas"])
        ef_esperado = float(data["efectivoEsperado"])
        ef_contado = float(data["efectivoContado"])
        diferencia = float(data["diferencia"])

        self.assertAlmostEqual(total_v, v_efectivo + v_yape, places=2)
        self.assertAlmostEqual(ef_esperado, monto_ini + v_efectivo, places=2)
        self.assertAlmostEqual(diferencia, ef_contado - ef_esperado, places=2)

        # Consolidado de platos y ajustes posteriores
        self.assertIn("platosVendidos", data)
        self.assertIsInstance(data["platosVendidos"], list)
        self.assertIn("ajustesPosteriores", data)
        self.assertIsInstance(data["ajustesPosteriores"], list)

    # =========================================================================
    # 4. DATE RANGE FILTERING (RV-130, MSG-188)
    # =========================================================================

    def test_06_date_range_validation_msg188(self):
        """
        [RV-130 / MSG-188] Date filters rejecting desde > hasta and future dates.
        """
        # Future date
        resp_futura = self.client.get_cierres(desde="2099-01-01", as_user="admin")
        self.assertEqual(resp_futura.status_code, 400)
        self.assertTrue(
            resp_futura.contains_message("MSG_188") or "futuras" in resp_futura.raw_text.lower(),
            f"Expected MSG-188 for future date. Got: {resp_futura.raw_text}"
        )

        # Inverted range
        resp_invertida = self.client.get_cierres(desde="2026-10-18", hasta="2026-10-01", as_user="admin")
        self.assertEqual(resp_invertida.status_code, 400)
        self.assertTrue(
            resp_invertida.contains_message("MSG_188") or "posterior" in resp_invertida.raw_text.lower(),
            f"Expected MSG-188 for inverted date range. Got: {resp_invertida.raw_text}"
        )

    # =========================================================================
    # 5. OPEN REGISTER PINNING (RV-130, E-320)
    # =========================================================================

    def test_07_open_register_pinned_at_top_labeled_abierta(self):
        """
        [RV-130 / E-320] If a register is currently open, it is pinned as the very first row
        in the history list labeled 'Abierta' with null closing amounts.
        """
        ensure_caja_open(self.client, monto_inicial=115.00)
        history = self.client.get_cierres(as_user="admin")
        self.assertEqual(history.status_code, 200)
        items = history.data.get("items", [])
        self.assertGreater(len(items), 0)

        top_item = items[0]
        self.assertEqual(top_item.get("estado", "").lower(), "abierta")
        self.assertIsNone(top_item.get("fechaCierre"))
        self.assertIsNone(top_item.get("efectivoContado"))

        ensure_caja_closed(self.client)

if __name__ == "__main__":
    unittest.main()
