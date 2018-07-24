"use strict";

/* eslint-env mocha */
var assert = require("assert");
var EVT = require(".");
var Key = require("./key");
var logger = require("./logger");

var wif = "5JgWJptxZENHR69oZsPSeVTXScRx7jYPMTjPTKAjW2JFnjEhoDZ";
var wif2 = "5KXxF69n5SsYSQRs8L855jKC5fqzT6uzRzJ1r686t2RRu9JQr9i";
var wif3 = "5K3nUWxfkUjfLQu9PL6NZLKWV41PiFyuQdrckArA59jz19M6zgq";
var publicKey = EVT.EvtKey.privateToPublic(wif);

var testingTmpData = {
    newDomainName: null,
    addedTokenNamePrefix: null
};
logger.writeLog = true;

/*const network = {
    host: "testnet1.everitoken.io",
    port: 8888,
    protocol: "https"
};*/

var network = {
    host: "118.31.58.10",
    port: 8888,
    protocol: "http"
};

// ==== part 1: version ====
describe("version", function () {
    it("exposes a version number", function () {
        assert.ok(EVT.version);
    });
});

// ==== part 2: EvtKey ====
describe("EvtKey", function () {
    it("randomBytesAndString", function _callee() {
        var name128;
        return regeneratorRuntime.async(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return regeneratorRuntime.awrap(EVT.EvtKey.randomName128());

                    case 2:
                        name128 = _context.sent;

                        assert(name128.length == 21, "should produce a string with a length of 21");

                        _context.t0 = assert;
                        _context.next = 7;
                        return regeneratorRuntime.awrap(EVT.EvtKey.random32BytesAsHex());

                    case 7:
                        _context.t1 = _context.sent;
                        (0, _context.t0)(_context.t1, "should produce a 32 bytes hex");

                    case 9:
                    case "end":
                        return _context.stop();
                }
            }
        }, null, undefined);
    });

    it("test ecc key generation", function _callee2() {
        var key, publicKey;
        return regeneratorRuntime.async(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return regeneratorRuntime.awrap(EVT.EvtKey.randomPrivateKey());

                    case 2:
                        key = _context2.sent;
                        publicKey = EVT.EvtKey.privateToPublic(key);


                        assert(publicKey.startsWith("EVT"), "expected publicKey starting with EVT");

                    case 5:
                    case "end":
                        return _context2.stop();
                }
            }
        }, null, undefined);
    });

    it("test seed key generation", function _callee3() {
        var key, publicKey;
        return regeneratorRuntime.async(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.next = 2;
                        return regeneratorRuntime.awrap(EVT.EvtKey.seedPrivateKey("seed"));

                    case 2:
                        key = _context3.sent;
                        publicKey = EVT.EvtKey.privateToPublic(key);


                        assert(key === "5J1by7KRQujRdXrurEsvEr2zQGcdPaMJRjewER6XsAR2eCcpt3D");
                        assert(publicKey === "EVT6Qz3wuRjyN6gaU3P3XRxpnEZnM4oPxortemaWDwFRvsv2FxgND");

                    case 6:
                    case "end":
                        return _context3.stop();
                }
            }
        }, null, undefined);
    });

    it("test validKey", function _callee4() {
        return regeneratorRuntime.async(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        assert(EVT.EvtKey.isValidPrivateKey("5J1by7KRQujRdXrurEsvEr2zQGcdPaMJRjewER6XsAR2eCcpt3D"), "should be a valid private");
                        assert(!EVT.EvtKey.isValidPrivateKey("5J1by7KRQujRdXrurEsvEr2zQGcdPaMJRjewER7XsAR2eCcpt3D"), "should not be a valid private");
                        assert(EVT.EvtKey.isValidPublicKey("EVT76uLwUD5t6fkob9Rbc9UxHgdTVshNceyv2hmppw4d82j2zYRpa"), "should be a valid public");
                        assert(!EVT.EvtKey.isValidPublicKey("EOS6Qz3wuRjyN6gaU3P3XRxpnEZnM4oPxortemaWDwFRvsv2FxgND"), "should not be a valid public");
                        assert(!EVT.EvtKey.isValidPublicKey("EVT6Qz3wuRjyN6gaU3P3XRxpnEZnM4oPxortemaWDWFRvsv2FxgND"), "should not be a valid public");

                    case 5:
                    case "end":
                        return _context4.stop();
                }
            }
        }, null, undefined);
    });
});

