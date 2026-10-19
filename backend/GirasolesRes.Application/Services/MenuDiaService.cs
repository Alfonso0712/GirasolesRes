using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.MenuDia;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Interfaces.Services;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Application.Services;

public class MenuDiaService : IMenuDiaService
{
    private readonly IMenuDiaRepository _menuDiaRepository;
    private readonly IProductoRepository _productoRepository;
    private readonly IAuditoriaUsuarioRepository _auditoriaRepository;

    public MenuDiaService(
        IMenuDiaRepository menuDiaRepository,
        IProductoRepository productoRepository,
        IAuditoriaUsuarioRepository auditoriaRepository)
    {
        _menuDiaRepository = menuDiaRepository;
        _productoRepository = productoRepository;
        _auditoriaRepository = auditoriaRepository;
    }

    public async Task<ApiResponse<MenuDiaResponseDto>> ObtenerMenuHoyAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var fechaHoy = TimeZoneHelper.ObtenerFechaActualLima();
            var menu = await _menuDiaRepository.ObtenerMenuHoyConDetalleAsync(cancellationToken);

            if (menu == null)
            {
                return ApiResponse<MenuDiaResponseDto>.Exitoso(new MenuDiaResponseDto
                {
                    Fecha = fechaHoy.ToString("yyyy-MM-dd"),
                    Definido = false,
                    Desayuno = null,
                    Platos = new List<PlatoMenuDto>()
                });
            }

