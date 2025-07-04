import { useEffect, useState } from "react";
import useWallet from "./hooks/useWallet";
import axios from "axios";
import {ethers} from "ethers";

const pinata_api_key = process.env.PINATA_API_KEY
const pinata_secret_api_key = process.env.PINATA_SECRET_API_KEY

function App() {
  const {nftContract, saleNftContract, connectWallet, account, provider} = useWallet();
  const [file, setFile] = useState(null);
  const [nfts, setNfts] = useState(null);
  const [saleNft, setSaleNft] = useState(null);
  const [priceValue, setPriceValue] = useState(0);

  useEffect(() => {
    connectWallet();
  }, [])

  const uploadFileIPFS = async () => {
    if(!file) return;
    const formData = new FormData();
    formData.append("file", file);

    // 파일을 올리고 컨텐츠 식별자 주소를 반환하는 메서드
    const {data} = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      headers : {
        "Content-Type": "multipart/form-data",
        pinata_api_key,
        pinata_secret_api_key
      }
    })
    const ipfsImage = `ipfs://${data.IpfsHash}`;
    const JsonURI = await uploadJsonMetaDataIPFS("soon", "이순현임", ipfsImage);
    const transaction = await nftContract.minting(JsonURI);
    await transaction.wait();
    alert("ipfs 업로드 이후 민팅 완료")
  }

  const uploadJsonMetaDataIPFS = async (name, description, image) => {
    const metadata = {
      name,
      description,
      image
    }
    const blob = new Blob([JSON.stringify(metadata)], {
      type : "application/json"
    })

    const formData = new FormData();
    formData.append("file", blob, "matadata.json");

    const { data } = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      headers : {
        "Content-Type": "multipart/form-data",
        pinata_api_key,
        pinata_secret_api_key
      }
    })
    return data.IpfsHash;
  }

  useEffect(() => {
    if(account){
      loadNFTs();
      loadSalaNfts();
    }
  }, [account])

  // nft 조회 조건은 내가 가지고 있는 nft 판매중이지 않은 nft를 보여주는 조건
  const loadNFTs = async () => {
     // 이벤트 호출 내 계정에서 받은 내용을 가져오기 위한 필터
     const filter = nftContract.filters.Transfer(null, account); // 로그 호출
     console.log(filter)
     // 이벤트 호출할때 필터 전달해서 로그 호출
     const logs = await provider.getLogs({
       address : nftContract.target,
       ...filter,
       fromBlock : 0,
       toBlock : "latest"
     })
     console.log(logs);

     // 판매중인 nft는 내가 안보이게 판매중인 nft는 제거
     const saleNftIds = await saleNftContract.getSaleList();
     // Set 중복되는 값이 없도록 배열 생성
     // [1, 1, 1] [ 1 ]
     // 중복값 제거
     const saleNfts = new Set(saleNftIds.map(id => id.toString()))

     const tokenIds = new Set(); // 중복 방지로 사용
     const ntflist = [];

     for (const log of logs) {
        const parsEvnet = nftContract.interface.parseLog(log);// 이벤트 파싱
        console.log(parsEvnet);
        const tokenId = parsEvnet.args?.tokenId?.toString(); // 토큰 아이디 호출
        // (민팅이 일어난 이벤트 로그)
        console.log(tokenId);
        // set 메서드 has 값이 있는지 확인
        if(!tokenIds.has(tokenId) && tokenId) {
          tokenIds.add(tokenId); // 
          const owner = await nftContract.ownerOf(tokenId);
          if((owner.toLowerCase() === account.toLowerCase()) && 
              !saleNfts.has(tokenId) // 판매중인 nft는 출력에서 제외
          ) {
            const tokenUri = await nftContract.tokenURI(tokenId); // ipfs에 저장되어있는 주소
            const {data : json} = await axios.get(`https://ipfs.io/ipfs/${tokenUri}`); // 주소에는 json의 내용이 반환된다.
            json.image = json.image.replace("ipfs://", "https://ipfs.io/ipfs/");
            ntflist.push({tokenId, ...json });
            // https://ipfs.io/ipfs
          }
        }
     }
     console.log(ntflist);
     setNfts(ntflist);
  }

  // 판매 등록
  const addSale = async (tokenId, price) => {
    if(isNaN(price)) return alert("가격은 숫자를 입력하세요");

    const isApproved = await nftContract.isApprovedForAll(account, saleNftContract.target);
    if(!isApproved) {
      // setApprovalForAll 권한 위임
      const transaction = await nftContract.setApprovalForAll(saleNftContract.target, true);
      await transaction.wait();
    }

    const priceWei = ethers.parseEther(price.toString());
    const transaction = await saleNftContract.addNftSale(tokenId, priceWei);
    await transaction.wait();
    alert("판매 등록");
    loadNFTs(); // 판매등록되고 보관함 갱신
    loadSalaNfts(); // 판매 등록 갱신
  }

  // 판매 리스트
  const loadSalaNfts = async() => {
    const tokenIds = await saleNftContract.getSaleList();
    const saleItems = [];
    for (const tokenId of tokenIds) {
      const tokenUri = await nftContract.tokenURI(tokenId);
      const {data : json} = await axios(`https://ipfs.io/ipfs/${tokenUri}`);
      const saleInfo = await saleNftContract.sales(tokenId);
      json.image = json.image.replace("ipfs://", "https://ipfs.io/ipfs/");
      saleItems.push({
        tokenId : tokenId.toString(),
        ...json,
        saller : saleInfo.seller,
        price : saleInfo.price
      })
    }
    console.log(saleItems);
    setSaleNft(saleItems);
  }

  // 구매하는 함수
  const buyNFT = async (tokenId, price) => {
    const saleInfo = await saleNftContract.sales(tokenId);
    if(saleInfo.seller.toLowerCase() === account.toLowerCase()) return alert("본인의 nft는 구매 할수 없다.");
    // 구매
    // {value : price} eth 전송
    const transaction = await saleNftContract.buyNFT(tokenId, {value : price});
    transaction.wait();
    alert("구매 완료");
    loadNFTs();
    loadSalaNfts();
  }

  if(!account) return <>...loading</>
  return (
    <div className="App">
      계정 주소 : {account} <br />

      <h1>nft 민팅</h1>
      <div>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={uploadFileIPFS}>ipfs 업로드</button>
      </div>
      <label>금액을 입력하세요 ETH</label>
      <input type="number" value={priceValue} onChange={({target : {value}}) => setPriceValue(value)} />
      <div style={{display : "flex", gap : "20px", marginTop : "20px"}}>
          {nfts?.map((nft) => <div>
            <img src={nft.image} style={{width : "100px"}} />
            <h4>{nft.name}</h4>
            <p>{nft.description}</p>
            <button onClick={() => addSale(nft.tokenId, priceValue)}>판매하기</button>
          </div>)}        
      </div>
      <h1>판매중인 nft</h1>
      <div style={{display : "flex", gap : "20px", marginTop : "20px"}}>
        {saleNft?.map((nft) => <div>
            <img src={nft.image} style={{width : "100px"}} />
            <h4>{nft.name}</h4>
            <p>{nft.description}</p>
            <h4>{nft.price} ETH</h4>
            <h4>판매자 : {nft.saller}</h4>
            <button onClick={() => buyNFT(nft.tokenId, nft.price)}>구매하기</button>
        </div>)}
      </div>
    </div>
  );
}

export default App;
