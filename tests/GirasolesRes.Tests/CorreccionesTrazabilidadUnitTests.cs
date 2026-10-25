using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using GirasolesRes.API.Controllers;
using GirasolesRes.Application.DTOs.Cobros;
using GirasolesRes.Application.Common;
using GirasolesRes.Application.Common.Exceptions;
using GirasolesRes.Application.DTOs.Comandas;
using GirasolesRes.Application.DTOs.Inicio;
using GirasolesRes.Application.DTOs.MenuDia;
using GirasolesRes.Application.DTOs.Pedidos;
using GirasolesRes.Application.DTOs.Reportes;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Interfaces.Services;
using GirasolesRes.Application.Services;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using Moq;
using Xunit;

namespace GirasolesRes.Tests;

public class CorreccionesTrazabilidadUnitTests
{
    private readonly Mock<IPedidoRepository> _pedidoRepoMock = new();
    private readonly Mock<IMesaRepository> _mesaRepoMock = new();
    private readonly Mock<IProductoRepository> _productoRepoMock = new();
    private readonly Mock<IMenuDiaRepository> _menuDiaRepoMock = new();
    private readonly Mock<ICajaRepository> _cajaRepoMock = new();
    private readonly Mock<ICajaService> _cajaServiceMock = new();
    private readonly Mock<IMesaService> _mesaServiceMock = new();
    private readonly Mock<IMenuDiaService> _menuDiaServiceMock = new();
    private readonly Mock<IComandaService> _comandaServiceMock = new();
    private readonly Mock<IReporteService> _reporteServiceMock = new();

    private PedidoService CrearPedidoService()
    {
        return new PedidoService(
            _pedidoRepoMock.Object,
            _mesaRepoMock.Object,
            _productoRepoMock.Object,
            _menuDiaRepoMock.Object
        );
    }

