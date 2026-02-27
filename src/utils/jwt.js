const jwt = require("jsonwebtoken");

const signToken = (payload, expiresIn = "15m") => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment");
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment");
  }
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw {
      status: 401,
      message: "Invalid or expired token",
    };
  }
};

module.exports = {
  signToken,
  verifyToken,
};
