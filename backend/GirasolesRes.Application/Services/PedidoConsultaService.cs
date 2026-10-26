using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Pedidos;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Interfaces.Services;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Application.Services;

public class PedidoConsultaService : IPedidoConsultaService
{
    private readonly IPedidoRepository _pedidoRepository;
    private readonly IProductoRepository _productoRepository;
    private readonly IMenuDiaRepository _menuDiaRepository;

    public PedidoConsultaService(
        IPedidoRepository pedidoRepository,
        IProductoRepository productoRepository,
        IMenuDiaRepository menuDiaRepository)
    {
        _pedidoRepository = pedidoRepository;
        _productoRepository = productoRepository;
        _menuDiaRepository = menuDiaRepository;
    }

    public async Task<PedidoResponseDto?> ObtenerPedidoPorIdAsync(Guid pedidoId, CancellationToken ct = default)
    {
        var pedido = await _pedidoRepository.ObtenerPorIdAsync(pedidoId, ct);
        return pedido == null ? null : MapearAPedidoDto(pedido);
    }

    public async Task<PedidoResponseDto?> ObtenerPedidoActivoPorMesaAsync(Guid mesaId, CancellationToken ct = default)
    {
        var pedido = await _pedidoRepository.ObtenerPedidoActivoPorMesaAsync(mesaId, ct);
        return pedido == null ? null : MapearAPedidoDto(pedido);
    }

    public async Task<IReadOnlyList<PedidoAbiertoMesaDto>> ObtenerPedidosActivosPorMesaAsync(Guid mesaId, CancellationToken ct = default)
    {
        var pedidos = await _pedidoRepository.ObtenerPedidosActivosPorMesaAsync(mesaId, ct);
        return pedidos.Select(p => new PedidoAbiertoMesaDto(
            p.Id_Pedido,
            p.Ped_NumeroDiario,
            p.Ped_Estado.ToString(),
            p.Ped_Total
        )).ToList();
    }

    public async Task<IReadOnlyList<ProductoMenuPedidoDto>> ObtenerMenuParaPedidoAsync(CancellationToken ct = default)
    {
        var fechaOperativa = TimeZoneHelper.ObtenerFechaActualLima();
        var menuDia = await _menuDiaRepository.ObtenerPorFechaAsync(fechaOperativa, ct);

        if (menuDia != null)
        {
            var lista = new List<ProductoMenuPedidoDto>();

            // Platos del menú del día (exclusivamente productos de Carta)
            foreach (var plato in menuDia.Men_Platos)
            {
                var prod = plato.Mdp_Producto ?? await _productoRepository.ObtenerPorIdAsync(plato.Id_Producto, ct);
                if (prod != null && prod.Pro_Activo && prod.Pro_Tipo == TipoProducto.Carta)
                {
                    lista.Add(new ProductoMenuPedidoDto(
                        prod.Id_Producto,
                        prod.Pro_Nombre,
                        prod.Pro_Categoria?.ToString() ?? string.Empty,
                        prod.Pro_Precio.GetValueOrDefault(),
                        Agotado: plato.Mdp_Agotado,
                        Disponible: !plato.Mdp_Agotado
                    ));
                }
            }

            return lista;
        }

        // RN-142: Sin menú del día definido, ofrecer todos los productos activos de la carta y componentes
        var todosProds = (await _productoRepository.ListarDisponiblesAsync(null, cancellationToken: ct)) ?? new List<Producto>();
        return todosProds.Select(p => new ProductoMenuPedidoDto(
            p.Id_Producto,
            p.Pro_Nombre,
            p.Pro_Categoria?.ToString() ?? p.Pro_Rol?.ToString() ?? string.Empty,
            p.Pro_Precio.GetValueOrDefault(),
            Agotado: false,
            Disponible: true,
            Rol: p.Pro_Rol?.ToString()
        )).ToList();
    }

