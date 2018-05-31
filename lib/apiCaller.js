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

                            // 添加签名
                            signBuf = Buffer.from('2800f0f3f88ce2b4a8c6ce4c20a91f5a7e3647fa73894e9d2bc4cc61b6bda1be', 'hex');
                            _context.next = 5;
                            return regeneratorRuntime.awrap(this.__signTransaction(signBuf, request.body || {}));

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

                            return _context2.abrupt('return', info);

                        case 5:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, null, this);
        }
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
    }, {
        key: '__fixedSignatureCall',
        value: function __fixedSignatureCall(args) {
            return regeneratorRuntime.async(function __fixedSignatureCall$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            args.__fixedSignature = 'everiWallet';
                            _context4.next = 3;
                            return regeneratorRuntime.awrap(this.__callAPI(args));

                        case 3:
                            return _context4.abrupt('return', _context4.sent);

                        case 4:
                        case 'end':
                            return _context4.stop();
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
            return regeneratorRuntime.async(function pushTransaction$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            args = JSON.parse(JSON.stringify(args));
                            // make sure that it there is basic information about the chain

                            if (this.__cachedInfo) {
                                _context5.next = 4;
                                break;
                            }

                            _context5.next = 4;
                            return regeneratorRuntime.awrap(this.getInfo());

                        case 4:
                            i = 0;

                        case 5:
                            if (!(i < args.transaction.actions.length)) {
                                _context5.next = 17;
                                break;
                            }

                            originalAction = args.transaction.actions[i];

                            // create binary action for push_transaction
                            //console.log(JSON.stringify(await this.__chainAbiJsonToBin(originalAction), null, 4));

                            _context5.t0 = originalAction.action;
                            _context5.next = 10;
                            return regeneratorRuntime.awrap(this.__chainAbiJsonToBin(originalAction));

                        case 10:
                            _context5.t1 = _context5.sent.binargs;
                            binAction = {
                                name: _context5.t0,
                                data: _context5.t1
                            };


                            // use mapper to determine the `domain` and `key` field
                            domainKeyMappers[originalAction.action](originalAction, binAction);

                            // override action
                            args.transaction.actions[i] = binAction;

                        case 14:
                            ++i;
                            _context5.next = 5;
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
                            _context5.next = 26;
                            return regeneratorRuntime.awrap(this.__getDigestToSign(args.transaction));

                        case 26:
                            digestRes = _context5.sent.digest;

                            //console.log(digestRes);

                            // sign
                            signBuf = new Buffer(digestRes, 'hex');
                            _context5.next = 30;
                            return regeneratorRuntime.awrap(this.__signTransaction(signBuf, args.transaction));

                        case 30:
                            sigs = _context5.sent;


                            if (!Array.isArray(sigs)) {
                                sigs = [sigs];
                            }

                            args.signatures = sigs;

                            // push transaction
                            _context5.next = 35;
                            return regeneratorRuntime.awrap(this.__chainPushTransaction(args));

                        case 35:
                            res = _context5.sent;

                            if (!(res && res.processed && res.processed.receipt && res.processed.receipt.status === 'executed')) {
                                _context5.next = 40;
                                break;
                            }

                            return _context5.abrupt('return', true);

                        case 40:
                            if (!(res && res.error && res.error.details && res.error.details.length)) {
                                _context5.next = 44;
                                break;
                            }

                            throw new Error(res.error.what + " (" + res.error.code + "): " + res.error.details.map(function (r) {
                                return r.message ? r.message + "; " : "";
                            }));

                        case 44:
                            throw new Error("did not receive anything from the chain");

                        case 45:
                        case 'end':
                            return _context5.stop();
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
        value: function __signTransaction(buf, transaction) {
            return this.config.signProvider({ signHash: signHash, buf: buf, transaction: transaction });
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
        value: function __chainGetRequiredKeys(tr) {
            return this.__callAPI({
                url: "/v1/chain/get_required_keys",
                method: "POST",
                body: tr
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
            transaction = _ref.transaction;

        var keyProvider, keys, pvt, ret, keyMap, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, key, isPrivate, isPublic, pubkeys, pvts, missingKeys, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, requiredKey, wif, sigs, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _pvt;

        return regeneratorRuntime.async(function _callee$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        keyProvider = config.keyProvider;

                        if (keyProvider) {
                            _context6.next = 4;
                            break;
                        }

                        console.log("config" + JSON.stringify(config, null, 4));
                        throw new TypeError('This transaction requires a config.keyProvider for signing');

                    case 4:
                        keys = keyProvider;

                        if (typeof keyProvider === 'function') {
                            keys = keyProvider({ transaction: transaction });
                        }

                        // keyProvider may return keys or Promise<keys>
                        _context6.next = 8;
                        return regeneratorRuntime.awrap(Promise.resolve(keys));

                    case 8:
                        keys = _context6.sent;


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
                            _context6.next = 13;
                            break;
                        }

                        throw new Error('missing key, check your keyProvider');

                    case 13:
                        if (!(keys.length === 1 && keys[0].private)) {
                            _context6.next = 17;
                            break;
                        }

                        pvt = keys[0].private;
                        ret = signHash(buf, pvt);
                        return _context6.abrupt('return', ret);

                    case 17:
                        keyMap = new Map();

                        // keys are either public or private keys

                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context6.prev = 21;
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

                        _context6.next = 29;
                        break;

                    case 25:
                        _context6.prev = 25;
                        _context6.t0 = _context6['catch'](21);
                        _didIteratorError = true;
                        _iteratorError = _context6.t0;

                    case 29:
                        _context6.prev = 29;
                        _context6.prev = 30;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 32:
                        _context6.prev = 32;

                        if (!_didIteratorError) {
                            _context6.next = 35;
                            break;
                        }

                        throw _iteratorError;

                    case 35:
                        return _context6.finish(32);

                    case 36:
                        return _context6.finish(29);

                    case 37:
                        pubkeys = Array.from(keyMap.keys());

                        // TODO: add multiple signature support

                        /*return eos.getRequiredKeys(transaction, pubkeys).then(({ required_keys }) => {
                            if (!required_keys.length) {
                                throw new Error('missing required keys for ' + JSON.stringify(transaction))
                            }*/

                        pvts = [], missingKeys = [];


                        required_keys = pubkeys[0]; // assume that we need only the first key, will be changed in the future TODO

                        _iteratorNormalCompletion2 = true;
                        _didIteratorError2 = false;
                        _iteratorError2 = undefined;
                        _context6.prev = 43;
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

                        _context6.next = 51;
                        break;

                    case 47:
                        _context6.prev = 47;
                        _context6.t1 = _context6['catch'](43);
                        _didIteratorError2 = true;
                        _iteratorError2 = _context6.t1;

                    case 51:
                        _context6.prev = 51;
                        _context6.prev = 52;

                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }

                    case 54:
                        _context6.prev = 54;

                        if (!_didIteratorError2) {
                            _context6.next = 57;
                            break;
                        }

                        throw _iteratorError2;

                    case 57:
                        return _context6.finish(54);

                    case 58:
                        return _context6.finish(51);

                    case 59:
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
                        _context6.prev = 64;

                        for (_iterator3 = pvts[Symbol.iterator](); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            _pvt = _step3.value;

                            sigs.push(signHash(buf, _pvt));
                        }

                        _context6.next = 72;
                        break;

                    case 68:
                        _context6.prev = 68;
                        _context6.t2 = _context6['catch'](64);
                        _didIteratorError3 = true;
                        _iteratorError3 = _context6.t2;

                    case 72:
                        _context6.prev = 72;
                        _context6.prev = 73;

                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }

                    case 75:
                        _context6.prev = 75;

                        if (!_didIteratorError3) {
                            _context6.next = 78;
                            break;
                        }

                        throw _iteratorError3;

                    case 78:
                        return _context6.finish(75);

                    case 79:
                        return _context6.finish(72);

                    case 80:
                        return _context6.abrupt('return', sigs);

                    case 81:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, null, this, [[21, 25, 29, 37], [30,, 32, 36], [43, 47, 51, 59], [52,, 54, 58], [64, 68, 72, 80], [73,, 75, 79]]);
    };
};

module.exports = { APICaller: APICaller };