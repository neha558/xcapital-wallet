const db = require("./../../models/index");

const distributNFTs = async (data) => {
  const distributeNFT = db.WalletMicroServiceNFTDistribution.build({
    walletAddress: data.walletAddress.toLowerCase(),
    pack: data.pack,
    amount: data.amount,
    status: "pending",
  });

  const saved = await distributeNFT.save();

  const queryMainVendorUserTable =
    "SELECT * FROM cubix.module_networking_users where lower(`account_address`) = lower('" +
    data.walletAddress.toLowerCase() +
    "');";
  const walletData = await db.sequelize.query(queryMainVendorUserTable);
  let usedId = walletData?.[0]?.[0]?.id;

  if (!usedId) {
    const insertIntoNetworking = `INSERT INTO cubix.module_networking_users (
      isActive,
      internalComment,
      account_address,
      email,
      wallet_address
    )
      VALUES
    (
      true,
      'xcaptial_user',
      '${data.walletAddress.toLowerCase()}',
      '${data.walletAddress.toLowerCase()}@cubix.pro',
      '${data.walletAddress.toLowerCase()}'
    )`;
    await db.sequelize.query(insertIntoNetworking);
    const queryMainVendorUserTable =
      "SELECT * FROM cubix.module_networking_users where lower(`account_address`) = lower('" +
      data.walletAddress.toLowerCase() +
      "');";
    const walletData = await db.sequelize.query(queryMainVendorUserTable);
    usedId = walletData?.[0]?.[0]?.id;
  }

  const queryMainVendorTable =
    "INSERT INTO `cubix`.`module_networking_pack_bought`" +
    "(`_id`, `packPrice`,`blockChainData`,`status`,`userId`,`packId`)" +
    "VALUES('" +
    (parseInt(data.pack) - 1) +
    "','" +
    data.amount +
    "','','paid','" +
    usedId +
    "','" +
    data.pack +
    "');";

  await db.sequelize.query(queryMainVendorTable);
  return saved;
};

const updateDistributNFTs = async (data) => {
  const criteria = {
    id: data?.id,
    tx: null,
  };

  const exists = await db.WalletMicroServiceNFTDistribution.findOne({
    where: criteria,
  });

  exists.status = "success";
  exists.tx = data?.tx;
  await exists.save();

  return true;
};

const getDistributNFTs = async (data) => {
  const criteria = {
    tx: null,
  };

  return await db.WalletMicroServiceNFTDistribution.findAll({
    where: criteria,
    ...data,
  });
};

module.exports = {
  distributNFTs,
  updateDistributNFTs,
  getDistributNFTs,
};
