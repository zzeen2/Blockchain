// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

contract WrappedToken {
    // ERC-20 표준에 따라 토큰의 메타데이터를 정의
    string public name = "Wrapped ETH";
    string public symbol = "wETH";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance; // 특정 주소가 다른 주소로부터 인출할 수 있는 토큰 양을 기록

    event Burned(address indexed from, uint256 amount);

    // relayer만 호출할 수 있도록 구성 여러명의 경우 우리 화이트리스트 작성 mapping으로 표현
    address public relayer; // mint를 호출할 수 있는 주소

    constructor(address _relayer) { // mint를 호출할 수 있는 단일 주소 저장
        relayer = _relayer;
    }

    modifier onlyRelayer() {
        require(msg.sender == relayer);
        _;
    }

    // 지정된 주소(to)에 amount만큼 토큰을 발생
    function mint(address to, uint256 amount) external onlyRelayer   {
        balanceOf[to] += amount;
        totalSupply += amount;
    } 

    function burn (uint256 amount) external {
        require(balanceOf[msg.sender] >= amount);
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        // address(0) => 소각 0x0000000... 주소로 트랜스퍼 소유권 전환
        // 소각을 시키면 이벤트를 호출해서 relayer에서 스왑기능 호출
        // 이벤트 로그에 누가? 어디에? 얼마를? 소각했는지 
        // transfer 이벤트를 호출해서 기록을 해줘야 한다. => 표준에 맞게 transfer(msg.sender, address(0), amount)
        emit Burned(msg.sender, amount);
    }
}