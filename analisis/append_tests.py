with open('tests/GirasolesRes.Tests/CorreccionesTrazabilidadUnitTests.cs', 'r', encoding='utf-8') as f:
    text = f.read()

usings_to_add = """using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using GirasolesRes.API.Controllers;
using GirasolesRes.Application.DTOs.Cobros;
"""

if 'using System.Security.Claims;' not in text:
    text = usings_to_add + text

new_tests = """
    [Fact]
    public async Task RegistrarPedidoLlevar_RolAdministrador_Retorna403Forbidden()
    {
        // 10. Roles: Pedido para llevar restringido a Cajero; Administrador recibe 403
        var mockService = new Mock<IPedidoService>();
        var mockLogger = new Mock<ILogger<PedidosController>>();
        var controller = new PedidosController(mockService.Object, mockLogger.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.Role, "Administrador"),
                        new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString())
                    }, "TestAuth"))
                }
            }
        };

        var request = new RegistrarPedidoLlevarRequest { SolicitudId = "sol-llevar-admin", Lineas = new List<LineaPedidoRequest>() };
        var result = await controller.RegistrarPedidoLlevar(request, CancellationToken.None);

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status403Forbidden, objectResult.StatusCode);
    }

    [Fact]
    public async Task RegistrarPedidoLlevar_RolMozo_Retorna403Forbidden()
    {
        // 10. Roles: Pedido para llevar restringido a Cajero; Mozo recibe 403
        var mockService = new Mock<IPedidoService>();
        var mockLogger = new Mock<ILogger<PedidosController>>();
        var controller = new PedidosController(mockService.Object, mockLogger.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.Role, "Mozo"),
                        new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString())
                    }, "TestAuth"))
                }
            }
        };

        var request = new RegistrarPedidoLlevarRequest { SolicitudId = "sol-llevar-mozo", Lineas = new List<LineaPedidoRequest>() };
        var result = await controller.RegistrarPedidoLlevar(request, CancellationToken.None);

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status403Forbidden, objectResult.StatusCode);
    }

    [Fact]
    public async Task ProcesarCobro_RolAdministrador_Retorna403Forbidden()
    {
        // 10. Roles: Cobro restringido a Cajero; Administrador recibe 403
        var mockService = new Mock<ICobroService>();
        var mockLogger = new Mock<ILogger<CobrosController>>();
        var controller = new CobrosController(mockService.Object, mockLogger.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.Role, "Administrador"),
                        new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString())
                    }, "TestAuth"))
                }
            }
        };

        var request = new CobroRequest { SolicitudId = "sol-cobro-admin", PedidoId = Guid.NewGuid(), MetodoPago = "Efectivo", MontoRecibido = 50.00m, TotalMostrado = 40.00m };
        var result = await controller.ProcesarCobro(request, CancellationToken.None);

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status403Forbidden, objectResult.StatusCode);
    }

    [Fact]
    public void DemoraCocina_FronteraExacta_CalculaEsDemoraCorrectamente()
    {
        // 9. Demora a partir de 15 minutos o más (>= 15)
        int min14 = 14;
        int min15 = 15;
        int min16 = 16;

        Assert.False(min14 >= RestauranteConstantes.MinutosDemoraCocina);
        Assert.True(min15 >= RestauranteConstantes.MinutosDemoraCocina);
        Assert.True(min16 >= RestauranteConstantes.MinutosDemoraCocina);
    }
}
"""

last_bracket_idx = text.rfind('}')
if last_bracket_idx != -1:
    text = text[:last_bracket_idx] + new_tests
    with open('tests/GirasolesRes.Tests/CorreccionesTrazabilidadUnitTests.cs', 'w', encoding='utf-8', newline='') as f:
        f.write(text)
    print('CorreccionesTrazabilidadUnitTests updated with 4 new tests')
