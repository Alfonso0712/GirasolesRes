namespace GirasolesRes.Application.Common.Exceptions;

public class CobroConflictException : Exception
{
    public string Codigo { get; }
    public decimal? TotalActual { get; }

    public CobroConflictException(string codigo, string mensaje, decimal? totalActual = null)
        : base(mensaje)
    {
        Codigo = codigo;
        TotalActual = totalActual;
    }
}
