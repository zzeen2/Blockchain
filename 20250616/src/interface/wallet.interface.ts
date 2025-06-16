export interface Iwallet {
    account : string, // 공개키로 만든 주소의 값 내 지갑의 계좌번호. 비밀키 계좌의 비밀번호 지갑 주소 해시문자열
    privateKey : string, // 개인키
    publicKey : string, // 공개키
    balance : number, // 잔액 -> 사용자에게 제공하기 위한 인터페이스 -> UTXO (자산의 내용 {account : 10})
}