using System.Security.Claims;

using Microsoft.AspNetCore.Http;

using Microsoft.AspNetCore.Mvc;

using Microsoft.Extensions.Logging;

using GirasolesRes.API.Controllers;

using GirasolesRes.Application.DTOs.Cobros;

using GirasolesRes.Application.Common;

using GirasolesRes.Application.Common.Exceptions;

using GirasolesRes.Application.DTOs.Comandas;

using GirasolesRes.Application.DTOs.Inicio;

using GirasolesRes.Application.DTOs.MenuDia;

using GirasolesRes.Application.DTOs.Pedidos;

using GirasolesRes.Application.DTOs.Reportes;

using GirasolesRes.Application.Interfaces.Persistence;

using GirasolesRes.Application.Interfaces.Services;

using GirasolesRes.Application.Services;

using GirasolesRes.Domain.Entities;

using GirasolesRes.Domain.Enums;

using Moq;

using Xunit;



namespace GirasolesRes.Tests;



public class CorreccionesTrazabilidadUnitTests

{

    private readonly Mock<IPedidoRepository> _pedidoRepoMock = new();

    private readonly Mock<IMesaRepository> _mesaRepoMock = new();

    private readonly Mock<IProductoRepository> _productoRepoMock = new();

    private readonly Mock<IMenuDiaRepository> _menuDiaRepoMock = new();

    private readonly Mock<ICajaRepository> _cajaRepoMock = new();

    private readonly Mock<ICajaService> _cajaServiceMock = new();

    private readonly Mock<IMesaService> _mesaServiceMock = new();

    private readonly Mock<IMenuDiaService> _menuDiaServiceMock = new();

    private readonly Mock<IComandaService> _comandaServiceMock = new();

    private readonly Mock<IReporteService> _reporteServiceMock = new();
    private readonly Mock<IMenuCompletoRepository> _menuCompletoRepoMock = new();



    private PedidoService CrearPedidoService()

    {

        return new PedidoService(

            _pedidoRepoMock.Object,

            _mesaRepoMock.Object,

            _productoRepoMock.Object,

            _menuDiaRepoMock.Object,
            _menuCompletoRepoMock.Object
        );

    }



    [Fact]

    public async Task VariosPedidosPorMesa_MesaOcupada_AceptaNuevoPedido()

    {

        // 1. Varios pedidos por mesa: una mesa ocupada debe aceptar un pedido nuevo (sin error 409)

        var mesaId = Guid.NewGuid();

        var mesa = new Mesa("Mesa 5");

        mesa.CambiarOcupacion(EstadoOcupacionMesa.Ocupada); // Mesa previamente ocupada

        _mesaRepoMock.Setup(m => m.ObtenerPorIdAsync(mesaId, It.IsAny<CancellationToken>()))

            .ReturnsAsync(mesa);



        _pedidoRepoMock.Setup(p => p.ObtenerPorSolicitudIdAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))

            .ReturnsAsync((Pedido?)null);

        _pedidoRepoMock.Setup(p => p.ExistePedidoActivoEnMesaAsync(mesaId, It.IsAny<CancellationToken>()))

            .ReturnsAsync(true); // Ya tiene pedido activo en mesa

        _pedidoRepoMock.Setup(p => p.ObtenerSiguienteNumeroDiarioAsync(It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))

            .ReturnsAsync(5);

        _pedidoRepoMock.Setup(p => p.ObtenerSiguienteNumeroComandaDiarioAsync(It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))

            .ReturnsAsync(5);



        var prod = new Producto("Ceviche Clásico", CategoriaProducto.Almuerzo, 35.00m, true);

        _productoRepoMock.Setup(pr => pr.ObtenerPorIdsAsync(It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))

            .ReturnsAsync(new List<Producto> { prod });



        var service = CrearPedidoService();



        var request = new RegistrarPedidoMesaRequest

        {

            SolicitudId = Guid.NewGuid().ToString(),

            MesaId = mesaId,

            Lineas = new List<LineaPedidoRequest>

            {

                new LineaPedidoRequest { ProductoId = prod.Id_Producto, Cantidad = 1 }

            }

        };



        // ACT

        var resultado = await service.RegistrarPedidoMesaAsync(request, "mozo1", Guid.NewGuid(), "127.0.0.1");



        // ASSERT: Se crea con éxito a pesar de estar ocupada

        Assert.NotNull(resultado);

        Assert.Equal(5, resultado.Numero);

