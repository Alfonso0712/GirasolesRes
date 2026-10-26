using GirasolesRes.Application.Common;
using GirasolesRes.Application.Common.Exceptions;
using GirasolesRes.Application.DTOs.Pedidos;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Interfaces.Services;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Application.Services;

public class PedidoService : IPedidoService
{
    private readonly IPedidoRepository _pedidoRepository;
    private readonly IMesaRepository _mesaRepository;
    private readonly IProductoRepository _productoRepository;
    private readonly IMenuDiaRepository _menuDiaRepository;
    private readonly IMenuCompletoRepository? _menuCompletoRepository;

    public PedidoService(
        IPedidoRepository pedidoRepository,
        IMesaRepository mesaRepository,
        IProductoRepository productoRepository,
        IMenuDiaRepository menuDiaRepository,
        IMenuCompletoRepository? menuCompletoRepository = null)
    {
        _pedidoRepository = pedidoRepository;
        _mesaRepository = mesaRepository;
        _productoRepository = productoRepository;
        _menuDiaRepository = menuDiaRepository;
        _menuCompletoRepository = menuCompletoRepository;
    }

    public async Task<RegistrarPedidoResultDto> RegistrarPedidoMesaAsync(
        RegistrarPedidoMesaRequest request,
        string nombreUsuario,
        Guid usuarioId,
        string? direccionIp,
        CancellationToken ct = default)
    {
        // 1. Idempotencia (RNF-21): Si ya existe un pedido con este solicitudId, retornar el original sin duplicar
        var pedidoExistente = await _pedidoRepository.ObtenerPorSolicitudIdAsync(request.SolicitudId, ct);
        if (pedidoExistente != null)
        {
            var comandaInicial = pedidoExistente.Ped_Comandas.FirstOrDefault();
            return new RegistrarPedidoResultDto(
                pedidoExistente.Id_Pedido,
                pedidoExistente.Ped_NumeroDiario,
                pedidoExistente.Ped_Total,
                comandaInicial?.Id_Comanda ?? Guid.Empty,
                pedidoExistente.Ped_Mesa?.Mes_Nombre ?? "Mesa"
            );
        }

        // 2. Validación de Mesa (RV-60, RN-54)
        var mesa = await _mesaRepository.ObtenerPorIdAsync(request.MesaId, ct);
        if (mesa == null)
        {
            throw new KeyNotFoundException(MensajesCatalogo.MSG_96);
        }

        if (!mesa.Mes_Activa)
        {
            throw new PedidoConflictException("mesa_inactiva", "La mesa seleccionada se encuentra inactiva.");
        }

        // RV-60, RN-54: Varios pedidos por mesa permitidos; mesa pasa/permanece en Ocupada

        // 3 y 4. Validación de Productos y Menús Completos (RV-61, RV-62, RV-63, RV-64, RV-65, RV-163, RV-166, RN-54, CUS07.1)
        var fechaOperativa = TimeZoneHelper.ObtenerFechaActualLima();
        var menuDia = await _menuDiaRepository.ObtenerPorFechaAsync(fechaOperativa, ct);

        // RN-142: Sin menú del día definido no se bloquean ventas

        var itemsProcesados = await ValidarYProcesarLineasAsync(request.Lineas, menuDia, ct);

        // 5. Generación de Correlativos Diarios (RN-49)
        var siguienteNumeroPedido = await _pedidoRepository.ObtenerSiguienteNumeroDiarioAsync(fechaOperativa, ct);
        var siguienteNumeroComanda = await _pedidoRepository.ObtenerSiguienteNumeroComandaDiarioAsync(fechaOperativa, ct);

        // 6. Creación Atómica del Pedido y Comanda (RN-50, RN-51, CUS10.1)
        var pedido = new Pedido(
            siguienteNumeroPedido,
            fechaOperativa,
            mesa.Id_Mesa,
            usuarioId,
            request.SolicitudId,
            TipoPedido.Mesa,
            request.Notas
        );

        var comanda = new Comanda(pedido.Id_Pedido, siguienteNumeroComanda, mesa.Mes_Nombre, cmdEsAdicional: false);
        AplicarLineasAPedidoYComanda(pedido, comanda, itemsProcesados);
        pedido.AgregarComanda(comanda);

        // Ocupar Mesa
        mesa.CambiarOcupacion(EstadoOcupacionMesa.Ocupada);
        await _mesaRepository.ActualizarAsync(mesa, ct);

        // Guardar Pedido
        await _pedidoRepository.AgregarAsync(pedido, ct);

        // Auditoría (RN-56)
        var auditoria = new AuditoriaPedido(
            nombreUsuario,
            "RegistroPedido",
            mesa.Mes_Nombre,
            pedido.Ped_NumeroDiario,
            $"Pedido #{pedido.Ped_NumeroDiario} registrado para {mesa.Mes_Nombre}. Líneas: {pedido.Ped_Detalles.Count}. Total: S/ {pedido.Ped_Total:F2}",
            direccionIp
        );
        await _pedidoRepository.RegistrarAuditoriaAsync(auditoria, ct);

        return new RegistrarPedidoResultDto(
            pedido.Id_Pedido,
            pedido.Ped_NumeroDiario,
            pedido.Ped_Total,
            comanda.Id_Comanda,
            mesa.Mes_Nombre
        );
    }

