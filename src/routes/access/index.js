"use strict";

const express = require("express");
const router = express.Router();
const AccessController = require("../../controllers/access.controller");
const { asyncHandler } = require("../../auth/checkAuth");

router.post("/login", asyncHandler(AccessController.login));
module.exports = router;
