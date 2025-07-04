import React, {useCallback, useEffect, useState} from 'react'
import {BrowserProvider, Contract, ethers} from "ethers"
import MyNFT from "../abi/MyNFT.json"
import SaleNFT from "../abi/SaleNFT.json"

// 상수
const NETWORK = {
    chainId : "0xaa36a7",
    name : "sepolia"
}

const useWallet = () => {
    // 상태변수를 사용해서 필요한것만 업데이트
    const [provider, setProvider] = useState(null); // 이더리움 네트워크 연결
    const [signer, setSigner] = useState(null); // 지값 서명자
    const [saleNftContract, setSaleNftContract] = useState(null); // 스마트 컨트랙트 인스턴스 
    const [nftContract, setNftContract] = useState(null); // 스마트 컨트랙트 인스턴스 2
    const [account, setAccount] = useState(null); // 현재 연결된 계정
    const [isNetwork, setIsNetwork] = useState(false); // 올바른 네트워크인지 확인 

    // 메타마스크 커넥션
    // 페이지가 로드된다음에 useWallet함수가 실행되고, 지갑 연결 버튼을 누르면 connectWallet 함수를 실행시키기 위해 정의한다.
    // 그담에 메타마스크 연결하고 상태를 업데이트하고 화면 리렌더링
    const connectWallet = useCallback( async() => {
        if(!window.ethereum) return; // 메타마스크가 없으면 종료
        
        try {
            // 메타마스크 연결
            const _provider = new BrowserProvider(window.ethereum) // 메타마스크 지갑 커넥션 공급자
            const _signer = await _provider.getSigner() // 내 지갑으로 서명할 수 있는 도구
            const _account = await _signer.getAddress(); // 메타마스트로 rpc 요청을 보내서 서명자 호출 


//             MyNFTModule#MyNFT - 0xADF49bffc65f1B6cd306A593210410Ff9da98ddb
// MyNFTModule#SaleNFT - 0x0ee442B33E157De3d5246912f6Dc58413379C368

            // 컨트랙트 연결
            const _nftcontract = new Contract("0xADF49bffc65f1B6cd306A593210410Ff9da98ddb", MyNFT.abi, _signer)
            const _saleContract = new Contract("0x0ee442B33E157De3d5246912f6Dc58413379C368", SaleNFT.abi, _signer)

            // 네트워크 확인
            const {chainId} = await _provider.getNetwork(); // 현재 연결된 네트워크 
            setIsNetwork(`0x${chainId.toString(16)}` === NETWORK.chainId) // sepolia가 맞으면 true

            // 각각의 상태를 업데이트
            setProvider(_provider); // 메타마스크 지갑 커넥션 공급자
            setSigner(_signer);
            setAccount(_account);
            setNftContract(_nftcontract);
            setSaleNftContract(_saleContract);

        } catch (error) {
            console.error("지갑 연결 실패:", error);
        }
    },[])

    // 이벤트 리스너
    useEffect(() => {
        if(!window.ethereum) return;
        
        // 계정 변경 이벤트
        const accountsChanged = (accounts) => {
            setAccount(accounts[0] || null);
        }
        // 네트워크 변경 감지
        const chainChanged = () => {
            window.location.reload(); // 새로고침 그냥 계정 연결 프로세스를 다시 실행시킬수있게.
        }
        
        // 이벤트 리스너 등록
        window.ethereum.on("accountsChanged", accountsChanged)
        // 체인이 변경되면
        window.ethereum.on("chainChanged", chainChanged)
        // 정리
        return () => { // 컴포넌트가 사라질때 이벤트 리스너도 제거
            window.ethereum.removeListener("accountsChanged", accountsChanged)
            window.ethereum.removeListener("chainChanged", chainChanged)
        }
    }, [])

    return {provider, signer, nftContract, saleNftContract, account, isNetwork, connectWallet}
}

export default useWallet