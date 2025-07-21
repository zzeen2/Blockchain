const {ethers, AbiCoder, keccak256} = require("ethers");
const axios = require("axios");

const privateKey = "0xd9ef311bc41a9d0e4eb78d3f3494a7edbd67f67586a1a58fb3e3a0f742c65696";
const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/c36ac18d957a4f46aa6b893c058c4bbd");
const wallet = new ethers.Wallet(privateKey, provider);
const TokenCA = "0x969F8559CDa237736254A47a6249340Bb023Fd10"
const TokenAbi = [
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
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
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
		"name": "transfer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
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
		"name": "owner",
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

// 배포된 토큰 erc20에 call 메시지를 요청 할수 있는 바이트 코드
const entryPointAbi = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "success",
                "type": "bool"
            }
        ],
        "name": "UserOperationHandled",
        "type": "event"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "sender",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "nonce",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes",
                        "name": "initCode",
                        "type": "bytes"
                    },
                    {
                        "internalType": "bytes",
                        "name": "callData",
                        "type": "bytes"
                    },
                    {
                        "internalType": "uint256",
                        "name": "callGasLimit",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "verificationGasLimit",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "preverificationGas",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "maxFeePerGas",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "maxPrioityFeePerGas",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes",
                        "name": "paymasterAndData",
                        "type": "bytes"
                    },
                    {
                        "internalType": "bytes",
                        "name": "signature",
                        "type": "bytes"
                    }
                ],
                "internalType": "struct EntryPoint.UserOPeration[]",
                "name": "ops",
                "type": "tuple[]"
            }
        ],
        "name": "handleOps",
        "outputs": [],
        "stateMutability": "nonpayable",
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
        "name": "nonces",
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
];

// 1. 엔트리포인트에 요청 userOps
// 2. 엔트리포인트 검증 로직 이후에 스마트 계정의 exeute () => 시그니처
// 3. 스마트계정의 호출 함수의 시그니처 바이트코드가 필요하다

const smartAccountAbi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_owner",
                "type": "address"
            },
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
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            },
            {
                "internalType": "bytes",
                "name": "data",
                "type": "bytes"
            }
        ],
        "name": "execute",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "_hash",
                "type": "bytes32"
            },
            {
                "internalType": "bytes",
                "name": "sig",
                "type": "bytes"
            }
        ],
        "name": "isValidSignature",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
]
// 스마트 계정 사용자가 생성한 계정
const smartAccountAddress = "0x317Cb4e74BfEC754120E6446fF877576aC1aDd12"; 

// 엔트리포인트 CA
const entryPointCA = "0x60Dc8F0D71712F1edEaC1EF59CAb4204d49a4Fd2";

const sendEntryPoint = async () => {
    // 스마트 계정 컨트랙트
    const smartAccount = new ethers.Contract(
        smartAccountAddress,
        smartAccountAbi,
        provider
    )

    const entryPoint = new ethers.Contract(
        entryPointCA,
        entryPointAbi,
        wallet
    )

    const Token = new ethers.Contract(
        TokenCA,
        TokenAbi,
        wallet
    );
    // 바이트 코드만 생성
    // erc20 민팅 바이트 코드
    const amount = ethers.parseEther("1000", 18);
    const mintCallData = Token.interface.encodeFunctionData("mint", [smartAccountAddress, amount]);

    // 이더를 다른 계정에 송금
    const reciveAccount = "0x7446017ac07224fB0C17556582e53574F1B12Ad3";

    // 전송할 금액
    const value = ethers.parseEther("0");

    // calldata 스마트 계정이 호출해야하는 내용
    // abi 생성한 컨트랙트의 호출 내용 즉 바이트 코드 내용을 만드는 함수
    const callData = smartAccount.interface.encodeFunctionData("execute",
        [TokenCA, value, mintCallData]
    )

    // userops 객체 만들어서 전달
    // 작업 내용 반복 금지
    const nonce = 5n;

    const userOp = {
        sender : smartAccountAddress,
        nonce,
        initCode : "0x",
        callData,
        callGasLimit : 100000n,
        verificationGasLimit : 100000n,
        preverificationGas : 21000n,
        maxFeePerGas : ethers.parseUnits("5", "gwei"), // 전체 가스 상한을 기본가스비 + 번들러 팁
        maxPrioityFeePerGas : ethers.parseUnits("2", "gwei"), // 번들러에게 주는 가스비
        paymasterAndData : "0x",
        signature : "0x"
    }

    const userOpValues = [
        userOp.sender,
        userOp.nonce,
        userOp.initCode,
        userOp.callData,
        userOp.callGasLimit,
        userOp.verificationGasLimit,
        userOp.preverificationGas,
        userOp.maxFeePerGas,
        userOp.maxPrioityFeePerGas,
        userOp.paymasterAndData,
        userOp.signature
    ]

    const userOpTypes = [
        "address",
        "uint",
        "bytes",
        "bytes",
        "uint",
        "uint",
        "uint",
        "uint",
        "uint",
        "bytes",
        "bytes"
    ]

    // abi 바이트 코드 배열 생성
    const encoded = AbiCoder.defaultAbiCoder().encode(userOpTypes, userOpValues);

    // 바이트 배열 생성 이후 해시 함수로 해시화
    const hash = ethers.keccak256(encoded);

    // 개인키로 서명
    const sign = await wallet.signMessage(ethers.getBytes(hash));

    userOp.signature = sign;

    const userOpTuple = [];
    for (const key in userOp) {
        userOpTuple.push(userOp[key]);
    }

    console.log(userOpTuple);

    // const transaction = await entryPoint.handleOps([userOpTuple]);

    // const result = await transaction.wait();
    // console.log("트랜잭션 해시 : ", result.hash);
    const userOpToJson = (userop) => {
        const result = {};
        for (const key in userop) {
            const value = userop[key];
            result[key] = typeof value === "bigint" ? value.toString() : value;
        }
        return result;
    }

    const res = await axios.post(
        "http://localhost:4000/userop",
        userOpToJson(userOp)
    )

    console.log(`트랜잭션 추가 결과 : ${res.data.message}`);
}

sendEntryPoint();