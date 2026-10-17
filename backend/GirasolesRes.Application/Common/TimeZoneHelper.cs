namespace GirasolesRes.Application.Common;

public static class TimeZoneHelper
{
    private static readonly Lazy<TimeZoneInfo> LimaTimeZoneLazy = new(GetLimaTimeZone);

    private static TimeZoneInfo GetLimaTimeZone()
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById("SA Pacific Standard Time");
        }
        catch
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById("America/Lima");
            }
            catch
            {
                return TimeZoneInfo.CreateCustomTimeZone("Lima", TimeSpan.FromHours(-5), "Lima", "Lima");
            }
        }
    }

    public static DateOnly ObtenerFechaActualLima()
    {
        var limaNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, LimaTimeZoneLazy.Value);
        return DateOnly.FromDateTime(limaNow);
    }

    public static DateTime ObtenerFechaHoraActualLima()
    {
        return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, LimaTimeZoneLazy.Value);
    }
}
