// SPDX-License-Identifier: MIT
// 라이선스를 MIT로 지정하여 누구나 이 코드를 사용, 수정, 배포할 수 있음을 명시합니다.
pragma solidity 0.8.30;
// Solidity 컴파일러 버전을 0.8.30 이상으로 지정합니다. (참고: 2025년 7월 21일 현재 0.8.26이 최신 안정 버전이며, 0.8.30은 미래 버전일 수 있습니다. 실제 배포 시에는 사용 가능한 최신 안정 버전을 확인해야 합니다.)

import "./SmartAccount.sol";
// 같은 디렉토리에 있는 SmartAccount.sol 파일을 가져옵니다.
// SmartAccount.sol은 실제로 생성될 스마트 계정 컨트랙트의 구현을 담고 있습니다.

contract SmartAccountFactory {
    // SmartAccountFactory 컨트랙트를 정의합니다. 이 컨트랙트의 목적은 새로운 SmartAccount 컨트랙트를 배포하는 것입니다.

    address immutable entryPoint;
    // `entryPoint` 변수를 선언합니다. 이 변수는 변경 불가능(immutable)하며,
    // ERC-4337 표준에서 UserOperation을 처리하는 진입점(EntryPoint) 컨트랙트의 주소를 저장합니다.
    // `immutable` 키워드는 생성자에서 한 번만 설정되고 그 후에는 변경할 수 없음을 의미합니다.

    // create2의 방식
    // 이 주석은 이 팩토리가 `create2` opcode를 사용하여 컨트랙트를 배포할 것임을 나타냅니다.
    // 생성된 지갑의 내용을 저장
    // 이 주석은 각 EOA(소유자)에 대해 생성된 스마트 계정의 주소를 저장할 것임을 나타냅니다.
    // EOA하나에 하나의 스마트 계정만
    // 이 주석은 하나의 EOA가 하나의 스마트 계정만 가질 수 있도록 제한한다는 의도를 보여줍니다.
    mapping(address => address) private accounts;
    // `accounts` 매핑(mapping)을 선언합니다.
    // `mapping(keyType => valueType)`은 키(key)를 사용하여 값(value)을 조회할 수 있는 데이터 구조입니다.
    // 여기서는 EOA 주소(owner)를 키로, 해당 EOA가 소유하는 스마트 계정의 주소를 값으로 저장합니다.
    // `private`은 이 매핑이 컨트랙트 외부에서 직접 접근할 수 없음을 의미합니다.

    constructor(address _entryPoint) {
        // 컨트랙트가 배포될 때 한 번만 실행되는 생성자(constructor) 함수입니다.
        // 이 생성자는 ERC-4337의 EntryPoint 컨트랙트 주소를 인수로 받습니다.
        entryPoint = _entryPoint;
        // 인수로 받은 `_entryPoint` 주소를 `immutable` 변수 `entryPoint`에 할당합니다.
    }

    // create2 => 미리 실행시켜보고 결과를 받아서 사용할 수 있다. 컨트랙트 조회가 안됐다. 0x
    // 이 주석은 `create2`가 미리 컨트랙트 주소를 예측할 수 있음을 언급합니다. `0x`는 주소가 없거나 널(null) 주소를 나타냅니다.
    // 토큰 소유자 혹은 이더를 가지고 있었다. => 미리 CA를 호출해서 사용할수도 있다.
    // 이 주석은 `create2`로 예측된 주소에 미리 이더나 토큰을 보낼 수 있다는 점을 언급합니다.

    // 핵심이 지갑 생성 로직
    // 이 주석은 아래 `createAccount` 함수가 핵심적인 지갑 생성 로직임을 강조합니다.
    // owner userops를 생성해서 보내는 스마트 지갑의 소유자
    // 이 주석은 `owner`가 UserOperation을 생성하고 서명하는 스마트 계정의 실제 '소유자'임을 나타냅니다.
    function createAccount (address owner) external returns(address smartAccount) {
        // `createAccount` 함수를 정의합니다.
        // `external`: 이 함수는 컨트랙트 외부에서만 호출될 수 있습니다 (다른 컨트랙트나 EOA에 의해).
        // `address owner`: 생성될 스마트 계정의 소유자로 지정될 주소(보통 EOA)를 인수로 받습니다.
        // `returns(address smartAccount)`: 함수 실행 후 생성된 스마트 계정의 주소를 반환합니다.

        require(accounts[owner] == address(0), "Account already exists for this owner"); // 중복한 계정 생성 방지
        // `require` 문은 조건이 거짓일 경우 트랜잭션을 되돌리고 (revert) 오류 메시지를 반환합니다.
        // `accounts[owner] == address(0)`: 주어진 `owner` 주소에 대해 `accounts` 매핑에 이미 스마트 계정이 저장되어 있는지 확인합니다.
        // `address(0)`은 널(null) 주소(0x00...0)를 나타내며, 아무것도 할당되지 않았음을 의미합니다.
        // 즉, 이 소유자에 대해 이전에 계정이 생성되지 않았을 때만 진행하도록 하여, 중복 생성을 방지합니다.

        // type(SmartAccount).creationCode 생성자 제외하고 바이트 코드
        // 이 주석은 `type(SmartAccount).creationCode`가 `SmartAccount.sol` 컨트랙트의 배포 바이트 코드 중 '생성자를 제외한' 부분을 가져온다고 설명합니다.
        // 생성자 함수는 abi.encode(owner, entryPoint)
        // 이 주석은 SmartAccount 컨트랙트의 생성자에게 전달될 인자들이 `abi.encode(owner, entryPoint)`로 인코딩된다고 설명합니다.
        // 최종적으로 만들어지는 내용은 바이트코드 + 생성자 인자 인코딩
        // 이 주석은 최종 배포될 코드가 컨트랙트의 실제 바이트 코드와 생성자 인코딩이 합쳐진 형태임을 설명합니다.
        bytes memory bytecode = abi.encodePacked(type(SmartAccount).creationCode, abi.encode(owner, entryPoint));
        // `bytecode` 변수를 선언하고, `SmartAccount` 컨트랙트를 배포하기 위한 완전한 바이트 코드를 구성합니다.
        // `type(SmartAccount).creationCode`: `SmartAccount.sol` 컨트랙트의 배포 바이트코드(생성자 함수 코드 제외).
        // `abi.encode(owner, entryPoint)`: `SmartAccount` 컨트랙트의 생성자 함수에 전달될 `owner`와 `entryPoint` 인수를 ABI 인코딩한 결과입니다.
        // `abi.encodePacked(...)`: 이 두 바이트 배열을 빈틈없이 연결합니다. 솔리디티 컨트랙트 배포 시에는 '생성자 제외 바이트코드' 뒤에 '생성자 인코딩된 인수'가 붙습니다.

        // SmartAccount 배포할때 사용할 내용
        // 이 주석은 아래 `salt`가 SmartAccount 배포 시 사용될 것임을 설명합니다.
        // 계정을 만들때 포함할 salt 같은 값일때 같은 주소를 호출하는 일을 방지
        // 이 주석은 `salt`가 `create2`로 생성될 주소의 고유성을 보장하여 충돌을 방지하는 역할을 한다고 설명합니다.
        bytes32 salt = keccak256(abi.encodePacked(owner, block.timestamp));
        // `salt` 값을 생성합니다. `create2` opcode는 동일한 바이트코드를 배포하더라도 `salt` 값이 다르면 다른 주소를 생성합니다.
        // `keccak256(abi.encodePacked(owner, block.timestamp))`: `owner`의 주소와 현재 블록의 타임스탬프를 함께 해시하여 고유한 `salt` 값을 만듭니다.
        // `block.timestamp`는 매 블록마다 변하므로, 이를 사용하면 동일한 `owner`가 여러 번 `createAccount`를 호출해도 다른 `salt`로 다른 주소를 생성할 수 있습니다.
        // (참고: 여기서는 `require(accounts[owner] == address(0))` 때문에 한 `owner`당 하나의 계정만 생성되므로, `block.timestamp`가 `salt`의 고유성을 보장하는 데 결정적인 역할을 하지는 않지만, `salt` 값 자체를 예측하기 어렵게 만듭니다.)

        // create2 => 컨트랙트의 주소를 만드는 opcode
        // 이 주석은 `create2`가 새로운 컨트랙트의 주소를 결정하는 데 사용되는 이더리움 가상 머신(EVM) opcode임을 설명합니다.
        assembly {
            // 인라인 어셈블리 블록을 시작합니다. 어셈블리는 EVM의 로우 레벨 명령어를 직접 사용하여 최적화된 코드를 작성하거나 솔리디티로 직접 불가능한 작업을 수행할 때 사용됩니다.

            // create2 bytecode는 동적으로 배열 실제 내용이 32바이트 이후에 내용이 포함되어있기 때문에
            // 이 주석은 `bytecode` 변수가 동적 바이트 배열이며, 실제 데이터는 배열의 길이 정보(처음 32바이트) 뒤에 위치한다는 것을 설명합니다.
            // 데이터 시작 위치
            // 이 주석은 실제 바이트코드 내용의 시작 위치를 가리킵니다.
            // 배열의 32바이트 이후의 값을 가지고 내용으로 사용
            // 이 주석은 바이트코드 배열의 처음 32바이트(길이 정보)를 건너뛰고, 그 이후부터 실제 컨트랙트 바이트코드를 사용한다는 것을 다시 강조합니다.
            // salt 고유값으로 사용
            // 이 주석은 `salt`가 주소의 고유성을 보장하는 데 사용됨을 다시 한번 언급합니다.
            smartAccount := create2(0, add(bytecode, 32), mload(bytecode), salt)
            // `create2` EVM opcode를 사용하여 `SmartAccount` 컨트랙트를 배포하고, 그 주소를 `smartAccount` 변수에 할당합니다.
            // `create2(value, offset, size, salt)`:
            // - `value` (0): 배포될 컨트랙트에게 전송할 이더 양입니다. 여기서는 0 ETH를 전송하므로 `0`입니다. (스마트 계정에는 나중에 별도로 이더를 전송합니다.)
            // - `add(bytecode, 32)`: `bytecode` 변수의 메모리 주소에 32를 더합니다. 이는 바이트 배열의 처음 32바이트(배열의 길이 정보)를 건너뛰고, 실제 컨트랙트 바이트 코드의 시작 위치를 가리키게 합니다.
            // - `mload(bytecode)`: `bytecode` 변수가 저장된 메모리 위치에서 32바이트(0x20)를 로드합니다. 동적 바이트 배열에서 처음 32바이트는 항상 배열의 길이를 나타냅니다. 따라서 이는 배포할 바이트 코드의 '길이'를 전달하는 것입니다.
            // - `salt`: 위에서 계산된 `salt` 값입니다.

            if iszero(extcodesize(smartAccount)) { // 스마트 계정 여부 0x 배포 실패하면 리젝
                // `iszero(extcodesize(smartAccount))`: 배포된 `smartAccount` 주소의 코드 크기(extcodesize)가 0인지 확인합니다.
                // 컨트랙트가 성공적으로 배포되면 `extcodesize`는 0이 아닌 값을 반환합니다.
                // `iszero()`는 인수가 0이면 참을 반환합니다. 따라서 컨트랙트 배포가 실패하여 코드 크기가 0이면 이 조건은 참이 됩니다.
                revert(0,0)
                // 만약 `extcodesize`가 0이라면, 즉 스마트 계정 배포에 실패했다면, 트랜잭션을 되돌리고 실패합니다.
                // `revert(offset, size)`는 메모리에서 지정된 오프셋과 크기만큼의 데이터를 오류 메시지로 반환하며 리버트합니다.
                // `revert(0,0)`은 데이터를 포함하지 않고 트랜잭션을 리버트하는 가장 간단한 형태입니다.
            }
        }
        accounts[owner] = smartAccount;
        // 성공적으로 배포된 `smartAccount`의 주소를 `owner`에 대한 값으로 `accounts` 매핑에 저장합니다.
    }

    function getAccount (address owner) external view returns(address) {
        // `getAccount` 함수를 정의합니다.
        // `external`: 외부에서만 호출 가능합니다.
        // `view`: 이 함수는 컨트랙트의 상태를 변경하지 않고 단순히 읽기만 하므로 가스 비용이 들지 않습니다 (트랜잭션이 아님).
        // `address owner`: 조회할 스마트 계정의 소유자 주소를 인수로 받습니다.
        // `returns(address)`: 해당 소유자에 연결된 스마트 계정의 주소를 반환합니다.

        return accounts[owner];
        // `accounts` 매핑에서 `owner`에 해당하는 스마트 계정의 주소를 찾아 반환합니다.
    }
}