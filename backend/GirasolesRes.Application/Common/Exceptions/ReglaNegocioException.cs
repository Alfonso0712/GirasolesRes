namespace GirasolesRes.Application.Common.Exceptions;

/// <summary>
/// Excepción de aplicación que representa el incumplimiento de una regla de negocio o validación de dominio (HTTP 400).
/// </summary>
public class ReglaNegocioException : Exception
{
    public string? Codigo { get; }
    public string? Campo { get; }

    public ReglaNegocioException(string mensaje, string? codigo = null, string? campo = null)
        : base(mensaje)
    {
        Codigo = codigo;
        Campo = campo;
    }

    public ReglaNegocioException(string mensaje, Exception? innerException)
        : base(mensaje, innerException)
    {
    }
}
