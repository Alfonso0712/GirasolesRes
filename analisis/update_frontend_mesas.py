# 1. Update MesaCard.tsx
with open('frontend/src/components/mesas/MesaCard.tsx', 'r', encoding='utf-8') as f:
    mc_code = f.read().replace('\r\n', '\n')

old_mc_click = """    if (esMozo) {
      if (esLibre) onAccionRol?.(mesa, 'REGISTRAR PEDIDO');
      else if (esOcupada) onAccionRol?.(mesa, 'AGREGAR PRODUCTOS');
    } else if (esCajero && esOcupada) {
      onAccionRol?.(mesa, 'COBRAR');
    } else if (esAdmin) {
      onEditar?.(mesa);
    }"""

new_mc_click = """    if (esMozo) {
      if (esLibre) onAccionRol?.(mesa, 'REGISTRAR PEDIDO');
      else if (esOcupada) onAccionRol?.(mesa, 'OPCIONES_MESA_OCUPADA');
    } else if (esCajero && esOcupada) {
      onAccionRol?.(mesa, 'COBRAR');
    } else if (esAdmin) {
      if (esOcupada) onAccionRol?.(mesa, 'OPCIONES_MESA_OCUPADA');
      else onEditar?.(mesa);
    }"""

assert old_mc_click in mc_code, 'old_mc_click not found'
mc_code = mc_code.replace(old_mc_click, new_mc_click)

with open('frontend/src/components/mesas/MesaCard.tsx', 'w', encoding='utf-8') as f:
    f.write(mc_code)
print('MesaCard.tsx updated')

# 2. Update MesasPage.tsx
with open('frontend/src/pages/MesasPage.tsx', 'r', encoding='utf-8') as f:
    mp_code = f.read().replace('\r\n', '\n')

old_mp_props = "onNavigateToPedido?: (mesaId: string) => void;"
new_mp_props = "onNavigateToPedido?: (mesaId: string, modo?: 'nuevo' | 'ampliacion') => void;"
assert old_mp_props in mp_code, 'old_mp_props not found'
mp_code = mp_code.replace(old_mp_props, new_mp_props)

old_mp_action = """  const handleAccionRol = (mesa: MesaItem, accion: string) => {
    if (accion === 'REGISTRAR PEDIDO' || accion === 'AGREGAR PRODUCTOS') {
      if (onNavigateToPedido) {
        onNavigateToPedido(mesa.id);
        return;
      }
    }
    if (accion === 'COBRAR') {
      if (onNavigateToCobro) {
        onNavigateToCobro({ id: mesa.id, nombre: mesa.nombre });
        return;
      }
    }
    setModalAccionRol({
      abierto: true,
      mesa,
      accion
    });
  };"""

new_mp_action = """  const [modalMesaOcupada, setModalMesaOcupada] = useState<{ mesa: MesaItem; cantidadPedidos: number } | null>(null);

  const handleAccionRol = async (mesa: MesaItem, accion: string) => {
    if (accion === 'REGISTRAR PEDIDO') {
      if (onNavigateToPedido) {
        onNavigateToPedido(mesa.id, 'nuevo');
        return;
      }
    }
    if (accion === 'AGREGAR PRODUCTOS') {
      if (onNavigateToPedido) {
        onNavigateToPedido(mesa.id, 'ampliacion');
        return;
      }
    }
    if (accion === 'OPCIONES_MESA_OCUPADA') {
      try {
        const res = await pedidoService.listarPedidos({ mesaId: mesa.id }, session.token);
        const abiertos = res.items.filter((p) => p.estado !== 'Pagado' && p.estado !== 'Anulado');
        const count = abiertos.length > 0 ? abiertos.length : 1;
        setModalMesaOcupada({ mesa, cantidadPedidos: count });
      } catch {
        setModalMesaOcupada({ mesa, cantidadPedidos: 1 });
      }
      return;
    }
    if (accion === 'COBRAR') {
      if (onNavigateToCobro) {
        onNavigateToCobro({ id: mesa.id, nombre: mesa.nombre });
        return;
      }
    }
    setModalAccionRol({
      abierto: true,
      mesa,
      accion
    });
  };"""

assert old_mp_action in mp_code, 'old_mp_action not found'
mp_code = mp_code.replace(old_mp_action, new_mp_action)

