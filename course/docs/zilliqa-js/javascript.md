---
sidebar_position: 1
---

# Zilliqa Javascript Library

Zilliqa has a Javascript SDK library which wraps the Zilliqa API to allow developers to communicate with the blockchain in a convenience manner when developing DApps.

In this section, we will cover how to deploy a contract with Zilliqa-JS, how to call a transition and lastly how to fetch contract state.

See https://github.com/Zilliqa/Zilliqa-JavaScript-Library for more information and installation instructions.

## Deploy Contract on Testnet

A Scilla contract can be deployed via [Neo-Savant IDE](https://ide.zilliqa.com) and also Zilliqa JS.

#### Example

```javascript
const { bytes, validation, BN, Long, units } = require('@zilliqa-js/util');
const {
    toBech32Address,
    getAddressFromPrivateKey,
  } = require('@zilliqa-js/crypto');
const { Zilliqa } = require('@zilliqa-js/zilliqa');
const fs = require('fs');

async function main() {

    let api = 'https://dev-api.zilliqa.com';
    const privateKey = '<wallet-privatekey>';

    const zilliqa = new Zilliqa(api);
    zilliqa.wallet.addByPrivateKey(privateKey);
    const address = getAddressFromPrivateKey(privateKey);
    const myGasPrice = units.toQa('2000', units.Units.Li);

    try {
        const networkId = await zilliqa.network.GetNetworkId();
        console.log("networkid: %o", networkId.result);

        const VERSION = bytes.pack(parseInt(networkId.result), 1);

        // deploy impl
        const implCode = fs.readFileSync(__dirname + '/./demo.scilla', 'utf-8');
        const init = [
            {
                vname: '_scilla_version',
                type: 'Uint32',
                value: '0',
            },
            {
                vname: 'contract_owner',
                type: 'ByStr20',
                value: `${address}`,
            },
        ];
        const implContract = zilliqa.contracts.new(implCode, init);
        const [deployedTx, implState] = await implContract.deploy(
            {
                version: VERSION,
                gasPrice: myGasPrice,
                gasLimit: Long.fromNumber(30000),
            },
            33,
            1000,
            false,
        );
        console.log(JSON.stringify(deployedTx, null, 4))
        console.log("contract address: %o", implState.address);
    } catch (err) {
        console.error(err);
    }
}

main();
```

In the above example, we import the `Zilliqa` module and declare a new `Zilliqa` object. Next, we set the api to testnet and add a private key to the wallet. The private key is necessary as we are going to deploy a contract.

```javascript
const { bytes, validation, BN, Long, units } = require('@zilliqa-js/util');
const {
    toBech32Address,
    getAddressFromPrivateKey,
  } = require('@zilliqa-js/crypto');
const { Zilliqa } = require('@zilliqa-js/zilliqa');

let api = 'https://dev-api.zilliqa.com';
const privateKey = '<wallet-privatekey>';
const zilliqa = new Zilliqa(api);
zilliqa.wallet.addByPrivateKey(privateKey);
```

Next, we fetch the current network ID (chain ID) and generate the `VERSION` parameter. This is required later as part of the contract deployment parameters.

```javascript
    try {
        const networkId = await zilliqa.network.GetNetworkId();
        console.log("networkid: %o", networkId.result);

        const VERSION = bytes.pack(parseInt(networkId.result), 1);

        // ...
    } catch (err) {
        console.error(err);
    }
```

Next, we read the Scilla contract code and also declare the initial parameters. The initial parameters consists of the `_scilla_version` which is a mandatory field and any immutable fields as defined in the contract file.

```javascript
    try {
        // ...

        // deploy impl
        const implCode = fs.readFileSync(__dirname + '/./demo.scilla', 'utf-8');   // file path to the contract file

        const init = [
            {
                vname: '_scilla_version',    // mandatory scilla version; always 0
                type: 'Uint32',
                value: '0',
            },
            {
                vname: 'contract_owner',     // immutable field as defined by the demo.scilla
                type: 'ByStr20',
                value: `${address}`,
            },
        ];

        // ...
    } catch (err) {
        console.error(err);
    }
```

Next, we invoke `zilliqa.contracts.new(implCode, init)` to create a contract object from our Scilla code and initial parameters. Finally, we deploy the contract on testnet by using this contract object and calling `implContract.deploy`. The `deploy` is invoked with the `VERSION`, `gasPrice` and also the `gasLimit`.

```javascript
    try {

        // not shown - fetch network id

        // not shown - version

        // not shown - read scilla contract

        // not shown - init params

        const implContract = zilliqa.contracts.new(implCode, init);
        
        const [deployedTx, implState] = await implContract.deploy(
            {
                version: VERSION,
                gasPrice: myGasPrice,
                gasLimit: Long.fromNumber(30000),
            },
            33,    // try max 33 attempts
            1000,  // delay per try
            false, // whether to send the transaction to DS-block, // usually false unless contract is a proxy contract
        );

        console.log(JSON.stringify(deployedTx, null, 4))

        console.log("contract address: %o", implState.address);
    } catch (err) {
        console.error(err);
    }
```

The result is displayed via `console.log(JSON.stringify(deployedTx, null, 4))` and the deployed contract address is outputed. 

## Call Transition

To invoke a transition using Zilliqa JS, the schematics is quite similar to deploying a contract. We need to import and declare the `Zilliqa` object, set a network and private key. We also need to set the deployed contract address. Then, we fetch the network ID anc craft the `VERSION` parameter. Then, we craft the transition parameters and invoke it.

```javascript
const { bytes, validation, BN, Long, units } = require('@zilliqa-js/util');
const {
    toBech32Address,
    getAddressFromPrivateKey,
  } = require('@zilliqa-js/crypto');
const { Zilliqa } = require('@zilliqa-js/zilliqa');


async function main() {
    let api = 'https://dev-api.zilliqa.com';
    const privateKey = '<wallet-privatekey>';

    const myContractAddr = '0x_base16_address';
    
    const zilliqa = new Zilliqa(api);
    zilliqa.wallet.addByPrivateKey(privateKey);
    const myGasPrice = units.toQa('2000', units.Units.Li);

    try {
        const networkId = await zilliqa.network.GetNetworkId();
        console.log("networkid: %o", networkId.result);

        const VERSION = bytes.pack(parseInt(networkId.result), 1);

        const contract = zilliqa.contracts.at(myContractAddr);
        const callTx = await contract.call(
            'Mint',
            [
                {
                    vname: "to",
                    type: "ByStr20",
                    value: `${address}`,
                },
                {
                    vname: "token_uri",
                    type: "String",
                    value: `https://example.token.com/1`,
                },
            ],
            {
                version: VERSION,
                amount: new BN(0),
                gasPrice: myGasPrice,
                gasLimit: Long.fromNumber(10000),
            },
            33,
            1000,
            false
        );
        console.log(JSON.stringify(callTx, null, 4));
    } catch (err) {
        console.error(err);
    }
}

