"use strict";

/* eslint-env mocha */
var assert = require("assert");
var EVT = require(".");
var Key = require("./key");

var wif = "5JgWJptxZENHR69oZsPSeVTXScRx7jYPMTjPTKAjW2JFnjEhoDZ";
var wif2 = "5KXxF69n5SsYSQRs8L855jKC5fqzT6uzRzJ1r686t2RRu9JQr9i";
var publicKey = EVT.EvtKey.privateToPublic(wif);

var testingTmpData = {
    newDomainName: null,
    addedTokenNamePrefix: null
};

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
    it("test ecc key generation", function _callee() {
        var key, publicKey;
        return regeneratorRuntime.async(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return regeneratorRuntime.awrap(EVT.EvtKey.randomPrivateKey());

                    case 2:
                        key = _context.sent;
                        publicKey = EVT.EvtKey.privateToPublic(key);


                        assert(publicKey.startsWith("EVT"), "expected publicKey starting with EVT");

                    case 5:
                    case "end":
                        return _context.stop();
                }
            }
        }, null, undefined);
    });

    it("test seed key generation", function _callee2() {
        var key, publicKey;
        return regeneratorRuntime.async(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return regeneratorRuntime.awrap(EVT.EvtKey.seedPrivateKey("seed"));

                    case 2:
                        key = _context2.sent;
                        publicKey = EVT.EvtKey.privateToPublic(key);


                        assert(key === "5J1by7KRQujRdXrurEsvEr2zQGcdPaMJRjewER6XsAR2eCcpt3D");
                        assert(publicKey === "EVT6Qz3wuRjyN6gaU3P3XRxpnEZnM4oPxortemaWDwFRvsv2FxgND");

                    case 6:
                    case "end":
                        return _context2.stop();
                }
            }
        }, null, undefined);
    });

    it("test validKey", function _callee3() {
        return regeneratorRuntime.async(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        assert(EVT.EvtKey.isValidPrivateKey("5J1by7KRQujRdXrurEsvEr2zQGcdPaMJRjewER6XsAR2eCcpt3D"), "should be a valid private");
                        assert(!EVT.EvtKey.isValidPrivateKey("5J1by7KRQujRdXrurEsvEr2zQGcdPaMJRjewER7XsAR2eCcpt3D"), "should not be a valid private");
                        assert(EVT.EvtKey.isValidPublicKey("EVT76uLwUD5t6fkob9Rbc9UxHgdTVshNceyv2hmppw4d82j2zYRpa"), "should be a valid public");
                        assert(!EVT.EvtKey.isValidPublicKey("EOS6Qz3wuRjyN6gaU3P3XRxpnEZnM4oPxortemaWDwFRvsv2FxgND"), "should not be a valid public");
                        assert(!EVT.EvtKey.isValidPublicKey("EVT6Qz3wuRjyN6gaU3P3XRxpnEZnM4oPxortemaWDWFRvsv2FxgND"), "should not be a valid public");

                    case 5:
                    case "end":
                        return _context3.stop();
                }
            }
        }, null, undefined);
    });

    it("randomBytesAndString", function () {
        assert(EVT.EvtKey.random32BytesAsHex(), "should produce a 32 bytes hex");
        var name128 = EVT.EvtKey.randomName128();
        assert(name128.length == 21, "should produce a string with a length of 21");
    });
});