modal_msg95 = """      {/* Modal CUS06.1 / CUS06.3: Registrar / Editar Mesa */}
      <MesaFormModal
        isOpen={formModalOpen}
        onClose={handleCerrarForm}
        mesaAEditar={mesaAEditar}
        todasLasMesas={todasLasMesas}
        onSave={handleGuardarMesa}
      />

      {/* Modal MSG-95: Diálogo al elegir una mesa ocupada */}
      {modalMesaOcupada && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-neutral-200/80 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#B84500] flex items-center justify-center mx-auto mb-3 border border-amber-200">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="font-sans font-bold text-lg text-[#2C1A0E] mb-2">
              Mesa Ocupada
            </h3>
            <p className="text-xs sm:text-sm text-[#7C6F66] mb-6 leading-relaxed">
              La <strong>{modalMesaOcupada.mesa.nombre}</strong> ya tiene <strong>{modalMesaOcupada.cantidadPedidos}</strong> pedido(s) abierto(s). ¿Registrar un pedido nuevo o agregar productos a uno existente?
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  const mesaId = modalMesaOcupada.mesa.id;
                  setModalMesaOcupada(null);
                  onNavigateToPedido?.(mesaId, 'nuevo');
                }}
                className="flex-1 py-2.5 px-4 bg-[#C74E00] hover:bg-[#B84600] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                PEDIDO NUEVO
              </button>
              <button
                type="button"
                onClick={() => {
                  const mesaId = modalMesaOcupada.mesa.id;
                  setModalMesaOcupada(null);
                  onNavigateToPedido?.(mesaId, 'ampliacion');
                }}
                className="flex-1 py-2.5 px-4 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                AGREGAR PRODUCTOS
              </button>
            </div>
            <button
              type="button"
              onClick={() => setModalMesaOcupada(null)}
              className="mt-3 text-xs text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}"""

old_form_modal = """      {/* Modal CUS06.1 / CUS06.3: Registrar / Editar Mesa */}
      <MesaFormModal
        isOpen={formModalOpen}
        onClose={handleCerrarForm}
        mesaAEditar={mesaAEditar}
        todasLasMesas={todasLasMesas}
        onSave={handleGuardarMesa}
      />"""

assert old_form_modal in mp_code, 'old_form_modal not found'
mp_code = mp_code.replace(old_form_modal, modal_msg95)

with open('frontend/src/pages/MesasPage.tsx', 'w', encoding='utf-8') as f:
    f.write(mp_code)
print('MesasPage.tsx updated')

# 3. Update HomePage.tsx
with open('frontend/src/pages/HomePage.tsx', 'r', encoding='utf-8') as f:
    hp_code = f.read().replace('\r\n', '\n')

old_home_state = "  const [mesaSeleccionadaParaPedido, setMesaSeleccionadaParaPedido] = useState<string | null>(null);"
new_home_state = """  const [mesaSeleccionadaParaPedido, setMesaSeleccionadaParaPedido] = useState<string | null>(null);
  const [modoPedidoMesa, setModoPedidoMesa] = useState<'nuevo' | 'ampliacion'>('nuevo');"""
assert old_home_state in hp_code, 'old_home_state not found'
hp_code = hp_code.replace(old_home_state, new_home_state)

old_home_nav = """        <MesasPage
          session={session}
          onLogout={onLogout}
          onNavigateToPedido={(mesaId) => {
            setMesaSeleccionadaParaPedido(mesaId);
            setPaginaActiva('pedidos-mesa');
          }}"""

new_home_nav = """        <MesasPage
          session={session}
          onLogout={onLogout}
          onNavigateToPedido={(mesaId, modo) => {
            setMesaSeleccionadaParaPedido(mesaId);
            setModoPedidoMesa(modo || 'nuevo');
            setPaginaActiva('pedidos-mesa');
          }}"""
assert old_home_nav in hp_code, 'old_home_nav not found'
hp_code = hp_code.replace(old_home_nav, new_home_nav)

old_home_pm = """        <PedidoMesaPage
          session={session}
          mesaIdInicial={mesaSeleccionadaParaPedido}
          onLogout={onLogout}
          onVolverAMesas={() => setPaginaActiva('mesas')}
          onNavigateToMenuDia={() => setPaginaActiva('menu-dia')}
        />"""

new_home_pm = """        <PedidoMesaPage
          session={session}
          mesaIdInicial={mesaSeleccionadaParaPedido}
          modoInicial={modoPedidoMesa}
          onLogout={onLogout}
          onVolverAMesas={() => setPaginaActiva('mesas')}
          onNavigateToMenuDia={() => setPaginaActiva('menu-dia')}
        />"""
assert old_home_pm in hp_code, 'old_home_pm not found'
hp_code = hp_code.replace(old_home_pm, new_home_pm)

with open('frontend/src/pages/HomePage.tsx', 'w', encoding='utf-8') as f:
    f.write(hp_code)
print('HomePage.tsx updated')
