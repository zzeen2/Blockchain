import { BlockBody } from "../interface/block_body";
import { createMerkleRoot } from "../util";
import { createBlockHash } from "../util/block_hash";
import { createBlockTarget } from "../util/block_target";
import { BlockDto, BlockHashDto } from "./dto";

export class Block { // 1
    // 하드코딩 6
    version : string;
    height : number;
    timestamp : number;
    previousHash : string;
    merkleRoot : string;
    hash : string;
    nonce : number;
    difficulty : number;
    data : string[];

    // 5 (dto 만들고 가져오기 )
    constructor(headers : BlockDto, body:BlockBody ) { 
        this.version = headers.version;
        this.height = headers.height;
        this.timestamp = headers.timestamp;
        this.previousHash = headers.previousHash
        this.difficulty = headers.difficulty;
        this.data = body.data

        // 7
        this.nonce = 0;
        this.setMerkleRoot(body);
        this.setHash();
    }
    // private 외부에서 이 클래스로 만든 인스턴스에서 호출을 할 수 없다.
    private setMerkleRoot (body : BlockBody) {
        // 머클루트의 기능 util에 빼놓자
        this.merkleRoot = createMerkleRoot(body); //9
        
    }

    // 본인 인스턴스의 해시를 만들때
    // 마이닝
    private setHash() {
        // 해시를 만드는 기능을 utill
        // 목표값 블록의 생성권한을 얻는 목표값
        // 목표값보다 낮은 해시값을 구하는 것 PoW
        const target = createBlockTarget(this.difficulty); //11
        // 블록 생성 
        // 해시값을 만들기 위한 DTO 
        const createHashDto : BlockHashDto = { // 12
            version : this.version,
            height : this.height,
            timestamp : this.timestamp,
            previousHash : this.previousHash,
            difficulty : this.difficulty,
            merkleRoot : this.merkleRoot,
            nonce : this.nonce
        }

        while(true) {
            // 블록 해시 생성
            const currentHash = createBlockHash(createHashDto); //15
            this.hash = currentHash;
            this.nonce ++ ;

            if(BigInt("0x" + currentHash) <= BigInt(target)) break; //16 //13
        }
    }
}