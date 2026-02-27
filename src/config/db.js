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

// build the connection string; prefer DATABASE_URL, but fall back to the
// legacy DB_* vars if they are set.  This keeps the app usable when the
// environment wasn't yet updated.
let connectionString = process.env.DATABASE_URL;
let usedFallback = false; // tracks whether we fell back to localhost

// debug info - removed once issue is resolved
console.debug("[db] initial DATABASE_URL", process.env.DATABASE_URL);
if (!connectionString) {
  const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;
  if (DB_HOST && DB_NAME) {
    // notice about using legacy vars so developers know to migrate
    console.warn(
      "⚠️  DATABASE_URL not set, constructing connection string from legacy " +
        "DB_* environment variables. Please migrate to DATABASE_URL.",
    );
    const user = DB_USER || "postgres";
    const pass = DB_PASSWORD ? encodeURIComponent(DB_PASSWORD) : "";
    const port = DB_PORT || 5432;
    connectionString = `postgres://${user}:${pass}@${DB_HOST}:${port}/${DB_NAME}`;
  }
}
if (!connectionString) {
  // no config at all – warn and fall back to localhost default instead of
  // exiting.  this prevents the app from crashing during quick dev
  // experiments when the developer forgets to set env vars.
  console.warn(
    "⚠️  No DATABASE_URL or legacy DB_* configuration found; " +
      "falling back to postgres://localhost:5432/postgres for development.",
  );
  connectionString = "postgres://localhost:5432/postgres";
  usedFallback = true;
}

// debug output
console.debug(
  "[db] final connectionString",
  connectionString,
  "usedFallback",
  usedFallback,
);

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
// If we fell back to the localhost default we log the error but do not
// terminate; this keeps the server running when developers are just
// iterating without a database.  In production with a real
// DATABASE_URL the process will still exit, which is often desirable.
pool.testConnection = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ DB connection successful");
  } catch (err) {
    console.error("❌ DB connection test failed:", err.message);
    if (!usedFallback && process.env.NODE_ENV === "production") {
      // fail hard only when we're in production and not using a
      // harmless fallback.
      process.exit(1);
    } else {
      console.warn(
        "Continuing without a working database connection; some features " +
          "may be unavailable.",
      );
    }
  }
};

module.exports = pool;
