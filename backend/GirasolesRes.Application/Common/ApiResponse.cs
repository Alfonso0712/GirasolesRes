namespace GirasolesRes.Application.Common;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public object? Errors { get; set; }
    public string? Detail { get; set; }

    public static ApiResponse<T> Exitoso(T data, string mensaje = "Operación completada con éxito.")
    {
        return new ApiResponse<T>
        {
            Success = true,
            Message = mensaje,
            Data = data
        };
    }

    public static ApiResponse<T> Fallido(string mensaje, object? errores = null, string? detalle = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = mensaje,
            Errors = errores,
            Detail = detalle
        };
    }
}
