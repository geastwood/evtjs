"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ecc = require("./ecc/index");
var signHash = ecc.signHash;

var EvtConfig = require("./evtConfig");

var _require = require("./fetch"),
    fetch = _require.fetch;

var ByteBuffer = require("bytebuffer");
var EvtAction = require("./action");
var Logger = require("./logger");
var EvtKey = require("./key");

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
            var url, res, ret;
            return regeneratorRuntime.async(function __callAPI$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            url = this.config.endpoint.protocol + "://" + this.config.endpoint.host + ":" + this.config.endpoint.port + request.url;


                            Logger.verbose("[fetch] begin sending request: " + url + ": " + JSON.stringify(request, null, 4));

                            _context.next = 4;
                            return regeneratorRuntime.awrap(fetch(url, {
                                method: request.method,
                                body: request.body ? JSON.stringify(request.body) : undefined,
                                headers: {
                                    "Content-Type": "application/json"
                                }
                            }));

                        case 4:
                            res = _context.sent;
                            _context.next = 7;
                            return regeneratorRuntime.awrap(res.json());

                        case 7:
                            ret = _context.sent;


                            if (ret && ret.code && ret.message && ret.error) {
                                this.__throwServerResponseError(ret);
                            }

                            if (ret) {
                                _context.next = 11;
                                break;
                            }

                            throw new Error("No response or not a valid json from http server");

                        case 11:
                            return _context.abrupt("return", ret);

                        case 12:
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

                            if (!(!info.evt_api_version.startsWith("2.") && !info.evt_api_version.startsWith("3."))) {
                                _context2.next = 6;
                                break;
                            }

                            throw new Error("[Fatal] The API version of remote net (" + info.evt_api_version + ") is not compatible with current evtjs's version. Please upgrade your evtjs's version.");

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
         * Get required keys for suspended transactions
         * @param {string} proposalName The proposal name you want to sign
         * @param {string} availableKeys array of public keys you own
         */

    }, {
        key: "getRequiredKeysForSuspendedTransaction",
        value: function getRequiredKeysForSuspendedTransaction(proposalName, availableKeys) {
            var res;
            return regeneratorRuntime.async(function getRequiredKeysForSuspendedTransaction$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            if (!(!proposalName || typeof proposalName !== "string")) {
                                _context4.next = 2;
                                break;
                            }

                            throw new Error("invalid proposalName");

                        case 2:
                            if (!(!availableKeys || !Array.isArray(availableKeys))) {
                                _context4.next = 4;
                                break;
                            }

                            throw new Error("invalid availableKeys");

                        case 4:
                            _context4.next = 6;
                            return regeneratorRuntime.awrap(this.__callAPI({
                                url: "/v1/chain/get_suspend_required_keys",
                                method: "POST",
                                body: {
                                    name: proposalName,
                                    available_keys: availableKeys
                                },
                                sign: false // no need to sign
                            }));

                        case 6:
                            res = _context4.sent;

                            if (!(res && res.required_keys && Array.isArray(res.required_keys))) {
                                _context4.next = 11;
                                break;
                            }

                            return _context4.abrupt("return", res.required_keys);

                        case 11:
                            this.__throwServerResponseError(res);

                        case 12:
                        case "end":
                            return _context4.stop();
                    }
                }
            }, null, this);
        }

        /**
         * Get detail information of a suspended transaction
         * @param {string} proposalName The proposal name you want to query
         */

    }, {
        key: "getSuspendedTransactionDetail",
        value: function getSuspendedTransactionDetail(proposalName) {
            var res;
            return regeneratorRuntime.async(function getSuspendedTransactionDetail$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            if (!(!proposalName || typeof proposalName !== "string")) {
                                _context5.next = 2;
                                break;
                            }

                            throw new Error("invalid proposalName");

                        case 2:
                            _context5.next = 4;
                            return regeneratorRuntime.awrap(this.__callAPI({
                                url: "/v1/evt/get_suspend",
                                method: "POST",
                                body: {
                                    name: proposalName
                                },
                                sign: false // no need to sign
                            }));

                        case 4:
                            res = _context5.sent;

                            if (!(res && res.name && res.proposer)) {
                                _context5.next = 9;
                                break;
                            }

                            return _context5.abrupt("return", res);

                        case 9:
                            this.__throwServerResponseError(res);

                        case 10:
                        case "end":
                            return _context5.stop();
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
            return regeneratorRuntime.async(function getManagedGroups$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            _context6.next = 2;
                            return regeneratorRuntime.awrap(this.__callAPI({
                                url: "/v1/history/get_groups",
                                method: "POST",
                                body: {
                                    keys: Array.isArray(publicKeys) ? publicKeys : [publicKeys]
                                },
                                sign: false // no need to sign
                            }));

                        case 2:
                            res = _context6.sent;

                            if (!Array.isArray(res)) {
                                _context6.next = 7;
                                break;
                            }

                            return _context6.abrupt("return", res.map(function (x) {
                                return { name: x };
                            }));

                        case 7:
                            this.__throwServerResponseError(res);

                        case 8:
                        case "end":
                            return _context6.stop();
                    }
                }
            }, null, this);
        }

        /**
         * get owned token list for accounts. Make sure you have history_plugin enabled on the chain node
         * @param {*} publicKeys a array or a single value which represents public keys you want to query
         * @param {boolean} groupByDomain whether group the returned values by domain, only avaiable for chain version >= 3
         */

    }, {
        key: "getOwnedTokens",
        value: function getOwnedTokens(publicKeys) {
            var groupByDomain = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            var res, ret, key, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, value;

            return regeneratorRuntime.async(function getOwnedTokens$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            _context7.next = 2;
                            return regeneratorRuntime.awrap(this.__callAPI({
                                url: "/v1/history/get_tokens",
                                method: "POST",
                                body: {
                                    keys: Array.isArray(publicKeys) ? publicKeys : [publicKeys]
                                },
                                sign: false // no need to sign
                            }));

                        case 2:
                            res = _context7.sent;

                            if (!Array.isArray(res)) {
                                _context7.next = 9;
                                break;
                            }

                            if (!groupByDomain) {
                                _context7.next = 6;
                                break;
                            }

                            throw new Error("chain version < 3 not support group by domain");

                        case 6:
                            return _context7.abrupt("return", res.map(function (x) {
                                return { name: x.substr(x.lastIndexOf("-") + 1), domain: x.substr(0, x.lastIndexOf("-")) };
                            }));

                        case 9:
                            if (!res.error) {
                                _context7.next = 13;
                                break;
                            }

                            this.__throwServerResponseError(res);
                            _context7.next = 41;
                            break;

                        case 13:
                            if (!groupByDomain) {
                                _context7.next = 15;
                                break;
                            }

                            return _context7.abrupt("return", res);

                        case 15:
                            // chain version >= 3
                            ret = [];
                            _context7.t0 = regeneratorRuntime.keys(res);

                        case 17:
                            if ((_context7.t1 = _context7.t0()).done) {
                                _context7.next = 40;
                                break;
                            }

                            key = _context7.t1.value;
                            _iteratorNormalCompletion = true;
                            _didIteratorError = false;
                            _iteratorError = undefined;
                            _context7.prev = 22;

                            for (_iterator = res[key][Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                value = _step.value;

                                ret.push({ name: value, domain: key });
                            }
                            _context7.next = 30;
                            break;

                        case 26:
                            _context7.prev = 26;
                            _context7.t2 = _context7["catch"](22);
                            _didIteratorError = true;
                            _iteratorError = _context7.t2;

                        case 30:
                            _context7.prev = 30;
                            _context7.prev = 31;

                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }

                        case 33:
                            _context7.prev = 33;

                            if (!_didIteratorError) {
                                _context7.next = 36;
                                break;
                            }

                            throw _iteratorError;

                        case 36:
                            return _context7.finish(33);

                        case 37:
                            return _context7.finish(30);

                        case 38:
                            _context7.next = 17;
                            break;

                        case 40:
                            return _context7.abrupt("return", ret);

                        case 41:
                        case "end":
                            return _context7.stop();
                    }
                }
            }, null, this, [[22, 26, 30, 38], [31,, 33, 37]]);
        }

        /**
         * get specific token's detail information.
         * @param {string} domain the domain to query
         * @param {string} name the name to query
         */

    }, {
        key: "getToken",
        value: function getToken(domain, name) {
            var res;
            return regeneratorRuntime.async(function getToken$(_context8) {
                while (1) {
                    switch (_context8.prev = _context8.next) {
                        case 0:
                            _context8.next = 2;
                            return regeneratorRuntime.awrap(this.__callAPI({
                                url: "/v1/evt/get_token",
                                method: "POST",
                                body: {
                                    domain: domain, name: name
                                },
                                sign: false // no need to sign
                            }));

                        case 2:
                            res = _context8.sent;

                            if (!(!res.code || !res.error)) {
                                _context8.next = 7;
                                break;
                            }

                            return _context8.abrupt("return", res);

                        case 7:
                            this.__throwServerResponseError(res);

                        case 8:
                        case "end":
                            return _context8.stop();
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
            return regeneratorRuntime.async(function getActions$(_context9) {
                while (1) {
                    switch (_context9.prev = _context9.next) {
                        case 0:
                            if (!((typeof params === "undefined" ? "undefined" : _typeof(params)) !== "object")) {
                                _context9.next = 2;
                                break;
                            }

                            throw new Error("invalid params");

                        case 2:
                            if (!(!params || !params.domain)) {
                                _context9.next = 4;
                                break;
                            }

                            throw new Error("invalid params: domain is required");

                        case 4:
                            _context9.next = 6;
                            return regeneratorRuntime.awrap(this.__callAPI({
                                url: "/v1/history/get_actions",
                                method: "POST",
                                body: params,
                                sign: false // no need to sign
                            }));

                        case 6:
                            res = _context9.sent;

                            if (!Array.isArray(res)) {
                                _context9.next = 11;
                                break;
                            }

                            return _context9.abrupt("return", res);

                        case 11:
                            this.__throwServerResponseError(res);

                        case 12:
                        case "end":
                            return _context9.stop();
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
            return regeneratorRuntime.async(function getTransactionDetailById$(_context10) {
                while (1) {
                    switch (_context10.prev = _context10.next) {
                        case 0:
                            if (!(typeof id !== "string" || !id)) {
                                _context10.next = 2;
                                break;
                            }

                            throw new Error("invalid transaction id");

                        case 2:
                            _context10.next = 4;
                            return regeneratorRuntime.awrap(this.__callAPI({
                                url: "/v1/history/get_transaction",
                                method: "POST",
                                body: { id: id },
                                sign: false // no need to sign
                            }));

                        case 4:
                            res = _context10.sent;

                            if (!(res && res.id && res.transaction)) {
                                _context10.next = 9;
                                break;
                            }

                            return _context10.abrupt("return", res);

                        case 9:
                            this.__throwServerResponseError(res);

                        case 10:
                        case "end":
                            return _context10.stop();
                    }
                }
            }, null, this);
        }

        /**
         * Get estimated charge for a transaction
         */

    }, {
        key: "getEstimatedChargeForTransaction",
        value: function getEstimatedChargeForTransaction() {
            var args,
                p,
                res,
                _args11 = arguments;
            return regeneratorRuntime.async(function getEstimatedChargeForTransaction$(_context11) {
                while (1) {
                    switch (_context11.prev = _context11.next) {
                        case 0:
                            /** @type Array */
                            args = [].slice.call(_args11);

                            if (!(args.length == 0)) {
                                _context11.next = 3;
                                break;
                            }

                            throw new Error("invalid arguments");

                        case 3:
                            if (args[0] instanceof EvtAction) {
                                args = [{}].concat(args);
                            }

                            args[0].__estimateCharge = true;

                            _context11.next = 7;
                            return regeneratorRuntime.awrap(this.pushTransaction.apply(this, args));

                        case 7:
                            p = _context11.sent;
                            _context11.next = 10;
                            return regeneratorRuntime.awrap(this.__callAPI({
                                url: "/v1/chain/get_charge",
                                method: "POST",
                                body: { transaction: p.body.transaction, sigs_num: p.privateKeys.length },
                                sign: false // no need to sign
                            }));

                        case 10:
                            res = _context11.sent;

                            if (!(res && res.charge)) {
                                _context11.next = 15;
                                break;
                            }

                            return _context11.abrupt("return", res);

                        case 15:
                            this.__throwServerResponseError(res);

                        case 16:
                        case "end":
                            return _context11.stop();
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
            return regeneratorRuntime.async(function getDomainDetail$(_context12) {
                while (1) {
                    switch (_context12.prev = _context12.next) {
                        case 0:
                            if (!(typeof name !== "string" || !name)) {
                                _context12.next = 2;
                                break;
                            }

                            throw new Error("invalid domain name");

                        case 2:
                            _context12.next = 4;
                            return regeneratorRuntime.awrap(this.__callAPI({
                                url: "/v1/evt/get_domain",
                                method: "POST",
                                body: { name: name },
                                sign: false // no need to sign
                            }));

                        case 4:
                            res = _context12.sent;

                            if (!(res && res.name && res.creator)) {
                                _context12.next = 9;
                                break;
                            }

                            return _context12.abrupt("return", res);

                        case 9:
                            this.__throwServerResponseError(res);

                        case 10:
                        case "end":
                            return _context12.stop();
                    }
                }
            }, null, this);
        }

        /**
         * get balances of a user's all kinds of fungible tokens. Make sure you have history_plugin enabled on the chain node
         * @param {string} address the public key of the user you want to query
         * @param {*} symbol the symbol you want to query, optional
         */

    }, {
        key: "getFungibleBalance",
        value: function getFungibleBalance(address, symbol) {
            var isNewerVersion, body, res;
            return regeneratorRuntime.async(function getFungibleBalance$(_context13) {
                while (1) {
                    switch (_context13.prev = _context13.next) {
                        case 0:
                            if (!(typeof address !== "string" || !address)) {
                                _context13.next = 2;
                                break;
                            }

                            throw new Error("invalid address");

                        case 2:
                            if (this.__cachedInfo) {
                                _context13.next = 5;
                                break;
                            }

                            _context13.next = 5;
                            return regeneratorRuntime.awrap(this.getInfo());

                        case 5:

                            // If the version is lower than 2.2 (including), then user old API, else use the new API
                            isNewerVersion = false;

                            if (!this.__cachedInfo.evt_api_version.startsWith("2.0") && !this.__cachedInfo.evt_api_version.startsWith("2.1") && !this.__cachedInfo.evt_api_version.startsWith("2.2")) {
                                isNewerVersion = true;
                            }

                            body = {
                                address: address
                            };


                            if (symbol) {
                                body.symbol = symbol;
                            }

                            _context13.next = 11;
                            return regeneratorRuntime.awrap(this.__callAPI({
                                url: isNewerVersion ? "/v1/evt/get_fungible_balance" : "/v1/evt/get_assets",
                                method: "POST",
                                body: body,
                                sign: false // no need to sign
                            }));

                        case 11:
                            res = _context13.sent;

                            if (!(res && Array.isArray(res))) {
                                _context13.next = 16;
                                break;
                            }

                            return _context13.abrupt("return", res);

                        case 16:
                            this.__throwServerResponseError(res);

                        case 17:
                        case "end":
                            return _context13.stop();
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
            return regeneratorRuntime.async(function getGroupDetail$(_context14) {
                while (1) {
                    switch (_context14.prev = _context14.next) {
                        case 0:
                            if (!(typeof name !== "string" || !name)) {
                                _context14.next = 2;
                                break;
                            }

                            throw new Error("invalid group name");

                        case 2:
                            _context14.next = 4;
                            return regeneratorRuntime.awrap(this.__callAPI({
                                url: "/v1/evt/get_group",
                                method: "POST",
                                body: { name: name },
                                sign: false // no need to sign
                            }));

                        case 4:
                            res = _context14.sent;

                            if (!(res && res.name && res.root)) {
                                _context14.next = 9;
                                break;
                            }

                            return _context14.abrupt("return", res);

                        case 9:
                            this.__throwServerResponseError(res);

                        case 10:
                        case "end":
                            return _context14.stop();
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
            return regeneratorRuntime.async(function getTransactionsDetailOfPublicKeys$(_context15) {
                while (1) {
                    switch (_context15.prev = _context15.next) {
                        case 0:
                            if (publicKeys) {
                                _context15.next = 2;
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
                            _context15.next = 8;
                            return regeneratorRuntime.awrap(this.__callAPI({
                                url: "/v1/history/get_transactions",
                                method: "POST",
                                body: body,
                                sign: false // no need to sign
                            }));

                        case 8:
                            res = _context15.sent;

                            if (!Array.isArray(res)) {
                                _context15.next = 13;
                                break;
                            }

                            return _context15.abrupt("return", res);

                        case 13:
                            this.__throwServerResponseError(res);

                        case 14:
                        case "end":
                            return _context15.stop();
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
            return regeneratorRuntime.async(function getFungibleSymbolDetail$(_context16) {
                while (1) {
                    switch (_context16.prev = _context16.next) {
                        case 0:
                            if (!(typeof name !== "string" || !name)) {
                                _context16.next = 2;
                                break;
                            }

                            throw new Error("invalid fungible name");

                        case 2:
                            _context16.next = 4;
                            return regeneratorRuntime.awrap(this.__callAPI({
                                url: "/v1/evt/get_fungible",
                                method: "POST",
                                body: { name: name },
                                sign: false // no need to sign
                            }));

                        case 4:
                            res = _context16.sent;

                            if (!(res && res.sym && res.creator)) {
                                _context16.next = 9;
                                break;
                            }

                            return _context16.abrupt("return", res);

                        case 9:
                            this.__throwServerResponseError(res);

                        case 10:
                        case "end":
                            return _context16.stop();
                    }
                }
            }, null, this);
        }

        /**
         * Get header state of head block.
         */

    }, {
        key: "getHeadBlockHeaderState",
        value: function getHeadBlockHeaderState() {
            var res;
            return regeneratorRuntime.async(function getHeadBlockHeaderState$(_context17) {
                while (1) {
                    switch (_context17.prev = _context17.next) {
                        case 0:
                            _context17.next = 2;
                            return regeneratorRuntime.awrap(this.__callAPI({
                                url: "/v1/chain/get_head_block_header_state",
                                method: "GET",
                                sign: false // no need to sign
                            }));

                        case 2:
                            res = _context17.sent;

                            if (res.error) {
                                _context17.next = 7;
                                break;
                            }

                            return _context17.abrupt("return", res);

                        case 7:
                            this.__throwServerResponseError(res);

                        case 8:
                        case "end":
                            return _context17.stop();
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
            var details = "";

            if (res.error && res.error.details && Array.isArray(res.error.details)) {
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = res.error.details[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var detail = _step2.value;

                        details += "\nat " + detail.file + "::" + detail.method + ": " + detail.message + " (line " + detail.line_number + ")";
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }
            }

            var err = new Error("[" + res.code + " " + res.message + "] (" + (res.error || {}).code + ") " + (res.error || {}).name + ": " + (res.error || {}).what + " " + details);
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

    }, {
        key: "__calcKeyProvider",
        value: function __calcKeyProvider(keyProvider, trx) {
            var _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, key;

            return regeneratorRuntime.async(function __calcKeyProvider$(_context18) {
                while (1) {
                    switch (_context18.prev = _context18.next) {
                        case 0:
                            if (keyProvider) {
                                _context18.next = 2;
                                break;
                            }

                            return _context18.abrupt("return", []);

                        case 2:

                            // if keyProvider is function
                            if (keyProvider.apply && keyProvider.call) {
                                keyProvider = keyProvider({ transaction: trx });
                            }

                            // resolve for Promise
                            _context18.next = 5;
                            return regeneratorRuntime.awrap(Promise.resolve(keyProvider));

                        case 5:
                            keyProvider = _context18.sent;


                            if (!Array.isArray(keyProvider)) {
                                keyProvider = [keyProvider];
                            }

                            _iteratorNormalCompletion3 = true;
                            _didIteratorError3 = false;
                            _iteratorError3 = undefined;
                            _context18.prev = 10;
                            _iterator3 = keyProvider[Symbol.iterator]();

                        case 12:
                            if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                                _context18.next = 19;
                                break;
                            }

                            key = _step3.value;

                            if (EvtKey.isValidPrivateKey(key)) {
                                _context18.next = 16;
                                break;
                            }

                            throw new Error("Invalid private key");

                        case 16:
                            _iteratorNormalCompletion3 = true;
                            _context18.next = 12;
                            break;

                        case 19:
                            _context18.next = 25;
                            break;

                        case 21:
                            _context18.prev = 21;
                            _context18.t0 = _context18["catch"](10);
                            _didIteratorError3 = true;
                            _iteratorError3 = _context18.t0;

                        case 25:
                            _context18.prev = 25;
                            _context18.prev = 26;

                            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                _iterator3.return();
                            }

                        case 28:
                            _context18.prev = 28;

                            if (!_didIteratorError3) {
                                _context18.next = 31;
                                break;
                            }

                            throw _iteratorError3;

                        case 31:
                            return _context18.finish(28);

                        case 32:
                            return _context18.finish(25);

                        case 33:
                            return _context18.abrupt("return", keyProvider);

                        case 34:
                        case "end":
                            return _context18.stop();
                    }
                }
            }, null, this, [[10, 21, 25, 33], [26,, 28, 32]]);
        }

        /**
         * push transaction to everiToken chain
         * @param {any[]} actions actions in the transaction
         */

    }, {
        key: "pushTransaction",
        value: function pushTransaction() {
            var actions,
                hasConfig,
                trxConf,
                privateKeys,
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
                _args19 = arguments;

            return regeneratorRuntime.async(function pushTransaction$(_context19) {
                while (1) {
                    switch (_context19.prev = _context19.next) {
                        case 0:
                            actions = [];
                            hasConfig = false;

                            // default config

                            trxConf = {
                                maxCharge: 100000000
                            };

                            // check and copy config from parameters

                            if (_args19.length > 0 && !(_args19[0] instanceof EvtAction) && !_args19[0].action) {
                                // config found
                                Object.assign(trxConf, _args19[0]);
                                hasConfig = true;
                            }

                            // calculate and cache private keys
                            _context19.next = 6;
                            return regeneratorRuntime.awrap(this.__calcKeyProvider(this.config.keyProvider, null));

                        case 6:
                            privateKeys = _context19.sent;


                            // set default payer if user provided only one private key
                            if (!trxConf.payer && privateKeys.length == 1) {
                                trxConf.payer = EvtKey.privateToPublic(privateKeys[0]);
                            }

                            for (i = hasConfig ? 1 : 0; i < _args19.length; ++i) {
                                actions.push(_args19[i]);
                            }

                            // check arguments

                            if (!(actions.length == 0)) {
                                _context19.next = 11;
                                break;
                            }

                            throw new Error("At least 1 action needed");

                        case 11:
                            if (!(trxConf.maxCharge == null || !Number.isInteger(trxConf.maxCharge))) {
                                _context19.next = 13;
                                break;
                            }

                            throw new Error("maxCharge is required and must be a integer greater than or eqaul to 0");

                        case 13:
                            if (!(trxConf.payer == null || !EvtKey.isValidAddress(trxConf.payer))) {
                                _context19.next = 15;
                                break;
                            }

                            throw new Error("payer is required and must be a valid address as a string");

                        case 15:
                            params = {
                                transaction: {
                                    actions: actions
                                }
                            };
                            // check arguments

                            if (params.transaction) {
                                _context19.next = 18;
                                break;
                            }

                            throw new Error("invalid format of params: no transaction field");

                        case 18:

                            params.sign = params.sign !== false ? true : false;

                            // building the body of the request
                            body = { transaction: params.transaction };

                            // make sure that it there is basic information about the chain

                            if (this.__cachedInfo) {
                                _context19.next = 23;
                                break;
                            }

                            _context19.next = 23;
                            return regeneratorRuntime.awrap(this.getInfo());

                        case 23:
                            _i = 0;

                        case 24:
                            if (!(_i < body.transaction.actions.length)) {
                                _context19.next = 38;
                                break;
                            }

                            if (!(body.transaction.actions[_i] instanceof EvtAction)) {
                                body.transaction.actions[_i] = new EvtAction(body.transaction.actions[_i].action, body.transaction.actions[_i].args);
                            }

                            /** @type {EvtAction} */
                            originalAction = body.transaction.actions[_i];

                            // create binary action for push_transaction

                            _context19.t0 = originalAction.actionName;
                            _context19.next = 30;
                            return regeneratorRuntime.awrap(this.__chainAbiJsonToBin({ action: originalAction.actionName, args: originalAction.abi }));

                        case 30:
                            _context19.t1 = _context19.sent.binargs;
                            _context19.t2 = originalAction.domain;
                            _context19.t3 = originalAction.key;
                            binAction = {
                                name: _context19.t0,
                                data: _context19.t1,
                                domain: _context19.t2,
                                key: _context19.t3
                            };


                            // override action
                            body.transaction.actions[_i] = binAction;

                        case 35:
                            ++_i;
                            _context19.next = 24;
                            break;

                        case 38:
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
                                "ref_block_prefix": last_irreversible_block_prefix
                            });

                            // add payer and maxCharge to the transaction
                            body.transaction.max_charge = trxConf.maxCharge;
                            body.transaction.payer = trxConf.payer;

                            if (!trxConf.__estimateCharge) {
                                _context19.next = 50;
                                break;
                            }

                            return _context19.abrupt("return", { body: body, privateKeys: privateKeys });

                        case 50:
                            if (!params.sign) {
                                _context19.next = 60;
                                break;
                            }

                            _context19.next = 53;
                            return regeneratorRuntime.awrap(this.__getDigestToSign(body.transaction));

                        case 53:
                            digestRes = _context19.sent.digest;


                            // sign
                            signBuf = new Buffer(digestRes, "hex");
                            _context19.next = 57;
                            return regeneratorRuntime.awrap(this.__signTransaction(signBuf, body.transaction, privateKeys));

                        case 57:
                            sigs = _context19.sent;


                            if (!Array.isArray(sigs)) {
                                sigs = [sigs];
                            }

                            body.signatures = sigs;

                        case 60:
                            _context19.next = 62;
                            return regeneratorRuntime.awrap(this.__chainPushTransaction(body));

                        case 62:
                            res = _context19.sent;

                            if (!(res && res.processed && res.processed.receipt && res.processed.receipt.status === "executed")) {
                                _context19.next = 67;
                                break;
                            }

                            return _context19.abrupt("return", { transactionId: res.transaction_id });

                        case 67:
                            if (!(res && res.error && res.error.details && res.error.details.length)) {
                                _context19.next = 71;
                                break;
                            }

                            this.__throwServerResponseError(res);
                            _context19.next = 72;
                            break;

                        case 71:
                            throw new Error("did not receive anything from the chain");

                        case 72:
                        case "end":
                            return _context19.stop();
                    }
                }
            }, null, this);
        }
    }, {
        key: "__chainAbiJsonToBin",
        value: function __chainAbiJsonToBin(abi) {
            var ret;
            return regeneratorRuntime.async(function __chainAbiJsonToBin$(_context20) {
                while (1) {
                    switch (_context20.prev = _context20.next) {
                        case 0:
                            _context20.next = 2;
                            return regeneratorRuntime.awrap(this.__callAPI({
                                url: "/v1/chain/abi_json_to_bin",
                                method: "POST",
                                body: abi
                            }));

                        case 2:
                            ret = _context20.sent;

                            if (!ret.binargs) {
                                _context20.next = 5;
                                break;
                            }

                            return _context20.abrupt("return", ret);

                        case 5:

                            this.__throwServerResponseError(ret);

                        case 6:
                        case "end":
                            return _context20.stop();
                    }
                }
            }, null, this);
        }

        /**
         * 
         * @param {Buffer} buf 
         * @param {object} transaction 
         * @param {string[]} privateKeys 
         */

    }, {
        key: "__signTransaction",
        value: function __signTransaction(buf, transaction, privateKeys) {
            return this.config.signProvider({ signHash: signHash, buf: buf, transaction: transaction, privateKeys: privateKeys });
        }
    }, {
        key: "__getDigestToSign",
        value: function __getDigestToSign(transaction) {
            var ret;
            return regeneratorRuntime.async(function __getDigestToSign$(_context21) {
                while (1) {
                    switch (_context21.prev = _context21.next) {
                        case 0:
                            ret = null;
                            _context21.prev = 1;
                            _context21.next = 4;
                            return regeneratorRuntime.awrap(this.__callAPI({
                                url: "/v1/chain/trx_json_to_digest",
                                method: "POST",
                                body: transaction
                            }));

                        case 4:
                            ret = _context21.sent;
                            _context21.next = 10;
                            break;

                        case 7:
                            _context21.prev = 7;
                            _context21.t0 = _context21["catch"](1);
                            throw _context21.t0;

                        case 10:
                            if (!(ret && ret.digest)) {
                                _context21.next = 12;
                                break;
                            }

                            return _context21.abrupt("return", ret);

                        case 12:

                            this.__throwServerResponseError(ret);

                        case 13:
                        case "end":
                            return _context21.stop();
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
            privateKeys = _ref.privateKeys;

        var keys, pvt, ret, apiRes, required_keys, pvts, missingKeys, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _loop, _iterator4, _step4, sigs, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, _pvt;

        return regeneratorRuntime.async(function _callee$(_context22) {
            while (1) {
                switch (_context22.prev = _context22.next) {
                    case 0:
                        keys = privateKeys;

                        if (keys) {
                            _context22.next = 3;
                            break;
                        }

                        throw new TypeError("This transaction requires a config.keyProvider for signing");

                    case 3:

                        keys = keys.map(function (key) {
                            return {
                                private: ecc.PrivateKey(key).toString(),
                                public: EvtKey.privateToPublic(ecc.PrivateKey(key).toString())
                            };
                        });

                        if (keys.length) {
                            _context22.next = 6;
                            break;
                        }

                        throw new Error("missing key, check your keyProvider");

                    case 6:
                        if (!(keys.length === 1 && keys[0].private)) {
                            _context22.next = 10;
                            break;
                        }

                        pvt = keys[0].private;
                        ret = signHash(buf, pvt);
                        return _context22.abrupt("return", ret);

                    case 10:

                        // Multiple signature support
                        Logger.verbose("[defaultSignProvider] get required_keys, available keys: " + JSON.stringify(keys.map(function (key) {
                            return key.public;
                        }), null, 4));
                        _context22.next = 13;
                        return regeneratorRuntime.awrap(apiCaller.__chainGetRequiredKeys({ transaction: transaction, available_keys: keys.map(function (key) {
                                return key.public;
                            }) }));

                    case 13:
                        apiRes = _context22.sent;
                        required_keys = apiRes.required_keys;


                        Logger.verbose("[defaultSignProvider] got required_keys: " + JSON.stringify(apiRes, null, 4));

                        pvts = [], missingKeys = [];
                        _iteratorNormalCompletion4 = true;
                        _didIteratorError4 = false;
                        _iteratorError4 = undefined;
                        _context22.prev = 20;

                        _loop = function _loop() {
                            var requiredKey = _step4.value;

                            var wifs = keys.filter(function (x) {
                                return x.public == requiredKey;
                            });

                            if (wifs.length == 1) {
                                pvts.push(wifs[0].private);
                            } else {
                                missingKeys.push(requiredKey);
                            }
                        };

                        for (_iterator4 = required_keys[Symbol.iterator](); !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            _loop();
                        }

                        _context22.next = 29;
                        break;

                    case 25:
                        _context22.prev = 25;
                        _context22.t0 = _context22["catch"](20);
                        _didIteratorError4 = true;
                        _iteratorError4 = _context22.t0;

                    case 29:
                        _context22.prev = 29;
                        _context22.prev = 30;

                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }

                    case 32:
                        _context22.prev = 32;

                        if (!_didIteratorError4) {
                            _context22.next = 35;
                            break;
                        }

                        throw _iteratorError4;

                    case 35:
                        return _context22.finish(32);

                    case 36:
                        return _context22.finish(29);

                    case 37:
                        if (!(missingKeys.length !== 0)) {
                            _context22.next = 39;
                            break;
                        }

                        throw new Error("missingKeys for required_key");

                    case 39:
                        sigs = [];

                        console.log("pvts:______" + JSON.stringify(pvts, null, 4));
                        _iteratorNormalCompletion5 = true;
                        _didIteratorError5 = false;
                        _iteratorError5 = undefined;
                        _context22.prev = 44;
                        for (_iterator5 = pvts[Symbol.iterator](); !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                            _pvt = _step5.value;

                            sigs.push(signHash(buf, _pvt));
                        }

                        _context22.next = 52;
                        break;

                    case 48:
                        _context22.prev = 48;
                        _context22.t1 = _context22["catch"](44);
                        _didIteratorError5 = true;
                        _iteratorError5 = _context22.t1;

                    case 52:
                        _context22.prev = 52;
                        _context22.prev = 53;

                        if (!_iteratorNormalCompletion5 && _iterator5.return) {
                            _iterator5.return();
                        }

                    case 55:
                        _context22.prev = 55;

                        if (!_didIteratorError5) {
                            _context22.next = 58;
                            break;
                        }

                        throw _iteratorError5;

                    case 58:
                        return _context22.finish(55);

                    case 59:
                        return _context22.finish(52);

                    case 60:
                        return _context22.abrupt("return", sigs);

                    case 61:
                    case "end":
                        return _context22.stop();
                }
            }
        }, null, this, [[20, 25, 29, 37], [30,, 32, 36], [44, 48, 52, 60], [53,, 55, 59]]);
    };
};

module.exports = { APICaller: APICaller };