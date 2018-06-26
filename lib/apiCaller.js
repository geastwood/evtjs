'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ecc = require('eosjs-ecc');
var signHash = ecc.signHash,
    verifyHash = ecc.verifyHash;

var AbiCache = require('./abi-cache');
var AssetCache = require('./asset-cache');
var EvtConfig = require("./evtConfig");

var _require = require("./fetch"),
    fetch = _require.fetch;

var ByteBuffer = require('bytebuffer');

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
        if ((typeof config === 'undefined' ? 'undefined' : _typeof(config)) == 'object' && config != null && !(config instanceof EvtConfig)) {
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
        key: '__callAPI',
        value: function __callAPI(request) {
            var url, signBuf, sigs, res;
            return regeneratorRuntime.async(function __callAPI$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            url = this.config.endpoint.protocol + "://" + this.config.endpoint.host + ":" + this.config.endpoint.port + request.url;

                            if (!request.__fixedSignature) {
                                _context.next = 9;
                                break;
                            }

                            // add signature
                            signBuf = Buffer.from('2800f0f3f88ce2b4a8c6ce4c20a91f5a7e3647fa73894e9d2bc4cc61b6bda1be', 'hex');
                            _context.next = 5;
                            return regeneratorRuntime.awrap(this.__signTransaction(signBuf, request.body || {}, request.__fixedKeyToUse));

                        case 5:
                            sigs = _context.sent;


                            if (!Array.isArray(sigs)) {
                                sigs = [sigs];
                            }

                            request.body = request.body || {};
                            request.body.signatures = sigs;

                        case 9:
                            _context.next = 11;
                            return regeneratorRuntime.awrap(fetch(url, {
                                method: request.method,
                                body: request.body ? JSON.stringify(request.body) : undefined,
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }));

                        case 11:
                            res = _context.sent;
                            _context.next = 14;
                            return regeneratorRuntime.awrap(res.json());

                        case 14:
                            return _context.abrupt('return', _context.sent);

                        case 15:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, null, this);
        }

        /**
         * get information from everiToken chain node
         */

    }, {
        key: 'getInfo',
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

                            if (info.evt_api_version.startsWith('1.')) {
                                _context2.next = 6;
                                break;
                            }

                            throw new Error("The API version of remote net is not compatible with current evtjs's version.");

                        case 6:
                            return _context2.abrupt('return', info);

                        case 7:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, null, this);
        }

        /**
         * get balance and other basic information of a user account
         * @param {*} name 
         */

    }, {
        key: 'getAccount',
        value: function getAccount(name) {
            return regeneratorRuntime.async(function getAccount$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.next = 2;
                            return regeneratorRuntime.awrap(this.__callAPI({
                                url: "/v1/evt/get_account",
                                method: "POST",
                                body: {
                                    name: name
                                }
                            }));

                        case 2:
                            return _context3.abrupt('return', _context3.sent);

                        case 3:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, null, this);
        }

        /**
         * (TODO) get domain list a user joined in (TODO) What dose `join in a domain` mean ??
         * @param {*} name 
         */

    }, {
        key: 'getJoinedDomainList',
        value: function getJoinedDomainList(accountName, keyToUse) {
            return regeneratorRuntime.async(function getJoinedDomainList$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.next = 2;
                            return regeneratorRuntime.awrap(this.__fixedSignatureCall({
                                url: "/v1/evt/get_my_domains",
                                method: "POST",
                                body: {}
                            }, "everiWallet", keyToUse));

                        case 2:
                            _context4.t0 = function (x) {
                                return { name: x };
                            };

                            return _context4.abrupt('return', _context4.sent.map(_context4.t0));

                        case 4:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, null, this);
        }

        /**
         * get group list a user joined in
         * @param {*} name 
         */

    }, {
        key: 'getJoinedGroupList',
        value: function getJoinedGroupList(accountName, keyToUse) {
            return regeneratorRuntime.async(function getJoinedGroupList$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            _context5.next = 2;
                            return regeneratorRuntime.awrap(this.__fixedSignatureCall({
                                url: "/v1/evt/get_my_groups",
                                method: "POST",
                                body: {}
                            }, "everiWallet", keyToUse));

                        case 2:
                            _context5.t0 = function (x) {
                                return { name: x };
                            };

                            return _context5.abrupt('return', _context5.sent.map(_context5.t0));

                        case 4:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, null, this);
        }

        /**
         * get owned token list for a account
         * @param {*} name 
         */

    }, {
        key: 'getOwnedTokens',
        value: function getOwnedTokens(accountName, keyToUse) {
            return regeneratorRuntime.async(function getOwnedTokens$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            _context6.next = 2;
                            return regeneratorRuntime.awrap(this.__fixedSignatureCall({
                                url: "/v1/evt/get_my_tokens",
                                method: "POST",
                                body: {}
                            }, "everiWallet", keyToUse));

                        case 2:
                            _context6.t0 = function (x) {
                                return { name: x.substr(x.lastIndexOf('-') + 1), domain: x.substr(0, x.lastIndexOf('-')) };
                            };

                            return _context6.abrupt('return', _context6.sent.map(_context6.t0));

                        case 4:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, null, this);
        }
    }, {
        key: '__fixedSignatureCall',
        value: function __fixedSignatureCall(args) {
            var fixedDataToSign = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'everiWallet';
            var fixedKeyToUse = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
            return regeneratorRuntime.async(function __fixedSignatureCall$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            args.__fixedSignature = fixedDataToSign;
                            args.__fixedKeyToUse = fixedKeyToUse;

                            // console.log(JSON.stringify(args, null, 4));

                            _context7.next = 4;
                            return regeneratorRuntime.awrap(this.__callAPI(args));

                        case 4:
                            return _context7.abrupt('return', _context7.sent);

                        case 5:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, null, this);
        }

        /**
         * push transaction to everiToken chain
         */

    }, {
        key: 'pushTransaction',
        value: function pushTransaction(args) {
            var i, originalAction, binAction, expiration, hash, numHex, last_irreversible_block_num, last_irreversible_block_prefix, digestRes, signBuf, sigs, res;
            return regeneratorRuntime.async(function pushTransaction$(_context8) {
                while (1) {
                    switch (_context8.prev = _context8.next) {
                        case 0:

                            args = JSON.parse(JSON.stringify(args));
                            // make sure that it there is basic information about the chain

                            if (this.__cachedInfo) {
                                _context8.next = 4;
                                break;
                            }

                            _context8.next = 4;
                            return regeneratorRuntime.awrap(this.getInfo());

                        case 4:
                            i = 0;

                        case 5:
                            if (!(i < args.transaction.actions.length)) {
                                _context8.next = 17;
                                break;
                            }

                            originalAction = args.transaction.actions[i];

                            // create binary action for push_transaction
                            //console.log(JSON.stringify(await this.__chainAbiJsonToBin(originalAction), null, 4));

                            _context8.t0 = originalAction.action;
                            _context8.next = 10;
                            return regeneratorRuntime.awrap(this.__chainAbiJsonToBin(originalAction));

                        case 10:
                            _context8.t1 = _context8.sent.binargs;
                            binAction = {
                                name: _context8.t0,
                                data: _context8.t1
                            };


                            // use mapper to determine the `domain` and `key` field
                            domainKeyMappers[originalAction.action](originalAction, binAction);

                            // override action
                            args.transaction.actions[i] = binAction;

                        case 14:
                            ++i;
                            _context8.next = 5;
                            break;

                        case 17:

                            // fill extra fields for trx
                            expiration = new Date(new Date().valueOf() + 100000).toISOString().substr(0, 19);
                            hash = ByteBuffer.fromHex(this.__cachedInfo.last_irreversible_block_id, true); // little endian

                            numHex = this.__cachedInfo.last_irreversible_block_id.substr(4, 4);
                            last_irreversible_block_num = ByteBuffer.fromHex(numHex, false).readUint16(0);
                            last_irreversible_block_prefix = hash.readUInt32(8);


                            args = Object.assign(args, {
                                compression: 'none'
                            });

                            args.transaction = Object.assign(args.transaction, {
                                "expiration": expiration,
                                "ref_block_num": last_irreversible_block_num,
                                "ref_block_prefix": last_irreversible_block_prefix,
                                "delay_sec": 0
                            });

                            // get digest of the whole trx
                            //console.log(JSON.stringify(args, null, 4));
                            _context8.next = 26;
                            return regeneratorRuntime.awrap(this.__getDigestToSign(args.transaction));

                        case 26:
                            digestRes = _context8.sent.digest;

                            //console.log(digestRes);

                            // sign
                            signBuf = new Buffer(digestRes, 'hex');
                            _context8.next = 30;
                            return regeneratorRuntime.awrap(this.__signTransaction(signBuf, args.transaction));

                        case 30:
                            sigs = _context8.sent;


                            if (!Array.isArray(sigs)) {
                                sigs = [sigs];
                            }

                            args.signatures = sigs;

                            // push transaction
                            _context8.next = 35;
                            return regeneratorRuntime.awrap(this.__chainPushTransaction(args));

                        case 35:
                            res = _context8.sent;

                            if (!(res && res.processed && res.processed.receipt && res.processed.receipt.status === 'executed')) {
                                _context8.next = 40;
                                break;
                            }

                            return _context8.abrupt('return', true);

                        case 40:
                            if (!(res && res.error && res.error.details && res.error.details.length)) {
                                _context8.next = 44;
                                break;
                            }

                            throw new Error(res.error.what + " (" + res.error.code + "): " + res.error.details.map(function (r) {
                                return r.message ? r.message + "; " : "";
                            }));

                        case 44:
                            throw new Error("did not receive anything from the chain");

                        case 45:
                        case 'end':
                            return _context8.stop();
                    }
                }
            }, null, this);
        }
    }, {
        key: '__chainAbiJsonToBin',
        value: function __chainAbiJsonToBin(abi) {
            return this.__callAPI({
                url: "/v1/chain/abi_json_to_bin",
                method: "POST",
                body: abi
            });
        }
    }, {
        key: '__signTransaction',
        value: function __signTransaction(buf, transaction, keyToUse) {
            return this.config.signProvider({ signHash: signHash, buf: buf, transaction: transaction, keyToUse: keyToUse });
        }
    }, {
        key: '__getDigestToSign',
        value: function __getDigestToSign(transaction) {
            return this.__callAPI({
                url: "/v1/chain/trx_json_to_digest",
                method: "POST",
                body: transaction
            });
        }
    }, {
        key: '__chainPushTransaction',
        value: function __chainPushTransaction(tr) {
            return this.__callAPI({
                url: "/v1/chain/push_transaction",
                method: "POST",
                body: tr
            });
        }
    }, {
        key: '__chainGetRequiredKeys',
        value: function __chainGetRequiredKeys(body) {
            console.log("[__chainGetRequiredKeys] " + JSON.stringify(body, null, 4));

            return this.__callAPI({
                url: "/v1/chain/get_required_keys",
                method: "POST",
                body: body
            });
        }
    }]);

    return APICaller;
}();

