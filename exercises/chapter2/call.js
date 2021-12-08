const { bytes, BN, Long, units } = require('@zilliqa-js/util');
const {
    getAddressFromPrivateKey,
  } = require('@zilliqa-js/crypto');
const { Zilliqa } = require('@zilliqa-js/zilliqa');


async function main() {
    let api = 'https://dev-api.zilliqa.com';
    const privateKey = '<wallet_privatekey>';
    const tokenId = '1';

    const cryptomonAddr = '0x_contract_addr';

    const zilliqa = new Zilliqa(api);
    zilliqa.wallet.addByPrivateKey(privateKey);
    const address = getAddressFromPrivateKey(privateKey);
    const myGasPrice = units.toQa('2000', units.Units.Li);

    try {
        const networkId = await zilliqa.network.GetNetworkId();
        console.log("networkid: %o", networkId.result);

        const VERSION = bytes.pack(parseInt(networkId.result), 1);

        const contract = zilliqa.contracts.at(cryptomonAddr);
        const callTx = await contract.call(
            'AddCryptoMon',
            [
                {
                    vname: "token_id",
                    type: "Uint256",
                    value: `${tokenId}`,
                },
                {
                    vname: "address",
                    type: "ByStr20",
                    value: `${address}`,
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