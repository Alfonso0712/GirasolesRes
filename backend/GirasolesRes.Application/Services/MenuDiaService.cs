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
    private readonly IMenuCompletoRepository _menuCompletoRepository;
    private readonly IAuditoriaUsuarioRepository _auditoriaRepository;

    public MenuDiaService(
        IMenuDiaRepository menuDiaRepository,
        IProductoRepository productoRepository,
        IMenuCompletoRepository menuCompletoRepository,
        IAuditoriaUsuarioRepository auditoriaRepository)
    {
        _menuDiaRepository = menuDiaRepository;
        _productoRepository = productoRepository;
        _menuCompletoRepository = menuCompletoRepository;
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
                    Platos = new List<PlatoMenuDto>(),
                    Opciones = new List<OpcionMenuDto>(),
                    MenusCompletos = new List<MenuCompletoDiaDto>()
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
                Tipo = p.Pro_Tipo == TipoProducto.Componente ? "Componente" : "Carta",
                Rol = p.Pro_Rol?.ToString(),
                Categoria = p.Pro_Categoria?.ToString(),
                Precio = p.Pro_Precio
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

            // Normalizar listas recibidas
            var productosCartaIds = request.ProductosCarta?.Distinct().ToList() ?? new List<Guid>();
            var opcionesIds = request.Opciones?.Distinct().ToList() ?? new List<Guid>();
            var menusCompletosIds = request.MenusCompletos?.Distinct().ToList() ?? new List<int>();

            // Soporte retrocompatible si vienen en platoIds
            if (productosCartaIds.Count == 0 && opcionesIds.Count == 0 && request.PlatoIds != null && request.PlatoIds.Count > 0)
            {
                var legacyPlatos = await _productoRepository.ObtenerPorIdsAsync(request.PlatoIds, cancellationToken);
                foreach (var lp in legacyPlatos)
                {
                    if (lp.Pro_Tipo == TipoProducto.Componente)
                        opcionesIds.Add(lp.Id_Producto);
                    else
                        productosCartaIds.Add(lp.Id_Producto);
                }
            }



            // RV-162 / MSG-224: Para guardar el menú del día debe haber al menos un producto de carta o un menú completo habilitado
            if (productosCartaIds.Count == 0 && menusCompletosIds.Count == 0)
            {
                return ApiResponse<MenuDiaResponseDto>.Fallido(MensajesCatalogo.MSG_224);
            }

            // Validar productos de carta seleccionados
            List<Producto> cartaProductos = new();
            if (productosCartaIds.Count > 0)
            {
                cartaProductos = await _productoRepository.ObtenerPorIdsAsync(productosCartaIds, cancellationToken);
                if (cartaProductos.Count != productosCartaIds.Count)
                {
                    return ApiResponse<MenuDiaResponseDto>.Fallido("Uno o más productos de carta seleccionados no existen en el sistema.");
                }

                var inactivos = cartaProductos.Where(p => !p.Pro_Activo).Select(p => p.Pro_Nombre).ToList();
                if (inactivos.Count > 0)
                {
                    return ApiResponse<MenuDiaResponseDto>.Fallido($"Los siguientes productos de carta están inactivos y no pueden añadirse: {string.Join(", ", inactivos)}.");
                }
            }

            // Validar componentes de menú (opciones) seleccionados
            List<Producto> componentes = new();
            if (opcionesIds.Count > 0)
            {
                componentes = await _productoRepository.ObtenerPorIdsAsync(opcionesIds, cancellationToken);
                if (componentes.Count != opcionesIds.Count)
                {
                    return ApiResponse<MenuDiaResponseDto>.Fallido("Uno o más componentes seleccionados no existen en el sistema.");
                }

                var inactivos = componentes.Where(p => !p.Pro_Activo).Select(p => p.Pro_Nombre).ToList();
                if (inactivos.Count > 0)
                {
                    return ApiResponse<MenuDiaResponseDto>.Fallido($"Los siguientes componentes están inactivos y no pueden añadirse: {string.Join(", ", inactivos)}.");
                }

                var noComponentes = componentes.Where(p => p.Pro_Tipo != TipoProducto.Componente).Select(p => p.Pro_Nombre).ToList();
                if (noComponentes.Count > 0)
                {
                    return ApiResponse<MenuDiaResponseDto>.Fallido($"Los siguientes ítems no son componentes: {string.Join(", ", noComponentes)}.");
                }
            }

            // RV-161 / MSG-219: Un menú completo solo se habilita en el menú del día si cada una de sus partes tiene al menos una opción seleccionada
            if (menusCompletosIds.Count > 0)
            {
                var todosMenusCompletos = await _menuCompletoRepository.ObtenerTodosAsync(soloActivos: true, cancellationToken);
                var dictMenus = todosMenusCompletos.ToDictionary(m => m.Id_MenuCompleto);

                foreach (var mcId in menusCompletosIds)
                {
                    if (!dictMenus.TryGetValue(mcId, out var mc))
                    {
                        return ApiResponse<MenuDiaResponseDto>.Fallido($"El menú completo con ID {mcId} no existe o se encuentra inactivo.");
                    }

                    foreach (var parte in mc.Men_Partes.OrderBy(p => p.Par_Orden))
                    {
                        bool tieneOpcion = componentes.Any(c => c.Pro_Rol.HasValue && parte.Par_RolesPermitidos.Contains(c.Pro_Rol.Value));
                        if (!tieneOpcion)
                        {
                            return ApiResponse<MenuDiaResponseDto>.Fallido(string.Format(MensajesCatalogo.MSG_219, mc.Men_Nombre, parte.Par_Nombre));
                        }
                    }
                }
            }

            var todosLosPlatosIds = productosCartaIds.Concat(opcionesIds).Distinct().ToList();

            var menu = await _menuDiaRepository.ObtenerMenuHoyConDetalleAsync(cancellationToken);
            var esNuevo = menu == null;

            if (esNuevo)
            {
                menu = new MenuDia(fechaHoy, usuario);
                menu.SincronizarPlatos(todosLosPlatosIds, usuario);
                menu.SincronizarMenusCompletos(menusCompletosIds, usuario);
                await _menuDiaRepository.AgregarAsync(menu, cancellationToken);
            }
            else
            {
                                // RN-33 / E-80: Conserva los platos y opciones ya marcados como agotados
                menu.SincronizarPlatos(todosLosPlatosIds, usuario);
                menu.SincronizarMenusCompletos(menusCompletosIds, usuario);
                await _menuDiaRepository.ActualizarAsync(menu, cancellationToken);
            }

            // RN-38: Auditoría
            var auditoria = new AuditoriaUsuario(
                nombreAdmin: usuario,
                accion: esNuevo ? "DEFINIR_MENU" : "ACTUALIZAR_MENU",
                nombreUsuarioAfectado: $"Menu-{fechaHoy:yyyy-MM-dd}",
                detalle: $"Menú guardado con {productosCartaIds.Count} productos de carta, {opcionesIds.Count} opciones de componente y {menusCompletosIds.Count} menús completos habilitados.",
                direccionIp: ipAddress);

            await _auditoriaRepository.RegistrarAsync(auditoria, cancellationToken);

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
                return ApiResponse<CambiarDisponibilidadResponseDto>.Fallido(MensajesCatalogo.MSG_79);
            }

            var plato = menu.Men_Platos.FirstOrDefault(p => p.Id_Producto == productoId);
            if (plato == null)
            {
                return ApiResponse<CambiarDisponibilidadResponseDto>.Fallido("El producto no forma parte del menú del día de hoy.");
            }

            var nombrePlato = plato.Mdp_Producto?.Pro_Nombre ?? "El ítem";
            var cambiado = menu.CambiarDisponibilidadPlato(productoId, agotado, usuario);
            if (!cambiado)
            {
                return ApiResponse<CambiarDisponibilidadResponseDto>.Fallido("No se pudo actualizar la disponibilidad.");
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

            var mensaje = string.Format(agotado ? MensajesCatalogo.MSG_77 : MensajesCatalogo.MSG_78, nombrePlato);

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
        var opcionesDto = menu.Men_Platos
            .Where(p => p.Mdp_Producto?.Pro_Tipo == TipoProducto.Componente)
            .OrderBy(p => p.Mdp_Producto?.Pro_Rol)
            .ThenBy(p => p.Mdp_Producto?.Pro_Nombre)
            .Select(p => new OpcionMenuDto
            {
                ProductoId = p.Id_Producto,
                Nombre = p.Mdp_Producto?.Pro_Nombre ?? string.Empty,
                Rol = p.Mdp_Producto?.Pro_Rol?.ToString() ?? string.Empty,
                Agotado = p.Mdp_Agotado
            }).ToList();

        var menusCompletosDto = new List<MenuCompletoDiaDto>();
        foreach (var mmc in menu.Men_MenusCompletos.OrderBy(m => m.Id_MenuCompleto))
        {
            var mc = mmc.Mmc_MenuCompleto;
            if (mc == null) continue;

            var partesDto = new List<MenuCompletoParteDiaDto>();
            bool disponible = true;
            string? motivoNoDisponible = null;

            foreach (var parte in mc.Men_Partes.OrderBy(p => p.Par_Orden))
            {
                var rolesPermitidosStrings = parte.Par_RolesPermitidos.Select(r => r.ToString()).ToList();
                var opcionesParaParte = opcionesDto
                    .Where(o => rolesPermitidosStrings.Contains(o.Rol))
                    .Select(o => new OpcionParteDiaDto
                    {
                        ProductoId = o.ProductoId,
                        Nombre = o.Nombre,
                        Agotado = o.Agotado
                    }).ToList();

                partesDto.Add(new MenuCompletoParteDiaDto
                {
                    Id = parte.Id_Parte,
                    Nombre = parte.Par_Nombre,
                    Orden = parte.Par_Orden,
                    RolesPermitidos = rolesPermitidosStrings,
                    Opciones = opcionesParaParte
                });

                // RN-136: Solo se ofrece si cada parte tiene al menos una opción disponible ese día
                bool parteTieneDisponibles = opcionesParaParte.Any(o => !o.Agotado);
                if (!parteTieneDisponibles && disponible)
                {
                    disponible = false;
                    motivoNoDisponible = string.Format(MensajesCatalogo.MSG_220, mc.Men_Nombre, parte.Par_Nombre);
                }
            }

            menusCompletosDto.Add(new MenuCompletoDiaDto
            {
                Id = mc.Id_MenuCompleto,
                Nombre = mc.Men_Nombre,
                Precio = mc.Men_Precio,
                Incluye = mc.Men_Incluye,
                Disponible = disponible,
                MotivoNoDisponible = motivoNoDisponible,
                Partes = partesDto
            });
        }

        return new MenuDiaResponseDto
        {
            Fecha = menu.Men_Fecha.ToString("yyyy-MM-dd"),
            Definido = true,
            Desayuno = null,
            Platos = menu.Men_Platos
                .Where(p => p.Mdp_Producto?.Pro_Tipo == TipoProducto.Carta)
                .OrderBy(p => p.Mdp_Producto?.Pro_Categoria)
                .ThenBy(p => p.Mdp_Producto?.Pro_Nombre)
                .Select(p => new PlatoMenuDto
                {
                    ProductoId = p.Id_Producto,
                    Nombre = p.Mdp_Producto?.Pro_Nombre ?? string.Empty,
                    Categoria = p.Mdp_Producto?.Pro_Categoria?.ToString() ?? string.Empty,
                    Precio = p.Mdp_Producto?.Pro_Precio ?? 0,
                    Agotado = p.Mdp_Agotado
                }).ToList(),
            Opciones = opcionesDto,
            MenusCompletos = menusCompletosDto
        };
    }
}
