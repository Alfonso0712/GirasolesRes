namespace GirasolesRes.Application.Common;

/// <summary>
/// Representa el resultado de una operación de negocio sin valor de retorno (Result Pattern).
/// </summary>
public class Result
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public string? Error { get; }
    public string? ErrorCode { get; }

    protected Result(bool isSuccess, string? error, string? errorCode)
    {
        if (isSuccess && !string.IsNullOrEmpty(error))
        {
            throw new InvalidOperationException("Un resultado exitoso no puede contener un mensaje de error.");
        }

        if (!isSuccess && string.IsNullOrEmpty(error))
        {
            throw new InvalidOperationException("Un resultado fallido debe contener un mensaje de error.");
        }

        IsSuccess = isSuccess;
        Error = error;
        ErrorCode = errorCode;
    }

    public static Result Success() => new(true, null, null);

    public static Result Failure(string error, string? errorCode = null) =>
        new(false, error, errorCode);
}

/// <summary>
/// Representa el resultado tipado de una operación de negocio con valor de retorno (Result Pattern).
/// </summary>
/// <typeparam name="T">Tipo del valor transportado en caso de éxito.</typeparam>
public class Result<T> : Result
{
    public T? Value { get; }

    private Result(T value) : base(true, null, null)
    {
        Value = value;
    }

    private Result(string error, string? errorCode) : base(false, error, errorCode)
    {
        Value = default;
    }

    public static Result<T> Success(T value) => new(value);

    public static new Result<T> Failure(string error, string? errorCode = null) =>
        new(error, errorCode);

    public static implicit operator Result<T>(T value) => Success(value);
}
