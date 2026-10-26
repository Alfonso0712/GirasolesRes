namespace GirasolesRes.Application.Common;

/// <summary>
/// Constantes operativas y umbrales de negocio del Restaurante Girasoles.
/// </summary>
public static class RestauranteConstantes
{
    /// <summary>
    /// Umbral en minutos para considerar una comanda en demora en cocina y dashboard (RV-91, MSG-205).
    /// </summary>
    public const int MinutosDemoraCocina = 15;

    /// <summary>
    /// Precio máximo permitido para un producto o menú completo en soles (RV-36, RV-160).
    /// </summary>
    public const decimal PrecioMaximoProducto = 999.99m;

    /// <summary>
    /// Ventana de tiempo en segundos para deshacer el cambio de estado de comanda en interfaz (RV-88, RN-78).
    /// </summary>
    public const int SegundosVentanaDeshacerComanda = 10;

    /// <summary>
    /// Tolerancia técnica máxima en segundos para deshacer en el servidor (RN-78).
    /// </summary>
    public const double SegundosToleranciaDeshacerComanda = 10.5;

    /// <summary>
    /// Duración estándar de vigencia de token JWT en minutos (RN-20).
    /// </summary>
    public const int MinutosExpiracionToken = 30;

    /// <summary>
    /// Intervalo de renovación de token para el Cocinero en KDS en minutos (RN-82).
    /// </summary>
    public const int MinutosRenovacionTokenCocina = 20;
}
