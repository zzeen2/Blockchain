// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

// 솔리디티에서 import
import "../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

// ERC20 상속을 받으면 ERC20 부모 컨트렉트
contract ZzeenToken is ERC20 {
    constructor() ERC20("ZzeenToken", "STK") {
        // ERC20("ZzeenToken", STK) 부모 컨트렉트 생성자
        // constructor() 매개변수를 받아서 처리하겠다.
        // 
        _mint(msg.sender, 1000 * 10 ** decimals());
    }
}