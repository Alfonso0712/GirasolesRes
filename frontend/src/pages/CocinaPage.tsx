import React from 'react';
import { PlatosAgotadosModal } from '../components/menu-dia';
import {
  CocinaResumenBar,
  AvisoNuevoPedidoCocinaModal,
  CocinaDesconexionBanner,
  CocinaAvisoDeshacer,
  CocinaZonasBoard,
  CocinaHeaderActions,
  useCocinaKds,
} from '../components/cocina';
import { PageHeader, PageContainer } from '../components/layout';
import type { UserSession } from '../types/auth';

interface CocinaPageProps {
  session: UserSession;
  onLogout: () => void;
  onUpdateSession?: (session: UserSession) => void;
}

export const CocinaPage: React.FC<CocinaPageProps> = ({ session, onLogout, onUpdateSession }) => {
  const {
    comandas,
    resumen,
    cargando,
    errorCarga,
    sinConexion,
    segundosSinConexion,
    sonidoActivado,
    toggleSonido,
    abrirModalPlatosAgotados,
    setAbrirModalPlatosAgotados,
    comandasNuevas,
    avisoDeshacer,
    notificacionNueva,
    setNotificacionNueva,
    procesandoIds,
    segundosDesdeActualizacion,
    tocandoTarjetaRef,
    cargarComandas,
    handleIniciarPreparacion,
    handleMarcarComoLista,
    handleDeshacer,
    comandasPendientes,
    comandasEnPreparacion,
  } = useCocinaKds({ session, onLogout, onUpdateSession });

  return (
    <div className="flex-1 overflow-y-auto w-full scroll-thin">
      <PageContainer maxWidth="max-w-[1600px]" className="lg:px-8 2xl:px-10 bg-canvas text-neutral-900 select-none">
        {/* Franja superior de desconexión (MSG-132) */}
        <CocinaDesconexionBanner
          sinConexion={sinConexion}
          segundosSinConexion={segundosSinConexion}
          onReintentar={() => cargarComandas(false)}
        />

        {/* 1. Encabezado Unificado */}
        <PageHeader
          title="Cocina (KDS)"
          subtitle="Gestión operativa de comandas de cocina y despacho de pedidos en tiempo real."
          count={resumen.reduce((acc, r) => acc + r.cantidad, 0)}
          countLabel="porciones por preparar"
          actions={
            <CocinaHeaderActions
              onAbrirPlatosAgotados={() => setAbrirModalPlatosAgotados(true)}
              sonidoActivado={sonidoActivado}
              onToggleSonido={toggleSonido}
              segundosDesdeActualizacion={segundosDesdeActualizacion}
              cargando={cargando}
              onActualizar={() => cargarComandas(false)}
            />
          }
        />

        {/* Banda Superior "Por preparar" (RV-86, Nielsen 8) */}
        <CocinaResumenBar resumen={resumen} />

        {/* Contenido Principal: Zonas "Pendientes" y "En preparación" (RV-85) */}
        <CocinaZonasBoard
          cargando={cargando}
          comandas={comandas}
          errorCarga={errorCarga}
          onReintentar={() => cargarComandas(false)}
          comandasPendientes={comandasPendientes}
          comandasEnPreparacion={comandasEnPreparacion}
          comandasNuevas={comandasNuevas}
          procesandoIds={procesandoIds}
          onIniciarPreparacion={handleIniciarPreparacion}
          onMarcarComoLista={handleMarcarComoLista}
          tocandoTarjetaRef={tocandoTarjetaRef}
        />

        {/* Aviso Inferior Flotante con Botón DESHACER (RV-88, RN-78, RN-79 - 10s) */}
        <CocinaAvisoDeshacer aviso={avisoDeshacer} onDeshacer={handleDeshacer} />

        {/* Modal emergente de NUEVA COMANDA (CUS10 / RV-92) */}
        <AvisoNuevoPedidoCocinaModal
          aviso={notificacionNueva}
          onCerrar={() => setNotificacionNueva(null)}
        />

        {/* Modal PLATOS AGOTADOS (CUS05.2 / RN-83) */}
        <PlatosAgotadosModal
          isOpen={abrirModalPlatosAgotados}
          onClose={() => setAbrirModalPlatosAgotados(false)}
          token={session.token}
        />
      </PageContainer>
    </div>
  );
};

export default CocinaPage;
