const express = require("express");
const { ethers } = require("ethers");

const app = express();
app.use(express.json());

// 프론트 엔드에 있는 서명자는 본인의 신원 검증을 하기위한 소셜로그인을 통해서 만든 개인키로 서명한 값

// 번들러의 서명자는 페이마스터에서 지불해줄수 있는 서명자
// 대납자 계정

const privateKey = "0x18f85a676d2022001dd03e25a769655907ff435b793548d082d68b62aef3d237";
const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/c36ac18d957a4f46aa6b893c058c4bbd");
const wallet = new ethers.Wallet(privateKey, provider);

// 사용자의 계정이 아닌 관리자 대납자 계정 서명자 wallet
// 엔트리포인트 CA
const entryPointCA = "0xB3B4839F33d08eD30C6907Ad92b24381466F726d";
const entryPointABI = [
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
]

const entryPoint = new ethers.Contract(entryPointCA, entryPointABI, wallet);

// 트랜잭션을 관리하는 리스트
// 역활과 책임 
// 트랜잭션의 정렬 
// 트랜잭션 제거
// 트랜잭션 호출

const mempool = [];

// rest api 복수형은 s get에는 해당 아이템 해당아이템의 호출을 파라미터
// 글생성은 post요청에 그 해당 기능만
// 데이터를 보내면 트랜잭션 풀에 추가
app.post("/userop", async (req, res) => {
    try {
        const userOp = req.body;
        mempool.push(userOp);
        res.json({state : 200, message : "트랜잭션 풀 추가 성공"});
    } catch (error) {
        res.json({state : 400, message : "트랜잭션 풀 추가 실패"});
    }
})

app.get("/mempool", (req, res) => {
    res.json({mempool});
})

// setInterval 민감한 시간의 조정이 필요할경우
// 불 정확한 시간
// 내부적으로 nodejs 자바스크립트 이벤트 루프가 동작하는 시간은 일정하게 정확할수없다.
// GC
// setInterval(() => {
    
// }, 10000);

// 정확한 시간을 추구하는 타이머 패턴
const setTiemInterval = (callback, intervalTime) => {
    const loop = async () => {
        const now = Date.now();
        const delay = intervalTime - (now % intervalTime) // 다음 호출 시간까지의 차이값
        setTimeout(async () => {
            callback();
            // 실행 시간을 구해서 설정
            loop();
        }, delay)
    }
    loop(); // 함수 시작과 초기에 실행
}

const toTuple = (userOp) => {
    return [
        userOp.sender,
        BigInt(userOp.nonce),
        userOp.initCode,
        userOp.callData,
        BigInt(userOp.callGasLimit),
        BigInt(userOp.verificationGasLimit),
        BigInt(userOp.preverificationGas),
        BigInt(userOp.maxFeePerGas),
        BigInt(userOp.maxPrioityFeePerGas),
        userOp.paymasterAndData,
        userOp.signature
    ]
}

setTiemInterval(async () => {
    // 10초마다 트랜잭션 풀의 내용을 확인해서 작업 처리
    const ops = mempool.splice(0);
    if(ops.length === 0) return;
    try {
        const transaction = await entryPoint.handleOps(ops.map(toTuple));
        console.log("트랜잭션 해시 : ", transaction.hash);
    } catch (error) {
        console.log(error);
    }
}, 10000) // 10 목표시간에 맞게 재귀적으로 호출

app.listen(4000, () => {
    console.log("server on~")
})