// ==== part 3: APICaller write API ====
describe("APICaller write API test", function () {
    it("empty actions", function _callee5() {
        var apiCaller;
        return regeneratorRuntime.async(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        apiCaller = new EVT({
                            keyProvider: wif,
                            endpoint: network
                        });
                        _context5.prev = 1;
                        _context5.next = 4;
                        return regeneratorRuntime.awrap(apiCaller.pushTransaction());

                    case 4:
                        _context5.next = 9;
                        break;

                    case 6:
                        _context5.prev = 6;
                        _context5.t0 = _context5["catch"](1);
                        return _context5.abrupt("return");

                    case 9:

                        assert(true, "expected exception");

                    case 10:
                    case "end":
                        return _context5.stop();
                }
            }
        }, null, this, [[1, 6]]);
    });

    it("new_group", function _callee6() {
        var apiCaller;
        return regeneratorRuntime.async(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        apiCaller = new EVT({
                            keyProvider: wif,
                            endpoint: network
                        });


                        testingTmpData.newGroupName = "g" + parseInt(new Date().valueOf() / 5000);

                        _context6.next = 4;
                        return regeneratorRuntime.awrap(apiCaller.pushTransaction({ maxCharge: 1000 }, new EVT.EvtAction("newgroup", {
                            "name": testingTmpData.newGroupName,
                            "group": {
                                "name": testingTmpData.newGroupName,
                                "key": Key.privateToPublic(wif),
                                "root": {
                                    "threshold": 6,
                                    "weight": 0,
                                    "nodes": [{
                                        "threshold": 1,
                                        "weight": 3,
                                        "nodes": [{
                                            "key": "EVT6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV",
                                            "weight": 1
                                        }, {
                                            "key": "EVT8MGU4aKiVzqMtWi9zLpu8KuTHZWjQQrX475ycSxEkLd6aBpraX",
                                            "weight": 1
                                        }]
                                    }, {
                                        "key": "EVT8MGU4aKiVzqMtWi9zLpu8KuTHZWjQQrX475ycSxEkLd6aBpraX",
                                        "weight": 3
                                    }, {
                                        "threshold": 1,
                                        "weight": 3,
                                        "nodes": [{
                                            "key": "EVT6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV",
                                            "weight": 1
                                        }, {
                                            "key": "EVT8MGU4aKiVzqMtWi9zLpu8KuTHZWjQQrX475ycSxEkLd6aBpraX",
                                            "weight": 1
                                        }]
                                    }]
                                }
                            }
                        })));

                    case 4:
                    case "end":
                        return _context6.stop();
                }
            }
        }, null, this);
    });

    it("newdomain", function _callee7() {
        var apiCaller, res;
        return regeneratorRuntime.async(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        apiCaller = new EVT({
                            keyProvider: [wif, wif2],
                            endpoint: network
                        });


                        testingTmpData.newDomainName = "nd" + new Date().valueOf();

                        _context7.next = 4;
                        return regeneratorRuntime.awrap(apiCaller.pushTransaction({ maxCharge: 1000, payer: publicKey }, new EVT.EvtAction("newdomain", {
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
                        })));

                    case 4:
                        _context7.next = 6;
                        return regeneratorRuntime.awrap(apiCaller.getDomainDetail(testingTmpData.newDomainName));

                    case 6:
                        res = _context7.sent;

                        assert(res.name === testingTmpData.newDomainName, "expected right domain name");

                    case 8:
                    case "end":
                        return _context7.stop();
                }
            }
        }, null, this);
    });

    it("issue_tokens", function _callee8() {
        var apiCaller, charge;
        return regeneratorRuntime.async(function _callee8$(_context8) {
            while (1) {
                switch (_context8.prev = _context8.next) {
                    case 0:
                        apiCaller = new EVT({
                            keyProvider: wif,
                            endpoint: network
                        });


                        testingTmpData.addedTokenNamePrefix = "tk" + new Date().valueOf() / 500;

                        _context8.next = 4;
                        return regeneratorRuntime.awrap(apiCaller.getEstimatedChargeForTransaction({ availablePublicKeys: [EVT.EvtKey.privateToPublic(wif), EVT.EvtKey.privateToPublic(wif2), EVT.EvtKey.privateToPublic(wif3)] }, new EVT.EvtAction("issuetoken", {
                            "domain": testingTmpData.newDomainName,
                            "names": [testingTmpData.addedTokenNamePrefix + "1", testingTmpData.addedTokenNamePrefix + "2", testingTmpData.addedTokenNamePrefix + "3"],
                            "owner": [Key.privateToPublic(wif)]
                        })));

                    case 4:
                        charge = _context8.sent;


                        assert(charge.charge && Number.isInteger(charge.charge) && charge.charge > 0, "expected integer charge");

                        _context8.next = 8;
                        return regeneratorRuntime.awrap(apiCaller.pushTransaction(new EVT.EvtAction("issuetoken", {
                            "domain": testingTmpData.newDomainName,
                            "names": [testingTmpData.addedTokenNamePrefix + "1", testingTmpData.addedTokenNamePrefix + "2", testingTmpData.addedTokenNamePrefix + "3"],
                            "owner": [Key.privateToPublic(wif)]
                        })));

                    case 8:
                    case "end":
                        return _context8.stop();
                }
            }
        }, null, this);
    });

    it("new_fungible", function _callee9() {
        var apiCaller, randomString;
        return regeneratorRuntime.async(function _callee9$(_context9) {
            while (1) {
                switch (_context9.prev = _context9.next) {
                    case 0:
                        randomString = function randomString() {
                            var chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZ";
                            var string_length = 6;
                            var randomstring = "";
                            for (var i = 0; i < string_length; i++) {
                                var rnum = Math.floor(Math.random() * chars.length);
                                randomstring += chars.substring(rnum, rnum + 1);
                            }

                            return randomstring;
                        };

                        apiCaller = new EVT({
                            keyProvider: wif,
                            endpoint: network
                        });


                        testingTmpData.newSymbol = randomString();

                        _context9.next = 5;
                        return regeneratorRuntime.awrap(apiCaller.pushTransaction(new EVT.EvtAction("newfungible", {
                            sym: "5," + testingTmpData.newSymbol,
                            creator: publicKey,
                            issue: { name: "issue", threshold: 1, authorizers: [{ ref: "[A] " + publicKey, weight: 1 }] },
                            manage: { name: "manage", threshold: 1, authorizers: [{ ref: "[A] " + publicKey, weight: 1 }] },
                            total_supply: "100000.00000 " + testingTmpData.newSymbol
                        })));

                    case 5:
                        testingTmpData.newTrxId = _context9.sent.transactionId;

                    case 6:
                    case "end":
                        return _context9.stop();
                }
            }
        }, null, this);
    });
});