main();
```

In the above example, we invoked the `Mint(to, token_uri)` transition. You can observe that in order to call a transition in Zilliqa JS, we need to craft each of the parameter name and type. It is more verbose than calling a transition using Neo-Savant IDE.

## Fetch Contract State

To fetch a contract state, we are going to use [`GetSmartContractSubState`](https://dev.zilliqa.com/docs/apis/api-contract-get-smartcontract-substate) as it is more specific and hence faster.

```javascript
const { Zilliqa } = require('@zilliqa-js/zilliqa');

async function main() {
    const zilliqa = new Zilliqa('https://dev-api.zilliqa.com');
    const myContractAddress = '0x_base16_address';

    const owners = await zilliqa.blockchain.getSmartContractSubState(
        `${myContractAddress}`,
        'token_owners',
    );

    console.log("Owners: ", JSON.stringify(owners, null, 4));
}

main()
```

In the above example, we import and declare a new `Zilliqa` object. We do not need to add a private key as we are going to fetch data and not deploying contract or calling transitions. Next, we defined the network and the deployed contract address. The contract address shoud be a Base16 address. The `0x` portion is omitted as the SDK does not seem to accept the `0x` prefix.

Next we invoke `zilliqa.blockchain.getSmartContractSubState` to fetch the `token_owners` mutable field from the deployed contract address. The `zilliqa.blockchain.getSmartContractSubState` call is a wrapper around the Zilliqa API- `GetSmartContractSubState`. Once the promise is fulfiled, the owners result is returned.

## Exercises

The following are some exercises to help you be familiar with Zilliqa JS.

**Instructions**

Download these [files](https://github.com/teye/zilliqa-tldr-dapp-course/tree/main/exercises/chapter2) into a folder.

<br/>

**Task 1: Deploy a Contract**

For this task, we are going to deploy a `Cryptomon` contract using Zilliqa JS.

Download the required fileds and open up `deploy.js`.

Edit the `privateKey` to your own wallet private key:

```javascript
let api = 'https://dev-api.zilliqa.com';
const privateKey = 'wallet-privatekey';

