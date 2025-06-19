import { BlockBody } from "../interface";
import { Block } from "./block";
import { BlockDto } from "./dto";

// 22
class Chain {
    blocks : Block[]=[];

    constructor() {
    }

    // 인스턴스에 포함되어있어야하면서 외부에서 호출이 되어야 하는 메서드
    getLatestBlock() : Block {
        return this.blocks[this.blocks.length -1 ];
    }
    
    // 블록을 생성하고 추가
    generateblock (blockBody : BlockBody) { 
        const previousBlock = this.getLatestBlock();
        const blockDto : BlockDto = {
            version: "1.0.0",
            height: previousBlock.height,
            timestamp: Math.floor(Date.now()/1000),
            previousHash: previousBlock.hash,
            difficulty: this.adjustDifficulty()
        }
        const newBlock = new Block(blockDto, blockBody)
        this.blocks.push(newBlock);
        return newBlock
    }

    // 인스턴스 내부에서만 호출되어야하는 메서드
    private adjustDifficulty() : number{
        const latestBlock = this.getLatestBlock();
        const prevAdjustBlock = this.blocks[latestBlock.height - 10];
        // 블록 생성 목표시간 
        const timeExpected = 600 * 10 * 10; 
        // 이전 블록에서 걸린 시간
        if(!prevAdjustBlock) return latestBlock.difficulty;
        const timeTaken = latestBlock.timestamp - prevAdjustBlock.timestamp;

        if(timeTaken < timeExpected /2 ) {
            return prevAdjustBlock.difficulty + 1;
        }else if(timeTaken > timeExpected * 2){
            return prevAdjustBlock.difficulty - 1;
        }else {
            return prevAdjustBlock.difficulty;
        }
    }
}