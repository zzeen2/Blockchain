// 16진수 문자열을 bigint로 형변환 

import { IBlock } from "../interface/block.interface";

// 난이도 1의 기준으로 최댓값
export const MAX_TARGET = BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");

// 제네시스 블록
export const GENESIS : IBlock = {
    version : "1.0.0",
    height : 0,
    timestamp : 1231006505000, // 2009.01.03 18 : 15 : 05 UTC  1231006505000 밀리세컨드
    previousHash : "0".repeat(64),
    merkleRoot : "4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b",
    nonce : 2083236893, 
    difficulty : 1,
    hash : "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
    data : ["The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"]
}