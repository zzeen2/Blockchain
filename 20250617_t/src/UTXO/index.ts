import { IUTXOLedger, UTXO } from "../interface/UTXO.interface";
import { Transaction } from "../transaction";

export class UTXOLedger implements IUTXOLedger {
    utxos: UTXO[];

    constructor() {
        this.utxos = [];
    }

    // 거래가 새로 발생하면 UTXO 내용 업데이트
    // 새로 발생한 거래의 출력값 할당
    // 미사용 객체 업데이트
    // 트랜잭션은 검증 끝났고 블록 생성 되었을때
    updateTransaction (tx : Transaction) {
        // 입력값
        // 사용하는 값을 빼고 이전 트랜잭션의 내용과 같은 거래가 있다면 
        // 이전 거래에서 출력된 값은 그 잔액에 사용된다.
        tx.inputs.forEach(input => {
            this.utxos = this.utxos.filter(
                (utxo) => !(utxo.txId === input.txId && utxo.outputIndex === input.outputIndex) 
            )
        })

        // 새로 만든 출력값 UTXO에 추가
        tx.outputs.forEach((output, index) => {
            this.utxos.push({
                txId : tx.id,
                outputIndex : index,
                address : output.address,
                amount : output.amount
            })
        })
    }

    // 특정 주소가 가지고 있는 UTXO 반환 
    // 즉 지갑의 잔액 조회
    // 연산의 용도로 사용 
    // utxo 계산을 하기 위해서
    getUtxoAddress (address : string) : UTXO[]  {
        return this.utxos.filter(utxo => utxo.address === address);
    }

    // 유저의 지갑에서 표현될 전체 잔액
    // 배열 메서드 reduce
    getBalance(address : string) : number {
        // reduce 반복적으로 배열의 값을 더한다던지?
        // 최소 공배수 최대 공배수
        return this.getUtxoAddress(address).reduce((acc, utxo) => acc + utxo.amount, 0)
    }
}