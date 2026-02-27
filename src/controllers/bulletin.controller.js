const pool = require("../config/db");
const { OK, CREATED, SuccessResponse } = require("../core/successs.response");
const BulletinSalinityService = require("../service/bulletin.salinity.service");

class bulletinController {
  getLatestBulletins = async (req, res, next) => {
    new OK(
      "Get Latest Bulletins Success!",
      await BulletinSalinityService.getLatestBulletins(),
    ).send(res);
  };

  getBulletinsByMonth = async (req, res, next) => {
    new OK(
      "Get Bulletins By Month Success!",
      await BulletinSalinityService.getLatestBulletinsByMonth(req.query.month),
    ).send(res);
  };

  getLatestBulletinsByMonth = async (req, res, next) => {
    new OK(
      "Get Latest Bulletins By Month Success!",
      await BulletinSalinityService.getLatestBulletinsByMonth(req.query.month),
    ).send(res);
  };

  createBulletin = async (req, res, next) => {
    new CREATED(
      "Create Bulletin Success!",
      await BulletinSalinityService.createBulletin(req.body, req.user.id),
    ).send(res);
  };

  updateBulletin = async (req, res, next) => {
    const updated = await BulletinSalinityService.updateBulletin(
      req.params.id,
      req.body,
      req.user.id,
    );
    new OK("Update Bulletin Success!", updated).send(res);
  };

  deleteBulletin = async (req, res, next) => {
    const deleted = await BulletinSalinityService.deleteBulletin(req.params.id);
    new OK("Delete Bulletin Success!", deleted).send(res);
  };
}

module.exports = new bulletinController();
