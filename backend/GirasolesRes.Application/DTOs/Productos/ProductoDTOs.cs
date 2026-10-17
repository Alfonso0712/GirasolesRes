namespace GirasolesRes.Application.DTOs.Productos;

public class CrearProductoRequest
{
    public string Nombre { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public decimal Precio { get; set; }
}

public class ActualizarProductoRequest
{
    public string Nombre { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public decimal Precio { get; set; }
}

public class CambiarEstadoProductoRequest
{
    public bool Activo { get; set; }
}

public class ProductoResponseDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public bool Activo { get; set; }
}

public class PaginacionProductosResponse
{
    public List<ProductoResponseDto> Items { get; set; } = new();
    public int Total { get; set; }
}

public class CambiarEstadoProductoResponseDto
{
    public bool Activo { get; set; }
    public bool RetiradoDelMenu { get; set; }
}
