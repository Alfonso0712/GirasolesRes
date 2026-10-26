using GirasolesRes.Application.Common;
using GirasolesRes.Application.Common.Exceptions;
using GirasolesRes.Application.DTOs.Pedidos;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Services;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using Moq;
using Xunit;

namespace GirasolesRes.Tests;

public class PedidoMenuCompletoUnitTests
{
    private readonly Mock<IPedidoRepository> _pedidoRepoMock;
    private readonly Mock<IMesaRepository> _mesaRepoMock;
    private readonly Mock<IProductoRepository> _productoRepoMock;
    private readonly Mock<IMenuDiaRepository> _menuDiaRepoMock;
    private readonly Mock<IMenuCompletoRepository> _menuCompletoRepoMock;
    private readonly PedidoService _service;

    public PedidoMenuCompletoUnitTests()
    {
        _pedidoRepoMock = new Mock<IPedidoRepository>();
        _mesaRepoMock = new Mock<IMesaRepository>();
        _productoRepoMock = new Mock<IProductoRepository>();
        _menuDiaRepoMock = new Mock<IMenuDiaRepository>();
        _menuCompletoRepoMock = new Mock<IMenuCompletoRepository>();

        _service = new PedidoService(
            _pedidoRepoMock.Object,
            _mesaRepoMock.Object,
            _productoRepoMock.Object,
            _menuDiaRepoMock.Object,
            _menuCompletoRepoMock.Object);
    }

    private static (MenuCompleto Menu, Producto Bebida, Producto Plato, MenuDia Dia) ConfigurarEscenarioDesayunoCompleto()
    {
        var menu = new MenuCompleto(1, "Desayuno completo", 7.00m, menActivo: true, menIncluye: "Pan con mantequilla");
        menu.AgregarParte(new MenuCompletoParte(1, "Bebida", new[] { RolComponente.BebidaDesayuno }, 1));
        menu.AgregarParte(new MenuCompletoParte(1, "Plato", new[] { RolComponente.PlatoDesayuno }, 2));

        var bebida = new Producto("Avena", RolComponente.BebidaDesayuno);
        var plato = new Producto("Lomo al jugo", RolComponente.PlatoDesayuno);

        var dia = new MenuDia(DateOnly.FromDateTime(DateTime.UtcNow), "admin");
        dia.SincronizarMenusCompletos(new[] { 1 }, "admin");
        dia.SincronizarPlatos(new[] { bebida.Id_Producto, plato.Id_Producto }, "admin");

        return (menu, bebida, plato, dia);
    }

