단계	        설명
트랜잭션 생성	 지갑에서 UTXO 사용하여 트랜잭션 만들고 서명함
Mempool 등록	서명 검증 후 트랜잭션을 임시 보관
P2P 전파	    모든 노드가 트랜잭션 내용을 공유함
블록 생성	    채굴 시 mempool에서 tx를 선택해 블록으로 묶음
블록 전파       새 블록을 모든 노드에 브로드캐스트
체인 업데이트    각 노드가 블록을 받아 체인에 추가하고 잔액(UTXO)을 업데이트
잔액 반영	     보낸 사람은 금액 차감, 받은 사람은 금액 증가

[ 1. 트랜잭션 생성 요청 (사용자) ]
        │
        ▼
[ Wallet: 잔액(UTXO) 조회 ]
        │
        ├─> UTXO Ledger: 내 주소로 등록된 미사용 UTXO 목록 필터링
        ▼
[ 필요한 amount만큼 UTXO 선택 ]
        │
        ├─> 부족하면 "잔액 부족" 종료
        ▼
[ Transaction 객체 생성 ]
        │
        ├─ inputs: 선택된 UTXO로 구성
        └─ outputs:
             ├─ 받는 주소에 amount
             └─ 나머지는 내 주소로 (거스름돈)
        ▼
[ Wallet: 트랜잭션에 서명(signInputs) ]
        │
        ├─ 각 input에 서명(signature), 공개키(publicKey) 삽입
        ▼
[ Mempool에 추가 ]
        │
        └─ addTransaction: 서명 검증 → 중복 여부 체크 → 등록
        ▼
[ P2P: 다른 노드에 트랜잭션 브로드캐스트 ]
        │
        └─ "NEW_TRANSACTION" 메시지 전송
        ▼
[ 각 피어 노드: 트랜잭션 수신 → mempool에 저장 ]
        │
        ▼
[ 2. 채굴 시도 (mineBlock) ]
        │
        └─ mempool의 트랜잭션들 선택 (tx.id 목록으로)
        ▼
[ 블록 생성 (addBlock) ]
        │
        ├─ 이전 블록의 해시 사용
        ├─ 트랜잭션 데이터 포함
        └─ 블록 해시 생성
        ▼
[ UTXO Ledger 업데이트 ]
        │
        ├─ tx.inputs로 기존 UTXO 제거
        └─ tx.outputs로 새로운 UTXO 등록
        ▼
[ Mempool 비우기 ]
        │
        ▼
[ P2P: 블록 브로드캐스트 ]
        │
        └─ "NEW_BLOCK" 메시지 전송
        ▼
[ 각 피어 노드: 블록 수신 ]
        │
        ├─ 체인 마지막 블록과 연결 확인
        └─ 블록 추가 시도
             └─ 안 맞으면 → "REQUEST_CHAIN" 보내서 동기화 시도
        ▼
[ 블록체인 동기화 및 UTXO 일치 ]
        │
        ▼
✅ [ 트랜잭션 반영 완료 ]
        │
        └─ 보낸 사람: 잔액 차감
        └─ 받은 사람: 잔액 증가
