"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBlockHash = void 0;
const crypto_js_1 = require("crypto-js");
//14
const createBlockHash = (BlockHashDto) => {
    let BlockHash = "";
    for (const key in BlockHashDto) {
        BlockHash += BlockHashDto[key];
    }
    return (0, crypto_js_1.SHA256)(BlockHash).toString();
};
exports.createBlockHash = createBlockHash;
