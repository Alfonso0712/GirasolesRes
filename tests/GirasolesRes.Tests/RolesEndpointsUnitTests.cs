using System.Security.Claims;
using GirasolesRes.API.Controllers;
using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Cobros;
using GirasolesRes.Application.DTOs.Comandas;
using GirasolesRes.Application.DTOs.Consultas;
using GirasolesRes.Application.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace GirasolesRes.Tests;

public class RolesEndpointsUnitTests
{
    private static ControllerContext CrearContextoConRol(string rol)
    {
        return new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Role, rol),
                    new Claim(ClaimTypes.Name, $"usuario_{rol}"),
                    new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString())
                }, "TestAuth"))
            }
        };
    }

    [Theory]
    [InlineData("Cocinero", StatusCodes.Status200OK)]
    [InlineData("Cajero", StatusCodes.Status403Forbidden)]
    [InlineData("Mozo", StatusCodes.Status403Forbidden)]
    [InlineData("Administrador", StatusCodes.Status403Forbidden)]
    public async Task Comandas_ListarComandas_SoloCocinero(string rol, int statusCodeEsperado)
    {
        var mockService = new Mock<IComandaService>();
        mockService.Setup(s => s.ListarComandasAsync(It.IsAny<string?>()))
            .ReturnsAsync(new ListarComandasResponseDto());

        var mockLogger = new Mock<ILogger<ComandasController>>();
        var controller = new ComandasController(mockService.Object, mockLogger.Object)
        {
            ControllerContext = CrearContextoConRol(rol)
        };

        var result = await controller.ListarComandas(null);

        if (statusCodeEsperado == StatusCodes.Status200OK)
        {
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);
        }
        else
        {
            var objResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(statusCodeEsperado, objResult.StatusCode);
        }
    }

    [Theory]
    [InlineData("Cocinero", StatusCodes.Status200OK)]
    [InlineData("Cajero", StatusCodes.Status403Forbidden)]
    [InlineData("Mozo", StatusCodes.Status403Forbidden)]
    [InlineData("Administrador", StatusCodes.Status403Forbidden)]
    public async Task Comandas_ActualizarEstado_SoloCocinero(string rol, int statusCodeEsperado)
    {
        var mockService = new Mock<IComandaService>();
        mockService.Setup(s => s.ActualizarEstadoAsync(It.IsAny<Guid>(), It.IsAny<ActualizarEstadoComandaRequest>(), It.IsAny<string>()))
            .ReturnsAsync(new ActualizarEstadoComandaResponse());

        var mockLogger = new Mock<ILogger<ComandasController>>();
        var controller = new ComandasController(mockService.Object, mockLogger.Object)
        {
            ControllerContext = CrearContextoConRol(rol)
        };

        var req = new ActualizarEstadoComandaRequest { Estado = "enPreparacion" };
        var result = await controller.ActualizarEstado(Guid.NewGuid(), req);

        if (statusCodeEsperado == StatusCodes.Status200OK)
        {
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);
        }
        else
        {
            var objResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(statusCodeEsperado, objResult.StatusCode);
        }
    }

    [Theory]
    [InlineData("Cocinero", StatusCodes.Status200OK)]
    [InlineData("Cajero", StatusCodes.Status403Forbidden)]
    [InlineData("Mozo", StatusCodes.Status403Forbidden)]
    [InlineData("Administrador", StatusCodes.Status403Forbidden)]
    public async Task Comandas_DeshacerEstado_SoloCocinero(string rol, int statusCodeEsperado)
    {
        var mockService = new Mock<IComandaService>();
        mockService.Setup(s => s.DeshacerEstadoAsync(It.IsAny<Guid>(), It.IsAny<string>()))
            .ReturnsAsync(new DeshacerEstadoComandaResponse());

        var mockLogger = new Mock<ILogger<ComandasController>>();
        var controller = new ComandasController(mockService.Object, mockLogger.Object)
        {
            ControllerContext = CrearContextoConRol(rol)
        };

        var result = await controller.DeshacerEstado(Guid.NewGuid());

        if (statusCodeEsperado == StatusCodes.Status200OK)
        {
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);
        }
        else
        {
            var objResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(statusCodeEsperado, objResult.StatusCode);
        }
    }

    [Theory]
    [InlineData("Cajero", StatusCodes.Status200OK)]
    [InlineData("Cocinero", StatusCodes.Status403Forbidden)]
    [InlineData("Mozo", StatusCodes.Status403Forbidden)]
    [InlineData("Administrador", StatusCodes.Status403Forbidden)]
    public async Task Cobros_ObtenerPendientes_SoloCajero(string rol, int statusCodeEsperado)
    {
        var mockService = new Mock<ICobroService>();
        mockService.Setup(s => s.ObtenerPedidosPendientesCobroAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PedidoPendienteCobroDto>());

        var mockLogger = new Mock<ILogger<CobrosController>>();
        var controller = new CobrosController(mockService.Object, mockLogger.Object)
        {
            ControllerContext = CrearContextoConRol(rol)
        };

        var result = await controller.ObtenerPendientesCobro(CancellationToken.None);

        if (statusCodeEsperado == StatusCodes.Status200OK)
        {
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);
        }
        else
        {
            var objResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(statusCodeEsperado, objResult.StatusCode);
        }
    }

    [Theory]
    [InlineData("Cajero", StatusCodes.Status200OK)]
    [InlineData("Cocinero", StatusCodes.Status403Forbidden)]
    [InlineData("Mozo", StatusCodes.Status403Forbidden)]
    [InlineData("Administrador", StatusCodes.Status403Forbidden)]
    public async Task Consultas_Dni_SoloCajero(string rol, int statusCodeEsperado)
    {
        var mockService = new Mock<IConsultaDocumentoService>();
        mockService.Setup(s => s.ConsultarDniAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ConsultaDniResultadoDto("12345678", "Juan", "Perez", "Gomez", "Juan Perez Gomez"));

        var mockLogger = new Mock<ILogger<ConsultasController>>();
        var controller = new ConsultasController(mockService.Object, mockLogger.Object)
        {
            ControllerContext = CrearContextoConRol(rol)
        };

        var result = await controller.ConsultarDni("12345678", CancellationToken.None);

        if (statusCodeEsperado == StatusCodes.Status200OK)
        {
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);
        }
        else
        {
            var objResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(statusCodeEsperado, objResult.StatusCode);
        }
    }

    [Theory]
    [InlineData("Cajero", StatusCodes.Status200OK)]
    [InlineData("Cocinero", StatusCodes.Status403Forbidden)]
    [InlineData("Mozo", StatusCodes.Status403Forbidden)]
    [InlineData("Administrador", StatusCodes.Status403Forbidden)]
    public async Task Consultas_Ruc_SoloCajero(string rol, int statusCodeEsperado)
    {
        var mockService = new Mock<IConsultaDocumentoService>();
        mockService.Setup(s => s.ConsultarRucAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ConsultaRucResultadoDto("20123456789", "EMPRESA SAC", "ACTIVO", "HABIDO", "Av. Principal 123", "LIMA", "LIMA", "LIMA"));

        var mockLogger = new Mock<ILogger<ConsultasController>>();
        var controller = new ConsultasController(mockService.Object, mockLogger.Object)
        {
            ControllerContext = CrearContextoConRol(rol)
        };

        var result = await controller.ConsultarRuc("20123456789", CancellationToken.None);

        if (statusCodeEsperado == StatusCodes.Status200OK)
        {
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);
        }
        else
        {
            var objResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(statusCodeEsperado, objResult.StatusCode);
        }
    }
}
