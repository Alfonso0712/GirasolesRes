import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { usePedidoMesaManagement } from '../hooks/usePedidoMesaManagement';
import {
  CatalogoPedido,
  ResumenPedidoPanel,
  PedidoMesaSelector,
  PedidoMesaModals,
  PedidoMesaHeader,
} from '../components/pedidos';
import { PageContainer } from '../components/layout';
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

  const campoContextualMesa = (
    <PedidoMesaSelector
      modo={modo}
      mesaSeleccionada={mesaSeleccionada}
      opcionesMesas={opcionesMesas}
      onSelectMesa={setMesaSeleccionada}
    />
  );

  return (
    <div className="flex-1 overflow-y-auto w-full scroll-thin">
      <PageContainer maxWidth="max-w-[1600px]" className="lg:px-5 xl:px-8 2xl:px-10">
        {/* 1. Encabezado Unificado */}
        <PedidoMesaHeader
          mesaSeleccionada={mesaSeleccionada}
          modo={modo}
          lineasBorradorCount={lineasBorrador.length}
          onLimpiarBorrador={solicitarDescarte}
          onVolverAMesas={onVolverAMesas}
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
        <PedidoMesaModals
          modalNotaOpen={modalNotaOpen}
          onCloseNota={() => setModalNotaOpen(false)}
          productoNombre={lineaParaNota?.nombre}
          observacionActual={lineaParaNota?.observacion}
          onGuardarNota={guardarNota}
          modalDescartarOpen={modalDescartarOpen}
          onCloseDescartar={() => setModalDescartarOpen(false)}
          onConfirmarDescarte={confirmarDescarte}
          modalArmarOpen={modalArmarOpen}
          menuParaArmar={menuParaArmar}
          onCloseArmar={() => {
            setModalArmarOpen(false);
            setMenuParaArmar(null);
          }}
          onConfirmarArmar={(elecciones, obs) => {
            if (menuParaArmar) {
              agregarMenuCompleto(menuParaArmar, elecciones, obs);
            }
          }}
          modalExitoOpen={modalExitoOpen}
          exitoData={exitoData}
          modo={modo}
          onNuevoPedido={reiniciarParaNuevoPedido}
          onVerMesas={onVolverAMesas}
        />
      </PageContainer>
    </div>
  );
};

export default PedidoMesaPage;
