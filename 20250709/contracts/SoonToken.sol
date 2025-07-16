// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SoonToken is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function mint(address account, uint value) external {
        _mint(account, value);
    }
}