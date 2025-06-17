import { BlockChain } from "../chain";
import { IMessage, IP2PNode } from "../interface/p2p.interface";
import { Mempool } from "../mempool";
import { UTXOLedger } from "../UTXO";
import WebSocket, { WebSocketServer } from "ws";
import { Wallet } from "../wallet";
import express from "express"
import path from "path";
import { Block } from "../block";
import { Transaction } from "../transaction";
import { TxInput, TxOutput } from "../interface/transaction.interface";

class P2PNode implements IP2PNode {
    blockchain: BlockChain;
    mempool: Mempool;
    utxoLedger: UTXOLedger;
    wallet: Wallet;
    sockets: WebSocket[] = [];

    server: WebSocketServer;
    app : express = express(); // express 서버를 사용 UI 페이지. 서버 객체 하나 생성
    httpPort: number;
    constructor(port : number, peers : string[] = []) {
        // port 내 서버의 대기상태를 지정할 포트번호
        // peers 내 노드와 연결할 다른 피어 목록
        this.blockchain = new BlockChain();
        this.mempool = new Mempool();
        this.utxoLedger = new UTXOLedger();
        this.wallet = new Wallet();

        // 웹소켓 서버 대기상태
        // 웹소켓 포트
        this.server = new WebSocketServer({ port });
        // 피어 연결 처리
        this.server.on("connection", (ws) => this.initConnection(ws));

        // http 서버 포트 지정 대기상태
        this.httpPort = port + 1000; // 4000번
        // 서버 대기상태 로직

        peers.forEach((peer) => this.connectToPeer(peer))

        this.initHTTPServer() // 서버 초기화
        console.log("WebSocketServer 대기상태 !! " + port + " 번 대기중") // 웹소켓 서버
        console.log("initHTTPServer 대기상태 !! " + this.httpPort + " 번 대기중") // http 서버 
    }

    initHTTPServer() {
        // express
        // 보여줄 UI 페이지의 "정적" 경로 ((req,res)=> {})랑 같은거
        this.app.use(express.static(path.join(__dirname, "view")))
        this.app.use(express.urlencoded({express : false})) // body객체 사용
        this.app.use(express.json()) // body객체 사용
        // api
        // 블록체인 모두 반환
        this.app.get("/chain", (req,res) => {
            res.json(this.blockchain.chain) // 체인
        } )
    
        // 트랜잭션 풀 반환
        this.app.get("/mempool", (req,res) => {
            res.json(this.mempool.transactions) // 배열
        })

        // 지갑의 정보 반환 (UI에 지갑의 공개키, 그 지갑의 잔액)
        this.app.get("/wallet", (req,res) => {
            res.json({
                publicKey : this.wallet.publicKey,
                balance : this.utxoLedger.getBalance(this.wallet.publicKey)
            })
        })

        // 다른 피어가 트랜잭션 요청을 하면 트랜잭션 생성 처리 
        this.app.post("/transaction", (req,res) => {
            const {toAddress, amount} = req.body;

            // 트랜잭션 생성
            this.createTransaction(toAddress, amount)
            res.send({message : "트랜잭션 생성"})
        })
        // 블록 채굴 요청 
        this.app.post("/mine", (req,res) => {
            // 채굴 로직 
            const result = this.mineBlock();
            if(result){
                res.json({message : "블록이 마이닝 완료"})
            }else {
                res.json({message : "블록이 마이닝 실패"})
            }
        })

        this.app.listen(this.httpPort)
    }

    // 새로운 피어가 연결이 성공했을때 초기 설정
    initConnection(ws : WebSocket) {
        this.sockets.push(ws); // 연결된 소켓 목록 추가
        ws.on("message", (msg) => this.handlerMessage(ws, msg.toString()))// 메세지 처리 로직
        ws.on("close", () => this.handlerClose(ws)) // 배열에서 삭제
    }

    // 다른 피어에 연결 시도 ( 성공, 실패 )
    connectToPeer(peer : string) {
        const ws = new WebSocket(peer);
        ws.on("open", () => this.initConnection(ws)); // 연결 성공하면 피어를 담아놓는다.
        ws.on("error", () => console.log("피어 연결 실패 : " + peer)) // 피어 종료 처리 삭제
    }
    // 피어에 메세지를 전송
    sendMessage(ws : WebSocket, message : IMessage) {
        ws.send(JSON.stringify(message))
    }

    // 피어에 메세지를 전달했을떄
    // 처리하는 로직의 조건문 
    // 조이스틱 처럼 조작
    // 문자열
    handlerMessage(ws : WebSocket, message : string) { 
        const msg : IMessage = JSON.parse(message);
        // 체인을 요청하는 경우
        // 상대방에게 받은 체인을 처리
        // 요청한 mempool의 전달
        // 받은 mempool을 처리
        // 트랜잭션 받은 경우
        // 새로운 블록을 받은경우
        switch (msg.type) {
            case "REQ_CHAIN":
                this.sendChain(ws); // 요청 체인 전달
                break;
            case "RES_CHAIN":
                this.handlerChainRes(msg.data) // 받은 체인 처리
                break;
            case "REQ_MEMPOOL":
                this.sendMempool(ws); // 트랜잭션 풀 전달
                break;
            case "RES_MEMPOOL":
                this.handlerMempoolRes(msg.data); // 받은 트랜잭션 풀 처리
                break;
            case "CREATE_TRANSACTION":
                this.handlerTxRes(msg.data); // 트랜잭션 수신
                break;
            case "CREATE_BLOCK":
                this.handlerBlockRes(msg.data); // 블록 수신
                break;
        }
    }
    // 연결이 종료된 피어 삭제
    handlerClose(ws : WebSocket) {
        this.sockets = this.sockets.filter((soc) => soc !== ws);
    }

