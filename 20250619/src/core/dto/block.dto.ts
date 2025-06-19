// 블록을 생성할때 전달할 데이터 형태
export interface BlockDto { //2
    version : string;
    height : number;
    timestamp : number;
    previousHash : string;
    difficulty : number;
}