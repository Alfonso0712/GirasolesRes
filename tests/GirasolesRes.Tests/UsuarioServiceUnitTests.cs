using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Usuarios;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Interfaces.Security;
using GirasolesRes.Application.Services;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using Moq;
using Xunit;

namespace GirasolesRes.Tests;

public class UsuarioServiceUnitTests
{
    private readonly Mock<IUsuarioRepository> _usuarioRepoMock;
    private readonly Mock<IAuditoriaUsuarioRepository> _auditoriaRepoMock;
    private readonly Mock<IPasswordHasherService> _hasherMock;
    private readonly UsuarioService _service;

    public UsuarioServiceUnitTests()
    {
        _usuarioRepoMock = new Mock<IUsuarioRepository>();
        _auditoriaRepoMock = new Mock<IAuditoriaUsuarioRepository>();
        _hasherMock = new Mock<IPasswordHasherService>();

        _service = new UsuarioService(
            _usuarioRepoMock.Object,
            _auditoriaRepoMock.Object,
            _hasherMock.Object);
    }

    [Fact]
    public async Task RegistrarUsuarioAsync_DatosValidos_RegistraUsuarioYAuditoriaAtomicamente()
    {
        // ARRANGE
        var request = new CrearUsuarioRequest
        {
            Nombre = "Juan Perez",
            Usuario = "jperez",
            Correo = "jperez@girasoles.com",
            Contrasena = "Password123*",
            Rol = "Mozo"
        };

        _usuarioRepoMock.Setup(r => r.ExisteNombreUsuarioAsync("jperez", null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _usuarioRepoMock.Setup(r => r.ExisteCorreoAsync("jperez@girasoles.com", null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _hasherMock.Setup(h => h.HashPassword("Password123*"))
            .Returns("hashed_secret_pw");

        // ACT
        var resultado = await _service.RegistrarUsuarioAsync(request, "admin", "127.0.0.1");

        // ASSERT
        Assert.True(resultado.Success);
        Assert.Equal(MensajesCatalogo.MSG_25, resultado.Message);
        Assert.NotNull(resultado.Data);
        Assert.Equal("jperez", resultado.Data!.Usuario);
        Assert.Equal("Mozo", resultado.Data.Rol);

        _usuarioRepoMock.Verify(r => r.AgregarAsync(It.Is<Usuario>(u => u.Usu_Usuario == "jperez" && u.Usu_Activo), It.IsAny<CancellationToken>()), Times.Once);
        _auditoriaRepoMock.Verify(a => a.RegistrarAsync(It.Is<AuditoriaUsuario>(au => au.Aud_NombreAdmin == "admin" && au.Aud_Accion == "REGISTRO"), It.IsAny<CancellationToken>()), Times.Once);
        _usuarioRepoMock.Verify(r => r.GuardarCambiosAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task RegistrarUsuarioAsync_NombreUsuarioDuplicado_RetornaConflictoMSG21()
    {
        // ARRANGE
        var request = new CrearUsuarioRequest
        {
            Nombre = "Carlos Lopez",
            Usuario = "clopez",
            Contrasena = "Password123*",
            Rol = "Mozo"
        };

        _usuarioRepoMock.Setup(r => r.ExisteNombreUsuarioAsync("clopez", null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // ACT
        var resultado = await _service.RegistrarUsuarioAsync(request, "admin");

        // ASSERT
        Assert.False(resultado.Success);
        Assert.Equal(MensajesCatalogo.MSG_21, resultado.Message);
        _usuarioRepoMock.Verify(r => r.AgregarAsync(It.IsAny<Usuario>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task RegistrarUsuarioAsync_CorreoDuplicado_RetornaConflictoMSG24()
    {
        // ARRANGE
        var request = new CrearUsuarioRequest
        {
            Nombre = "Ana Garcia",
            Usuario = "agarcia",
            Correo = "agarcia@girasoles.com",
            Contrasena = "Password123*",
            Rol = "Administrador"
        };

        _usuarioRepoMock.Setup(r => r.ExisteNombreUsuarioAsync("agarcia", null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _usuarioRepoMock.Setup(r => r.ExisteCorreoAsync("agarcia@girasoles.com", null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // ACT
        var resultado = await _service.RegistrarUsuarioAsync(request, "admin");

        // ASSERT
        Assert.False(resultado.Success);
        Assert.Equal(MensajesCatalogo.MSG_24, resultado.Message);
        _usuarioRepoMock.Verify(r => r.AgregarAsync(It.IsAny<Usuario>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task CambiarEstadoAsync_AutoDesactivacion_RetornaErrorMSG31_RN10()
    {
        // ARRANGE
        var adminId = Guid.NewGuid();
        var adminUser = new Usuario("admin_master", "Super Admin", "admin@girasoles.com", "hash", RolUsuario.Administrador, true);

        _usuarioRepoMock.Setup(r => r.ObtenerPorIdAsync(adminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(adminUser);

        // ACT - El administrador logueado "admin_master" intenta desactivar su propia cuenta
        var resultado = await _service.CambiarEstadoAsync(adminId, false, "admin_master");

        // ASSERT
        Assert.False(resultado.Success);
        Assert.Equal(MensajesCatalogo.MSG_31, resultado.Message);
        Assert.True(adminUser.Usu_Activo); // No se modificó el estado
        _usuarioRepoMock.Verify(r => r.ActualizarAsync(It.IsAny<Usuario>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task CambiarEstadoAsync_UltimoAdministradorActivo_RetornaErrorMSG32_RN10()
    {
        // ARRANGE
        var otroAdminId = Guid.NewGuid();
        var otroAdmin = new Usuario("segundo_admin", "Segundo Admin", "admin2@girasoles.com", "hash", RolUsuario.Administrador, true);

        _usuarioRepoMock.Setup(r => r.ObtenerPorIdAsync(otroAdminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(otroAdmin);
        _usuarioRepoMock.Setup(r => r.ContarAdministradoresActivosAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1); // Solo queda 1 activo

        // ACT - "admin_master" intenta desactivar al único admin activo que queda en el sistema
        var resultado = await _service.CambiarEstadoAsync(otroAdminId, false, "admin_master");

        // ASSERT
        Assert.False(resultado.Success);
        Assert.Equal(MensajesCatalogo.MSG_32, resultado.Message);
        Assert.True(otroAdmin.Usu_Activo);
    }

    [Fact]
    public async Task EliminarUsuarioAsync_AutoEliminacion_RetornaErrorMSG31_RN10()
    {
        // ARRANGE
        var adminId = Guid.NewGuid();
        var adminUser = new Usuario("admin_master", "Super Admin", "admin@girasoles.com", "hash", RolUsuario.Administrador, true);

        _usuarioRepoMock.Setup(r => r.ObtenerPorIdAsync(adminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(adminUser);

        // ACT
        var resultado = await _service.EliminarUsuarioAsync(adminId, "admin_master");

        // ASSERT
        Assert.False(resultado.Success);
        Assert.Equal(MensajesCatalogo.MSG_31, resultado.Message);
        _usuarioRepoMock.Verify(r => r.EliminarAsync(It.IsAny<Usuario>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task EliminarUsuarioAsync_ConMovimientos_RetornaErrorMSG34_RN11()
    {
        // ARRANGE
        var mozoId = Guid.NewGuid();
        var mozoUser = new Usuario("mozo_juan", "Juan Mozo", null, "hash", RolUsuario.Mozo, true);

        _usuarioRepoMock.Setup(r => r.ObtenerPorIdAsync(mozoId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mozoUser);
        _usuarioRepoMock.Setup(r => r.TieneMovimientosAsync(mozoId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true); // Tiene pedidos o ventas asociadas

        // ACT
        var resultado = await _service.EliminarUsuarioAsync(mozoId, "admin_master");

        // ASSERT
        Assert.False(resultado.Success);
        Assert.Equal(MensajesCatalogo.MSG_34, resultado.Message);
        _usuarioRepoMock.Verify(r => r.EliminarAsync(It.IsAny<Usuario>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
