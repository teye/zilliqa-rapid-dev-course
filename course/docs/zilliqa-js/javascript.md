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
    const base16NoHex = myContractAddress.replace("0x", "");
    
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

**Task 1: Deploy a Contract**

**Task 2: Call a Transition**

**Task 3: Fetch Contract State**