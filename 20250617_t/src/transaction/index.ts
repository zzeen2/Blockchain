import { SHA256 } from "crypto-js";
import { ITransaction, TxInput, TxOutput } from "../interface/transaction.interface";
import { Wallet } from "../wellet";

export class Transaction implements ITransaction {
    id: string;
    inputs: TxInput[];
    outputs: TxOutput[];

    constructor(inputs : TxInput[], outputs : TxOutput[]) {
        this.inputs = inputs;
        this.outputs = outputs;
        this.id = this.calculateHash(); // 고유 식별자
        // 이전 트랜잭션을 조회해서 다음 거래를 처리할때 식별하는 값
    }

    calculateHash () : string {
        return SHA256(JSON.stringify(this.inputs) + JSON.stringify(this.outputs)).toString();
    }

    // 트랜잭션의 서명값을 input에 서명값을 포함
    // inputs에는 내용만 담고
    // 실제로 거래를 발생시키는 지갑의 서명과 공개키의 값을 할당할 메서드
    signInputs(wallet : Wallet) : void {
        this.inputs.forEach((input) => {
            input.publicKey = wallet.publicKey;
            input.signature = wallet.signMessage(this.id); // 거래내용을 검증하기위한 서명값
        })
    }

    // 서명 검증 거래가 올바른지
    // 여러개의 값을 검증
    // 배열의 메서드
    // every 배열안에 있는 모든 값이 만족하는지 검사
    // 하나라도 틀리면 false 반환한다.
    // () => {} 콜백의 매개변수는 첫번째 요소 두번재 인덱스
    verifyInputs() : boolean {
        return this.inputs.every((input) => {
            // 둘중에 하나라도 없으면
            if(!(input.signature && input.publicKey)) return false;

            try {
              return Wallet.verifySignature(
                this.id,
                input.signature,
                input.publicKey
              )
            } catch (error) {
              return false;   
            }
        })
    }
}