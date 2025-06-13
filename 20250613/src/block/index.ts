import merkle from "merkle";
import { IBlock } from "../interface/block.interface";
import { SHA256 } from "crypto-js";
import { MAX_TARGET } from "../contents";


export class Block implements IBlock {
    version: string;
    height: number;
    timestamp: number;
    previousHash: string;
    merkleRoot: string;
    hash: string;
    nonce: number;
    difficulty: number;
    data: string[];

    constructor(
        version: string,
        heigth: number,
        timestamp: number,
        previousHash: string,
        difficulty: number,
        data: string[]) {
            this.version = version;
            this.height = heigth;
            this.timestamp = timestamp;
            this.previousHash = previousHash;
            this.difficulty = difficulty;
            this.merkleRoot = Block.getMerkleRoot(data);
            this.data = data;
            this.nonce = 0;
    }

    static getMerkleRoot (data : string[]) : string {
        if(data.length === 0) return "";
        const merkleTree = merkle("sha256").sync(data);
        return merkleTree.root();
    } 

    // 현재 블록 해시값을 계산하는 메서드
    // 다음 블록에 이전블록 해시의 값으로 할당될 값
    createHash () : string {
        // 해시값을 구해서 해시 문자열로 반환
        return SHA256(`${this.version}${this.height}${this.timestamp}${this.previousHash}${this.merkleRoot}${this.difficulty}${this.nonce}`).toString();
    }

    // 
    // 난이도를 0 해시값 목표값을 정해서 그 목표값 보다 작으면 정답을 맞춘거고 블록 생성 권한을 얻는다.
    // 비트코인의 제네시스 블록의 목표 해시값
    // 0x00000000FFFF0000000000000000000000000000000000000000000000000000
    // 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
    // 이 해시값의 크기와 난이도를 나눠서 나온 목표값보다 낮은 해시값을 구하면 블록 생성 권한을 얻는다.

    // 비트코인 최대 타겟의 목표값 난이도가 1일때 최대값으로 지금 테스트를 해야하니 값을 
    // 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
    // 난이도가 높아질수록 목표값은 이 최대값을 난이도로 나눈 값이 되어 줄어든다
    // 난이도가 높아질수록 블록의 생성이 힘들어지고 컴퓨터의 발전을 생각해서 만든 개념

    // 난이도에 따른 목표값을 반환할 함수
    // 숫자형 타입 중 무척 엄청 큰수를 표현하는 타입 bigint
    // bigint
    getTarget() : bigint  {
        return MAX_TARGET / BigInt(this.difficulty);
    }

    // 난이도 2
    // 00000010
    // 현재 블록의 해시값을 해시 값의 표현
    // 0x 가 붙었을때 해시값으로 이해를 한다.
    // 난이도에서 목표값과 비교할 해시값을 반환
    hashToBigint() : bigint {
        return BigInt("0x" + this.hash);
    }

    // 마이닝 블록 채굴
    mine() {
        const target = this.getTarget();
        while(true) {
            this.nonce++;
            this.hash = this.createHash();

            if(this.hashToBigint() <= target) break;
        }
    }

    // 블록을 만들때 유효성 검증
    static isValidBlock (block : Block, previousBlock : Block) : boolean {
        // 블록 높이 검증
        if(block.height !== previousBlock.height + 1) return false;
        // 이전 블록 해시 검증
        if(block.previousHash !== previousBlock.hash) return false;
        // 블록 해시 다시 검증
        if(block.createHash() !== block.hash) return false;

        return true;
    }
}