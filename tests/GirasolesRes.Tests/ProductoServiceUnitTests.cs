using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Productos;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Services;
using GirasolesRes.Domain.Common;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using Moq;
using Xunit;

namespace GirasolesRes.Tests;

public class ProductoServiceUnitTests
{
    private readonly Mock<IProductoRepository> _productoRepoMock;
    private readonly Mock<IAuditoriaUsuarioRepository> _auditoriaRepoMock;
    private readonly Mock<IMenuDiaRepository> _menuDiaRepoMock;
    private readonly ProductoService _service;

    public ProductoServiceUnitTests()
    {
        _productoRepoMock = new Mock<IProductoRepository>();
        _auditoriaRepoMock = new Mock<IAuditoriaUsuarioRepository>();
        _menuDiaRepoMock = new Mock<IMenuDiaRepository>();

        _service = new ProductoService(
            _productoRepoMock.Object,
            _auditoriaRepoMock.Object,
            _menuDiaRepoMock.Object);
    }

    [Fact]
    public async Task RegistrarProductoAsync_DatosValidos_RegistraProductoYAuditoriaAtomicamente()
    {
        // ARRANGE
        var request = new CrearProductoRequest
        {
            Nombre = "Lomo Saltado",
            Categoria = "Almuerzo",
            Precio = 28.50m
        };

        _productoRepoMock.Setup(r => r.ExisteNombreAsync("lomo saltado", null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // ACT
        var resultado = await _service.RegistrarProductoAsync(request, "admin", "127.0.0.1");

        // ASSERT
        Assert.True(resultado.Success);
        Assert.Equal(MensajesCatalogo.MSG_57, resultado.Message);
        Assert.NotNull(resultado.Data);
        Assert.Equal("Lomo Saltado", resultado.Data!.Nombre);
        Assert.Equal(28.50m, resultado.Data.Precio);

        _productoRepoMock.Verify(r => r.AgregarAsync(It.Is<Producto>(p => p.Pro_Nombre == "Lomo Saltado" && p.Pro_NombreNormalizado == "lomo saltado"), It.IsAny<CancellationToken>()), Times.Once);
        _auditoriaRepoMock.Verify(a => a.RegistrarAsync(It.Is<AuditoriaUsuario>(au => au.Aud_NombreAdmin == "admin" && au.Aud_Accion == "CREAR_PRODUCTO"), It.IsAny<CancellationToken>()), Times.Once);
        _productoRepoMock.Verify(r => r.GuardarCambiosAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task RegistrarProductoAsync_NombreDuplicadoConTildesOMayusculas_RetornaConflictoMSG53_RV34()
    {
        // ARRANGE: Si ya existe "lomo saltado", intentar registrar "LÓMO SALTÁDO" debe ser detectado como duplicado
        var request = new CrearProductoRequest
        {
            Nombre = "LÓMO SALTÁDO",
            Categoria = "Almuerzo",
            Precio = 30.00m
        };

        _productoRepoMock.Setup(r => r.ExisteNombreAsync("lomo saltado", null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // ACT
        var resultado = await _service.RegistrarProductoAsync(request, "admin");

        // ASSERT
        Assert.False(resultado.Success);
        Assert.Equal(MensajesCatalogo.MSG_53, resultado.Message);
        _productoRepoMock.Verify(r => r.AgregarAsync(It.IsAny<Producto>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task RegistrarProductoAsync_PrecioCeroONegativo_RetornaErrorMSG55_RV36()
    {
        // ARRANGE
        var request = new CrearProductoRequest
        {
            Nombre = "Inca Kola 500ml",
            Categoria = "Otro",
            Precio = 0.00m
        };

        // ACT
        var resultado = await _service.RegistrarProductoAsync(request, "admin");

        // ASSERT
        Assert.False(resultado.Success);
        Assert.Equal(MensajesCatalogo.MSG_55, resultado.Message);
        _productoRepoMock.Verify(r => r.AgregarAsync(It.IsAny<Producto>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task RegistrarProductoAsync_PrecioMayorA999_RetornaErrorMSG56_RV36()
    {
        // ARRANGE
        var request = new CrearProductoRequest
        {
            Nombre = "Vino Especial Reserva",
            Categoria = "Otro",
            Precio = 1500.00m
        };

        // ACT
        var resultado = await _service.RegistrarProductoAsync(request, "admin");

        // ASSERT
        Assert.False(resultado.Success);
        Assert.Equal(MensajesCatalogo.MSG_56, resultado.Message);
        _productoRepoMock.Verify(r => r.AgregarAsync(It.IsAny<Producto>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task CambiarEstadoAsync_DesactivarProductoEnMenuHoy_RetiraDelMenuYRetornaRetiradoDelMenuTrue_RN28()
    {
        // ARRANGE
        var productoId = Guid.NewGuid();
        var producto = new Producto("Arroz Chaufa", CategoriaProducto.Almuerzo, 18.00m, true);

        _productoRepoMock.Setup(r => r.ObtenerPorIdAsync(productoId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(producto);

        // ACT: Desactivar producto activo
        var resultado = await _service.CambiarEstadoAsync(productoId, false, "admin");

        // ASSERT
        Assert.True(resultado.Success);
        Assert.Equal(MensajesCatalogo.MSG_63, resultado.Message);
        Assert.NotNull(resultado.Data);
        Assert.False(resultado.Data!.Activo);
        Assert.True(resultado.Data.RetiradoDelMenu); // Se retiró del menú vigente

        _menuDiaRepoMock.Verify(m => m.RemoverProductoDeMenuVigenteAsync(producto.Id_Producto, "admin", It.IsAny<CancellationToken>()), Times.Once);
        _auditoriaRepoMock.Verify(a => a.RegistrarAsync(It.Is<AuditoriaUsuario>(au => au.Aud_Accion == "DESACTIVAR_PRODUCTO"), It.IsAny<CancellationToken>()), Times.Once);
        _productoRepoMock.Verify(r => r.GuardarCambiosAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ActualizarProductoAsync_EdicionValida_ActualizaEntidadYRegistraPreciosEnAuditoria_RN30()
    {
        // ARRANGE
        var productoId = Guid.NewGuid();
        var producto = new Producto("Seco de Res", CategoriaProducto.Almuerzo, 25.00m, true);

        _productoRepoMock.Setup(r => r.ObtenerPorIdAsync(productoId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(producto);
        _productoRepoMock.Setup(r => r.ExisteNombreAsync("seco de res", productoId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var request = new ActualizarProductoRequest
        {
            Nombre = "Seco de Res",
            Categoria = "Almuerzo",
            Precio = 27.00m // Incremento de precio
        };

        // ACT
        var resultado = await _service.ActualizarProductoAsync(productoId, request, "admin");

        // ASSERT
        Assert.True(resultado.Success);
        Assert.Equal(MensajesCatalogo.MSG_58, resultado.Message);
        Assert.Equal(27.00m, producto.Pro_Precio);

        // Verifica que la auditoría registre el precio anterior y el nuevo
        _auditoriaRepoMock.Verify(a => a.RegistrarAsync(
            It.Is<AuditoriaUsuario>(au => 
                au.Aud_Accion == "EDITAR_PRODUCTO" && 
                au.Aud_Detalle!.Contains("25.00") && 
                au.Aud_Detalle.Contains("27.00")),
            It.IsAny<CancellationToken>()), Times.Once);

        _productoRepoMock.Verify(r => r.GuardarCambiosAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
