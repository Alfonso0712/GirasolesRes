using GirasolesRes.Application.Common;
using GirasolesRes.Application.Common.Exceptions;
using GirasolesRes.Application.DTOs.Comandas;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Interfaces.Services;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Application.Services;

public class ComandaService : IComandaService
{
    private readonly IComandaRepository _comandaRepository;

    public ComandaService(IComandaRepository comandaRepository)
    {
        _comandaRepository = comandaRepository;
    }

    public async Task<ListarComandasResponseDto> ListarComandasAsync(string? estados = null)
    {
        var fechaOperativa = TimeZoneHelper.GetFechaOperativa(DateTime.UtcNow);
        var comandas = await _comandaRepository.ListarComandasCocinaAsync(fechaOperativa);

        // Si se especificaron estados en query
        if (!string.IsNullOrWhiteSpace(estados))
        {
            var filtroEstados = estados
                .Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(e => e.Trim().ToLowerInvariant())
                .ToHashSet();

            comandas = comandas.Where(c =>
            {
                var estStr = c.Cmd_Estado.ToString().ToLowerInvariant();
                return filtroEstados.Contains(estStr);
            }).ToList();
        }

        var ahoraUtc = DateTime.UtcNow;
        var items = new List<ComandaItemDto>();

        foreach (var c in comandas)
        {
            var horaLocal = TimeZoneHelper.ConvertirUtcALocal(c.Cmd_FechaHoraUtc);
            var minutosEspera = (int)Math.Max(0, (ahoraUtc - c.Cmd_FechaHoraUtc).TotalMinutes);

            string? etiqueta = null;
            if (c.Cmd_Modificada)
            {
                etiqueta = "MODIFICADA";
            }
            else if (c.Cmd_EsAdicional)
            {
                etiqueta = "ADICIONAL";
            }

            var item = new ComandaItemDto
            {
                Id = c.Id_Comanda,
                PedidoNumero = c.Cmd_Pedido?.Ped_NumeroDiario ?? c.Cmd_NumeroDiario,
                Tipo = c.Cmd_Pedido?.Ped_Tipo == TipoPedido.Mesa ? "Mesa" : "ParaLlevar",
                Mesa = !string.IsNullOrWhiteSpace(c.Cmd_NombreMesa) ? c.Cmd_NombreMesa : c.Cmd_Pedido?.Ped_Mesa?.Mes_Nombre,
                Referencia = c.Cmd_Pedido?.Ped_Notas,
                HoraLlegada = horaLocal.ToString("HH:mm"),
                FechaHoraLlegadaUtc = c.Cmd_FechaHoraUtc,
                Estado = c.Cmd_Estado.ToString(),
                Etiqueta = etiqueta,
                EsAdicional = c.Cmd_EsAdicional,
                NumeroAdicional = c.Cmd_EsAdicional ? 1 : 0,
                Modificada = c.Cmd_Modificada,
                RegistradoPor = c.Cmd_Pedido?.Ped_Usuario?.Usu_Nombre ?? "Sistema",
                MinutosEspera = minutosEspera,
                EsDemora = minutosEspera >= RestauranteConstantes.MinutosDemoraCocina, // RV-91: Demora a partir de 15 minutos
                Lineas = c.Cmd_Detalles.Select(d =>
                {
                    var nombreCompleto = !string.IsNullOrWhiteSpace(d.Dtc_Elecciones)
                        ? $"{d.Dtc_NombreProducto}: {d.Dtc_Elecciones}{(!string.IsNullOrWhiteSpace(d.Dtc_Incluye) ? $" (incluye {d.Dtc_Incluye})" : "")}"
                        : d.Dtc_NombreProducto;

                    return new LineaComandaDto
                    {
                        Producto = nombreCompleto,
                        Elecciones = d.Dtc_Elecciones,
                        Incluye = d.Dtc_Incluye,
                        Cantidad = d.Dtc_Cantidad,
                        Observacion = d.Dtc_Observacion
                    };
                }).ToList()
            };

            items.Add(item);
        }

        // Resumen superior "Por preparar" (RV-86 / RN-137): Sumar componentes de menús completos y platos de carta
        var resumenDict = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

        foreach (var comanda in items)
        {
            foreach (var l in comanda.Lineas)
            {
                if (!string.IsNullOrWhiteSpace(l.Elecciones))
                {
                    var componentes = l.Elecciones.Split(new[] { " + " }, StringSplitOptions.RemoveEmptyEntries);
                    foreach (var comp in componentes)
                    {
                        var compTrim = comp.Trim();
                        resumenDict[compTrim] = resumenDict.GetValueOrDefault(compTrim) + l.Cantidad;
                    }
                }
                else
                {
                    resumenDict[l.Producto] = resumenDict.GetValueOrDefault(l.Producto) + l.Cantidad;
                }
            }
        }

        var resumen = resumenDict
            .Select(kvp => new ResumenProductoDto
            {
                Producto = kvp.Key,
                Cantidad = kvp.Value
            })
            .OrderBy(r => r.Producto)
            .ToList();

        return new ListarComandasResponseDto
        {
            Items = items,
            Resumen = resumen
        };
    }

