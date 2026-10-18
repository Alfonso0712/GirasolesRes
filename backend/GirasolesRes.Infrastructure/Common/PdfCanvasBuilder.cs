using System.Globalization;
using System.Text;

namespace GirasolesRes.Infrastructure.Common;

/// <summary>
/// Constructor vectorial de bajo nivel de archivos PDF 1.4 sin dependencias externas.
/// </summary>
public class PdfCanvasBuilder
{
    public const float PageWidth = 595.28f;
    public const float PageHeight = 841.89f;

    private readonly StringBuilder _stream = new(8192);

    private float ToPdfY(float topDownY) => PageHeight - topDownY;

    public void DrawFilledRect(float x, float topY, float width, float height,
        float rFill, float gFill, float bFill,
        float? rStroke = null, float? gStroke = null, float? bStroke = null, float strokeWidth = 1f)
    {
        var pdfY = ToPdfY(topY + height);
        _stream.Append(CultureInfo.InvariantCulture, $"q\n");
        _stream.Append(CultureInfo.InvariantCulture, $"{rFill:F3} {gFill:F3} {bFill:F3} rg\n");
        if (rStroke.HasValue)
        {
            _stream.Append(CultureInfo.InvariantCulture, $"{rStroke.Value:F3} {gStroke!.Value:F3} {bStroke!.Value:F3} RG\n");
            _stream.Append(CultureInfo.InvariantCulture, $"{strokeWidth:F2} w\n");
            _stream.Append(CultureInfo.InvariantCulture, $"{x:F2} {pdfY:F2} {width:F2} {height:F2} re B\n");
        }
        else
        {
            _stream.Append(CultureInfo.InvariantCulture, $"{x:F2} {pdfY:F2} {width:F2} {height:F2} re f\n");
        }
        _stream.Append("Q\n");
    }

    public void DrawLine(float x1, float topY1, float x2, float topY2, float r, float g, float b, float width = 1f)
    {
        var y1 = ToPdfY(topY1);
        var y2 = ToPdfY(topY2);
        _stream.Append(CultureInfo.InvariantCulture, $"q\n{r:F3} {g:F3} {b:F3} RG\n{width:F2} w\n{x1:F2} {y1:F2} m {x2:F2} {y2:F2} l S\nQ\n");
    }

    public void DrawText(string text, float x, float topY, string font, float fontSize,
        float r, float g, float b, bool alignRight = false)
    {
        if (string.IsNullOrEmpty(text)) return;

        var pdfY = ToPdfY(topY);
        var sanitized = EscapePdfString(text);

        float finalX = x;
        if (alignRight)
        {
            float charWidth = fontSize * 0.52f;
            float textWidth = text.Length * charWidth;
            finalX = Math.Max(28f, x - textWidth);
        }

        _stream.Append(CultureInfo.InvariantCulture,
            $"BT\n{font} {fontSize:F1} Tf\n{r:F3} {g:F3} {b:F3} rg\n{finalX:F2} {pdfY:F2} Td\n({sanitized}) Tj\nET\n");
    }

    private static string EscapePdfString(string input)
    {
        var sb = new StringBuilder(input.Length + 16);
        foreach (var c in input)
        {
            switch (c)
            {
                case '(': sb.Append("\\("); break;
                case ')': sb.Append("\\)"); break;
                case '\\': sb.Append("\\\\"); break;
                case 'á': sb.Append("a"); break;
                case 'é': sb.Append("e"); break;
                case 'í': sb.Append("i"); break;
                case 'ó': sb.Append("o"); break;
                case 'ú': sb.Append("u"); break;
                case 'Á': sb.Append("A"); break;
                case 'É': sb.Append("E"); break;
                case 'Í': sb.Append("I"); break;
                case 'Ó': sb.Append("O"); break;
                case 'Ú': sb.Append("U"); break;
                case 'ñ': sb.Append("n"); break;
                case 'Ñ': sb.Append("N"); break;
                case 'º': sb.Append(".o"); break;
                case '°': sb.Append(".o"); break;
                default:
                    if (c >= 32 && c <= 126) sb.Append(c);
                    else sb.Append(' ');
                    break;
            }
        }
        return sb.ToString();
    }

    public byte[] BuildPdfBytes(string title = "Reporte Restaurante Girasoles")
    {
        var streamBytes = Encoding.ASCII.GetBytes(_stream.ToString());

        using var ms = new MemoryStream();
        using var writer = new StreamWriter(ms, Encoding.ASCII);

        var offsets = new List<long>();

        writer.Write("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
        writer.Flush();

        // Objeto 1: Catálogo
        offsets.Add(ms.Position);
        writer.Write("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
        writer.Flush();

        // Objeto 2: Árbol de Páginas
        offsets.Add(ms.Position);
        writer.Write("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
        writer.Flush();

        // Objeto 3: Página A4
        offsets.Add(ms.Position);
        writer.Write(string.Format(CultureInfo.InvariantCulture,
            "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {0:F2} {1:F2}] /Resources 4 0 R /Contents 5 0 R >>\nendobj\n", PageWidth, PageHeight));
        writer.Flush();

        // Objeto 4: Recursos (Fuentes estándar)
        offsets.Add(ms.Position);
        writer.Write("4 0 obj\n<< /Font << " +
                     "/F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> " +
                     "/F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> " +
                     "/F3 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >> " +
                     ">> >>\nendobj\n");
        writer.Flush();

        // Objeto 5: Stream de contenido
        offsets.Add(ms.Position);
        writer.Write($"5 0 obj\n<< /Length {streamBytes.Length} >>\nstream\n");
        writer.Flush();
        ms.Write(streamBytes, 0, streamBytes.Length);
        writer.Write("\nendstream\nendobj\n");
        writer.Flush();

        // Objeto 6: Metadatos Info
        offsets.Add(ms.Position);
        writer.Write($"6 0 obj\n<< /Title ({EscapePdfString(title)}) /Author (Restaurante Girasoles) /Creator (GirasolesRes Backend) >>\nendobj\n");
        writer.Flush();

        // Tabla de Referencias Cruzadas (xref)
        var startXref = ms.Position;
        writer.Write($"xref\n0 {offsets.Count + 1}\n");
        writer.Write("0000000000 65535 f \n");
        foreach (var off in offsets)
        {
            writer.Write($"{off:D10} 00000 n \n");
        }

        // Trailer
        writer.Write($"trailer\n<< /Size {offsets.Count + 1} /Root 1 0 R /Info 6 0 R >>\n");
        writer.Write($"startxref\n{startXref}\n%%EOF\n");
        writer.Flush();

        return ms.ToArray();
    }
}
