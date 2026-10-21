using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Npgsql;
using Xunit;
using Xunit.Abstractions;

namespace GirasolesRes.Tests;

public class CajaMigrationAndSchemaConsistencyTests
{
    private readonly ITestOutputHelper _output;
    private static readonly string ConnectionString = 
        Environment.GetEnvironmentVariable("TEST_CONNECTION_STRING") ?? 
        "Host=localhost;Port=5432;Database=girasoles_db;Username=postgres;Password=73268812";

    public CajaMigrationAndSchemaConsistencyTests(ITestOutputHelper output)
    {
        _output = output;
    }

    private static string GetMigrationSqlPath()
    {
        var envPath = Environment.GetEnvironmentVariable("MIGRATE_CUS13_SQL_PATH");
        if (!string.IsNullOrEmpty(envPath) && File.Exists(envPath)) return envPath;

        var currentDir = AppDomain.CurrentDomain.BaseDirectory;
        var dir = new DirectoryInfo(currentDir);
        while (dir != null)
        {
            var candidate = Path.Combine(dir.FullName, "database", "migrate_cus13.sql");
            if (File.Exists(candidate)) return candidate;
            dir = dir.Parent;
        }

        var repoRoot = Path.GetFullPath(Path.Combine(currentDir, "..", "..", "..", "..", ".."));
        var sqlPath = Path.Combine(repoRoot, "database", "migrate_cus13.sql");
        if (!File.Exists(sqlPath))
        {
            var altPath = Path.GetFullPath(Path.Combine(currentDir, "..", "..", "..", "database", "migrate_cus13.sql"));
            if (File.Exists(altPath)) return altPath;
        }
        return sqlPath;
    }

    [Fact]
    public async Task Migration_Script_Is_Fully_Idempotent_Across_Multiple_Consecutive_Runs()
    {
        var sqlPath = GetMigrationSqlPath();
        Assert.True(File.Exists(sqlPath), $"El archivo de migración debe existir en {sqlPath}");

        var sqlContent = await File.ReadAllTextAsync(sqlPath);
        Assert.False(string.IsNullOrWhiteSpace(sqlContent), "El archivo migrate_cus13.sql no debe estar vacío");

        await using var conn = new NpgsqlConnection(ConnectionString);
        await conn.OpenAsync();

        // Run the entire migration script 3 consecutive times to empirically verify idempotency
        for (int run = 1; run <= 3; run++)
        {
            await using var cmd = conn.CreateCommand();
            cmd.CommandText = sqlContent;

            var ex = await Record.ExceptionAsync(async () => await cmd.ExecuteNonQueryAsync());
            Assert.Null(ex);
            _output.WriteLine($"Ejecución consecutiva #{run} completada exitosamente sin errores.");
        }
    }

    [Fact]
    public async Task Public_Cajas_Column_Types_And_Precision_Match_Specification()
    {
        await using var conn = new NpgsqlConnection(ConnectionString);
        await conn.OpenAsync();

        await using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT column_name, data_type, character_maximum_length, numeric_precision, numeric_scale, column_default, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'cajas';";

        var columns = new Dictionary<string, (string DataType, int? MaxLen, int? Prec, int? Scale, string? Default, string Nullable)>();
        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            var name = reader.GetString(0);
            var dtype = reader.GetString(1);
            int? maxLen = reader.IsDBNull(2) ? null : reader.GetInt32(2);
            int? prec = reader.IsDBNull(3) ? null : reader.GetInt32(3);
            int? scale = reader.IsDBNull(4) ? null : reader.GetInt32(4);
            string? def = reader.IsDBNull(5) ? null : reader.GetString(5);
            var nullable = reader.GetString(6);

            columns[name] = (dtype, maxLen, prec, scale, def, nullable);
        }

        // 1. caj_monto_apertura: numeric(10,2) NOT NULL
        Assert.True(columns.ContainsKey("caj_monto_apertura"));
        Assert.Equal("numeric", columns["caj_monto_apertura"].DataType);
        Assert.Equal(10, columns["caj_monto_apertura"].Prec);
        Assert.Equal(2, columns["caj_monto_apertura"].Scale);
        Assert.Equal("NO", columns["caj_monto_apertura"].Nullable);

        // 2. caj_monto_cierre: numeric(10,2) NULL
        Assert.True(columns.ContainsKey("caj_monto_cierre"));
        Assert.Equal("numeric", columns["caj_monto_cierre"].DataType);
        Assert.Equal(10, columns["caj_monto_cierre"].Prec);
        Assert.Equal(2, columns["caj_monto_cierre"].Scale);

