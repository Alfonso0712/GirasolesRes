using System.Text.Json;
using GirasolesRes.Application.Common;
using GirasolesRes.Application.Common.Exceptions;
using GirasolesRes.Domain.Exceptions;

namespace GirasolesRes.API.Middleware;

/// <summary>
/// Middleware global para la captura, registro y serialización homogénea de excepciones (Clean Architecture).
/// Garantiza que ninguna excepción no controlada filtre detalles internos al cliente (500) y que los errores
/// de dominio y aplicación devuelvan el código HTTP y contrato JSON esperado por el frontend.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public ExceptionHandlingMiddleware(RequestDelegate _next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        this._next = _next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        if (context.Response.HasStarted)
        {
            _logger.LogWarning("La respuesta HTTP ya ha comenzado. No se puede serializar el error de excepción global.");
            return;
        }

        int statusCode;
        object responseBody;

        switch (exception)
        {
            case RecursoNoEncontradoException ex:
                statusCode = StatusCodes.Status404NotFound;
                responseBody = new
                {
                    message = ex.Message,
                    error = ex.Message,
                    mensaje = ex.Message
                };
                break;

            case ReglaNegocioException ex:
                statusCode = StatusCodes.Status400BadRequest;
                responseBody = ex.Codigo != null || ex.Campo != null
                    ? new
                    {
                        codigo = ex.Codigo,
                        campo = ex.Campo,
                        message = ex.Message,
                        error = ex.Message,
                        mensaje = ex.Message
                    }
                    : new
                    {
                        message = ex.Message,
                        error = ex.Message,
                        mensaje = ex.Message
                    };
                break;

            case ConflictoException ex:
                statusCode = StatusCodes.Status409Conflict;
                responseBody = ex.Codigo != null
                    ? new
                    {
                        codigo = ex.Codigo,
                        message = ex.Message,
                        error = ex.Message,
                        mensaje = ex.Message
                    }
                    : new
                    {
                        message = ex.Message,
                        error = ex.Message,
                        mensaje = ex.Message
                    };
                break;

            case CobroConflictException ex:
                statusCode = StatusCodes.Status409Conflict;
                responseBody = new
                {
                    codigo = ex.Codigo,
                    message = ex.Message,
                    mensaje = ex.Message,
                    totalActual = ex.TotalActual
                };
                break;

            case PedidoConflictException ex:
                statusCode = StatusCodes.Status409Conflict;
                responseBody = new
                {
                    codigo = ex.Codigo,
                    message = ex.Message,
                    mensaje = ex.Message,
                    productosAgotados = ex.ProductosAgotados
                };
                break;

            case CajaMontoInvalidoException ex:
                statusCode = StatusCodes.Status400BadRequest;
                responseBody = new
                {
                    codigo = ex.Codigo,
                    message = ex.Message,
                    mensaje = ex.Message,
                    campo = ex.Campo
                };
                break;

            case CajaObservacionInvalidaException ex:
                statusCode = StatusCodes.Status400BadRequest;
                responseBody = new
                {
                    codigo = ex.Codigo,
                    message = ex.Message,
                    mensaje = ex.Message
                };
                break;

            case CajaYaAbiertaException ex:
                statusCode = StatusCodes.Status409Conflict;
                responseBody = new
                {
                    codigo = ex.Codigo,
                    message = ex.Message,
                    mensaje = ex.Message,
                    cajaIdExistente = ex.CajaIdExistente
                };
                break;

            case CajaAnteriorSinCerrarException ex:
                statusCode = StatusCodes.Status409Conflict;
                responseBody = new
                {
                    codigo = ex.Codigo,
                    message = ex.Message,
                    mensaje = ex.Message,
                    cajaId = ex.CajaId,
                    fechaApertura = ex.FechaAperturaUtc
                };
                break;

            case CajaPedidosPendientesException ex:
                statusCode = StatusCodes.Status409Conflict;
                responseBody = new
                {
                    codigo = ex.Codigo,
                    message = ex.Message,
                    mensaje = ex.Message,
                    cantidadPedidosPendientes = ex.CantidadPedidosPendientes
                };
                break;

            case CajaConcurrenciaException ex:
                statusCode = StatusCodes.Status409Conflict;
                responseBody = new
                {
                    codigo = ex.Codigo,
                    message = ex.Message,
                    mensaje = ex.Message,
                    efectivoEsperadoActual = ex.EfectivoEsperadoActual,
                    efectivoEsperadoMostrado = ex.EfectivoEsperadoMostrado
                };
                break;

            case CajaDomainException ex:
                statusCode = StatusCodes.Status409Conflict;
                responseBody = new
                {
                    codigo = ex.Codigo,
                    message = ex.Message,
                    mensaje = ex.Message
                };
                break;

            case AccesoDenegadoException:
            case UnauthorizedAccessException:
                statusCode = StatusCodes.Status403Forbidden;
                responseBody = new
                {
                    success = false,
                    message = MensajesCatalogo.MSG_39,
                    error = MensajesCatalogo.MSG_39
                };
                break;

            default:
                _logger.LogError(exception, "Error no controlado procesando la solicitud HTTP {Method} {Path}", context.Request.Method, context.Request.Path);
                statusCode = StatusCodes.Status500InternalServerError;
                responseBody = new
                {
                    success = false,
                    message = "Error interno del servidor.",
                    error = "Error interno del servidor."
                };
                break;
        }

        context.Response.Clear();
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json; charset=utf-8";

        var json = JsonSerializer.Serialize(responseBody, JsonOptions);
        await context.Response.WriteAsync(json);
    }
}
