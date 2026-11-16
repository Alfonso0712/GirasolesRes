using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using GirasolesRes.Application.Interfaces.Security;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Infrastructure.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace GirasolesRes.Infrastructure.Security;

public class JwtGenerator : IJwtGenerator
{
    private readonly IConfiguration _configuration;

    public JwtGenerator(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerarToken(Usuario usuario)
    {
        var secretKey = (_configuration["Jwt:SecretKey"] ?? string.Empty).Trim();
        var errores = new List<string>();
        ConfiguracionSeguridadValidator.ValidarClaveJwt(secretKey, errores);
        if (errores.Count > 0)
        {
            throw new InvalidOperationException(string.Join(" ", errores));
        }

        var issuer = string.IsNullOrWhiteSpace(_configuration["Jwt:Issuer"])
            ? "GirasolesRes"
            : _configuration["Jwt:Issuer"]!.Trim();
        var audience = string.IsNullOrWhiteSpace(_configuration["Jwt:Audience"])
            ? "GirasolesResApp"
            : _configuration["Jwt:Audience"]!.Trim();

        var erroresExpiracion = new List<string>();
        var expiryMinutes = ConfiguracionSeguridadValidator.ResolverExpiracionJwt(
            _configuration["Jwt:ExpiracionMinutos"],
            _configuration["Jwt:ExpiryMinutes"],
            erroresExpiracion);
        if (erroresExpiracion.Count > 0)
        {
            throw new InvalidOperationException(string.Join(" ", erroresExpiracion));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, usuario.Id_Usuario.ToString()),
            new(ClaimTypes.NameIdentifier, usuario.Id_Usuario.ToString()),
            new(ClaimTypes.Name, usuario.Usu_Usuario),
            new("usuario", usuario.Usu_Usuario),
            new("nombreCompleto", usuario.Usu_Nombre),
            new(ClaimTypes.Role, usuario.Usu_Rol.ToString()),
            new(ClaimTypes.Email, usuario.Usu_Correo ?? string.Empty),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(expiryMinutes),
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = credentials
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}
