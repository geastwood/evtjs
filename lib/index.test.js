"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _isInteger = require("babel-runtime/core-js/number/is-integer");

var _isInteger2 = _interopRequireDefault(_isInteger);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-env mocha */
var assert = require("assert");
var EVT = require(".");
var Key = require("./key");
var logger = require("./logger");

var wif = "5J1by7KRQujRdXrurEsvEr2zQGcdPaMJRjewER6XsAR2eCcpt3D"; // EVT6Qz3wuRjyN6gaU3P3XRxpnEZnM4oPxortemaWDwFRvsv2FxgND
var wif2 = "5JVC3ivLUT2zq3yEXkwJ2ihukZq5reufC3iW26hbVHvjepFXsiu"; // EVT7rbe5ZqAEtwQT6Tw39R29vojFqrCQasK3nT5s2pEzXh1BABXHF
var wif3 = "5K3nUWxfkUjfLQu9PL6NZLKWV41PiFyuQdrckArA59jz19M6zgq";
var publicKey = EVT.EvtKey.privateToPublic(wif);

var testingTmpData = {
    newDomainName: null,
    addedTokenNamePrefix: null,
    head_block_num: null,
    head_block_id: null
};
logger.writeLog = false;

var network = {
    host: "testnet1.everitoken.io",
    port: 443,
    protocol: "https"
};

// ==== part 1: version ====
describe("version", function () {
    it("exposes a version number", function () {
        assert.ok(EVT.version);
    });
});

// ==== part 2: EvtKey ====
describe("EvtKey", function () {
    it("randomBytesAndString", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var name128;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return EVT.EvtKey.randomName128();

                    case 2:
                        name128 = _context.sent;

                        assert(name128.length == 21, "should produce a string with a length of 21");

                        _context.t0 = assert;
                        _context.next = 7;
                        return EVT.EvtKey.random32BytesAsHex();

                    case 7:
                        _context.t1 = _context.sent;
                        (0, _context.t0)(_context.t1, "should produce a 32 bytes hex");

                    case 9:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    }))).timeout(5000);

    it("test ecc key generation", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var key, publicKey;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return EVT.EvtKey.randomPrivateKey();

                    case 2:
                        key = _context2.sent;
                        publicKey = EVT.EvtKey.privateToPublic(key);


                        assert(publicKey.startsWith("EVT"), "expected publicKey starting with EVT");

                    case 5:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, undefined);
    })));

    it("test seed key generation", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        var key, publicKey;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.next = 2;
                        return EVT.EvtKey.seedPrivateKey("seed");

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
        }, _callee3, undefined);
    })));

    it("test validKey", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
        return _regenerator2.default.wrap(function _callee4$(_context4) {
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
        }, _callee4, undefined);
    })));
});

