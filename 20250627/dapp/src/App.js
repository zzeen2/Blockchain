
import useWeb3 from './hooks/useWeb3';
import contractABI from "./abi/src_contracts_SoonToken_sol_SoonToken.abi"
import { useEffect, useState } from 'react';

function App() {
  const {user,contract, web3} = useWeb3(contractABI, "0x44d08b365888d5b4fd974f9a511a7b84a2484f83");
  const [token, setToken] = useState(0)

  useEffect(() => {
    console.log({user, contract, web3})
    balanceOf();
  }, [user])

  const balanceOf = async() => {
    if(!contract) return;
    const wei = await contract.methods.balanceOf(user.account).call();
    const token = web3.utils.fromWei(wei, "ether");
    console.log(wei);
    setToken(token);
  }
  
  if(!user) return <>...로딩중</>

  return (
    <div className="App">
      <div>지갑 : {user.account}</div>
      <div>ETH : {user.balance}</div>
      <div>토큰 : {token} STK</div>
    </div>
  );
}

export default App;
