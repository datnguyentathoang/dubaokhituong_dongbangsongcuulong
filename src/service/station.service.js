"use strict";
const pool = require("../config/db");

class StationSalinityService {
  static async getStationDetail({ station_id, from, to }) {
    try {
      if (!station_id || !from || !to) {
        throw new Error("station_id, from, to là bắt buộc");
      }

      /* 1️⃣ Thông tin trạm */
      const stationSql = `
        SELECT id AS station_id, name AS station_name
        FROM stations
        WHERE id = $1
      `;
      const stationResult = await pool.query(stationSql, [station_id]);

      /* 2️⃣ Dữ liệu theo ngày */
      const dataSql = `
        SELECT
          DATE(measured_at) AS date,
          MAX(salinity_value) AS salinity
        FROM salinity_logs
        WHERE station_id = $1
          AND measured_at >= $2
          AND measured_at <= $3
        GROUP BY DATE(measured_at)
        ORDER BY date;
      `;
      const dataResult = await pool.query(dataSql, [station_id, from, to]);

      /* 3️⃣ Tổng hợp max */
      let maxSalinity = 0;
      let maxDate = null;

      dataResult.rows.forEach(r => {
        if (r.salinity > maxSalinity) {
          maxSalinity = r.salinity;
          maxDate = r.date;
        }
      });

      return {
        station: stationResult.rows[0],
        from,
        to,
        summary: {
          max_salinity: maxSalinity,
          max_date: maxDate,
        },
        daily_data: dataResult.rows,
      };
    } catch (err) {
      console.error("getStationDetail error:", err);
      throw err;
    }
  }

  static async getAllStations() {
    try {
      const sql = `
        SELECT
          id AS station_id,
          name AS station_name,
          river,
          distance_km
        FROM stations
        ORDER BY name;
      `;

      const { rows } = await pool.query(sql);
      return rows;
    } catch (err) {
      console.error("getAllStations error:", err);
      throw err;
    }
  }

  static async getMaxStationsByMonth(month) {
    try {
      if (!month) {
        throw new Error("month là bắt buộc");
      }

      const monthDate = /^\d{4}-\d{2}$/.test(month)
        ? `${month}-01`
        : month;

      const sql = `
        SELECT DISTINCT ON (s.id)
          s.id AS station_id,
          s.name AS station_name,
          s.river,
          sl.salinity_value AS max_salinity,
          DATE(sl.measured_at) AS occurred_date
        FROM salinity_logs sl
        JOIN stations s ON s.id = sl.station_id
        WHERE sl.measured_at >= $1::date
          AND sl.measured_at < ($1::date + INTERVAL '1 month')
        ORDER BY
          s.id,
          sl.salinity_value DESC,
          sl.measured_at DESC;
      `;

      const { rows } = await pool.query(sql, [monthDate]);

      return {
        month: monthDate,
        data: rows,
      };
    } catch (err) {
      console.error("getMaxStationsByMonth error:", err);
      throw err;
    }
  }
}

module.exports = StationSalinityService;