// ==== part 4: APICaller read API ====
describe("APICaller read API test", function () {
    // get evt chain version
    it("getInfo", function _callee10() {
        var apiCaller, response;
        return regeneratorRuntime.async(function _callee10$(_context10) {
            while (1) {
                switch (_context10.prev = _context10.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network
                        });
                        _context10.next = 3;
                        return regeneratorRuntime.awrap(apiCaller.getInfo());

                    case 3:
                        response = _context10.sent;

                        assert(response.evt_api_version, "expected evt_api_version");
                        // assert(response.evt_api_version === "2.0.0", "unexpected evt_api_version " + response.evt_api_version);
                        assert(response.server_version, "expected server_version");
                        assert(response.last_irreversible_block_num, "expected last_irreversible_block_num");
                        assert(response.last_irreversible_block_id, "expected last_irreversible_block_id");
                        assert(response.chain_id, "expected chain_id");

                    case 9:
                    case "end":
                        return _context10.stop();
                }
            }
        }, null, this);
    });

    it("getHeadBlockHeaderState", function _callee11() {
        var apiCaller, response;
        return regeneratorRuntime.async(function _callee11$(_context11) {
            while (1) {
                switch (_context11.prev = _context11.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network
                        });
                        _context11.next = 3;
                        return regeneratorRuntime.awrap(apiCaller.getHeadBlockHeaderState());

                    case 3:
                        response = _context11.sent;

                        assert(response.block_num, "expected block_num");

                    case 5:
                    case "end":
                        return _context11.stop();
                }
            }
        }, null, this);
    });

    it("getCreatedDomains", function _callee12() {
        var apiCaller, response;
        return regeneratorRuntime.async(function _callee12$(_context12) {
            while (1) {
                switch (_context12.prev = _context12.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });
                        _context12.next = 3;
                        return regeneratorRuntime.awrap(apiCaller.getCreatedDomains(publicKey));

                    case 3:
                        response = _context12.sent;

                        assert(Array.isArray(response), "expected array");
                        // TODO must have data (after creating domains)

                    case 5:
                    case "end":
                        return _context12.stop();
                }
            }
        }, null, this);
    });

    it("getManagedGroups", function _callee13() {
        var apiCaller, response;
        return regeneratorRuntime.async(function _callee13$(_context13) {
            while (1) {
                switch (_context13.prev = _context13.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });
                        _context13.next = 3;
                        return regeneratorRuntime.awrap(apiCaller.getManagedGroups(publicKey));

                    case 3:
                        response = _context13.sent;

                        assert(Array.isArray(response), "expected array");
                        // TODO must have data (after creating groups)

                    case 5:
                    case "end":
                        return _context13.stop();
                }
            }
        }, null, undefined);
    });

    it("getOwnedTokens", function _callee14() {
        var apiCaller, response;
        return regeneratorRuntime.async(function _callee14$(_context14) {
            while (1) {
                switch (_context14.prev = _context14.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });
                        _context14.next = 3;
                        return regeneratorRuntime.awrap(apiCaller.getOwnedTokens(publicKey));

                    case 3:
                        response = _context14.sent;

                        assert(Array.isArray(response), "expected array");
                        // TODO must have data (after having tokens)

                    case 5:
                    case "end":
                        return _context14.stop();
                }
            }
        }, null, undefined);
    });

    it("getActions", function _callee15() {
        var apiCaller, response;
        return regeneratorRuntime.async(function _callee15$(_context15) {
            while (1) {
                switch (_context15.prev = _context15.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });
                        _context15.next = 3;
                        return regeneratorRuntime.awrap(apiCaller.getActions({
                            domain: testingTmpData.newDomainName,
                            skip: 0,
                            take: 10
                        }));

                    case 3:
                        response = _context15.sent;

                        assert(Array.isArray(response), "expected array");

                    case 5:
                    case "end":
                        return _context15.stop();
                }
            }
        }, null, undefined);
    });

    it("getTransactionsDetailOfPublicKeys", function _callee16() {
        var apiCaller, response;
        return regeneratorRuntime.async(function _callee16$(_context16) {
            while (1) {
                switch (_context16.prev = _context16.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });
                        _context16.next = 3;
                        return regeneratorRuntime.awrap(apiCaller.getTransactionsDetailOfPublicKeys(publicKey));

                    case 3:
                        response = _context16.sent;

                        assert(Array.isArray(response), "expected array");
                        // TODO must have data (after creating transactions)

                    case 5:
                    case "end":
                        return _context16.stop();
                }
            }
        }, null, undefined);
    });

    it("getFungibleSymbolDetail", function _callee17() {
        var apiCaller, response;
        return regeneratorRuntime.async(function _callee17$(_context17) {
            while (1) {
                switch (_context17.prev = _context17.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });
                        _context17.next = 3;
                        return regeneratorRuntime.awrap(apiCaller.getFungibleSymbolDetail("EVT"));

                    case 3:
                        response = _context17.sent;

                        assert(response && response.sym, "expected response");
                        // TODO must have data (after creating symbol)

                    case 5:
                    case "end":
                        return _context17.stop();
                }
            }
        }, null, undefined);
    });

    it("getDomainDetail", function _callee18() {
        var apiCaller, response;
        return regeneratorRuntime.async(function _callee18$(_context18) {
            while (1) {
                switch (_context18.prev = _context18.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });
                        _context18.next = 3;
                        return regeneratorRuntime.awrap(apiCaller.getDomainDetail(testingTmpData.newDomainName));

                    case 3:
                        response = _context18.sent;

                        //console.log(response);
                        assert(response && response.creator, "expected response");
                        // TODO must have data (after creating symbol)

                    case 5:
                    case "end":
                        return _context18.stop();
                }
            }
        }, null, undefined);
    });

    it("getGroupDetail", function _callee19() {
        var apiCaller, response;
        return regeneratorRuntime.async(function _callee19$(_context19) {
            while (1) {
                switch (_context19.prev = _context19.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });
                        _context19.next = 3;
                        return regeneratorRuntime.awrap(apiCaller.getGroupDetail(testingTmpData.newGroupName));

                    case 3:
                        response = _context19.sent;

                        //console.log(response);
                        assert(response && response.root, "expected response");
                        // TODO must have data (after creating symbol)

                    case 5:
                    case "end":
                        return _context19.stop();
                }
            }
        }, null, undefined);
    });

    it("getTransactionDetailById", function _callee20() {
        var apiCaller, response;
        return regeneratorRuntime.async(function _callee20$(_context20) {
            while (1) {
                switch (_context20.prev = _context20.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });
                        _context20.next = 3;
                        return regeneratorRuntime.awrap(apiCaller.getTransactionDetailById(testingTmpData.newTrxId));

                    case 3:
                        response = _context20.sent;

                        assert(response.id, "expected id");
                        // TODO must have data (after creating transactions)

                    case 5:
                    case "end":
                        return _context20.stop();
                }
            }
        }, null, undefined);
    });

    it("getFungibleBalance", function _callee21() {
        var apiCaller, response;
        return regeneratorRuntime.async(function _callee21$(_context21) {
            while (1) {
                switch (_context21.prev = _context21.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });
                        _context21.next = 3;
                        return regeneratorRuntime.awrap(apiCaller.getFungibleBalance(publicKey));

                    case 3:
                        response = _context21.sent;

                        assert(Array.isArray(response), "expected array");
                        // TODO must have data (after creating transactions)

                    case 5:
                    case "end":
                        return _context21.stop();
                }
            }
        }, null, undefined);
    });

    it("getRequiredKeysForSuspendedTransaction", function _callee22() {
        var apiCaller;
        return regeneratorRuntime.async(function _callee22$(_context22) {
            while (1) {
                switch (_context22.prev = _context22.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });

                        //var response = await apiCaller.getRequiredKeysForSuspendedTransaction("test", [ publicKey ]);
                        //assert(Array.isArray(response), "expected array");
                        // TODO must have data (after creating transactions)

                    case 1:
                    case "end":
                        return _context22.stop();
                }
            }
        }, null, undefined);
    });

    it("getSuspendedTransactionDetail", function _callee23() {
        var apiCaller;
        return regeneratorRuntime.async(function _callee23$(_context23) {
            while (1) {
                switch (_context23.prev = _context23.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });

                        //var response = await apiCaller.getSuspendedTransactionDetail("test");
                        //assert(Array.isArray(response), "expected array");
                        // TODO must have data (after creating transactions)

                    case 1:
                    case "end":
                        return _context23.stop();
                }
            }
        }, null, undefined);
    });
});

