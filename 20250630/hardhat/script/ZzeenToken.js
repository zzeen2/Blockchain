// web3가 제공하는 개인키 랜덤 생성 지갑생성 그리고 공급자 생성
require("dotenv").config();

const fs = require("fs");
const {Web3} = require("web3");

// 컨트랙트 주소 
const CA = process.env.CONTRACT_ADDRESS;

// ABI 
const {abi} = JSON.parse(fs.readFileSync("./artifacts/contracts/ZzeenToken.sol/ZzeenToken.json", "utf8"))

// web3 커넥션 인스턴스 생성
// window.ethereum 객체 
// 문자열 엔드포인트 경로다 JSON RPC 내용의 요청을 보내는 커넥션 객체 생성
// 
const web3 = new Web3(process.env.INFURA_RPC);
// 웹소켓 커넥션 객체는 다른 메서드를 사용해서

// 지갑 객체 생성
const wallet = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
// 지갑을 임시로 하나 만들고싶다.
const wallet2 = web3.eth.accounts.create(); // 랜덥값으로 비밀키 생성하고 지갑 생성

const contract = new web3.eth.Contract(abi, CA);

const initTest = async() => {
    //console.log(wallet)
    console.log("wallet :", wallet.address)
    console.log("wallet2 :", wallet2.address)

    // wallet지갑을 객체에 추가 web3의 객체에 지갑을 추가
    web3.eth.accounts.wallet.add(wallet);// 트랜잭션의 서명을 작성할 수 있는 지갑

    await web3.eth.sendTransaction({
        from : wallet.address,
        to : CA,
        value : web3.utils.toWei("0.01", "ether"),
        gas : 3000000
    })

    const balance = await contract.methods.balanceOf(wallet.address).call();
    console.log(balance);

    // 두번쨰 지갑에 토큰 전송
    await contract.methods.transfer(wallet2.address, "100").send({from : wallet.address})
    const balance2 = await contract.methods.balanceOf(wallet2.address).call();
    console.log("두번째 지갑의 토큰 :", balance2)
}

initTest();