    // 전체 피어에 브로드 캐스트
    broadcast(message : IMessage) {
        this.sockets.forEach((ws) => this.sendMessage(ws, message))
    }

    // 내가 가지고있는 체인의 정보를 요청한 피어에게 체인 전달.
    sendChain(ws : WebSocket) {
        this.sendMessage(ws, {
            type : "REQ_CHAIN",
            data : this.blockchain.chain
        })
    }
    // 상대방에게 체인의 데이터를 받았다.
    // 롱기스트 체인룰. 상대방의 체인과 비교
    handlerChainRes(chain : Block[]) {
        if(this.blockchain.replaceChain(chain)){
            console.log("상대방 체인 교체")
            this.mempool.transactions = [];
        }else{
            console.log("내 체인이 정답")
        }
    }

    // mempool의 내용을 전달
    sendMempool(ws : WebSocket) {
        this.sendMessage(ws, {
            type : "RES_MEMPOOL",
            data : this.mempool.transactions
        })
    }

    // 상대방에게 mempool을 받으면 트랜잭션 내용을 추가
    handlerMempoolRes(transactions : Transaction[]){
        transactions.forEach((txData) => {
            const tx = new Transaction(txData.inputs, txData.outputs);
            if(this.mempool.addTransaction(tx)){
                console.log("트랜잭션 수신", tx.id);
            }
        })
    }

    // 새로운 트랜잭션 생성
    createTransaction(toAddress : string, amount : number) {
        // 지갑에서 잔액 가져오기
        const utxos = this.utxoLedger.getUTXOAddress(this.wallet.publicKey);
        
        // 내가 가지고 있는 금액을 찾을때 누적되는 량
        let acc = 0;
        const inputs : TxInput[] = [];
        const outputs : TxOutput[] = [];

        // 필요한 금액만큼 가져오기
        for(const utxo of utxos) {
            acc += utxo.amount;
            inputs.push({
                txId : utxo.txId,
                outputIndex : utxo.outputIndex,
                signature : "",
                publicKey : "",
            })
            if(acc >= amount) break;
        }
        // 잔액이 부족한지 검증
        if(acc < amount) {
            console.log("잔액이 부족하다.")
            return
        }

        // 트랜잭션 출력값 생성
        outputs.push({address : toAddress, amount})

        // 잔돈 남은거 내 주소로 utxo
        const balance = acc - amount;
        if(balance > 0) {
            outputs.push({address : this.wallet.publicKey, amount : balance})
        }

        // 트랜잭션 생성
        const tx = new Transaction(inputs, outputs);
        // 트랜잭션 서명 만들어서 포함
        tx.signInputs(this.wallet);

        // 거래를 생성
        // 트랜잭션풀에 포함
        // 다른 노드들에게 전달 
        if(this.mempool.addTransaction(tx)) {
            this.broadcast({type : "CREATE_TRANSACTION", data : tx});
            console.log("트랜잭션 생성")
        }
    }
    // 블록 생성 마이닝
    mineBlock() {
        // 블록에 포함시킬 트랜잭션 id 배열 데이터
        const data = this.mempool.transactions.map((tx) => tx.id)
        // 코인베이스 트랜잭션 채굴자 보상 트랜잭션
        const coinbaseTx = new Transaction([], [{address : this.wallet.publicKey, amount : 50}]);

        // 코인베이스 트랜잭션은 서명이 필요없다.
        const blockData = [coinbaseTx.id, ...data];

        // 블록 생성
        const newBlock = this.blockchain.addBlock(blockData);
        if (newBlock) {
            // 잔액 UTXO 업데이트
            this.utxoLedger.updateTransaction(coinbaseTx);
            this.mempool.transactions.forEach((tx) => {
                this.utxoLedger.updateTransaction(tx);
                this.mempool.removeTransaction(tx.id);
            });
            this.broadcast({type : "CREATE_BLOCK", data : newBlock});
            console.log("블록 생성 이후 브로드 캐스트");
            return true;
        }
        return false;
    }
    // 피어로 받은 블록 처리
    handlerBlockRes(blockData : Block) {
        const latesBlock = this.blockchain.getLatesBlock();

        if(blockData.previousHash === latesBlock.hash) {
            this.blockchain.chain.push(blockData);

            blockData.data.forEach(txId => {
                this.mempool.removeTransaction(txId);
            });
            console.log("피어로 전달받은 블록 추가")
            // 연결된 노드에게 재전파
            this.broadcast({type : "CREATE_BLOCK", data : blockData})
        }else{
            // 체인 요청
            this.broadcast({type : "REQ_CHAIN"})
        }
    }
    // 피어로 받은 트랜잭션 처리 
    handlerTxRes(txData : Transaction) {
        // 값을 복사해서
        // 값을 인스턴스로 복원
        const tx = Object.assign(new Transaction([],[]), txData)
        if(this.mempool.addTransaction(tx)){
            console.log("트랜잭션 수신", tx.id)
            this.broadcast({type : "CREATE_TRANSACTION", data : tx})
        }
    }   
} 

// 초기 자금
const initBalance = (node : P2PNode, amount = 20) => {
    const txId = "tx-0001";
    const outputIndex = 0;
    const pubKey = node.wallet.publicKey;
    
    node.utxoLedger.utxos.push({
        txId,
        outputIndex,
        address : pubKey,
        amount
    })
}

// 빌드 npm tsx --> test코드가 아닌 js코드로 빌드됨
// 실행 --> node + dist/실행할 경로 --> 실제 실행
const p2pNode = new P2PNode(3000, ["ws://192.168.0.5:3001"]);
initBalance(p2pNode, 100);

const p2pNode2 = new P2PNode(3001, ["ws://192.168.0.5:3000"]);
initBalance(p2pNode2, 50);