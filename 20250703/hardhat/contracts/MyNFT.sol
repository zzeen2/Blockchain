// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721URIStorage, Ownable {
    // ERC721URIStorage 상속 받은 부모중에서 어떤 생성자에 매개변수를 전달해서 호출할건지
    constructor (string memory name, string memory symbol) ERC721(name, symbol) Ownable(msg.sender) { 

    }
    uint private tokenId;
    // 민팅 함수
    // CID => metadata json
    function minting(string memory _tokenURI) external returns(uint) {
        uint _nextTokenId = tokenId;
        _safeMint(msg.sender, _nextTokenId); // 0
        _setTokenURI(_nextTokenId, _tokenURI);

        tokenId ++;
        return _nextTokenId; // 생성된 토큰의 아이디 반환
    }
}