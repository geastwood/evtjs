/* eslint-env mocha */
const assert = require("assert");
const EVT = require(".");
const Key = require("./key");
const logger = require("./logger");

const wif = "5JgWJptxZENHR69oZsPSeVTXScRx7jYPMTjPTKAjW2JFnjEhoDZ";
const wif2 = "5KXxF69n5SsYSQRs8L855jKC5fqzT6uzRzJ1r686t2RRu9JQr9i";
const publicKey = EVT.EvtKey.privateToPublic(wif);

const testingTmpData = {
    newDomainName: null,
    addedTokenNamePrefix: null
};
logger.writeLog = true;

/*const network = {
    host: "testnet1.everitoken.io",
    port: 8888,
    protocol: "https"
};*/

const network = {
    host: "118.31.58.10",
    port: 8888,
    protocol: "http"
};

// ==== part 1: version ====
describe("version", () => {
    it("exposes a version number", () => {
        assert.ok(EVT.version);
    });
});

// ==== part 2: EvtKey ====
describe("EvtKey", () => {
    it("randomBytesAndString", async () => {
        let name128 = await EVT.EvtKey.randomName128();
        assert(name128.length == 21, "should produce a string with a length of 21");

        assert((await EVT.EvtKey.random32BytesAsHex()), "should produce a 32 bytes hex");
    });

    it("test ecc key generation", async () => {
        let key = await EVT.EvtKey.randomPrivateKey();
        let publicKey = EVT.EvtKey.privateToPublic(key);

        assert(publicKey.startsWith("EVT"), "expected publicKey starting with EVT");
    });

    it("test seed key generation", async () => {
        let key = await EVT.EvtKey.seedPrivateKey("seed");
        let publicKey = EVT.EvtKey.privateToPublic(key);

        assert(key === "5J1by7KRQujRdXrurEsvEr2zQGcdPaMJRjewER6XsAR2eCcpt3D");
        assert(publicKey === "EVT6Qz3wuRjyN6gaU3P3XRxpnEZnM4oPxortemaWDwFRvsv2FxgND");
    });

    it("test validKey", async () => {
        assert(EVT.EvtKey.isValidPrivateKey("5J1by7KRQujRdXrurEsvEr2zQGcdPaMJRjewER6XsAR2eCcpt3D"), "should be a valid private");
        assert(!EVT.EvtKey.isValidPrivateKey("5J1by7KRQujRdXrurEsvEr2zQGcdPaMJRjewER7XsAR2eCcpt3D"), "should not be a valid private");
        assert(EVT.EvtKey.isValidPublicKey("EVT76uLwUD5t6fkob9Rbc9UxHgdTVshNceyv2hmppw4d82j2zYRpa"), "should be a valid public");
        assert(!EVT.EvtKey.isValidPublicKey("EOS6Qz3wuRjyN6gaU3P3XRxpnEZnM4oPxortemaWDwFRvsv2FxgND"), "should not be a valid public");
        assert(!EVT.EvtKey.isValidPublicKey("EVT6Qz3wuRjyN6gaU3P3XRxpnEZnM4oPxortemaWDWFRvsv2FxgND"), "should not be a valid public");
    });
});

