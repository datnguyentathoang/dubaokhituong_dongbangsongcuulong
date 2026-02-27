const { Pool } = require("pg");
require("dotenv").config();

// Render / Supabase provide a single connection string via DATABASE_URL.
// In production we connect through the Supabase connection pool port (6543)
// and enable SSL with an insecure certificate acceptance because the
// managed certificate is self-signed.  This mirrors best practice for
// Node.js apps running on Render or other platforms.
//
// For local development you can still set DATABASE_URL in your `.env` file,
// for example:
//
//   DATABASE_URL=postgres://user:pass@localhost:5432/dbname
//
// The old DB_USER/DB_HOST/... vars are no longer required.

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
};

const pool = new Pool(poolConfig);

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
