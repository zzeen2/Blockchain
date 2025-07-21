// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "./SmartAccount.sol";

contract SmartAccountFactory {
    address immutable entryPoint;

    // create2의 방식
    // 생성된 지갑의 내용을 저장
    // EOA하나에 하나의 스마트 계정만
    mapping(address => address) private accounts;

    constructor(address _entryPoint) {
        entryPoint = _entryPoint;
    }

// create2 => 미리실행 시켜보고 결과를 받아서 사용할수있다. 컨트랙트 조회가 안됬다. 0x
// 토큰 소유자 혹은 이더를가지고 있었다. => 미리 CA를 호출해서 사용할수도 있다.

    // 핵심이 지갑 생성 로직
    // owner userops를 생성해서 보내는 스마트 지갑의 소유자
    function createAccount (address owner) external returns(address smartAccount) {
        require(accounts[owner] == address(0)); // 중복한 계정 생성 방지
        // type(SmartAccount).creationCode 생성자 제외하고 바이트코드
        // 이코드는 new로 컨트랙트 생성할때 사용할 바이트코드
        // 생성자 함수는 abi.encode(owner, entryPoint) 생성자에 들어갈 인자를 인코딩
        //  type(SmartAccount).creationCode, abi.encode(owner, entryPoint)
        // 최종적으로 만들어지는 내용은 바이트코드 + 생성자 인자 인코딩 값이 배열로 생성
        bytes memory bytecode = abi.encodePacked(type(SmartAccount).creationCode, abi.encode(owner, entryPoint));
        // SmartAccount 배포할때 사용할 코드내용
        // 계정을 만들때 포함할 salt 같은 값일때 같은 주소를 호출하는 일을 방지
        bytes32 salt = keccak256(abi.encodePacked(owner, block.timestamp));
        // create2 => 컨트랙트의 주소를 만드는 opcode
        assembly {
            // create2 bytecode는 동적으로 배열 실제 내용이 32바이트 이후에 내용이 포함되어있기 때문에
            // 데이터 시작 위치
            // 배열의 32바이트 이후의 값을 가지고 내용으로 사용
            // salt 고유값으로 사용
            smartAccount := create2(0, add(bytecode, 32), mload(bytecode), salt)
            if iszero(extcodesize(smartAccount)){ // 스마트 계정 여부 0x  배포 실패하면 리젝
                revert(0, 0)
            }
        }
        accounts[owner] = smartAccount;
    }

    function getAccount (address owner) external view returns(address) {
        return accounts[owner];
    }
}