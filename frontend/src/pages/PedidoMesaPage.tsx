import React, { useState } from 'react';
import { RotateCcw, ArrowLeft, AlertCircle } from 'lucide-react';
import { usePedidoMesaManagement } from '../hooks/usePedidoMesaManagement';
import {
  NotaObservacionModal,
  PedidoDescartarModal,
  PedidoConfirmacionModal,
  CatalogoPedido,
  ResumenPedidoPanel,
} from '../components/pedidos';
import { ArmarMenuCompletoModal } from '../components/menu-dia';
import { Button, Select } from '../components/ui';
import { PageHeader, PageContainer } from '../components/layout';
import { useHandedness } from '../hooks/useHandedness';
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
  const { isLeftHanded } = useHandedness();
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
    menuDefinido,
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

  const [menuParaArmar, setMenuParaArmar] = useState<MenuCompletoDia | null>(null);
  const [modalArmarOpen, setModalArmarOpen] = useState(false);

  // Atajo de teclado: Escape para descartar borrador si hay líneas y no hay modal abierto
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'Escape' &&
        !modalNotaOpen &&
        !modalExitoOpen &&
        !modalDescartarOpen &&
        !modalArmarOpen
      ) {
        if (lineasBorrador.length > 0) {
          setModalDescartarOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    lineasBorrador.length,
    modalNotaOpen,
    modalExitoOpen,
    modalDescartarOpen,
    modalArmarOpen,
    setModalDescartarOpen,
  ]);

  const categorias = [
    'Todas',
    ...(menusCompletos.length > 0 ? ['Menús Completos'] : []),
    ...Array.from(new Set(catalogo.map((p) => p.categoria).filter(Boolean))),
  ];

  const opcionesMesas = React.useMemo(() => {
    if (
      mesaSeleccionada &&
      !mesasLibres.some(
        (m) => String(m.id).toLowerCase() === String(mesaSeleccionada.id).toLowerCase()
      )
    ) {
      return [mesaSeleccionada, ...mesasLibres];
    }
    return mesasLibres;
  }, [mesasLibres, mesaSeleccionada]);

  const catalogoFiltrado = catalogo.filter((prod) => {
    const coincideCat = categoriaActiva === 'Todas' || prod.categoria === categoriaActiva;
    const coincideBusqueda =
      busqueda.trim() === '' ||
      prod.nombre.toLowerCase().includes(busqueda.toLowerCase().trim());
    return coincideCat && coincideBusqueda;
  });

  if (sinMesaInicial || mesaInvalida || (cargando && !mesaSeleccionada)) {
    return null;
  }

  const campoContextualMesa =
    modo === 'nuevo' ? (
      <Select
        value={mesaSeleccionada?.id || ''}
        onChange={(e) => {
          const m = opcionesMesas.find(
            (item) => String(item.id).toLowerCase() === e.target.value.toLowerCase()
          );
          setMesaSeleccionada(m || null);
        }}
        options={opcionesMesas.map((m) => ({
          value: String(m.id),
          label: `${m.nombre} (Libre)`,
        }))}
        placeholder="-- Seleccione Mesa Libre --"
        aria-label="Seleccionar mesa libre"
        selectClassName="!min-h-[42px] !py-2 !text-xs sm:!text-sm !rounded-xl !border-neutral-200 !font-medium"
      />
    ) : (
      <div className="w-full min-h-[42px] flex items-center gap-2 px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-900 shadow-2xs">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
        <span className="truncate">Mesa: {mesaSeleccionada?.nombre || 'Mesa'}</span>
      </div>
    );

  return (
    <div className="flex-1 overflow-y-auto w-full scroll-thin">
      <PageContainer maxWidth="max-w-[1600px]" className="lg:px-5 xl:px-8 2xl:px-10">
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
              type="button"
              onClick={() => setErrorGeneral(null)}
              className="text-rose-500 hover:text-rose-800 text-base leading-none p-1 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* 2. CUERPO PRINCIPAL: VISTA DIVIDIDA (CATÁLOGO + RESUMEN) */}
        <div className={`flex flex-col ${isLeftHanded ? 'lg:flex-row-reverse' : 'lg:flex-row'} min-h-0 gap-4 lg:h-[calc(100vh-196px)] lg:min-h-[500px]`}>
          <CatalogoPedido
            busqueda={busqueda}
            onBusquedaChange={setBusqueda}
            campoContextual={campoContextualMesa}
            cargando={cargando}
            menuDefinido={menuDefinido}
            esAdmin={session.rol === 'Administrador'}
            textoMenuNoDefinidoAdmin="Para habilitar la toma de pedidos en las mesas del salón, primero debe configurar y publicar el menú del día de hoy."
            textoMenuNoDefinidoOperador="No es posible abrir comandas hasta que el menú diario esté activo."
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
            lineasBorrador={lineasBorrador}
            onAgregarProducto={agregarProducto}
            onDisminuirProducto={disminuirProducto}
          />

          <ResumenPedidoPanel
            titulo={modo === 'ampliacion' ? 'Ampliación de pedido' : 'Pedido de mesa'}
            etiquetaContexto={mesaSeleccionada?.nombre || 'Sin Mesa'}
            modo={modo}
            pedidoExistente={pedidoExistente}
            lineasBorrador={lineasBorrador}
            erroresLineas={erroresLineas}
            notas={notas}
            onNotasChange={setNotas}
            cantidadTotalProductos={cantidadTotalProductos}
            totalCalculado={totalCalculado}
            totalGeneralConExistente={totalGeneralConExistente}
            registrando={registrando}
            deshabilitarConfirmar={!mesaSeleccionada}
            onAbrirNota={abrirModalNota}
            onRepetirLinea={repetirLinea}
            onDisminuirLinea={disminuirLinea}
            onQuitarLinea={quitarLineaByIndex}
            onRegistrarPedido={() => registrarPedido(onVolverAMesas)}
          />
        </div>

        {/* 3. MODALES DE APOYO */}
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
