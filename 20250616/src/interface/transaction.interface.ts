export interface TxInput {
    txId : string; // 이전 트랜잭션의 ID
    outputIndex : number; // 이전 거래의 인덱스
    signature?: string; // 서명값(입력 출력의 값을 개인키로 서명한 값)
    publicKey?: string; // 공개키 서명의 검증에 필요한 값
}
// ?: 키의 값이 포함되어도 되고, 포함되지 않아도 된다. 하지만 사용한다면 키를 사용할때 타입이 다르면 에러 발생
// 코인베이스 트랜잭션 

export interface TxOutput{
    address : string; // 비트코인에서는 "주소", 이더리움 이후에는 "계정"이라는 용어를 사용  
    amount : number;
}

export interface ITransaction {
    id : string; // 트랜잭션의 아이디. 트랜잭션 식별자
    inputs : TxInput[];
    outputs : TxOutput[];
}  