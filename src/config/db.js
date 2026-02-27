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

// the connection string is required; if it's missing we won't be able
// to start, so show a helpful message.  This prevents cryptic errors like
// "client password must be a string" when pg attempts to parse an
// undefined string.
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error(
    "❌ DATABASE_URL is not configured. Set it in your environment or .env file.\n" +
      "For local development you can use e.g. postgres://user:pass@localhost:5432/db",
  );
  process.exit(1);
}

const poolConfig = {
  connectionString,
  // only enable SSL when running in production (Render/Supabase).
  // local Postgres instances often don't support SSL, which caused the
  // "server does not support SSL connections" error during development.
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
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
