"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const index_1 = require("../index");
const fs_1 = __importDefault(require("fs"));
const app = (0, express_1.default)();
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
// 페이지 라우터
app.get("/", (req, res) => {
    const page = fs_1.default.readFileSync(path_1.default.join(__dirname, "..", "/view/index.html"), "utf8");
    res.send(page);
});
// api 데이터 라우터
// 지갑 목록 조회
// restfll
app.get('/wallets', (req, res) => {
    const list = index_1.Wallet.getWalletList();
    res.json(list);
});
// 지금 내용 잘 공부해놔야
// 지갑 생성
app.post("/wallet", (req, res) => {
    res.json(new index_1.Wallet());
});
// 이미 있는 지갑 조회
app.get("/wallet/:id", (req, res) => {
    const { id } = req.params;
    const privateKey = index_1.Wallet.getWalletPrivateKey(id);
    res.json(new index_1.Wallet(privateKey));
});
// 
app.listen(3000, () => {
    console.log("server on");
});
