export interface UTXO {
    txId : string; // 거래 아이디
    outputIndex : number; // 출력값 인덱스
    address : string; // 미사용 객체에서 (UTXO)에서 잔액의 소유주
    amount : number; // 받은 금액
}

export interface IUTXOLedger {
    utxos : UTXO[];
} 