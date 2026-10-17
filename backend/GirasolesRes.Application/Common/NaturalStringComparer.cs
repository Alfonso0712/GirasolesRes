using System.Text.RegularExpressions;

namespace GirasolesRes.Application.Common;

public class NaturalStringComparer : IComparer<string?>
{
    public static readonly NaturalStringComparer Instance = new();

    public int Compare(string? x, string? y)
    {
        if (ReferenceEquals(x, y)) return 0;
        if (x is null) return -1;
        if (y is null) return 1;

        var xTokens = Regex.Split(x, @"(\d+)");
        var yTokens = Regex.Split(y, @"(\d+)");

        var minLength = Math.Min(xTokens.Length, yTokens.Length);

        for (int i = 0; i < minLength; i++)
        {
            var tokenX = xTokens[i];
            var tokenY = yTokens[i];

            if (tokenX == tokenY) continue;

            if (long.TryParse(tokenX, out var numX) && long.TryParse(tokenY, out var numY))
            {
                var numCompare = numX.CompareTo(numY);
                if (numCompare != 0) return numCompare;
            }

            var stringCompare = string.Compare(tokenX, tokenY, StringComparison.CurrentCultureIgnoreCase);
            if (stringCompare != 0) return stringCompare;
        }

        return xTokens.Length.CompareTo(yTokens.Length);
    }
}