    public async Task<ActualizarEstadoComandaResponse> ActualizarEstadoAsync(
        Guid idComanda,
        ActualizarEstadoComandaRequest request,
        string nombreUsuario)
    {
        var comanda = await _comandaRepository.ObtenerComandaPorIdAsync(idComanda);
        if (comanda == null)
        {
            throw new RecursoNoEncontradoException("La comanda no existe.");
        }

        if (comanda.Cmd_Estado == EstadoComanda.Cancelada)
        {
            throw new ConflictoException(string.Format(MensajesCatalogo.MSG_128, comanda.Cmd_NumeroDiario));
        }

        var estadoObjetivo = request.Estado.Trim().ToLowerInvariant();

        if (estadoObjetivo == "enpreparacion")
        {
            // Idempotencia (RV-89)
            if (comanda.Cmd_Estado == EstadoComanda.EnPreparacion)
            {
                return new ActualizarEstadoComandaResponse
                {
                    Id = comanda.Id_Comanda,
                    Estado = "EnPreparacion",
                    DeshacerHasta = (comanda.Cmd_FecUltimoCambioEstadoUtc ?? DateTime.UtcNow).AddSeconds(RestauranteConstantes.SegundosVentanaDeshacerComanda),
                    Mensaje = string.Format(MensajesCatalogo.MSG_126, comanda.Cmd_NumeroDiario)
                };
            }

            if (comanda.Cmd_Estado != EstadoComanda.Pendiente)
            {
                throw new ConflictoException("Solo una comanda en estado Pendiente puede pasar a En preparación.");
            }

            comanda.IniciarPreparacion(nombreUsuario);
            await _comandaRepository.ActualizarComandaAsync(comanda);

            // Recalcular estado del pedido (RN-64)
            await RecalcularEstadoPedidoAsync(comanda.Id_Pedido);

            // Auditoría
            await _comandaRepository.GuardarAuditoriaAsync(new AuditoriaPedido(
                nombreUsuario.Trim(),
                "INICIAR_PREPARACION_COMANDA",
                comanda.Cmd_NombreMesa,
                comanda.Cmd_NumeroDiario,
                string.Format(MensajesCatalogo.MSG_126, comanda.Cmd_NumeroDiario)));

            return new ActualizarEstadoComandaResponse
            {
                Id = comanda.Id_Comanda,
                Estado = "EnPreparacion",
                DeshacerHasta = comanda.Cmd_FecUltimoCambioEstadoUtc!.Value.AddSeconds(RestauranteConstantes.SegundosVentanaDeshacerComanda),
                Mensaje = string.Format(MensajesCatalogo.MSG_126, comanda.Cmd_NumeroDiario)
            };
        }
        else if (estadoObjetivo == "lista")
        {
            // Idempotencia (RV-89)
            if (comanda.Cmd_Estado == EstadoComanda.Lista)
            {
                return new ActualizarEstadoComandaResponse
                {
                    Id = comanda.Id_Comanda,
                    Estado = "Lista",
                    DeshacerHasta = (comanda.Cmd_FecUltimoCambioEstadoUtc ?? DateTime.UtcNow).AddSeconds(RestauranteConstantes.SegundosVentanaDeshacerComanda),
                    Mensaje = string.Format(MensajesCatalogo.MSG_127, comanda.Cmd_NumeroDiario, "el personal de servicio")
                };
            }

            // RV-87 / MSG-130: No se salta de Pendiente a Lista directamente
            if (comanda.Cmd_Estado == EstadoComanda.Pendiente)
            {
                throw new ConflictoException(MensajesCatalogo.MSG_130);
            }

            if (comanda.Cmd_Estado != EstadoComanda.EnPreparacion)
            {
                throw new ConflictoException("Solo una comanda en preparación puede marcarse como lista.");
            }

            comanda.MarcarComoLista(nombreUsuario);
            await _comandaRepository.ActualizarComandaAsync(comanda);

            // Recalcular estado del pedido (RN-64)
            await RecalcularEstadoPedidoAsync(comanda.Id_Pedido);

            var rolResponsable = comanda.Cmd_Pedido?.Ped_Tipo == TipoPedido.Mesa ? "el mozo" : "el cajero";

            // Auditoría
            await _comandaRepository.GuardarAuditoriaAsync(new AuditoriaPedido(
                nombreUsuario.Trim(),
                "MARCAR_COMANDA_LISTA",
                comanda.Cmd_NombreMesa,
                comanda.Cmd_NumeroDiario,
                string.Format(MensajesCatalogo.MSG_127, comanda.Cmd_NumeroDiario, rolResponsable)));

            return new ActualizarEstadoComandaResponse
            {
                Id = comanda.Id_Comanda,
                Estado = "Lista",
                DeshacerHasta = comanda.Cmd_FecUltimoCambioEstadoUtc!.Value.AddSeconds(RestauranteConstantes.SegundosVentanaDeshacerComanda),
                Mensaje = string.Format(MensajesCatalogo.MSG_127, comanda.Cmd_NumeroDiario, rolResponsable)
            };
        }
        else
        {
            throw new ReglaNegocioException("El estado debe ser 'enPreparacion' o 'lista'.");
        }
    }

