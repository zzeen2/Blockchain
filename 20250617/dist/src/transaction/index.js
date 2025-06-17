"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const crypto_js_1 = require("crypto-js");
const wallet_1 = require("../wallet");
class Transaction {
    constructor(inputs, outputs) {
        this.inputs = inputs;
        this.outputs = outputs;
        this.id = this.calculateHash(); // 고유 식별자
        // 이전 트랜잭션의 조회해서 다음 거래를 처리할때 식별하는 값
    }
    calculateHash() {
        return (0, crypto_js_1.SHA256)(JSON.stringify(this.inputs) + JSON.stringify(this.outputs)).toString();
    }
    // 트랜잭션의 서명값을 input에 서명값을 포함
    // inputs에는 내용만 담고
    // 실제로 거래를 발생시키는 지갑의 서명과 공개키의 값을 할당할 메서드
    signInputs(wallet) {
        this.inputs.forEach((input) => {
            input.publicKey = wallet.publicKey;
            input.signature = wallet.signMessage(this.id); // 거래내용을 검증하기 위한 서명값.
        });
    }
    // 서명 검증 거래가 올바른지
    // 여러개의 값을 검증
    // 배열의 메서드
    // every 배열안데 있는 모든 값이 만족하는지 검사
    // 하나라도 틀리면 false 반환한다.
    // () => {} 콜백의 매개변수는 첫번째 요소 두번째 인덱스
    verifyInputs() {
        return this.inputs.every((input, index) => {
            if (!input.signature || !input.publicKey)
                return false; // 둘중에 하나라도 없으면 === !(input.signature && input.publicKey)
            try {
                return wallet_1.Wallet.verifySignature(this.id, input.signature, input.publicKey);
            }
            catch (error) {
                return false;
            }
        });
    }
}
exports.Transaction = Transaction;