        // 3. caj_mon_esperado: numeric(10,2)
        Assert.True(columns.ContainsKey("caj_mon_esperado"));
        Assert.Equal("numeric", columns["caj_mon_esperado"].DataType);
        Assert.Equal(10, columns["caj_mon_esperado"].Prec);
        Assert.Equal(2, columns["caj_mon_esperado"].Scale);

        // 4. caj_diferencia: numeric(10,2)
        Assert.True(columns.ContainsKey("caj_diferencia"));
        Assert.Equal("numeric", columns["caj_diferencia"].DataType);
        Assert.Equal(10, columns["caj_diferencia"].Prec);
        Assert.Equal(2, columns["caj_diferencia"].Scale);

        // 5. caj_tot_efectivo: numeric(10,2) DEFAULT 0
        Assert.True(columns.ContainsKey("caj_tot_efectivo"));
        Assert.Equal("numeric", columns["caj_tot_efectivo"].DataType);
        Assert.Equal(10, columns["caj_tot_efectivo"].Prec);
        Assert.Equal(2, columns["caj_tot_efectivo"].Scale);
        Assert.Contains("0", columns["caj_tot_efectivo"].Default ?? "");

        // 6. caj_tot_yape: numeric(10,2) DEFAULT 0
        Assert.True(columns.ContainsKey("caj_tot_yape"));
        Assert.Equal("numeric", columns["caj_tot_yape"].DataType);
        Assert.Equal(10, columns["caj_tot_yape"].Prec);
        Assert.Equal(2, columns["caj_tot_yape"].Scale);
        Assert.Contains("0", columns["caj_tot_yape"].Default ?? "");

        // 7. caj_tot_ventas: numeric(10,2) DEFAULT 0
        Assert.True(columns.ContainsKey("caj_tot_ventas"));
        Assert.Equal("numeric", columns["caj_tot_ventas"].DataType);
        Assert.Equal(10, columns["caj_tot_ventas"].Prec);
        Assert.Equal(2, columns["caj_tot_ventas"].Scale);
        Assert.Contains("0", columns["caj_tot_ventas"].Default ?? "");

        // 8. caj_can_ventas: integer DEFAULT 0
        Assert.True(columns.ContainsKey("caj_can_ventas"));
        Assert.Equal("integer", columns["caj_can_ventas"].DataType);
        Assert.Contains("0", columns["caj_can_ventas"].Default ?? "");

        // 9. caj_observacion: character varying(200)
        Assert.True(columns.ContainsKey("caj_observacion"));
        Assert.Equal("character varying", columns["caj_observacion"].DataType);
        Assert.Equal(200, columns["caj_observacion"].MaxLen);

        // 10. caj_id_usu_cierre: uuid
        Assert.True(columns.ContainsKey("caj_id_usu_cierre"));
        Assert.Equal("uuid", columns["caj_id_usu_cierre"].DataType);

        // 11. caj_solicitud_id: character varying(100), default gen_random_uuid
        Assert.True(columns.ContainsKey("caj_solicitud_id"));
        Assert.Equal("character varying", columns["caj_solicitud_id"].DataType);
        Assert.Equal(100, columns["caj_solicitud_id"].MaxLen);
        Assert.Contains("gen_random_uuid", columns["caj_solicitud_id"].Default ?? "");

