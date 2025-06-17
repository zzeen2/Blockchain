import { Block } from "../block";

export interface IChain {
    chain : Block[];
    blockGenerateInterval : number; // 비트코인 목표시간 비트코인은 블록 생성당 10분을 목표시간
    blockAdjestMentInterval : number; // 비트코인 몇개의 블록 마다 난이도 조절을 할지 2016개 마다 난이도 조절을 한다.
}