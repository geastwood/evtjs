const CHECKALL = (typeof process.env.DEV === "undefined") ? true : !(process.env.DEV);

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
    host: "testnet1.everitoken.io",
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

const testAbi = async (testAction, print=false) => {

    const apiCaller = newCaller();
    await apiCaller.getInfo();

    await testAction.calculateDomainAndKey();
    let action = { action: testAction.actionName, args: testAction.abi };

    let throughFC, throughAPI;
    throughAPI = await apiCaller.__chainAbiJsonToBinByAPI(action);
    try {
        throughFC = await apiCaller.__chainAbiJsonToBinByFC(action);
    } catch (err) {
        console.info("API:\t", throughAPI.binargs);
        throw err;
    }
    if (throughFC.binargs !== throughAPI.binargs || print) {
        console.info("LFC:\t", throughFC.binargs);
        console.info("API:\t", throughAPI.binargs);
    }
    if (throughFC.binargs !== throughAPI.binargs) {
        throw new Error("Not Equal!");
    }

}

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

    if (!"Check Remainings" || CHECKALL)
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


    if (!"Check newdomain / updatedomain" || CHECKALL)
    it("newdomain", async function () {
        let perm = {
            name: "issue", 
            threshold: 1, 
            authorizers: [{
                ref: "[A] " + publicKey2, 
                weight: 1
            }]
        }
        let perm2 = {
            name: "issue", 
            threshold: 1, 
            authorizers: [{
                ref: "[G] vastchain.technology", 
                weight: 2
            }]
        }
        let perm3 = {
            name: "issue", 
            threshold: 1, 
            authorizers: [{
                ref: "[G] .OWNER", 
                weight: 3
            }]
        }
        await testAbi(new EVT.EvtAction("newdomain", {
            name: "test112",
            creator: publicKey2,
            issue: perm,
            transfer: perm2,
            manage: perm3
        }));
        await testAbi(new EVT.EvtAction("updatedomain", {
            name: "test",
            issue: perm,
        }));
    }).timeout(10000);


    if (!"Check Token" || CHECKALL)
    it("issuetoken", async () => {
        await testAbi(new EVT.EvtAction("issuetoken", {
            "domain": "shoRt",
            "names": [
                "oneUnder10",
                "moreStrUnder.15",
                "largestCanGetBelow-21"
            ],
            "owner": [
                Key.privateToPublic(wif),
                Key.privateToPublic(wif2),
            ]
            // ["EVT00000000000000000000000000000000000000000000000000"] => "010000"
            // ["EVT00000000000000000000000000000000000000000000000000" x2] => "0200000000" 
            // ["EVT0000009tDnxK74wjkVZidAeyT339HkhMozkmdkju2pFx32QS95"]
        }));
    }).timeout(5000);


    if (!"Check Transfer" || CHECKALL)
    it("transfer", async () => {
        await testAbi(new EVT.EvtAction("transfer", {
            "domain": "shoRt",
            "name": "moreStrUnder.15",
            "to": [
                Key.privateToPublic(wif),
                Key.privateToPublic(wif2),
            ],
            "memo": "Test"
        }));
    }).timeout(5000);


    if (!"Check Destroy Token" || CHECKALL)
    it("destroytoken", async () => {
        await testAbi(new EVT.EvtAction("destroytoken", {
            "domain": "shoRt",
            "name": "moreStrUnder.15"
        }));
    }).timeout(5000);


    if (!"Check New Group / Update Group" || CHECKALL)
    it("newgroup / Update Group", async () => {
        let groupArgs = {
            "name": "newGrou.p",
            "group": {
                "name": "newGrou.p",
                "key": Key.privateToPublic(wif2),
                "root": {
                    "threshold": 6,
                    "nodes": [
                        {
                            "key": Key.privateToPublic(wif),
                            "weight": 3
                        },
                        {
                            "key": Key.privateToPublic(wif2),
                            "weight": 2
                        },
                        {
                            "threshold": 1,
                            "weight": 3,
                            "nodes": [
                                {
                                    "key": Key.privateToPublic(wif2),
                                    "weight": 1
                                },
                                {
                                    "key": Key.privateToPublic(wif),
                                    "weight": 1
                                }
                            ]
                        },
                    ]
                }
            }
        };
        await testAbi(new EVT.EvtAction("newgroup", groupArgs));
        await testAbi(new EVT.EvtAction("updategroup", groupArgs));
    }).timeout(10000);


    if (!"Check New Fungible" || CHECKALL)
    it("newfungible", async () => {
        let perm = {
            name: "issue", 
            threshold: 1, 
            authorizers: [{
                ref: "[A] " + publicKey2, 
                weight: 1
            }]
        }
        await testAbi(new EVT.EvtAction("newfungible", {
            "name": "testtoken",
            "sym_name": "testtoken",
            "sym": "7,S#1059",
            "creator": publicKey2,
            "issue": perm,
            "manage": perm,
            "total_supply": "10000.0003000 S#1059"
        }));
    }).timeout(5000);


    if (!"Check Update Fungible" || CHECKALL)
    it("updfungible", async () => {
        let perm = {
            name: "issue", 
            threshold: 1, 
            authorizers: [{
                ref: "[A] " + publicKey2, 
                weight: 1
            }]
        }
        await testAbi(new EVT.EvtAction("updfungible", {
            "sym_id": 1059,
            "manage": perm
        }));
    }).timeout(5000);


    if (!"Check Issue Fungible" || CHECKALL)
    it("issuefungible", async () => {
        await testAbi(new EVT.EvtAction("issuefungible", {
            "address": publicKey2,
            "number": "2.0040310 S#1059",
            "memo": "Test"
        }));
    }).timeout(5000);


    if (!"Check Transferft" || CHECKALL)
    it("transferft", async () => {
        await testAbi(new EVT.EvtAction("transferft", {
            "from": publicKey2,
            "to": publicKey,
            "number": "2.0040310 S#1059",
            "memo": "Test"
        }));
    }).timeout(5000);


    if (!"Check Recycleft" || CHECKALL)
    it("recycleft", async function () {
        await testAbi(new EVT.EvtAction("recycleft", {
            address: publicKey2,
            number: "1.01942 S#1",
            memo: "Test of recycleft"
        }));
    }).timeout(5000);


    if (!"Check Destroyft" || CHECKALL)
    it("destroyft", async function () {
        await testAbi(new EVT.EvtAction("destroyft", {
            address: publicKey2,
            number: "1.01942 S#1",
            memo: "Test of recycleft"
        }));
    }).timeout(5000);

    
    if (!"Check Evt2pevt" || CHECKALL)
    it("evt2pevt", async function () {
        await testAbi(new EVT.EvtAction("evt2pevt", {
            from: publicKey2,
            to: publicKey2,
            number: "1.01942 S#1",
            memo: "Test of recycleft"
        }));
    }).timeout(5000);
    
    
    if (!"Check Addmeta" || CHECKALL)
    it("addmeta", async function () {
        await testAbi(new EVT.EvtAction("addmeta", {
            key: "newdata",
            value: "somevalueishere",
            creator: "[A] " + publicKey2
        }));
    }).timeout(5000);
    

    // if ("Check NewSuspend" || CHECKALL)
    // it("newsuspend", async function () {
    //     await testAbi(new EVT.EvtAction("newsuspend", {
    //         name: "test",
    //         proposer: publicKey,
    //         trx: ""
    //     }));
    // }).timeout(5000);


    if (!"Check AprvSuspend" || CHECKALL)
    it("aprvsuspend", async function () {
        await testAbi(new EVT.EvtAction("aprvsuspend", {
            name: "test",
            signatures: [
                "SIG_K1_JzrdhWW46N5nFUZzTUmhg2sK4nKNGktPz2UdRz9bSAP5pY4nhicKWCuo6Uc6U7KBBwD8VfjsSxzHWT87R41xMaubnzMq8w"
            ]
        }));
    }).timeout(5000);
    
    
    if (!"Check CancelSuspend" || CHECKALL)
    it("cancelsuspend", async function () {
        await testAbi(new EVT.EvtAction("cancelsuspend", {
            name: "test"
        }));
    }).timeout(5000);
    
    
    if (!"Check ExecSuspend" || CHECKALL)
    it("execsuspend", async function () {
        await testAbi(new EVT.EvtAction("execsuspend", {
            name: "test",
            executor: publicKey2
        }));
    }).timeout(5000);

    
    if ("Check Everipass" || CHECKALL)
    it("everipass", async function () {
        await testAbi(new EVT.EvtAction("everipass", {
            link: "0DFYZXZO9-:Y:JLF*3/4JCPG7V1346OZ:R/G2M93-2L*BBT9S0YQ0+JNRIW95*HF*94J0OVUN$KS01-GZ-N7FWK9_FXXJORONB7B58VU9Z2MZKZ5*:NP3::K7UYKD:Y9I1V508HBQZK2AE*ZS85PJZ2N47/41LQ-MZ/4Q6THOX**YN0VMQ*3/CG9-KX2:E7C-OCM*KJJT:Z7640Q6B*FWIQBYMDPIXB4CM:-8*TW-QNY$$AY5$UA3+N-7L/ZSDCWO1I7M*3Q6*SMAYOWWTF5RJAJ:NG**8U5J6WC2VM5Z:OLZPVJXX*12I*6V9FL1HX095$5:$*C3KGCM3FIS-WWRE14E:7VYNFA-3QCH5ULZJ*CRH91BTXIK-N+J1"
        }));
    }).timeout(5000);


    // if ("Check Everipay" || CHECKALL)
    // it("everipay", async function () {
    //     await testAbi(new EVT.EvtAction("everipay", {
    //         evt_link: "",
    //         payee: publicKey,
    //         number: "0.00010 S#1"
    //     }));
    // }).timeout(5000);


    // if ("Check NewLock" || CHECKALL)
    // it("newlock", async function () {
    //     await testAbi(new EVT.EvtAction("newlock", {
    //         name: "test",
    //         proposer: publicKey,
    //         status: "lock_status", // TODO
    //         unlock_time: "2019-03-02T12:00:00",
    //         deadline: "2020-03-02T12:00:00",
    //         assets: "lock_asset[]", // TODO
    //         condition: "lock_condition", // TODO
    //         succeed: publicKey,
    //         failed: publicKey
    //     }));
    // }).timeout(5000);


    // if ("Check AprvLock" || CHECKALL)
    // it("aprvlock", async function () {
    //     await testAbi(new EVT.EvtAction("aprvlock", {
    //         name: "test",
    //         approver: publicKey,
    //         data: "lock_aprvdata" // TODO
    //     }));
    // }).timeout(5000);
    

    if (!"Check TryUnlock" || CHECKALL)
    it("tryunlock", async function () {
        await testAbi(new EVT.EvtAction("tryunlock", {
            name: "test",
            executor: publicKey
        }));
    }).timeout(5000);


    // if ("Check SetPsvBonus" || CHECKALL)
    // it("setpsvbonus", async function () {
    //     await testAbi(new EVT.EvtAction("setpsvbonus", {
    //         sym: "7,S#1059",
    //         rate: "0.01",
    //         base_charge: "0.00010 S#1",
    //         charge_threshold: "0.00010 S#1",
    //         minimum_charge: "0.00010 S#1",
    //         dist_threshold: "0.00010 S#1",
    //         rules: "dist_rule[]", // TODO
    //         methods: "passive_method[]" // TODO
    //     }));
    // }).timeout(5000);


    // if ("Check DistPsvBonus" || CHECKALL)
    // it("distpsvbonus", async function () {
    //     await testAbi(new EVT.EvtAction("distpsvbonus", {
    //         sym: "71059",
    //         deadline: "2019-03-02T12:00:00",
    //         final_receiver: publicKey
    //     }));
    // }).timeout(5000);

});