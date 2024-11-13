const Config = require("../config");

const dbConfig = {
  development: {
    username: Config.DB_USERNAME,
    password: Config.DB_PASSWORD,
    database: Config.DB_NAME,
    host: Config.DB_HOST,
    dialect: "mysql",
  },
  production: {
    username: Config.DB_USERNAME,
    password: Config.DB_PASSWORD,
    database: Config.DB_NAME,
    host: Config.DB_HOST,
    dialect: "mysql",
  },
};

const fs = require("fs");

fs.writeFileSync(
  __dirname + "/../config/config.json",
  JSON.stringify(dbConfig)
);
