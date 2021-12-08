const { Zilliqa } = require('@zilliqa-js/zilliqa');

async function main() {
    const zilliqa = new Zilliqa('https://dev-api.zilliqa.com');
    const cryptomonAddr = '0x_contract_addr';
    
    const owners = await zilliqa.blockchain.getSmartContractSubState(
        `${cryptomonAddr}`,
        'token_owners',
    );

    console.log("token owners: ", JSON.stringify(owners, null, 4));
}

main()