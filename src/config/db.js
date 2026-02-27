const { Pool } = require("pg");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not defined.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on("error", (err) => {
  console.error("Unexpected DB error:", err);
  process.exit(1);
});

pool.testConnection = async () => {
  await pool.query("SELECT 1");
  console.log("✅ DB connection successful");
};

module.exports = pool;