// ==== part 3: APICaller write API ====
describe("APICaller write API test", () => {
    it("empty actions", async function () {
        const apiCaller = new EVT({
            keyProvider: wif,
            endpoint: network
        });

        try { await apiCaller.pushTransaction(); }
        catch (e) {
            return;
        }

        assert(true, "expected exception");
    });

    it("new_group", async function () {
        const apiCaller = new EVT({
            keyProvider: wif,
            endpoint: network
        });

        testingTmpData.newGroupName = "g" + parseInt((new Date()).valueOf() / 5000);

        await apiCaller.pushTransaction(
            { maxCharge: 1000 },
            new EVT.EvtAction("newgroup", {
                "name": testingTmpData.newGroupName,
                "group": {
                    "name": testingTmpData.newGroupName,
                    "key": Key.privateToPublic(wif),
                    "root": {
                        "threshold": 6,
                        "weight": 0,
                        "nodes": [
                            {
                                "threshold": 1,
                                "weight": 3,
                                "nodes": [
                                    {
                                        "key": "EVT6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV",
                                        "weight": 1
                                    },
                                    {
                                        "key": "EVT8MGU4aKiVzqMtWi9zLpu8KuTHZWjQQrX475ycSxEkLd6aBpraX",
                                        "weight": 1
                                    }
                                ]
                            },
                            {
                                "key": "EVT8MGU4aKiVzqMtWi9zLpu8KuTHZWjQQrX475ycSxEkLd6aBpraX",
                                "weight": 3
                            },
                            {
                                "threshold": 1,
                                "weight": 3,
                                "nodes": [
                                    {
                                        "key": "EVT6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV",
                                        "weight": 1
                                    },
                                    {
                                        "key": "EVT8MGU4aKiVzqMtWi9zLpu8KuTHZWjQQrX475ycSxEkLd6aBpraX",
                                        "weight": 1
                                    }
                                ]
                            }
                        ]
                    }
                }
            })
        );
    });

    it("newdomain", async function () {
        const apiCaller = new EVT({
            keyProvider: [wif, wif2],
            endpoint: network
        });

        testingTmpData.newDomainName = "nd" + (new Date()).valueOf();

        await apiCaller.pushTransaction(
            { maxCharge: 1000, payer: publicKey },
            new EVT.EvtAction("newdomain", {
                "name": testingTmpData.newDomainName,
                "creator": publicKey,
                "issue": {
                    "name": "issue",
                    "threshold": 1,
                    "authorizers": [{
                        "ref": "[A] " + publicKey,
                        "weight": 1
                    }]
                },
                "transfer": {
                    "name": "transfer",
                    "threshold": 1,
                    "authorizers": [{
                        "ref": "[G] .OWNER",
                        "weight": 1
                    }]
                },
                "manage": {
                    "name": "manage",
                    "threshold": 1,
                    "authorizers": [{
                        "ref": "[A] " + publicKey,
                        "weight": 1
                    }]
                }
            })
        );

        let res = await apiCaller.getDomainDetail(testingTmpData.newDomainName);
        assert(res.name === testingTmpData.newDomainName, "expected right domain name");
    });

    it("issue_tokens", async function () {
        const apiCaller = new EVT({
            keyProvider: wif,
            endpoint: network
        });

        testingTmpData.addedTokenNamePrefix = "tk" + ((new Date()).valueOf() / 500);

        await apiCaller.pushTransaction(
            new EVT.EvtAction("issuetoken", {
                "domain": testingTmpData.newDomainName,
                "names": [
                    testingTmpData.addedTokenNamePrefix + "1",
                    testingTmpData.addedTokenNamePrefix + "2",
                    testingTmpData.addedTokenNamePrefix + "3"
                ],
                "owner": [
                    Key.privateToPublic(wif)
                ]
            })
        );
    });

    it("new_fungible", async function () {
        const apiCaller = new EVT({
            keyProvider: wif,
            endpoint: network
        });

        function randomString() {
            var chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZ";
            var string_length = 6;
            var randomstring = "";
            for (var i=0; i<string_length; i++) {
                var rnum = Math.floor(Math.random() * chars.length);
                randomstring += chars.substring(rnum,rnum+1);
            }
            
            return randomstring;
        }

        testingTmpData.newSymbol = randomString();

        testingTmpData.newTrxId = (await apiCaller.pushTransaction(
            new EVT.EvtAction("newfungible", {
                sym: "5," + testingTmpData.newSymbol,
                creator: publicKey,
                issue: { name: "issue", threshold: 1, authorizers: [ { ref: "[A] " + publicKey, weight: 1  } ] }, 
                manage: { name: "manage", threshold: 1, authorizers: [ { ref: "[A] " + publicKey, weight: 1  } ] }, 
                total_supply: "100000.00000 " + testingTmpData.newSymbol
            })
        )).transactionId;
    });
});

