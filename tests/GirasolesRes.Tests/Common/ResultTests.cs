using GirasolesRes.Application.Common;
using Xunit;

namespace GirasolesRes.Tests.Common;

public class ResultTests
{
    [Fact]
    public void Success_DebeCrearResultadoExitoso()
    {
        var result = Result.Success();

        Assert.True(result.IsSuccess);
        Assert.False(result.IsFailure);
        Assert.Null(result.Error);
        Assert.Null(result.ErrorCode);
    }

    [Fact]
    public void Failure_DebeCrearResultadoFallidoConErrorYCodigo()
    {
        const string errorMsg = "El pedido no puede ser cobrado porque está en preparación.";
        const string errorCode = "PEDIDO_NO_LISTO";

        var result = Result.Failure(errorMsg, errorCode);

        Assert.False(result.IsSuccess);
        Assert.True(result.IsFailure);
        Assert.Equal(errorMsg, result.Error);
        Assert.Equal(errorCode, result.ErrorCode);
    }

    [Fact]
    public void TypedSuccess_DebeRetornarValorEsperado()
    {
        const int expectedId = 42;
        var result = Result<int>.Success(expectedId);

        Assert.True(result.IsSuccess);
        Assert.Equal(expectedId, result.Value);
        Assert.Null(result.Error);
    }

    [Fact]
    public void TypedFailure_DebeRetornarValorPorDefectoYError()
    {
        const string errorMsg = "Mesa no encontrada";
        var result = Result<string>.Failure(errorMsg, "MESA_NOT_FOUND");

        Assert.False(result.IsSuccess);
        Assert.True(result.IsFailure);
        Assert.Null(result.Value);
        Assert.Equal(errorMsg, result.Error);
        Assert.Equal("MESA_NOT_FOUND", result.ErrorCode);
    }

    [Fact]
    public void ImplicitOperator_DebeConvertirValorAResultExitoso()
    {
        Result<string> result = "Operación completada";

        Assert.True(result.IsSuccess);
        Assert.Equal("Operación completada", result.Value);
    }
}
