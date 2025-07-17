const {ethers, AbiCoder} = require("ethers")

// 서명자 공급자
const provider = new ethers.JsonRpcProvider(
    "https://sepolia.infura.io/v3/981889944f284491a324d20aabee293a",
    "sepolia"
);
const wallet = new ethers.Wallet("0x59b73a2b758e064a305e4acf0b0f73b47759fe8f4ab709f82864f4c8e6b3b2e5", provider); 

const entryPointAbi = [
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
];

// 1. 엔트리 포인트에 요청  userOps
// 2. 엔트리 포인트 검증 로직 이후에 스마트 계정의 excute() => 시그니처
// 3. 스마트 계정의 호출 함수의 시그니처 바이트 코드가 필요하다.

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
];

// 사용자가 생성한 스마트 계정
const smartAccountAddress = "0x2000aB6F5895Fc98faF89BB86F68C0d919f290FA" 

// 엔트리 포인트 CA 
const entryPointCA = "0xb4dA85c11A023b302e41432be68FeDa8EdB17e3B"

const sendEntryPoint = async() => {
    // 스마트 계정 컨트랙트
    const smartAccount = new ethers.Contract(
        smartAccountAddress,
        smartAccountAbi,
        provider
    )

    const entryPoint = new ethers.Contract(
        entryPointCA,
        entryPointAbi,
        provider
    )

    // 이더를 다른 계정에 송금
    const receiveAccount = "0x80691422A7B8154f85F43e2dFd54acB754eF2aC7";

    // 전송할 금액
    const value = ethers.parseEther("0.001");

    // calldata 스마트 계정이 호출 해야하는 내용
    // abi로 생성한 컨트랙트의 호출 내용 즉 바이트코드 내용을 만드는 함수
    const callData = smartAccount.interface.encodeFunctionData("execute",
        [receiveAccount, value, "0x" ]
    );

    // userops 객체 만들어서 전달
    // 작업내용 반복 금지
    const nonce = 0n;
    const userOp = {
        sender : smartAccountAddress,
        nonce,
        initCode : "0x",
        callData,
        callGasLimit : 100000n,
        verificationGasLimit : 100000n,
        preverificationGas : 21000n,
        maxFeePerGas : ethers.parseUnits("5", "gwei"), // 전체 가스 상환을 기본 가스비 + 번들러 팁
        maxPriorityFeeGas : ethers.parseUnits("2", "gwei"), // 번들러에게 주는 가스비
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
        userOp.maxPriorityFeeGas,
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
        "bytes",
    ]
    // abi 바이트 코드 배열 생성
    const encoded = AbiCoder.defaultAbiCoder().encode(userOpTypes,userOpValues);

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

    const transaction = await entryPoint.handleOps([userOpTuple]);

    const result = await transaction.wait();
    console.log("트랜잭션 해시 : ", result.hash)
}

sendEntryPoint();