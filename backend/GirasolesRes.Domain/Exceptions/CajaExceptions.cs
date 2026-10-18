namespace GirasolesRes.Domain.Exceptions;

/// <summary>
/// Excepción base abstracta para violaciones de reglas de dominio en el módulo de Caja.
/// </summary>
public abstract class CajaDomainException : Exception
{
    public string Codigo { get; }

    protected CajaDomainException(string codigo, string mensaje) : base(mensaje)
    {
        Codigo = codigo;
    }

    protected CajaDomainException(string codigo, string mensaje, Exception? innerException)
        : base(mensaje, innerException)
    {
        Codigo = codigo;
    }
}

/// <summary>
/// Ocurre cuando se intenta realizar una operación que requiere una caja abierta (cierre, cobro, venta) y no existe ninguna (MSG-166).
/// </summary>
public class CajaNoAbiertaException : CajaDomainException
{
    public CajaNoAbiertaException(string mensaje = "Todavía no hay caja abierta. Ábrala para empezar a cobrar.")
        : base("caja_no_abierta", mensaje) { }
}

/// <summary>
/// Ocurre cuando se intenta abrir una caja cuando ya existe otra caja abierta el día de hoy (RV-119, RN-107, MSG-167).
/// </summary>
public class CajaYaAbiertaException : CajaDomainException
{
    public Guid? CajaIdExistente { get; }
    public DateTime? FechaAperturaUtc { get; }
    public string? NombreUsuarioApertura { get; }

    public CajaYaAbiertaException(
        string mensaje = "Ya existe una caja abierta en el sistema.",
        Guid? cajaIdExistente = null,
        DateTime? fechaAperturaUtc = null,
        string? nombreUsuarioApertura = null)
        : base("caja_ya_abierta", mensaje)
    {
        CajaIdExistente = cajaIdExistente;
        FechaAperturaUtc = fechaAperturaUtc;
        NombreUsuarioApertura = nombreUsuarioApertura;
    }
}

/// <summary>
/// Ocurre cuando existe una caja abierta de un día anterior dejada sin cerrar (RV-119, RN-108, MSG-168).
/// </summary>
public class CajaAnteriorSinCerrarException : CajaDomainException
{
    public Guid CajaId { get; }
    public DateTime FechaAperturaUtc { get; }
    public string FechaLocalFormateada { get; }

    public CajaAnteriorSinCerrarException(
        Guid cajaId,
        DateTime fechaAperturaUtc,
        string fechaLocalFormateada,
        string mensaje = "Hay una caja anterior sin cerrar. Ciérrela antes de abrir una nueva o cobrar.")
        : base("caja_anterior_sin_cerrar", mensaje)
    {
        CajaId = cajaId;
        FechaAperturaUtc = fechaAperturaUtc;
        FechaLocalFormateada = fechaLocalFormateada;
    }
}

/// <summary>
/// Ocurre cuando se intenta asentar el cierre de caja pero el efectivo esperado cambió concurrentemente durante el conteo (RV-129, MSG-189).
/// </summary>
public class CajaConcurrenciaException : CajaDomainException
{
    public decimal EfectivoEsperadoActual { get; }
    public decimal EfectivoEsperadoMostrado { get; }

    public CajaConcurrenciaException(
        decimal efectivoEsperadoActual,
        decimal efectivoEsperadoMostrado,
        string mensaje = "Los totales cambiaron mientras contaba. Revise el resumen antes de cerrar.")
        : base("caja_concurrencia", mensaje)
    {
        EfectivoEsperadoActual = efectivoEsperadoActual;
        EfectivoEsperadoMostrado = efectivoEsperadoMostrado;
    }
}

/// <summary>
/// Ocurre cuando se intenta cerrar la caja existiendo pedidos no cobrados ni anulados (RV-122, RN-110, MSG-174).
/// </summary>
public class CajaPedidosPendientesException : CajaDomainException
{
    public int CantidadPedidosPendientes { get; }

    public CajaPedidosPendientesException(
        int cantidadPedidosPendientes,
        string mensaje = "No se puede cerrar la caja: hay pedidos pendientes de cobro.")
        : base("pedidos_pendientes", mensaje)
    {
        CantidadPedidosPendientes = cantidadPedidosPendientes;
    }
}

/// <summary>
/// Ocurre cuando el monto inicial o el efectivo contado viola las reglas de rango o precisión decimal (RV-120, RV-124, MSG-170, MSG-171).
/// </summary>
public class CajaMontoInvalidoException : CajaDomainException
{
    public decimal MontoInvalido { get; }
    public string Campo { get; }

    public CajaMontoInvalidoException(
        decimal montoInvalido,
        string campo,
        string mensaje = "Ingrese un monto válido, desde S/ 0.00 y con hasta 2 decimales.")
        : base("monto_invalido", mensaje)
    {
        MontoInvalido = montoInvalido;
        Campo = campo;
    }
}

/// <summary>
/// Ocurre cuando la observación del cierre supera los 200 caracteres permitidos (RV-126, MSG-179).
/// </summary>
public class CajaObservacionInvalidaException : CajaDomainException
{
    public int LongitudActual { get; }
    public int LongitudMaxima { get; }

    public CajaObservacionInvalidaException(
        int longitudActual,
        int longitudMaxima = 200,
        string mensaje = "La observación no puede superar los 200 caracteres.")
        : base("observacion_invalida", mensaje)
    {
        LongitudActual = longitudActual;
        LongitudMaxima = longitudMaxima;
    }
}

/// <summary>
/// Ocurre cuando se intenta cerrar una caja que ya ha sido cerrada con anterioridad (RN-112).
/// </summary>
public class CajaYaCerradaException : CajaDomainException
{
    public Guid CajaId { get; }

    public CajaYaCerradaException(
        Guid cajaId,
        string mensaje = "La caja ya se encuentra cerrada.")
        : base("caja_ya_cerrada", mensaje)
    {
        CajaId = cajaId;
    }
}
