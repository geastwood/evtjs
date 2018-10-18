/* eslint-env mocha */
const assert = require("assert");
const EVT = require(".");
const Key = require("./key");
const logger = require("./logger");

const wif = "5J1by7KRQujRdXrurEsvEr2zQGcdPaMJRjewER6XsAR2eCcpt3D"; // EVT6Qz3wuRjyN6gaU3P3XRxpnEZnM4oPxortemaWDwFRvsv2FxgND
const wif2 = "5JVC3ivLUT2zq3yEXkwJ2ihukZq5reufC3iW26hbVHvjepFXsiu"; // EVT7rbe5ZqAEtwQT6Tw39R29vojFqrCQasK3nT5s2pEzXh1BABXHF
const wif3 = "5K3nUWxfkUjfLQu9PL6NZLKWV41PiFyuQdrckArA59jz19M6zgq";
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
            endpoint: network,
            networkTimeout: 1000
        });

        try { await apiCaller.pushTransaction(); }
        catch (e) {
            console.log("empty exception:");
            console.log(e);
            return;
        }

        assert(true, "expected exception");
    });

    it("new_group", async function () {
        const apiCaller = new EVT({
            keyProvider: wif,
            endpoint: network,
            networkTimeout: 3000
        });

        testingTmpData.newGroupName = "g" + parseInt((new Date()).valueOf() / 5000);

        await apiCaller.pushTransaction(
            { maxCharge: 1000000 },
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
            { maxCharge: 1000000, payer: publicKey },
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
    }).timeout(10000);

    it("issue_tokens", async function () {
        const apiCaller = new EVT({
            keyProvider: wif,
            endpoint: network
        });

        testingTmpData.addedTokenNamePrefix = "tk" + ((new Date()).valueOf() / 500);

        let charge = await apiCaller.getEstimatedChargeForTransaction(
            { availablePublicKeys: [ EVT.EvtKey.privateToPublic(wif), EVT.EvtKey.privateToPublic(wif2), EVT.EvtKey.privateToPublic(wif3) ] },
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

        assert(charge.charge && Number.isInteger(charge.charge) && charge.charge > 0, "expected integer charge");

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
    }).timeout(10000);

    it("new_fungible", async function () {
        const apiCaller = new EVT({
            keyProvider: wif,
            endpoint: network
        });

        testingTmpData.newSymbol = Math.floor(new Date().valueOf() / 1000) + "";

        testingTmpData.newTrxId = (await apiCaller.pushTransaction(
            new EVT.EvtAction("newfungible", {
                name: testingTmpData.newSymbol + ".POINTS",
                sym_name: testingTmpData.newSymbol.toString(),
                sym: "5,S#" + testingTmpData.newSymbol,
                creator: publicKey,
                manage: { name: "manage", threshold: 1, authorizers: [ { ref: "[A] " + publicKey, weight: 1  } ] }, 
                issue: { name: "issue", threshold: 1, authorizers: [ { ref: "[A] " + publicKey, weight: 1  } ] }, 
                total_supply: "100000.00000 S#" + testingTmpData.newSymbol
            })
        )).transactionId;
    });

    // Recycle Tokens
    it("recycleft", async function () {

        const apiCaller = new EVT({
            keyProvider: wif,
            endpoint: network
        });

        let anwser = await apiCaller.pushTransaction(
            new EVT.EvtAction("recycleft", {
                address: publicKey,
                number: "10.00000 S#" + testingTmpData.newSymbol,
                memo: "Test of recycleft"
            })
        );
        console.log("233333", anwser);

    });

    /*it("cancelsuspend", async function () {
        const apiCaller = new EVT({
            keyProvider: wif,
            endpoint: network
        });

        testingTmpData.newTrxId = (await apiCaller.pushTransaction(
            new EVT.EvtAction("cancelsuspend", {
                name: "haha"
            })
        )).transactionId;
    }); TODO

    it("destroytoken", async function () {
        const apiCaller = new EVT({
            keyProvider: wif,
            endpoint: network
        });

        testingTmpData.newTrxId = (await apiCaller.pushTransaction(
            new EVT.EvtAction("destroytoken", {
                name: "haha",
                domain: "asdfadf"
            })
        )).transactionId; TODO
    });*/
});