    [Fact]
    public async Task VariosPedidosPorMesa_MesaOcupada_AceptaNuevoPedido()
    {
        // 1. Varios pedidos por mesa: una mesa ocupada debe aceptar un pedido nuevo (sin error 409)
        var mesaId = Guid.NewGuid();
        var mesa = new Mesa("Mesa 5");
        mesa.CambiarOcupacion(EstadoOcupacionMesa.Ocupada); // Mesa previamente ocupada
        _mesaRepoMock.Setup(m => m.ObtenerPorIdAsync(mesaId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mesa);

        _pedidoRepoMock.Setup(p => p.ObtenerPorSolicitudIdAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Pedido?)null);
        _pedidoRepoMock.Setup(p => p.ExistePedidoActivoEnMesaAsync(mesaId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true); // Ya tiene pedido activo en mesa
        _pedidoRepoMock.Setup(p => p.ObtenerSiguienteNumeroDiarioAsync(It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(5);
        _pedidoRepoMock.Setup(p => p.ObtenerSiguienteNumeroComandaDiarioAsync(It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(5);

        var prod = new Producto("Ceviche Clásico", CategoriaProducto.Almuerzo, 35.00m, true);
        _productoRepoMock.Setup(pr => pr.ObtenerPorIdsAsync(It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Producto> { prod });

        var service = CrearPedidoService();

        var request = new RegistrarPedidoMesaRequest
        {
            SolicitudId = Guid.NewGuid().ToString(),
            MesaId = mesaId,
            Lineas = new List<LineaPedidoRequest>
            {
                new LineaPedidoRequest { ProductoId = prod.Id_Producto, Cantidad = 1 }
            }
        };

        // ACT
        var resultado = await service.RegistrarPedidoMesaAsync(request, "mozo1", Guid.NewGuid(), "127.0.0.1");

        // ASSERT: Se crea con éxito a pesar de estar ocupada
        Assert.NotNull(resultado);
        Assert.Equal(5, resultado.Numero);
        Assert.Equal(35.00m, resultado.Total);
    }

    [Fact]
    public async Task AnulacionPorAdministrador_PedidoConComandaEnPreparacion_AnulaExitosamente()
    {
        // 2. Anulación por el Administrador: el Administrador puede anular cualquier pedido no pagado,
        // aun con comandas en preparación o listas, siempre con motivo (5 a 100 caracteres)
        var mozoId = Guid.NewGuid();
        var adminId = Guid.NewGuid();
        var pedidoId = Guid.NewGuid();

        var pedido = new Pedido(1, DateOnly.FromDateTime(DateTime.Today), Guid.NewGuid(), mozoId, "sol-1", TipoPedido.Mesa, null);
        var comanda = new Comanda(pedido.Id_Pedido, 1, "Mesa 1", cmdEsAdicional: false);
        comanda.IniciarPreparacion("cocinero1"); // Comanda en preparación
        pedido.AgregarComanda(comanda);

        _pedidoRepoMock.Setup(p => p.ObtenerDetalleCompletoPorIdAsync(pedidoId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(pedido);

        var service = CrearPedidoService();

        var request = new AnularPedidoRequest
        {
            Motivo = "Cliente se retiró del local inesperadamente"
        };

        // ACT: Administrador anula pedido ajeno con comanda en preparación
        await service.AnularPedidoAsync(pedidoId, request, adminId, "Administrador", "admin1", "127.0.0.1");

        // ASSERT
        Assert.Equal(EstadoPedido.Anulado, pedido.Ped_Estado);
        Assert.Equal("Cliente se retiró del local inesperadamente", pedido.Ped_MotivoAnulacion);
        Assert.Equal(EstadoComanda.Cancelada, comanda.Cmd_Estado);
    }

    [Fact]
    public async Task AnulacionPorMozo_ComandaEnPreparacion_LanzaConflicto409()
    {
        // Mozo no puede anular si la comanda ya está en preparación
        var mozoId = Guid.NewGuid();
        var pedidoId = Guid.NewGuid();

        var pedido = new Pedido(2, DateOnly.FromDateTime(DateTime.Today), Guid.NewGuid(), mozoId, "sol-2", TipoPedido.Mesa, null);
        var comanda = new Comanda(pedido.Id_Pedido, 2, "Mesa 2", cmdEsAdicional: false);
        comanda.IniciarPreparacion("cocinero1");
        pedido.AgregarComanda(comanda);

        _pedidoRepoMock.Setup(p => p.ObtenerDetalleCompletoPorIdAsync(pedidoId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(pedido);

        var service = CrearPedidoService();
        var request = new AnularPedidoRequest { Motivo = "Cliente canceló" };

        // ACT & ASSERT: Mozo recibe conflicto
        await Assert.ThrowsAsync<PedidoConflictException>(() =>
            service.AnularPedidoAsync(pedidoId, request, mozoId, "Mozo", "mozo1", "127.0.0.1"));
    }

    [Fact]
    public async Task AnulacionPorMozo_PedidoAjeno_LanzaUnauthorized()
    {
        // Mozo no puede anular pedidos registrados por otro usuario
        var creadorId = Guid.NewGuid();
        var otroMozoId = Guid.NewGuid();
        var pedidoId = Guid.NewGuid();

        var pedido = new Pedido(3, DateOnly.FromDateTime(DateTime.Today), Guid.NewGuid(), creadorId, "sol-3", TipoPedido.Mesa, null);
        var comanda = new Comanda(pedido.Id_Pedido, 3, "Mesa 3", cmdEsAdicional: false);
        pedido.AgregarComanda(comanda);

        _pedidoRepoMock.Setup(p => p.ObtenerDetalleCompletoPorIdAsync(pedidoId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(pedido);

        var service = CrearPedidoService();
        var request = new AnularPedidoRequest { Motivo = "Error de mesa" };

        // ACT & ASSERT
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            service.AnularPedidoAsync(pedidoId, request, otroMozoId, "Mozo", "otroMozo", "127.0.0.1"));
    }

    [Fact]
    public async Task DashboardAlertas_MenuSinDefinir_SoloSiCajaAbierta()
    {
        // 4. Alerta «menú de hoy sin definir» en el dashboard: generarla solo si la caja del día está abierta.
        var inicioService = new InicioService(
            _reporteServiceMock.Object,
            _cajaServiceMock.Object,
            _cajaRepoMock.Object,
            _mesaServiceMock.Object,
            _pedidoRepoMock.Object,
            _menuDiaServiceMock.Object,
            _comandaServiceMock.Object
        );

        // Menú sin definir
        _menuDiaServiceMock.Setup(m => m.ObtenerMenuHoyAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ApiResponse<MenuDiaResponseDto>
            {
                Success = true,
                Data = new MenuDiaResponseDto
                {
                    Fecha = DateTime.Today.ToString("yyyy-MM-dd"),
                    Definido = false
                }
            });

        _comandaServiceMock.Setup(c => c.ListarComandasAsync(It.IsAny<string>()))
            .ReturnsAsync(new ListarComandasResponseDto());

        _reporteServiceMock.Setup(r => r.ConsultarReporteVentasAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ReporteVentasResponseDto(
                DateTime.Today.ToString("yyyy-MM-dd"),
                DateTime.Today.ToString("yyyy-MM-dd"),
                0, 0m, 0m, 0m,
                new VentasAnuladasResumenDto(0, 0m),
                new List<VentaPorDiaDto>()
            ));

        // ESCENARIO A: Caja CERRADA -> NO debe generar alerta
        _cajaRepoMock.Setup(c => c.ObtenerCajaAbiertaAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync((Caja?)null);

        var bloqueSinCaja = await inicioService.ObtenerBloqueAsync("alertas", "Administrador", Guid.NewGuid());
        var alertasSinCaja = Assert.IsAssignableFrom<IEnumerable<AlertaInicioDto>>(bloqueSinCaja.Datos);
        Assert.DoesNotContain(alertasSinCaja, a => a.Tipo == "menu_sin_definir");

        // ESCENARIO B: Caja ABIERTA -> SÍ debe generar alerta
        var cajaAbierta = new Caja(Guid.NewGuid(), 100m, "apertura-1");
        _cajaRepoMock.Setup(c => c.ObtenerCajaAbiertaAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(cajaAbierta);

        var bloqueConCaja = await inicioService.ObtenerBloqueAsync("alertas", "Administrador", Guid.NewGuid());
        var alertasConCaja = Assert.IsAssignableFrom<IEnumerable<AlertaInicioDto>>(bloqueConCaja.Datos);
        Assert.Contains(alertasConCaja, a => a.Tipo == "menu_sin_definir");
    }

    [Fact]
    public async Task PedidoPagado_MuestraEstadoPreparacionEnListado()
    {
        // 5. Pedido pagado: mostrar «Pagado» junto con el estado de preparación (ej: «Pagado · En preparación»)
        var pedido = new Pedido(10, DateOnly.FromDateTime(DateTime.Today), Guid.NewGuid(), Guid.NewGuid(), "sol-10", TipoPedido.Mesa, null);
        var comanda = new Comanda(pedido.Id_Pedido, 10, "Mesa 10", false);
        comanda.IniciarPreparacion("cocinero1");
        pedido.AgregarComanda(comanda);
        pedido.CambiarEstado(EstadoPedido.Pagado); // Pagado pero con comanda en preparación

        _pedidoRepoMock.Setup(p => p.ListarPaginadoAsync(
            It.IsAny<DateOnly>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<Guid?>(), It.IsAny<Guid?>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<CancellationToken>()
        )).ReturnsAsync((new List<Pedido> { pedido }, 1, 0, 0, 0, 1, 0));

        var service = CrearPedidoService();
        var query = new ListarPedidosQueryDto();

        var resultado = await service.ListarPedidosAsync(query, Guid.NewGuid(), "Administrador");

        Assert.Single(resultado.Items);
        Assert.Equal("Pagado · En preparación", resultado.Items[0].Estado);
    }

    [Fact]
    public async Task PedidoPagado_ComandaLista_MuestraListoPagado()
    {
        // 5. Pedido pagado con comanda lista: muestra «Listo · Pagado»
        var pedido = new Pedido(11, DateOnly.FromDateTime(DateTime.Today), Guid.NewGuid(), Guid.NewGuid(), "sol-11", TipoPedido.Mesa, null);
        var comanda = new Comanda(pedido.Id_Pedido, 11, "Mesa 11", false);
        comanda.MarcarComoLista("cocinero1");
        pedido.AgregarComanda(comanda);
        pedido.CambiarEstado(EstadoPedido.Pagado);

        _pedidoRepoMock.Setup(p => p.ListarPaginadoAsync(
            It.IsAny<DateOnly>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<Guid?>(), It.IsAny<Guid?>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<CancellationToken>()
        )).ReturnsAsync((new List<Pedido> { pedido }, 1, 0, 0, 0, 1, 0));

        var service = CrearPedidoService();
        var query = new ListarPedidosQueryDto();

        var resultado = await service.ListarPedidosAsync(query, Guid.NewGuid(), "Administrador");

        Assert.Single(resultado.Items);
        Assert.Equal("Listo · Pagado", resultado.Items[0].Estado);
    }

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

        var request = new CobroRequest { SolicitudId = "sol-cobro-admin", PedidoId = Guid.NewGuid(), Metodo = "Efectivo", MontoRecibido = 50.00m, TotalMostrado = 40.00m };
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
