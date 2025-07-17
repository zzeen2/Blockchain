const { ethers, keccak256, solidityPacked } = require("ethers");

const createPrivateKey = (email, salt, domain) => {
    const id =  `${domain} : ${email}`;
    const value = solidityPacked(["string", "string"], [salt, id]).slice(0,64);
    const privateKey = keccak256(value).replace("0x", "").slice(0, 64);
    return `0x${privateKey}`
}

const email = "123345@gmail.com";
const privateKey = createPrivateKey(email, "zzeen", "oauth:google");

const provider = new ethers.JsonRpcProvider(
	"https://sepolia.infura.io/v3/981889944f284491a324d20aabee293a",
	"sepolia"
);

const wallet = new ethers.Wallet(privateKey, provider); 

console.log("주소 :", wallet.address);
console.log("비밀키 :", wallet.privateKey);

// 비동기로 잔액 조회
(async () => {
    const balance = await provider.getBalance(wallet.address);
    console.log("잔액 :", ethers.formatEther(balance));
})();

const CA = "0x65Bf2B58a65855F74DAE0235553b70655955EaB3";
const abi = [
    {
        "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
        "name": "createAccount",
        "outputs": [{ "internalType": "address", "name": "smartAccount", "type": "address" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "_entryPoint", "type": "address" }],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
        "name": "getAccount",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    }
];

const factory = new ethers.Contract(CA, abi, wallet);

const createSmartAccount = async () => {
    const owner = wallet.address;

    const tx = await factory.createAccount(owner);
    const receipt = await tx.wait();
    console.log("트랜잭션 해시:", receipt.hash);

    const smartAccount = await factory.getAccount(owner);
    console.log("스마트 계정:", smartAccount);

    const tx2 = await wallet.sendTransaction({
        to: smartAccount,
        value: ethers.parseEther("0.002")
    });
    await tx2.wait();

    const smartBalance = await provider.getBalance(smartAccount);
    console.log("스마트 계정 잔액:", ethers.formatEther(smartBalance));
};

createSmartAccount();
