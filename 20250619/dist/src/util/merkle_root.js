"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMerkleRoot = void 0;
const merkle_1 = __importDefault(require("merkle"));
const createMerkleRoot = ({ data }) => {
    if (data.length === 0)
        return "트랜잭션의 길이 에러";
    // if (data.length === 0) throw new Error("트랜잭션의 길이 에러" ); // 에러를 던졌다. => 이후 코드가 중단 ( 타입의 영향을 안받음 )
    const merkleTree = (0, merkle_1.default)("sha256").sync(data);
    return merkleTree.root();
};
exports.createMerkleRoot = createMerkleRoot;
