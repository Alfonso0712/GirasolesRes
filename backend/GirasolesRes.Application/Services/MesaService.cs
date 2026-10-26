using System.Text.RegularExpressions;
using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Mesas;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Interfaces.Services;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Application.Services;

public class MesaService : IMesaService
{
    private readonly IMesaRepository _mesaRepository;
    private readonly IAuditoriaMesaRepository _auditoriaMesaRepository;

    public MesaService(
        IMesaRepository mesaRepository,
        IAuditoriaMesaRepository auditoriaMesaRepository)
    {
        _mesaRepository = mesaRepository;
        _auditoriaMesaRepository = auditoriaMesaRepository;
    }

    public async Task<Result<List<MesaDto>>> ListarMesasAsync(
        string? estado,
        bool incluirInactivas,
        string rolUsuario,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // RN-40 / RN-45: Mozo y Cajero solo ven mesas activas
            var puedeVerInactivas = rolUsuario.Equals("Administrador", StringComparison.OrdinalIgnoreCase) && incluirInactivas;

            EstadoOcupacionMesa? filtroOcupacion = null;
            if (!string.IsNullOrWhiteSpace(estado))
            {
                if (estado.Trim().Equals("libre", StringComparison.OrdinalIgnoreCase))
                    filtroOcupacion = EstadoOcupacionMesa.Libre;
                else if (estado.Trim().Equals("ocupada", StringComparison.OrdinalIgnoreCase))
                    filtroOcupacion = EstadoOcupacionMesa.Ocupada;
            }

            var mesas = await _mesaRepository.ListarMesasAsync(filtroOcupacion, puedeVerInactivas, cancellationToken);

            // Orden natural: Mesa 2 antes que Mesa 10 (CUS06.2)
            var mesasOrdenadas = mesas
                .OrderBy(m => m.Mes_Nombre, NaturalStringComparer.Instance)
                .Select(m => new MesaDto(
                    m.Id_Mesa,
                    m.Mes_Nombre,
                    m.Mes_Ocupacion.ToString(),
                    m.Mes_Activa
                ))
                .ToList();

            return Result<List<MesaDto>>.Exitoso(mesasOrdenadas);
        }
        catch (Exception ex)
        {
            return Result<List<MesaDto>>.Fallido(MensajesCatalogo.MSG_94, detalle: ex.Message);
        }
    }

    public async Task<Result<MesaDto>> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var mesa = await _mesaRepository.ObtenerPorIdAsync(id, cancellationToken);
            if (mesa is null)
            {
                return Result<MesaDto>.Fallido("La mesa no existe.");
            }

            return Result<MesaDto>.Exitoso(new MesaDto(
                mesa.Id_Mesa,
                mesa.Mes_Nombre,
                mesa.Mes_Ocupacion.ToString(),
                mesa.Mes_Activa
            ));
        }
        catch (Exception ex)
        {
            return Result<MesaDto>.Fallido(MensajesCatalogo.MSG_38, detalle: ex.Message);
        }
    }

    public async Task<Result<MesaDto>> RegistrarMesaAsync(
        CrearMesaRequest request,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // RV-53: Limpieza de espacios redundantes
            var nombreLimpio = MesaValidationHelper.LimpiarEspacios(request.Nombre);

            // RV-51: Validación obligatoria y longitud
            if (string.IsNullOrWhiteSpace(nombreLimpio))
            {
                return Result<MesaDto>.Fallido(MensajesCatalogo.MSG_81);
            }

            if (nombreLimpio.Length < 1 || nombreLimpio.Length > 20 ||
                !Regex.IsMatch(nombreLimpio, @"^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-.]+$"))
            {
                return Result<MesaDto>.Fallido(MensajesCatalogo.MSG_82);
            }

            // RV-52 / RN-41: Nombre único sin distinguir mayúsculas, tildes ni espacios
            var normalizado = MesaValidationHelper.NormalizarNombre(nombreLimpio);
            var existe = await _mesaRepository.ExisteNombreNormalizadoAsync(normalizado, null, cancellationToken);
            if (existe)
            {
                return Result<MesaDto>.Fallido(MensajesCatalogo.MSG_83);
            }

            // RN-42: Toda mesa nueva se registra Activa y Libre
            var mesa = new Mesa(nombreLimpio);
            await _mesaRepository.AgregarAsync(mesa, cancellationToken);

            // RN-47: Auditoría atómica
            var auditoria = new AuditoriaMesa(
                adminUsername,
                "CREAR",
                mesa.Mes_Nombre,
                $"Registro de nueva mesa '{mesa.Mes_Nombre}' activa y libre",
                ipAddress
            );
            await _auditoriaMesaRepository.RegistrarAsync(auditoria, cancellationToken);
            await _mesaRepository.GuardarCambiosAsync(cancellationToken);

            var dto = new MesaDto(mesa.Id_Mesa, mesa.Mes_Nombre, mesa.Mes_Ocupacion.ToString(), mesa.Mes_Activa);
            return Result<MesaDto>.Exitoso(dto, MensajesCatalogo.MSG_84);
        }
        catch (Exception ex)
        {
            return Result<MesaDto>.Fallido(MensajesCatalogo.MSG_38, detalle: ex.Message);
        }
    }

    public async Task<Result<MesaDto>> ActualizarMesaAsync(
        Guid id,
        ActualizarMesaRequest request,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var mesa = await _mesaRepository.ObtenerPorIdAsync(id, cancellationToken);
            if (mesa is null)
            {
                return Result<MesaDto>.Fallido("La mesa no existe.");
            }

            // RV-53: Limpieza de espacios redundantes
            var nombreLimpio = MesaValidationHelper.LimpiarEspacios(request.Nombre);

            // RV-51: Validación de obligatoriedad y caracteres
            if (string.IsNullOrWhiteSpace(nombreLimpio))
            {
                return Result<MesaDto>.Fallido(MensajesCatalogo.MSG_81);
            }

            if (nombreLimpio.Length < 1 || nombreLimpio.Length > 20 ||
                !Regex.IsMatch(nombreLimpio, @"^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-.]+$"))
            {
                return Result<MesaDto>.Fallido(MensajesCatalogo.MSG_82);
            }

            // RV-52 / RN-41: Nombre único sin distinguir mayúsculas, tildes ni espacios (excluyendo id actual)
            var normalizado = MesaValidationHelper.NormalizarNombre(nombreLimpio);
            var existe = await _mesaRepository.ExisteNombreNormalizadoAsync(normalizado, id, cancellationToken);
            if (existe)
            {
                return Result<MesaDto>.Fallido(MensajesCatalogo.MSG_83);
            }

            var nombreAnterior = mesa.Mes_Nombre;
            mesa.ActualizarNombre(nombreLimpio);
            await _mesaRepository.ActualizarAsync(mesa, cancellationToken);

            // RN-47: Auditoría atómica
            var auditoria = new AuditoriaMesa(
                adminUsername,
                "EDITAR",
                mesa.Mes_Nombre,
                $"Mesa modificada de '{nombreAnterior}' a '{mesa.Mes_Nombre}'",
                ipAddress
            );
            await _auditoriaMesaRepository.RegistrarAsync(auditoria, cancellationToken);
            await _mesaRepository.GuardarCambiosAsync(cancellationToken);

            var dto = new MesaDto(mesa.Id_Mesa, mesa.Mes_Nombre, mesa.Mes_Ocupacion.ToString(), mesa.Mes_Activa);
            return Result<MesaDto>.Exitoso(dto, MensajesCatalogo.MSG_85);
        }
        catch (Exception ex)
        {
            return Result<MesaDto>.Fallido(MensajesCatalogo.MSG_38, detalle: ex.Message);
        }
    }

    public async Task<Result<MesaDto>> CambiarEstadoAsync(
        Guid id,
        bool activa,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var mesa = await _mesaRepository.ObtenerPorIdAsync(id, cancellationToken);
            if (mesa is null)
            {
                return Result<MesaDto>.Fallido("La mesa no existe.");
            }

            // RV-56 / RN-44: Una mesa ocupada no se puede desactivar
            if (!activa && mesa.Mes_Ocupacion == EstadoOcupacionMesa.Ocupada)
            {
                return Result<MesaDto>.Fallido(string.Format(MensajesCatalogo.MSG_88, mesa.Mes_Nombre));
            }

            mesa.CambiarActiva(activa);
            await _mesaRepository.ActualizarAsync(mesa, cancellationToken);

            // RN-47: Auditoría atómica
            var accionAuditoria = activa ? "ACTIVAR" : "DESACTIVAR";
            var auditoria = new AuditoriaMesa(
                adminUsername,
                accionAuditoria,
                mesa.Mes_Nombre,
                $"Mesa '{mesa.Mes_Nombre}' marcada como {(activa ? "Activa" : "Inactiva")}",
                ipAddress
            );
            await _auditoriaMesaRepository.RegistrarAsync(auditoria, cancellationToken);
            await _mesaRepository.GuardarCambiosAsync(cancellationToken);

            var mensajeExito = activa ? MensajesCatalogo.MSG_90 : MensajesCatalogo.MSG_89;
            var dto = new MesaDto(mesa.Id_Mesa, mesa.Mes_Nombre, mesa.Mes_Ocupacion.ToString(), mesa.Mes_Activa);
            return Result<MesaDto>.Exitoso(dto, mensajeExito);
        }
        catch (Exception ex)
        {
            return Result<MesaDto>.Fallido(MensajesCatalogo.MSG_38, detalle: ex.Message);
        }
    }

    public async Task<Result<ResumenMesasDto>> ObtenerResumenAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var todas = await _mesaRepository.ListarMesasAsync(null, true, cancellationToken);
            var libres = todas.Count(m => m.Mes_Activa && m.Mes_Ocupacion == EstadoOcupacionMesa.Libre);
            var ocupadas = todas.Count(m => m.Mes_Activa && m.Mes_Ocupacion == EstadoOcupacionMesa.Ocupada);
            var inactivas = todas.Count(m => !m.Mes_Activa);

            return Result<ResumenMesasDto>.Exitoso(new ResumenMesasDto(
                todas.Count,
                libres,
                ocupadas,
                inactivas
            ));
        }
        catch (Exception ex)
        {
            return Result<ResumenMesasDto>.Fallido(MensajesCatalogo.MSG_94, detalle: ex.Message);
        }
    }
}
