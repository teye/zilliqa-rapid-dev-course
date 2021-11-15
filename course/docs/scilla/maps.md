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
In the above example, `token_owners` is a map `Uint256 -> ByStr20` the key is of type `Uint256` and the value is of type `ByStr20`, the contract state would look like this:

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

<br/>
<br/>

# Intermediate - Nested Maps (Optional)
Nested maps are maps whose value point to a key of the second map. There is no limit to the number of nesting levels.

## Nested Maps - Declaration
Identical to how we declare a non-nested map, we first define a mutable field in the contract and assigned a `Type` for the key and value which it can hold. We also assigned an empty map - denoted by `Emp` to the new map field.

#### Syntax
```
contract ContractName()
  field map_name: Map Type1 (Map Type2 Type3) = Emp Type1 (Map Type2 Type3)
```

#### Example
```
contract SuperMarket()
  (* Mapping of category_id -> product_id -> name *)
  field products: Map Uint256 (Map Uint256 String) = Emp Uint256 (Map Uint256 String)
```
In the above example, `products` is a map `Uint256 -> (Map Uint256 String)` the key is of type `Uint256` and the value is of type `Map`. Within the nested map, we have `Uint256 -> String` 

the contract state would look like this:

```json
products : {
    "1": {
      "42": "red apple",
      "43": "green apple",
      "44": "orange"
    },
    "2": {
      "27": "celery",
      "28": "spinach",
      "29": "cabbage"
    },
}
```

## Nested Maps - Add / Overwrite Entries
Adding an entry into a nested map is identical to the non-nested one.

#### Syntax
```
  transition transitionName()
    map_name[key1][key2] := value
  end
```

#### Example
```
  transition AddMap(category_id: Uint256, product_id: Uint256, name: String)
    products[category_id][product_id] := name
  end
```

## Nessted Maps - Delete Entries
Deleting an entry from a nested map is identical to the non-nested one.

#### Syntax
```
  transition transitionA()
    delete map_name[key1][key2]
  end

  transition transitionB()
    delete map_name[key1]
  end
```

#### Example
```
  transition DeleteA(category_id: Uint256, product_id: Uint256)
    delete products[category_id][product_id]
  end

  transition DeleteB(category_id: Uint256)
    delete products[category_id]
  end
```

In the above examples, the first transition `DeleteA` deletes a specific entry from the nested map. However in `DeleteB`, the transition **deletes the entire nested map**.

Here is how the contract state would look like if we execute both transitions:

Suppose the initial contract state is:
```
products : {
    "1": {
      "42": "red apple",
      "43": "green apple",
      "44": "orange"
    },
    "2": {
      "27": "celery",
      "28": "spinach",
      "29": "cabbage"
    },
}
```

If we call `DeleteA(1, 42)`, the state would become this:
```
products : {
    "1": {
      "43": "green apple",
      "44": "orange"
    },
    "2": {
      "27": "celery",
      "28": "spinach",
      "29": "cabbage"
    },
}
```

Observe that the entry `42 -> red apple` has been deleted.

If we call `DeleteB(1)`, the state would become this:
```
products : {
    "2": {
      "27": "celery",
      "28": "spinach",
      "29": "cabbage"
    },
}
```

Observe that the entires `1 -> { ... }` has been deleted.

### Proper Nested Maps Deletion
Usually when we delete a map entry, we would delete only a specifc `key-value` pair. For nested maps, this may result in a lot of empty map states.

Suppose we have the following map:
```
products : {
    "1": {
      "42": "red apple",
      "43": "green apple",
      "44": "orange",
      "45": ...,
      "46": ...
      ...
      ...
      "100": "cherry"
    },
    "2": {
      ...
    },
    "3": {
      ...
    }
}
```

If we continously delete an entry from "1", example, delete `42 -> red apple`, next delete `43 -> green apple`, etc. Then the map would have an empty state when all the items within category "1" is deleted:
```
products : {
    "1": {},  <-- empty map state
    "2": {
      ...
    },
    "3": {
      ...
    }
}
```

If we have many product categories and we perform many entry deletion from a nested map, we would end up with map empty map states!
```
products : {
    "1": {},  <-- empty map state
    "2": {},
    "3": {},
    "4": {},
    ...
    ...
    ...
    "999": {},
    "1000": {
      "20": "jam"
    }
}
```