// ==== part 3: APICaller write API ====
describe("APICaller write API test", function () {
    this.timeout(8000);

    it("empty actions", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
        var apiCaller;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        apiCaller = new EVT({
                            keyProvider: wif,
                            endpoint: network,
                            networkTimeout: 4000
                        });
                        _context5.prev = 1;
                        _context5.next = 4;
                        return apiCaller.pushTransaction();

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
        }, _callee5, this, [[1, 6]]);
    })));

    it("generateUnsignedTransaction", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
        var apiCaller, trx;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        apiCaller = new EVT({
                            keyProvider: wif,
                            endpoint: network,
                            networkTimeout: 4000
                        });
                        _context6.next = 3;
                        return apiCaller.generateUnsignedTransaction({ maxCharge: 1000000 }, new EVT.EvtActions.TransferFungibleTokenAction({
                            from: "EVT5RsxormWcjvVBvEdQFonu5RNG4js8Zvz9pTjABLZaYxo6NNbSJ",
                            to: "EVT5RsxormWcjvVBvEdQFonu5RNG4js8Zvz9pTjABLZaYxo6NNbSJ",
                            memo: "",
                            number: "1.00000 S#1"
                        }));

                    case 3:
                        trx = _context6.sent;


                        assert(trx.transaction, "expected transaction");
                        assert(trx.transaction.actions.length == 1, "expected one action");

                    case 6:
                    case "end":
                        return _context6.stop();
                }
            }
        }, _callee6, this);
    })));

    it("new_group", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
        var apiCaller;
        return _regenerator2.default.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        apiCaller = new EVT({
                            keyProvider: wif,
                            endpoint: network,
                            networkTimeout: 3000
                        });


                        testingTmpData.newGroupName = "g" + parseInt(new Date().valueOf() / 5000);

                        _context7.next = 4;
                        return apiCaller.pushTransaction({ maxCharge: 1000000 }, new EVT.EvtAction("newgroup", {
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
                        }));

                    case 4:
                    case "end":
                        return _context7.stop();
                }
            }
        }, _callee7, this);
    })));

    it("newdomain", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8() {
        var apiCaller, res;
        return _regenerator2.default.wrap(function _callee8$(_context8) {
            while (1) {
                switch (_context8.prev = _context8.next) {
                    case 0:
                        apiCaller = new EVT({
                            keyProvider: [wif, wif2],
                            endpoint: network
                        });


                        testingTmpData.newDomainName = "nd" + new Date().valueOf();

                        _context8.next = 4;
                        return apiCaller.pushTransaction({ maxCharge: 1000000, payer: publicKey }, new EVT.EvtAction("newdomain", {
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
                        }));

                    case 4:
                        _context8.next = 6;
                        return apiCaller.getDomainDetail(testingTmpData.newDomainName);

                    case 6:
                        res = _context8.sent;

                        assert(res.name === testingTmpData.newDomainName, "expected right domain name");

                    case 8:
                    case "end":
                        return _context8.stop();
                }
            }
        }, _callee8, this);
    }))).timeout(10000);

    it("issue_tokens", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9() {
        var apiCaller, charge;
        return _regenerator2.default.wrap(function _callee9$(_context9) {
            while (1) {
                switch (_context9.prev = _context9.next) {
                    case 0:
                        apiCaller = new EVT({
                            keyProvider: wif,
                            endpoint: network
                        });


                        testingTmpData.addedTokenNamePrefix = "tk" + new Date().valueOf() / 500;

                        _context9.next = 4;
                        return apiCaller.getEstimatedChargeForTransaction({ availablePublicKeys: [EVT.EvtKey.privateToPublic(wif), EVT.EvtKey.privateToPublic(wif2), EVT.EvtKey.privateToPublic(wif3)] }, new EVT.EvtAction("issuetoken", {
                            "domain": testingTmpData.newDomainName,
                            "names": [testingTmpData.addedTokenNamePrefix + "1", testingTmpData.addedTokenNamePrefix + "2", testingTmpData.addedTokenNamePrefix + "3"],
                            "owner": [Key.privateToPublic(wif)]
                        }));

                    case 4:
                        charge = _context9.sent;


                        assert(charge.charge !== undefined && (0, _isInteger2.default)(charge.charge) && charge.charge >= 0, "expected integer charge: " + (0, _stringify2.default)(charge));

                        _context9.next = 8;
                        return apiCaller.pushTransaction(new EVT.EvtAction("issuetoken", {
                            "domain": testingTmpData.newDomainName,
                            "names": [testingTmpData.addedTokenNamePrefix + "1", testingTmpData.addedTokenNamePrefix + "2", testingTmpData.addedTokenNamePrefix + "3"],
                            "owner": [Key.privateToPublic(wif)]
                        }));

                    case 8:
                    case "end":
                        return _context9.stop();
                }
            }
        }, _callee9, this);
    }))).timeout(10000);

    it("new_fungible", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10() {
        var apiCaller;
        return _regenerator2.default.wrap(function _callee10$(_context10) {
            while (1) {
                switch (_context10.prev = _context10.next) {
                    case 0:
                        apiCaller = new EVT({
                            keyProvider: wif,
                            endpoint: network
                        });


                        testingTmpData.newSymbol = Math.floor(new Date().valueOf() / 1000) + "";

                        _context10.next = 4;
                        return apiCaller.pushTransaction(new EVT.EvtAction("newfungible", {
                            name: testingTmpData.newSymbol + ".POINTS",
                            sym_name: testingTmpData.newSymbol.toString(),
                            sym: "5,S#" + testingTmpData.newSymbol,
                            creator: publicKey,
                            manage: { name: "manage", threshold: 1, authorizers: [{ ref: "[A] " + publicKey, weight: 1 }] },
                            issue: { name: "issue", threshold: 1, authorizers: [{ ref: "[A] " + publicKey, weight: 1 }] },
                            total_supply: "100000.00000 S#" + testingTmpData.newSymbol
                        }));

                    case 4:
                        testingTmpData.newTrxId = _context10.sent.transactionId;

                    case 5:
                    case "end":
                        return _context10.stop();
                }
            }
        }, _callee10, this);
    }))).timeout(10000);

    it("issue_fungible", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11() {
        var apiCaller;
        return _regenerator2.default.wrap(function _callee11$(_context11) {
            while (1) {
                switch (_context11.prev = _context11.next) {
                    case 0:
                        apiCaller = new EVT({
                            keyProvider: wif,
                            endpoint: network
                        });
                        _context11.next = 3;
                        return apiCaller.pushTransaction(new EVT.EvtAction("issuefungible", {
                            address: publicKey,
                            number: "1.00000 S#" + testingTmpData.newSymbol,
                            memo: "initial issue"
                        }));

                    case 3:
                    case "end":
                        return _context11.stop();
                }
            }
        }, _callee11, this);
    })));

    it("transferft", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12() {
        var apiCaller, trx;
        return _regenerator2.default.wrap(function _callee12$(_context12) {
            while (1) {
                switch (_context12.prev = _context12.next) {
                    case 0:
                        apiCaller = new EVT({
                            keyProvider: wif,
                            endpoint: network
                        });
                        _context12.next = 3;
                        return apiCaller.pushTransaction({ maxCharge: 1000000 }, new EVT.EvtActions.TransferFungibleTokenAction({
                            from: publicKey,
                            to: "EVT5RsxormWcjvVBvEdQFonu5RNG4js8Zvz9pTjABLZaYxo6NNbSJ",
                            memo: "",
                            number: "0.00001 S#" + testingTmpData.newSymbol
                        }));

                    case 3:
                        trx = _context12.sent;


                        console.log((0, _stringify2.default)(trx, null, 4));

                    case 5:
                    case "end":
                        return _context12.stop();
                }
            }
        }, _callee12, this);
    })));

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
describe("APICaller read API test", function () {
    var _this = this;

    this.timeout(10000);

    // get evt chain version
    it("getInfo", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13() {
        var apiCaller, response;
        return _regenerator2.default.wrap(function _callee13$(_context13) {
            while (1) {
                switch (_context13.prev = _context13.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network
                        });
                        _context13.next = 3;
                        return apiCaller.getInfo();

                    case 3:
                        response = _context13.sent;

                        assert(response.evt_api_version, "expected evt_api_version");
                        // assert(response.evt_api_version === "2.0.0", "unexpected evt_api_version " + response.evt_api_version);
                        assert(response.server_version, "expected server_version");
                        assert(response.last_irreversible_block_num, "expected last_irreversible_block_num");
                        assert(response.last_irreversible_block_id, "expected last_irreversible_block_id");
                        assert(response.chain_id, "expected chain_id");

                    case 9:
                    case "end":
                        return _context13.stop();
                }
            }
        }, _callee13, this);
    })));

    it("getHeadBlockHeaderState", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14() {
        var apiCaller, response;
        return _regenerator2.default.wrap(function _callee14$(_context14) {
            while (1) {
                switch (_context14.prev = _context14.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network
                        });
                        _context14.next = 3;
                        return apiCaller.getHeadBlockHeaderState();

                    case 3:
                        response = _context14.sent;

                        testingTmpData.head_block_num = response.block_num;
                        testingTmpData.head_block_id = response.id;
                        assert(response.block_num, "expected block_num");

                    case 7:
                    case "end":
                        return _context14.stop();
                }
            }
        }, _callee14, this);
    })));

    it("getTransactionIdsInBlock", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee15() {
        var apiCaller, response;
        return _regenerator2.default.wrap(function _callee15$(_context15) {
            while (1) {
                switch (_context15.prev = _context15.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network
                        });
                        _context15.next = 3;
                        return apiCaller.getTransactionIdsInBlock(testingTmpData.head_block_id);

                    case 3:
                        response = _context15.sent;

                        assert(Array.isArray(response), "expected array");

                    case 5:
                    case "end":
                        return _context15.stop();
                }
            }
        }, _callee15, this);
    })));

    it("getCreatedDomains", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee16() {
        var apiCaller, response;
        return _regenerator2.default.wrap(function _callee16$(_context16) {
            while (1) {
                switch (_context16.prev = _context16.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });
                        _context16.next = 3;
                        return apiCaller.getCreatedDomains(publicKey);

                    case 3:
                        response = _context16.sent;

                        assert(Array.isArray(response), "expected array");
                        // TODO must have data (after creating domains)

                    case 5:
                    case "end":
                        return _context16.stop();
                }
            }
        }, _callee16, this);
    })));

    it("getManagedGroups", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee17() {
        var apiCaller, response;
        return _regenerator2.default.wrap(function _callee17$(_context17) {
            while (1) {
                switch (_context17.prev = _context17.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });
                        _context17.next = 3;
                        return apiCaller.getManagedGroups(publicKey);

                    case 3:
                        response = _context17.sent;

                        assert(Array.isArray(response), "expected array");
                        // TODO must have data (after creating groups)

                    case 5:
                    case "end":
                        return _context17.stop();
                }
            }
        }, _callee17, _this);
    })));

    it("getOwnedTokens", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee18() {
        var apiCaller, response;
        return _regenerator2.default.wrap(function _callee18$(_context18) {
            while (1) {
                switch (_context18.prev = _context18.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });
                        _context18.next = 3;
                        return apiCaller.getOwnedTokens(publicKey);

                    case 3:
                        response = _context18.sent;

                        assert(Array.isArray(response), "expected array");
                        // TODO must have data (after having tokens)

                    case 5:
                    case "end":
                        return _context18.stop();
                }
            }
        }, _callee18, _this);
    })));

    it("getActions", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee19() {
        var apiCaller, response;
        return _regenerator2.default.wrap(function _callee19$(_context19) {
            while (1) {
                switch (_context19.prev = _context19.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });
                        _context19.next = 3;
                        return apiCaller.getActions({
                            domain: testingTmpData.newDomainName,
                            skip: 0,
                            take: 10
                        });

                    case 3:
                        response = _context19.sent;

                        assert(Array.isArray(response), "expected array");

                    case 5:
                    case "end":
                        return _context19.stop();
                }
            }
        }, _callee19, _this);
    })));

    it("getTransactionsDetailOfPublicKeys", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee20() {
        var apiCaller, response;
        return _regenerator2.default.wrap(function _callee20$(_context20) {
            while (1) {
                switch (_context20.prev = _context20.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });
                        _context20.next = 3;
                        return apiCaller.getTransactionsDetailOfPublicKeys(publicKey, 0, 10, "asc");

                    case 3:
                        response = _context20.sent;

                        // console.log("_____++++++++++++++++" + JSON.stringify(response, null, 4));

                        assert(Array.isArray(response), "expected array");
                        testingTmpData.trxid = response[0].id;
                        // TODO must have data (after creating transactions)

                    case 6:
                    case "end":
                        return _context20.stop();
                }
            }
        }, _callee20, _this);
    }))).timeout(10000);

    it("getFungibleSymbolDetail", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee21() {
        var apiCaller, response;
        return _regenerator2.default.wrap(function _callee21$(_context21) {
            while (1) {
                switch (_context21.prev = _context21.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });
                        _context21.next = 3;
                        return apiCaller.getFungibleSymbolDetail(1);

                    case 3:
                        response = _context21.sent;

                        assert(response && response.sym, "expected response");
                        // TODO must have data (after creating symbol)

                    case 5:
                    case "end":
                        return _context21.stop();
                }
            }
        }, _callee21, _this);
    })));

    it("getDomainDetail", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee22() {
        var apiCaller, response;
        return _regenerator2.default.wrap(function _callee22$(_context22) {
            while (1) {
                switch (_context22.prev = _context22.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });
                        _context22.next = 3;
                        return apiCaller.getDomainDetail(testingTmpData.newDomainName);

                    case 3:
                        response = _context22.sent;

                        //console.log(response);
                        assert(response && response.creator, "expected response");
                        // TODO must have data (after creating symbol)

                    case 5:
                    case "end":
                        return _context22.stop();
                }
            }
        }, _callee22, _this);
    })));

    it("getGroupDetail", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee23() {
        var apiCaller, response;
        return _regenerator2.default.wrap(function _callee23$(_context23) {
            while (1) {
                switch (_context23.prev = _context23.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });
                        _context23.next = 3;
                        return apiCaller.getGroupDetail(testingTmpData.newGroupName);

                    case 3:
                        response = _context23.sent;

                        //console.log(response);
                        assert(response && response.root, "expected response");
                        // TODO must have data (after creating symbol)

                    case 5:
                    case "end":
                        return _context23.stop();
                }
            }
        }, _callee23, _this);
    })));

    it("getTransactionDetailById", function () {
        return new _promise2.default(function () {
            var _ref24 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee25(res, rej) {
                return _regenerator2.default.wrap(function _callee25$(_context25) {
                    while (1) {
                        switch (_context25.prev = _context25.next) {
                            case 0:
                                setTimeout((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee24() {
                                    var apiCaller, response;
                                    return _regenerator2.default.wrap(function _callee24$(_context24) {
                                        while (1) {
                                            switch (_context24.prev = _context24.next) {
                                                case 0:
                                                    apiCaller = EVT({
                                                        endpoint: network,
                                                        keyProvider: wif
                                                    });
                                                    _context24.next = 3;
                                                    return apiCaller.getTransactionDetailById(testingTmpData.newTrxId);

                                                case 3:
                                                    response = _context24.sent;
                                                    //testingTmpData.newTrxId); "bed1272c6de3294582910c968b93f1c015eb646181174ab5a705df35b024f65d"
                                                    logger.verbose("[getTransactionDetailById] " + (0, _stringify2.default)(response, null, 2));
                                                    assert(response.id, "expected id");

                                                    res();

                                                case 7:
                                                case "end":
                                                    return _context24.stop();
                                            }
                                        }
                                    }, _callee24, _this);
                                })), 500);

                            case 1:
                            case "end":
                                return _context25.stop();
                        }
                    }
                }, _callee25, _this);
            }));

            return function (_x, _x2) {
                return _ref24.apply(this, arguments);
            };
        }());
    });

    it("getBlock", function () {
        return new _promise2.default(function () {
            var _ref26 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee27(res, rej) {
                return _regenerator2.default.wrap(function _callee27$(_context27) {
                    while (1) {
                        switch (_context27.prev = _context27.next) {
                            case 0:
                                setTimeout((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee26() {
                                    var apiCaller, response1, response2;
                                    return _regenerator2.default.wrap(function _callee26$(_context26) {
                                        while (1) {
                                            switch (_context26.prev = _context26.next) {
                                                case 0:
                                                    apiCaller = EVT({
                                                        endpoint: network,
                                                        keyProvider: wif
                                                    });
                                                    _context26.next = 3;
                                                    return apiCaller.getBlockDetail(testingTmpData.head_block_id);

                                                case 3:
                                                    response1 = _context26.sent;
                                                    _context26.next = 6;
                                                    return apiCaller.getBlockDetail(testingTmpData.head_block_num.toString());

                                                case 6:
                                                    response2 = _context26.sent;

                                                    logger.verbose("[getBlockById] " + (0, _stringify2.default)(response1, null, 2));
                                                    logger.verbose("[getBlockByNum] " + (0, _stringify2.default)(response2, null, 2));
                                                    assert(response1.id === response2.id, "expected same id");

                                                    res();

                                                case 11:
                                                case "end":
                                                    return _context26.stop();
                                            }
                                        }
                                    }, _callee26, _this);
                                })), 500);

                            case 1:
                            case "end":
                                return _context27.stop();
                        }
                    }
                }, _callee27, _this);
            }));

            return function (_x3, _x4) {
                return _ref26.apply(this, arguments);
            };
        }());
    });

    // it("getBlockHeaderState", () => {
    //     return new Promise(async (res, rej) => {
    //         setTimeout(async () => {
    //             const apiCaller = EVT({
    //                 endpoint: network,
    //                 keyProvider: wif
    //             });
    //             var response1 = await apiCaller.getBlockHeaderState(testingTmpData.head_block_id);
    //             var response2 = await apiCaller.getBlockHeaderState(testingTmpData.head_block_num);
    //             logger.verbose("[getBlockStateById] " + JSON.stringify(response1, null, 2));
    //             logger.verbose("[getBlockStateByNum] " + JSON.stringify(response2, null, 2));
    //             assert(response1.id === response2.id, "expected same id");

    //             res();
    //         }, 500);
    //     });
    // });

    it("getTransactionActions", function () {
        return new _promise2.default(function () {
            var _ref28 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee29(res, rej) {
                return _regenerator2.default.wrap(function _callee29$(_context29) {
                    while (1) {
                        switch (_context29.prev = _context29.next) {
                            case 0:
                                setTimeout((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee28() {
                                    var apiCaller, response;
                                    return _regenerator2.default.wrap(function _callee28$(_context28) {
                                        while (1) {
                                            switch (_context28.prev = _context28.next) {
                                                case 0:
                                                    _context28.prev = 0;
                                                    apiCaller = EVT({
                                                        endpoint: network,
                                                        keyProvider: wif
                                                    });
                                                    _context28.next = 4;
                                                    return apiCaller.getTransactionActions(testingTmpData.trxid);

                                                case 4:
                                                    response = _context28.sent;

                                                    assert(Array.isArray(response), "Should be an array.");

                                                    res();
                                                    _context28.next = 12;
                                                    break;

                                                case 9:
                                                    _context28.prev = 9;
                                                    _context28.t0 = _context28["catch"](0);

                                                    //res();
                                                    rej(_context28.t0);

                                                case 12:
                                                case "end":
                                                    return _context28.stop();
                                            }
                                        }
                                    }, _callee28, _this, [[0, 9]]);
                                })), 1500);

                            case 1:
                            case "end":
                                return _context29.stop();
                        }
                    }
                }, _callee29, _this);
            }));

            return function (_x5, _x6) {
                return _ref28.apply(this, arguments);
            };
        }());
    });

    it("getFungibleBalance", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee30() {
        var apiCaller, response;
        return _regenerator2.default.wrap(function _callee30$(_context30) {
            while (1) {
                switch (_context30.prev = _context30.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });
                        _context30.next = 3;
                        return apiCaller.getFungibleBalance(publicKey);

                    case 3:
                        response = _context30.sent;

                        assert(Array.isArray(response), "expected array");

                        _context30.next = 7;
                        return apiCaller.getFungibleBalance(publicKey, 1);

                    case 7:
                        response = _context30.sent;

                        assert(Array.isArray(response), "expected array");
                        // TODO must have data (after creating transactions)

                    case 9:
                    case "end":
                        return _context30.stop();
                }
            }
        }, _callee30, _this);
    })));

    it("getRequiredKeysForSuspendedTransaction", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee31() {
        var apiCaller;
        return _regenerator2.default.wrap(function _callee31$(_context31) {
            while (1) {
                switch (_context31.prev = _context31.next) {
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
                        return _context31.stop();
                }
            }
        }, _callee31, _this);
    })));

    it("getSuspendedTransactionDetail", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee32() {
        var apiCaller;
        return _regenerator2.default.wrap(function _callee32$(_context32) {
            while (1) {
                switch (_context32.prev = _context32.next) {
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
                        return _context32.stop();
                }
            }
        }, _callee32, _this);
    })));
});

