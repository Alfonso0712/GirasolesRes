using GirasolesRes.Domain.Enums;
using GirasolesRes.Domain.Exceptions;

namespace GirasolesRes.Domain.Entities;

public class Caja
{
    public Guid Id_Caja { get; private set; }

    // Apertura
    public Guid Id_Usuario { get; private set; }
    public Usuario? Caj_Usuario { get; private set; }
    public decimal Caj_MontoApertura { get; private set; }
    public DateTime Caj_FechaAperturaUtc { get; private set; }
    public string? Caj_SolicitudId { get; private set; }

    // Cierre & Cuadre
    public Guid? Id_UsuarioCierre { get; private set; }
    public Usuario? Caj_UsuarioCierre { get; private set; }
    public decimal? Caj_MontoCierre { get; private set; }
    public decimal? Caj_MontoEsperado { get; private set; }
    public decimal? Caj_Diferencia { get; private set; }
    public decimal? Caj_TotalVentasEfectivo { get; private set; }
    public decimal? Caj_TotalVentasYape { get; private set; }
    public decimal? Caj_TotalVentas { get; private set; }
    public int? Caj_CantidadVentas { get; private set; }
    public string? Caj_Observacion { get; private set; }
    public DateTime? Caj_FechaCierreUtc { get; private set; }
    public string? Caj_SolicitudIdCierre { get; private set; }

    // Estado & Auditoría
    public EstadoCaja Caj_Estado { get; private set; } = EstadoCaja.Abierta;
    public DateTime Caj_FechaCreacionUtc { get; private set; }
    public DateTime? Caj_FechaActualizacionUtc { get; private set; }

    // Navegación a Ventas asociadas
    private readonly List<Venta> _caj_Ventas = new();
    public IReadOnlyCollection<Venta> Caj_Ventas => _caj_Ventas.AsReadOnly();

    // Constructor privado para EF Core
    private Caja() { }

    /// <summary>
    /// Registra la apertura de una nueva caja (CUS 13.1, RV-120, RV-121).
    /// </summary>
    public Caja(Guid idUsuario, decimal cajMontoApertura, string? cajSolicitudId = null)
    {
        if (idUsuario == Guid.Empty)
        {
            throw new ArgumentException("El usuario de apertura no es válido.", nameof(idUsuario));
        }

        // RV-120: Monto inicial obligatorio entre 0.00 y 99,999.99 con hasta 2 decimales
        ValidarMontoMonetario(cajMontoApertura, "MontoApertura");

        Id_Caja = Guid.NewGuid();
        Id_Usuario = idUsuario;
        Caj_MontoApertura = decimal.Round(cajMontoApertura, 2);
        Caj_SolicitudId = string.IsNullOrWhiteSpace(cajSolicitudId)
            ? Guid.NewGuid().ToString()
            : cajSolicitudId.Trim();

        Caj_FechaAperturaUtc = DateTime.UtcNow;
        Caj_Estado = EstadoCaja.Abierta;
        Caj_FechaCreacionUtc = DateTime.UtcNow;
        Caj_FechaActualizacionUtc = null;
    }

