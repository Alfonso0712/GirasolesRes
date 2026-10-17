namespace GirasolesRes.Application.Common;

public class AuthResult<T>
{
    public bool Exitoso { get; private set; }
    public T? Datos { get; private set; }
    public int CodigoEstado { get; private set; }
    public string? MensajeError { get; private set; }
    public Dictionary<string, string>? ErroresCampos { get; private set; }

    private AuthResult() { }

    public static AuthResult<T> Ok(T datos, int codigoEstado = 200)
    {
        return new AuthResult<T>
        {
            Exitoso = true,
            Datos = datos,
            CodigoEstado = codigoEstado
        };
    }

    public static AuthResult<T> Falla(int codigoEstado, string mensajeError, Dictionary<string, string>? erroresCampos = null)
    {
        return new AuthResult<T>
        {
            Exitoso = false,
            CodigoEstado = codigoEstado,
            MensajeError = mensajeError,
            ErroresCampos = erroresCampos
        };
    }
}
