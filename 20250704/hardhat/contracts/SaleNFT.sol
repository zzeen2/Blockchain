// SPDX-License-Identifier: MIT

pragma solidity 0.8.30;

// erc721의 형태가 맞는지 검증
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; 

// 표준의 내용과 다른 컨트랙트를 만든다 => DAO => 표준 형태는 따로 없고
contract SaleNFT {
    // 판매하고 있는 상품의 내용
    struct SaleItem {
        address seller; // 상품 판매의 소유자
        uint price;
    }
    // 컨트랙트 주소
    address private immutable nftContracts; // immutable 불변성을 갖게 되었을때 문제점 
    // 프록시 패턴을 사용할때  

    // 판매중인 상태를 저장 리스트
    uint[] public listNftIds; // 상품의 아이디를 저장할 리스트

    // 사용자의 ui로 표현될 상품의 리스트
    mapping(uint => SaleItem) public sales;

    // 판매중인 Nft의 정보를 기록
    event addSaleList (address indexed seller, uint tokenId, uint price);

    // 판매의 취소가 발생했을때 기록할 이벤트
    event removeSaleList( address indexed seller, uint tokenId);
    
    // 구매가 정상적으로 처리되면
    event buyNft(address indexed buyer, address indexed seller, uint tokenId, uint price);

    constructor(address _nftAddress) {
        nftContracts = _nftAddress;
    }

    // 판매 등록하면 호출될 함수
    function addNftSale(uint tokenId, uint price) external {
        // nft erc721 컨트랙트에게 요청을 보내기 위해서
        // 메서드를 잘못 호출하는 것을 방지
        IERC721 nft = IERC721(nftContracts); // 최소한의 erc721 인터페이스와 주소를 가지고 nft 인스턴스 생성
        // nft 인스턴스 생성. CA 주소를 가지고 인스턴스화
        
        // 호출하는 사람이 nft를 가지고 있는지
        // 토큰 소유자의 주소 tokenId : address 
        require(nft.ownerOf(tokenId) == msg.sender);
        // 금액을 정상적으로 작성 하였는지
        require(price > 0);
        
        // 중계자가 있는 판매의 구조
        require(nft.isApprovedForAll(msg.sender, address(this)));

        // 판매 리스트에 추가
        sales[tokenId] = SaleItem(msg.sender, price);
        listNftIds.push(tokenId);
        emit addSaleList(msg.sender, tokenId, price); 
    }

    // 구매 함수 (이더를 전송) 
    function buyNFT(uint tokenId) external payable {
        // 가스비 절감을 위해   (상태변수에 번번히 접근을 막음<< 변수접근으로 memory)
        SaleItem memory sale = sales[tokenId]; 
        require(sale.price == msg.value); // 솔리디티에서 다루는 가스 최적화는 한계 (어셈블리)
        require(msg.sender != sale.seller); // 판매자가 본인 상품을 구매시도할때 리젝

        IERC721 nft = IERC721(nftContracts);
        // transferFrom 위임받는 사람이 호출을 해서 소유권을 전환해주는 함수
        nft.transferFrom(sale.seller, msg.sender, tokenId);

        // 판매자에게 금액을 보내기 중간수수료가 있다면 차감 후에 전송
        payable(sale.seller).transfer(msg.value);
        // 판매한 금액만큼 판매자에게 이더 전송

        // 판매 리스트에서 제거
        delete sales[tokenId]; // 가스비 네트워크 제안에 따라서 배열의 값을 제거한다.
        // mapping delete
        // mapping안에 있는 키를 제거 초기값으로 돌린다.
        // 키 값 => 초기값으로 값을 바꿔 
        // 반복문
        // list NftIds
        uint length = listNftIds.length;

        for (uint i = 0; i < length; i ++) {
            if(tokenId  == listNftIds[i]) {
                listNftIds[i] = listNftIds[length - 1];
                listNftIds.pop();
                break;
            }
        }

        emit buyNft(msg.sender, sale.seller, tokenId, sale.price);
    }

    // 판매 취소 함수
    function canselSale(uint tokenId) external {
        // 판매 등록한 사람이 맞는지
        require(sales[tokenId].seller == msg.sender);
        
        delete sales[tokenId];
        
        uint length = listNftIds.length;

        for (uint i = 0; i < length; i ++) {
            if(tokenId  == listNftIds[i]) {
                listNftIds[i] = listNftIds[length - 1];
                listNftIds.pop();
                break;
            }
        }

        emit removeSaleList(msg.sender, tokenId);
    }

    function getSaleList() external view returns(uint[] memory) {
        return listNftIds;
    }
}