    public async Task<RegistrarPedidoLlevarResultDto> RegistrarPedidoLlevarAsync(
        RegistrarPedidoLlevarRequest request,
        string nombreUsuario,
        Guid usuarioId,
        string? direccionIp,
        CancellationToken ct = default)
    {
        // 1. Idempotencia (RNF-21): Si ya existe un pedido con este solicitudId, retornar el original sin duplicar
        var pedidoExistente = await _pedidoRepository.ObtenerPorSolicitudIdAsync(request.SolicitudId, ct);
        if (pedidoExistente != null)
        {
            var comandaInicial = pedidoExistente.Ped_Comandas.FirstOrDefault();
            return new RegistrarPedidoLlevarResultDto(
                pedidoExistente.Id_Pedido,
                pedidoExistente.Ped_NumeroDiario,
                pedidoExistente.Ped_Total,
                comandaInicial?.Id_Comanda ?? Guid.Empty
            );
        }

        // 2. Validación de Líneas (RV-61, RV-62, RV-64)
        if (request.Lineas == null || request.Lineas.Count == 0)
        {
            throw new ArgumentException(MensajesCatalogo.MSG_97);
        }

        foreach (var l in request.Lineas)
        {
            if (l.Cantidad < 1 || l.Cantidad > 20)
            {
                throw new ArgumentOutOfRangeException(nameof(l.Cantidad), MensajesCatalogo.MSG_98);
            }
            if (l.Observacion != null && l.Observacion.Trim().Length > 100)
            {
                throw new ArgumentException(MensajesCatalogo.MSG_99);
            }
        }

        // 3. Validación de Referencia del Cliente (RV-73)
        var referenciaNormalizada = string.IsNullOrWhiteSpace(request.Referencia) ? null : request.Referencia.Trim();
        if (referenciaNormalizada != null && referenciaNormalizada.Length > 30)
        {
            throw new ArgumentException(MensajesCatalogo.MSG_109);
        }

        // 4. Validación de Productos y Menús Completos (RV-63, RV-65, RV-163, RV-166, RN-54, CUS08)
        var fechaOperativa = TimeZoneHelper.ObtenerFechaActualLima();
        var menuDia = await _menuDiaRepository.ObtenerPorFechaAsync(fechaOperativa, ct);

        // RN-142: Sin menú del día definido no se bloquean ventas

        var itemsProcesados = await ValidarYProcesarLineasAsync(request.Lineas, menuDia, ct);

        // 5. Generación de Correlativos Diarios (RN-49, RN-58)
        var siguienteNumeroPedido = await _pedidoRepository.ObtenerSiguienteNumeroDiarioAsync(fechaOperativa, ct);
        var siguienteNumeroComanda = await _pedidoRepository.ObtenerSiguienteNumeroComandaDiarioAsync(fechaOperativa, ct);

        // 6. Creación Atómica del Pedido y Comanda (RN-58, RN-59, RN-60, CUS10.1)
        var pedido = new Pedido(
            siguienteNumeroPedido,
            fechaOperativa,
            null, // El pedido para llevar no usa mesa (RN-59, RV-72)
            usuarioId,
            request.SolicitudId,
            TipoPedido.ParaLlevar,
            referenciaNormalizada
        );

        // Crear Comanda para cocina con rótulo "Para llevar" o "Para llevar - [Referencia]"
        var nombreComanda = string.IsNullOrWhiteSpace(referenciaNormalizada)
            ? "Para llevar"
            : $"Para llevar - {referenciaNormalizada}";

        if (nombreComanda.Length > 50)
        {
            nombreComanda = nombreComanda.Substring(0, 50);
        }

        var comanda = new Comanda(pedido.Id_Pedido, siguienteNumeroComanda, nombreComanda, cmdEsAdicional: false);
        AplicarLineasAPedidoYComanda(pedido, comanda, itemsProcesados);
        pedido.AgregarComanda(comanda);

        // Guardar Pedido (sin ocupar ninguna mesa)
        await _pedidoRepository.AgregarAsync(pedido, ct);

        // Auditoría (RN-62)
        var auditoria = new AuditoriaPedido(
            nombreUsuario,
            "RegistroPedidoLlevar",
            "Para llevar",
            pedido.Ped_NumeroDiario,
            $"Pedido para llevar #{pedido.Ped_NumeroDiario} registrado{(string.IsNullOrWhiteSpace(referenciaNormalizada) ? "" : $" (Ref: {referenciaNormalizada})")}. Líneas: {pedido.Ped_Detalles.Count}. Total: S/ {pedido.Ped_Total:F2}",
            direccionIp
        );
        await _pedidoRepository.RegistrarAuditoriaAsync(auditoria, ct);

        return new RegistrarPedidoLlevarResultDto(
            pedido.Id_Pedido,
            pedido.Ped_NumeroDiario,
            pedido.Ped_Total,
            comanda.Id_Comanda
        );
    }

