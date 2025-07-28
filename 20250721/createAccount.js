const {ethers, keccak256, toUtf8Bytes, solidityPacked} = require("ethers");
// ethers.js 라이브러리에서 필요한 모듈들을 불러옵니다.
// - ethers: 이더리움과 상호작용하기 위한 핵심 라이브러리입니다.
// - keccak256: 데이터를 해시하는 데 사용되는 Keccak-256 해싱 함수입니다.
// - toUtf8Bytes: 문자열을 UTF-8 바이트 배열로 변환하는 유틸리티입니다. (이 코드에서는 직접적으로 사용되지 않습니다.)
// - solidityPacked: 여러 값을 하나의 바이트 문자열로 압축하여 Solidity의 `abi.encodePacked`와 유사하게 동작하도록 합니다.

const createPrivateKey = (email, salt, domain) => {
    // 사용자의 이메일, 솔트(salt), 도메인을 기반으로 "개인 키"를 생성하는 함수를 정의합니다.
    // 여기서 생성되는 것은 전통적인 암호화 개인 키라기보다는, 특정 계정을 결정적으로 생성하기 위한 시드(seed) 값에 가깝습니다.
    const id = `${domain}:${email}`; // 이메일을 사용하는 해당 사이트와 이메일의 내용
    // 도메인과 이메일을 결합하여 고유한 식별자 문자열을 생성합니다. 이는 특정 플랫폼에서 사용자의 신원을 나타냅니다.

    const value = solidityPacked(["string", "string"], [salt, id]).slice(0, 64);
    // `salt`와 생성된 `id`를 Solidity의 packed 인코딩 규칙에 따라 하나의 문자열로 묶습니다.
    // `.slice(0, 64)`는 결과 문자열의 길이를 64자로 제한하려고 시도합니다.

    const privateKey = keccak256(value).replace("0x", "").slice(0, 64);
    // `value`의 Keccak-256 해시를 계산합니다.
    // `.replace("0x", "")`는 해시 값의 "0x" 접두사를 제거합니다.
    // `.slice(0, 64)`는 16진수 해시의 처음 64자리(32바이트)를 취합니다. 이는 이더리움 개인 키의 표준 길이(256비트)입니다.
    return `0x${privateKey}`;
    // "0x" 접두사가 붙은 생성된 개인 키 문자열을 반환합니다.
}

const email = "soon@gmail.com";
// 개인 키 생성에 사용될 예시 이메일 주소를 정의합니다.

const privateKey = createPrivateKey(email, "soon", "oauth:google");
// `createPrivateKey` 함수를 호출하여 이메일, 솔트("soon"), 도메인("oauth:google")을 사용하여 결정론적인 개인 키를 생성합니다.

const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/c36ac18d957a4f46aa6b893c058c4bbd");
// Infura를 통해 Sepolia 테스트넷에 연결하는 ethers.js JSON RPC 프로바이더를 초기화합니다. 이를 통해 이더리움 네트워크와 상호작용할 수 있습니다.
const wallet = new ethers.Wallet(privateKey, provider);
// 생성된 `privateKey`에서 파생된 외부 소유 계정(EOA)을 나타내는 ethers.js `Wallet` 인스턴스를 생성합니다.
// 이 지갑은 트랜잭션을 보내고 블록체인을 쿼리하기 위해 `provider`에 연결됩니다.
console.log("주소 : ",wallet.address);
// 생성된 EOA의 이더리움 주소를 콘솔에 출력합니다.
console.log("개인키 : ",wallet.privateKey);
// 생성된 EOA의 개인 키를 콘솔에 출력합니다.

(async () => {
    // 비동기 즉시 실행 함수 표현식(IIFE)을 정의하여 비동기 작업을 수행합니다.
    const balance = await provider.getBalance(wallet);
    // 생성된 EOA의 현재 이더리움 잔액을 조회합니다.
    console.log("잔액 : ", ethers.formatEther(balance))
    // 조회된 잔액을 이더(ETH) 단위로 포맷하여 콘솔에 출력합니다.
})();

