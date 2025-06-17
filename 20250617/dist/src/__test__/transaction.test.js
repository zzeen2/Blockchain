"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chain_1 = require("../chain");
const mempool_1 = require("../mempool");
const transaction_1 = require("../transaction");
const UTXO_1 = require("../UTXO");
const wallet_1 = require("../wallet");
describe("트랜잭션 검증", () => {
    let wallet01;
    let wallet02;
    let blockChain;
    let mempool;
    let utxoLedger;
    // 매번 테스트마다 최초에 호출될 공통 코드
    test("초기화", () => {
        wallet01 = new wallet_1.Wallet;
        wallet02 = new wallet_1.Wallet;
        mempool = new mempool_1.Mempool;
        utxoLedger = new UTXO_1.UTXOLedger;
        blockChain = new chain_1.BlockChain;
        // utxo 미사용 객체의 이전 트랜잭션 내용을 포함
        // 반감기 기준으로 보상이 절반씩 줄어들었고, 총 발행량 기준으로 총 발행량에서 보상만큼의 이전 트랜잭션 내용을 가져온다. 
        const txInput = {
            txId: "",
            outputIndex: 0,
            signature: "",
            publicKey: "",
        };
        // 출력 값 지갑 주소 첫번째가 
        const TxOutput = {
            address: wallet01.account,
            amount: 50
        };
        // 원래 이 트랜잭션은 mempool
        // 블록 생성했을때 첫번째 트랜잭션으로 만들어서 넣어준다.ㅌ 
        const coinbaseTx = new transaction_1.Transaction([], [TxOutput]);
        // 거래 서명 생성
        coinbaseTx.signInputs(wallet01);
        // 서명검증 이후에 트랜잭션 추가
        mempool.addTransaction(coinbaseTx);
    });
    test("트랜잭션 mempool 조회", () => {
        console.log(mempool);
    });
    test("트랜잭션 처리", () => {
        //mempool.transactions[0]
        // utxo 처리
        // 이전 처리과정 
        const block = blockChain.addBlock([JSON.stringify(mempool.transactions[0])]);
        utxoLedger.updateTransaction(mempool.transactions[0]);
        mempool.removeTransaction(mempool.transactions[0].id);
        console.log(utxoLedger.utxos);
        // 미사용객체 생성
        // 트랜잭션 처리과정에서 
        // 블록에 기록된 내용 확인
        console.log(blockChain.chain);
    });
    test("지갑에서 사토시 이체", () => {
        // UTXO 조회해서 잔액 가져오기
        const utxos = utxoLedger.getUTXOAddress(wallet01.account);
        console.log("잔액 : ", utxos);
        console.log("첫번째 지갑의 잔액은 : ", utxoLedger.getBalance(wallet01.account));
        // 보낼 금액
        const sendValue = 20;
        const txInput = {
            txId: utxos[0].txId,
            outputIndex: utxos[0].outputIndex
        };
        // 출력에 따른 계산. 출력값 계산 //
        const tx = new transaction_1.Transaction([txInput], [{
                address: wallet01.account, amount: 30
            }, {
                address: wallet02.account, amount: 20
            }]);
        // 서명 생성. 내가 한일이 맞아 나는 이 사람한테 송금할거야. 
        tx.signInputs(wallet01); // 수수료가 발생하지만 우리는 없어
        console.log("서명 검증", tx.verifyInputs());
        mempool.addTransaction(tx);
        // 우선순위
        // 트랜잭션 가져와 mempool
        const block = blockChain.addBlock([JSON.stringify(mempool.transactions[0])]);
        console.log(block);
        utxoLedger.updateTransaction(mempool.transactions[0]);
        mempool.removeTransaction(mempool.transactions[0].id);
        console.log("첫번째 지갑의 잔액은 : ", utxoLedger.getBalance(wallet01.account));
        console.log("두번째 지갑의 잔액은 : ", utxoLedger.getBalance(wallet02.account));
    });
});
// utxo에 객체를 나눠서 저장한 후에
// 필요한 만큼만 가져와서 이체하는 로직 작성
// output 결과 계산
