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
  RotateCcw,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  X,
  Check,
  ShoppingBag,
  Utensils,
  DollarSign
} from 'lucide-react';
import { StatusBadge, IconActionButton, DataTable, TableHead, TableBody } from '../components/ui';
import { PageHeader, PageContainer } from '../components/layout';

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

  return (
    <div className="flex-1 overflow-y-auto w-full [scrollbar-width:thin]">
      <PageContainer>
        {/* 1. Encabezado Unificado */}
        <PageHeader
          title="Pedidos"
          subtitle="Visualización y seguimiento del flujo de pedidos del servicio en salón y para llevar."
          badge={
            <span className="text-xs text-neutral-500 tabular-nums hidden sm:inline px-2.5 py-0.5 rounded-full bg-white border border-neutral-200">
              Actualizado hace {segundosDesdeActualizacion} s
            </span>
          }
          actions={
            <button
              type="button"
              onClick={() => cargarPedidos()}
              disabled={cargando}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 shadow-2xs flex items-center gap-2 transition-colors cursor-pointer min-h-[40px] disabled:opacity-60 shrink-0"
              aria-label="Refrescar lista de pedidos"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-[#B84500] ${cargando ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          }
        />

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
              className="w-4 h-4 rounded text-[#B84500] focus:ring-[#D35400] border-neutral-300 cursor-pointer"
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
              className="text-xs font-bold text-[#B84500] hover:text-[#B84600] p-1.5 rounded-lg hover:bg-amber-50 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Quitar filtros</span>
            </button>
          )}
        </div>

        {/* Lista de Pedidos con DataTable */}
        <DataTable
          loading={cargando}
          error={errorCarga}
          onRetry={() => cargarPedidos()}
          isEmpty={pedidos.length === 0}
          emptyTitle="No se encontraron pedidos"
          emptyMessage={
            hayFiltrosActivos
              ? 'No hay pedidos que coincidan con los filtros aplicados. Pruebe con otro filtro o restablezca la búsqueda.'
              : 'Todavía no hay pedidos hoy.'
          }
          emptyActionLabel={hayFiltrosActivos ? 'Quitar filtros' : undefined}
          onEmptyAction={hayFiltrosActivos ? handleLimpiarFiltros : undefined}
          minWidth="min-w-[850px]"
        >
          <TableHead>
            <tr>
              <th scope="col" className="py-3 px-4">N.º</th>
              <th scope="col" className="py-3 px-4">Destino</th>
              <th scope="col" className="py-3 px-4">Hora</th>
              <th scope="col" className="py-3 px-4">Registrado por</th>
              <th scope="col" className="py-3 px-4">Estado</th>
              <th scope="col" className="py-3 px-4 text-right">Total</th>
              <th scope="col" className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </TableHead>
          <TableBody>
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
                              <Utensils className="w-4 h-4 text-[#B84500]" />
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
                              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-[#B84500] font-semibold text-xs">
                                Mío
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <StatusBadge status={p.estado} />
                        </td>
                        <td className="py-3 px-4 text-right font-semibold tabular-nums text-sm text-[#2C1A0E]">
                          S/ {p.total.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                            <IconActionButton
                              icon={Eye}
                              label="Ver detalle del pedido"
                              variant="view"
                              onClick={() => handleVerDetalle(p.id)}
                            />

                            <IconActionButton
                              icon={Edit2}
                              label="Modificar pedido"
                              variant="edit"
                              disabled={!p.puedeModificar}
                              disabledReason={p.motivoDeshabilitado || 'Modificar pedido'}
                              onClick={() => handleAbrirModificar(p.id)}
                            />

                            {(session.rol === 'Administrador' || session.rol === 'Cajero') &&
                              !esAnulado &&
                              p.estado.toLowerCase() !== 'pagado' && (
                                <IconActionButton
                                  icon={DollarSign}
                                  label="Cobrar pedido en caja"
                                  variant="activate"
                                  onClick={() => onNavigateToCobro?.(p.id)}
                                />
                              )}

                            <IconActionButton
                              icon={Trash2}
                              label="Anular pedido"
                              variant="delete"
                              disabled={!p.puedeAnular}
                              disabledReason={p.motivoDeshabilitado || 'Anular pedido'}
                              onClick={() => handleAbrirAnular(p)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
          </TableBody>
        </DataTable>

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
      </PageContainer>
    </div>
  );
};

export default PedidosPage;

