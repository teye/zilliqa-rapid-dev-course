import { useState, useEffect } from 'react';
import './App.css';

const { bytes, BN, Long, units } = require('@zilliqa-js/util');
const { Zilliqa } = require('@zilliqa-js/zilliqa');


async function fetchTokenOwners() {
  const zilliqa = new Zilliqa('https://dev-api.zilliqa.com');
  const cryptomonAddr = process.env.REACT_APP_CRYPTOMON_ADDR;
  
  const owners = await zilliqa.blockchain.getSmartContractSubState(
      `${cryptomonAddr}`,
      'token_owners',
  );

  return owners;
}

async function AddCryptoMon(token_id, address) {
  const zilliqa = new Zilliqa('https://dev-api.zilliqa.com');
  const privateKey = process.env.REACT_APP_PRIVATE_KEY;
  const cryptomonAddr = process.env.REACT_APP_CRYPTOMON_ADDR;

  zilliqa.wallet.addByPrivateKey(privateKey);
  const myGasPrice = units.toQa('2000', units.Units.Li);

  try {
    const networkId = await zilliqa.network.GetNetworkId();
    console.log("networkid: %o", networkId.result);

    const VERSION = bytes.pack(parseInt(networkId.result), 1);

    const contract = zilliqa.contracts.at(cryptomonAddr);
    const callTx = contract.call(
        'AddCryptoMon',
        [
            {
                vname: "token_id",
                type: "Uint256",
                value: `${token_id}`,
            },
            {
                vname: "address",
                type: "ByStr20",
                value: `${address}`,
            },
        ],
        {
            version: VERSION,
            amount: new BN(0),
            gasPrice: myGasPrice,
            gasLimit: Long.fromNumber(5000),
        },
        33,
        1000,
        false
    );

    return callTx;
  } catch (err) {
    console.error(err);
  }
}

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadAddCryptoMon, setLoadAddCryptoMon] = useState(false);

  useEffect(() => {
    let owners = [];

    setLoading(true);

    fetchTokenOwners()
      .then((res) => {
        if (res.result) {
          for (const [token_id, owner_address] of Object.entries(res.result.token_owners)) {
            owners.push({
              token_id: token_id,
              owner: owner_address,
            })
          }
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        console.log(owners);
        setData([...owners]);
        setLoading(false);
      })
  }, []);

  const onUpdateTokenOwners = () => {
    let owners = [];
    
    setLoading(true)

    fetchTokenOwners()
      .then((res) => {
        if (res.result) {
          for (const [token_id, owner_address] of Object.entries(res.result.token_owners)) {
            owners.push({
              token_id: token_id,
              owner: owner_address,
            })
          }
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        console.log(owners);
        setData([...owners]);
        setLoading(false);
      })
  }

  const onAddCryptoMon = async () => {
    setLoadAddCryptoMon(true);

    let nextId = 0;
    const owners = await fetchTokenOwners();

    if (owners) {
      nextId = Object.keys(owners.result.token_owners).length + 1;
    }

    AddCryptoMon(nextId, process.env.REACT_APP_WALLET_ADDRESS)
      .then(async (res) => {
        console.log(res);
        if (res.receipt.success) {
          // add success
          // fetch new token owners
          await onUpdateTokenOwners();
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoadAddCryptoMon(false);
      })
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Cryptomon</h1>
        <p>A crypto-currency sample react app</p>

        {
          loading ?
          <p>Loading cryptomons...</p> :

          (
            data &&
            data.length > 0 &&
            data.map((item) => (
              <div key={item.token_id}>
                <span>Token ID: {item.token_id}&nbsp;&nbsp;Owner: {item.owner}</span>
              </div>
            ))
          )
        }

        {
          loadAddCryptoMon &&
          <p>Adding new cryptomon, please wait...</p>
        }

        <p></p>
        <button onClick={() => onAddCryptoMon()} disabled={loadAddCryptoMon}>Add CryptoMon</button>
      </header>
    </div>
  );
}

export default App;