    [Fact]
    public async Task E_387_RegistrarPedidoMesa_FaltaOpcionEnParteObligatoria_LanzaArgumentException_MSG221()
    {
        // ARRANGE
        var (menu, bebida, plato, dia) = ConfigurarEscenarioDesayunoCompleto();
        var mesaId = Guid.NewGuid();
        var mesa = new Mesa("Mesa 2");

        _mesaRepoMock.Setup(m => m.ObtenerPorIdAsync(mesaId, It.IsAny<CancellationToken>())).ReturnsAsync(mesa);
        _pedidoRepoMock.Setup(p => p.ObtenerPorSolicitudIdAsync(It.IsAny<string>(), It.IsAny<CancellationToken>())).ReturnsAsync((Pedido?)null);
        _pedidoRepoMock.Setup(p => p.ExistePedidoActivoEnMesaAsync(mesaId, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        _menuDiaRepoMock.Setup(m => m.ObtenerPorFechaAsync(It.IsAny<DateOnly>(), It.IsAny<CancellationToken>())).ReturnsAsync(dia);
        _menuCompletoRepoMock.Setup(m => m.ObtenerTodosAsync(It.IsAny<bool>(), It.IsAny<CancellationToken>())).ReturnsAsync(new List<MenuCompleto> { menu });
        _productoRepoMock.Setup(p => p.ObtenerPorIdsAsync(It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Producto> { bebida, plato });

        // Request envía solo la bebida, falta el plato obligatorio
        var request = new RegistrarPedidoMesaRequest
        {
            SolicitudId = Guid.NewGuid().ToString(),
            MesaId = mesaId,
            Lineas = new List<LineaPedidoRequest>
            {
                new LineaPedidoRequest
                {
                    MenuCompletoId = 1,
                    Cantidad = 1,
                    Elecciones = new List<EleccionOpcionRequest>
                    {
                        new EleccionOpcionRequest { Parte = "Bebida", ProductoId = bebida.Id_Producto }
                    }
                }
            }
        };

        // ACT & ASSERT
        var ex = await Assert.ThrowsAsync<ArgumentException>(() =>
            _service.RegistrarPedidoMesaAsync(request, "mozo1", Guid.NewGuid(), "127.0.0.1"));

        Assert.Contains("Plato", ex.Message);
    }

    [Fact]
    public async Task E_388_RegistrarPedidoMesa_OpcionAgotadaEnMenuDia_LanzaPedidoConflictException_MSG223()
    {
        // ARRANGE
        var (menu, bebida, plato, dia) = ConfigurarEscenarioDesayunoCompleto();
        var mesaId = Guid.NewGuid();
        var mesa = new Mesa("Mesa 2");

        // Marcar el plato como agotado en el menú del día
        dia.CambiarDisponibilidadPlato(plato.Id_Producto, true, "admin");

        _mesaRepoMock.Setup(m => m.ObtenerPorIdAsync(mesaId, It.IsAny<CancellationToken>())).ReturnsAsync(mesa);
        _pedidoRepoMock.Setup(p => p.ObtenerPorSolicitudIdAsync(It.IsAny<string>(), It.IsAny<CancellationToken>())).ReturnsAsync((Pedido?)null);
        _pedidoRepoMock.Setup(p => p.ExistePedidoActivoEnMesaAsync(mesaId, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        _menuDiaRepoMock.Setup(m => m.ObtenerPorFechaAsync(It.IsAny<DateOnly>(), It.IsAny<CancellationToken>())).ReturnsAsync(dia);
        _menuCompletoRepoMock.Setup(m => m.ObtenerTodosAsync(It.IsAny<bool>(), It.IsAny<CancellationToken>())).ReturnsAsync(new List<MenuCompleto> { menu });
        _productoRepoMock.Setup(p => p.ObtenerPorIdsAsync(It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Producto> { bebida, plato });

        var request = new RegistrarPedidoMesaRequest
        {
            SolicitudId = Guid.NewGuid().ToString(),
            MesaId = mesaId,
            Lineas = new List<LineaPedidoRequest>
            {
                new LineaPedidoRequest
                {
                    MenuCompletoId = 1,
                    Cantidad = 1,
                    Elecciones = new List<EleccionOpcionRequest>
                    {
                        new EleccionOpcionRequest { Parte = "Bebida", ProductoId = bebida.Id_Producto },
                        new EleccionOpcionRequest { Parte = "Plato", ProductoId = plato.Id_Producto }
                    }
                }
            }
        };

        // ACT & ASSERT
        var ex = await Assert.ThrowsAsync<PedidoConflictException>(() =>
            _service.RegistrarPedidoMesaAsync(request, "mozo1", Guid.NewGuid(), "127.0.0.1"));

        Assert.Equal("opcion_agotada", ex.Codigo);
        Assert.Equal(string.Format(MensajesCatalogo.MSG_223, plato.Pro_Nombre, "Plato"), ex.Message);
    }

    [Fact]
    public void E_389_Pedido_AgregarOLineaMenuCompleto_AgrupaMismasEleccionesYNota_RV164_RV165()
    {
        // ARRANGE
        var mesaId = Guid.NewGuid();
        var usuarioId = Guid.NewGuid();
        var pedido = new Pedido(1, DateOnly.FromDateTime(DateTime.UtcNow), mesaId, usuarioId, Guid.NewGuid().ToString(), TipoPedido.Mesa);

        var opciones = new List<(string ParteNombre, Guid ProductoId, string ProductoNombre)>
        {
            ("Bebida", Guid.NewGuid(), "Quaker"),
            ("Plato", Guid.NewGuid(), "Seco de pollo")
        };

        // ACT
        // Agregar primer menú completo
        pedido.AgregarOLineaMenuCompleto(1, "Desayuno completo", "Pan con mantequilla", 1, 7.00m, "Tibia", opciones);

        // Agregar segundo menú completo idéntico (misma combinación y misma nota)
        pedido.AgregarOLineaMenuCompleto(1, "Desayuno completo", "Pan con mantequilla", 1, 7.00m, "Tibia", opciones);

        // ASSERT
        Assert.Single(pedido.Ped_Detalles);
        var detalle = pedido.Ped_Detalles.First();
        Assert.Equal(2, detalle.Det_Cantidad);
        Assert.Equal(14.00m, detalle.Det_Subtotal);
        Assert.Equal(14.00m, pedido.Ped_Total);
        Assert.Equal(2, detalle.Det_Opciones.Count);
    }

    [Fact]
    public void E_390_Pedido_AgregarOLineaMenuCompleto_DiferentesElecciones_CreaLineasSeparadas_RV164()
    {
        // ARRANGE
        var mesaId = Guid.NewGuid();
        var usuarioId = Guid.NewGuid();
        var pedido = new Pedido(1, DateOnly.FromDateTime(DateTime.UtcNow), mesaId, usuarioId, Guid.NewGuid().ToString(), TipoPedido.Mesa);

        var opcionesA = new List<(string ParteNombre, Guid ProductoId, string ProductoNombre)>
        {
            ("Bebida", Guid.NewGuid(), "Quaker"),
            ("Plato", Guid.NewGuid(), "Seco de pollo")
        };

        var opcionesB = new List<(string ParteNombre, Guid ProductoId, string ProductoNombre)>
        {
            ("Bebida", Guid.NewGuid(), "Café"),
            ("Plato", Guid.NewGuid(), "Tamal")
        };

        // ACT
        pedido.AgregarOLineaMenuCompleto(1, "Desayuno completo", "Pan", 1, 7.00m, null, opcionesA);
        pedido.AgregarOLineaMenuCompleto(1, "Desayuno completo", "Pan", 1, 7.00m, null, opcionesB);

        // ASSERT
        Assert.Equal(2, pedido.Ped_Detalles.Count);
        Assert.Equal(14.00m, pedido.Ped_Total);
    }

    [Fact]
    public void E_391_DetallePedido_CopiaHistorica_RN141()
    {
        // ARRANGE
        var pedidoId = Guid.NewGuid();
        var detalle = new DetallePedido(pedidoId, 1, "Almuerzo completo", "Cancha serrana", 2, 8.00m, "Bien caliente");
        detalle.AgregarOpcion("Sopa o entrada", Guid.NewGuid(), "Sopa a la minuta");
        detalle.AgregarOpcion("Segundo", Guid.NewGuid(), "Lomo saltado");

        // ASSERT
        Assert.Equal("Almuerzo completo", detalle.Det_Nombre);
        Assert.Equal("Cancha serrana", detalle.Det_Incluye);
        Assert.Equal(8.00m, detalle.Det_PrecioUnitario);
        Assert.Equal(16.00m, detalle.Det_Subtotal);
        Assert.Equal(2, detalle.Det_Opciones.Count);
        Assert.Equal("Sopa a la minuta", detalle.Det_Opciones.First().Lpo_ProductoNombre);
    }

    [Fact]
    public void E_392_DetalleComanda_MenuCompleto_FormatoKDS_RN137()
    {
        // ARRANGE
        var comandaId = Guid.NewGuid();
        var detalle = new DetalleComanda(
            comandaId,
            null,
            1,
            "Desayuno completo",
            1,
            "Poco azúcar",
            "Quaker + Seco de pollo",
            "Pan francés");

        // ASSERT
        Assert.Null(detalle.Id_Producto);
        Assert.Equal(1, detalle.Id_MenuCompleto);
        Assert.Equal("Desayuno completo", detalle.Dtc_NombreProducto);
        Assert.Equal("Quaker + Seco de pollo", detalle.Dtc_Elecciones);
        Assert.Equal("Pan francés", detalle.Dtc_Incluye);
    }

    [Fact]
    public async Task E_394_ModificarPedido_MenuCompleto_ActualizaLineasYMarcaComandaModificada_RV167()
    {
        // ARRANGE
        var (menu, bebida, plato, dia) = ConfigurarEscenarioDesayunoCompleto();
        var mesaId = Guid.NewGuid();
        var usuarioId = Guid.NewGuid();
        var pedidoId = Guid.NewGuid();
        var pedido = new Pedido(1, DateOnly.FromDateTime(DateTime.UtcNow), mesaId, usuarioId, Guid.NewGuid().ToString(), TipoPedido.Mesa);

        var comanda = new Comanda(pedido.Id_Pedido, 1, "Mesa 1");
        pedido.AgregarComanda(comanda);

        // Línea inicial
        var opcionesIniciales = new List<(string ParteNombre, Guid ProductoId, string ProductoNombre)>
        {
            ("Bebida", bebida.Id_Producto, bebida.Pro_Nombre),
            ("Plato", plato.Id_Producto, plato.Pro_Nombre)
        };
        pedido.AgregarOLineaMenuCompleto(1, "Desayuno completo", "Pan", 1, 7.00m, null, opcionesIniciales);
        comanda.AgregarDetalle(null, 1, "Desayuno completo", 1, null, "Avena + Lomo al jugo", "Pan");

        _pedidoRepoMock.Setup(p => p.ObtenerDetalleCompletoPorIdAsync(pedidoId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(pedido);
        _menuDiaRepoMock.Setup(m => m.ObtenerPorFechaAsync(It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(dia);
        _menuCompletoRepoMock.Setup(m => m.ObtenerTodosAsync(It.IsAny<bool>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<MenuCompleto> { menu });
        _productoRepoMock.Setup(p => p.ObtenerPorIdsAsync(It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Producto> { bebida, plato });

        // Request modificando la cantidad a 2 y agregando una nota
        var request = new ModificarPedidoRequest
        {
            Lineas = new List<LineaPedidoRequest>
            {
                new LineaPedidoRequest
                {
                    MenuCompletoId = 1,
                    Cantidad = 2,
                    Observacion = "Sin azúcar",
                    Elecciones = new List<EleccionOpcionRequest>
                    {
                        new EleccionOpcionRequest { Parte = "Bebida", ProductoId = bebida.Id_Producto },
                        new EleccionOpcionRequest { Parte = "Plato", ProductoId = plato.Id_Producto }
                    }
                }
            }
        };

        // ACT
        var nuevoTotal = await _service.ModificarPedidoAsync(pedidoId, request, usuarioId, "Mozo", "mozo1", "127.0.0.1");

        // ASSERT
        Assert.Equal(14.00m, nuevoTotal);
        Assert.Equal(14.00m, pedido.Ped_Total);
        Assert.Single(pedido.Ped_Detalles);
        Assert.Equal(2, pedido.Ped_Detalles.First().Det_Cantidad);
        Assert.Equal("Sin azúcar", pedido.Ped_Detalles.First().Det_Observacion);
        Assert.True(comanda.Cmd_Modificada);
        _pedidoRepoMock.Verify(p => p.ActualizarAsync(pedido, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task E_395_ModificarPedido_ComandaEnPreparacion_LanzaPedidoConflictException_MSG115()
    {
        // ARRANGE
        var (menu, bebida, plato, dia) = ConfigurarEscenarioDesayunoCompleto();
        var mesaId = Guid.NewGuid();
        var usuarioId = Guid.NewGuid();
        var pedidoId = Guid.NewGuid();
        var pedido = new Pedido(1, DateOnly.FromDateTime(DateTime.UtcNow), mesaId, usuarioId, Guid.NewGuid().ToString(), TipoPedido.Mesa);

        var comanda = new Comanda(pedido.Id_Pedido, 1, "Mesa 1");
        comanda.IniciarPreparacion("cocinero1"); // Estado = EnPreparacion
        pedido.AgregarComanda(comanda);

        _pedidoRepoMock.Setup(p => p.ObtenerDetalleCompletoPorIdAsync(pedidoId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(pedido);

        var request = new ModificarPedidoRequest
        {
            Lineas = new List<LineaPedidoRequest>
            {
                new LineaPedidoRequest
                {
                    MenuCompletoId = 1,
                    Cantidad = 1,
                    Elecciones = new List<EleccionOpcionRequest>
                    {
                        new EleccionOpcionRequest { Parte = "Bebida", ProductoId = bebida.Id_Producto },
                        new EleccionOpcionRequest { Parte = "Plato", ProductoId = plato.Id_Producto }
                    }
                }
            }
        };

        // ACT & ASSERT
        var ex = await Assert.ThrowsAsync<PedidoConflictException>(() =>
            _service.ModificarPedidoAsync(pedidoId, request, usuarioId, "Mozo", "mozo1", "127.0.0.1"));

        Assert.Equal("cocina_iniciada", ex.Codigo);
        Assert.Equal(MensajesCatalogo.MSG_115, ex.Message);
    }
}
