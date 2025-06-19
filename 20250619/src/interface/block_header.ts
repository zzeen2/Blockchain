export interface BlockHeader { //19
    version : string;
    height : number;
    timestamp : number;
    previousHash : string;
    difficulty : number;
    merkleRoot : string;
    nonce : number;
}