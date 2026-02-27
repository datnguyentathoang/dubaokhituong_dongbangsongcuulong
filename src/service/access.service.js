"use strict";
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwtUtil = require("../utils/jwt");

class AccessService {
  static async login(body) {
    const { username, password } = body;

    if (!username || !password) {
      throw { status: 400, message: "Thiếu username hoặc password" };
    }

    const { rows } = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username],
    );

    if (!rows.length) {
      throw { status: 401, message: "Sai thông tin đăng nhập" };
    }

    const user = rows[0];
    const isMatch = bcrypt.compareSync(password, user.password_hash);

    if (!isMatch) {
      throw { status: 401, message: "Sai thông tin đăng nhập" };
    }

    const accessToken = jwtUtil.signToken({
      id: user.id,
      role: user.role,
    });

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        role: user.role,
      },
    };
  }
}

module.exports = AccessService;
