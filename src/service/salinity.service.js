"use strict";

const pool = require("../config/db");

class SalinityService {
  // =======================
  // Monthly chart
  // =======================
  static async monthlyChart(query) {
    try {
      const { year, month } = query;

      if (!year || !month) {
        throw { status: 400, message: "year và month là bắt buộc" };
      }

      const monthDate = `${year}-${String(month).padStart(2, "0")}-01`;

      const sql = `
        SELECT
          DATE(measured_at) AS day,
          AVG(salinity_value)::numeric(10,2) AS salinity
        FROM salinity_logs
        WHERE measured_at >= $1::date
          AND measured_at < ($1::date + INTERVAL '1 month')
        GROUP BY DATE(measured_at)
        ORDER BY day;
      `;

      const { rows } = await pool.query(sql, [monthDate]);

      return rows;
    } catch (err) {
      console.error("monthlyChart error:", err);
      throw {
        status: 500,
        message: err.message || "Error fetching monthly chart",
      };
    }
  }

  // =======================
  // Get monthly comment
  // =======================
  static async getMonthlyComment(query) {
    const { year, month } = query;

    if (!year || !month) {
      throw { status: 400, message: "year và month là bắt buộc" };
    }

    const monthDate = `${year}-${String(month).padStart(2, "0")}-01`;

    const sql = `
      SELECT
        c.month,
        c.comment,
        c.updated_at,
        u.username AS forecaster_name
      FROM monthly_salinity_comments c
      LEFT JOIN users u ON u.id = c.forecaster_id
      WHERE c.month = $1::date;
    `;

    const { rows } = await pool.query(sql, [monthDate]);

    return rows[0] || { comment: "" };
  }

  // =======================
  // Dashboard (summary)
  // =======================
  static async getDashboard(query) {
    // Get average salinity for all stations
    const avgSalinityResult = await pool.query(`
      SELECT AVG(salinity_value) AS average_salinity
      FROM salinity_logs
      WHERE measured_at >= NOW() - INTERVAL '30 days'
    `);

    // Get station count
    const stationCountResult = await pool.query(`
      SELECT COUNT(*) AS count
      FROM stations
    `);

    // Get bulletin count
    const bulletinCountResult = await pool.query(`
      SELECT COUNT(*) AS count
      FROM bulletins
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);

    return {
      averageSalinity: parseFloat(
        avgSalinityResult.rows[0]?.average_salinity || 0,
      ),
      stationCount: parseInt(stationCountResult.rows[0]?.count || 0),
      bulletinCount: parseInt(bulletinCountResult.rows[0]?.count || 0),
    };
  }

  // =======================
  // Insert / Update monthly comment
  // =======================
  static async upsertMonthlyComment(user, body) {
    const { year, month, comment_text, comment } = body;

    if (!year || !month || (!comment_text && !comment)) {
      throw { status: 400, message: "year, month và comment là bắt buộc" };
    }

    const monthDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const commentText = comment_text || comment;

    const sql = `
      INSERT INTO monthly_salinity_comments (month, comment, forecaster_id)
      VALUES ($1::date, $2, $3)
      ON CONFLICT (month)
      DO UPDATE SET
        comment = EXCLUDED.comment,
        forecaster_id = EXCLUDED.forecaster_id,
        updated_at = NOW();
    `;

    await pool.query(sql, [monthDate, commentText, user.id]);

    return {
      message: "Lưu bình luận tháng thành công",
    };
  }

  // =======================
  // Dashboard full data
  // =======================
  static async getDashboardData(query) {
    const { from, to } = query;

    if (!from || !to) {
      throw new Error("from và to là bắt buộc");
    }

    const stationSql = `
      SELECT
        s.id AS station_id,
        s.name AS station_name,
        MAX(l.salinity_value) AS max_salinity
      FROM stations s
      JOIN salinity_logs l ON l.station_id = s.id
      WHERE l.measured_at >= $1
        AND l.measured_at <= $2
      GROUP BY s.id, s.name
      ORDER BY max_salinity DESC;
    `;
    const stations = await pool.query(stationSql, [from, to]);

    const bulletinSql = `
      SELECT *
      FROM bulletins
      WHERE from_date <= $2
        AND to_date >= $1
      ORDER BY created_at DESC;
    `;
    const bulletins = await pool.query(bulletinSql, [from, to]);

    const latestSql = `
      SELECT *
      FROM bulletins
      ORDER BY created_at DESC
      LIMIT 2;
    `;
    const latest = await pool.query(latestSql);

    return {
      from,
      to,
      stations: stations.rows,
      bulletins: bulletins.rows,
      latest_bulletins: latest.rows,
    };
  }
}

module.exports = SalinityService;
