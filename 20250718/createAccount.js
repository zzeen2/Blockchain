const {ethers, keccak256, toUtf8Bytes, solidityPacked} = require("ethers");

// remixd -s ./contracts -u https://remix.ethereum.org/

// 0xCfC744A75c6d2471A32092b5535319676Fea1a5f

// 소셜 => web3Auth => 소셜로그인하면 값을 가지고 비밀키를 생성
// 개인키를 만들어서 사용
// web3Auth => 도메인, salt  oauth: 
const createPrivateKey = (email, salt, domain) => {
    const id = `${domain}:${email}`; // 이메일을 사용하는 해당 사이트와 이메일의 내용

    // 키를 길이를 제안하고 salt를 합해서 해시 문자열로 변환
    // 개인키로 사용하기 위해서 길이를 고정길이로 자른다.
    const value = solidityPacked(["string", "string"], [salt, id]).slice(0, 64);

    // 개인키의 해시 문자열 생성
    const privateKey = keccak256(value).replace("0x", "").slice(0, 64);
    return `0x${privateKey}`;
}

const email = "soon@gmail.com";

const privateKey = createPrivateKey(email, "soon", "oauth:google");

const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/c36ac18d957a4f46aa6b893c058c4bbd");
const wallet = new ethers.Wallet(privateKey, provider);
console.log("주소 : ",wallet.address);
console.log("개인키 : ",wallet.privateKey);
(async () => {
    const balance = await provider.getBalance(wallet);
    console.log("잔액 : ", ethers.formatEther(balance))
})();

const CA = "0xb09b175725DD8f387A487f5dd3823a7b61Bb163E";
const abi = [
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
const factory = new ethers.Contract(CA, abi, wallet);
// eth이더가 없어 수수료를 지불하지 못해
// 대납자가 대신 지불을 해줘야하고

const createSmartAccount = async () => {
    const owner = wallet.address;

    const transaction = await factory.createAccount(owner);
    const result = await transaction.wait();
    console.log("트랜잭션 해시 : ", result.hash);

    // 스마트 계정 조회
    const smartAccount = await factory.getAccount(owner);
    console.log("스마트 계정", smartAccount);
    // 역활과 책임
    // 소셜로 생성하는 EOA는 서명을 만드는 역활을 해서 검증을하고 트랜잭션을 실제로 이더리움 네트워크에 호출하지 않는다.
    // userOps 로 보내서
    // 스마트 계정 0xE861AC154d8c3dC0E0820D022481685bE95Ddf2e 조회 조회만 하게 하고 개인키를 사용할 필요가 없게한다.
	// 스마트 계정에 이더 전송

	const transaction2 = await wallet.sendTransaction({
		to : smartAccount,
		value : ethers.parseEther("0.002")
	})
	await transaction2.wait();
	const balance = await provider.getBalance(smartAccount);
    console.log("스마트 계정 잔액 : ", ethers.formatEther(balance))
}
createSmartAccount();