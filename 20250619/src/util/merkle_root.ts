import merkle from "merkle";
import { BlockBody } from "../interface/block_body";

export const createMerkleRoot = ( {data} : BlockBody) : string => { //8
    if (data.length === 0) return "트랜잭션의 길이 에러";
    // if (data.length === 0) throw new Error("트랜잭션의 길이 에러" ); // 에러를 던졌다. => 이후 코드가 중단 ( 타입의 영향을 안받음 )
    const merkleTree = merkle("sha256").sync(data);
    return merkleTree.root();
}