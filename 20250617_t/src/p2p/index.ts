// WebSocket과 WebSocketServer를 불러옴 (P2P 통신용)
import WebSocket, { WebSocketServer } from "ws";

// HTTP API 및 정적 파일 제공을 위한 Express 사용
import express from "express";

// 파일 경로를 처리하기 위한 Node 내장 모듈
import path from "path";

// 블록체인, 트랜잭션, 메모리풀, UTXO, 지갑 클래스 불러오기
import { BlockChain } from "../chain";
import { Transaction } from "../transaction";
import { Mempool } from "../mempool";
import { UTXOLedger } from "../UTXO";
import { Wallet } from "../wellet";

// 트랜잭션 입력과 출력 인터페이스 불러오기
import { TxInput, TxOutput } from "../interface/transaction.interface";

// P2P 메시지 형식 인터페이스 정의
interface IMessage {
  type: string; // 메시지 유형
  data?: any; // 메시지에 포함될 데이터 (선택적)
}

// P2PNode 클래스 정의
class P2PNode {
  blockchain: BlockChain; // 블록체인 인스턴스
  mempool: Mempool; // 미확정 트랜잭션을 담는 mempool
  utxoLedger: UTXOLedger; // UTXO 원장
  wallet: Wallet; // 개인 지갑 인스턴스
  sockets: WebSocket[] = []; // 연결된 피어 목록 (WebSocket 객체 배열)

  server: WebSocketServer; // P2P용 WebSocket 서버
  app = express(); // HTTP API용 Express 서버
  httpPort: number; // HTTP API 포트

  // 생성자: 노드 초기화 및 피어 연결
  constructor(publicPort: number, peers: string[] = []) {
    // 내부 구성요소 초기화
    this.blockchain = new BlockChain();
    this.mempool = new Mempool();
    this.utxoLedger = new UTXOLedger();
    this.wallet = new Wallet();

    // WebSocket 서버 시작 (P2P)
    this.server = new WebSocketServer({ port: publicPort });
    this.server.on("connection", (ws) => this.initConnection(ws)); // 피어 연결 시 처리

    // HTTP 포트는 WebSocket 포트 + 1000으로 설정
    this.httpPort = publicPort + 1000;
    this.setupHttpServer(); // HTTP API 서버 설정

    // 제공된 피어 주소 목록에 연결 시도
    peers.forEach((peer) => this.connectToPeer(peer));

    // 서버 시작 로그 출력
    console.log(`노드가 포트 ${publicPort}에서 실행 중입니다`);
    console.log(`HTTP UI가 포트 ${this.httpPort}에서 실행 중입니다`);
  }

  // HTTP API 서버 구성
  setupHttpServer() {
    // 정적 파일 경로 설정 (public 폴더)
    this.app.use(express.static(path.join(__dirname, "public")));

    // API: 블록체인 전체 반환
    this.app.get("/api/chain", (req, res) => {
      res.json(this.blockchain.chain);
    });

    // API: 현재 mempool 상태 반환
    this.app.get("/api/mempool", (req, res) => {
      res.json(this.mempool.transactions);
    });

    // API: 지갑 정보 제공 (공개키, 잔액)
    this.app.get("/api/wallet", (req, res) => {
      res.json({
        publicKey: this.wallet.publicKey,
        balance: this.utxoLedger.getBalance(this.wallet.publicKey),
      });
    });

    // API: 트랜잭션 생성 요청 처리
    this.app.post("/api/transaction", express.json(), (req, res) => {
      const { toAddress, amount } = req.body;

      // 요청 값 검증
      if (!toAddress || !amount) {
        return res.status(400).json({ error: "toAddress and amount required" });
      }

      // 트랜잭션 생성 함수 호출
      this.createTransaction(toAddress, amount);
    });

    // API: 블록 채굴 요청
    this.app.post("/api/mine", (req, res) => {
      const success = this.mineBlock();
      if (success) {
        res.json({ success: true });
      } else {
        res.status(400).json({ error: "No transactions to mine" });
      }
    });

    // HTTP 서버 실행
    this.app.listen(this.httpPort);
  }

