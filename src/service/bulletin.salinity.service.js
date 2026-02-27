"use strict";
const pool = require("../config/db");

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
        LIMIT 2
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

      const { rows } = await pool.query(
        `
        INSERT INTO bulletins
          (from_date, to_date, title, content, created_by)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [from_date, to_date, title, content, userId],
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
        [from_date, to_date, title, content, id],
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
