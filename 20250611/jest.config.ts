/*
  테스트 코드 주도 개발 TDD (test driven development)
  TDD의 개념 개발을 할때 생각의 형태
  테스트 먼저 개발을 하고 구현은 이후에라는 철학을 가지고 만든 개발 방식.
  작은 단위부터 테스트 코드를 작성하고 -> 진행
  테스트 코드의 목적은 코드의 정확성과 안정성 확보가 목표
 
  테스트 개념
  - 단위 테스트
        개발 함수나 작은 단위를 검증할때 작성하는 테스트
        의존성에 영향을 받지않고 기능을 격리시켜서 초기의 테스트를 명확하게 진행한다.

  - 통합 테스트
        여러개의 기능들이 의존성을 주입받아서 동작을 하는지 검증

    // jest 라이브러리
    // jest 테스트 코드를 실행할때 속성을 정의하는 파일 jest.config.js
*/

// 타입 스크크립트를 jest와 같이 사용하기 위해서 인터페이스를 가지고 와서 config를 정의해주자

import type { Config } from '@jest/types';

const config : Config.InitialOptions = {
    // 모듈 파일 확장자 설정
    moduleFileExtensions : ["ts", "js"],
    // 테스트를 진행할 파일의 경로 패턴
    testMatch : ["<rootDir>/**/*.test.(js|ts)"],

    // 모듈의 이름의 별칭을 지정
    // 모듈을 가져올때 모듈을 가져올때 경로를 지정
    // src/ => 값으로 할당한 경로에 도달
    // "<rootDir>/src/$1" => 루트 즉 프로젝트의 경로에서 src안에있는 모든 폴더 경로에 도달
    moduleNameMapper : {
        "^src/(.*)$" : "<rootDir>/src/$1"
    },
     testEnvironment : "node",
     verbose : true,
     testTimeout : 1_000_000_000, //테스트 타임아웃 시간
     preset : "ts-jest",
}

export default config;