    /// <summary>
    /// Asienta el cierre definitivo e inmutable de la caja (CUS 13.2, RV-124, RV-126, RN-109, RN-111, RN-112).
    /// </summary>
    public void Cerrar(
        Guid idUsuarioCierre,
        decimal efectivoContado,
        decimal efectivoEsperado,
        decimal totalVentasEfectivo,
        decimal totalVentasYape,
        decimal totalVentas,
        int cantidadVentas,
        string? observacion = null,
        string? solicitudIdCierre = null)
    {
        if (Caj_Estado == EstadoCaja.Cerrada)
        {
            throw new CajaYaCerradaException(Id_Caja);
        }

        if (idUsuarioCierre == Guid.Empty)
        {
            throw new ArgumentException("El usuario de cierre no es válido.", nameof(idUsuarioCierre));
        }

        // RV-124: Efectivo contado obligatorio entre 0.00 y 99,999.99 con hasta 2 decimales
        ValidarMontoMonetario(efectivoContado, "EfectivoContado");

        // RV-126: Observación opcional de hasta 200 caracteres
        if (!string.IsNullOrWhiteSpace(observacion) && observacion.Trim().Length > 200)
        {
            throw new CajaObservacionInvalidaException(observacion.Trim().Length, 200);
        }

        Id_UsuarioCierre = idUsuarioCierre;
        Caj_MontoCierre = decimal.Round(efectivoContado, 2);
        Caj_MontoEsperado = decimal.Round(efectivoEsperado, 2);

        // RN-111: Diferencia = efectivo contado - efectivo esperado
        Caj_Diferencia = decimal.Round(efectivoContado - efectivoEsperado, 2);

        Caj_TotalVentasEfectivo = decimal.Round(totalVentasEfectivo, 2);
        Caj_TotalVentasYape = decimal.Round(totalVentasYape, 2);
        Caj_TotalVentas = decimal.Round(totalVentas, 2);
        Caj_CantidadVentas = cantidadVentas >= 0 ? cantidadVentas : 0;
        Caj_Observacion = string.IsNullOrWhiteSpace(observacion) ? null : observacion.Trim();
        Caj_SolicitudIdCierre = string.IsNullOrWhiteSpace(solicitudIdCierre) ? null : solicitudIdCierre.Trim();

        Caj_Estado = EstadoCaja.Cerrada;
        Caj_FechaCierreUtc = DateTime.UtcNow;
        Caj_FechaActualizacionUtc = DateTime.UtcNow;
    }

    /// <summary>
    /// Sobrecarga con usuario de cierre al final para compatibilidad de invocación.
    /// </summary>
    public void Cerrar(
        decimal efectivoContado,
        decimal montoEsperado,
        decimal totalVentasEfectivo,
        decimal totalVentasYape,
        decimal totalVentas,
        int cantidadVentas,
        Guid idUsuarioCierre,
        string? observacion = null,
        string? solicitudIdCierre = null)
    {
        Cerrar(
            idUsuarioCierre: idUsuarioCierre,
            efectivoContado: efectivoContado,
            efectivoEsperado: montoEsperado,
            totalVentasEfectivo: totalVentasEfectivo,
            totalVentasYape: totalVentasYape,
            totalVentas: totalVentas,
            cantidadVentas: cantidadVentas,
            observacion: observacion,
            solicitudIdCierre: solicitudIdCierre
        );
    }

    /// <summary>
    /// Sobrecarga de compatibilidad hacia atrás para cierres simplificados.
    /// </summary>
    public void Cerrar(decimal cajMontoCierre)
    {
        Cerrar(
            idUsuarioCierre: Id_Usuario,
            efectivoContado: cajMontoCierre,
            efectivoEsperado: cajMontoCierre,
            totalVentasEfectivo: 0m,
            totalVentasYape: 0m,
            totalVentas: 0m,
            cantidadVentas: 0,
            observacion: null,
            solicitudIdCierre: null
        );
    }

    /// <summary>
    /// Retorna la clasificación semántica del arqueo (Cuadra, Sobrante, Faltante).
    /// </summary>
    public EstadoCuadre? ObtenerEstadoCuadre()
    {
        if (!Caj_Diferencia.HasValue) return null;
        if (Caj_Diferencia.Value == 0.00m) return EstadoCuadre.Cuadra;
        return Caj_Diferencia.Value > 0.00m ? EstadoCuadre.Sobrante : EstadoCuadre.Faltante;
    }

    /// <summary>
    /// Valida que un importe monetario sea >= 0.00, <= 99,999.99 y contenga un máximo de 2 decimales.
    /// </summary>
    private static void ValidarMontoMonetario(decimal monto, string campo)
    {
        if (monto < 0.00m)
        {
            throw new CajaMontoInvalidoException(monto, campo, "El monto no puede ser negativo.");
        }

        if (monto > 99999.99m)
        {
            throw new CajaMontoInvalidoException(monto, campo, "El monto no puede superar S/ 99,999.99.");
        }

        if (decimal.Round(monto, 2) != monto)
        {
            throw new CajaMontoInvalidoException(monto, campo, "El monto debe tener como máximo 2 decimales.");
        }
    }

    public void AgregarVenta(Venta venta)
    {
        _caj_Ventas.Add(venta);
    }
}