// ==== part 5: EvtLink ====
describe("EvtLink", function () {
    var _this2 = this;

    this.timeout(8000);

    var evtLink = EVT.EvtLink;

    it("b2base42", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee33() {
        var dec1, dec2, dec3;
        return _regenerator2.default.wrap(function _callee33$(_context33) {
            while (1) {
                switch (_context33.prev = _context33.next) {
                    case 0:
                        dec1 = evtLink.b2dec(new Buffer([0, 0, 0, 2, 41, 109, 0, 82, 0]));
                        dec2 = evtLink.b2dec(new Buffer([0]));
                        dec3 = evtLink.b2dec(new Buffer([]));


                        assert(dec1 === "000AD1KQVMO", "should produce right base42 " + dec1);
                        assert(dec2 === "0", "should produce right base42:" + dec2);
                        assert(dec3 === "", "should produce right base42:" + dec3);

                    case 6:
                    case "end":
                        return _context33.stop();
                }
            }
        }, _callee33, _this2);
    })));

    it("everiPass1", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee34() {
        var link, parsed;
        return _regenerator2.default.wrap(function _callee34$(_context34) {
            while (1) {
                switch (_context34.prev = _context34.next) {
                    case 0:
                        _context34.next = 2;
                        return evtLink.getEvtLinkForEveriPass({
                            autoDestroying: true,
                            domainName: testingTmpData.newDomainName,
                            tokenName: testingTmpData.addedTokenNamePrefix + "1",
                            keyProvider: [wif, wif2, wif3]
                        });

                    case 2:
                        link = _context34.sent;
                        _context34.next = 5;
                        return evtLink.parseEvtLink(link.rawText);

                    case 5:
                        parsed = _context34.sent;


                        logger.verbose("[everiPass] " + link.rawText);
                        logger.verbose("[everiPass] \n" + (0, _stringify2.default)(parsed, null, 2));

                        assert(link.rawText, "should produce a EvtLink");
                        assert(parsed.segments.length === 3, "struct is wrong: " + parsed.segments.length);
                        assert(parsed.flag === 11, "flag is wrong: " + parsed.flag);
                        assert(parsed.publicKeys[0] === publicKey, "publicKey is wrong");

                    case 12:
                    case "end":
                        return _context34.stop();
                }
            }
        }, _callee34, _this2);
    })));

    it("everiPass2", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee35() {
        var link, apiCaller, parsed, validationResult;
        return _regenerator2.default.wrap(function _callee35$(_context35) {
            while (1) {
                switch (_context35.prev = _context35.next) {
                    case 0:
                        _context35.next = 2;
                        return evtLink.getEveriPassText({
                            autoDestroying: false,
                            domainName: testingTmpData.newDomainName,
                            tokenName: testingTmpData.addedTokenNamePrefix + "1",
                            keyProvider: [wif]
                        });

                    case 2:
                        link = _context35.sent;
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: []
                        });
                        _context35.next = 6;
                        return evtLink.parseEvtLink(link.rawText);

                    case 6:
                        parsed = _context35.sent;
                        _context35.next = 9;
                        return evtLink.validateEveriPassUnsafe({ parsedEvtLink: parsed, apiCaller: apiCaller });

                    case 9:
                        validationResult = _context35.sent;

                        logger.verbose("[everiPass] validateUnsafe: " + (0, _stringify2.default)(validationResult, null, 2));

                        logger.verbose("[everiPass] " + link.rawText);
                        logger.verbose("[everiPass] \n" + (0, _stringify2.default)(parsed, null, 2));

                        assert(validationResult.valid, "should be a valid everiPass");
                        assert(link.rawText, "should produce a EvtLink");
                        assert(parsed.segments.length === 3, "struct is wrong: " + parsed.segments.length);
                        assert(parsed.flag === 3, "flag is wrong: " + parsed.flag);
                        assert(parsed.publicKeys[0] === publicKey, "publicKey is wrong");

                    case 18:
                    case "end":
                        return _context35.stop();
                }
            }
        }, _callee35, _this2);
    })));

    it("everiPay", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee36() {
        var link, parsed;
        return _regenerator2.default.wrap(function _callee36$(_context36) {
            while (1) {
                switch (_context36.prev = _context36.next) {
                    case 0:
                        _context36.t0 = evtLink;
                        _context36.t1 = [wif2];
                        _context36.next = 4;
                        return evtLink.getUniqueLinkId();

                    case 4:
                        _context36.t2 = _context36.sent;
                        _context36.t3 = {
                            symbol: 1,
                            maxAmount: 354,
                            keyProvider: _context36.t1,
                            linkId: _context36.t2
                        };
                        _context36.next = 8;
                        return _context36.t0.getEvtLinkForEveriPay.call(_context36.t0, _context36.t3);

                    case 8:
                        link = _context36.sent;
                        _context36.next = 11;
                        return evtLink.parseEvtLink(link.rawText);

                    case 11:
                        parsed = _context36.sent;


                        logger.verbose("[everiPay] " + link.rawText);
                        logger.verbose("[everiPay] \n" + (0, _stringify2.default)(parsed, null, 2));

                        assert(link.rawText, "should produce a EvtLink");
                        assert(parsed.segments.length === 4, "struct is wrong: " + parsed.segments.length);
                        assert(parsed.flag === 5, "flag is wrong: " + parsed.flag);
                        assert(parsed.publicKeys[0] === EVT.EvtKey.privateToPublic(wif2), "publicKey is wrong");

                    case 18:
                    case "end":
                        return _context36.stop();
                }
            }
        }, _callee36, _this2);
    })));

    it("everiPay_execPush", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee37() {
        var linkId, link, apiCaller, status;
        return _regenerator2.default.wrap(function _callee37$(_context37) {
            while (1) {
                switch (_context37.prev = _context37.next) {
                    case 0:
                        _context37.next = 2;
                        return evtLink.getUniqueLinkId();

                    case 2:
                        linkId = _context37.sent;
                        _context37.next = 5;
                        return evtLink.getEvtLinkForEveriPay({
                            symbol: 1,
                            maxAmount: 10000000,
                            keyProvider: [wif],
                            linkId: linkId
                        });

                    case 5:
                        link = _context37.sent;


                        // execute the pay
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: [wif2]
                        });
                        _context37.next = 9;
                        return apiCaller.pushTransaction({ maxCharge: 1000000 }, new EVT.EvtAction("everipay", {
                            link: link.rawText,
                            "memo": "",
                            "payee": EVT.EvtKey.privateToPublic(wif2),
                            "number": "1.00000 S#1"
                        }));

                    case 9:
                        _context37.next = 11;
                        return apiCaller.getStatusOfEvtLink({
                            linkId: linkId
                        });

                    case 11:
                        status = _context37.sent;

                    case 12:
                    case "end":
                        return _context37.stop();
                }
            }
        }, _callee37, _this2);
    }))).timeout(10000);

    it("everiPass_execPush", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee38() {
        var link, apiCaller;
        return _regenerator2.default.wrap(function _callee38$(_context38) {
            while (1) {
                switch (_context38.prev = _context38.next) {
                    case 0:
                        _context38.t0 = evtLink;
                        _context38.t1 = testingTmpData.newDomainName;
                        _context38.t2 = testingTmpData.addedTokenNamePrefix + "1";
                        _context38.t3 = [wif];
                        _context38.next = 6;
                        return evtLink.getUniqueLinkId();

                    case 6:
                        _context38.t4 = _context38.sent;
                        _context38.t5 = {
                            autoDestroying: true,
                            domainName: _context38.t1,
                            tokenName: _context38.t2,
                            keyProvider: _context38.t3,
                            linkId: _context38.t4
                        };
                        _context38.next = 10;
                        return _context38.t0.getEvtLinkForEveriPass.call(_context38.t0, _context38.t5);

                    case 10:
                        link = _context38.sent;


                        // execute the pass
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: [wif2]
                        });
                        _context38.next = 14;
                        return apiCaller.pushTransaction({ maxCharge: 1000000 }, new EVT.EvtAction("everipass", {
                            link: link.rawText,
                            memo: ""
                        }));

                    case 14:
                    case "end":
                        return _context38.stop();
                }
            }
        }, _callee38, _this2);
    })));

    it("parse evtLink", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee39() {
        var parsed;
        return _regenerator2.default.wrap(function _callee39$(_context39) {
            while (1) {
                switch (_context39.prev = _context39.next) {
                    case 0:
                        _context39.next = 2;
                        return evtLink.parseEvtLink("0DFYZXZO9-:Y:JLF*3/4JCPG7V1346OZ:R/G2M93-2L*BBT9S0YQ0+JNRIW95*HF*94J0OVUN$KS01-GZ-N7FWK9_FXXJORONB7B58VU9Z2MZKZ5*:NP3::K7UYKD:Y9I1V508HBQZK2AE*ZS85PJZ2N47/41LQ-MZ/4Q6THOX**YN0VMQ*3/CG9-KX2:E7C-OCM*KJJT:Z7640Q6B*FWIQBYMDPIXB4CM:-8*TW-QNY$$AY5$UA3+N-7L/ZSDCWO1I7M*3Q6*SMAYOWWTF5RJAJ:NG**8U5J6WC2VM5Z:OLZPVJXX*12I*6V9FL1HX095$5:$*C3KGCM3FIS-WWRE14E:7VYNFA-3QCH5ULZJ*CRH91BTXIK-N+J1");

                    case 2:
                        parsed = _context39.sent;


                        logger.verbose("[everiPass] \n" + (0, _stringify2.default)(parsed, null, 2));

                        assert(parsed.segments.length === 4, "struct is wrong: " + parsed.segments.length);
                        assert(parsed.flag === 11, "flag is wrong: " + parsed.flag);
                        assert(parsed.publicKeys[0] === publicKey, "publicKey is wrong");

                        _context39.next = 9;
                        return evtLink.parseEvtLink("0287F2T16JJ4CWK*LA3KAS+:$W:XZ:IQNJDD2UH2N4S$ZWQK4ZGSR9:Y3UDF5C9Y63R64E4R331:QSK+LO9N/WG_PYZ+CWE*$JT4YN66$IN:MV-RO/1/F0O553BB7+5G2V1RZUO73KLV5X5E6S4GB2$8G2-:3FR2Y+N+S4GXC0S6HZT3VDMU*TYH");

                    case 9:
                        parsed = _context39.sent;


                        logger.verbose("[everiPass] \n" + (0, _stringify2.default)(parsed, null, 2));

                    case 11:
                    case "end":
                        return _context39.stop();
                }
            }
        }, _callee39, _this2);
    })));

    it("parse bad evtLink", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee40() {
        return _regenerator2.default.wrap(function _callee40$(_context40) {
            while (1) {
                switch (_context40.prev = _context40.next) {
                    case 0:
                        _context40.prev = 0;
                        _context40.next = 3;
                        return evtLink.parseEvtLink("1DFYZXZO9-:Y:JLF*3/4JCPG7V1346OZ:R/G2M93-2L*BBT9S0YQ0+JNRIW95*HF*94J0OVUN$S01-GZ-N7FWK9_FXXRONB7B58VU9Z2MZKZ5*:NP3::K7UYKD:Y9I1V508HBQZK2AE*ZS85PJZ2N47/41LQ-MZ/4Q6THOX**YN0VMQ*3/CG9-KX2:E7C-OCM*KJJT:Z7640Q6B*FWIQBYMXB4CM:-8*TW-QNY$$AY5$UA3+N-7L/ZSDCWO1I7M*3Q6*SMAYOWWTF5RJAJ:NG**8U5J6WC2VM5Z:OLZPVJXX*12I*6V9FL1HX095$5:$*C3KGCM3FIS-WWRE14E:7VYNFA-4QCH5ULZJ*CRH91BTXIK-N+J1");

                    case 3:
                        _context40.next = 9;
                        break;

                    case 5:
                        _context40.prev = 5;
                        _context40.t0 = _context40["catch"](0);

                        assert(_context40.t0, "");
                        return _context40.abrupt("return");

                    case 9:

                        assert(false, "should throw exception");

                    case 10:
                    case "end":
                        return _context40.stop();
                }
            }
        }, _callee40, _this2, [[0, 5]]);
    })));
});