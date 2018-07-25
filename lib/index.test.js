"use strict";

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

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

var wif = "5J1by7KRQujRdXrurEsvEr2zQGcdPaMJRjewER6XsAR2eCcpt3D";
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
    })));

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
    it("empty actions", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
        var apiCaller;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        apiCaller = new EVT({
                            keyProvider: wif,
                            endpoint: network
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

    it("new_group", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
        var apiCaller;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        apiCaller = new EVT({
                            keyProvider: wif,
                            endpoint: network
                        });


                        testingTmpData.newGroupName = "g" + parseInt(new Date().valueOf() / 5000);

                        _context6.next = 4;
                        return apiCaller.pushTransaction({ maxCharge: 1000 }, new EVT.EvtAction("newgroup", {
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
                        return _context6.stop();
                }
            }
        }, _callee6, this);
    })));

    it("newdomain", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
        var apiCaller, res;
        return _regenerator2.default.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        apiCaller = new EVT({
                            keyProvider: [wif, wif2],
                            endpoint: network
                        });


                        testingTmpData.newDomainName = "nd" + new Date().valueOf();

                        _context7.next = 4;
                        return apiCaller.pushTransaction({ maxCharge: 1000, payer: publicKey }, new EVT.EvtAction("newdomain", {
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
                        _context7.next = 6;
                        return apiCaller.getDomainDetail(testingTmpData.newDomainName);

                    case 6:
                        res = _context7.sent;

                        assert(res.name === testingTmpData.newDomainName, "expected right domain name");

                    case 8:
                    case "end":
                        return _context7.stop();
                }
            }
        }, _callee7, this);
    })));

    it("issue_tokens", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8() {
        var apiCaller, charge;
        return _regenerator2.default.wrap(function _callee8$(_context8) {
            while (1) {
                switch (_context8.prev = _context8.next) {
                    case 0:
                        apiCaller = new EVT({
                            keyProvider: wif,
                            endpoint: network
                        });


                        testingTmpData.addedTokenNamePrefix = "tk" + new Date().valueOf() / 500;

                        _context8.next = 4;
                        return apiCaller.getEstimatedChargeForTransaction({ availablePublicKeys: [EVT.EvtKey.privateToPublic(wif), EVT.EvtKey.privateToPublic(wif2), EVT.EvtKey.privateToPublic(wif3)] }, new EVT.EvtAction("issuetoken", {
                            "domain": testingTmpData.newDomainName,
                            "names": [testingTmpData.addedTokenNamePrefix + "1", testingTmpData.addedTokenNamePrefix + "2", testingTmpData.addedTokenNamePrefix + "3"],
                            "owner": [Key.privateToPublic(wif)]
                        }));

                    case 4:
                        charge = _context8.sent;


                        assert(charge.charge && (0, _isInteger2.default)(charge.charge) && charge.charge > 0, "expected integer charge");

                        _context8.next = 8;
                        return apiCaller.pushTransaction(new EVT.EvtAction("issuetoken", {
                            "domain": testingTmpData.newDomainName,
                            "names": [testingTmpData.addedTokenNamePrefix + "1", testingTmpData.addedTokenNamePrefix + "2", testingTmpData.addedTokenNamePrefix + "3"],
                            "owner": [Key.privateToPublic(wif)]
                        }));

                    case 8:
                    case "end":
                        return _context8.stop();
                }
            }
        }, _callee8, this);
    })));

    it("new_fungible", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9() {
        var apiCaller, randomString;
        return _regenerator2.default.wrap(function _callee9$(_context9) {
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
                        return apiCaller.pushTransaction(new EVT.EvtAction("newfungible", {
                            sym: "5," + testingTmpData.newSymbol,
                            creator: publicKey,
                            issue: { name: "issue", threshold: 1, authorizers: [{ ref: "[A] " + publicKey, weight: 1 }] },
                            manage: { name: "manage", threshold: 1, authorizers: [{ ref: "[A] " + publicKey, weight: 1 }] },
                            total_supply: "100000.00000 " + testingTmpData.newSymbol
                        }));

                    case 5:
                        testingTmpData.newTrxId = _context9.sent.transactionId;

                    case 6:
                    case "end":
                        return _context9.stop();
                }
            }
        }, _callee9, this);
    })));
});

