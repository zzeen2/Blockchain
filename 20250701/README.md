# ethers, erc20 만들수 있는 컨트랙트 erc721의 선행 학습

### ethers의 개발 목적
> 비트코인이 2008년에 제안되고, 2015년에 이더리움이 제안되었고 Dapp을 개발할 때 즉 플랫폼 개발할 때 상호작용을 하기 위한 라이브러리 RPC 통신과 지갑의 서명을 다루는 라이브러리
> 초창기에는 web3가 유일한 라이브러리였다. 불안정했고, 업데이트가 느리다. 유지보수가 좋지않다. 
> 공식 이더리움 재단에서 관리를 하는 라이브러리 코드의 최적화 부분에서도 좋지 않았다.

### ethers 라는 라이브러리를 개발
> 이더스를 개발한 암호학자 richard moore
> web3를 사용하다가 불편한 점을 생각해서 직접 라이브러리를 개발
> 이더스 라이브러리를 개발할때 목표는 가볍고 안전하고 정리가 잘된 라이브러리
1. 웹앱에서 라이브러리의 사용이 가볍도록 제작
2. 문서가 정말 잘 정리되어있다.
3. 트랜잭션 서명 등 민감한 내용은 오픈소스로 코드를 공개해서 안전하게 검증
4. 명확한 메서드 명 사용자가 읽기에 쉬운 명명규칙
> 컨트랙트 개발자 커뮤니티에서 ethers의 인기가 상승하고 web3보다 버그 혹은 직관적인 명명규칙
> 다른 라이브러리와 호환이 좋았다.

> 현재는 노믹 파운데이션에서 유지보수 솔리디티 공식 문서를 관리하는 단체
> 수익구조는 없고 기부 기여자 중심으로 생태계 활성화를 위해서 

### ethers
> 이더리움 네트워크와 상호작용 할 수 있는 자바스크립트 라이브러리
1. 지갑 계정 생성
2. 스마트 컨트랙트 호출
3. 이벤트 감지
4. 블록과 계정 잔고 확인 

3가지로 간단하게 나누면
공급자 new Web3
서명자 wallet 
컨트랙트 abi, CA new web3.eth.Contract(abi, CA)

- 공급자
```js
const ethers = require("ethers");
const provider = new ethers.JsonProvider()
const provider2 = new ethers.BrowserProvider(window.ethereum)

//new Web3(window.ethereum)
//new Web3("http:")
// web3 할때 메타마스크 커넥션 객체
// 인퓨라 엔드포인트 커넥션 객체
```

- 서명자
```js
// 지갑 생성
const wallet = ethers.Wallet.createRandom(); // 새로운 지갑을 생성
// wallet 공개키 개인키
wallet.address
wallet.privateKey
// 지갑 생성 이후에 안전하게 개인키를 저장하고 있다가
// 개인키로 지갑 생성을 하게 되면
const wallet = new ethers.Wallet("개인키", "공급자")
// wallet 객체에 추상화 공급자를 통해서 서명을 전달하고 RPC 요청을 보낼 수 있는 메서드가 포함된 객체

// 서명자 객체로 트랜잭션 발생
const transaction = await wallet.sendTransaction({
    to : "받는 계정 주소"
    value : "보내는 이더량"
})
// 블록에 트랜잭션이 기록되어서 트랜잭션 처리 
// transaction 비동기 처리의 메서드가 제공된다
await transaction.wait();

```

- 컨트랙트
```js
const contract = new ethers.Contract("컨트랙트 주소", "abi", "서명자");
// 개인키 서명자 공급자의 엔드포인트 컨트랙트의 함수의 내용

// 컨트랙트의 이름 메서드 호출
contract name = await contract.name(); // 조회함수

// 토큰 전송
const transaction = await contract.transfer("받는사람주소", "토큰량")
// msg.sender 부분은 

// 이벤트 내용 조회
// on은 이벤트를 구독 즉 이벤트 호출마다 전달한 콜백함수를 호출시킨다
contract.on("이벤트 이름", (from, to, amount) => {
    console.log(from, to, amount)
}) 
```

### 랜덤 디지몬 뽑기
> erc20 토큰으로 디지몬을 뽑을 수 있다.

> 디지몬의 구조를 정의해서 사용할 것. => 구조체 객체의 형태를 정의
> 이미지 경로 url, 이름 디지몬의 이름 name 
{
    url
    name
}
nft에서는 ifps 분산 p2p 저장소에 저장된것을 사용

> 디지몬을 하나 구매하는데 토큰의 가격
> 10개 토큰을 지불하면 디지몬 뽑기 할 수 있다.

> 상품의 리스트 => 사람들에게 UI 적으로 표현할 수 있고 상품이 뭐가 있는지 랜덤한 인덱스를 뽑아서 어떤 상품을 사용자의 소유권으로 줘야하는지 데이터 

> 랜덤 뽑기를 했을 때 소유권을 저장해줄 상태변수
{
    address : [
        {
            url
            name
        }
    ]
}

조회 용도의 이벤트
{
    address
    name
    url
}

- 데이터 
가비지몬(Gerbemon) https://digimon.net/cimages/digimon/gerbemon.jpg
하니와몬(Hiwamon) https://digimon.net/cimages/digimon/hanimon.jpg
에테몬(Etemon) https://digimon.net/cimages/digimon/metaletemon.jpg

npx hardhat ignition deploy ignition/modules/DigimonModule.js --network sepolia

> 상품 리스트 보여주는거
> 뽑은 디지몬을 다른사람에게 소유권을 전달
> 필터기능 내 이력만 보이는것 그리고 상대방 이력들 전부 보이는것
> 다른 사용자가 유입됐을떄 토큰이 없어서 디지몬을 못뽑는다. => 다른 계정들이 컨트랙트에 이더를 송금하면 토큰을 발행 erc20
> 컨트랙트 배포자는 쌓여있는 이더를 다시 출금 가능 