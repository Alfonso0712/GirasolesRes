using System.Reflection;
using System.Security.Claims;
using GirasolesRes.API.Controllers;
using GirasolesRes.Application.Common.Exceptions;
using GirasolesRes.Application.DTOs.Auth;
using GirasolesRes.Application.DTOs.Perfil;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Interfaces.Security;
using GirasolesRes.Application.Interfaces.Services;
using GirasolesRes.Application.Services;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace GirasolesRes.Tests;

public class ModoZurdoBackendUnitTests
{
    // =========================================================================
    // 1) Usuario.ActualizarOrientacion
    // =========================================================================

    [Theory]
    [InlineData("right", "right")]
    [InlineData("left", "left")]
    [InlineData("  LEFT  ", "left")]
    [InlineData("  RIGHT  ", "right")]
    [InlineData("Left", "left")]
    [InlineData("RIGHT", "right")]
    public void Usuario_ActualizarOrientacion_AceptaYNormalizaValoresValidos(string entrada, string esperado)
    {
        // Arrange
        var usuario = new Usuario("usuario1", "Usuario Uno", "u1@girasoles.com", "hash", RolUsuario.Mozo, true);

        // Act
        usuario.ActualizarOrientacion(entrada);

        // Assert
        Assert.Equal(esperado, usuario.Usu_Orientacion);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    [InlineData("center")]
    [InlineData("desconocido")]
    [InlineData("auto")]
    [InlineData("system")]
    public void Usuario_ActualizarOrientacion_RechazaValoresInvalidos(string? valorInvalido)
    {
        // Arrange
        var usuario = new Usuario("usuario1", "Usuario Uno", "u1@girasoles.com", "hash", RolUsuario.Mozo, true);

        // Act & Assert
        var ex = Assert.Throws<ArgumentException>(() => usuario.ActualizarOrientacion(valorInvalido!));
        Assert.Equal("orientacion", ex.ParamName);
    }

    // =========================================================================
    // 2) PerfilService: ActualizarOrientacionAsync y ObtenerOrientacionAsync
    // =========================================================================

    [Fact]
    public async Task PerfilService_ActualizarOrientacionAsync_PersisteCambioSinAuditoria()
    {
        // Arrange
        var usuario = new Usuario("usuario1", "Usuario Uno", "u1@girasoles.com", "hash", RolUsuario.Cajero, true);
        var usuarioRepoMock = new Mock<IUsuarioRepository>();
        var auditoriaRepoMock = new Mock<IAuditoriaUsuarioRepository>();

        usuarioRepoMock
            .Setup(r => r.ObtenerPorIdAsync(usuario.Id_Usuario, It.IsAny<CancellationToken>()))
            .ReturnsAsync(usuario);

        var service = new PerfilService(
            usuarioRepoMock.Object,
            auditoriaRepoMock.Object,
            Mock.Of<ITokenRevocadoRepository>(),
            Mock.Of<IPasswordHasherService>(),
            Mock.Of<IJwtGenerator>());

        // Act
        await service.ActualizarOrientacionAsync(usuario.Id_Usuario, "left");

        // Assert
        Assert.Equal("left", usuario.Usu_Orientacion);
        usuarioRepoMock.Verify(r => r.ActualizarAsync(usuario, It.IsAny<CancellationToken>()), Times.Once);
        usuarioRepoMock.Verify(r => r.GuardarCambiosAsync(It.IsAny<CancellationToken>()), Times.Once);
        auditoriaRepoMock.Verify(a => a.RegistrarAsync(It.IsAny<AuditoriaUsuario>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task PerfilService_ActualizarOrientacionAsync_LanzaKeyNotFoundSiUsuarioNoExiste()
    {
        // Arrange
        var usuarioRepoMock = new Mock<IUsuarioRepository>();
        var service = new PerfilService(
            usuarioRepoMock.Object,
            Mock.Of<IAuditoriaUsuarioRepository>(),
            Mock.Of<ITokenRevocadoRepository>(),
            Mock.Of<IPasswordHasherService>(),
            Mock.Of<IJwtGenerator>());

        usuarioRepoMock
            .Setup(r => r.ObtenerPorIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Usuario?)null);

        // Act & Assert
        await Assert.ThrowsAsync<RecursoNoEncontradoException>(() => service.ActualizarOrientacionAsync(Guid.NewGuid(), "left"));
    }

    [Fact]
    public async Task PerfilService_ActualizarOrientacionAsync_LanzaInvalidOperationSiUsuarioEstaInactivo()
    {
        // Arrange
        var usuarioInactivo = new Usuario("inactivo", "Usuario Inactivo", "i@g.com", "hash", RolUsuario.Mozo, false);
        var usuarioRepoMock = new Mock<IUsuarioRepository>();
        var service = new PerfilService(
            usuarioRepoMock.Object,
            Mock.Of<IAuditoriaUsuarioRepository>(),
            Mock.Of<ITokenRevocadoRepository>(),
            Mock.Of<IPasswordHasherService>(),
            Mock.Of<IJwtGenerator>());

        usuarioRepoMock
            .Setup(r => r.ObtenerPorIdAsync(usuarioInactivo.Id_Usuario, It.IsAny<CancellationToken>()))
            .ReturnsAsync(usuarioInactivo);

        // Act & Assert
        await Assert.ThrowsAsync<ConflictoException>(() => service.ActualizarOrientacionAsync(usuarioInactivo.Id_Usuario, "left"));
    }

    [Fact]
    public async Task PerfilService_ObtenerOrientacionAsync_DevuelveValorGuardado()
    {
        // Arrange
        var usuario = new Usuario("usuario1", "Usuario Uno", "u1@girasoles.com", "hash", RolUsuario.Mozo, true);
        usuario.ActualizarOrientacion("left");

        var usuarioRepoMock = new Mock<IUsuarioRepository>();
        usuarioRepoMock
            .Setup(r => r.ObtenerPorIdAsync(usuario.Id_Usuario, It.IsAny<CancellationToken>()))
            .ReturnsAsync(usuario);

        var service = new PerfilService(
            usuarioRepoMock.Object,
            Mock.Of<IAuditoriaUsuarioRepository>(),
            Mock.Of<ITokenRevocadoRepository>(),
            Mock.Of<IPasswordHasherService>(),
            Mock.Of<IJwtGenerator>());

        // Act
        var orientacion = await service.ObtenerOrientacionAsync(usuario.Id_Usuario);

        // Assert
        Assert.Equal("left", orientacion);
    }

    // =========================================================================
    // 3) PerfilController.ActualizarOrientacion
    // =========================================================================

    [Fact]
    public async Task PerfilController_ActualizarOrientacion_Retorna200OkConPayload()
    {
        // Arrange
        var usuarioId = Guid.NewGuid();
        var perfilServiceMock = new Mock<IPerfilService>();
        perfilServiceMock
            .Setup(s => s.ActualizarOrientacionAsync(usuarioId, "left", It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var controller = new PerfilController(perfilServiceMock.Object, Mock.Of<ILogger<PerfilController>>());
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, usuarioId.ToString()),
                    new Claim(ClaimTypes.Name, "testuser"),
                    new Claim(ClaimTypes.Role, "Mozo")
                }, "TestAuth"))
            }
        };

        var request = new ActualizarOrientacionRequest { Orientacion = "left" };

        // Act
        var resultado = await controller.ActualizarOrientacion(request, CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(resultado);
        Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);
        perfilServiceMock.Verify(s => s.ActualizarOrientacionAsync(usuarioId, "left", It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public void PerfilController_ActualizarOrientacion_RequiereAtributoAuthorize()
    {
        var metodo = typeof(PerfilController).GetMethod(nameof(PerfilController.ActualizarOrientacion));
        Assert.NotNull(metodo);
        var attr = metodo!.GetCustomAttribute<AuthorizeAttribute>();
        Assert.NotNull(attr);
    }
}
