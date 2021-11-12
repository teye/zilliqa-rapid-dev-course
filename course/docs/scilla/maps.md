---
sidebar_position: 2
---

# Maps
In Scilla, `Maps` and `Lists` are two of the core data types that can store complex data. In particular, `Maps` are more widely used in almost all of the contracts.

## Declaration
To declare a new map, we defined it as a mutable field in the contract and assigned a `Type` for the key and value which it can hold. We also assigned an empty map - denoted by `Emp` to the new map field.

#### Syntax
```
contract ContractName()
  field map_name: Map Type1 Type2 = Emp Type1 Type2
```

**Note:**
- `Type1` and `Type2` can be the same type.
- Nested maps are possible.


#### Example
```
contract CryptoMon()
  (* Mapping of token_id -> owner_address *)
  field token_owners: Map Uint256 ByStr20 = Emp Uint256 ByStr20
```
In the above example, `token_owners` is a map `Uint256 -> ByStr20` the key is of type `Uint256` and the value that the map stores is of type `ByStr20`, the contract state would look like this:

```json
token_owners : {
    "1": "0x1234567890123456789012345678901234567890",
    "2": "0x1234567890123456789012345678901234567890",
}
```

## Add / Overwrite Map Entries
To add a new map entry, assign a new key and value to the map. This is also known as in-place access.

#### Syntax
```
  transition transitionName()
    map_name[key] := value
  end
```

#### Example
```
  transition AddMap(id: Uint256, address: ByStr20)
    token_owners[id] := address
  end
```

In the above example, the `AddMap()` transition takes in an `id` and `address` and updates the `token_owners` map. This allow us to overwrite existing map entries with new values.

:::danger

Always update the map **in-place**. 
Do not copy a new map, update the map and re-assigned it back! 

This is slow and consumes a lot of gas!

DON'T DO THIS:
```
  transition AddMap(id: Uint256, address: ByStr20)
    new_token_owners <- token_owners;
    new_token_owners[id] := address;
    token_owners := new_token_owners
  end
```

:::

## Delete Map Entries
To delete a map entry, simply use the `delete` keyword on the particular map entry.

#### Syntax
```
  transition transitionName()
    delete map_name[key]
  end
```

#### Example
```
  transition DeleteMap(id: Uint256)
    delete token_owners[id]
  end
```

The above example deletes the specific `token_owners[id]` entry from the map. 

If a map is empty, the contract state would look like this:
```json
  token_owners: {}
```

## Exercises

The following are some exercises to help you be familiar with maps.

Download this skeleton contract code to get started.

**Task 1**
- Define a new map `token_owners` (`Uint256` -> `ByStr20`) that stores the mapping of `token_id` to users wallet addresses.
- Define a new transition `Mint` that assigns a `token_id` to the `_sender` and updates the `token_owners` accordingly.
- Define a new transition `Burn` that deletes the `token_id` from `token_owners`.

**Task 2**

Deploy the contract on [Neo-Savant IDE](https://ide.zilliqa.com/) on **Testnet** and execute `Mint`. 

Once the transaction is confirmed, execute `Mint` a second time. 

Look at the deployed contract state on **VuewBlock**.

The contract state should look something like this:

```json
token_owners : {
    "1": "0x<wallet_address>",
    "2": "0x<wallet_address>",
}
```

**Task 3**

Return back to Neo-Savant IDE, execute `Burn` on `token_id` **1**. 

Check the `token_owners` state again on ViewBlock.

It should look like this:

```json
token_owners : {
    "2": "0x<wallet_address>",
}
```
