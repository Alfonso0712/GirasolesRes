import re
from pathlib import Path

# 1. Sesión
auth_svc = Path(r"e:\Downloads\GirasolesRes\backend\GirasolesRes.Application\Services\AuthService.cs").read_text(encoding="utf-8")
jwt_gen = Path(r"e:\Downloads\GirasolesRes\backend\GirasolesRes.Infrastructure\Security\JwtGenerator.cs").read_text(encoding="utf-8")
inactivity_modal = Path(r"e:\Downloads\GirasolesRes\frontend\src\components\layout\InactivityModal.tsx").read_text(encoding="utf-8")
home_page = Path(r"e:\Downloads\GirasolesRes\frontend\src\pages\HomePage.tsx").read_text(encoding="utf-8")

print("=== 1. SESIÓN ===")
# Check in backend if token revocation is saved
print("Token revocado en AuthService.LogoutAsync:", "TokenRevocado" in auth_svc)
# Check if Cocinero exception exists in HomePage or backend
print("Excepción Cocinero inactividad en HomePage.tsx:", "Cocinero" in home_page and "INACTIVITY" in home_page)
for l in home_page.splitlines():
    if "INACTIVITY" in l or "inactividad" in l.lower() or ("cocinero" in l.lower() and "sesion" in l.lower()):
        print("  HomePage:", l.strip()[:100])

# 2. Mesas
print("\n=== 2. MESAS ===")
pedido_svc = Path(r"e:\Downloads\GirasolesRes\backend\GirasolesRes.Application\Services\PedidoService.cs").read_text(encoding="utf-8")
for i, l in enumerate(pedido_svc.splitlines()):
    if "ObtenerActivoPorMesa" in l or "pedido activo" in l.lower() or "409" in l or "Conflict" in l:
        print(f"  PedidoService.cs:{i+1} -> {l.strip()[:100]}")

# 3. Roles Pedidos
print("\n=== 3. ROLES PEDIDOS ===")
pedidos_ctrl = Path(r"e:\Downloads\GirasolesRes\backend\GirasolesRes.API\Controllers\PedidosController.cs").read_text(encoding="utf-8")
for i, l in enumerate(pedidos_ctrl.splitlines()):
    if "Authorize" in l or "RegistrarPedidoMesa" in l or "AnularPedido" in l or "ModificarPedido" in l:
        print(f"  PedidosController.cs:{i+1} -> {l.strip()[:100]}")

# 4. Cobro
print("\n=== 4. COBRO ===")
cobro_svc = Path(r"e:\Downloads\GirasolesRes\backend\GirasolesRes.Application\Services\CobroService.cs").read_text(encoding="utf-8")
for i, l in enumerate(cobro_svc.splitlines()):
    if "700" in l or "T001" in l or "BeginTransaction" in l or "caja" in l.lower() and "abierta" in l.lower():
        print(f"  CobroService.cs:{i+1} -> {l.strip()[:100]}")

# 7. Comanda Deshacer
print("\n=== 7. COMANDA DESHACER ===")
comanda_svc = Path(r"e:\Downloads\GirasolesRes\backend\GirasolesRes.Application\Services\ComandaService.cs").read_text(encoding="utf-8")
for i, l in enumerate(comanda_svc.splitlines()):
    if "segundo" in l.lower() or "deshacer" in l.lower() or "60" in l or "10" in l:
        print(f"  ComandaService.cs:{i+1} -> {l.strip()[:100]}")
