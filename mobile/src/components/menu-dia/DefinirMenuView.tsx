import React, { useState, useMemo, useEffect } from 'react';
import {
  CalendarCheck,
  UtensilsCrossed,
  AlertCircle,
  Save,
} from 'lucide-react';
import { useMenuDiaEdicion } from '../../hooks/useMenuDiaEdicion';
import {
  CATALOGO_MENUS_COMPLETOS,
  MSG_102,
} from '../../utils/menuDia';
import { formatLimaFechaLarga } from '../../utils/fechas';
import { PageHeader } from '../layout/PageHeader';
import { StatusBadge } from '../ui/StatusBadge';
import { SkeletonList } from '../ui/Skeleton';
import { ErrorState } from '../ui/ErrorState';
import { EmptyState } from '../ui/EmptyState';
import { ConfirmSheet } from '../ui/ConfirmSheet';
import { SheetActions } from '../ui/SheetActions';
import { GrupoAcordeonMenu } from './GrupoAcordeonMenu';
import { TarjetaMenuCompletoEdicion } from './TarjetaMenuCompletoEdicion';
import { useBackHandler } from '../../hooks/useBackHandler';
import { useHaptics } from '../../hooks/useHaptics';
import { useToast } from '../../context/ToastContext';

export type SeccionDefinirMenu = 'menus' | 'opciones' | 'carta';

export interface DefinirMenuViewProps {
  onVolver?: () => void;
  seccionInicial?: SeccionDefinirMenu;
  headerExtra?: React.ReactNode;
  onCambiosSinGuardarChange?: (tieneCambios: boolean) => void;
  solicitudSalirPendiente?: (() => void) | null;
  onCancelarSolicitudSalir?: () => void;
}

