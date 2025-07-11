# Hardhat
> 하드햇은 이더리움 스마트 컨트랙트 개발에 사용되는 프레임워크 도구 (트러플 하드햇 파운드리)
> 하드햇은 노믹 비영리 단체에서 만든 오픈소스 프레임워크 트러플 보다 가볍고 사용이 편하게 되어있다.
> 이더 워커스 개발자의 커뮤니티에서 부터 시작된 프로젝트
> 수익은 따로 없지만, 파트너쉽 등을 제공받고, 사회에 기여하고 있다.
> 오픈 재플린 알케미 등등 기업에서 파트너쉽을 하고 있다.
> 체인 링크 스폰서

### hardhat을 사용하는 목적
> 이더리움 스마트 컨트랙트 개발에서 필요한 테스트코드 혹은 배포 환경을 구축하는데 사용할 수 있다.
> 프레임워크 형태로 제공한다.
> 하드햇 네트워크 로컬에서 가상의 이더리움 노드를 실행시켜서 메모리에 잠시 블록 생성을 하는 테스트 로직을 제공한다. 가스비가 들지 않는 테스트가 가능하다. 하지만 로컬에서만
> 배포 스크립트를 작성해서 배포 로직을 추상화 시킬 수 있다.
> 플러그인 사용 가능 web3나 ethers같은 플러그인을 사용할 수 있다. 
> 테스트 환경이 기본으로 제공되어서 스마트 컨트랙트 함수의 로직을 작성해서 단위 테스트를 진행할 수 있다.
(모카) + (차이) 환경을 제공한다.
> 모카 : 자바스크립트로 작성된 비동기 테스트 러너를 제공한다. describe랑 it 등 구문으로 테스트 블록 작성 가능.
> 차이 : 테스트 어서션 라이브러리 expect 비교할때 메서드 제공

```js
describe("블록 테스트", () => {
    it("블록 생성", () => {

    })
})
```

### 하드햇 설치
```sh
mkdir hardhat
npm init -y
npm install -D hardhat @nomicfoundation/hardhat-toolbox
npx hardhat
```

### 폴더 구조
> contracts : 컨트랙트 파일 작성 폴더
> ignition/modules : 모듈식 배포 코드 컨트랙트의 내용의 abi bin 컴파일 해서 만든 내용을 가지고 배포 로직을 실행하는 모듈 시스템 환경의 코드 작성
> test : 컨트랙트 테스트 코드 작성. 가상의 네트워크의 환경에서 테스트 로직 실행가능

### 컨트랙트 내용 작성
> 이전에 배운 erc20 표준 토큰을 내가 작성하는 컨트랙트에 상속 시켜서 로직을 작성할 것
> 사용자가 이 erc20을 상속받은 컨트랙트에 이더를 보내면 비율에 맞게 토큰을 발급하도록 작성할 것.
> 사용자간의 토큰을 전송할 수 있는 컨트랙트

### Infura RPC 엔트포인트 제공
> 인퓨라는 블록체인 네트워크 중에서 이더리움 IPFS 등의 접근 REST API를 제공한다.
> Json-Rpc api를 제공한다. AWS에서 클라우드 호스팅 서비스 이용하던 것처럼 node 호스팅 서비스를 제공한다. 우리가 노드를 실행하지 않아도 인퓨라에서 제공하는 호스팅 노드를 통해서 네트워크 전파를 할 수 있다. 즉 인퓨라는 우리의 네트워크 배포나 RPC 호출 로직에서 중간 계층

### 특징
1. 자체 노드 운영 : 호스팅을 제공한다.
2. 고가용성 api를 구축 : 인퓨라를 사용할 때 인프라가 잘 구성되어있어서 속도가 빠르다. 웹소켓 제공
https 방식 지원
3. 메테마스크도 사용하는 엔드포인트 : 우리가 이전에 사용한 메타마스크도 엔트포인트로 인퓨라를 사용
4. 인퓨라는 풀 노드 api를 제공 : 우리가 설치를 받지 않아도 풀노드를 사용할 수 있다. 

> 기업에게 수익을 얻는 구조 아니면 유료 사용자

### 하드햇 컴파일 및 배포
> 컴파일 :  npx hardhat compile
> 컴파일 이후 배포진행 : npx hardhat ignition deploy ignition/modules/ZzeenTokenModule.js --network sepolia

> ZzeenTokenModule.js 에서 내보낸 모듈을 가져와서 컴파일 이후 
> .contract("ZzeenToken", ["ZzeenToken", "STK"]); 로직을 실행
> 지정한 네트워크에서 요청해서 배포를 진행
> 터미널에 콘솔로 배포한 컨트랙트 주소 출력 

### 폴더 구조
1. deployments/<네트워크 아이디> : 어떤 네트워크인지 빌드 파일인지
2. artifacts : 배포한 컨트랙트의 abi 메타 데이터를 포함한 json 파일들
3. build-info : 배포된 컨트랙트의 이름과 주소를 키값으로 저장
4. journal.jsonl : 배포가 진행되고 로글를 확인할 수 있는 기록
                    각 배포과정의 이벤트를 포함하고, 실패의 원인이나 디버깅을 할 수 있는 로그를 저장한다.

### test 코드 작성 (web3) 스크립트 (ethers)
> test 코드는 로컬에 이더리움 가상 네트워크를 가지고 사용하는 형태로 테스트 코드 작성
> script라는 폴더에 프론트에서 작업하는 것처럼 퍼블릭 네트워크에 요청 보내서 로직 작성 ethers
> web3는 기초의 내용이 많이 포함된 라이브러리
> ethers는 모던한 내용의 라이브러리
> web3는 철학이 라이브러리 모든 기능을 대형의 라이브러리 구조로 작성 내용이 무겁다.
> ethers는 철학이 작고 가볍게 개발자가 사용할때 최대한으로 의존성을 제공한다.


### sol파일 작성 -> hardhat -> 컴파일 -> 배포 -> 엔드포인트(인퓨라)(풀노드 가지고있음) -> 네트워크 전파 -> web2환경에서 인퓨라에 트랜잭션 보낼 수 있음 (call, send)
