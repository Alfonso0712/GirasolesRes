using System.Text.Json;
using GirasolesRes.API.Middleware;
using GirasolesRes.Application.Common;
using GirasolesRes.Application.Common.Exceptions;
using GirasolesRes.Domain.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace GirasolesRes.Tests;

public class ExceptionHandlingMiddlewareUnitTests
{
    private static async Task<(int StatusCode, string ResponseBody, JsonDocument JsonDoc)> InvokeMiddlewareWithExceptionAsync(Exception ex)
    {
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        var loggerMock = new Mock<ILogger<ExceptionHandlingMiddleware>>();
        var middleware = new ExceptionHandlingMiddleware(_ => throw ex, loggerMock.Object);

        await middleware.InvokeAsync(context);

        context.Response.Body.Seek(0, SeekOrigin.Begin);
        using var reader = new StreamReader(context.Response.Body);
        var body = await reader.ReadToEndAsync();
        var jsonDoc = JsonDocument.Parse(body);
        return (context.Response.StatusCode, body, jsonDoc);
    }

    [Fact]
    public async Task RecursoNoEncontradoException_DebeRetornar404ConFormatoEsperado()
    {
        var ex = new RecursoNoEncontradoException("El pedido solicitado no existe.");

        var (status, _, json) = await InvokeMiddlewareWithExceptionAsync(ex);

        Assert.Equal(StatusCodes.Status404NotFound, status);
        Assert.Equal("El pedido solicitado no existe.", json.RootElement.GetProperty("message").GetString());
        Assert.Equal("El pedido solicitado no existe.", json.RootElement.GetProperty("error").GetString());
        Assert.Equal("El pedido solicitado no existe.", json.RootElement.GetProperty("mensaje").GetString());
    }

    [Fact]
    public async Task ReglaNegocioException_DebeRetornar400ConMensajeYCamposOpcionales()
    {
        var ex = new ReglaNegocioException("Monto inválido.", "monto_invalido", "montoRecibido");

        var (status, _, json) = await InvokeMiddlewareWithExceptionAsync(ex);

        Assert.Equal(StatusCodes.Status400BadRequest, status);
        Assert.Equal("monto_invalido", json.RootElement.GetProperty("codigo").GetString());
        Assert.Equal("montoRecibido", json.RootElement.GetProperty("campo").GetString());
        Assert.Equal("Monto inválido.", json.RootElement.GetProperty("message").GetString());
        Assert.Equal("Monto inválido.", json.RootElement.GetProperty("error").GetString());
    }

    [Fact]
    public async Task ConflictoException_DebeRetornar409ConCodigoYMensaje()
    {
        var ex = new ConflictoException("Solo una comanda en estado Pendiente puede pasar a En preparación.", "estado_invalido");

        var (status, _, json) = await InvokeMiddlewareWithExceptionAsync(ex);

        Assert.Equal(StatusCodes.Status409Conflict, status);
        Assert.Equal("estado_invalido", json.RootElement.GetProperty("codigo").GetString());
        Assert.Equal("Solo una comanda en estado Pendiente puede pasar a En preparación.", json.RootElement.GetProperty("message").GetString());
        Assert.Equal("Solo una comanda en estado Pendiente puede pasar a En preparación.", json.RootElement.GetProperty("mensaje").GetString());
    }

    [Fact]
    public async Task CobroConflictException_DebeRetornar409ConTotalActualYCodigo()
    {
        var ex = new CobroConflictException("total_cambio", "El total del pedido cambió a S/ 85.00.", 85.00m);

        var (status, _, json) = await InvokeMiddlewareWithExceptionAsync(ex);

        Assert.Equal(StatusCodes.Status409Conflict, status);
        Assert.Equal("total_cambio", json.RootElement.GetProperty("codigo").GetString());
        Assert.Equal("El total del pedido cambió a S/ 85.00.", json.RootElement.GetProperty("message").GetString());
        Assert.Equal(85.00m, json.RootElement.GetProperty("totalActual").GetDecimal());
    }

    [Fact]
    public async Task PedidoConflictException_DebeRetornar409ConListaDeProductosAgotados()
    {
        var agotadoId = Guid.NewGuid();
        var ex = new PedidoConflictException("producto_agotado", "Uno o más productos seleccionados ya no cuentan con stock.", new[] { agotadoId });

        var (status, _, json) = await InvokeMiddlewareWithExceptionAsync(ex);

        Assert.Equal(StatusCodes.Status409Conflict, status);
        Assert.Equal("producto_agotado", json.RootElement.GetProperty("codigo").GetString());
        Assert.Equal("Uno o más productos seleccionados ya no cuentan con stock.", json.RootElement.GetProperty("message").GetString());
        Assert.Single(json.RootElement.GetProperty("productosAgotados").EnumerateArray());
        Assert.Equal(agotadoId.ToString(), json.RootElement.GetProperty("productosAgotados")[0].GetString());
    }