var domainKeyMappers = {
    'newdomain': function newdomain(action, transfered) {
        transfered.domain = "domain";
        transfered.key = action.args.name;
    },

    'issuetoken': function issuetoken(action, transfered) {
        transfered.domain = action.args.domain;
        transfered.key = "issue";
    },

    'newgroup': function newgroup(action, transfered) {
        transfered.domain = 'group';
        transfered.key = action.args.name;
    },

    'newaccount': function newaccount(action, transfered) {
        transfered.domain = 'account';
        transfered.key = action.args.name;
    },

    'transferevt': function transferevt(action, transfered) {
        transfered.domain = 'account';
        transfered.key = action.args.from;
    }
};

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

        var keyProvider, keys, pvt, ret, keyMap, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, key, isPrivate, isPublic, pubkeys, _pvt, apiRes, required_keys, pvts, missingKeys, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, requiredKey, wif, sigs, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _pvt2;

        return regeneratorRuntime.async(function _callee$(_context9) {
            while (1) {
                switch (_context9.prev = _context9.next) {
                    case 0:
                        keyProvider = config.keyProvider;

                        if (keyProvider) {
                            _context9.next = 3;
                            break;
                        }

                        throw new TypeError('This transaction requires a config.keyProvider for signing');

                    case 3:
                        keys = keyProvider;

                        if (typeof keyProvider === 'function') {
                            keys = keyProvider({ transaction: transaction });
                        }

                        // keyProvider may return keys or Promise<keys>
                        _context9.next = 7;
                        return regeneratorRuntime.awrap(Promise.resolve(keys));

                    case 7:
                        keys = _context9.sent;


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
                            assert(false, 'expecting public or private keys from keyProvider');
                        });

                        if (keys.length) {
                            _context9.next = 12;
                            break;
                        }

                        throw new Error('missing key, check your keyProvider');

                    case 12:
                        if (!(keys.length === 1 && keys[0].private)) {
                            _context9.next = 16;
                            break;
                        }

                        pvt = keys[0].private;
                        ret = signHash(buf, pvt);
                        return _context9.abrupt('return', ret);

                    case 16:
                        keyMap = new Map();

                        // keys are either public or private keys

                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context9.prev = 20;
                        for (_iterator = keys[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            key = _step.value;
                            isPrivate = key.private != null;
                            isPublic = key.public != null;


                            if (isPrivate) {
                                keyMap.set(ecc.privateToPublic(key.private), key.private);
                            } else {
                                keyMap.set(key.public, null);
                            }
                        }

                        _context9.next = 28;
                        break;

                    case 24:
                        _context9.prev = 24;
                        _context9.t0 = _context9['catch'](20);
                        _didIteratorError = true;
                        _iteratorError = _context9.t0;

                    case 28:
                        _context9.prev = 28;
                        _context9.prev = 29;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 31:
                        _context9.prev = 31;

                        if (!_didIteratorError) {
                            _context9.next = 34;
                            break;
                        }

                        throw _iteratorError;

                    case 34:
                        return _context9.finish(31);

                    case 35:
                        return _context9.finish(28);

                    case 36:
                        pubkeys = Array.from(keyMap.keys());

                        if (!keyToUse) {
                            _context9.next = 43;
                            break;
                        }

                        _pvt = keyMap[keyToUse];

                        if (!_pvt) {
                            _context9.next = 42;
                            break;
                        }

                        ret = signHash(buf, _pvt);
                        return _context9.abrupt('return', ret);

                    case 42:
                        throw new Error("the key provided is not found");

                    case 43:
                        _context9.next = 45;
                        return regeneratorRuntime.awrap(apiCaller.__chainGetRequiredKeys({ transaction: transaction, available_keys: keys.map(function (key) {
                                return ecc.privateToPublic(key.private);
                            }) }));

                    case 45:
                        apiRes = _context9.sent;
                        required_keys = apiRes.required_keys;

                        // console.log("required_keys: " + JSON.stringify(apiRes, null, 4));

                        /*return eos.getRequiredKeys(transaction, pubkeys).then(({ required_keys }) => {
                            if (!required_keys.length) {
                                throw new Error('missing required keys for ' + JSON.stringify(transaction))
                            }*/

                        pvts = [], missingKeys = [];


                        required_keys = pubkeys[0]; // assume that we need only the first key, will be changed in the future TODO

                        _iteratorNormalCompletion2 = true;
                        _didIteratorError2 = false;
                        _iteratorError2 = undefined;
                        _context9.prev = 52;
                        for (_iterator2 = required_keys[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            requiredKey = _step2.value;

                            // normalize (EOSKey.. => PUB_K1_Key..)
                            requiredKey = ecc.PublicKey(requiredKey).toString();

                            wif = keyMap.get(requiredKey);

                            if (wif) {
                                pvts.push(wif);
                            } else {
                                missingKeys.push(requiredKey);
                            }
                        }

                        _context9.next = 60;
                        break;

                    case 56:
                        _context9.prev = 56;
                        _context9.t1 = _context9['catch'](52);
                        _didIteratorError2 = true;
                        _iteratorError2 = _context9.t1;

                    case 60:
                        _context9.prev = 60;
                        _context9.prev = 61;

                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }

                    case 63:
                        _context9.prev = 63;

                        if (!_didIteratorError2) {
                            _context9.next = 66;
                            break;
                        }

                        throw _iteratorError2;

                    case 66:
                        return _context9.finish(63);

                    case 67:
                        return _context9.finish(60);

                    case 68:
                        if (missingKeys.length !== 0) {
                            assert(typeof keyProvider === 'function', 'keyProvider function is needed for private key lookup');

                            // const pubkeys = missingKeys.map(key => ecc.PublicKey(key).toStringLegacy())
                            keyProvider({ pubkeys: missingKeys }).forEach(function (pvt) {
                                pvts.push(pvt);
                            });
                        }

                        sigs = [];
                        _iteratorNormalCompletion3 = true;
                        _didIteratorError3 = false;
                        _iteratorError3 = undefined;
                        _context9.prev = 73;

                        for (_iterator3 = pvts[Symbol.iterator](); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            _pvt2 = _step3.value;

                            sigs.push(signHash(buf, _pvt2));
                        }

                        _context9.next = 81;
                        break;

                    case 77:
                        _context9.prev = 77;
                        _context9.t2 = _context9['catch'](73);
                        _didIteratorError3 = true;
                        _iteratorError3 = _context9.t2;

                    case 81:
                        _context9.prev = 81;
                        _context9.prev = 82;

                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }

                    case 84:
                        _context9.prev = 84;

                        if (!_didIteratorError3) {
                            _context9.next = 87;
                            break;
                        }

                        throw _iteratorError3;

                    case 87:
                        return _context9.finish(84);

                    case 88:
                        return _context9.finish(81);

                    case 89:
                        return _context9.abrupt('return', sigs);

                    case 90:
                    case 'end':
                        return _context9.stop();
                }
            }
        }, null, this, [[20, 24, 28, 36], [29,, 31, 35], [52, 56, 60, 68], [61,, 63, 67], [73, 77, 81, 89], [82,, 84, 88]]);
    };
};

module.exports = { APICaller: APICaller };