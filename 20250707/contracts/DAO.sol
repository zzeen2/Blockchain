// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

contract DAO {
    // 목적이 자율 조직을 만드는 목적성을 가진 컨트랙트 내용
    // 거버넌스 토큰 erc20 erc 721 등
    // 조직에 참여할 수 있는 권한을 상태변수로 줄 것.

    // 조직의 구성원을 추가할 컨트랙트 배포자가 있는 형태로 만들어보자
    address private owner;
    // 멤버를 추가할 상태변수
    mapping(address => bool) private members;

    // 이 조직에 참여한 멤버의 인원
    uint private memberCount;

    Proposal[] private proposals;

    // 제안에 멤버들이 참여했는지 여부 체크
    mapping(address => mapping (uint => bool)) private voted;

    // 조직에서 여러개의 제안을 할텐데,
    // 제안의 제목
    // 제안의 내용
    // 투표의 수
    // 제안이 아직 투표중인지 투표 대기중, 투표중, 종료
    // 승인의 여부
    enum Play {
        loading,
        start,
        end
    }
    struct Proposal {
        string title; // 제목
        string text; // 내용
        uint votes; // 투표수
        Play _play; // 제안이 실행중인지
        bool execute; // 여부 승인지 거부인지
    }

    constructor (address _EOA) {
        owner = _EOA;
        members[_EOA] = true;
        memberCount +=1;
    }

    // 조건 논리 제어자
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    // 멤버인지 체크
    modifier onlyMember () {
        require(members[msg.sender], "error member");
        _;
    }

    // 투표를 이미 진행했는지(투표를 이미 진행했었으면 재투표 X)
    modifier alreadyVote(uint index) {
        require(!voted[msg.sender][index]);
        _;
    }

    // 조직에 참여를 시켜주는 함수
    // 조직의 배포자
    function setMembers (address _address) external onlyOwner {
        members[_address] = true; // 멤버 추가
        memberCount += 1;
    }
    // 조직의 멤버들이 제안을 할 수 있도록 함수
    function createProposal(string memory _title, string memory _text) external onlyMember {
        proposals.push(Proposal({
            title : _title,
            text : _text,
            votes : 0,
            _play : Play.loading,
            execute : false
        }));

    }

    // 투표하는 함수
    function vote(uint index) external onlyMember alreadyVote(index) {
        // 투표에 해당하는 제안을 가져오고
        Proposal storage proposal = proposals[index]; 
        // storage proposal 상태변수의 주소
        // 이 주소의 값을 변경하게 되면 상태변수 변경
        require(proposal._play == Play.start);
        proposal.votes += 1;
        voted[msg.sender][index] = true;
    }

    // 투표 시작 함수(배포자만)
    function startVote(uint index) external onlyOwner {
        Proposal storage proposal = proposals[index]; 
        require(proposal._play == Play.loading);
        proposal._play = Play.start;
    }

    // 투표 종료 함수
    function endVote(uint index) external onlyOwner {
        Proposal storage proposal = proposals[index];
        require(proposal._play == Play.start); 
        proposal._play = Play.end;
        // 투표의 결과 변경
        require(proposal.votes > memberCount / 2);
        proposal.execute = true; // 제안이 통과
        
    }
}