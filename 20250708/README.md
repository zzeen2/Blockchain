# 프록시 패턴
> 컨트랙트를 배포했는데
> 컨트랙트를 업데이트 하고싶지만 불변성을 가지고 있는 컨트랙트는 수정이 불가능하다.
> 이더리움의 스마트 컨트랙트는 코드의 내용도 데이터다 그래서 한번 배포하면 변경이 불가능하다.
> 블록체인의 불변성의 특징을 가지고 있기 때문에

## 불변성의 컨트랙트를 프록시 패턴으로 해결
> 프록시 패턴은 컨트랙트의 상태와 로직을 분리해서 로직을 교체할 수 있는 컨트랙트로 만드는 가장 기본적인 업그레이드 방식

> 클라이언트 -> 프록시 컨트랙트(상태) -> (대리 호출) -> 로직 컨트랙트(로직)

### EVM 구조
> EVM 스택 기반의 가상 머신
> LIFO 연산을 하는 스택 기반의 머신
> 예를 들어서 2 3 ADD -> 3 + 2 = 5


## inline assembly 최적화 도구
> 솔리디티는 고급 언어이고 복잡하거나 최적화 즉 주소의 값이나 가스에 접근을 하기 위해서는 저수준 언어인 inline assembly를 사용해서 최적화 할 수 있다.
```Solidity
// let 변수의 이름 선언 해서 주소를 표현
// := 할당 연산자
assembly (
    let result := add(1,2);
    mstore(0, result); // 0번주소에 result 주소 저장
    return (0, 32);
)
```

### assembly 
> 솔리디티는 고수준 언어 즉 우리가 보기 쉬운 형태의 언어다. 이 코드는 컴파일되어서 EVM에서 실행이 될 때 바이트 코드로 변환해서 실행시킨다. (EVM OP 코드)
> 이런 바이트 코드를 직접 사용해야하는 경우가 발생할 수 있는데, 이부분은 메모리의 영역을 직접 조작해야하는 경우
> 가스 최적화, 스토리지 슬롯의 메모리 영역에 직접 참조. delegate call의 저수준 대리호출 명령을 할 때

## EVM assembly 정리
1. 솔리디티 코드는 고수준 언어 사람이 읽고 작성하기 위한 언어
2. assembly 코드는 EVM에서 실행하는 바이트 코드 즉 저수준 언어와 가까운 언어. 컨트랙트 내에서 작성할 수 있다.

컨트랙트 -> opcode 나열, 변환 => 바이트 코드 기계어로 변환해서 실행

```Solidity
assembly(
    // 여기에다가 op코드 내용 작성
)

// uint
// bytes32 바이트 문자열 32바이트 만큼 사용하는 타입
function getSlot() public view returns (bytes32 value){
    assembly(
        value := sload("admin_slot"); // 특정 저장되어있는 슬롯의 이름으로 접근해서 슬롯에 있는 데이터를 참조한다.
    )
}

// sload : 스토리지의 값을 읽어온다
// sstore(slot, value) : 스토리지에 값을 저장
// mload : 메모리에 저장된 값을 읽어온다.
// mstore : 메모리가 값을 저장
// calldataload : 호출 데이터의 값을 참조
// delegatecall : delegatecall 로직의 대리 호출을 사용한다.
// return(ptr, size) : 특정 메모리의 영역의 값을 반환
// revert(ptr, size) : 특정 메모리의 영역의 에러의 값으로 반환

```

### EVM 중요성
- EVM은 스택 머신 즉 push -> pop이 가능한 데이터의 구조를 가지고 있다.
> 어셈블리 코드를 작성해서 low level의 언어로 코드를 작성할 수 있다.
> 메모리나 스토리지에 직접 접근이 가능하다.
> 가스비 절감의 장점. 그리고 코드를 보는 시각이 opcode 즉 evm의 명령어 순서로 볼 수 있을때 장점을 가질 수 있다.

### 프록시 컨트랙트로 카운터를 업데이트
```Solidity

contract Count {
    uint count = 0;
    function increment () public {
        count +=1;
    }
}

// CA주소를 또 배포해서 여기로 호출
contract CountV2 {
    uint count = 0;
    function increment () public {
        count +=1;
    }

    function decrement () public {
        count += 1;
    }
}

contract Proxy { // 상태 변수 저장소
    // 대리호출을 할 주소
    address public implementation; // 대리호출할 컨트랙트의 주소 (로직 컨트랙트)
    uint count = 0; // 버전업이 되어도 값이 유지된다.
    constructor (address implementation) {
        implementation = _implementation;
    }

    // 이더를 전송을 받았을때
    recive()

    // fallback
    // 내가 트랜잭션으로 함수를 호출했는데 함수 내용이 없어서 실패한 경우 함수의 내용이 없었다는 것이므로 프록시 컨트랙트에서는 fallback이 호출됐을때 대리호출을 시켜서 로직 대리호출이 정상적으로 호출되면 상태 업데이트를 시키면 된다.
    // msg.data == 0x함수이름해시값000000000매개변수
    fallback() external payable{
        require(implementation != address(0))
        assembly(
            // 데이터를 복사해야하는데 어디서? 호출 내용을 calldatacopy로 복사해서 사용
            // 데이터의 내용을 사이즈만큼 복사해서 가지고있고, 이 데이터가 호출의 내용의 데이터이기 때문에, 이 데이터를 가지고 대리호출을 할 것
            calldatacopy(0, 0, calldatasize());
            // 0주소에 첫번째 데이터부터 마지막 데이터까지 복사
            // 메모리에 가지고 있는다

            // 대리호출
            // 대리호출의 결과를 담을 변수
            // 인자 값의 순서
            // 트랜잭션을 처리할 수 있는 가스량
            // 로직 컨트랙트의 주소
            // 복사한 호출데이터 시작
            // 복사한 데이터 참조를 위해서 사이즈의 값 만큼 
            // 마지막으로 반환값을 반환의 위치와 값의 크기를 지정을 한다.
            // 대부분 0,0준다
            let result := delegatecall(gas(), implementation, 0, calldatasize(), 0, 0)
            // 대리호출 성공하면 1의 값을 반환
            // 대리호출 실패하면 값을 0

            // 성공했을때 실패했을때
            switch reult
            case 0 {
                // 대리호출 실패 했을때
                // returndatasize 반환받은 데이터의 사이즈를 반환 오류내용으로
                revert(0,returndatasize())
            }
            default {
                // 대리호출 성공 했을때
                return (0, returndatasize())
            }
        )
    }

    // count v2로 바꾼다
    function setImplementation (address _CA) external {
        implementation = _CA; // 상태변수 변경 

    }
}
```

1. 카운트 컨트랙트 배포
2. 프록시 컨트랙트 배포 카운트 컨트랙트 주소 전달
3. 프록시 컨트랙으에 트랜잭션을 보내는데 어떻게 카운트 컨트랙트의 abi 주소를 가지고 요청 주소는 프록시 컨트랙트 (abi는 카운트 컨트랙트) (왜..?)
4. 프록시 컨트랙트의 상태변수가 변경된다.
5. 카운트 버전 2를 배포하고
6. 프록시 컨트랙트에 카운트 버전 2의 주소를 전달
7. 카운트 버전 2 abi로 프록시 컨트랙트 주소를 가지고 마이너스 호출