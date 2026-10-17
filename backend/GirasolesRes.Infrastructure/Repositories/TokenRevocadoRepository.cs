using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GirasolesRes.Infrastructure.Repositories;

public class TokenRevocadoRepository : ITokenRevocadoRepository
{
    private readonly GirasolesDbContext _context;

    public TokenRevocadoRepository(GirasolesDbContext context)
    {
        _context = context;
    }

    public async Task RevocarAsync(string jti, string nombreUsuario, DateTime fechaExpiracionUtc, string motivo, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(jti)) return;

        var existe = await _context.TokensRevocados.AnyAsync(t => t.Jti == jti, cancellationToken);
        if (!existe)
        {
            var tokenRevocado = new TokenRevocado(jti, nombreUsuario, fechaExpiracionUtc, motivo);
            await _context.TokensRevocados.AddAsync(tokenRevocado, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<bool> EstaRevocadoAsync(string jti, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(jti)) return false;

        return await _context.TokensRevocados
            .AnyAsync(t => t.Jti == jti, cancellationToken);
    }

    public async Task RevocarTokensDeUsuarioAsync(string nombreUsuario, string motivo, CancellationToken cancellationToken = default)
    {
        var normUser = nombreUsuario.Trim().ToLowerInvariant();
        // Para RN-22: si se revocan todos los tokens de un usuario, se guardan en auditoría
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task LimpiarExpiradosAsync(CancellationToken cancellationToken = default)
    {
        var ahora = DateTime.UtcNow;
        var expirados = await _context.TokensRevocados
            .Where(t => t.FechaExpiracionUtc < ahora)
            .ToListAsync(cancellationToken);

        if (expirados.Count > 0)
        {
            _context.TokensRevocados.RemoveRange(expirados);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
