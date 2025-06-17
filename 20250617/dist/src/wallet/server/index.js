"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const __1 = require("..");
// 단순하게 파일시스템으로 html 응답해주는 구조로 실습
const app = (0, express_1.default)();
app.use(express_1.default.urlencoded({ extends: false }));
app.use(express_1.default.json());
// 페이지 라우터
app.get("/", (req, res) => {
    const page = fs_1.default.readFileSync(path_1.default.join(__dirname, "..", "/view/index.html"), "utf8"); // 동기적으로
    res.send(page);
});
// api 데이터 라우터 
// 지갑 목록 조회 
// restful api 연습하자
app.get("/wallets", (req, res) => {
    const list = __1.Wallet.getWalletList();
    res.json(list);
});
// 지갑 생성
app.post("/wallet", (req, res) => {
    res.json(new __1.Wallet());
});
// 이미 있는 지갑 조회
app.get("/wallet/:id", (req, res) => {
    const { id } = req.params;
    const privateKey = __1.Wallet.getWalletPrivateKey(id);
    res.json(new __1.Wallet(privateKey));
});
app.listen(3000, () => {
    console.log("server on~");
});
