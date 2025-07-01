const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("DigimonModule", (m) => {
    const token = m.contract("Digimon", ["DigimonToken", "DTK"]);
    return {token}
});
