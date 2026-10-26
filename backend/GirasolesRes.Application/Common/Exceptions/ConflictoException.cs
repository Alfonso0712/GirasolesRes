namespace GirasolesRes.Application.Common.Exceptions;

/// <summary>
/// Excepción de aplicación que representa un conflicto de estado o concurrencia con las reglas del sistema (HTTP 409).
/// </summary>
public class ConflictoException : Exception
{
    public string? Codigo { get; }

    public ConflictoException(string mensaje, string? codigo = null)
        : base(mensaje)
    {
        Codigo = codigo;
    }

    public ConflictoException(string mensaje, Exception? innerException)
        : base(mensaje, innerException)
    {
    }
}
