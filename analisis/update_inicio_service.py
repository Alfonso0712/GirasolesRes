with open('backend/GirasolesRes.Application/Services/InicioService.cs', 'r', encoding='utf-8') as f:
    code = f.read().replace('\r\n', '\n')

old_alerta_menu = """        // 2. Menú de hoy sin definir (MSG-204, Prioridad 2)
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
        }"""

new_alerta_menu = """        // 2. Menú de hoy sin definir (MSG-204, Prioridad 2) - solo si la caja del día está abierta
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

assert old_alerta_menu in code, 'old_alerta_menu not found'
code = code.replace(old_alerta_menu, new_alerta_menu)

with open('backend/GirasolesRes.Application/Services/InicioService.cs', 'w', encoding='utf-8') as f:
    f.write(code)

print('InicioService.cs updated successfully')
