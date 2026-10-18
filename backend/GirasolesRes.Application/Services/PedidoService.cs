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

    public PedidoService(
        IPedidoRepository pedidoRepository,
        IMesaRepository mesaRepository,
        IProductoRepository productoRepository,
        IMenuDiaRepository menuDiaRepository)
    {
        _pedidoRepository = pedidoRepository;
        _mesaRepository = mesaRepository;
        _productoRepository = productoRepository;
        _menuDiaRepository = menuDiaRepository;
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

        if (mesa.Mes_Ocupacion == EstadoOcupacionMesa.Ocupada ||
            await _pedidoRepository.ExistePedidoActivoEnMesaAsync(request.MesaId, ct))
        {
            throw new PedidoConflictException("mesa_ocupada", string.Format(MensajesCatalogo.MSG_95, mesa.Mes_Nombre));
        }

        // 3. Validación de Líneas (RV-61, RV-62, RV-64)
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

        // 4. Validación de Productos y Disponibilidad (RV-63, RV-65, RN-54)
        var fechaOperativa = TimeZoneHelper.ObtenerFechaActualLima();
        var menuDia = await _menuDiaRepository.ObtenerPorFechaAsync(fechaOperativa, ct);

        var productoIds = request.Lineas.Select(l => l.ProductoId).Distinct().ToList();
        var productosMap = new Dictionary<Guid, Producto>();
        var productosAgotadosOInvalidos = new List<Guid>();

        foreach (var pid in productoIds)
        {
            var prod = await _productoRepository.ObtenerPorIdAsync(pid, ct);
            if (prod == null || !prod.Pro_Activo)
            {
                productosAgotadosOInvalidos.Add(pid);
                continue;
            }

            productosMap[pid] = prod;

            if (menuDia != null)
            {
                var platoMenu = menuDia.Men_Platos.FirstOrDefault(p => p.Id_Producto == pid);
                var esDesayuno = menuDia.Id_Desayuno == pid;

                if (platoMenu == null && !esDesayuno)
                {
                    productosAgotadosOInvalidos.Add(pid);
                }
                else if (platoMenu != null && platoMenu.Mdp_Agotado)
                {
                    productosAgotadosOInvalidos.Add(pid);
                }
            }
        }

        if (productosAgotadosOInvalidos.Count > 0)
        {
            var nombres = productosAgotadosOInvalidos
                .Select(id => productosMap.TryGetValue(id, out var p) ? p.Pro_Nombre : "Plato")
                .Distinct()
                .ToList();

            var detalleMsg = string.Format(MensajesCatalogo.MSG_79, string.Join(", ", nombres)) + " " + MensajesCatalogo.MSG_103;
            throw new PedidoConflictException("platos_agotados", detalleMsg, productosAgotadosOInvalidos);
        }

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

        foreach (var linea in request.Lineas)
        {
            var prod = productosMap[linea.ProductoId];
            pedido.AgregarOLinea(linea.ProductoId, linea.Cantidad, prod.Pro_Precio, linea.Observacion);
        }

        // Crear Comanda para cocina
        var comanda = new Comanda(pedido.Id_Pedido, siguienteNumeroComanda, mesa.Mes_Nombre, cmdEsAdicional: false);
        foreach (var detalle in pedido.Ped_Detalles)
        {
            var prod = productosMap[detalle.Id_Producto];
            comanda.AgregarDetalle(detalle.Id_Producto, prod.Pro_Nombre, detalle.Det_Cantidad, detalle.Det_Observacion);
        }
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

        // 4. Validación de Productos y Disponibilidad (RV-63, RV-65, RN-54)
        var fechaOperativa = TimeZoneHelper.ObtenerFechaActualLima();
        var menuDia = await _menuDiaRepository.ObtenerPorFechaAsync(fechaOperativa, ct);

        var productoIds = request.Lineas.Select(l => l.ProductoId).Distinct().ToList();
        var productosMap = new Dictionary<Guid, Producto>();
        var productosAgotadosOInvalidos = new List<Guid>();

        foreach (var pid in productoIds)
        {
            var prod = await _productoRepository.ObtenerPorIdAsync(pid, ct);
            if (prod == null || !prod.Pro_Activo)
            {
                productosAgotadosOInvalidos.Add(pid);
                continue;
            }

            productosMap[pid] = prod;

            if (menuDia != null)
            {
                var platoMenu = menuDia.Men_Platos.FirstOrDefault(p => p.Id_Producto == pid);
                var esDesayuno = menuDia.Id_Desayuno == pid;

                if (platoMenu == null && !esDesayuno)
                {
                    productosAgotadosOInvalidos.Add(pid);
                }
                else if (platoMenu != null && platoMenu.Mdp_Agotado)
                {
                    productosAgotadosOInvalidos.Add(pid);
                }
            }
        }

        if (productosAgotadosOInvalidos.Count > 0)
        {
            var nombres = productosAgotadosOInvalidos
                .Select(id => productosMap.TryGetValue(id, out var p) ? p.Pro_Nombre : "Plato")
                .Distinct()
                .ToList();

            var detalleMsg = string.Format(MensajesCatalogo.MSG_79, string.Join(", ", nombres)) + " " + MensajesCatalogo.MSG_103;
            throw new PedidoConflictException("platos_agotados", detalleMsg, productosAgotadosOInvalidos);
        }

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

        foreach (var linea in request.Lineas)
        {
            var prod = productosMap[linea.ProductoId];
            pedido.AgregarOLinea(linea.ProductoId, linea.Cantidad, prod.Pro_Precio, linea.Observacion);
        }

        // Crear Comanda para cocina con rótulo "Para llevar" o "Para llevar - [Referencia]"
        var nombreComanda = string.IsNullOrWhiteSpace(referenciaNormalizada)
            ? "Para llevar"
            : $"Para llevar - {referenciaNormalizada}";

        if (nombreComanda.Length > 50)
        {
            nombreComanda = nombreComanda.Substring(0, 50);
        }

        var comanda = new Comanda(pedido.Id_Pedido, siguienteNumeroComanda, nombreComanda, cmdEsAdicional: false);
        foreach (var detalle in pedido.Ped_Detalles)
        {
            var prod = productosMap[detalle.Id_Producto];
            comanda.AgregarDetalle(detalle.Id_Producto, prod.Pro_Nombre, detalle.Det_Cantidad, detalle.Det_Observacion);
        }
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

        // 4. Validar disponibilidad de productos nuevos (RV-63, RV-65, RN-54)
        var fechaOperativa = TimeZoneHelper.ObtenerFechaActualLima();
        var menuDia = await _menuDiaRepository.ObtenerPorFechaAsync(fechaOperativa, ct);

        var productoIds = request.Lineas.Select(l => l.ProductoId).Distinct().ToList();
        var productosMap = new Dictionary<Guid, Producto>();
        var productosAgotadosOInvalidos = new List<Guid>();

        foreach (var pid in productoIds)
        {
            var prod = await _productoRepository.ObtenerPorIdAsync(pid, ct);
            if (prod == null || !prod.Pro_Activo)
            {
                productosAgotadosOInvalidos.Add(pid);
                continue;
            }

            productosMap[pid] = prod;

            if (menuDia != null)
            {
                var platoMenu = menuDia.Men_Platos.FirstOrDefault(p => p.Id_Producto == pid);
                var esDesayuno = menuDia.Id_Desayuno == pid;

                if (platoMenu == null && !esDesayuno)
                {
                    productosAgotadosOInvalidos.Add(pid);
                }
                else if (platoMenu != null && platoMenu.Mdp_Agotado)
                {
                    productosAgotadosOInvalidos.Add(pid);
                }
            }
        }

        if (productosAgotadosOInvalidos.Count > 0)
        {
            var nombres = productosAgotadosOInvalidos
                .Select(id => productosMap.TryGetValue(id, out var p) ? p.Pro_Nombre : "Plato")
                .Distinct()
                .ToList();

            var detalleMsg = string.Format(MensajesCatalogo.MSG_79, string.Join(", ", nombres)) + " " + MensajesCatalogo.MSG_103;
            throw new PedidoConflictException("platos_agotados", detalleMsg, productosAgotadosOInvalidos);
        }

        // 5. Correlativo de comanda adicional
        var siguienteNumeroComanda = await _pedidoRepository.ObtenerSiguienteNumeroComandaDiarioAsync(fechaOperativa, ct);
        var mesaNombre = pedido.Ped_Mesa?.Mes_Nombre ?? "Mesa";

        var comandaAdicional = new Comanda(pedido.Id_Pedido, siguienteNumeroComanda, mesaNombre, cmdEsAdicional: true);

        foreach (var linea in request.Lineas)
        {
            var prod = productosMap[linea.ProductoId];
            pedido.AgregarOLinea(linea.ProductoId, linea.Cantidad, prod.Pro_Precio, linea.Observacion);
            comandaAdicional.AgregarDetalle(linea.ProductoId, prod.Pro_Nombre, linea.Cantidad, linea.Observacion);
        }

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
                        des.Pro_Categoria.ToString(),
                        des.Pro_Precio,
                        Agotado: false,
                        Disponible: true
                    ));
                }
            }

            // Platos del menú del día
            foreach (var plato in menuDia.Men_Platos)
            {
                var prod = plato.Mdp_Producto ?? await _productoRepository.ObtenerPorIdAsync(plato.Id_Producto, ct);
                if (prod != null && prod.Pro_Activo)
                {
                    lista.Add(new ProductoMenuPedidoDto(
                        prod.Id_Producto,
                        prod.Pro_Nombre,
                        prod.Pro_Categoria.ToString(),
                        prod.Pro_Precio,
                        Agotado: plato.Mdp_Agotado,
                        Disponible: !plato.Mdp_Agotado
                    ));
                }
            }

            return lista;
        }

        // Si no hay menú del día definido (RN-35), todos los productos activos
        var productos = await _productoRepository.ListarDisponiblesAsync(null, ct);
        return productos
            .Select(p => new ProductoMenuPedidoDto(
                p.Id_Producto,
                p.Pro_Nombre,
                p.Pro_Categoria.ToString(),
                p.Pro_Precio,
                Agotado: false,
                Disponible: true
            ))
            .ToList();
    }

    private static PedidoResponseDto MapearAPedidoDto(Pedido p)
    {
        var lineas = p.Ped_Detalles
            .Select(d => new LineaPedidoResponseDto(
                d.Id_Detalle,
                d.Id_Producto,
                d.Det_Producto?.Pro_Nombre ?? "Producto",
                d.Det_PrecioUnitario,
                d.Det_Cantidad,
                d.Det_Subtotal,
                d.Det_Observacion
            ))
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
            var estadoEfectivo = ResolverEstadoEfectivo(p).ToString();

            // RN-65 / RV-75: Solo modifica o anula el creador, no pagado ni anulado, y todas comandas pendientes
            bool todasComandasPendientes = p.Ped_Comandas.Any() &&
                p.Ped_Comandas.Where(c => c.Cmd_Estado != EstadoComanda.Cancelada).All(c => c.Cmd_Estado == EstadoComanda.Pendiente);

            bool esMozoOCajero = string.Equals(rol, "Mozo", StringComparison.OrdinalIgnoreCase) ||
                                 string.Equals(rol, "Cajero", StringComparison.OrdinalIgnoreCase);

            bool puedeModificarOAnular = esMozoOCajero &&
                                         esMio &&
                                         p.Ped_Estado != EstadoPedido.Pagado &&
                                         p.Ped_Estado != EstadoPedido.Anulado &&
                                         todasComandasPendientes;

            string? motivoDeshabilitado = null;
            if (!puedeModificarOAnular)
            {
                if (p.Ped_Estado == EstadoPedido.Pagado || p.Ped_Estado == EstadoPedido.Anulado)
                {
                    motivoDeshabilitado = MensajesCatalogo.MSG_104;
                }
                else if (!esMio)
                {
                    motivoDeshabilitado = MensajesCatalogo.MSG_116;
                }
                else if (!todasComandasPendientes)
                {
                    motivoDeshabilitado = MensajesCatalogo.MSG_115;
                }
                else if (!esMozoOCajero)
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
                estadoEfectivo,
                p.Ped_Usuario?.Usu_Nombre ?? "Usuario",
                p.Id_Usuario,
                esMio,
                puedeModificarOAnular,
                puedeModificarOAnular,
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

        var lineas = p.Ped_Detalles.Select(d => new LineaDetalleDto(
            d.Id_Detalle,
            d.Id_Producto,
            d.Det_Producto?.Pro_Nombre ?? "Producto",
            d.Det_Cantidad,
            d.Det_PrecioUnitario,
            d.Det_Subtotal,
            d.Det_Observacion
        )).ToList();

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

        var preciosOriginales = pedido.Ped_Detalles
            .GroupBy(d => d.Id_Producto)
            .ToDictionary(g => g.Key, g => g.First().Det_PrecioUnitario);

        var nuevasLineasPedido = new List<DetallePedido>();
        var nuevosDetallesComanda = new List<DetalleComanda>();

        var comandaPrincipal = pedido.Ped_Comandas.FirstOrDefault(c => !c.Cmd_EsAdicional) ?? pedido.Ped_Comandas.FirstOrDefault();
        if (comandaPrincipal == null)
        {
            throw new InvalidOperationException("El pedido no contiene una comanda asociada.");
        }

        foreach (var l in request.Lineas)
        {
            decimal precioUnitario;
            string nombreProducto;

            var prod = await _productoRepository.ObtenerPorIdAsync(l.ProductoId, ct);
            if (prod == null || !prod.Pro_Activo)
            {
                throw new PedidoConflictException("producto_inactivo", "Uno de los productos seleccionados no se encuentra activo.");
            }
            nombreProducto = prod.Pro_Nombre;

            if (preciosOriginales.TryGetValue(l.ProductoId, out var precioGuardado))
            {
                precioUnitario = precioGuardado;
            }
            else
            {
                // Producto nuevo: validar si está agotado en menú del día (MSG-79)
                if (menuDia != null)
                {
                    var platoMenu = menuDia.Men_Platos.FirstOrDefault(p => p.Id_Producto == l.ProductoId);
                    if (platoMenu != null && platoMenu.Mdp_Agotado)
                    {
                        throw new PedidoConflictException("plato_agotado", string.Format(MensajesCatalogo.MSG_79, prod.Pro_Nombre));
                    }
                }
                precioUnitario = prod.Pro_Precio;
            }

            var nuevaLinea = new DetallePedido(pedido.Id_Pedido, l.ProductoId, l.Cantidad, precioUnitario, l.Observacion?.Trim());
            nuevasLineasPedido.Add(nuevaLinea);

            nuevosDetallesComanda.Add(new DetalleComanda(
                comandaPrincipal.Id_Comanda,
                l.ProductoId,
                nombreProducto,
                l.Cantidad,
                l.Observacion?.Trim()
            ));
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

        // RN-70: Pagado o anulado no se puede modificar ni anular
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
        var esMozo = string.Equals(rol, "Mozo", StringComparison.OrdinalIgnoreCase);
        var fechaOperativa = TimeZoneHelper.ObtenerFechaActualLima();
        var comandas = await _pedidoRepository.ObtenerAvisosPendientesAsync(fechaOperativa, usuarioId, esMozo, ct);

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