// ==== part 3: APICaller write API ====
describe("APICaller write API test", function () {
    it("newdomain", function _callee4() {
        var apiCaller, res;
        return regeneratorRuntime.async(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        apiCaller = new EVT({
                            keyProvider: [wif, wif2],
                            endpoint: network
                        });


                        testingTmpData.newDomainName = "nd" + new Date().valueOf();

                        _context4.next = 4;
                        return regeneratorRuntime.awrap(apiCaller.pushTransaction(new EVT.EvtAction("newdomain", {
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
                                    "ref": "[G] OWNER",
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
                        _context4.next = 6;
                        return regeneratorRuntime.awrap(apiCaller.getDomainDetail(testingTmpData.newDomainName));

                    case 6:
                        res = _context4.sent;

                        assert(res.name === testingTmpData.newDomainName, "expected right domain name");

                    case 8:
                    case "end":
                        return _context4.stop();
                }
            }
        }, null, this);
    });

    it("issue_tokens", function _callee5() {
        var apiCaller;
        return regeneratorRuntime.async(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        apiCaller = new EVT({
                            keyProvider: wif,
                            endpoint: network
                        });


                        testingTmpData.addedTokenNamePrefix = "tk" + new Date().valueOf() / 500;

                        _context5.next = 4;
                        return regeneratorRuntime.awrap(apiCaller.pushTransaction({
                            "action": "issuetoken",
                            "args": {
                                "domain": testingTmpData.newDomainName,
                                "names": [testingTmpData.addedTokenNamePrefix + "1", testingTmpData.addedTokenNamePrefix + "2", testingTmpData.addedTokenNamePrefix + "3"],
                                "owner": [Key.privateToPublic(wif)]
                            }
                        }));

                    case 4:
                    case "end":
                        return _context5.stop();
                }
            }
        }, null, this);
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
                        return regeneratorRuntime.awrap(apiCaller.pushTransaction({
                            "action": "newgroup",
                            "args": {
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
                            }
                        }));

                    case 4:
                    case "end":
                        return _context6.stop();
                }
            }
        }, null, this);
    });

    it("new_fungible", function _callee7() {
        var apiCaller, randomString;
        return regeneratorRuntime.async(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
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

                        _context7.next = 5;
                        return regeneratorRuntime.awrap(apiCaller.pushTransaction(new EVT.EvtAction("newfungible", {
                            sym: "5," + testingTmpData.newSymbol,
                            creator: publicKey,
                            issue: { name: "issue", threshold: 1, authorizers: [{ ref: "[A] " + publicKey, weight: 1 }] },
                            manage: { name: "manage", threshold: 1, authorizers: [{ ref: "[A] " + publicKey, weight: 1 }] },
                            total_supply: "100000.00000 " + testingTmpData.newSymbol
                        })));

                    case 5:
                        testingTmpData.newTrxId = _context7.sent.transactionId;

                    case 6:
                    case "end":
                        return _context7.stop();
                }
            }
        }, null, this);
    });
});