const zilliqa = new Zilliqa(api);
```

Open a terminal, change to the **chapter2** folder, execute these statements to deploy the contract, wait for it to complete: 

```
npm install
node deploy.js
```

Your output should look something like this:

```json
networkid: '333'
{
    "code": "scilla_version 0\n\n(***************************************************)\n(*               Associated library                *)\n(***************************************************)\nlibrary CryptoMon\n\n(* Global variables *)\nlet zero = Uint256 0\nlet one = Uint256 1\n\n(***************************************************)\n(*             The contract definition             *)\n(***************************************************)\n\ncontract CryptoMon\n(\n    contract_owner: ByStr20\n)\n\n(* Mutable fields *)\nfield owner: ByStr20 = contract_owner\n\nfield token_owners: Map Uint256 ByStr20 = Emp Uint256 ByStr20\n\n\n(* @dev: Add new item *)\ntransition AddCryptoMon(token_id: Uint256, address: ByStr20)\n  token_owners[token_id] := address;\n  e = {\n    _eventname : \"AddCryptoMon\";\n    token_id: token_id;\n    owner: address\n  };\n  event e\nend\n\n(* @dev: Delete exisitng item *)\ntransition DeleteCryptoMon(token_id: Uint256)\n  delete token_owners[token_id];\n  e = {\n    _eventname : \"DeleteCryptoMon\";\n    token_id: token_id\n  };\n  event e\nend\n",
    "data": "[{\"vname\":\"_scilla_version\",\"type\":\"Uint32\",\"value\":\"0\"},{\"vname\":\"contract_owner\",\"type\":\"ByStr20\",\"value\":\"0x<your_wallet_address>\"}]",
    "version": 21823489,
    "toAddr": "0x0000000000000000000000000000000000000000",
    "nonce": 30,
    "pubKey": "<public_key>",
    "amount": "0",
    "signature": "<signature>",
    "gasPrice": "77359400",
    "gasLimit": {
        "low": 30000,
        "high": 0,
        "unsigned": false
    },
    "receipt": {
        "cumulative_gas": 401,
        "epoch_num": "3582320",
        "success": true
    },
    "provider": {
        "middleware": {
            "request": {},
            "response": {}
        },
        "nodeURL": "https://dev-api.zilliqa.com",
        "reqMiddleware": {},
        "resMiddleware": {}
    },
    "status": 2,
    "toDS": false,
    "blockConfirmation": 0,
    "eventEmitter": {
        "handlers": {},
        "emitter": {},
        "promise": {}
    },
    "id": "<transaction_hash>"
}
contract address: '0x<contract_address>'
```

Take note of the contract address, it would be used for later tasks.

<br/>

**Task 2: Call a Transition**

For this task, we are going to call the `AddCryptoMon(1, <your-wallet-address>)` transition on our deployed contract using Zilliqa JS.

Download the required fileds and open up `call.js`.

Edit the `privateKey` to your own wallet private key and `cryptomonAddr` to the deployed contract address from **Task 1**:

```javascript
const privateKey = '<wallet-privatekey>';
const tokenId = '1';

