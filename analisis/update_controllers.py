# Update PedidosController.cs
with open('backend/GirasolesRes.API/Controllers/PedidosController.cs', 'r', encoding='utf-8') as f:
    code = f.read().replace('\r\n', '\n')

old_rol_llevar = """        var rol = User.FindFirstValue(ClaimTypes.Role);
        if (!string.Equals(rol, "Cajero", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(rol, "Administrador", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = MensajesCatalogo.MSG_39 });
        }"""

new_rol_llevar = """        var rol = User.FindFirstValue(ClaimTypes.Role);
        if (!string.Equals(rol, "Cajero", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = MensajesCatalogo.MSG_39 });
        }"""

assert old_rol_llevar in code, 'old_rol_llevar not found'
code = code.replace(old_rol_llevar, new_rol_llevar)

with open('backend/GirasolesRes.API/Controllers/PedidosController.cs', 'w', encoding='utf-8') as f:
    f.write(code)

print('PedidosController.cs updated')

# Update CobrosController.cs
with open('backend/GirasolesRes.API/Controllers/CobrosController.cs', 'r', encoding='utf-8') as f:
    cobro_code = f.read().replace('\r\n', '\n')

old_cobro_method = """    [HttpPost]
    public async Task<IActionResult> ProcesarCobro([FromBody] CobroRequest request, CancellationToken ct)
    {
        if (!ValidarRolCajeroOAdmin(out var forbidden))
        {
            return forbidden!;
        }"""

new_cobro_method = """    [HttpPost]
    public async Task<IActionResult> ProcesarCobro([FromBody] CobroRequest request, CancellationToken ct)
    {
        if (!ValidarRolCajero(out var forbidden))
        {
            return forbidden!;
        }"""

helper = """    private bool ValidarRolCajero(out IActionResult? forbiddenResult)
    {
        var rol = User.FindFirstValue(ClaimTypes.Role);
        if (!string.Equals(rol, "Cajero", StringComparison.OrdinalIgnoreCase))
        {
            forbiddenResult = StatusCode(StatusCodes.Status403Forbidden, new { message = MensajesCatalogo.MSG_39 });
            return false;
        }

        forbiddenResult = null;
        return true;
    }

    private bool ValidarRolCajeroOAdmin(out IActionResult? forbiddenResult)"""

assert old_cobro_method in cobro_code, 'old_cobro_method not found'
cobro_code = cobro_code.replace('    private bool ValidarRolCajeroOAdmin(out IActionResult? forbiddenResult)', helper)
cobro_code = cobro_code.replace(old_cobro_method, new_cobro_method)

with open('backend/GirasolesRes.API/Controllers/CobrosController.cs', 'w', encoding='utf-8') as f:
    f.write(cobro_code)

print('CobrosController.cs updated')
