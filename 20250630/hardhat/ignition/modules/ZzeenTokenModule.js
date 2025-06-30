const { buildModule} = require("@nomicfoundation/hardhat-ignition/modules")
// hardhat-ignition 있는 모듈 생성 함수 buildModule 모듈들을 import 해온다.

module.exports = buildModule("ZzeenTokenModule" ,
  // ZzeenTokenModule 이라는 이름을 정의 해서 사용
  // ZzeenTokenModule 배포가 일어나면 이 모듈이름으로 배포를 재배포를 방지해준다.
  (m) => {
    // m 빌드 모듈이 포함된 함수
    // 컴파일된 내용이 포함
    // 생성자의 매개변수가 없으면 컨트랙트 파일의 이름만 전달하면 되는데
    // 생성자에 매개변수가 포함되면 두번째 매개변수로 배열을 전달
    const token = m.contract("ZzeenToken", ["ZzeenToken", "STK"]); // 생성자 실행 말 즉슨 컨트랙트 배포 설정파일 내용의 네트워크에 배포

    // 배포된 결과의 객체를 반환
    return {token};
    
  }
)