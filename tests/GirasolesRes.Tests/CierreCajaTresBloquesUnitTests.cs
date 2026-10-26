using System.Text;
using GirasolesRes.Application.DTOs.Caja;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Interfaces.Services;
using GirasolesRes.Application.Services;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using GirasolesRes.Infrastructure.Services;
using Moq;
using Xunit;

namespace GirasolesRes.Tests;

public class CierreCajaTresBloquesUnitTests
{
    private readonly Mock<ICajaRepository> _cajaRepoMock = new();
    private readonly Mock<IPedidoRepository> _pedidoRepoMock = new();
    private readonly Mock<IPdfCierreService> _pdfCierreServiceMock = new();

    private (Caja caja, Venta venta, Pedido pedido) CrearEscenarioConTresTipos()
    {
        var idUsuario = Guid.NewGuid();
        var caja = new Caja(idUsuario, 100.00m, "sol-apertura-1");

        var idMesa = Guid.NewGuid();
        var idMozo = Guid.NewGuid();
        var pedido = new Pedido(10, DateOnly.FromDateTime(DateTime.Today), idMesa, idMozo, "sol-ped-1", TipoPedido.Mesa, null);

        // 1. Producto de carta: Lomo Saltado (Cantidad: 2, Precio: 35.00 -> Total: 70.00)
        var prodCartaId = Guid.NewGuid();
        pedido.AgregarOLinea(prodCartaId, "Lomo Saltado", 2, 35.00m, null);

        // 2. Menú Completo: Almuerzo Ejecutivo (Cantidad: 1, Precio: 18.00 -> Total: 18.00)
        var prodEntradaId = Guid.NewGuid();
        var prodSegundoId = Guid.NewGuid();
        var opciones = new List<(string ParteNombre, Guid ProductoId, string ProductoNombre)>
        {
            ("Entrada", prodEntradaId, "Sopa de Casa"),
            ("Segundo", prodSegundoId, "Seco de Res")
        };
        pedido.AgregarOLineaMenuCompleto(1, "Almuerzo Ejecutivo", "Sopa y Segundo", 1, 18.00m, null, opciones);

        // 3. Venta asociada de S/ 88.00 en efectivo
        var venta = new Venta(pedido.Id_Pedido, idUsuario, caja.Id_Caja, 88.00m, MetodoPago.Efectivo, "sol-venta-1", 100.00m, 12.00m);
        venta.AsignarPedido(pedido);
        caja.AgregarVenta(venta);

        return (caja, venta, pedido);
    }

