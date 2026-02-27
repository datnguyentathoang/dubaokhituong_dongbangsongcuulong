"use strict";
const express = require("express");
const router = express.Router();

router.use("/", require("./salinity.routes"));
router.use("/bulletins", require("./bulletin.routes"));
// alias to support older frontend paths (/salinity/bulletin/...)
router.use("/bulletin", require("./bulletin.routes"));
router.use("/stations", require("./stations.routes"));

module.exports = router;