            var response = MapearAMenuDiaDto(menu, fechaHoy);
            return ApiResponse<MenuDiaResponseDto>.Exitoso(response);
        }
        catch (Exception ex)
        {
            return ApiResponse<MenuDiaResponseDto>.Fallido(MensajesCatalogo.MSG_80, detalle: ex.Message);
        }
    }

    public async Task<ApiResponse<List<CandidatoMenuDto>>> ObtenerCandidatosAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var productosActivos = await _productoRepository.ListarDisponiblesAsync(null, cancellationToken: cancellationToken);
            
            var candidatos = productosActivos.Select(p => new CandidatoMenuDto
            {
                Id = p.Id_Producto,
                Nombre = p.Pro_Nombre,
                Categoria = p.Pro_Categoria?.ToString() ?? string.Empty,
                Precio = p.Pro_Precio.GetValueOrDefault()
            }).ToList();

            if (candidatos.Count == 0)
            {
                return ApiResponse<List<CandidatoMenuDto>>.Exitoso(candidatos, MensajesCatalogo.MSG_69);
            }

            return ApiResponse<List<CandidatoMenuDto>>.Exitoso(candidatos);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<CandidatoMenuDto>>.Fallido(MensajesCatalogo.MSG_80, detalle: ex.Message);
        }
    }

    public async Task<ApiResponse<MenuDiaResponseDto>> GuardarMenuHoyAsync(
        GuardarMenuDiaRequest request,
        string usuario,
        string? ipAddress,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var fechaHoy = TimeZoneHelper.ObtenerFechaActualLima();

            // RV-43: Al menos un producto seleccionado (desayuno o platos)
            var totalSeleccionados = (request.DesayunoId.HasValue ? 1 : 0) + (request.PlatoIds?.Count ?? 0);
            if (totalSeleccionados == 0)
            {
                return ApiResponse<MenuDiaResponseDto>.Fallido(MensajesCatalogo.MSG_68);
            }

            // Validar desayuno si fue provisto (RV-44)
            Producto? desayuno = null;
            if (request.DesayunoId.HasValue)
            {
                desayuno = await _productoRepository.ObtenerPorIdAsync(request.DesayunoId.Value, cancellationToken);
                if (desayuno == null || !desayuno.Pro_Activo)
                {
                    return ApiResponse<MenuDiaResponseDto>.Fallido("El desayuno seleccionado no existe o se encuentra inactivo.");
                }

                if (desayuno.Pro_Categoria != CategoriaProducto.Desayuno)
                {
                    return ApiResponse<MenuDiaResponseDto>.Fallido("El producto de desayuno seleccionado debe pertenecer a la categoría Desayuno.");
                }
            }

            // Validar platos seleccionados (RV-45, RN-34)
            var platoIds = request.PlatoIds?.Distinct().ToList() ?? new List<Guid>();
            if (platoIds.Count > 0)
            {
                var platos = await _productoRepository.ObtenerPorIdsAsync(platoIds, cancellationToken);
                if (platos.Count != platoIds.Count)
                {
                    return ApiResponse<MenuDiaResponseDto>.Fallido("Uno o más platos seleccionados no existen en el sistema.");
                }

                var inactivos = platos.Where(p => !p.Pro_Activo).Select(p => p.Pro_Nombre).ToList();
                if (inactivos.Count > 0)
                {
                    return ApiResponse<MenuDiaResponseDto>.Fallido($"Los siguientes productos están inactivos y no pueden añadirse al menú: {string.Join(", ", inactivos)}.");
                }
            }

            var menu = await _menuDiaRepository.ObtenerMenuHoyConDetalleAsync(cancellationToken);
            var esNuevo = menu == null;

            if (esNuevo)
            {
                menu = new MenuDia(fechaHoy, request.DesayunoId, usuario);
                menu.SincronizarPlatos(platoIds, usuario);
                await _menuDiaRepository.AgregarAsync(menu, cancellationToken);
            }
            else
            {
                menu!.ActualizarDesayuno(request.DesayunoId, usuario);
                // RN-33 / E-80: Conserva los platos ya marcados como agotados
                menu.SincronizarPlatos(platoIds, usuario);
                await _menuDiaRepository.ActualizarAsync(menu, cancellationToken);
            }

            // RN-38: Auditoría
            var auditoria = new AuditoriaUsuario(
                nombreAdmin: usuario,
                accion: esNuevo ? "DEFINIR_MENU" : "ACTUALIZAR_MENU",
                nombreUsuarioAfectado: $"Menu-{fechaHoy:yyyy-MM-dd}",
                detalle: $"Menú guardado con {platoIds.Count} platos y {(request.DesayunoId.HasValue ? $"desayuno '{desayuno?.Pro_Nombre}'" : "sin desayuno")}",
                direccionIp: ipAddress);

            await _auditoriaRepository.RegistrarAsync(auditoria, cancellationToken);

            // Recargar con detalle actualizado
            var menuActualizado = await _menuDiaRepository.ObtenerMenuHoyConDetalleAsync(cancellationToken);
            var responseDto = MapearAMenuDiaDto(menuActualizado ?? menu, fechaHoy);

            return ApiResponse<MenuDiaResponseDto>.Exitoso(responseDto, MensajesCatalogo.MSG_70);
        }
        catch (Exception ex)
        {
            return ApiResponse<MenuDiaResponseDto>.Fallido(MensajesCatalogo.MSG_38, detalle: ex.Message);
        }
    }

    public async Task<ApiResponse<CambiarDisponibilidadResponseDto>> CambiarDisponibilidadAsync(
        Guid productoId,
        bool agotado,
        string usuario,
        string? ipAddress,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var menu = await _menuDiaRepository.ObtenerMenuHoyConDetalleAsync(cancellationToken);
            if (menu == null)
            {
                return ApiResponse<CambiarDisponibilidadResponseDto>.Fallido(MensajesCatalogo.MSG_78);
            }

            var plato = menu.Men_Platos.FirstOrDefault(p => p.Id_Producto == productoId);
            if (plato == null)
            {
                return ApiResponse<CambiarDisponibilidadResponseDto>.Fallido("El producto no forma parte del menú del día de hoy.");
            }

            var nombrePlato = plato.Mdp_Producto?.Pro_Nombre ?? "El plato";
            var cambiado = menu.CambiarDisponibilidadPlato(productoId, agotado, usuario);
            if (!cambiado)
            {
                return ApiResponse<CambiarDisponibilidadResponseDto>.Fallido("No se pudo actualizar la disponibilidad del plato.");
            }

            await _menuDiaRepository.ActualizarAsync(menu, cancellationToken);

            // RN-38: Auditoría
            var auditoria = new AuditoriaUsuario(
                nombreAdmin: usuario,
                accion: agotado ? "MARCAR_PLATO_AGOTADO" : "MARCAR_PLATO_DISPONIBLE",
                nombreUsuarioAfectado: nombrePlato,
                detalle: $"Disponibilidad cambiada a {(agotado ? "Agotado" : "Disponible")} por {usuario}",
                direccionIp: ipAddress);

            await _auditoriaRepository.RegistrarAsync(auditoria, cancellationToken);

            var mensaje = string.Format(agotado ? MensajesCatalogo.MSG_76 : MensajesCatalogo.MSG_77, nombrePlato);

            return ApiResponse<CambiarDisponibilidadResponseDto>.Exitoso(new CambiarDisponibilidadResponseDto
            {
                ProductoId = productoId,
                Nombre = nombrePlato,
                Agotado = agotado
            }, mensaje);
        }
        catch (Exception ex)
        {
            return ApiResponse<CambiarDisponibilidadResponseDto>.Fallido(MensajesCatalogo.MSG_38, detalle: ex.Message);
        }
    }

    private static MenuDiaResponseDto MapearAMenuDiaDto(MenuDia menu, DateOnly fechaHoy)
    {
        return new MenuDiaResponseDto
        {
            Fecha = menu.Men_Fecha.ToString("yyyy-MM-dd"),
            Definido = true,
            Desayuno = menu.Men_Desayuno != null ? new DesayunoMenuDto
            {
                Id = menu.Men_Desayuno.Id_Producto,
                Nombre = menu.Men_Desayuno.Pro_Nombre
            } : null,
            Platos = menu.Men_Platos
                .OrderBy(p => p.Mdp_Producto.Pro_Categoria)
                .ThenBy(p => p.Mdp_Producto.Pro_Nombre)
                .Select(p => new PlatoMenuDto
                {
                    ProductoId = p.Id_Producto,
                    Nombre = p.Mdp_Producto?.Pro_Nombre ?? string.Empty,
                    Categoria = p.Mdp_Producto?.Pro_Categoria.ToString() ?? string.Empty,
                    Precio = p.Mdp_Producto?.Pro_Precio ?? 0,
                    Agotado = p.Mdp_Agotado
                }).ToList()
        };
    }
}
