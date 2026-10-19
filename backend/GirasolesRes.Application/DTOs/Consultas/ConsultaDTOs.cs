namespace GirasolesRes.Application.DTOs.Consultas;

public record ConsultaDniResultadoDto(
    string Dni,
    string Nombres,
    string ApellidoPaterno,
    string ApellidoMaterno,
    string NombreCompleto
);

public record ConsultaRucResultadoDto(
    string Ruc,
    string RazonSocial,
    string? Estado,
    string? Condicion,
    string? Direccion,
    string? Departamento,
    string? Provincia,
    string? Distrito
);
