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

    public static DateOnly GetFechaOperativa(DateTime utcDateTime)
    {
        var local = TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, LimaTimeZoneLazy.Value);
        return DateOnly.FromDateTime(local);
    }

    public static DateTime ConvertirUtcALocal(DateTime utcDateTime)
    {
        return TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, LimaTimeZoneLazy.Value);
    }

    public static DateTime ToPeruTime(DateTime utcDateTime)
    {
        return ConvertirUtcALocal(utcDateTime);
    }

    public static DateTime ObtenerFechaHoraActualLima()
    {
        return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, LimaTimeZoneLazy.Value);
    }
}
