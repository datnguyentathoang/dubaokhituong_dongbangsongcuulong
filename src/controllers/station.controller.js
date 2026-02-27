"use strict";

const { OK } = require("../core/successs.response");
const StationSalinityService = require("../service/station.service");

class StationSalinityController {
  getStationDetail = async (req, res, next) => {
    new OK(
      "Get Station Detail OK!",
      await StationSalinityService.getStationDetail(req.query)
    ).send(res);
  };

  getAllStations = async (req, res, next) => {
    new OK(
      "Get All Stations OK!",
      await StationSalinityService.getAllStations()
    ).send(res);
  };

  maxStations = async (req, res, next) => {
    new OK(
      "Get Max Salinity Stations By Month OK!",
      await StationSalinityService.getMaxStationsByMonth(req.query.month)
    ).send(res);
  };
}

module.exports = new StationSalinityController();
