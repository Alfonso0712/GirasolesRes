using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Domain.Entities;

public class Caja
{
    public Guid Id_Caja { get; private set; }
    public Guid Id_Usuario { get; private set; }
    public Usuario? Caj_Usuario { get; private set; }
    public decimal Caj_MontoApertura { get; private set; }
    public decimal? Caj_MontoCierre { get; private set; }
    public DateTime Caj_FechaAperturaUtc { get; private set; }
    public DateTime? Caj_FechaCierreUtc { get; private set; }
    public EstadoCaja Caj_Estado { get; private set; } = EstadoCaja.Abierta;
    public DateTime Caj_FechaCreacionUtc { get; private set; }
    public DateTime? Caj_FechaActualizacionUtc { get; private set; }

    // Constructor privado para EF Core
    private Caja() { }

    public Caja(Guid idUsuario, decimal cajMontoApertura)
    {
        if (cajMontoApertura < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(cajMontoApertura), "El monto de apertura no puede ser negativo.");
        }

        Id_Caja = Guid.NewGuid();
        Id_Usuario = idUsuario;
        Caj_MontoApertura = decimal.Round(cajMontoApertura, 2);
        Caj_FechaAperturaUtc = DateTime.UtcNow;
        Caj_Estado = EstadoCaja.Abierta;
        Caj_FechaCreacionUtc = DateTime.UtcNow;
    }

    public void Cerrar(decimal cajMontoCierre)
    {
        if (Caj_Estado == EstadoCaja.Cerrada)
        {
            throw new InvalidOperationException("La caja ya se encuentra cerrada.");
        }

        Caj_MontoCierre = decimal.Round(cajMontoCierre, 2);
        Caj_FechaCierreUtc = DateTime.UtcNow;
        Caj_Estado = EstadoCaja.Cerrada;
        Caj_FechaActualizacionUtc = DateTime.UtcNow;
    }
}