    [Fact]
    public async Task CajaExceptions_MontoInvalido_DebeRetornar400ConDetalle()
    {
        var ex = new CajaMontoInvalidoException(150000m, "MontoInicial", MensajesCatalogo.MSG_171);

        var (status, _, json) = await InvokeMiddlewareWithExceptionAsync(ex);

        Assert.Equal(StatusCodes.Status400BadRequest, status);
        Assert.Equal("monto_invalido", json.RootElement.GetProperty("codigo").GetString());
        Assert.Equal("MontoInicial", json.RootElement.GetProperty("campo").GetString());
        Assert.Equal(MensajesCatalogo.MSG_171, json.RootElement.GetProperty("message").GetString());
    }

    [Fact]
    public async Task CajaExceptions_CajaYaAbierta_DebeRetornar409ConCajaIdExistente()
    {
        var cajaId = Guid.NewGuid();
        var ex = new CajaYaAbiertaException("Ya existe una caja abierta.", cajaId);

        var (status, _, json) = await InvokeMiddlewareWithExceptionAsync(ex);

        Assert.Equal(StatusCodes.Status409Conflict, status);
        Assert.Equal("caja_ya_abierta", json.RootElement.GetProperty("codigo").GetString());
        Assert.Equal(cajaId.ToString(), json.RootElement.GetProperty("cajaIdExistente").GetString());
    }

    [Fact]
    public async Task UnauthorizedAccessException_DebeRetornar403ConMSG39()
    {
        var ex = new UnauthorizedAccessException("Cualquier mensaje interno");

        var (status, _, json) = await InvokeMiddlewareWithExceptionAsync(ex);

        Assert.Equal(StatusCodes.Status403Forbidden, status);
        Assert.False(json.RootElement.GetProperty("success").GetBoolean());
        Assert.Equal(MensajesCatalogo.MSG_39, json.RootElement.GetProperty("message").GetString());
        Assert.Equal(MensajesCatalogo.MSG_39, json.RootElement.GetProperty("error").GetString());
    }

    [Fact]
    public async Task AccesoDenegadoException_DebeRetornar403ConMSG39()
    {
        var ex = new AccesoDenegadoException();

        var (status, _, json) = await InvokeMiddlewareWithExceptionAsync(ex);

        Assert.Equal(StatusCodes.Status403Forbidden, status);
        Assert.False(json.RootElement.GetProperty("success").GetBoolean());
        Assert.Equal(MensajesCatalogo.MSG_39, json.RootElement.GetProperty("message").GetString());
        Assert.Equal(MensajesCatalogo.MSG_39, json.RootElement.GetProperty("error").GetString());
    }

    [Fact]
    public async Task GenericaException_DebeRetornar500SinExponerDetalleInterno()
    {
        var ex = new InvalidOperationException("FATAL: Error de conexión a la base de datos postgres en el host 192.168.1.50");

        var (status, body, json) = await InvokeMiddlewareWithExceptionAsync(ex);

        Assert.Equal(StatusCodes.Status500InternalServerError, status);
        Assert.False(json.RootElement.GetProperty("success").GetBoolean());
        Assert.Equal("Error interno del servidor.", json.RootElement.GetProperty("message").GetString());
        Assert.Equal("Error interno del servidor.", json.RootElement.GetProperty("error").GetString());
        Assert.DoesNotContain("postgres", body);
        Assert.DoesNotContain("192.168.1.50", body);
    }

    [Fact]
    public async Task ArgumentExceptionGenerica_NoDebeMapearseA400_SinoA500Generico()
    {
        // Requisito estricto: InvalidOperationException y ArgumentException genéricas no deben mapearse a 400
        var ex = new ArgumentException("Error interno de argumento del framework .NET");

        var (status, body, json) = await InvokeMiddlewareWithExceptionAsync(ex);

        Assert.Equal(StatusCodes.Status500InternalServerError, status);
        Assert.Equal("Error interno del servidor.", json.RootElement.GetProperty("message").GetString());
        Assert.DoesNotContain("framework .NET", body);
    }
}
