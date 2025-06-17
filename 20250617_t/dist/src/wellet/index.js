"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
const crypto_1 = require("crypto");
const elliptic_1 = __importDefault(require("elliptic"));
const crypto_js_1 = require("crypto-js");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dir = path_1.default.join(__dirname, "./data");
if (!fs_1.default.existsSync(dir)) {
    fs_1.default.mkdirSync(dir, { recursive: true });
}
// 타원 곡선 알고리즘 이름
// 타원 곡선의 형태를 정의하는 객체를 받고
const ec = new elliptic_1.default.ec("secp256k1");
class Wallet {
    // 랜덤 정수
    // 개인키
    // 지갑을 생성 했었으면 개인키를 가지고 있다.(노출되면 안된다.)
    // 지갑의 개인키를 가지고 있다 라는것 만으로 내가 지갑을 소유하고 있다.
    // 이미 지갑을 만든적이 있다 => 개인키 생성한적이 있다 즉 랜덤하게 생성한 값을 소유하고 있다.
    constructor(privateKey = "") {
        // 개인키 개인키가 있으면 사용하고 없으면 새로 생성
        this.privateKey = privateKey || this.setPrivateKey();
        // 개인키로 공개키를 생성
        this.publicKey = this.setPublickey();
        // 공개키의 문자열의 일부분을 잘라서 사용한 것이 지갑 주소
        this.account = this.setAccount();
        // 잔액
        this.balance = 0;
        // 새로 생성한 지갑은 지갑 파일 저장
        if (privateKey === "") {
            Wallet.createWallet(this);
        }
    }
    static createWallet(wallet) {
        const filepath = path_1.default.join(dir, wallet.account); // 확장자 txt
        // /data/wallet.account.txt
        fs_1.default.writeFileSync(filepath, wallet.privateKey);
    }
    static getWalletList() {
        const walletFiles = fs_1.default.readdirSync(dir);
        return walletFiles;
    }
    static getWalletPrivateKey(account) {
        const filepath = path_1.default.join(dir, account);
        const content = fs_1.default.readFileSync(filepath, "utf8");
        return content;
    }
    setPrivateKey() {
        // 랜덤한 32바이트의 개인키의 값을 만들고 
        // 해시 문자열로 변환해서 반환 16
        return (0, crypto_1.randomBytes)(32).toString("hex");
    }
    // 공개키 생성
    setPublickey() {
        // 반환값이 공개키의 내용
        // keyPair 는 공개키를 제공하는 메서드가 포함된 객체
        const keyPair = ec.keyFromPrivate(this.privateKey);
        // 개인키로 생성한 공개키를 조회 인코딩해서 반환
        return keyPair.getPublic().encode("hex", true);
    }
    // 지갑의 주소는 앞자리의 문자열을 잘라서 40자리의 문자열을 만들어서 지갑의 주소로 사용한다
    setAccount() {
        // 66개의 문자열에서 40 앞부분이 26개를 잘라서 반환
        return this.publicKey.slice(26);
    }
    // 누군가가 한 일이 맞는지 검증 비대칭키 개인키 공개키 
    // A -> B 에게 보물상자을 전달했는데 A가 B에게 보물상자의 키를 전달 B는 이 보물상자를 열기위해서 이 키를 사용해야한다.
    // 보물상자 안에 들어있는 내용은 A가 보물상자를 줬다는 내용이 들어있다 그리고 보물
    // 트랜잭션의 내용 즉 메시지를 증명할수 있는 키가 공개키 공개키로 검증할수 있는 값이 서명값
    // 메시지를 하나 만들어서 서명에 사용을 해보자
    static hashMessage(message) {
        return (0, crypto_js_1.SHA256)(message).toString();
    }
    // 서명 생성
    signMessage(message) {
        const hash = Wallet.hashMessage(message);
        // 키페어 객체를 가지고 서명을 생성
        // 타원 곡선의 형태와 기준점과 개인키 공개키
        const keyPair = ec.keyFromPrivate(this.privateKey);
        // 서명 생성
        // rsv
        // s 값을 짧게 작은 값으로 고정 표준 서명의 값
        // 메세지 문자열 해시값, hex 해시값으로 인코딩, options = {canonical}
        // canonical s 서명의 압축을 할지 => 표준 서명 형태로 정의
        const signature = keyPair.sign(hash, "hex", { canonical: true });
        // 서명 생성
        console.log(signature);
        // r s v(복구 구문)
        // r : 개인키를 통한 연산 => r 개인키의 값 (서명할때 필요한 해시값) 좌표를 구하기 위한 값
        // r = k * G
        // s : z의 값 r 서명값가 k값이랑 개인키 mod n  k-1 * k = 0 mod 
        // s = k(^-1) * (z + r * 개인키) mod n
        // k의 값은 k 랜덤한 난수 서명을 만들때 난수가 2 하나는 내가 알고있는 개인키는 이제 변하지 않지만
        // k 서명에 사용되는 난수는 매번 바뀐다. 한번 쓰고 버리는 값  (볼팬)
        // k는 서명을 만들대 마다 바귄다.
        // 개인키가 X
        // s가 서명 검증에 사용되는값.
        // 전달해주는 매개변수의 값 v 비유를해서 쉽게 보조의 값 공개키로 복원할때 사용되는 보조의 정보
        // 실제 서명값은 r s
        // z 메시지 내용 메시지도 서명에 포함되는 이유
        //keyPair 타원곡선의 형태 개인키 공개키 기준점
        /*
            Signature {
                r: BN {       bigint 큰 정수를 표현하기 위해서
                    negative: 0, // 양수
                    words: [ 32바이트로 정수를 쪼개서 배열의 형태로 나타낸것.
                    42599977, 25375453,
                    65703707,  4081356,
                    30868342,  6176210,
                    49996119, 29656358,
                    14300875,  3693055
                    ],
                    length: 10, // 배열의 길이
                    red: null // 모듈 연산자 내용
                },
                s: BN {
                    negative: 0,
                    words: [
                    37864557, 36399730, 58395216, 34748803,
                    57523347, 61173843, 62891304, 62607195,
                    59119083,   865774,        0,        0,
                            0,        0,        0,        0,
                            0,        0,        0,        0,
                            0,        0,        0,        0,
                            0,        0,        0,        0,
                            0,        0
                    ],
                    length: 10,
                    red: null
                },
                recoveryParam: 0
                }
        */
        // 서명을 인코딩해서 16진수 문자열로 변환해서 반환.
        return signature.toDER("hex");
    }
    // 서명 검증
    static verifySignature(message, signature, publickKey) {
        const hash = Wallet.hashMessage(message);
        // 공개키를 가지고 있는 객체를 생성
        // 검증 메서드를 호출할수 있다 서명 검증
        const key = ec.keyFromPublic(publickKey, "hex");
        // verify 
        // 해시문자열 => 메시지를 해시화한 문자열
        // hash => 내용이 어떤 일
        // 그 행위가 영수증에 기록되듯이 만든값이 서명값.
        return key.verify(hash, signature); // => signature(영수증에 기록된 서명이 올바른지 확인)
    }
}
exports.Wallet = Wallet;