// ==== part 4: APICaller read API ====
describe("APICaller read API test", function () {
    // get evt chain version
    it("getInfo", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10() {
        var apiCaller, response;
        return _regenerator2.default.wrap(function _callee10$(_context10) {
            while (1) {
                switch (_context10.prev = _context10.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network
                        });
                        _context10.next = 3;
                        return apiCaller.getInfo();

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
        }, _callee10, this);
    })));

    it("getHeadBlockHeaderState", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11() {
        var apiCaller, response;
        return _regenerator2.default.wrap(function _callee11$(_context11) {
            while (1) {
                switch (_context11.prev = _context11.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network
                        });
                        _context11.next = 3;
                        return apiCaller.getHeadBlockHeaderState();

                    case 3:
                        response = _context11.sent;

                        assert(response.block_num, "expected block_num");

                    case 5:
                    case "end":
                        return _context11.stop();
                }
            }
        }, _callee11, this);
    })));

    it("getCreatedDomains", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12() {
        var apiCaller, response;
        return _regenerator2.default.wrap(function _callee12$(_context12) {
            while (1) {
                switch (_context12.prev = _context12.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });
                        _context12.next = 3;
                        return apiCaller.getCreatedDomains(publicKey);

                    case 3:
                        response = _context12.sent;

                        assert(Array.isArray(response), "expected array");
                        // TODO must have data (after creating domains)

                    case 5:
                    case "end":
                        return _context12.stop();
                }
            }
        }, _callee12, this);
    })));

    it("getManagedGroups", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13() {
        var apiCaller, response;
        return _regenerator2.default.wrap(function _callee13$(_context13) {
            while (1) {
                switch (_context13.prev = _context13.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });
                        _context13.next = 3;
                        return apiCaller.getManagedGroups(publicKey);

                    case 3:
                        response = _context13.sent;

                        assert(Array.isArray(response), "expected array");
                        // TODO must have data (after creating groups)

                    case 5:
                    case "end":
                        return _context13.stop();
                }
            }
        }, _callee13, undefined);
    })));

    it("getOwnedTokens", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14() {
        var apiCaller, response;
        return _regenerator2.default.wrap(function _callee14$(_context14) {
            while (1) {
                switch (_context14.prev = _context14.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });
                        _context14.next = 3;
                        return apiCaller.getOwnedTokens(publicKey);

                    case 3:
                        response = _context14.sent;

                        assert(Array.isArray(response), "expected array");
                        // TODO must have data (after having tokens)

                    case 5:
                    case "end":
                        return _context14.stop();
                }
            }
        }, _callee14, undefined);
    })));

    it("getActions", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee15() {
        var apiCaller, response;
        return _regenerator2.default.wrap(function _callee15$(_context15) {
            while (1) {
                switch (_context15.prev = _context15.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });
                        _context15.next = 3;
                        return apiCaller.getActions({
                            domain: testingTmpData.newDomainName,
                            skip: 0,
                            take: 10
                        });

                    case 3:
                        response = _context15.sent;

                        assert(Array.isArray(response), "expected array");

                    case 5:
                    case "end":
                        return _context15.stop();
                }
            }
        }, _callee15, undefined);
    })));

    it("getTransactionsDetailOfPublicKeys", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee16() {
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
                        return apiCaller.getTransactionsDetailOfPublicKeys("EVT85QEkmFpnDwR4NjnYenqenyCxFRQc45HwjGLNpXQQ1JuSmBzSj");

                    case 3:
                        response = _context16.sent;

                        // console.log("_____++++++++++++++++" + JSON.stringify(response, null, 4));

                        assert(Array.isArray(response), "expected array");
                        // TODO must have data (after creating transactions)

                    case 5:
                    case "end":
                        return _context16.stop();
                }
            }
        }, _callee16, undefined);
    })));

    it("getFungibleSymbolDetail", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee17() {
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
                        return apiCaller.getFungibleSymbolDetail("EVT");

                    case 3:
                        response = _context17.sent;

                        assert(response && response.sym, "expected response");
                        // TODO must have data (after creating symbol)

                    case 5:
                    case "end":
                        return _context17.stop();
                }
            }
        }, _callee17, undefined);
    })));

    it("getDomainDetail", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee18() {
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
                        return apiCaller.getDomainDetail(testingTmpData.newDomainName);

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
        }, _callee18, undefined);
    })));

    it("getGroupDetail", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee19() {
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
                        return apiCaller.getGroupDetail(testingTmpData.newGroupName);

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
        }, _callee19, undefined);
    })));

    it("getTransactionDetailById", function () {
        return new _promise2.default(function () {
            var _ref20 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee21(res, rej) {
                return _regenerator2.default.wrap(function _callee21$(_context21) {
                    while (1) {
                        switch (_context21.prev = _context21.next) {
                            case 0:
                                setTimeout((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee20() {
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
                                                    return apiCaller.getTransactionDetailById(testingTmpData.newTrxId);

                                                case 3:
                                                    response = _context20.sent;

                                                    assert(response.id, "expected id");

                                                    res();

                                                case 6:
                                                case "end":
                                                    return _context20.stop();
                                            }
                                        }
                                    }, _callee20, undefined);
                                })), 500);

                            case 1:
                            case "end":
                                return _context21.stop();
                        }
                    }
                }, _callee21, undefined);
            }));

            return function (_x, _x2) {
                return _ref20.apply(this, arguments);
            };
        }());
    });

    it("getFungibleBalance", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee22() {
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
                        return apiCaller.getFungibleBalance(publicKey);

                    case 3:
                        response = _context22.sent;

                        assert(Array.isArray(response), "expected array");
                        // TODO must have data (after creating transactions)

                    case 5:
                    case "end":
                        return _context22.stop();
                }
            }
        }, _callee22, undefined);
    })));

    it("getRequiredKeysForSuspendedTransaction", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee23() {
        var apiCaller;
        return _regenerator2.default.wrap(function _callee23$(_context23) {
            while (1) {
                switch (_context23.prev = _context23.next) {
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
                        return _context23.stop();
                }
            }
        }, _callee23, undefined);
    })));

    it("getSuspendedTransactionDetail", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee24() {
        var apiCaller;
        return _regenerator2.default.wrap(function _callee24$(_context24) {
            while (1) {
                switch (_context24.prev = _context24.next) {
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
                        return _context24.stop();
                }
            }
        }, _callee24, undefined);
    })));
});

