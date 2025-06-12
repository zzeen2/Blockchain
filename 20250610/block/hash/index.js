// 값의 해시화
// 비트코인과 이더리움
// sha256 방식의 해시 알고리즘을 사용한다.

// sha256 블록체인에서 가장 많이 채택되고있는 암호 방식
// 256비트로 구성된 64자리의 문자열로 암호화를 한다.
const {SHA256} = require("crypto-js");

const str = "hello"
console.log(SHA256(str).toString());
console.log(SHA256(str).toString().length);
// 머클루트에서 sha256으로 암호화를 하고 거래내용을 암호화
// 단방향 암호화

// 머클루트

// 거래 내용들
// A, B, C, D
// A(해시화) + B(해시화), C(해시화) + D(해시화)
// AB, CD
// AB(해시화) + CD(해시화)
// ABCD

// 이러한 구조를 머클 트리
// 마지막에 모두 더하고 해시된 값을 머클 루트라고한다.

const merkle = require('merkle');

const transctions = ["A", "B", "C", "D", "E"];

const merkleTree = merkle("sha256").sync(transctions);
console.log(merkleTree);

const root = merkleTree.root(); // 머클루트 반환
console.log(root);
// 단방향이라면서 검증은 어떻게할거냐?
// 원본을 알아야 검증이 되는게 아니고
// 암호화를 다시 해봐 
// 다시 암호화를해서 값이 같으면 검증 통과

// 블록의 해시 검증 또한 같아. 다시 암호화

// 여기서 SHA256을 가지고 머클루트 만들어 보기
// AE4F3A195A3CBD6A3057C205DEF94520930F03F51F73C5A540D8FDAB05163FEF 값 같은지 확인 같아야