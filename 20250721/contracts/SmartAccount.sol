// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

contract SmartAccount {
    address owner;
    address entryPoint; // => handleOps

    constructor(address _owner, address _entryPoint) {
        owner = _owner;
        entryPoint = _entryPoint;
    }

    modifier onlyEntryPoint() {
        require(msg.sender == entryPoint);
        _;
    }

    modifier onlyOwner(address _owner) {
        require(owner == _owner);
        _;
    }

    // 핵심 함수
    function execute(address to, uint value, bytes calldata data) external onlyEntryPoint {
        // address to 호출할 주소 => 컨트랙트 주소 혹은 EOA
        // data => 호출할 주소가 컨트랙트일 경우 로직의 실행 내용이 포함되어있다.
        // value 전달하는 이더의 량
        // 해당 주소에 call 메시지 전송 {} 메시지에 포함되는 내용 추가 value
        // msg 객체에 value 값이 전달 => 컨트랙트에 바이트 코드 전달
        // 컨트랙트의 로우 레벨 문법
        // 함수 호출
        // to에 메시지를 전달해서 to.call
        // 낮은 수준으로 작성한 함수의 내용
        (bool success,) = to.call{value : value}(data);
        // 내부 트랜잭션을 발생 시키는 것.
        require(success);
    }

    function isValidSignature(bytes32 _hash, bytes calldata sig) external view returns (bool) {
        address recovered = _recoverSigner(_hash, sig);
        return recovered == owner;
        // 서명 검증 방식 확장성
    }

    function _recoverSigner(bytes32 _hash, bytes memory sig) internal pure returns (address) {
        // 공개키로 복원
        (bytes32 r, bytes32 s, uint8 v) = _splitSign(sig);
        // ecrecover 공개키 복원 함수
        return ecrecover(_hash, v, r, s);
    }

    // r s v
    // bytes32 r, bytes32 s, uint v 변수명 정해놓고 작성을 하면 최종적으로 코드 종료 이후에 반환된다,
    function _splitSign (bytes memory sig) internal pure returns(bytes32 r, bytes32 s, uint8 v) {
        // 정상적인 서명의 값인지 확인
        require(sig.length == 65);
        assembly{
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

    // 컨트랙트에 이더를 받기위해서
    receive() external payable {}
}