require("@nomicfoundation/hardhat-ethers");
require('@nomicfoundation/hardhat-toolbox');
require("dotenv").config();

const { PRIVATE_KEY, RPC_URL } = process.env

module.exports = {
  solidity: "0.8.20",
  networks: {
    CrossFiTestnet: {
      url: process.env.RPC_URL,
      chainId: 4157,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};