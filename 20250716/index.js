const {ethers} = require("ethers");
const wallet = ethers.Wallet.createRandom();

console.log("주소 :", wallet.address);
console.log("개인키 : ", wallet.privateKey)

// 메세지를 만들어서 내가 했어요 증명
const message = "나야";
const signature = wallet.signMessageSync(message); 
console.log(signature);

// 너가 한게 맞냐?
const recovered = ethers.verifyMessage(message, signature)
// 공개키가 있어야 이사람이 특정이 된다. r s v를 쪼개서 공개키를 복원하는 알고리즘을 사용해서 공개키 복원
console.log(recovered)

// 작업을 받을 때 Wallet.address => 작업 내용 => 서명
// 검증할 때 작업내용 => 서명 => 공개키 복원 == wallet.address => 신원 검증 성공