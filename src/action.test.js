/* eslint-env mocha */
const assert = require("assert");
const EVT = require(".");
const Key = require("./key");
const logger = require("./logger");

const wif = "5J1by7KRQujRdXrurEsvEr2zQGcdPaMJRjewER6XsAR2eCcpt3D"; // EVT6Qz3wuRjyN6gaU3P3XRxpnEZnM4oPxortemaWDwFRvsv2FxgND
const wif2 = "5JVC3ivLUT2zq3yEXkwJ2ihukZq5reufC3iW26hbVHvjepFXsiu"; // EVT7rbe5ZqAEtwQT6Tw39R29vojFqrCQasK3nT5s2pEzXh1BABXHF
const publicKey = EVT.EvtKey.privateToPublic(wif);
const publicKey2 = EVT.EvtKey.privateToPublic(wif2);

const network = {
    host: "118.31.58.10",
    port: 9999,
    protocol: "http"
};

const testingTmpData = {
    newDomainName: "nd" + (new Date()).valueOf(),
    addedTokenNamePrefix: "tk" + ((new Date()).valueOf() / 500)
};

logger.writeLog = true;

const newCaller = () => new EVT({
    keyProvider: wif,
    endpoint: network,
});

/* New Actions Test Script Here */
/**
 * Including:
 * - recycle
 * - lock
 */

const balanceThrd = {
    "1": 100
}

describe("Preparation", () => {

    it('check remains', async () => {

        const apiCaller1 = EVT({
            endpoint: network,
            keyProvider: wif
        });

        const apiCaller2 = EVT({
            endpoint: network,
            keyProvider: wif2
        });

        let response = [await apiCaller1.getFungibleBalance(publicKey),
                        await apiCaller2.getFungibleBalance(publicKey2)];
        
        response.forEach((balanceList, i) => {
            if (!Array.isArray(balanceList) || !balanceList.length) throw Error(`NO.${i+1} Account does not have any Asset.`);
            Object.keys(balanceThrd).forEach(key => {
                let matched = false;
                balanceList.forEach(p => {
                    if (p.includes(` S#${key}`) && parseFloat(p.replace(` S#${key}`, "")) > balanceThrd[key]) matched = true;
                });
                if (!matched) throw Error(`NO.${i+1} Account does not have sufficient Asset S#${key}. (${balanceThrd[key]} needed).`);
            });
        });
    }).timeout(5000);

})

describe("Action ABI Test", () => {

    /* recycle tokens: not available on testnet yet */
    if (!"Test Recycleft")
    it("recycleft", async function () {

        const apiCaller = new EVT({
            keyProvider: wif2,
            endpoint: network
        });

        let anwser = await apiCaller.pushTransaction(
            new EVT.EvtAction("recycleft", {
                address: publicKey2,
                number: "0.00001 S#1",
                memo: "Test of recycleft"
            })
        );

        let { transactionId } = anwser || {};
        if (!transactionId) {
            if (answer) console.error(anwser);
            throw Error(`Test recycleft, but received empty anwser.`);
        }

    }).timeout(3000);

    it("issuetoken", async () => {

        let apiCaller = newCaller();
        let testAction = new EVT.EvtAction("issuetoken", {
            "domain": "shoRt",
            "names": [
                "oneUnder10",
                "moreStrUnder.15",
                "largestCanGetBelow-21"
            ],
            "owner": [
                Key.privateToPublic(wif),
                Key.privateToPublic(wif2)
            ]
            // ["EVT00000000000000000000000000000000000000000000000000"] => "010000"
            // ["EVT00000000000000000000000000000000000000000000000000" x2] => "0200000000" 
        });
        await testAction.calculateDomainAndKey();
        await apiCaller.getInfo();
        let action = { action: testAction.actionName, args: testAction.abi };

        // console.log(action);

        let throughAPI = await apiCaller.__chainAbiJsonToBinByAPI(action);
        let throughFC = await apiCaller.__chainAbiJsonToBinByFC(action);
        // console.log(throughAPI.binargs);
        // console.log("----------");
        // console.log(throughFC);

        assert(throughFC === throughAPI.binargs);

    }).timeout(5000);

});