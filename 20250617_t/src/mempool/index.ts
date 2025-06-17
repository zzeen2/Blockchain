import { IMempool } from "../interface/mempool.interface";
import { Transaction } from "../transaction";

// Mempool 용어
// 이더리움 제안서 
// Mempool 거래의 처리 내용들을 담아놓을 객체의 공간
// 다른 사람의 거래를 처리해주는 내용을 
// 거래 발생하면 => mempool 
// 거래 발생하면 => 내가 만든 mempool에 담는다(수수료 지불자) => mempool에 담는다.
export class Mempool implements IMempool {
    transactions: Transaction[];

    constructor () {
        this.transactions = [];
    }

    // 거래가 발생했다
    // 트랜잭션 생성 트랜잭션 추가
    // 트랜잭션 추가가 정상적으로 되었다. 서명검증이 즉 거래의 검증이 잘되었다.
    addTransaction(tx : Transaction) : boolean {
        // 서명 검사
        if(tx.verifyInputs()){
            // 중복 체크
            const exists = this.transactions.find(item => item.id === tx.id);
            if(exists) return false;
            this.transactions.push(tx);
            return true;
        } else {
            return false;
        }
    }

    // 트랜잭션이 처리가 되었다.
    // 처리된 거래는 배열에서 제거
    removeTransaction (txId : string) : void {
        this.transactions = this.transactions.filter(tx => tx.id !== txId);
    }
}