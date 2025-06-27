# OpenZeppelin - ERC20 토큰 표준 구현체
```solidity
// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.3.0) (token/ERC20/ERC20.sol)

pragma solidity ^0.8.20;

import {IERC20} from "./IERC20.sol";
import {IERC20Metadata} from "./extensions/IERC20Metadata.sol";
import {Context} from "../../utils/Context.sol";
import {IERC20Errors} from "../../interfaces/draft-IERC6093.sol";

/*
abstract: 이 컨트랙트를 직접 배포할 수 없음. 상속받아서 사용해야 함
Context: _msgSender() 함수 제공 (현재 트랜잭션 호출자 반환)
IERC20: ERC20 표준 인터페이스
IERC20Metadata: 토큰 이름, 심볼, 소수점 정보 인터페이스
IERC20Errors: 에러 정의 인터페이스
*/

abstract contract ERC20 is Context, IERC20, IERC20Metadata, IERC20Errors {
    mapping(address account => uint256) private _balances; // 잔액 매핑 {주소 : 토큰}
    mapping(address account => mapping(address spender => uint256)) private _allowances; // 승인 매핑 
    /*
    {
        0x1234...5678: {  // Alice의 승인 현황
            0x9876...5432: 100,    // Bob에게 100토큰 사용 권한 부여
            0xDEX_CONTRACT: 500    // DEX 컨트랙트에게 500토큰 사용 권한 부여
        }
    }
    */
    uint256 private _totalSupply;
    string private _name;
    string private _symbol;

    // 토큰 생성시 이름과 심볼을 한번만 설정
    constructor(string memory name_, string memory symbol_) {
        _name = name_; // 상태변수 _name에 매개변수 name_를 할당
        _symbol = symbol_;
    }

    function name() public view virtual returns (string memory) {
        return _name;
    }

    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    // 소수점 처리
    function decimals() public view virtual returns (uint8) {
        return 18; // decimals=18이면 1토큰 = 10^18 wei
    }

    function totalSupply() public view virtual returns (uint256) {
        return _totalSupply;
    }
    // 잔액 조회
    function balanceOf(address account) public view virtual returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 value) public virtual returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, value);
        return true;
    }

    function allowance(address owner, address spender) public view virtual returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 value) public virtual returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public virtual returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, value);
        _transfer(from, to, value);
        return true;
    }

    function _transfer(address from, address to, uint256 value) internal {
        if (from == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        if (to == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _update(from, to, value);
    }

    function _update(address from, address to, uint256 value) internal virtual {
        if (from == address(0)) {
            _totalSupply += value;
        } else {
            uint256 fromBalance = _balances[from];
            if (fromBalance < value) {
                revert ERC20InsufficientBalance(from, fromBalance, value);
            }
            unchecked {
                _balances[from] = fromBalance - value;
            }
        }

        if (to == address(0)) {
            unchecked {
                _totalSupply -= value;
            }
        } else {
            unchecked {
                _balances[to] += value;
            }
        }

        emit Transfer(from, to, value);
    }

    function _mint(address account, uint256 value) internal {
        if (account == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _update(address(0), account, value);
    }

    function _burn(address account, uint256 value) internal {
        if (account == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        _update(account, address(0), value);
    }

    function _approve(address owner, address spender, uint256 value) internal {
        _approve(owner, spender, value, true);
    }

    function _approve(address owner, address spender, uint256 value, bool emitEvent) internal virtual {
        if (owner == address(0)) {
            revert ERC20InvalidApprover(address(0));
        }
        if (spender == address(0)) {
            revert ERC20InvalidSpender(address(0));
        }
        _allowances[owner][spender] = value;
        if (emitEvent) {
            emit Approval(owner, spender, value);
        }
    }

    function _spendAllowance(address owner, address spender, uint256 value) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance < type(uint256).max) {
            if (currentAllowance < value) {
                revert ERC20InsufficientAllowance(spender, currentAllowance, value);
            }
            unchecked {
                _approve(owner, spender, currentAllowance - value, false);
            }
        }
    }
}
```