'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WalletMicroServiceNFTDistribution extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  WalletMicroServiceNFTDistribution.init({
    walletAddress: DataTypes.STRING,
    pack: DataTypes.STRING,
    amount: DataTypes.STRING,
    tx: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'WalletMicroServiceNFTDistribution',
  });
  return WalletMicroServiceNFTDistribution;
};