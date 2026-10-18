---
title: "Directriz Permanente de Arquitectura, Dominio y Código"
sistema: "Sistema de Restaurante Girasoles"
version: "1.0.0"
fecha: "2026-10-17"
estado: "Vigente / Regla Inquebrantable"
autor: "Equipo de Arquitectura de Software"
tags:
  - backend
  - frontend
  - clean-architecture
  - clean-code
  - dotnet
  - csharp
  - react
  - tailwindcss
  - obsidian
---

# 🛡️ Directriz Permanente de Arquitectura y Código

> [!CAUTION]
> **NORMA PERMANENTE Y VINCULANTE (REGLA DE ORO DE DESARROLLO):**
> A partir de este momento, **TODO** código nuevo, módulo, entidad, servicio o interfaz que se construya para el proyecto **"Restaurante Girasoles"** (incluyendo los módulos de **Productos, Categorías, Mesas, Pedidos/Comandas, Caja, Ventas y Reportes**) debe nacer aplicando de forma estricta y obligatoria estas 4 reglas desde la primera línea de código.
> **ESTÁ PROHIBIDO crear propiedades puente (`=>`) o mantener dos convenciones de nombres en paralelo.**

---

## 📑 Índice de Pilares y Referencias
- [[STACK_TECNOLOGICO_OFICIAL|⚡ Stack Tecnológico Oficial y Arquitectura de Ejecución]]
1. [[#1. Pilar 1: Estándar de Nomenclatura en Dominio y Base de Datos (Backend C#)]]
2. [[#2. Pilar 2: Desacoplamiento en Capa de Aplicación (DTOs y Services)]]
3. [[#3. Pilar 3: Clean Architecture y Clean Code (Uncle Bob)]]
4. [[#4. Pilar 4: Consistencia Absoluta en Frontend (React + TypeScript + Tailwind)]]
5. [[#5. Matriz de Entidades y Prefijos Trilaterales Oficiales]]
6. [[#6. Checklist Obligatorio para Todo Nuevo Módulo]]

---

## 1. Pilar 1: Estándar de Nomenclatura en Dominio y Base de Datos (Backend C#)

### 1.1 Entidades de Dominio (`Domain/Entities`)
Toda entidad del dominio es un POCO puro y agnóstico. Debe definir como **únicas propiedades reales** de la clase la convención de cátedra con prefijo trilateral y PascalCase:
- **Llave Primaria:** `Id_[Entidad]` con tipo `Guid` (ej. `Id_Producto`, `Id_Categoria`, `Id_Mesa`, `Id_Pedido`, `Id_Comprobante`, `Id_Usuario`).
- **Atributos:** `[Prefijo]_[Atributo]` (ej. `Pro_Nombre`, `Pro_Precio`, `Pro_Stock`, `Pro_Estado`; `Mes_Nombre`, `Mes_Ocupacion`, `Mes_Activa`; `Ped_Total`, `Ped_FechaHoraUtc`).
- **Encapsulamiento:** Todas las propiedades de estado llevan `{ get; private set; }`.

```csharp
// Ejemplo Canónico: Producto.cs
namespace GirasolesRes.Domain.Entities;

public class Producto
{
    public Guid Id_Producto { get; private set; }
    public string Pro_Nombre { get; private set; } = string.Empty;
    public string? Pro_Descripcion { get; private set; }
    public decimal Pro_Precio { get; private set; }
    public int Pro_Stock { get; private set; }
    public bool Pro_Estado { get; private set; }
    public Guid Id_Categoria { get; private set; }
    public DateTime Pro_FechaCreacionUtc { get; private set; }

    // Constructor privado para EF Core
    private Producto() { }

    public Producto(string proNombre, decimal proPrecio, int proStock, Guid idCategoria, string? proDescripcion = null)
    {
        Id_Producto = Guid.NewGuid();
        Pro_Nombre = proNombre.Trim();
        Pro_Precio = proPrecio;
        Pro_Stock = proStock;
        Id_Categoria = idCategoria;
        Pro_Descripcion = proDescripcion?.Trim();
        Pro_Estado = true;
        Pro_FechaCreacionUtc = DateTime.UtcNow;
    }
}
```

> [!WARNING]
> **PROHIBICIÓN TOTAL DE PROPIEDADES PUENTE:**
> Queda terminantemente prohibido declarar getters calculados o propiedades puente tipo `public string Nombre => Pro_Nombre;` o mantener propiedades genéricas heredadas. El Dominio debe tener 0 duplicidad.

### 1.2 Capa de Infraestructura (`Infrastructure/Data` y `Repositories`)
- **`GirasolesDbContext`:** Los métodos de Fluent API mapean las propiedades prefijadas a las columnas de base de datos:
  ```csharp
  builder.Entity<Producto>(b =>
  {
      b.ToTable("productos");
      b.HasKey(p => p.Id_Producto);
      b.Property(p => p.Id_Producto).HasColumnName("id_producto");
      b.Property(p => p.Pro_Nombre).HasColumnName("pro_nombre").HasMaxLength(100).IsRequired();
      b.Property(p => p.Pro_Precio).HasColumnName("pro_precio").HasPrecision(10, 2);
  });
  ```
- **Repositorios:** Todas las consultas LINQ (`FirstOrDefaultAsync`, `Where`, `AnyAsync`, `OrderBy`) filtran y ordenan usando directamente las propiedades con prefijo trilateral (`p.Pro_Nombre`, `p.Pro_Estado`).

---

## 2. Pilar 2: Desacoplamiento en Capa de Aplicación (DTOs y Services)

### 2.1 Contrato Limpio para el Frontend (DTOs)
- Los DTOs (`Application/DTOs`) mantienen nombres semánticos limpios para no acoplar al cliente React a la nomenclatura relacional interna:
  ```csharp
  public record ProductoDto(
      Guid Id,
      string Nombre,
      string? Descripcion,
      decimal Precio,
      int Stock,
      bool Estado,
      Guid CategoriaId
  );
  ```
- **Validaciones de Entrada:** Todo DTO de solicitud (`CrearProductoRequest`, etc.) debe incluir anotaciones de validación (`[Required]`, `[StringLength]`, `[Range]`) y sanitización `.Trim()`.

### 2.2 Mapeo Explícito en Servicios
- El mapeo entre la entidad prefijada y el DTO limpio se realiza **siempre** dentro del Servicio de Aplicación (`Application/Services`), nunca en la entidad:
  ```csharp
  private static ProductoDto MapearADto(Producto p)
  {
      return new ProductoDto(
          p.Id_Producto,
          p.Pro_Nombre,
          p.Pro_Descripcion,
          p.Pro_Precio,
          p.Pro_Stock,
          p.Pro_Estado,
          p.Id_Categoria
      );
  }
  ```

---

## 3. Pilar 3: Clean Architecture y Clean Code (Uncle Bob)

### 3.1 Dirección de Dependencias Estricta
$$\text{API (Controllers)} \longrightarrow \text{Infrastructure} \longrightarrow \text{Application} \longrightarrow \text{Domain}$$

- **`Domain`:** Cero dependencias externas.
- **`Application`:** Depende solo de `Domain`. Define interfaces de repositorios (`IRepository`) y servicios (`IService`).
- **`Infrastructure`:** Implementa las interfaces de persistencia, seguridad y servicios externos.
- **`API`:** Punto de entrada; los controladores dependen exclusivamente de las interfaces de servicio (`IProductoService`, `IMesaService`).

### 3.2 Principios de Clean Code Aplicados
1. **Responsabilidad Única (SRP):** Cada clase, método y endpoint resuelve un único propósito bien delimitado.
2. **Separación de Comandos y Consultas (CQS):** Los métodos que modifican estado no deben retornar datos innecesarios más allá del DTO de confirmación o ID generado.
3. **Prohibición de Retornar `null` en Colecciones:** Todo método que devuelva una lista, consulta o arreglo debe retornar una colección vacía (`Enumerable.Empty<T>()` o `new List<T>()`), jamás `null`.
4. **Doble Barrera de Validación:** Validación sintáctica en DTOs (`ModelState.IsValid`) y validación semántica/reglas de negocio en el Servicio de Dominio.

---

## 4. Pilar 4: Consistencia Absoluta en Frontend (React + TypeScript + Tailwind)

### 4.1 Layout Fijo Global (`MainLayout` y `AuthShell`)
- **Regla del 100vh:** Uso estricto de `h-screen overflow-hidden` en el layout raíz.
- **Estructura Estática:** Barra lateral (`Sidebar`) y cabecera (`Header`) 100% fijas e inmóviles.
- **Scroll Confinado:** El desplazamiento vertical (`overflow-y-auto`) queda estrictamente confinado al contenedor principal de datos o al `<tbody>` de la tabla, con cabecera `sticky top-0` y scrollbar delgado estilizado de 6px:
  `[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full`

### 4.2 Tipografía Híbrida Oficial
- **`.font-brand-serif` (`Playfair Display`):** Exclusivo para los títulos principales de módulo `<h1>` y cabeceras de bienvenida.
- **`Plus Jakarta Sans` con `tabular-nums`:** Obligatorio para todo dato operativo, números de mesas, cantidades, precios, tablas, tarjetas y comandas.

### 4.3 Estandarización de Tablas
1. **Badges / Pastillas de Estado y Categoría:** Dimensiones fijas e idénticas:
   `w-28 h-7 inline-flex items-center justify-center rounded-lg text-xs font-semibold`
2. **Columna de Acciones (Desktop):**
   - Botones cuadrados compactos: `w-8 h-8 rounded-lg border inline-flex items-center justify-center transition-colors cursor-pointer`.
   - Colores semánticos:
     * **Editar:** Neutro/blanco (`bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200`).
     * **Activar:** Verde esmeralda suave (`bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200`).
     * **Desactivar:** Ámbar suave (`bg-amber-50 hover:bg-amber-100 text-[#B84600] border-amber-200`).
     * **Eliminar / Anular:** Rosa/rojo suave (`bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200`).
   - Atributos obligatorios: `title` y `aria-label` descriptivos en cada botón.
3. **Soporte Móvil:** Transformación automática a tarjetas verticales en `< lg` con botones táctiles de área mínima `min-h-[38px]`.

---

## 5. Matriz de Entidades y Prefijos Trilaterales Oficiales

| Entidad | Prefijo | Clave Primaria | Atributos Representativos de Dominio |
| :--- | :---: | :--- | :--- |
| **Usuario** | `Usu` | `Id_Usuario` | `Usu_Nombre`, `Usu_Usuario`, `Usu_Correo`, `Usu_PasswordHash`, `Usu_Rol`, `Usu_Activo`, `Usu_IntentosFallidos`, `Usu_BloqueadoHastaUtc`, `Usu_FechaCreacionUtc` |
| **Mesa** | `Mes` | `Id_Mesa` | `Mes_Nombre`, `Mes_NombreNormalizado`, `Mes_Ocupacion`, `Mes_Activa`, `Mes_FechaCreacionUtc`, `Mes_FechaActualizacionUtc` |
| **Producto** | `Pro` | `Id_Producto` | `Pro_Nombre`, `Pro_Descripcion`, `Pro_Precio`, `Pro_Stock`, `Pro_Estado`, `Id_Categoria`, `Pro_FechaCreacionUtc` |
| **Categoría** | `Cat` | `Id_Categoria` | `Cat_Nombre`, `Cat_Descripcion`, `Cat_Activa`, `Cat_FechaCreacionUtc` |
| **Pedido** | `Ped` | `Id_Pedido` | `Ped_FechaHoraUtc`, `Ped_Estado`, `Ped_Total`, `Ped_Notas`, `Id_Mesa`, `Id_Usuario` |
| **Detalle Pedido** | `Det` | `Id_Detalle` | `Id_Pedido`, `Id_Producto`, `Det_Cantidad`, `Det_PrecioUnitario`, `Det_Subtotal`, `Det_Observacion` |
| **Comprobante** | `Com` | `Id_Comprobante`| `Com_Tipo`, `Com_Serie`, `Com_Numero`, `Com_Total`, `Com_MetodoPago`, `Com_FechaHoraUtc`, `Id_Pedido` |
| **Caja** | `Caj` | `Id_Caja` | `Caj_MontoApertura`, `Caj_MontoCierre`, `Caj_FechaAperturaUtc`, `Caj_FechaCierreUtc`, `Caj_Estado`, `Id_Usuario` |
| **Movimiento Caja**| `Mov` | `Id_Movimiento` | `Id_Caja`, `Mov_Tipo`, `Mov_Monto`, `Mov_Motivo`, `Mov_FechaHoraUtc` |

---

## 6. Checklist Obligatorio para Todo Nuevo Módulo

Antes de dar por completado cualquier módulo futuro, verificar:

- [ ] **Dominio:** Entidad creada con `Id_[Entidad]` y `[Prefijo]_[Atributo]` `{ get; private set; }`. Cero propiedades puente (`=>`).
- [ ] **Persistencia:** `AppDbContext` mapea columnas y llaves con Fluent API hacia propiedades prefijadas.
- [ ] **Repositorio:** Consultas LINQ filtran y ordenan con propiedades prefijadas.
- [ ] **Aplicación (DTOs):** DTOs limpios sin prefijos (`id`, `nombre`, `precio`).
- [ ] **Servicio:** Mapeo explícito entre entidad y DTO; validaciones con `.Trim()`; cero retorno de `null` en listas.
- [ ] **API:** Controlador consume interfaz de servicio; maneja códigos HTTP adecuados (200, 201, 400, 404).
- [ ] **Frontend Layout:** Integrado a `MainLayout` respetando layout fijo y scroll interno.
- [ ] **Frontend UI:** Título en `font-brand-serif`, datos en `tabular-nums`, pastillas `w-28 h-7`, botones de acción `w-8 h-8` con `title` y `aria-label`.

---

## 7. Certificación de Arquitectura Backend y Calidad de Código (.NET 10 / C#)

> [!NOTE]
> **AUDITORÍA Y HOMOLOGACIÓN INTEGRAL (18/10/2026):**
> Se ejecutó la refactorización arquitectónica integral de todas las capas del backend y la suite de pruebas bajo .NET 10.0, llevando los **7 pilares al estado "CUMPLE (100%)"**.

### Matriz de Cumplimiento de los 7 Pilares
1. **Clean Architecture y Regla de Dependencias: [CUMPLE 100%]**
   - Flujo unidireccional estricto `API -> Infrastructure -> Application -> Domain`.
   - Dominio 100% agnóstico (sin referencias a EF Core ni ASP.NET Core).
   - Controladores interactúan exclusivamente con interfaces de servicios (`I...Service`); nunca tocan `DbContext` ni repositorios.
   - Solución unificada en `GirasolesRes.slnx`.

2. **Programación Orientada a Objetos (POO) y Dominio Rico: [CUMPLE 100%]**
   - Cero `{ get; set; }` públicos en las 20 entidades de dominio; 100% `{ get; private set; }`.
   - Invariantes protegidas mediante constructores de negocio y métodos de dominio (`Usuario.Bloquear()`, `Mesa.Ocupar()`, `Producto.CambiarEstado()`, `Caja.Cerrar()`).
   - Colecciones expuestas como `IReadOnlyCollection<T>` respaldadas por campos privados.

3. **Nomenclatura Trilateral de Cátedra y DTOs: [CUMPLE 100%]**
   - 100% de propiedades de entidad siguen el estándar `Id_[Entidad]` y `[PRE]_[Atributo]`.
   - Cero propiedades puente (`=>`). DTOs semánticos limpios en camelCase/PascalCase para el contrato con React.

4. **SOLID, Clean Code y DRY: [CUMPLE 100%]**
   - Cero duplicación de código en normalización diacrítica: clase transversal `StringNormalizer` en `Domain/Common` reutilizada en `Producto`, `Mesa` y repositorios.
   - Estandarización de persistencia en repositorios de auditoría (`AuditoriaUsuarioRepository`, `AuditoriaMesaRepository`, `AuditoriaCobroRepository`) desacoplando adición de guardado.

5. **Validación en Doble Barrera y Seguridad: [CUMPLE 100%]**
   - Simetría total de validación: DataAnnotations e `IValidatableObject` en DTOs de `Usuarios`, `Productos`, `Mesas`, `Pedidos` y `Caja`.
   - Vulnerabilidad de seguridad de alta severidad `NU1903` eliminada al parchar `Microsoft.Extensions.Caching.Memory` a versión 9.0.0.
   - Cumplimiento estricto de RN-12 (CUS-02): validación inmediata de usuario `Activo` en cada petición JWT autenticada en `Program.cs`.

6. **EF Core, Concurrencia y Transacciones: [CUMPLE 100%]**
   - Repositorios optimizados con `.AsNoTracking()` para lecturas.
   - Índice filtrado único en PostgreSQL `uq_cajas_solo_una_abierta` y token de concurrencia optimista en `Caj_Estado`.
   - Persistencia atómica de operaciones multitabla (desactivación de producto con retiro de menú del día vigente según RN-28 y registro de auditoría según RN-14/RN-30) en unidades de trabajo atómicas.

7. **Testabilidad y Suite de Pruebas Unitarias (xUnit): [CUMPLE 100%]**
   - `TargetFramework` unificado a `net10.0`, eliminando el error bloqueante `NU1201`.
   - Implementación de suite de pruebas unitarias con `Moq` para `UsuarioService`, `ProductoService` y `MesaService`.
   - **Compilación: 0 Errores, 0 Advertencias.**
   - **Pruebas: 57 de 57 superadas (100% Passed).**