    public async Task<ListarPedidosResponseDto> ListarPedidosAsync(
        ListarPedidosQueryDto query,
        Guid usuarioId,
        string rol,
        CancellationToken ct = default)
    {
        var fechaHoy = TimeZoneHelper.ObtenerFechaActualLima();

        // RN-63: Solo el Administrador consulta fechas anteriores
        if (query.Fecha.HasValue && query.Fecha.Value != fechaHoy)
        {
            if (!string.Equals(rol, "Administrador", StringComparison.OrdinalIgnoreCase))
            {
                throw new UnauthorizedAccessException(MensajesCatalogo.MSG_39);
            }
        }

        var fechaOperativa = query.Fecha ?? fechaHoy;
        Guid? usuarioIdFiltro = query.SoloMios ? usuarioId : null;

        var (items, total, pendiente, enPrep, listo, pagado, anulado) = await _pedidoRepository.ListarPaginadoAsync(
            fechaOperativa,
            query.Estado,
            query.Tipo,
            query.MesaId,
            usuarioIdFiltro,
            query.Pagina,
            query.Tamano,
            ct);

        var pedidosDto = items.Select(p =>
        {
            var esMio = p.Id_Usuario == usuarioId;
            var estadoEfectivo = ResolverEstadoEfectivo(p);
            string estadoMostrar;
            if (p.Ped_Estado == EstadoPedido.Pagado)
            {
                var estadoPrep = ResolverEstadoPreparacion(p);
                if (estadoPrep == EstadoPedido.Listo)
                {
                    estadoMostrar = "Listo · Pagado";
                }
                else if (estadoPrep == EstadoPedido.EnPreparacion)
                {
                    estadoMostrar = "Pagado · En preparación";
                }
                else if (estadoPrep == EstadoPedido.Pendiente)
                {
                    estadoMostrar = "Pagado · Pendiente";
                }
                else
                {
                    estadoMostrar = "Pagado";
                }
            }
            else
            {
                estadoMostrar = estadoEfectivo.ToString();
            }

            // RN-65 / RV-75: Solo modifica o anula el creador, no pagado ni anulado, y todas comandas pendientes
            bool todasComandasPendientes = p.Ped_Comandas.Any() &&
                p.Ped_Comandas.Where(c => c.Cmd_Estado != EstadoComanda.Cancelada).All(c => c.Cmd_Estado == EstadoComanda.Pendiente);

            bool esAdmin = string.Equals(rol, "Administrador", StringComparison.OrdinalIgnoreCase);
            bool esMozoOCajero = string.Equals(rol, "Mozo", StringComparison.OrdinalIgnoreCase) ||
                                 string.Equals(rol, "Cajero", StringComparison.OrdinalIgnoreCase);

            bool puedeModificar = esMozoOCajero &&
                                  esMio &&
                                  p.Ped_Estado != EstadoPedido.Pagado &&
                                  p.Ped_Estado != EstadoPedido.Anulado &&
                                  todasComandasPendientes;

            bool puedeAnular = (esAdmin && p.Ped_Estado != EstadoPedido.Pagado && p.Ped_Estado != EstadoPedido.Anulado) ||
                               (esMozoOCajero && esMio && p.Ped_Estado != EstadoPedido.Pagado && p.Ped_Estado != EstadoPedido.Anulado && todasComandasPendientes);

            string? motivoDeshabilitado = null;
            if (!puedeAnular && !puedeModificar)
            {
                if (p.Ped_Estado == EstadoPedido.Pagado || p.Ped_Estado == EstadoPedido.Anulado)
                {
                    motivoDeshabilitado = MensajesCatalogo.MSG_104;
                }
                else if (!esMio && !esAdmin)
                {
                    motivoDeshabilitado = MensajesCatalogo.MSG_116;
                }
                else if (!todasComandasPendientes && !esAdmin)
                {
                    motivoDeshabilitado = MensajesCatalogo.MSG_115;
                }
                else if (!esMozoOCajero && !esAdmin)
                {
                    motivoDeshabilitado = MensajesCatalogo.MSG_39;
                }
            }

            return new PedidoItemDto(
                p.Id_Pedido,
                p.Ped_NumeroDiario,
                p.Ped_Tipo.ToString(),
                p.Ped_Mesa?.Mes_Nombre,
                p.Ped_Tipo == TipoPedido.ParaLlevar ? (p.Ped_Notas ?? "Para llevar") : null,
                p.Ped_FechaHoraUtc.AddHours(-5).ToString("HH:mm"),
                p.Ped_Total,
                estadoMostrar,
                p.Ped_Usuario?.Usu_Nombre ?? "Usuario",
                p.Id_Usuario,
                esMio,
                puedeModificar,
                puedeAnular,
                motivoDeshabilitado
            );
        }).ToList();

        var resumen = new ResumenEstadosDto(pendiente, enPrep, listo, pagado, anulado);
        return new ListarPedidosResponseDto(pedidosDto, total, resumen);
    }

