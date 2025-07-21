// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

contract SoonToken {
    string public name = "SoonToken";
    string public symbol = "STK";
    uint8 public decimals = 18;
    uint public totalSupply;

    mapping(address => uint) public balanceOf;

    address public owner;

    event Transfer(address indexed from, address indexed to, uint256 value);

    constructor() {
        owner = msg.sender;
    }    

    function mint(address to, uint amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;

        emit Transfer(address(0), to, amount);
    }
// remixd -s . -u https://remix.ethereum.org/
    function transfer(address from, address to, uint amount) external {
        require(balanceOf[from] >= amount);
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
    }
}