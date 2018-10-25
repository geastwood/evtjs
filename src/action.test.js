/* eslint-env mocha */
const assert = require("assert");
const EVT = require(".");
const Key = require("./key");
const logger = require("./logger");

const wif = "5J1by7KRQujRdXrurEsvEr2zQGcdPaMJRjewER6XsAR2eCcpt3D"; // EVT6Qz3wuRjyN6gaU3P3XRxpnEZnM4oPxortemaWDwFRvsv2FxgND
const publicKey = EVT.EvtKey.privateToPublic(wif);

const network = {
    host: "118.31.58.10",
    port: 8888,
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
describe("Action ABI Test", () => {

    /* recycle tokens: not available on testnet yet */
    // it("recycleft", async function () {

    //     const apiCaller = new EVT({
    //         keyProvider: wif,
    //         endpoint: network
    //     });

    //     let anwser = await apiCaller.pushTransaction(
    //         new EVT.EvtAction("recycleft", {
    //             address: publicKey,
    //             number: "10.00000 S#1",
    //             memo: "Test of recycleft"
    //         })
    //     );

    //     console.log("=== recycleft ===\n", anwser);

    // }).timeout(3000);

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
                Key.privateToPublic(wif)
            ]
        });
        await testAction.calculateDomainAndKey();
        await apiCaller.getInfo();
        let action = { action: testAction.actionName, args: testAction.abi };

        // console.log(action);

        let throughAPI = await apiCaller.__chainAbiJsonToBinByAPI(action);
        let throughFC = await apiCaller.__chainAbiJsonToBinByFC(action);
        console.log(throughAPI.binargs);
        console.log("----------");
        console.log(throughFC);

        assert(throughFC.binargs === throughAPI);

    }).timeout(5000);

});