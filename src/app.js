require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

/**
 * =====================================================
 * CORS CONFIG (DEV + PROD)
 * =====================================================
 */
app.use(
  cors({
    origin: function (origin, callback) {
      // cho phép origin null (file://)
      if (!origin) return callback(null, true);
      return callback(null, true);
    },
  }),
);

app.use(express.json());

app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.originalUrl}`);
  next();
});

app.use("/api", require("./routes"));

/**
 * =====================================================
 * ERROR HANDLER
 * =====================================================
 */
app.use((err, req, res, next) => {
  console.error(`❌ Error:`, err);

  // Handle thrown objects with status
  if (err.status) {
    return res.status(err.status).json({ message: err.message });
  }

  // Handle standard errors
  const status = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    message,
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

/**
 * =====================================================
 * 404 HANDLER
 * =====================================================
 */
app.use((req, res) => {
  res.status(404).json({
    message: "API not found",
  });
});

module.exports = app;
