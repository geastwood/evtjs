const ecc = require("./ecc/index");
const { signHash } = ecc;
const EvtConfig = require("./evtConfig");
const { fetch } = require("./fetch");
const ByteBuffer = require("bytebuffer");
const EvtAction = require("./action");
const Logger = require("./logger");
const EvtKey = require("./key");

const Structs = require("./structs");
const Fcbuffer = require("fcbuffer");

let structs = Structs({ });

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

        // try to get info to get the diff from local time to server time. It is useful to improve the rate of success in everiPay / everiPass
        /*this.timeDiff = null;
        this.getNodeTimestamp().then(() => {
            this.timeDiff = null;
        }).catch(() => { });*/
    }

    /**
     * Get the time of the server.
     */
    async getNodeTimestamp() {
        if (this.timeDiff == null) {
            try {
                await this.getInfo({ timeout: 600 });
            }
            catch (e) { }
        }

        if (this.timeDiff == null) {
            return new Date().getTime();
        }

        return new Date().getTime() + this.timeDiff;
    }

    /**
     * Call everiToken APIs directly, not suggested to use by user
     * @param {*} request 
     */
    async __callAPI(request) {
        var url = this.config.endpoint.protocol + "://" + this.config.endpoint.host + ":" + this.config.endpoint.port + request.url;

        Logger.verbose("[fetch] begin sending request: " + url + ": " + JSON.stringify(request, null, 4));

        var res = await fetch(url, {
            method: request.method,
            body: request.body ? JSON.stringify(request.body) : undefined,
            headers: {
                "Content-Type": "application/json"
            },
            networkTimeout: request.networkTimeout || this.config.networkTimeout
        });
        
        let ret = await res.json();

        if (ret && ret.code && ret.message && ret.error) {
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
    async getInfo(options) {
        options = options || { };
        var info = await this.__callAPI({
            url: "/v1/chain/get_info",
            method: "GET",
            networkTimeout: options.timeout || this.config.networkTimeout
        });

        // do not cache the result because it may expire at any time
        this.__cachedInfo = info;

        // check version of remote net
        if (!info.evt_api_version.startsWith("2.") && !info.evt_api_version.startsWith("3.")) {
            throw new Error(`[Fatal] The API version of remote net (${info.evt_api_version}) is not compatible with current evtjs's version. Please upgrade your evtjs's version.`);
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
     * Provide all the public keys its has and this API will response with all the symbol ids of the fungibles that account create.
     * @param {*} publicKeys a array or a single value which represents public keys you want to query
     */
    async getCreatedFungibles(publicKeys) {
        let res = await this.__callAPI({
            url: "/v1/history/get_fungibles",
            method: "POST",
            body: {
                keys: Array.isArray(publicKeys) ? publicKeys : [ publicKeys ]
            },
            sign: false // no need to sign
        });

        if (Array.isArray(res)) {
            return { ids: res };
        }
        else {
            this.__throwServerResponseError(res);
        }
    }

    /**
     * Get required keys for suspended transactions
     * @param {string} proposalName The proposal name you want to sign
     * @param {string} availableKeys array of public keys you own
     */
    async getRequiredKeysForSuspendedTransaction(proposalName, availableKeys) {
        // check parameters
        if (!proposalName || (typeof proposalName !== "string")) throw new Error("invalid proposalName");
        if (!availableKeys || (!Array.isArray(availableKeys))) throw new Error("invalid availableKeys");

        // call APIs
        let res = await this.__callAPI({
            url: "/v1/chain/get_suspend_required_keys",
            method: "POST",
            body: {
                name: proposalName,
                available_keys: availableKeys
            },
            sign: false // no need to sign
        });

        if (res && res.required_keys && Array.isArray(res.required_keys)) {
            return res.required_keys;
        }
        else {
            this.__throwServerResponseError(res);
        }
    }

    /**
     * Get detail information of a suspended transaction
     * @param {string} proposalName The proposal name you want to query
     */
    async getSuspendedTransactionDetail(proposalName) {
        // check parameters
        if (!proposalName || (typeof proposalName !== "string")) throw new Error("invalid proposalName");

        // call APIs
        let res = await this.__callAPI({
            url: "/v1/evt/get_suspend",
            method: "POST",
            body: {
                name: proposalName
            },
            sign: false // no need to sign
        });

        if (res && res.name && res.proposer) {
            return res;
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
     * @param {boolean} groupByDomain whether group the returned values by domain, only avaiable for chain version >= 3
     */
    async getOwnedTokens(publicKeys, groupByDomain = false) {
        let res = await this.__callAPI({
            url: "/v1/history/get_tokens",
            method: "POST",
            body: {
                keys: Array.isArray(publicKeys) ? publicKeys : [ publicKeys ]
            },
            sign: false // no need to sign
        });

        if (Array.isArray(res)) {
            if (groupByDomain) throw new Error("chain version < 3 not support group by domain");
            
            // chain version < 3
            return res.map(x => { return { name: x.substr(x.lastIndexOf("-") + 1), domain: x.substr(0, x.lastIndexOf("-")) }; });
        }
        else if (res.error) {
            this.__throwServerResponseError(res);
        }
        else {
            if (groupByDomain) {
                return res;
            }
            // chain version >= 3
            let ret = [ ];

            for (let key in res) {
                for (let value of res[key]) {
                    ret.push({ name: value, domain: key });
                }
            }

            return ret;
        }
    }

    /**
     * get specific token's detail information.
     * @param {string} domain the domain to query
     * @param {string} name the name to query
     */
    async getToken(domain, name) {
        let res = await this.__callAPI({
            url: "/v1/evt/get_token",
            method: "POST",
            body: {
                domain, name
            },
            sign: false // no need to sign
        });

        if (!res.code || !res.error) {
            return res;
        }
        else {
            this.__throwServerResponseError(res);
        }
    }

    /**
     * Query actions by domain, key and action names. Make sure you have history_plugin enabled on the chain node
     * @param {*} params
     */
    async getActions(params) {
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
     * get transaction id for a linkId
     * @param {*} id the linkId
     */
    async getTransactionIdForLinkId(id) {
        if (typeof id !== "string" || !id) throw new Error("invalid link id");

        let res = await this.__callAPI({
            url: "/v1/chain/get_trx_id_for_link_id",
            method: "POST",
            body: { link_id: id },
            sign: false // no need to sign
        });

        if (res && res.trx_id) {
            return res;
        }
        else {
            this.__throwServerResponseError(res);
        }
    }

    /**
     * Get estimated charge for a transaction
     */
    async getEstimatedChargeForTransaction() {
        /** @type Array */
        let args = [].slice.call(arguments);
        if (args.length == 0) throw new Error("invalid arguments");
        if (args[0] instanceof EvtAction) {
            args = [ { } ].concat(args);
        }

        args[0].__estimateCharge = true;

        let p = await this.pushTransaction.apply(this, args);

        // Get required keys
        Logger.verbose("[getEstimatedChargeForTransaction] get required_keys, available keys: " + JSON.stringify(p.publicKeys, null, 4));
        let apiRes = await this.__chainGetRequiredKeys({ transaction: p.body.transaction, available_keys: p.publicKeys });
        let required_keys = apiRes.required_keys;

        Logger.verbose("[getEstimatedChargeForTransaction] got required_keys: " + JSON.stringify(required_keys, null, 4));

        let res = await this.__callAPI({
            url: "/v1/chain/get_charge",
            method: "POST",
            body: { transaction: p.body.transaction, sigs_num: required_keys.length },
            sign: false // no need to sign
        });
 
        if (res && res.charge) {
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
     * get balances of a user's all kinds of fungible tokens. Make sure you have history_plugin enabled on the chain node
     * @param {string} address the public key of the user you want to query
     * @param {number} symbolId the symbol you want to query, optional
     */
    async getFungibleBalance(address, symbolId) {
        if (typeof address !== "string" || !address) throw new Error("invalid address");

        //if (!this.__cachedInfo) {
        await this.getInfo();
        //}

        // If the version is lower than 2.2 (including), then user old API, else use the new API
        let isNewerVersion = false;
        if (!this.__cachedInfo.evt_api_version.startsWith("2.0") 
        && !this.__cachedInfo.evt_api_version.startsWith("2.1")
        && !this.__cachedInfo.evt_api_version.startsWith("2.2")
        ) {
            isNewerVersion = true;
        }

        let body = {
            address
        };

        if (symbolId) {
            body.sym_id = symbolId;

            if (!Number.isInteger(body.sym_id)) {
                throw new Error("sym_id must be integer");
            }
        }

        let res = await this.__callAPI({
            url: isNewerVersion ? "/v1/evt/get_fungible_balance" : "/v1/evt/get_assets",
            method: "POST",
            body,
            sign: false // no need to sign
        });

        if (res && Array.isArray(res)) {
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
     * Query fungible actions by address
     * @param {number} symbolId the id of the symbol 
     * @param {string} address the address
     * @param {number} skip the count to be skipped, default to 0 (optional)
     * @param {number} take the count to be taked, default to 10 (optional)
     */
    async getFungibleActionsByAddress(symbolId, address, skip = 0, take = 10) {
        if (!symbolId) throw new Error("invalid symbolId");
        if (!address) throw new Error("invalid address");
        

        skip = skip || 0;
        take = take || 10;

        let body = {
            sym_id: symbolId,
            addr: address,
            skip,
            take
        };

        let res = await this.__callAPI({
            url: "/v1/history/get_fungible_actions",
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
     * @param {Number} id the id of the fungible symbol you want to query
     */
    async getFungibleSymbolDetail(id) {
        if (!Number.isInteger(id)) throw new Error("fungible id should has a type of number");

        let res = await this.__callAPI({
            url: "/v1/evt/get_fungible",
            method: "POST",
            body: { id },
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
     * Get header state of head block.
     */
    async getHeadBlockHeaderState() {
        let res = await this.__callAPI({
            url: "/v1/chain/get_head_block_header_state",
            method: "GET",
            sign: false // no need to sign
        });

        if (!res.error) {
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
        let details = "";

        if (res.error && res.error.details && Array.isArray(res.error.details)) {
            for (let detail of res.error.details) {
                details += `\nat ${detail.file}::${detail.method}: ${detail.message} (line ${detail.line_number})`;
            }
        }

        let err = new Error(`[${res.code} ${res.message}] (${(res.error || {}).code}) ${(res.error || {}).name}: ${(res.error || {}).what} ${details}`);
        err.httpCode = res.code;
        err.serverError = res.error;
        err.serverMessage = res.message;
        err.rawServerError = res;
        err.isServerError = true;

        Logger.verbose("[__throwServerResponseError] node's response return error:\n" + JSON.stringify(res, null, 4));

        throw err;
    }

    /**
     * Calculate the value of keyProvider
     * @param {string | string[] | function} keyProvider
     * @returns {string[]}
     */
    async __calcKeyProvider(keyProvider, trx) {
        if (!keyProvider) { return []; }

        // if keyProvider is function
        if (keyProvider.apply && keyProvider.call) {
            keyProvider = keyProvider( { transaction: trx });
        }

        // resolve for Promise
        keyProvider = await Promise.resolve(keyProvider);

        if (!Array.isArray(keyProvider)) {
            keyProvider = [ keyProvider ];
        }

        for (let key of keyProvider) {
            if (!EvtKey.isValidPrivateKey(key)) {
                throw new Error("Invalid private key");
            }
        }

        return keyProvider;
    }

    /**
     * Calculate the value of publicKeyProvider
     * @param {string | string[] | function} keyProvider
     * @returns {string[]}
     */
    async __calcPublicKeyProvider(keyProvider) {
        if (!keyProvider) { return []; }

        // if keyProvider is function
        if (keyProvider.apply && keyProvider.call) {
            keyProvider = keyProvider();
        }

        // resolve for Promise
        keyProvider = await Promise.resolve(keyProvider);

        if (!Array.isArray(keyProvider)) {
            keyProvider = [ keyProvider ];
        }

        for (let key of keyProvider) {
            if (!EvtKey.isValidPublicKey(key)) {
                throw new Error("Invalid public key");
            }
        }

        return keyProvider;
    }

    /**
     * push transaction to everiToken chain
     * @param {any[]} actions actions in the transaction
     */
    async pushTransaction() {
        let actions = [ ];
        let hasConfig = false;

        // default config
        let trxConf = {
            maxCharge: 100000000  
        };

        // check and copy config from parameters
        if (arguments.length > 0 && !(arguments[0] instanceof EvtAction) && !arguments[0].action) {
            // config found
            Object.assign(trxConf, arguments[0]);
            hasConfig = true;
        }

        // calculate and cache private keys
        let privateKeys = [];
        let publicKeys = [];

        // user can use availablePublicKeys in config for estimate, or use keyProvider as a backup
        if (!trxConf.__estimateCharge || !trxConf.availablePublicKeys) {
            privateKeys = await this.__calcKeyProvider(this.config.keyProvider, null);
            publicKeys = privateKeys.map(x => EvtKey.privateToPublic(x));
        }
        else {
            publicKeys = await this.__calcPublicKeyProvider(trxConf.availablePublicKeys);
        }

        // set default payer if user provided only one private key
        if (!trxConf.payer && privateKeys.length == 1) {
            trxConf.payer = EvtKey.privateToPublic(privateKeys[0]);
        }
        
        for (let i = (hasConfig ? 1 : 0); i < arguments.length; ++i) {
            actions.push(arguments[i]);
        }

        // check arguments
        if (actions.length == 0) {
            throw new Error("At least 1 action needed");
        }
        if (trxConf.maxCharge == null || !Number.isInteger(trxConf.maxCharge)) throw new Error("maxCharge is required and must be a integer greater than or eqaul to 0");
        if (!trxConf.__estimateCharge && (trxConf.payer == null || !EvtKey.isValidAddress(trxConf.payer))) throw new Error("payer is required and must be a valid address as a string");

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
        //if (!this.__cachedInfo) {
        await this.getInfo();
        //}

        for (let i = 0; i < body.transaction.actions.length; ++i) {
            if (!(body.transaction.actions[i] instanceof EvtAction)) {
                body.transaction.actions[i] = new EvtAction(body.transaction.actions[i].action, body.transaction.actions[i].args);
            }

            await body.transaction.actions[i].calculateDomainAndKey();

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
            "ref_block_prefix": last_irreversible_block_prefix
        });

        // add payer and maxCharge to the transaction
        body.transaction.max_charge = trxConf.maxCharge;
        body.transaction.payer = trxConf.payer;

        if (trxConf.__estimateCharge) {
            return { body, publicKeys };
        }

        // calculate signatures
        if (params.sign) {
            // get digest of the whole trx
            let digestRes = (await this.__getDigestToSign(body.transaction)).digest;

            // sign
            const signBuf = new Buffer(digestRes, "hex");
            let sigs = await this.__signTransaction(signBuf, body.transaction, privateKeys);

            if (!Array.isArray(sigs)) {
                sigs = [ sigs ];
            }
            
            body.signatures = sigs;
        }

        // push transaction
        // console.log("__body:" + JSON.stringify(body, null, 4));
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
            /*console.log("hhhh" + abi.action);
            if (structs.structs[abi.action]) {
                
                let obj = structs.structs[abi.action].fromObject(abi.args);
                let bin = Fcbuffer.toBuffer(structs.structs[abi.action], obj);

                console.log("==== abi testing ===");
                console.log("local: " + bin.toString("hex"));
                console.log("remote:" + ret.binargs);
            } TODO */
            return ret;
        }

        this.__throwServerResponseError(ret);
    }

    /**
     * 
     * @param {Buffer} buf 
     * @param {object} transaction 
     * @param {string[]} privateKeys 
     */
    __signTransaction(buf, transaction, privateKeys) {
        return this.config.signProvider({signHash, buf, transaction, privateKeys});
    }

    async __getDigestToSign(transaction) {
        let ret = null;
        try {
            ret = await this.__callAPI({
                url: "/v1/chain/trx_json_to_digest",
                method: "POST",
                body: transaction
            });
        }
        catch (e) {
            // console.log("[__getDigestToSign] trx: \n" + JSON.stringify(transaction, null, 4));
            throw e;
        }

        if (ret && ret.digest) {
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
const defaultSignProvider = (apiCaller, config) => async function ({ sign, buf, transaction, privateKeys }) {
    let keys = privateKeys;

    if (!keys) {
        throw new TypeError("This transaction requires a config.keyProvider for signing");
    }

    keys = keys.map(key => {
        return {
            private: ecc.PrivateKey(key).toString(),
            public: EvtKey.privateToPublic(ecc.PrivateKey(key).toString())
        };
    });

    if (!keys.length) {
        throw new Error("missing key, check your keyProvider");
    }

    // simplify default signing #17
    if (keys.length === 1 && keys[0].private) {
        const pvt = keys[0].private;
        var ret = await signHash(buf, pvt);
        
        return ret;
    }

    // Multiple signature support
    Logger.verbose("[defaultSignProvider] get required_keys, available keys: " + JSON.stringify(keys.map(key => key.public ), null, 4));
    let apiRes = await apiCaller.__chainGetRequiredKeys({ transaction, available_keys: keys.map(key => key.public ) });
    let required_keys = apiRes.required_keys;

    Logger.verbose("[defaultSignProvider] got required_keys: " + JSON.stringify(apiRes, null, 4));

    const pvts = [], missingKeys = [];

    for (let requiredKey of required_keys) {
        let wifs = keys.filter(x => x.public == requiredKey);

        if (wifs.length == 1) {
            pvts.push(wifs[0].private);
        } else {
            missingKeys.push(requiredKey);
        }
    }

    if (missingKeys.length !== 0) {
        throw new Error("missingKeys for required_key");

        // const pubkeys = missingKeys.map(key => ecc.PublicKey(key).toStringLegacy())
        //keyProvider({ pubkeys: missingKeys })
        //    .forEach(pvt => { pvts.push(pvt); });
    }

    const sigs = [];
    for (const pvt of pvts) {
        sigs.push(await signHash(buf, pvt));
    }

    return sigs;
    //})
};

module.exports = { APICaller };
