const { OK } = require("../core/successs.response");
const WeatherService = require("../service/weather.service");

class WeatherController {
  forecast3Hour = async (req, res, next) => {
    const { ma_xa } = req.params;
    const data = await WeatherService.getForecastNextHoursByMaXa(ma_xa);
    // return timeline array directly for frontend convenience
    new OK("Get Forecast Success!", data.timeline).send(res);
  };

  getDistricts = async (req, res, next) => {
    // Get list of all districts/communes for weather forecast
    const data = await WeatherService.getDistricts();
    new OK("Get Districts Success!", data).send(res);
  };
}

module.exports = new WeatherController();