const cryptomonAddr = '0x<contract_addr>';
```

Open a terminal, change to the **chapter2** folder, execute this to call `AddCryptoMon`, wait for it to complete: 

```
node call.js
```

Your output should look like this:

```json
networkid: '333'
{
    "code": "",
    "data": "{\"_tag\":\"AddCryptoMon\",\"params\":[{\"vname\":\"token_id\",\"type\":\"Uint256\",\"value\":\"1\"},{\"vname\":\"address\",\"type\":\"ByStr20\",\"value\":\"0x<wallet_address>\"}]}",
    "version": 21823489,
    "toAddr": "0x<contract_address>",
    "nonce": 32,
    "pubKey": "<public_key>",
    "amount": "0",
    "signature": "<transaction_signature>",
    "gasPrice": "77359400",
    "gasLimit": {
        "low": 10000,
        "high": 0,
        "unsigned": false
    },
    "receipt": {
        "accepted": false,
        "cumulative_gas": 368,
        "epoch_num": "3582369",
        "event_logs": [
            {
                "_eventname": "AddCryptoMon",
                "address": "0x<contract_address>",
                "params": [
                    {
                        "type": "Uint256",
                        "value": "1",
                        "vname": "token_id"
                    },
                    {
                        "type": "ByStr20",
                        "value": "0x<wallet_address>",
                        "vname": "owner"
                    }
                ]
            }
        ],
        "success": true
    },
    "provider": {
        "middleware": {
            "request": {},
            "response": {}
        },
        "nodeURL": "https://dev-api.zilliqa.com",
        "reqMiddleware": {},
        "resMiddleware": {}
    },
    "status": 2,
    "toDS": false,
    "blockConfirmation": 0,
    "eventEmitter": {
        "handlers": {},
        "emitter": {},
        "promise": {}
    },
    "id": "<transaction_hash>"
}
```

Open the file and observe how the transition parameters are crafted when comparing it to the contract code.

<br/>

**Task 3: Fetch Contract State**

In Task 1, we deployed a sample `Cryptomon` contract. In Task 2, we called `AddCryptoMon` to create `token_id` 1 into our own wallet.

For this task, we are going to fetch a `token_owners` mutable field from our deployed contract using Zilliqa JS.

Download the required fileds and open up `fetch.js`.

Edit `cryptomonAddr` to point to your deployed contract address.

```javascript
const zilliqa = new Zilliqa('https://dev-api.zilliqa.com');
const cryptomonAddr = '0x_contract_address';
```

Open a terminal, change to the **chapter2** folder, execute this fetch `token_owners`, wait for it to complete: 

```
node fetch.js
```

Your output should look like this:

```json
token owners:  {
    "id": 1,
    "jsonrpc": "2.0",
    "result": {
        "token_owners": {
            "1": "0x<wallet_address>"
        }
    },
    "req": {
        "url": "https://dev-api.zilliqa.com",
        "payload": {
            "id": 1,
            "jsonrpc": "2.0",
            "method": "GetSmartContractSubState",
            "params": [
                "<contract_address>",
                "token_owners",
                []
            ]
        }
    }
}
```

That's it for these exercises!

To learn more, you may edit `call.js`'s `tokenId` variable and execute `AddCryptoMon`. After which, call `fetch.js` and observe the `token_owners` field. Try it out and experiment! You may also edit `call.js` to call `DeleteCryptoMon`!
