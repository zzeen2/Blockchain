// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

contract WrappedToken {
    string public name = "Wrapped ETH";
    string public symbol = "wETH";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // relayer만 호출할 수 있도록 구성 여러명의 경우 우리 화이트리스트 작성 mapping으로 표현
    address public relayer; // mint를 호출할 수 있는 주소

    constructor(address _relayer) {
        relayer = _relayer;
    }

    modifier onlyRelayer() {
        require(msg.sender == relayer);
        _;
    }

    function mint(address to, uint256 amount) external onlyRelayer   {
        balanceOf[to] += amount;
        totalSupply += amount;
    } 
}