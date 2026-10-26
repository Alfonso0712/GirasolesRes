using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Mesas;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Services;
using GirasolesRes.Domain.Common;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using Moq;
using Xunit;

namespace GirasolesRes.Tests;

public class MesaServiceUnitTests
{
    private readonly Mock<IMesaRepository> _mesaRepoMock;
    private readonly Mock<IAuditoriaMesaRepository> _auditoriaMesaRepoMock;
    private readonly MesaService _service;

    public MesaServiceUnitTests()
    {
        _mesaRepoMock = new Mock<IMesaRepository>();
        _auditoriaMesaRepoMock = new Mock<IAuditoriaMesaRepository>();

        _service = new MesaService(
            _mesaRepoMock.Object,
            _auditoriaMesaRepoMock.Object);
    }

    [Fact]
    public async Task RegistrarMesaAsync_DatosValidos_RegistraMesaActivaYLibreAtomicamente_RN42()
    {
        // ARRANGE
        var request = new CrearMesaRequest
        {
            Nombre = "  Mesa   5  "
        };

        _mesaRepoMock.Setup(r => r.ExisteNombreNormalizadoAsync("MESA 5", null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // ACT
        var resultado = await _service.RegistrarMesaAsync(request, "admin", "127.0.0.1");

        // ASSERT
        Assert.True(resultado.IsSuccess);
        Assert.Equal(MensajesCatalogo.MSG_84, resultado.Message);
        Assert.NotNull(resultado.Data);
        Assert.Equal("Mesa 5", resultado.Data!.Nombre); // Limpieza de espacios redundantes RV-53
        Assert.Equal("Libre", resultado.Data.Ocupacion); // Toda nueva mesa es Libre RN-42
        Assert.True(resultado.Data.Activa); // Toda nueva mesa es Activa RN-42

        _mesaRepoMock.Verify(r => r.AgregarAsync(It.Is<Mesa>(m => m.Mes_Nombre == "Mesa 5" && m.Mes_Activa && m.Mes_Ocupacion == EstadoOcupacionMesa.Libre), It.IsAny<CancellationToken>()), Times.Once);
        _auditoriaMesaRepoMock.Verify(a => a.RegistrarAsync(It.Is<AuditoriaMesa>(au => au.Aud_NombreAdmin == "admin" && au.Aud_Accion == "CREAR"), It.IsAny<CancellationToken>()), Times.Once);
        _mesaRepoMock.Verify(r => r.GuardarCambiosAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task RegistrarMesaAsync_NombreDuplicadoConEspaciosOTildes_RetornaConflictoMSG83_RV52()
    {
        // ARRANGE: Si ya existe "MESA 1", intentar registrar "  Mésa  1  " debe ser detectado como duplicado
        var request = new CrearMesaRequest
        {
            Nombre = "  Mésa  1  "
        };

        _mesaRepoMock.Setup(r => r.ExisteNombreNormalizadoAsync("MESA 1", null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // ACT
        var resultado = await _service.RegistrarMesaAsync(request, "admin");

        // ASSERT
        Assert.False(resultado.IsSuccess);
        Assert.Equal(MensajesCatalogo.MSG_83, resultado.Message);
        _mesaRepoMock.Verify(r => r.AgregarAsync(It.IsAny<Mesa>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task CambiarEstadoAsync_MesaOcupada_BloqueaDesactivacion_RV56_RN44()
    {
        // ARRANGE
        var mesaId = Guid.NewGuid();
        var mesa = new Mesa("Mesa 3");
        mesa.CambiarOcupacion(EstadoOcupacionMesa.Ocupada); // Mesa con comanda/pedido en curso

        _mesaRepoMock.Setup(r => r.ObtenerPorIdAsync(mesaId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mesa);

        // ACT: Intentar desactivar la mesa ocupada
        var resultado = await _service.CambiarEstadoAsync(mesaId, false, "admin");

        // ASSERT
        Assert.False(resultado.IsSuccess);
        Assert.Contains("tiene un pedido pendiente de cobro", resultado.Message);
        Assert.True(mesa.Mes_Activa); // Estado no modificado
        _mesaRepoMock.Verify(r => r.ActualizarAsync(It.IsAny<Mesa>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task CambiarEstadoAsync_MesaLibre_DesactivaCorrectamenteYRegistraAuditoria_RN47()
    {
        // ARRANGE
        var mesaId = Guid.NewGuid();
        var mesa = new Mesa("Mesa 4"); // Creada activa y libre

        _mesaRepoMock.Setup(r => r.ObtenerPorIdAsync(mesaId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mesa);

        // ACT
        var resultado = await _service.CambiarEstadoAsync(mesaId, false, "admin");

        // ASSERT
        Assert.True(resultado.IsSuccess);
        Assert.Equal(MensajesCatalogo.MSG_89, resultado.Message);
        Assert.False(mesa.Mes_Activa);

        _mesaRepoMock.Verify(r => r.ActualizarAsync(It.Is<Mesa>(m => !m.Mes_Activa), It.IsAny<CancellationToken>()), Times.Once);
        _auditoriaMesaRepoMock.Verify(a => a.RegistrarAsync(It.Is<AuditoriaMesa>(au => au.Aud_Accion == "DESACTIVAR"), It.IsAny<CancellationToken>()), Times.Once);
        _mesaRepoMock.Verify(r => r.GuardarCambiosAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ListarMesasAsync_OrdenamientoNatural_OrdenaMesa2AntesQueMesa10()
    {
        // ARRANGE
        var listaDesordenada = new List<Mesa>
        {
            new Mesa("Mesa 10"),
            new Mesa("Mesa 2"),
            new Mesa("Mesa 1")
        };

        _mesaRepoMock.Setup(r => r.ListarMesasAsync(null, true, It.IsAny<CancellationToken>()))
            .ReturnsAsync(listaDesordenada);

        // ACT
        var resultado = await _service.ListarMesasAsync(null, true, "Administrador");

        // ASSERT
        Assert.True(resultado.IsSuccess);
        Assert.NotNull(resultado.Data);
        Assert.Equal(3, resultado.Data!.Count);
        // Verificación de orden natural: Mesa 1, Mesa 2, Mesa 10
        Assert.Equal("Mesa 1", resultado.Data[0].Nombre);
        Assert.Equal("Mesa 2", resultado.Data[1].Nombre);
        Assert.Equal("Mesa 10", resultado.Data[2].Nombre);
    }

    [Fact]
    public void CrearMesaRequest_NombreCon20Caracteres_PasaValidacion_D008()
    {
        // ARRANGE: Exactamente 20 caracteres (límite superior RV-168, D-008)
        var request = new CrearMesaRequest { Nombre = "Mesa Terraza VIP 012" }; // 20 chars
        Assert.Equal(20, request.Nombre.Length);

        // ACT
        var resultados = request.Validate(new System.ComponentModel.DataAnnotations.ValidationContext(request)).ToList();

        // ASSERT
        Assert.Empty(resultados);
    }

    [Fact]
    public void CrearMesaRequest_NombreCon21Caracteres_RetornaErrorMSG82_D008()
    {
        // ARRANGE: 21 caracteres (supera límite de 20 RV-168, D-008)
        var request = new CrearMesaRequest { Nombre = "Mesa Terraza VIP 0123" }; // 21 chars
        Assert.Equal(21, request.Nombre.Length);

        // ACT
        var resultados = request.Validate(new System.ComponentModel.DataAnnotations.ValidationContext(request)).ToList();

        // ASSERT
        Assert.Single(resultados);
        Assert.Equal(MensajesCatalogo.MSG_82, resultados[0].ErrorMessage);
    }

    [Fact]
    public void CrearMesaRequest_NombreVacio_RetornaErrorMSG81()
    {
        // ARRANGE: Nombre vacío o puros espacios
        var request = new CrearMesaRequest { Nombre = "    " };

        // ACT
        var resultados = request.Validate(new System.ComponentModel.DataAnnotations.ValidationContext(request)).ToList();

        // ASSERT
        Assert.Single(resultados);
        Assert.Equal(MensajesCatalogo.MSG_81, resultados[0].ErrorMessage);
    }
}