    public async Task<DetallePedidoCompletoDto?> ObtenerDetalleCompletoAsync(Guid pedidoId, CancellationToken ct = default)
    {
        var p = await _pedidoRepository.ObtenerDetalleCompletoPorIdAsync(pedidoId, ct);
        if (p == null) return null;

        var lineas = p.Ped_Detalles.Select(d =>
        {
            var nombre = !string.IsNullOrWhiteSpace(d.Det_Nombre)
                ? d.Det_Nombre
                : d.Det_Producto?.Pro_Nombre ?? "Producto";

            List<EleccionOpcionResponseDto>? elecciones = null;
            if (d.Det_Opciones.Count > 0)
            {
                elecciones = d.Det_Opciones.Select(o => new EleccionOpcionResponseDto(
                    o.Lpo_ParteNombre,
                    o.Id_Producto,
                    o.Lpo_ProductoNombre
                )).ToList();
            }

            return new LineaDetalleDto(
                d.Id_Detalle,
                d.Id_Producto,
                d.Id_MenuCompleto,
                nombre,
                d.Det_Incluye,
                d.Det_Cantidad,
                d.Det_PrecioUnitario,
                d.Det_Subtotal,
                d.Det_Observacion,
                elecciones
            );
        }).ToList();

        var comandas = p.Ped_Comandas.Select(c => new ComandaDetalleDto(
            c.Id_Comanda,
            c.Cmd_NumeroDiario,
            c.Cmd_Estado.ToString(),
            c.Cmd_EsAdicional,
            c.Cmd_Modificada,
            c.Cmd_FechaHoraUtc
        )).ToList();

        var estadoEfectivo = ResolverEstadoEfectivo(p).ToString();

        return new DetallePedidoCompletoDto(
            p.Id_Pedido,
            p.Ped_NumeroDiario,
            p.Ped_Tipo.ToString(),
            p.Ped_Mesa?.Mes_Nombre,
            p.Ped_Tipo == TipoPedido.ParaLlevar ? p.Ped_Notas : null,
            p.Ped_FechaHoraUtc.AddHours(-5).ToString("HH:mm"),
            p.Ped_Total,
            estadoEfectivo,
            p.Ped_Usuario?.Usu_Nombre ?? "Usuario",
            p.Id_Usuario,
            p.Ped_MotivoAnulacion,
            lineas,
            comandas
        );
    }

    private static PedidoResponseDto MapearAPedidoDto(Pedido p)
    {
        var lineas = p.Ped_Detalles
            .Select(d =>
            {
                var nombre = !string.IsNullOrWhiteSpace(d.Det_Nombre)
                    ? d.Det_Nombre
                    : d.Det_Producto?.Pro_Nombre ?? "Producto";

                List<EleccionOpcionResponseDto>? elecciones = null;
                if (d.Det_Opciones.Count > 0)
                {
                    elecciones = d.Det_Opciones.Select(o => new EleccionOpcionResponseDto(
                        o.Lpo_ParteNombre,
                        o.Id_Producto,
                        o.Lpo_ProductoNombre
                    )).ToList();
                }

                return new LineaPedidoResponseDto(
                    d.Id_Detalle,
                    d.Id_Producto,
                    d.Id_MenuCompleto,
                    nombre,
                    d.Det_Incluye,
                    d.Det_PrecioUnitario,
                    d.Det_Cantidad,
                    d.Det_Subtotal,
                    d.Det_Observacion,
                    elecciones
                );
            })
            .ToList();

        return new PedidoResponseDto(
            p.Id_Pedido,
            p.Ped_NumeroDiario,
            p.Ped_FechaOperativa,
            p.Ped_FechaHoraUtc,
            p.Ped_Estado.ToString(),
            p.Ped_Tipo.ToString(),
            p.Ped_Total,
            p.Ped_Notas,
            p.Id_Mesa,
            p.Ped_Mesa?.Mes_Nombre,
            p.Id_Usuario,
            p.Ped_Usuario?.Usu_Nombre ?? "Mozo",
            lineas
        );
    }

    private static EstadoPedido ResolverEstadoPreparacion(Pedido p)
    {
        var comandasValidas = p.Ped_Comandas.Where(c => c.Cmd_Estado != EstadoComanda.Cancelada).ToList();
        if (!comandasValidas.Any())
        {
            return EstadoPedido.Pagado;
        }

        if (comandasValidas.Any(c => c.Cmd_Estado == EstadoComanda.EnPreparacion))
        {
            return EstadoPedido.EnPreparacion;
        }

        if (comandasValidas.Any(c => c.Cmd_Estado == EstadoComanda.Pendiente))
        {
            return EstadoPedido.Pendiente;
        }

        if (comandasValidas.All(c => c.Cmd_Estado == EstadoComanda.Lista))
        {
            return EstadoPedido.Listo;
        }

        return EstadoPedido.Pagado;
    }

    private static EstadoPedido ResolverEstadoEfectivo(Pedido p)
    {
        if (p.Ped_Estado == EstadoPedido.Pagado || p.Ped_Estado == EstadoPedido.Anulado)
        {
            return p.Ped_Estado;
        }

        var comandasValidas = p.Ped_Comandas.Where(c => c.Cmd_Estado != EstadoComanda.Cancelada).ToList();
        if (!comandasValidas.Any())
        {
            return p.Ped_Estado;
        }

        if (comandasValidas.Any(c => c.Cmd_Estado == EstadoComanda.EnPreparacion))
        {
            return EstadoPedido.EnPreparacion;
        }

        if (comandasValidas.Any(c => c.Cmd_Estado == EstadoComanda.Pendiente))
        {
            return EstadoPedido.Pendiente;
        }

        if (comandasValidas.All(c => c.Cmd_Estado == EstadoComanda.Lista))
        {
            return EstadoPedido.Listo;
        }

        return p.Ped_Estado;
    }
}
