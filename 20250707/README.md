# 팩토리 패턴과 DAO
> 탈중앙화된 자율적으로 운영되는 조직 
> 전통적으로 단체나 조직은 중앙의 관리자가 의사를 결정하는데 
> DAO는 모두가 자율적인 단체의 중심으로 의사를 결정한다.
> 모든 의사결정은 토큰을 기반으로한 투표로 진행된다. (거버넌스 토큰)
> 자금을 컨트랙트로 조달해서 운영을 하는 방향성을 투표로 결정한다.

## DAO 배경과 역사
> DAO는 조직에서 발생하는 거버넌스 문제 자산의 남용 믿을 수 없다. 
> 기술(개념)으로 해결하려고 했고
> slock팀이 이더리움 스마트 컨트랙트로 DAO 제안했고 자금을 투자받아서 누구나 투표할 수 있도록 구성했다
> DAO 토큰을 구매하면 거버넌스 토큰 즉 의사결정에 투표할수 있는 권한을 얻을 수 있다.
> 스마트 컨트랙트 취약점이 발생해서 6000만 달라의 이더리움 탈취가 발생했다 THE DAO

## 이더리움의 해결방안
1. 소프트 포크 할거냐?
2. 하드 포크 할거냐? => 새로운 체인으로 분리
3. 아무것도 안할거냐?
4. DAO에서 해결할거냐?

> 이더리움은 하드포크를 결정했다 그래서 체인이 두가지로 나뉘게 되었다
> 이더리움 머지된 체인과 이더리움 클래식
1. 이더리움 : 사람들을 보호하는 것을 목표로 결정했다.
2. 이더리움 클래식 : 블록체인의 원칙에 절대적인 결정 지키는 것을 목적으로 결정했다.

> 이 두가지는 누가 잘못했다고 할 수 없고 절대성과 협상의 내용
> 을 가지고 DAO 탈중앙화는 규칙의 절대적인 적용이 아니고 커뮤니티의 합의와 균형 윤리 등을 결정하는데 성장을 했다. THE DAO의 해킹 사건은 이더리움의 성장과 탈중화가 단순한 기술이 아니라 공동체의 철학 선택의 내용이 많이 포함된 역사의 큰 분기점

## DAO (ERC 4970 형태의 제안)
> 자율성이 높은 컨트랙트이기 때문에 표준의 규칙성은 정해져있지 않다.
> 컨트랙트의 내용에 자율적인 내용이 많이 포함되기 때문에 표준으로 작성하지 않는다.
> 컨트랙트의 내용은 자율적
> 인정받기 위한 숙제가 아직까지 해결되지 않았다 법 관련된

1. 토큰
> DAO 의사결정에 참여할수 있는 권한을 거버넌스 토큰 ( erx 20, erc721 등) 토큰을 의사 결정에 참여할 사람에게 부여해서 권한을 준다.
> 거버넌스 토큰을 가지고 있으면 의사결정의 권한을 얻고 투표에 참여할 수 있다.

### 분산 자율 조직
> 중앙 집권식이 아닌 탈중앙화 조직의 규칙으로 운영되는 컨트랙트를 작성해서 컨트랙트에서 의사 결정 관리가 이루어진다.
> DAO 특징 4요소 분산화, 투명성, 자율성, 저항성 등 탈중앙화의 운영의 멤버들로 구성된 투표를 규칙을 정해서 컨트랙트에서 제어한다. 
> 거버넌스에 참여해서 승인 또는 거부를 할 수 있다.

### DAO의 진행

- 제안
- 멤버
- 제안(투표 시스템)
- 제안(유예)
- 실행(다수결, 제안을 실행)

### THE DAO 사건의 취약점
- 공격 컨트랙트를 호출해서 이더를 출금하는 메서드를 재귀적으로 요청을 통해 이더를 탈취했다. 상태변경이 이루어 지기 전에, 여러번 호출이 되어서 문제

### check-effects-intersections 패턴
> 단계별로 코드를 작성하는 규칙을 가지고 작성해야한다.
1. checks : 검증
2. effects : 상태변수 변환
3. interactions : 외부 컨트랙트 호출
> 컨트랙트의 코드를 작성하는 패턴
> 조건문 먼저 검증 호출하고 상태 전환 하고 이후에 외부 CA에 요청을 해라 
> 상태변수를 변경을 하고 나서 이더를 전송해야한다.
> 내부 컨트랙트 먼저 상태변환 호출하고 외부 컨트랙트 상태 변환 호출 이후에 이더 전송 호출 
이후에 이더 전송  호출 재진입 공격을 대비할 수 있다.

