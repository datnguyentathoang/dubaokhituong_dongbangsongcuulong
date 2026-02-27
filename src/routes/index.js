"use strict";
const express = require("express");
const router = express.Router();

router.use("/access", require("./access/index"));
router.use("/salinity", require("./salinity/index"));
router.use("/weather", require("./weather/index"));

module.exports = router;
