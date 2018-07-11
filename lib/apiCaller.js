"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ecc = require("eosjs-ecc");
var signHash = ecc.signHash;

var EvtConfig = require("./evtConfig");

var _require = require("./fetch"),
    fetch = _require.fetch;

var ByteBuffer = require("bytebuffer");
var EvtAction = require("./action");

/**
 * APICaller for everiToken
*/

var APICaller = function () {
    /**
     * Creates a new APICaller.
     * @param {EvtConfig} config 
     */
    function APICaller(config) {
        _classCallCheck(this, APICaller);

        config = config || new EvtConfig();
        if ((typeof config === "undefined" ? "undefined" : _typeof(config)) == "object" && config != null && !(config instanceof EvtConfig)) {
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


    _createClass(APICaller, [{
        key: "__callAPI",
        value: function __callAPI(request) {
            var url, signBuf, sigs, res, ret;
            return regeneratorRuntime.async(function __callAPI$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            url = this.config.endpoint.protocol + "://" + this.config.endpoint.host + ":" + this.config.endpoint.port + request.url;


                            request.sign = request.sign == undefined ? true : request.sign;

                            if (!(request.sign && request.__fixedSignature)) {
                                _context.next = 10;
                                break;
                            }

                            // add signature
                            signBuf = Buffer.from("2800f0f3f88ce2b4a8c6ce4c20a91f5a7e3647fa73894e9d2bc4cc61b6bda1be", "hex");
                            _context.next = 6;
                            return regeneratorRuntime.awrap(this.__signTransaction(signBuf, request.body || {}, request.__fixedKeyToUse));

                        case 6:
                            sigs = _context.sent;


                            if (!Array.isArray(sigs)) {
                                sigs = [sigs];
                            }

                            request.body = request.body || {};
                            request.body.signatures = sigs;

                        case 10:
                            _context.next = 12;
                            return regeneratorRuntime.awrap(fetch(url, {
                                method: request.method,
                                body: request.body ? JSON.stringify(request.body) : undefined,
                                headers: {
                                    "Content-Type": "application/json"
                                }
                            }));

                        case 12:
                            res = _context.sent;
                            _context.next = 15;
                            return regeneratorRuntime.awrap(res.json());

                        case 15:
                            ret = _context.sent;


                            if (ret && ret.code && ret.message && ret.error) {
                                console.error("————————request sent: " + url + ": " + JSON.stringify(request, null, 4));
                                this.__throwServerResponseError(ret);
                            }

                            if (ret) {
                                _context.next = 19;
                                break;
                            }

                            throw new Error("No response or not a valid json from http server");

                        case 19:
                            return _context.abrupt("return", ret);

                        case 20:
                        case "end":
                            return _context.stop();
                    }
                }
            }, null, this);
        }

        /**
         * get information from everiToken chain node
         */

    }, {
        key: "getInfo",
        value: function getInfo() {
            var info;
            return regeneratorRuntime.async(function getInfo$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.next = 2;
                            return regeneratorRuntime.awrap(this.__callAPI({
                                url: "/v1/chain/get_info",
                                method: "GET"
                            }));

                        case 2:
                            info = _context2.sent;


                            this.__cachedInfo = info;

                            // check version of remote net

                            if (info.evt_api_version.startsWith("2.")) {
                                _context2.next = 6;
                                break;
                            }

                            throw new Error("The API version of remote net is not compatible with current evtjs's version.");

                        case 6:
                            return _context2.abrupt("return", info);

                        case 7:
                        case "end":
                            return _context2.stop();
                    }
                }
            }, null, this);
        }

        /**
         * get domain list a user created, make sure you have history_plugin enabled on the chain node
         * @param {*} publicKeys a array or a single value which represents public keys you want to query
         */

    }, {
        key: "getCreatedDomains",
        value: function getCreatedDomains(publicKeys) {
            var res;
            return regeneratorRuntime.async(function getCreatedDomains$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.next = 2;
                            return regeneratorRuntime.awrap(this.__callAPI({
                                url: "/v1/history/get_domains",
                                method: "POST",
                                body: {
                                    keys: Array.isArray(publicKeys) ? publicKeys : [publicKeys]
                                },
                                sign: false // no need to sign
                            }));

                        case 2:
                            res = _context3.sent;

                            if (!Array.isArray(res)) {
                                _context3.next = 7;
                                break;
                            }

                            return _context3.abrupt("return", res.map(function (x) {
                                return { name: x };
                            }));

                        case 7:
                            this.__throwServerResponseError(res);

                        case 8:
                        case "end":
                            return _context3.stop();
                    }
                }
            }, null, this);
        }

        /**
         * get a list of groups, each group in it must has a group key which is contained by provided public keys. Make sure you have history_plugin enabled on the chain node
         * @param {*} publicKeys a array or a single value which represents public keys you want to query
         */

    }, {
        key: "getManagedGroups",
        value: function getManagedGroups(publicKeys) {
            var res;
            return regeneratorRuntime.async(function getManagedGroups$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.next = 2;
                            return regeneratorRuntime.awrap(this.__callAPI({
                                url: "/v1/history/get_groups",
                                method: "POST",
                                body: {
                                    keys: Array.isArray(publicKeys) ? publicKeys : [publicKeys]
                                },
                                sign: false // no need to sign
                            }));

                        case 2:
                            res = _context4.sent;

                            if (!Array.isArray(res)) {
                                _context4.next = 7;
                                break;
                            }

                            return _context4.abrupt("return", res.map(function (x) {
                                return { name: x };
                            }));

                        case 7:
                            this.__throwServerResponseError(res);

                        case 8:
                        case "end":
                            return _context4.stop();
                    }
                }
            }, null, this);
        }

        /**
         * get owned token list for accounts. Make sure you have history_plugin enabled on the chain node
         * @param {*} publicKeys a array or a single value which represents public keys you want to query
         */

    }, {
        key: "getOwnedTokens",
        value: function getOwnedTokens(publicKeys) {
            var res;
            return regeneratorRuntime.async(function getOwnedTokens$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            _context5.next = 2;
                            return regeneratorRuntime.awrap(this.__callAPI({
                                url: "/v1/history/get_tokens",
                                method: "POST",
                                body: {
                                    keys: Array.isArray(publicKeys) ? publicKeys : [publicKeys]
                                },
                                sign: false // no need to sign
                            }));

                        case 2:
                            res = _context5.sent;

                            if (!Array.isArray(res)) {
                                _context5.next = 7;
                                break;
                            }

                            return _context5.abrupt("return", res.map(function (x) {
                                return { name: x.substr(x.lastIndexOf("-") + 1), domain: x.substr(0, x.lastIndexOf("-")) };
                            }));

                        case 7:
                            this.__throwServerResponseError(res);

                        case 8:
                        case "end":
                            return _context5.stop();
                    }
                }
            }, null, this);
        }

        /**
         * Query actions by domain, key and action names. Make sure you have history_plugin enabled on the chain node
         * @param {*} params
         */

    }, {
        key: "getActions",
        value: function getActions(params) {
            var res;
            return regeneratorRuntime.async(function getActions$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            if (!((typeof params === "undefined" ? "undefined" : _typeof(params)) !== "object")) {
                                _context6.next = 2;
                                break;
                            }

                            throw new Error("invalid params");

                        case 2:
                            if (!(!params || !params.domain)) {
                                _context6.next = 4;
                                break;
                            }

                            throw new Error("invalid params: domain is required");

                        case 4:
                            _context6.next = 6;
                            return regeneratorRuntime.awrap(this.__callAPI({
                                url: "/v1/history/get_actions",
                                method: "POST",
                                body: params,
                                sign: false // no need to sign
                            }));

                        case 6:
                            res = _context6.sent;

                            if (!Array.isArray(res)) {
                                _context6.next = 11;
                                break;
                            }

                            return _context6.abrupt("return", res);

                        case 11:
                            this.__throwServerResponseError(res);

                        case 12:
                        case "end":
                            return _context6.stop();
                    }
                }
            }, null, this);
        }

        /**
         * get detail information about a transaction by its id. Make sure you have history_plugin enabled on the chain node
         * @param {*} id the id of the transaction
         */

    }, {
        key: "getTransactionDetailById",
        value: function getTransactionDetailById(id) {
            var res;
            return regeneratorRuntime.async(function getTransactionDetailById$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            if (!(typeof id !== "string" || !id)) {
                                _context7.next = 2;
                                break;
                            }

                            throw new Error("invalid transaction id");

                        case 2:
                            _context7.next = 4;
                            return regeneratorRuntime.awrap(this.__callAPI({
                                url: "/v1/history/get_transaction",
                                method: "POST",
                                body: { id: id },
                                sign: false // no need to sign
                            }));

                        case 4:
                            res = _context7.sent;

                            if (!(res && res.id && res.transaction)) {
                                _context7.next = 9;
                                break;
                            }

                            return _context7.abrupt("return", res);

                        case 9:
                            this.__throwServerResponseError(res);

                        case 10:
                        case "end":
                            return _context7.stop();
                    }
                }
            }, null, this);
        }

        /**
         * get detail information about a domain by its name. Make sure you have history_plugin enabled on the chain node
         * @param {*} name the name of the domain
         */

    }, {
        key: "getDomainDetail",
        value: function getDomainDetail(name) {
            var res;
            return regeneratorRuntime.async(function getDomainDetail$(_context8) {
                while (1) {
                    switch (_context8.prev = _context8.next) {
                        case 0:
                            if (!(typeof name !== "string" || !name)) {
                                _context8.next = 2;
                                break;
                            }

                            throw new Error("invalid domain name");

                        case 2:
                            _context8.next = 4;
                            return regeneratorRuntime.awrap(this.__callAPI({
                                url: "/v1/evt/get_domain",
                                method: "POST",
                                body: { name: name },
                                sign: false // no need to sign
                            }));

                        case 4:
                            res = _context8.sent;

                            if (!(res && res.name && res.creator)) {
                                _context8.next = 9;
                                break;
                            }

                            return _context8.abrupt("return", res);

                        case 9:
                            this.__throwServerResponseError(res);

                        case 10:
                        case "end":
                            return _context8.stop();
                    }
                }
            }, null, this);
        }

        /**
         * get detail information about a group by its name. Make sure you have history_plugin enabled on the chain node
         * @param {*} name the name of the group
         */

    }, {
        key: "getGroupDetail",
        value: function getGroupDetail(name) {
            var res;
            return regeneratorRuntime.async(function getGroupDetail$(_context9) {
                while (1) {
                    switch (_context9.prev = _context9.next) {
                        case 0:
                            if (!(typeof name !== "string" || !name)) {
                                _context9.next = 2;
                                break;
                            }

                            throw new Error("invalid group name");

                        case 2:
                            _context9.next = 4;
                            return regeneratorRuntime.awrap(this.__callAPI({
                                url: "/v1/evt/get_group",
                                method: "POST",
                                body: { name: name },
                                sign: false // no need to sign
                            }));

                        case 4:
                            res = _context9.sent;

                            if (!(res && res.name && res.root)) {
                                _context9.next = 9;
                                break;
                            }

                            return _context9.abrupt("return", res);

                        case 9:
                            this.__throwServerResponseError(res);

                        case 10:
                        case "end":
                            return _context9.stop();
                    }
                }
            }, null, this);
        }

        /**
         * get detail information about a transaction by its id. Make sure you have history_plugin enabled on the chain node
         * @param {string[]} publicKeys a single value or a array of public keys to query (required)
         * @param {number} skip the count to be skipped, default to 0 (optional)
         * @param {number} take the count to be taked, default to 10 (optional)
         */

    }, {
        key: "getTransactionsDetailOfPublicKeys",
        value: function getTransactionsDetailOfPublicKeys(publicKeys) {
            var skip = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            var take = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;
            var body, res;
            return regeneratorRuntime.async(function getTransactionsDetailOfPublicKeys$(_context10) {
                while (1) {
                    switch (_context10.prev = _context10.next) {
                        case 0:
                            if (publicKeys) {
                                _context10.next = 2;
                                break;
                            }

                            throw new Error("invalid publicKeys");

                        case 2:
                            if (!Array.isArray(publicKeys)) {
                                publicKeys = [publicKeys];
                            }

                            skip = skip || 0;
                            take = take || 10;

                            body = {
                                keys: publicKeys,
                                skip: skip,
                                take: take
                            };
                            _context10.next = 8;
                            return regeneratorRuntime.awrap(this.__callAPI({
                                url: "/v1/history/get_transactions",
                                method: "POST",
                                body: body,
                                sign: false // no need to sign
                            }));

                        case 8:
                            res = _context10.sent;

                            if (!Array.isArray(res)) {
                                _context10.next = 13;
                                break;
                            }

                            return _context10.abrupt("return", res);

                        case 13:
                            this.__throwServerResponseError(res);

                        case 14:
                        case "end":
                            return _context10.stop();
                    }
                }
            }, null, this);
        }

        /**
         * get detail information about a fungible symbol by its name.
         * @param {*} name the name of the fungible symbol you want to query
         */

    }, {
        key: "getFungibleSymbolDetail",
        value: function getFungibleSymbolDetail(name) {
            var res;
            return regeneratorRuntime.async(function getFungibleSymbolDetail$(_context11) {
                while (1) {
                    switch (_context11.prev = _context11.next) {
                        case 0:
                            if (!(typeof name !== "string" || !name)) {
                                _context11.next = 2;
                                break;
                            }

                            throw new Error("invalid fungible name");

                        case 2:
                            _context11.next = 4;
                            return regeneratorRuntime.awrap(this.__callAPI({
                                url: "/v1/evt/get_fungible",
                                method: "POST",
                                body: { name: name },
                                sign: false // no need to sign
                            }));

                        case 4:
                            res = _context11.sent;

                            if (!(res && res.sym && res.creator)) {
                                _context11.next = 9;
                                break;
                            }

                            return _context11.abrupt("return", res);

                        case 9:
                            this.__throwServerResponseError(res);

                        case 10:
                        case "end":
                            return _context11.stop();
                    }
                }
            }, null, this);
        }

        /**
         * wrap the exception returned from server side
         * @param {*} res 
         */

    }, {
        key: "__throwServerResponseError",
        value: function __throwServerResponseError(res) {
            var err = new Error("[" + res.code + " " + res.message + "] (" + (res.error || {}).code + ") " + (res.error || {}).name + ": " + (res.error || {}).what);
            err.httpCode = res.code;
            err.serverError = res.error;
            err.serverMessage = res.message;

            console.log(res);

            throw err;
        }
    }, {
        key: "__fixedSignatureCall",
        value: function __fixedSignatureCall(args) {
            var fixedDataToSign = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "everiWallet";
            var fixedKeyToUse = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
            return regeneratorRuntime.async(function __fixedSignatureCall$(_context12) {
                while (1) {
                    switch (_context12.prev = _context12.next) {
                        case 0:
                            args.__fixedSignature = fixedDataToSign;
                            args.__fixedKeyToUse = fixedKeyToUse;

                            _context12.next = 4;
                            return regeneratorRuntime.awrap(this.__callAPI(args));

                        case 4:
                            return _context12.abrupt("return", _context12.sent);

                        case 5:
                        case "end":
                            return _context12.stop();
                    }
                }
            }, null, this);
        }

        /**
         * push transaction to everiToken chain
         * @param {any[]} actions actions in the transaction
         */

    }, {
        key: "pushTransaction",
        value: function pushTransaction() {
            var actions,
                i,
                params,
                body,
                _i,
                originalAction,
                binAction,
                expiration,
                hash,
                numHex,
                last_irreversible_block_num,
                last_irreversible_block_prefix,
                digestRes,
                signBuf,
                sigs,
                res,
                _args13 = arguments;

            return regeneratorRuntime.async(function pushTransaction$(_context13) {
                while (1) {
                    switch (_context13.prev = _context13.next) {
                        case 0:
                            actions = [];


                            for (i = 0; i < _args13.length; ++i) {
                                actions.push(_args13[i]);
                            }

                            // console.log("__actions:" + JSON.stringify(actions, null, 4));

                            params = {
                                transaction: {
                                    actions: actions
                                }
                            };
                            // check arguments

                            if (params.transaction) {
                                _context13.next = 5;
                                break;
                            }

                            throw new Error("invalid format of params: no transaction field");

                        case 5:

                            params.sign = params.sign !== false ? true : false;

                            // building the body of the request
                            body = { transaction: params.transaction };

                            // make sure that it there is basic information about the chain

                            if (this.__cachedInfo) {
                                _context13.next = 10;
                                break;
                            }

                            _context13.next = 10;
                            return regeneratorRuntime.awrap(this.getInfo());

                        case 10:
                            _i = 0;

                        case 11:
                            if (!(_i < body.transaction.actions.length)) {
                                _context13.next = 25;
                                break;
                            }

                            if (!(body.transaction.actions[_i] instanceof EvtAction)) {
                                body.transaction.actions[_i] = new EvtAction(body.transaction.actions[_i].action, body.transaction.actions[_i].args);
                            }

                            /** @type {EvtAction} */
                            originalAction = body.transaction.actions[_i];

                            // create binary action for push_transaction

                            _context13.t0 = originalAction.actionName;
                            _context13.next = 17;
                            return regeneratorRuntime.awrap(this.__chainAbiJsonToBin({ action: originalAction.actionName, args: originalAction.abi }));

                        case 17:
                            _context13.t1 = _context13.sent.binargs;
                            _context13.t2 = originalAction.domain;
                            _context13.t3 = originalAction.key;
                            binAction = {
                                name: _context13.t0,
                                data: _context13.t1,
                                domain: _context13.t2,
                                key: _context13.t3
                            };


                            // override action
                            body.transaction.actions[_i] = binAction;

                        case 22:
                            ++_i;
                            _context13.next = 11;
                            break;

                        case 25:
                            expiration = void 0, hash = void 0, numHex = void 0, last_irreversible_block_num = void 0, last_irreversible_block_prefix = void 0;

                            // process referenced block number and expiration time for transaction

                            expiration = new Date(new Date().valueOf() + 100000).toISOString().substr(0, 19);
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
                                "delay_sec": 0
                            });

                            // calculate signatures

                            if (!params.sign) {
                                _context13.next = 43;
                                break;
                            }

                            _context13.next = 36;
                            return regeneratorRuntime.awrap(this.__getDigestToSign(body.transaction));

                        case 36:
                            digestRes = _context13.sent.digest;


                            // sign
                            signBuf = new Buffer(digestRes, "hex");
                            _context13.next = 40;
                            return regeneratorRuntime.awrap(this.__signTransaction(signBuf, body.transaction));

                        case 40:
                            sigs = _context13.sent;


                            if (!Array.isArray(sigs)) {
                                sigs = [sigs];
                            }

                            body.signatures = sigs;

                        case 43:
                            _context13.next = 45;
                            return regeneratorRuntime.awrap(this.__chainPushTransaction(body));

                        case 45:
                            res = _context13.sent;

                            if (!(res && res.processed && res.processed.receipt && res.processed.receipt.status === "executed")) {
                                _context13.next = 50;
                                break;
                            }

                            return _context13.abrupt("return", { transactionId: res.transaction_id });

                        case 50:
                            if (!(res && res.error && res.error.details && res.error.details.length)) {
                                _context13.next = 54;
                                break;
                            }

                            this.__throwServerResponseError(res);
                            _context13.next = 55;
                            break;

                        case 54:
                            throw new Error("did not receive anything from the chain");

                        case 55:
                        case "end":
                            return _context13.stop();
                    }
                }
            }, null, this);
        }
    }, {
        key: "__chainAbiJsonToBin",
        value: function __chainAbiJsonToBin(abi) {
            var ret;
            return regeneratorRuntime.async(function __chainAbiJsonToBin$(_context14) {
                while (1) {
                    switch (_context14.prev = _context14.next) {
                        case 0:
                            _context14.next = 2;
                            return regeneratorRuntime.awrap(this.__callAPI({
                                url: "/v1/chain/abi_json_to_bin",
                                method: "POST",
                                body: abi
                            }));

                        case 2:
                            ret = _context14.sent;

                            if (!ret.binargs) {
                                _context14.next = 5;
                                break;
                            }

                            return _context14.abrupt("return", ret);

                        case 5:

                            this.__throwServerResponseError(ret);

                        case 6:
                        case "end":
                            return _context14.stop();
                    }
                }
            }, null, this);
        }
    }, {
        key: "__signTransaction",
        value: function __signTransaction(buf, transaction, keyToUse) {
            return this.config.signProvider({ signHash: signHash, buf: buf, transaction: transaction, keyToUse: keyToUse });
        }
    }, {
        key: "__getDigestToSign",
        value: function __getDigestToSign(transaction) {
            var ret;
            return regeneratorRuntime.async(function __getDigestToSign$(_context15) {
                while (1) {
                    switch (_context15.prev = _context15.next) {
                        case 0:
                            ret = null;
                            _context15.prev = 1;
                            _context15.next = 4;
                            return regeneratorRuntime.awrap(this.__callAPI({
                                url: "/v1/chain/trx_json_to_digest",
                                method: "POST",
                                body: transaction
                            }));

                        case 4:
                            ret = _context15.sent;
                            _context15.next = 11;
                            break;

                        case 7:
                            _context15.prev = 7;
                            _context15.t0 = _context15["catch"](1);

                            console.log("[__getDigestToSign] trx: \n" + JSON.stringify(transaction, null, 4));
                            throw _context15.t0;

                        case 11:
                            if (!(ret && ret.digest)) {
                                _context15.next = 13;
                                break;
                            }

                            return _context15.abrupt("return", ret);

                        case 13:

                            this.__throwServerResponseError(ret);

                        case 14:
                        case "end":
                            return _context15.stop();
                    }
                }
            }, null, this, [[1, 7]]);
        }
    }, {
        key: "__chainPushTransaction",
        value: function __chainPushTransaction(tr) {
            // console.log("___push_:::" + JSON.stringify(tr, null, 4));
            return this.__callAPI({
                url: "/v1/chain/push_transaction",
                method: "POST",
                body: tr
            });
        }
    }, {
        key: "__chainGetRequiredKeys",
        value: function __chainGetRequiredKeys(body) {
            return this.__callAPI({
                url: "/v1/chain/get_required_keys",
                method: "POST",
                body: body
            });
        }
    }]);

    return APICaller;
}();

