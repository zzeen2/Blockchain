const {ethers} = require("ethers");
require("dotenv").config(); // 환경변수 등록

// seplia lock 컨트랙트에서 Loked 이벤트가 발생하는걸 감지하고, 그 값을 받아 kaia 네트워크의 wrappedtoken에 mint()를 호출해주는 백엔드 로직

const ethProvider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC);
const kaiaProvider = new ethers.JsonRpcProvider(process.env.KAIA_RPC);

const ethWallet = new ethers.Wallet(process.env.SEPOLIA_PK, ethProvider);
const kaiaWallet = new ethers.Wallet(process.env.KAIA_PK, kaiaProvider);
console.log(kaiaWallet.address)
const lockABI =[
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "_account",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "Locked",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "accountLockValue",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "lock",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalValue",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_account",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "unlock",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]
const lockContract = new ethers.Contract(process.env.LOCK_CA, lockABI, ethProvider)

const wrappedTokenABI =[
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_relayer",
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
				"name": "",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "mint",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "relayer",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

const wrappedTokenContract = new ethers.Contract(process.env.KAIA_WETH_CA, wrappedTokenABI)

const init = async() => {
    const ethValue = await ethProvider.getBalance(ethWallet.address);
    const kaiaValue = await kaiaProvider.getBalance(kaiaWallet.address);

    console.log(`ETH : ${ethers.formatEther(ethValue)}`);
    console.log(`KAIA : ${ethers.formatEther(kaiaValue)}`); // 메틱 MATIC

    lockContract.on("Locked", async(account, value) => {
        console.log("입금 이벤트 호출")
        console.log(`계정 : ${account}`)
        console.log(`wETH : ${value}`)
        // 카이아 네트워크에 mint wETH
        // wETH 토큰을 생성하는 CA는 정해져있다. 
        
        await wrappedTokenContract.mint(account, value);
    })
}   

init();

