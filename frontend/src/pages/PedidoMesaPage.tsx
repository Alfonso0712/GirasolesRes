import React, { useState } from 'react';
import {
  RotateCcw,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { usePedidoMesaManagement } from '../hooks/usePedidoMesaManagement';
import {
  NotaObservacionModal,
  PedidoDescartarModal,
  PedidoConfirmacionModal,
  PedidoCatalogoPanel,
  PedidoTicketSidebar,
  PedidoMobileDrawer
} from '../components/pedidos';
import { ArmarMenuCompletoModal } from '../components/menu-dia';
import { Button } from '../components/ui';
import { PageHeader, PageContainer } from '../components/layout';
import type { UserSession } from '../types/auth';
import type { MenuCompletoDia } from '../types/menuDia';

interface PedidoMesaPageProps {
  session: UserSession;
  mesaIdInicial?: string | null;
  modoInicial?: 'nuevo' | 'ampliacion';
  pedidoIdInicial?: string | null;
  onLogout: (banner?: { type: 'success' | 'error' | 'info' | 'warning'; message: string }) => void;
  onVolverAMesas: () => void;
  onNavigateToMenuDia?: () => void;
}

export const PedidoMesaPage: React.FC<PedidoMesaPageProps> = ({
  session,
  mesaIdInicial,
  modoInicial,
  pedidoIdInicial,
  onLogout,
  onVolverAMesas,
  onNavigateToMenuDia,
}) => {
  const {
    cargando,
    registrando,
    errorGeneral,
    setErrorGeneral,
    erroresLineas,
    catalogo,
    menusCompletos,
    mesasLibres,
    mesaSeleccionada,
    setMesaSeleccionada,
    mesaInvalida,
    modo,
    pedidoExistente,
    lineasBorrador,
    notas,
    setNotas,
    categoriaActiva,
    setCategoriaActiva,
    busqueda,
    setBusqueda,
    modalDescartarOpen,
    setModalDescartarOpen,
    modalExitoOpen,
    exitoData,
    modalNotaOpen,
    setModalNotaOpen,
    lineaParaNota,
    agregarProducto,
    agregarMenuCompleto,
    repetirLinea,
    disminuirProducto,
    disminuirLinea,
    quitarLineaByIndex,
    abrirModalNota,
    guardarNota,
    solicitarDescarte,
    confirmarDescarte,
    reiniciarParaNuevoPedido,
    totalCalculado,
    totalGeneralConExistente,
    cantidadTotalProductos,
    registrarPedido,
    menuDefinido
  } = usePedidoMesaManagement({
    token: session.token,
    mesaIdInicial,
    modoInicial,
    pedidoIdInicial,
    onLogout,
  });

  const sinMesaInicial = !mesaIdInicial || !String(mesaIdInicial).trim();

  React.useEffect(() => {
    if (sinMesaInicial || mesaInvalida) {
      onVolverAMesas();
    }
  }, [sinMesaInicial, mesaInvalida, onVolverAMesas]);

  // Modal para armado de Menú Completo paso a paso
  const [menuParaArmar, setMenuParaArmar] = useState<MenuCompletoDia | null>(null);
  const [modalArmarOpen, setModalArmarOpen] = useState(false);

  // Visibilidad del resumen en dispositivos móviles (drawer / bottom sheet)
  const [drawerMovilAbierto, setDrawerMovilAbierto] = useState(false);

  // Categorías presentes en el catálogo
  const categorias = [
    'Todas',
    ...(menusCompletos.length > 0 ? ['Menús Completos'] : []),
    ...Array.from(new Set(catalogo.map((p) => p.categoria)))
  ];

  // Lista de mesas para el selector garantizando que la mesa seleccionada esté incluida
  const opcionesMesas = React.useMemo(() => {
    if (
      mesaSeleccionada &&
      !mesasLibres.some((m) => String(m.id).toLowerCase() === String(mesaSeleccionada.id).toLowerCase())
    ) {
      return [mesaSeleccionada, ...mesasLibres];
    }
    return mesasLibres;
  }, [mesasLibres, mesaSeleccionada]);

  // Catálogo filtrado por categoría y búsqueda
  const catalogoFiltrado = catalogo.filter((prod) => {
    const coincideCat = categoriaActiva === 'Todas' || prod.categoria === categoriaActiva;
    const coincideBusqueda =
      busqueda.trim() === '' ||
      prod.nombre.toLowerCase().includes(busqueda.toLowerCase().trim());
    return coincideCat && coincideBusqueda;
  });

  // Agrupación por categoría si está en "Todas"
  const productosPorCategoria: Record<string, typeof catalogo> = {};
  catalogoFiltrado.forEach((prod) => {
    if (!productosPorCategoria[prod.categoria]) {
      productosPorCategoria[prod.categoria] = [];
    }
    productosPorCategoria[prod.categoria].push(prod);
  });

  if (sinMesaInicial || mesaInvalida || (cargando && !mesaSeleccionada)) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto w-full scroll-thin">
      <PageContainer maxWidth="max-w-[1600px]" className="lg:px-8 2xl:px-10">
        {/* 1. Encabezado Unificado */}
        <PageHeader
          title="Pedido de Mesa"
          subtitle="Seleccione la mesa y los productos de la carta para generar la comanda a cocina."
          badge={
            <div className="flex items-center gap-2">
              {mesaSeleccionada && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                  {mesaSeleccionada.nombre}
                </span>
              )}
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs">
                {modo === 'ampliacion' ? 'Ampliación' : 'Nuevo pedido'}
              </span>
            </div>
          }
          actions={
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="secondary"
                onClick={solicitarDescarte}
                disabled={lineasBorrador.length === 0}
                className="text-xs px-3.5 py-2 min-h-[40px]"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Limpiar borrador
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={onVolverAMesas}
                className="text-xs px-3.5 py-2 min-h-[40px]"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Volver a mesas
              </Button>
            </div>
          }
        />

        {/* Alerta de Error General si existiera */}
        {errorGeneral && (
          <div className="shrink-0 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-700 text-xs sm:text-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-danger" />
              <span>{errorGeneral}</span>
            </div>
            <button
              onClick={() => setErrorGeneral(null)}
              className="text-rose-500 hover:text-rose-800 text-base leading-none p-1 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* 2. CUERPO PRINCIPAL: VISTA DIVIDIDA */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 gap-4 lg:min-h-[640px] lg:h-[calc(100vh-140px)]">
          {/* PANEL IZQUIERDO: Catálogo */}
          <PedidoCatalogoPanel
            busqueda={busqueda}
            onBusquedaChange={setBusqueda}
            modo={modo}
            mesaSeleccionada={mesaSeleccionada}
            opcionesMesas={opcionesMesas}
            onMesaSeleccionadaChange={setMesaSeleccionada}
            cargando={cargando}
            menuDefinido={menuDefinido}
            esAdmin={session.rol === 'Administrador'}
            onNavigateToMenuDia={onNavigateToMenuDia}
            categorias={categorias}
            categoriaActiva={categoriaActiva}
            onCategoriaActivaChange={setCategoriaActiva}
            menusCompletos={menusCompletos}
            onArmarMenuCompleto={(m) => {
              setMenuParaArmar(m);
              setModalArmarOpen(true);
            }}
            catalogoFiltrado={catalogoFiltrado}
            productosPorCategoria={productosPorCategoria}
            lineasBorrador={lineasBorrador}
            onAgregarProducto={agregarProducto}
            onDisminuirProducto={disminuirProducto}
          />

          {/* PANEL DERECHO: Resumen del Pedido (Desktop) */}
          <PedidoTicketSidebar
            modo={modo}
            mesaSeleccionada={mesaSeleccionada}
            pedidoExistente={pedidoExistente}
            lineasBorrador={lineasBorrador}
            erroresLineas={erroresLineas}
            notas={notas}
            onNotasChange={setNotas}
            cantidadTotalProductos={cantidadTotalProductos}
            totalCalculado={totalCalculado}
            totalGeneralConExistente={totalGeneralConExistente}
            registrando={registrando}
            onAbrirNota={abrirModalNota}
            onRepetirLinea={repetirLinea}
            onDisminuirLinea={disminuirLinea}
            onQuitarLinea={quitarLineaByIndex}
            onRegistrarPedido={() => registrarPedido(onVolverAMesas)}
          />
        </div>

        {/* 3. BARRA INFERIOR / DRAWER MÓVIL */}
        <PedidoMobileDrawer
          isOpen={drawerMovilAbierto}
          onOpenChange={setDrawerMovilAbierto}
          modo={modo}
          mesaSeleccionada={mesaSeleccionada}
          cantidadTotalProductos={cantidadTotalProductos}
          totalCalculado={totalCalculado}
          totalGeneralConExistente={totalGeneralConExistente}
          registrando={registrando}
          lineasBorrador={lineasBorrador}
          erroresLineas={erroresLineas}
          notas={notas}
          onNotasChange={setNotas}
          onAbrirNota={abrirModalNota}
          onRepetirLinea={repetirLinea}
          onDisminuirLinea={disminuirLinea}
          onQuitarLinea={quitarLineaByIndex}
          onRegistrarPedido={() => registrarPedido(onVolverAMesas)}
        />

        {/* 4. MODALES DE APOYO */}
        <NotaObservacionModal
          isOpen={modalNotaOpen}
          onClose={() => setModalNotaOpen(false)}
          productoNombre={lineaParaNota?.nombre || 'Plato'}
          observacionActual={lineaParaNota?.observacion || ''}
          onGuardar={guardarNota}
        />

        <PedidoDescartarModal
          isOpen={modalDescartarOpen}
          onClose={() => setModalDescartarOpen(false)}
          onConfirmarDescarte={confirmarDescarte}
        />

        <ArmarMenuCompletoModal
          isOpen={modalArmarOpen}
          onClose={() => {
            setModalArmarOpen(false);
            setMenuParaArmar(null);
          }}
          menu={menuParaArmar}
          onConfirm={(elecciones, obs) => {
            if (menuParaArmar) {
              agregarMenuCompleto(menuParaArmar, elecciones, obs);
            }
          }}
        />

        {exitoData && (
          <PedidoConfirmacionModal
            isOpen={modalExitoOpen}
            modo={modo}
            numeroPedido={exitoData.numeroPedido}
            mesaNombre={exitoData.mesaNombre}
            total={exitoData.total}
            onNuevoPedido={reiniciarParaNuevoPedido}
            onVerMesas={onVolverAMesas}
          />
        )}
      </PageContainer>
    </div>
  );
};

export default PedidoMesaPage;
