// 해시값을 만들떄 필요한 데이터 전달 형태
export interface BlockHashDto { //3
    version : string;
    height : number;
    timestamp : number;
    previousHash : string;
    difficulty : number;
    merkleRoot : string;
    nonce : number;
}