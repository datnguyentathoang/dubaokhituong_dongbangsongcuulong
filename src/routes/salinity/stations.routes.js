const express = require("express");
const router = express.Router();
const {asyncHandler} = require("../../auth/checkAuth");
const stationController = require("../../controllers/station.controller");

/**
 * PUBLIC
 * GET /api/stations
 */
router.get("/all-station", asyncHandler(stationController.getAllStations));
router.get("/max-stations", asyncHandler(stationController.maxStations));
module.exports = router;
