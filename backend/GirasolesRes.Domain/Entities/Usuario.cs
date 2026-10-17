using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Domain.Entities;

public class Usuario
{
    public Guid Id { get; private set; }
    public string NombreUsuario { get; private set; } = string.Empty;
    public string NombreCompleto { get; private set; } = string.Empty;
    public string? Correo { get; private set; }
    public string PasswordHash { get; private set; } = string.Empty;
    public RolUsuario Rol { get; private set; }
    public bool Activo { get; private set; }
    public int IntentosFallidos { get; private set; }
    public DateTime? BloqueadoHastaUtc { get; private set; }
    public DateTime FechaCreacionUtc { get; private set; }
    public DateTime? FechaActualizacionUtc { get; private set; }

    // Propiedades puente de compatibilidad con estándar de cátedra (Prefijo trilateral Usuario)
    public Guid Id_Usuario => Id;
    public string Nom_Usuario => NombreUsuario;
    public string Nom_Completo => NombreCompleto;
    public string? Cor_Usuario => Correo;
    public string Has_Usuario => PasswordHash;
    public RolUsuario Rol_Usuario => Rol;
    public bool Est_Usuario => Activo;
    public int Int_Fallidos => IntentosFallidos;
    public DateTime? Bloq_HastaUtc => BloqueadoHastaUtc;
    public DateTime Fec_CreacionUtc => FechaCreacionUtc;
    public DateTime? Fec_ActualizacionUtc => FechaActualizacionUtc;

    // Constructor privado para EF Core
    private Usuario() { }

    public Usuario(
        string nombreUsuario,
        string nombreCompleto,
        string? correo,
        string passwordHash,
        RolUsuario rol,
        bool activo = true)
    {
        Id = Guid.NewGuid();
        NombreUsuario = nombreUsuario.Trim().ToLowerInvariant();
        NombreCompleto = nombreCompleto.Trim();
        Correo = string.IsNullOrWhiteSpace(correo) ? null : correo.Trim().ToLowerInvariant();
        PasswordHash = passwordHash;
        Rol = rol;
        Activo = activo;
        IntentosFallidos = 0;
        BloqueadoHastaUtc = null;
        FechaCreacionUtc = DateTime.UtcNow;
    }

    public bool EstaBloqueado()
    {
        return BloqueadoHastaUtc.HasValue && BloqueadoHastaUtc.Value > DateTime.UtcNow;
    }

    public void RegistrarIntentoFallido(int maxIntentos = 5, int minutosBloqueo = 15)
    {
        IntentosFallidos++;
        if (IntentosFallidos >= maxIntentos)
        {
            BloqueadoHastaUtc = DateTime.UtcNow.AddMinutes(minutosBloqueo);
        }
        FechaActualizacionUtc = DateTime.UtcNow;
    }

    public void ReiniciarIntentosFallidos()
    {
        IntentosFallidos = 0;
        BloqueadoHastaUtc = null;
        FechaActualizacionUtc = DateTime.UtcNow;
    }

    public void ActualizarDatos(string nombreCompleto, string nombreUsuario, string? correo, RolUsuario rol)
    {
        NombreCompleto = nombreCompleto.Trim();
        NombreUsuario = nombreUsuario.Trim().ToLowerInvariant();
        Correo = string.IsNullOrWhiteSpace(correo) ? null : correo.Trim().ToLowerInvariant();
        Rol = rol;
        FechaActualizacionUtc = DateTime.UtcNow;
    }

    public void CambiarRol(RolUsuario nuevoRol)
    {
        Rol = nuevoRol;
        FechaActualizacionUtc = DateTime.UtcNow;
    }

    public void ActualizarPassword(string nuevoPasswordHash)
    {
        PasswordHash = nuevoPasswordHash;
        ReiniciarIntentosFallidos();
        FechaActualizacionUtc = DateTime.UtcNow;
    }

    public void CambiarEstado(bool activo)
    {
        Activo = activo;
        FechaActualizacionUtc = DateTime.UtcNow;
    }
}