// ==== part 5: EvtLink ====
describe("EvtLink", function () {
    var evtLink = EVT.EvtLink;

    it("b2dec", function _callee24() {
        var dec1, dec2, dec3;
        return regeneratorRuntime.async(function _callee24$(_context24) {
            while (1) {
                switch (_context24.prev = _context24.next) {
                    case 0:
                        dec1 = evtLink.b2dec(new Buffer([0, 0, 0, 2, 41, 109, 0, 82, 0]));
                        dec2 = evtLink.b2dec(new Buffer([0]));
                        dec3 = evtLink.b2dec(new Buffer([]));


                        assert(dec1 === "0002376945652224", "should produce right dec");
                        assert(dec2 === "0", "should produce right dec");
                        assert(dec3 === "", "should produce right dec");

                    case 6:
                    case "end":
                        return _context24.stop();
                }
            }
        }, null, undefined);
    });

    it("everiPass", function _callee25() {
        var link, parsed;
        return regeneratorRuntime.async(function _callee25$(_context25) {
            while (1) {
                switch (_context25.prev = _context25.next) {
                    case 0:
                        _context25.next = 2;
                        return regeneratorRuntime.awrap(evtLink.getEveriPassText({
                            autoDestroying: true,
                            domainName: testingTmpData.newDomainName,
                            tokenName: testingTmpData.addedTokenNamePrefix + "1",
                            keyProvider: [wif, wif2, wif3]
                        }));

                    case 2:
                        link = _context25.sent;
                        _context25.next = 5;
                        return regeneratorRuntime.awrap(evtLink.parseEvtLink(link.rawText));

                    case 5:
                        parsed = _context25.sent;


                        assert(link.rawText && link.rawText.startsWith("https://evt.li/"), "should produce a EvtLink");
                        assert(parsed.segments.length === 5, "struct is wrong");
                        assert(parsed.segments[0].value === 11, "flag is wrong: ");
                        assert(parsed.publicKeys[0] === publicKey, "publicKey is wrong");

                        logger.verbose("[everiPass] " + link.rawText);
                        logger.verbose("[everiPass] \n" + JSON.stringify(parsed, null, 2));

                    case 12:
                    case "end":
                        return _context25.stop();
                }
            }
        }, null, undefined);
    });
});