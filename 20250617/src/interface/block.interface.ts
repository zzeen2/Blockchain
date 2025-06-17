// 블록 헤더내용
export interface IBlockHeader {
    version : string; 
    height : number;
    timestamp : number;
    previousHash : string;
    merkleRoot : string;
    hash : string;
    nonce : number;
    difficulty : number;
}

export interface IBlock extends IBlockHeader {
    data : string[];
}