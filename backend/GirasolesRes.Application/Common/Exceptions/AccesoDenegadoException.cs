namespace GirasolesRes.Application.Common.Exceptions;

/// <summary>
/// Excepción de aplicación que representa denegación de permisos o acceso a una operación (HTTP 403).
/// </summary>
public class AccesoDenegadoException : Exception
{
    public AccesoDenegadoException(string mensaje = MensajesCatalogo.MSG_39)
        : base(mensaje)
    {
    }

    public AccesoDenegadoException(string mensaje, Exception? innerException)
        : base(mensaje, innerException)
    {
    }
}
