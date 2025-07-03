const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("MyNFTModule", (m) => {
    const token = m.contract("MyNFT", ["ZzenNFT", "STK"]);
    return {token}
});
