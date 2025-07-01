import React, {useCallback, useEffect, useState} from 'react'
import {BrowserProvider, Contract, ethers} from "ethers"
import DigimonJson from "../abi/Digimon.json"

// 상수
const NETWORK = {
    chainId : "0xaa36a7",
    name : "sepolia"
}

const useWallet = () => {
    const [provider, setProvider] = useState(null); // 이더스 공급자 
    const [signer, setSigner] = useState(null); // 이더스 서명자
    const [contract, setContract] = useState(null); // 이더스 컨트랙트 
    const [account, setAccount] = useState(null);
    const [isNetwork, setIsNetwork] = useState(false); // 네트워크 확인용 

    // 메타마스크 커넥션
    const connectWallet = useCallback( async() => {
        if(!window.ethereum) return;
        
        try {
            const _provider = new BrowserProvider(window.ethereum) // 메타마스크 지갑 커넥션 공급자
            const _signer = await _provider.getSigner()
            const _account = await _signer.getAddress(); // 메타마스트로 rpc 요청을 보내서 서명자 호출 

            const _contract = new Contract("0x2d6Ff819F4e0cc256ec5586BaB3EE24d441e5186", DigimonJson.abi, _signer)
            const {chainId} = await _provider.getNetwork(); // 현재 연결된 네트워크 

            setIsNetwork(`0x${chainId.toString(16)}` === NETWORK.chainId)
            setProvider(_provider); // 메타마스크 지갑 커넥션 공급자
            setSigner(_signer);
            setAccount(_account);
            setContract(_contract);
        } catch (error) {
            console.error("지갑 연결 실패:", error);
        }
    },[])

    useEffect(() => {
        if(!window.ethereum) return;
        
        // 계정 변경 이벤트
        const accountsChanged = (accounts) => {
            setAccount(accounts[0] || null);
        }
        
        const chainChanged = () => {
            window.location.reload(); // 새로고침 그냥 계정 연결 프로세스를 다시 실행시킬수있게.
        }
        
        window.ethereum.on("accountsChanged", accountsChanged)
        // 체인이 변경되면
        window.ethereum.on("chainChanged", chainChanged)
        
        return () => {
            window.ethereum.removeListener("accountsChanged", accountsChanged)
            window.ethereum.removeListener("chainChanged", chainChanged)
        }
    }, [])

    return {provider, signer, contract, account, isNetwork, connectWallet}
}

export default useWallet