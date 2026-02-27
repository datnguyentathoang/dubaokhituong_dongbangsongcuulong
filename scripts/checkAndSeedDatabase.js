require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Accept self-signed certs from Supabase
});

async function checkTables() {
  try {
    console.log("🔍 Checking database tables...\n");

    // Check tables that exist
    const tableCheckSql = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    const tableResult = await pool.query(tableCheckSql);
    const tables = tableResult.rows.map((r) => r.table_name);

    console.log("📋 Tables found:", tables);
    console.log("");

    // Check data in each critical table
    const criticalTables = ["stations", "salinity_logs", "bulletins", "users"];

    for (const table of criticalTables) {
      if (tables.includes(table)) {
        const countResult = await pool.query(
          `SELECT COUNT(*) as count FROM ${table}`,
        );
        const count = countResult.rows[0].count;
        console.log(`  ✓ ${table}: ${count} rows`);
      } else {
        console.log(`  ✗ ${table}: TABLE NOT FOUND`);
      }
    }

    console.log("");
    return tables;
  } catch (err) {
    console.error("❌ Error checking tables:", err.message);
    throw err;
  }
}

async function seedSampleData() {
  try {
    console.log("\n📥 Inserting sample data...\n");

    // 1. Insert stations
    console.log("  → Inserting stations...");
    await pool.query(`
      INSERT INTO stations (name, river, distance_km)
      VALUES 
        ('Trạm Cần Thơ', 'Sông Hậu', 0),
        ('Trạm Vinh Long', 'Sông Tiền', 15),
        ('Trạm Tà Kơi', 'Sông Hậu', 30),
        ('Trạm Châu Đốc', 'Sông Hậu', 50)
      ON CONFLICT DO NOTHING;
    `);

    // 2. Get inserted station IDs
    const stationsResult = await pool.query(
      `SELECT id FROM stations ORDER BY id LIMIT 4`,
    );
    const stationIds = stationsResult.rows.map((r) => r.id);

    if (stationIds.length > 0) {
      // 3. Insert salinity logs for the current month
      console.log("  → Inserting salinity logs...");
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      let insertCount = 0;
      for (let day = 1; day <= 28; day++) {
        const date = new Date(startOfMonth);
        date.setDate(day);

        for (const stationId of stationIds) {
          const salinity = (Math.random() * 2 + 2.5).toFixed(2); // Random value between 2.5 and 4.5
          await pool.query(
            `
            INSERT INTO salinity_logs (station_id, salinity_value, measured_at)
            VALUES ($1, $2, $3)
            ON CONFLICT DO NOTHING;
          `,
            [stationId, parseFloat(salinity), date.toISOString()],
          );
          insertCount++;
        }
      }
      console.log(`    ✓ Inserted ${insertCount} salinity log records`);
    }

    // 4. Insert sample bulletins
    console.log("  → Inserting bulletins...");
    await pool.query(`
      INSERT INTO bulletins (title, content, from_date, to_date, type)
      VALUES 
        ('Công báo tháng 1', 'Công báo độ mặn tháng 1 năm 2024', '2024-01-01', '2024-01-31', 'monthly'),
        ('Công báo tháng 2', 'Công báo độ mặn tháng 2 năm 2024', '2024-02-01', '2024-02-29', 'monthly'),
        ('Công báo cảnh báo', 'Cảnh báo độ mặn cao tại Cần Thơ', NOW()::date, NOW()::date + INTERVAL '7 days', 'alert')
      ON CONFLICT DO NOTHING;
    `);

    console.log("    ✓ Bulletins inserted");

    console.log("\n✅ Sample data inserted successfully!");
  } catch (err) {
    console.error("❌ Error seeding data:", err.message);
    throw err;
  }
}

async function main() {
  try {
    console.log("=" + "=".repeat(60));
    console.log("🗄️  Database Inspector & Seeder");
    console.log("=" + "=".repeat(60));
    console.log("");

    const tables = await checkTables();

    // Check if we should seed data
    const countResult = await pool.query(
      `SELECT COUNT(*) as count FROM salinity_logs`,
    );
    const dataCount = countResult.rows[0].count;

    if (dataCount === 0) {
      console.log("\n⚠️  No data found in salinity_logs");
      console.log(
        "    → Run this script with '--seed' argument to insert sample data",
      );
      console.log("");
      console.log("    Usage: node checkAndSeedDatabase.js --seed");
      console.log("");

      if (process.argv.includes("--seed")) {
        await seedSampleData();
      }
    } else {
      console.log(
        `\n✅ Database has data! Found ${dataCount} salinity records.`,
      );
    }

    console.log("");
    console.log("=" + "=".repeat(60));
  } catch (err) {
    console.error("\n❌ Fatal error:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
