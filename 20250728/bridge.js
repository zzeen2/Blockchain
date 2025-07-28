const {ethers} = require("ethers");
require("dotenv").config(); // 환경변수 등록

const ethProvider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC);
const polProvider = new ethers.JsonRpcProvider(process.env.AMOY_RPC);

const ethWallet = new ethers.Wallet(process.env.SEPOLIA_PK);
const polWallet = new ethers.Wallet(process.env.AMOY_PK);

const init = async() => {
    const ethValue = await ethProvider.getBalance(ethWallet.address);
    const polValue = await polProvider.getBalance(polWallet.address);

    console.log(`ETH : ${ethers.formatEther(ethValue)}`);
    console.log(`POL : ${ethers.formatEther(polValue)}`); // 메틱 MATIC
}

init();