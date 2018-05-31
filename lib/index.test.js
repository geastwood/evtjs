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

var wif = '5HxQKWDznancXZXm7Gr2guadK7BhK9Zs8ejDhfA9oEBM89ZaAru';

describe('version', function () {
    it('exposes a version number', function () {
        assert.ok(EVT.version);
    });
});

var randomName = function randomName() {
    var name = String(Math.round(Math.random() * 1000000000)).replace(/[0,6-9]/g, '');
    return 'a' + name + '111222333444'.substring(0, 11 - name.length); // always 12 in length
};

describe('APICaller test', function () {
    // get evt chain version
    it('getInfo', function _callee() {
        var apiCaller, response;
        return regeneratorRuntime.async(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        apiCaller = EVT({
                            endpoint: {
                                host: '192.168.1.104'
                            }
                        });
                        _context.next = 3;
                        return regeneratorRuntime.awrap(apiCaller.getInfo());

                    case 3:
                        response = _context.sent;

                        assert(response.evt_api_version, "expect evt_api_version");

                    case 5:
                    case 'end':
                        return _context.stop();
                }
            }
        }, null, this);
    });

    /*it('getAccount', async () => {
        const apiCaller = EVT({
            endpoint: {
                host: '192.168.1.104'
            }
        });
         await apiCaller.getAccount("test");
    });*/

    it('newAccount', function _callee2() {
        var apiCaller;
        return regeneratorRuntime.async(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        apiCaller = EVT({
                            host: '192.168.1.104',
                            port: '8888',
                            keyProvider: wif,
                            endpoint: {
                                host: '192.168.1.104'
                            }
                        });
                        _context2.prev = 1;
                        _context2.t0 = console;
                        _context2.t1 = JSON;
                        _context2.next = 6;
                        return regeneratorRuntime.awrap(apiCaller.pushTransaction({
                            transaction: {
                                actions: [{
                                    "action": "newaccount",
                                    "args": {
                                        "name": 'test',
                                        "owner": [Key.privateToPublic(wif)]
                                    }
                                }]
                            }
                        }));

                    case 6:
                        _context2.t2 = _context2.sent;
                        _context2.t3 = _context2.t1.stringify.call(_context2.t1, _context2.t2);

                        _context2.t0.log.call(_context2.t0, _context2.t3);

                        _context2.next = 13;
                        break;

                    case 11:
                        _context2.prev = 11;
                        _context2.t4 = _context2['catch'](1);

                    case 13:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, null, undefined, [[1, 11]]);
    });

    it('newdomain', function _callee3() {
        var apiCaller, newDomainName;
        return regeneratorRuntime.async(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        apiCaller = new EVT({
                            host: '192.168.1.104',
                            port: '8888',
                            keyProvider: wif,
                            endpoint: {
                                host: '192.168.1.104'
                            }
                        });
                        newDomainName = "nd" + new Date().valueOf();
                        _context3.next = 4;
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
                        return _context3.stop();
                }
            }
        }, null, this);
    });

    it('issue_tokens', function _callee4() {
        var apiCaller, newDomainName;
        return regeneratorRuntime.async(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        apiCaller = new EVT({
                            host: '192.168.1.104',
                            port: '8888',
                            keyProvider: wif,
                            endpoint: {
                                host: '192.168.1.104'
                            }
                        });
                        newDomainName = "nd" + new Date().valueOf();
                        _context4.prev = 2;
                        _context4.next = 5;
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
                        _context4.next = 9;
                        break;

                    case 7:
                        _context4.prev = 7;
                        _context4.t0 = _context4['catch'](2);

                    case 9:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, null, this, [[2, 7]]);
    });

    it('new_group', function _callee5() {
        var apiCaller, newDomainName;
        return regeneratorRuntime.async(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        apiCaller = new EVT({
                            host: '192.168.1.104',
                            port: '8888',
                            keyProvider: wif,
                            endpoint: {
                                host: '192.168.1.104'
                            }
                        });
                        newDomainName = "nd" + new Date().valueOf();
                        _context5.prev = 2;
                        _context5.next = 5;
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
                        _context5.next = 9;
                        break;

                    case 7:
                        _context5.prev = 7;
                        _context5.t0 = _context5['catch'](2);

                    case 9:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, null, this, [[2, 7]]);
    });
});