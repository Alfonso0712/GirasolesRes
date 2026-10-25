with open('backend/GirasolesRes.Application/Services/PedidoService.cs', 'r', encoding='utf-8') as f:
    code = f.read()

# Normalize line endings to LF for replacements
code_lf = code.replace('\r\n', '\n')

# 1. Remove mesa ocupada check in RegistrarPedidoMesaAsync
old_mesa_check = """        if (mesa.Mes_Ocupacion == EstadoOcupacionMesa.Ocupada ||
            await _pedidoRepository.ExistePedidoActivoEnMesaAsync(request.MesaId, ct))
        {
            throw new PedidoConflictException("mesa_ocupada", string.Format(MensajesCatalogo.MSG_95, mesa.Mes_Nombre));
        }"""
assert old_mesa_check in code_lf, 'old_mesa_check not found'
code_lf = code_lf.replace(old_mesa_check, '        // RV-60, RN-54: Varios pedidos por mesa permitidos; mesa pasa/permanece en Ocupada')

# 2. Do not block if menuDia is not defined
old_menu_check = """        if (menuDia == null || (menuDia.Men_Platos.Count == 0 && !menuDia.Id_Desayuno.HasValue && menuDia.Men_MenusCompletos.Count == 0))
        {
            throw new PedidoConflictException("menu_no_definido", MensajesCatalogo.MSG_MENU_NO_DEFINIDO);
        }"""
assert old_menu_check in code_lf, 'old_menu_check not found'
code_lf = code_lf.replace(old_menu_check, '        // RN-142: Sin menú del día definido no se bloquean ventas')

# 3. ObtenerMenuParaPedidoAsync fallback
old_menu_para_pedido = """        // Si no hay menú del día definido para la fecha actual (CUS07.1 / CUS08), retornar lista vacía
        return Array.Empty<ProductoMenuPedidoDto>();"""

new_menu_para_pedido = """        // RN-142: Sin menú del día definido, ofrecer todos los productos activos de la carta y componentes
        var todosProds = await _productoRepository.ObtenerTodosAsync(soloActivos: true, ct);
        return todosProds.Select(p => new ProductoMenuPedidoDto(
            p.Id_Producto,
            p.Pro_Nombre,
            p.Pro_Categoria?.ToString() ?? string.Empty,
            p.Pro_Precio.GetValueOrDefault(),
            Agotado: false,
            Disponible: true
        )).ToList();"""
assert old_menu_para_pedido in code_lf, 'old_menu_para_pedido not found'
code_lf = code_lf.replace(old_menu_para_pedido, new_menu_para_pedido)

# 4. ValidarYProcesarLineasAsync menusHabilitadosHoy and platosMenuDiaDict
old_menus_hab = """        var menusHabilitadosHoy = menuDia?.Men_MenusCompletos.Select(m => m.Id_MenuCompleto).ToHashSet() ?? new HashSet<int>();
        var platosMenuDiaDict = menuDia?.Men_Platos.ToDictionary(p => p.Id_Producto, p => p.Mdp_Agotado) ?? new Dictionary<Guid, bool>();"""

new_menus_hab = """        var menuDiaDefinido = menuDia != null && (menuDia.Men_Platos.Count > 0 || menuDia.Id_Desayuno.HasValue || menuDia.Men_MenusCompletos.Count > 0);
        var menusHabilitadosHoy = menuDiaDefinido
            ? menuDia!.Men_MenusCompletos.Select(m => m.Id_MenuCompleto).ToHashSet()
            : menusDict.Values.Where(m => m.Men_Activo).Select(m => m.Id_MenuCompleto).ToHashSet();
        var platosMenuDiaDict = menuDiaDefinido
            ? menuDia!.Men_Platos.ToDictionary(p => p.Id_Producto, p => p.Mdp_Agotado)
            : new Dictionary<Guid, bool>();"""
assert old_menus_hab in code_lf, 'old_menus_hab not found'
code_lf = code_lf.replace(old_menus_hab, new_menus_hab)

# 5. ObtenerAvisosPendientesAsync
old_avisos = """        var esMozo = string.Equals(rol, "Mozo", StringComparison.OrdinalIgnoreCase);
        var fechaOperativa = TimeZoneHelper.ObtenerFechaActualLima();
        var comandas = await _pedidoRepository.ObtenerAvisosPendientesAsync(fechaOperativa, usuarioId, esMozo, ct);"""

new_avisos = """        var esCajero = string.Equals(rol, "Cajero", StringComparison.OrdinalIgnoreCase);
        var fechaOperativa = TimeZoneHelper.ObtenerFechaActualLima();
        var comandas = await _pedidoRepository.ObtenerAvisosPendientesAsync(fechaOperativa, usuarioId, esCajero, ct);"""
assert old_avisos in code_lf, 'old_avisos not found'
code_lf = code_lf.replace(old_avisos, new_avisos)

# 6. ListarPedidosAsync: Pagado · EstadoPreparacion, and puedeAnular / puedeModificar for Admin
old_listar_item = """            var esMio = p.Id_Usuario == usuarioId;
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
            );"""

new_listar_item = """            var esMio = p.Id_Usuario == usuarioId;
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
            );"""
assert old_listar_item in code_lf, 'old_listar_item not found'
code_lf = code_lf.replace(old_listar_item, new_listar_item)

# 7. AnularPedidoAsync
old_anular = """        // RN-65: Solo Mozo o Cajero
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
        }"""

new_anular = """        // RN-65: Mozo, Cajero o Administrador
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
        }"""
assert old_anular in code_lf, 'old_anular not found'
code_lf = code_lf.replace(old_anular, new_anular)

# 8. Add ResolverEstadoPreparacion helper
old_resolver_efectivo = """    private static EstadoPedido ResolverEstadoEfectivo(Pedido p)
    {"""

new_resolver_efectivo = """    private static EstadoPedido ResolverEstadoPreparacion(Pedido p)
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
    {"""
assert old_resolver_efectivo in code_lf, 'old_resolver_efectivo not found'
code_lf = code_lf.replace(old_resolver_efectivo, new_resolver_efectivo)

# Re-apply CRLF
code_crlf = code_lf.replace('\n', '\r\n')
with open('backend/GirasolesRes.Application/Services/PedidoService.cs', 'w', encoding='utf-8') as f:
    f.write(code_crlf)

print('PedidoService.cs successfully updated!')
