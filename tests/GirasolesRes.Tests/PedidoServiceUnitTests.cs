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
    public async Task RegistrarPedidoMesaAsync_SinMenuDiaDefinido_LanzaPedidoConflictException409()
    {
        // ARRANGE
        var mesaId = Guid.NewGuid();
        var mesa = new Mesa("Mesa 1");
        _mesaRepoMock.Setup(m => m.ObtenerPorIdAsync(mesaId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mesa);

        _pedidoRepoMock.Setup(p => p.ObtenerPorSolicitudIdAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Pedido?)null);
        _pedidoRepoMock.Setup(p => p.ExistePedidoActivoEnMesaAsync(mesaId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Menú del día no existe (null)
        _menuDiaRepoMock.Setup(m => m.ObtenerPorFechaAsync(It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((MenuDia?)null);

        var request = new RegistrarPedidoMesaRequest
        {
            SolicitudId = Guid.NewGuid().ToString(),
            MesaId = mesaId,
            Lineas = new List<LineaPedidoRequest>
            {
                new LineaPedidoRequest { ProductoId = Guid.NewGuid(), Cantidad = 1 }
            }
        };

        // ACT & ASSERT
        var ex = await Assert.ThrowsAsync<PedidoConflictException>(() =>
            _service.RegistrarPedidoMesaAsync(request, "mozo1", Guid.NewGuid(), "127.0.0.1"));

        Assert.Equal("menu_no_definido", ex.Codigo);
        Assert.Equal(MensajesCatalogo.MSG_MENU_NO_DEFINIDO, ex.Message);
    }

    [Fact]
    public async Task RegistrarPedidoLlevarAsync_SinMenuDiaDefinido_LanzaPedidoConflictException409()
    {
        // ARRANGE
        _pedidoRepoMock.Setup(p => p.ObtenerPorSolicitudIdAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Pedido?)null);

        // Menú del día no existe (null)
        _menuDiaRepoMock.Setup(m => m.ObtenerPorFechaAsync(It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((MenuDia?)null);

        var request = new RegistrarPedidoLlevarRequest
        {
            SolicitudId = Guid.NewGuid().ToString(),
            Referencia = "Cliente Mostrador",
            Lineas = new List<LineaPedidoRequest>
            {
                new LineaPedidoRequest { ProductoId = Guid.NewGuid(), Cantidad = 1 }
            }
        };

        // ACT & ASSERT
        var ex = await Assert.ThrowsAsync<PedidoConflictException>(() =>
            _service.RegistrarPedidoLlevarAsync(request, "cajero1", Guid.NewGuid(), "127.0.0.1"));

        Assert.Equal("menu_no_definido", ex.Codigo);
        Assert.Equal(MensajesCatalogo.MSG_MENU_NO_DEFINIDO, ex.Message);
    }

    [Fact]
    public async Task ObtenerMenuParaPedidoAsync_SinMenuDiaDefinido_RetornaListaVacia()
    {
        // ARRANGE
        _menuDiaRepoMock.Setup(m => m.ObtenerPorFechaAsync(It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((MenuDia?)null);

        // ACT
        var resultado = await _service.ObtenerMenuParaPedidoAsync();

        // ASSERT
        Assert.NotNull(resultado);
        Assert.Empty(resultado);
    }
}