These empty states would slow down the time taken to fetch the contract state! 

Hence, we need to delete the "outer layer" in the map once the inner nested entries have all been deleted.

#### Example
In order to delete the "outer layer" map, we need to add the following checks:
```
  (* Library *)
  import ListUtils IntUtils

  let uint32_zero = Uint32 0

  (* check if nested maps are empty *)
  let is_products_map_empty =
    fun(m : Map Uint256 String) =>
      let map_size = builtin size m in
      builtin eq map_size uint32_zero

  (***************************************************)
  (*             The contract definition             *)
  (***************************************************)
  contract SuperMarket()

  (* Deletes the category if the nested map is empty *)
  procedure DeleteCategory(category_id: Uint256)
    products_map <- products[category_id];

    match products_map with
    | Some products_entry =>
      is_map_empty = is_products_map_empty products_entry;

      match is_map_empty with
      | True => 
        (* empty map *)
        delete products[category_id]
      | False =>
        (* contains other records *)
    | None =>
        (* nothing to delete *)
    end

  end

  transition DeleteProduct(category_id: Uint256, product_id: Uint256)
    delete products[category_id][product_id];
    DeleteCategory category_id
  end
```

Let's start with the transition `DeleteProduct`. `DeleteProduct` deletes a specifc nested map entry `products[category_id][product_id`. After the deletion, it calls the procedure `DeleteCategory`.

Inside `DeleteCategory`, the transition checks if there exists other nested map entries. Since we have deleted one entry in `DeleteProduct`, we need to consider if there are other `product_id` within the same `category_id`, for example:

```json
products: {
  "1": {
    "43": "green apple",
    "44": "orange",
  }
}
```

This check is done by `is_map_empty = is_products_map_empty products_entry;`. We code our own library function `is_products_map_empty` before the contract definition section.

```
  let is_products_map_empty =
    fun(m : Map Uint256 String) =>
      let map_size = builtin size m in
      builtin eq map_size uint32_zero
```

What `is_products_map_empty` does is to take in `products[1]` and calculate the size of this map; something like _"array.size()"_ in other languages. The function `is_products_map_empty` returns `True` if `products[1]` is empty and `False` otherwise. 

In the above example, `products[1]` has 2 other nested map entries `43 -> green apple` and `44 -> orange`. So the function `is_products_map_empty` will return `False`.

Next, we will `delete products[1]` if `products[1]` is empty:
```
  (* Deletes the category if the nested map is empty *)
  procedure DeleteCategory(category_id: Uint256)
    products_map <- products[category_id];

    match products_map with
    | Some products_entry =>
      is_map_empty = is_products_map_empty products_entry;

      match is_map_empty with
      | True => 
        (* empty map *)
        delete products[category_id]    <-- delete the "outer" layer
      | False =>
        (* contains other records *)
    | None =>
        (* nothing to delete *)
    end

  end
```

To summarize, for proper maps deletion in **nested maps**, we code our own `DeleteProduct` transition that not only deletes the nested map entry but also the outer layer if the inner layer is empty after the deletion of the nested map entry.


## Exercises

The following are some exercises to help you be familiar with maps.

**Instructions**
- Download this [marketplace contract](https://github.com/teye/zilliqa-tldr-dapp-course/blob/main/exercises/chapter1/ch01_marketplace.scilla) to get started.

**Task 1**
- Define a new map `products` (`Uint256` -> `ByStr20`) that stores the mapping of `product_id` to users wallet addresses.
- Define a new transition `AddItem` that assigns a `item_count` to the target address and updates the `products` accordingly.
- Define a new transition `DeleteItem` that deletes the `item_id` from `products`.

**Task 2**

Deploy the contract on [Neo-Savant IDE](https://ide.zilliqa.com/) on **Testnet** and execute `AddItem(wallet_address)`. 

Once the transaction is confirmed, execute `AddItem(wallet_address)` a second time. 

Look at the deployed contract state on **ViewBlock**.

The contract state should look something like this:

```json
products : {
    "1": "0x<wallet_address>",
    "2": "0x<wallet_address>",
}
```

**Task 3**

Return back to Neo-Savant IDE, execute `DeleteItem` on `item_id` **1**. 

Check the `products` state again on ViewBlock.

It should look like this:

```json
products : {
    "2": "0x<wallet_address>",
}
```
