require("dotenv").config();

module.exports = {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  apiTokne: process.env.API_TOKEN,
  validRequestTimeInMin: process.env.VALID_REQUEST_TIME_IN_MINUTE,
  moralisAPI: {
    key: process.env.MORALIS_API_KEY
  },
  maticDepostor: {
    address: process.env.MATIC_DEPOSITOR,
    key: process.env.MATIC_DEPOSITOR_KEY,
    holdAddress: process.env.USDT_HOLD_TARGET_ADDRESS,
    encKey: process.env.WALLET_ENC_KEY,
  }
};
