using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.MenusCompletos;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Interfaces.Services;
using GirasolesRes.Domain.Entities;

namespace GirasolesRes.Application.Services;

public class MenuCompletoService : IMenuCompletoService
{
    private readonly IMenuCompletoRepository _menuCompletoRepository;
    private readonly IAuditoriaUsuarioRepository _auditoriaRepository;

    public MenuCompletoService(
        IMenuCompletoRepository menuCompletoRepository,
        IAuditoriaUsuarioRepository auditoriaRepository)
    {
        _menuCompletoRepository = menuCompletoRepository;
        _auditoriaRepository = auditoriaRepository;
    }

    public async Task<Result<List<MenuCompletoResponseDto>>> ObtenerTodosAsync(
        bool soloActivos = false,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var menus = await _menuCompletoRepository.ObtenerTodosAsync(soloActivos, cancellationToken);
            var dtos = menus.Select(MapearADto).ToList();
            return Result<List<MenuCompletoResponseDto>>.Exitoso(dtos);
        }
        catch (Exception ex)
        {
            return Result<List<MenuCompletoResponseDto>>.Fallido(MensajesCatalogo.MSG_67, detalle: ex.Message);
        }
    }

    public async Task<Result<MenuCompletoResponseDto>> ObtenerPorIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var menu = await _menuCompletoRepository.ObtenerPorIdAsync(id, cancellationToken);
            if (menu == null)
            {
                return Result<MenuCompletoResponseDto>.Fallido(MensajesCatalogo.MSG_38);
            }

            return Result<MenuCompletoResponseDto>.Exitoso(MapearADto(menu));
        }
        catch (Exception ex)
        {
            return Result<MenuCompletoResponseDto>.Fallido(MensajesCatalogo.MSG_38, detalle: ex.Message);
        }
    }

    public async Task<Result<MenuCompletoResponseDto>> ActualizarPrecioAsync(
        int id,
        ActualizarPrecioMenuCompletoRequest request,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // RV-160: Validación de precio mayor a cero y no superar S/ 999.99
            if (request.Precio <= 0)
            {
                return Result<MenuCompletoResponseDto>.Fallido(
                    MensajesCatalogo.MSG_55,
                    errores: new Dictionary<string, string> { { "precio", MensajesCatalogo.MSG_55 } });
            }

            if (request.Precio > 999.99m || decimal.Round(request.Precio, 2) != request.Precio)
            {
                return Result<MenuCompletoResponseDto>.Fallido(
                    MensajesCatalogo.MSG_56,
                    errores: new Dictionary<string, string> { { "precio", MensajesCatalogo.MSG_56 } });
            }

            var menu = await _menuCompletoRepository.ObtenerPorIdAsync(id, cancellationToken);
            if (menu == null)
            {
                return Result<MenuCompletoResponseDto>.Fallido(MensajesCatalogo.MSG_38);
            }

            var precioAnterior = menu.Men_Precio;
            menu.ActualizarPrecio(request.Precio);
            await _menuCompletoRepository.ActualizarAsync(menu, cancellationToken);

            // RN-30 / RN-140: Auditoría
            var detalleAuditoria = FormattableString.Invariant(
                $"Menú completo '{menu.Men_Nombre}': precio anterior S/ {precioAnterior:F2}, nuevo precio S/ {menu.Men_Precio:F2}");

            var auditoria = new AuditoriaUsuario(
                nombreAdmin: adminUsername,
                accion: "EDITAR_MENU_COMPLETO",
                nombreUsuarioAfectado: menu.Men_Nombre,
                detalle: detalleAuditoria,
                direccionIp: ipAddress);

            await _auditoriaRepository.RegistrarAsync(auditoria, cancellationToken);
            await _menuCompletoRepository.GuardarCambiosAsync(cancellationToken);

            return Result<MenuCompletoResponseDto>.Exitoso(MapearADto(menu), MensajesCatalogo.MSG_217);
        }
        catch (Exception ex)
        {
            return Result<MenuCompletoResponseDto>.Fallido(MensajesCatalogo.MSG_38, detalle: ex.Message);
        }
    }

    public async Task<Result<MenuCompletoResponseDto>> CambiarEstadoAsync(
        int id,
        CambiarEstadoMenuCompletoRequest request,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var menu = await _menuCompletoRepository.ObtenerPorIdAsync(id, cancellationToken);
            if (menu == null)
            {
                return Result<MenuCompletoResponseDto>.Fallido(MensajesCatalogo.MSG_38);
            }

            menu.CambiarEstado(request.Activo);
            await _menuCompletoRepository.ActualizarAsync(menu, cancellationToken);

            // RN-30 / RN-140: Auditoría
            var accion = request.Activo ? "ACTIVAR_MENU_COMPLETO" : "DESACTIVAR_MENU_COMPLETO";
            var detalle = $"Estado de '{menu.Men_Nombre}' cambiado a {(request.Activo ? "Activo" : "Inactivo")}";

            var auditoria = new AuditoriaUsuario(
                nombreAdmin: adminUsername,
                accion: accion,
                nombreUsuarioAfectado: menu.Men_Nombre,
                detalle: detalle,
                direccionIp: ipAddress);

            await _auditoriaRepository.RegistrarAsync(auditoria, cancellationToken);
            await _menuCompletoRepository.GuardarCambiosAsync(cancellationToken);

            return Result<MenuCompletoResponseDto>.Exitoso(MapearADto(menu), MensajesCatalogo.MSG_217);
        }
        catch (Exception ex)
        {
            return Result<MenuCompletoResponseDto>.Fallido(MensajesCatalogo.MSG_38, detalle: ex.Message);
        }
    }

    private static MenuCompletoResponseDto MapearADto(MenuCompleto m)
    {
        return new MenuCompletoResponseDto
        {
            Id = m.Id_MenuCompleto,
            Nombre = m.Men_Nombre,
            Precio = m.Men_Precio,
            Activo = m.Men_Activo,
            Incluye = m.Men_Incluye,
            Partes = m.Men_Partes
                .OrderBy(p => p.Par_Orden)
                .Select(p => new MenuCompletoParteResponseDto
                {
                    Id = p.Id_Parte,
                    Nombre = p.Par_Nombre,
                    Orden = p.Par_Orden,
                    RolesPermitidos = p.Par_RolesPermitidos.Select(r => r.ToString()).ToList()
                })
                .ToList()
        };
    }
}
