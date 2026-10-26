using System.Reflection;
using System.Security.Claims;
using GirasolesRes.API.Controllers;
using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Cobros;
using GirasolesRes.Application.DTOs.Comandas;
using GirasolesRes.Application.DTOs.Consultas;
using GirasolesRes.Application.DTOs.Pedidos;
using GirasolesRes.Application.DTOs.Reportes;
using GirasolesRes.Application.DTOs.Ventas;
using GirasolesRes.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace GirasolesRes.Tests;

public class RolesEndpointsUnitTests
{
    private static ControllerContext CrearContextoConRol(string? rol)
    {
        if (rol == null)
        {
            // Sin token / anónimo
            return new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity())
                }
            };
        }

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

    #region Verificaciones Declarativas de Atributos [Authorize(Roles = "...")]

    [Fact]
    public void CobrosController_TieneAtributoAuthorize_ConRolCajero()
    {
        var attr = typeof(CobrosController).GetCustomAttribute<AuthorizeAttribute>();
        Assert.NotNull(attr);
        Assert.Equal("Cajero", attr.Roles);
    }

    [Fact]
    public void ComandasController_TieneAtributoAuthorize_ConRolCocinero()
    {
        var attr = typeof(ComandasController).GetCustomAttribute<AuthorizeAttribute>();
        Assert.NotNull(attr);
        Assert.Equal("Cocinero", attr.Roles);
    }

    [Fact]
    public void ConsultasController_TieneAtributoAuthorize_ConRolCajero()
    {
        var attr = typeof(ConsultasController).GetCustomAttribute<AuthorizeAttribute>();
        Assert.NotNull(attr);
        Assert.Equal("Cajero", attr.Roles);
    }

    [Fact]
    public void AvisosController_TieneAtributoAuthorize_ConRolesMozoCajeroAdmin()
    {
        var attr = typeof(AvisosController).GetCustomAttribute<AuthorizeAttribute>();
        Assert.NotNull(attr);
        Assert.Equal("Mozo,Cajero,Administrador", attr.Roles);
    }

    [Fact]
    public void ReportesController_TieneAtributoAuthorize_ConRolAdministrador()
    {
        var attr = typeof(ReportesController).GetCustomAttribute<AuthorizeAttribute>();
        Assert.NotNull(attr);
        Assert.Equal("Administrador", attr.Roles);
    }

    [Fact]
    public void VentasController_TieneAtributoAuthorize_ConRolesCajeroAdmin()
    {
        var classAttr = typeof(VentasController).GetCustomAttribute<AuthorizeAttribute>();
        Assert.NotNull(classAttr);
        Assert.Equal("Cajero,Administrador", classAttr.Roles);

        var anularMethod = typeof(VentasController).GetMethod(nameof(VentasController.AnularVenta));
        var anularAttr = anularMethod?.GetCustomAttribute<AuthorizeAttribute>();
        Assert.NotNull(anularAttr);
        Assert.Equal("Administrador", anularAttr.Roles);
    }

    [Fact]
    public void PedidosController_AccionesTienenAtributosAuthorizeDeclarativos()
    {
        var registrarMesa = typeof(PedidosController).GetMethod(nameof(PedidosController.RegistrarPedidoMesa));
        Assert.Equal("Mozo,Administrador", registrarMesa?.GetCustomAttribute<AuthorizeAttribute>()?.Roles);

        var registrarLlevar = typeof(PedidosController).GetMethod(nameof(PedidosController.RegistrarPedidoLlevar));
        Assert.Equal("Cajero", registrarLlevar?.GetCustomAttribute<AuthorizeAttribute>()?.Roles);

        var obtenerPorId = typeof(PedidosController).GetMethod(nameof(PedidosController.ObtenerPorId));
        Assert.Equal("Mozo,Cajero,Administrador", obtenerPorId?.GetCustomAttribute<AuthorizeAttribute>()?.Roles);

        var modificarPedido = typeof(PedidosController).GetMethod(nameof(PedidosController.ModificarPedido));
        Assert.Equal("Mozo,Cajero", modificarPedido?.GetCustomAttribute<AuthorizeAttribute>()?.Roles);

        var anularPedido = typeof(PedidosController).GetMethod(nameof(PedidosController.AnularPedido));
        Assert.Equal("Mozo,Cajero,Administrador", anularPedido?.GetCustomAttribute<AuthorizeAttribute>()?.Roles);

        var agregarLineas = typeof(PedidosController).GetMethod(nameof(PedidosController.AgregarLineas));
        Assert.Equal("Mozo,Administrador", agregarLineas?.GetCustomAttribute<AuthorizeAttribute>()?.Roles);
    }

    #endregion

    #region ComandasController

    [Theory]
    [InlineData("Cocinero", StatusCodes.Status200OK)]
    [InlineData("Cajero", StatusCodes.Status403Forbidden)]
    [InlineData("Mozo", StatusCodes.Status403Forbidden)]
    [InlineData("Administrador", StatusCodes.Status403Forbidden)]
    [InlineData(null, StatusCodes.Status401Unauthorized)]
    public async Task Comandas_ListarComandas_RolesYAnonimo(string? rol, int statusCodeEsperado)
    {
        var mockService = new Mock<IComandaService>();
        mockService.Setup(s => s.ListarComandasAsync(It.IsAny<string?>()))
            .ReturnsAsync(new ListarComandasResponseDto());

        var mockLogger = new Mock<ILogger<ComandasController>>();
        var controller = new ComandasController(mockService.Object, mockLogger.Object)
        {
            ControllerContext = CrearContextoConRol(rol)
        };

        var result = await TestAuthorizationHelper.InvocarConAutorizacionAsync(
            controller,
            nameof(controller.ListarComandas),
            () => controller.ListarComandas(null));

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
    [InlineData(null, StatusCodes.Status401Unauthorized)]
    public async Task Comandas_ActualizarEstado_RolesYAnonimo(string? rol, int statusCodeEsperado)
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
        var result = await TestAuthorizationHelper.InvocarConAutorizacionAsync(
            controller,
            nameof(controller.ActualizarEstado),
            () => controller.ActualizarEstado(Guid.NewGuid(), req));

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
    [InlineData(null, StatusCodes.Status401Unauthorized)]
    public async Task Comandas_DeshacerEstado_RolesYAnonimo(string? rol, int statusCodeEsperado)
    {
        var mockService = new Mock<IComandaService>();
        mockService.Setup(s => s.DeshacerEstadoAsync(It.IsAny<Guid>(), It.IsAny<string>()))
            .ReturnsAsync(new DeshacerEstadoComandaResponse());

        var mockLogger = new Mock<ILogger<ComandasController>>();
        var controller = new ComandasController(mockService.Object, mockLogger.Object)
        {
            ControllerContext = CrearContextoConRol(rol)
        };

        var result = await TestAuthorizationHelper.InvocarConAutorizacionAsync(
            controller,
            nameof(controller.DeshacerEstado),
            () => controller.DeshacerEstado(Guid.NewGuid()));

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

    #endregion

    #region CobrosController

    [Theory]
    [InlineData("Cajero", StatusCodes.Status200OK)]
    [InlineData("Cocinero", StatusCodes.Status403Forbidden)]
    [InlineData("Mozo", StatusCodes.Status403Forbidden)]
    [InlineData("Administrador", StatusCodes.Status403Forbidden)]
    [InlineData(null, StatusCodes.Status401Unauthorized)]
    public async Task Cobros_ObtenerPendientes_RolesYAnonimo(string? rol, int statusCodeEsperado)
    {
        var mockService = new Mock<ICobroService>();
        mockService.Setup(s => s.ObtenerPedidosPendientesCobroAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PedidoPendienteCobroDto>());

        var mockLogger = new Mock<ILogger<CobrosController>>();
        var controller = new CobrosController(mockService.Object, mockLogger.Object)
        {
            ControllerContext = CrearContextoConRol(rol)
        };

        var result = await TestAuthorizationHelper.InvocarConAutorizacionAsync(
            controller,
            nameof(controller.ObtenerPendientesCobro),
            () => controller.ObtenerPendientesCobro(CancellationToken.None));

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

    #endregion

    #region ConsultasController

    [Theory]
    [InlineData("Cajero", StatusCodes.Status200OK)]
    [InlineData("Cocinero", StatusCodes.Status403Forbidden)]
    [InlineData("Mozo", StatusCodes.Status403Forbidden)]
    [InlineData("Administrador", StatusCodes.Status403Forbidden)]
    [InlineData(null, StatusCodes.Status401Unauthorized)]
    public async Task Consultas_Dni_RolesYAnonimo(string? rol, int statusCodeEsperado)
    {
        var mockService = new Mock<IConsultaDocumentoService>();
        mockService.Setup(s => s.ConsultarDniAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ConsultaDniResultadoDto("12345678", "Juan", "Perez", "Gomez", "Juan Perez Gomez"));

        var mockLogger = new Mock<ILogger<ConsultasController>>();
        var controller = new ConsultasController(mockService.Object, mockLogger.Object)
        {
            ControllerContext = CrearContextoConRol(rol)
        };

        var result = await TestAuthorizationHelper.InvocarConAutorizacionAsync(
            controller,
            nameof(controller.ConsultarDni),
            () => controller.ConsultarDni("12345678", CancellationToken.None));

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
    [InlineData(null, StatusCodes.Status401Unauthorized)]
    public async Task Consultas_Ruc_RolesYAnonimo(string? rol, int statusCodeEsperado)
    {
        var mockService = new Mock<IConsultaDocumentoService>();
        mockService.Setup(s => s.ConsultarRucAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ConsultaRucResultadoDto("20123456789", "EMPRESA SAC", "ACTIVO", "HABIDO", "Av. Principal 123", "LIMA", "LIMA", "LIMA"));

        var mockLogger = new Mock<ILogger<ConsultasController>>();
        var controller = new ConsultasController(mockService.Object, mockLogger.Object)
        {
            ControllerContext = CrearContextoConRol(rol)
        };

        var result = await TestAuthorizationHelper.InvocarConAutorizacionAsync(
            controller,
            nameof(controller.ConsultarRuc),
            () => controller.ConsultarRuc("20123456789", CancellationToken.None));

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

    #endregion

    #region AvisosController

    [Theory]
    [InlineData("Mozo", StatusCodes.Status200OK)]
    [InlineData("Cajero", StatusCodes.Status200OK)]
    [InlineData("Administrador", StatusCodes.Status200OK)]
    [InlineData("Cocinero", StatusCodes.Status403Forbidden)]
    [InlineData(null, StatusCodes.Status401Unauthorized)]
    public async Task Avisos_ObtenerAvisosPendientes_RolesYAnonimo(string? rol, int statusCodeEsperado)
    {
        var mockService = new Mock<IPedidoService>();
        mockService.Setup(s => s.ObtenerAvisosPendientesAsync(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<AvisoComandaDto>());

        var mockLogger = new Mock<ILogger<AvisosController>>();
        var controller = new AvisosController(mockService.Object, mockLogger.Object)
        {
            ControllerContext = CrearContextoConRol(rol)
        };

        var result = await TestAuthorizationHelper.InvocarConAutorizacionAsync(
            controller,
            nameof(controller.ObtenerAvisosPendientes),
            () => controller.ObtenerAvisosPendientes(CancellationToken.None));

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

    #endregion

    #region ReportesController

    [Theory]
    [InlineData("Administrador", StatusCodes.Status200OK)]
    [InlineData("Cajero", StatusCodes.Status403Forbidden)]
    [InlineData("Mozo", StatusCodes.Status403Forbidden)]
    [InlineData("Cocinero", StatusCodes.Status403Forbidden)]
    [InlineData(null, StatusCodes.Status401Unauthorized)]
    public async Task Reportes_ObtenerReporteVentas_RolesYAnonimo(string? rol, int statusCodeEsperado)
    {
        var mockService = new Mock<IReporteService>();
        mockService.Setup(s => s.ConsultarReporteVentasAsync(It.IsAny<string?>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ReporteVentasResponseDto("2026-10-01", "2026-10-26", 0, 0m, 0m, 0m, new VentasAnuladasResumenDto(0, 0m), new List<VentaPorDiaDto>()));

        var mockLogger = new Mock<ILogger<ReportesController>>();
        var controller = new ReportesController(mockService.Object, mockLogger.Object)
        {
            ControllerContext = CrearContextoConRol(rol)
        };

        var result = await TestAuthorizationHelper.InvocarConAutorizacionAsync(
            controller,
            nameof(controller.ObtenerReporteVentas),
            () => controller.ObtenerReporteVentas(null, null, CancellationToken.None));

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

    #endregion

    #region VentasController

    [Theory]
    [InlineData("Cajero", StatusCodes.Status200OK)]
    [InlineData("Administrador", StatusCodes.Status200OK)]
    [InlineData("Mozo", StatusCodes.Status403Forbidden)]
    [InlineData("Cocinero", StatusCodes.Status403Forbidden)]
    [InlineData(null, StatusCodes.Status401Unauthorized)]
    public async Task Ventas_ListarVentas_RolesYAnonimo(string? rol, int statusCodeEsperado)
    {
        var mockVentaService = new Mock<IVentaService>();
        mockVentaService.Setup(s => s.ListarVentasAsync(It.IsAny<string?>(), It.IsAny<string?>(), It.IsAny<string?>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ListarVentasResponseDto(new List<VentaItemDto>(), 0, 1, 20, new ResumenVentasDto(0, 0m, 0m, 0m, 0)));

        var mockCobroService = new Mock<ICobroService>();
        var mockLogger = new Mock<ILogger<VentasController>>();

        var controller = new VentasController(mockVentaService.Object, mockCobroService.Object, mockLogger.Object)
        {
            ControllerContext = CrearContextoConRol(rol)
        };

        var result = await TestAuthorizationHelper.InvocarConAutorizacionAsync(
            controller,
            nameof(controller.ListarVentas),
            () => controller.ListarVentas(null, null, null, 1, 20, CancellationToken.None));

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
    [InlineData("Administrador", StatusCodes.Status200OK)]
    [InlineData("Cajero", StatusCodes.Status403Forbidden)]
    [InlineData("Mozo", StatusCodes.Status403Forbidden)]
    [InlineData("Cocinero", StatusCodes.Status403Forbidden)]
    [InlineData(null, StatusCodes.Status401Unauthorized)]
    public async Task Ventas_AnularVenta_SoloAdministrador(string? rol, int statusCodeEsperado)
    {
        var mockVentaService = new Mock<IVentaService>();
        mockVentaService.Setup(s => s.AnularVentaAsync(It.IsAny<Guid>(), It.IsAny<AnularVentaRequest>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AnularVentaResponseDto("Anulada", "Anulado", "B001-000001", "Anulada correctamente"));

        var mockCobroService = new Mock<ICobroService>();
        var mockLogger = new Mock<ILogger<VentasController>>();

        var controller = new VentasController(mockVentaService.Object, mockCobroService.Object, mockLogger.Object)
        {
            ControllerContext = CrearContextoConRol(rol)
        };

        var req = new AnularVentaRequest("sol-anular-test", "Error de digitación al cobrar", "Mesa");
        var result = await TestAuthorizationHelper.InvocarConAutorizacionAsync(
            controller,
            nameof(controller.AnularVenta),
            () => controller.AnularVenta(Guid.NewGuid(), req, CancellationToken.None));

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

    #endregion

    #region PedidosController

    [Theory]
    [InlineData("Mozo", StatusCodes.Status201Created)]
    [InlineData("Administrador", StatusCodes.Status201Created)]
    [InlineData("Cajero", StatusCodes.Status403Forbidden)]
    [InlineData("Cocinero", StatusCodes.Status403Forbidden)]
    [InlineData(null, StatusCodes.Status401Unauthorized)]
    public async Task Pedidos_RegistrarPedidoMesa_RolesYAnonimo(string? rol, int statusCodeEsperado)
    {
        var mockService = new Mock<IPedidoService>();
        mockService.Setup(s => s.RegistrarPedidoMesaAsync(It.IsAny<RegistrarPedidoMesaRequest>(), It.IsAny<string>(), It.IsAny<Guid>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new RegistrarPedidoResultDto(Guid.NewGuid(), 1, 20m, Guid.NewGuid(), "Mesa 1"));

        var mockLogger = new Mock<ILogger<PedidosController>>();
        var controller = new PedidosController(mockService.Object, mockLogger.Object)
        {
            ControllerContext = CrearContextoConRol(rol)
        };

        var req = new RegistrarPedidoMesaRequest
        {
            SolicitudId = "sol-test-mesa",
            MesaId = Guid.NewGuid(),
            Lineas = new List<LineaPedidoRequest> { new() { ProductoId = Guid.NewGuid(), Cantidad = 1 } }
        };

        var result = await TestAuthorizationHelper.InvocarConAutorizacionAsync(
            controller,
            nameof(controller.RegistrarPedidoMesa),
            () => controller.RegistrarPedidoMesa(req, CancellationToken.None));

        var objResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(statusCodeEsperado, objResult.StatusCode);
    }

    [Theory]
    [InlineData("Cajero", StatusCodes.Status201Created)]
    [InlineData("Mozo", StatusCodes.Status403Forbidden)]
    [InlineData("Administrador", StatusCodes.Status403Forbidden)]
    [InlineData("Cocinero", StatusCodes.Status403Forbidden)]
    [InlineData(null, StatusCodes.Status401Unauthorized)]
    public async Task Pedidos_RegistrarPedidoLlevar_RolesYAnonimo(string? rol, int statusCodeEsperado)
    {
        var mockService = new Mock<IPedidoService>();
        mockService.Setup(s => s.RegistrarPedidoLlevarAsync(It.IsAny<RegistrarPedidoLlevarRequest>(), It.IsAny<string>(), It.IsAny<Guid>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new RegistrarPedidoLlevarResultDto(Guid.NewGuid(), 1, 25m, Guid.NewGuid()));

        var mockLogger = new Mock<ILogger<PedidosController>>();
        var controller = new PedidosController(mockService.Object, mockLogger.Object)
        {
            ControllerContext = CrearContextoConRol(rol)
        };

        var req = new RegistrarPedidoLlevarRequest
        {
            SolicitudId = "sol-test-llevar",
            Lineas = new List<LineaPedidoRequest> { new() { ProductoId = Guid.NewGuid(), Cantidad = 1 } }
        };

        var result = await TestAuthorizationHelper.InvocarConAutorizacionAsync(
            controller,
            nameof(controller.RegistrarPedidoLlevar),
            () => controller.RegistrarPedidoLlevar(req, CancellationToken.None));

        var objResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(statusCodeEsperado, objResult.StatusCode);
    }

    #endregion
}
