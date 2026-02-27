"use strict";

const express = require("express");
const router = express.Router();

const weatherController = require("../../controllers/weather.controller");
const { asyncHandler } = require("../../auth/checkAuth");

// Get list of all districts/communes for weather
router.get("/districts", asyncHandler(weatherController.getDistricts));

// Get 3-hour forecast for a specific district
router.get("/forecast/:ma_xa", asyncHandler(weatherController.forecast3Hour));
router.get("/:ma_xa", asyncHandler(weatherController.forecast3Hour));

module.exports = router;