        Assert.Equal(35.00m, resultado.Total);

    }



    [Fact]

    public async Task AnulacionPorAdministrador_PedidoConComandaEnPreparacion_AnulaExitosamente()

    {

        // 2. Anulación por el Administrador: el Administrador puede anular cualquier pedido no pagado,

        // aun con comandas en preparación o listas, siempre con motivo (5 a 100 caracteres)

        var mozoId = Guid.NewGuid();

        var adminId = Guid.NewGuid();

        var pedidoId = Guid.NewGuid();



        var pedido = new Pedido(1, DateOnly.FromDateTime(DateTime.Today), Guid.NewGuid(), mozoId, "sol-1", TipoPedido.Mesa, null);

        var comanda = new Comanda(pedido.Id_Pedido, 1, "Mesa 1", cmdEsAdicional: false);

        comanda.IniciarPreparacion("cocinero1"); // Comanda en preparación

        pedido.AgregarComanda(comanda);



        _pedidoRepoMock.Setup(p => p.ObtenerDetalleCompletoPorIdAsync(pedidoId, It.IsAny<CancellationToken>()))

            .ReturnsAsync(pedido);



        var service = CrearPedidoService();



        var request = new AnularPedidoRequest

        {

            Motivo = "Cliente se retiró del local inesperadamente"

        };



        // ACT: Administrador anula pedido ajeno con comanda en preparación

        await service.AnularPedidoAsync(pedidoId, request, adminId, "Administrador", "admin1", "127.0.0.1");



        // ASSERT

        Assert.Equal(EstadoPedido.Anulado, pedido.Ped_Estado);

        Assert.Equal("Cliente se retiró del local inesperadamente", pedido.Ped_MotivoAnulacion);

        Assert.Equal(EstadoComanda.Cancelada, comanda.Cmd_Estado);

    }



    [Fact]

    public async Task AnulacionPorMozo_ComandaEnPreparacion_LanzaConflicto409()

    {

        // Mozo no puede anular si la comanda ya está en preparación

        var mozoId = Guid.NewGuid();

        var pedidoId = Guid.NewGuid();



        var pedido = new Pedido(2, DateOnly.FromDateTime(DateTime.Today), Guid.NewGuid(), mozoId, "sol-2", TipoPedido.Mesa, null);

        var comanda = new Comanda(pedido.Id_Pedido, 2, "Mesa 2", cmdEsAdicional: false);

        comanda.IniciarPreparacion("cocinero1");

        pedido.AgregarComanda(comanda);



        _pedidoRepoMock.Setup(p => p.ObtenerDetalleCompletoPorIdAsync(pedidoId, It.IsAny<CancellationToken>()))

            .ReturnsAsync(pedido);



        var service = CrearPedidoService();

        var request = new AnularPedidoRequest { Motivo = "Cliente canceló" };



        // ACT & ASSERT: Mozo recibe conflicto

        await Assert.ThrowsAsync<PedidoConflictException>(() =>

            service.AnularPedidoAsync(pedidoId, request, mozoId, "Mozo", "mozo1", "127.0.0.1"));

    }



    [Fact]

    public async Task AnulacionPorMozo_PedidoAjeno_LanzaUnauthorized()

    {

        // Mozo no puede anular pedidos registrados por otro usuario

        var creadorId = Guid.NewGuid();

        var otroMozoId = Guid.NewGuid();

        var pedidoId = Guid.NewGuid();



        var pedido = new Pedido(3, DateOnly.FromDateTime(DateTime.Today), Guid.NewGuid(), creadorId, "sol-3", TipoPedido.Mesa, null);

        var comanda = new Comanda(pedido.Id_Pedido, 3, "Mesa 3", cmdEsAdicional: false);

        pedido.AgregarComanda(comanda);



        _pedidoRepoMock.Setup(p => p.ObtenerDetalleCompletoPorIdAsync(pedidoId, It.IsAny<CancellationToken>()))

            .ReturnsAsync(pedido);



        var service = CrearPedidoService();

        var request = new AnularPedidoRequest { Motivo = "Error de mesa" };



        // ACT & ASSERT

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>

            service.AnularPedidoAsync(pedidoId, request, otroMozoId, "Mozo", "otroMozo", "127.0.0.1"));

    }



    [Fact]

    public async Task DashboardAlertas_MenuSinDefinir_SoloSiCajaAbierta()

    {

        // 4. Alerta «menú de hoy sin definir» en el dashboard: generarla solo si la caja del día está abierta.

        var inicioService = new InicioService(

            _reporteServiceMock.Object,

            _cajaServiceMock.Object,

            _cajaRepoMock.Object,

            _mesaServiceMock.Object,

            _pedidoRepoMock.Object,

            _menuDiaServiceMock.Object,

            _comandaServiceMock.Object

        );



        // Menú sin definir

        _menuDiaServiceMock.Setup(m => m.ObtenerMenuHoyAsync(It.IsAny<CancellationToken>()))

            .ReturnsAsync(new ApiResponse<MenuDiaResponseDto>

            {

                Success = true,

                Data = new MenuDiaResponseDto

                {

                    Fecha = DateTime.Today.ToString("yyyy-MM-dd"),

                    Definido = false

                }

            });



        _comandaServiceMock.Setup(c => c.ListarComandasAsync(It.IsAny<string>()))

            .ReturnsAsync(new ListarComandasResponseDto());



        _reporteServiceMock.Setup(r => r.ConsultarReporteVentasAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))

            .ReturnsAsync(new ReporteVentasResponseDto(

                DateTime.Today.ToString("yyyy-MM-dd"),

                DateTime.Today.ToString("yyyy-MM-dd"),

                0, 0m, 0m, 0m,

                new VentasAnuladasResumenDto(0, 0m),

                new List<VentaPorDiaDto>()

            ));



        // ESCENARIO A: Caja CERRADA -> NO debe generar alerta

        _cajaRepoMock.Setup(c => c.ObtenerCajaAbiertaAsync(It.IsAny<CancellationToken>()))

            .ReturnsAsync((Caja?)null);



        var bloqueSinCaja = await inicioService.ObtenerBloqueAsync("alertas", "Administrador", Guid.NewGuid());

        var alertasSinCaja = Assert.IsAssignableFrom<IEnumerable<AlertaInicioDto>>(bloqueSinCaja.Datos);

        Assert.DoesNotContain(alertasSinCaja, a => a.Tipo == "menu_sin_definir");



        // ESCENARIO B: Caja ABIERTA -> SÍ debe generar alerta

        var cajaAbierta = new Caja(Guid.NewGuid(), 100m, "apertura-1");

        _cajaRepoMock.Setup(c => c.ObtenerCajaAbiertaAsync(It.IsAny<CancellationToken>()))

            .ReturnsAsync(cajaAbierta);



        var bloqueConCaja = await inicioService.ObtenerBloqueAsync("alertas", "Administrador", Guid.NewGuid());

        var alertasConCaja = Assert.IsAssignableFrom<IEnumerable<AlertaInicioDto>>(bloqueConCaja.Datos);

        Assert.Contains(alertasConCaja, a => a.Tipo == "menu_sin_definir");

    }



    [Fact]

    public async Task PedidoPagado_MuestraEstadoPreparacionEnListado()

    {

        // 5. Pedido pagado: mostrar «Pagado» junto con el estado de preparación (ej: «Pagado · En preparación»)

        var pedido = new Pedido(10, DateOnly.FromDateTime(DateTime.Today), Guid.NewGuid(), Guid.NewGuid(), "sol-10", TipoPedido.Mesa, null);

        var comanda = new Comanda(pedido.Id_Pedido, 10, "Mesa 10", false);

        comanda.IniciarPreparacion("cocinero1");

        pedido.AgregarComanda(comanda);

        pedido.CambiarEstado(EstadoPedido.Pagado); // Pagado pero con comanda en preparación



        _pedidoRepoMock.Setup(p => p.ListarPaginadoAsync(

            It.IsAny<DateOnly>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<Guid?>(), It.IsAny<Guid?>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<CancellationToken>()

        )).ReturnsAsync((new List<Pedido> { pedido }, 1, 0, 0, 0, 1, 0));



        var service = CrearPedidoService();

        var query = new ListarPedidosQueryDto();



        var resultado = await service.ListarPedidosAsync(query, Guid.NewGuid(), "Administrador");



        Assert.Single(resultado.Items);

        Assert.Equal("Pagado · En preparación", resultado.Items[0].Estado);

    }



    [Fact]

    public async Task PedidoPagado_ComandaLista_MuestraListoPagado()

    {

        // 5. Pedido pagado con comanda lista: muestra «Listo · Pagado»

        var pedido = new Pedido(11, DateOnly.FromDateTime(DateTime.Today), Guid.NewGuid(), Guid.NewGuid(), "sol-11", TipoPedido.Mesa, null);

        var comanda = new Comanda(pedido.Id_Pedido, 11, "Mesa 11", false);

        comanda.MarcarComoLista("cocinero1");

        pedido.AgregarComanda(comanda);

        pedido.CambiarEstado(EstadoPedido.Pagado);



        _pedidoRepoMock.Setup(p => p.ListarPaginadoAsync(

            It.IsAny<DateOnly>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<Guid?>(), It.IsAny<Guid?>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<CancellationToken>()

        )).ReturnsAsync((new List<Pedido> { pedido }, 1, 0, 0, 0, 1, 0));



        var service = CrearPedidoService();

        var query = new ListarPedidosQueryDto();



        var resultado = await service.ListarPedidosAsync(query, Guid.NewGuid(), "Administrador");



        Assert.Single(resultado.Items);

        Assert.Equal("Listo · Pagado", resultado.Items[0].Estado);

    }



    [Fact]

    public async Task RegistrarPedidoLlevar_RolAdministrador_Retorna403Forbidden()

    {

        // 10. Roles: Pedido para llevar restringido a Cajero; Administrador recibe 403

        var mockService = new Mock<IPedidoService>();

        var mockLogger = new Mock<ILogger<PedidosController>>();

        var controller = new PedidosController(mockService.Object, mockLogger.Object)

        {

            ControllerContext = new ControllerContext

            {

                HttpContext = new DefaultHttpContext

                {

                    User = new ClaimsPrincipal(new ClaimsIdentity(new[]

                    {

                        new Claim(ClaimTypes.Role, "Administrador"),

                        new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString())

                    }, "TestAuth"))

                }

            }

        };



        var request = new RegistrarPedidoLlevarRequest { SolicitudId = "sol-llevar-admin", Lineas = new List<LineaPedidoRequest>() };

        var result = await controller.RegistrarPedidoLlevar(request, CancellationToken.None);



        var objectResult = Assert.IsType<ObjectResult>(result);

        Assert.Equal(StatusCodes.Status403Forbidden, objectResult.StatusCode);

    }



    [Fact]

    public async Task RegistrarPedidoLlevar_RolMozo_Retorna403Forbidden()

    {

        // 10. Roles: Pedido para llevar restringido a Cajero; Mozo recibe 403

        var mockService = new Mock<IPedidoService>();

        var mockLogger = new Mock<ILogger<PedidosController>>();

        var controller = new PedidosController(mockService.Object, mockLogger.Object)

        {

            ControllerContext = new ControllerContext

            {

                HttpContext = new DefaultHttpContext

                {

                    User = new ClaimsPrincipal(new ClaimsIdentity(new[]

                    {

                        new Claim(ClaimTypes.Role, "Mozo"),

                        new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString())

                    }, "TestAuth"))

                }

            }

        };



        var request = new RegistrarPedidoLlevarRequest { SolicitudId = "sol-llevar-mozo", Lineas = new List<LineaPedidoRequest>() };

        var result = await controller.RegistrarPedidoLlevar(request, CancellationToken.None);



        var objectResult = Assert.IsType<ObjectResult>(result);

        Assert.Equal(StatusCodes.Status403Forbidden, objectResult.StatusCode);

    }



    [Fact]

    public async Task ProcesarCobro_RolAdministrador_Retorna403Forbidden()

    {

        // 10. Roles: Cobro restringido a Cajero; Administrador recibe 403

        var mockService = new Mock<ICobroService>();

        var mockLogger = new Mock<ILogger<CobrosController>>();

        var controller = new CobrosController(mockService.Object, mockLogger.Object)

        {

            ControllerContext = new ControllerContext

            {

                HttpContext = new DefaultHttpContext

                {

                    User = new ClaimsPrincipal(new ClaimsIdentity(new[]

                    {

                        new Claim(ClaimTypes.Role, "Administrador"),

                        new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString())

                    }, "TestAuth"))

                }

            }

        };



        var request = new CobroRequest { SolicitudId = "sol-cobro-admin", PedidoId = Guid.NewGuid(), Metodo = "Efectivo", MontoRecibido = 50.00m, TotalMostrado = 40.00m };

        var result = await controller.ProcesarCobro(request, CancellationToken.None);



        var objectResult = Assert.IsType<ObjectResult>(result);

        Assert.Equal(StatusCodes.Status403Forbidden, objectResult.StatusCode);

    }



    [Fact]

    public void DemoraCocina_FronteraExacta_CalculaEsDemoraCorrectamente()

    {

        // 9. Demora a partir de 15 minutos o más (>= 15)

        int min14 = 14;

        int min15 = 15;

        int min16 = 16;



        Assert.False(min14 >= RestauranteConstantes.MinutosDemoraCocina);

        Assert.True(min15 >= RestauranteConstantes.MinutosDemoraCocina);

        Assert.True(min16 >= RestauranteConstantes.MinutosDemoraCocina);

    }



    [Fact]

    public async Task ObtenerPedidosActivosPorMesa_DosPedidosAbiertos_DevuelveListaConIdNumeroEstadoTotal()

    {

        // 3. GET /api/pedidos/mesa/{mesaId}/activo debe devolver TODOS los pedidos abiertos de la mesa

        // (lista con id, número, estado y total) para alimentar MSG-95

        var mesaId = Guid.NewGuid();

        var mozoId = Guid.NewGuid();



        var pedido1 = new Pedido(1, DateOnly.FromDateTime(DateTime.Today), mesaId, mozoId, "sol-1", TipoPedido.Mesa, null);

        var comanda1 = new Comanda(pedido1.Id_Pedido, 1, "Mesa 1", false);

        pedido1.AgregarComanda(comanda1);



        var pedido2 = new Pedido(2, DateOnly.FromDateTime(DateTime.Today), mesaId, mozoId, "sol-2", TipoPedido.Mesa, null);

        var comanda2 = new Comanda(pedido2.Id_Pedido, 2, "Mesa 1", false);

        comanda2.IniciarPreparacion("cocinero1");

        pedido2.AgregarComanda(comanda2);



        _pedidoRepoMock.Setup(r => r.ObtenerPedidosActivosPorMesaAsync(mesaId, It.IsAny<CancellationToken>()))

            .ReturnsAsync(new List<Pedido> { pedido1, pedido2 });



        var service = CrearPedidoService();



        // ACT

        var resultado = await service.ObtenerPedidosActivosPorMesaAsync(mesaId);



        // ASSERT: Devuelve ambos pedidos abiertos con su id, número, estado y total

        Assert.NotNull(resultado);

        Assert.Equal(2, resultado.Count);



        // Pedido 1

        Assert.Equal(pedido1.Id_Pedido, resultado[0].Id);

        Assert.Equal(1, resultado[0].Numero);

        Assert.Equal("Pendiente", resultado[0].Estado);

        Assert.Equal(pedido1.Ped_Total, resultado[0].Total);



        // Pedido 2

        Assert.Equal(pedido2.Id_Pedido, resultado[1].Id);

        Assert.Equal(2, resultado[1].Numero);

        Assert.Equal("Pendiente", resultado[1].Estado);

        Assert.Equal(pedido2.Ped_Total, resultado[1].Total);

    }



    // ------------------------------------------------------------------------

    // PUNTO 1: REVERTIR DESHACER DE COMANDA A 10 SEGUNDOS (TOLERANCIA 10.5s)

    // ------------------------------------------------------------------------

    [Fact]

    public async Task Punto1_DeshacerComanda_Ventana10Segundos_ConTolerancia10Punto5_ValidaCorrectamente()

    {

        Assert.Equal(10, RestauranteConstantes.SegundosVentanaDeshacerComanda);

        Assert.Equal(10.5, RestauranteConstantes.SegundosToleranciaDeshacerComanda);



        var comandaRepoMock = new Mock<IComandaRepository>();

        var comandaService = new ComandaService(comandaRepoMock.Object);



        var comandaId = Guid.NewGuid();

        var comanda = new Comanda(Guid.NewGuid(), 1, "Mesa 1", false);

        comanda.IniciarPreparacion("cocinero1"); // Estado anterior = Pendiente, Estado = EnPreparacion



        // Simular que el cambio ocurrió hace 10.0 segundos (dentro de los 10.5s)

        var propFecUltimo = typeof(Comanda).GetProperty("Cmd_FecUltimoCambioEstadoUtc");

        propFecUltimo!.SetValue(comanda, DateTime.UtcNow.AddSeconds(-10.0));



        comandaRepoMock.Setup(r => r.ObtenerComandaPorIdAsync(comandaId))

            .ReturnsAsync(comanda);



        // ACT 1: 10.0s debe permitir deshacer

        var res10s = await comandaService.DeshacerEstadoAsync(comandaId, "cocinero1");

        Assert.NotNull(res10s);

        Assert.Equal("Pendiente", res10s.Estado);



        // ACT 2: Re-preparar y simular 10.6s (supera tolerancia técnica 10.5s)

        comanda.IniciarPreparacion("cocinero1");

        propFecUltimo.SetValue(comanda, DateTime.UtcNow.AddSeconds(-10.6));

        var ex10Punto6 = await Assert.ThrowsAsync<InvalidOperationException>(() =>

            comandaService.DeshacerEstadoAsync(comandaId, "cocinero1"));

        Assert.Equal(MensajesCatalogo.MSG_134, ex10Punto6.Message);



        // ACT 3: Re-preparar y simular 60s (bloqueado)

        comanda.IniciarPreparacion("cocinero1");

        propFecUltimo.SetValue(comanda, DateTime.UtcNow.AddSeconds(-60.0));

        var ex60 = await Assert.ThrowsAsync<InvalidOperationException>(() =>

            comandaService.DeshacerEstadoAsync(comandaId, "cocinero1"));

        Assert.Equal(MensajesCatalogo.MSG_134, ex60.Message);

    }



    // ------------------------------------------------------------------------

    // PUNTO 2: PRECIO DE PRODUCTO ACEPTA HASTA 999.99

    // ------------------------------------------------------------------------

    [Fact]

    public void Punto2_PrecioProducto_AceptaHasta999Punto99_RechazaMayor()

    {

        Assert.Equal(999.99m, RestauranteConstantes.PrecioMaximoProducto);



        var prodValido = new GirasolesRes.Application.DTOs.Productos.CrearProductoRequest

        {

            Nombre = "Plato Gourmet Especial",

            Tipo = "Carta",

            Categoria = "Almuerzo",

            Precio = 999.99m

        };



        var prodInvalido = new GirasolesRes.Application.DTOs.Productos.CrearProductoRequest

        {

            Nombre = "Plato Gourmet Excedido",

            Tipo = "Carta",

            Categoria = "Almuerzo",

            Precio = 1000.00m

        };



        var contextValido = new System.ComponentModel.DataAnnotations.ValidationContext(prodValido);

        var resultsValido = new List<System.ComponentModel.DataAnnotations.ValidationResult>();

        var esValido = System.ComponentModel.DataAnnotations.Validator.TryValidateObject(prodValido, contextValido, resultsValido, true);

        Assert.True(esValido);



        var contextInvalido = new System.ComponentModel.DataAnnotations.ValidationContext(prodInvalido);

        var resultsInvalido = new List<System.ComponentModel.DataAnnotations.ValidationResult>();

        var esInvalido = System.ComponentModel.DataAnnotations.Validator.TryValidateObject(prodInvalido, contextInvalido, resultsInvalido, true);

        Assert.False(esInvalido);

        Assert.Contains(resultsInvalido, r => r.ErrorMessage == MensajesCatalogo.MSG_56);

    }



    // ------------------------------------------------------------------------

    // PUNTO 3: CAPACIDAD DE MESA ELIMINADA POR COMPLETO

    // ------------------------------------------------------------------------

    [Fact]

    public void Punto3_CapacidadMesa_EliminadaCompletamenteDeEntidadYDtos()

    {

        var tiposAInspeccionar = new[]

        {

            typeof(Mesa),

            typeof(GirasolesRes.Application.DTOs.Mesas.MesaDto),

            typeof(GirasolesRes.Application.DTOs.Mesas.CrearMesaRequest),

            typeof(GirasolesRes.Application.DTOs.Mesas.ActualizarMesaRequest)

        };



        foreach (var tipo in tiposAInspeccionar)

        {

            var props = tipo.GetProperties();

            var tieneCapacidad = props.Any(p => p.Name.ToLowerInvariant().Contains("capacidad"));

            Assert.False(tieneCapacidad, $"El tipo {tipo.Name} no debe contener ninguna propiedad de capacidad.");

        }



        var mesa = new Mesa("Mesa Salón 1");

        Assert.Equal("Mesa Salón 1", mesa.Mes_Nombre);

        Assert.Equal(EstadoOcupacionMesa.Libre, mesa.Mes_Ocupacion);

    }



    // ------------------------------------------------------------------------

    // PUNTO 4: MATRIZ DE ROLES (MOZO, CAJERO, ADMINISTRADOR, COCINERO)

    // ------------------------------------------------------------------------

    private static ControllerContext CrearContextoConRol(string rol, Guid? usuarioId = null)

    {

        var uid = usuarioId ?? Guid.NewGuid();

        return new ControllerContext

        {

            HttpContext = new DefaultHttpContext

            {

                User = new ClaimsPrincipal(new ClaimsIdentity(new[]

                {

                    new Claim(ClaimTypes.Role, rol),

                    new Claim(ClaimTypes.NameIdentifier, uid.ToString()),

                    new Claim(ClaimTypes.Name, $"usuario_{rol.ToLowerInvariant()}")

                }, "TestAuth"))

            }

        };

    }



    [Theory]

    [InlineData("Mozo", true)]

    [InlineData("Administrador", true)]

    [InlineData("Cajero", false)]

    [InlineData("Cocinero", false)]

    public async Task Punto4_RegistrarPedidoMesa_RolesPermitidosYBloqueados(string rol, bool permitido)

    {

        var mockService = new Mock<IPedidoService>();

        var mockLogger = new Mock<ILogger<PedidosController>>();

        mockService.Setup(s => s.RegistrarPedidoMesaAsync(It.IsAny<RegistrarPedidoMesaRequest>(), It.IsAny<string>(), It.IsAny<Guid>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))

            .ReturnsAsync(new RegistrarPedidoResultDto(Guid.NewGuid(), 1, 20m, Guid.NewGuid(), "Mesa 1"));



        var controller = new PedidosController(mockService.Object, mockLogger.Object)

        {

            ControllerContext = CrearContextoConRol(rol)

        };



        var request = new RegistrarPedidoMesaRequest

        {

            SolicitudId = $"sol-mesa-{rol}",

            MesaId = Guid.NewGuid(),

            Lineas = new List<LineaPedidoRequest> { new() { ProductoId = Guid.NewGuid(), Cantidad = 1 } }

        };



        var result = await controller.RegistrarPedidoMesa(request, CancellationToken.None);



        if (permitido)

        {

            var objResult = Assert.IsType<ObjectResult>(result);

            Assert.Equal(StatusCodes.Status201Created, objResult.StatusCode);

        }

        else

        {

            var objResult = Assert.IsType<ObjectResult>(result);

            Assert.Equal(StatusCodes.Status403Forbidden, objResult.StatusCode);

        }

    }



    [Theory]

    [InlineData("Mozo", true)]

    [InlineData("Administrador", true)]

    [InlineData("Cajero", false)]

    [InlineData("Cocinero", false)]

    public async Task Punto4_AgregarLineasPedidoMesa_RolesPermitidosYBloqueados(string rol, bool permitido)

    {

        var mockService = new Mock<IPedidoService>();

        var mockLogger = new Mock<ILogger<PedidosController>>();

        mockService.Setup(s => s.AgregarLineasAsync(It.IsAny<Guid>(), It.IsAny<AgregarLineasPedidoRequest>(), It.IsAny<string>(), It.IsAny<Guid>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))

            .ReturnsAsync(new AgregarLineasResultDto(40m, Guid.NewGuid(), 1));



        var controller = new PedidosController(mockService.Object, mockLogger.Object)

        {

            ControllerContext = CrearContextoConRol(rol)

        };



        var request = new AgregarLineasPedidoRequest

        {

            Lineas = new List<LineaPedidoRequest> { new() { ProductoId = Guid.NewGuid(), Cantidad = 1 } }

        };



        var result = await controller.AgregarLineas(Guid.NewGuid(), request, CancellationToken.None);



        if (permitido)

        {

            Assert.IsType<OkObjectResult>(result);

        }

        else

        {

            var objResult = Assert.IsType<ObjectResult>(result);

            Assert.Equal(StatusCodes.Status403Forbidden, objResult.StatusCode);

        }

    }



    [Theory]

    [InlineData("Cajero", true)]

    [InlineData("Mozo", false)]

    [InlineData("Administrador", false)]

    [InlineData("Cocinero", false)]

    public async Task Punto4_RegistrarPedidoLlevar_RolesPermitidosYBloqueados(string rol, bool permitido)

    {

        var mockService = new Mock<IPedidoService>();

        var mockLogger = new Mock<ILogger<PedidosController>>();

        mockService.Setup(s => s.RegistrarPedidoLlevarAsync(It.IsAny<RegistrarPedidoLlevarRequest>(), It.IsAny<string>(), It.IsAny<Guid>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))

            .ReturnsAsync(new RegistrarPedidoLlevarResultDto(Guid.NewGuid(), 1, 20m, Guid.NewGuid()));



        var controller = new PedidosController(mockService.Object, mockLogger.Object)

        {

            ControllerContext = CrearContextoConRol(rol)

        };



        var request = new RegistrarPedidoLlevarRequest

        {

            SolicitudId = $"sol-llevar-{rol}",

            Lineas = new List<LineaPedidoRequest> { new() { ProductoId = Guid.NewGuid(), Cantidad = 1 } }

        };



        var result = await controller.RegistrarPedidoLlevar(request, CancellationToken.None);



        if (permitido)

        {

            var objResult = Assert.IsType<ObjectResult>(result);

            Assert.Equal(StatusCodes.Status201Created, objResult.StatusCode);

        }

        else

        {

            var objResult = Assert.IsType<ObjectResult>(result);

            Assert.Equal(StatusCodes.Status403Forbidden, objResult.StatusCode);

        }

    }



    [Theory]

    [InlineData("Cajero", true)]

    [InlineData("Mozo", false)]

    [InlineData("Administrador", false)]

    [InlineData("Cocinero", false)]

    public async Task Punto4_ProcesarCobro_RolesPermitidosYBloqueados(string rol, bool permitido)

    {

        var mockService = new Mock<ICobroService>();

        var mockLogger = new Mock<ILogger<CobrosController>>();

        mockService.Setup(s => s.ProcesarCobroAsync(It.IsAny<CobroRequest>(), It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))

            .ReturnsAsync(new CobroResponseDto(

                Guid.NewGuid(),

                new GirasolesRes.Application.DTOs.Cobros.ComprobanteResumenDto("T001", 1, "T001-000001", DateTime.UtcNow, "25/10/2026 12:00"),

                0m,

                "Cobro exitoso"));



        var controller = new CobrosController(mockService.Object, mockLogger.Object)

        {

            ControllerContext = CrearContextoConRol(rol)

        };



        var request = new CobroRequest

        {

            SolicitudId = $"sol-cobro-{rol}",

            PedidoId = Guid.NewGuid(),

            Metodo = "Efectivo",

            MontoRecibido = 30m,

            TotalMostrado = 30m

        };



        var result = await controller.ProcesarCobro(request, CancellationToken.None);



        if (permitido)

        {

            Assert.IsType<CreatedAtActionResult>(result);

        }

        else

        {

            var objResult = Assert.IsType<ObjectResult>(result);

            Assert.Equal(StatusCodes.Status403Forbidden, objResult.StatusCode);

        }

    }



    // ------------------------------------------------------------------------

    // PUNTO 5: AVISO DE PEDIDO LISTO LLEGA SOLO A QUIEN REGISTRÓ EL PEDIDO

    // ------------------------------------------------------------------------

    [Fact]

    public async Task Punto5_AvisoPedidoListo_LlegaSoloAQuienRegistroElPedido()

    {

        var mozo1Id = Guid.NewGuid();

        var mozo2Id = Guid.NewGuid();



        var pedidoMozo1 = new Pedido(1, DateOnly.FromDateTime(DateTime.Today), Guid.NewGuid(), mozo1Id, "sol-m1", TipoPedido.Mesa, null);

        var comandaMozo1 = new Comanda(pedidoMozo1.Id_Pedido, 1, "Mesa 1", false);

        comandaMozo1.MarcarComoLista("cocinero1");

        pedidoMozo1.AgregarComanda(comandaMozo1);



        _pedidoRepoMock.Setup(r => r.ObtenerAvisosPendientesAsync(It.IsAny<DateOnly>(), mozo1Id, false, It.IsAny<CancellationToken>()))

            .ReturnsAsync(new List<Comanda> { comandaMozo1 });



        _pedidoRepoMock.Setup(r => r.ObtenerAvisosPendientesAsync(It.IsAny<DateOnly>(), mozo2Id, false, It.IsAny<CancellationToken>()))

            .ReturnsAsync(new List<Comanda>());



        var service = CrearPedidoService();



        // ACT: Mozo 1 consulta avisos

        var avisosMozo1 = await service.ObtenerAvisosPendientesAsync(mozo1Id, "Mozo");

        Assert.Single(avisosMozo1);

        Assert.Equal(comandaMozo1.Id_Comanda, avisosMozo1[0].Id);



        // ACT: Mozo 2 consulta avisos

        var avisosMozo2 = await service.ObtenerAvisosPendientesAsync(mozo2Id, "Mozo");

        Assert.Empty(avisosMozo2);

    }



    // ------------------------------------------------------------------------

    // PUNTO 7: SIN MENÚ DEL DÍA DEFINIDO OFRECE CARTA Y COMPONENTES

    // ------------------------------------------------------------------------

    [Fact]

    public async Task Punto7_SinMenuDiaDefinido_OfreceProductosCartaYComponentes()

    {

        _menuDiaRepoMock.Setup(m => m.ObtenerPorFechaAsync(It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))

            .ReturnsAsync((MenuDia?)null); // Sin menú del día



        var prodCarta = new Producto("Lomo Saltado", CategoriaProducto.Almuerzo, 35m, true);

        var prodComp = new Producto("Sopa Criolla", RolComponente.Entrada, true);



        _productoRepoMock.Setup(r => r.ListarDisponiblesAsync(null, null, null, It.IsAny<CancellationToken>()))

            .ReturnsAsync(new List<Producto> { prodCarta, prodComp });



        var service = CrearPedidoService();

        var catalogo = await service.ObtenerMenuParaPedidoAsync();



        Assert.Equal(2, catalogo.Count);

        Assert.Contains(catalogo, p => p.Id == prodCarta.Id_Producto && p.Disponible && !p.Agotado);

        Assert.Contains(catalogo, p => p.Id == prodComp.Id_Producto && p.Disponible && !p.Agotado);

    }



    // ------------------------------------------------------------------------

    // PUNTO 5 (TRAZABILIDAD 3): SIN MENÚ DEL DÍA DEFINIDO EN MESA Y LLEVAR

    // SE OFRECEN CARTA, COMPONENTES Y MENÚS COMPLETOS ACTIVOS

    // ------------------------------------------------------------------------

    [Fact]
    public async Task Punto5_SinMenuDiaDefinido_MesaYLlevar_OfreceProductosCartaComponentesYMenusCompletosActivos()
    {
        // 1. Sin menú del día definido (RN-142)
        _menuDiaRepoMock.Setup(m => m.ObtenerPorFechaAsync(It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((MenuDia?)null);

        var prodCarta = new Producto("Lomo Saltado", CategoriaProducto.Almuerzo, 35m, true);
        var prodComp = new Producto("Sopa Criolla", RolComponente.Entrada, true);

        // Menú completo activo configurado en el sistema
        var menu = new MenuCompleto(1, "Menú Ejecutivo", 18.00m, menActivo: true);
        menu.AgregarParte(new MenuCompletoParte(1, "Entrada", new[] { RolComponente.Entrada }, 1));

        _menuCompletoRepoMock.Setup(m => m.ObtenerTodosAsync(It.IsAny<bool>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<MenuCompleto> { menu });

        _productoRepoMock.Setup(r => r.ListarDisponiblesAsync(null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Producto> { prodCarta, prodComp });
        _productoRepoMock.Setup(r => r.ObtenerPorIdsAsync(It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Producto> { prodCarta, prodComp });

        var service = CrearPedidoService();

        // 2. Obtener catálogo para pedido: ofrece carta y componentes con su rol
        var catalogo = await service.ObtenerMenuParaPedidoAsync();
        Assert.Equal(2, catalogo.Count);
        var itemCarta = catalogo.First(p => p.Id == prodCarta.Id_Producto);
        var itemComp = catalogo.First(p => p.Id == prodComp.Id_Producto);
        Assert.Equal("Almuerzo", itemCarta.Categoria);
        Assert.Equal("Entrada", itemComp.Categoria);
        Assert.Equal("Entrada", itemComp.Rol);

        // 3. Mesa: Registrar pedido con carta y menú completo activo sin menú del día
        var mesaId = Guid.NewGuid();
        var mozoId = Guid.NewGuid();
        var mesa = new Mesa("Mesa 1");
        _mesaRepoMock.Setup(m => m.ObtenerPorIdAsync(mesaId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mesa);
        _pedidoRepoMock.Setup(p => p.ObtenerPorSolicitudIdAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Pedido?)null);
        _pedidoRepoMock.Setup(p => p.ObtenerSiguienteNumeroDiarioAsync(It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);
        _pedidoRepoMock.Setup(p => p.ObtenerSiguienteNumeroComandaDiarioAsync(It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var requestMesa = new RegistrarPedidoMesaRequest
        {
            MesaId = mesaId,
            SolicitudId = "sol-sin-menudia-mesa",
            Lineas = new List<LineaPedidoRequest>
            {
                new LineaPedidoRequest { ProductoId = prodCarta.Id_Producto, Cantidad = 1 },
                new LineaPedidoRequest
                {
                    MenuCompletoId = 1,
                    Cantidad = 1,
                    Elecciones = new List<EleccionOpcionRequest>
                    {
                        new EleccionOpcionRequest { Parte = "Entrada", ProductoId = prodComp.Id_Producto }
                    }
                }
            }
        };

        var resultadoMesa = await service.RegistrarPedidoMesaAsync(requestMesa, "mozo1", mozoId, "127.0.0.1");
        Assert.NotNull(resultadoMesa);
        Assert.Equal(53m, resultadoMesa.Total); // 35 (Carta) + 18 (Menú Completo)

        // 4. Llevar: Registrar pedido para llevar con carta y menú completo activo sin menú del día
        var requestLlevar = new RegistrarPedidoLlevarRequest
        {
            SolicitudId = "sol-sin-menudia-llevar",
            Lineas = new List<LineaPedidoRequest>
            {
                new LineaPedidoRequest { ProductoId = prodCarta.Id_Producto, Cantidad = 2 },
                new LineaPedidoRequest
                {
                    MenuCompletoId = 1,
                    Cantidad = 1,
                    Elecciones = new List<EleccionOpcionRequest>
                    {
                        new EleccionOpcionRequest { Parte = "Entrada", ProductoId = prodComp.Id_Producto }
                    }
                }
            }
        };

        var resultadoLlevar = await service.RegistrarPedidoLlevarAsync(requestLlevar, "cajero1", Guid.NewGuid(), "127.0.0.1");
        Assert.NotNull(resultadoLlevar);
        Assert.Equal(88m, resultadoLlevar.Total); // 70 (Carta) + 18 (Menú Completo)
    }



    // ------------------------------------------------------------------------

    // PUNTO 8: DEMORA EN COCINA Y EN DASHBOARD (14:59 NO CUENTA, 15:00 SÍ)

    // ------------------------------------------------------------------------

    [Fact]

    public void Punto8_DemoraCocina_PruebaLimite14Min59SegNoEsDemora_15Min00SegSiEsDemora()

    {

        // 14 min 59 s: TotalMinutes = 14.983 -> (int) = 14 -> no es demora (< 15)

        var minutos14_59 = (int)(TimeSpan.FromMinutes(14) + TimeSpan.FromSeconds(59)).TotalMinutes;

        Assert.Equal(14, minutos14_59);

        var esDemora14_59 = minutos14_59 >= RestauranteConstantes.MinutosDemoraCocina;

        Assert.False(esDemora14_59);



        // 15 min 00 s: TotalMinutes = 15.0 -> (int) = 15 -> sí es demora (>= 15)

        var minutos15_00 = (int)TimeSpan.FromMinutes(15).TotalMinutes;

        Assert.Equal(15, minutos15_00);

        var esDemora15_00 = minutos15_00 >= RestauranteConstantes.MinutosDemoraCocina;

        Assert.True(esDemora15_00);

    }



    [Fact]

    public async Task Punto8_DemoraDashboard_PruebaLimite14MinutosNoAlerta_15MinutosSiAlerta()

    {

        var inicioService = new InicioService(

            _reporteServiceMock.Object,

            _cajaServiceMock.Object,

            _cajaRepoMock.Object,

            _mesaServiceMock.Object,

            _pedidoRepoMock.Object,

            _menuDiaServiceMock.Object,

            _comandaServiceMock.Object

        );



        _cajaRepoMock.Setup(c => c.ObtenerCajaAbiertaAsync(It.IsAny<CancellationToken>()))

            .ReturnsAsync((Caja?)null);



        _menuDiaServiceMock.Setup(m => m.ObtenerMenuHoyAsync(It.IsAny<CancellationToken>()))

            .ReturnsAsync(new ApiResponse<MenuDiaResponseDto>

            {

                Success = true,

                Data = new MenuDiaResponseDto

                {

                    Fecha = DateTime.Today.ToString("yyyy-MM-dd"),

                    Definido = true

                }

            });



        _reporteServiceMock.Setup(r => r.ConsultarReporteVentasAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))

            .ReturnsAsync(new ReporteVentasResponseDto(

                DateTime.Today.ToString("yyyy-MM-dd"),

                DateTime.Today.ToString("yyyy-MM-dd"),

                0, 0m, 0m, 0m,

                new VentasAnuladasResumenDto(0, 0m),

                new List<VentaPorDiaDto>()

            ));



        // Caso A: Comanda con 14 minutos de espera

        var comandas14Min = new ListarComandasResponseDto

        {

            Items = new List<ComandaItemDto>

            {

                new() { Id = Guid.NewGuid(), MinutosEspera = 14, EsDemora = false }

            }

        };

        _comandaServiceMock.Setup(c => c.ListarComandasAsync("pendiente,enPreparacion"))

            .ReturnsAsync(comandas14Min);



        var bloque14 = await inicioService.ObtenerBloqueAsync("alertas", "Administrador", Guid.NewGuid());

        var alertas14 = Assert.IsAssignableFrom<IEnumerable<AlertaInicioDto>>(bloque14.Datos);

        Assert.DoesNotContain(alertas14, a => a.Tipo == "comandas_demora");



        // Caso B: Comanda con 15 minutos de espera

        var comandas15Min = new ListarComandasResponseDto

        {

            Items = new List<ComandaItemDto>

            {

                new() { Id = Guid.NewGuid(), MinutosEspera = 15, EsDemora = true }

            }

        };

        _comandaServiceMock.Setup(c => c.ListarComandasAsync("pendiente,enPreparacion"))

            .ReturnsAsync(comandas15Min);



        var bloque15 = await inicioService.ObtenerBloqueAsync("alertas", "Administrador", Guid.NewGuid());

        var alertas15 = Assert.IsAssignableFrom<IEnumerable<AlertaInicioDto>>(bloque15.Datos);

        Assert.Contains(alertas15, a => a.Tipo == "comandas_demora");

    }



    // ------------------------------------------------------------------------

    // PUNTO 9: KEEP-ALIVE DEL COCINERO (RENOVACIÓN CADA 20 MINUTOS)

    // ------------------------------------------------------------------------

    [Fact]

    public void Punto9_KeepAliveCocinero_RenovacionCada20Minutos()

    {

        Assert.Equal(20, RestauranteConstantes.MinutosRenovacionTokenCocina);



        var intervaloMsEsperado = 20 * 60 * 1000;

        Assert.Equal(1_200_000, intervaloMsEsperado);

    }

}