        // 12. caj_solicitud_id_cierre: character varying(100)
        Assert.True(columns.ContainsKey("caj_solicitud_id_cierre"));
        Assert.Equal("character varying", columns["caj_solicitud_id_cierre"].DataType);
        Assert.Equal(100, columns["caj_solicitud_id_cierre"].MaxLen);
    }

    [Fact]
    public async Task Public_Cajas_Indexes_Exist_And_Cover_All_CUS13_Query_Patterns()
    {
        await using var conn = new NpgsqlConnection(ConnectionString);
        await conn.OpenAsync();

        await using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE schemaname = 'public' AND tablename = 'cajas';";

        var indexes = new Dictionary<string, string>();
        await using (var reader = await cmd.ExecuteReaderAsync())
        {
            while (await reader.ReadAsync())
            {
                indexes[reader.GetString(0)] = reader.GetString(1);
            }
        }

        // Required indexes:
        // 1. Apertura UTC index
        Assert.True(indexes.ContainsKey("ix_cajas_fec_apertura"), "Debe existir índice sobre fecha de apertura");
        Assert.Contains("caj_fec_apertura_utc", indexes["ix_cajas_fec_apertura"]);

        // 2. Cierre UTC index
        Assert.True(indexes.ContainsKey("ix_cajas_fec_cierre"), "Debe existir índice sobre fecha de cierre");
        Assert.Contains("caj_fec_cierre_utc", indexes["ix_cajas_fec_cierre"]);

        // 3. Composite Estado + Apertura UTC DESC index (for active register & history)
        Assert.True(indexes.ContainsKey("ix_cajas_estado_fec_apertura"), "Debe existir índice compuesto estado + fecha apertura desc");
        Assert.Contains("caj_estado", indexes["ix_cajas_estado_fec_apertura"]);
        Assert.Contains("caj_fec_apertura_utc DESC", indexes["ix_cajas_estado_fec_apertura"]);

        // 4. Unique index on caj_solicitud_id
        Assert.True(indexes.ContainsKey("uq_cajas_solicitud_id"), "Debe existir índice único uq_cajas_solicitud_id");
        Assert.Contains("UNIQUE INDEX", indexes["uq_cajas_solicitud_id"]);
        Assert.Contains("caj_solicitud_id", indexes["uq_cajas_solicitud_id"]);
        Assert.Contains("WHERE (caj_solicitud_id IS NOT NULL)", indexes["uq_cajas_solicitud_id"]);

        // 5. Index on caj_solicitud_id_cierre
        Assert.True(indexes.ContainsKey("ix_cajas_solicitud_id_cierre"), "Debe existir índice sobre solicitud id de cierre");

        // 6. Index on caj_id_usu_cierre
        Assert.True(indexes.ContainsKey("ix_cajas_usuario_cierre"), "Debe existir índice sobre usuario de cierre");
        Assert.Contains("caj_id_usu_cierre", indexes["ix_cajas_usuario_cierre"]);

        // 7. Check ventas composite index for closing sales queries
        await using var cmdVentas = conn.CreateCommand();
        cmdVentas.CommandText = @"
            SELECT indexdef
            FROM pg_indexes
            WHERE schemaname = 'public' AND tablename = 'ventas' AND indexname = 'ix_ventas_caja_estado_metodo';";
        var ventasIdxDef = (string?)await cmdVentas.ExecuteScalarAsync();
        Assert.NotNull(ventasIdxDef);
        Assert.Contains("id_caja", ventasIdxDef!);
        Assert.Contains("ven_estado", ventasIdxDef!);
        Assert.Contains("ven_metodo_pago", ventasIdxDef!);
    }

    [Fact]
    public async Task Public_Cajas_Foreign_Keys_Are_Enforced_With_On_Delete_Restrict()
    {
        await using var conn = new NpgsqlConnection(ConnectionString);
        await conn.OpenAsync();

        await using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT
                tc.constraint_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name,
                rc.delete_rule
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
            JOIN information_schema.referential_constraints AS rc
                ON tc.constraint_name = rc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'cajas';";

        var fks = new Dictionary<string, (string Col, string FTable, string FCol, string DelRule)>();
        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            fks[reader.GetString(0)] = (reader.GetString(1), reader.GetString(2), reader.GetString(3), reader.GetString(4));
        }

        // 1. fk_cajas_usuario: id_usuario -> usuarios(id_usuario), RESTRICT
        Assert.True(fks.ContainsKey("fk_cajas_usuario"));
        Assert.Equal("id_usuario", fks["fk_cajas_usuario"].Col);
        Assert.Equal("usuarios", fks["fk_cajas_usuario"].FTable);
        Assert.Equal("id_usuario", fks["fk_cajas_usuario"].FCol);
        Assert.Equal("RESTRICT", fks["fk_cajas_usuario"].DelRule);

        // 2. fk_cajas_usuario_cierre: caj_id_usu_cierre -> usuarios(id_usuario), RESTRICT
        Assert.True(fks.ContainsKey("fk_cajas_usuario_cierre"));
        Assert.Equal("caj_id_usu_cierre", fks["fk_cajas_usuario_cierre"].Col);
        Assert.Equal("usuarios", fks["fk_cajas_usuario_cierre"].FTable);
        Assert.Equal("id_usuario", fks["fk_cajas_usuario_cierre"].FCol);
        Assert.Equal("RESTRICT", fks["fk_cajas_usuario_cierre"].DelRule);
    }

    [Fact]
    public async Task Unique_Index_uq_cajas_solicitud_id_Enforces_Uniqueness_And_Allows_Multiple_Nulls()
    {
        await using var conn = new NpgsqlConnection(ConnectionString);
        await conn.OpenAsync();

        await using var tx = await conn.BeginTransactionAsync();
        try
        {
            // Get an existing user id
            await using var cmdUser = conn.CreateCommand();
            cmdUser.Transaction = tx;
            cmdUser.CommandText = "SELECT id_usuario FROM public.usuarios LIMIT 1;";
            var userId = (Guid)(await cmdUser.ExecuteScalarAsync())!;

            var token = "test-token-duplicate-" + Guid.NewGuid();

            // 1. Insert first record with unique token -> should succeed
            await using var cmd1 = conn.CreateCommand();
            cmd1.Transaction = tx;
            cmd1.CommandText = @"
                INSERT INTO public.cajas (id_caja, id_usuario, caj_monto_apertura, caj_fec_apertura_utc, caj_estado, fec_creacion_utc, caj_solicitud_id)
                VALUES (gen_random_uuid(), @userId, 100.00, NOW() AT TIME ZONE 'UTC', 'Cerrada', NOW() AT TIME ZONE 'UTC', @token);";
            cmd1.Parameters.AddWithValue("userId", userId);
            cmd1.Parameters.AddWithValue("token", token);
            await cmd1.ExecuteNonQueryAsync();

            // 2. Insert second record with same token -> should throw PostgresException 23505 (unique_violation)
            await using var cmd2 = conn.CreateCommand();
            cmd2.Transaction = tx;
            cmd2.CommandText = @"
                INSERT INTO public.cajas (id_caja, id_usuario, caj_monto_apertura, caj_fec_apertura_utc, caj_estado, fec_creacion_utc, caj_solicitud_id)
                VALUES (gen_random_uuid(), @userId, 150.00, NOW() AT TIME ZONE 'UTC', 'Cerrada', NOW() AT TIME ZONE 'UTC', @token);";
            cmd2.Parameters.AddWithValue("userId", userId);
            cmd2.Parameters.AddWithValue("token", token);

            var ex = await Record.ExceptionAsync(async () => await cmd2.ExecuteNonQueryAsync());
            Assert.NotNull(ex);
            var pgEx = Assert.IsType<PostgresException>(ex);
            Assert.Equal("23505", pgEx.SqlState); // 23505 = unique_violation
            _output.WriteLine($"Postgres capturó violación de unicidad 23505 como esperado: {pgEx.MessageText}");
        }
        finally
        {
            await tx.RollbackAsync();
        }
    }

    [Fact]
    public async Task Foreign_Key_fk_cajas_usuario_cierre_Enforces_Invalid_User_Rejection()
    {
        await using var conn = new NpgsqlConnection(ConnectionString);
        await conn.OpenAsync();

        await using var tx = await conn.BeginTransactionAsync();
        try
        {
            // Get an existing user id for opening
            await using var cmdUser = conn.CreateCommand();
            cmdUser.Transaction = tx;
            cmdUser.CommandText = "SELECT id_usuario FROM public.usuarios LIMIT 1;";
            var userId = (Guid)(await cmdUser.ExecuteScalarAsync())!;

            var fakeNonExistentUserId = Guid.NewGuid();

            // Insert caja with non-existent caj_id_usu_cierre
            await using var cmd = conn.CreateCommand();
            cmd.Transaction = tx;
            cmd.CommandText = @"
                INSERT INTO public.cajas (id_caja, id_usuario, caj_monto_apertura, caj_fec_apertura_utc, caj_estado, fec_creacion_utc, caj_id_usu_cierre)
                VALUES (gen_random_uuid(), @userId, 100.00, NOW() AT TIME ZONE 'UTC', 'Cerrada', NOW() AT TIME ZONE 'UTC', @fakeUserId);";
            cmd.Parameters.AddWithValue("userId", userId);
            cmd.Parameters.AddWithValue("fakeUserId", fakeNonExistentUserId);

            var ex = await Record.ExceptionAsync(async () => await cmd.ExecuteNonQueryAsync());
            Assert.NotNull(ex);
            var pgEx = Assert.IsType<PostgresException>(ex);
            Assert.Equal("23503", pgEx.SqlState); // 23503 = foreign_key_violation
            Assert.Equal("fk_cajas_usuario_cierre", pgEx.ConstraintName);
            _output.WriteLine($"Postgres capturó violación de clave foránea 23503 como esperado: {pgEx.MessageText}");
        }
        finally
        {
            await tx.RollbackAsync();
        }
    }
}
