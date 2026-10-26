using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using Xunit;

namespace GirasolesRes.Tests;

public class ComandaDomainUnitTests
{
    [Fact]
    public void IniciarPreparacion_DesdePendiente_TransicionaAEnPreparacionYRegistraAuditoria()
    {
        // Arrange
        var comanda = new Comanda(Guid.NewGuid(), 1, "Mesa 1", cmdEsAdicional: false);
        Assert.Equal(EstadoComanda.Pendiente, comanda.Cmd_Estado);
        Assert.Null(comanda.Cmd_EstadoAnterior);

        // Act
        comanda.IniciarPreparacion("cocinero_test");

        // Assert
        Assert.Equal(EstadoComanda.EnPreparacion, comanda.Cmd_Estado);
        Assert.Equal(EstadoComanda.Pendiente, comanda.Cmd_EstadoAnterior);
        Assert.Equal("cocinero_test", comanda.Cmd_NomUsuarioPreparacion);
        Assert.NotNull(comanda.Cmd_FecInicioPreparacionUtc);
        Assert.NotNull(comanda.Cmd_FecUltimoCambioEstadoUtc);
    }

    [Fact]
    public void IniciarPreparacion_DesdeEstadoNoPendiente_LanzaInvalidOperationException()
    {
        // Arrange
        var comanda = new Comanda(Guid.NewGuid(), 1, "Mesa 1");
        comanda.IniciarPreparacion("cocinero1");

        // Act & Assert (intentar iniciar cuando ya está en preparación)
        var ex = Assert.Throws<InvalidOperationException>(() => comanda.IniciarPreparacion("cocinero2"));
        Assert.Contains("Solo una comanda en estado Pendiente puede pasar a En preparación", ex.Message);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void IniciarPreparacion_UsuarioInvalido_LanzaArgumentException(string? usuario)
    {
        var comanda = new Comanda(Guid.NewGuid(), 1, "Mesa 1");
        Assert.Throws<ArgumentException>(() => comanda.IniciarPreparacion(usuario!));
    }

    [Fact]
    public void MarcarComoLista_DesdeEnPreparacion_TransicionaAListaYRegistraAuditoria()
    {
        // Arrange
        var comanda = new Comanda(Guid.NewGuid(), 1, "Mesa 1");
        comanda.IniciarPreparacion("cocinero1");

        // Act
        comanda.MarcarComoLista("cocinero1");

        // Assert
        Assert.Equal(EstadoComanda.Lista, comanda.Cmd_Estado);
        Assert.Equal(EstadoComanda.EnPreparacion, comanda.Cmd_EstadoAnterior);
        Assert.Equal("cocinero1", comanda.Cmd_NomUsuarioLista);
        Assert.NotNull(comanda.Cmd_FecListaUtc);
        Assert.NotNull(comanda.Cmd_FecUltimoCambioEstadoUtc);
        Assert.False(comanda.Cmd_AvisoVisto);
    }

    [Fact]
    public void MarcarComoLista_DirectoDesdePendiente_LanzaInvalidOperationException()
    {
        // Arrange (intentar saltar de Pendiente directo a Lista)
        var comanda = new Comanda(Guid.NewGuid(), 1, "Mesa 1");

        // Act & Assert
        var ex = Assert.Throws<InvalidOperationException>(() => comanda.MarcarComoLista("cocinero1"));
        Assert.Contains("Solo una comanda en preparación puede marcarse como lista", ex.Message);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void MarcarComoLista_UsuarioInvalido_LanzaArgumentException(string? usuario)
    {
        var comanda = new Comanda(Guid.NewGuid(), 1, "Mesa 1");
        comanda.IniciarPreparacion("cocinero1");

        Assert.Throws<ArgumentException>(() => comanda.MarcarComoLista(usuario!));
    }

    [Fact]
    public void DeshacerUltimoEstado_DesdeEnPreparacion_RestauraAPendienteYBorraDatosPreparacion()
    {
        // Arrange
        var comanda = new Comanda(Guid.NewGuid(), 1, "Mesa 1");
        comanda.IniciarPreparacion("cocinero1");

        // Act
        comanda.DeshacerUltimoEstado();

        // Assert
        Assert.Equal(EstadoComanda.Pendiente, comanda.Cmd_Estado);
        Assert.Null(comanda.Cmd_EstadoAnterior);
        Assert.Null(comanda.Cmd_NomUsuarioPreparacion);
        Assert.Null(comanda.Cmd_FecInicioPreparacionUtc);
        Assert.NotNull(comanda.Cmd_FecUltimoCambioEstadoUtc);
    }

    [Fact]
    public void DeshacerUltimoEstado_DesdeLista_RestauraAEnPreparacionYBorraDatosLista()
    {
        // Arrange
        var comanda = new Comanda(Guid.NewGuid(), 1, "Mesa 1");
        comanda.IniciarPreparacion("cocinero1");
        comanda.MarcarComoLista("cocinero1");

        // Act
        comanda.DeshacerUltimoEstado();

        // Assert
        Assert.Equal(EstadoComanda.EnPreparacion, comanda.Cmd_Estado);
        Assert.Null(comanda.Cmd_EstadoAnterior);
        Assert.Null(comanda.Cmd_NomUsuarioLista);
        Assert.Null(comanda.Cmd_FecListaUtc);
        Assert.True(comanda.Cmd_AvisoVisto);
        Assert.NotNull(comanda.Cmd_FecUltimoCambioEstadoUtc);
    }

    [Fact]
    public void DeshacerUltimoEstado_SinEstadoAnterior_LanzaInvalidOperationException()
    {
        // Arrange
        var comanda = new Comanda(Guid.NewGuid(), 1, "Mesa 1");

        // Act & Assert
        var ex = Assert.Throws<InvalidOperationException>(() => comanda.DeshacerUltimoEstado());
        Assert.Contains("No se puede deshacer: la comanda no tiene un estado anterior registrado", ex.Message);
    }

    [Fact]
    public void Cancelar_ComandaValida_TransicionaACanceladaYRegistraAuditoria()
    {
        // Arrange
        var comanda = new Comanda(Guid.NewGuid(), 1, "Mesa 1");
        comanda.IniciarPreparacion("cocinero1");

        // Act
        comanda.Cancelar();

        // Assert
        Assert.Equal(EstadoComanda.Cancelada, comanda.Cmd_Estado);
        Assert.Equal(EstadoComanda.EnPreparacion, comanda.Cmd_EstadoAnterior);
        Assert.NotNull(comanda.Cmd_FecUltimoCambioEstadoUtc);
    }
}
