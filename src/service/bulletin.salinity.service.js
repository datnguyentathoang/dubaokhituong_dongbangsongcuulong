"use strict";
const pool = require("../config/db");

// Helper function to parse various date formats
function parseDate(dateString) {
  if (!dateString) return null;

  // Check if format is dd/mm/yyyy
  const ddmmyyyy = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateString);
  if (ddmmyyyy) {
    const day = ddmmyyyy[1];
    const month = ddmmyyyy[2];
    const year = ddmmyyyy[3];
    return `${year}-${month}-${day}`;
  }

  // Check if format is dd/mm/yy
  const ddmmyy = /^(\d{2})\/(\d{2})\/(\d{2})$/.exec(dateString);
  if (ddmmyy) {
    const day = ddmmyy[1];
    const month = ddmmyy[2];
    let year = parseInt(ddmmyy[3]);
    // Assume 20xx if yy < 50, else 19xx
    year = year < 50 ? 2000 + year : 1900 + year;
    return `${year}-${month}-${day}`;
  }

  // Otherwise assume ISO format (YYYY-MM-DD or ISO string)
  return dateString;
}

class BulletinSalinityService {
  static async getLatestBulletins() {
    try {
      const { rows } = await pool.query(`
        SELECT
          id,
          title,
          from_date,
          to_date,
          content,
          created_at
        FROM bulletins
        ORDER BY created_at DESC
        LIMIT 100
      `);

      return rows;
    } catch (err) {
      console.error("getLatestBulletins error:", err);
      throw err;
    }
  }

  static async getLatestBulletinsByMonth(month) {
    try {
      if (!month) {
        throw new Error("month is required");
      }

      const { rows } = await pool.query(
        `
        SELECT *
        FROM bulletins
        WHERE
          from_date <= ($1::date + INTERVAL '1 month - 1 day')
          AND to_date >= $1::date
        ORDER BY from_date
        `,
        [`${month}-01`],
      );

      return rows;
    } catch (err) {
      console.error("getLatestBulletinsByMonth error:", err);
      throw err;
    }
  }

  static async getBulletinsByMonth(month) {
    try {
      if (!month) {
        throw new Error("month is required");
      }

      const { rows } = await pool.query(
        `
        SELECT *
        FROM bulletins
        WHERE
          from_date <= ($1::date + INTERVAL '1 month - 1 day')
          AND to_date >= $1::date
        ORDER BY from_date
        `,
        [`${month}-01`],
      );

      return rows;
    } catch (err) {
      console.error("getBulletinsByMonth error:", err);
      throw err;
    }
  }

  static async createBulletin(data, userId) {
    try {
      const { from_date, to_date, title, content } = data;

      if (!from_date || !to_date || !content) {
        throw new Error("Missing fields");
      }

      // Parse dates from various formats to YYYY-MM-DD
      const parsedFromDate = parseDate(from_date);
      const parsedToDate = parseDate(to_date);

      // Validate date order by comparing string dates (YYYY-MM-DD format)
      if (parsedFromDate > parsedToDate) {
        throw new Error("from_date must be less than or equal to to_date");
      }

      const { rows } = await pool.query(
        `
        INSERT INTO bulletins
          (from_date, to_date, title, content, created_by)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [parsedFromDate, parsedToDate, title, content, userId],
      );

      return rows[0];
    } catch (err) {
      console.error("createBulletin error:", err);
      throw err;
    }
  }

  static async updateBulletin(id, data, userId) {
    try {
      const { from_date, to_date, title, content } = data;
      if (!id) throw new Error("ID is required");

      let parsedFromDate = from_date;
      let parsedToDate = to_date;

      // Validate and parse dates if both are provided
      if (from_date && to_date) {
        parsedFromDate = parseDate(from_date);
        parsedToDate = parseDate(to_date);

        if (parsedFromDate > parsedToDate) {
          throw new Error("from_date must be less than or equal to to_date");
        }
      }

      const { rows } = await pool.query(
        `
        UPDATE bulletins
        SET from_date = $1,
            to_date = $2,
            title = $3,
            content = $4
        WHERE id = $5
        RETURNING *
        `,
        [parsedFromDate, parsedToDate, title, content, id],
      );
      return rows[0];
    } catch (err) {
      console.error("updateBulletin error:", err);
      throw err;
    }
  }

  static async deleteBulletin(id) {
    try {
      if (!id) throw new Error("ID is required");
      const { rows } = await pool.query(
        `
        DELETE FROM bulletins
        WHERE id = $1
        RETURNING *
        `,
        [id],
      );
      return rows[0];
    } catch (err) {
      console.error("deleteBulletin error:", err);
      throw err;
    }
  }
}

module.exports = BulletinSalinityService;