  // 새로운 피어와 연결이 이루어졌을 때 초기 설정
  initConnection(ws: WebSocket) {
    this.sockets.push(ws); // 연결된 소켓 목록에 추가
    ws.on("message", (msg) => this.handleMessage(ws, msg.toString())); // 메시지 수신 처리
    ws.on("close", () => this.handleClose(ws)); // 연결 종료 처리

    // 체인, mempool 요청 전송
    this.sendMessage(ws, { type: "REQUEST_CHAIN" });
    this.sendMessage(ws, { type: "REQUEST_MEMPOOL" });
  }

  // 다른 피어에 연결 시도
  connectToPeer(peer: string) {
    const ws = new WebSocket(peer);
    ws.on("open", () => this.initConnection(ws)); // 연결 성공 시 초기화
    ws.on("error", () => {
      console.log(`피어 연결 실패: ${peer}`);
    });
  }

  // 수신 메시지 처리
  handleMessage(ws: WebSocket, message: string) {
    try {
      const msg: IMessage = JSON.parse(message);
      switch (msg.type) {
        case "REQUEST_CHAIN":
          this.sendChain(ws); // 요청한 체인 전송
          break;

        case "RESPONSE_CHAIN":
          this.handleChainResponse(msg.data); // 받은 체인 처리
          break;

        case "REQUEST_MEMPOOL":
          this.sendMempool(ws); // 요청한 mempool 전송
          break;

        case "RESPONSE_MEMPOOL":
          this.handleMempoolResponse(msg.data); // 받은 mempool 처리
          break;

        case "NEW_TRANSACTION":
          this.handleReceivedTransaction(msg.data); // 새 트랜잭션 수신
          break;

        case "NEW_BLOCK":
          this.handleReceivedBlock(msg.data); // 새 블록 수신
          break;
      }
    } catch (e) {
      console.error("Invalid message:", message);
    }
  }

  // 연결이 종료된 피어 정리
  handleClose(ws: WebSocket) {
    this.sockets = this.sockets.filter((s) => s !== ws);
  }

  // 특정 피어에게 메시지 전송
  sendMessage(ws: WebSocket, message: IMessage) {
    ws.send(JSON.stringify(message));
  }

  // 전체 피어에게 브로드캐스트
  broadcast(message: IMessage) {
    this.sockets.forEach((ws) => this.sendMessage(ws, message));
  }

  // 현재 체인 정보를 요청한 피어에게 전송
  sendChain(ws: WebSocket) {
    this.sendMessage(ws, {
      type: "RESPONSE_CHAIN",
      data: this.blockchain.chain,
    });
  }

  // 받은 체인 데이터를 이용해 현재 체인을 갱신
  handleChainResponse(newChain: any) {
    if (!Array.isArray(newChain)) return;
    if (this.blockchain.replaceChain(newChain)) {
      console.log("더 긴 유효한 체인을 수신하여 기존 체인을 교체했습니다.");
      this.mempool.transactions = []; // 체인이 갱신되었으므로 mempool 초기화
    }
  }

  // 현재 mempool 상태 전송
  sendMempool(ws: WebSocket) {
    this.sendMessage(ws, {
      type: "RESPONSE_MEMPOOL",
      data: this.mempool.transactions,
    });
  }

  // 받은 mempool 트랜잭션을 현재 mempool에 추가
  handleMempoolResponse(txs: any[]) {
    txs.forEach((txData) => {
      const tx = Object.assign(new Transaction([], []), txData);
      if (this.mempool.addTransaction(tx)) {
        console.log("수신된 mempool 트랜잭션 추가됨:", tx.id);
      }
    });
  }

  // 피어로부터 받은 트랜잭션 처리
  handleReceivedTransaction(txData: any) {
    const tx = Object.assign(new Transaction([], []), txData);
    if (this.mempool.addTransaction(tx)) {
      console.log("피어로부터 새로운 트랜잭션을 수신함:", tx.id);
      this.broadcast({ type: "NEW_TRANSACTION", data: tx });
    }
  }

  // 피어로부터 받은 블록 처리
  handleReceivedBlock(blockData: any) {
    const latestBlock = this.blockchain.getLatestBlock();

    // 체인에 블록을 직접 추가 (기본적인 연결 조건만 확인)
    if (blockData.previousHash === latestBlock.hash) {
      this.blockchain.chain.push(blockData); // 블록체인에 추가

      // 블록에 포함된 트랜잭션 ID를 기준으로 mempool에서 제거
      blockData.data.forEach((txId: string) =>
        this.mempool.removeTransaction(txId)
      );

      // TODO: 트랜잭션을 찾아서 UTXO 업데이트 필요
      blockData.data.forEach((txId: string) => {
        // 현재는 처리 안함 (보완 필요)
      });

      console.log("피어로부터 새로운 블록을 추가했습니다.");
      this.broadcast({ type: "NEW_BLOCK", data: blockData });
    } else {
      // 블록 연결이 안되면 체인 요청
      this.broadcast({ type: "REQUEST_CHAIN" });
    }
  }

