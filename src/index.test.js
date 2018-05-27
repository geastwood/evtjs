/* eslint-env mocha */
const assert = require('assert')
const fs = require('fs')

const Eos = require('.')
const { ecc } = Eos.modules
const { Keystore } = require('eosjs-keygen')
const ByteBuffer = require('bytebuffer')
const Fcbuffer = require('fcbuffer')

const wif = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3'

describe('version', () => {
    it('exposes a version number', () => {
        assert.ok(Eos.version)
    })
})

const randomName = () => {
    const name = String(Math.round(Math.random() * 1000000000)).replace(/[0,6-9]/g, '')
    return 'a' + name + '111222333444'.substring(0, 11 - name.length) // always 12 in length
}

// get evt chain version
it('Test APICaller', async function () {
    const apiCaller = new Eos.APICaller({
        host: '192.168.1.104',
        port: '8888'
    });

    var response = await apiCaller.chainGetInfo();
    assert(response.evt_api_version, "expect evt_api_version");
});

it("Test Int32 Reverse", function() {
    var hash = new Buffer('000001156e04a8e761d1f918bd0926856883b96c032f1e70a001bef28c967cdd', 'hex');
    console.error((hash.readInt32BE(0) - 3) & 0xFFFF);
})

function swap32(val) {
    return ((val & 0xFF) << 24)
           | ((val & 0xFF00) << 8)
           | ((val >> 8) & 0xFF00)
           | ((val >> 24) & 0xFF);
}

it('Test APICaller AbiToBin', async function () {
    const apiCaller = new Eos.APICaller({
        host: '192.168.1.104',
        port: '8888',
        keyProvider: '5HxQKWDznancXZXm7Gr2guadK7BhK9Zs8ejDhfA9oEBM89ZaAru'
    });

    var chainInfo = await apiCaller.chainGetInfo();


    //chainInfo.last_irreversible_block_id = '000003cdb5069f265390fd1f0003298fe502ed2437b71d6409f9aa750c8cde16';

    var hash = ByteBuffer.fromHex(chainInfo.last_irreversible_block_id, true); // little endian
    var numHex = chainInfo.last_irreversible_block_id.substr(4, 4);
    var last_irreversible_block_num = ByteBuffer.fromHex(numHex, false).readUint16(0);
    var last_irreversible_block_prefix = hash.readUInt32(8);

    console.error("- block_id_hex: 0x" + chainInfo.last_irreversible_block_id);
    console.error("- block_num_hex: 0x" + numHex);
    console.error("- block_num_dec: " + last_irreversible_block_num);
    console.error("- block_prefix_hex: 0x" + last_irreversible_block_prefix.toString(16));
    console.error("- block_prefix_dec: " + last_irreversible_block_prefix);

    var expiration = (new Date(new Date().valueOf() + 100000)).toISOString().substr(0, 19);
    var rawTrx = {
        "expiration": expiration,
        "ref_block_num": last_irreversible_block_num,
        "ref_block_prefix": last_irreversible_block_prefix,
        "delay_sec": 0,
        "actions": [
            {
                "name": "newdomain",
                "domain": "domain",
                "key": "test",
                "data": "000000000000000000000000109f077d0003c7e3ff0060d848bd31bf53daf1d5fed7d82c9b1121394ee15dcafb07e913a9700000000000a5317601000000010100000003c7e3ff0060d848bd31bf53daf1d5fed7d82c9b1121394ee15dcafb07e913a9706d4859000000000100000000572d3ccdcd010000000102000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000002866a69101000000010100000003c7e3ff0060d848bd31bf53daf1d5fed7d82c9b1121394ee15dcafb07e913a9706d4859000000000100"
            }
        ],
        "transaction_extensions": []
    };

    console.error("rawTrx" + JSON.stringify(rawTrx));

    var response = await apiCaller.chainAbiJsonToBin({
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
    });

    assert(response.binargs, "expect binargs");
    var binargs = response.binargs;

    // sign
    //const Structs = require('./structs')
    //const Fcbuffer = require('fcbuffer')

    var pushedTrx = {
        "compression": "none",
        "transaction": {
            "expiration": expiration,
            "ref_block_num": last_irreversible_block_num,
            "ref_block_prefix": last_irreversible_block_prefix,
            "delay_sec": 0,
            "actions": [
                {
                    "name": "newdomain",
                    "domain": "domain",
                    "key": "test",
                    "data": binargs
                }
            ],
            "transaction_extensions": []
        }
    };

    console.log("Request for digest:\n" + JSON.stringify(pushedTrx.transaction, null, 4));
    var digest = (await apiCaller.getDigestToSign(pushedTrx.transaction)).digest;
    digest = '3318094f6271fb97269fb1fea61599d150316563d4d1b3735ebcb1c3e6ee9e4a';

    console.log("=== degest: " + digest);
    const signBuf = new Buffer(digest, 'hex');

    // sign
    let sigs = await apiCaller.signTransaction(signBuf, rawTrx);

    if (!Array.isArray(sigs)) {
        sigs = [ sigs ]
    }
    
    pushedTrx.signatures = sigs;

    // push_transaction
    console.error(JSON.stringify(pushedTrx, null, 4));
    var pushResult = await apiCaller.chainPushTransaction(pushedTrx);

    console.error(JSON.stringify(pushResult, null, 4));

    pushedTrx.available_keys = [ 'EVT7dwvuZfiNdTbo3aamP8jgq8RD4kzauNkyiQVjxLtAhDHJm9joQ' ];
    var pushResult = await apiCaller.chainGetRequiredKeys(pushedTrx);

    console.error(JSON.stringify(pushResult, null, 4));
});
