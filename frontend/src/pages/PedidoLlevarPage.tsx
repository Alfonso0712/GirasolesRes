import React, { useState } from 'react';
import { RotateCcw, ArrowLeft, AlertCircle, User } from 'lucide-react';
import { usePedidoLlevarManagement } from '../hooks/usePedidoLlevarManagement';
import {
  NotaObservacionModal,
  PedidoDescartarModal,
  PedidoLlevarConfirmacionModal,
  CatalogoPedido,
  ResumenPedidoPanel,
} from '../components/pedidos';
import { ArmarMenuCompletoModal } from '../components/menu-dia';
import { Button } from '../components/ui';
import { PageHeader, PageContainer } from '../components/layout';
import type { UserSession } from '../types/auth';
import type { MenuCompletoDia } from '../types/menuDia';

interface PedidoLlevarPageProps {
  session: UserSession;
  onLogout: (banner?: { type: 'success' | 'error' | 'info' | 'warning'; message: string }) => void;
  onVolver?: () => void;
  onNavigateToCobro?: (pedidoId: string) => void;
  onNavigateToMenuDia?: () => void;
}

export const PedidoLlevarPage: React.FC<PedidoLlevarPageProps> = ({
  session,
  onLogout,
  onVolver,
  onNavigateToCobro,
  onNavigateToMenuDia,
}) => {
  const {
    cargando,
    registrando,
    errorGeneral,
    erroresLineas,
    catalogoFiltrado,
    menusCompletos,
    categorias,
    categoriaActiva,
    setCategoriaActiva,
    busqueda,
    setBusqueda,
    referencia,
    handleCambioReferencia,
    errorReferencia,
    notas,
    setNotas,
    lineasBorrador,
    agregarProducto,
    agregarMenuCompleto,
    repetirLinea,
    disminuirProducto,
    disminuirLinea,
    quitarLineaByIndex,
    totalCalculado,
    cantidadTotalProductos,
    modalDescartarOpen,
    setModalDescartarOpen,
    descartarPedido,
    modalExitoOpen,
    setModalExitoOpen,
    exitoData,
    iniciarNuevoPedido,
    registrarPedidoLlevar,
    modalNotaOpen,
    setModalNotaOpen,
    lineaParaNota,
    abrirModalNota,
    guardarNota,
    menuDefinido,
    recargarCatalogo,
  } = usePedidoLlevarManagement({
    token: session.token,
    onLogout,
  });

  const [menuParaArmar, setMenuParaArmar] = useState<MenuCompletoDia | null>(null);
  const [modalArmarOpen, setModalArmarOpen] = useState(false);

  // Atajo de teclado: Escape para descartar pedido si hay líneas y no hay modal abierto
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

  const campoContextualLlevar = (
    <div className="relative w-full">
      <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        id="referencia-cliente"
        type="text"
        value={referencia}
        onChange={(e) => handleCambioReferencia(e.target.value)}
        maxLength={30}
        placeholder="Referencia cliente (opcional)..."
        aria-label="Referencia cliente (opcional)"
        className={`w-full min-h-[42px] pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border bg-surface text-ink placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 transition-all ${
          errorReferencia
            ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/40 text-rose-900'
            : 'border-neutral-200 focus:ring-accent/20 focus:border-accent'
        }`}
      />
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto w-full scroll-thin">
      <PageContainer maxWidth="max-w-[1600px]" className="lg:px-5 xl:px-8 2xl:px-10">
        {/* 1. Encabezado Unificado */}
        <PageHeader
          title="Pedido para Llevar"
          subtitle="Registre el pedido para llevar del cliente y envíe la comanda a cocina."
          badge={
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs">
                Para llevar
              </span>
            </div>
          }
          actions={
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setModalDescartarOpen(true)}
                disabled={lineasBorrador.length === 0}
                className="text-xs px-3.5 py-2 min-h-[40px]"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Limpiar borrador
              </Button>

              {onVolver && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onVolver}
                  className="text-xs px-3.5 py-2 min-h-[40px]"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  Volver a mesas
                </Button>
              )}
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
              onClick={() => recargarCatalogo()}
              className="text-rose-500 hover:text-rose-800 text-base leading-none p-1 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* 2. CUERPO PRINCIPAL: VISTA DIVIDIDA (CATÁLOGO + RESUMEN) */}
        <div className="flex flex-col lg:flex-row min-h-0 gap-4 lg:h-[calc(100vh-196px)] lg:min-h-[500px]">
          <CatalogoPedido
            busqueda={busqueda}
            onBusquedaChange={setBusqueda}
            campoContextual={campoContextualLlevar}
            cargando={cargando}
            menuDefinido={menuDefinido}
            esAdmin={session.rol === 'Administrador'}
            textoMenuNoDefinidoAdmin="Para habilitar la toma de pedidos para llevar, primero debe configurar y publicar el menú del día de hoy."
            textoMenuNoDefinidoOperador="No es posible registrar comandas para llevar hasta que el menú diario esté activo."
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
            titulo="Pedido para llevar"
            etiquetaContexto={referencia.trim() ? referencia.trim() : 'Para llevar'}
            modo="nuevo"
            lineasBorrador={lineasBorrador}
            erroresLineas={erroresLineas}
            notas={notas}
            onNotasChange={setNotas}
            cantidadTotalProductos={cantidadTotalProductos}
            totalCalculado={totalCalculado}
            registrando={registrando}
            deshabilitarConfirmar={Boolean(errorReferencia)}
            onAbrirNota={abrirModalNota}
            onRepetirLinea={repetirLinea}
            onDisminuirLinea={disminuirLinea}
            onQuitarLinea={quitarLineaByIndex}
            onRegistrarPedido={registrarPedidoLlevar}
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
          onConfirmarDescarte={descartarPedido}
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

        <PedidoLlevarConfirmacionModal
          isOpen={modalExitoOpen}
          numeroPedido={exitoData?.numeroPedido || 0}
          referencia={exitoData?.referencia}
          total={exitoData?.total || 0}
          onCobrarAhora={() => {
            setModalExitoOpen(false);
            if (exitoData?.pedidoId && onNavigateToCobro) {
              onNavigateToCobro(exitoData.pedidoId);
            } else if (onVolver) {
              onVolver();
            }
          }}
          onNuevoPedido={iniciarNuevoPedido}
          onVerPedidos={() => {
            setModalExitoOpen(false);
            if (onVolver) onVolver();
          }}
        />
      </PageContainer>
    </div>
  );
};

export default PedidoLlevarPage;
