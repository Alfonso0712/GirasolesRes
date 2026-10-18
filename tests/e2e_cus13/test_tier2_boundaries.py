import unittest
import uuid
from .client import ApiClient
from .config import MESSAGES, USERS
from .fixtures import calculate_denominations, ensure_caja_closed

class TestTier2Boundaries(unittest.TestCase):
    """
    Tier 2: Boundary & Corner Cases (>=5 per feature: S/ 0.00, S/ 99,999.99, empty inputs,
    decimal formats, 200 vs 201 char observation, concurrent expected cash mismatch MSG-189,
    invalid date range MSG-188, unauthorized role 403 MSG-39).
    Rules: RV-119..RV-132, RN-106..RN-115, RNF-44..RNF-47.
    """

    @classmethod
    def setUpClass(cls):
        cls.client = ApiClient()

    # =========================================================================
    # FEATURE 1: Opening Boundaries (Monto Inicial - RV-120)
    # =========================================================================

    def test_01_monto_inicial_cero_valido(self):
        """
        [E-289 / RV-120] Monto inicial S/ 0.00 es el límite inferior permitido y se procesa con normalidad.
        """
        ensure_caja_closed(self.client)
        resp = self.client.abrir_caja(monto_inicial=0.00, as_user="cajero")
        self.assertIn(resp.status_code, [200, 201], f"Expected 200/201 for S/ 0.00. Got: {resp.status_code}")

    def test_02_monto_inicial_maximo_valido(self):
        """
        [E-289 / RV-120] Monto inicial S/ 99,999.99 es el límite superior permitido y se acepta.
        """
        ensure_caja_closed(self.client)
        resp = self.client.abrir_caja(monto_inicial=99999.99, as_user="cajero")
        self.assertIn(resp.status_code, [200, 201], f"Expected 200/201 for S/ 99,999.99. Got: {resp.status_code}")

    def test_03_monto_inicial_supera_maximo_rechazado(self):
        """
        [E-289 / RV-120 / MSG-171] Monto inicial S/ 100,000.00 supera S/ 99,999.99 y se rechaza con 400 y MSG-171.
        """
        ensure_caja_closed(self.client)
        resp = self.client.abrir_caja(monto_inicial=100000.00, as_user="cajero")
        self.assertEqual(resp.status_code, 400, f"Expected 400 for S/ 100,000. Got: {resp.status_code}")
        self.assertTrue(resp.contains_message("MSG_171") or "99,999.99" in resp.raw_text,
                        f"Expected MSG-171. Body: {resp.raw_text}")

    def test_04_monto_inicial_negativo_rechazado(self):
        """
        [E-289 / RV-120 / MSG-170] Monto inicial negativo (-0.01 o -50.00) se rechaza con 400 y MSG-170.
        """
        ensure_caja_closed(self.client)
        resp = self.client.abrir_caja(monto_inicial=-0.01, as_user="cajero")
        self.assertEqual(resp.status_code, 400, f"Expected 400 for negative amount. Got: {resp.status_code}")
        self.assertTrue(resp.contains_message("MSG_170") or "válido" in resp.raw_text.lower(),
                        f"Expected MSG-170. Body: {resp.raw_text}")

    def test_05_monto_inicial_vacio_rechazado(self):
        """
        [E-289 / RV-120 / MSG-169] Monto inicial vacío o nulo se rechaza con 400 y MSG-169.
        """
        ensure_caja_closed(self.client)
        payload = {"solicitudId": str(uuid.uuid4())}
        resp = self.client.raw_request("POST", "/caja/abrir", data=payload, as_user="cajero")
        self.assertEqual(resp.status_code, 400, f"Expected 400 for missing montoInicial. Got: {resp.status_code}")
        self.assertTrue(resp.contains_message("MSG_169") or "monto" in resp.raw_text.lower(),
                        f"Expected MSG-169. Body: {resp.raw_text}")

    def test_06_monto_inicial_tres_decimales_rechazado(self):
        """
        [E-289 / RV-120 / MSG-170] Monto con más de 2 decimales (ej. 50.125) se rechaza con 400 y MSG-170.
        """
        ensure_caja_closed(self.client)
        resp = self.client.abrir_caja(monto_inicial=50.125, as_user="cajero")
        self.assertEqual(resp.status_code, 400, f"Expected 400 for 3 decimals. Got: {resp.status_code}")
        self.assertTrue(resp.contains_message("MSG_170") or "decimal" in resp.raw_text.lower(),
                        f"Expected MSG-170. Body: {resp.raw_text}")

    def test_07_monto_inicial_no_numerico_rechazado(self):
        """
        [E-289 / RV-120 / MSG-170] Monto no numérico ('abc') se rechaza con 400 Bad Request.
        """
        ensure_caja_closed(self.client)
        payload = {"solicitudId": str(uuid.uuid4()), "montoInicial": "cinquenta_soles"}
        resp = self.client.raw_request("POST", "/caja/abrir", data=payload, as_user="cajero")
        self.assertEqual(resp.status_code, 400)

    # =========================================================================
    # FEATURE 2: Closing & Concurrency Boundaries (RV-124, RV-129, MSG-189)
    # =========================================================================

    def test_08_efectivo_contado_cero_valido(self):
        """
        [E-303 / RV-124] Efectivo contado S/ 0.00 es válido al cierre (ej. robo o faltante total).
        """
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        resp = self.client.cerrar_caja(efectivo_contado=0.00, efectivo_esperado_mostrado=50.00, as_user="cajero")
        self.assertEqual(resp.status_code, 200)
        self.assertAlmostEqual(float(resp.get("diferencia", 0.0)), -50.00, places=2)

    def test_09_efectivo_contado_maximo_valido(self):
        """
        [E-303 / RV-124] Efectivo contado S/ 99,999.99 es el límite superior permitido y se acepta.
        """
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        resp = self.client.cerrar_caja(efectivo_contado=99999.99, efectivo_esperado_mostrado=50.00, as_user="cajero")
        self.assertEqual(resp.status_code, 200)

    def test_10_efectivo_contado_supera_maximo_rechazado(self):
        """
        [E-303 / RV-124 / MSG-171] Efectivo contado S/ 100,000.00 se rechaza con 400 y MSG-171.
        """
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        resp = self.client.cerrar_caja(efectivo_contado=100000.00, efectivo_esperado_mostrado=50.00, as_user="cajero")
        self.assertEqual(resp.status_code, 400)
        self.assertTrue(resp.contains_message("MSG_171") or "99,999.99" in resp.raw_text)

    def test_11_efectivo_contado_vacio_rechazado(self):
        """
        [E-303 / RV-124 / MSG-175] Efectivo contado no enviado se rechaza con 400 y MSG-175.
        """
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        payload = {"solicitudId": str(uuid.uuid4()), "efectivoEsperadoMostrado": 50.00}
        resp = self.client.raw_request("POST", "/caja/cerrar", data=payload, as_user="cajero")
        self.assertEqual(resp.status_code, 400)
        self.assertTrue(resp.contains_message("MSG_175") or "contado" in resp.raw_text.lower())

    def test_12_concurrencia_cambio_efectivo_esperado_msg189(self):
        """
        [E-308 / RV-129 / MSG-189] Si el efectivo esperado cambió mientras contaba, el cierre aborta con 409 y MSG-189.
        """
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")

        # Client submits closing with an obsolete/mismatched expected cash (e.g. 40.00 when server has 50.00)
        resp = self.client.cerrar_caja(
            efectivo_contado=50.00,
            efectivo_esperado_mostrado=40.00,  # Deliberate mismatch
            as_user="cajero"
        )
        self.assertEqual(resp.status_code, 409, f"Expected 409 Conflict on concurrency mismatch. Got: {resp.status_code}")
        self.assertTrue(resp.contains_message("MSG_189") or "cambiaron" in resp.raw_text.lower(),
                        f"Expected MSG-189. Body: {resp.raw_text}")

    def test_13_cierre_sin_caja_abierta_rechazado(self):
        """
        [HU35] Intentar cerrar caja cuando no existe ninguna caja abierta retorna 409 Conflict.
        """
        ensure_caja_closed(self.client)
        resp = self.client.cerrar_caja(efectivo_contado=50.00, as_user="cajero")
        self.assertEqual(resp.status_code, 409)

    # =========================================================================
    # FEATURE 3: Arqueo & Observation Boundaries (RV-126, RV-128)
    # =========================================================================

    def test_14_observacion_exactamente_200_caracteres_aceptada(self):
        """
        [E-305 / RV-126] Observación de exactamente 200 caracteres es válida y se almacena sin error.
        """
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        obs_200 = "A" * 200
        resp = self.client.cerrar_caja(
            efectivo_contado=50.00,
            efectivo_esperado_mostrado=50.00,
            observacion=obs_200,
            as_user="cajero"
        )
        self.assertEqual(resp.status_code, 200, f"Expected 200 OK for 200 chars. Got: {resp.status_code}")

    def test_15_observacion_201_caracteres_rechazada(self):
        """
        [E-305 / RV-126 / MSG-179] Observación de 201 caracteres supera el límite y se rechaza con 400 y MSG-179.
        """
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        obs_201 = "A" * 201
        resp = self.client.cerrar_caja(
            efectivo_contado=50.00,
            efectivo_esperado_mostrado=50.00,
            observacion=obs_201,
            as_user="cajero"
        )
        self.assertEqual(resp.status_code, 400, f"Expected 400 for 201 chars. Got: {resp.status_code}")
        self.assertTrue(resp.contains_message("MSG_179") or "200" in resp.raw_text,
                        f"Expected MSG-179. Body: {resp.raw_text}")

    def test_16_observacion_opcional_vacia_aceptada(self):
        """
        [RV-126] La observación es opcional; enviar null o string vacío se acepta normalmente.
        """
        ensure_caja_closed(self.client)
        self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
        resp = self.client.cerrar_caja(
            efectivo_contado=50.00,
            efectivo_esperado_mostrado=50.00,
            observacion="",
            as_user="cajero"
        )
        self.assertEqual(resp.status_code, 200)

    def test_17_contador_limites_unidades_cero_y_999(self):
        """
        [E-304 / RV-128] El contador de denominaciones admite unidades entre 0 y 999.
        """
        # Test 0 units
        t_zero, err_zero = calculate_denominations({100.0: 0, 50.0: 0})
        self.assertIsNone(err_zero)
        self.assertEqual(t_zero, 0.0)

        # Test 999 units
        t_max, err_max = calculate_denominations({100.0: 999})
        self.assertIsNone(err_max)
        self.assertAlmostEqual(t_max, 99900.00, places=2)

    def test_18_contador_unidad_negativa_invalida_msg184(self):
        """
        [E-304 / RV-128 / MSG-184] Cantidad negativa (-1) detona MSG-184 en el contador.
        """
        total, err = calculate_denominations({100.0: -1})
        self.assertEqual(err, MESSAGES["MSG_184"])

    def test_19_contador_unidad_superior_999_invalida_msg184(self):
        """
        [E-304 / RV-128 / MSG-184] Cantidad superior a 999 (1000) detona MSG-184 en el contador.
        """
        total, err = calculate_denominations({100.0: 1000})
        self.assertEqual(err, MESSAGES["MSG_184"])

    def test_20_contador_unidad_decimal_invalida_msg184(self):
        """
        [E-304 / RV-128 / MSG-184] Cantidad con decimales (3.5 billetes) detona MSG-184 en el contador.
        """
        total, err = calculate_denominations({100.0: 3.5})  # type: ignore
        self.assertEqual(err, MESSAGES["MSG_184"])

    # =========================================================================
    # FEATURE 4: History & Date Filter Boundaries (RV-130, MSG-188)
    # =========================================================================

    def test_21_historial_filtro_mismo_dia_desde_igual_hasta(self):
        """
        [E-315 / RV-130] Filtro puntual con desde == hasta (mismo día) es válido y devuelve 200 OK.
        """
        resp = self.client.get_cierres(desde="2026-10-18", hasta="2026-10-18", as_user="admin")
        self.assertEqual(resp.status_code, 200)

    def test_22_historial_filtro_desde_mayor_que_hasta_msg188(self):
        """
        [E-315 / RV-130 / MSG-188] Filtro donde desde > hasta se rechaza con 400 Bad Request y MSG-188.
        """
        resp = self.client.get_cierres(desde="2026-10-20", hasta="2026-10-10", as_user="admin")
        self.assertEqual(resp.status_code, 400, f"Expected 400 for invalid range. Got: {resp.status_code}")
        self.assertTrue(resp.contains_message("MSG_188") or "posterior" in resp.raw_text.lower(),
                        f"Expected MSG-188. Body: {resp.raw_text}")

    def test_23_historial_filtro_fecha_futura_msg188(self):
        """
        [E-315 / RV-130 / MSG-188] Filtro con fechas futuras se rechaza con 400 Bad Request y MSG-188.
        """
        resp = self.client.get_cierres(desde="2099-01-01", hasta="2099-01-02", as_user="admin")
        self.assertEqual(resp.status_code, 400, f"Expected 400 for future date. Got: {resp.status_code}")
        self.assertTrue(resp.contains_message("MSG_188") or "futura" in resp.raw_text.lower(),
                        f"Expected MSG-188. Body: {resp.raw_text}")

    def test_24_historial_filtro_formato_invalido_rechazado(self):
        """
        [E-315 / RV-130] Filtro con string de fecha inválida ('fecha-invalida') se rechaza con 400 Bad Request.
        """
        resp = self.client.get_cierres(desde="formato_erroneo", hasta="2026-10-18", as_user="admin")
        self.assertEqual(resp.status_code, 400)

    def test_25_historial_sin_resultados_devuelve_vacio_msg185(self):
        """
        [E-315 / MSG-185] Filtro para rango sin cierres devuelve lista vacía items: [].
        """
        resp = self.client.get_cierres(desde="2020-01-01", hasta="2020-01-02", as_user="admin")
        self.assertEqual(resp.status_code, 200)
        items = resp.get("items", [])
        self.assertEqual(len(items), 0)

    # =========================================================================
    # FEATURE 5: Security & Role Boundaries (RN-106, MSG-39, 401/403)
    # =========================================================================

    def test_26_rol_cajero_prohibido_historial_cierres_403(self):
        """
        [E-319 / RN-106 / MSG-39] Cajero intentando acceder a GET /api/caja/cierres recibe 403 Forbidden y MSG-39.
        """
        resp = self.client.get_cierres(as_user="cajero")
        self.assertEqual(resp.status_code, 403, f"Expected 403 Forbidden. Got: {resp.status_code}")
        self.assertTrue(resp.contains_message("MSG_39") or "permiso" in resp.raw_text.lower())

    def test_27_rol_mozo_prohibido_historial_cierres_403(self):
        """
        [E-319 / RN-106 / MSG-39] Mozo intentando acceder a GET /api/caja/cierres recibe 403 Forbidden y MSG-39.
        """
        resp = self.client.get_cierres(as_user="mozo")
        self.assertEqual(resp.status_code, 403)
        self.assertTrue(resp.contains_message("MSG_39") or "permiso" in resp.raw_text.lower())

    def test_28_rol_cocinero_prohibido_historial_cierres_403(self):
        """
        [E-319 / RN-106 / MSG-39] Cocinero intentando acceder a GET /api/caja/cierres recibe 403 Forbidden y MSG-39.
        """
        resp = self.client.get_cierres(as_user="cocinero")
        self.assertEqual(resp.status_code, 403)
        self.assertTrue(resp.contains_message("MSG_39") or "permiso" in resp.raw_text.lower())

    def test_29_rol_mozo_prohibido_abrir_caja_403(self):
        """
        [RN-106 / MSG-39] Mozo intentando abrir caja recibe 403 Forbidden y MSG-39.
        """
        resp = self.client.abrir_caja(monto_inicial=50.00, as_user="mozo")
        self.assertEqual(resp.status_code, 403)
        self.assertTrue(resp.contains_message("MSG_39") or "permiso" in resp.raw_text.lower())

    def test_30_rol_mozo_prohibido_cerrar_caja_403(self):
        """
        [RN-106 / MSG-39] Mozo intentando cerrar caja recibe 403 Forbidden y MSG-39.
        """
        resp = self.client.cerrar_caja(efectivo_contado=50.00, as_user="mozo")
        self.assertEqual(resp.status_code, 403)
        self.assertTrue(resp.contains_message("MSG_39") or "permiso" in resp.raw_text.lower())

    def test_31_solicitud_sin_token_recibe_401_unauthorized(self):
        """
        [RNF-47] Cualquier petición sin token Bearer a endpoints protegidos de caja devuelve 401 Unauthorized.
        """
        resp = self.client.raw_request("GET", "/caja/actual", token=None, as_user=None)
        self.assertEqual(resp.status_code, 401)

if __name__ == "__main__":
    unittest.main()
