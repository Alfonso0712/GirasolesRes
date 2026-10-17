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
        bool? activo,
        int pagina = 1,
        int tamano = 10,
        CancellationToken cancellationToken = default)
    {
        try
        {
            CategoriaProducto? categoriaEnum = null;
            if (!string.IsNullOrWhiteSpace(categoria) && !categoria.Equals("Todas", StringComparison.OrdinalIgnoreCase))
            {
                if (Enum.TryParse<CategoriaProducto>(categoria.Trim(), true, out var cat))
                {
                    categoriaEnum = cat;
                }
            }

            var (items, total) = await _productoRepository.ListarProductosAsync(
                busqueda,
                categoriaEnum,
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
            var validacion = ValidarDatosProducto(request.Nombre, request.Categoria, request.Precio);
            if (!validacion.EsValido)
            {
                return ApiResponse<ProductoResponseDto>.Fallido(
                    validacion.MensajeGeneral,
                    errores: validacion.Errores);
            }

            var nombreNormalizado = Producto.NormalizarTexto(request.Nombre);

            // RV-34 / RN-24: Nombre único sin distinguir mayúsculas ni tildes
            var existe = await _productoRepository.ExisteNombreAsync(nombreNormalizado, null, cancellationToken);
            if (existe)
            {
                return ApiResponse<ProductoResponseDto>.Fallido(
                    MensajesCatalogo.MSG_53,
                    errores: new Dictionary<string, string> { { "nombre", MensajesCatalogo.MSG_53 } });
            }

            Enum.TryParse<CategoriaProducto>(request.Categoria.Trim(), true, out var categoria);

            var nuevoProducto = new Producto(
                nombre: request.Nombre,
                categoria: categoria,
                precio: request.Precio,
                activo: true);

            await _productoRepository.AgregarAsync(nuevoProducto, cancellationToken);

            // RN-30: Auditoría
            var auditoria = new AuditoriaUsuario(
                nombreAdmin: adminUsername,
                accion: "CREAR_PRODUCTO",
                nombreUsuarioAfectado: nuevoProducto.Nombre,
                detalle: $"Producto registrado con precio S/ {nuevoProducto.Precio:F2} y categoría {nuevoProducto.Categoria}",
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

            var validacion = ValidarDatosProducto(request.Nombre, request.Categoria, request.Precio);
            if (!validacion.EsValido)
            {
                return ApiResponse<ProductoResponseDto>.Fallido(
                    validacion.MensajeGeneral,
                    errores: validacion.Errores);
            }

            var nombreNormalizado = Producto.NormalizarTexto(request.Nombre);

            // RV-34 / RN-24: Nombre único
            var existe = await _productoRepository.ExisteNombreAsync(nombreNormalizado, id, cancellationToken);
            if (existe)
            {
                return ApiResponse<ProductoResponseDto>.Fallido(
                    MensajesCatalogo.MSG_53,
                    errores: new Dictionary<string, string> { { "nombre", MensajesCatalogo.MSG_53 } });
            }

            Enum.TryParse<CategoriaProducto>(request.Categoria.Trim(), true, out var categoria);

            var precioAnterior = producto.Precio;
            producto.Actualizar(request.Nombre, categoria, request.Precio);
            await _productoRepository.ActualizarAsync(producto, cancellationToken);

            // RN-30: Auditoría con precio anterior y nuevo
            var auditoria = new AuditoriaUsuario(
                nombreAdmin: adminUsername,
                accion: "EDITAR_PRODUCTO",
                nombreUsuarioAfectado: producto.Nombre,
                detalle: $"Precio anterior: S/ {precioAnterior:F2}, Nuevo precio: S/ {producto.Precio:F2}. Categoría: {producto.Categoria}",
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
                await _menuDiaRepository.RemoverProductoDeMenuVigenteAsync(producto.Id, adminUsername, cancellationToken);
                retiradoDelMenu = true;
            }

            // RN-30: Auditoría
            var auditoria = new AuditoriaUsuario(
                nombreAdmin: adminUsername,
                accion: nuevoEstado ? "ACTIVAR_PRODUCTO" : "DESACTIVAR_PRODUCTO",
                nombreUsuarioAfectado: producto.Nombre,
                detalle: $"Estado cambiado a {(nuevoEstado ? "Activo" : "Inactivo")}",
                direccionIp: ipAddress);

            await _auditoriaRepository.RegistrarAsync(auditoria, cancellationToken);
            await _productoRepository.GuardarCambiosAsync(cancellationToken);

            var mensaje = nuevoEstado ? MensajesCatalogo.MSG_64 : MensajesCatalogo.MSG_63;

            return ApiResponse<CambiarEstadoProductoResponseDto>.Exitoso(
                new CambiarEstadoProductoResponseDto
                {
                    Activo = producto.Activo,
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
        CancellationToken cancellationToken = default)
    {
        try
        {
            CategoriaProducto? categoriaEnum = null;
            if (!string.IsNullOrWhiteSpace(categoria) && !categoria.Equals("Todas", StringComparison.OrdinalIgnoreCase))
            {
                if (Enum.TryParse<CategoriaProducto>(categoria.Trim(), true, out var cat))
                {
                    categoriaEnum = cat;
                }
            }

            var disponibles = await _productoRepository.ListarDisponiblesAsync(categoriaEnum, cancellationToken);
            return ApiResponse<List<ProductoResponseDto>>.Exitoso(disponibles.Select(MapearADto).ToList());
        }
        catch (Exception ex)
        {
            return ApiResponse<List<ProductoResponseDto>>.Fallido(MensajesCatalogo.MSG_67, detalle: ex.Message);
        }
    }

    private static (bool EsValido, string MensajeGeneral, Dictionary<string, string> Errores) ValidarDatosProducto(
        string? nombre,
        string? categoria,
        decimal precio)
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

        // RV-35
        if (string.IsNullOrWhiteSpace(categoria))
        {
            errores["categoria"] = MensajesCatalogo.MSG_54;
        }
        else if (!Enum.TryParse<CategoriaProducto>(categoria.Trim(), true, out _))
        {
            errores["categoria"] = MensajesCatalogo.MSG_54;
        }

        // RV-36 / RN-25: precio > 0 y <= 999.99 con hasta 2 decimales
        if (precio <= 0)
        {
            errores["precio"] = MensajesCatalogo.MSG_55;
        }
        else if (precio > 999.99m || decimal.Round(precio, 2) != precio)
        {
            errores["precio"] = MensajesCatalogo.MSG_56;
        }

        var esValido = errores.Count == 0;
        var mensajeGeneral = esValido ? string.Empty : errores.Values.First();

        return (esValido, mensajeGeneral, errores);
    }

    private static ProductoResponseDto MapearADto(Producto p)
    {
        return new ProductoResponseDto
        {
            Id = p.Id,
            Nombre = p.Nombre,
            Categoria = p.Categoria.ToString(),
            Precio = p.Precio,
            Activo = p.Activo
        };
    }
}
