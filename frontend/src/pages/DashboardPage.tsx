import React from 'react';
import { useInicioDashboard } from '../hooks/useInicioDashboard';
import type { UserSession } from '../types/auth';
import {
  DashboardAdminView,
  DashboardCajeroView,
  DashboardMozoView,
  DashboardCocineroView
} from '../components/dashboard';
import {
  RefreshCw,
  RotateCcw,
  WifiOff,
  AlertCircle
} from 'lucide-react';
import { PageHeader, PageContainer } from '../components/layout';

export interface DashboardPageProps {
  session: UserSession;
  onNavigate: (pagina: string, params?: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ session, onNavigate }) => {
  const {
    data,
    cargandoInicial,
    actualizando,
    errorGeneral,
    segundosDesdeActualizacion,
    sinConexion,
    reintentandoBloque,
    refrescarManual,
    reintentarBloque
  } = useInicioDashboard({ token: session.token, rol: session.rol });

  if (cargandoInicial) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-accent mb-4 animate-pulse">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
        <h2 className="text-xl font-bold font-sans text-neutral-800 mb-1">
          Cargando panel de inicio...
        </h2>
        <p className="text-xs text-neutral-500 max-w-sm">
          Sincronizando los indicadores y operaciones del restaurante en tiempo real.
        </p>
      </div>
    );
  }

  if (errorGeneral && !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-danger mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold font-sans text-neutral-800 mb-2">
          No se pudo cargar el panel
        </h2>
        <p className="text-sm text-neutral-600 max-w-md mb-6">
          {errorGeneral}
        </p>
        <button
          type="button"
          onClick={() => refrescarManual()}
          className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm shadow-sm hover:bg-primary transition-colors cursor-pointer flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
      </div>
    );
  }

  const bloques = data?.bloques || {};

  // Helper para renderizar error específico por bloque (RV-149, RNF-55)
  const renderBloqueError = (nombreBloque: string) => (
    <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl text-center">
      <AlertCircle className="w-6 h-6 text-danger mx-auto mb-2" />
      <p className="text-xs font-semibold text-rose-800 mb-1">
        No se pudo cargar este bloque
      </p>
      <p className="text-xs text-danger mb-3">
        Intente nuevamente sin afectar el resto del panel.
      </p>
      <button
        type="button"
        onClick={() => reintentarBloque(nombreBloque)}
        disabled={reintentandoBloque[nombreBloque]}
        className="px-3 py-1.5 bg-surface border border-rose-300 text-rose-700 text-xs font-medium rounded-lg hover:bg-rose-50 transition-colors shadow-xs cursor-pointer inline-flex items-center gap-1.5"
      >
        <RefreshCw className={`w-3 h-3 ${reintentandoBloque[nombreBloque] ? 'animate-spin' : ''}`} />
        Reintentar
      </button>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto w-full scroll-thin">
      <PageContainer>
        {/* 1. Encabezado Unificado */}
        <PageHeader
          title={`Bienvenido/a, ${session.nombre}`}
          subtitle="Resumen operativo y métricas principales según su rol de trabajo."
          badge={
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs">
              {session.rol}
            </span>
          }
          actions={
            <div className="flex items-center gap-3 shrink-0">
              {sinConexion ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                  <WifiOff className="w-3.5 h-3.5 text-warning" />
                  Sin conexión
                </span>
              ) : actualizando ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-accent" />
                  Actualizando...
                </span>
              ) : (
                <span className="text-xs text-neutral-500 font-medium tabular-nums hidden sm:inline">
                  Actualizado hace <span className="font-semibold text-neutral-700">{segundosDesdeActualizacion}</span> s
                </span>
              )}

              <button
                type="button"
                onClick={() => refrescarManual()}
                disabled={actualizando}
                aria-label="Actualizar datos del panel"
                className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-neutral-200 bg-surface hover:bg-neutral-50 text-neutral-700 shadow-2xs flex items-center gap-2 transition-colors cursor-pointer min-h-[40px] disabled:opacity-60"
              >
                <RotateCcw className={`w-3.5 h-3.5 text-accent ${actualizando ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
            </div>
          }
        />

        {/* RENDERIZADO MODULAR COMPUESTO SEGÚN ROL */}
        {session.rol === 'Administrador' && (
          <DashboardAdminView
            bloques={bloques}
            onNavigate={onNavigate}
            renderBloqueError={renderBloqueError}
          />
        )}
        {session.rol === 'Cajero' && (
          <DashboardCajeroView
            bloques={bloques}
            onNavigate={onNavigate}
            renderBloqueError={renderBloqueError}
          />
        )}
        {session.rol === 'Mozo' && (
          <DashboardMozoView
            bloques={bloques}
            onNavigate={onNavigate}
            renderBloqueError={renderBloqueError}
          />
        )}
        {session.rol === 'Cocinero' && (
          <DashboardCocineroView
            bloques={bloques}
            onNavigate={onNavigate}
            renderBloqueError={renderBloqueError}
          />
        )}
      </PageContainer>
    </div>
  );
};

export default DashboardPage;
