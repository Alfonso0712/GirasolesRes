using GirasolesRes.Domain.Entities;

namespace GirasolesRes.Application.Interfaces.Security;

public interface IJwtGenerator
{
    string GenerarToken(Usuario usuario);
}
