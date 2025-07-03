// SPDX-License-Identifier: MIT

pragma solidity 0.8.30;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Digimon is ERC20 { // erc20토큰 상속받음 
    uint private constant TOKEN_PRICE = 10 ether; // 디지몬 뽑기 1회에 필요한 토큰은 10개
    
    // 디지몬 객체 형태
    struct Dig {
        string name; // 디지몬 이름
        string url; // 디지몬 이미지 주소
    }

    // 상품 나열할 상태변수
    Dig[] private Digimons; // Dig : 배열에 저장할 데이터 타입( 각 배열의 요소가 Dig 형태이다), Digimons: 배얼 이름
    /**
        Digimons = [
            {name: "Gerbemon", url: "https://digimon.net/cimages/digimon/gerbemon.jpg"},
            {name: "Hiwamon", url: "https://digimon.net/cimages/digimon/hanimon.jpg"}, 
            {name: "Etemon", url: "https://digimon.net/cimages/digimon/metaletemon.jpg"}
        ]
     */

    // 소유권을 표현할 상태변수
    mapping(address => Dig[]) private userDigimons;

    /**
    userDigimons = {
        "0x1234...": [
                {name: "Gerbemon", url: "https://digimon.net/cimages/digimon/gerbemon.jpg"},
                {name: "Etemon", url: "https://digimon.net/cimages/digimon/metaletemon.jpg"}
            ],
        "0x5678...": [
            {name: "Hiwamon", url: "https://digimon.net/cimages/digimon/hanimon.jpg"}
        ],
        "0x9999...": [] // 빈 배열 (디지몬 없음)
        }
     */

    // 사용자가 디지몬을 뽑으면 이벤트 로그 기록
    event DigimonEvent (
        address indexed buyer,
        string name,
        string url
    );

    constructor (string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 100 * 10 ** decimals()); // 배포자에게 100개의 토큰을 발행 
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
        require(balanceOf(msg.sender) >=TOKEN_PRICE); // 내 토큰이 10개 이상 있는지 확인

        // 토큰 소각 ( 토큰을 지불하고 뽑기를 하는 개념 )
        // _update(): ERC20 토큰의 내부 함수 (잔액 업데이트)
        _update(msg.sender, address(0), TOKEN_PRICE); // 10개의 토큰을 없앰

        // 인덱스 가져오고 상태변수를 값복사 메모리 
        uint index = _random(); // 랜덤함수 호출. 반환값 0,1,2 중에 하나

        // 뽑은 디지몬 변수
        // Digimons[index]: 배열에서 해당 인덱스의 디지몬 가져오기
        // Dig memory: 메모리에 임시로 저장 (값 복사)
        // memory: 함수 실행 중에만 존재, 함수 끝나면 사라짐
        /**
        // index가 1이라면
            Digimons[1] = {name: "Hiwamon", url: "https://digimon.net/cimages/digimon/hanimon.jpg"}

            // digimon 변수에 저장
            digimon = {name: "Hiwamon", url: "https://digimon.net/cimages/digimon/hanimon.jpg"}
         */
        Dig memory digimon = Digimons[index]; 

        userDigimons[msg.sender].push(digimon); // userDigimons 객체 안에 있는 msg.sender주소와 같은 인덱스를 가져와서 그 배열 안에 넣음 

        emit DigimonEvent(msg.sender, digimon.name, digimon.url); // 누가 어떤 디지몬을 뽑았는지 기록
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