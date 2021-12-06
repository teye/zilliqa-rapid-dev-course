---
sidebar_position: 5
---

# Custom ADT(s)
Recalled in previous tutorials that Scilla has a map structure in which we can store data in key-value format? The value which we stored so far has been the primitive data types, e.g. `ByStr20`, `Uint128`, `String` .etc. 

What if we want to store a more complex value such as an object? 

This is where custom ADT short for _Algebraic Datatype_. An **ADT** is a **user-defined** object that contains other primitive types.

See https://scilla.readthedocs.io/en/latest/scilla-in-depth.html#algebraic-datatypes for more details.

## Declaration
An ADT is defined after the `library` keyword and before the `contract` declarations.

```
scilla_version 0

library MyContract

(* user defined ADT *)
(* owner, unit_no, size  *)
type House =
| House of ByStr20 Uint128 Uint128 

(***************************************************)
(*             The contract definition             *)
(***************************************************)

contract MyContract
(
    owner: ByStr20
)

(* mutable fields declarations *)
(* house_id -> House details *)
field houses_for_sales: Map Uint256 House = Emp Uint256 House

(* procedures declarations *)

(* transitions declarations *)
```

In the above example, we declared a custom type `House` after the library declaration but before the contract definition. 

The `House` type consists of 3 primitive types: `ByStr20 Uint128 Uint128` to record the owner address, unit number and capacity. 

```
field houses_for_sales: Map Uint256 House = Emp Uint256 House
```

This `House` type is later declared in a map under `houses_for_sales`. With these two examples, we can observe how to declare a custom ADT and also how to use it.

#### Syntax
To put it more formally, an ADT declaration looks like this:

```
type CUSTOM_ADT_NAME =
| CUSTOM_ADT_NAME of <Type1> <Type2> .... <TypeK> 
```

A custom ADT can have unlimited types `<TypeX>` and identical types are allowed.

#### Utilizing Custom ADT in Transitions
Now that we've learnt how to declare and use ADTs in maps, we need to know how to create the ADT and assign it to the maps. To create the ADT, we simply call the ADT name and filled in the `Type` to the ADT.

```
transition AddHouse(house_id: Uint256, owner: ByStr20, unit: Uint128, capacity: Uint128)
  new_house = House owner unit capacity;
  houses_for_sale[house_id] := new_house
end
```

In the above `AddHouse()` transition, the transition takes in `house_id`, `owner`, `unit` and `capacity`. 

Next, the transition creates the custom ADT `House` using some of the input parameters.

```
new_house = House owner unit capacity;
```

When we create the custom ADT object, we must filled up all the required `Types` as defined by us.

Finally, the new object is stored into the `houses_for_sale` map.

```
houses_for_sale[house_id] := new_house
```


## Exercises

The following are some exercises to help you be familiar with ADTs.

**Instructions**
- Download this [**CryptoMon Contract**](https://github.com/teye/zilliqa-tldr-dapp-course/blob/main/exercises/chapter1/ch01_cryptomon_custom_adts.scilla) to get started.

<br/>

**Task 1**
Define a custom ADT `Cryptomon`. This ADT should keep track of the Cryptomon name in `String`, age in `Uint128`, height in `Uint128` and level in `Uint128`.


**Task 2**
- After declaring the new ADT, define a map called `cryptomons` which takes the cryptomon id in `Uint256` and map it to the `Cryptomon` ADT from Task 1, i.e. (`Uint256` -> `Cryptomon`).
- Define a new transition `AddCryptoMon` that takes in `cryptomon_id`, `name`, `age`, `height` and `level` and add the new entry into the `cryptomons` map.
- Define a new transition `DeleteCryptoMon` that deletes the specific `cryptomon_id` from `cryptomons`.

**Task 3**

- Deploy the contract on  [**Neo-Savant IDE**](https://ide.zilliqa.com/) on **Simulated Env**.
- Execute `AddCryptoMon(1, GetRichMon, 500, 12, 10)`.
- Execute `AddCryptoMon(2, WhaleMon, 750, 50, 100)`.
- Execute `DeleteCryptoMon(1)`.
- Look at the deployed contract state on **ViewBlock**.

The final contract state should look something like this:

```json
cryptomons : {
    "2": {
        "argtypes": [],
        "arguments": [
            "WhaleMon",  // name
            "750",       // age
            "50",        // height
            "100"        // level
        ]
    }
}
```
