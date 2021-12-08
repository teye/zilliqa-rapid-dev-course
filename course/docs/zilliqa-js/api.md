---
sidebar_position: 2
---

# Zilliqa API

Zilliqa has a set of [JSON-RPC APIs](https://dev.zilliqa.com/docs/apis/api-introduction) to communicate with the blockchain. Developers can query the contract state, query the blockchain state and account balances etc.

These JSON-RPC APIs runs on several networks, each network serve different purposes.

| Chain(s)          | URL(s) |
|-------------------|-----------------------------------------------|
| Zilliqa mainnet   | https://api.zilliqa.com/                      |
| Developer testnet | https://dev-api.zilliqa.com/                  |
| Local testnet     | http://localhost:4201/                        |
| Isolated server   | https://zilliqa-isolated-server.zilliqa.com/  |

Refer to https://dev.zilliqa.com/docs/apis/api-introduction for more details about the respective networks and chain IDs.

:::warning

On Zilliqa mainnet, the JSON-RPC API server has a rate limit. If you invoke a lot of APIs in a short amount of time, the API server will rate limit your machine, preventing you from further calling any APIs for a few minutes.

However, developers can make unlimited requests on the developer testnet, local testnet and isolated server.

:::

<br/>
<br/>

In this section, we will focus on these 3 APIs that are commonly used when developing a dApp. The APIs are `GetSmartContractState`, `GetSmartContractSubState` and `GetBlockchainInfo`. This section will not cover the usage and details, as they can referred to from the links. The aim of this section is to let developers focus on these few APIs that are more commonly used rather than going through the entire list of APIs.

## GetBlockchainInfo

The [**GetBlockchainInfo**](https://dev.zilliqa.com/docs/apis/api-blockchain-get-blockchain-info) returns the current network statistics for the specified network. It returns the `NumTxBlocks` info which gives us the current block number of the network. This information is useful for calculating "elasped time", e.g. for auctions. Because timestamps are not a good gauge of "time" in a blockchain, when we want to calculate time elapsed, we would usually calculate the block number difference to gauge the "elapsed time". On average, it takes roughly 30 seconds for 1 block to be processed on the mainnet.

## GetSmartContractState

The [**GetSmartContractState**](https://dev.zilliqa.com/docs/apis/api-contract-get-smartcontract-state) fetches all the available mutable fields in the contract. This is one of the APIs that can query contract state, the other being `GetSmartContractSubState`. For small contracts that do not have large number of maps, `GetSmartContractState` is fine. However, we strongly recommend you to use `GetSmartContractSubState` whenever possible as the `GetSmartContractState` is slower if the contract state is large.

## GetSmartContractSubState

The [**GetSmartContractSubState**](https://dev.zilliqa.com/docs/apis/api-contract-get-smartcontract-substate) fetches a particular mutable field of the smart contract. This is similar to `GetSmartContractState` but it fetches only the fields that is specified in the request parameter. 

This is the **recommended** API to use when we want to fetch contract state as it is more precise and faster and thus reduce the load on Zilliqa lookup servers.