import { BlockChain } from "../chain";
import { TxInput, TxOutput } from "../interface/transaction.interface";
import { Mempool } from "../mempool";
import { Transaction } from "../transaction";
import { UTXOLedger } from "../UTXO";
import { Wallet } from "../wellet"

describe("트랜잭션 검증", () => {
    let wallet01 : Wallet;
    let wallet02 : Wallet;
    let blockChain : BlockChain;
    let utxoLedger : UTXOLedger;
    let mempool : Mempool;

    // 매번 테스트마다 최초에 호출될 공통 코드
    test("초기화", () => {
        wallet01 = new Wallet();
        wallet02 = new Wallet();
        mempool = new Mempool();
        utxoLedger = new UTXOLedger();
        blockChain = new BlockChain();

        // utxo 미사용 객체의 이전 트랜젝션 내용을 포함
        // 반감기 기준으로 보상이 절반씩 줄어들었고 총발행량 기준으로 총 발행량에서 보상만큼의 이전 트랜잭션 내용을 가져온다.
        const txInput : TxInput = {
            txId : "",
            outputIndex : 0,
            signature : "",
            publicKey : "",
        }

        // 출력 값 지갑 주소 첫번째가 
        const txOutput : TxOutput = {
            address : wallet01.account,
            amount : 50
        }

        // 원래 이 트랜젝션은 mempool
        // 블록 생성했을대 첫번재 트랜잭션으로 만들어서 넣어준다.
        const coinbaseTx = new Transaction([], [txOutput]); 
        
        // 거래 서명 생성
        coinbaseTx.signInputs(wallet01);
        
        // 서명검증 이후에 트랜잭션 추가
        mempool.addTransaction(coinbaseTx);
    })

    test("트랜잭션 mempool 조회", () => {
        console.log(mempool);
    })

    test("트랜잭션 처리", () => {
        // mempool.transactions[0]
        // UTXO 처리
        // 이전 처리과정 
        const block = blockChain.addBlock([JSON.stringify(mempool.transactions[0])]);
        // 
        utxoLedger.updateTransaction(mempool.transactions[0]);
        mempool.removeTransaction(mempool.transactions[0].id);
        console.log(utxoLedger.utxos)
        // 미사용 객체 생성
        // 트랜잭션의 처리과정에서 
        // 블록에 기록된 내용 확인
        console.log(blockChain.chain);
    })

    test("지갑에서 사토시 이체", () => {
        // UTXO 조회해서 잔액 가져오기
        const utxos = utxoLedger.getUtxoAddress(wallet01.account);
        console.log("잔액 : ",utxos);
        console.log("첫번째 지갑의 잔액은 : ",utxoLedger.getBalance(wallet01.account))

        // 보낼 금액
        // const sendValue = 20;

        console.log(utxos[0]);
        const txInput : TxInput = {
            txId : utxos[0].txId,
            outputIndex : utxos[0].outputIndex
        }

        // 출력에 따른 계산 출력값 계산 //

        const tx = new Transaction([txInput], [{
            address : wallet01.account, amount : 30
        },{
            address : wallet02.account, amount : 20
        }])

        // 서명 생성 내가 한일이 맞아 나는 이사람한테 송금할꺼야.
        tx.signInputs(wallet01); // 수수료가 발생하지만 우리는 없어.
        console.log("서명 검증 : ",tx.verifyInputs());

        mempool.addTransaction(tx); // 트랜잭션 풀

        // 우선순위 
        // 트랜잭션 가져와 mempool
        const block = blockChain.addBlock([JSON.stringify(mempool.transactions[0])]);
        console.log(block);

        utxoLedger.updateTransaction(mempool.transactions[0]);
        mempool.removeTransaction(mempool.transactions[0].id);

        console.log("첫번째 지갑의 잔액은 : ",utxoLedger.getBalance(wallet01.account))
        console.log("두번째 지갑의 잔액은 : ",utxoLedger.getBalance(wallet02.account))
    })
})

// tsc 컴파일 => 실제로 사용할 프로젝트에 js를 런타임환경에서 실행할 파일
// ts-node => 노드 환경에서 메모리상에 컴파일된 코드를 잠시 적제하고 노드 런타임환경에서 실행해서 코드 테스트
// jest => ts-node와 같이 node의 런타임환경에서 테스트코드를 실행


// 이해먼저 생태계 
// utxo에 객체를 나눠서 저장한후에 
// 필요한 만큼만 가져와서 이체하는 로직 작성
// output 결과 계산도.