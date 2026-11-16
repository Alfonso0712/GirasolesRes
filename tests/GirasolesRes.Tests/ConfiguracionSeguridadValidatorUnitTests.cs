using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using GirasolesRes.Infrastructure.Configuration;
using GirasolesRes.Infrastructure.Security;
using Microsoft.Extensions.Configuration;

namespace GirasolesRes.Tests;

public class ConfiguracionSeguridadValidatorUnitTests
{
    private static IConfiguration CrearConfiguracion(Dictionary<string, string?> valores)
    {
        return new ConfigurationBuilder()
            .AddInMemoryCollection(valores)
            .Build();
    }

    private static Dictionary<string, string?> ConfiguracionBaseValida() => new()
    {
        ["ConnectionStrings:DefaultConnection"] = "Host=localhost;Port=5432;Database=db_test;Username=u;Password=clave_segura_local",
        ["Jwt:SecretKey"] = "Clave_JWT_Prueba_Unitaria_Unica_2026_Con_Más_De_32_Chars_XYZ!",
        ["Jwt:Issuer"] = "GirasolesRes",
        ["Jwt:Audience"] = "GirasolesResApp",
        ["Jwt:ExpiracionMinutos"] = "30",
        ["Seed:PasswordInicial"] = "SemillaSeguraDePrueba#2026"
    };

    [Fact]
    public void Validar_ConfiguracionCompletaEnDevelopment_RetornaExito()
    {
        var config = CrearConfiguracion(ConfiguracionBaseValida());

        var resultado = ConfiguracionSeguridadValidator.Validar(config, esDesarrollo: true);

        Assert.True(resultado.EsValido);
        Assert.Empty(resultado.Errores);
        Assert.True(resultado.SeedHabilitado);
        Assert.Equal(30, resultado.JwtExpiracionMinutos);
    }

    [Fact]
    public void Validar_FaltaCadenaConexion_FallaConMensajeClaroSinImprimirValores()
    {
        var datos = ConfiguracionBaseValida();
        datos["ConnectionStrings:DefaultConnection"] = "";
        var config = CrearConfiguracion(datos);

        var resultado = ConfiguracionSeguridadValidator.Validar(config, esDesarrollo: false);

        Assert.False(resultado.EsValido);
        Assert.Contains(resultado.Errores, e => e.Contains("ConnectionStrings:DefaultConnection", StringComparison.Ordinal));
    }

    [Fact]
    public void Validar_FaltaJwtSecretKey_FallaConMensajeClaro()
    {
        var datos = ConfiguracionBaseValida();
        datos.Remove("Jwt:SecretKey");
        var config = CrearConfiguracion(datos);

        var resultado = ConfiguracionSeguridadValidator.Validar(config, esDesarrollo: false);

        Assert.False(resultado.EsValido);
        Assert.Contains(resultado.Errores, e => e.Contains("Jwt:SecretKey", StringComparison.Ordinal));
    }

    [Fact]
    public void Validar_JwtSecretKeyMenorA32Caracteres_FallaSinExponerClave()
    {
        const string claveCorta = "ClaveCortaCon24Caractere";
        var datos = ConfiguracionBaseValida();
        datos["Jwt:SecretKey"] = claveCorta;
        var config = CrearConfiguracion(datos);

        var ex = Assert.Throws<InvalidOperationException>(() =>
            ConfiguracionSeguridadValidator.ValidarOpcionesOLanzar(config, esDesarrollo: false));

        Assert.Contains("32 caracteres", ex.Message, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain(claveCorta, ex.Message, StringComparison.Ordinal);
    }

    [Theory]
    [InlineData("12345678901234567890123456789012")]
    [InlineData("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")]
    [InlineData("<SU_CLAVE_JWT_ALEATORIA_MINIMO_32_CARACTERES>")]
    [InlineData("cambia_esta_clave_jwt_en_produccion")]
    public void Validar_JwtSecretKeyDebilOMarcador_FallaSinExponerValor(string claveDebil)
    {
        var datos = ConfiguracionBaseValida();
        datos["Jwt:SecretKey"] = claveDebil;
        var config = CrearConfiguracion(datos);

        var resultado = ConfiguracionSeguridadValidator.Validar(config, esDesarrollo: false);

        Assert.False(resultado.EsValido);
        Assert.All(resultado.Errores, err => Assert.DoesNotContain(claveDebil, err, StringComparison.Ordinal));
    }

    [Fact]
    public void Validar_ProductionPorDefectoDeshabilitaSeedYNoExigePasswordInicial()
    {
        var datos = ConfiguracionBaseValida();
        datos.Remove("Seed:PasswordInicial");
        var config = CrearConfiguracion(datos);

        var resultado = ConfiguracionSeguridadValidator.Validar(config, esDesarrollo: false);

        Assert.True(resultado.EsValido);
        Assert.False(resultado.SeedHabilitado);
        Assert.Null(resultado.SeedPasswordInicial);
    }

    [Fact]
    public void Validar_SeedHabilitadoSinPasswordInicial_FallaAlIniciar()
    {
        var datos = ConfiguracionBaseValida();
        datos["Seed:Habilitado"] = "true";
        datos["Seed:PasswordInicial"] = "";
        var config = CrearConfiguracion(datos);

        var resultado = ConfiguracionSeguridadValidator.Validar(config, esDesarrollo: false);

        Assert.False(resultado.EsValido);
        Assert.Contains(resultado.Errores, e => e.Contains("Seed:PasswordInicial", StringComparison.Ordinal));
    }

    [Fact]
    public void Validar_JwtExpiracionPorDefectoEs30YSoportaExpiracionMinutos()
    {
        var datosSinExp = ConfiguracionBaseValida();
        datosSinExp.Remove("Jwt:ExpiracionMinutos");
        var resDefecto = ConfiguracionSeguridadValidator.Validar(CrearConfiguracion(datosSinExp), esDesarrollo: false);
        Assert.True(resDefecto.EsValido);
        Assert.Equal(30, resDefecto.JwtExpiracionMinutos);

        var datosConExp = ConfiguracionBaseValida();
        datosConExp["Jwt:ExpiracionMinutos"] = "60";
        var res60 = ConfiguracionSeguridadValidator.Validar(CrearConfiguracion(datosConExp), esDesarrollo: false);
        Assert.True(res60.EsValido);
        Assert.Equal(60, res60.JwtExpiracionMinutos);
    }

    [Fact]
    public void Validar_IValidateOptions_RechazaOpcionesInvalidas()
    {
        var validator = new ConfiguracionSeguridadValidator();
        var opciones = new ConfiguracionSeguridadOpciones
        {
            ConnectionString = "",
            Jwt = new JwtOpciones { SecretKey = "corta" },
            EsDesarrollo = false
        };

        var result = validator.Validate(null, opciones);

        Assert.True(result.Failed);
        Assert.NotEmpty(result.Failures!);
    }

    [Fact]
    public void JwtGenerator_SinSecretKeyEnConfiguracion_LanzaExcepcionSinValorPorDefecto()
    {
        var configVacia = CrearConfiguracion(new Dictionary<string, string?>());
        var generator = new JwtGenerator(configVacia);
        var usuario = new Usuario("uprueba", "Usuario Prueba", "u@test.com", "hash", RolUsuario.Mozo);

        var ex = Assert.Throws<InvalidOperationException>(() => generator.GenerarToken(usuario));

        Assert.Contains("Jwt:SecretKey", ex.Message, StringComparison.Ordinal);
    }
}
