// SPDX-License-Identifier: MIT

pragma solidity 0.8.30;

contract Baseball {
    address immutable owner;

    // 상수constant
    uint private constant GAME_COUNT = 10;

    // wei
    uint private ticket = 0.01 ether;

    // 컴퓨터가 생성할 야구 숫자 번호 (3자리 숫자) (100~ 999)
    // 숫자를 따로 따로 저장한느게 로그를 찍을때 S B O 상태변수를 3가지
    uint private random;

    // 현재까지 게임을 시도한 횟수
    uint private progress;

    // 현재 게임에 모인 보상
    uint private reward;

    // 게임의 상태를 저장할
    enum GameState {
        playing, // 게임 플레이중 0
        gameOver // 게임 종료 1
    }

    // 현재 게임 상태
    GameState private gameState;

    // 이벤트
    // 게임 참가자의 주소랑 사용자가 입력한 로그 => 이 숫자는 아닙니다.
    event GameJoin(address indexed player, uint count);

    // 게임 정답을 맞췄을떄
    event GameReward(address indexed player, uint count, uint reward);

    constructor() {
        owner = msg.sender;

        // 랜덤값을 만들어야함
        // 랜덤 해시값을 만들어서 정수로 변환   
        //  해시값을 만드는 함수 솔리디티에서 랜덤값을 뽑을때 많이 사용한다. 매개변수를 sha-3의 해시값으로 만들어준다.
        // 매개변수로 전달한 값을 바이트 배열로 만들어주는 함수
        // 문제가 되었던 줄을 삭제: abi.encodePacked(a, v, g);
        
        random = uint(keccak256(abi.encodePacked(
            block.timestamp,
            block.coinbase,
            block.number
            )));
        // 정수형 변환한 값을 엄청 큰값이 도출된다.
        // 랜덤값의 길이를 가공해서 사용해야한다.
        // 엄청 큰수를 나눠서 숫자를 가공할 수 있다.
        // 100~999 최소값이 100 
        random = (random % 900) + 100; // 0 ~ 899
        
        // 게임 시작
        gameState = GameState.playing;
    }

    // 게임 시작
    // 티켓의 금액을 지불하고 게임을 참가
    function gameStart (uint count) external payable {
        require(gameState == GameState.playing, "game over");
        require(msg.value == ticket, "ticket value error");
        require(progress < GAME_COUNT);
        require(count >= 100 && count < 1000, "000 count value error");

        // 게임이 시도되면 횟수 증가
        progress += 1;
        
        // 정답자 발생
        if(count == random) {
            uint price = address(this).balance; // 계정의 이더의 잔액

            payable(msg.sender).transfer(price); // 지금까지 모인 이더를 정답자에게 송금 

            emit GameReward(msg.sender, count, price);

            // 게임 종료
            reward = 0;
            gameState = GameState.gameOver;
        }else{
            reward += msg.value;
            emit GameJoin(msg.sender, count);
        }
    }

    // 보상 조회
    function getReward() external view returns(uint){
        return reward;
    }

    // 게임 카운트 조회
    function getProgress() external view returns(uint) {
        return progress;
    }

    // 티켓의 금액을 조회
    function getTicket() external view returns(uint){
        return ticket;
    }

    // 관리자는 정답을 볼 수 있어
    function getRandom() external view returns(uint) {
        require(owner == msg.sender, "no owner");
        return random;
    }

    function isPlaying() external view returns(bool){
        return gameState == GameState.playing && progress < GAME_COUNT;
    }

    // 관리자가 게임을 다시 시작할 수 있다.
    // 실습
    // 방을 만들어서 게임을 다시 계속 열어주는 컨트랙트도 있고
    // 상위 컨트랙트
    // 새로운 컨트랙트 주소를 계속 만들어서 게임 방 만드는 것처럼 
    // 컨트렉트가 컨트렉트를 제어
}