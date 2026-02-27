"use strict";

const AccessService = require("../service/access.service");
const { OK } = require("../core/successs.response");

class AccessController {
  login = async (req, res, next) => {
    new OK("Login OK!", await AccessService.login(req.body)).send(res);
  };
}

module.exports = new AccessController();
