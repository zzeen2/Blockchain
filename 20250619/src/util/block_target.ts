import { MAX_TARGET } from "../constant"

//10
export const createBlockTarget = (difficulty : number) : bigint => { //10-1
    return BigInt(MAX_TARGET) / BigInt(difficulty); // 10-3
}