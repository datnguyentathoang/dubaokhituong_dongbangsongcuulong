"use strict";

const jwtUtil = require("../utils/jwt");

const authentication = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Invalid Authorization format" });
  }

  try {
    const decoded = jwtUtil.verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const asyncHandler = (fn) => {
  if (typeof fn !== "function") {
    throw new Error("asyncHandler expects a function, got " + typeof fn);
  }

  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  authentication,
  asyncHandler,
};
