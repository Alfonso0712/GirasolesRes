import React from 'react';
import type {
  BloqueVentasHoy,
  BloquePlatosHoy,
  BloquePedidosPorEstado,
  BloqueMesas,
  BloqueCajaAdmin,
  BloqueMenuAdmin,
  BloqueUltimoCierre,
  AlertaInicio
} from '../../types/inicio';
import {
  AdminQuickActions,
  AdminKpiCards,
  AdminAlertsSection,
  AdminTopPlatosCard,
  AdminPedidosEstadoCard,
  AdminOperacionesCol,
} from './admin';

export interface DashboardAdminViewProps {
  bloques: Record<string, any>;
  onNavigate: (pagina: string, params?: any) => void;
  renderBloqueError: (nombre: string) => React.ReactNode;
}

export const DashboardAdminView: React.FC<DashboardAdminViewProps> = ({
  bloques,
  onNavigate,
  renderBloqueError
}) => {
  const alertasRes = bloques.alertas;
  const ventasHoyRes = bloques.ventasHoy;
  const platosHoyRes = bloques.platosHoy;
  const pedidosRes = bloques.pedidosPorEstado;
  const mesasRes = bloques.mesas;
  const cajaRes = bloques.caja;
  const menuRes = bloques.menu;
  const ultimoCierreRes = bloques.ultimoCierre;

  const alertas: AlertaInicio[] = alertasRes?.estado === 'ok' ? (alertasRes.datos || []) : [];
  const ventasHoy: BloqueVentasHoy | null = ventasHoyRes?.estado === 'ok' ? ventasHoyRes.datos : null;
  const platosHoy: BloquePlatosHoy | null = platosHoyRes?.estado === 'ok' ? platosHoyRes.datos : null;
  const pedidos: BloquePedidosPorEstado | null = pedidosRes?.estado === 'ok' ? pedidosRes.datos : null;
  const mesas: BloqueMesas | null = mesasRes?.estado === 'ok' ? mesasRes.datos : null;
  const caja: BloqueCajaAdmin | null = cajaRes?.estado === 'ok' ? cajaRes.datos : null;
  const menu: BloqueMenuAdmin | null = menuRes?.estado === 'ok' ? menuRes.datos : null;
  const ultimoCierre: BloqueUltimoCierre | null = ultimoCierreRes?.estado === 'ok' ? ultimoCierreRes.datos : null;

  return (
    <div className="space-y-6">
      {/* 1. SECCIÓN DE ALERTAS (RV-147, RN-128) */}
      <AdminAlertsSection
        alertasRes={alertasRes}
        alertas={alertas}
        onNavigate={onNavigate}
        renderBloqueError={renderBloqueError}
      />

      {/* ACCESOS RÁPIDOS A MÓDULOS (RV-151, RV-153) */}
      <div>
        <AdminQuickActions onNavigate={onNavigate} />
      </div>

      {/* 2. CUATRO TARJETAS GRANDES DE RESUMEN (RV-145, RV-146, RV-150) */}
      <AdminKpiCards
        ventasHoyRes={ventasHoyRes}
        platosHoyRes={platosHoyRes}
        pedidosRes={pedidosRes}
        mesasRes={mesasRes}
        ventasHoy={ventasHoy}
        platosHoy={platosHoy}
        pedidos={pedidos}
        mesas={mesas}
        onNavigate={onNavigate}
        renderBloqueError={renderBloqueError}
      />

      {/* 3. BLOQUES DE DETALLE (TOP 5 PLATOS, PEDIDOS POR ESTADO, CAJA Y MENÚ) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna 1: Top 5 Platos Vendidos */}
        <AdminTopPlatosCard
          platosHoyRes={platosHoyRes}
          platosHoy={platosHoy}
          renderBloqueError={renderBloqueError}
        />

        {/* Columna 2: Desglose de Pedidos por Estado */}
        <AdminPedidosEstadoCard
          pedidosRes={pedidosRes}
          pedidos={pedidos}
          onNavigate={onNavigate}
          renderBloqueError={renderBloqueError}
        />

        {/* Columna 3: Estado de Caja, Menú y Último Cierre */}
        <AdminOperacionesCol
          cajaRes={cajaRes}
          caja={caja}
          menuRes={menuRes}
          menu={menu}
          ultimoCierreRes={ultimoCierreRes}
          ultimoCierre={ultimoCierre}
          onNavigate={onNavigate}
          renderBloqueError={renderBloqueError}
        />
      </div>
    </div>
  );
};

export default DashboardAdminView;
