// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

contract Bank {
    // 지갑의 관리자
    // 변수의 불변성
    // 할당기준으로 절대 변하지 않는 변수
    address public immutable owner; // piblic으로 만든 상태변수는 get과 set이 생성된다. 

    // 입금한 계정들
    mapping(address => uint) private balances; // private으로 하면 get set을 호출할 수 없다.
    // 관리자가 출금 제한을 한 내용
    mapping(address => uint) private balancesLimits;

    // 이벤트 로그 => 기록하는 용도로 상태변수로 표현
    // 입금하는 주소와 입금 금액을 로그로 기록하기 위한 이벤 트
    event DepositEn(address indexed account, uint amount); // 입금
    event WithdrawalEn(address indexed account, uint amount); // 출금
    event SetLimitEn(address indexed account, uint Limit);

    constructor () {
        owner = msg.sender;
    }
    // 입금함수
    function deposit() external payable {
        require(msg.value > 0);
        balances[msg.sender] += msg.value; // 입금된 이더량 

        emit DepositEn(msg.sender , msg.value); // 입금 이벤트 기록
    }       
    // 출금함수 withdrawal (uint amount) external payable 함수에 작성을 하면 함수에서 이더를 받을 수 있다. 
    function withdrawal (uint amount) external payable {
        require(amount > 0);
        require(amount <= balances[msg.sender]);
        // 출금 할때 // 출금 제한을 걸어서 얼마만큼 출금할 수 있는지 
        require(amount < balancesLimits[msg.sender]);

        balances[msg.sender] -= amount; // 상태변수의 잔액의 량이 줄어든다.

        // 출금은 이더를 보내줘야 한다. 
        // address 보내줄 주소 
        // 컨트랙트에서 이더를 보내줄 주소 
        // payable 해당 지갑 주소로 송금할 수 있는 객체 
        // payable 지갑주소를 할당해서 형변환
        // address payable account = payable(msg.sender)
        // 컨트랙트 내에서 지갑에 이더를 송금
        // 1000000000000000000wei = 1 ether
        // 기본 보내는 이더단위
        payable(msg.sender).transfer(amount);
        emit WithdrawalEn(msg.sender , msg.value);
    }

    // 관리자가 출금 한도를 설정
    function setLimt(address account, uint amount) external {
        balancesLimits[account] = amount; // 한번 출금할때 한도
        emit SetLimitEn(account, amount);
    }

    // 본인의 잔액 조회 저금해놓은 잔액
    function getBalance() external view returns(uint) {
        return balances[msg.sender];
    }

    function getLimit () external view returns(uint) {
        return balancesLimits[msg.sender];
    }

    function getContractBalance () external view returns(uint) {
        
        return address(this).balance;
    }
}