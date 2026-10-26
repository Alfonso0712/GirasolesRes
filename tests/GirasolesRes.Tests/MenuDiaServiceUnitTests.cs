using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.MenuDia;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Services;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using Moq;
using Xunit;

namespace GirasolesRes.Tests;

public class MenuDiaServiceUnitTests
{
    private readonly Mock<IMenuDiaRepository> _mockMenuDiaRepo = new();
    private readonly Mock<IProductoRepository> _mockProductoRepo = new();
    private readonly Mock<IMenuCompletoRepository> _mockMenuCompletoRepo = new();
    private readonly Mock<IAuditoriaUsuarioRepository> _mockAuditoriaRepo = new();
    private readonly MenuDiaService _service;

    public MenuDiaServiceUnitTests()
    {
        _service = new MenuDiaService(
            _mockMenuDiaRepo.Object,
            _mockProductoRepo.Object,
            _mockMenuCompletoRepo.Object,
            _mockAuditoriaRepo.Object
        );
    }

    [Fact]
    public async Task GuardarMenuHoy_RV162_RechazaSiNoHayProductosDeCartaNiMenusCompletos_MSG224()
    {
        // Act
        var request = new GuardarMenuDiaRequest
        {
            ProductosCarta = new List<Guid>(),
            Opciones = new List<Guid>(),
            MenusCompletos = new List<int>()
        };

        var result = await _service.GuardarMenuHoyAsync(request, "admin", "127.0.0.1");

        // Assert
        Assert.False(result.Success);
        Assert.Equal(MensajesCatalogo.MSG_224, result.Message);
    }

