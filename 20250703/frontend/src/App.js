import axios from "axios";
import { useEffect, useState } from "react";
import useWallet from "./hooks/useWallet";

// 엔드포인트 :  https://api.pinata.cloud/pinning/pinFileToIPFS

const pinata_api_key = process.env.PINATA_API_KEY;

const pinata_secret_api_key = process.env.PINATA_SECRET_API_KEY;

function App() {
  const {account, contract, connectWallet} = useWallet()
  const [file, setFile] = useState(null);
  
  useEffect(() => {
    connectWallet()
  })
  const uploadFileIPFS =  async () => {
    if(!file) return
    const formData = new FormData();
    formData.append("file", file, "귀여운 뚱이");

    // 파일을 올리고 컨텐츠 식별자 주소를 반환하는 메서드
    const { data } = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      headers : {
        "Content-Type" : "multipart/form-data",
        pinata_api_key,
        pinata_secret_api_key
      }
    });
    
    
    const ipfsImage = `ipfs://${data.IpfsHash}`;
    const JsonURI = await uploadJsonMetaDataIPFS("zzen", "지은", ipfsImage);
    const transaction = await contract.minting(JsonURI);
    await transaction.wait();
    alert("ipfs 업로드 이후 민팅 완료");
    // return `http://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
    
  }
  
  const uploadJsonMetaDataIPFS =  async (name, description, image) => {
    const metaData = {
        name,
        description,
        image
    }
    const blob = new Blob([JSON.stringify(metaData)], {
      type : "application/json"
    })
    
    const formData = new FormData();
    formData.append("file", blob, "metadata.json")

    const { data } = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      headers : {
        "Content-Type" : "multipart/form-data",
        pinata_api_key,
        pinata_secret_api_key
      }
    })
   return data.IpfsHash;
    
  }

  return (
    <div className="App">
      <input type="file" onChange={(e) =>  setFile(e.target.files[0])}/>
      <button onClick={uploadFileIPFS}>ipfs 업로드</button>
    </div>
  );
}

export default App;