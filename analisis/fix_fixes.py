# Fix PedidoService.cs
with open('backend/GirasolesRes.Application/Services/PedidoService.cs', 'r', encoding='utf-8') as f:
    ps_code = f.read().replace('\r\n', '\n')

old_prod_call = "var todosProds = await _productoRepository.ObtenerTodosAsync(soloActivos: true, ct);"
new_prod_call = "var todosProds = await _productoRepository.ListarDisponiblesAsync(null, cancellationToken: ct);"
assert old_prod_call in ps_code, 'old_prod_call not found'
ps_code = ps_code.replace(old_prod_call, new_prod_call)

with open('backend/GirasolesRes.Application/Services/PedidoService.cs', 'w', encoding='utf-8') as f:
    f.write(ps_code)

print('PedidoService.cs fixed')

# Fix InicioService.cs
with open('backend/GirasolesRes.Application/Services/InicioService.cs', 'r', encoding='utf-8') as f:
    is_code = f.read().replace('\r\n', '\n')

old_is = """        // 2. Menú de hoy sin definir (MSG-204, Prioridad 2) - solo si la caja del día está abierta
        var cajaAbiertaHoy = await _cajaRepository.ObtenerCajaAbiertaAsync(ct);
        if (cajaAbiertaHoy != null)
        {
            var menuRes = await _menuDiaService.ObtenerMenuHoyAsync(ct);
            var menu = menuRes.Data;
            var menuDefinido = menu != null && menu.Definido;
            if (!menuDefinido)
            {
                alertas.Add(new AlertaInicioDto(
                    "menu_sin_definir",
                    MensajesCatalogo.MSG_204,
                    "menu-dia",
                    2
                ));
            }
        }"""

new_is = """        // 2. Menú de hoy sin definir (MSG-204, Prioridad 2) - solo si la caja del día está abierta
        var menuRes = await _menuDiaService.ObtenerMenuHoyAsync(ct);
        var menu = menuRes.Data;
        var menuDefinido = menu != null && menu.Definido;

        var cajaAbiertaHoy = await _cajaRepository.ObtenerCajaAbiertaAsync(ct);
        if (cajaAbiertaHoy != null && !menuDefinido)
        {
            alertas.Add(new AlertaInicioDto(
                "menu_sin_definir",
                MensajesCatalogo.MSG_204,
                "menu-dia",
                2
            ));
        }"""

assert old_is in is_code, 'old_is not found'
is_code = is_code.replace(old_is, new_is)

with open('backend/GirasolesRes.Application/Services/InicioService.cs', 'w', encoding='utf-8') as f:
    f.write(is_code)

print('InicioService.cs fixed')