    public async Task<DeshacerEstadoComandaResponse> DeshacerEstadoAsync(Guid idComanda, string nombreUsuario)
    {
        var comanda = await _comandaRepository.ObtenerComandaPorIdAsync(idComanda);
        if (comanda == null)
        {
            throw new RecursoNoEncontradoException("La comanda no existe.");
        }

        // RN-78, RN-79, MSG-134: No se puede deshacer si pasaron más de 10 segundos, pedido pagado o anulado
        if (!comanda.Cmd_FecUltimoCambioEstadoUtc.HasValue || !comanda.Cmd_EstadoAnterior.HasValue)
        {
            throw new ConflictoException(MensajesCatalogo.MSG_134);
        }

        var segundosTranscurridos = (DateTime.UtcNow - comanda.Cmd_FecUltimoCambioEstadoUtc.Value).TotalSeconds;
        if (segundosTranscurridos > RestauranteConstantes.SegundosToleranciaDeshacerComanda)
        {
            throw new ConflictoException(MensajesCatalogo.MSG_134);
        }

        if (comanda.Cmd_Pedido?.Ped_Estado == EstadoPedido.Pagado || comanda.Cmd_Pedido?.Ped_Estado == EstadoPedido.Anulado)
        {
            throw new ConflictoException(MensajesCatalogo.MSG_134);
        }

        comanda.DeshacerUltimoEstado();
        await _comandaRepository.ActualizarComandaAsync(comanda);

        // Recalcular estado del pedido tras deshacer
        await RecalcularEstadoPedidoAsync(comanda.Id_Pedido);

        // Auditoría
        await _comandaRepository.GuardarAuditoriaAsync(new AuditoriaPedido(
            nombreUsuario.Trim(),
            "DESHACER_ESTADO_COMANDA",
            comanda.Cmd_NombreMesa,
            comanda.Cmd_NumeroDiario,
            $"Se deshizo el estado de la comanda N.º {comanda.Cmd_NumeroDiario} a {comanda.Cmd_Estado}."));

        return new DeshacerEstadoComandaResponse
        {
            Id = comanda.Id_Comanda,
            Estado = comanda.Cmd_Estado.ToString(),
            Mensaje = $"Comanda N.º {comanda.Cmd_NumeroDiario} restaurada a {comanda.Cmd_Estado}."
        };
    }

    private async Task RecalcularEstadoPedidoAsync(Guid idPedido)
    {
        var pedido = await _comandaRepository.ObtenerPedidoConComandasAsync(idPedido);
        if (pedido == null) return;

        var comandasValidas = pedido.Ped_Comandas.Where(c => c.Cmd_Estado != EstadoComanda.Cancelada).ToList();
        if (!comandasValidas.Any()) return;

        EstadoPedido nuevoEstado;
        if (comandasValidas.Any(c => c.Cmd_Estado == EstadoComanda.EnPreparacion))
        {
            nuevoEstado = EstadoPedido.EnPreparacion;
        }
        else if (comandasValidas.Any(c => c.Cmd_Estado == EstadoComanda.Pendiente))
        {
            nuevoEstado = EstadoPedido.Pendiente;
        }
        else if (comandasValidas.All(c => c.Cmd_Estado == EstadoComanda.Lista))
        {
            nuevoEstado = EstadoPedido.Listo;
        }
        else
        {
            nuevoEstado = pedido.Ped_Estado;
        }

        if (pedido.Ped_Estado != EstadoPedido.Pagado && pedido.Ped_Estado != EstadoPedido.Anulado && pedido.Ped_Estado != nuevoEstado)
        {
            await _comandaRepository.ActualizarEstadoPedidoAsync(pedido.Id_Pedido, nuevoEstado);
        }
    }
}
