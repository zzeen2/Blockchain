import express from "express";
import path from "path";
import fs from "fs";
import { Wallet } from "..";

// 단순하게 파일시스템으로 html 응답해주는 구조로 실습
const app = express();

app.use(express.urlencoded({extends : false}))
app.use(express.json());

// 페이지 라우터
app.get("/", (req,res) => {
    const page = fs.readFileSync(path.join(__dirname, "..","/view/index.html"), "utf8"); // 동기적으로
    res.send(page);
})

// api 데이터 라우터 
// 지갑 목록 조회 
// restful api 연습하자
app.get("/wallets", (req,res)=> {
    const list = Wallet.getWalletList();
    res.json(list);
})

// 지갑 생성
app.post("/wallet", (req,res) => {
    res.json(new Wallet());
})

// 이미 있는 지갑 조회
app.get("/wallet/:id", (req,res) => {
    const {id} = req.params;
    const privateKey = Wallet.getWalletPrivateKey(id);
    res.json(new Wallet(privateKey));
})

app.listen(3000, ()=> {
    console.log("server on~")
})