"use strict";

const pool = require("../config/db");
const { OK, CREATED, SuccessResponse } = require("../core/successs.response");
const SalinityService = require("../service/salinity.service");

class SalinityController {
  monthlyChart = async (req, res, next) => {
    new OK(
      "Get Data Monthly Chart OK!",
      await SalinityService.monthlyChart(req.query),
    ).send(res);
  };

  getMonthlyComment = async (req, res, next) => {
    new OK(
      "Get Monthly Comment OK!",
      await SalinityService.getMonthlyComment(req.query),
    ).send(res);
  };

  upsertMonthlyComment = async (req, res, next) => {
    new OK(
      "Lưu bình luận tháng thành công",
      await SalinityService.upsertMonthlyComment(req.user, req.body),
    ).send(res);
  };

  getDashboard = async (req, res, next) => {
    new OK(
      "Get Dashboard Data OK!",
      await SalinityService.getDashboard(req.query),
    ).send(res);
  };

  getDashboardData = async (req, res, next) => {
    new OK(
      "Get Dashboard Data OK!",
      await SalinityService.getDashboardData(req.query),
    ).send(res);
  };
}
module.exports = new SalinityController();
