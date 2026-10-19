using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.MenusCompletos;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Services;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using Moq;
using Xunit;

namespace GirasolesRes.Tests;

public class MenuCompletoServiceUnitTests
{
    private readonly Mock<IMenuCompletoRepository> _menuRepoMock;
    private readonly Mock<IAuditoriaUsuarioRepository> _auditoriaRepoMock;
    private readonly MenuCompletoService _service;

    public MenuCompletoServiceUnitTests()
    {
        _menuRepoMock = new Mock<IMenuCompletoRepository>();
        _auditoriaRepoMock = new Mock<IAuditoriaUsuarioRepository>();

        _service = new MenuCompletoService(
            _menuRepoMock.Object,
            _auditoriaRepoMock.Object);
    }

    [Fact]
    public async Task ActualizarPrecioAsync_PrecioValido_ActualizaPrecioYRegistraAuditoria_RV160()
    {
        // ARRANGE
        var menu = new MenuCompleto(1, "Desayuno completo", 7.00m, menActivo: true, menIncluye: "Pan");
        menu.AgregarParte(new MenuCompletoParte(1, "Bebida", new[] { RolComponente.BebidaDesayuno }, 1));
        menu.AgregarParte(new MenuCompletoParte(1, "Plato", new[] { RolComponente.PlatoDesayuno }, 2));

        _menuRepoMock.Setup(r => r.ObtenerPorIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(menu);

        var request = new ActualizarPrecioMenuCompletoRequest
        {
            Precio = 8.50m
        };

        // ACT
        var resultado = await _service.ActualizarPrecioAsync(1, request, "admin", "127.0.0.1");

        // ASSERT
        Assert.True(resultado.Success);
        Assert.Equal(MensajesCatalogo.MSG_217, resultado.Message);
        Assert.NotNull(resultado.Data);
        Assert.Equal(8.50m, resultado.Data!.Precio);
        Assert.Equal(8.50m, menu.Men_Precio);

        _auditoriaRepoMock.Verify(a => a.RegistrarAsync(
            It.Is<AuditoriaUsuario>(au => 
                au.Aud_Accion == "EDITAR_MENU_COMPLETO" && 
                au.Aud_NombreAdmin == "admin" &&
                au.Aud_Detalle!.Contains("7.00") &&
                au.Aud_Detalle.Contains("8.50")),
            It.IsAny<CancellationToken>()), Times.Once);

        _menuRepoMock.Verify(r => r.GuardarCambiosAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ActualizarPrecioAsync_PrecioCeroONegativo_RetornaErrorMSG55_RV160()
    {
        // ARRANGE
        var request = new ActualizarPrecioMenuCompletoRequest
        {
            Precio = 0.00m
        };

        // ACT
        var resultado = await _service.ActualizarPrecioAsync(1, request, "admin");

        // ASSERT
        Assert.False(resultado.Success);
        Assert.Equal(MensajesCatalogo.MSG_55, resultado.Message);
        _menuRepoMock.Verify(r => r.GuardarCambiosAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ActualizarPrecioAsync_PrecioMayorA999_RetornaErrorMSG56_RV160()
    {
        // ARRANGE
        var request = new ActualizarPrecioMenuCompletoRequest
        {
            Precio = 1200.00m
        };

        // ACT
        var resultado = await _service.ActualizarPrecioAsync(1, request, "admin");

        // ASSERT
        Assert.False(resultado.Success);
        Assert.Equal(MensajesCatalogo.MSG_56, resultado.Message);
        _menuRepoMock.Verify(r => r.GuardarCambiosAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task CambiarEstadoAsync_AlternarEstado_ActualizaActivoYRegistraAuditoria()
    {
        // ARRANGE
        var menu = new MenuCompleto(2, "Almuerzo completo", 8.00m, menActivo: true);
        _menuRepoMock.Setup(r => r.ObtenerPorIdAsync(2, It.IsAny<CancellationToken>()))
            .ReturnsAsync(menu);

        var request = new CambiarEstadoMenuCompletoRequest
        {
            Activo = false
        };

        // ACT
        var resultado = await _service.CambiarEstadoAsync(2, request, "admin", "127.0.0.1");

        // ASSERT
        Assert.True(resultado.Success);
        Assert.Equal(MensajesCatalogo.MSG_217, resultado.Message);
        Assert.NotNull(resultado.Data);
        Assert.False(resultado.Data!.Activo);
        Assert.False(menu.Men_Activo);

        _auditoriaRepoMock.Verify(a => a.RegistrarAsync(
            It.Is<AuditoriaUsuario>(au => 
                au.Aud_Accion == "DESACTIVAR_MENU_COMPLETO" &&
                au.Aud_Detalle!.Contains("Inactivo")),
            It.IsAny<CancellationToken>()), Times.Once);

        _menuRepoMock.Verify(r => r.GuardarCambiosAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
