using System.ComponentModel.DataAnnotations;
using GirasolesRes.Application.Common;

namespace GirasolesRes.Application.DTOs.Auth;

public class LoginRequest
{
    [Required(ErrorMessage = MensajesCatalogo.MSG_01)]
    [StringLength(30, MinimumLength = 3, ErrorMessage = MensajesCatalogo.MSG_03)]
    [RegularExpression(@"^[a-zA-Z0-9._-]+$", ErrorMessage = MensajesCatalogo.MSG_03)]
    public string Usuario { get; set; } = string.Empty;

    [Required(ErrorMessage = MensajesCatalogo.MSG_02)]
    public string Contrasena { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Usuario { get; set; } = string.Empty;
    public string Tema { get; set; } = "light";
}

public class ForgotPasswordRequest
{
    [Required(ErrorMessage = MensajesCatalogo.MSG_12)]
    [EmailAddress(ErrorMessage = MensajesCatalogo.MSG_12)]
    public string Correo { get; set; } = string.Empty;
}

public class ResetPasswordRequest
{
    [Required(ErrorMessage = MensajesCatalogo.MSG_12)]
    [EmailAddress(ErrorMessage = MensajesCatalogo.MSG_12)]
    public string Correo { get; set; } = string.Empty;

    [Required(ErrorMessage = MensajesCatalogo.MSG_13)]
    [StringLength(6, MinimumLength = 6, ErrorMessage = MensajesCatalogo.MSG_13)]
    public string Codigo { get; set; } = string.Empty;

    [Required(ErrorMessage = MensajesCatalogo.MSG_14)]
    [StringLength(64, MinimumLength = 8, ErrorMessage = MensajesCatalogo.MSG_14)]
    public string NuevaContrasena { get; set; } = string.Empty;
}
