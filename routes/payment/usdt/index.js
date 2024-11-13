var express = require("express");
var router = express.Router();

const service = require("../../../services/payment/usdt");

router.post("/", function (req, res, next) {
  service.initPayment(req.body).then((response) => {
    res.send(response);
  });
});

module.exports = router;
