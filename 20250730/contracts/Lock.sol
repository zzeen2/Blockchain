// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

contract Lock {
    // accountLockValue: 누가 얼마나 락업했는지 저장
    mapping(address => uint) public accountLockValue;
    uint public totalValue; // 전체 락업 금액
    
    // 잠금처리 한 애가 누구고 얼만큼 했는지 락업 이벤트
    event Locked(address indexed _account, uint _value);

    function lock() external payable { // 함수가 ETH를 수신할 수 있음
        require(msg.value > 0); // 입금한 금액이 있어야함 // 조건

        accountLockValue[msg.sender] += msg.value; // 상태 // 호출자의 락업 금액 증가
        totalValue += msg.value; // 전체 락업 금액 증가

        emit Locked(msg.sender, msg.value); // 호출(락업이벤트 발생시킴)(브릿지가 이걸 감지)
    } 

    // 지정된 주소(_account)의 락업된 _value만큼 ETH를 해제
    function unlock(address _account, uint _value) external {
        require(accountLockValue[_account] >= _value);

        accountLockValue[_account] -= _value;
        totalValue -= _value;  

        (bool ok,) = payable(_account).call{value : _value}(""); 
        require(ok); // 전송 실패시 트랜잭션 되돌림
    }
}