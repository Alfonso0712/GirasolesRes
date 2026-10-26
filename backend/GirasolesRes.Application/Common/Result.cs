namespace GirasolesRes.Application.Common;

/// <summary>
/// Representa el resultado de una operación de negocio sin valor de retorno (Result Pattern - Clean Architecture).
/// </summary>
public class Result
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public string? Error { get; }
    public string? ErrorCode { get; }
    public string? Detail => ErrorCode;
    public string Message { get; }
    public object? Errors { get; }

    protected Result(bool isSuccess, string? error, string? errorCode, string? message = null, object? errors = null)
    {
        IsSuccess = isSuccess;
        Error = error;
        ErrorCode = errorCode;
        Message = message ?? error ?? (isSuccess ? "Operación completada con éxito." : "Error en la operación.");
        Errors = errors;
    }

    public static Result Success(string message = "Operación completada con éxito.") =>
        new(true, null, null, message);

    public static Result Failure(string error, string? errorCode = null, object? errors = null) =>
        new(false, error, errorCode, error, errors);

    public static Result Exitoso(string message = "Operación completada con éxito.") =>
        Success(message);

    public static Result Fallido(string error, object? errors = null, string? detalle = null) =>
        Failure(error, detalle, errors);
}

/// <summary>
/// Representa el resultado tipado de una operación de negocio con valor de retorno (Result Pattern - Clean Architecture).
/// </summary>
/// <typeparam name="T">Tipo del valor transportado en caso de éxito.</typeparam>
public class Result<T> : Result
{
    public T? Value { get; }

    /// <summary>
    /// Propiedad de compatibilidad semántica con contratos que consumen Data.
    /// </summary>
    public T? Data => Value;

    protected Result(T? value, bool isSuccess, string? error, string? errorCode, string? message = null, object? errors = null)
        : base(isSuccess, error, errorCode, message, errors)
    {
        Value = value;
    }

    public static Result<T> Success(T value, string message = "Operación completada con éxito.") =>
        new(value, true, null, null, message);

    public static new Result<T> Failure(string error, string? errorCode = null, object? errors = null) =>
        new(default, false, error, errorCode, error, errors);

    public static implicit operator Result<T>(T value) => Success(value);

    // Métodos fábrica de compatibilidad con la transición desde ApiResponse
    public static Result<T> Exitoso(T data, string message = "Operación completada con éxito.") =>
        Success(data, message);

    public static new Result<T> Fallido(string message, object? errores = null, string? detalle = null) =>
        Failure(message, detalle, errores);
}
