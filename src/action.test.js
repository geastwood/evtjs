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
    newDomainName: null,
    addedTokenNamePrefix: null
};

logger.writeLog = true;

/* New Actions Test Script Here */
/**
 * Including:
 * - recycle
 * - lock
 */
describe("Action API Test", () => {

    /* recycle tokens */
    it("recycleft", async function () {

        const apiCaller = new EVT({
            keyProvider: wif,
            endpoint: network
        });

        let anwser = await apiCaller.pushTransaction(
            new EVT.EvtAction("recycleft", {
                address: publicKey,
                number: "10.00000 S#1",
                memo: "Test of recycleft"
            })
        );

        console.log("=== recycleft ===\n", anwser);

    }).timeout(3000);

});