// ==== part 3: APICaller read API ====
describe("APICaller read API test", function () {
    // get evt chain version
    it("getInfo", function _callee8() {
        var apiCaller, response;
        return regeneratorRuntime.async(function _callee8$(_context8) {
            while (1) {
                switch (_context8.prev = _context8.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network
                        });
                        _context8.next = 3;
                        return regeneratorRuntime.awrap(apiCaller.getInfo());

                    case 3:
                        response = _context8.sent;

                        assert(response.evt_api_version, "expected evt_api_version");
                        // assert(response.evt_api_version === "2.0.0", "unexpected evt_api_version " + response.evt_api_version);
                        assert(response.server_version, "expected server_version");
                        assert(response.last_irreversible_block_num, "expected last_irreversible_block_num");
                        assert(response.last_irreversible_block_id, "expected last_irreversible_block_id");
                        assert(response.chain_id, "expected chain_id");

                    case 9:
                    case "end":
                        return _context8.stop();
                }
            }
        }, null, this);
    });

    it("getCreatedDomains", function _callee9() {
        var apiCaller, response;
        return regeneratorRuntime.async(function _callee9$(_context9) {
            while (1) {
                switch (_context9.prev = _context9.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });
                        _context9.next = 3;
                        return regeneratorRuntime.awrap(apiCaller.getCreatedDomains(publicKey));

                    case 3:
                        response = _context9.sent;

                        assert(Array.isArray(response), "expected array");
                        // TODO must have data (after creating domains)

                    case 5:
                    case "end":
                        return _context9.stop();
                }
            }
        }, null, this);
    });

    it("getManagedGroups", function _callee10() {
        var apiCaller, response;
        return regeneratorRuntime.async(function _callee10$(_context10) {
            while (1) {
                switch (_context10.prev = _context10.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });
                        _context10.next = 3;
                        return regeneratorRuntime.awrap(apiCaller.getManagedGroups(publicKey));

                    case 3:
                        response = _context10.sent;

                        assert(Array.isArray(response), "expected array");
                        // TODO must have data (after creating groups)

                    case 5:
                    case "end":
                        return _context10.stop();
                }
            }
        }, null, undefined);
    });

    it("getOwnedTokens", function _callee11() {
        var apiCaller, response;
        return regeneratorRuntime.async(function _callee11$(_context11) {
            while (1) {
                switch (_context11.prev = _context11.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });
                        _context11.next = 3;
                        return regeneratorRuntime.awrap(apiCaller.getOwnedTokens(publicKey));

                    case 3:
                        response = _context11.sent;

                        assert(Array.isArray(response), "expected array");
                        // TODO must have data (after having tokens)

                    case 5:
                    case "end":
                        return _context11.stop();
                }
            }
        }, null, undefined);
    });

    it("getActions", function _callee12() {
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
                        return regeneratorRuntime.awrap(apiCaller.getActions({
                            domain: testingTmpData.newDomainName,
                            skip: 0,
                            take: 10
                        }));

                    case 3:
                        response = _context12.sent;

                        assert(Array.isArray(response), "expected array");

                    case 5:
                    case "end":
                        return _context12.stop();
                }
            }
        }, null, undefined);
    });

    it("getTransactionsDetailOfPublicKeys", function _callee13() {
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
                        return regeneratorRuntime.awrap(apiCaller.getTransactionsDetailOfPublicKeys(publicKey));

                    case 3:
                        response = _context13.sent;

                        assert(Array.isArray(response), "expected array");
                        // TODO must have data (after creating transactions)

                    case 5:
                    case "end":
                        return _context13.stop();
                }
            }
        }, null, undefined);
    });

    it("getFungibleSymbolDetail", function _callee14() {
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
                        return regeneratorRuntime.awrap(apiCaller.getFungibleSymbolDetail("EVT"));

                    case 3:
                        response = _context14.sent;

                        assert(response && response.sym, "expected response");
                        // TODO must have data (after creating symbol)

                    case 5:
                    case "end":
                        return _context14.stop();
                }
            }
        }, null, undefined);
    });

    it("getDomainDetail", function _callee15() {
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
                        return regeneratorRuntime.awrap(apiCaller.getDomainDetail(testingTmpData.newDomainName));

                    case 3:
                        response = _context15.sent;

                        //console.log(response);
                        assert(response && response.creator, "expected response");
                        // TODO must have data (after creating symbol)

                    case 5:
                    case "end":
                        return _context15.stop();
                }
            }
        }, null, undefined);
    });

    it("getGroupDetail", function _callee16() {
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
                        return regeneratorRuntime.awrap(apiCaller.getGroupDetail(testingTmpData.newGroupName));

                    case 3:
                        response = _context16.sent;

                        //console.log(response);
                        assert(response && response.root, "expected response");
                        // TODO must have data (after creating symbol)

                    case 5:
                    case "end":
                        return _context16.stop();
                }
            }
        }, null, undefined);
    });

    it("getTransactionDetailById", function _callee17() {
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
                        return regeneratorRuntime.awrap(apiCaller.getTransactionDetailById(testingTmpData.newTrxId));

                    case 3:
                        response = _context17.sent;

                        assert(response.id, "expected id");
                        // TODO must have data (after creating transactions)

                    case 5:
                    case "end":
                        return _context17.stop();
                }
            }
        }, null, undefined);
    });

    it("getFungibleBalance", function _callee18() {
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
                        return regeneratorRuntime.awrap(apiCaller.getFungibleBalance(publicKey));

                    case 3:
                        response = _context18.sent;

                        assert(Array.isArray(response), "expected array");
                        // TODO must have data (after creating transactions)

                    case 5:
                    case "end":
                        return _context18.stop();
                }
            }
        }, null, undefined);
    });

    it("getRequiredKeysForSuspendedTransaction", function _callee19() {
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
                        return regeneratorRuntime.awrap(apiCaller.getRequiredKeysForSuspendedTransaction("test", [publicKey]));

                    case 3:
                        response = _context19.sent;

                        assert(Array.isArray(response), "expected array");
                        // TODO must have data (after creating transactions)

                    case 5:
                    case "end":
                        return _context19.stop();
                }
            }
        }, null, undefined);
    });

    it("getSuspendedTransactionDetail", function _callee20() {
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
                        return regeneratorRuntime.awrap(apiCaller.getSuspendedTransactionDetail("test"));

                    case 3:
                        response = _context20.sent;

                        assert(Array.isArray(response), "expected array");
                        // TODO must have data (after creating transactions)

                    case 5:
                    case "end":
                        return _context20.stop();
                }
            }
        }, null, undefined);
    });
});