"""
Empirical Challenger Test Suite for CUS 13: Gestión de Caja
Milestone M2-1: API Boundaries & Core Features Challenger

Validates all 5 dimensions requested by orchestrator:
1. Boundary conditions on opening & closing amounts (S/ 0.00, S/ 99,999.99, S/ 100,000.00, negative, >2 decimals)
2. Observation length boundaries (0 chars, 200 chars, 201 chars, special chars)
3. Concurrent expected cash change (RV-129, MSG-189)
4. Date range validation: desde > hasta or future dates (RV-130, MSG-188)
5. Role-based access control (403 for Cajero, Mozo, Cocinero accessing history and unauthorized endpoints)
"""

import unittest
import uuid
from datetime import datetime, timedelta
from .client import ApiClient
from .config import MESSAGES, USERS
from .fixtures import ensure_caja_closed, ensure_caja_open

class TestEmpiricalChallengeM21(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = ApiClient()

    # =========================================================================
    # DIMENSION 1: Opening & Closing Amount Boundaries
    # =========================================================================

    def test_dim1_01_open_zero_soles(self):
        """[RV-120] Monto inicial S/ 0.00 es el límite inferior permitido."""
        ensure_caja_closed(self.client)
        resp = self.client.abrir_caja(monto_inicial=0.00, as_user="cajero")
        self.assertIn(resp.status_code, [200, 201], f"Expected 200/201 for S/ 0.00. Got: {resp.status_code}")
        self.assertAlmostEqual(float(resp.get("montoInicial", -1)), 0.00, places=2)

    def test_dim1_02_open_min_positive_soles(self):
        """[RV-120] Monto inicial S/ 0.01 (mínimo positivo) es válido."""
        ensure_caja_closed(self.client)
        resp = self.client.abrir_caja(monto_inicial=0.01, as_user="cajero")
        self.assertIn(resp.status_code, [200, 201], f"Expected 200/201 for S/ 0.01. Got: {resp.status_code}")
        self.assertAlmostEqual(float(resp.get("montoInicial", -1)), 0.01, places=2)

    def test_dim1_03_open_max_soles(self):
        """[RV-120] Monto inicial S/ 99,999.99 es el límite superior permitido."""
        ensure_caja_closed(self.client)
        resp = self.client.abrir_caja(monto_inicial=99999.99, as_user="cajero")
        self.assertIn(resp.status_code, [200, 201], f"Expected 200/201 for S/ 99,999.99. Got: {resp.status_code}")
        self.assertAlmostEqual(float(resp.get("montoInicial", -1)), 99999.99, places=2)

    def test_dim1_04_open_near_max_soles(self):
        """[RV-120] Monto inicial S/ 99,999.98 es válido."""
        ensure_caja_closed(self.client)
        resp = self.client.abrir_caja(monto_inicial=99999.98, as_user="cajero")
        self.assertIn(resp.status_code, [200, 201], f"Expected 200/201 for S/ 99,999.98. Got: {resp.status_code}")

    def test_dim1_05_open_exceed_max_exact_100k(self):
        """[RV-120 / MSG-171] Monto inicial S/ 100,000.00 supera límite superior y se rechaza con 400 y MSG-171."""
        ensure_caja_closed(self.client)
        resp = self.client.abrir_caja(monto_inicial=100000.00, as_user="cajero")
        self.assertEqual(resp.status_code, 400)
        self.assertTrue(resp.contains_message("MSG_171") or "99,999.99" in resp.raw_text)

    def test_dim1_06_open_exceed_max_100k_and_one_cent(self):
        """[RV-120 / MSG-171] Monto inicial S/ 100,000.01 supera límite superior."""
        ensure_caja_closed(self.client)
        resp = self.client.abrir_caja(monto_inicial=100000.01, as_user="cajero")
        self.assertEqual(resp.status_code, 400)
        self.assertTrue(resp.contains_message("MSG_171") or "99,999.99" in resp.raw_text)

    def test_dim1_07_open_negative_one_cent(self):
        """[RV-120 / MSG-170] Monto inicial -S/ 0.01 se rechaza con 400 y MSG-170."""
        ensure_caja_closed(self.client)
        resp = self.client.abrir_caja(monto_inicial=-0.01, as_user="cajero")
        self.assertEqual(resp.status_code, 400)
        self.assertTrue(resp.contains_message("MSG_170") or "válido" in resp.raw_text.lower())

    def test_dim1_08_open_negative_large(self):
        """[RV-120 / MSG-170] Monto inicial -S/ 500.00 se rechaza con 400 y MSG-170."""
        ensure_caja_closed(self.client)
        resp = self.client.abrir_caja(monto_inicial=-500.00, as_user="cajero")
        self.assertEqual(resp.status_code, 400)
        self.assertTrue(resp.contains_message("MSG_170") or "válido" in resp.raw_text.lower())

    def test_dim1_09_open_three_decimals(self):
        """[RV-120 / MSG-170] Monto inicial con 3 decimales (50.125) se rechaza con 400 y MSG-170."""
        ensure_caja_closed(self.client)
        resp = self.client.abrir_caja(monto_inicial=50.125, as_user="cajero")
        self.assertEqual(resp.status_code, 400)
        self.assertTrue(resp.contains_message("MSG_170") or "decimal" in resp.raw_text.lower())

    def test_dim1_10_open_three_decimals_small(self):
        """[RV-120 / MSG-170] Monto inicial con 3 decimales (0.001) se rechaza con 400 y MSG-170."""
        ensure_caja_closed(self.client)
        resp = self.client.abrir_caja(monto_inicial=0.001, as_user="cajero")
        self.assertEqual(resp.status_code, 400)
        self.assertTrue(resp.contains_message("MSG_170") or "decimal" in resp.raw_text.lower())

    def test_dim1_11_close_zero_soles(self):
        """[RV-124] Efectivo contado S/ 0.00 es válido al cierre (ej. robo o faltante total)."""
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        resp = self.client.cerrar_caja(efectivo_contado=0.00, efectivo_esperado_mostrado=50.00, as_user="cajero")
        self.assertEqual(resp.status_code, 200)
        self.assertAlmostEqual(float(resp.get("diferencia", 0.0)), -50.00, places=2)

    def test_dim1_12_close_min_positive_soles(self):
        """[RV-124] Efectivo contado S/ 0.01 es válido."""
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        resp = self.client.cerrar_caja(efectivo_contado=0.01, efectivo_esperado_mostrado=50.00, as_user="cajero")
        self.assertEqual(resp.status_code, 200)
        self.assertAlmostEqual(float(resp.get("efectivoContado", 0.0)), 0.01, places=2)

    def test_dim1_13_close_max_soles(self):
        """[RV-124] Efectivo contado S/ 99,999.99 es el límite superior permitido."""
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        resp = self.client.cerrar_caja(efectivo_contado=99999.99, efectivo_esperado_mostrado=50.00, as_user="cajero")
        self.assertEqual(resp.status_code, 200)
        self.assertAlmostEqual(float(resp.get("efectivoContado", 0.0)), 99999.99, places=2)

    def test_dim1_14_close_exceed_max_exact_100k(self):
        """[RV-124 / MSG-171] Efectivo contado S/ 100,000.00 se rechaza con 400 y MSG-171."""
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        resp = self.client.cerrar_caja(efectivo_contado=100000.00, efectivo_esperado_mostrado=50.00, as_user="cajero")
        self.assertEqual(resp.status_code, 400)
        self.assertTrue(resp.contains_message("MSG_171") or "99,999.99" in resp.raw_text)

    def test_dim1_15_close_negative_one_cent(self):
        """[RV-124 / MSG-170] Efectivo contado negativo -S/ 0.01 se rechaza con 400 y MSG-170."""
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        resp = self.client.cerrar_caja(efectivo_contado=-0.01, efectivo_esperado_mostrado=50.00, as_user="cajero")
        self.assertEqual(resp.status_code, 400)
        self.assertTrue(resp.contains_message("MSG_170") or "válido" in resp.raw_text.lower())

    def test_dim1_16_close_negative_large(self):
        """[RV-124 / MSG-170] Efectivo contado negativo -S/ 50.00 se rechaza con 400 y MSG-170."""
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        resp = self.client.cerrar_caja(efectivo_contado=-50.00, efectivo_esperado_mostrado=50.00, as_user="cajero")
        self.assertEqual(resp.status_code, 400)
        self.assertTrue(resp.contains_message("MSG_170") or "válido" in resp.raw_text.lower())

    def test_dim1_17_close_three_decimals(self):
        """[RV-124 / MSG-170] Efectivo contado con 3 decimales (50.125) se rechaza con 400 y MSG-170."""
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        resp = self.client.cerrar_caja(efectivo_contado=50.125, efectivo_esperado_mostrado=50.00, as_user="cajero")
        self.assertEqual(resp.status_code, 400)
        self.assertTrue(resp.contains_message("MSG_170") or "decimal" in resp.raw_text.lower())

    def test_dim1_18_close_three_decimals_small(self):
        """[RV-124 / MSG-170] Efectivo contado con 3 decimales (0.005) se rechaza con 400 y MSG-170."""
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        resp = self.client.cerrar_caja(efectivo_contado=0.005, efectivo_esperado_mostrado=50.00, as_user="cajero")
        self.assertEqual(resp.status_code, 400)
        self.assertTrue(resp.contains_message("MSG_170") or "decimal" in resp.raw_text.lower())

    # =========================================================================
    # DIMENSION 2: Observation Length Boundaries
    # =========================================================================

    def test_dim2_01_obs_empty_string(self):
        """[RV-126] Observación vacía ('') es opcional y se procesa correctamente."""
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        resp = self.client.cerrar_caja(
            efectivo_contado=50.00,
            efectivo_esperado_mostrado=50.00,
            observacion="",
            as_user="cajero"
        )
        self.assertEqual(resp.status_code, 200)

    def test_dim2_02_obs_none(self):
        """[RV-126] Observación null se acepta normalmente."""
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        resp = self.client.cerrar_caja(
            efectivo_contado=50.00,
            efectivo_esperado_mostrado=50.00,
            observacion=None,
            as_user="cajero"
        )
        self.assertEqual(resp.status_code, 200)

    def test_dim2_03_obs_whitespace_only(self):
        """[RV-126] Observación con solo espacios se acepta como vacía."""
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        resp = self.client.cerrar_caja(
            efectivo_contado=50.00,
            efectivo_esperado_mostrado=50.00,
            observacion="     ",
            as_user="cajero"
        )
        self.assertEqual(resp.status_code, 200)

    def test_dim2_04_obs_exact_200_chars(self):
        """[RV-126] Observación de exactamente 200 caracteres se acepta y almacena."""
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        obs_200 = "Z" * 200
        resp = self.client.cerrar_caja(
            efectivo_contado=50.00,
            efectivo_esperado_mostrado=50.00,
            observacion=obs_200,
            as_user="cajero"
        )
        self.assertEqual(resp.status_code, 200)

    def test_dim2_05_obs_exact_201_chars(self):
        """[RV-126 / MSG-179] Observación de 201 caracteres se rechaza con 400 y MSG-179."""
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        obs_201 = "Z" * 201
        resp = self.client.cerrar_caja(
            efectivo_contado=50.00,
            efectivo_esperado_mostrado=50.00,
            observacion=obs_201,
            as_user="cajero"
        )
        self.assertEqual(resp.status_code, 400)
        self.assertTrue(resp.contains_message("MSG_179") or "200" in resp.raw_text)

    def test_dim2_06_obs_exceed_length_500(self):
        """[RV-126 / MSG-179] Observación de 500 caracteres se rechaza con 400 y MSG-179."""
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        obs_500 = "B" * 500
        resp = self.client.cerrar_caja(
            efectivo_contado=50.00,
            efectivo_esperado_mostrado=50.00,
            observacion=obs_500,
            as_user="cajero"
        )
        self.assertEqual(resp.status_code, 400)
        self.assertTrue(resp.contains_message("MSG_179") or "200" in resp.raw_text)

    def test_dim2_07_obs_with_spanish_accents_and_symbols_under_200(self):
        """[RV-126] Observación con tildes, caracteres peruanos y símbolos bajo 200 caracteres es válida."""
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        obs_peru = "Cierre de turno tarde: cuadre exacto con S/ 50.00 en efectivo. Sin incidencias en atención ni pedidos."
        self.assertLessEqual(len(obs_peru), 200)
        resp = self.client.cerrar_caja(
            efectivo_contado=50.00,
            efectivo_esperado_mostrado=50.00,
            observacion=obs_peru,
            as_user="cajero"
        )
        self.assertEqual(resp.status_code, 200)

    # =========================================================================
    # DIMENSION 3: Concurrent Expected Cash Change (MSG-189)
    # =========================================================================

    def test_dim3_01_mismatched_expected_cash_higher(self):
        """[RV-129 / MSG-189] Si esperado mostrado es mayor (60 vs 50), aborta con 409 y MSG-189."""
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        resp = self.client.cerrar_caja(
            efectivo_contado=50.00,
            efectivo_esperado_mostrado=60.00,
            as_user="cajero"
        )
        self.assertEqual(resp.status_code, 409)
        self.assertTrue(resp.contains_message("MSG_189") or "cambiaron" in resp.raw_text.lower())

    def test_dim3_02_mismatched_expected_cash_lower(self):
        """[RV-129 / MSG-189] Si esperado mostrado es menor (40 vs 50), aborta con 409 y MSG-189."""
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        resp = self.client.cerrar_caja(
            efectivo_contado=50.00,
            efectivo_esperado_mostrado=40.00,
            as_user="cajero"
        )
        self.assertEqual(resp.status_code, 409)
        self.assertTrue(resp.contains_message("MSG_189") or "cambiaron" in resp.raw_text.lower())

    def test_dim3_03_mismatched_expected_cash_one_cent(self):
        """[RV-129 / MSG-189] Desviación mínima de 1 céntimo (50.01 vs 50.00) aborta con 409 y MSG-189."""
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        resp = self.client.cerrar_caja(
            efectivo_contado=50.00,
            efectivo_esperado_mostrado=50.01,
            as_user="cajero"
        )
        self.assertEqual(resp.status_code, 409)
        self.assertTrue(resp.contains_message("MSG_189") or "cambiaron" in resp.raw_text.lower())

    def test_dim3_04_matching_expected_cash_succeeds(self):
        """[RV-129] Coincidencia exacta de esperado mostrado con esperado de servidor permite cierre exitoso."""
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        resp = self.client.cerrar_caja(
            efectivo_contado=50.00,
            efectivo_esperado_mostrado=50.00,
            as_user="cajero"
        )
        self.assertEqual(resp.status_code, 200)

    def test_dim3_05_concurrency_conflict_recovery(self):
        """[E-308 / RV-129] Tras aborto por MSG-189, la caja sigue abierta y permite reintentar con el esperado actualizado."""
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=75.00, as_user="cajero")

        # Primer intento: falla con esperado desactualizado
        resp_conflict = self.client.cerrar_caja(
            efectivo_contado=75.00,
            efectivo_esperado_mostrado=60.00,
            as_user="cajero"
        )
        self.assertEqual(resp_conflict.status_code, 409)
        self.assertTrue(resp_conflict.contains_message("MSG_189") or "cambiaron" in resp_conflict.raw_text.lower())

        # Verificar que la caja sigue abierta
        actual = self.client.get_caja_actual(as_user="cajero")
        self.assertEqual(actual.get("estado"), "abierta")

        # Segundo intento: se consulta resumen actualizado y se cierra con éxito
        resumen = self.client.get_cierre_resumen(as_user="cajero")
        efectivo_esperado_actual = float(resumen.get("efectivoEsperado", 75.00))
        self.assertAlmostEqual(efectivo_esperado_actual, 75.00, places=2)

        resp_ok = self.client.cerrar_caja(
            efectivo_contado=efectivo_esperado_actual,
            efectivo_esperado_mostrado=efectivo_esperado_actual,
            as_user="cajero"
        )
        self.assertEqual(resp_ok.status_code, 200)

    # =========================================================================
    # DIMENSION 4: Date Range Validation (MSG-188)
    # =========================================================================

    def test_dim4_01_desde_greater_than_hasta_wide(self):
        """[RV-130 / MSG-188] desde > hasta con amplio margen se rechaza con 400 y MSG-188."""
        resp = self.client.get_cierres(desde="2026-10-25", hasta="2026-10-10", as_user="admin")
        self.assertEqual(resp.status_code, 400)
        self.assertTrue(resp.contains_message("MSG_188") or "posterior" in resp.raw_text.lower())

    def test_dim4_02_desde_greater_than_hasta_off_by_one_day(self):
        """[RV-130 / MSG-188] desde > hasta por 1 solo día se rechaza con 400 y MSG-188."""
        resp = self.client.get_cierres(desde="2026-10-18", hasta="2026-10-17", as_user="admin")
        self.assertEqual(resp.status_code, 400)
        self.assertTrue(resp.contains_message("MSG_188") or "posterior" in resp.raw_text.lower())

    def test_dim4_03_future_date_desde(self):
        """[RV-130 / MSG-188] Fecha 'desde' en el futuro lejano se rechaza con 400 y MSG-188."""
        resp = self.client.get_cierres(desde="2099-01-01", hasta="2099-01-02", as_user="admin")
        self.assertEqual(resp.status_code, 400)
        self.assertTrue(resp.contains_message("MSG_188") or "futura" in resp.raw_text.lower())

    def test_dim4_04_future_date_hasta_only(self):
        """[RV-130 / MSG-188] Fecha 'hasta' en el futuro lejano se rechaza con 400 y MSG-188."""
        resp = self.client.get_cierres(desde="2026-10-01", hasta="2099-01-01", as_user="admin")
        self.assertEqual(resp.status_code, 400)
        self.assertTrue(resp.contains_message("MSG_188") or "futura" in resp.raw_text.lower())

    def test_dim4_05_future_tomorrow_date(self):
        """[RV-130 / MSG-188] Fecha de mañana (futura inmediata) se rechaza con 400 y MSG-188."""
        tomorrow = (datetime.utcnow() + timedelta(days=2)).strftime("%Y-%m-%d")
        resp = self.client.get_cierres(desde=tomorrow, hasta=tomorrow, as_user="admin")
        self.assertEqual(resp.status_code, 400)
        self.assertTrue(resp.contains_message("MSG_188") or "futura" in resp.raw_text.lower())

    def test_dim4_06_valid_same_day_desde_equals_hasta(self):
        """[RV-130] Filtro con desde == hasta (mismo día histórico o de hoy) es válido y devuelve 200 OK."""
        resp = self.client.get_cierres(desde="2026-10-18", hasta="2026-10-18", as_user="admin")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("items", resp.data)

    def test_dim4_07_valid_historical_range(self):
        """[RV-130] Rango histórico válido devuelve 200 OK."""
        resp = self.client.get_cierres(desde="2026-01-01", hasta="2026-10-18", as_user="admin")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("items", resp.data)

    def test_dim4_08_empty_range_no_records(self):
        """[MSG-185] Rango sin registros devuelve lista vacía items: []."""
        resp = self.client.get_cierres(desde="2010-01-01", hasta="2010-01-02", as_user="admin")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.get("items", [])), 0)

    def test_dim4_09_invalid_date_format(self):
        """[RV-130] Formato de fecha no convertible se rechaza con 400 Bad Request."""
        resp = self.client.get_cierres(desde="texto_invalido", hasta="2026-10-18", as_user="admin")
        self.assertEqual(resp.status_code, 400)

    # =========================================================================
    # DIMENSION 5: Role-Based Access Control (RBAC 403 / 401)
    # =========================================================================

    def test_dim5_01_history_cajero_forbidden(self):
        """[RN-106 / MSG-39] Cajero no puede acceder a GET /api/caja/cierres (403 Forbidden)."""
        resp = self.client.get_cierres(as_user="cajero")
        self.assertEqual(resp.status_code, 403)
        self.assertTrue(resp.contains_message("MSG_39") or "permiso" in resp.raw_text.lower())

    def test_dim5_02_history_mozo_forbidden(self):
        """[RN-106 / MSG-39] Mozo no puede acceder a GET /api/caja/cierres (403 Forbidden)."""
        resp = self.client.get_cierres(as_user="mozo")
        self.assertEqual(resp.status_code, 403)
        self.assertTrue(resp.contains_message("MSG_39") or "permiso" in resp.raw_text.lower())

    def test_dim5_03_history_cocinero_forbidden(self):
        """[RN-106 / MSG-39] Cocinero no puede acceder a GET /api/caja/cierres (403 Forbidden)."""
        resp = self.client.get_cierres(as_user="cocinero")
        self.assertEqual(resp.status_code, 403)
        self.assertTrue(resp.contains_message("MSG_39") or "permiso" in resp.raw_text.lower())

    def test_dim5_04_history_admin_allowed(self):
        """[RN-106] Administrador tiene acceso a GET /api/caja/cierres (200 OK)."""
        resp = self.client.get_cierres(as_user="admin")
        self.assertEqual(resp.status_code, 200)

    def test_dim5_05_detail_cajero_forbidden(self):
        """[RN-106 / MSG-39] Cajero no puede acceder al detalle de un cierre (403 Forbidden)."""
        dummy_id = str(uuid.uuid4())
        resp = self.client.get_cierre_detalle(dummy_id, as_user="cajero")
        self.assertEqual(resp.status_code, 403)
        self.assertTrue(resp.contains_message("MSG_39") or "permiso" in resp.raw_text.lower())

    def test_dim5_06_detail_mozo_forbidden(self):
        """[RN-106 / MSG-39] Mozo no puede acceder al detalle de un cierre (403 Forbidden)."""
        dummy_id = str(uuid.uuid4())
        resp = self.client.get_cierre_detalle(dummy_id, as_user="mozo")
        self.assertEqual(resp.status_code, 403)
        self.assertTrue(resp.contains_message("MSG_39") or "permiso" in resp.raw_text.lower())

    def test_dim5_07_detail_cocinero_forbidden(self):
        """[RN-106 / MSG-39] Cocinero no puede acceder al detalle de un cierre (403 Forbidden)."""
        dummy_id = str(uuid.uuid4())
        resp = self.client.get_cierre_detalle(dummy_id, as_user="cocinero")
        self.assertEqual(resp.status_code, 403)
        self.assertTrue(resp.contains_message("MSG_39") or "permiso" in resp.raw_text.lower())

    def test_dim5_08_open_admin_forbidden(self):
        """[RN-106] Solo Cajero puede abrir caja; Administrador recibe 403 Forbidden."""
        resp = self.client.abrir_caja(monto_inicial=50.00, as_user="admin")
        self.assertEqual(resp.status_code, 403)

    def test_dim5_09_open_mozo_forbidden(self):
        """[RN-106] Mozo no puede abrir caja (403 Forbidden)."""
        resp = self.client.abrir_caja(monto_inicial=50.00, as_user="mozo")
        self.assertEqual(resp.status_code, 403)

    def test_dim5_10_open_cocinero_forbidden(self):
        """[RN-106] Cocinero no puede abrir caja (403 Forbidden)."""
        resp = self.client.abrir_caja(monto_inicial=50.00, as_user="cocinero")
        self.assertEqual(resp.status_code, 403)

    def test_dim5_11_close_admin_forbidden(self):
        """[RN-106] Solo Cajero puede cerrar caja; Administrador recibe 403 Forbidden."""
        resp = self.client.cerrar_caja(efectivo_contado=50.00, as_user="admin")
        self.assertEqual(resp.status_code, 403)

    def test_dim5_12_close_mozo_forbidden(self):
        """[RN-106] Mozo no puede cerrar caja (403 Forbidden)."""
        resp = self.client.cerrar_caja(efectivo_contado=50.00, as_user="mozo")
        self.assertEqual(resp.status_code, 403)

    def test_dim5_13_close_cocinero_forbidden(self):
        """[RN-106] Cocinero no puede cerrar caja (403 Forbidden)."""
        resp = self.client.cerrar_caja(efectivo_contado=50.00, as_user="cocinero")
        self.assertEqual(resp.status_code, 403)

    def test_dim5_14_unauthenticated_requests_401(self):
        """[RNF-47] Peticiones no autenticadas a endpoints protegidos de caja retornan 401 Unauthorized."""
        for method, ep in [
            ("GET", "/caja/actual"),
            ("POST", "/caja/abrir"),
            ("POST", "/caja/cerrar"),
            ("GET", "/caja/cierres"),
            ("GET", "/caja/cierre/resumen"),
        ]:
            resp = self.client.raw_request(method, ep, token=None, as_user=None)
            self.assertEqual(resp.status_code, 401, f"Expected 401 for {method} {ep}. Got: {resp.status_code}")

    # =========================================================================
    # DIMENSION 6: Deep Adversarial Hardening (Injection, PDF, Pagination, Idempotency)
    # =========================================================================

    def test_dim6_01_obs_with_sql_injection_payload_safe(self):
        """[Adversarial / Security] Inyección SQL en observación se persiste de forma segura como texto plano."""
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        sqli_obs = "'; DROP TABLE cajas; -- ' OR '1'='1"
        resp = self.client.cerrar_caja(
            efectivo_contado=50.00,
            efectivo_esperado_mostrado=50.00,
            observacion=sqli_obs,
            as_user="cajero"
        )
        self.assertEqual(resp.status_code, 200)

        # Verificar que el historial sigue funcionando y la tabla intacta
        hist_resp = self.client.get_cierres(as_user="admin")
        self.assertEqual(hist_resp.status_code, 200)

    def test_dim6_02_obs_with_xss_payload_safe(self):
        """[Adversarial / Security] Inyección XSS en observación se almacena como texto seguro."""
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        xss_obs = "<script>alert('pwned')</script>"
        resp = self.client.cerrar_caja(
            efectivo_contado=50.00,
            efectivo_esperado_mostrado=50.00,
            observacion=xss_obs,
            as_user="cajero"
        )
        self.assertEqual(resp.status_code, 200)

    def test_dim6_03_pdf_voucher_download_valid_pdf_stream(self):
        """[RNF-48] Descarga de PDF de cierre genera stream válido con firma %PDF."""
        ensure_caja_closed(self.client)
        open_resp = self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        caja_id = open_resp.get("cajaId") or open_resp.get("caja", {}).get("idCaja")
        self.assertIsNotNone(caja_id)

        close_resp = self.client.cerrar_caja(
            efectivo_contado=50.00,
            efectivo_esperado_mostrado=50.00,
            as_user="cajero"
        )
        self.assertEqual(close_resp.status_code, 200)

        pdf_resp = self.client.get_cierre_pdf(cierre_id=caja_id, as_user="cajero")
        self.assertEqual(pdf_resp.status_code, 200)
        self.assertIsInstance(pdf_resp.data, bytes)
        self.assertTrue(pdf_resp.data.startswith(b"%PDF"), "El archivo no contiene cabecera mágica %PDF")
        self.assertGreater(len(pdf_resp.data), 500, "El PDF es demasiado pequeño o está corrupto")

    def test_dim6_04_pagination_negative_and_zero_values_sanitized(self):
        """[Resilience] Paginación con valores negativos o cero se sanitiza y responde 200 OK."""
        resp = self.client.get_cierres(pagina=-5, tamano=-10, as_user="admin")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("items", resp.data)
        self.assertEqual(resp.get("pagina"), 1)
        self.assertEqual(resp.get("tamano"), 20)

    def test_dim6_05_idempotency_opening_rapid_repeat(self):
        """[RV-121 / RNF-45] Dos llamadas idénticas con el mismo solicitudId devuelven el mismo recurso."""
        ensure_caja_closed(self.client)
        shared_solicitud_id = str(uuid.uuid4())
        resp1 = self.client.abrir_caja(monto_inicial=50.00, solicitud_id=shared_solicitud_id, as_user="cajero")
        self.assertIn(resp1.status_code, [200, 201])
        caja_id_1 = resp1.get("cajaId")

        # Inmediato reintento con el mismo solicitudId
        resp2 = self.client.abrir_caja(monto_inicial=50.00, solicitud_id=shared_solicitud_id, as_user="cajero")
        self.assertIn(resp2.status_code, [200, 201])
        caja_id_2 = resp2.get("cajaId")

        self.assertEqual(caja_id_1, caja_id_2, "El ID de caja debe ser idéntico por idempotencia")

if __name__ == "__main__":
    unittest.main()
