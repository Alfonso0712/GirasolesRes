import urllib.request
import urllib.error
import json
import uuid
from typing import Optional, Dict, Any, Union
from .config import BASE_URL, USERS, MESSAGES

class ApiResponse:
    def __init__(self, status_code: int, data: Any, raw_text: str, headers: Dict[str, str]):
        self.status_code = status_code
        self.data = data
        self.raw_text = raw_text
        self.headers = headers

    @property
    def is_success(self) -> bool:
        return 200 <= self.status_code < 300

    def get(self, key: str, default: Any = None) -> Any:
        if isinstance(self.data, dict):
            return self.data.get(key, default)
        return default

    def contains_message(self, message_or_code: str) -> bool:
        """
        Checks if the response body contains a specific message text or MSG code.
        """
        target = MESSAGES.get(message_or_code, message_or_code)
        if target.lower() in self.raw_text.lower():
            return True
        if message_or_code.lower() in self.raw_text.lower():
            return True
        return False

    def __repr__(self) -> str:
        snippet = (self.raw_text[:120] + "...") if len(self.raw_text) > 120 else self.raw_text
        return f"<ApiResponse [{self.status_code}] {snippet}>"

class ApiClient:
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url.rstrip("/")
        self.tokens: Dict[str, str] = {}

    def login(self, usuario: str, contrasena: str) -> str:
        """
        Logs in and caches the JWT token for the user.
        """
        payload = {"usuario": usuario, "contrasena": contrasena}
        resp = self.raw_request("POST", "/auth/login", payload)
        if resp.status_code == 200 and isinstance(resp.data, dict):
            token = resp.data.get("data", {}).get("token") or resp.data.get("token")
            if token:
                self.tokens[usuario] = token
                return token
        raise RuntimeError(f"Login failed for user '{usuario}'. Status: {resp.status_code}, Body: {resp.raw_text}")

    def get_token(self, as_user: str) -> str:
        """
        Gets a cached token or logs in if not cached yet.
        """
        # Resolve username alias (e.g. 'admin', 'cajero', 'mozo', 'cocinero')
        user_key = as_user.lower()
        if user_key in USERS:
            username = USERS[user_key]["usuario"]
            password = USERS[user_key]["contrasena"]
        else:
            username = as_user
            password = "Password123!"

        if username not in self.tokens:
            self.login(username, password)
        return self.tokens[username]

    def raw_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Any] = None,
        token: Optional[str] = None,
        as_user: Optional[str] = None,
        custom_headers: Optional[Dict[str, str]] = None
    ) -> ApiResponse:
        url = f"{self.base_url}{endpoint}"
        headers = {
            "Accept": "application/json, application/pdf, */*",
            "Content-Type": "application/json"
        }
        if custom_headers:
            headers.update(custom_headers)

        if as_user:
            token = self.get_token(as_user)

        if token:
            headers["Authorization"] = f"Bearer {token}"

        payload_bytes = None
        if data is not None:
            if isinstance(data, (dict, list)):
                payload_bytes = json.dumps(data).encode("utf-8")
            elif isinstance(data, str):
                payload_bytes = data.encode("utf-8")
            elif isinstance(data, bytes):
                payload_bytes = data

        req = urllib.request.Request(url, data=payload_bytes, headers=headers, method=method)

        try:
            with urllib.request.urlopen(req) as response:
                status = response.status
                body_bytes = response.read()
                resp_headers = dict(response.headers)
                
                content_type = resp_headers.get("Content-Type", "")
                if "application/pdf" in content_type:
                    return ApiResponse(status, body_bytes, f"<PDF stream {len(body_bytes)} bytes>", resp_headers)

                raw_text = body_bytes.decode("utf-8", errors="replace") if body_bytes else ""
                try:
                    parsed_json = json.loads(raw_text) if raw_text else {}
                except Exception:
                    parsed_json = raw_text
                return ApiResponse(status, parsed_json, raw_text, resp_headers)

        except urllib.error.HTTPError as e:
            status = e.code
            body_bytes = e.read()
            resp_headers = dict(e.headers)
            raw_text = body_bytes.decode("utf-8", errors="replace") if body_bytes else ""
            try:
                parsed_json = json.loads(raw_text) if raw_text else {}
            except Exception:
                parsed_json = raw_text
            return ApiResponse(status, parsed_json, raw_text, resp_headers)

        except Exception as e:
            return ApiResponse(0, {"error": str(e)}, str(e), {})

    # ==========================================
    # CUS 13 High-Level Endpoint Methods
    # ==========================================

    def get_caja_actual(self, as_user: Optional[str] = "cajero", token: Optional[str] = None) -> ApiResponse:
        return self.raw_request("GET", "/caja/actual", token=token, as_user=as_user)

    def abrir_caja(
        self,
        monto_inicial: Any,
        solicitud_id: Optional[str] = None,
        as_user: Optional[str] = "cajero",
        token: Optional[str] = None
    ) -> ApiResponse:
        payload = {
            "solicitudId": solicitud_id or str(uuid.uuid4()),
            "montoInicial": monto_inicial
        }
        return self.raw_request("POST", "/caja/abrir", data=payload, token=token, as_user=as_user)

    def get_cierre_resumen(self, as_user: Optional[str] = "cajero", token: Optional[str] = None) -> ApiResponse:
        return self.raw_request("GET", "/caja/cierre/resumen", token=token, as_user=as_user)

    def cerrar_caja(
        self,
        efectivo_contado: Any,
        observacion: Optional[str] = None,
        efectivo_esperado_mostrado: Optional[Any] = None,
        solicitud_id: Optional[str] = None,
        as_user: Optional[str] = "cajero",
        token: Optional[str] = None
    ) -> ApiResponse:
        payload: Dict[str, Any] = {
            "solicitudId": solicitud_id or str(uuid.uuid4()),
            "efectivoContado": efectivo_contado
        }
        if observacion is not None:
            payload["observacion"] = observacion
        if efectivo_esperado_mostrado is not None:
            payload["efectivoEsperadoMostrado"] = efectivo_esperado_mostrado

        return self.raw_request("POST", "/caja/cerrar", data=payload, token=token, as_user=as_user)

    def get_cierres(
        self,
        desde: Optional[str] = None,
        hasta: Optional[str] = None,
        pagina: int = 1,
        tamano: int = 20,
        as_user: Optional[str] = "admin",
        token: Optional[str] = None
    ) -> ApiResponse:
        params = [f"pagina={pagina}", f"tamano={tamano}"]
        if desde is not None:
            params.append(f"desde={desde}")
        if hasta is not None:
            params.append(f"hasta={hasta}")
        query_str = "&".join(params)
        return self.raw_request("GET", f"/caja/cierres?{query_str}", token=token, as_user=as_user)

    def get_cierre_detalle(
        self,
        cierre_id: Union[str, int],
        as_user: Optional[str] = "admin",
        token: Optional[str] = None
    ) -> ApiResponse:
        return self.raw_request("GET", f"/caja/cierres/{cierre_id}", token=token, as_user=as_user)

    def get_cierre_pdf(
        self,
        cierre_id: Union[str, int],
        as_user: Optional[str] = "cajero",
        token: Optional[str] = None
    ) -> ApiResponse:
        return self.raw_request("GET", f"/caja/cierres/{cierre_id}/pdf", token=token, as_user=as_user)

    def cobrar_pedido(
        self,
        pedido_id: Union[str, int],
        monto: float = 35.0,
        metodo_pago: str = "Efectivo",
        as_user: Optional[str] = "cajero",
        token: Optional[str] = None
    ) -> ApiResponse:
        payload = {
            "pedidoId": pedido_id,
            "metodoPago": metodo_pago,
            "montoPagado": monto
        }
        return self.raw_request("POST", "/cobros/cobrar", data=payload, token=token, as_user=as_user)
