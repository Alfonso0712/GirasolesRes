using System.Text.RegularExpressions;
using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Productos;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Interfaces.Services;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Application.Services;

public class ProductoService : IProductoService
{
    private readonly IProductoRepository _productoRepository;
    private readonly IAuditoriaUsuarioRepository _auditoriaRepository;
    private readonly IMenuDiaRepository _menuDiaRepository;

    // RV-33: letras, números, espacios, tildes y . , - ( )
    private static readonly Regex RegexNombreValido = new(
        @"^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\.,\-\(\)]+$",
        RegexOptions.Compiled);

    public ProductoService(
        IProductoRepository productoRepository,
        IAuditoriaUsuarioRepository auditoriaRepository,
        IMenuDiaRepository menuDiaRepository)
    {
        _productoRepository = productoRepository;
        _auditoriaRepository = auditoriaRepository;
        _menuDiaRepository = menuDiaRepository;
    }

    public async Task<ApiResponse<PaginacionProductosResponse>> ListarProductosAsync(
        string? busqueda,
        string? categoria,
        string? tipo = null,
        string? rol = null,
        bool? activo = null,
        int pagina = 1,
        int tamano = 10,
        CancellationToken cancellationToken = default)
    {
        try
        {
            CategoriaProducto? categoriaEnum = null;
            if (!string.IsNullOrWhiteSpace(categoria) && !categoria.Equals("Todas", StringComparison.OrdinalIgnoreCase))
            {
                if (CategoriaProductoExtensions.TryParseFlexible(categoria, out var cat))
                {
                    categoriaEnum = cat;
                }
            }

            TipoProducto? tipoEnum = null;
            if (!string.IsNullOrWhiteSpace(tipo) && !tipo.Equals("Todos", StringComparison.OrdinalIgnoreCase))
            {
                if (TipoProductoExtensions.TryParseFlexible(tipo, out var tip))
                {
                    tipoEnum = tip;
                }
            }

            RolComponente? rolEnum = null;
            if (!string.IsNullOrWhiteSpace(rol) && !rol.Equals("Todos", StringComparison.OrdinalIgnoreCase))
            {
                if (RolComponenteExtensions.TryParseFlexible(rol, out var r))
                {
                    rolEnum = r;
                }
            }

            var (items, total) = await _productoRepository.ListarProductosAsync(
                busqueda,
                categoriaEnum,
                tipoEnum,
                rolEnum,
                activo,
                pagina,
                tamano,
                cancellationToken);

            var dtos = items.Select(MapearADto).ToList();

            return ApiResponse<PaginacionProductosResponse>.Exitoso(new PaginacionProductosResponse
            {
                Items = dtos,
                Total = total
            });
        }
        catch (Exception ex)
        {
            return ApiResponse<PaginacionProductosResponse>.Fallido(MensajesCatalogo.MSG_67, detalle: ex.Message);
        }
    }

    public async Task<ApiResponse<ProductoResponseDto>> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var producto = await _productoRepository.ObtenerPorIdAsync(id, cancellationToken);
            if (producto == null)
            {
                return ApiResponse<ProductoResponseDto>.Fallido(MensajesCatalogo.MSG_38);
            }

