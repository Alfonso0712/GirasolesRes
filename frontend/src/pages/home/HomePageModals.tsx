import React from 'react';
import { Check } from 'lucide-react';
import { LogoutModal, InactivityModal } from '../../components/layout';
import { ChangePasswordModal } from '../../components/usuarios';
import { ConfiguracionModal } from '../../components/configuracion';
import {
  AvisoComandaModal,
  AvisoNuevoPedidoCocinaModal,
  type NuevoPedidoCocinaInfo,
} from '../../components/cocina';
import type { UserSession } from '../../types/auth';
import type { AvisoComandaDto } from '../../types/pedido';

export interface HomePageModalsProps {
  session: UserSession;
  mostrarModalLogout: boolean;
  setMostrarModalLogout: (open: boolean) => void;
  cerrandoLogout: boolean;
  handleConfirmLogout: () => Promise<void>;
  mostrarModalInactividad: boolean;
  handleContinuarSesion: () => Promise<void>;
  handleTimeoutInactividad: () => void;
  mostrarModalPassword: boolean;
  setMostrarModalPassword: (open: boolean) => void;
  handlePasswordSuccess: (nuevoToken: string, mensaje: string) => void;
  handleForceLogoutDueToFailedAttempts: () => void;
  mostrarModalConfiguracion: boolean;
  setMostrarModalConfiguracion: (open: boolean) => void;
  avisosPendientes: AvisoComandaDto[];
  handleCerrarAviso: (avisoId: string) => Promise<void>;
  cerrandoAviso: boolean;
  avisoNuevaComandaCocinero: NuevoPedidoCocinaInfo | null;
  setAvisoNuevaComandaCocinero: (aviso: NuevoPedidoCocinaInfo | null) => void;
  setPaginaActiva: (pagina: string) => void;
  toastMensaje: string | null;
  setToastMensaje: (msg: string | null) => void;
}

export const HomePageModals: React.FC<HomePageModalsProps> = ({
  session,
  mostrarModalLogout,
  setMostrarModalLogout,
  cerrandoLogout,
  handleConfirmLogout,
  mostrarModalInactividad,
  handleContinuarSesion,
  handleTimeoutInactividad,
  mostrarModalPassword,
  setMostrarModalPassword,
  handlePasswordSuccess,
  handleForceLogoutDueToFailedAttempts,
  mostrarModalConfiguracion,
  setMostrarModalConfiguracion,
  avisosPendientes,
  handleCerrarAviso,
  cerrandoAviso,
  avisoNuevaComandaCocinero,
  setAvisoNuevaComandaCocinero,
  setPaginaActiva,
  toastMensaje,
  setToastMensaje,
}) => {
  return (
    <>
      {/* Vista 3.1: Modal de confirmación para cerrar sesión (MSG-40 / RV-31) */}
      <LogoutModal
        isOpen={mostrarModalLogout}
        onClose={() => setMostrarModalLogout(false)}
        onConfirm={handleConfirmLogout}
        loading={cerrandoLogout}
      />

      {/* Vista 3.1b: Modal de aviso de inactividad (MSG-42 / RV-32 / RN-20) */}
      <InactivityModal
        isOpen={mostrarModalInactividad}
        onContinue={handleContinuarSesion}
        onTimeout={handleTimeoutInactividad}
      />

      {/* Vista 3.2: Modal de cambio de contraseña propia (HU-09 / RF-07) */}
      <ChangePasswordModal
        isOpen={mostrarModalPassword}
        onClose={() => setMostrarModalPassword(false)}
        token={session.token}
        onSuccess={handlePasswordSuccess}
        onForceLogoutDueToFailedAttempts={handleForceLogoutDueToFailedAttempts}
      />

      {/* Modal de Configuración y Ergonomía (Modo Zurdo / Diestro / Tema) */}
      <ConfiguracionModal
        isOpen={mostrarModalConfiguracion}
        onClose={() => setMostrarModalConfiguracion(false)}
        token={session.token}
      />

      {/* CUS09.3: Modal emergente de aviso de comanda lista (HU27 / RF-27 / RN-71 / RV-83) */}
      <AvisoComandaModal
        aviso={avisosPendientes.length > 0 ? avisosPendientes[0] : null}
        onCerrar={handleCerrarAviso}
        cargando={cerrandoAviso}
      />

      {/* Modal emergente de nueva comanda para cocinero */}
      <AvisoNuevoPedidoCocinaModal
        aviso={avisoNuevaComandaCocinero}
        onCerrar={() => setAvisoNuevaComandaCocinero(null)}
        onIrACocina={() => {
          setAvisoNuevaComandaCocinero(null);
          setPaginaActiva('cocina');
        }}
      />

      {/* Notificación flotante de confirmación (MSG-47 / RV-28 - 4 segundos) */}
      {toastMensaje && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-[#1B4332] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/40 animate-in slide-in-from-bottom-4 fade-in duration-200"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-xs font-semibold tracking-wide">{toastMensaje}</span>
          <button
            type="button"
            onClick={() => setToastMensaje(null)}
            className="ml-3 text-neutral-500 hover:text-white text-base leading-none p-1 cursor-pointer"
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
};