/**
  The default sign provider is designed to interact with the available public
  keys (maybe just one), the transaction, and the blockchain to figure out
  the minimum set of signing keys.

  If only one key is available, the blockchain API calls are skipped and that
  key is used to sign the transaction.
*/


var defaultSignProvider = function defaultSignProvider(apiCaller, config) {
    return function _callee(_ref) {
        var sign = _ref.sign,
            buf = _ref.buf,
            transaction = _ref.transaction,
            keyToUse = _ref.keyToUse;

        var keyProvider, keys, pvt, ret, keyMap, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, key, isPrivate, isPublic, pubkeys, _pvt, apiRes, required_keys, pvts, missingKeys, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, requiredKey, wif, _wif, sigs, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _pvt2;

        return regeneratorRuntime.async(function _callee$(_context16) {
            while (1) {
                switch (_context16.prev = _context16.next) {
                    case 0:
                        keyProvider = config.keyProvider;

                        if (keyProvider) {
                            _context16.next = 3;
                            break;
                        }

                        throw new TypeError("This transaction requires a config.keyProvider for signing");

                    case 3:
                        keys = keyProvider;

                        if (typeof keyProvider === "function") {
                            keys = keyProvider({ transaction: transaction });
                        }

                        // keyProvider may return keys or Promise<keys>
                        _context16.next = 7;
                        return regeneratorRuntime.awrap(Promise.resolve(keys));

                    case 7:
                        keys = _context16.sent;


                        if (!Array.isArray(keys)) {
                            keys = [keys];
                        }

                        keys = keys.map(function (key) {
                            try {
                                // normalize format (WIF => PVT_K1_base58privateKey)
                                return { private: ecc.PrivateKey(key).toString() };
                            } catch (e) {
                                // normalize format (EOSKey => PUB_K1_base58publicKey)
                                return { public: ecc.PublicKey(key).toString() };
                            }
                            assert(false, "expecting public or private keys from keyProvider");
                        });

                        if (keys.length) {
                            _context16.next = 12;
                            break;
                        }

                        throw new Error("missing key, check your keyProvider");

                    case 12:
                        if (!(keys.length === 1 && keys[0].private)) {
                            _context16.next = 16;
                            break;
                        }

                        pvt = keys[0].private;
                        ret = signHash(buf, pvt);
                        return _context16.abrupt("return", ret);

                    case 16:
                        keyMap = new Map();

                        // keys are either public or private keys

                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context16.prev = 20;
                        for (_iterator = keys[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            key = _step.value;
                            isPrivate = key.private != null;
                            isPublic = key.public != null;


                            if (isPrivate) {
                                keyMap.set("EVT" + ecc.privateToPublic(key.private).substr(3), key.private);
                            } else {
                                keyMap.set(key.public, null);
                            }
                        }

                        _context16.next = 28;
                        break;

                    case 24:
                        _context16.prev = 24;
                        _context16.t0 = _context16["catch"](20);
                        _didIteratorError = true;
                        _iteratorError = _context16.t0;

                    case 28:
                        _context16.prev = 28;
                        _context16.prev = 29;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 31:
                        _context16.prev = 31;

                        if (!_didIteratorError) {
                            _context16.next = 34;
                            break;
                        }

                        throw _iteratorError;

                    case 34:
                        return _context16.finish(31);

                    case 35:
                        return _context16.finish(28);

                    case 36:
                        pubkeys = Array.from(keyMap.keys());

                        if (!keyToUse) {
                            _context16.next = 43;
                            break;
                        }

                        _pvt = keyMap[keyToUse];

                        if (!_pvt) {
                            _context16.next = 42;
                            break;
                        }

                        ret = signHash(buf, _pvt);
                        return _context16.abrupt("return", ret);

                    case 42:
                        throw new Error("the key provided is not found");

                    case 43:
                        _context16.next = 45;
                        return regeneratorRuntime.awrap(apiCaller.__chainGetRequiredKeys({ transaction: transaction, available_keys: keys.map(function (key) {
                                return "EVT" + ecc.privateToPublic(key.private).substr(3);
                            }) }));

                    case 45:
                        apiRes = _context16.sent;
                        required_keys = apiRes.required_keys;

                        // console.log("required_keys: " + JSON.stringify(apiRes, null, 4));

                        /*return eos.getRequiredKeys(transaction, pubkeys).then(({ required_keys }) => {
                            if (!required_keys.length) {
                                throw new Error('missing required keys for ' + JSON.stringify(transaction))
                            }*/

                        pvts = [], missingKeys = [];

                        // required_keys = pubkeys[0]; // assume that we need only the first key, will be changed in the future TODO

                        _iteratorNormalCompletion2 = true;
                        _didIteratorError2 = false;
                        _iteratorError2 = undefined;
                        _context16.prev = 51;
                        for (_iterator2 = required_keys[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            requiredKey = _step2.value;

                            // normalize (EOSKey.. => PUB_K1_Key..)
                            try {
                                requiredKey = ecc.PublicKey(requiredKey).toString();
                            } catch (e) {
                                requiredKey = ecc.PublicKey("EOS" + requiredKey.substr(3)).toString();
                            }

                            wif = keyMap.get(requiredKey);

                            if (wif) {
                                pvts.push(wif);
                            } else {
                                _wif = keyMap.get("EVT" + requiredKey.substr(3));

                                if (!_wif) {
                                    missingKeys.push(requiredKey);
                                }
                            }
                        }

                        _context16.next = 59;
                        break;

                    case 55:
                        _context16.prev = 55;
                        _context16.t1 = _context16["catch"](51);
                        _didIteratorError2 = true;
                        _iteratorError2 = _context16.t1;

                    case 59:
                        _context16.prev = 59;
                        _context16.prev = 60;

                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }

                    case 62:
                        _context16.prev = 62;

                        if (!_didIteratorError2) {
                            _context16.next = 65;
                            break;
                        }

                        throw _iteratorError2;

                    case 65:
                        return _context16.finish(62);

                    case 66:
                        return _context16.finish(59);

                    case 67:
                        if (missingKeys.length !== 0) {
                            assert(typeof keyProvider === "function", "keyProvider function is needed for private key lookup");

                            // const pubkeys = missingKeys.map(key => ecc.PublicKey(key).toStringLegacy())
                            keyProvider({ pubkeys: missingKeys }).forEach(function (pvt) {
                                pvts.push(pvt);
                            });
                        }

                        sigs = [];
                        _iteratorNormalCompletion3 = true;
                        _didIteratorError3 = false;
                        _iteratorError3 = undefined;
                        _context16.prev = 72;

                        for (_iterator3 = pvts[Symbol.iterator](); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            _pvt2 = _step3.value;

                            sigs.push(signHash(buf, _pvt2));
                        }

                        _context16.next = 80;
                        break;

                    case 76:
                        _context16.prev = 76;
                        _context16.t2 = _context16["catch"](72);
                        _didIteratorError3 = true;
                        _iteratorError3 = _context16.t2;

                    case 80:
                        _context16.prev = 80;
                        _context16.prev = 81;

                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }

                    case 83:
                        _context16.prev = 83;

                        if (!_didIteratorError3) {
                            _context16.next = 86;
                            break;
                        }

                        throw _iteratorError3;

                    case 86:
                        return _context16.finish(83);

                    case 87:
                        return _context16.finish(80);

                    case 88:
                        return _context16.abrupt("return", sigs);

                    case 89:
                    case "end":
                        return _context16.stop();
                }
            }
        }, null, this, [[20, 24, 28, 36], [29,, 31, 35], [51, 55, 59, 67], [60,, 62, 66], [72, 76, 80, 88], [81,, 83, 87]]);
    };
};

module.exports = { APICaller: APICaller };