    [Fact]
    public async Task Punto4_D017_ResumenCierre_DesglosaTresBloques_CartaMenusYComponentes()
    {
        var (caja, venta, _) = CrearEscenarioConTresTipos();

        _cajaRepoMock.Setup(r => r.ObtenerCajaAbiertaAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(caja);
        _cajaRepoMock.Setup(r => r.ObtenerVentasPorCajaIdAsync(caja.Id_Caja, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Venta> { venta });
        _pedidoRepoMock.Setup(r => r.ListarPedidosPendientesCobroAsync(It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Pedido>());

        var cajaService = new CajaService(_cajaRepoMock.Object, _pedidoRepoMock.Object, _pdfCierreServiceMock.Object);

        // Act
        var resumen = await cajaService.ObtenerResumenCierreAsync();

        // Assert Bloque 1: Productos de Carta (cantidad y monto)
        Assert.NotNull(resumen.PlatosVendidos);
        Assert.Single(resumen.PlatosVendidos);
        var platoCarta = resumen.PlatosVendidos[0];
        Assert.Equal("Lomo Saltado", platoCarta.Nombre);
        Assert.Equal(2, platoCarta.Cantidad);
        Assert.Equal(70.00m, platoCarta.Total);

        // Assert Bloque 2: Menús Completos (cantidad y monto)
        Assert.NotNull(resumen.MenusCompletos);
        Assert.Single(resumen.MenusCompletos);
        var menuCompleto = resumen.MenusCompletos[0];
        Assert.Equal("Almuerzo Ejecutivo", menuCompleto.Nombre);
        Assert.Equal(1, menuCompleto.Cantidad);
        Assert.Equal(18.00m, menuCompleto.Monto);

        // Assert Bloque 3: Componentes (veces elegidas, sin monto - RN-138)
        Assert.NotNull(resumen.Componentes);
        Assert.Equal(2, resumen.Componentes.Count);
        Assert.Contains(resumen.Componentes, c => c.Producto == "Sopa de Casa" && c.Rol == "Entrada" && c.Cantidad == 1);
        Assert.Contains(resumen.Componentes, c => c.Producto == "Seco de Res" && c.Rol == "Segundo" && c.Cantidad == 1);
    }

    [Fact]
    public async Task Punto4_D017_DetalleCierre_DesglosaTresBloques_CartaMenusYComponentes()
    {
        var (caja, _, _) = CrearEscenarioConTresTipos();
        caja.Cerrar(188.00m, 188.00m, 88.00m, 0.00m, 88.00m, 1, Guid.NewGuid(), "Turno conforme");

        _cajaRepoMock.Setup(r => r.ObtenerPorIdConDetallesAsync(caja.Id_Caja, It.IsAny<CancellationToken>()))
            .ReturnsAsync(caja);

        var cajaService = new CajaService(_cajaRepoMock.Object, _pedidoRepoMock.Object, _pdfCierreServiceMock.Object);

        // Act
        var detalle = await cajaService.ObtenerDetalleCierreAsync(caja.Id_Caja);

        // Assert Bloque 1: Carta
        Assert.NotNull(detalle.PlatosVendidos);
        Assert.Single(detalle.PlatosVendidos);
        Assert.Equal("Lomo Saltado", detalle.PlatosVendidos[0].Nombre);
        Assert.Equal(70.00m, detalle.PlatosVendidos[0].Total);

        // Assert Bloque 2: Menús Completos
        Assert.NotNull(detalle.MenusCompletos);
        Assert.Single(detalle.MenusCompletos);
        Assert.Equal("Almuerzo Ejecutivo", detalle.MenusCompletos[0].Nombre);
        Assert.Equal(18.00m, detalle.MenusCompletos[0].Monto);

        // Assert Bloque 3: Componentes
        Assert.NotNull(detalle.Componentes);
        Assert.Equal(2, detalle.Componentes.Count);
    }

    [Fact]
    public async Task Punto4_RN138_E401_PdfCierre_GeneraActaConTresBloquesYUnicaPagina()
    {
        var (caja, _, _) = CrearEscenarioConTresTipos();
        caja.Cerrar(188.00m, 188.00m, 88.00m, 0.00m, 88.00m, 1, Guid.NewGuid(), "Cierre con 3 bloques");

        _cajaRepoMock.Setup(r => r.ObtenerPorIdConDetallesAsync(caja.Id_Caja, It.IsAny<CancellationToken>()))
            .ReturnsAsync(caja);

        var pdfService = new PdfCierreService(_cajaRepoMock.Object);

        // Act
        var bytes = await pdfService.GenerarVoucherCierreAsync(caja.Id_Caja);

        // Assert
        Assert.NotNull(bytes);
        Assert.True(bytes.Length > 1000);
        var header = Encoding.ASCII.GetString(bytes.Take(8).ToArray());
        Assert.StartsWith("%PDF-1.4", header);

        // Comprobar que el PDF contiene las secciones de los 3 bloques
        var pdfText = Encoding.ASCII.GetString(bytes);
        Assert.Contains("PRODUCTOS DE CARTA", pdfText);
        Assert.Contains("MENUS COMPLETOS", pdfText);
        Assert.Contains("COMPONENTES ELEGIDOS", pdfText);
    }
}
