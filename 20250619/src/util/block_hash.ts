import { SHA256 } from "crypto-js";
import { BlockHashDto } from "../core/dto";

//14
export const createBlockHash = (BlockHashDto : BlockHashDto) => {
    let BlockHash = "";
    for (const key in BlockHashDto) {
        BlockHash += BlockHashDto[key];
        
    }
    return SHA256(BlockHash).toString();
}