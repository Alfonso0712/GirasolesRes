# Update usePedidoMesaManagement.ts
with open('frontend/src/hooks/usePedidoMesaManagement.ts', 'r', encoding='utf-8') as f:
    upm_code = f.read().replace('\r\n', '\n')

old_upm_iface = """interface UsePedidoMesaManagementProps {
  token: string;
  mesaIdInicial?: string | null;
  onLogout: (banner?: { type: 'success' | 'error' | 'info' | 'warning'; message: string }) => void;
}"""

new_upm_iface = """import { getMenusCompletosService } from '../services/menuCompletoService';

interface UsePedidoMesaManagementProps {
  token: string;
  mesaIdInicial?: string | null;
  modoInicial?: 'nuevo' | 'ampliacion';
  onLogout: (banner?: { type: 'success' | 'error' | 'info' | 'warning'; message: string }) => void;
}"""
if old_upm_iface in upm_code:
    upm_code = upm_code.replace(old_upm_iface, new_upm_iface)

old_upm_sig = """export function usePedidoMesaManagement({
  token,
  mesaIdInicial,
  onLogout,
}: UsePedidoMesaManagementProps) {"""

new_upm_sig = """export function usePedidoMesaManagement({
  token,
  mesaIdInicial,
  modoInicial,
  onLogout,
}: UsePedidoMesaManagementProps) {"""
assert old_upm_sig in upm_code, 'old_upm_sig not found'
upm_code = upm_code.replace(old_upm_sig, new_upm_sig)

old_upm_load = """      const [prods, mesas, menuHoy] = await Promise.all([
        pedidoService.obtenerCatalogoPedido(token),
        getMesasService({ estado: 'libre' }, token),
        menuDiaService.obtenerMenuHoy(token).catch(() => null)
      ]);

      const esDefinido = menuHoy ? menuHoy.definido : prods.length > 0;
      setMenuDefinido(esDefinido);
      setCatalogo(prods);
      setMesasLibres(mesas);

      if (menuHoy?.menusCompletos) {
        setMenusCompletos(menuHoy.menusCompletos);
      }"""

new_upm_load = """      const [prods, mesas, menuHoy, menusCompletosActivos] = await Promise.all([
        pedidoService.obtenerCatalogoPedido(token),
        getMesasService({ estado: 'libre' }, token),
        menuDiaService.obtenerMenuHoy(token).catch(() => null),
        getMenusCompletosService(true, token).catch(() => [])
      ]);

      setMenuDefinido(true); // RN-142: Sin menú del día definido no se bloquean ventas
      setCatalogo(prods);
      setMesasLibres(mesas);

      if (menuHoy?.menusCompletos && menuHoy.menusCompletos.length > 0) {
        setMenusCompletos(menuHoy.menusCompletos);
      } else if (menusCompletosActivos && menusCompletosActivos.length > 0) {
        setMenusCompletos(menusCompletosActivos.map(m => ({
          idMenuCompleto: m.id,
          nombre: m.nombre,
          precio: m.precio,
          incluye: m.incluye,
          partes: m.partes.map(p => ({
            idParte: p.id,
            nombre: p.nombre,
            orden: p.orden,
            rolesPermitidos: p.rolesPermitidos,
            opciones: p.opciones.map(o => ({
              idOpcion: o.id,
              productoId: o.productoId,
              nombre: o.nombre,
              agotado: false
            }))
          }))
        })));
      }"""
assert old_upm_load in upm_code, 'old_upm_load not found'
upm_code = upm_code.replace(old_upm_load, new_upm_load)

old_upm_mesa_init = """      if (mesaIdInicial) {
        // Verificar si la mesa ya tiene un pedido activo (deriva a ampliación CUS07.2)
        try {
          const pedidoActivo = await pedidoService.obtenerPedidoActivoPorMesa(mesaIdInicial, token);
          if (pedidoActivo) {
            setModo('ampliacion');
            setPedidoExistente(pedidoActivo);
            setMesaSeleccionada({
              id: mesaIdInicial,
              nombre: pedidoActivo.mesaNombre || 'Mesa',
              ocupacion: 'Ocupada',
              activa: true
            });
          } else {"""

new_upm_mesa_init = """      if (mesaIdInicial) {
        if (modoInicial === 'nuevo') {
          setModo('nuevo');
          let m = mesas.find((item) => String(item.id).toLowerCase() === String(mesaIdInicial).toLowerCase());
          if (!m) {
            const todas = await getMesasService({}, token);
            m = todas.find((item) => String(item.id).toLowerCase() === String(mesaIdInicial).toLowerCase());
          }
          if (m) {
            setMesaSeleccionada(m);
            if (!mesas.some((item) => String(item.id).toLowerCase() === String(m!.id).toLowerCase())) {
              setMesasLibres((prev) => [m!, ...prev]);
            }
          }
        } else {
          // Verificar si la mesa ya tiene un pedido activo (deriva a ampliación CUS07.2)
          try {
            const pedidoActivo = await pedidoService.obtenerPedidoActivoPorMesa(mesaIdInicial, token);
            if (pedidoActivo) {
              setModo('ampliacion');
              setPedidoExistente(pedidoActivo);
              setMesaSeleccionada({
                id: mesaIdInicial,
                nombre: pedidoActivo.mesaNombre || 'Mesa',
                ocupacion: 'Ocupada',
                activa: true
              });
            } else {"""
