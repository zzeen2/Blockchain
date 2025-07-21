// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "./SoonToken.sol";
//import "../node_modules/@openzeppelin/contracts/utils/Strings.sol";

contract MetaTransaction {
    SoonToken soonToken;

    constructor(address _CA) {
        soonToken = SoonToken(_CA);
    }

    function mint(address[] memory accounts,
        uint[] memory tokens,
        string[] memory messages,
        bytes[] memory signature) external {
            for (uint i = 0; i < accounts.length; i++) {
                // 서명 검증 이후 mint
                _signTransaction(accounts[i], messages[i], signature[i]);
                soonToken.mint(accounts[i], tokens[i]);
            }
    }

    // 서명 검증
    function _signTransaction (address account, string memory _msg, bytes memory signature) internal {
        // 서명 검증은 계정 공개키 원본 메시지 서명 => 서명을 검증
        // 메시지 + 개인키 => 서명 => 서명을 검증하기위해서는 공개키 + 메시지
        // EVM에서 서명검증을 하고 트랜잭션을 처리하는데
        // 상위의 트랜잭션 풀에있는 내용이 정상적인지 검증
        bytes32 ethSign = _getEthSignMessageHash(_msg);
        (bytes32 r, bytes32 s, uint8 v) = _splitSign(signature);
        // 공개키 복원 => 서명이 검증되었다.
        // 이더리움 서명 방식의 메시지 문자열을 전달하고 r,s,v값 추출해서 전달하면 공개키를 생성하는 함수
        // ecrecover(ethSign, v, r, s)
        require(account == ecrecover(ethSign, v, r, s));
    }

    // 검증을 하기위한 메시지를 가져와서 확인
    // 서명 검증을 하기위한 메시지의 형태를 만들어주는 함수
    function _getEthSignMessageHash (string memory _msg) internal pure returns(bytes32) {
        // 검증을 하기위해서는 해시값으로 변환하는데 앞에 메시지앞에 버전 정보를 포함시켜서 해시화
        // 버전 정보 이후에 메시지의 길이를 작성해줘야한다.
        uint msgLength = bytes(_msg).length;
        return keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n",
            Strings.toString(msgLength),
            _msg));
    }

    // 서명의 r,s,v 값을 추출
    function _splitSign(bytes memory sign) internal pure returns(bytes32 r, bytes32 s, uint8 v) {
        require(sign.length == 65);

        assembly{
            // 서명의 첫 32 바이트가 r 값
            r := mload(add(sign, 32)) // 메모리에 저장할건데

            s := mload(add(sign, 64)) // 32바이트를 제외하고 64바이트 까지가 s의 값

            v := byte(0, mload(add(sign, 96))) // 나머지 64바이트 이후부터 96바이트 값이 v
        }

        // EIP 155 재생성 공격 방지로 추가
        if(v < 27) {
            v += 27;
        }

        require(v == 27 || v == 28);
    }

}