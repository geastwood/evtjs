'use strict';

/* eslint-env mocha */
var assert = require('assert');
var fs = require('fs');
var EVT = require('.');

var _require = require('eosjs-keygen'),
    Keystore = _require.Keystore;

var ByteBuffer = require('bytebuffer');
var Fcbuffer = require('fcbuffer');
var Key = require("./key");

var wif = '5JgWJptxZENHR69oZsPSeVTXScRx7jYPMTjPTKAjW2JFnjEhoDZ';
var wif2 = '5KXxF69n5SsYSQRs8L855jKC5fqzT6uzRzJ1r686t2RRu9JQr9i';
var publicKey = EVT.EvtKey.privateToPublic(wif);

var network = {
    host: '118.31.58.10', // testnet1.everitoken.io
    port: 8888,
    protocol: 'http'
};

describe('version', function () {
    it('exposes a version number', function () {
        assert.ok(EVT.version);
    });
});

describe('EvtKey', function () {
    it('test ecc key generation', function _callee() {
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
                    case 'end':
                        return _context.stop();
                }
            }
        }, null, undefined);
    });

    it('test seed key generation', function _callee2() {
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


                        assert(key === '5J1by7KRQujRdXrurEsvEr2zQGcdPaMJRjewER6XsAR2eCcpt3D');
                        assert(publicKey === 'EVT6Qz3wuRjyN6gaU3P3XRxpnEZnM4oPxortemaWDwFRvsv2FxgND');

                    case 6:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, null, undefined);
    });

    it('test validKey', function _callee3() {
        return regeneratorRuntime.async(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        assert(EVT.EvtKey.isValidPrivateKey('5J1by7KRQujRdXrurEsvEr2zQGcdPaMJRjewER6XsAR2eCcpt3D'), 'should be a valid private');
                        assert(!EVT.EvtKey.isValidPrivateKey('5J1by7KRQujRdXrurEsvEr2zQGcdPaMJRjewER7XsAR2eCcpt3D'), 'should not be a valid private');
                        assert(EVT.EvtKey.isValidPublicKey('EVT6Qz3wuRjyN6gaU3P3XRxpnEZnM4oPxortemaWDwFRvsv2FxgND'), 'should be a valid public');
                        assert(!EVT.EvtKey.isValidPublicKey('EOS6Qz3wuRjyN6gaU3P3XRxpnEZnM4oPxortemaWDwFRvsv2FxgND'), 'should not be a valid public');
                        assert(!EVT.EvtKey.isValidPublicKey('EVT6Qz3wuRjyN6gaU3P3XRxpnEZnM4oPxortemaWDWFRvsv2FxgND'), 'should not be a valid public');

                    case 5:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, null, undefined);
    });
});

var randomName = function randomName() {
    var name = String(Math.round(Math.random() * 1000000000)).replace(/[0,6-9]/g, '');
    return 'a' + name + '111222333444'.substring(0, 11 - name.length); // always 12 in length
};

