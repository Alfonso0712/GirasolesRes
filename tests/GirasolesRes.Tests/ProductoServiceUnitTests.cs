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
            Tipo = "Carta",
            Categoria = "Almuerzo",
            Precio = 28.50m
        };

        _productoRepoMock.Setup(r => r.ExisteNombreAsync("lomo saltado", TipoProducto.Carta, null, It.IsAny<CancellationToken>()))
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
    public async Task RegistrarProductoAsync_ComponenteDeMenuValido_RegistraConRolYSinPrecio()
    {
        // ARRANGE
        var request = new CrearProductoRequest
        {
            Nombre = "Sopa a la minuta",
            Tipo = "Componente",
            Rol = "Sopa"
        };

        _productoRepoMock.Setup(r => r.ExisteNombreAsync("sopa a la minuta", TipoProducto.Componente, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // ACT
        var resultado = await _service.RegistrarProductoAsync(request, "admin", "127.0.0.1");

        // ASSERT
        Assert.True(resultado.Success);
        Assert.Equal(MensajesCatalogo.MSG_57, resultado.Message);
        Assert.NotNull(resultado.Data);
        Assert.Equal("Sopa a la minuta", resultado.Data!.Nombre);
        Assert.Equal("Componente", resultado.Data.Tipo);
        Assert.Equal("Sopa", resultado.Data.Rol);
        Assert.Null(resultado.Data.Precio);

        _productoRepoMock.Verify(r => r.AgregarAsync(It.Is<Producto>(p => p.Pro_Tipo == TipoProducto.Componente && p.Pro_Rol == RolComponente.Sopa && p.Pro_Precio == null), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task RegistrarProductoAsync_ComponenteSinRol_RetornaErrorMSG214_RV156()
    {
        // ARRANGE
        var request = new CrearProductoRequest
        {
            Nombre = "Plato Componente",
            Tipo = "Componente",
            Rol = null
        };

        // ACT
        var resultado = await _service.RegistrarProductoAsync(request, "admin");

        // ASSERT
        Assert.False(resultado.Success);
        Assert.Equal(MensajesCatalogo.MSG_214, resultado.Message);
        _productoRepoMock.Verify(r => r.AgregarAsync(It.IsAny<Producto>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task RegistrarProductoAsync_NombreDuplicadoMismoTipo_RetornaConflictoMSG53_RV157()
    {
        // ARRANGE: Si ya existe "lomo saltado" como Carta, intentar registrar "LÓMO SALTÁDO" como Carta debe ser duplicado
        var request = new CrearProductoRequest
        {
            Nombre = "LÓMO SALTÁDO",
            Tipo = "Carta",
            Categoria = "Almuerzo",
            Precio = 30.00m
        };

        _productoRepoMock.Setup(r => r.ExisteNombreAsync("lomo saltado", TipoProducto.Carta, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // ACT
        var resultado = await _service.RegistrarProductoAsync(request, "admin");

        // ASSERT
        Assert.False(resultado.Success);
        Assert.Equal(MensajesCatalogo.MSG_53, resultado.Message);
        _productoRepoMock.Verify(r => r.AgregarAsync(It.IsAny<Producto>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task RegistrarProductoAsync_MismoNombreDiferenteTipo_PermiteRegistro_RN139()
    {
        // ARRANGE: "Papa a la huancaína" puede existir como Carta (S/ 5.00) y como Componente (Entrada)
        var request = new CrearProductoRequest
        {
            Nombre = "Papa a la huancaína",
            Tipo = "Componente",
            Rol = "Entrada"
        };

        // En Carta ya existe, pero en Componente NO existe
        _productoRepoMock.Setup(r => r.ExisteNombreAsync("papa a la huancaina", TipoProducto.Componente, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // ACT
        var resultado = await _service.RegistrarProductoAsync(request, "admin");

        // ASSERT
        Assert.True(resultado.Success);
        Assert.Equal(MensajesCatalogo.MSG_57, resultado.Message);
        _productoRepoMock.Verify(r => r.AgregarAsync(It.Is<Producto>(p => p.Pro_Tipo == TipoProducto.Componente), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task RegistrarProductoAsync_PrecioCeroONegativo_RetornaErrorMSG55_RV36()
    {
        // ARRANGE
        var request = new CrearProductoRequest
        {
            Nombre = "Inca Kola 500ml",
            Tipo = "Carta",
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
            Tipo = "Carta",
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
        _productoRepoMock.Setup(r => r.ExisteNombreAsync("seco de res", TipoProducto.Carta, productoId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _productoRepoMock.Setup(r => r.TienePedidosAsync(productoId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var request = new ActualizarProductoRequest
        {
            Nombre = "Seco de Res",
            Tipo = "Carta",
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

    [Fact]
    public async Task ActualizarProductoAsync_CambiarTipoConPedidosPrevios_RetornaErrorMSG216_RV158()
    {
        // ARRANGE: Producto de Carta que ya tiene pedidos no puede cambiar a Componente
        var productoId = Guid.NewGuid();
        var producto = new Producto("Caldo de Gallina", CategoriaProducto.Almuerzo, 10.00m, true);

        _productoRepoMock.Setup(r => r.ObtenerPorIdAsync(productoId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(producto);
        _productoRepoMock.Setup(r => r.TienePedidosAsync(productoId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true); // Tiene pedidos

        var request = new ActualizarProductoRequest
        {
            Nombre = "Caldo de Gallina",
            Tipo = "Componente",
            Rol = "Sopa"
        };

        // ACT
        var resultado = await _service.ActualizarProductoAsync(productoId, request, "admin");

        // ASSERT
        Assert.False(resultado.Success);
        Assert.Equal(MensajesCatalogo.MSG_216, resultado.Message);
        _productoRepoMock.Verify(r => r.ActualizarAsync(It.IsAny<Producto>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Theory]
    [InlineData("PlatosExtras", CategoriaProducto.PlatosExtras)]
    [InlineData("Platos Extras / A la Carta", CategoriaProducto.PlatosExtras)]
    [InlineData("Combinados", CategoriaProducto.Combinados)]
    [InlineData("Bebidas", CategoriaProducto.Bebidas)]
    [InlineData("Bebidas y Refrescos", CategoriaProducto.Bebidas)]
    public async Task RegistrarProductoAsync_NuevasCategoriasYFormatoFlexible_RegistraConEnumCorrespondiente(string categoriaInput, CategoriaProducto categoriaEsperada)
    {
        // ARRANGE
        var request = new CrearProductoRequest
        {
            Nombre = "Plato de Prueba Peruano",
            Tipo = "Carta",
            Categoria = categoriaInput,
            Precio = 22.50m
        };

        _productoRepoMock.Setup(r => r.ExisteNombreAsync("plato de prueba peruano", TipoProducto.Carta, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // ACT
        var resultado = await _service.RegistrarProductoAsync(request, "admin");

        // ASSERT
        Assert.True(resultado.Success);
        Assert.Equal(MensajesCatalogo.MSG_57, resultado.Message);
        Assert.NotNull(resultado.Data);
        Assert.Equal(categoriaEsperada.ToString(), resultado.Data!.Categoria);

        _productoRepoMock.Verify(r => r.AgregarAsync(
            It.Is<Producto>(p => p.Pro_Categoria == categoriaEsperada),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ListarProductosAsync_FiltroPorNuevaCategoria_InvocaRepositorioConEnumAdecuado()
    {
        // ARRANGE
        _productoRepoMock.Setup(r => r.ListarProductosAsync(
            null,
            CategoriaProducto.PlatosExtras,
            null,
            null,
            null,
            1,
            10,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync((new List<Producto>(), 0));

        // ACT
        var resultado = await _service.ListarProductosAsync(null, "Platos Extras / A la Carta", null, null, null, 1, 10);

        // ASSERT
        Assert.True(resultado.Success);
        _productoRepoMock.Verify(r => r.ListarProductosAsync(
            null,
            CategoriaProducto.PlatosExtras,
            null,
            null,
            null,
            1,
            10,
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task RegistrarProductoAsync_E371_ComponenteSinPrecio_RegistraCorrectamente()
    {
        // ARRANGE
        var request = new CrearProductoRequest
        {
            Nombre = "Quinua",
            Tipo = "Componente",
            Rol = "BebidaDesayuno",
            Precio = null
        };

        _productoRepoMock.Setup(r => r.ExisteNombreAsync("quinua", TipoProducto.Componente, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // ACT
        var resultado = await _service.RegistrarProductoAsync(request, "admin");

        // ASSERT
        Assert.True(resultado.Success);
        Assert.Equal(MensajesCatalogo.MSG_57, resultado.Message);
        Assert.NotNull(resultado.Data);
        Assert.Equal("Quinua", resultado.Data!.Nombre);
        Assert.Equal("Componente", resultado.Data.Tipo);
        Assert.Equal("BebidaDesayuno", resultado.Data.Rol);
        Assert.Null(resultado.Data.Precio);
    }

    [Fact]
    public async Task RegistrarProductoAsync_E372_ComponenteConPrecio_RechazaConMSG215()
    {
        // ARRANGE
        var request = new CrearProductoRequest
        {
            Nombre = "Quinua",
            Tipo = "Componente",
            Rol = "BebidaDesayuno",
            Precio = 3.50m
        };

        // ACT
        var resultado = await _service.RegistrarProductoAsync(request, "admin");

        // ASSERT
        Assert.False(resultado.Success);
        Assert.Equal(MensajesCatalogo.MSG_215, resultado.Message);
        var errors = resultado.Errors as Dictionary<string, string>;
        Assert.NotNull(errors);
        Assert.True(errors.ContainsKey("precio"));
        Assert.Equal(MensajesCatalogo.MSG_215, errors["precio"]);
    }

    [Fact]
    public async Task RegistrarProductoAsync_E373_ComponenteSinRol_RechazaConMSG214()
    {
        // ARRANGE
        var request = new CrearProductoRequest
        {
            Nombre = "Quinua",
            Tipo = "Componente",
            Rol = null
        };

        // ACT
        var resultado = await _service.RegistrarProductoAsync(request, "admin");

        // ASSERT
        Assert.False(resultado.Success);
        Assert.Equal(MensajesCatalogo.MSG_214, resultado.Message);
        var errors = resultado.Errors as Dictionary<string, string>;
        Assert.NotNull(errors);
        Assert.True(errors.ContainsKey("rol"));
    }

    [Fact]
    public async Task RegistrarProductoAsync_E374_MismoNombreEnDistintoTipo_Permite_PeroMismoTipo_RechazaMSG53()
    {
        // ARRANGE: "Papa a la huancaína" ya existe como Carta, queremos crearla como Componente (RN-139)
        var requestComponente = new CrearProductoRequest
        {
            Nombre = "Papa a la huancaína",
            Tipo = "Componente",
            Rol = "Entrada"
        };

        _productoRepoMock.Setup(r => r.ExisteNombreAsync("papa a la huancaina", TipoProducto.Componente, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // ACT 1: Crear como componente -> permitido
        var resultado1 = await _service.RegistrarProductoAsync(requestComponente, "admin");
        Assert.True(resultado1.Success);

        // ARRANGE 2: Intentar crear otro componente con el mismo nombre -> rechazado MSG-53
        _productoRepoMock.Setup(r => r.ExisteNombreAsync("papa a la huancaina", TipoProducto.Componente, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // ACT 2: Crear otro componente duplicado -> rechazado
        var resultado2 = await _service.RegistrarProductoAsync(requestComponente, "admin");
        Assert.False(resultado2.Success);
        Assert.Equal(MensajesCatalogo.MSG_53, resultado2.Message);
    }

    [Fact]
    public async Task ActualizarProductoAsync_E375_CambiarTipoDeProductoConPedidos_RechazaConMSG216()
    {
        // ARRANGE: Producto existente de tipo Carta que ya tiene pedidos
        var prodExistente = new Producto("Lomo Saltado", CategoriaProducto.Almuerzo, 25.00m);
        _productoRepoMock.Setup(r => r.ObtenerPorIdAsync(prodExistente.Id_Producto, It.IsAny<CancellationToken>()))
            .ReturnsAsync(prodExistente);
        _productoRepoMock.Setup(r => r.TienePedidosAsync(prodExistente.Id_Producto, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var request = new ActualizarProductoRequest
        {
            Nombre = "Lomo Saltado",
            Tipo = "Componente",
            Rol = "Segundo",
            Precio = null
        };

        // ACT
        var resultado = await _service.ActualizarProductoAsync(prodExistente.Id_Producto, request, "admin");

        // ASSERT
        Assert.False(resultado.Success);
        Assert.Equal(MensajesCatalogo.MSG_216, resultado.Message);
        var errors = resultado.Errors as Dictionary<string, string>;
        Assert.NotNull(errors);
        Assert.True(errors.ContainsKey("tipo"));
        Assert.Equal(MensajesCatalogo.MSG_216, errors["tipo"]);
    }
}
