import { useEffect, useState } from "react";
import useWallet from "./hooks/useWallet";

function App() {
  const {contract, account, isNetwork, connectWallet} = useWallet();
  // 상태변수 정리
  // 디지몬 목록 내가 가지고있는
  // 내가 뽑은 디지몬 보여줄 상태변수
  // 뽑을때 로딩
  // 뽑은 이벤트 이력
  // 이력을 보여줄때 전체 이력과 내 이력만 보기위한 탭 상태변수

  const [digimons, setDigimons] = useState([]); // 디지몬 목록 내가 가지고있는
  const [isLoading, setisLoading] = useState(false); // 뽑을때 로딩
  const [lastestDigimon, setLastestDigimon] = useState(null); // 내가 뽑은 디지몬 보여줄 상태변수
  const [logs, setLogs] = useState([]);  // 뽑은 이벤트 이력
  const [tab, setTab] = useState("ALL"); // 이력을 보여줄때 전체 이력과 내 이력만 보기위한 탭 상태변수

  const tabs = ["ALL", "MY"];

  const buyDigimon = async () => {
    if(!contract) return;

    setisLoading(true);
    const transaction = await contract.buyDigimon(); // 가스비 지불
    await transaction.wait();
    // 구매했을때 뽑힌 디지몬을 내가 가지고 있는 보관함에 넣어줘야한다.
    await loadDigimon();
    setisLoading(false);
  }

  // 디지몬 조회 함수
  const loadDigimon = async () => {
    const digimons = await contract.getMyDigimons();
    console.log(digimons);
    setDigimons(digimons);
  }

  // 이벤트 발생하면 처리할 함수
  const eventHandler = (buyer, name, url, event) => {
    const newEvent = {buyer, name, url, txHash : event.transactionHash }
    setLogs((prev) => [...prev, newEvent])
    if(buyer.toLowerCase() === account.toLowerCase()){
      setLastestDigimon({name, url})
    }
  }
  useEffect (() => {
    if(!contract) return;
    contract.on("DigimonEvent", eventHandler);

    // 이벤트 로그 가져오기
    // 비동기적으로 데이터를 가져와야하니
    const eventLoad = async() => {
      const events = await contract.queryFilter("DigimonEvent");
      const eventDTOs = events.map(({args, transactionHash}) => ({
        buyer : args.buyer,
        name : args.name,
        url: args.url,
        txHash :  transactionHash
      })) //과거순

      setLogs(eventDTOs);
    }
    eventLoad()
  },[contract]);

  return (
    <div className="App">
      <h1>디지몬 뽑기</h1>
      <button onClick={connectWallet}>지갑 연결 시도</button>
      <div>계정 : {account}</div>
      <div>세폴리아 네트워크 검증 : {isNetwork ? "O" : "X"}</div>

      <h2>구매하기</h2>
      <button onClick={buyDigimon} disabled={isLoading || !contract} >
        {isLoading ? "구매중입니다..." : "구매"}
      </button>

      <h2>내가 방금 뽑은 디지몬</h2>
      {lastestDigimon && (
        <DigimonCard 
          url={lastestDigimon.url} 
          name={lastestDigimon.name}
          isLatest={true}
        />
      )}

      <h2>디지몬 목록</h2>
      <div>
        {digimons.map((digimon, index) => <DigimonCard key={index} url={digimon.url} name={digimon.name}/>)}
      </div>

      <h2>뽑은 이력</h2>
      <div>
        {tabs.map((tab) => <button key={tab} onClick={() => setTab(tab)}>{tab}</button>)}
      </div>


      <ul>
        {logs.map((log,index) => (
          <li>
            <div>{log.buyer}가 디지몬 {log.name}을 뽑았습니다</div>
            <a href={`https://sepolia.etherscan.io/tx/${log.txHash}`}>트랜잭션 보러가기</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

const DigimonCard = ({url, name}) => {
  return (
    <div>
      <img src={url} />
      <div>{name}</div>
    </div>
  )
}

export default App;
