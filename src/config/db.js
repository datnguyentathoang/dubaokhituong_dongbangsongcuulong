const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Handle pool errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

// Add a small helper to test DB connection at startup
pool.testConnection = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ DB connection successful");
  } catch (err) {
    console.error("❌ DB connection test failed:", err.message);
    process.exit(1);
  }
};

module.exports = pool;
