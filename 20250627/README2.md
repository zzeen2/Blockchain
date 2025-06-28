// SPDX-License-Identifier: MIT
// 라이센스 정보: MIT 라이센스로 오픈소스임을 명시
// OpenZeppelin Contracts (last updated v5.3.0) (token/ERC20/ERC20.sol)
// OpenZeppelin 라이브러리의 ERC20 표준 구현체

pragma solidity ^0.8.20;
// 솔리디티 버전 지정: 0.8.20 이상에서 컴파일 가능

// 필요한 인터페이스들을 import (다른 파일에서 가져옴)
import {IERC20} from "./IERC20.sol";                    // ERC20 기본 인터페이스
import {IERC20Metadata} from "./extensions/IERC20Metadata.sol";  // 토큰 메타데이터 인터페이스
import {Context} from "../../utils/Context.sol";         // 컨텍스트 유틸리티
import {IERC20Errors} from "../../interfaces/draft-IERC6093.sol";  // 에러 정의 인터페이스

/**
 * @dev ERC20 토큰 표준의 구현체
 * 
 * abstract: 이 컨트랙트는 추상 컨트랙트로 직접 배포할 수 없음
 *          반드시 상속받아서 사용해야 함 (예: MyToken is ERC20)
 * 
 * 상속받는 컨트랙트들:
 * - Context: _msgSender() 함수 제공 (트랜잭션을 보낸 사람의 주소 반환)
 * - IERC20: ERC20 표준에서 정의한 기본 함수들의 인터페이스
 * - IERC20Metadata: 토큰의 이름, 심볼, 소수점 정보 관련 인터페이스
 * - IERC20Errors: 에러 상황에서 사용할 커스텀 에러들의 정의
 */
