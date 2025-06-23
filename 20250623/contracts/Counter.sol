// SPDX-License-Identifier: MIT

pragma solidity 0.8.30;

contract Counter {
    uint value;

    constructor() {
        value = 0;
    }

    function setValue (uint _value) public{
        value = _value;
    }
    // returns 반환하는 타입 
    function getValue() public view returns (uint) {
        return value;
    }
}