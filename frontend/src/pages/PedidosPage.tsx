import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DetallePedidoModal } from '../components/pedidos';
import { ModificarPedidoModal } from '../components/pedidos';
import { AnularPedidoModal } from '../components/pedidos';
import { pedidoService } from '../services/pedidoService';
import { getMesasService } from '../services/mesaService';
import type { UserSession } from '../types/auth';
import type {
  PedidoItemDto,
  ResumenEstadosDto,
  DetallePedidoCompletoDto,
  ProductoMenuPedido,
  ModificarPedidoRequest
} from '../types/pedido';
import type { MesaItem } from '../types/mesa';
import {
  Clock,
  ChefHat,
  CheckCircle2,
  AlertTriangle,
  RotateCcw, RotateCw,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  AlertCircle,
  X,
  Check,
  ShoppingBag,
  Utensils,
  DollarSign
} from 'lucide-react';

interface PedidosPageProps {
  session: UserSession;
  onLogout: () => void;
  onNavigateToCobro?: (pedidoId: string) => void;
  filtroEstadoInicial?: string;
}

export const PedidosPage: React.FC<PedidosPageProps> = ({
  session,
  onLogout,
  onNavigateToCobro,
  filtroEstadoInicial = ''
}) => {
  // Estado de lista y contadores
  const [pedidos, setPedidos] = useState<PedidoItemDto[]>([]);
  const [resumen, setResumen] = useState<ResumenEstadosDto>({
    pendiente: 0,
    enPreparacion: 0,
    listo: 0,
    pagado: 0,
    anulado: 0
  });
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Filtros combinables (RV-81)
  const [filtroEstado, setFiltroEstado] = useState<string>(filtroEstadoInicial);
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroMesaId, setFiltroMesaId] = useState<string>('');
  const [filtroSoloMios, setFiltroSoloMios] = useState<boolean>(false);
  const [filtroFecha, setFiltroFecha] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Catálogo de mesas para el selector
  const [mesas, setMesas] = useState<MesaItem[]>([]);

  // Temporizador de refresco (RNF-27: cada 15 segundos)
  const [segundosDesdeActualizacion, setSegundosDesdeActualizacion] = useState(0);
  const intervalRef = useRef<any>(null);
  const timerSegundosRef = useRef<any>(null);

  // Modales
  const [pedidoSeleccionadoDetalle, setPedidoSeleccionadoDetalle] = useState<DetallePedidoCompletoDto | null>(null);
  const [abrirModalDetalle, setAbrirModalDetalle] = useState(false);

  const [pedidoSeleccionadoModificar, setPedidoSeleccionadoModificar] = useState<DetallePedidoCompletoDto | null>(null);
  const [abrirModalModificar, setAbrirModalModificar] = useState(false);
  const [guardandoModificacion, setGuardandoModificacion] = useState(false);
  const [catalogoProductos, setCatalogoProductos] = useState<ProductoMenuPedido[]>([]);

  const [pedidoParaAnular, setPedidoParaAnular] = useState<PedidoItemDto | null>(null);
  const [abrirModalAnular, setAbrirModalAnular] = useState(false);
  const [guardandoAnulacion, setGuardandoAnulacion] = useState(false);

  // Notificaciones Toast (MSG-119, MSG-120 - 4 segundos)
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  // Cargar catálogo de mesas
  useEffect(() => {
    getMesasService({ incluirInactivas: false }, session.token)
      .then((data: MesaItem[]) => setMesas(data.filter((m: MesaItem) => m.activa)))
      .catch((err: unknown) => console.warn('Error al cargar mesas:', err));
  }, [session.token]);

  // Cargar catálogo de productos para modificar
  const cargarCatalogoProductos = useCallback(async () => {
    try {
      const prods = await pedidoService.obtenerCatalogoPedido(session.token);
      setCatalogoProductos(prods);
    } catch (err) {
      console.warn('Error al cargar catálogo de productos:', err);
    }
  }, [session.token]);

  // Consulta de pedidos (CUS09.1)
  const cargarPedidos = useCallback(async (silencioso = false) => {
    if (!silencioso) setCargando(true);
    setErrorCarga(null);

    try {
      const res = await pedidoService.listarPedidos(
        {
          fecha: session.rol === 'Administrador' ? filtroFecha : undefined,
          estado: filtroEstado || undefined,
          tipo: filtroTipo || undefined,
          mesaId: filtroMesaId || undefined,
          soloMios: filtroSoloMios,
          pagina: 1,
          tamano: 100
        },
        session.token
      );

      setPedidos(res.items);
      setResumen(res.resumen);
      setSegundosDesdeActualizacion(0);
    } catch (err: any) {
      if (err.status === 401) {
        onLogout();
        return;
      }
      setErrorCarga(err.message || 'No se pudieron cargar los pedidos. Intente nuevamente.');
    } finally {
      if (!silencioso) setCargando(false);
    }
  }, [session.token, session.rol, filtroFecha, filtroEstado, filtroTipo, filtroMesaId, filtroSoloMios, onLogout]);

  // Efecto para cargar al cambiar filtros
  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  // Refresco automático cada 15 segundos (RNF-27) y contador de segundos
  useEffect(() => {
    timerSegundosRef.current = setInterval(() => {
      setSegundosDesdeActualizacion((prev) => prev + 1);
    }, 1000);

    intervalRef.current = setInterval(() => {
      cargarPedidos(true);
    }, 15000);

    return () => {
      if (timerSegundosRef.current) clearInterval(timerSegundosRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [cargarPedidos]);

  // Auto-cierre de Toast a los 4 segundos
  useEffect(() => {
    if (!toastMensaje) return;
    const t = setTimeout(() => setToastMensaje(null), 4000);
    return () => clearTimeout(t);
  }, [toastMensaje]);

  // Abrir detalle de pedido
  const handleVerDetalle = async (pedidoId: string) => {
    try {
      const detalle = await pedidoService.obtenerDetalleCompleto(pedidoId, session.token);
      setPedidoSeleccionadoDetalle(detalle);
      setAbrirModalDetalle(true);
    } catch (err: any) {
      alert(err.message || 'Error al obtener el detalle del pedido.');
    }
  };

  // Abrir pantalla de modificación (CUS09.2)
  const handleAbrirModificar = async (pedidoId: string) => {
    try {
      await cargarCatalogoProductos();
      const detalle = await pedidoService.obtenerDetalleCompleto(pedidoId, session.token);
      setPedidoSeleccionadoModificar(detalle);
      setAbrirModalModificar(true);
    } catch (err: any) {
      alert(err.message || 'Error al preparar la modificación del pedido.');
    }
  };

  // Guardar modificación (CUS09.2)
  const handleGuardarModificacion = async (pedidoId: string, req: ModificarPedidoRequest) => {
    setGuardandoModificacion(true);
    try {
      await pedidoService.modificarPedido(pedidoId, req, session.token);
      setToastMensaje(`Pedido modificado. Cocina verá la comanda actualizada.`);
      setAbrirModalModificar(false);
      cargarPedidos(true);
    } finally {
      setGuardandoModificacion(false);
    }
  };

  // Abrir modal de anulación (CUS09.2)
  const handleAbrirAnular = (item: PedidoItemDto) => {
    setPedidoParaAnular(item);
    setAbrirModalAnular(true);
  };

  // Confirmar anulación (CUS09.2)
  const handleConfirmarAnular = async (pedidoId: string, motivo: string) => {
    setGuardandoAnulacion(true);
    try {
      const solicitudId = `anulacion-${pedidoId}-${Date.now()}`;
      await pedidoService.anularPedido(pedidoId, { solicitudId, motivo }, session.token);
      setToastMensaje(`Pedido anulado correctamente.`);
      setAbrirModalAnular(false);
      cargarPedidos(true);
    } catch (err: any) {
      alert(err.message || 'Error al anular el pedido.');
    } finally {
      setGuardandoAnulacion(false);
    }
  };

  const hayFiltrosActivos =
    Boolean(filtroEstado) ||
    Boolean(filtroTipo) ||
    Boolean(filtroMesaId) ||
    filtroSoloMios ||
    (session.rol === 'Administrador' && filtroFecha !== new Date().toISOString().split('T')[0]);

  const handleLimpiarFiltros = () => {
    setFiltroEstado('');
    setFiltroTipo('');
    setFiltroMesaId('');
    setFiltroSoloMios(false);
    if (session.rol === 'Administrador') {
      setFiltroFecha(new Date().toISOString().split('T')[0]);
    }
  };

  const renderBadgeEstado = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5" />
            Pendiente
          </span>
        );
      case 'enpreparacion':
      case 'en preparación':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300">
            <ChefHat className="w-3.5 h-3.5" />
            En preparación
          </span>
        );
      case 'listo':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Listo
          </span>
        );
      case 'pagado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-300">
            Pagado
          </span>
        );
      case 'anulado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-100 text-rose-800 border border-rose-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            Anulado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 text-neutral-700">
            {estado}
          </span>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto w-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 [&::-webkit-scrollbar-track]:bg-transparent">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 pt-2 sm:pt-2.5 pb-8 flex flex-col gap-2.5 sm:gap-3">
      {/* 1. Encabezado Superior */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[#2C1A0E]">
              Pedidos
            </h1>
            <span className="text-xs text-neutral-500 tabular-nums hidden sm:inline px-2.5 py-0.5 rounded-full bg-white border border-neutral-200">
              Actualizado hace {segundosDesdeActualizacion} s
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Visualización y seguimiento del flujo de pedidos del servicio en salón y para llevar.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => cargarPedidos()}
            disabled={cargando}
            className="p-2 sm:px-3 sm:py-2 text-xs font-semibold rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer min-h-[38px] disabled:opacity-60"
            aria-label="Refrescar lista de pedidos"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-[#D35400] ${cargando ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {/* Contenedor sin confinamiento artificial */}
      <div className="w-full">
        {/* Contadores por Estado (actúan como filtro al tocarlos) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 mb-3">
          <button
            type="button"
            onClick={() => setFiltroEstado(filtroEstado === 'Pendiente' ? '' : 'Pendiente')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              filtroEstado === 'Pendiente'
                ? 'bg-amber-100/80 border-amber-400 ring-2 ring-amber-300'
                : 'bg-white border-neutral-200/80 hover:border-amber-300 hover:shadow-xs'
            }`}
          >
            <div className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Pendientes</span>
            </div>
            <div className="text-2xl font-bold font-sans tabular-nums text-neutral-900 mt-1">
              {resumen.pendiente}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFiltroEstado(filtroEstado === 'EnPreparacion' ? '' : 'EnPreparacion')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              filtroEstado === 'EnPreparacion'
                ? 'bg-blue-100/80 border-blue-400 ring-2 ring-blue-300'
                : 'bg-white border-neutral-200/80 hover:border-blue-300 hover:shadow-xs'
            }`}
          >
            <div className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
              <ChefHat className="w-3.5 h-3.5" />
              <span>En preparación</span>
            </div>
            <div className="text-2xl font-bold font-sans tabular-nums text-neutral-900 mt-1">
              {resumen.enPreparacion}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFiltroEstado(filtroEstado === 'Listo' ? '' : 'Listo')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              filtroEstado === 'Listo'
                ? 'bg-emerald-100/80 border-emerald-400 ring-2 ring-emerald-300'
                : 'bg-white border-neutral-200/80 hover:border-emerald-300 hover:shadow-xs'
            }`}
          >
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Listos</span>
            </div>
            <div className="text-2xl font-bold font-sans tabular-nums text-neutral-900 mt-1">
              {resumen.listo}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFiltroEstado(filtroEstado === 'Pagado' ? '' : 'Pagado')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              filtroEstado === 'Pagado'
                ? 'bg-neutral-200 border-neutral-400 ring-2 ring-neutral-300'
                : 'bg-white border-neutral-200/80 hover:border-neutral-300 hover:shadow-xs'
            }`}
          >
            <div className="text-xs font-bold text-neutral-600 uppercase tracking-wider flex items-center gap-1.5">
              <span>Pagados</span>
            </div>
            <div className="text-2xl font-bold font-sans tabular-nums text-neutral-900 mt-1">
              {resumen.pagado}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFiltroEstado(filtroEstado === 'Anulado' ? '' : 'Anulado')}
            className={`col-span-2 sm:col-span-1 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              filtroEstado === 'Anulado'
                ? 'bg-rose-100/80 border-rose-400 ring-2 ring-rose-300'
                : 'bg-white border-neutral-200/80 hover:border-rose-300 hover:shadow-xs'
            }`}
          >
            <div className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Anulados</span>
            </div>
            <div className="text-2xl font-bold font-sans tabular-nums text-neutral-900 mt-1">
              {resumen.anulado}
            </div>
          </button>
        </div>

        {/* Barra de Filtros Combinables (RV-81) */}
        <div className="px-3.5 py-3 sm:p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs mb-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7C6F66]">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros:</span>
          </div>

          {/* Filtro Estado */}
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="text-xs p-2 rounded-xl border border-neutral-200 bg-white focus:border-[#D35400] focus:ring-1 focus:ring-[#D35400] focus:outline-none cursor-pointer min-h-[38px]"
          >
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="EnPreparacion">En preparación</option>
            <option value="Listo">Listo</option>
            <option value="Pagado">Pagado</option>
            <option value="Anulado">Anulado</option>
          </select>

          {/* Filtro Tipo */}
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="text-xs p-2 rounded-xl border border-neutral-200 bg-white focus:border-[#D35400] focus:ring-1 focus:ring-[#D35400] focus:outline-none cursor-pointer min-h-[38px]"
          >
            <option value="">Todos los tipos</option>
            <option value="Mesa">Mesa</option>
            <option value="ParaLlevar">Para llevar</option>
          </select>

          {/* Filtro Mesa */}
          <select
            value={filtroMesaId}
            onChange={(e) => setFiltroMesaId(e.target.value)}
            className="text-xs p-2 rounded-xl border border-neutral-200 bg-white focus:border-[#D35400] focus:ring-1 focus:ring-[#D35400] focus:outline-none cursor-pointer min-h-[38px]"
          >
            <option value="">Todas las mesas</option>
            {mesas.map((m) => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>

          {/* Filtro Solo mis pedidos (Mozo y Cajero) */}
          <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 cursor-pointer select-none px-2 py-1.5 rounded-lg hover:bg-neutral-50">
            <input
              type="checkbox"
              checked={filtroSoloMios}
              onChange={(e) => setFiltroSoloMios(e.target.checked)}
              className="w-4 h-4 rounded text-[#D35400] focus:ring-[#D35400] border-neutral-300 cursor-pointer"
            />
            <span>Solo mis pedidos</span>
          </label>

          {/* Filtro Fecha: Solo Administrador (RN-63) */}
          {session.rol === 'Administrador' && (
            <div className="flex items-center gap-1.5 ml-auto">
              <Calendar className="w-4 h-4 text-neutral-500" />
              <input
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="text-xs p-2 rounded-xl border border-neutral-200 bg-white focus:border-[#D35400] focus:ring-1 focus:ring-[#D35400] focus:outline-none cursor-pointer min-h-[38px]"
              />
            </div>
          )}

          {/* Botón Quitar Filtros */}
          {hayFiltrosActivos && (
            <button
              type="button"
              onClick={handleLimpiarFiltros}
              className="text-xs font-bold text-[#D35400] hover:text-[#B84600] p-1.5 rounded-lg hover:bg-amber-50 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Quitar filtros</span>
            </button>
          )}
        </div>

        {/* Mensaje de error de carga */}
        {errorCarga && (
          <div className="p-4 mb-6 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorCarga}</span>
            </div>
            <button
              type="button"
              onClick={() => cargarPedidos()}
              className="py-2 px-4 rounded-xl bg-[#D35400] text-white font-semibold text-xs hover:bg-[#B84600] transition-colors cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Lista de Pedidos */}
        {cargando ? (
          <div className="p-12 text-center">
            <RotateCw className="w-8 h-8 text-[#D35400] animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-neutral-600">Cargando pedidos…</p>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-neutral-200/80">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#D35400] flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-neutral-800 font-sans mb-1">
              {hayFiltrosActivos
                ? 'No se encontraron pedidos con ese criterio.'
                : 'Todavía no hay pedidos hoy.'}
            </h4>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {hayFiltrosActivos
                ? 'Pruebe con otro filtro o restablezca la búsqueda.'
                : 'Los pedidos tomados en mesa o para llevar aparecerán aquí en vivo.'}
            </p>
            {hayFiltrosActivos && (
              <button
                type="button"
                onClick={handleLimpiarFiltros}
                className="mt-4 py-2 px-4 rounded-xl bg-[#D35400] text-white text-xs font-semibold hover:bg-[#b84500] cursor-pointer"
              >
                Quitar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Vista Desktop: Tabla */}
            <div className="hidden md:block bg-white border border-neutral-200/80 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#FAF7F4] text-[#7C6F66] font-semibold text-xs uppercase tracking-wider border-b border-[#E5E0DB]">
                  <tr>
                    <th className="py-3 px-4">N.º</th>
                    <th className="py-3 px-4">Destino</th>
                    <th className="py-3 px-4">Hora</th>
                    <th className="py-3 px-4">Registrado por</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE6] text-sm">
                  {pedidos.map((p) => {
                    const esAnulado = p.estado.toLowerCase() === 'anulado';
                    const esListo = p.estado.toLowerCase() === 'listo';

                    return (
                      <tr
                        key={p.id}
                        className={`transition-colors border-b border-[#F0EBE6] ${
                          esAnulado
                            ? 'opacity-60 bg-neutral-50/70'
                            : p.esMio
                            ? 'bg-amber-50/20 hover:bg-amber-50/40'
                            : 'hover:bg-neutral-50/60'
                        } ${esListo ? 'ring-1 ring-emerald-300' : ''}`}
                      >
                        <td className="py-3 px-4 font-semibold tabular-nums text-sm text-[#2C1A0E]">
                          #{p.numero}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {p.tipo === 'Mesa' ? (
                              <Utensils className="w-4 h-4 text-[#D35400]" />
                            ) : (
                              <ShoppingBag className="w-4 h-4 text-orange-600" />
                            )}
                            <span className="font-semibold text-sm text-[#2C1A0E]">
                              {p.tipo === 'Mesa' ? (p.mesa || 'Mesa') : 'Para llevar'}
                            </span>
                          </div>
                          {p.tipo !== 'Mesa' && p.referencia && (
                            <span className="text-xs text-stone-500 italic block">
                              Ref: {p.referencia}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-stone-600 text-xs tabular-nums">
                          {p.hora}
                        </td>
                        <td className="py-3 px-4 text-stone-700 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span>{p.registradoPor}</span>
                            {p.esMio && (
                              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-[#D35400] font-semibold text-xs">
                                Mío
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {renderBadgeEstado(p.estado)}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold tabular-nums text-sm text-[#2C1A0E]">
                          S/ {p.total.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Ver Detalle: Estilo Neutro Blanco */}
                            <button
                              type="button"
                              onClick={() => handleVerDetalle(p.id)}
                              className="w-8 h-8 xl:w-9 xl:h-9 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 shadow-2xs inline-flex items-center justify-center transition-colors cursor-pointer"
                              title="Ver detalle del pedido"
                              aria-label={`Ver detalle pedido #${p.numero}`}
                            >
                              <Eye className="w-4 h-4 text-neutral-600" />
                            </button>

                            {/* Modificar: Estilo Neutro Blanco */}
                            <button
                              type="button"
                              onClick={() => handleAbrirModificar(p.id)}
                              disabled={!p.puedeModificar}
                              className={`w-8 h-8 xl:w-9 xl:h-9 rounded-lg border shadow-2xs inline-flex items-center justify-center transition-colors ${
                                p.puedeModificar
                                  ? 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 cursor-pointer'
                                  : 'border-neutral-200 bg-neutral-100 text-neutral-500 opacity-60 cursor-not-allowed'
                              }`}
                              title={p.motivoDeshabilitado || 'Modificar pedido'}
                              aria-label={`Modificar pedido #${p.numero}`}
                            >
                              <Edit2 className="w-4 h-4 text-neutral-600" />
                            </button>

                            {/* Anular: Acción Destructiva Rojo/Rose */}
                            <button
                              type="button"
                              onClick={() => handleAbrirAnular(p)}
                              disabled={!p.puedeAnular}
                              className={`w-8 h-8 xl:w-9 xl:h-9 rounded-lg border shadow-2xs inline-flex items-center justify-center transition-colors ${
                                p.puedeAnular
                                  ? 'border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer'
                                  : 'border-neutral-200 bg-neutral-100 text-neutral-500 opacity-60 cursor-not-allowed'
                              }`}
                              title={p.motivoDeshabilitado || 'Anular pedido'}
                              aria-label={`Anular pedido #${p.numero}`}
                            >
                              <Trash2 className="w-4 h-4 text-rose-600" />
                            </button>

                            {/* Cobrar en Caja: Rol Cajero / Admin */}
                            {(session.rol === 'Administrador' || session.rol === 'Cajero') &&
                              !esAnulado &&
                              p.estado.toLowerCase() !== 'pagado' && (
                                <button
                                  type="button"
                                  onClick={() => onNavigateToCobro?.(p.id)}
                                  className="w-8 h-8 rounded-lg border border-transparent bg-[#D35400] hover:bg-[#B84600] text-white shadow-2xs inline-flex items-center justify-center transition-colors cursor-pointer"
                                  title="Cobrar pedido en caja"
                                  aria-label={`Cobrar pedido #${p.numero}`}
                                >
                                  <DollarSign className="w-4 h-4" />
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Vista Móvil: Tarjetas (RNF-28: Controles de al menos 44 px) */}
            <div className="md:hidden space-y-3">
              {pedidos.map((p) => {
                const esAnulado = p.estado.toLowerCase() === 'anulado';
                const esListo = p.estado.toLowerCase() === 'listo';

                return (
                  <div
                    key={p.id}
                    className={`p-4 bg-white rounded-2xl border transition-all ${
                      esAnulado
                        ? 'opacity-65 border-neutral-200 bg-neutral-50/70'
                        : p.esMio
                        ? 'border-amber-300 bg-amber-50/15 shadow-xs'
                        : 'border-neutral-200 shadow-xs'
                    } ${esListo ? 'ring-2 ring-emerald-400' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold tabular-nums text-base text-neutral-900">
                          #{p.numero}
                        </span>
                        <span className="font-semibold text-sm text-[#D35400]">
                          {p.tipo === 'Mesa' ? (p.mesa || 'Mesa') : 'Para llevar'}
                        </span>
                        {p.esMio && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-[#D35400] font-bold text-xs">
                            Mío
                          </span>
                        )}
                      </div>
                      {renderBadgeEstado(p.estado)}
                    </div>

                    <div className="flex justify-between items-center text-xs text-neutral-500 my-2">
                      <span>Hora: <strong className="text-neutral-700">{p.hora}</strong></span>
                      <span>Por: <strong className="text-neutral-700">{p.registradoPor}</strong></span>
                      <span className="text-base font-bold tabular-nums text-neutral-900">
                        S/ {p.total.toFixed(2)}
                      </span>
                    </div>

                    {/* Botones móviles de 44 px */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-neutral-100 mt-2">
                      <button
                        type="button"
                        onClick={() => handleVerDetalle(p.id)}
                        className="py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-700 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-neutral-50 min-h-[44px] cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-4 h-4 text-neutral-600" />
                        <span>Detalle</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAbrirModificar(p.id)}
                        disabled={!p.puedeModificar}
                        className={`py-2.5 rounded-xl border font-semibold text-xs flex items-center justify-center gap-1.5 min-h-[44px] transition-colors shadow-2xs ${
                          p.puedeModificar
                            ? 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 cursor-pointer'
                            : 'border-neutral-200 bg-neutral-100 text-neutral-500 opacity-60 cursor-not-allowed'
                        }`}
                        title={p.motivoDeshabilitado || 'Modificar'}
                      >
                        <Edit2 className="w-4 h-4 text-neutral-600" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAbrirAnular(p)}
                        disabled={!p.puedeAnular}
                        className={`py-2.5 rounded-xl border font-semibold text-xs flex items-center justify-center gap-1.5 min-h-[44px] transition-colors shadow-2xs ${
                          p.puedeAnular
                            ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer'
                            : 'border-neutral-200 bg-neutral-100 text-neutral-500 opacity-60 cursor-not-allowed'
                        }`}
                        title={p.motivoDeshabilitado || 'Anular'}
                      >
                        <Trash2 className="w-4 h-4 text-rose-600" />
                        <span>Anular</span>
                      </button>

                      {/* Cobrar en Móvil */}
                      {(session.rol === 'Administrador' || session.rol === 'Cajero') &&
                        !esAnulado &&
                        p.estado.toLowerCase() !== 'pagado' && (
                          <button
                            type="button"
                            onClick={() => onNavigateToCobro?.(p.id)}
                            className="py-2.5 px-3 rounded-xl bg-[#D35400] hover:bg-[#B84600] text-white font-semibold text-xs flex items-center justify-center gap-1.5 min-h-[44px] transition-colors shadow-2xs cursor-pointer"
                            title="Cobrar pedido en caja"
                          >
                            <DollarSign className="w-4 h-4" />
                            <span>Cobrar</span>
                          </button>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal de Detalle (Vista 9.2) */}
        <DetallePedidoModal
          pedido={pedidoSeleccionadoDetalle}
          isOpen={abrirModalDetalle}
          onClose={() => setAbrirModalDetalle(false)}
          onAbrirModificar={(id) => handleAbrirModificar(id)}
          onAbrirAnular={(id) => {
            const item = pedidos.find((p) => p.id === id);
            if (item) handleAbrirAnular(item);
          }}
          puedeModificar={pedidoSeleccionadoDetalle ? pedidos.find(p => p.id === pedidoSeleccionadoDetalle.id)?.puedeModificar : false}
          puedeAnular={pedidoSeleccionadoDetalle ? pedidos.find(p => p.id === pedidoSeleccionadoDetalle.id)?.puedeAnular : false}
          motivoDeshabilitado={pedidoSeleccionadoDetalle ? pedidos.find(p => p.id === pedidoSeleccionadoDetalle.id)?.motivoDeshabilitado : null}
        />

        {/* Modal de Modificación (Vista 9.3) */}
        <ModificarPedidoModal
          pedido={pedidoSeleccionadoModificar}
          isOpen={abrirModalModificar}
          onClose={() => setAbrirModalModificar(false)}
          catalogoProductos={catalogoProductos}
          onGuardarModificacion={handleGuardarModificacion}
          loading={guardandoModificacion}
        />

        {/* Modal de Anulación (Vista 9.4) */}
        <AnularPedidoModal
          pedido={pedidoParaAnular}
          isOpen={abrirModalAnular}
          onClose={() => setAbrirModalAnular(false)}
          onConfirmAnular={handleConfirmarAnular}
          loading={guardandoAnulacion}
        />

        {/* Toast Notificación (MSG-119 / MSG-120) */}
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
      </div>
      </div>
    </div>
  );
};

export default PedidosPage;

