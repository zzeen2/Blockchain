// SPDX-License-Identifier: MIT

pragma solidity 0.8.30;

interface ISoonToken {
    function balanceOf(address account) external view returns (uint);
}

contract Paymaster {
    // 엔트리 포인트 주소
    // 토큰 량 확인할 해당 토큰의 주소
    // 화이트리스트에 추가할 오너 

    address public immutable entryPoint;
    address public immutable token;
    address public immutable owner;

    mapping(address => bool) public whiteList;

    // 토큰의 량이 일정량 있는지 검사할 상수
    // 가스비 최대량 대납자가 지출할 수 있는 가스비 한도
    uint constant TOKEN_AMOUNT = 10**18;
    uint constant MAX_COST = 0.01 ether;

    constructor(address _entryPoint, address _token) {
        entryPoint = _entryPoint;
        token = _token;
        owner = msg.sender;
    }

    // 엔트리포인트 검증
    // 컨트랙트 배포자 검증
    modifier onlyEntryPoint () {
        require(msg.sender == entryPoint);
        _;
    }

    // 화이트 리스트 추가 할때 검증
    modifier onlyOwner () {
        require(msg.sender == owner);
        _;
    }

    // 화이트리스트 추가
    function whiteListAdd (address account) external onlyOwner {
        whiteList[account] = true;
    }

    // 화이트리스트에서 제거
    function whiteListRemove (address account) external onlyOwner {
        whiteList[account] = false;
    }

    // 검증 로직 호출
    function validatePaymasterUserOp (address account, uint maxCost) external view onlyEntryPoint returns (bool) {
        // 유저가 화이트 리스트에 추가되어있는지 확인
        require(whiteList[account]);

        // 토큰량 확인
        uint balance = ISoonToken(token).balanceOf(account);
        require(balance >=TOKEN_AMOUNT);

        // 가스비 제한량 확인
        require(MAX_COST >= maxCost);

        return true;
    }
}