```Solidity

// import "./myInterset"

contract myBank {
    mapping (address => uint) balances;
    myInterSet _myInterSet;
    constructor(address _CA) {
        _myInterset = myInterset(_CA);
    } 

    recive() payable {
        balances[msg.sender] += msg.value;
        _myInterset.setInterset(msg.sender, msg.value);
    }
    function withdrawal(uint amount) payable {
        require(balances[msg.sender] >= amnount) // checks
        balances[msg.sender] -= amount; // 내부의 상태변수 전환 호출
        myInterset.getInterset(msg.sender, amount) // 외부 상태변수 전환과 이더 전송
        address payable (owner).transfer(amount); // 내부의 이더 전송

    }
}
// 은행 컨트랙트니까 이자를 줘야겠다.
contract myInterset {
    mapping(address => uint) balances;
    // 이자를 주기 위해서 누가 얼마를 입금했는지 기록
    function setInterset(address owner, uint _balance) external {
        balances[owner] += _balance;

    }
    // 이자가 쌓이는 시간은 안쓰고]
    function getInterset(address owner) external {
        // 이자를 주는 량
        uint interset = balance[owner] / 10;
        balances[msg.sender] -= _balance;
        address payable(owner).transfer(interset);

    }
}
```

### 목적
> 외부 컨트랙트를 호출해서 재진입 공격을 할 때 방지하기 위해서 사용하는 패턴
> 검증 -> 내부 컨트랙트 (상태변수 변경 완료) -> 외부 컨트랙트 호출

### 뮤택스 패턴(재진입 공격 방지를 위한 가드)
- 재진입 공격은 상태변수 변경 전에 메서드를 재귀적으로 호출해서 문제가 생겼던 것
- 방지할 값을 하나 만들어서 실행중이면 메서드를 호출할수 없게 만드는 것.

```Solidity

// import "./myInterset"

contract myBank {
    mapping (address => uint) balances;
    bool private lock; // 잠금 장치 가드의 값
    constructor() {
        lock = false; // 가드가 풀렸다.
    }
    function withdrawal() payable {
        require(!lock); // 가드 검증
        // 출금 검증 로직 검증
        lock = true;
        // 상태변수 변경
        // 이더전송
        lock = false; // 호출이 모무 정상적으로 진행되면 가드 비활성화
    }
}
```

### 컨트랙트의 가스비 절약을 위해서
### 조건문 논리 제어자
- 조건문의 재사용성을 높일 수 있다.

```Solidity
modifier onlyOwner () {
    require(msg.sender == owner);
    _; // 본문 위치 정해주는 문법
}

function ownerMint () public onlyOwner(msg.sender) {
    _mint();
}
```

### 팩토리 컨트랙트
> 스마트 컨트랙트에서 컨트랙트를 배포하는 로직을 작성하는 컨트랙트
> 공장 컨트랙트 인스턴스를 생성하는 컨트랙트

> 조직을 여러개를 생성할수 있는 컨트랙트
> DAO 컨트랙트를 팩토리 컨트랙트로 인스턴스 생성해서 
> 커뮤니티 생성 

```Solidity
import "./ERC721.sol";

contract FactoryNFT {
    ERC71[] Nfts =[];
    mapping(address => ERC721[]) Nfts;
    function createContract(string memory _name, string memory _symbol) {
        ERC721 newNFT = new ERC721(_name, _symbol);
        ERC721 newNFT = ERC721(address);
        // new ERC721(_name, _symbol); << 컨트랙트 배포 컨트랙트 생성(CA 주소 생성)
        //  ERC721 newNFT = ERC721(address); 이미 생성된 컨트랙트의 주소를 참조해서 ERC721 인스턴스 형변환 해서 사용
        // 컨트랙트 내에서 CA 생성 즉 새로운 컨트랙트 배포
        // 새로운 컨트랙트를 동적으로 생성해서 저장
        newNFT._mint();
        Nfts[0]._mint();
        Nfts[msg.sender][0]._mint();
    }
}
```

### 우리가 만들 DAO 컨트랙트
> 여러개의 DAO 조직을 만들 수 있고,
> 그 조직에 참여할 수 있는 참여자를 등록해서
> 투표에 참여
> 투표 종료후 승인 거부 여부를 체크

### 리믹스 IDE
> 이더리움 계열의 컨트랙트를 작성하고 배포 디버깅 할 수 있는 웹 기반 개발 환경을 제공한다.
> vscode의 작업 환경이 호환된다 즉 작업환경의 내용을 요청으로 보내서 커넥션 상태에서 작업을 진행할 수 있다.
> 저렴한 테스트환경 즉 빠르게 작업할때 필요한 테스트 환경을 제공한다. 
> 간단하고 빠른 테스트를 제공하는 웹기반 개발 환경
remixd -s <path-to-the-shared-folder> -u <remix-ide-instance-URL>
remixd -s . -u https://remix.ethereum.org