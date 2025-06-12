export interface IBlockHeader {
    version : string // 블록의 버전
    height : number // 블록의 인덱스
    timestamp : number // 블록의 생성 시간
    previousHash : string // 이전 블록 해시
    hash : string // 블록의 해시
    nonce : number // 증명 알고리즘 방식 반복 횟수
    deffculty : number // 블록의 난이도
    merkleRoot : string // 머클 트리의 루트값 거래내용을 더한 해시값
}

// 인터페이스끼리 상속
export interface IBlock extends IBlockHeader {
    data : string[] // 블록의 거래 내용들 트랜잭션
}