// ==== part 3: APICaller read API ====
describe("APICaller read API test", () => {
    // get evt chain version
    it("getInfo", async function () {
        const apiCaller = EVT({
            endpoint: network
        });

        var response = await apiCaller.getInfo();
        assert(response.evt_api_version, "expected evt_api_version");
        // assert(response.evt_api_version === "2.0.0", "unexpected evt_api_version " + response.evt_api_version);
        assert(response.server_version, "expected server_version");
        assert(response.last_irreversible_block_num, "expected last_irreversible_block_num");
        assert(response.last_irreversible_block_id, "expected last_irreversible_block_id");
        assert(response.chain_id, "expected chain_id");
    });

    it("getCreatedDomains", async function () {
        const apiCaller = EVT({
            endpoint: network,
            keyProvider: wif
        });

        var response = await apiCaller.getCreatedDomains(publicKey);
        assert(Array.isArray(response), "expected array");
        // TODO must have data (after creating domains)
    });

    it("getManagedGroups", async () => {
        const apiCaller = EVT({
            endpoint: network,
            keyProvider: wif
        });

        var response = await apiCaller.getManagedGroups(publicKey);
        assert(Array.isArray(response), "expected array");
        // TODO must have data (after creating groups)
    });

    it("getOwnedTokens", async () => {
        const apiCaller = EVT({
            endpoint: network,
            keyProvider: wif
        });

        var response = await apiCaller.getOwnedTokens(publicKey);
        assert(Array.isArray(response), "expected array");
        // TODO must have data (after having tokens)
    });

    it("getActions", async () => {
        const apiCaller = EVT({
            endpoint: network,
            keyProvider: wif
        });

        var response = await apiCaller.getActions({
            domain: testingTmpData.newDomainName,
            skip: 0,
            take: 10
        });
        assert(Array.isArray(response), "expected array");
    });

    it("getTransactionsDetailOfPublicKeys", async () => {
        const apiCaller = EVT({
            endpoint: network,
            keyProvider: wif
        });

        var response = await apiCaller.getTransactionsDetailOfPublicKeys(publicKey);
        assert(Array.isArray(response), "expected array");
        // TODO must have data (after creating transactions)
    });

    it("getFungibleSymbolDetail", async () => {
        const apiCaller = EVT({
            endpoint: network,
            keyProvider: wif
        });

        var response = await apiCaller.getFungibleSymbolDetail("EVT");
        assert(response && response.sym, "expected response");
        // TODO must have data (after creating symbol)
    });

    it("getDomainDetail", async () => {
        const apiCaller = EVT({
            endpoint: network,
            keyProvider: wif
        });

        var response = await apiCaller.getDomainDetail(testingTmpData.newDomainName);
        //console.log(response);
        assert(response && response.creator, "expected response");
        // TODO must have data (after creating symbol)
    });

    it("getGroupDetail", async () => {
        const apiCaller = EVT({
            endpoint: network,
            keyProvider: wif
        });

        var response = await apiCaller.getGroupDetail(testingTmpData.newGroupName);
        //console.log(response);
        assert(response && response.root, "expected response");
        // TODO must have data (after creating symbol)
    });

    it("getTransactionDetailById", async () => {
        const apiCaller = EVT({
            endpoint: network,
            keyProvider: wif
        });

        var response = await apiCaller.getTransactionDetailById(testingTmpData.newTrxId);
        assert(response.id, "expected id");
        // TODO must have data (after creating transactions)
    });

    it("getFungibleBalance", async () => {
        const apiCaller = EVT({
            endpoint: network,
            keyProvider: wif
        });

        var response = await apiCaller.getFungibleBalance(publicKey);
        assert(Array.isArray(response), "expected array");
        // TODO must have data (after creating transactions)
    });

    it("getRequiredKeysForSuspendedTransaction", async () => {
        const apiCaller = EVT({
            endpoint: network,
            keyProvider: wif
        });

        //var response = await apiCaller.getRequiredKeysForSuspendedTransaction("test", [ publicKey ]);
        //assert(Array.isArray(response), "expected array");
        // TODO must have data (after creating transactions)
    });

    it("getSuspendedTransactionDetail", async () => {
        const apiCaller = EVT({
            endpoint: network,
            keyProvider: wif
        });

        //var response = await apiCaller.getSuspendedTransactionDetail("test");
        //assert(Array.isArray(response), "expected array");
        // TODO must have data (after creating transactions)
    });
});
