"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const Config = require("../config");

const basename = path.basename(__filename);
const db = {};

let sequelize = new Sequelize(
  Config.DB_NAME,
  Config.DB_USERNAME,
  Config.DB_PASSWORD,
  {
    host: Config.DB_HOST,
    dialect: "mysql",
    logging: false,
  }
);

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

const connect = async () => {
  try {
    await sequelize.authenticate();
    sequelize.sync();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

db.connect = connect;

module.exports = db;
