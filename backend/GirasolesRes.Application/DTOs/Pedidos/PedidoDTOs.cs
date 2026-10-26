using System.ComponentModel.DataAnnotations;

namespace GirasolesRes.Application.DTOs.Pedidos;

public class EleccionOpcionRequest
{
    [Required(ErrorMessage = "El nombre de la parte del menú es obligatorio.")]
    [MaxLength(100, ErrorMessage = "El nombre de la parte no puede superar los 100 caracteres.")]
    public string Parte { get; set; } = string.Empty;

    [Required(ErrorMessage = "El identificador del componente es obligatorio.")]
    public Guid ProductoId { get; set; }
}

public class LineaPedidoRequest
{
    public Guid? ProductoId { get; set; }

    public int? MenuCompletoId { get; set; }

    public List<EleccionOpcionRequest>? Elecciones { get; set; }

    [Range(1, 20, ErrorMessage = "La cantidad debe ser un número entero entre 1 y 20.")]
    public int Cantidad { get; set; } = 1;

    [MaxLength(100, ErrorMessage = "La observación no puede superar los 100 caracteres.")]
    public string? Observacion { get; set; }
}

public class RegistrarPedidoMesaRequest
{
    [Required(ErrorMessage = "El identificador de solicitud es obligatorio.")]
    public string SolicitudId { get; set; } = string.Empty;

    [Required(ErrorMessage = "La mesa es obligatoria.")]
    public Guid MesaId { get; set; }

    [Required(ErrorMessage = "Agregue al menos un producto al pedido.")]
    [MinLength(1, ErrorMessage = "Agregue al menos un producto al pedido.")]
    public List<LineaPedidoRequest> Lineas { get; set; } = new();

    [MaxLength(250, ErrorMessage = "Las notas no pueden superar los 250 caracteres.")]
    public string? Notas { get; set; }
}

public class AgregarLineasPedidoRequest
{
    [Required(ErrorMessage = "El identificador de solicitud es obligatorio.")]
    public string SolicitudId { get; set; } = string.Empty;

    [Required(ErrorMessage = "Agregue al menos un producto al pedido.")]
    [MinLength(1, ErrorMessage = "Agregue al menos un producto al pedido.")]
    public List<LineaPedidoRequest> Lineas { get; set; } = new();
}

public class RegistrarPedidoLlevarRequest
{
    [Required(ErrorMessage = "El identificador de solicitud es obligatorio.")]
    public string SolicitudId { get; set; } = string.Empty;

    [MaxLength(30, ErrorMessage = "La referencia no puede superar los 30 caracteres.")]
    public string? Referencia { get; set; }

    [Required(ErrorMessage = "Agregue al menos un producto al pedido.")]
    [MinLength(1, ErrorMessage = "Agregue al menos un producto al pedido.")]
    public List<LineaPedidoRequest> Lineas { get; set; } = new();
}

public record RegistrarPedidoResultDto(
    Guid PedidoId,
    int Numero,
    decimal Total,
    Guid ComandaId,
    string MesaNombre
);

public record RegistrarPedidoLlevarResultDto(
    Guid PedidoId,
    int Numero,
    decimal Total,
    Guid ComandaId
);

public record AgregarLineasResultDto(
    decimal Total,
    Guid ComandaId,
    int NumeroPedido
);

public record PedidoAbiertoMesaDto(
    Guid Id,
    int Numero,
    string Estado,
    decimal Total
);

public record EleccionOpcionResponseDto(
    string Parte,
    Guid ProductoId,
    string ProductoNombre
);

public record LineaPedidoResponseDto(
    Guid Id,
    Guid? ProductoId,
    int? MenuCompletoId,
    string ProductoNombre,
    string? Incluye,
    decimal PrecioUnitario,
    int Cantidad,
    decimal Subtotal,
    string? Observacion,
    List<EleccionOpcionResponseDto>? Elecciones = null
);

public record PedidoResponseDto(
    Guid Id,
    int Numero,
    DateOnly FechaOperativa,
    DateTime FechaHora,
    string Estado,
    string Tipo,
    decimal Total,
    string? Notas,
    Guid? MesaId,
    string? MesaNombre,
    Guid MozoId,
    string MozoNombre,
    List<LineaPedidoResponseDto> Lineas
);

public record ProductoMenuPedidoDto(
    Guid Id,
    string Nombre,
    string Categoria,
    decimal Precio,
    bool Agotado,
    bool Disponible,
    string? Rol = null
);

// CUS09: Gestión de Pedidos DTOs
public class ListarPedidosQueryDto
{
    public DateOnly? Fecha { get; set; }
    public string? Estado { get; set; }
    public string? Tipo { get; set; }
    public Guid? MesaId { get; set; }
    public bool SoloMios { get; set; } = false;
    public int Pagina { get; set; } = 1;
    public int Tamano { get; set; } = 20;
}

public record ResumenEstadosDto(
    int Pendiente,
    int EnPreparacion,
    int Listo,
    int Pagado,
    int Anulado
);

public record PedidoItemDto(
    Guid Id,
    int Numero,
    string Tipo,
    string? Mesa,
    string? Referencia,
    string Hora,
    decimal Total,
    string Estado,
    string RegistradoPor,
    Guid UsuarioId,
    bool EsMio,
    bool PuedeModificar,
    bool PuedeAnular,
    string? MotivoDeshabilitado
);

public record ListarPedidosResponseDto(
    IReadOnlyList<PedidoItemDto> Items,
    int Total,
    ResumenEstadosDto Resumen
);

public record LineaDetalleDto(
    Guid DetalleId,
    Guid? ProductoId,
    int? MenuCompletoId,
    string Nombre,
    string? Incluye,
    int Cantidad,
    decimal PrecioUnitario,
    decimal Subtotal,
    string? Observacion,
    List<EleccionOpcionResponseDto>? Elecciones = null
);

public record ComandaDetalleDto(
    Guid ComandaId,
    int Numero,
    string Estado,
    bool EsAdicional,
    bool Modificada,
    DateTime FechaHora
);

public record DetallePedidoCompletoDto(
    Guid Id,
    int Numero,
    string Tipo,
    string? Mesa,
    string? Referencia,
    string Hora,
    decimal Total,
    string Estado,
    string RegistradoPor,
    Guid UsuarioId,
    string? MotivoAnulacion,
    IReadOnlyList<LineaDetalleDto> Lineas,
    IReadOnlyList<ComandaDetalleDto> Comandas
);

public class ModificarPedidoRequest
{
    [Required(ErrorMessage = "Agregue al menos un producto al pedido.")]
    [MinLength(1, ErrorMessage = "Agregue al menos un producto al pedido.")]
    public List<LineaPedidoRequest> Lineas { get; set; } = new();
}

public class AnularPedidoRequest
{
    [Required(ErrorMessage = "El identificador de solicitud es obligatorio.")]
    public string SolicitudId { get; set; } = string.Empty;

    [Required(ErrorMessage = "Indique el motivo de la anulación (entre 5 y 100 caracteres).")]
    [StringLength(100, MinimumLength = 5, ErrorMessage = "Indique el motivo de la anulación (entre 5 y 100 caracteres).")]
    public string Motivo { get; set; } = string.Empty;
}

public record AvisoComandaDto(
    Guid Id,
    Guid PedidoId,
    int Numero,
    string Tipo,
    string? Mesa,
    string? Referencia,
    string Hora
);
