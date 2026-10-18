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
    }
}
