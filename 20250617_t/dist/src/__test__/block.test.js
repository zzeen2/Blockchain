"use strict";
// describe 테스트의 그룹을 정의할때 사용하는 함수
Object.defineProperty(exports, "__esModule", { value: true });
// 테스트 코드 jest 실행 명령어
// npx jest 
const block_1 = require("../block");
const contents_1 = require("../contents");
// 해당 테스트들의 내용을 묶는역활
describe("block 테스트", () => {
    // 블록 인스턴스 저장할 변수
    let block;
    // 블록의 순서와 블록의 난이도 조정을 담당
    let blockChain = [];
    // it 테스트의 가장 작은 단위
    // test 
    test("블록 생성", () => {
        const data = ["block tx01"];
        console.time("block create...");
        block = new block_1.Block("1.0.0", 0, 0, "0".repeat(64), 1, data);
        block.mine();
        console.timeEnd("block created");
    });
    test("이전 블록 검증", () => {
        const data = ["block tx02"];
        const block2 = new block_1.Block(block.version, block.height + 1, new Date().getTime(), block.hash, 1, data);
        block2.mine();
        block_1.Block.isValidBlock(block2, block);
        console.log("검증 완료");
    });
    test("제네시스 블록 추가", () => {
        console.log("제네시스 블록 추가");
        blockChain.push(new block_1.Block(contents_1.GENESIS.version, contents_1.GENESIS.height, contents_1.GENESIS.timestamp, contents_1.GENESIS.previousHash, contents_1.GENESIS.difficulty, contents_1.GENESIS.data));
    });
    test(`블록 마이닝`, () => {
        for (let i = 1; i < 10; i++) {
            console.log(`${i} 번째 블록 마이닝 시작`);
            console.time("block mine...");
            const data = [`block ${i} tx`];
            console.log(blockChain[i - 1]);
            const previousBlock = blockChain[i - 1];
            const block = new block_1.Block("1.0.0", i, new Date().getTime(), previousBlock.hash, 100000, data);
            block.mine();
            console.time("block created");
            blockChain.push(block);
        }
        console.log(blockChain);
    });
});
