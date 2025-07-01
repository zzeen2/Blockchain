require("@nomicfoundation/hardhat-toolbox");
// 하드햇에서 플러그인 모음을 가져오는 구문
// 콘솔 로그 abi 생성 플러그인 등 ethers 등

require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */

// 컴파일과 배포를 할때 속성
module.exports = {
  solidity: "0.8.30",
  // networks 네트워크에 배포할때 속성
  // networks 고정 키값
  networks :  {
    // sepolia 우리가 세폴리아 네트워크를 사용할때 사용할 속성들의 키 이름을 정해준 것. 세폴리아니까 세폴리아라고 정함
    sepolia : {
      url : process.env.INFURA_RPC, // RPC 엔드포인트 주소 네트워크에 통신할 주소가 필요 // 노드를 설치하면 용량도 플노드 설치 
      accounts : [process.env.PRIVATE_KEY], // 배포를 할 때 필요한 가스비를 지불할 계정. 개인키 값을 작성
    },
  }
};