// ==== part 5: EvtLink ====
describe("EvtLink", function () {
    var evtLink = EVT.EvtLink;

    it("b2base42", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee25() {
        var dec1, dec2, dec3;
        return _regenerator2.default.wrap(function _callee25$(_context25) {
            while (1) {
                switch (_context25.prev = _context25.next) {
                    case 0:
                        dec1 = evtLink.b2dec(new Buffer([0, 0, 0, 2, 41, 109, 0, 82, 0]));
                        dec2 = evtLink.b2dec(new Buffer([0]));
                        dec3 = evtLink.b2dec(new Buffer([]));


                        assert(dec1 === "000AD1KQVMO", "should produce right base42 " + dec1);
                        assert(dec2 === "0", "should produce right base42:" + dec2);
                        assert(dec3 === "", "should produce right base42:" + dec3);

                    case 6:
                    case "end":
                        return _context25.stop();
                }
            }
        }, _callee25, undefined);
    })));

    it("everiPass1", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee26() {
        var link, parsed;
        return _regenerator2.default.wrap(function _callee26$(_context26) {
            while (1) {
                switch (_context26.prev = _context26.next) {
                    case 0:
                        _context26.t0 = evtLink;
                        _context26.t1 = testingTmpData.newDomainName;
                        _context26.t2 = testingTmpData.addedTokenNamePrefix + "1";
                        _context26.t3 = [wif, wif2, wif3];
                        _context26.next = 6;
                        return evtLink.getUniqueLinkId();

                    case 6:
                        _context26.t4 = _context26.sent;
                        _context26.t5 = {
                            autoDestroying: true,
                            domainName: _context26.t1,
                            tokenName: _context26.t2,
                            keyProvider: _context26.t3,
                            linkId: _context26.t4
                        };
                        _context26.next = 10;
                        return _context26.t0.getEveriPassText.call(_context26.t0, _context26.t5);

                    case 10:
                        link = _context26.sent;
                        _context26.next = 13;
                        return evtLink.parseEvtLink(link.rawText);

                    case 13:
                        parsed = _context26.sent;


                        logger.verbose("[everiPass] " + link.rawText);
                        logger.verbose("[everiPass] \n" + (0, _stringify2.default)(parsed, null, 2));

                        assert(link.rawText, "should produce a EvtLink");
                        assert(parsed.segments.length === 4, "struct is wrong: " + parsed.segments.length);
                        assert(parsed.flag === 11, "flag is wrong: " + parsed.flag);
                        assert(parsed.publicKeys[0] === publicKey, "publicKey is wrong");

                    case 20:
                    case "end":
                        return _context26.stop();
                }
            }
        }, _callee26, undefined);
    })));

    it("everiPass2", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee27() {
        var link, parsed;
        return _regenerator2.default.wrap(function _callee27$(_context27) {
            while (1) {
                switch (_context27.prev = _context27.next) {
                    case 0:
                        _context27.t0 = evtLink;
                        _context27.t1 = testingTmpData.newDomainName;
                        _context27.t2 = testingTmpData.addedTokenNamePrefix + "1";
                        _context27.t3 = [wif];
                        _context27.next = 6;
                        return evtLink.getUniqueLinkId();

                    case 6:
                        _context27.t4 = _context27.sent;
                        _context27.t5 = {
                            autoDestroying: false,
                            domainName: _context27.t1,
                            tokenName: _context27.t2,
                            keyProvider: _context27.t3,
                            linkId: _context27.t4
                        };
                        _context27.next = 10;
                        return _context27.t0.getEveriPassText.call(_context27.t0, _context27.t5);

                    case 10:
                        link = _context27.sent;
                        _context27.next = 13;
                        return evtLink.parseEvtLink(link.rawText);

                    case 13:
                        parsed = _context27.sent;


                        logger.verbose("[everiPass] " + link.rawText);
                        logger.verbose("[everiPass] \n" + (0, _stringify2.default)(parsed, null, 2));

                        assert(link.rawText, "should produce a EvtLink");
                        assert(parsed.segments.length === 4, "struct is wrong: " + parsed.segments.length);
                        assert(parsed.flag === 3, "flag is wrong: " + parsed.flag);
                        assert(parsed.publicKeys[0] === publicKey, "publicKey is wrong");

                    case 20:
                    case "end":
                        return _context27.stop();
                }
            }
        }, _callee27, undefined);
    })));
});