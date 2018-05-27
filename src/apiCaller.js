const defaultConfig = {
    host: '',
    port: 8888,
    protocol: 'http'
};

const ecc = require('eosjs-ecc')
const { signHash, verifyHash } = ecc
const AbiCache = require('./abi-cache')
const AssetCache = require('./asset-cache')


/**
 * 
 * APICaller for everiToken
*/
class APICaller {
    /**
     * Creates a new APICaller.
     * @param {*} config 
     */
    constructor(config) {
        this.config = defaultConfig;
        this.config = Object.assign(this.config, config);

        if (!this.config.signProvider) {
            this.config.signProvider = defaultSignProvider(this, this.config);
        }

        /*const Network = 

        const network = Network(Object.assign({}, {
            apiLog: consoleObjCallbackLog(this.config.verbose)},
            config: this.config
          ));*/

        this.config.assetCache = AssetCache(null)
        this.config.abiCache = AbiCache(null, this.config)

        var buffer = new Buffer(32).fill(0, 0, 32);
        this.config.signProvider({sign: signHash, buf: buffer, transaction: {}});
    }

    /**
     * Call everiToken APIs directly, not suggested to use by user
     * @param {*} request 
     */
    async callAPI(request) {
        var url = this.config.protocol + "://" + this.config.host + ":" + this.config.port + request.url;

        var res = await fetch(url, {
            method: request.method,
            body: JSON.stringify(request.body || "") || undefined,
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        });
        
        return (await res.json());
    }

    chainGetInfo() {
        return this.callAPI({
            url: "/v1/chain/get_info",
            method: "GET"
        });
    }

    chainAbiJsonToBin(abi) {
        return this.callAPI({
            url: "/v1/chain/abi_json_to_bin",
            method: "POST",
            body: abi
        });
    }

    signTransaction(buf, transaction) {
        return this.config.signProvider({signHash, buf, transaction});
    }

    getDigestToSign(transaction) {
        return this.callAPI({
            url: "/v1/chain/trx_json_to_digest",
            method: "POST",
            body: transaction
        });
    }

    chainPushTransaction(tr) {
        return this.callAPI({
            url: "/v1/chain/push_transaction",
            method: "POST",
            body: tr
        });
    }

    chainGetRequiredKeys(tr) {
        return this.callAPI({
            url: "/v1/chain/get_required_keys",
            method: "POST",
            body: tr
        });
    }
}

/**
  The default sign provider is designed to interact with the available public
  keys (maybe just one), the transaction, and the blockchain to figure out
  the minimum set of signing keys.

  If only one key is available, the blockchain API calls are skipped and that
  key is used to sign the transaction.
*/
const defaultSignProvider = (apiCaller, config) => async function ({ sign, buf, transaction }) {
    const { keyProvider } = config

    if (!keyProvider) {
        throw new TypeError('This transaction requires a config.keyProvider for signing')
    }

    let keys = keyProvider
    if (typeof keyProvider === 'function') {
        keys = keyProvider({ transaction })
    }

    // keyProvider may return keys or Promise<keys>
    keys = await Promise.resolve(keys)

    if (!Array.isArray(keys)) {
        keys = [keys]
    }

    keys = keys.map(key => {
        try {
            // normalize format (WIF => PVT_K1_base58privateKey)
            return { private: ecc.PrivateKey(key).toString() }
        } catch (e) {
            // normalize format (EOSKey => PUB_K1_base58publicKey)
            return { public: ecc.PublicKey(key).toString() }
        }
        assert(false, 'expecting public or private keys from keyProvider')
    })

    if (!keys.length) {
        throw new Error('missing key, check your keyProvider')
    }

    // simplify default signing #17
    if (keys.length === 1 && keys[0].private) {
        const pvt = keys[0].private
        var ret = signHash(buf, pvt)
        
        console.log("sign result:" + ret);

        console.log("verify: ===============================" + verifyHash(ret, buf, ecc.privateToPublic(pvt)));
        return ret;
    }

    const keyMap = new Map()

    // keys are either public or private keys
    for (const key of keys) {
        const isPrivate = key.private != null
        const isPublic = key.public != null

        if (isPrivate) {
            keyMap.set(ecc.privateToPublic(key.private), key.private)
        } else {
            keyMap.set(key.public, null)
        }
    }

    const pubkeys = Array.from(keyMap.keys())

    /*return eos.getRequiredKeys(transaction, pubkeys).then(({ required_keys }) => {
        if (!required_keys.length) {
            throw new Error('missing required keys for ' + JSON.stringify(transaction))
        }*/

        const pvts = [], missingKeys = []

        required_keys = pubkeys[0]; // assume that we need only the first key, will be changed in the future TODO

        for (let requiredKey of required_keys) {
            // normalize (EOSKey.. => PUB_K1_Key..)
            requiredKey = ecc.PublicKey(requiredKey).toString()

            const wif = keyMap.get(requiredKey)
            if (wif) {
                pvts.push(wif)
            } else {
                missingKeys.push(requiredKey)
            }
        }

        if (missingKeys.length !== 0) {
            assert(typeof keyProvider === 'function',
                'keyProvider function is needed for private key lookup')

            // const pubkeys = missingKeys.map(key => ecc.PublicKey(key).toStringLegacy())
            keyProvider({ pubkeys: missingKeys })
                .forEach(pvt => { pvts.push(pvt) })
        }

        const sigs = []
        for (const pvt of pvts) {
            sigs.push(signHash(buf, pvt))
        }

        return sigs
    //})
}
  

module.exports = { APICaller };
