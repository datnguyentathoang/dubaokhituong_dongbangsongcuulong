const express = require("express");
const router = express.Router();

const bulletinController = require("../../controllers/bulletin.controller");
const {
  authentication: verifyToken,
  asyncHandler,
} = require("../../auth/checkAuth");

const checkRole = require("../../middlewares/role.controller");

/**
 * PUBLIC
 */
router.get("/latest", asyncHandler(bulletinController.getLatestBulletins));
router.get("/", asyncHandler(bulletinController.getBulletinsByMonth));

/**
 * ADMIN / CÁN BỘ
 */
router.post(
  "/",
  verifyToken,
  checkRole(["admin", "forecaster"]),
  asyncHandler(bulletinController.createBulletin),
);

// update and delete require same roles
router.patch(
  "/:id",
  verifyToken,
  checkRole(["admin", "forecaster"]),
  asyncHandler(bulletinController.updateBulletin),
);
router.delete(
  "/:id",
  verifyToken,
  checkRole(["admin", "forecaster"]),
  asyncHandler(bulletinController.deleteBulletin),
);

module.exports = router;
