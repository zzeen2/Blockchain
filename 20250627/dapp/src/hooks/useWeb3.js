import Web3 from "web3"
import { useEffect, useState } from "react"
const SEPOLIA_CI = "0xaa36a7"

const useWeb3 = (abi, CA) => {
    const [user, setUser] = useState({account : "", balance : 0}) 
    const [web3, setWeb3] = useState(null)
    const [isNetWork, setIsNetwork] = useState(false)
    const [contract , setContract] = useState(null)

    const reloadWeb3 = async() => {
        if(!window.ethereum) {
            alert("지갑을 연결해주세요")
            return;
        }

        const accounts = await window.ethereum.request({method : "eth_requestAccounts"})

        const chainId = await window.ethereum.request({method : "eth_chainId"})

        if(chainId !== SEPOLIA_CI) {
            alert("세폴리아 네트워크로 전환하세요")
            setUser({account : "", balance : 0})
            setWeb3(null)
            return
        }

        const web3Provider = new Web3(window.ethereum);
        const wei = await web3Provider.eth.getBalance(accounts[0]);
        const balance = web3Provider.utils.fromWei(wei, "ether")

        setUser({account : accounts[0], balance})
        setWeb3(web3Provider);

        setContract(new web3Provider.eth.Contract(abi, CA))
    }

    useEffect(() => {
        reloadWeb3();

        const chainIdhandler = (chainId) => {
            if(chainId !== SEPOLIA_CI) {
                alert("세폴리아 네트워크로 전환해주세요")
                setUser({account : "", balance : 0})
                setWeb3(null);
                
            }else {
                reloadWeb3();
            }
        }

        if(window.ethereum) {
            window.ethereum.on("chainChanged", chainIdhandler);
        }
        
        // 이벤트 구독은 컴포넌트가 사라지면 해제
        return () => {
            // 화면에서 즉 컴포넌트가 사라졌을때 호출
            window.ethereum.removeListener("chainChanged", chainIdhandler);
        }
    }, [abi,CA])

    return {user,contract, web3 }
}

export default useWeb3
