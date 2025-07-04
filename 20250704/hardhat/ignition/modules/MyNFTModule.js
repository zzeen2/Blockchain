const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("MyNFTModule", (m) => {
    const token = m.contract("MyNFT", ["ZzenNFT", "STK"]);
    const sale = m.contract("SaleNFT", [token]);
    return {token, sale}
});
