"use strict";
// 테스트의 그룹
// describe 테스트의 그룹 정의
Object.defineProperty(exports, "__esModule", { value: true });
const chain_1 = require("../chain");
// 관련된 테스트의 내용을 묶어주는 역할
describe("block chain 동작 테스트", () => {
    // 생성할 블록의 갯수
    const CREATE_BLOCK_NUM = 100;
    let blockchain;
    // beforeEach 각 테스트의 사전에 호출 되는 함수
    // 각 테스트마다 먼저 호출되어야하는 로직
    beforeEach(() => {
        blockchain = new chain_1.BlockChain(); // 제네시스 블록이 하나 생성되어 있는 chain 인스턴스
    });
    test(`블록 생성 테스트 ${CREATE_BLOCK_NUM}개 체인 추가 검증`, () => {
        for (let i = 0; i < CREATE_BLOCK_NUM; i++) {
            const data = [`block num ${i} tx`];
            console.time("block create ... ");
            const block = blockchain.addBlock(data); // 블록 생성 하고 마이닝 하고 유효성 검사 통과하면 블록 반환 못하면 null
            console.timeEnd("block created");
            if (block) {
                console.log(`블록 ${block.height}번 / 난이도 ${block.difficulty} / 논스 ${block.nonce}`);
            }
        }
    });
});
