"use strict";

var _isInteger = require("babel-runtime/core-js/number/is-integer");

var _isInteger2 = _interopRequireDefault(_isInteger);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
        (0, _classCallCheck3.default)(this, APICaller);

        config = config || new EvtConfig();
        if ((typeof config === "undefined" ? "undefined" : (0, _typeof3.default)(config)) == "object" && config != null && !(config instanceof EvtConfig)) {
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


    (0, _createClass3.default)(APICaller, [{
        key: "__callAPI",
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(request) {
                var url, res, ret;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                url = this.config.endpoint.protocol + "://" + this.config.endpoint.host + ":" + this.config.endpoint.port + request.url;


                                Logger.verbose("[fetch] begin sending request: " + url + ": " + (0, _stringify2.default)(request, null, 4));

                                _context.next = 4;
                                return fetch(url, {
                                    method: request.method,
                                    body: request.body ? (0, _stringify2.default)(request.body) : undefined,
                                    headers: {
                                        "Content-Type": "application/json"
                                    }
                                });

                            case 4:
                                res = _context.sent;
                                _context.next = 7;
                                return res.json();

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
                }, _callee, this);
            }));

            function __callAPI(_x) {
                return _ref.apply(this, arguments);
            }

            return __callAPI;
        }()

        /**
         * get information from everiToken chain node
         */

    }, {
        key: "getInfo",
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                var info;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return this.__callAPI({
                                    url: "/v1/chain/get_info",
                                    method: "GET"
                                });

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
                }, _callee2, this);
            }));

            function getInfo() {
                return _ref2.apply(this, arguments);
            }

            return getInfo;
        }()

        /**
         * get domain list a user created, make sure you have history_plugin enabled on the chain node
         * @param {*} publicKeys a array or a single value which represents public keys you want to query
         */

    }, {
        key: "getCreatedDomains",
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(publicKeys) {
                var res;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.next = 2;
                                return this.__callAPI({
                                    url: "/v1/history/get_domains",
                                    method: "POST",
                                    body: {
                                        keys: Array.isArray(publicKeys) ? publicKeys : [publicKeys]
                                    },
                                    sign: false // no need to sign
                                });

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
                }, _callee3, this);
            }));

            function getCreatedDomains(_x2) {
                return _ref3.apply(this, arguments);
            }

            return getCreatedDomains;
        }()

        /**
         * Get required keys for suspended transactions
         * @param {string} proposalName The proposal name you want to sign
         * @param {string} availableKeys array of public keys you own
         */

    }, {
        key: "getRequiredKeysForSuspendedTransaction",
        value: function () {
            var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(proposalName, availableKeys) {
                var res;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
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
                                return this.__callAPI({
                                    url: "/v1/chain/get_suspend_required_keys",
                                    method: "POST",
                                    body: {
                                        name: proposalName,
                                        available_keys: availableKeys
                                    },
                                    sign: false // no need to sign
                                });

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
                }, _callee4, this);
            }));

            function getRequiredKeysForSuspendedTransaction(_x3, _x4) {
                return _ref4.apply(this, arguments);
            }

            return getRequiredKeysForSuspendedTransaction;
        }()

        /**
         * Get detail information of a suspended transaction
         * @param {string} proposalName The proposal name you want to query
         */

    }, {
        key: "getSuspendedTransactionDetail",
        value: function () {
            var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(proposalName) {
                var res;
                return _regenerator2.default.wrap(function _callee5$(_context5) {
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
                                return this.__callAPI({
                                    url: "/v1/evt/get_suspend",
                                    method: "POST",
                                    body: {
                                        name: proposalName
                                    },
                                    sign: false // no need to sign
                                });

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
                }, _callee5, this);
            }));

            function getSuspendedTransactionDetail(_x5) {
                return _ref5.apply(this, arguments);
            }

            return getSuspendedTransactionDetail;
        }()

        /**
         * get a list of groups, each group in it must has a group key which is contained by provided public keys. Make sure you have history_plugin enabled on the chain node
         * @param {*} publicKeys a array or a single value which represents public keys you want to query
         */

    }, {
        key: "getManagedGroups",
        value: function () {
            var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(publicKeys) {
                var res;
                return _regenerator2.default.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                _context6.next = 2;
                                return this.__callAPI({
                                    url: "/v1/history/get_groups",
                                    method: "POST",
                                    body: {
                                        keys: Array.isArray(publicKeys) ? publicKeys : [publicKeys]
                                    },
                                    sign: false // no need to sign
                                });

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
                }, _callee6, this);
            }));

            function getManagedGroups(_x6) {
                return _ref6.apply(this, arguments);
            }

            return getManagedGroups;
        }()

        /**
         * get owned token list for accounts. Make sure you have history_plugin enabled on the chain node
         * @param {*} publicKeys a array or a single value which represents public keys you want to query
         * @param {boolean} groupByDomain whether group the returned values by domain, only avaiable for chain version >= 3
         */

    }, {
        key: "getOwnedTokens",
        value: function () {
            var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(publicKeys) {
                var groupByDomain = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

                var res, ret, key, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, value;

                return _regenerator2.default.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                _context7.next = 2;
                                return this.__callAPI({
                                    url: "/v1/history/get_tokens",
                                    method: "POST",
                                    body: {
                                        keys: Array.isArray(publicKeys) ? publicKeys : [publicKeys]
                                    },
                                    sign: false // no need to sign
                                });

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
                                _context7.t0 = _regenerator2.default.keys(res);

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

                                for (_iterator = (0, _getIterator3.default)(res[key]); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
                }, _callee7, this, [[22, 26, 30, 38], [31,, 33, 37]]);
            }));

            function getOwnedTokens(_x8) {
                return _ref7.apply(this, arguments);
            }

            return getOwnedTokens;
        }()

        /**
         * get specific token's detail information.
         * @param {string} domain the domain to query
         * @param {string} name the name to query
         */

    }, {
        key: "getToken",
        value: function () {
            var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(domain, name) {
                var res;
                return _regenerator2.default.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                _context8.next = 2;
                                return this.__callAPI({
                                    url: "/v1/evt/get_token",
                                    method: "POST",
                                    body: {
                                        domain: domain, name: name
                                    },
                                    sign: false // no need to sign
                                });

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
                }, _callee8, this);
            }));

            function getToken(_x9, _x10) {
                return _ref8.apply(this, arguments);
            }

            return getToken;
        }()

        /**
         * Query actions by domain, key and action names. Make sure you have history_plugin enabled on the chain node
         * @param {*} params
         */

    }, {
        key: "getActions",
        value: function () {
            var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(params) {
                var res;
                return _regenerator2.default.wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                            case 0:
                                if (!((typeof params === "undefined" ? "undefined" : (0, _typeof3.default)(params)) !== "object")) {
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
                                return this.__callAPI({
                                    url: "/v1/history/get_actions",
                                    method: "POST",
                                    body: params,
                                    sign: false // no need to sign
                                });

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
                }, _callee9, this);
            }));

            function getActions(_x11) {
                return _ref9.apply(this, arguments);
            }

            return getActions;
        }()

        /**
         * get detail information about a transaction by its id. Make sure you have history_plugin enabled on the chain node
         * @param {*} id the id of the transaction
         */

    }, {
        key: "getTransactionDetailById",
        value: function () {
            var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(id) {
                var res;
                return _regenerator2.default.wrap(function _callee10$(_context10) {
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
                                return this.__callAPI({
                                    url: "/v1/history/get_transaction",
                                    method: "POST",
                                    body: { id: id },
                                    sign: false // no need to sign
                                });

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
                }, _callee10, this);
            }));

            function getTransactionDetailById(_x12) {
                return _ref10.apply(this, arguments);
            }

            return getTransactionDetailById;
        }()

        /**
         * get transaction id for a linkId
         * @param {*} id the linkId
         */

    }, {
        key: "getTransactionIdForLinkId",
        value: function () {
            var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11(id) {
                var res;
                return _regenerator2.default.wrap(function _callee11$(_context11) {
                    while (1) {
                        switch (_context11.prev = _context11.next) {
                            case 0:
                                if (!(typeof id !== "string" || !id)) {
                                    _context11.next = 2;
                                    break;
                                }

                                throw new Error("invalid link id");

                            case 2:
                                _context11.next = 4;
                                return this.__callAPI({
                                    url: "/v1/chain/get_trx_id_for_link_id",
                                    method: "POST",
                                    body: { link_id: id },
                                    sign: false // no need to sign
                                });

                            case 4:
                                res = _context11.sent;

                                if (!(res && res.trx_id)) {
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
                }, _callee11, this);
            }));

            function getTransactionIdForLinkId(_x13) {
                return _ref11.apply(this, arguments);
            }

            return getTransactionIdForLinkId;
        }()

        /**
         * Get estimated charge for a transaction
         */

    }, {
        key: "getEstimatedChargeForTransaction",
        value: function () {
            var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12() {
                var args,
                    p,
                    apiRes,
                    required_keys,
                    res,
                    _args12 = arguments;
                return _regenerator2.default.wrap(function _callee12$(_context12) {
                    while (1) {
                        switch (_context12.prev = _context12.next) {
                            case 0:
                                /** @type Array */
                                args = [].slice.call(_args12);

                                if (!(args.length == 0)) {
                                    _context12.next = 3;
                                    break;
                                }

                                throw new Error("invalid arguments");

                            case 3:
                                if (args[0] instanceof EvtAction) {
                                    args = [{}].concat(args);
                                }

                                args[0].__estimateCharge = true;

                                _context12.next = 7;
                                return this.pushTransaction.apply(this, args);

                            case 7:
                                p = _context12.sent;


                                // Get required keys
                                Logger.verbose("[getEstimatedChargeForTransaction] get required_keys, available keys: " + (0, _stringify2.default)(p.publicKeys, null, 4));
                                _context12.next = 11;
                                return this.__chainGetRequiredKeys({ transaction: p.body.transaction, available_keys: p.publicKeys });

                            case 11:
                                apiRes = _context12.sent;
                                required_keys = apiRes.required_keys;


                                Logger.verbose("[getEstimatedChargeForTransaction] got required_keys: " + (0, _stringify2.default)(required_keys, null, 4));

                                _context12.next = 16;
                                return this.__callAPI({
                                    url: "/v1/chain/get_charge",
                                    method: "POST",
                                    body: { transaction: p.body.transaction, sigs_num: required_keys.length },
                                    sign: false // no need to sign
                                });

                            case 16:
                                res = _context12.sent;

                                if (!(res && res.charge)) {
                                    _context12.next = 21;
                                    break;
                                }

                                return _context12.abrupt("return", res);

                            case 21:
                                this.__throwServerResponseError(res);

                            case 22:
                            case "end":
                                return _context12.stop();
                        }
                    }
                }, _callee12, this);
            }));

            function getEstimatedChargeForTransaction() {
                return _ref12.apply(this, arguments);
            }

            return getEstimatedChargeForTransaction;
        }()

        /**
         * get detail information about a domain by its name. Make sure you have history_plugin enabled on the chain node
         * @param {*} name the name of the domain
         */

    }, {
        key: "getDomainDetail",
        value: function () {
            var _ref13 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13(name) {
                var res;
                return _regenerator2.default.wrap(function _callee13$(_context13) {
                    while (1) {
                        switch (_context13.prev = _context13.next) {
                            case 0:
                                if (!(typeof name !== "string" || !name)) {
                                    _context13.next = 2;
                                    break;
                                }

                                throw new Error("invalid domain name");

                            case 2:
                                _context13.next = 4;
                                return this.__callAPI({
                                    url: "/v1/evt/get_domain",
                                    method: "POST",
                                    body: { name: name },
                                    sign: false // no need to sign
                                });

                            case 4:
                                res = _context13.sent;

                                if (!(res && res.name && res.creator)) {
                                    _context13.next = 9;
                                    break;
                                }

                                return _context13.abrupt("return", res);

                            case 9:
                                this.__throwServerResponseError(res);

                            case 10:
                            case "end":
                                return _context13.stop();
                        }
                    }
                }, _callee13, this);
            }));

            function getDomainDetail(_x14) {
                return _ref13.apply(this, arguments);
            }

            return getDomainDetail;
        }()

        /**
         * get balances of a user's all kinds of fungible tokens. Make sure you have history_plugin enabled on the chain node
         * @param {string} address the public key of the user you want to query
         * @param {*} symbol the symbol you want to query, optional
         */

    }, {
        key: "getFungibleBalance",
        value: function () {
            var _ref14 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14(address, symbol) {
                var isNewerVersion, body, res;
                return _regenerator2.default.wrap(function _callee14$(_context14) {
                    while (1) {
                        switch (_context14.prev = _context14.next) {
                            case 0:
                                if (!(typeof address !== "string" || !address)) {
                                    _context14.next = 2;
                                    break;
                                }

                                throw new Error("invalid address");

                            case 2:
                                if (this.__cachedInfo) {
                                    _context14.next = 5;
                                    break;
                                }

                                _context14.next = 5;
                                return this.getInfo();

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

                                _context14.next = 11;
                                return this.__callAPI({
                                    url: isNewerVersion ? "/v1/evt/get_fungible_balance" : "/v1/evt/get_assets",
                                    method: "POST",
                                    body: body,
                                    sign: false // no need to sign
                                });

                            case 11:
                                res = _context14.sent;

                                if (!(res && Array.isArray(res))) {
                                    _context14.next = 16;
                                    break;
                                }

                                return _context14.abrupt("return", res);

                            case 16:
                                this.__throwServerResponseError(res);

                            case 17:
                            case "end":
                                return _context14.stop();
                        }
                    }
                }, _callee14, this);
            }));

            function getFungibleBalance(_x15, _x16) {
                return _ref14.apply(this, arguments);
            }

            return getFungibleBalance;
        }()

        /**
         * get detail information about a group by its name. Make sure you have history_plugin enabled on the chain node
         * @param {*} name the name of the group
         */

    }, {
        key: "getGroupDetail",
        value: function () {
            var _ref15 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee15(name) {
                var res;
                return _regenerator2.default.wrap(function _callee15$(_context15) {
                    while (1) {
                        switch (_context15.prev = _context15.next) {
                            case 0:
                                if (!(typeof name !== "string" || !name)) {
                                    _context15.next = 2;
                                    break;
                                }

                                throw new Error("invalid group name");

                            case 2:
                                _context15.next = 4;
                                return this.__callAPI({
                                    url: "/v1/evt/get_group",
                                    method: "POST",
                                    body: { name: name },
                                    sign: false // no need to sign
                                });

                            case 4:
                                res = _context15.sent;

                                if (!(res && res.name && res.root)) {
                                    _context15.next = 9;
                                    break;
                                }

                                return _context15.abrupt("return", res);

                            case 9:
                                this.__throwServerResponseError(res);

                            case 10:
                            case "end":
                                return _context15.stop();
                        }
                    }
                }, _callee15, this);
            }));

            function getGroupDetail(_x17) {
                return _ref15.apply(this, arguments);
            }

            return getGroupDetail;
        }()

        /**
         * get detail information about a transaction by its id. Make sure you have history_plugin enabled on the chain node
         * @param {string[]} publicKeys a single value or a array of public keys to query (required)
         * @param {number} skip the count to be skipped, default to 0 (optional)
         * @param {number} take the count to be taked, default to 10 (optional)
         */

    }, {
        key: "getTransactionsDetailOfPublicKeys",
        value: function () {
            var _ref16 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee16(publicKeys) {
                var skip = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
                var take = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;
                var body, res;
                return _regenerator2.default.wrap(function _callee16$(_context16) {
                    while (1) {
                        switch (_context16.prev = _context16.next) {
                            case 0:
                                if (publicKeys) {
                                    _context16.next = 2;
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
                                _context16.next = 8;
                                return this.__callAPI({
                                    url: "/v1/history/get_transactions",
                                    method: "POST",
                                    body: body,
                                    sign: false // no need to sign
                                });

                            case 8:
                                res = _context16.sent;

                                if (!Array.isArray(res)) {
                                    _context16.next = 13;
                                    break;
                                }

                                return _context16.abrupt("return", res);

                            case 13:
                                this.__throwServerResponseError(res);

                            case 14:
                            case "end":
                                return _context16.stop();
                        }
                    }
                }, _callee16, this);
            }));

            function getTransactionsDetailOfPublicKeys(_x20) {
                return _ref16.apply(this, arguments);
            }

            return getTransactionsDetailOfPublicKeys;
        }()

        /**
         * get detail information about a fungible symbol by its name.
         * @param {*} name the name of the fungible symbol you want to query
         */

    }, {
        key: "getFungibleSymbolDetail",
        value: function () {
            var _ref17 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee17(name) {
                var res;
                return _regenerator2.default.wrap(function _callee17$(_context17) {
                    while (1) {
                        switch (_context17.prev = _context17.next) {
                            case 0:
                                if (!(typeof name !== "string" || !name)) {
                                    _context17.next = 2;
                                    break;
                                }

                                throw new Error("invalid fungible name");

                            case 2:
                                _context17.next = 4;
                                return this.__callAPI({
                                    url: "/v1/evt/get_fungible",
                                    method: "POST",
                                    body: { name: name },
                                    sign: false // no need to sign
                                });

                            case 4:
                                res = _context17.sent;

                                if (!(res && res.sym && res.creator)) {
                                    _context17.next = 9;
                                    break;
                                }

                                return _context17.abrupt("return", res);

                            case 9:
                                this.__throwServerResponseError(res);

                            case 10:
                            case "end":
                                return _context17.stop();
                        }
                    }
                }, _callee17, this);
            }));

            function getFungibleSymbolDetail(_x21) {
                return _ref17.apply(this, arguments);
            }

            return getFungibleSymbolDetail;
        }()

        /**
         * Get header state of head block.
         */

    }, {
        key: "getHeadBlockHeaderState",
        value: function () {
            var _ref18 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee18() {
                var res;
                return _regenerator2.default.wrap(function _callee18$(_context18) {
                    while (1) {
                        switch (_context18.prev = _context18.next) {
                            case 0:
                                _context18.next = 2;
                                return this.__callAPI({
                                    url: "/v1/chain/get_head_block_header_state",
                                    method: "GET",
                                    sign: false // no need to sign
                                });

                            case 2:
                                res = _context18.sent;

                                if (res.error) {
                                    _context18.next = 7;
                                    break;
                                }

                                return _context18.abrupt("return", res);

                            case 7:
                                this.__throwServerResponseError(res);

                            case 8:
                            case "end":
                                return _context18.stop();
                        }
                    }
                }, _callee18, this);
            }));

            function getHeadBlockHeaderState() {
                return _ref18.apply(this, arguments);
            }

            return getHeadBlockHeaderState;
        }()

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
                    for (var _iterator2 = (0, _getIterator3.default)(res.error.details), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
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

            Logger.verbose("[__throwServerResponseError] node's response return error:\n" + (0, _stringify2.default)(res, null, 4));

            throw err;
        }

        /**
         * Calculate the value of keyProvider
         * @param {string | string[] | function} keyProvider
         * @returns {string[]}
         */

    }, {
        key: "__calcKeyProvider",
        value: function () {
            var _ref19 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee19(keyProvider, trx) {
                var _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, key;

                return _regenerator2.default.wrap(function _callee19$(_context19) {
                    while (1) {
                        switch (_context19.prev = _context19.next) {
                            case 0:
                                if (keyProvider) {
                                    _context19.next = 2;
                                    break;
                                }

                                return _context19.abrupt("return", []);

                            case 2:

                                // if keyProvider is function
                                if (keyProvider.apply && keyProvider.call) {
                                    keyProvider = keyProvider({ transaction: trx });
                                }

                                // resolve for Promise
                                _context19.next = 5;
                                return _promise2.default.resolve(keyProvider);

                            case 5:
                                keyProvider = _context19.sent;


                                if (!Array.isArray(keyProvider)) {
                                    keyProvider = [keyProvider];
                                }

                                _iteratorNormalCompletion3 = true;
                                _didIteratorError3 = false;
                                _iteratorError3 = undefined;
                                _context19.prev = 10;
                                _iterator3 = (0, _getIterator3.default)(keyProvider);

                            case 12:
                                if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                                    _context19.next = 19;
                                    break;
                                }

                                key = _step3.value;

                                if (EvtKey.isValidPrivateKey(key)) {
                                    _context19.next = 16;
                                    break;
                                }

                                throw new Error("Invalid private key");

                            case 16:
                                _iteratorNormalCompletion3 = true;
                                _context19.next = 12;
                                break;

                            case 19:
                                _context19.next = 25;
                                break;

                            case 21:
                                _context19.prev = 21;
                                _context19.t0 = _context19["catch"](10);
                                _didIteratorError3 = true;
                                _iteratorError3 = _context19.t0;

                            case 25:
                                _context19.prev = 25;
                                _context19.prev = 26;

                                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                    _iterator3.return();
                                }

                            case 28:
                                _context19.prev = 28;

                                if (!_didIteratorError3) {
                                    _context19.next = 31;
                                    break;
                                }

                                throw _iteratorError3;

                            case 31:
                                return _context19.finish(28);

                            case 32:
                                return _context19.finish(25);

                            case 33:
                                return _context19.abrupt("return", keyProvider);

                            case 34:
                            case "end":
                                return _context19.stop();
                        }
                    }
                }, _callee19, this, [[10, 21, 25, 33], [26,, 28, 32]]);
            }));

            function __calcKeyProvider(_x22, _x23) {
                return _ref19.apply(this, arguments);
            }

            return __calcKeyProvider;
        }()

        /**
         * Calculate the value of publicKeyProvider
         * @param {string | string[] | function} keyProvider
         * @returns {string[]}
         */

    }, {
        key: "__calcPublicKeyProvider",
        value: function () {
            var _ref20 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee20(keyProvider) {
                var _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, key;

                return _regenerator2.default.wrap(function _callee20$(_context20) {
                    while (1) {
                        switch (_context20.prev = _context20.next) {
                            case 0:
                                if (keyProvider) {
                                    _context20.next = 2;
                                    break;
                                }

                                return _context20.abrupt("return", []);

                            case 2:

                                // if keyProvider is function
                                if (keyProvider.apply && keyProvider.call) {
                                    keyProvider = keyProvider();
                                }

                                // resolve for Promise
                                _context20.next = 5;
                                return _promise2.default.resolve(keyProvider);

                            case 5:
                                keyProvider = _context20.sent;


                                if (!Array.isArray(keyProvider)) {
                                    keyProvider = [keyProvider];
                                }

                                _iteratorNormalCompletion4 = true;
                                _didIteratorError4 = false;
                                _iteratorError4 = undefined;
                                _context20.prev = 10;
                                _iterator4 = (0, _getIterator3.default)(keyProvider);

                            case 12:
                                if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                                    _context20.next = 19;
                                    break;
                                }

                                key = _step4.value;

                                if (EvtKey.isValidPublicKey(key)) {
                                    _context20.next = 16;
                                    break;
                                }

                                throw new Error("Invalid public key");

                            case 16:
                                _iteratorNormalCompletion4 = true;
                                _context20.next = 12;
                                break;

                            case 19:
                                _context20.next = 25;
                                break;

                            case 21:
                                _context20.prev = 21;
                                _context20.t0 = _context20["catch"](10);
                                _didIteratorError4 = true;
                                _iteratorError4 = _context20.t0;

                            case 25:
                                _context20.prev = 25;
                                _context20.prev = 26;

                                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                    _iterator4.return();
                                }

                            case 28:
                                _context20.prev = 28;

                                if (!_didIteratorError4) {
                                    _context20.next = 31;
                                    break;
                                }

                                throw _iteratorError4;

                            case 31:
                                return _context20.finish(28);

                            case 32:
                                return _context20.finish(25);

                            case 33:
                                return _context20.abrupt("return", keyProvider);

                            case 34:
                            case "end":
                                return _context20.stop();
                        }
                    }
                }, _callee20, this, [[10, 21, 25, 33], [26,, 28, 32]]);
            }));

            function __calcPublicKeyProvider(_x24) {
                return _ref20.apply(this, arguments);
            }

            return __calcPublicKeyProvider;
        }()

        /**
         * push transaction to everiToken chain
         * @param {any[]} actions actions in the transaction
         */

    }, {
        key: "pushTransaction",
        value: function () {
            var _ref21 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee21() {
                var actions,
                    hasConfig,
                    trxConf,
                    privateKeys,
                    publicKeys,
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
                    _args21 = arguments;

                return _regenerator2.default.wrap(function _callee21$(_context21) {
                    while (1) {
                        switch (_context21.prev = _context21.next) {
                            case 0:
                                actions = [];
                                hasConfig = false;

                                // default config

                                trxConf = {
                                    maxCharge: 100000000
                                };

                                // check and copy config from parameters

                                if (_args21.length > 0 && !(_args21[0] instanceof EvtAction) && !_args21[0].action) {
                                    // config found
                                    (0, _assign2.default)(trxConf, _args21[0]);
                                    hasConfig = true;
                                }

                                // calculate and cache private keys
                                privateKeys = [];
                                publicKeys = [];

                                // user can use availablePublicKeys in config for estimate, or use keyProvider as a backup

                                if (!(!trxConf.__estimateCharge || !trxConf.availablePublicKeys)) {
                                    _context21.next = 13;
                                    break;
                                }

                                _context21.next = 9;
                                return this.__calcKeyProvider(this.config.keyProvider, null);

                            case 9:
                                privateKeys = _context21.sent;

                                publicKeys = privateKeys.map(function (x) {
                                    return EvtKey.privateToPublic(x);
                                });
                                _context21.next = 16;
                                break;

                            case 13:
                                _context21.next = 15;
                                return this.__calcPublicKeyProvider(trxConf.availablePublicKeys);

                            case 15:
                                publicKeys = _context21.sent;

                            case 16:

                                // set default payer if user provided only one private key
                                if (!trxConf.payer && privateKeys.length == 1) {
                                    trxConf.payer = EvtKey.privateToPublic(privateKeys[0]);
                                }

                                for (i = hasConfig ? 1 : 0; i < _args21.length; ++i) {
                                    actions.push(_args21[i]);
                                }

                                // check arguments

                                if (!(actions.length == 0)) {
                                    _context21.next = 20;
                                    break;
                                }

                                throw new Error("At least 1 action needed");

                            case 20:
                                if (!(trxConf.maxCharge == null || !(0, _isInteger2.default)(trxConf.maxCharge))) {
                                    _context21.next = 22;
                                    break;
                                }

                                throw new Error("maxCharge is required and must be a integer greater than or eqaul to 0");

                            case 22:
                                if (!(!trxConf.__estimateCharge && (trxConf.payer == null || !EvtKey.isValidAddress(trxConf.payer)))) {
                                    _context21.next = 24;
                                    break;
                                }

                                throw new Error("payer is required and must be a valid address as a string");

                            case 24:
                                params = {
                                    transaction: {
                                        actions: actions
                                    }
                                };
                                // check arguments

                                if (params.transaction) {
                                    _context21.next = 27;
                                    break;
                                }

                                throw new Error("invalid format of params: no transaction field");

                            case 27:

                                params.sign = params.sign !== false ? true : false;

                                // building the body of the request
                                body = { transaction: params.transaction };

                                // make sure that it there is basic information about the chain

                                if (this.__cachedInfo) {
                                    _context21.next = 32;
                                    break;
                                }

                                _context21.next = 32;
                                return this.getInfo();

                            case 32:
                                _i = 0;

                            case 33:
                                if (!(_i < body.transaction.actions.length)) {
                                    _context21.next = 49;
                                    break;
                                }

                                if (!(body.transaction.actions[_i] instanceof EvtAction)) {
                                    body.transaction.actions[_i] = new EvtAction(body.transaction.actions[_i].action, body.transaction.actions[_i].args);
                                }

                                _context21.next = 37;
                                return body.transaction.actions[_i].calculateDomainAndKey();

                            case 37:

                                /** @type {EvtAction} */
                                originalAction = body.transaction.actions[_i];

                                // create binary action for push_transaction

                                _context21.t0 = originalAction.actionName;
                                _context21.next = 41;
                                return this.__chainAbiJsonToBin({ action: originalAction.actionName, args: originalAction.abi });

                            case 41:
                                _context21.t1 = _context21.sent.binargs;
                                _context21.t2 = originalAction.domain;
                                _context21.t3 = originalAction.key;
                                binAction = {
                                    name: _context21.t0,
                                    data: _context21.t1,
                                    domain: _context21.t2,
                                    key: _context21.t3
                                };


                                // override action
                                body.transaction.actions[_i] = binAction;

                            case 46:
                                ++_i;
                                _context21.next = 33;
                                break;

                            case 49:
                                expiration = void 0, hash = void 0, numHex = void 0, last_irreversible_block_num = void 0, last_irreversible_block_prefix = void 0;

                                // process referenced block number and expiration time for transaction

                                expiration = new Date(new Date().valueOf() + 100000).toISOString().substr(0, 19);
                                hash = ByteBuffer.fromHex(this.__cachedInfo.last_irreversible_block_id, true); // little endian
                                numHex = this.__cachedInfo.last_irreversible_block_id.substr(4, 4);
                                last_irreversible_block_num = ByteBuffer.fromHex(numHex, false).readUint16(0);
                                last_irreversible_block_prefix = hash.readUInt32(8);

                                body = (0, _assign2.default)(body, {
                                    compression: "none"
                                });

                                body.transaction = (0, _assign2.default)(body.transaction, {
                                    "expiration": expiration,
                                    "ref_block_num": last_irreversible_block_num,
                                    "ref_block_prefix": last_irreversible_block_prefix
                                });

                                // add payer and maxCharge to the transaction
                                body.transaction.max_charge = trxConf.maxCharge;
                                body.transaction.payer = trxConf.payer;

                                if (!trxConf.__estimateCharge) {
                                    _context21.next = 61;
                                    break;
                                }

                                return _context21.abrupt("return", { body: body, publicKeys: publicKeys });

                            case 61:
                                if (!params.sign) {
                                    _context21.next = 71;
                                    break;
                                }

                                _context21.next = 64;
                                return this.__getDigestToSign(body.transaction);

                            case 64:
                                digestRes = _context21.sent.digest;


                                // sign
                                signBuf = new Buffer(digestRes, "hex");
                                _context21.next = 68;
                                return this.__signTransaction(signBuf, body.transaction, privateKeys);

                            case 68:
                                sigs = _context21.sent;


                                if (!Array.isArray(sigs)) {
                                    sigs = [sigs];
                                }

                                body.signatures = sigs;

                            case 71:
                                _context21.next = 73;
                                return this.__chainPushTransaction(body);

                            case 73:
                                res = _context21.sent;

                                if (!(res && res.processed && res.processed.receipt && res.processed.receipt.status === "executed")) {
                                    _context21.next = 78;
                                    break;
                                }

                                return _context21.abrupt("return", { transactionId: res.transaction_id });

                            case 78:
                                if (!(res && res.error && res.error.details && res.error.details.length)) {
                                    _context21.next = 82;
                                    break;
                                }

                                this.__throwServerResponseError(res);
                                _context21.next = 83;
                                break;

                            case 82:
                                throw new Error("did not receive anything from the chain");

                            case 83:
                            case "end":
                                return _context21.stop();
                        }
                    }
                }, _callee21, this);
            }));

            function pushTransaction() {
                return _ref21.apply(this, arguments);
            }

            return pushTransaction;
        }()
    }, {
        key: "__chainAbiJsonToBin",
        value: function () {
            var _ref22 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee22(abi) {
                var ret;
                return _regenerator2.default.wrap(function _callee22$(_context22) {
                    while (1) {
                        switch (_context22.prev = _context22.next) {
                            case 0:
                                _context22.next = 2;
                                return this.__callAPI({
                                    url: "/v1/chain/abi_json_to_bin",
                                    method: "POST",
                                    body: abi
                                });

                            case 2:
                                ret = _context22.sent;

                                if (!ret.binargs) {
                                    _context22.next = 5;
                                    break;
                                }

                                return _context22.abrupt("return", ret);

                            case 5:

                                this.__throwServerResponseError(ret);

                            case 6:
                            case "end":
                                return _context22.stop();
                        }
                    }
                }, _callee22, this);
            }));

            function __chainAbiJsonToBin(_x25) {
                return _ref22.apply(this, arguments);
            }

            return __chainAbiJsonToBin;
        }()

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
        value: function () {
            var _ref23 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee23(transaction) {
                var ret;
                return _regenerator2.default.wrap(function _callee23$(_context23) {
                    while (1) {
                        switch (_context23.prev = _context23.next) {
                            case 0:
                                ret = null;
                                _context23.prev = 1;
                                _context23.next = 4;
                                return this.__callAPI({
                                    url: "/v1/chain/trx_json_to_digest",
                                    method: "POST",
                                    body: transaction
                                });

                            case 4:
                                ret = _context23.sent;
                                _context23.next = 10;
                                break;

                            case 7:
                                _context23.prev = 7;
                                _context23.t0 = _context23["catch"](1);
                                throw _context23.t0;

                            case 10:
                                if (!(ret && ret.digest)) {
                                    _context23.next = 12;
                                    break;
                                }

                                return _context23.abrupt("return", ret);

                            case 12:

                                this.__throwServerResponseError(ret);

                            case 13:
                            case "end":
                                return _context23.stop();
                        }
                    }
                }, _callee23, this, [[1, 7]]);
            }));

            function __getDigestToSign(_x26) {
                return _ref23.apply(this, arguments);
            }

            return __getDigestToSign;
        }()
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
    return function () {
        var _ref25 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee24(_ref24) {
            var sign = _ref24.sign,
                buf = _ref24.buf,
                transaction = _ref24.transaction,
                privateKeys = _ref24.privateKeys;

            var keys, pvt, ret, apiRes, required_keys, pvts, missingKeys, _loop, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, requiredKey, sigs, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, _pvt;

            return _regenerator2.default.wrap(function _callee24$(_context24) {
                while (1) {
                    switch (_context24.prev = _context24.next) {
                        case 0:
                            keys = privateKeys;

                            if (keys) {
                                _context24.next = 3;
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
                                _context24.next = 6;
                                break;
                            }

                            throw new Error("missing key, check your keyProvider");

                        case 6:
                            if (!(keys.length === 1 && keys[0].private)) {
                                _context24.next = 10;
                                break;
                            }

                            pvt = keys[0].private;
                            ret = signHash(buf, pvt);
                            return _context24.abrupt("return", ret);

                        case 10:

                            // Multiple signature support
                            Logger.verbose("[defaultSignProvider] get required_keys, available keys: " + (0, _stringify2.default)(keys.map(function (key) {
                                return key.public;
                            }), null, 4));
                            _context24.next = 13;
                            return apiCaller.__chainGetRequiredKeys({ transaction: transaction, available_keys: keys.map(function (key) {
                                    return key.public;
                                }) });

                        case 13:
                            apiRes = _context24.sent;
                            required_keys = apiRes.required_keys;


                            Logger.verbose("[defaultSignProvider] got required_keys: " + (0, _stringify2.default)(apiRes, null, 4));

                            pvts = [], missingKeys = [];

                            _loop = function _loop(requiredKey) {
                                var wifs = keys.filter(function (x) {
                                    return x.public == requiredKey;
                                });

                                if (wifs.length == 1) {
                                    pvts.push(wifs[0].private);
                                } else {
                                    missingKeys.push(requiredKey);
                                }
                            };

                            _iteratorNormalCompletion5 = true;
                            _didIteratorError5 = false;
                            _iteratorError5 = undefined;
                            _context24.prev = 21;


                            for (_iterator5 = (0, _getIterator3.default)(required_keys); !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                requiredKey = _step5.value;

                                _loop(requiredKey);
                            }

                            _context24.next = 29;
                            break;

                        case 25:
                            _context24.prev = 25;
                            _context24.t0 = _context24["catch"](21);
                            _didIteratorError5 = true;
                            _iteratorError5 = _context24.t0;

                        case 29:
                            _context24.prev = 29;
                            _context24.prev = 30;

                            if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                _iterator5.return();
                            }

                        case 32:
                            _context24.prev = 32;

                            if (!_didIteratorError5) {
                                _context24.next = 35;
                                break;
                            }

                            throw _iteratorError5;

                        case 35:
                            return _context24.finish(32);

                        case 36:
                            return _context24.finish(29);

                        case 37:
                            if (!(missingKeys.length !== 0)) {
                                _context24.next = 39;
                                break;
                            }

                            throw new Error("missingKeys for required_key");

                        case 39:
                            sigs = [];
                            _iteratorNormalCompletion6 = true;
                            _didIteratorError6 = false;
                            _iteratorError6 = undefined;
                            _context24.prev = 43;

                            for (_iterator6 = (0, _getIterator3.default)(pvts); !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                                _pvt = _step6.value;

                                sigs.push(signHash(buf, _pvt));
                            }

                            _context24.next = 51;
                            break;

                        case 47:
                            _context24.prev = 47;
                            _context24.t1 = _context24["catch"](43);
                            _didIteratorError6 = true;
                            _iteratorError6 = _context24.t1;

                        case 51:
                            _context24.prev = 51;
                            _context24.prev = 52;

                            if (!_iteratorNormalCompletion6 && _iterator6.return) {
                                _iterator6.return();
                            }

                        case 54:
                            _context24.prev = 54;

                            if (!_didIteratorError6) {
                                _context24.next = 57;
                                break;
                            }

                            throw _iteratorError6;

                        case 57:
                            return _context24.finish(54);

                        case 58:
                            return _context24.finish(51);

                        case 59:
                            return _context24.abrupt("return", sigs);

                        case 60:
                        case "end":
                            return _context24.stop();
                    }
                }
            }, _callee24, this, [[21, 25, 29, 37], [30,, 32, 36], [43, 47, 51, 59], [52,, 54, 58]]);
        }));

        return function (_x27) {
            return _ref25.apply(this, arguments);
        };
    }();
};

module.exports = { APICaller: APICaller };