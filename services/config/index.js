const db = require("./../../models/index");

const saveConfig = async (name, value) => {
  const config = db.WalletMicroServiceConfig.build({
    name: name,
    value: value,
  });

  const saved = await config.save();
  return saved;
};

const getConfig = async (name) => {
  const exists = await db.WalletMicroServiceConfig.findOne({
    where: {
      name,
    },
  });

  return exists?.value;
};

module.exports = {
  getConfig,
  saveConfig,
};
