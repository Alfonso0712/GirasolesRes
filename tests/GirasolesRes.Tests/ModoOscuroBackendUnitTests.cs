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

public class ModoOscuroBackendUnitTests
{
    // =========================================================================
    // 1) Usuario.ActualizarTema
    // =========================================================================

    [Theory]
    [InlineData("light", "light")]
    [InlineData("dark", "dark")]
    [InlineData("  DARK  ", "dark")]
    [InlineData("  LIGHT  ", "light")]
    [InlineData("Dark", "dark")]
    [InlineData("LIGHT", "light")]
    public void Usuario_ActualizarTema_AceptaYNormalizaValoresValidos(string entrada, string esperado)
    {
        // Arrange
        var usuario = new Usuario("usuario1", "Usuario Uno", "u1@girasoles.com", "hash", RolUsuario.Mozo, true);

        // Act
        usuario.ActualizarTema(entrada);

        // Assert
        Assert.Equal(esperado, usuario.Usu_Tema);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    [InlineData("blue")]
    [InlineData("desconocido")]
    [InlineData("auto")]
    [InlineData("system")]
    public void Usuario_ActualizarTema_RechazaValoresInvalidos(string? valorInvalido)
    {
        // Arrange
        var usuario = new Usuario("usuario1", "Usuario Uno", "u1@girasoles.com", "hash", RolUsuario.Mozo, true);

        // Act & Assert
        var ex = Assert.Throws<ArgumentException>(() => usuario.ActualizarTema(valorInvalido!));
        Assert.Equal("tema", ex.ParamName);
    }

    [Fact]
    public void Usuario_ActualizarTema_NoModificaFechaActualizacionUtc()
    {
        // Arrange
        var usuario = new Usuario("usuario1", "Usuario Uno", "u1@girasoles.com", "hash", RolUsuario.Mozo, true);
        var fechaActualizacionInicial = usuario.Usu_FechaActualizacionUtc;

        // Act
        usuario.ActualizarTema("dark");

        // Assert
        Assert.Equal(fechaActualizacionInicial, usuario.Usu_FechaActualizacionUtc);
    }

    // =========================================================================
    // 2) PerfilService: ActualizarTemaAsync y ObtenerTemaAsync
    // =========================================================================

    [Fact]
    public async Task PerfilService_ActualizarTemaAsync_PersisteCambioSinAuditoria()
    {
        // Arrange
        var usuario = new Usuario("usuario1", "Usuario Uno", "u1@girasoles.com", "hash", RolUsuario.Cajero, true);
        var usuarioRepoMock = new Mock<IUsuarioRepository>();
        var auditoriaRepoMock = new Mock<IAuditoriaUsuarioRepository>();
        var tokenRepoMock = new Mock<ITokenRevocadoRepository>();
        var hasherMock = new Mock<IPasswordHasherService>();
        var jwtMock = new Mock<IJwtGenerator>();

        usuarioRepoMock
            .Setup(r => r.ObtenerPorIdAsync(usuario.Id_Usuario, It.IsAny<CancellationToken>()))
            .ReturnsAsync(usuario);

        var service = new PerfilService(
            usuarioRepoMock.Object,
            auditoriaRepoMock.Object,
            tokenRepoMock.Object,
            hasherMock.Object,
            jwtMock.Object);

        // Act
        await service.ActualizarTemaAsync(usuario.Id_Usuario, "dark");

        // Assert
        Assert.Equal("dark", usuario.Usu_Tema);
        usuarioRepoMock.Verify(r => r.ActualizarAsync(usuario, It.IsAny<CancellationToken>()), Times.Once);
        usuarioRepoMock.Verify(r => r.GuardarCambiosAsync(It.IsAny<CancellationToken>()), Times.Once);
        // Garantizar que NO se registre auditoría
        auditoriaRepoMock.Verify(a => a.RegistrarAsync(It.IsAny<AuditoriaUsuario>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task PerfilService_ActualizarTemaAsync_LanzaKeyNotFoundSiUsuarioNoExiste()
    {
        // Arrange
        var usuarioRepoMock = new Mock<IUsuarioRepository>();
        var auditoriaRepoMock = new Mock<IAuditoriaUsuarioRepository>();
        var service = new PerfilService(
            usuarioRepoMock.Object,
            auditoriaRepoMock.Object,
            Mock.Of<ITokenRevocadoRepository>(),
            Mock.Of<IPasswordHasherService>(),
            Mock.Of<IJwtGenerator>());

        usuarioRepoMock
            .Setup(r => r.ObtenerPorIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Usuario?)null);

        // Act & Assert
        await Assert.ThrowsAsync<RecursoNoEncontradoException>(() => service.ActualizarTemaAsync(Guid.NewGuid(), "dark"));
    }

    [Fact]
    public async Task PerfilService_ActualizarTemaAsync_LanzaInvalidOperationSiUsuarioEstaInactivo()
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
        await Assert.ThrowsAsync<ConflictoException>(() => service.ActualizarTemaAsync(usuarioInactivo.Id_Usuario, "dark"));
    }

    [Fact]
    public async Task PerfilService_ObtenerTemaAsync_DevuelveValorGuardado()
    {
        // Arrange
        var usuario = new Usuario("usuario1", "Usuario Uno", "u1@girasoles.com", "hash", RolUsuario.Mozo, true);
        usuario.ActualizarTema("dark");

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
        var tema = await service.ObtenerTemaAsync(usuario.Id_Usuario);

        // Assert
        Assert.Equal("dark", tema);
    }

    [Fact]
    public async Task PerfilService_ObtenerTemaAsync_DevuelveLightSiUsuarioNoExiste()
    {
        // Arrange
        var usuarioRepoMock = new Mock<IUsuarioRepository>();
        usuarioRepoMock
            .Setup(r => r.ObtenerPorIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Usuario?)null);

        var service = new PerfilService(
            usuarioRepoMock.Object,
            Mock.Of<IAuditoriaUsuarioRepository>(),
            Mock.Of<ITokenRevocadoRepository>(),
            Mock.Of<IPasswordHasherService>(),
            Mock.Of<IJwtGenerator>());

        // Act
        var tema = await service.ObtenerTemaAsync(Guid.NewGuid());

        // Assert
        Assert.Equal("light", tema);
    }

    // =========================================================================
    // 3) Login devuelve Tema con el valor del usuario
    // =========================================================================

    [Theory]
    [InlineData("dark")]
    [InlineData("light")]
    public async Task AuthService_IniciarSesion_DevuelveTemaDelUsuario(string temaUsuario)
    {
        // Arrange
        var usuario = new Usuario("crojas", "Carlos Rojas", "crojas@girasoles.com", "hashed_pwd", RolUsuario.Administrador, true);
        usuario.ActualizarTema(temaUsuario);

        var usuarioRepoMock = new Mock<IUsuarioRepository>();
        usuarioRepoMock
            .Setup(r => r.ObtenerPorNombreUsuarioAsync("crojas", It.IsAny<CancellationToken>()))
            .ReturnsAsync(usuario);

        var hasherMock = new Mock<IPasswordHasherService>();
        hasherMock
            .Setup(h => h.VerifyPassword("hashed_pwd", "ClaveSegura123"))
            .Returns(true);

        var jwtMock = new Mock<IJwtGenerator>();
        jwtMock
            .Setup(j => j.GenerarToken(usuario))
            .Returns("fake_jwt_token");

        var authService = new AuthService(
            usuarioRepoMock.Object,
            Mock.Of<IRegistroIngresoRepository>(),
            Mock.Of<ICodigoRecuperacionRepository>(),
            Mock.Of<ITokenRevocadoRepository>(),
            Mock.Of<IAuditoriaUsuarioRepository>(),
            hasherMock.Object,
            jwtMock.Object,
            Mock.Of<IEmailService>());

        var request = new LoginRequest
        {
            Usuario = "crojas",
            Contrasena = "ClaveSegura123"
        };

        // Act
        var resultado = await authService.IniciarSesionAsync(request);

        // Assert
        Assert.True(resultado.IsSuccess);
        Assert.NotNull(resultado.Data);
        Assert.Equal(temaUsuario, resultado.Data.Tema);
    }

    // =========================================================================
    // 4) RBAC del controlador: PATCH /api/perfil/tema
    // =========================================================================

    [Theory]
    [InlineData("Administrador")]
    [InlineData("Cajero")]
    [InlineData("Mozo")]
    [InlineData("Cocinero")]
    public async Task PerfilController_ActualizarTema_AccesibleParaLosCuatroRoles(string rol)
    {
        // Arrange
        var usuarioId = Guid.NewGuid();
        var perfilServiceMock = new Mock<IPerfilService>();
        perfilServiceMock
            .Setup(s => s.ActualizarTemaAsync(usuarioId, "dark", It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var loggerMock = new Mock<ILogger<PerfilController>>();
        var controller = new PerfilController(perfilServiceMock.Object, loggerMock.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, usuarioId.ToString()),
                        new Claim(ClaimTypes.Role, rol),
                        new Claim(ClaimTypes.Name, "usuario_prueba")
                    }, "Bearer"))
                }
            }
        };

        var request = new ActualizarTemaRequest { Tema = "dark" };

        // Act
        var result = await controller.ActualizarTema(request, CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);
    }

    [Fact]
    public void PerfilController_ActualizarTema_TieneAtributoAuthorizeSinExclusionesDeRol()
    {
        // Arrange
        var method = typeof(PerfilController).GetMethod(nameof(PerfilController.ActualizarTema));
        Assert.NotNull(method);

        // Act
        var authorizeAttr = method.GetCustomAttribute<AuthorizeAttribute>();

        // Assert: El endpoint exige autenticación
        Assert.NotNull(authorizeAttr);
        // Assert: No restringe por roles a nivel de atributo (Roles es nulo o vacío)
        Assert.True(string.IsNullOrEmpty(authorizeAttr.Roles));
    }

    [Fact]
    public async Task PerfilController_ActualizarTema_SinClaimUsuarioId_Devuelve401Unauthorized()
    {
        // Arrange
        var perfilServiceMock = new Mock<IPerfilService>();
        var loggerMock = new Mock<ILogger<PerfilController>>();
        var controller = new PerfilController(perfilServiceMock.Object, loggerMock.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    // Usuario autenticado pero sin NameIdentifier válido
                    User = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] { }, "Bearer"))
                }
            }
        };

        var request = new ActualizarTemaRequest { Tema = "dark" };

        // Act
        var result = await controller.ActualizarTema(request, CancellationToken.None);

        // Assert
        var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Equal(StatusCodes.Status401Unauthorized, unauthorizedResult.StatusCode);
    }

    // =========================================================================
    // 5) Entrada inválida produce 400
    // =========================================================================

    [Fact]
    public async Task PerfilController_ActualizarTema_ModelStateInvalido_Produce400BadRequest()
    {
        // Arrange
        var perfilServiceMock = new Mock<IPerfilService>();
        var loggerMock = new Mock<ILogger<PerfilController>>();
        var controller = new PerfilController(perfilServiceMock.Object, loggerMock.Object);
        controller.ModelState.AddModelError("Tema", "El tema debe ser 'light' o 'dark'.");

        var request = new ActualizarTemaRequest { Tema = "invalid_theme" };

        // Act
        var result = await controller.ActualizarTema(request, CancellationToken.None);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(StatusCodes.Status400BadRequest, badRequestResult.StatusCode);
    }

    [Theory]
    [InlineData("light", true)]
    [InlineData("dark", true)]
    [InlineData("LIGHT", true)]
    [InlineData("Dark", true)]
    [InlineData("invalid", false)]
    [InlineData("", false)]
    [InlineData(null, false)]
    public void ActualizarTemaRequest_Validate_RechazaValoresInvalidos(string? tema, bool esperadoValido)
    {
        // Arrange
        var request = new ActualizarTemaRequest { Tema = tema! };
        var validationContext = new System.ComponentModel.DataAnnotations.ValidationContext(request);
        var validationResults = new List<System.ComponentModel.DataAnnotations.ValidationResult>();

        // Act
        var esValido = System.ComponentModel.DataAnnotations.Validator.TryValidateObject(
            request,
            validationContext,
            validationResults,
            validateAllProperties: true);

        // Assert
        Assert.Equal(esperadoValido, esValido);
    }
}