    public async Task<AgregarLineasResultDto> AgregarLineasAsync(
        Guid pedidoId,
        AgregarLineasPedidoRequest request,
        string nombreUsuario,
        Guid usuarioId,
        string? direccionIp,
        CancellationToken ct = default)
    {
        // 1. Obtener Pedido actual
        var pedido = await _pedidoRepository.ObtenerPorIdAsync(pedidoId, ct);
        if (pedido == null)
        {
            throw new KeyNotFoundException("El pedido especificado no existe.");
        }

        // 2. Verificar que no esté pagado ni anulado (RV-69 / RN-52)
        if (pedido.Ped_Estado == EstadoPedido.Pagado || pedido.Ped_Estado == EstadoPedido.Anulado)
        {
            throw new PedidoConflictException("pedido_cerrado", MensajesCatalogo.MSG_104);
        }

        // 3. Validar líneas
        if (request.Lineas == null || request.Lineas.Count == 0)
        {
            throw new ArgumentException(MensajesCatalogo.MSG_97);
        }

        foreach (var l in request.Lineas)
        {
            if (l.Cantidad < 1 || l.Cantidad > 20)
            {
                throw new ArgumentOutOfRangeException(nameof(l.Cantidad), MensajesCatalogo.MSG_98);
            }
            if (l.Observacion != null && l.Observacion.Trim().Length > 100)
            {
                throw new ArgumentException(MensajesCatalogo.MSG_99);
            }
        }

        // 4. Validar disponibilidad de productos nuevos y menús completos (RV-63, RV-65, RV-163, RV-166, RN-54, CUS07.2)
        var fechaOperativa = TimeZoneHelper.ObtenerFechaActualLima();
        var menuDia = await _menuDiaRepository.ObtenerPorFechaAsync(fechaOperativa, ct);

        // RN-142: Sin menú del día definido no se bloquean ventas

        var itemsProcesados = await ValidarYProcesarLineasAsync(request.Lineas, menuDia, ct);

        // 5. Correlativo de comanda adicional
        var siguienteNumeroComanda = await _pedidoRepository.ObtenerSiguienteNumeroComandaDiarioAsync(fechaOperativa, ct);
        var mesaNombre = pedido.Ped_Mesa?.Mes_Nombre ?? "Mesa";

        var comandaAdicional = new Comanda(pedido.Id_Pedido, siguienteNumeroComanda, mesaNombre, cmdEsAdicional: true);
        AplicarLineasAPedidoYComanda(pedido, comandaAdicional, itemsProcesados);
        pedido.AgregarComanda(comandaAdicional);

        // 6. Regla RN-53: Si el pedido estaba "Listo", vuelve a "Pendiente" hasta que cocina marque la adicional
        if (pedido.Ped_Estado == EstadoPedido.Listo)
        {
            pedido.CambiarEstado(EstadoPedido.Pendiente);
        }

        await _pedidoRepository.ActualizarAsync(pedido, ct);

        // Auditoría (RN-56)
        var auditoria = new AuditoriaPedido(
            nombreUsuario,
            "AmpliacionPedido",
            mesaNombre,
            pedido.Ped_NumeroDiario,
            $"Ampliación de pedido #{pedido.Ped_NumeroDiario} con {request.Lineas.Count} nuevas líneas. Nuevo total: S/ {pedido.Ped_Total:F2}",
            direccionIp
        );
        await _pedidoRepository.RegistrarAuditoriaAsync(auditoria, ct);

        return new AgregarLineasResultDto(pedido.Ped_Total, comandaAdicional.Id_Comanda, pedido.Ped_NumeroDiario);
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

            // Desayuno del día
            if (menuDia.Id_Desayuno.HasValue)
            {
                var des = await _productoRepository.ObtenerPorIdAsync(menuDia.Id_Desayuno.Value, ct);
                if (des != null && des.Pro_Activo)
                {
                    lista.Add(new ProductoMenuPedidoDto(
                        des.Id_Producto,
                        des.Pro_Nombre,
                        des.Pro_Categoria?.ToString() ?? string.Empty,
                        des.Pro_Precio.GetValueOrDefault(),
                        Agotado: false,
                        Disponible: true
                    ));
                }
            }

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
            p.Pro_Categoria?.ToString() ?? string.Empty,
            p.Pro_Precio.GetValueOrDefault(),
            Agotado: false,
            Disponible: true
        )).ToList();
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

    public async Task<decimal> ModificarPedidoAsync(
        Guid pedidoId,
        ModificarPedidoRequest request,
        Guid usuarioId,
        string rol,
        string nombreUsuario,
        string? direccionIp,
        CancellationToken ct = default)
    {
        // RN-65: Solo Mozo o Cajero
        if (!string.Equals(rol, "Mozo", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(rol, "Cajero", StringComparison.OrdinalIgnoreCase))
        {
            throw new UnauthorizedAccessException(MensajesCatalogo.MSG_39);
        }

        var pedido = await _pedidoRepository.ObtenerDetalleCompletoPorIdAsync(pedidoId, ct);
        if (pedido == null)
        {
            throw new KeyNotFoundException("Pedido no encontrado.");
        }

        // RN-65: Mismo usuario que lo registró
        if (pedido.Id_Usuario != usuarioId)
        {
            throw new UnauthorizedAccessException(MensajesCatalogo.MSG_116);
        }

        // RN-70: Pagado o anulado no se puede modificar
        if (pedido.Ped_Estado == EstadoPedido.Pagado || pedido.Ped_Estado == EstadoPedido.Anulado)
        {
            throw new PedidoConflictException("pedido_bloqueado", MensajesCatalogo.MSG_104);
        }

        // RV-75 / RV-80: Revalidar que todas las comandas sigan pendientes
        var comandasValidas = pedido.Ped_Comandas.Where(c => c.Cmd_Estado != EstadoComanda.Cancelada).ToList();
        if (comandasValidas.Any(c => c.Cmd_Estado != EstadoComanda.Pendiente))
        {
            throw new PedidoConflictException("cocina_iniciada", MensajesCatalogo.MSG_115);
        }

        // RV-78 / MSG-121: Quitar todos los productos obliga a anular
        if (request.Lineas == null || request.Lineas.Count == 0)
        {
            throw new ArgumentException(MensajesCatalogo.MSG_121);
        }

        // Validación de líneas individuales (RV-78)
        foreach (var l in request.Lineas)
        {
            if (l.Cantidad < 1 || l.Cantidad > 20)
            {
                throw new ArgumentOutOfRangeException(nameof(l.Cantidad), MensajesCatalogo.MSG_98);
            }
            if (l.Observacion != null && l.Observacion.Trim().Length > 100)
            {
                throw new ArgumentException(MensajesCatalogo.MSG_99);
            }
        }

        // RN-69: Conservar precios de líneas existentes; productos nuevos toman precio vigente
        var fechaOperativa = TimeZoneHelper.ObtenerFechaActualLima();
        var menuDia = await _menuDiaRepository.ObtenerPorFechaAsync(fechaOperativa, ct);

        var itemsProcesados = await ValidarYProcesarLineasAsync(request.Lineas, menuDia, ct);

        var preciosOriginalesProductos = pedido.Ped_Detalles
            .Where(d => d.Id_Producto.HasValue)
            .GroupBy(d => d.Id_Producto!.Value)
            .ToDictionary(g => g.Key, g => g.First().Det_PrecioUnitario);

        var preciosOriginalesMenus = pedido.Ped_Detalles
            .Where(d => d.Id_MenuCompleto.HasValue)
            .GroupBy(d => d.Id_MenuCompleto!.Value)
            .ToDictionary(g => g.Key, g => g.First().Det_PrecioUnitario);

        var nuevasLineasPedido = new List<DetallePedido>();
        var nuevosDetallesComanda = new List<DetalleComanda>();

        var comandaPrincipal = pedido.Ped_Comandas.FirstOrDefault(c => !c.Cmd_EsAdicional) ?? pedido.Ped_Comandas.FirstOrDefault();
        if (comandaPrincipal == null)
        {
            throw new InvalidOperationException("El pedido no contiene una comanda asociada.");
        }

        foreach (var item in itemsProcesados)
        {
            decimal precioUnitario = item.PrecioUnitario;
            if (item.EsMenuCompleto)
            {
                if (preciosOriginalesMenus.TryGetValue(item.MenuCompletoId!.Value, out var precioGuardado))
                {
                    precioUnitario = precioGuardado;
                }

                var nuevaLinea = new DetallePedido(
                    pedido.Id_Pedido,
                    item.MenuCompletoId.Value,
                    item.Nombre,
                    item.Incluye,
                    item.Cantidad,
                    precioUnitario,
                    item.Observacion?.Trim()
                );

                foreach (var op in item.Opciones)
                {
                    nuevaLinea.AgregarOpcion(op.ParteNombre, op.ProductoId, op.ProductoNombre);
                }
                nuevasLineasPedido.Add(nuevaLinea);

                var eleccionesStr = string.Join(" + ", item.Opciones.Select(o => o.ProductoNombre));
                nuevosDetallesComanda.Add(new DetalleComanda(
                    comandaPrincipal.Id_Comanda,
                    null,
                    item.MenuCompletoId.Value,
                    item.Nombre,
                    item.Cantidad,
                    item.Observacion?.Trim(),
                    eleccionesStr,
                    item.Incluye
                ));
            }
            else
            {
                if (preciosOriginalesProductos.TryGetValue(item.ProductoId!.Value, out var precioGuardado))
                {
                    precioUnitario = precioGuardado;
                }

                var nuevaLinea = new DetallePedido(
                    pedido.Id_Pedido,
                    item.ProductoId!.Value,
                    item.Nombre,
                    item.Cantidad,
                    precioUnitario,
                    item.Observacion?.Trim()
                );
                nuevasLineasPedido.Add(nuevaLinea);

                nuevosDetallesComanda.Add(new DetalleComanda(
                    comandaPrincipal.Id_Comanda,
                    item.ProductoId.Value,
                    item.Nombre,
                    item.Cantidad,
                    item.Observacion?.Trim()
                ));
            }
        }

        pedido.ModificarLineas(nuevasLineasPedido);
        comandaPrincipal.ReemplazarDetalles(nuevosDetallesComanda);

        await _pedidoRepository.ActualizarAsync(pedido, ct);

        // Auditoría (RN-73)
        var auditoria = new AuditoriaPedido(
            nombreUsuario,
            "Modificación de pedido",
            pedido.Ped_Mesa?.Mes_Nombre ?? "Para llevar",
            pedido.Ped_NumeroDiario,
            $"Pedido modificado por {nombreUsuario}. Nuevo total: S/ {pedido.Ped_Total:F2}",
            direccionIp
        );
        await _pedidoRepository.RegistrarAuditoriaAsync(auditoria, ct);

        return pedido.Ped_Total;
    }

    public async Task AnularPedidoAsync(
        Guid pedidoId,
        AnularPedidoRequest request,
        Guid usuarioId,
        string rol,
        string nombreUsuario,
        string? direccionIp,
        CancellationToken ct = default)
    {
        // RN-65: Mozo, Cajero o Administrador
        var esAdmin = string.Equals(rol, "Administrador", StringComparison.OrdinalIgnoreCase);
        if (!string.Equals(rol, "Mozo", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(rol, "Cajero", StringComparison.OrdinalIgnoreCase) &&
            !esAdmin)
        {
            throw new UnauthorizedAccessException(MensajesCatalogo.MSG_39);
        }

        var pedido = await _pedidoRepository.ObtenerDetalleCompletoPorIdAsync(pedidoId, ct);
        if (pedido == null)
        {
            throw new KeyNotFoundException("Pedido no encontrado.");
        }

        // RN-65: Si no es Administrador, solo el mismo usuario que lo registró puede anularlo
        if (!esAdmin && pedido.Id_Usuario != usuarioId)
        {
            throw new UnauthorizedAccessException(MensajesCatalogo.MSG_116);
        }

        // RN-70: Pagado o anulado no se puede modificar ni anular
        if (pedido.Ped_Estado == EstadoPedido.Pagado || pedido.Ped_Estado == EstadoPedido.Anulado)
        {
            throw new PedidoConflictException("pedido_bloqueado", MensajesCatalogo.MSG_104);
        }

        // RV-75 / RV-80: Para Mozo y Cajero, revalidar que todas las comandas sigan pendientes.
        // El Administrador puede anular cualquier pedido no pagado, aun con comandas en preparación o listas.
        if (!esAdmin)
        {
            var comandasValidas = pedido.Ped_Comandas.Where(c => c.Cmd_Estado != EstadoComanda.Cancelada).ToList();
            if (comandasValidas.Any(c => c.Cmd_Estado != EstadoComanda.Pendiente))
            {
                throw new PedidoConflictException("cocina_iniciada", MensajesCatalogo.MSG_115);
            }
        }

        // RV-76: Motivo obligatorio entre 5 y 100 caracteres
        var motivo = request.Motivo?.Trim() ?? string.Empty;
        if (motivo.Length < 5 || motivo.Length > 100)
        {
            throw new ArgumentException(MensajesCatalogo.MSG_117);
        }

        pedido.Anular(motivo);

        // RN-67: Al anular el único pedido abierto de una mesa, la mesa vuelve a Libre
        if (pedido.Id_Mesa.HasValue)
        {
            var tieneOtros = await _pedidoRepository.TieneOtrosPedidosAbiertosEnMesaAsync(pedido.Id_Mesa.Value, pedido.Id_Pedido, ct);
            if (!tieneOtros)
            {
                var mesa = await _mesaRepository.ObtenerPorIdAsync(pedido.Id_Mesa.Value, ct);
                if (mesa != null && mesa.Mes_Ocupacion == EstadoOcupacionMesa.Ocupada)
                {
                    mesa.CambiarOcupacion(EstadoOcupacionMesa.Libre);
                    await _mesaRepository.ActualizarAsync(mesa, ct);
                }
            }
        }

        await _pedidoRepository.ActualizarAsync(pedido, ct);

        // Auditoría (RN-73)
        var auditoria = new AuditoriaPedido(
            nombreUsuario,
            "Anulación de pedido",
            pedido.Ped_Mesa?.Mes_Nombre ?? "Para llevar",
            pedido.Ped_NumeroDiario,
            $"Pedido anulado por {nombreUsuario}. Motivo: {motivo}",
            direccionIp
        );
        await _pedidoRepository.RegistrarAuditoriaAsync(auditoria, ct);
    }

    public async Task<IReadOnlyList<AvisoComandaDto>> ObtenerAvisosPendientesAsync(
        Guid usuarioId,
        string rol,
        CancellationToken ct = default)
    {
        var esCajero = string.Equals(rol, "Cajero", StringComparison.OrdinalIgnoreCase);
        var fechaOperativa = TimeZoneHelper.ObtenerFechaActualLima();
        var comandas = await _pedidoRepository.ObtenerAvisosPendientesAsync(fechaOperativa, usuarioId, esCajero, ct);

        return comandas.Select(c => new AvisoComandaDto(
            c.Id_Comanda,
            c.Id_Pedido,
            c.Cmd_Pedido?.Ped_NumeroDiario ?? c.Cmd_NumeroDiario,
            c.Cmd_Pedido?.Ped_Tipo.ToString() ?? "Mesa",
            c.Cmd_Pedido?.Ped_Mesa?.Mes_Nombre ?? c.Cmd_NombreMesa,
            c.Cmd_Pedido?.Ped_Notas,
            c.Cmd_FechaHoraUtc.AddHours(-5).ToString("HH:mm")
        )).ToList();
    }

    public async Task MarcarAvisoVistoAsync(
        Guid comandaId,
        Guid usuarioId,
        string nombreUsuario,
        string? direccionIp,
        CancellationToken ct = default)
    {
        var comanda = await _pedidoRepository.ObtenerComandaPorIdAsync(comandaId, ct);
        if (comanda == null)
        {
            throw new KeyNotFoundException("Comanda no encontrada.");
        }

        comanda.MarcarAvisoVisto(nombreUsuario);
        await _pedidoRepository.ActualizarComandaAsync(comanda, ct);

        var auditoria = new AuditoriaPedido(
            nombreUsuario,
            "Aviso de comanda visto",
            comanda.Cmd_NombreMesa,
            comanda.Cmd_Pedido?.Ped_NumeroDiario ?? comanda.Cmd_NumeroDiario,
            $"Aviso de comanda lista visto y cerrado por {nombreUsuario}.",
            direccionIp
        );
        await _pedidoRepository.RegistrarAuditoriaAsync(auditoria, ct);
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

    private class ItemProcesadoLinea
    {
        public bool EsMenuCompleto { get; set; }
        public Guid? ProductoId { get; set; }
        public int? MenuCompletoId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Incluye { get; set; }
        public decimal PrecioUnitario { get; set; }
        public int Cantidad { get; set; }
        public string? Observacion { get; set; }
        public List<(string ParteNombre, Guid ProductoId, string ProductoNombre)> Opciones { get; set; } = new();
    }

    private async Task<List<ItemProcesadoLinea>> ValidarYProcesarLineasAsync(
        List<LineaPedidoRequest> lineas,
        MenuDia? menuDia,
        CancellationToken ct)
    {
        if (lineas == null || lineas.Count == 0)
        {
            throw new ArgumentException(MensajesCatalogo.MSG_97);
        }

        var todosProductoIds = new HashSet<Guid>();
        var todosMenuCompletoIds = new HashSet<int>();

        foreach (var l in lineas)
        {
            if (l.MenuCompletoId.HasValue)
            {
                todosMenuCompletoIds.Add(l.MenuCompletoId.Value);
                if (l.Elecciones != null)
                {
                    foreach (var e in l.Elecciones)
                    {
                        todosProductoIds.Add(e.ProductoId);
                    }
                }
            }
            else if (l.ProductoId.HasValue)
            {
                todosProductoIds.Add(l.ProductoId.Value);
            }
            else
            {
                throw new ArgumentException(MensajesCatalogo.MSG_97);
            }
        }

        var productos = (await _productoRepository.ObtenerPorIdsAsync(todosProductoIds, ct)) ?? new List<Producto>();
        var productosDict = productos.ToDictionary(p => p.Id_Producto);

        Dictionary<int, MenuCompleto> menusDict = new();
        if (_menuCompletoRepository != null && todosMenuCompletoIds.Count > 0)
        {
            var menus = await _menuCompletoRepository.ObtenerTodosAsync(soloActivos: false, ct);
            menusDict = menus.ToDictionary(m => m.Id_MenuCompleto);
        }

        var menuDiaDefinido = menuDia != null && (menuDia.Men_Platos.Count > 0 || menuDia.Id_Desayuno.HasValue || menuDia.Men_MenusCompletos.Count > 0);
        var menusHabilitadosHoy = menuDiaDefinido
            ? menuDia!.Men_MenusCompletos.Select(m => m.Id_MenuCompleto).ToHashSet()
            : menusDict.Values.Where(m => m.Men_Activo).Select(m => m.Id_MenuCompleto).ToHashSet();
        var platosMenuDiaDict = menuDiaDefinido
            ? menuDia!.Men_Platos.ToDictionary(p => p.Id_Producto, p => p.Mdp_Agotado)
            : new Dictionary<Guid, bool>();

        var itemsProcesados = new List<ItemProcesadoLinea>();

        foreach (var l in lineas)
        {
            if (l.MenuCompletoId.HasValue)
            {
                if (!menusDict.TryGetValue(l.MenuCompletoId.Value, out var menuCompleto) || !menuCompleto.Men_Activo)
                {
                    throw new KeyNotFoundException($"El menú completo con ID {l.MenuCompletoId.Value} no existe o está inactivo.");
                }

                // RV-166 / MSG-220: Verificar que el menú completo esté habilitado en el menú del día
                if (!menusHabilitadosHoy.Contains(menuCompleto.Id_MenuCompleto))
                {
                    throw new PedidoConflictException("menu_no_disponible", string.Format(MensajesCatalogo.MSG_220, menuCompleto.Men_Nombre, "menú del día"));
                }

                // RV-163 / MSG-221: Validar que se envíe exactamente una opción por cada parte obligatoria
                var partesOrdenadas = menuCompleto.Men_Partes.OrderBy(p => p.Par_Orden).ToList();
                var opcionesProcesadas = new List<(string ParteNombre, Guid ProductoId, string ProductoNombre)>();

                if (l.Elecciones == null || l.Elecciones.Count != partesOrdenadas.Count)
                {
                    var parteFaltante = partesOrdenadas.FirstOrDefault(p =>
                        l.Elecciones == null || !l.Elecciones.Any(e => string.Equals(e.Parte?.Trim(), p.Par_Nombre?.Trim(), StringComparison.OrdinalIgnoreCase)));
                    var nombreParte = parteFaltante?.Par_Nombre ?? "menú completo";
                    throw new ArgumentException(string.Format(MensajesCatalogo.MSG_221, nombreParte));
                }

                foreach (var parte in partesOrdenadas)
                {
                    var eleccion = l.Elecciones.FirstOrDefault(e =>
                        string.Equals(e.Parte?.Trim(), parte.Par_Nombre?.Trim(), StringComparison.OrdinalIgnoreCase));

                    if (eleccion == null)
                    {
                        throw new ArgumentException(string.Format(MensajesCatalogo.MSG_221, parte.Par_Nombre));
                    }

                    if (!productosDict.TryGetValue(eleccion.ProductoId, out var productoComponente) || !productoComponente.Pro_Activo)
                    {
                        throw new ArgumentException($"La opción seleccionada para '{parte.Par_Nombre}' no existe o se encuentra inactiva.");
                    }

                    // Validar rol de componente con roles permitidos de la parte
                    if (!productoComponente.Pro_Rol.HasValue || !parte.Par_RolesPermitidos.Contains(productoComponente.Pro_Rol.Value))
                    {
                        throw new ArgumentException($"El producto '{productoComponente.Pro_Nombre}' no es válido para la parte '{parte.Par_Nombre}'.");
                    }

                    // RV-166 / MSG-223: Revalidar que la opción elegida no esté agotada en el menú del día
                    if (platosMenuDiaDict.TryGetValue(productoComponente.Id_Producto, out var estaAgotado) && estaAgotado)
                    {
                        throw new PedidoConflictException("opcion_agotada", string.Format(MensajesCatalogo.MSG_223, productoComponente.Pro_Nombre, parte.Par_Nombre));
                    }

                    opcionesProcesadas.Add((parte.Par_Nombre, productoComponente.Id_Producto, productoComponente.Pro_Nombre));
                }

                itemsProcesados.Add(new ItemProcesadoLinea
                {
                    EsMenuCompleto = true,
                    MenuCompletoId = menuCompleto.Id_MenuCompleto,
                    Nombre = menuCompleto.Men_Nombre,
                    Incluye = menuCompleto.Men_Incluye,
                    PrecioUnitario = menuCompleto.Men_Precio,
                    Cantidad = l.Cantidad,
                    Observacion = l.Observacion?.Trim(),
                    Opciones = opcionesProcesadas
                });
            }
            else if (l.ProductoId.HasValue)
            {
                if (!productosDict.TryGetValue(l.ProductoId.Value, out var producto) || !producto.Pro_Activo)
                {
                    throw new KeyNotFoundException($"El producto especificado no existe o está inactivo.");
                }

                // RN-140 / MSG-215: Los componentes no se pueden pedir directamente como productos de carta
                if (producto.Pro_Tipo == TipoProducto.Componente)
                {
                    throw new ArgumentException(MensajesCatalogo.MSG_215);
                }

                // RV-63 / MSG-225: Revalidar disponibilidad y que no esté agotado
                if (platosMenuDiaDict.TryGetValue(producto.Id_Producto, out var estaAgotado) && estaAgotado)
                {
                    throw new PedidoConflictException("producto_agotado", string.Format(MensajesCatalogo.MSG_225, producto.Pro_Nombre));
                }

                itemsProcesados.Add(new ItemProcesadoLinea
                {
                    EsMenuCompleto = false,
                    ProductoId = producto.Id_Producto,
                    Nombre = producto.Pro_Nombre,
                    PrecioUnitario = producto.Pro_Precio.GetValueOrDefault(),
                    Cantidad = l.Cantidad,
                    Observacion = l.Observacion?.Trim()
                });
            }
        }

        return itemsProcesados;
    }

    private static void AplicarLineasAPedidoYComanda(Pedido pedido, Comanda comanda, List<ItemProcesadoLinea> items)
    {
        foreach (var item in items)
        {
            if (item.EsMenuCompleto)
            {
                pedido.AgregarOLineaMenuCompleto(
                    item.MenuCompletoId!.Value,
                    item.Nombre,
                    item.Incluye,
                    item.Cantidad,
                    item.PrecioUnitario,
                    item.Observacion,
                    item.Opciones
                );

                var eleccionesStr = string.Join(" + ", item.Opciones.Select(o => o.ProductoNombre));
                comanda.AgregarDetalle(
                    null,
                    item.MenuCompletoId.Value,
                    item.Nombre,
                    item.Cantidad,
                    item.Observacion,
                    eleccionesStr,
                    item.Incluye
                );
            }
            else
            {
                pedido.AgregarOLinea(
                    item.ProductoId!.Value,
                    item.Nombre,
                    item.Cantidad,
                    item.PrecioUnitario,
                    item.Observacion
                );

                comanda.AgregarDetalle(
                    item.ProductoId.Value,
                    item.Nombre,
                    item.Cantidad,
                    item.Observacion
                );
            }
        }
    }
}

