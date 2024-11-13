const config = require("../../config");

const validateToken = function (req, res, next) {
  if (req.headers?.["x-api-token"] !== config.apiTokne) {
    return res.status(401).send({
      message: "Token not valid!",
    });
  }
  next();
};

module.exports = {
  validateToken,
};