describe('APICaller test', function () {
    // get evt chain version
    it('getInfo', function _callee4() {
        var apiCaller, response;
        return regeneratorRuntime.async(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network
                        });
                        _context4.next = 3;
                        return regeneratorRuntime.awrap(apiCaller.getInfo());

                    case 3:
                        response = _context4.sent;

                        assert(response.evt_api_version, "expected evt_api_version");
                        assert(response.server_version, "expected server_version");
                        assert(response.last_irreversible_block_num, "expected last_irreversible_block_num");
                        assert(response.last_irreversible_block_id, "expected last_irreversible_block_id");
                        assert(response.chain_id, "expected chain_id");

                    case 9:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, null, this);
    });

    it('getCreatedDomainList', function _callee5() {
        var apiCaller, response;
        return regeneratorRuntime.async(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });
                        _context5.next = 3;
                        return regeneratorRuntime.awrap(apiCaller.getCreatedDomainList(publicKey));

                    case 3:
                        response = _context5.sent;

                        console.error(JSON.stringify(response, null, 4));
                        assert(Array.isArray(response), "expected array");

                    case 6:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, null, this);
    });

    it('getJoinedGroupList', function _callee6() {
        var apiCaller, response;
        return regeneratorRuntime.async(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });
                        _context6.next = 3;
                        return regeneratorRuntime.awrap(apiCaller.getJoinedGroupList('ctest2'));

                    case 3:
                        response = _context6.sent;

                        console.error(JSON.stringify(response, null, 4));
                        assert(Array.isArray(response), "expected array");

                    case 6:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, null, undefined);
    });

    it('getOwnedTokens', function _callee7() {
        var apiCaller, response;
        return regeneratorRuntime.async(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: network,
                            keyProvider: wif
                        });
                        _context7.next = 3;
                        return regeneratorRuntime.awrap(apiCaller.getOwnedTokens('ctest2'));

                    case 3:
                        response = _context7.sent;

                        console.error(JSON.stringify(response, null, 4));
                        assert(Array.isArray(response), "expected array");

                    case 6:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, null, undefined);
    });

    it('newdomain', function _callee8() {
        var apiCaller, newDomainName;
        return regeneratorRuntime.async(function _callee8$(_context8) {
            while (1) {
                switch (_context8.prev = _context8.next) {
                    case 0:
                        apiCaller = new EVT({
                            host: '192.168.1.104',
                            port: '8888',
                            keyProvider: [wif, wif2],
                            endpoint: network
                        });
                        newDomainName = "nd" + new Date().valueOf();
                        _context8.next = 4;
                        return regeneratorRuntime.awrap(apiCaller.pushTransaction({
                            transaction: {
                                actions: [{
                                    "action": "newdomain",
                                    "args": {
                                        "name": newDomainName,
                                        "issuer": "EVT7dwvuZfiNdTbo3aamP8jgq8RD4kzauNkyiQVjxLtAhDHJm9joQ",
                                        "issue": {
                                            "name": "issue",
                                            "threshold": 1,
                                            "authorizers": [{
                                                "ref": "[A] EVT7dwvuZfiNdTbo3aamP8jgq8RD4kzauNkyiQVjxLtAhDHJm9joQ",
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
                                                "ref": "[A] EVT8MGU4aKiVzqMtWi9zLpu8KuTHZWjQQrX475ycSxEkLd6aBpraX",
                                                "weight": 1
                                            }]
                                        }
                                    }
                                }]
                            }
                        }));

                    case 4:
                    case 'end':
                        return _context8.stop();
                }
            }
        }, null, this);
    });

    it('issue_tokens', function _callee9() {
        var apiCaller, newDomainName;
        return regeneratorRuntime.async(function _callee9$(_context9) {
            while (1) {
                switch (_context9.prev = _context9.next) {
                    case 0:
                        apiCaller = new EVT({
                            host: '192.168.1.104',
                            port: '8888',
                            keyProvider: [wif, wif2],
                            endpoint: network
                        });
                        newDomainName = "nd" + new Date().valueOf();
                        _context9.prev = 2;
                        _context9.next = 5;
                        return regeneratorRuntime.awrap(apiCaller.pushTransaction({
                            transaction: {
                                actions: [{
                                    "action": "issuetoken",
                                    "args": {
                                        "domain": "nd",
                                        "names": ["t1", "t2", "t3"],
                                        "owner": [Key.privateToPublic(wif)]
                                    }
                                }]
                            }
                        }));

                    case 5:
                        _context9.next = 9;
                        break;

                    case 7:
                        _context9.prev = 7;
                        _context9.t0 = _context9['catch'](2);

                    case 9:
                    case 'end':
                        return _context9.stop();
                }
            }
        }, null, this, [[2, 7]]);
    });

    it('new_group', function _callee10() {
        var apiCaller, newDomainName;
        return regeneratorRuntime.async(function _callee10$(_context10) {
            while (1) {
                switch (_context10.prev = _context10.next) {
                    case 0:
                        apiCaller = new EVT({
                            host: '192.168.1.104',
                            port: '8888',
                            keyProvider: wif,
                            endpoint: network
                        });
                        newDomainName = "nd" + new Date().valueOf();
                        _context10.prev = 2;
                        _context10.next = 5;
                        return regeneratorRuntime.awrap(apiCaller.pushTransaction({
                            transaction: {
                                actions: [{
                                    "action": "newgroup",
                                    "args": {
                                        "name": "testgroup",
                                        "group": {
                                            "name": "testgroup",
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
                                }]
                            }
                        }));

                    case 5:
                        _context10.next = 9;
                        break;

                    case 7:
                        _context10.prev = 7;
                        _context10.t0 = _context10['catch'](2);

                    case 9:
                    case 'end':
                        return _context10.stop();
                }
            }
        }, null, this, [[2, 7]]);
    });
});