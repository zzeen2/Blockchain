// 조건 검사의 로직을 제공하는 라이브러리 
// 차이

const {expect} = require("chai");
// chai 테스트할때 조건 검증 메서드를 제공하는 라이브러리

// ethers
const {ethers} = require("hardhat");
// 하드햇에서 제공하는 이더리움 기능의 지갑의 기능을 메서드로 제공

describe("토큰 검증", ()=> {
    let owner;
    let address;
    let address2;
    beforeEach(async() => {
        // 테스트 용도로 배포자 지갑 지갑2 이렇게 지갑을 3
        //console.log(await ethers.getSigners()) // 로컬에서 사용할 테스트 지갑들을 가져오는 메서드
        // 첫번째 지갑이 배포자의 지갑이다
        [owner, address, address2] = await ethers.getSigners();
        // 배열의 형태에서 지갑의 내용 할당
        // getSigner 서명자들을 반환하는 메서드 타입은 배열
        // 가상의 서명자들 배열을 만들어서 그 안에서 3명의 서명자를 가지고 온 것

        // 토큰 컨트랙트를 만들 생성 객체
        const tokenContractCreate = await ethers.getContractFactory("ZzeenToken");

        // 컨트랙트 배포 deploy
        tokenContract = await tokenContractCreate.deploy("ZzeenToken", "STK");

        // 블록 생성 될때까지 기다린다. 블록이 생성돼서 컨트랙트가 배포될때까지
        await tokenContract.waitForDeployment();
        // 테스트 환경에서 트랜잭션이 생성되면 바로 블록 생성을 시켜준다
        // 로컬에서 테스트환경 제공하는 네트워크들은 전부 트랜잭션이 생기면 
    })

    it("배포자가 소유자인지 검증", async()=> {
        // to.equal 여기의 값고
        // expect에 전달한 매개변수의 값을 비교하고 틀린 점을 
        expect(await tokenContract.owner()).to.equal(owner.address);
    })

    // 이더리움 보내고 받은 토큰 확인
    it("이더를 보내고 토큰 검증", async() => {
        await address.sendTransaction({
            to : tokenContract.target, // target 이 CA
            value : ethers.parseEther("0.01") // 0.01eth
        })

        const balance = await tokenContract.balanceOf(address.address);
        console.log(balance);
        expect(balance).to.equal(100); // 0.01 eth를 보냈으면 100의 토큰을 받아야한다.
    })

    // 컨트랙트 주인이 토큰을 사용자에게 발행
    it("컨트랙트 배포자가 토큰을 발행해주는 검증", async() => {
        console.log(tokenContract)
        await tokenContract.mint(address2.address,2000)
        const balance = await tokenContract.balanceOf(address2.address);
        console.log(balance)
    })
})