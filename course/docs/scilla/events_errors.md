---
sidebar_position: 4
---

# Events & Errors
In some of the eariler topics, we already saw some events outputs. In this section, we are going to properly introduce Scilla events and how to throw errors exception.

## Events
A Scilla event is an output of a function call. Normally, we used it to output mutable field values after updating them. Scilla events can be read from the blockchain transaction receipt.

#### Syntax
```
  transition transitionName()
    e = {_eventname: "EventName"; field: "your_msg"}
    event e
  end
```

To output events, we first declare an `e` object and use the `_eventname` keyword. Next, we need to give this event a name and also add the contents that will be output. Finally, we emit the event by calling `event e`.

#### Example
```
  transition demoA()
   e = {_eventname: "demoA"; msg: "hello, I am a Scilla event"};
   event e
  end
```

```
  transition demoB(input: Uint128)
    e = {_eventname: "demoB"; num: input}
    event e  
  end
```

Above are some examples how events can be used. An event can output any types as long as the types are valid. For instance in `demoB`, we can output a `Uint128` supplied by the user.

To view the events output, we can view the transaction state on blockchain explorer such as [**Devex Zilliqa**](https://devex.zilliqa.com) and [**ViewBlock**](https://viewblock.io/zilliqa).

An example of invoking the transition `demoB` looks like this on Devex Zilliqa under "Event Logs" section:

![Devex Zilliqa Emit Event](./screenshots/events.png)

## Errors

## Exercises