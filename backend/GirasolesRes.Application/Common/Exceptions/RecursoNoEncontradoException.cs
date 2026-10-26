namespace GirasolesRes.Application.Common.Exceptions;

/// <summary>
/// Excepción de aplicación que representa la no existencia de un recurso solicitado (HTTP 404).
/// </summary>
public class RecursoNoEncontradoException : Exception
{
    public RecursoNoEncontradoException(string mensaje)
        : base(mensaje)
    {
    }

    public RecursoNoEncontradoException(string mensaje, Exception? innerException)
        : base(mensaje, innerException)
    {
    }
}
