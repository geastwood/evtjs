const ecc = require("eosjs-ecc");
const { signHash } = ecc;
const EvtConfig = require("./evtConfig");
const { fetch } = require("./fetch");
const ByteBuffer = require("bytebuffer");
const EvtAction = require("./action");

/**
 * APICaller for everiToken
*/
class APICaller {
    /**
     * Creates a new APICaller.
     * @param {EvtConfig} config 
     */
    constructor(config) {
        config = config || new EvtConfig();
        if (typeof config == "object" && config != null && !(config instanceof EvtConfig)) {
            config = new EvtConfig(config);
        }

        /** @member {EvtConfig} evtConfig */
        this.config = config || new EvtConfig();

        if (!this.config.signProvider) {
            this.config.signProvider = defaultSignProvider(this, this.config);
        }

        // var buffer = new Buffer(32).fill(0, 0, 32);
        // this.config.signProvider({sign: signHash, buf: buffer, transaction: {}});
    }

    /**
     * Call everiToken APIs directly, not suggested to use by user
     * @param {*} request 
     */
    async __callAPI(request) {
        var url = this.config.endpoint.protocol + "://" + this.config.endpoint.host + ":" + this.config.endpoint.port + request.url;

        request.sign = request.sign == undefined ? true : request.sign;

        if (request.sign && request.__fixedSignature) {
            // add signature
            const signBuf = Buffer.from("2800f0f3f88ce2b4a8c6ce4c20a91f5a7e3647fa73894e9d2bc4cc61b6bda1be", "hex");
            let sigs = await this.__signTransaction(signBuf, request.body || { }, request.__fixedKeyToUse);

            if (!Array.isArray(sigs)) {
                sigs = [ sigs ];
            }
            
            request.body = request.body || { };
            request.body.signatures = sigs;
        }

        // console.log("fetch: " + url);
        // console.log("fetch: " + JSON.stringify(request, null, 4));

        var res = await fetch(url, {
            method: request.method,
            body: request.body ? JSON.stringify(request.body) : undefined,
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        let ret = await res.json();

        if (ret && ret.code && ret.message && ret.error) {
            //console.error("————————request sent: " + JSON.stringify(request, null, 4));
            this.__throwServerResponseError(ret);
        }
        if (!ret) {
            throw new Error("No response or not a valid json from http server");
        }

        return ret;
    }

    /**
     * get information from everiToken chain node
     */
    async getInfo() {
        var info = await this.__callAPI({
            url: "/v1/chain/get_info",
            method: "GET"
        });

        this.__cachedInfo = info;

        // check version of remote net
        if (!info.evt_api_version.startsWith("2.")) {
            throw new Error("The API version of remote net is not compatible with current evtjs's version.");
        }

        return info;
    }

    /**
     * get domain list a user created, make sure you have history_plugin enabled on the chain node
     * @param {*} publicKeys a array or a single value which represents public keys you want to query
     */
    async getCreatedDomains(publicKeys) {
        let res = await this.__callAPI({
            url: "/v1/history/get_domains",
            method: "POST",
            body: {
                keys: Array.isArray(publicKeys) ? publicKeys : [ publicKeys ]
            },
            sign: false // no need to sign
        });

        if (Array.isArray(res)) {
            return res.map(x => { return { name: x }; });
        }
        else {
            this.__throwServerResponseError(res);
        }
    }

    /**
     * get a list of groups, each group in it must has a group key which is contained by provided public keys. Make sure you have history_plugin enabled on the chain node
     * @param {*} publicKeys a array or a single value which represents public keys you want to query
     */
    async getManagedGroups(publicKeys) {
        let res = await this.__callAPI({
            url: "/v1/history/get_groups",
            method: "POST",
            body: {
                keys: Array.isArray(publicKeys) ? publicKeys : [ publicKeys ]
            },
            sign: false // no need to sign
        });

        if (Array.isArray(res)) {
            return res.map(x => { return { name: x }; });
        }
        else {
            this.__throwServerResponseError(res);
        }
    }

    /**
     * get owned token list for accounts. Make sure you have history_plugin enabled on the chain node
     * @param {*} publicKeys a array or a single value which represents public keys you want to query
     */
    async getOwnedTokens(publicKeys) {
        let res = await this.__callAPI({
            url: "/v1/history/get_tokens",
            method: "POST",
            body: {
                keys: Array.isArray(publicKeys) ? publicKeys : [ publicKeys ]
            },
            sign: false // no need to sign
        });

        if (Array.isArray(res)) {
            return res.map(x => { return { name: x.substr(x.lastIndexOf("-") + 1), domain: x.substr(0, x.lastIndexOf("-")) }; });
        }
        else {
            this.__throwServerResponseError(res);
        }
    }

    /**
     * Query actions by domain, key and action names. Make sure you have history_plugin enabled on the chain node
     * @param {*} params
     */
    async getActionsOfDomains(params) {
        if (typeof params !== "object") throw new Error("invalid params");
        if (!params || !params.domain) throw new Error("invalid params: domain is required");

        let res = await this.__callAPI({
            url: "/v1/history/get_actions",
            method: "POST",
            body: params,
            sign: false // no need to sign
        });

        if (Array.isArray(res)) {
            return res;
        }
        else {
            this.__throwServerResponseError(res);
        }
    }

    /**
     * get detail information about a transaction by its id. Make sure you have history_plugin enabled on the chain node
     * @param {*} id the id of the transaction
     */
    async getTransactionDetailById(id) {
        if (typeof id !== "string" || !id) throw new Error("invalid transaction id");

        let res = await this.__callAPI({
            url: "/v1/history/get_transaction",
            method: "POST",
            body: { id },
            sign: false // no need to sign
        });

        if (res && res.id && res.transaction) {
            return res;
        }
        else {
            this.__throwServerResponseError(res);
        }
    }

    /**
     * get detail information about a domain by its name. Make sure you have history_plugin enabled on the chain node
     * @param {*} name the name of the domain
     */
    async getDomainDetail(name) {
        if (typeof name !== "string" || !name) throw new Error("invalid domain name");

        let res = await this.__callAPI({
            url: "/v1/evt/get_domain",
            method: "POST",
            body: { name },
            sign: false // no need to sign
        });

        if (res && res.name && res.creator) {
            return res;
        }
        else {
            this.__throwServerResponseError(res);
        }
    }

    /**
     * get detail information about a group by its name. Make sure you have history_plugin enabled on the chain node
     * @param {*} name the name of the group
     */
    async getGroupDetail(name) {
        if (typeof name !== "string" || !name) throw new Error("invalid group name");

        let res = await this.__callAPI({
            url: "/v1/evt/get_group",
            method: "POST",
            body: { name },
            sign: false // no need to sign
        });

        if (res && res.name && res.root) {
            return res;
        }
        else {
            this.__throwServerResponseError(res);
        }
    }

    /**
     * get detail information about a transaction by its id. Make sure you have history_plugin enabled on the chain node
     * @param {string[]} publicKeys a single value or a array of public keys to query (required)
     * @param {number} skip the count to be skipped, default to 0 (optional)
     * @param {number} take the count to be taked, default to 10 (optional)
     */
    async getTransactionsDetailOfPublicKeys(publicKeys, skip = 0, take = 10) {
        if (!publicKeys) throw new Error("invalid publicKeys");
        if (!Array.isArray(publicKeys)) {
            publicKeys = [ publicKeys ];
        }

        skip = skip || 0;
        take = take || 10;

        let body = {
            keys: publicKeys,
            skip,
            take
        };

        let res = await this.__callAPI({
            url: "/v1/history/get_transactions",
            method: "POST",
            body: body,
            sign: false // no need to sign
        });

        if (Array.isArray(res)) {
            return res;
        }
        else {
            this.__throwServerResponseError(res);
        }
    }

    /**
     * get detail information about a fungible symbol by its name.
     * @param {*} name the name of the fungible symbol you want to query
     */
    async getFungibleSymbolDetail(name) {
        if (typeof name !== "string" || !name) throw new Error("invalid fungible name");

        let res = await this.__callAPI({
            url: "/v1/evt/get_fungible",
            method: "POST",
            body: { name },
            sign: false // no need to sign
        });

        if (res && res.sym && res.creator) {
            return res;
        }
        else {
            this.__throwServerResponseError(res);
        }
    }

    /**
     * wrap the exception returned from server side
     * @param {*} res 
     */
    __throwServerResponseError(res) {
        let err = new Error(`[${res.code} ${res.message}] (${(res.error || {}).code}) ${(res.error || {}).name}: ${(res.error || {}).what}`);
        err.httpCode = res.code;
        err.serverError = res.error;
        err.serverMessage = res.message;

        console.log(res);

        throw err;
    }

    async __fixedSignatureCall(args, fixedDataToSign = "everiWallet", fixedKeyToUse = null) {
        args.__fixedSignature = fixedDataToSign;
        args.__fixedKeyToUse = fixedKeyToUse;

        return await this.__callAPI(args);
    }

    /**
     * push transaction to everiToken chain
     * @param {any[]} actions actions in the transaction
     */
    async pushTransaction() {
        let actions = [];
        
        for (let i = 0; i < arguments.length; ++i) {
            actions.push(arguments[i]);
        }

        console.log("__actions:" + JSON.stringify(actions, null, 4));

        let params = {
            transaction: {
                actions: actions
            }
        };
        // check arguments
        if (!params.transaction) {
            throw new Error("invalid format of params: no transaction field");
        }

        params.sign = params.sign !== false ? true : false;

        // building the body of the request
        let body = { transaction: params.transaction };

        // make sure that it there is basic information about the chain
        if (!this.__cachedInfo) {
            await this.getInfo();
        }

        //console.log("body:______" + JSON.stringify(body, null, 4));

        for (let i = 0; i < body.transaction.actions.length; ++i) {
            if (!(body.transaction.actions[i] instanceof EvtAction)) {
                body.transaction.actions[i] = new EvtAction(body.transaction.actions[i].action, body.transaction.actions[i].args);
            }

            /** @type {EvtAction} */
            let originalAction = body.transaction.actions[i];

            // create binary action for push_transaction
            let binAction = {
                name: originalAction.actionName,
                data: (await this.__chainAbiJsonToBin({ action: originalAction.actionName, args: originalAction.abi })).binargs,
                domain: originalAction.domain,
                key: originalAction.key
            };
            
            // override action
            body.transaction.actions[i] = binAction;
        }

        let expiration, hash, numHex, last_irreversible_block_num, last_irreversible_block_prefix;

        // process referenced block number and expiration time for transaction
        expiration = (new Date(new Date().valueOf() + 100000)).toISOString().substr(0, 19);
        hash = ByteBuffer.fromHex(this.__cachedInfo.last_irreversible_block_id, true); // little endian
        numHex = this.__cachedInfo.last_irreversible_block_id.substr(4, 4);
        last_irreversible_block_num = ByteBuffer.fromHex(numHex, false).readUint16(0);
        last_irreversible_block_prefix = hash.readUInt32(8);

        body = Object.assign(body, {
            compression: "none"
        });

        body.transaction = Object.assign(body.transaction, {
            "expiration": expiration,
            "ref_block_num": last_irreversible_block_num,
            "ref_block_prefix": last_irreversible_block_prefix,
            "delay_sec": 0,
        });

        // calculate signatures
        if (params.sign) {
            // get digest of the whole trx
            let digestRes = (await this.__getDigestToSign(body.transaction)).digest;

            // sign
            const signBuf = new Buffer(digestRes, "hex");
            let sigs = await this.__signTransaction(signBuf, body.transaction);

            if (!Array.isArray(sigs)) {
                sigs = [ sigs ];
            }
            
            body.signatures = sigs;
        }

        // push transaction
        var res = await this.__chainPushTransaction(body);

        // check if it is successful
        if (res && res.processed && res.processed.receipt && res.processed.receipt.status === "executed") {
            return { transactionId: res.transaction_id };
        }
        else {
            // throw error detail
            if (res && res.error && res.error.details && res.error.details.length) {
                this.__throwServerResponseError(res);
            }
            else {
                throw new Error("did not receive anything from the chain");
            }
        }
    }
    
    async __chainAbiJsonToBin(abi) {
        let ret = await this.__callAPI({
            url: "/v1/chain/abi_json_to_bin",
            method: "POST",
            body: abi
        });

        if (ret.binargs) {
            return ret;
        }

        this.__throwServerResponseError(ret);
    }

    __signTransaction(buf, transaction, keyToUse) {
        return this.config.signProvider({signHash, buf, transaction, keyToUse});
    }

    async __getDigestToSign(transaction) {
        let ret = await this.__callAPI({
            url: "/v1/chain/trx_json_to_digest",
            method: "POST",
            body: transaction
        });

        if (ret.digest) {
            return ret;
        }

        this.__throwServerResponseError(ret);
    }

    __chainPushTransaction(tr) {
        // console.log("___push_:::" + JSON.stringify(tr, null, 4));
        return this.__callAPI({
            url: "/v1/chain/push_transaction",
            method: "POST",
            body: tr
        });
    }

    __chainGetRequiredKeys(body) {
        return this.__callAPI({
            url: "/v1/chain/get_required_keys",
            method: "POST",
            body
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
const defaultSignProvider = (apiCaller, config) => async function ({ sign, buf, transaction, keyToUse }) {
    const { keyProvider } = config;

    if (!keyProvider) {
        // console.log("config" + JSON.stringify(config, null, 4));
        throw new TypeError("This transaction requires a config.keyProvider for signing");
    }

    let keys = keyProvider;
    if (typeof keyProvider === "function") {
        keys = keyProvider({ transaction });
    }

    // keyProvider may return keys or Promise<keys>
    keys = await Promise.resolve(keys);

    if (!Array.isArray(keys)) {
        keys = [ keys ];
    }

    keys = keys.map(key => {
        try {
            // normalize format (WIF => PVT_K1_base58privateKey)
            return { private: ecc.PrivateKey(key).toString() };
        } catch (e) {
            // normalize format (EOSKey => PUB_K1_base58publicKey)
            return { public: ecc.PublicKey(key).toString() };
        }
        assert(false, "expecting public or private keys from keyProvider");
    });

    if (!keys.length) {
        throw new Error("missing key, check your keyProvider");
    }


    // simplify default signing #17
    if (keys.length === 1 && keys[0].private) {
        const pvt = keys[0].private;
        var ret = signHash(buf, pvt);
        
        return ret;
    }

    const keyMap = new Map();

    // keys are either public or private keys
    for (const key of keys) {
        const isPrivate = key.private != null;
        const isPublic = key.public != null;

        if (isPrivate) {
            keyMap.set(ecc.privateToPublic(key.private), key.private);
        } else {
            keyMap.set(key.public, null);
        }
    }

    const pubkeys = Array.from(keyMap.keys());

    if (keyToUse) {
        const pvt = keyMap[keyToUse];

        if (pvt) {
            var ret = signHash(buf, pvt);
            
            return ret;
        }

        throw new Error("the key provided is not found");
    }

    // Multiple signature support
    // console.log("get required_keys from" + JSON.stringify(keys.map(key => ecc.privateToPublic(key.private)), null, 4));
    let apiRes = await apiCaller.__chainGetRequiredKeys({ transaction, available_keys: keys.map(key => ecc.privateToPublic(key.private)) });
    let required_keys = apiRes.required_keys;

    // console.log("required_keys: " + JSON.stringify(apiRes, null, 4));

    /*return eos.getRequiredKeys(transaction, pubkeys).then(({ required_keys }) => {
        if (!required_keys.length) {
            throw new Error('missing required keys for ' + JSON.stringify(transaction))
        }*/

    const pvts = [], missingKeys = [];

    // required_keys = pubkeys[0]; // assume that we need only the first key, will be changed in the future TODO

    for (let requiredKey of required_keys) {
        // normalize (EOSKey.. => PUB_K1_Key..)
        requiredKey = ecc.PublicKey(requiredKey).toString();

        const wif = keyMap.get(requiredKey);
        if (wif) {
            pvts.push(wif);
        } else {
            missingKeys.push(requiredKey);
        }
    }

    if (missingKeys.length !== 0) {
        assert(typeof keyProvider === "function",
            "keyProvider function is needed for private key lookup");

        // const pubkeys = missingKeys.map(key => ecc.PublicKey(key).toStringLegacy())
        keyProvider({ pubkeys: missingKeys })
            .forEach(pvt => { pvts.push(pvt); });
    }

    const sigs = [];
    for (const pvt of pvts) {
        sigs.push(signHash(buf, pvt));
    }

    return sigs;
    //})
};

module.exports = { APICaller };
