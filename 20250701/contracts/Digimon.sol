// SPDX-License-Identifier: MIT

pragma solidity 0.8.30;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Digimon is ERC20 {
    uint private constant TOKEN_PRICE = 10 ether;
    // 디지몬 객체 형태
    struct Dig {
        string name;
        string url;
    }

    // 상품 나열할 상태변수
    Dig[] private Digimons;

    // 소유권을 표현할 상태변수
    mapping(address => Dig[]) private userDigimons;

    // 사용자가 디지몬을 뽑으면 이벤트 로그 기록
    event DigimonEvent (
        address indexed buyer,
        string name,
        string url
    );

    constructor (string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 100 * 10 ** decimals());
        Digimons.push(Dig("Gerbemon", "https://digimon.net/cimages/digimon/gerbemon.jpg"));
        Digimons.push(Dig("Hiwamon", "https://digimon.net/cimages/digimon/hanimon.jpg"));
        Digimons.push(Dig("Etemon", "https://digimon.net/cimages/digimon/metaletemon.jpg"));
    }
    // 내가 가지고있는 디지몬 조회
    function getMyDigimons() external view returns(Dig[] memory){
        return userDigimons[msg.sender];
    }

    // 전체 디지몬의 종류
    function getDigimons() external view returns(Dig[] memory) {
        return Digimons;
    }

    // 디지몬 뽑기
    function buyDigimon() external {
        require(balanceOf(msg.sender) >=TOKEN_PRICE);

        // 토큰 소각
        _update(msg.sender, address(0), TOKEN_PRICE);

        // 인덱스 가져오고 상태변수를 값복사 메모리 
        uint index = _random();
        // 뽑은 디지몬 변수 // memory 값만복사 // storagy 주소 복사
        Dig memory digimon = Digimons[index];

        userDigimons[msg.sender].push(digimon);

        emit DigimonEvent(msg.sender, digimon.name, digimon.url);
    }

    // 랜덤 인덱스 생성
    function _random() internal view returns(uint) {
        // block.prevrandao 작업 증명 관련된 랜덤 난수 생성
        // 예측을 할 수 없는 난수를 생성할때 효과적인 값을 제공한다.
        // 검증자 선택 등등의 값을 제공

        // 해시값을 uint로 변환하면 엄청 큰 수
        return uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao))) % Digimons.length;

    }
}