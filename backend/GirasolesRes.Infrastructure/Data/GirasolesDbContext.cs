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
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Id).HasColumnName("id_usuario");
            entity.Property(u => u.NombreUsuario).HasColumnName("nom_usuario").HasMaxLength(30).IsRequired();
            entity.HasIndex(u => u.NombreUsuario).IsUnique();
            entity.Property(u => u.NombreCompleto).HasColumnName("nom_completo").HasMaxLength(150).IsRequired();
            entity.Property(u => u.Correo).HasColumnName("cor_usuario").HasMaxLength(100).IsRequired(false);
            entity.HasIndex(u => u.Correo);
            entity.Property(u => u.PasswordHash).HasColumnName("has_usuario").IsRequired();
            entity.Property(u => u.Rol).HasColumnName("rol_usuario").IsRequired();
            entity.Property(u => u.Activo).HasColumnName("est_usuario").IsRequired().HasDefaultValue(true);
            entity.Property(u => u.IntentosFallidos).HasColumnName("int_fallidos").IsRequired().HasDefaultValue(0);
            entity.Property(u => u.BloqueadoHastaUtc).HasColumnName("bloq_hasta_utc");
            entity.Property(u => u.FechaCreacionUtc).HasColumnName("fec_creacion_utc").IsRequired();
            entity.Property(u => u.FechaActualizacionUtc).HasColumnName("fec_actualizacion_utc");
        });

        modelBuilder.Entity<RegistroIngreso>(entity =>
        {
            entity.ToTable("registros_ingreso");
            entity.HasKey(r => r.Id);
            entity.Property(r => r.Id).HasColumnName("id_registro");
            entity.Property(r => r.NombreUsuario).HasColumnName("nom_usuario").HasMaxLength(50).IsRequired();
            entity.Property(r => r.FechaHoraUtc).HasColumnName("fec_hora_utc").IsRequired();
            entity.Property(r => r.Exitoso).HasColumnName("es_exitoso").IsRequired();
            entity.Property(r => r.DetalleResultado).HasColumnName("det_resultado").HasMaxLength(250);
            entity.Property(r => r.DireccionIp).HasColumnName("dir_ip").HasMaxLength(50);
        });

        modelBuilder.Entity<CodigoRecuperacion>(entity =>
        {
            entity.ToTable("codigos_recuperacion");
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Id).HasColumnName("id_codigo");
            entity.Property(c => c.Correo).HasColumnName("cor_usuario").HasMaxLength(100).IsRequired();
            entity.HasIndex(c => c.Correo);
            entity.Property(c => c.Codigo).HasColumnName("cod_recuperacion").HasMaxLength(6).IsRequired();
            entity.Property(c => c.FechaExpiracionUtc).HasColumnName("fec_expiracion_utc").IsRequired();
            entity.Property(c => c.Usado).HasColumnName("es_usado").IsRequired();
            entity.Property(c => c.FechaCreacionUtc).HasColumnName("fec_creacion_utc").IsRequired();
        });

        modelBuilder.Entity<AuditoriaUsuario>(entity =>
        {
            entity.ToTable("auditorias_usuario");
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Id).HasColumnName("id_auditoria");
            entity.Property(a => a.NombreAdmin).HasColumnName("nom_admin").HasMaxLength(50).IsRequired();
            entity.Property(a => a.Accion).HasColumnName("accion_realizada").HasMaxLength(50).IsRequired();
            entity.Property(a => a.NombreUsuarioAfectado).HasColumnName("nom_usuario_afectado").HasMaxLength(50).IsRequired();
            entity.Property(a => a.Detalle).HasColumnName("detalle").HasMaxLength(500);
            entity.Property(a => a.FechaRegistroUtc).HasColumnName("fec_registro_utc").IsRequired();
            entity.Property(a => a.DireccionIp).HasColumnName("dir_ip").HasMaxLength(50);
        });

        modelBuilder.Entity<TokenRevocado>(entity =>
        {
            entity.ToTable("tokens_revocados");
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Id).HasColumnName("id_token_revocado");
            entity.Property(t => t.Jti).HasColumnName("jti_token").HasMaxLength(100).IsRequired();
            entity.HasIndex(t => t.Jti);
            entity.Property(t => t.NombreUsuario).HasColumnName("nom_usuario").HasMaxLength(50).IsRequired();
            entity.Property(t => t.FechaExpiracionUtc).HasColumnName("fec_expiracion_utc").IsRequired();
            entity.Property(t => t.FechaRevocacionUtc).HasColumnName("fec_revocacion_utc").IsRequired();
            entity.Property(t => t.Motivo).HasColumnName("mot_revocacion").HasMaxLength(50).IsRequired();
        });

        modelBuilder.Entity<Mesa>(entity =>
        {
            entity.ToTable("mesas");
            entity.HasKey(m => m.Id);
            entity.Property(m => m.Id).HasColumnName("id_mesa");
            entity.Property(m => m.Nombre).HasColumnName("nom_mesa").HasMaxLength(20).IsRequired();
            entity.Property(m => m.NombreNormalizado).HasColumnName("nom_mesa_normalizado").HasMaxLength(20).IsRequired();
            entity.HasIndex(m => m.NombreNormalizado).IsUnique();
            entity.Property(m => m.Ocupacion).HasColumnName("est_ocupacion").HasConversion<string>().HasMaxLength(20).IsRequired();
            entity.Property(m => m.Activa).HasColumnName("est_activa").IsRequired().HasDefaultValue(true);
            entity.Property(m => m.FechaCreacionUtc).HasColumnName("fec_creacion_utc").IsRequired();
            entity.Property(m => m.FechaActualizacionUtc).HasColumnName("fec_actualizacion_utc");
        });

        modelBuilder.Entity<AuditoriaMesa>(entity =>
        {
            entity.ToTable("auditorias_mesa");
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Id).HasColumnName("id_auditoria");
            entity.Property(a => a.NombreAdmin).HasColumnName("nom_admin").HasMaxLength(50).IsRequired();
            entity.Property(a => a.Accion).HasColumnName("accion_realizada").HasMaxLength(50).IsRequired();
            entity.Property(a => a.NombreMesa).HasColumnName("nom_mesa").HasMaxLength(50).IsRequired();
            entity.Property(a => a.Detalle).HasColumnName("detalle").HasMaxLength(500);
            entity.Property(a => a.FechaRegistroUtc).HasColumnName("fec_registro_utc").IsRequired();
            entity.Property(a => a.DireccionIp).HasColumnName("dir_ip").HasMaxLength(50);
        });

        modelBuilder.Entity<Producto>(entity =>
        {
            entity.ToTable("productos");
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Id).HasColumnName("id_producto");
            entity.Property(p => p.Nombre).HasColumnName("nom_producto").HasMaxLength(50).IsRequired();
            entity.Property(p => p.NombreNormalizado).HasColumnName("nom_normalizado").HasMaxLength(50).IsRequired();
            entity.HasIndex(p => p.NombreNormalizado).IsUnique();
            entity.Property(p => p.Categoria).HasColumnName("cat_producto").IsRequired();
            entity.Property(p => p.Precio).HasColumnName("pre_producto").HasColumnType("numeric(8,2)").IsRequired();
            entity.Property(p => p.Activo).HasColumnName("est_producto").IsRequired().HasDefaultValue(true);
            entity.Property(p => p.FechaCreacionUtc).HasColumnName("fec_creacion_utc").IsRequired();
            entity.Property(p => p.FechaActualizacionUtc).HasColumnName("fec_actualizacion_utc");
        });

        modelBuilder.Entity<MenuDia>(entity =>
        {
            entity.ToTable("menus_dia");
            entity.HasKey(m => m.Id);
            entity.Property(m => m.Id).HasColumnName("id_menu");
            entity.Property(m => m.Fecha).HasColumnName("fec_menu").HasColumnType("date").IsRequired();
            entity.HasIndex(m => m.Fecha).IsUnique();
            entity.Property(m => m.DesayunoId).HasColumnName("id_desayuno");
            entity.Property(m => m.UsuarioCreacion).HasColumnName("nom_usuario_creacion").HasMaxLength(50).IsRequired();
            entity.Property(m => m.UsuarioActualizacion).HasColumnName("nom_usuario_actualizacion").HasMaxLength(50);
            entity.Property(m => m.FechaCreacionUtc).HasColumnName("fec_creacion_utc").IsRequired();
            entity.Property(m => m.FechaActualizacionUtc).HasColumnName("fec_actualizacion_utc");

            entity.HasOne(m => m.Desayuno)
                  .WithMany()
                  .HasForeignKey(m => m.DesayunoId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasMany(m => m.Platos)
                  .WithOne(p => p.MenuDia)
                  .HasForeignKey(p => p.MenuDiaId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<MenuDiaPlato>(entity =>
        {
            entity.ToTable("menu_dia_platos");
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Id).HasColumnName("id_menu_plato");
            entity.Property(p => p.MenuDiaId).HasColumnName("id_menu").IsRequired();
            entity.Property(p => p.ProductoId).HasColumnName("id_producto").IsRequired();
            entity.Property(p => p.Agotado).HasColumnName("est_agotado").IsRequired().HasDefaultValue(false);
            entity.Property(p => p.FechaCambioDisponibilidadUtc).HasColumnName("fec_cambio_disponibilidad_utc");
            entity.Property(p => p.UsuarioCambioDisponibilidad).HasColumnName("nom_usuario_disponibilidad").HasMaxLength(50);

            entity.HasIndex(p => new { p.MenuDiaId, p.ProductoId }).IsUnique();

            entity.HasOne(p => p.Producto)
                  .WithMany()
                  .HasForeignKey(p => p.ProductoId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
