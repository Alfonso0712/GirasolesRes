using System.Reflection;
using System.Text.RegularExpressions;
using GirasolesRes.Application.Common;
using Xunit;

namespace GirasolesRes.Tests;

public class CatalogoMensajesUnitTests
{
    private static string ObtenerRutaCsvMensajes()
    {
        var dir = AppContext.BaseDirectory;
        while (!string.IsNullOrEmpty(dir))
        {
            var rutaCsv = Path.Combine(dir, "analisis", "mensajes_documentados.csv");
            if (File.Exists(rutaCsv))
            {
                return rutaCsv;
            }
            var dirPadre = Directory.GetParent(dir);
            dir = dirPadre?.FullName;
        }

        throw new FileNotFoundException("No se encontró analisis/mensajes_documentados.csv en el árbol del proyecto.");
    }

    private static string NormalizarTexto(string s)
    {
        if (string.IsNullOrWhiteSpace(s)) return string.Empty;

        // Remover notas de UI entre paréntesis de la documentación CSV
        s = Regex.Replace(s, @"\s*\((botón|enlace|texto del botón)[^)]*\)", "", RegexOptions.IgnoreCase);

        // Reemplazar marcadores entre corchetes [x] y llaves {0}
        s = Regex.Replace(s, @"\[.*?\]", "{X}");
        s = Regex.Replace(s, @"\{.*?\}", "{X}");
        s = Regex.Replace(s, @"\{X\}\.?", "{X}");

        // Normalizar comillas y elipsis
        s = s.Replace("…", "...").Replace("\"", "'").Replace("\\'", "'");
        s = Regex.Replace(s, @"\s+", " ").Trim().TrimEnd('.');
        return s;
    }

    [Fact]
    public void ValidarTodosLosMensajesDocumentados_ExistenEnCodigoConTextoIdentico()
    {
        var rutaCsv = ObtenerRutaCsvMensajes();
        Assert.True(File.Exists(rutaCsv), $"El archivo CSV debe existir en {rutaCsv}");

        // Cargar constantes de MensajesCatalogo
        var fields = typeof(MensajesCatalogo)
            .GetFields(BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy)
            .Where(f => f.IsLiteral && !f.IsInitOnly && f.FieldType == typeof(string))
            .ToDictionary(f => f.Name, f => (string)f.GetValue(null)!);

        Assert.True(fields.Count >= 226, $"Debe haber al menos 226 constantes de mensajes; se encontraron {fields.Count}");

        var lineas = File.ReadAllLines(rutaCsv);
        Assert.True(lineas.Length > 1, "El CSV de mensajes no debe estar vacío");

        var cabecera = lineas[0];
        var discrepancias = new List<string>();
        int verificados = 0;

        for (int i = 1; i < lineas.Length; i++)
        {
            var linea = lineas[i];
            if (string.IsNullOrWhiteSpace(linea)) continue;

            // Parser CSV simple (id, texto, tipo, ubicacion, definido_en)
            var partes = ParsearLineaCsv(linea);
            if (partes.Count < 2) continue;

            var idMsg = partes[0].Trim();
            var textoCsv = partes[1].Trim();

            if (!idMsg.StartsWith("MSG-", StringComparison.OrdinalIgnoreCase)) continue;

            var numStr = idMsg.Substring(4);
            if (!int.TryParse(numStr, out var num)) continue;

            var constName = num < 10 ? $"MSG_0{num}" : $"MSG_{num}";

            // Caso especial MSG-162: se implementa en dos variantes según el CSV
            if (num == 162)
            {
                Assert.True(fields.ContainsKey("MSG_162_POR_COBRAR"), "Debe existir MSG_162_POR_COBRAR");
                Assert.True(fields.ContainsKey("MSG_162_ANULADO"), "Debe existir MSG_162_ANULADO");
                verificados++;
                continue;
            }

            if (!fields.TryGetValue(constName, out var textoCodigo) && !fields.TryGetValue($"MSG_{num}", out textoCodigo))
            {
                discrepancias.Add($"FALTA CONSTANTE: {idMsg} ({constName}) para: '{textoCsv}'");
                continue;
            }

            var normCsv = NormalizarTexto(textoCsv);
            var normCodigo = NormalizarTexto(textoCodigo);

            if (!string.Equals(normCsv, normCodigo, StringComparison.OrdinalIgnoreCase))
            {
                discrepancias.Add($"TEXTO DIFIERE en {idMsg} ({constName}):\n  CSV:  '{normCsv}'\n  CODE: '{normCodigo}'");
            }
            else
            {
                verificados++;
            }
        }

        Assert.Empty(discrepancias);
        Assert.True(verificados >= 220, $"Se deben haber verificado exitosamente al menos 220 mensajes; verificados: {verificados}");
    }

    private static List<string> ParsearLineaCsv(string line)
    {
        var result = new List<string>();
        bool inQuotes = false;
        var current = new System.Text.StringBuilder();

        for (int i = 0; i < line.Length; i++)
        {
            char c = line[i];
            if (c == '\"')
            {
                if (inQuotes && i + 1 < line.Length && line[i + 1] == '\"')
                {
                    current.Append('\"');
                    i++;
                }
                else
                {
                    inQuotes = !inQuotes;
                }
            }
            else if (c == ',' && !inQuotes)
            {
                result.Add(current.ToString());
                current.Clear();
            }
            else
            {
                current.Append(c);
            }
        }
        result.Add(current.ToString());
        return result;
    }
}
