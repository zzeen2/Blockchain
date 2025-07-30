// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "./WrappedToken.sol";

contract DEX {
    address public owner; 
    uint256 public wETH; // wETH 토큰의 량 풀
    uint256 public KAIA; // 이 컨트렉트에 있는 자산의 량 풀
    
    WrappedToken public wrappedToken; //wETH 코드의 형태를 가져와서 주소 저장

    // wETH의 주소를 받아서 
    constructor(address _wETH) {
        wrappedToken = WrappedToken(_wETH);
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    
    // 펀딩을 받아서 유동성을 확보 => 보상으로 LP 토큰
    // 유동성 공급
    // 거래소 참여자를 받아 => 최초에 받을건지 => 화이트 리스트 추가
    function addLiquidity (uint wETHAmount) external payable { // 카이아 유동성 확보
        // wrappedToken transferFrom(msg.sender, address(this), wETHAmount) // 소유권 이전
        wETH += wETHAmount;
        KAIA += msg.value;
    }

    // 스왑 wETH -> Kaia 
    function swapWETHtoKaia (uint256 wETHAmount) external {
        require(KAIA > wETHAmount);
        require(wETHAmount > 0);

        //wrappedToken transferFrom(msg.sender, address(this), wETHAmount) // 소유권 이전 
        uint256 balance = getAmountFee(wETHAmount, KAIA, wETH);
        
        wETH += wETHAmount;
        KAIA -= balance;
        
        payable(msg.sender).transfer(balance);
    }

    // kaia -> WETH
    function swapKAIAtoWETH () external payable {
        require(msg.value > 0);
        
        uint256 wETHvalue = getAmountFee(msg.value, KAIA, wETH); // 유동성량

        wETH -= wETHvalue;
        KAIA += msg.value;

        // wrappedToken transfer(msg.sender, wETHValue)
    }

    // AMM의 모델 수수료 계산 수식 스왑의 량을 얼마를 받아야하는지 계산
    function getAmountFee (uint256 amount, uint256 _KAIA, uint _WETH) public pure returns (uint256){
        uint256 amountFee = amount * 997; // 0.3
        uint256 ator = amountFee * _WETH;
        uint temp = (_KAIA * 1000) + amountFee;
        return ator / temp; 
    }
}