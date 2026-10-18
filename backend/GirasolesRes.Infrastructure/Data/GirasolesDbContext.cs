using GirasolesRes.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace GirasolesRes.Infrastructure.Data;

public class GirasolesDbContext : DbContext
{
    public GirasolesDbContext(DbContextOptions<GirasolesDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<RegistroIngreso> RegistrosIngreso => Set<RegistroIngreso>();
    public DbSet<CodigoRecuperacion> CodigosRecuperacion => Set<CodigoRecuperacion>();
    public DbSet<AuditoriaUsuario> AuditoriasUsuario => Set<AuditoriaUsuario>();
    public DbSet<TokenRevocado> TokensRevocados => Set<TokenRevocado>();
    public DbSet<Mesa> Mesas => Set<Mesa>();
    public DbSet<AuditoriaMesa> AuditoriasMesa => Set<AuditoriaMesa>();
    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<MenuDia> MenusDia => Set<MenuDia>();
    public DbSet<MenuDiaPlato> MenuDiaPlatos => Set<MenuDiaPlato>();
    public DbSet<Pedido> Pedidos => Set<Pedido>();
    public DbSet<DetallePedido> DetallesPedido => Set<DetallePedido>();
    public DbSet<Comanda> Comandas => Set<Comanda>();
    public DbSet<DetalleComanda> DetallesComanda => Set<DetalleComanda>();
    public DbSet<AuditoriaPedido> AuditoriasPedido => Set<AuditoriaPedido>();
    public DbSet<Caja> Cajas => Set<Caja>();
    public DbSet<Venta> Ventas => Set<Venta>();
    public DbSet<Comprobante> Comprobantes => Set<Comprobante>();
    public DbSet<AuditoriaCobro> AuditoriasCobro => Set<AuditoriaCobro>();
    public DbSet<AuditoriaReporte> AuditoriasReporte => Set<AuditoriaReporte>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.ToTable("usuarios");
            entity.HasKey(u => u.Id_Usuario);
            entity.Property(u => u.Id_Usuario).HasColumnName("id_usuario");
            entity.Property(u => u.Usu_Nombre).HasColumnName("nom_completo").HasMaxLength(150).IsRequired();
            entity.Property(u => u.Usu_Usuario).HasColumnName("nom_usuario").HasMaxLength(30).IsRequired();
            entity.HasIndex(u => u.Usu_Usuario).IsUnique();
            entity.Property(u => u.Usu_Correo).HasColumnName("cor_usuario").HasMaxLength(100).IsRequired(false);
            entity.HasIndex(u => u.Usu_Correo);
            entity.Property(u => u.Usu_PasswordHash).HasColumnName("has_usuario").IsRequired();
            entity.Property(u => u.Usu_Rol).HasColumnName("rol_usuario").IsRequired();
            entity.Property(u => u.Usu_Activo).HasColumnName("est_usuario").IsRequired().HasDefaultValue(true);
            entity.Property(u => u.Usu_IntentosFallidos).HasColumnName("int_fallidos").IsRequired().HasDefaultValue(0);
            entity.Property(u => u.Usu_BloqueadoHastaUtc).HasColumnName("bloq_hasta_utc");
            entity.Property(u => u.Usu_FechaCreacionUtc).HasColumnName("fec_creacion_utc").IsRequired();
            entity.Property(u => u.Usu_FechaActualizacionUtc).HasColumnName("fec_actualizacion_utc");
        });

        modelBuilder.Entity<RegistroIngreso>(entity =>
        {
            entity.ToTable("registros_ingreso");
            entity.HasKey(r => r.Id_Registro);
            entity.Property(r => r.Id_Registro).HasColumnName("id_registro");
            entity.Property(r => r.Reg_NombreUsuario).HasColumnName("nom_usuario").HasMaxLength(50).IsRequired();
            entity.Property(r => r.Reg_FechaHoraUtc).HasColumnName("fec_hora_utc").IsRequired();
            entity.Property(r => r.Reg_Exitoso).HasColumnName("es_exitoso").IsRequired();
            entity.Property(r => r.Reg_DetalleResultado).HasColumnName("det_resultado").HasMaxLength(250);
            entity.Property(r => r.Reg_DireccionIp).HasColumnName("dir_ip").HasMaxLength(50);
        });

        modelBuilder.Entity<CodigoRecuperacion>(entity =>
        {
            entity.ToTable("codigos_recuperacion");
            entity.HasKey(c => c.Id_Codigo);
            entity.Property(c => c.Id_Codigo).HasColumnName("id_codigo");
            entity.Property(c => c.Cod_Correo).HasColumnName("cor_usuario").HasMaxLength(100).IsRequired();
            entity.HasIndex(c => c.Cod_Correo);
            entity.Property(c => c.Cod_Codigo).HasColumnName("cod_recuperacion").HasMaxLength(6).IsRequired();
            entity.Property(c => c.Cod_FechaExpiracionUtc).HasColumnName("fec_expiracion_utc").IsRequired();
            entity.Property(c => c.Cod_Usado).HasColumnName("es_usado").IsRequired();
            entity.Property(c => c.Cod_FechaCreacionUtc).HasColumnName("fec_creacion_utc").IsRequired();
        });

        modelBuilder.Entity<AuditoriaUsuario>(entity =>
        {
            entity.ToTable("auditorias_usuario");
            entity.HasKey(a => a.Id_Auditoria);
            entity.Property(a => a.Id_Auditoria).HasColumnName("id_auditoria");
            entity.Property(a => a.Aud_NombreAdmin).HasColumnName("nom_admin").HasMaxLength(50).IsRequired();
            entity.Property(a => a.Aud_Accion).HasColumnName("accion_realizada").HasMaxLength(50).IsRequired();
            entity.Property(a => a.Aud_NombreUsuarioAfectado).HasColumnName("nom_usuario_afectado").HasMaxLength(50).IsRequired();
            entity.Property(a => a.Aud_Detalle).HasColumnName("detalle").HasMaxLength(500);
            entity.Property(a => a.Aud_FechaRegistroUtc).HasColumnName("fec_registro_utc").IsRequired();
            entity.Property(a => a.Aud_DireccionIp).HasColumnName("dir_ip").HasMaxLength(50);
        });

        modelBuilder.Entity<TokenRevocado>(entity =>
        {
            entity.ToTable("tokens_revocados");
            entity.HasKey(t => t.Id_TokenRevocado);
            entity.Property(t => t.Id_TokenRevocado).HasColumnName("id_token_revocado");
            entity.Property(t => t.Tok_Jti).HasColumnName("jti_token").HasMaxLength(100).IsRequired();
            entity.HasIndex(t => t.Tok_Jti);
            entity.Property(t => t.Tok_NombreUsuario).HasColumnName("nom_usuario").HasMaxLength(50).IsRequired();
            entity.Property(t => t.Tok_FechaExpiracionUtc).HasColumnName("fec_expiracion_utc").IsRequired();
            entity.Property(t => t.Tok_FechaRevocacionUtc).HasColumnName("fec_revocacion_utc").IsRequired();
            entity.Property(t => t.Tok_Motivo).HasColumnName("mot_revocacion").HasMaxLength(50).IsRequired();
        });

        modelBuilder.Entity<Mesa>(entity =>
        {
            entity.ToTable("mesas");
            entity.HasKey(m => m.Id_Mesa);
            entity.Property(m => m.Id_Mesa).HasColumnName("id_mesa");
            entity.Property(m => m.Mes_Nombre).HasColumnName("nom_mesa").HasMaxLength(20).IsRequired();
            entity.Property(m => m.Mes_NombreNormalizado).HasColumnName("nom_mesa_normalizado").HasMaxLength(20).IsRequired();
            entity.HasIndex(m => m.Mes_NombreNormalizado).IsUnique();
            entity.Property(m => m.Mes_Ocupacion).HasColumnName("est_ocupacion").HasConversion<string>().HasMaxLength(20).IsRequired();
            entity.Property(m => m.Mes_Activa).HasColumnName("est_activa").IsRequired().HasDefaultValue(true);
            entity.Property(m => m.Mes_FechaCreacionUtc).HasColumnName("fec_creacion_utc").IsRequired();
            entity.Property(m => m.Mes_FechaActualizacionUtc).HasColumnName("fec_actualizacion_utc");
        });

        modelBuilder.Entity<AuditoriaMesa>(entity =>
        {
            entity.ToTable("auditorias_mesa");
            entity.HasKey(a => a.Id_Auditoria);
            entity.Property(a => a.Id_Auditoria).HasColumnName("id_auditoria");
            entity.Property(a => a.Aud_NombreAdmin).HasColumnName("nom_admin").HasMaxLength(50).IsRequired();
            entity.Property(a => a.Aud_Accion).HasColumnName("accion_realizada").HasMaxLength(50).IsRequired();
            entity.Property(a => a.Aud_NombreMesa).HasColumnName("nom_mesa").HasMaxLength(50).IsRequired();
            entity.Property(a => a.Aud_Detalle).HasColumnName("detalle").HasMaxLength(500);
            entity.Property(a => a.Aud_FechaRegistroUtc).HasColumnName("fec_registro_utc").IsRequired();
            entity.Property(a => a.Aud_DireccionIp).HasColumnName("dir_ip").HasMaxLength(50);
        });

        modelBuilder.Entity<Producto>(entity =>
        {
            entity.ToTable("productos");
            entity.HasKey(p => p.Id_Producto);
            entity.Property(p => p.Id_Producto).HasColumnName("id_producto");
            entity.Property(p => p.Pro_Nombre).HasColumnName("nom_producto").HasMaxLength(50).IsRequired();
            entity.Property(p => p.Pro_NombreNormalizado).HasColumnName("nom_normalizado").HasMaxLength(50).IsRequired();
            entity.HasIndex(p => p.Pro_NombreNormalizado).IsUnique();
            entity.Property(p => p.Pro_Categoria).HasColumnName("cat_producto").IsRequired();
            entity.Property(p => p.Pro_Precio).HasColumnName("pre_producto").HasColumnType("numeric(8,2)").IsRequired();
            entity.Property(p => p.Pro_Activo).HasColumnName("est_producto").IsRequired().HasDefaultValue(true);
            entity.Property(p => p.Pro_FechaCreacionUtc).HasColumnName("fec_creacion_utc").IsRequired();
            entity.Property(p => p.Pro_FechaActualizacionUtc).HasColumnName("fec_actualizacion_utc");
        });

        modelBuilder.Entity<MenuDia>(entity =>
        {
            entity.ToTable("menus_dia");
            entity.HasKey(m => m.Id_Menu);
            entity.Property(m => m.Id_Menu).HasColumnName("id_menu");
            entity.Property(m => m.Men_Fecha).HasColumnName("fec_menu").HasColumnType("date").IsRequired();
            entity.HasIndex(m => m.Men_Fecha).IsUnique();
            entity.Property(m => m.Id_Desayuno).HasColumnName("id_desayuno");
            entity.Property(m => m.Men_UsuarioCreacion).HasColumnName("nom_usuario_creacion").HasMaxLength(50).IsRequired();
            entity.Property(m => m.Men_UsuarioActualizacion).HasColumnName("nom_usuario_actualizacion").HasMaxLength(50);
            entity.Property(m => m.Men_FechaCreacionUtc).HasColumnName("fec_creacion_utc").IsRequired();
            entity.Property(m => m.Men_FechaActualizacionUtc).HasColumnName("fec_actualizacion_utc");

            entity.HasOne(m => m.Men_Desayuno)
                  .WithMany()
                  .HasForeignKey(m => m.Id_Desayuno)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasMany(m => m.Men_Platos)
                  .WithOne(p => p.Mdp_MenuDia)
                  .HasForeignKey(p => p.Id_Menu)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.Navigation(m => m.Men_Platos)
                  .UsePropertyAccessMode(PropertyAccessMode.Field);
        });

        modelBuilder.Entity<MenuDiaPlato>(entity =>
        {
            entity.ToTable("menu_dia_platos");
            entity.HasKey(p => p.Id_MenuPlato);
            entity.Property(p => p.Id_MenuPlato).HasColumnName("id_menu_plato");
            entity.Property(p => p.Id_Menu).HasColumnName("id_menu").IsRequired();
            entity.Property(p => p.Id_Producto).HasColumnName("id_producto").IsRequired();
            entity.Property(p => p.Mdp_Agotado).HasColumnName("est_agotado").IsRequired().HasDefaultValue(false);
            entity.Property(p => p.Mdp_FechaCambioDisponibilidadUtc).HasColumnName("fec_cambio_disponibilidad_utc");
            entity.Property(p => p.Mdp_UsuarioDisponibilidad).HasColumnName("nom_usuario_disponibilidad").HasMaxLength(50);

            entity.HasIndex(p => new { p.Id_Menu, p.Id_Producto }).IsUnique();

            entity.HasOne(p => p.Mdp_Producto)
                  .WithMany()
                  .HasForeignKey(p => p.Id_Producto)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Pedido>(entity =>
        {
            entity.ToTable("pedidos");
            entity.HasKey(p => p.Id_Pedido);
            entity.Property(p => p.Id_Pedido).HasColumnName("id_pedido");
            entity.Property(p => p.Ped_NumeroDiario).HasColumnName("ped_numero_diario").IsRequired();
            entity.Property(p => p.Ped_FechaOperativa).HasColumnName("ped_fecha_operativa").HasColumnType("date").IsRequired();
            entity.Property(p => p.Ped_FechaHoraUtc).HasColumnName("ped_fecha_hora_utc").IsRequired();
            entity.Property(p => p.Ped_Tipo).HasColumnName("ped_tipo").HasConversion<string>().HasMaxLength(20).IsRequired();
            entity.Property(p => p.Ped_Estado).HasColumnName("ped_estado").HasConversion<string>().HasMaxLength(20).IsRequired();
            entity.Property(p => p.Ped_Total).HasColumnName("ped_total").HasColumnType("numeric(8,2)").IsRequired();
            entity.Property(p => p.Ped_Notas).HasColumnName("ped_notas").HasMaxLength(250);
            entity.Property(p => p.Ped_MotivoAnulacion).HasColumnName("ped_motivo_anulacion").HasMaxLength(100);
            entity.Property(p => p.Id_Mesa).HasColumnName("id_mesa");
            entity.Property(p => p.Id_Usuario).HasColumnName("id_usuario").IsRequired();
            entity.Property(p => p.Ped_SolicitudId).HasColumnName("ped_solicitud_id").HasMaxLength(100).IsRequired();
            entity.HasIndex(p => p.Ped_SolicitudId).IsUnique();
            entity.HasIndex(p => new { p.Ped_FechaOperativa, p.Ped_NumeroDiario });
            entity.Property(p => p.Ped_FechaCreacionUtc).HasColumnName("fec_creacion_utc").IsRequired();
            entity.Property(p => p.Ped_FechaActualizacionUtc).HasColumnName("fec_actualizacion_utc");

            entity.HasOne(p => p.Ped_Mesa)
                  .WithMany()
                  .HasForeignKey(p => p.Id_Mesa)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(p => p.Ped_Usuario)
                  .WithMany()
                  .HasForeignKey(p => p.Id_Usuario)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.Navigation(p => p.Ped_Detalles)
                  .UsePropertyAccessMode(PropertyAccessMode.Field);

            entity.Navigation(p => p.Ped_Comandas)
                  .UsePropertyAccessMode(PropertyAccessMode.Field);
        });

        modelBuilder.Entity<DetallePedido>(entity =>
        {
            entity.ToTable("detalles_pedido");
            entity.HasKey(d => d.Id_Detalle);
            entity.Property(d => d.Id_Detalle).HasColumnName("id_detalle");
            entity.Property(d => d.Id_Pedido).HasColumnName("id_pedido").IsRequired();
            entity.Property(d => d.Id_Producto).HasColumnName("id_producto").IsRequired();
            entity.Property(d => d.Det_Cantidad).HasColumnName("det_cantidad").IsRequired();
            entity.Property(d => d.Det_PrecioUnitario).HasColumnName("det_precio_unitario").HasColumnType("numeric(8,2)").IsRequired();
            entity.Property(d => d.Det_Subtotal).HasColumnName("det_subtotal").HasColumnType("numeric(8,2)").IsRequired();
            entity.Property(d => d.Det_Observacion).HasColumnName("det_observacion").HasMaxLength(100);
            entity.Property(d => d.Det_FechaCreacionUtc).HasColumnName("fec_creacion_utc").IsRequired();

            entity.HasOne(d => d.Det_Pedido)
                  .WithMany(p => p.Ped_Detalles)
                  .HasForeignKey(d => d.Id_Pedido)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.Det_Producto)
                  .WithMany()
                  .HasForeignKey(d => d.Id_Producto)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Comanda>(entity =>
        {
            entity.ToTable("comandas");
            entity.HasKey(c => c.Id_Comanda);
            entity.Property(c => c.Id_Comanda).HasColumnName("id_comanda");
            entity.Property(c => c.Id_Pedido).HasColumnName("id_pedido").IsRequired();
            entity.Property(c => c.Cmd_NumeroDiario).HasColumnName("cmd_numero_diario").IsRequired();
            entity.Property(c => c.Cmd_FechaHoraUtc).HasColumnName("cmd_fecha_hora_utc").IsRequired();
            entity.Property(c => c.Cmd_Estado).HasColumnName("cmd_estado").HasConversion<string>().HasMaxLength(20).IsRequired();
            entity.Property(c => c.Cmd_EsAdicional).HasColumnName("cmd_es_adicional").IsRequired();
            entity.Property(c => c.Cmd_Modificada).HasColumnName("cmd_modificada").IsRequired().HasDefaultValue(false);
            entity.Property(c => c.Cmd_AvisoVisto).HasColumnName("cmd_aviso_visto").IsRequired().HasDefaultValue(false);
            entity.Property(c => c.Cmd_FechaAvisoVistoUtc).HasColumnName("cmd_fec_aviso_visto_utc");
            entity.Property(c => c.Cmd_UsuarioAvisoVisto).HasColumnName("cmd_nom_usuario_aviso_visto").HasMaxLength(50);
            entity.Property(c => c.Cmd_FecInicioPreparacionUtc).HasColumnName("cmd_fec_inicio_preparacion_utc");
            entity.Property(c => c.Cmd_NomUsuarioPreparacion).HasColumnName("cmd_nom_usuario_preparacion").HasMaxLength(50);
            entity.Property(c => c.Cmd_FecListaUtc).HasColumnName("cmd_fec_lista_utc");
            entity.Property(c => c.Cmd_NomUsuarioLista).HasColumnName("cmd_nom_usuario_lista").HasMaxLength(50);
            entity.Property(c => c.Cmd_EstadoAnterior).HasColumnName("cmd_estado_anterior").HasConversion<string>().HasMaxLength(20);
            entity.Property(c => c.Cmd_FecUltimoCambioEstadoUtc).HasColumnName("cmd_fec_ultimo_cambio_estado_utc");
            entity.Property(c => c.Cmd_NombreMesa).HasColumnName("cmd_nombre_mesa").HasMaxLength(50).IsRequired();
            entity.Property(c => c.Cmd_FechaCreacionUtc).HasColumnName("fec_creacion_utc").IsRequired();

            entity.HasOne(c => c.Cmd_Pedido)
                  .WithMany(p => p.Ped_Comandas)
                  .HasForeignKey(c => c.Id_Pedido)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.Navigation(c => c.Cmd_Detalles)
                  .UsePropertyAccessMode(PropertyAccessMode.Field);
        });

        modelBuilder.Entity<DetalleComanda>(entity =>
        {
            entity.ToTable("detalles_comanda");
            entity.HasKey(d => d.Id_DetalleComanda);
            entity.Property(d => d.Id_DetalleComanda).HasColumnName("id_detalle_comanda");
            entity.Property(d => d.Id_Comanda).HasColumnName("id_comanda").IsRequired();
            entity.Property(d => d.Id_Producto).HasColumnName("id_producto").IsRequired();
            entity.Property(d => d.Dtc_NombreProducto).HasColumnName("dtc_nombre_producto").HasMaxLength(100).IsRequired();
            entity.Property(d => d.Dtc_Cantidad).HasColumnName("dtc_cantidad").IsRequired();
            entity.Property(d => d.Dtc_Observacion).HasColumnName("dtc_observacion").HasMaxLength(100);
            entity.Property(d => d.Dtc_FechaCreacionUtc).HasColumnName("fec_creacion_utc").IsRequired();

            entity.HasOne(d => d.Dtc_Comanda)
                  .WithMany(c => c.Cmd_Detalles)
                  .HasForeignKey(d => d.Id_Comanda)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.Dtc_Producto)
                  .WithMany()
                  .HasForeignKey(d => d.Id_Producto)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<AuditoriaPedido>(entity =>
        {
            entity.ToTable("auditorias_pedido");
            entity.HasKey(a => a.Id_Auditoria);
            entity.Property(a => a.Id_Auditoria).HasColumnName("id_auditoria");
            entity.Property(a => a.Aud_Usuario).HasColumnName("nom_usuario").HasMaxLength(50).IsRequired();
            entity.Property(a => a.Aud_Accion).HasColumnName("accion_realizada").HasMaxLength(50).IsRequired();
            entity.Property(a => a.Aud_NumeroMesa).HasColumnName("nom_mesa").HasMaxLength(50).IsRequired();
            entity.Property(a => a.Aud_NumeroPedido).HasColumnName("num_pedido").IsRequired();
            entity.Property(a => a.Aud_Detalle).HasColumnName("detalle").HasMaxLength(500);
            entity.Property(a => a.Aud_FechaRegistroUtc).HasColumnName("fec_registro_utc").IsRequired();
            entity.Property(a => a.Aud_DireccionIp).HasColumnName("dir_ip").HasMaxLength(50);
        });

        modelBuilder.Entity<Caja>(entity =>
        {
            entity.ToTable("cajas");
            entity.HasKey(c => c.Id_Caja);
            entity.Property(c => c.Id_Caja).HasColumnName("id_caja");
            entity.Property(c => c.Id_Usuario).HasColumnName("id_usuario").IsRequired();
            entity.Property(c => c.Caj_MontoApertura).HasColumnName("caj_monto_apertura").HasColumnType("numeric(10,2)").IsRequired();
            entity.Property(c => c.Caj_MontoCierre).HasColumnName("caj_monto_cierre").HasColumnType("numeric(10,2)");
            entity.Property(c => c.Caj_FechaAperturaUtc).HasColumnName("caj_fec_apertura_utc").IsRequired();
            entity.Property(c => c.Caj_FechaCierreUtc).HasColumnName("caj_fec_cierre_utc");
            entity.Property(c => c.Caj_Estado).HasColumnName("caj_estado").HasConversion<string>().HasMaxLength(20).IsRequired().IsConcurrencyToken();
            entity.Property(c => c.Caj_FechaCreacionUtc).HasColumnName("fec_creacion_utc").IsRequired();
            entity.Property(c => c.Caj_FechaActualizacionUtc).HasColumnName("fec_actualizacion_utc");

            // CUS 13: Cuadre, snapshot de ventas, auditoría e idempotencia
            entity.Property(c => c.Caj_MontoEsperado).HasColumnName("caj_mon_esperado").HasColumnType("numeric(10,2)");
            entity.Property(c => c.Caj_Diferencia).HasColumnName("caj_diferencia").HasColumnType("numeric(10,2)");
            entity.Property(c => c.Caj_TotalVentasEfectivo).HasColumnName("caj_tot_efectivo").HasColumnType("numeric(10,2)");
            entity.Property(c => c.Caj_TotalVentasYape).HasColumnName("caj_tot_yape").HasColumnType("numeric(10,2)");
            entity.Property(c => c.Caj_TotalVentas).HasColumnName("caj_tot_ventas").HasColumnType("numeric(10,2)");
            entity.Property(c => c.Caj_CantidadVentas).HasColumnName("caj_can_ventas");
            entity.Property(c => c.Caj_Observacion).HasColumnName("caj_observacion").HasMaxLength(200);
            entity.Property(c => c.Id_UsuarioCierre).HasColumnName("caj_id_usu_cierre");
            entity.Property(c => c.Caj_SolicitudId).HasColumnName("caj_solicitud_id").HasMaxLength(100).IsRequired(false);
            entity.Property(c => c.Caj_SolicitudIdCierre).HasColumnName("caj_solicitud_id_cierre").HasMaxLength(100);

            entity.HasIndex(c => c.Caj_Estado)
                  .HasDatabaseName("uq_cajas_solo_una_abierta")
                  .HasFilter("caj_estado = 'Abierta'")
                  .IsUnique();
            entity.HasIndex(c => c.Caj_SolicitudId);
            entity.HasIndex(c => c.Id_UsuarioCierre);
            entity.HasIndex(c => c.Caj_FechaAperturaUtc);
            entity.HasIndex(c => c.Caj_FechaCierreUtc);

            entity.HasOne(c => c.Caj_Usuario)
                  .WithMany()
                  .HasForeignKey(c => c.Id_Usuario)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(c => c.Caj_UsuarioCierre)
                  .WithMany()
                  .HasForeignKey(c => c.Id_UsuarioCierre)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.Navigation(c => c.Caj_Ventas)
                  .UsePropertyAccessMode(PropertyAccessMode.Field);
        });

        modelBuilder.Entity<Venta>(entity =>
        {
            entity.ToTable("ventas");
            entity.HasKey(v => v.Id_Venta);
            entity.Property(v => v.Id_Venta).HasColumnName("id_venta");
            entity.Property(v => v.Id_Pedido).HasColumnName("id_pedido").IsRequired();
            entity.Property(v => v.Id_Usuario).HasColumnName("id_usuario").IsRequired();
            entity.Property(v => v.Id_Caja).HasColumnName("id_caja").IsRequired();
            entity.Property(v => v.Ven_Total).HasColumnName("ven_total").HasColumnType("numeric(8,2)").IsRequired();
            entity.Property(v => v.Ven_MetodoPago).HasColumnName("ven_metodo_pago").HasConversion<string>().HasMaxLength(20).IsRequired();
            entity.Property(v => v.Ven_MontoRecibido).HasColumnName("ven_monto_recibido").HasColumnType("numeric(8,2)");
            entity.Property(v => v.Ven_Vuelto).HasColumnName("ven_vuelto").HasColumnType("numeric(8,2)");
            entity.Property(v => v.Ven_YapeConfirmado).HasColumnName("ven_yape_confirmado").IsRequired().HasDefaultValue(false);
            entity.Property(v => v.Ven_YapeReferencia).HasColumnName("ven_yape_referencia").HasMaxLength(20);
            entity.Property(v => v.Ven_SolicitudId).HasColumnName("ven_solicitud_id").HasMaxLength(100).IsRequired();
            entity.HasIndex(v => v.Ven_SolicitudId).IsUnique();
            entity.Property(v => v.Ven_Estado).HasColumnName("ven_estado").HasConversion<string>().HasMaxLength(20).IsRequired().HasDefaultValue(Domain.Enums.EstadoVenta.Vigente);
            entity.Property(v => v.Ven_FechaHoraUtc).HasColumnName("ven_fecha_hora_utc").IsRequired();
            entity.Property(v => v.Ven_FechaCreacionUtc).HasColumnName("fec_creacion_utc").IsRequired();
            entity.Property(v => v.Ven_MotivoAnulacion).HasColumnName("ven_motivo_anulacion").HasMaxLength(200);
            entity.Property(v => v.Ven_UsuarioAnulacion).HasColumnName("ven_usuario_anulacion").HasMaxLength(100);
            entity.Property(v => v.Ven_FechaHoraAnulacionUtc).HasColumnName("ven_fec_anulacion_utc");
            entity.Property(v => v.Ven_DestinoPedido).HasColumnName("ven_destino_pedido").HasMaxLength(20);

            entity.HasOne(v => v.Ven_Pedido)
                  .WithMany()
                  .HasForeignKey(v => v.Id_Pedido)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(v => v.Ven_Usuario)
                  .WithMany()
                  .HasForeignKey(v => v.Id_Usuario)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(v => v.Ven_Caja)
                  .WithMany(c => c.Caj_Ventas)
                  .HasForeignKey(v => v.Id_Caja)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(v => v.Ven_Comprobante)
                  .WithOne(c => c.Com_Venta)
                  .HasForeignKey<Comprobante>(c => c.Id_Venta)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Comprobante>(entity =>
        {
            entity.ToTable("comprobantes");
            entity.HasKey(c => c.Id_Comprobante);
            entity.Property(c => c.Id_Comprobante).HasColumnName("id_comprobante");
            entity.Property(c => c.Id_Venta).HasColumnName("id_venta").IsRequired();
            entity.Property(c => c.Com_Tipo).HasColumnName("com_tipo").HasMaxLength(20).IsRequired();
            entity.Property(c => c.Com_Serie).HasColumnName("com_serie").HasMaxLength(10).IsRequired();
            entity.Property(c => c.Com_Numero).HasColumnName("com_numero").IsRequired();
            entity.Property(c => c.Com_Total).HasColumnName("com_total").HasColumnType("numeric(8,2)").IsRequired();
            entity.Property(c => c.Com_MetodoPago).HasColumnName("com_metodo_pago").HasConversion<string>().HasMaxLength(20).IsRequired();
            entity.Property(c => c.Com_FechaHoraUtc).HasColumnName("com_fec_hora_utc").IsRequired();
            entity.Property(c => c.Com_Leyenda).HasColumnName("com_leyenda").HasMaxLength(100).IsRequired();
            entity.Property(c => c.Com_Estado).HasColumnName("com_estado").HasConversion<string>().HasMaxLength(20).IsRequired();
            entity.Property(c => c.Com_FechaCreacionUtc).HasColumnName("fec_creacion_utc").IsRequired();

            entity.HasIndex(c => new { c.Com_Serie, c.Com_Numero }).IsUnique();
        });

        modelBuilder.Entity<AuditoriaCobro>(entity =>
        {
            entity.ToTable("auditorias_cobro");
            entity.HasKey(a => a.Id_Auditoria);
            entity.Property(a => a.Id_Auditoria).HasColumnName("id_auditoria");
            entity.Property(a => a.Aud_Usuario).HasColumnName("nom_cajero").HasMaxLength(50).IsRequired();
            entity.Property(a => a.Aud_Accion).HasColumnName("accion_realizada").HasMaxLength(50).IsRequired();
            entity.Property(a => a.Aud_NumeroPedido).HasColumnName("num_pedido").IsRequired();
            entity.Property(a => a.Aud_Comprobante).HasColumnName("comprobante").HasMaxLength(30).IsRequired();
            entity.Property(a => a.Aud_MedioPago).HasColumnName("medio_pago").HasMaxLength(20).IsRequired();
            entity.Property(a => a.Aud_Total).HasColumnName("total").HasColumnType("numeric(8,2)").IsRequired();
            entity.Property(a => a.Aud_MontoRecibido).HasColumnName("monto_recibido").HasColumnType("numeric(8,2)");
            entity.Property(a => a.Aud_Vuelto).HasColumnName("vuelto").HasColumnType("numeric(8,2)");
            entity.Property(a => a.Aud_Detalle).HasColumnName("detalle").HasMaxLength(500);
            entity.Property(a => a.Aud_FechaRegistroUtc).HasColumnName("fec_registro_utc").IsRequired();
            entity.Property(a => a.Aud_DireccionIp).HasColumnName("dir_ip").HasMaxLength(50);
        });

        modelBuilder.Entity<AuditoriaReporte>(entity =>
        {
            entity.ToTable("auditorias_reporte");
            entity.HasKey(a => a.Id_Auditoria);
            entity.Property(a => a.Id_Auditoria).HasColumnName("id_auditoria");
            entity.Property(a => a.Aud_Usuario).HasColumnName("nom_usuario").HasMaxLength(50).IsRequired();
            entity.Property(a => a.Aud_TipoReporte).HasColumnName("tip_reporte").HasMaxLength(50).IsRequired();
            entity.Property(a => a.Aud_Rango).HasColumnName("ran_reporte").HasMaxLength(100).IsRequired();
            entity.Property(a => a.Aud_Formato).HasColumnName("for_reporte").HasMaxLength(20).IsRequired();
            entity.Property(a => a.Aud_FechaRegistroUtc).HasColumnName("fec_registro_utc").IsRequired();
            entity.Property(a => a.Aud_DireccionIp).HasColumnName("dir_ip").HasMaxLength(50);
        });
    }
}

