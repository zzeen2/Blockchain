import { Block } from "./core";
import { BlockBody , BlockHeader} from "./interface";

// 커멘드 + . 프로퍼티 자동완성
const genesisHeader : BlockHeader = { //17 //20 
    version: "1.0.0",
    height: 0,
    timestamp: 1231006505000,
    previousHash: "0".repeat(64),
    difficulty: 1,
    merkleRoot: "4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b",
    nonce: 2083236893
}

const genesisBody : BlockBody = { //18
    data : ["The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"]
}

// genesisBlock은 하드코딩
const genesisBlock = new Block(genesisHeader, genesisBody); //21
console.log(genesisBlock); 