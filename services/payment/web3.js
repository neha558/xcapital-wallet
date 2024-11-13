const cron = require("node-cron");
const { Web3 } = require("web3");
const Moralis = require("moralis").default;
const { EvmChain } = require("@moralisweb3/common-evm-utils");
const usdtService = require("./usdt");
const configService = require("./../config");
const config = require("../../config");
const db = require("../../models");
const erc20USDTAddress = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f";
const chain = EvmChain.POLYGON;

const web3 = new Web3("https://polygon-rpc.com/");
const gasPrice = {
  matic: web3.utils.toWei("0.002", 'ether'),
  gwe: String(560.8086807015334),
};

async function transferWalletToContract(address, amount) {
  try {
    // read from existing table
    // vendor_table
    // module_wallet_users
    const queryMainVendorUserTable = "SELECT * FROM cubix.module_web3_wallet_users where lower(`account_address`) = lower('"+ address.toLowerCase() +"');"
    const walletData = await db.sequelize.query(queryMainVendorUserTable);
    const encrypted = walletData?.[0]?.[0]?.encrypted;
    const dect = await web3.eth.accounts.decrypt(
      encrypted,
      config.maticDepostor.encKey
    );

    const tokenContract = new web3.eth.Contract(tokenABI, erc20USDTAddress, {
      from: address,
    });

    const encodedABI = tokenContract.methods
      .transfer(config.maticDepostor.holdAddress, amount)
      .encodeABI();

    const dataForTx = {
      to: erc20USDTAddress,
      from: address,
      gas: 500000,
      data: encodedABI,
    };
    const signedTx = await web3.eth.accounts.signTransaction(
      dataForTx,
      dect.privateKey
    );

    const receipt = await web3.eth.sendSignedTransaction(
      signedTx?.rawTransaction
    );

    // update success to hold status here

    return receipt;
  } catch (error) {
    console.log("error is", error);
  }
}

async function transferMaticToWallet(address) {
  try {
    const transactionParameters = {
      from: config.maticDepostor.address,
      to: address,
      data: "0x",
      value: gasPrice?.matic,
      gas: 500000,
      gasFee: gasPrice?.gwe,
    };

    const signedTx = await web3.eth.accounts.signTransaction(
      transactionParameters,
      config.maticDepostor.key
    );

    const receipt = await web3.eth.sendSignedTransaction(
      signedTx?.rawTransaction
    );

    transferWalletToContract(address, amount);
    return receipt;
  } catch (error) {
    console.log(error);
  }
}

async function holdUSDT() {
  try {
    const pendingHold = await usdtService.getHoldPendingRequestsWallet();
    const address = {};
    pendingHold?.forEach((_pendingHold) => {
      address[_pendingHold.walletAddress] = {
        usdt: 0,
        matic: 0,
        address: _pendingHold.walletAddress,
      };
    });

    const tokensOwned = await Promise.all(
      Object.keys(address).map((_address) => {
        return Moralis.EvmApi.token.getWalletTokenBalances({
          address: _address,
          chain,
        });
      })
    );

    tokensOwned
      .map(
        (_tokenOwned, index) =>
          _tokenOwned.result
            .map((_token) => {
              return {
                amount: _token.amount,
                decimals: _token.decimals,
                address: Object.keys(address)?.[index],
                token: _token.token.contractAddress.lowercase,
              };
            })
            .filter(
              (_token) => _token.token.toLowerCase() === erc20USDTAddress
            )?.[0]
      )
      .forEach((_ownedUSDTTokensFromUser) => {
        transferMaticToWallet(
          _ownedUSDTTokensFromUser.address,
          _ownedUSDTTokensFromUser.amount
        );
      });
  } catch (error) {
    console.error("Error hold:", error);
  }
}

// Function to fetch transfer events
async function fetchTransferEvents() {
  try {
    const pendingRequests = await usdtService.getPendingRequests();
    if (pendingRequests?.length > 0) {
      pendingRequests?.map(async (_pendingRequests) => {
        getEvents(_pendingRequests);
      });
    }
  } catch (error) {
    console.error("Error fetching transfer events:", error);
  }
}

async function getEvents(_pendingRequests) {
  try {
    const address = _pendingRequests.walletAddress;
    const fromBlock = await configService.getConfig("USDT_TRANSFER_BLOCK");

    const response = await Moralis.EvmApi.token.getWalletTokenTransfers({
      address,
      chain,
      fromBlock: fromBlock,
      order: "DESC",
    });

    const filterTransfer = response.result.filter((_result) => {
      return _result.address.lowercase === erc20USDTAddress.toLowerCase();
    });
    // Process the events
    const formatedData = filterTransfer.map((_filterTransfer) => {
      return {
        fromAddress: _filterTransfer.fromAddress.lowercase,
        walletAddress: _filterTransfer.toAddress.lowercase,
        amount: _filterTransfer.value,
        _amount: parseInt(_filterTransfer.value) / 1000000,
        tx: _filterTransfer.transactionHash,
        blockNumber: _filterTransfer.blockNumber,
      };
    });

    await updateUSDTTranferEventDb(formatedData?.[0]);

    if (formatedData?.[0]?.blockNumber) {
      await configService.saveConfig(
        "USDT_TRANSFER_BLOCK",
        `${formatedData?.[0].blockNumber + 1}`
      );
    }
  } catch (error) {
    console.error("Error fetching transfer events:", error);
  }
}

async function updateUSDTTranferEventDb(formatedData) {
  await usdtService.updatePayment({
    walletAddress: formatedData.walletAddress,
    tx: formatedData.tx,
  });

  // update main table here
  const queryMainVendorWalletTable = "SELECT * FROM `xcapital`.`user` WHERE lower(wallet_address) = lower('"+ formatedData.walletAddress.toLowerCase()+"')"
  const walletData = await db.sequelize.query(queryMainVendorWalletTable);

  const timestamp = new Date().getTime();
  const queryMainVendorTable = "INSERT INTO `xcapital`.`user_wallet_history` (`user_id`, `unique_id`, `wallet_type`, `transaction_type`, `type`, `sub_type`, `amount`, `amount_type`, `message`, `transaction_id`, `custom_reference_id`, `custom_reference_key`, `custom_reference_vallue`, `begin_wallet_balance`, `begin_reward_balance`, `timestamp`) VALUES ('"+walletData?.[0]?.[0]?.id+"',  '"+"XC"+ timestamp +"', '1', '1', '1', '1', '"+formatedData._amount+"', '1', 'Amount Deposited ', '"+formatedData.tx+"', '"+walletData?.[0]?.[0]?.id+"', 'Deposit', 'By User', '0', '0', '" + timestamp +"');"
  await db.sequelize.query(queryMainVendorTable);
}

const scheduleCron = async () => {
  await Moralis.start({
    apiKey: config.moralisAPI.key,
  });
  // Schedule cron job to fetch transfer events every 2 minutes
  cron.schedule("*/2 * * * *", fetchTransferEvents);
  cron.schedule("*/2 * * * *", holdUSDT);
};

module.exports = {
  scheduleCron,
};
