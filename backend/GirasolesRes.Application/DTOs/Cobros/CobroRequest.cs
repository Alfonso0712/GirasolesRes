using System.ComponentModel.DataAnnotations;

namespace GirasolesRes.Application.DTOs.Cobros;

public class CobroRequest
{
    [Required(ErrorMessage = "El identificador de solicitud es obligatorio.")]
    public string SolicitudId { get; set; } = string.Empty;

    [Required(ErrorMessage = "El identificador del pedido es obligatorio.")]
    public Guid PedidoId { get; set; }

    [Required(ErrorMessage = "El total mostrado es obligatorio.")]
    [Range(0.01, 9999.99, ErrorMessage = "El total mostrado debe ser mayor a cero.")]
    public decimal TotalMostrado { get; set; }

    [Required(ErrorMessage = "Seleccione el método de pago.")]
    public string Metodo { get; set; } = string.Empty;

    public decimal? MontoRecibido { get; set; }
    public bool? YapeConfirmado { get; set; }
    public string? YapeReferencia { get; set; }
}