// ==== part 4: APICaller read API ====
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

    it("getHeadBlockHeaderState", async function() {
        const apiCaller = EVT({
            endpoint: network
        });

        var response = await apiCaller.getHeadBlockHeaderState();
        assert(response.block_num, "expected block_num");
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

        var response = await apiCaller.getTransactionsDetailOfPublicKeys("EVT85QEkmFpnDwR4NjnYenqenyCxFRQc45HwjGLNpXQQ1JuSmBzSj");
        // console.log("_____++++++++++++++++" + JSON.stringify(response, null, 4));

        assert(Array.isArray(response), "expected array");
        // TODO must have data (after creating transactions)
    }).timeout(10000);

    it("getFungibleSymbolDetail", async () => {
        const apiCaller = EVT({
            endpoint: network,
            keyProvider: wif
        });

        var response = await apiCaller.getFungibleSymbolDetail(1);
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

    it("getTransactionDetailById", () => {
        return new Promise(async (res, rej) => {
            setTimeout(async () => {
                const apiCaller = EVT({
                    endpoint: network,
                    keyProvider: wif
                });
        
                var response = await apiCaller.getTransactionDetailById(testingTmpData.newTrxId); //testingTmpData.newTrxId); "bed1272c6de3294582910c968b93f1c015eb646181174ab5a705df35b024f65d"
                logger.verbose("[getTransactionDetailById] " + JSON.stringify(response, null, 2));
                assert(response.id, "expected id");

                res();
            }, 500);
        });
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


// ==== part 5: EvtLink ====
describe("EvtLink", () => {
    let evtLink = EVT.EvtLink;

    it("b2base42", async () => {
        let dec1 = evtLink.b2dec(new Buffer([ 0, 0, 0, 2, 41, 109, 0, 82, 0 ]));
        let dec2 = evtLink.b2dec(new Buffer([ 0 ]));
        let dec3 = evtLink.b2dec(new Buffer([ ]));
        
        assert(dec1 === "000AD1KQVMO", "should produce right base42 " + dec1);
        assert(dec2 === "0", "should produce right base42:" + dec2);
        assert(dec3 === "", "should produce right base42:" + dec3);
    });

    it("everiPass1", async () => {
        let link = await evtLink.getEvtLinkForEveriPass({
            autoDestroying: true,
            domainName: testingTmpData.newDomainName,
            tokenName: testingTmpData.addedTokenNamePrefix + "1",
            keyProvider: [ wif, wif2, wif3 ]
        });
        
        let parsed = await evtLink.parseEvtLink(link.rawText);

        logger.verbose("[everiPass] " + link.rawText);
        logger.verbose("[everiPass] \n" + JSON.stringify(parsed, null, 2));
        
        assert(link.rawText, "should produce a EvtLink");
        assert(parsed.segments.length === 3, "struct is wrong: " + parsed.segments.length);
        assert(parsed.flag === 11, "flag is wrong: " + parsed.flag);
        assert(parsed.publicKeys[0] === publicKey, "publicKey is wrong");
    });

    it("everiPass2", async () => {
        let link = await evtLink.getEveriPassText({
            autoDestroying: false,
            domainName: testingTmpData.newDomainName,
            tokenName: testingTmpData.addedTokenNamePrefix + "1",
            keyProvider: [ wif ]
        });

        const apiCaller = EVT({
            endpoint: network,
            keyProvider: [ ]
        });
        
        let parsed = await evtLink.parseEvtLink(link.rawText);
        let validationResult = await evtLink.validateEveriPassUnsafe({ parsedEvtLink: parsed, apiCaller });
        logger.verbose("[everiPass] validateUnsafe: " + JSON.stringify(validationResult, null, 2));

        logger.verbose("[everiPass] " + link.rawText);
        logger.verbose("[everiPass] \n" + JSON.stringify(parsed, null, 2));
        
        assert(validationResult.valid, "should be a valid everiPass");
        assert(link.rawText, "should produce a EvtLink");
        assert(parsed.segments.length === 3, "struct is wrong: " + parsed.segments.length);
        assert(parsed.flag === 3, "flag is wrong: " + parsed.flag);
        assert(parsed.publicKeys[0] === publicKey, "publicKey is wrong");
    });

    it("everiPay", async () => {
        let link = await evtLink.getEvtLinkForEveriPay({
            symbol: 1,
            maxAmount: 354,
            keyProvider: [ wif2 ],
            linkId: await evtLink.getUniqueLinkId()
        });
        
        let parsed = await evtLink.parseEvtLink(link.rawText);

        logger.verbose("[everiPay] " + link.rawText);
        logger.verbose("[everiPay] \n" + JSON.stringify(parsed, null, 2));
        
        assert(link.rawText, "should produce a EvtLink");
        assert(parsed.segments.length === 4, "struct is wrong: " + parsed.segments.length);
        assert(parsed.flag === 5, "flag is wrong: " + parsed.flag);
        assert(parsed.publicKeys[0] === EVT.EvtKey.privateToPublic(wif2), "publicKey is wrong");
    });

    it("everiPay_execPush", async () => {
        let link = await evtLink.getEvtLinkForEveriPay({
            symbol: 1,
            maxAmount: 10000000,
            keyProvider: [ wif ],
            linkId: await evtLink.getUniqueLinkId()
        });

        // execute the pass
        const apiCaller = EVT({
            endpoint: network,
            keyProvider: [ wif2 ]
        });

        await apiCaller.pushTransaction(
            { maxCharge: 1000000 },
            new EVT.EvtAction(
                "everipay",
                {
                    link: link.rawText,
                    "payee": EVT.EvtKey.privateToPublic(wif2),
                    "number": "50.00000 S#1"
                }
            )
        );
    });

    it("everiPass_execPush", async () => {
        let link = await evtLink.getEvtLinkForEveriPass({
            autoDestroying: true,
            domainName: testingTmpData.newDomainName,
            tokenName: testingTmpData.addedTokenNamePrefix + "1",
            keyProvider: [ wif ],
            linkId: await evtLink.getUniqueLinkId()
        });
        
        // execute the pass
        const apiCaller = EVT({
            endpoint: network,
            keyProvider: [ wif2 ]
        });

        await apiCaller.pushTransaction(
            { maxCharge: 1000000 },
            new EVT.EvtAction(
                "everipass",
                {
                    link: link.rawText
                }
            )
        );
    });

    it("parse evtLink", async () => {
        let parsed = await evtLink.parseEvtLink("0DFYZXZO9-:Y:JLF*3/4JCPG7V1346OZ:R/G2M93-2L*BBT9S0YQ0+JNRIW95*HF*94J0OVUN$KS01-GZ-N7FWK9_FXXJORONB7B58VU9Z2MZKZ5*:NP3::K7UYKD:Y9I1V508HBQZK2AE*ZS85PJZ2N47/41LQ-MZ/4Q6THOX**YN0VMQ*3/CG9-KX2:E7C-OCM*KJJT:Z7640Q6B*FWIQBYMDPIXB4CM:-8*TW-QNY$$AY5$UA3+N-7L/ZSDCWO1I7M*3Q6*SMAYOWWTF5RJAJ:NG**8U5J6WC2VM5Z:OLZPVJXX*12I*6V9FL1HX095$5:$*C3KGCM3FIS-WWRE14E:7VYNFA-3QCH5ULZJ*CRH91BTXIK-N+J1");

        logger.verbose("[everiPass] \n" + JSON.stringify(parsed, null, 2));

        assert(parsed.segments.length === 4, "struct is wrong: " + parsed.segments.length);
        assert(parsed.flag === 11, "flag is wrong: " + parsed.flag);
        assert(parsed.publicKeys[0] === publicKey, "publicKey is wrong");

        parsed = await evtLink.parseEvtLink("0287F2T16JJ4CWK*LA3KAS+:$W:XZ:IQNJDD2UH2N4S$ZWQK4ZGSR9:Y3UDF5C9Y63R64E4R331:QSK+LO9N/WG_PYZ+CWE*$JT4YN66$IN:MV-RO/1/F0O553BB7+5G2V1RZUO73KLV5X5E6S4GB2$8G2-:3FR2Y+N+S4GXC0S6HZT3VDMU*TYH");

        logger.verbose("[everiPass] \n" + JSON.stringify(parsed, null, 2));
    });

    it("parse bad evtLink", async () => {
        try {
            await evtLink.parseEvtLink("1DFYZXZO9-:Y:JLF*3/4JCPG7V1346OZ:R/G2M93-2L*BBT9S0YQ0+JNRIW95*HF*94J0OVUN$S01-GZ-N7FWK9_FXXRONB7B58VU9Z2MZKZ5*:NP3::K7UYKD:Y9I1V508HBQZK2AE*ZS85PJZ2N47/41LQ-MZ/4Q6THOX**YN0VMQ*3/CG9-KX2:E7C-OCM*KJJT:Z7640Q6B*FWIQBYMXB4CM:-8*TW-QNY$$AY5$UA3+N-7L/ZSDCWO1I7M*3Q6*SMAYOWWTF5RJAJ:NG**8U5J6WC2VM5Z:OLZPVJXX*12I*6V9FL1HX095$5:$*C3KGCM3FIS-WWRE14E:7VYNFA-4QCH5ULZJ*CRH91BTXIK-N+J1");
        }
        catch (e) {
            assert(e, "");
            return;
        }

        assert(false, "should throw exception");
    });
});