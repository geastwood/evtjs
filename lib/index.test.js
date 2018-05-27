'use strict';

/* eslint-env mocha */
var assert = require('assert');
var fs = require('fs');

var Eos = require('.');
var ecc = Eos.modules.ecc;

var _require = require('eosjs-keygen'),
    Keystore = _require.Keystore;

var ByteBuffer = require('bytebuffer');
var Fcbuffer = require('fcbuffer');

var wif = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';

describe('version', function () {
    it('exposes a version number', function () {
        assert.ok(Eos.version);
    });
});

var randomName = function randomName() {
    var name = String(Math.round(Math.random() * 1000000000)).replace(/[0,6-9]/g, '');
    return 'a' + name + '111222333444'.substring(0, 11 - name.length); // always 12 in length
};

// get evt chain version
it('Test APICaller', function _callee() {
    var apiCaller, response;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    apiCaller = new Eos.APICaller({
                        host: '192.168.1.104',
                        port: '8888'
                    });
                    _context.next = 3;
                    return regeneratorRuntime.awrap(apiCaller.chainGetInfo());

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

it("Test Int32 Reverse", function () {
    var hash = new Buffer('000001156e04a8e761d1f918bd0926856883b96c032f1e70a001bef28c967cdd', 'hex');
    console.error(hash.readInt32BE(0) - 3 & 0xFFFF);
});

function swap32(val) {
    return (val & 0xFF) << 24 | (val & 0xFF00) << 8 | val >> 8 & 0xFF00 | val >> 24 & 0xFF;
}

it('Test APICaller AbiToBin', function _callee2() {
    var apiCaller, chainInfo, hash, numHex, last_irreversible_block_num, last_irreversible_block_prefix, expiration, rawTrx, response, binargs, pushedTrx, digest, buf, signBuf, sigs, pushResult;
    return regeneratorRuntime.async(function _callee2$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    apiCaller = new Eos.APICaller({
                        host: '192.168.1.104',
                        port: '8888',
                        keyProvider: '5HxQKWDznancXZXm7Gr2guadK7BhK9Zs8ejDhfA9oEBM89ZaAru'
                    });
                    _context2.next = 3;
                    return regeneratorRuntime.awrap(apiCaller.chainGetInfo());

                case 3:
                    chainInfo = _context2.sent;


                    //chainInfo.last_irreversible_block_id = '000003cdb5069f265390fd1f0003298fe502ed2437b71d6409f9aa750c8cde16';

                    hash = ByteBuffer.fromHex(chainInfo.last_irreversible_block_id, true); // little endian

                    numHex = chainInfo.last_irreversible_block_id.substr(4, 4);
                    last_irreversible_block_num = ByteBuffer.fromHex(numHex, false).readUint16(0);
                    last_irreversible_block_prefix = hash.readUInt32(8);


                    console.error("- block_id_hex: 0x" + chainInfo.last_irreversible_block_id);
                    console.error("- block_num_hex: 0x" + numHex);
                    console.error("- block_num_dec: " + last_irreversible_block_num);
                    console.error("- block_prefix_hex: 0x" + last_irreversible_block_prefix.toString(16));
                    console.error("- block_prefix_dec: " + last_irreversible_block_prefix);

                    expiration = new Date(new Date().valueOf() + 100000).toISOString().substr(0, 19);
                    rawTrx = {
                        "expiration": expiration,
                        "ref_block_num": last_irreversible_block_num,
                        "ref_block_prefix": last_irreversible_block_prefix,
                        "delay_sec": 0,
                        "actions": [{
                            "name": "newdomain",
                            "domain": "domain",
                            "key": "test",
                            "data": "000000000000000000000000109f077d0003c7e3ff0060d848bd31bf53daf1d5fed7d82c9b1121394ee15dcafb07e913a9700000000000a5317601000000010100000003c7e3ff0060d848bd31bf53daf1d5fed7d82c9b1121394ee15dcafb07e913a9706d4859000000000100000000572d3ccdcd010000000102000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000002866a69101000000010100000003c7e3ff0060d848bd31bf53daf1d5fed7d82c9b1121394ee15dcafb07e913a9706d4859000000000100"
                        }],
                        "transaction_extensions": []
                    };


                    console.error("rawTrx" + JSON.stringify(rawTrx));

                    _context2.next = 18;
                    return regeneratorRuntime.awrap(apiCaller.chainAbiJsonToBin({
                        "action": "newdomain",
                        "args": {
                            "name": "test",
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
                    }));

                case 18:
                    response = _context2.sent;


                    assert(response.binargs, "expect binargs");
                    binargs = response.binargs;

                    // sign
                    //const Structs = require('./structs')
                    //const Fcbuffer = require('fcbuffer')

                    pushedTrx = {
                        "compression": "none",
                        "transaction": {
                            "expiration": expiration,
                            "ref_block_num": last_irreversible_block_num,
                            "ref_block_prefix": last_irreversible_block_prefix,
                            "delay_sec": 0,
                            "actions": [{
                                "name": "newdomain",
                                "domain": "domain",
                                "key": "test",
                                "data": binargs
                            }],
                            "transaction_extensions": []
                        }
                    };
                    _context2.next = 24;
                    return regeneratorRuntime.awrap(apiCaller.getDigestToSign(pushedTrx));

                case 24:
                    digest = _context2.sent;


                    // part2
                    buf = new Buffer(binargs, 'hex');

                    // combine

                    signBuf = Buffer.concat([chainIdBuf, buf]);

                    // sign

                    _context2.next = 29;
                    return regeneratorRuntime.awrap(apiCaller.signTransaction(signBuf, rawTrx));

                case 29:
                    sigs = _context2.sent;


                    if (!Array.isArray(sigs)) {
                        sigs = [sigs];
                    }

                    pushedTrx.signatures = sigs;

                    // push_transaction
                    console.error(JSON.stringify(pushedTrx, null, 4));
                    _context2.next = 35;
                    return regeneratorRuntime.awrap(apiCaller.chainPushTransaction(pushedTrx));

                case 35:
                    pushResult = _context2.sent;


                    console.error(JSON.stringify(pushResult, null, 4));

                    pushedTrx.available_keys = ['EVT7dwvuZfiNdTbo3aamP8jgq8RD4kzauNkyiQVjxLtAhDHJm9joQ'];
                    _context2.next = 40;
                    return regeneratorRuntime.awrap(apiCaller.chainGetRequiredKeys(pushedTrx));

                case 40:
                    pushResult = _context2.sent;


                    console.error(JSON.stringify(pushResult, null, 4));

                case 42:
                case 'end':
                    return _context2.stop();
            }
        }
    }, null, this);
});