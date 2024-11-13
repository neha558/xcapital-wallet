const { Op } = require("sequelize");
const db = require("./../../../models/index");
const moment = require("moment");
const config = require("../../../config");

const initPayment = async (data) => {
  const criteria = {
    walletAddress: data?.walletAddress.toLowerCase(),
    validTill: { [Op.gte]: moment().toDate() },
    tx: null,
  };

  await db.WalletMicroServicePaymentRequest.update(
    { status: "expired" },
    {
      where: { ...criteria, validTill: { [Op.lt]: moment().toDate() } },
    }
  );

  const exists = await db.WalletMicroServicePaymentRequest.findOne({
    where: criteria,
  });

  if (exists) {
    return exists;
  }

  const request = db.WalletMicroServicePaymentRequest.build({
    walletAddress: data.walletAddress.toLowerCase(),
    validTill: moment().add(config.validRequestTimeInMin, "minutes").toDate(),
    status: "pending",
  });

  const saved = await request.save();
  return saved;
};

const updatePayment = async (data) => {
  const criteria = {
    walletAddress: data?.walletAddress.toLowerCase(),
    tx: null,
    status: "pending",
  };

  const exists = await db.WalletMicroServicePaymentRequest.findOne({
    where: criteria,
  });

  exists.status = "success";
  exists.tx = data?.tx;
  await exists.save();
  return true;
};

const getPendingRequests = async () => {
  const criteria = {
    validTill: { [Op.gte]: moment().toDate() },
    tx: null,
  };

  return await db.WalletMicroServicePaymentRequest.findAll({
    where: criteria,
  });
};

const getHoldPendingRequestsWallet = async () => {
  const criteria = {
    status: "success",
  };

  return await db.WalletMicroServicePaymentRequest.findAll({
    where: criteria,
  });
};

module.exports = {
  initPayment,
  updatePayment,
  getPendingRequests,
  getHoldPendingRequestsWallet,
};
