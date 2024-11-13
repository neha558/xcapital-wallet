var express = require("express");
var router = express.Router();

const service = require("../../services/nfts");

router.post("/distribute", function (req, res, next) {
  service.distributNFTs(req.body).then((response) => {
    res.send(response);
  });
});

router.get("/distribute", function (req, res, next) {
  service.getDistributNFTs(req.body ?? {}).then((response) => {
    res.send(response);
  });
});

const getDistributNFTs = function (req, res, next) {
  service.getDistributNFTs(req.body ?? {}).then((response) => {
    res.render("nfts/distribute", { data: response });
  });
};
module.exports = { router, getDistributNFTs };
