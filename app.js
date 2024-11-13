var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var authService = require("./services/auth");
var web3Service = require("./services/payment/web3");

var dbHandler = require("./models/index");

dbHandler.connect();

var indexRouter = require("./routes/index");
var usdtRouter = require("./routes/payment/usdt");
var nftRouter = require("./routes/nfts");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.get("/public/nfts/distribute", nftRouter.getDistributNFTs);

app.use(authService.validateToken);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api/payment/request", usdtRouter);
app.use("/api/nfts", nftRouter.router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

web3Service.scheduleCron();

module.exports = app;
