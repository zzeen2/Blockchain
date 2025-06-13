import { Block } from "../block";

export interface Ichain {
    chain : Block[];
    blockGenerateInterval : number; // 목표시간 비트코인 블록 생성단 10분을 목표시간
    blockAdjestMentInterval : number; // 비트코인 몇개의 블록 마다 난이도 조절을 할지 2016개 마다 난이도 조절을 한다.   
    
}