    [Fact]
    public async Task GuardarMenuHoy_RV161_RechazaMenuCompletoSinOpcionesEnParte_MSG219()
    {
        // Arrange: Desayuno completo (id 1) requiere Bebida (BebidaDesayuno) y Plato (PlatoDesayuno)
        var mcDesayuno = new MenuCompleto(1, "Desayuno completo", 7.00m, true, "Pan");
        mcDesayuno.AgregarParte(new MenuCompletoParte(1, "Bebida", new[] { RolComponente.BebidaDesayuno }, 1));
        mcDesayuno.AgregarParte(new MenuCompletoParte(1, "Plato", new[] { RolComponente.PlatoDesayuno }, 2));

        _mockMenuCompletoRepo.Setup(r => r.ObtenerTodosAsync(true, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<MenuCompleto> { mcDesayuno });

        // Solo enviamos una Bebida, pero NO enviamos Plato
        var quaker = new Producto("Quaker", RolComponente.BebidaDesayuno);
        _mockProductoRepo.Setup(r => r.ObtenerPorIdsAsync(It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Producto> { quaker });

        var request = new GuardarMenuDiaRequest
        {
            ProductosCarta = new List<Guid>(),
            Opciones = new List<Guid> { quaker.Id_Producto },
            MenusCompletos = new List<int> { 1 }
        };

        // Act
        var result = await _service.GuardarMenuHoyAsync(request, "admin", "127.0.0.1");

        // Assert
        Assert.False(result.Success);
        var expectedMsg = string.Format(MensajesCatalogo.MSG_219, "Desayuno completo", "Plato");
        Assert.Equal(expectedMsg, result.Message);
    }

    [Fact]
    public async Task GuardarMenuHoy_RV161_ExitosoCuandoTodasLasPartesTienenOpciones()
    {
        // Arrange
        var mcDesayuno = new MenuCompleto(1, "Desayuno completo", 7.00m, true, "Pan");
        mcDesayuno.AgregarParte(new MenuCompletoParte(1, "Bebida", new[] { RolComponente.BebidaDesayuno }, 1));
        mcDesayuno.AgregarParte(new MenuCompletoParte(1, "Plato", new[] { RolComponente.PlatoDesayuno }, 2));

        _mockMenuCompletoRepo.Setup(r => r.ObtenerTodosAsync(true, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<MenuCompleto> { mcDesayuno });

        var quaker = new Producto("Quaker", RolComponente.BebidaDesayuno);
        var seco = new Producto("Seco de pollo", RolComponente.PlatoDesayuno);

        _mockProductoRepo.Setup(r => r.ObtenerPorIdsAsync(It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Producto> { quaker, seco });

        MenuDia? savedMenu = null;
        _mockMenuDiaRepo.Setup(r => r.ObtenerMenuHoyConDetalleAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(() => savedMenu);

        _mockMenuDiaRepo.Setup(r => r.AgregarAsync(It.IsAny<MenuDia>(), It.IsAny<CancellationToken>()))
            .Callback<MenuDia, CancellationToken>((m, _) => savedMenu = m)
            .Returns(Task.CompletedTask);

        var request = new GuardarMenuDiaRequest
        {
            ProductosCarta = new List<Guid>(),
            Opciones = new List<Guid> { quaker.Id_Producto, seco.Id_Producto },
            MenusCompletos = new List<int> { 1 }
        };

        // Act
        var result = await _service.GuardarMenuHoyAsync(request, "admin", "127.0.0.1");

        // Assert
        Assert.True(result.Success);
        Assert.Equal(MensajesCatalogo.MSG_70, result.Message);
        Assert.NotNull(savedMenu);
        Assert.Equal(2, savedMenu.Men_Platos.Count);
        Assert.Single(savedMenu.Men_MenusCompletos);
    }

    [Fact]
    public async Task ObtenerMenuHoy_RN136_MenuCompletoNoDisponibleSiTodasLasOpcionesDeUnaParteEstanAgotadas()
    {
        // Arrange
        var fechaHoy = TimeZoneHelper.ObtenerFechaActualLima();
        var menu = new MenuDia(fechaHoy, "admin");

        var quaker = new Producto("Quaker", RolComponente.BebidaDesayuno);
        var seco = new Producto("Seco de pollo", RolComponente.PlatoDesayuno);

        menu.SincronizarPlatos(new[] { quaker.Id_Producto, seco.Id_Producto }, "admin");
        menu.SincronizarMenusCompletos(new[] { 1 }, "admin");

        // Marcamos la única bebida (Quaker) como agotada
        menu.CambiarDisponibilidadPlato(quaker.Id_Producto, agotado: true, "admin");

        // Mock navigations
        var platoQuaker = menu.Men_Platos.First(p => p.Id_Producto == quaker.Id_Producto);
        typeof(MenuDiaPlato).GetProperty(nameof(MenuDiaPlato.Mdp_Producto))!.SetValue(platoQuaker, quaker);

        var platoSeco = menu.Men_Platos.First(p => p.Id_Producto == seco.Id_Producto);
        typeof(MenuDiaPlato).GetProperty(nameof(MenuDiaPlato.Mdp_Producto))!.SetValue(platoSeco, seco);

        var mcDesayuno = new MenuCompleto(1, "Desayuno completo", 7.00m, true, "Pan");
        mcDesayuno.AgregarParte(new MenuCompletoParte(1, "Bebida", new[] { RolComponente.BebidaDesayuno }, 1));
        mcDesayuno.AgregarParte(new MenuCompletoParte(1, "Plato", new[] { RolComponente.PlatoDesayuno }, 2));

        var relMc = menu.Men_MenusCompletos.First();
        typeof(MenuDiaMenuCompleto).GetProperty(nameof(MenuDiaMenuCompleto.Mmc_MenuCompleto))!.SetValue(relMc, mcDesayuno);

        _mockMenuDiaRepo.Setup(r => r.ObtenerMenuHoyConDetalleAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(menu);

        // Act
        var result = await _service.ObtenerMenuHoyAsync();

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        var mcDto = Assert.Single(result.Data.MenusCompletos);
        Assert.False(mcDto.Disponible, "El menú completo debe figurar como no disponible.");
        var expectedMotivo = string.Format(MensajesCatalogo.MSG_220, "Desayuno completo", "Bebida");
        Assert.Equal(expectedMotivo, mcDto.MotivoNoDisponible);
    }

    [Fact]
    public async Task Punto2_D013_GuardarYLeerMenuDia_SinDesayuno_FuncionaCorrectamente()
    {
        // D-013: Eliminar definitivamente Id_Desayuno / DesayunoId de MenuDia.
        // Los desayunos se eligen en ProductosCarta y el desayuno completo es un MenuCompleto.
        var fechaHoy = TimeZoneHelper.ObtenerFechaActualLima();
        var platoCarta = new Producto("Desayuno Continental", CategoriaProducto.Desayuno, 18.00m, true);

        _mockProductoRepo.Setup(r => r.ObtenerPorIdsAsync(It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Producto> { platoCarta });

        MenuDia? menuGuardado = null;
        _mockMenuDiaRepo.Setup(r => r.ObtenerMenuHoyConDetalleAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(() => menuGuardado);

        _mockMenuDiaRepo.Setup(r => r.AgregarAsync(It.IsAny<MenuDia>(), It.IsAny<CancellationToken>()))
            .Callback<MenuDia, CancellationToken>((m, _) => {
                menuGuardado = m;
                // Simular navegación del plato guardado
                var plato = m.Men_Platos.First();
                typeof(MenuDiaPlato).GetProperty(nameof(MenuDiaPlato.Mdp_Producto))!.SetValue(plato, platoCarta);
            })
            .Returns(Task.CompletedTask);

        var request = new GuardarMenuDiaRequest
        {
            ProductosCarta = new List<Guid> { platoCarta.Id_Producto },
            MenusCompletos = new List<int>()
        };

        // ACT 1: Guardar menú sin desayuno
        var saveResult = await _service.GuardarMenuHoyAsync(request, "admin", "127.0.0.1");

        Assert.True(saveResult.Success);
        Assert.NotNull(menuGuardado);
        Assert.Null(typeof(MenuDia).GetProperty("Id_Desayuno")); // Id_Desayuno ya no existe en la entidad

        // ACT 2: Leer menú del día de hoy sin desayuno
        var readResult = await _service.ObtenerMenuHoyAsync();

        Assert.True(readResult.Success);
        Assert.NotNull(readResult.Data);
        Assert.True(readResult.Data.Definido);
        Assert.Single(readResult.Data.Platos);
        Assert.Equal(platoCarta.Pro_Nombre, readResult.Data.Platos[0].Nombre);
    }

    [Fact]
    public void GuardarMenuDiaRequest_NoContieneCampoResidualPlatoIds()
    {
        var requestType = typeof(GuardarMenuDiaRequest);
        var propiedadPlatoIds = requestType.GetProperty("PlatoIds", System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.IgnoreCase | System.Reflection.BindingFlags.Instance);
        Assert.Null(propiedadPlatoIds);

        var propiedades = requestType.GetProperties().Select(p => p.Name).ToList();
        Assert.Contains("ProductosCarta", propiedades);
        Assert.Contains("Opciones", propiedades);
        Assert.Contains("MenusCompletos", propiedades);
        Assert.DoesNotContain("PlatoIds", propiedades);
    }
}
