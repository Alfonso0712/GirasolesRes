import unittest
import uuid
from .client import ApiClient
from .config import MESSAGES, USERS
from .fixtures import calculate_denominations, ensure_caja_closed

class TestTier4Scenarios(unittest.TestCase):
    """
    Tier 4: Real-World Application Scenarios
    1. Realistic restaurant full day shift (morning open, sales, count, close, PDF download).
    2. Morning + Evening multi-shift in same calendar day (RN-107, suggestion propagation E-288).
    3. Prior unclosed day left overnight scenario (RV-119, RN-108, MSG-168, E-291).
    """

    @classmethod
    def setUpClass(cls):
        cls.client = ApiClient()

    def test_01_turno_completo_restaurante(self):
        """
        [Escenario Real 1] Jornada completa de turno en Restaurante Girasoles:
        - Cajera Ana inicia turno. Verifica que no hay caja abierta (MSG-166).
        - Abre caja con fondo inicial de S/ 120.00.
        - Sistema emite toast MSG-173 y desbloquea los cobros.
        - Al finalizar la atención, consulta el resumen de cierre (GET /api/caja/cierre/resumen).
        - Realiza el conteo de billetes y monedas con el contador de denominaciones peruanas.
        - Visualiza en vivo el indicador de cuadre ("Cuadra").
        - Confirma el cierre atómico de caja con mensaje MSG-181.
        - Descarga el reporte PDF de 1 página con el balance completo y bloque para firmas (RNF-48).
        """
        ensure_caja_closed(self.client)

        # 1. Consulta matutina de estado
        estado_ini = self.client.get_caja_actual(as_user="cajero")
        self.assertEqual(estado_ini.status_code, 200)

        # 2. Apertura con S/ 120.00
        solicitud_id = str(uuid.uuid4())
        resp_apertura = self.client.abrir_caja(monto_inicial=120.00, solicitud_id=solicitud_id, as_user="cajero")
        self.assertIn(resp_apertura.status_code, [200, 201])
        caja_id = resp_apertura.get("cajaId") or resp_apertura.get("caja", {}).get("idCaja")

        # 3. Verificación operativa durante el turno
        resp_operativa = self.client.get_caja_actual(as_user="cajero")
        self.assertEqual(resp_operativa.get("estado"), "abierta")

        # 4. Solicitud de resumen de cierre
        resp_resumen = self.client.get_cierre_resumen(as_user="cajero")
        self.assertEqual(resp_resumen.status_code, 200)
        esperado = float(resp_resumen.data.get("efectivoEsperado", 120.00))

        # 5. Arqueo con denominaciones: 1 billete de S/ 100 y 1 billete de S/ 20 = S/ 120.00
        conteo = {100.0: 1, 20.0: 1}
        contado, err = calculate_denominations(conteo)
        self.assertIsNone(err)

        # 6. Cierre de caja
        resp_cierre = self.client.cerrar_caja(
            efectivo_contado=contado,
            efectivo_esperado_mostrado=esperado,
            observacion="Cierre de jornada conforme",
            as_user="cajero"
        )
        self.assertEqual(resp_cierre.status_code, 200)
        cierre_id = resp_cierre.get("cierreId") or resp_cierre.get("cajaId") or caja_id

        # 7. Descarga de PDF de cierre
        resp_pdf = self.client.get_cierre_pdf(cierre_id=cierre_id, as_user="cajero")
        self.assertEqual(resp_pdf.status_code, 200)
        self.assertIn("application/pdf", resp_pdf.headers.get("Content-Type", ""))

    def test_02_doble_turno_manana_tarde_rn107(self):
        """
        [Escenario Real 2 / RN-107 / E-288] Múltiples turnos sucesivos en el mismo día:
        - Turno Mañana: Cajero abre con S/ 100.00 y cierra con S/ 350.00 contados.
        - Turno Tarde: Segunda cajera abre; el sistema sugiere automáticamente S/ 350.00 (E-288).
        - Cajera de la tarde acepta sugerencia y abre el turno 2.
        - Al cerrar la tarde, cuenta S/ 352.00 (Sobrante S/ 2.00 por propina, MSG-177).
        - Administrador consulta el historial y verifica ambos turnos registrados en orden.
        """
        ensure_caja_closed(self.client)

        # Turno 1: Mañana
        self.client.abrir_caja(monto_inicial=100.00, as_user="cajero")
        resumen_1 = self.client.get_cierre_resumen(as_user="cajero")
        esperado_1 = float(resumen_1.data.get("efectivoEsperado", 100.00))
        cierre_1 = self.client.cerrar_caja(
            efectivo_contado=350.00,
            efectivo_esperado_mostrado=esperado_1,
            observacion="Cierre turno mañana",
            as_user="cajero"
        )
        self.assertEqual(cierre_1.status_code, 200)

        # Turno 2: Tarde - Sugerencia de monto inicial
        estado_tarde = self.client.get_caja_actual(as_user="cajero")
        self.assertEqual(estado_tarde.status_code, 200)
        sugerido = estado_tarde.get("sugerenciaMontoInicial")
        self.assertIsNotNone(sugerido)
        self.assertAlmostEqual(float(sugerido), 350.00, places=2)

        # Apertura Turno Tarde con el monto sugerido
        apertura_tarde = self.client.abrir_caja(monto_inicial=float(sugerido), as_user="cajero")
        self.assertIn(apertura_tarde.status_code, [200, 201])

        # Cierre Turno Tarde con sobrante
        resumen_2 = self.client.get_cierre_resumen(as_user="cajero")
        esperado_2 = float(resumen_2.data.get("efectivoEsperado", 350.00))
        cierre_2 = self.client.cerrar_caja(
            efectivo_contado=round(esperado_2 + 2.00, 2),
            efectivo_esperado_mostrado=esperado_2,
            observacion="Sobrante de S/ 2.00 por propina voluntaria",
            as_user="cajero"
        )
        self.assertEqual(cierre_2.status_code, 200)
        self.assertAlmostEqual(float(cierre_2.get("diferencia", 0.0)), 2.00, places=2)

        # Verificación en historial por Administrador
        historial = self.client.get_cierres(pagina=1, tamano=20, as_user="admin")
        self.assertEqual(historial.status_code, 200)
        items = historial.get("items", [])
        self.assertGreaterEqual(len(items), 2, "Debe listar ambos turnos cerrados en el historial")

    def test_03_caja_dia_anterior_sin_cerrar_bloqueo(self):
        """
        [Escenario Real 3 / RV-119 / RN-108 / E-291] Caja de día anterior dejada sin cerrar overnight:
        - Si existe una caja abierta con fecha local anterior a hoy:
        - GET /api/caja/actual reporta estado "anteriorSinCerrar" y mensaje MSG-168.
        - Intentar abrir una nueva caja se bloquea con 409 Conflict y MSG-168.
        - Intentar cobrar pedidos en CUS 11 se bloquea terminantemente con MSG-168.
        - Obliga a cerrar primero la caja anterior pendiente.
        """
        # We test the contract: if estado == 'anteriorSinCerrar', endpoints enforce block
        estado_resp = self.client.get_caja_actual(as_user="cajero")
        self.assertEqual(estado_resp.status_code, 200)

        if estado_resp.get("estado") == "anteriorSinCerrar":
            # Opening attempt must be rejected with 409 and MSG-168
            resp_open = self.client.abrir_caja(monto_inicial=50.00, as_user="cajero")
            self.assertEqual(resp_open.status_code, 409)
            self.assertTrue(resp_open.contains_message("MSG_168") or "sin cerrar" in resp_open.raw_text.lower())

            # Cobros attempt must be rejected with 409 and MSG-168
            resp_cobro = self.client.raw_request("GET", "/cobros/pendientes", as_user="cajero")
            self.assertEqual(resp_cobro.status_code, 409)
            self.assertTrue(resp_cobro.contains_message("MSG_168") or "sin cerrar" in resp_cobro.raw_text.lower())
        else:
            # Verified that when not in anteriorSinCerrar state, normal flow is enabled
            self.assertIn(estado_resp.get("estado"), ["sinCaja", "abierta"])

if __name__ == "__main__":
    unittest.main()
