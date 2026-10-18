import uuid
from typing import Dict, Any, Optional, Tuple
from .client import ApiClient, ApiResponse
from .config import TODAS_DENOMINACIONES, MESSAGES

def calculate_denominations(counts: Dict[float, int]) -> Tuple[float, Optional[str]]:
    """
    Computes total cash based on Peruvian denominations and integer counts [0..999].
    Returns (total, error_message).
    """
    total = 0.0
    for denom, count in counts.items():
        if not isinstance(count, int) or count < 0 or count > 999:
            return 0.0, MESSAGES["MSG_184"]
        total += round(float(denom) * count, 2)
    return round(total, 2), None

def ensure_caja_closed(client: ApiClient) -> bool:
    """
    Ensures that any open cash register is cleanly closed prior to running tests.
    """
    resp = client.get_caja_actual(as_user="cajero")
    if not resp.is_success:
        return False

    estado = resp.get("estado")
    if estado == "sinCaja":
        return True

    # If open or anteriorSinCerrar, query summary and close it
    resumen_resp = client.get_cierre_resumen(as_user="cajero")
    expected = 0.0
    if resumen_resp.is_success and isinstance(resumen_resp.data, dict):
        expected = float(resumen_resp.data.get("efectivoEsperado", 0.0))

    close_resp = client.cerrar_caja(
        efectivo_contado=expected,
        observacion="Cierre de limpieza previa de prueba",
        efectivo_esperado_mostrado=expected,
        as_user="cajero"
    )
    return close_resp.is_success or close_resp.status_code == 409

def ensure_caja_open(client: ApiClient, monto_inicial: float = 100.0) -> Tuple[bool, Optional[str]]:
    """
    Ensures a clean cash register is open with the given initial amount.
    Returns (success, caja_id).
    """
    resp = client.get_caja_actual(as_user="cajero")
    if resp.is_success:
        estado = resp.get("estado")
        if estado == "abierta":
            caja_id = resp.get("apertura", {}).get("cajaId") if isinstance(resp.get("apertura"), dict) else None
            return True, caja_id

    ensure_caja_closed(client)
    open_resp = client.abrir_caja(monto_inicial=monto_inicial, as_user="cajero")
    if open_resp.is_success:
        caja_id = open_resp.get("cajaId") or open_resp.get("caja", {}).get("idCaja")
        return True, str(caja_id)
    return False, None
