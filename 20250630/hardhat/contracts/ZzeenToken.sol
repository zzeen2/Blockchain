// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// 컨트랙트의 다중 상속 ERC20, Ownable
contract ZzeenToken is ERC20, Ownable {
    // 컨트랙트 배포자 // 계정 추상화 혹은 컨트랙트가 배포자인 경우
    //address owner;
    constructor(string memory name, string memory symbol) 
    ERC20(name, symbol) Ownable(msg.sender){
    
    }

    // 이더를 보내면 이더의 량에 맞는 토큰을 발행
    // 이더를 보냈을떄 토큰 이더라 0.001개 보내면 토근 100개를 받을 수 있게 비율을 지정한다.
    uint private rate = 100; // 이더리움 받으면 지급할 토큰의 비율 0.01개당 100개

    // 컨트랙트의 특수한 메서드
    // 컨트랙트 주소에서 이더를 전송받으면 호출되는 내장 메서드 => 특수한 메서드
    // receive 메서드는 컨트랙트가 이더를 받으면 호출되는 메서드
    // 컨트랙트가 이더를 수신하면 실행되는 특별한 함수 , function 키워드도 안씀
    receive() external payable {
        require(msg.value >= 0.01 ether, "Eth balance Error");
        // 최소 전달하는 이더가 0.1 이상 이어야 한다. 
        // 계산 토큰의 수 계산 보낸량에 비례해서 0.01당 100 토큰
        uint tokenValue = (msg.value * rate) / 1 ether * 100;
        // 토큰은 비율 계산 100개씩 단위
        _mint(msg.sender, tokenValue);
    }
    // 컨트랙트 배포자만 호출할 수 있는 함수
    function mint (address to, uint amount) external onlyOwner {
        // 배포자 이후의 검증 로직 작성
        _mint(to, amount);
    }

    // 컨트랙트 배포자가 이더를 회수할 수 있다.
    // 수익 창출
    function reward() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}

