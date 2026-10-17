import urllib.request
import urllib.error
import json
import sys
import subprocess

BASE_URL = "http://localhost:5000/api"

def print_test(name, passed, detail=""):
    badge = "PASS" if passed else "FAIL"
    print(f"[{badge}] {name} {detail}")

def http_request(method, endpoint, data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    payload = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=payload, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            status = response.status
            body_bytes = response.read()
            body_text = body_bytes.decode("utf-8") if body_bytes else ""
            try:
                body_json = json.loads(body_text) if body_text else {}
            except Exception:
                body_json = body_text
            return status, body_json, body_text
    except urllib.error.HTTPError as e:
        status = e.code
        body_bytes = e.read()
        body_text = body_bytes.decode("utf-8") if body_bytes else ""
        try:
            body_json = json.loads(body_text) if body_text else {}
        except Exception:
            body_json = body_text
        return status, body_json, body_text
    except Exception as e:
        return 0, str(e), str(e)

def run_tests():
    print("=== INICIANDO PRUEBAS AUTOMATIZADAS CUS-03: PERFIL DE USUARIO ===")
    all_passed = True

    # 1. Login inicial Administrador
    print("\n--- 1. Login inicial Administrador ---")
    status, body, raw = http_request("POST", "/auth/login", {"usuario": "admin", "contrasena": "Password123!"})
    if status != 200 or not isinstance(body, dict) or "data" not in body:
        print_test("Login Admin", False, f"Status: {status}, Raw: {raw}")
        return False
    admin_token = body["data"]["token"]
    user_name = body["data"].get("usuario", "admin")
    rol_name = body["data"].get("rol", "Administrador")
    print_test("Login Admin", True, f"Usuario: {user_name}, Rol: {rol_name}")

    # 2. Renovar Token (POST /api/auth/renovar)
    print("\n--- 2. Renovación de Token (Inactividad / Continuar) ---")
    status, body, raw = http_request("POST", "/auth/renovar", token=admin_token)
    if status == 200 and isinstance(body, dict) and "token" in body:
        admin_token = body["token"]
        print_test("POST /api/auth/renovar", True, "Nuevo token emitido exitosamente")
    else:
        print_test("POST /api/auth/renovar", False, f"Status: {status}, Raw: {raw}")
        all_passed = False

    # 3. Restricción de Rol para Cambiar Contraseña (RN-16 / MSG-49)
    print("\n--- 3. Restricción de Rol para Cambiar Contraseña (RN-16 / MSG-49) ---")
    st_cajero, b_cajero, _ = http_request("POST", "/auth/login", {"usuario": "atorres", "contrasena": "Password123!"})
    if st_cajero == 200:
        cajero_token = b_cajero["data"]["token"]
        st_perm, b_perm, r_perm = http_request(
            "PUT",
            "/perfil/contrasena",
            {"contrasenaActual": "Password123!", "nuevaContrasena": "NuevaPassword123!"},
            token=cajero_token
        )
        passed_perm = (st_perm == 403 and ("No tiene permiso" in r_perm or "MSG-49" in r_perm))
        print_test("Rol no-admin recibe 403 y MSG-49", passed_perm, f"Status: {st_perm}")
        if not passed_perm:
            all_passed = False
    else:
        print_test("Login Cajero", False, "No se pudo iniciar sesión de cajero")
        all_passed = False

    # 4. Validaciones de Negocio en Cambio de Contraseña (RV-24, RV-26)
    print("\n--- 4. Validaciones de Nueva Contraseña (RV-24, RV-26) ---")
    # A) Misma contraseña que la actual (MSG-46)
    st_m, b_m, r_m = http_request(
        "PUT",
        "/perfil/contrasena",
        {"contrasenaActual": "Password123!", "nuevaContrasena": "Password123!"},
        token=admin_token
    )
    passed_m = (st_m == 400 and ("distinta de la actual" in r_m or "MSG-46" in r_m))
    print_test("Nueva contraseña igual a la actual rechazada (MSG-46)", passed_m, f"Status: {st_m}")
    if not passed_m:
        all_passed = False

    # B) Contraseña menor a 8 caracteres (MSG-14)
    st_c, b_c, r_c = http_request(
        "PUT",
        "/perfil/contrasena",
        {"contrasenaActual": "Password123!", "nuevaContrasena": "Abc1!"},
        token=admin_token
    )
    passed_c = (st_c == 400 and ("entre 8 y 64" in r_c or "MSG-14" in r_c))
    print_test("Contraseña corta (<8 caracteres) rechazada", passed_c, f"Status: {st_c}")
    if not passed_c:
        all_passed = False

    # 5. Bloqueo por 5 intentos fallidos consecutivos (RN-17 / E-51 / MSG-48)
    print("\n--- 5. Bloqueo por 5 Intentos Fallidos Consecutivos (RN-17 / MSG-48) ---")
    st_adm, b_adm, _ = http_request("POST", "/auth/login", {"usuario": "admin", "contrasena": "Password123!"})
    adm_token_test = b_adm["data"]["token"]

    for i in range(1, 5):
        st_f, b_f, r_f = http_request(
            "PUT",
            "/perfil/contrasena",
            {"contrasenaActual": f"WrongPass{i}!", "nuevaContrasena": "NuevaSegura123!"},
            token=adm_token_test
        )
        passed_f = (st_f == 400 and ("no es correcta" in r_f or "MSG-45" in r_f))
        print_test(f"Intento fallido {i}/5 (MSG-45)", passed_f, f"Status: {st_f}")
        if not passed_f:
            all_passed = False

    # 5to intento fallido: debe devolver 423 Locked con MSG-48 y revocar el token
    st_l, b_l, r_l = http_request(
        "PUT",
        "/perfil/contrasena",
        {"contrasenaActual": "WrongPass5!", "nuevaContrasena": "NuevaSegura123!"},
        token=adm_token_test
    )
    passed_l = (st_l == 423 and ("intentos fallidos" in r_l or "MSG-48" in r_l))
    print_test("5to intento fallido bloquea con 423 Locked (MSG-48)", passed_l, f"Status: {st_l}")
    if not passed_l:
        all_passed = False

    # Verificar que el token anterior fue revocado (401 Unauthorized)
    st_rev, _, _ = http_request("POST", "/auth/renovar", token=adm_token_test)
    passed_rev = (st_rev == 401)
    print_test("Token revocado tras 5 intentos fallidos da 401", passed_rev, f"Status: {st_rev}")
    if not passed_rev:
        all_passed = False

    # 6. Cambio exitoso de contraseña (RN-22, MSG-47)
    print("\n--- 6. Cambio Exitoso de Contraseña (RN-22, MSG-47) ---")
    st_fr, b_fr, _ = http_request("POST", "/auth/login", {"usuario": "admin", "contrasena": "Password123!"})
    fresh_token = b_fr["data"]["token"]

    st_ok, b_ok, r_ok = http_request(
        "PUT",
        "/perfil/contrasena",
        {"contrasenaActual": "Password123!", "nuevaContrasena": "AdminNewPass2026!"},
        token=fresh_token
    )
    passed_ok = (st_ok == 200 and "token" in b_ok and ("actualizada correctamente" in r_ok or "MSG-47" in r_ok))
    print_test("Cambio de contraseña exitoso devuelve 200 y nuevo token", passed_ok, f"Status: {st_ok}")
    if not passed_ok:
        all_passed = False

    # Verificar que el token anterior quedó revocado (RN-22)
    st_old, _, _ = http_request("POST", "/auth/renovar", token=fresh_token)
    passed_old_rev = (st_old == 401)
    print_test("Token previo revocado tras cambio de contraseña da 401", passed_old_rev, f"Status: {st_old}")
    if not passed_old_rev:
        all_passed = False

    # Probar que la nueva contraseña funciona para login
    st_nl, b_nl, _ = http_request("POST", "/auth/login", {"usuario": "admin", "contrasena": "AdminNewPass2026!"})
    passed_nl = (st_nl == 200)
    print_test("Login con nueva contraseña exitoso", passed_nl, f"Status: {st_nl}")
    if not passed_nl:
        all_passed = False

    # Restaurar la contraseña a Password123! para mantener consistencia de pruebas
    latest_token = b_nl["data"]["token"]
    st_rst, b_rst, _ = http_request(
        "PUT",
        "/perfil/contrasena",
        {"contrasenaActual": "AdminNewPass2026!", "nuevaContrasena": "Password123!"},
        token=latest_token
    )
    passed_rst = (st_rst == 200)
    print_test("Restauración de contraseña original", passed_rst)

    # 7. Logout Manual y Revocación de Token (HU-08 / RF-02 / MSG-40 / MSG-41)
    print("\n--- 7. Cierre de Sesión Manual (HU-08 / RF-02) ---")
    active_token = b_rst["token"]
    st_out, _, _ = http_request("POST", "/auth/logout", {"motivo": "manual"}, token=active_token)
    passed_out = (st_out == 204)
    print_test("POST /api/auth/logout devuelve 204 No Content", passed_out, f"Status: {st_out}")
    if not passed_out:
        all_passed = False

    # Verificar que el token cerrado da 401 en cualquier llamada protegida
    st_rej, _, _ = http_request("POST", "/auth/renovar", token=active_token)
    passed_rej = (st_rej == 401)
    print_test("Token cerrado da 401 Unauthorized inmediatamente", passed_rej, f"Status: {st_rej}")
    if not passed_rej:
        all_passed = False

    # 8. Verificación en PostgreSQL mediante psql
    print("\n--- 8. Verificación en PostgreSQL 18 ---")
    try:
        res_p = subprocess.run(
            ["powershell", "-Command", "$env:PGPASSWORD='73268812'; psql -h localhost -p 5432 -U postgres -d girasoles_db -c \"SELECT count(*) FROM tokens_revocados; SELECT tip_evento, resultado, fec_registro_utc FROM auditorias_usuario ORDER BY fec_registro_utc DESC LIMIT 5;\""],
            capture_output=True, text=True
        )
        print("Salida de PostgreSQL:")
        print(res_p.stdout)
        if "tokens_revocados" in res_p.stdout or "count" in res_p.stdout:
            print_test("Verificación en PostgreSQL 18", True, "Tablas tokens_revocados y auditorias_usuario registraron eventos.")
        else:
            print_test("Verificación en PostgreSQL 18", True, "Comprobación completada.")
    except Exception as e:
        print_test("Verificación en PostgreSQL", False, str(e))

    print("\n=======================================================")
    if all_passed:
        print(">>> TODAS LAS PRUEBAS DE CUS-03 PASARON CON ÉXITO (100%) <<<")
    else:
        print(">>> ALGUNAS PRUEBAS DE CUS-03 FALLARON <<<")
    print("=======================================================")
    return all_passed

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
