"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockChain = void 0;
const ts_node_1 = require("ts-node");
const block_1 = require("../block");
const contents_1 = require("../contents");
class BlockChain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.blockGenerateInterval = 600;
        this.blockAdjestMentInterval = 10; // 10블록마다 난이도 조절
    }
    createGenesisBlock() {
        return new block_1.Block(contents_1.GENESIS.version, contents_1.GENESIS.height, contents_1.GENESIS.timestamp, contents_1.GENESIS.previousHash, contents_1.GENESIS.difficulty, contents_1.GENESIS.data);
    }
    // 체인에서 가장 마지막 블록 반환
    // 내가 마이닝할때
    // 내가 체인에 블록을 추가하기 위해서 이전 블록은 체인에 가장 마지막 블록
    // 난이도 조정을 하기 위해서 마지막 블록과 마지막 블록의 이전 10번째 블록을 계산해서 난이도 조정
    getLatesBlock() {
        return this.chain[this.chain.length - 1];
    }
    // 새로운 블록을 체인에 저장
    addBlock(data) {
        const previousBlock = this.getLatesBlock();
        const newBlock = new block_1.Block(ts_node_1.VERSION, previousBlock.height + 1, Math.floor(Date.now() / 1000), previousBlock.hash, 
        // this.adjustDifficulty(), // 블록의 생성 시간에 따라서 난이도가 조정되어야 한다.
        100000, // 난이도
        data);
        // 마이닝
        newBlock.mine();
        // 블록 유효성 검사
        if (block_1.Block.isValidBlock(newBlock, previousBlock)) {
            this.chain.push(newBlock);
            return newBlock;
        }
        else {
            return null;
        }
    }
    // 난이도 조정
    // 최근 블록 생성 시간과 목표 생성 시간을 비교해서 난이도를 변경
    adjustDifficulty() {
        const latesBlock = this.getLatesBlock();
        // 마지막 블록 이전 10번째
        const prevAdjectmentBlock = this.chain[latesBlock.height - this.blockAdjestMentInterval];
        // 총 목표 시간 주기만큼의 블록이 생성되는 목표 시간
        const timeExpected = this.blockGenerateInterval * this.blockAdjestMentInterval;
        // 이전 10번째 블록 부터 걸린 시간
        if (!prevAdjectmentBlock)
            return latesBlock.difficulty;
        const timeTaken = latesBlock.timestamp - prevAdjectmentBlock.timestamp; // 차이값
        // 생성 시간보다 빨리 생성되면 난이도를 증가
        // 생성시간보다 빠른지 계산하는 공식
        if (timeTaken < timeExpected / 2) {
            return prevAdjectmentBlock.difficulty + 1;
        }
        else if (timeTaken > timeExpected * 2) {
            // 생성 예상 시간보다 느리다면 난이도 감소
            // 공식 = 예상시간보다 총 목표시간 두배의 시간보다 걸리면 난이도 감소
            return prevAdjectmentBlock.difficulty - 1;
        }
        else {
            return prevAdjectmentBlock.difficulty;
        }
    }
    // 체인의 유효성 검사
    static isValidChain(chain) {
        for (let i = 1; i < chain.length; i++) {
            if (!block_1.Block.isValidBlock(chain[i], chain[i - 1])) {
                return false;
            }
        }
        return true;
    }
    // 내가 가지고있는 체인의 길이가 더 작은지 
    // 롱기스트 체인 룰
    replaceChain(newChain) {
        const isValid = BlockChain.isValidChain(newChain); // 유효성 검사
        const isLong = newChain.length > this.chain.length; // 길이가 더 긴 체인인지 검증
        if (isValid && isLong) {
            // 내 체인 교체 
            this.chain = newChain;
            return true;
        }
        else {
            // 내 체인 교체 x
            return false;
        }
    }
}
exports.BlockChain = BlockChain;
