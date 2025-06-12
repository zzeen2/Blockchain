import {Config} from "@jest/types";
// jest를 사용할때 필요한 설정 타입 정의

const config = {
    // 모듈 파일 확장자 설정
    moduleFileExtensions : ["ts", "js"],
    // 테스트할 파일의 경로 패턴
    // <rootDir> 루트경로 지정
    // <rootDir>/**/*.test.(js|ts) 루트경로에서 .test.js 혹은 .test.ts 확장자가 붙은 파일들
    testMatch : ["<rootDir>/**/*.test.(js|ts)"],
    testEnvironment : "node", // testEnvironment 테스트 환경 설정
    verbose : true, // 상세로그를 출력할지 말지
    preset : "ts-jest" // 타입 스크립트 jest 프리셋 사용
}

export default config;