assert old_upm_mesa_init in upm_code, 'old_upm_mesa_init not found'
upm_code = upm_code.replace(old_upm_mesa_init, new_upm_mesa_init)

old_catch_end = """          if (m) {
            const mesaEncontrada = m;
            if (!mesas.some((item) => String(item.id).toLowerCase() === String(mesaEncontrada.id).toLowerCase())) {
              setMesasLibres((prev) => [mesaEncontrada, ...prev]);
            }
            setMesaSeleccionada(mesaEncontrada);
          }
        }
      }"""

new_catch_end = """          if (m) {
            const mesaEncontrada = m;
            if (!mesas.some((item) => String(item.id).toLowerCase() === String(mesaEncontrada.id).toLowerCase())) {
              setMesasLibres((prev) => [mesaEncontrada, ...prev]);
            }
            setMesaSeleccionada(mesaEncontrada);
          }
        }
        }
      }"""
assert old_catch_end in upm_code, 'old_catch_end not found'
upm_code = upm_code.replace(old_catch_end, new_catch_end)

old_dep = "  }, [token, mesaIdInicial, onLogout]);"
new_dep = "  }, [token, mesaIdInicial, modoInicial, onLogout]);"
assert old_dep in upm_code, 'old_dep not found'
upm_code = upm_code.replace(old_dep, new_dep)

with open('frontend/src/hooks/usePedidoMesaManagement.ts', 'w', encoding='utf-8') as f:
    f.write(upm_code)
print('usePedidoMesaManagement.ts successfully updated')

# Update usePedidoLlevarManagement.ts
with open('frontend/src/hooks/usePedidoLlevarManagement.ts', 'r', encoding='utf-8') as f:
    upl_code = f.read().replace('\r\n', '\n')

old_upl_import = "import { pedidoService } from '../services/pedidoService';"
new_upl_import = "import { pedidoService } from '../services/pedidoService';\nimport { getMenusCompletosService } from '../services/menuCompletoService';"
if old_upl_import in upl_code:
    upl_code = upl_code.replace(old_upl_import, new_upl_import)

old_upl_load = """      const [prods, menuHoy] = await Promise.all([
        pedidoService.obtenerCatalogoPedido(token),
        menuDiaService.obtenerMenuHoy(token).catch(() => null)
      ]);
      const esDefinido = menuHoy ? menuHoy.definido : prods.length > 0;
      setMenuDefinido(esDefinido);
      setCatalogo(prods);
      if (menuHoy?.menusCompletos) {
        setMenusCompletos(menuHoy.menusCompletos);
      }"""

new_upl_load = """      const [prods, menuHoy, menusCompletosActivos] = await Promise.all([
        pedidoService.obtenerCatalogoPedido(token),
        menuDiaService.obtenerMenuHoy(token).catch(() => null),
        getMenusCompletosService(true, token).catch(() => [])
      ]);
      setMenuDefinido(true); // RN-142: Sin menú del día definido no se bloquean ventas
      setCatalogo(prods);
      if (menuHoy?.menusCompletos && menuHoy.menusCompletos.length > 0) {
        setMenusCompletos(menuHoy.menusCompletos);
      } else if (menusCompletosActivos && menusCompletosActivos.length > 0) {
        setMenusCompletos(menusCompletosActivos.map(m => ({
          idMenuCompleto: m.id,
          nombre: m.nombre,
          precio: m.precio,
          incluye: m.incluye,
          partes: m.partes.map(p => ({
            idParte: p.id,
            nombre: p.nombre,
            orden: p.orden,
            rolesPermitidos: p.rolesPermitidos,
            opciones: p.opciones.map(o => ({
              idOpcion: o.id,
              productoId: o.productoId,
              nombre: o.nombre,
              agotado: false
            }))
          }))
        })));
      }"""
assert old_upl_load in upl_code, 'old_upl_load not found'
upl_code = upl_code.replace(old_upl_load, new_upl_load)

with open('frontend/src/hooks/usePedidoLlevarManagement.ts', 'w', encoding='utf-8') as f:
    f.write(upl_code)
print('usePedidoLlevarManagement.ts successfully updated')

# Update PedidoLlevarPage.tsx
with open('frontend/src/pages/PedidoLlevarPage.tsx', 'r', encoding='utf-8') as f:
    plp_code = f.read().replace('\r\n', '\n')

old_plp_btn1 = """              disabled={
                !menuDefinido ||
                registrando ||"""
new_plp_btn1 = """              disabled={
                registrando ||"""
if old_plp_btn1 in plp_code:
    plp_code = plp_code.replace(old_plp_btn1, new_plp_btn1)

old_plp_btn2 = """          disabled={
            !menuDefinido ||
            registrando ||"""
new_plp_btn2 = """          disabled={
            registrando ||"""
if old_plp_btn2 in plp_code:
    plp_code = plp_code.replace(old_plp_btn2, new_plp_btn2)

with open('frontend/src/pages/PedidoLlevarPage.tsx', 'w', encoding='utf-8') as f:
    f.write(plp_code)
print('PedidoLlevarPage.tsx successfully updated')
