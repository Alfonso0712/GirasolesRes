using System.ComponentModel.DataAnnotations;

namespace GirasolesRes.Application.DTOs.Comandas;

public class LineaComandaDto
{
    public string Producto { get; set; } = string.Empty;
    public string? Elecciones { get; set; }
    public string? Incluye { get; set; }
    public int Cantidad { get; set; }
    public string? Observacion { get; set; }
}

public class ComandaItemDto
{
    public Guid Id { get; set; }
    public int PedidoNumero { get; set; }
    public string Tipo { get; set; } = string.Empty;
    public string? Mesa { get; set; }
    public string? Referencia { get; set; }
    public string HoraLlegada { get; set; } = string.Empty;
    public DateTime FechaHoraLlegadaUtc { get; set; }
    public string Estado { get; set; } = string.Empty;
    public string? Etiqueta { get; set; }
    public bool EsAdicional { get; set; }
    public int NumeroAdicional { get; set; }
    public bool Modificada { get; set; }
    public string RegistradoPor { get; set; } = string.Empty;
    public int MinutosEspera { get; set; }
    public bool EsDemora { get; set; }
    public List<LineaComandaDto> Lineas { get; set; } = new();
}

public class ResumenProductoDto
{
    public string Producto { get; set; } = string.Empty;
    public int Cantidad { get; set; }
}

public class ListarComandasResponseDto
{
    public List<ComandaItemDto> Items { get; set; } = new();
    public List<ResumenProductoDto> Resumen { get; set; } = new();
}

public class ActualizarEstadoComandaRequest
{
    [Required(ErrorMessage = "El estado es obligatorio.")]
    [RegularExpression("^(enPreparacion|lista)$", ErrorMessage = "El estado debe ser 'enPreparacion' o 'lista'.")]
    public string Estado { get; set; } = string.Empty;
}

public class ActualizarEstadoComandaResponse
{
    public Guid Id { get; set; }
    public string Estado { get; set; } = string.Empty;
    public DateTime DeshacerHasta { get; set; }
    public string Mensaje { get; set; } = string.Empty;
}

public class DeshacerEstadoComandaResponse
{
    public Guid Id { get; set; }
    public string Estado { get; set; } = string.Empty;
    public string Mensaje { get; set; } = string.Empty;
}
