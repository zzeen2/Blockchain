// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "./SmartAccount.sol";
// 스마트 계정을 직접 call 요청을 보내서 실행하기 위해서 컨트랙트 구조를 가져온것.

contract EntryPoint {
    // 스마트 계정의 실행 결과를 알려줄 이벤트 정의
    event UserOperationHandled(address indexed sender, bool success);
    // 대리 호출의 실행 결과 성공인지 실패인지

    // userops들을 관리하는 중앙 관리자

    // userops 객체를 구조체로 정의
    struct UserOPeration {
        address sender; 
        uint nonce;
        bytes initCode;
        bytes callData;
        uint callGasLimit;
        uint verificationGasLimit; 
        uint preverificationGas;
        uint maxFeePerGas;
        uint maxPrioityFeePerGas;
        bytes paymasterAndData;
        bytes signature; 
    }

    // 스마트 계정들의 논스값
    mapping(address => uint) public nonces;

    // handleOps 셀렉터
    function handleOps(UserOPeration[] calldata ops) external {
        // 작업이 여러개
        for (uint i = 0; i < ops.length; i++) {
            // 배열의 접근이 많아지면 주소 참조가 많이 일어난다.
            UserOPeration calldata op = ops[i];

            require(op.nonce == nonces[op.sender], "nonce error");
            // 직접 호출할 내용
            // 서명 검증하기 위한 해시값

            // 0x 페이마스터의 주소
            // paymaster 검증
            // 페이마스터 검증 데이터가 있다면
            // if 페이마스터가 없을수도 있다. 사용자가 실제 가스비를 가지고 있어서 본인이 가스비를 지불하는 요청
            // op.paymasterAndData.length >=20 앞에 20자리만 페이마스터 컨트랙트 주소
            // 이후는 0000....구분자 이후에 컨텍스트 내용
            if(op.paymasterAndData.length >=20) {
                address paymaster = address(bytes20(op.paymasterAndData));
                uint maxCost = op.callGasLimit * op.maxFeePerGas; // 대납자의 가스 최대량 가스당 단위 가스 가격
                (bool success,) = paymaster.call(
                    abi.encodeWithSignature("validatePaymasterUserOp(address,uint256)", op.sender, maxCost)
                );
                require(success);
            }

            // 서명 검증
            bytes32 _hash = _getUserOpHash(op);
            bytes32 ethSign = _toSignMessageHash(_hash);
            // 서명 검증 호출
            (bool success,) = op.sender.call(
                abi.encodeWithSignature(
                    "isValidSignature(bytes32,bytes)", // 함수의 형태를 정의
                    ethSign, // 매개변수 순서대로 서명 검증에 사용할 해시
                    op.signature // 서명의 값
                )
            );

            require(success, "isValidSignature erorr");

            // 대리 호출 로직
            // 스마트 계정 로직 호출
            // msg에 포함되는 값 {gas : op.callGasLimit}
            // 이더를 전송하는 내용과 함수 전송하는 내용을 같이 작성
            // 괄호는 실행되어야할 로직 전달
            (bool isActive, ) = op.sender.call{gas : op.callGasLimit}(op.callData);

            // 이벤트 로그로 작성
            emit UserOperationHandled(op.sender, isActive);

            // 작업이 됬으면 실패를 하더라도 이중 지불 혹은 이중으로 작업이 호출되지 않게
            nonces[op.sender]++;
        }
    }

    // 유저 작업을 해시하는 함수
    function _getUserOpHash (UserOPeration calldata op) internal pure returns (bytes32) {
        return keccak256(abi.encode(
            op.sender,
            op.nonce,
            keccak256(op.initCode),
            keccak256(op.callData),
            op.callGasLimit,
            op.verificationGasLimit,
            op.preverificationGas,
            op.maxFeePerGas,
            op.maxPrioityFeePerGas,
            keccak256(op.paymasterAndData),
            keccak256(op.signature)
        ));
    }

    // EIP 191 서명 검증 포멧 -> 이 형태로 포멧하는 이유는 확장프로그램 등 메타마스크 지갑에서 호환가능한 서명 검증 방식
    function _toSignMessageHash (bytes32 _hash) internal pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32", // 고정 프리픽스 EIP 191 표준 서명 방식
                _hash
            )
        );
    } 
}