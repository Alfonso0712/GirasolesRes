using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Domain.Entities;

public class Usuario
{
    public Guid Id_Usuario { get; private set; }
    public string Usu_Nombre { get; private set; } = string.Empty;
    public string Usu_Usuario { get; private set; } = string.Empty;
    public string? Usu_Correo { get; private set; }
    public string Usu_PasswordHash { get; private set; } = string.Empty;
    public RolUsuario Usu_Rol { get; private set; }
    public bool Usu_Activo { get; private set; }
    public int Usu_IntentosFallidos { get; private set; }
    public DateTime? Usu_BloqueadoHastaUtc { get; private set; }
    public DateTime Usu_FechaCreacionUtc { get; private set; }
    public DateTime? Usu_FechaActualizacionUtc { get; private set; }
    public string Usu_Tema { get; private set; } = TemaUsuario.Claro;
    public string Usu_Orientacion { get; private set; } = OrientacionUsuario.Diestro;

    // Constructor privado para EF Core
    private Usuario() { }

    public Usuario(
        string usuUsuario,
        string usuNombre,
        string? usuCorreo,
        string usuPasswordHash,
        RolUsuario usuRol,
        bool usuActivo = true)
    {
        Id_Usuario = Guid.NewGuid();
        Usu_Usuario = usuUsuario.Trim().ToLowerInvariant();
        Usu_Nombre = usuNombre.Trim();
        Usu_Correo = string.IsNullOrWhiteSpace(usuCorreo) ? null : usuCorreo.Trim().ToLowerInvariant();
        Usu_PasswordHash = usuPasswordHash;
        Usu_Rol = usuRol;
        Usu_Activo = usuActivo;
        Usu_IntentosFallidos = 0;
        Usu_BloqueadoHastaUtc = null;
        Usu_FechaCreacionUtc = DateTime.UtcNow;
    }

    public bool EstaBloqueado()
    {
        return Usu_BloqueadoHastaUtc.HasValue && Usu_BloqueadoHastaUtc.Value > DateTime.UtcNow;
    }

    public void RegistrarIntentoFallido(int maxIntentos = 5, int minutosBloqueo = 15)
    {
        Usu_IntentosFallidos++;
        if (Usu_IntentosFallidos >= maxIntentos)
        {
            Usu_BloqueadoHastaUtc = DateTime.UtcNow.AddMinutes(minutosBloqueo);
        }
        Usu_FechaActualizacionUtc = DateTime.UtcNow;
    }

    public void ReiniciarIntentosFallidos()
    {
        Usu_IntentosFallidos = 0;
        Usu_BloqueadoHastaUtc = null;
        Usu_FechaActualizacionUtc = DateTime.UtcNow;
    }

    public void ActualizarDatos(string usuNombre, string usuUsuario, string? usuCorreo, RolUsuario usuRol)
    {
        Usu_Nombre = usuNombre.Trim();
        Usu_Usuario = usuUsuario.Trim().ToLowerInvariant();
        Usu_Correo = string.IsNullOrWhiteSpace(usuCorreo) ? null : usuCorreo.Trim().ToLowerInvariant();
        Usu_Rol = usuRol;
        Usu_FechaActualizacionUtc = DateTime.UtcNow;
    }

    public void CambiarRol(RolUsuario nuevoRol)
    {
        Usu_Rol = nuevoRol;
        Usu_FechaActualizacionUtc = DateTime.UtcNow;
    }

    public void ActualizarPassword(string nuevoPasswordHash)
    {
        Usu_PasswordHash = nuevoPasswordHash;
        ReiniciarIntentosFallidos();
        Usu_FechaActualizacionUtc = DateTime.UtcNow;
    }

    public void CambiarEstado(bool activo)
    {
        Usu_Activo = activo;
        Usu_FechaActualizacionUtc = DateTime.UtcNow;
    }

    public void ActualizarTema(string tema)
    {
        var temaNormalizado = (tema ?? string.Empty).Trim().ToLowerInvariant();
        if (!TemaUsuario.EsValido(temaNormalizado))
        {
            throw new ArgumentException("El tema debe ser 'light' o 'dark'.", nameof(tema));
        }
        Usu_Tema = temaNormalizado;
    }
    public void ActualizarOrientacion(string orientacion)
    {
        var orientacionNormalizada = (orientacion ?? string.Empty).Trim().ToLowerInvariant();
        if (!OrientacionUsuario.EsValido(orientacionNormalizada))
        {
            throw new ArgumentException("La orientación debe ser 'right' o 'left'.", nameof(orientacion));
        }

        Usu_Orientacion = orientacionNormalizada;
    }
}