export const DefinirMenuView: React.FC<DefinirMenuViewProps> = ({
  onVolver,
  seccionInicial = 'menus',
  headerExtra,
  onCambiosSinGuardarChange,
  solicitudSalirPendiente = null,
  onCancelarSolicitudSalir,
}) => {
  const {
    hoy,
    candidatos,
    gruposOpciones,
    gruposCarta,
    actual,
    agotadosPorId,
    cargando,
    guardando,
    error,
    errorValidacion,
    tieneCambios,
    validacion,
    toggleOpcion,
    toggleGrupo,
    toggleMenuCompleto,
    descartarCambios,
    limpiarErrorValidacion,
    recargar,
    guardar,
  } = useMenuDiaEdicion({ enabled: true });

  const [seccionActiva, setSeccionActiva] = useState<SeccionDefinirMenu>(seccionInicial);
  const [errorEnLinea, setErrorEnLinea] = useState<string | null>(null);
  const [confirmarGuardarAbierto, setConfirmarGuardarAbierto] = useState<boolean>(false);
  const [confirmarDescartarAbierto, setConfirmarDescartarAbierto] = useState<boolean>(false);
  const [salirTrasDescartar, setSalirTrasDescartar] = useState<boolean>(false);

  const { triggerLight, triggerSuccess, triggerError } = useHaptics();
  const { mostrar } = useToast();

  useEffect(() => {
    onCambiosSinGuardarChange?.(tieneCambios);
    return () => {
      onCambiosSinGuardarChange?.(false);
    };
  }, [tieneCambios, onCambiosSinGuardarChange]);

  const mostrarModalDescarte = confirmarDescartarAbierto || Boolean(solicitudSalirPendiente);

  const handleIntentarVolver = () => {
    if (!onVolver) return;
    if (tieneCambios) {
      triggerLight();
      setSalirTrasDescartar(true);
      setConfirmarDescartarAbierto(true);
      return;
    }
    onVolver();
  };

  useBackHandler(
    tieneCambios || confirmarGuardarAbierto || mostrarModalDescarte,
    () => {
      if (confirmarGuardarAbierto) {
        setConfirmarGuardarAbierto(false);
        return true;
      }
      if (mostrarModalDescarte) {
        setConfirmarDescartarAbierto(false);
        setSalirTrasDescartar(false);
        onCancelarSolicitudSalir?.();
        return true;
      }
      if (tieneCambios) {
        setSalirTrasDescartar(Boolean(onVolver));
        setConfirmarDescartarAbierto(true);
        return true;
      }
      return false;
    }
  );

  const opcionesSet = useMemo(() => new Set(actual.opciones), [actual.opciones]);
  const cartaSet = useMemo(() => new Set(actual.productosCarta), [actual.productosCarta]);
  const menusSet = useMemo(() => new Set(actual.menusCompletos), [actual.menusCompletos]);

  const mensajeAlerta = errorEnLinea ?? errorValidacion;
  const subtituloFecha = formatLimaFechaLarga(hoy?.fecha);
  const etiquetaEstadoMenu = hoy?.definido ? 'Menú definido' : 'Menú no definido hoy';

  const handleSolicitarGuardar = () => {
    triggerLight();
    setErrorEnLinea(null);
    limpiarErrorValidacion();

    if (!validacion.valido) {
      triggerError();
      setErrorEnLinea(validacion.mensaje);
      return;
    }

    setConfirmarGuardarAbierto(true);
  };

  const handleConfirmarGuardar = async () => {
    setConfirmarGuardarAbierto(false);
    const res = await guardar();
    if (res.exito) {
      triggerSuccess();
      setErrorEnLinea(null);
      mostrar({
        tipo: 'exito',
        mensaje: res.mensaje,
      });
    } else {
      triggerError();
      setErrorEnLinea(res.mensaje);
      mostrar({
        tipo: 'error',
        mensaje: res.mensaje,
      });
    }
  };

  const handleConfirmarDescartar = () => {
    const accionSalir = solicitudSalirPendiente;
    const debeVolver = salirTrasDescartar;

    descartarCambios();
    setErrorEnLinea(null);
    setConfirmarDescartarAbierto(false);
    setSalirTrasDescartar(false);
    onCancelarSolicitudSalir?.();

    if (accionSalir) {
      accionSalir();
    } else if (debeVolver && onVolver) {
      onVolver();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden min-h-0">
      {/* 1. Encabezado con fecha en Lima y StatusBadge del estado de hoy */}
      <PageHeader
        title="Menú del día"
        subtitle={subtituloFecha}
        icon={<CalendarCheck className="w-5 h-5 text-white" aria-hidden="true" />}
        onVolver={onVolver ? handleIntentarVolver : undefined}
        onRefresh={() => {
          if (tieneCambios) {
            setSalirTrasDescartar(false);
            setConfirmarDescartarAbierto(true);
            return;
          }
          void recargar();
        }}
        isRefreshing={cargando}
        actions={<StatusBadge estado={etiquetaEstadoMenu} />}
      />

      {headerExtra}

      {/* 2. Control segmentado con contadores */}
      <div
        role="tablist"
        aria-label="Secciones para definir el menú del día"
        className="bg-surface border-b border-line px-4 py-2.5 shrink-0 grid grid-cols-3 gap-1.5"
      >
        <button
          type="button"
          role="tab"
          aria-selected={seccionActiva === 'menus'}
          onClick={() => {
            triggerLight();
            setSeccionActiva('menus');
          }}
          className={`min-h-11 px-2 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent ${
            seccionActiva === 'menus'
              ? 'bg-primary text-white shadow-2xs'
              : 'bg-canvas text-ink-muted hover:text-ink border border-line'
          }`}
        >
          Menús completos ({actual.menusCompletos.length})
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={seccionActiva === 'opciones'}
          onClick={() => {
            triggerLight();
            setSeccionActiva('opciones');
          }}
          className={`min-h-11 px-2 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent ${
            seccionActiva === 'opciones'
              ? 'bg-primary text-white shadow-2xs'
              : 'bg-canvas text-ink-muted hover:text-ink border border-line'
          }`}
        >
          Opciones ({actual.opciones.length})
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={seccionActiva === 'carta'}
          onClick={() => {
            triggerLight();
            setSeccionActiva('carta');
          }}
          className={`min-h-11 px-2 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent ${
            seccionActiva === 'carta'
              ? 'bg-primary text-white shadow-2xs'
              : 'bg-canvas text-ink-muted hover:text-ink border border-line'
          }`}
        >
          Carta ({actual.productosCarta.length})
        </button>
      </div>

      {/* 3. Contenido principal desplazable */}
      <div className="flex-1 overflow-y-auto p-4 pb-36 space-y-4">
        {mensajeAlerta && (
          <div
            role="alert"
            className="p-3.5 rounded-2xl bg-danger-bg border border-danger-border text-badge-danger-text text-xs font-semibold flex items-start gap-2.5 shadow-2xs"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span className="flex-1 break-words">{mensajeAlerta}</span>
          </div>
        )}

        {error && (
          <ErrorState
            mensaje={error}
            onRetry={recargar}
            className="my-2"
          />
        )}

        {cargando && candidatos.length === 0 && (
          <SkeletonList count={5} />
        )}

        {!cargando && !error && candidatos.length === 0 && (
          <EmptyState
            icon={UtensilsCrossed}
            titulo="Sin opciones disponibles"
            subtitulo="No hay opciones disponibles para definir el menú. Cree los productos en la versión web."
          />
        )}

        {!error && candidatos.length > 0 && seccionActiva === 'menus' && (
          <div className="space-y-3">
            {CATALOGO_MENUS_COMPLETOS.map((menu) => (
              <TarjetaMenuCompletoEdicion
                key={menu.id}
                menu={menu}
                habilitado={menusSet.has(menu.id)}
                opcionesSeleccionadasSet={opcionesSet}
                candidatos={candidatos}
                onToggle={(menuId) => {
                  setErrorEnLinea(null);
                  toggleMenuCompleto(menuId);
                }}
              />
            ))}
          </div>
        )}

        {!error && candidatos.length > 0 && seccionActiva === 'opciones' && (
          <div className="space-y-3">
            {gruposOpciones.map((grupo) => (
              <GrupoAcordeonMenu
                key={grupo.clave}
                clave={grupo.clave}
                titulo={grupo.titulo}
                items={grupo.items}
                seleccionadosSet={opcionesSet}
                agotadosPorId={agotadosPorId}
                mostrarPrecio={false}
                onToggleItem={(item) => {
                  setErrorEnLinea(null);
                  toggleOpcion(item.id, 'Componente', item.rol);
                }}
                onToggleGrupo={(items) => {
                  setErrorEnLinea(null);
                  toggleGrupo(items, 'Componente');
                }}
              />
            ))}
          </div>
        )}

        {!error && candidatos.length > 0 && seccionActiva === 'carta' && (
          <div className="space-y-3">
            {gruposCarta.map((grupo) => (
              <GrupoAcordeonMenu
                key={grupo.clave}
                clave={grupo.clave}
                titulo={grupo.titulo}
                items={grupo.items}
                seleccionadosSet={cartaSet}
                agotadosPorId={agotadosPorId}
                mostrarPrecio
                onToggleItem={(item) => {
                  setErrorEnLinea(null);
                  toggleOpcion(item.id, 'Carta');
                }}
                onToggleGrupo={(items) => {
                  setErrorEnLinea(null);
                  toggleGrupo(items, 'Carta');
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* 4. Barra fija inferior cuando existen cambios sin guardar */}
      {tieneCambios && (
        <div
          role="region"
          aria-label="Cambios pendientes del menú del día"
          className="bg-surface border-t border-line px-4 pt-3 pb-safe shrink-0 shadow-lg z-20"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
            <span className="text-xs font-bold text-ink">
              Tiene cambios sin guardar
            </span>
          </div>

          <SheetActions
            secondaryLabel="Descartar"
            primaryLabel="Guardar menú del día"
            primaryIcon={<Save className="w-4 h-4" aria-hidden="true" />}
            isLoading={guardando}
            onSecondary={() => {
              triggerLight();
              setSalirTrasDescartar(false);
              setConfirmarDescartarAbierto(true);
            }}
            onPrimary={handleSolicitarGuardar}
          />
        </div>
      )}

      {/* 5. ConfirmSheet para descartar cambios (MSG-102) */}
      <ConfirmSheet
        isOpen={mostrarModalDescarte}
        onCancelar={() => {
          setConfirmarDescartarAbierto(false);
          setSalirTrasDescartar(false);
          onCancelarSolicitudSalir?.();
        }}
        titulo="¿Descartar cambios?"
        mensaje={MSG_102}
        etiquetaConfirmar="Descartar"
        etiquetaCancelar="Seguir editando"
        tono="peligro"
        onConfirmar={handleConfirmarDescartar}
      />

      {/* 6. ConfirmSheet para guardar el menú del día */}
      <ConfirmSheet
        isOpen={confirmarGuardarAbierto}
        onCancelar={() => setConfirmarGuardarAbierto(false)}
        titulo="¿Guardar menú del día?"
        mensaje="¿Desea guardar el menú del día de hoy? El personal verá estas opciones al registrar pedidos."
        etiquetaConfirmar="Guardar menú del día"
        etiquetaCancelar="Cancelar"
        tono="normal"
        cargando={guardando}
        onConfirmar={() => void handleConfirmarGuardar()}
      />
    </div>
  );
};

export default DefinirMenuView;
