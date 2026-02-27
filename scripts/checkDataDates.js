require("dotenv").config();
const pool = require("../src/config/db");

(async () => {
  try {
    const result = await pool.query(`
      SELECT 
        DATE_TRUNC('month', measured_at) as month, 
        COUNT(*) as count,
        MIN(measured_at) as earliest,
        MAX(measured_at) as latest
      FROM salinity_logs 
      GROUP BY DATE_TRUNC('month', measured_at) 
      ORDER BY month DESC 
      LIMIT 12
    `);

    console.log("\n📅 Data available by month:");
    console.table(result.rows);

    // Also show some sample rows
    const sample = await pool.query(`
      SELECT station_id, salinity_value, measured_at 
      FROM salinity_logs 
      LIMIT 10
    `);

    console.log("\n📊 Sample data:");
    console.table(sample.rows);

    pool.end();
  } catch (err) {
    console.error("Error:", err.message);
    pool.end();
  }
})();
