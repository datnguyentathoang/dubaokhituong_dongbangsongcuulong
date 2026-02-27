"use strict";

const express = require("express");
const router = express.Router();

const salinityController = require("../../controllers/salinity.controller");
const StationSalinityController = require("../../controllers/station.controller");

const {
  authentication: verifyToken,
  asyncHandler,
} = require("../../auth/checkAuth");

const checkRole = require("../../middlewares/role.controller");

// PUBLIC
router.get("/monthly-chart", asyncHandler(salinityController.monthlyChart));
router.get(
  "/monthly-comment",
  asyncHandler(salinityController.getMonthlyComment),
);
router.get("/dashboard", asyncHandler(salinityController.getDashboard));
router.get(
  "/station",
  asyncHandler(StationSalinityController.getStationDetail),
);

// PROTECTED
router.post(
  "/monthly-comment",
  verifyToken,
  checkRole(["admin", "forecaster"]),
  asyncHandler(salinityController.upsertMonthlyComment),
);

router.post(
  "/upsert-monthly-comment",
  verifyToken,
  checkRole(["admin", "forecaster"]),
  asyncHandler(salinityController.upsertMonthlyComment),
);

module.exports = router;