            return ApiResponse<ProductoResponseDto>.Exitoso(MapearADto(producto));
        }
        catch (Exception ex)
        {
            return ApiResponse<ProductoResponseDto>.Fallido(MensajesCatalogo.MSG_38, detalle: ex.Message);
        }
    }

    public async Task<ApiResponse<ProductoResponseDto>> RegistrarProductoAsync(
        CrearProductoRequest request,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var validacion = ValidarDatosProducto(request.Nombre, request.Tipo, request.Categoria, request.Rol, request.Precio);
            if (!validacion.EsValido)
            {
                return ApiResponse<ProductoResponseDto>.Fallido(
                    validacion.MensajeGeneral,
                    errores: validacion.Errores);
            }

            var tipoStr = string.IsNullOrWhiteSpace(request.Tipo) ? "Carta" : request.Tipo;
            TipoProductoExtensions.TryParseFlexible(tipoStr, out var tipoEnum);

            var nombreNormalizado = Producto.NormalizarTexto(request.Nombre);

            // RV-157 / RN-139: Nombre único dentro de su tipo de producto
            var existe = await _productoRepository.ExisteNombreAsync(nombreNormalizado, tipoEnum, null, cancellationToken);
            if (existe)
            {
                return ApiResponse<ProductoResponseDto>.Fallido(
                    MensajesCatalogo.MSG_53,
                    errores: new Dictionary<string, string> { { "nombre", MensajesCatalogo.MSG_53 } });
            }

            Producto nuevoProducto;
            if (tipoEnum == TipoProducto.Carta)
            {
                CategoriaProductoExtensions.TryParseFlexible(request.Categoria, out var categoria);
                nuevoProducto = new Producto(
                    proNombre: request.Nombre,
                    proCategoria: categoria,
                    proPrecio: request.Precio!.Value,
                    proActivo: true);
            }
            else
            {
                RolComponenteExtensions.TryParseFlexible(request.Rol, out var rol);
                nuevoProducto = new Producto(
                    proNombre: request.Nombre,
                    proRol: rol,
                    proActivo: true);
            }

            await _productoRepository.AgregarAsync(nuevoProducto, cancellationToken);

            // RN-30: Auditoría
            var detalleAuditoria = tipoEnum == TipoProducto.Carta
                ? $"Producto de carta registrado con precio S/ {nuevoProducto.Pro_Precio:F2} y categoría {nuevoProducto.Pro_Categoria}"
                : $"Componente de menú registrado con rol {nuevoProducto.Pro_Rol}";

            var auditoria = new AuditoriaUsuario(
                nombreAdmin: adminUsername,
                accion: "CREAR_PRODUCTO",
                nombreUsuarioAfectado: nuevoProducto.Pro_Nombre,
                detalle: detalleAuditoria,
                direccionIp: ipAddress);

            await _auditoriaRepository.RegistrarAsync(auditoria, cancellationToken);
            await _productoRepository.GuardarCambiosAsync(cancellationToken);

            return ApiResponse<ProductoResponseDto>.Exitoso(MapearADto(nuevoProducto), MensajesCatalogo.MSG_57);
        }
        catch (Exception ex)
        {
            return ApiResponse<ProductoResponseDto>.Fallido(MensajesCatalogo.MSG_38, detalle: ex.Message);
        }
    }

    public async Task<ApiResponse<ProductoResponseDto>> ActualizarProductoAsync(
        Guid id,
        ActualizarProductoRequest request,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var producto = await _productoRepository.ObtenerPorIdAsync(id, cancellationToken);
            if (producto == null)
            {
                return ApiResponse<ProductoResponseDto>.Fallido(MensajesCatalogo.MSG_38);
            }

            var validacion = ValidarDatosProducto(request.Nombre, request.Tipo, request.Categoria, request.Rol, request.Precio);
            if (!validacion.EsValido)
            {
                return ApiResponse<ProductoResponseDto>.Fallido(
                    validacion.MensajeGeneral,
                    errores: validacion.Errores);
            }

            var tipoStr = string.IsNullOrWhiteSpace(request.Tipo) ? "Carta" : request.Tipo;
            TipoProductoExtensions.TryParseFlexible(tipoStr, out var nuevoTipo);

            // RV-158 / MSG-216: Si el producto ya tiene pedidos, su tipo es inmutable
            if (producto.Pro_Tipo != nuevoTipo)
            {
                var tienePedidos = await _productoRepository.TienePedidosAsync(id, cancellationToken);
                if (tienePedidos)
                {
                    return ApiResponse<ProductoResponseDto>.Fallido(
                        MensajesCatalogo.MSG_216,
                        errores: new Dictionary<string, string> { { "tipo", MensajesCatalogo.MSG_216 } });
                }
            }

            var nombreNormalizado = Producto.NormalizarTexto(request.Nombre);

            // RV-157 / RN-139: Nombre único dentro de su tipo
            var existe = await _productoRepository.ExisteNombreAsync(nombreNormalizado, nuevoTipo, id, cancellationToken);
            if (existe)
            {
                return ApiResponse<ProductoResponseDto>.Fallido(
                    MensajesCatalogo.MSG_53,
                    errores: new Dictionary<string, string> { { "nombre", MensajesCatalogo.MSG_53 } });
            }

            var precioAnterior = producto.Pro_Precio;
            CategoriaProducto? categoriaEnum = null;
            RolComponente? rolEnum = null;
            decimal? precioFinal = null;

            if (nuevoTipo == TipoProducto.Carta)
            {
                CategoriaProductoExtensions.TryParseFlexible(request.Categoria, out var cat);
                categoriaEnum = cat;
                precioFinal = request.Precio;
            }
            else
            {
                RolComponenteExtensions.TryParseFlexible(request.Rol, out var r);
                rolEnum = r;
                precioFinal = null;
            }

            producto.Actualizar(request.Nombre, nuevoTipo, categoriaEnum, rolEnum, precioFinal);
            await _productoRepository.ActualizarAsync(producto, cancellationToken);

            // RN-30: Auditoría
            string detalleAuditoria;
            if (nuevoTipo == TipoProducto.Carta)
            {
                detalleAuditoria = FormattableString.Invariant($"Precio anterior: S/ {precioAnterior:F2}, Nuevo precio: S/ {producto.Pro_Precio:F2}. Categoría: {producto.Pro_Categoria}");
            }
            else
            {
                detalleAuditoria = $"Componente actualizado con rol {producto.Pro_Rol}";
            }

            var auditoria = new AuditoriaUsuario(
                nombreAdmin: adminUsername,
                accion: "EDITAR_PRODUCTO",
                nombreUsuarioAfectado: producto.Pro_Nombre,
                detalle: detalleAuditoria,
                direccionIp: ipAddress);

            await _auditoriaRepository.RegistrarAsync(auditoria, cancellationToken);
            await _productoRepository.GuardarCambiosAsync(cancellationToken);

            return ApiResponse<ProductoResponseDto>.Exitoso(MapearADto(producto), MensajesCatalogo.MSG_58);
        }
        catch (Exception ex)
        {
            return ApiResponse<ProductoResponseDto>.Fallido(MensajesCatalogo.MSG_38, detalle: ex.Message);
        }
    }

    public async Task<ApiResponse<CambiarEstadoProductoResponseDto>> CambiarEstadoAsync(
        Guid id,
        bool nuevoEstado,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var producto = await _productoRepository.ObtenerPorIdAsync(id, cancellationToken);
            if (producto == null)
            {
                return ApiResponse<CambiarEstadoProductoResponseDto>.Fallido(MensajesCatalogo.MSG_38);
            }

            producto.CambiarEstado(nuevoEstado);
            await _productoRepository.ActualizarAsync(producto, cancellationToken);

            // RN-34 / RN-28: Si se desactiva y formaba parte del menú de hoy, se retira del menú vigente.
            var retiradoDelMenu = false;
            if (!nuevoEstado)
            {
                await _menuDiaRepository.RemoverProductoDeMenuVigenteAsync(producto.Id_Producto, adminUsername, cancellationToken);
                retiradoDelMenu = true;
            }

            // RN-30: Auditoría
            var auditoria = new AuditoriaUsuario(
                nombreAdmin: adminUsername,
                accion: nuevoEstado ? "ACTIVAR_PRODUCTO" : "DESACTIVAR_PRODUCTO",
                nombreUsuarioAfectado: producto.Pro_Nombre,
                detalle: $"Estado cambiado a {(nuevoEstado ? "Activo" : "Inactivo")}",
                direccionIp: ipAddress);

            await _auditoriaRepository.RegistrarAsync(auditoria, cancellationToken);
            await _productoRepository.GuardarCambiosAsync(cancellationToken);

            var mensaje = nuevoEstado ? MensajesCatalogo.MSG_64 : MensajesCatalogo.MSG_63;

            return ApiResponse<CambiarEstadoProductoResponseDto>.Exitoso(
                new CambiarEstadoProductoResponseDto
                {
                    Activo = producto.Pro_Activo,
                    RetiradoDelMenu = retiradoDelMenu
                },
                mensaje);
        }
        catch (Exception ex)
        {
            return ApiResponse<CambiarEstadoProductoResponseDto>.Fallido(MensajesCatalogo.MSG_38, detalle: ex.Message);
        }
    }

    public async Task<ApiResponse<List<ProductoResponseDto>>> ListarDisponiblesAsync(
        string? categoria,
        string? tipo = null,
        string? rol = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            CategoriaProducto? categoriaEnum = null;
            if (!string.IsNullOrWhiteSpace(categoria) && !categoria.Equals("Todas", StringComparison.OrdinalIgnoreCase))
            {
                if (CategoriaProductoExtensions.TryParseFlexible(categoria, out var cat))
                {
                    categoriaEnum = cat;
                }
            }

            TipoProducto? tipoEnum = null;
            if (!string.IsNullOrWhiteSpace(tipo) && !tipo.Equals("Todos", StringComparison.OrdinalIgnoreCase))
            {
                if (TipoProductoExtensions.TryParseFlexible(tipo, out var tip))
                {
                    tipoEnum = tip;
                }
            }

            RolComponente? rolEnum = null;
            if (!string.IsNullOrWhiteSpace(rol) && !rol.Equals("Todos", StringComparison.OrdinalIgnoreCase))
            {
                if (RolComponenteExtensions.TryParseFlexible(rol, out var r))
                {
                    rolEnum = r;
                }
            }

            var disponibles = await _productoRepository.ListarDisponiblesAsync(categoriaEnum, tipoEnum, rolEnum, cancellationToken);
            return ApiResponse<List<ProductoResponseDto>>.Exitoso(disponibles.Select(MapearADto).ToList());
        }
        catch (Exception ex)
        {
            return ApiResponse<List<ProductoResponseDto>>.Fallido(MensajesCatalogo.MSG_67, detalle: ex.Message);
        }
    }

    private static (bool EsValido, string MensajeGeneral, Dictionary<string, string> Errores) ValidarDatosProducto(
        string? nombre,
        string? tipo,
        string? categoria,
        string? rol,
        decimal? precio)
    {
        var errores = new Dictionary<string, string>();
        var nombreTrim = nombre?.Trim() ?? string.Empty;

        // RV-33 / RV-37 / RV-38
        if (string.IsNullOrWhiteSpace(nombreTrim))
        {
            errores["nombre"] = MensajesCatalogo.MSG_51;
        }
        else if (nombreTrim.Length < 3 || nombreTrim.Length > 50 || !RegexNombreValido.IsMatch(nombreTrim))
        {
            errores["nombre"] = MensajesCatalogo.MSG_52;
        }

        // RV-155: Tipo obligatorio
        var tipoStr = string.IsNullOrWhiteSpace(tipo) ? "Carta" : tipo;
        if (!TipoProductoExtensions.TryParseFlexible(tipoStr, out var tipoEnum))
        {
            errores["tipo"] = MensajesCatalogo.MSG_213;
        }
        else if (tipoEnum == TipoProducto.Carta)
        {
            // RV-35: Categoría obligatoria para carta
            if (string.IsNullOrWhiteSpace(categoria) || !CategoriaProductoExtensions.TryParseFlexible(categoria, out _))
            {
                errores["categoria"] = MensajesCatalogo.MSG_54;
            }

            // RV-36 / RN-25: precio > 0 y <= 999.99 con hasta 2 decimales
            if (!precio.HasValue || precio.Value <= 0)
            {
                errores["precio"] = MensajesCatalogo.MSG_55;
            }
            else if (precio.Value > 999.99m || decimal.Round(precio.Value, 2) != precio.Value)
            {
                errores["precio"] = MensajesCatalogo.MSG_56;
            }
        }
        else // TipoProducto.Componente
        {
            // RV-156: Rol obligatorio para componentes
            if (string.IsNullOrWhiteSpace(rol) || !RolComponenteExtensions.TryParseFlexible(rol, out _))
            {
                errores["rol"] = MensajesCatalogo.MSG_214;
            }
        }

        var esValido = errores.Count == 0;
        var mensajeGeneral = esValido ? string.Empty : errores.Values.First();

        return (esValido, mensajeGeneral, errores);
    }

    private static ProductoResponseDto MapearADto(Producto p)
    {
        return new ProductoResponseDto
        {
            Id = p.Id_Producto,
            Nombre = p.Pro_Nombre,
            Tipo = p.Pro_Tipo.ToString(),
            Rol = p.Pro_Rol?.ToString(),
            Categoria = p.Pro_Categoria?.ToString(),
            Precio = p.Pro_Precio,
            Activo = p.Pro_Activo
        };
    }
}
