using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using GirasolesRes.Application.Interfaces.Security;
using GirasolesRes.Domain.Entities;
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
        var secretKey = _configuration["Jwt:SecretKey"] ?? "GirasolesRestauranteSuperClaveSecretaSegura2026!@#$%^";
        var issuer = _configuration["Jwt:Issuer"] ?? "GirasolesRes";
        var audience = _configuration["Jwt:Audience"] ?? "GirasolesResApp";
        var expiryMinutesStr = _configuration["Jwt:ExpiryMinutes"] ?? "30";

        if (!int.TryParse(expiryMinutesStr, out var expiryMinutes))
        {
            expiryMinutes = 30;
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
            new(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new(ClaimTypes.Name, usuario.NombreUsuario),
            new("usuario", usuario.NombreUsuario),
            new("nombreCompleto", usuario.NombreCompleto),
            new(ClaimTypes.Role, usuario.Rol.ToString()),
            new(ClaimTypes.Email, usuario.Correo ?? string.Empty),
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
