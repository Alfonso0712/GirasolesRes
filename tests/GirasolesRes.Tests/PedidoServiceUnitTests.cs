using GirasolesRes.Application.Common;
using GirasolesRes.Application.Common.Exceptions;
using GirasolesRes.Application.DTOs.Pedidos;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Services;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using Moq;
using Xunit;

namespace GirasolesRes.Tests;

public class PedidoServiceUnitTests
{
    private readonly Mock<IPedidoRepository> _pedidoRepoMock;
    private readonly Mock<IMesaRepository> _mesaRepoMock;
    private readonly Mock<IProductoRepository> _productoRepoMock;
    private readonly Mock<IMenuDiaRepository> _menuDiaRepoMock;
    private readonly PedidoService _service;

    public PedidoServiceUnitTests()
    {
        _pedidoRepoMock = new Mock<IPedidoRepository>();
        _mesaRepoMock = new Mock<IMesaRepository>();
        _productoRepoMock = new Mock<IProductoRepository>();
        _menuDiaRepoMock = new Mock<IMenuDiaRepository>();

        _service = new PedidoService(
            _pedidoRepoMock.Object,
            _mesaRepoMock.Object,
            _productoRepoMock.Object,
            _menuDiaRepoMock.Object);
    }

    [Fact]
    public async Task RegistrarPedidoMesaAsync_SinMenuDiaDefinido_NoBloqueaYRegistraPedido()
    {
        // ARRANGE - RN-142: Sin menú del día definido no se bloquean ventas
        var mesaId = Guid.NewGuid();
        var mesa = new Mesa("Mesa 1");
        _mesaRepoMock.Setup(m => m.ObtenerPorIdAsync(mesaId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mesa);

        _pedidoRepoMock.Setup(p => p.ObtenerPorSolicitudIdAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Pedido?)null);
        _pedidoRepoMock.Setup(p => p.ExistePedidoActivoEnMesaAsync(mesaId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _pedidoRepoMock.Setup(p => p.ObtenerSiguienteNumeroDiarioAsync(It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);
        _pedidoRepoMock.Setup(p => p.ObtenerSiguienteNumeroComandaDiarioAsync(It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Menú del día no existe (null)
        _menuDiaRepoMock.Setup(m => m.ObtenerPorFechaAsync(It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((MenuDia?)null);

        var prodId = Guid.NewGuid();
        var prod = new Producto("Lomo Saltado", CategoriaProducto.Almuerzo, 25.00m, true);
        _productoRepoMock.Setup(pr => pr.ObtenerPorIdsAsync(It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Producto> { prod });

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
        var resultado = await _service.RegistrarPedidoMesaAsync(request, "mozo1", Guid.NewGuid(), "127.0.0.1");

        // ASSERT
        Assert.NotNull(resultado);
        Assert.Equal(1, resultado.Numero);
        Assert.Equal(25.00m, resultado.Total);
    }

    [Fact]
    public async Task RegistrarPedidoLlevarAsync_SinMenuDiaDefinido_NoBloqueaYRegistraPedido()
    {
        // ARRANGE - RN-142: Sin menú del día definido no se bloquean ventas
        _pedidoRepoMock.Setup(p => p.ObtenerPorSolicitudIdAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Pedido?)null);
        _pedidoRepoMock.Setup(p => p.ObtenerSiguienteNumeroDiarioAsync(It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(2);
        _pedidoRepoMock.Setup(p => p.ObtenerSiguienteNumeroComandaDiarioAsync(It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(2);

        // Menú del día no existe (null)
        _menuDiaRepoMock.Setup(m => m.ObtenerPorFechaAsync(It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((MenuDia?)null);

        var prod = new Producto("Arroz con Pollo", CategoriaProducto.Almuerzo, 18.00m, true);
        _productoRepoMock.Setup(pr => pr.ObtenerPorIdsAsync(It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Producto> { prod });

        var request = new RegistrarPedidoLlevarRequest
        {
            SolicitudId = Guid.NewGuid().ToString(),
            Referencia = "Cliente Mostrador",
            Lineas = new List<LineaPedidoRequest>
            {
                new LineaPedidoRequest { ProductoId = prod.Id_Producto, Cantidad = 1 }
            }
        };

        // ACT
        var resultado = await _service.RegistrarPedidoLlevarAsync(request, "cajero1", Guid.NewGuid(), "127.0.0.1");

        // ASSERT
        Assert.NotNull(resultado);
        Assert.Equal(2, resultado.Numero);
        Assert.Equal(18.00m, resultado.Total);
    }

    [Fact]
    public async Task ObtenerMenuParaPedidoAsync_SinMenuDiaDefinido_RetornaProductosActivos()
    {
        // ARRANGE - RN-142: Ofrecer todos los productos activos de la carta
        _menuDiaRepoMock.Setup(m => m.ObtenerPorFechaAsync(It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((MenuDia?)null);

        var prod1 = new Producto("Lomo Saltado", CategoriaProducto.Almuerzo, 25.00m, true);
        var prod2 = new Producto("Chicha Morada", CategoriaProducto.Bebidas, 5.00m, true);
        _productoRepoMock.Setup(pr => pr.ListarDisponiblesAsync(null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Producto> { prod1, prod2 });

        // ACT
        var resultado = await _service.ObtenerMenuParaPedidoAsync();

        // ASSERT
        Assert.NotNull(resultado);
        Assert.Equal(2, resultado.Count);
        Assert.Contains(resultado, p => p.Nombre == "Lomo Saltado");
        Assert.Contains(resultado, p => p.Nombre == "Chicha Morada");
    }
}