const CA = "0x1E3A8AD5CD1EEd8f072a4a169f65cc437dFb9c2D";
// 계정 팩토리(Account Factory) 컨트랙트의 주소를 정의합니다. 이 팩토리 컨트랙트는 새로운 스마트 계정을 배포하는 역할을 합니다.
const abi = [
    // 계정 팩토리 컨트랙트의 ABI(Application Binary Interface)를 정의합니다.
    // ABI는 컨트랙트의 함수와 이벤트에 대한 정보를 제공하여 JavaScript에서 컨트랙트와 상호작용할 수 있도록 합니다.
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_entryPoint",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    // 생성자 함수는 `_entryPoint` 주소를 인수로 받습니다. 이는 ERC-4337의 진입점(EntryPoint) 컨트랙트 주소를 나타냅니다.
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "createAccount",
        "outputs": [
            {
                "internalType": "address",
                "name": "smartAccount",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    // `createAccount` 함수는 `owner` 주소를 받아 새로운 스마트 계정을 생성하고 해당 주소를 반환합니다.
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "getAccount",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]
// `getAccount` 함수는 `owner` 주소에 연결된 기존 스마트 계정의 주소를 조회합니다. `view` 함수이므로 상태를 변경하지 않습니다.
const factory = new ethers.Contract(CA, abi, wallet);
// `factory` 상수는 계정 팩토리 컨트랙트와의 상호작용을 위한 ethers.js `Contract` 인스턴스입니다. 
// `CA` (컨트랙트 주소), `abi` (컨트랙트 ABI), `wallet` (트랜잭션 서명을 위한 EOA)를 사용하여 초기화됩니다.
// eth이더가 없어 수수료를 지불하지 못해
// 이 주석은 EOA에 이더리움 잔액이 부족하여 트랜잭션 수수료를 지불할 수 없다는 것을 나타냅니다.
// 대납자가 대신 지불을 해줘야하고
// 이 주석은 번들러(Bundler)나 페이마스터(Paymaster)와 같은 대납자(Relayer)가 수수료를 대신 지불해야 한다는 ERC-4337의 개념을 언급합니다.

const createSmartAccount = async () => {
    // 스마트 계정을 생성하는 비동기 함수를 정의합니다.
    const owner = wallet.address;
    // 이전에 생성된 EOA의 주소를 스마트 계정의 '소유자(owner)'로 설정합니다.

    const transaction = await factory.createAccount(owner);
    // 계정 팩토리 컨트랙트의 `createAccount` 함수를 호출하여 새로운 스마트 계정 생성 트랜잭션을 보냅니다.
    const result = await transaction.wait();
    // 트랜잭션이 블록에 포함될 때까지 기다리고 그 결과를 가져옵니다.
    console.log("트랜잭션 해시 : ", result.hash);
    // 스마트 계정 생성 트랜잭션의 해시를 콘솔에 출력합니다.

    // 스마트 계정 조회
    // `smartAccount` 변수에 스마트 계정의 주소를 조회하기 위한 주석입니다.
    const smartAccount = await factory.getAccount(owner);
    // 팩토리 컨트랙트의 `getAccount` 함수를 호출하여 방금 생성된 (또는 이미 존재하는) 스마트 계정의 주소를 조회합니다.
    console.log("스마트 계정", smartAccount);
    // 조회된 스마트 계정의 주소를 콘솔에 출력합니다.
    // 역활과 책임
    // 이 주석은 EOA와 스마트 계정 간의 역할 분담에 대한 설명입니다.
    // 소셜로 생성하는 EOA는 서명을 만드는 역활을 해서 검증을하고 트랜잭션을 실제로 이더리움 네트워크에 호출하지 않는다.
    // 소셜 로그인 등을 통해 생성된 EOA는 단순히 트랜잭션에 서명하여 유효성을 검증하는 역할을 하며, 실제 이더리움 네트워크에 트랜잭션을 직접 호출하지 않습니다.
    // userOps 로 보내서
    // 대신 트랜잭션은 `UserOperation` 형태로 번들러에게 전달됩니다.
    // 스마트 계정 0xE861AC154d8c3dC0E0820D022481685bE95Ddf2e 조회 조회만 하게 하고 개인키를 사용할 필요가 없게한다.
    // 이 주석은 특정 스마트 계정 주소(`0xE861AC154d8c3dC0E0820D022481685bE95Ddf2e`)를 언급하며, 스마트 계정은 조회만 하게 하고 EOA의 개인 키를 직접 사용할 필요가 없게 만든다는 점을 강조합니다.
    // 스마트 계정에 이더 전송
    // 새로 생성된 스마트 계정에 이더를 전송하는 과정에 대한 주석입니다.

    const transaction2 = await wallet.sendTransaction({
        to : smartAccount, // 스마트 계정의 주소
        value : ethers.parseEther("0.002") // 전송할 이더리움 양 (0.002 ETH)
    })
    // EOA(wallet)를 사용하여 새로 생성된 `smartAccount`로 0.002 ETH를 전송하는 트랜잭션을 생성하고 보냅니다.
    await transaction2.wait();
    // 이더 전송 트랜잭션이 블록에 포함될 때까지 기다립니다.
    const balance = await provider.getBalance(smartAccount);
    // 스마트 계정의 현재 잔액을 다시 조회합니다.
    console.log("스마트 계정 잔액 : ", ethers.formatEther(balance))
    // 스마트 계정의 최종 잔액을 콘솔에 출력합니다.
}
createSmartAccount();
// `createSmartAccount` 함수를 호출하여 스마트 계정 생성 과정을 시작합니다.