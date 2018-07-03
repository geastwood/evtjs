/* eslint-env mocha */
const assert = require('assert')
const fs = require('fs')
const EVT = require('.')
const { Keystore } = require('eosjs-keygen')
const ByteBuffer = require('bytebuffer')
const Fcbuffer = require('fcbuffer')
const Key = require("./key")

const wif = '5JgWJptxZENHR69oZsPSeVTXScRx7jYPMTjPTKAjW2JFnjEhoDZ'
const wif2 = '5KXxF69n5SsYSQRs8L855jKC5fqzT6uzRzJ1r686t2RRu9JQr9i'
const publicKey = EVT.EvtKey.privateToPublic(wif);
var newDomainName = null;

const network = {
    host: 'testnet1.everitoken.io',
    port: 8888,
    protocol: 'https'
};

// ==== part 1: version ====
describe('version', () => {
    it('exposes a version number', () => {
        assert.ok(EVT.version)
    })
});

// ==== part 2: EvtKey ====
describe('EvtKey', () => {
    it('test ecc key generation', async () => {
        let key = await EVT.EvtKey.randomPrivateKey();
        let publicKey = EVT.EvtKey.privateToPublic(key);

        assert(publicKey.startsWith("EVT"), "expected publicKey starting with EVT");
    })

    it('test seed key generation', async () => {
        let key = await EVT.EvtKey.seedPrivateKey("seed");
        let publicKey = EVT.EvtKey.privateToPublic(key);

        assert(key === '5J1by7KRQujRdXrurEsvEr2zQGcdPaMJRjewER6XsAR2eCcpt3D');
        assert(publicKey === 'EVT6Qz3wuRjyN6gaU3P3XRxpnEZnM4oPxortemaWDwFRvsv2FxgND');
    })

    it('test validKey', async () => {
        assert(EVT.EvtKey.isValidPrivateKey('5J1by7KRQujRdXrurEsvEr2zQGcdPaMJRjewER6XsAR2eCcpt3D'), 'should be a valid private');
        assert(!EVT.EvtKey.isValidPrivateKey('5J1by7KRQujRdXrurEsvEr2zQGcdPaMJRjewER7XsAR2eCcpt3D'), 'should not be a valid private');
        assert(EVT.EvtKey.isValidPublicKey('EVT76uLwUD5t6fkob9Rbc9UxHgdTVshNceyv2hmppw4d82j2zYRpa'), 'should be a valid public');
        assert(!EVT.EvtKey.isValidPublicKey('EOS6Qz3wuRjyN6gaU3P3XRxpnEZnM4oPxortemaWDwFRvsv2FxgND'), 'should not be a valid public');
        assert(!EVT.EvtKey.isValidPublicKey('EVT6Qz3wuRjyN6gaU3P3XRxpnEZnM4oPxortemaWDWFRvsv2FxgND'), 'should not be a valid public');
    })
})

const randomName = () => {
    const name = String(Math.round(Math.random() * 1000000000)).replace(/[0,6-9]/g, '')
    return 'a' + name + '111222333444'.substring(0, 11 - name.length) // always 12 in length
}

