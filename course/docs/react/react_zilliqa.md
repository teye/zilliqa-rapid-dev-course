---
sidebar_position: 1
---

# Integrating Zilliqa with React

So far, in Chapter 1, we covered Scilla; Zilliqa's smart contract langauge. In Chapter 2, we covered Zilliqa API and Zilliqa JS, both of which help us communicate with the Zilliqa blockchain and fetch contract state.

In this final section of the TLDR course, we will walk-through the steps to develop a simple React DApp that will combine all our knowledge from the previous chapters. This DApp will demonstrate how to fetch contract state and rendered it on the UI and also calling transitions with buttons.

#### Step 1

First, we are going to create a sample react app

Open a terminal and execute the following:

```bash
npx create-react-app cryptomon
```

#### Step 2

Copy and replace the following code for `App.js`

```javascript title="/cryptomon/src/App.js"
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Cryptomon</h1>
        <p>A crypto-currency sample react app</p>
      </header>
    </div>
  );
}

export default App;
```

Now, let's run the project:

```bash
cd cryptomon
npm run start
```

Browse to http://localhost:3000, it should look something like this:

![Main Page](./screenshots/main.png)


#### Step 3

Now, we have to deploy the Cryptomon contract.

Download this [**Cryptomon**](https://github.com/teye/zilliqa-tldr-dapp-course/tree/main/exercises/chapter3/cryptomon.scilla) contract and head to [**Neo Savant IDE**](https://ide.zilliqa.com).

On Neo-Savant IDE, select **Testnet** and deploy this contract.

Take note of the contract address.

Next, select the deployed contract on Neo-Savant IDE. 

Execute `AddCryptoMon`, set the `token_id` to `1` and the `address` to your wallet address. 

Once the transaction is confirmed, check the state on Devex Zilliqa or ViewBlock to ensure that the new token id is added to `token_owners` map.

#### Step 4

Next, let's return back to our react app. 

We are going to add Zilliqa JS so that we can fetch the `token_owners` and display it on our react app.

Open a terminal and change to the react app directory execute the following:

```
npm install @zilliqa-js/zilliqa
```

#### Step 5
