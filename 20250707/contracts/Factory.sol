// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "./DAO.sol";

contract Factory {
    DAO[] private DAOs;

    function createContract() external {
        DAO dao = new DAO(msg.sender);
        DAOs.push(dao);
    }

    // 조직의 인덱스가 있는지 검증
    modifier checkLength (uint index) {
        require(index < DAOs.length, "error index");
        _;
    }

    function getContract(uint index) external view checkLength(index) returns (DAO) {
        return DAOs[index];
    }
}