abstract contract ERC20 is Context, IERC20, IERC20Metadata, IERC20Errors {
    
    // ====================== 상태 변수 (State Variables) ======================
    
    /**
     * @dev 각 주소별 토큰 잔액을 저장하는 매핑
     * mapping(키타입 => 값타입) 형태로 선언
     * private: 외부에서 직접 접근 불가능 (이 컨트랙트 내부에서만 사용)
     * 
     * 예시 데이터:
     * {
     *   0x1234...5678: 1000,  // Alice가 1000토큰 보유
     *   0x9876...5432: 500,   // Bob이 500토큰 보유
     *   0xabcd...ef12: 2500   // Carol이 2500토큰 보유
     * }
     */
    mapping(address account => uint256) private _balances;
    
    /**
     * @dev 토큰 사용 승인을 저장하는 이중 매핑
     * 첫 번째 키: 토큰 소유자 주소
     * 두 번째 키: 승인받은 사용자(spender) 주소
     * 값: 승인된 토큰 양
     * 
     * 예시: Alice가 Bob에게 100토큰, DEX에게 500토큰 사용 권한을 준 경우
     * {
     *   0x1234...5678: {  // Alice의 승인 현황
     *     0x9876...5432: 100,    // Bob에게 100토큰 사용 권한 부여
     *     0xDEX_CONTRACT: 500    // DEX 컨트랙트에게 500토큰 사용 권한 부여
     *   }
     * }
     * 
     * 이렇게 하면 Bob이나 DEX가 Alice 대신 토큰을 전송할 수 있음
     */
    mapping(address account => mapping(address spender => uint256)) private _allowances;
    
    /**
     * @dev 전체 토큰 발행량
     * uint256: 256비트 양의 정수 (0 ~ 2^256-1)
     * 모든 사용자가 가진 토큰의 총합
     */
    uint256 private _totalSupply;
    
    /**
     * @dev 토큰의 이름 (예: "Bitcoin", "Ethereum")
     * string: 문자열 타입
     */
    string private _name;
    
    /**
     * @dev 토큰의 심볼 (예: "BTC", "ETH", "USDT")
     * 보통 3-4글자의 짧은 약어
     */
    string private _symbol;

    // ====================== 생성자 (Constructor) ======================
    
    /**
     * @dev 컨트랙트 생성자
     * 컨트랙트가 배포될 때 단 한 번만 실행됨
     * 
     * @param name_ 토큰의 이름 (매개변수명에 _를 붙여 상태변수와 구분)
     * @param symbol_ 토큰의 심볼
     * 
     * memory: 임시 저장소에 저장 (함수 실행 중에만 존재)
     */
    constructor(string memory name_, string memory symbol_) {
        _name = name_;     // 상태변수 _name에 매개변수 name_ 값을 저장
        _symbol = symbol_; // 상태변수 _symbol에 매개변수 symbol_ 값을 저장
    }

    // ====================== 조회 함수들 (View Functions) ======================
    
    /**
     * @dev 토큰의 이름을 반환
     * public: 누구나 호출 가능
     * view: 상태를 변경하지 않고 읽기만 함 (가스 소모 없음)
     * virtual: 상속받은 컨트랙트에서 재정의(override) 가능
     * returns: 반환값의 타입 지정
     */
    function name() public view virtual returns (string memory) {
        return _name;  // 저장된 토큰 이름 반환
    }

    /**
     * @dev 토큰의 심볼을 반환
     */
    function symbol() public view virtual returns (string memory) {
        return _symbol;  // 저장된 토큰 심볼 반환
    }

    /**
     * @dev 토큰의 소수점 자릿수를 반환
     * 
     * 소수점의 의미:
     * - decimals=18이면 1토큰 = 10^18 wei (가장 작은 단위)
     * - 예: 1.5토큰 = 1500000000000000000 wei
     * - 이더리움과 같은 18자리 소수점을 기본으로 사용
     * 
     * uint8: 8비트 양의 정수 (0~255), 소수점 자릿수로 충분
     */
    function decimals() public view virtual returns (uint8) {
        return 18;  // 기본값으로 18 반환 (이더리움 표준)
    }

    /**
     * @dev 전체 토큰 발행량을 반환
     * 모든 사용자가 가진 토큰의 총합
     */
    function totalSupply() public view virtual returns (uint256) {
        return _totalSupply;  // 저장된 총 발행량 반환
    }
    
    /**
     * @dev 특정 주소의 토큰 잔액을 조회
     * @param account 잔액을 조회할 주소
     * @return 해당 주소가 보유한 토큰 양
     */
    function balanceOf(address account) public view virtual returns (uint256) {
        return _balances[account];  // 해당 주소의 잔액 반환 (없으면 0)
    }

    // ====================== 토큰 전송 함수들 ======================
    
    /**
     * @dev 토큰을 직접 전송 (호출자 → 수신자)
     * @param to 토큰을 받을 주소
     * @param value 전송할 토큰 양
     * @return 성공시 true 반환
     * 
     * 실행 과정:
     * 1. _msgSender()로 호출자(토큰 소유자) 주소 확인
     * 2. _transfer() 함수로 실제 전송 처리
     * 3. 성공시 true 반환
     */
    function transfer(address to, uint256 value) public virtual returns (bool) {
        address owner = _msgSender();  // 현재 트랜잭션을 보낸 사람 = 토큰 소유자
        _transfer(owner, to, value);   // 내부 전송 함수 호출
        return true;                   // 성공 표시
    }

    /**
     * @dev 특정 주소가 다른 주소에게 부여한 토큰 사용 승인량 조회
     * @param owner 토큰 소유자 주소
     * @param spender 토큰 사용 승인을 받은 주소
     * @return 승인된 토큰 양
     */
    function allowance(address owner, address spender) public view virtual returns (uint256) {
        return _allowances[owner][spender];  // 승인된 양 반환
    }

    /**
     * @dev 다른 주소에게 토큰 사용 권한 부여
     * @param spender 토큰 사용 권한을 받을 주소
     * @param value 승인할 토큰 양
     * @return 성공시 true 반환
     * 
     * 사용 예시:
     * Alice가 DEX에게 500토큰 사용 권한을 주고 싶을 때
     * Alice가 approve(DEX주소, 500) 호출
     */
    function approve(address spender, uint256 value) public virtual returns (bool) {
        address owner = _msgSender();        // 현재 호출자 = 토큰 소유자
        _approve(owner, spender, value);     // 내부 승인 함수 호출
        return true;
    }

    /**
     * @dev 승인받은 권한으로 토큰 전송 (제3자가 대신 전송)
     * @param from 토큰을 보낼 주소 (실제 소유자)
     * @param to 토큰을 받을 주소
     * @param value 전송할 토큰 양
     * @return 성공시 true 반환
     * 
     * 실행 과정:
     * 1. spender(호출자)가 from으로부터 승인을 받았는지 확인
     * 2. 승인량에서 전송량 차감
     * 3. 실제 토큰 전송 수행
     * 
     * 사용 예시:
     * Alice가 DEX에게 500토큰 승인 후,
     * DEX가 transferFrom(Alice주소, Bob주소, 100) 호출하여
     * Alice의 토큰 100개를 Bob에게 전송
     */
    function transferFrom(address from, address to, uint256 value) public virtual returns (bool) {
        address spender = _msgSender();              // 현재 호출자 = 승인받은 사용자
        _spendAllowance(from, spender, value);       // 승인량 확인 및 차감
        _transfer(from, to, value);                  // 실제 토큰 전송
        return true;
    }

    // ====================== 내부 함수들 (Internal Functions) ======================
    
    /**
     * @dev 토큰 전송의 기본 검증 로직
     * @param from 보내는 주소
     * @param to 받는 주소  
     * @param value 전송할 토큰 양
     * 
     * internal: 이 컨트랙트와 상속받은 컨트랙트에서만 호출 가능
     */
    function _transfer(address from, address to, uint256 value) internal {
        // 보내는 주소가 0x0 (영주소)인지 확인
        if (from == address(0)) {
            revert ERC20InvalidSender(address(0));   // 영주소에서는 전송 불가
        }
        // 받는 주소가 0x0 (영주소)인지 확인  
        if (to == address(0)) {
            revert ERC20InvalidReceiver(address(0)); // 영주소로는 전송 불가
        }
        _update(from, to, value);  // 실제 잔액 업데이트 함수 호출
    }

    /**
     * @dev 토큰 잔액 업데이트의 핵심 로직
     * 이 함수가 모든 토큰 이동(전송, 발행, 소각)을 처리
     * @param from 보내는 주소 (0x0이면 토큰 발행)
     * @param to 받는 주소 (0x0이면 토큰 소각)
     * @param value 이동할 토큰 양
     */
    function _update(address from, address to, uint256 value) internal virtual {
        
        // Case 1: 토큰 발행 (Minting)
        if (from == address(0)) {
            // 영주소에서 오는 것은 새로운 토큰 생성을 의미
            _totalSupply += value;  // 총 발행량 증가
        } else {
            // Case 2: 일반 전송 - 보내는 사람 잔액 차감
            uint256 fromBalance = _balances[from];  // 현재 잔액 조회
            
            // 잔액 부족 검사
            if (fromBalance < value) {
                // 커스텀 에러 발생 (자세한 정보 포함)
                revert ERC20InsufficientBalance(from, fromBalance, value);
            }
            
            // unchecked: 오버플로우 검사 생략 (가스 절약)
            // 이미 위에서 fromBalance >= value 확인했으므로 안전
            unchecked {
                _balances[from] = fromBalance - value;  // 잔액 차감
            }
        }

        // Case 3: 토큰 소각 (Burning)
        if (to == address(0)) {
            // 영주소로 보내는 것은 토큰 소각을 의미
            unchecked {
                _totalSupply -= value;  // 총 발행량 감소
            }
        } else {
            // Case 4: 일반 전송 - 받는 사람 잔액 증가
            unchecked {
                // 오버플로우 불가능: 개별 잔액의 합 <= 총 발행량
                _balances[to] += value;  // 잔액 증가
            }
        }

        // Transfer 이벤트 발생 (블록체인에 기록)
        // 이벤트는 프론트엔드나 외부 시스템에서 모니터링 가능
        emit Transfer(from, to, value);
    }

    /**
     * @dev 새로운 토큰 발행 (민팅)
     * @param account 토큰을 받을 주소
     * @param value 발행할 토큰 양
     * 
     * 내부 함수이므로 상속받은 컨트랙트에서만 호출 가능
     * 보통 생성자나 특별한 민팅 함수에서 사용
     */
    function _mint(address account, uint256 value) internal {
        // 영주소로는 토큰 발행 불가
        if (account == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        // _update(영주소, 받는주소, 양) = 토큰 발행
        _update(address(0), account, value);
    }

    /**
     * @dev 토큰 소각 (번닝)
     * @param account 토큰을 소각할 주소
     * @param value 소각할 토큰 양
     * 
     * 해당 주소에서 토큰을 영구적으로 제거
     * 총 발행량도 함께 감소
     */
    function _burn(address account, uint256 value) internal {
        // 영주소에서는 소각 불가
        if (account == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        // _update(보내는주소, 영주소, 양) = 토큰 소각
        _update(account, address(0), value);
    }

    /**
     * @dev 토큰 사용 승인 설정 (기본 버전)
     * @param owner 토큰 소유자
     * @param spender 승인받을 사용자
     * @param value 승인할 토큰 양
     * 
     * 기본적으로 이벤트를 발생시키는 버전 호출
     */
    function _approve(address owner, address spender, uint256 value) internal {
        _approve(owner, spender, value, true);  // 이벤트 발생 버전 호출
    }

    /**
     * @dev 토큰 사용 승인 설정 (이벤트 제어 버전)
     * @param owner 토큰 소유자
     * @param spender 승인받을 사용자  
     * @param value 승인할 토큰 양
     * @param emitEvent 이벤트 발생 여부
     * 
     * emitEvent=false인 경우 가스 절약 가능
     * (transferFrom 내부에서 승인량 차감시 사용)
     */
    function _approve(address owner, address spender, uint256 value, bool emitEvent) internal virtual {
        // 영주소는 토큰을 소유할 수 없으므로 승인 불가
        if (owner == address(0)) {
            revert ERC20InvalidApprover(address(0));
        }
        // 영주소는 토큰을 사용할 수 없으므로 승인 대상 불가
        if (spender == address(0)) {
            revert ERC20InvalidSpender(address(0));
        }
        
        // 승인량 설정
        _allowances[owner][spender] = value;
        
        // 조건부 이벤트 발생
        if (emitEvent) {
            emit Approval(owner, spender, value);  // 승인 이벤트 발생
        }
    }

    /**
     * @dev 승인된 토큰 사용량 차감
     * @param owner 토큰 소유자
     * @param spender 토큰 사용자
     * @param value 사용할 토큰 양
     * 
     * transferFrom 함수에서 호출되어 승인량을 확인하고 차감
     */
    function _spendAllowance(address owner, address spender, uint256 value) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);  // 현재 승인량 조회
        
        // 무한 승인이 아닌 경우에만 승인량 차감
        if (currentAllowance < type(uint256).max) {
            // type(uint256).max = 2^256-1 (최대값, 무한 승인을 의미)
            
            // 승인량 부족 검사
            if (currentAllowance < value) {
                revert ERC20InsufficientAllowance(spender, currentAllowance, value);
            }
            
            // 승인량에서 사용량 차감 (이벤트 발생 안함 = 가스 절약)
            unchecked {
                _approve(owner, spender, currentAllowance - value, false);
            }
        }
        // 무한 승인인 경우 승인량 변경하지 않음
    }
}

