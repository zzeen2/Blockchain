// p2p 요청을 보낼때 어떤 형태의 데이터를 보낸건지 
// ws 라이브러리 설치
import WebSocket, { WebSocketServer } from "ws";

import { BlockChain } from "../chain";
import { Mempool } from "../mempool"
import { UTXOLedger } from "../UTXO";
import { Wallet } from "../wallet";

// GET / http 1.1 
export interface IMessage {
    type : string // 메세지의 유형
    data? : any // 선언할때 정할 데이터 타입
}

// IP2PNode 
export interface IP2PNode {
    blockchain : BlockChain; // 블록체인 인스턴스
    mempool : Mempool; // 트랜잭션 풀 인스턴스
    utxoLedger : UTXOLedger; // utxo 인스턴스
    wallet : Wallet; // 지갑 인스턴스
    sockets : WebSocket[]; // 연결할 피어의 내용을 저장할 배열

    server : WebSocketServer; // p2p 네트워크 구조의 서버를 실행할 인스턴스
    httpPort : number; // 포트번호
}