// ==== part 3: APICaller read API ====
describe('APICaller read API test', () => {
    // get evt chain version
    it('getInfo', async function () {
        const apiCaller = EVT({
            endpoint: network
        });

        var response = await apiCaller.getInfo();
        assert(response.evt_api_version, "expected evt_api_version");
        assert(response.evt_api_version === "2.0.0", "unexpected evt_api_version");
        assert(response.server_version, "expected server_version");
        assert(response.last_irreversible_block_num, "expected last_irreversible_block_num");
        assert(response.last_irreversible_block_id, "expected last_irreversible_block_id");
        assert(response.chain_id, "expected chain_id");
    });

    it('getCreatedDomains', async function () {
        const apiCaller = EVT({
            endpoint: network,
            keyProvider: wif
        });

        var response = await apiCaller.getCreatedDomains(publicKey);
        assert(Array.isArray(response), "expected array");
        // TODO must have data (after creating domains)
    });

    it('getManagedGroups', async () => {
        const apiCaller = EVT({
            endpoint: network,
            keyProvider: wif
        });

        var response = await apiCaller.getManagedGroups(publicKey);
        assert(Array.isArray(response), "expected array");
        // TODO must have data (after creating groups)
    });

    it('getOwnedTokens', async () => {
        const apiCaller = EVT({
            endpoint: network,
            keyProvider: wif
        });

        var response = await apiCaller.getOwnedTokens(publicKey);
        assert(Array.isArray(response), "expected array");
        // TODO must have data (after having tokens)
    });

    it('getActionsOfDomains', async () => {
        const apiCaller = EVT({
            endpoint: network,
            keyProvider: wif
        });

        var response = await apiCaller.getActionsOfDomains({
            domain: 'haha'
        });
        assert(Array.isArray(response), "expected array");
        // TODO must have data (after having tokens)
    });

    it('getTransactionDetailById', async () => {
        const apiCaller = EVT({
            endpoint: network,
            keyProvider: wif
        });

        var response = await apiCaller.getTransactionDetailById("f0c789933e2b381e88281e8d8e750b561a4d447725fb0eb621f07f219fe2f738");
        assert(response.id, "expected id");
        // TODO must have data (after creating transactions)
    });

    it('getTransactionsDetailOfPublicKeys', async () => {
        const apiCaller = EVT({
            endpoint: network,
            keyProvider: wif
        });

        var response = await apiCaller.getTransactionsDetailOfPublicKeys(publicKey);
        assert(Array.isArray(response), "expected array");
        // TODO must have data (after creating transactions)
    });

    it('getFungibleSymbolDetail', async () => {
        const apiCaller = EVT({
            endpoint: network,
            keyProvider: wif
        });

        var response = await apiCaller.getFungibleSymbolDetail('EVT');
        console.log(response);
        assert(Array.isArray(response), "expected array");
        // TODO must have data (after creating symbol)
    });

    it('getDomainDetail', async () => {
        const apiCaller = EVT({
            endpoint: network,
            keyProvider: wif
        });

        var response = await apiCaller.getDomainDetail('EVT');
        console.log(response);
        assert(response && response.issuer, "expected response");
        // TODO must have data (after creating symbol)
    });

    it('getGroupDetail', async () => {
        const apiCaller = EVT({
            endpoint: network,
            keyProvider: wif
        });

        var response = await apiCaller.getGroupDetail('testgroup');
        console.log(response);
        assert(response && response.root, "expected response");
        // TODO must have data (after creating symbol)
    });
});

// ==== part 4: APICaller write API ====
describe('APICaller write API test', () => {
    it('newdomain', async function () {
        const apiCaller = new EVT({
            keyProvider: [ wif, wif2 ],
            endpoint: network
        });

        newDomainName = "nd" + (new Date()).valueOf();

        await apiCaller.pushTransaction({
            transaction: {
                actions: [
                    {
                        "action": "newdomain",
                        "args": {
                            "name": newDomainName,
                            "issuer": "EVT8MGU4aKiVzqMtWi9zLpu8KuTHZWjQQrX475ycSxEkLd6aBpraX",
                            "issue": {
                                "name": "issue1",
                                "threshold": 1,
                                "authorizers": [{
                                    "ref": "[A] EVT8MGU4aKiVzqMtWi9zLpu8KuTHZWjQQrX475ycSxEkLd6aBpraX",
                                    "weight": 1
                                }]
                            },
                            "transfer": {
                                "name": "transfer1",
                                "threshold": 1,
                                "authorizers": [{
                                    "ref": "[G] OWNER",
                                    "weight": 1
                                }]
                            },
                            "manage": {
                                "name": "manage1",
                                "threshold": 1,
                                "authorizers": [{
                                    "ref": "[A] EVT8MGU4aKiVzqMtWi9zLpu8KuTHZWjQQrX475ycSxEkLd6aBpraX",
                                    "weight": 1
                                }]
                            }
                        }
                    }
                ]
            }
        });

        let res = await apiCaller.getDomainDetail(newDomainName);
        assert(res.name === newDomainName, "expected right domain name");
    });

    it('issue_tokens', async function () {
        const apiCaller = new EVT({
            host: '192.168.1.104',
            port: '8888',
            keyProvider: [ wif, wif2 ],
            endpoint: network
        });

        var newDomainName = "nd" + (new Date()).valueOf();

        try {
            await apiCaller.pushTransaction({
                transaction: {
                    actions: [
                        {
                            "action": "issuetoken",
                            "args": {
                                "domain": "nd",
                                "names": [
                                    "t1",
                                    "t2",
                                    "t3"
                                ],
                                "owner": [
                                    Key.privateToPublic(wif)
                                ]
                            }
                        }
                    ]
                }
            });
        }
        catch (e) { }
    });

    it('new_group', async function () {
        const apiCaller = new EVT({
            host: '192.168.1.104',
            port: '8888',
            keyProvider: wif,
            endpoint: network
        });

        var newDomainName = "nd" + (new Date()).valueOf();

        try {
            await apiCaller.pushTransaction({
                transaction: {
                    actions: [
                        {
                            "action": "newgroup",
                            "args": {
                                "name": "testgroup",
                                "group": {
                                    "name": "testgroup",
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
                            }
                        }
                    ]
                }
            });
        }
        catch (e) { }
    });
});