  // 새로운 트랜잭션 생성
  createTransaction(toAddress: string, amount: number) {
    // 현재 지갑의 사용 가능한 UTXO 가져오기
    const utxos = this.utxoLedger.getUtxoAddress(this.wallet.publicKey);

    let accumulated = 0; // 누적 금액
    const inputs: TxInput[] = []; // 트랜잭션 입력
    let outputs: TxOutput[] = []; // 트랜잭션 출력

    // 필요한 금액만큼 UTXO 선택 (단순 누적 방식)
    for (const utxo of utxos) {
      accumulated += utxo.amount;
      inputs.push({
        txId: utxo.txId,
        outputIndex: utxo.outputIndex,
        signature: "",
        publicKey: "",
      });
      if (accumulated >= amount) break;
    }

    // 잔액 부족 확인
    if (accumulated < amount) {
      console.log("잔액이 부족합니다.");
      return;
    }

    // 트랜잭션 출력 생성: 수신자와 거스름돈
    outputs.push({ address: toAddress, amount });

    const change = accumulated - amount;
    if (change > 0) {
      outputs.push({ address: this.wallet.publicKey, amount: change });
    }

    // 트랜잭션 생성 및 서명
    const tx = new Transaction(inputs, outputs);
    tx.signInputs(this.wallet);

    // mempool에 추가 및 브로드캐스트
    if (this.mempool.addTransaction(tx)) {
      this.broadcast({ type: "NEW_TRANSACTION", data: tx });
      console.log("새 트랜잭션을 생성하고 네트워크에 전파했습니다.");
    }
  }

  // 블록 생성 (채굴)
  mineBlock(): boolean {
    // if (this.mempool.transactions.length === 0) {
    //   console.log("블록에 포함할 트랜잭션이 없습니다.");
    //   return false;
    // }

    // 블록에 포함할 데이터는 트랜잭션 ID 배열
    const data = this.mempool.transactions.map((tx) => tx.id);
    const coinbaseTx = new Transaction(
      [],
      [{ address: this.wallet.publicKey, amount: 50 }]
    );

    // 코인베이스 트랜잭션은 서명 필요 없지만,
    // 만약 서명이 필요하다면 signInputs 호출 가능
    // coinbaseTx.signInputs(this.wallet); // 보통 코인베이스는 서명 없음

    // 새 블록 데이터는 코인베이스 트랜잭션 ID + mempool 트랜잭션 ID 묶음
    const blockData = [coinbaseTx.id, ...data];

    // 새 블록 생성
    const newBlock = this.blockchain.addBlock(blockData);
    if (newBlock) {
      // 채굴된 트랜잭션을 기준으로 UTXO 업데이트
      // 코인베이스 트랜잭션과 mempool 내 트랜잭션 모두 UTXO 업데이트
      this.utxoLedger.updateTransaction(coinbaseTx);
      this.mempool.transactions.forEach((tx) =>
        this.utxoLedger.updateTransaction(tx)
      );

      // mempool 비우기
      this.mempool.transactions = [];

      // 피어에게 새 블록 전파
      this.broadcast({ type: "NEW_BLOCK", data: newBlock });
      console.log("새 블록을 채굴하고 피어들에게 전파했습니다.");
      return true;
    }

    return false;
  }
}


// 지갑에 초기 자금 제공 (테스트 목적)
function giveInitialBalance(node: P2PNode, amount = 20) {
  const fakeTxId = "tx-0001";
  const outputIndex = 0;
  const pubKey = node.wallet.publicKey;

  // UTXO 원장에 직접 초기 잔액 입력
  node.utxoLedger.utxos.push({
    txId: fakeTxId,
    outputIndex,
    address: pubKey,
    amount,
  });

  console.log(`지갑에 초기 자금 ${amount} 코인을 지급했습니다: ${pubKey}`);
}

// 노드 생성 및 초기화
const node = new P2PNode(3000, ["ws://192.168.0.75:3000"]);
giveInitialBalance(node); // 초기 자금 할당
