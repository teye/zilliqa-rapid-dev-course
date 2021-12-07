---
sidebar_position: 6
---

# Remote State Reads
Remote state read is a feature in Scilla that allows a deployed contract to read the **mutable fields** of another deployed contract.

**Note**: Only mutable fields can be fetched via remote state reads.

There are two ways to access the mutable fields of another deployed contract. (1) By declaring the remote contract address in the **contract definition** and (2) By declaring the remote contract address in the **transition parameters**.

## Declaration in Contract Definition
The easiest way to access a remote mutable field is to declare the remote contract address in the contract definition.
We can read one mutable field or unlimited mutable fields as long as the remote contract address has that mutable field.

#### Syntax
```
  contract MyContract
  (
      owner: ByStr20,
      remote_contract_address: ByStr20 with contract
        field mutable_field1_name: <mutable_field1_type>,
        field mutable_field2_name: <mutable_field2_type>,
      end
  )
```

#### Example
```
  contract Marketplace
  (
      owner: ByStr20,
      cryptomons: ByStr20 with contract
        field token_owners: Map Uint256 ByStr20
      end
  )
```

Suppose, we have a Marketplace contract that allows users to trade Cryptomons. The Marketplace contract must know the owners of the Cryptomons before it can allow users to trade with one another. To do that we need to perform remote state read.

The Marketplace contract is deployed with a `owner` and `cryptomons` as a immutable field. The `cryptomons` field is a remote contract that has already been deployed. To access the mutable fields of this `cryptomons` contract, we need to declare it in the contract definition first.

We introduced a new Scilla syntax: `ByStr20 with contract ... end`. In Scilla a `ByStr20` is an address. An address can either be a contract address or wallet address. The `ByStr20 with contract` is a syntax to inform Scilla that we are going to access a `ByStr20` address that is of a contract type.

Next, we define the mutable fields of this `cryptomons` contract which we want to read. For instance, if we wish to access `token_owners` field in the `cryptomons` contract from the Marketplace contract, we list the `cryptomons` field like how we declare the usual mutable field syntax.

**Note**: `token_owners` can only be accessed from `Marketplace` contract if `cryptomons` contract has the mutable field `token_owners`. If the `cryptomons` contract does not have `token_owners` mutable field, then an error would be thrown when we try to deploy this `Marketplace` contract.

## Declaration in Transition Parameters
Similar to how we declared the remote contract address in the contract definition, we can do the same in the transition parameters.

#### Syntax
```
  transition transitionName(
      remote_contract_address: ByStr20 with contract
        field mutable_field_name1: <mutable_field_type>,
        field mutable_field_name2: <mutable_field_type2>
      end
  )
  end
```

#### Example
```
  transition Trade(
      cryptomons: ByStr20 with contract
        field token_owners: Map Uint256 ByStr20
      end
  )
  end
```

## Read Remote Mutable Fields
Now that we've learnt how to declare the remote contract address, we need to understand how to read the mutable fields which we have just declared.

#### Syntax
```
  contract MyContract
  (
      owner: ByStr20,
      remote_contract_address: ByStr20 with contract
        field mutable_field1_name: <mutable_field1_type>,
        field mutable_field2_name: <mutable_field2_type>,
      end
  )

  transition transitionName()
    my_mutable_field_1 <-& remote_contract_address.mutable_field1_name;
    my_mutable_field_2 <-& remote_contract_address.mutable_field2_name;
  end
```

#### Example
```
  contract Marketplace
  (
      owner: ByStr20,
      cryptomons: ByStr20 with contract
        field token_owners: Map Uint256 ByStr20
      end
  )

  transition Trade(cryptomon_id: Uint256)
    existing_owner <-& cryptomons.token_owners[cryptomon_id];
    is_sender = builtin eq _sender existing_owner;
    match is_sender with
    | False =>
      err = CodeNotTokenOwner;
      ThrowError err
    | True =>
  end
```

To the remote mutable field, we use the syntax `<-&`. As shown in the above example, we first declare the remote contract address in the contract definition. Next, in the transition, we use the `<-&` syntax to access the `token_owners` field from the `cryptomons` declaration and assigned it to an `existing_owner` variable. In this way, we can read the cryptomons contract to check if this cryptomon that we are going to trade belongs to this sender or not.

## Exercises

The following are some exercises to help you be familiar with remote state reads.

**Instructions**
- Download this [**Cryptomon Contract**](https://github.com/teye/zilliqa-tldr-dapp-course/blob/main/exercises/chapter1/ch01_remote_state_read_cryptomon.scilla) and [**Marketplace Contract**](https://github.com/teye/zilliqa-tldr-dapp-course/blob/main/exercises/chapter1/ch01_remote_state_read_marketplace.scilla) to get started.

**Task**
- Deploy the **Cryptomon** contract on  [**Neo-Savant IDE**](https://ide.zilliqa.com/) on **Simulated Env**.
- Deploy the **Marketplace** contract, for the `cryptopmons` parameter, use the address from above.
- In the **Cryptomon** contract, execute `AddCryptoMon(1, <your_wallet_address>)`.
- Using a **different wallet address**, in the **Marketplace** contract, execute `CreateTrade(1, 100)`.
  - Observe the transaction logs for events.
  - You should see error `-1` which is `CodeNotTokenOwner` being thrown.
  - This implies our remote state read is working as intended.
- Switch back the **original** wallet address which executes `AddCryptoMon(1)` and call `CreateTrade(1, 100)` in the **Marketplace** contract.
  - Observe the transaction logs for events.
  - You should see a `CreateTrade` event being emitted.
