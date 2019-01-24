'use strict';

var _isInteger = require('babel-runtime/core-js/number/is-integer');

var _isInteger2 = _interopRequireDefault(_isInteger);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _maxSafeInteger = require('babel-runtime/core-js/number/max-safe-integer');

var _maxSafeInteger2 = _interopRequireDefault(_maxSafeInteger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var assert = require('assert');
var BN = require('bn.js');
var ByteBuffer = require('bytebuffer');
var basex = require('base-x');
var RIPEMD160 = require('ripemd160');
var Long = ByteBuffer.Long;

var KeyUtils = require("./ecc/key_utils");

var BASE58_STR = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
var base58 = basex(BASE58_STR);

module.exports = {
    ULong: ULong,
    isName: isName,
    encodeName: encodeName, // encode human readable name to uint64 (number string)
    decodeName: decodeName, // decode from uint64 to human readable
    encodeName128: encodeName128,
    decodeName128: decodeName128,
    encodeAddress: encodeAddress,
    decodeAddress: decodeAddress,
    encodeGeneratedAddressToBin: encodeGeneratedAddressToBin,
    decodeGeneratedAddressFromBin: decodeGeneratedAddressFromBin,
    encodeGeneratedAddressToJson: encodeGeneratedAddressToJson,
    decodeGeneratedAddressFromJson: decodeGeneratedAddressFromJson,
    encodeNameHex: function encodeNameHex(name) {
        return Long.fromString(encodeName(name), true).toString(16);
    },
    decodeNameHex: function decodeNameHex(hex) {
        var littleEndian = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        return decodeName(Long.fromString(hex, true, 16).toString(), littleEndian);
    },
    UDecimalString: UDecimalString,
    UDecimalPad: UDecimalPad,
    UDecimalImply: UDecimalImply,
    UDecimalUnimply: UDecimalUnimply,
    parseAssetSymbol: parseAssetSymbol
};

function ULong(value) {
    var unsigned = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var radix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;

    if (typeof value === "number") {
        // Some JSON libs use numbers for values under 53 bits or strings for larger.
        // Accomidate but double-check it..
        if (value > _maxSafeInteger2.default) throw new TypeError("value parameter overflow");

        value = Long.fromString(String(value), unsigned, radix);
    } else if (typeof value === "string") {
        value = Long.fromString(value, unsigned, radix);
    } else if (!Long.isLong(value)) {
        throw new TypeError("value parameter is a requied Long, Number or String");
    }
    return value;
}

function isName(str, err) {
    try {
        encodeName(str);
        return true;
    } catch (error) {
        if (err) {
            err(error);
        }
        return false;
    }
}

var charmap = '.abcdefghijklmnopqrstuvwxyz12345';
var charmap128 = '.-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
var charidx = function charidx(ch) {
    var idx = charmap.indexOf(ch);
    if (idx === -1) throw new TypeError('Invalid character: \'' + ch + '\'');

    return idx;
};
var charidx128 = function charidx128(ch) {
    var idx = charmap128.indexOf(ch);
    if (idx === -1) throw new TypeError('Invalid character: \'' + ch + '\'');

    return idx;
};

/** Original Name encode and decode logic is in github.com/eosio/eos  native.hpp */

/**
  Encode a name (a base32 string) to a number.

  For performance reasons, the blockchain uses the numerical encoding of strings
  for very common types like account names.

  @see types.hpp string_to_name

  @arg {string} name - A string to encode, up to 12 characters long.
  @return {string<uint64>} - compressed string (from name arg).  A string is
    always used because a number could exceed JavaScript's 52 bit limit.
*/
function encodeName(name) {
    var littleEndian = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    if (typeof name !== "string") throw new TypeError("name parameter is a required string");

    if (name.length > 13) throw new TypeError("A name can be up to 13 characters long");

    var bitstr = "";
    for (var i = 0; i <= 12; i++) {
        // process all 64 bits (even if name is short)
        var c = i < name.length ? charidx(name[i]) : 0;
        var bitlen = i < 12 ? 5 : 4;
        var bits = Number(c).toString(2);
        if (bits.length > bitlen) {
            throw new TypeError("Invalid name " + name);
        }
        bits = "0".repeat(bitlen - bits.length) + bits;
        bitstr += bits;
    }

    var value = Long.fromString(bitstr, true, 2);

    // convert to LITTLE_ENDIAN
    var leHex = "";
    var bytes = littleEndian ? value.toBytesLE() : value.toBytesBE();
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = (0, _getIterator3.default)(bytes), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var b = _step.value;

            var n = Number(b).toString(16);
            leHex += (n.length === 1 ? "0" : "") + n;
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    var ulName = Long.fromString(leHex, true, 16).toString();

    // console.log('encodeName', name, value.toString(), ulName.toString(), JSON.stringify(bitstr.split(/(.....)/).slice(1)))
    return ulName.toString();
}

/**
  @arg {Long|String|number} value uint64
  @return {string}
*/
function decodeName(value) {
    var littleEndian = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    value = ULong(value);

    // convert from LITTLE_ENDIAN
    var beHex = "";
    var bytes = littleEndian ? value.toBytesLE() : value.toBytesBE();
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = (0, _getIterator3.default)(bytes), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var b = _step2.value;

            var n = Number(b).toString(16);
            beHex += (n.length === 1 ? "0" : "") + n;
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

    beHex += "0".repeat(16 - beHex.length);

    var fiveBits = Long.fromNumber(0x1f, true);
    var fourBits = Long.fromNumber(0x0f, true);
    var beValue = Long.fromString(beHex, true, 16);

    var str = "";
    var tmp = beValue;

    for (var i = 0; i <= 12; i++) {
        var c = charmap[tmp.and(i === 0 ? fourBits : fiveBits)];
        str = c + str;
        tmp = tmp.shiftRight(i === 0 ? 4 : 5);
    }
    str = str.replace(/\.+$/, ""); // remove trailing dots (all of them)

    // console.log('decodeName', str, beValue.toString(), value.toString(), JSON.stringify(beValue.toString(2).split(/(.....)/).slice(1)))

    return str;
}

/**
  Encode a name (a base32 string) to a number.

  For performance reasons, the blockchain uses the numerical encoding of strings
  for very common types like account names.

  @see types.hpp string_to_name

  @arg {string} name - A string to encode, up to 12 characters long.
  @return {string<uint64>} - compressed string (from name arg).  A string is
    always used because a number could exceed JavaScript's 52 bit limit.
*/
function encodeName128(name) {
    if (typeof name !== 'string') throw new TypeError('name parameter is a required string');

    if (name.length > 21) throw new TypeError('A name can be up to 21 characters long');

    var bitstr = '';
    for (var i = 0; i < 21; i++) {
        // process all 64 bits (even if name is short)
        var c = i < name.length ? charidx128(name[i]) : 0;
        var bits = Number(c).toString(2);
        if (bits.length > 6) {
            throw new TypeError('Invalid name ' + name);
        }
        bits = '0'.repeat(6 - bits.length) + bits;
        bitstr = bits + bitstr;
    }

    var cutSize = 4;
    if (name.length <= 5) {
        bitstr += "00";
        cutSize = 4;
    } else if (name.length <= 10) {
        bitstr += "01";
        cutSize = 8;
    } else if (name.length <= 15) {
        bitstr += "10";
        cutSize = 12;
    } else {
        bitstr += "11";
        cutSize = 16;
    }

    var bn = new BN(bitstr, 2);
    // bn = bn.toTwos(128);
    return bn.toArrayLike(Buffer, 'le', 128 / 8 / 16 * cutSize);
}

/**
  * @arg {Long|String|number} value uint64
  * @return {string}
  */
function decodeName128(value) {

    // construct binary string
    var bn = new BN(value, 16);
    var bfarray = bn.toArrayLike(Buffer, 'le', value.length / 2);
    var binarray = "";
    for (var i = 0; i < bfarray.byteLength; i++) {
        binarray += bfarray[i].toString(2).padStart(8, "0");
    }

    // remove 2 bits length indicator
    var length = parseInt(binarray.substr(binarray.length - 2), 2);
    binarray = binarray.substr(0, binarray.length - 2);

    // calculate pad start of '0'
    var padStart = (Math.floor(binarray.length / 6 + 1) * 6 - binarray.length) % 6;
    binarray = "0".repeat(padStart) + binarray;

    // build str
    var returnStr = "";
    for (var _i = 0; _i < binarray.length; _i += 6) {
        var binCode = (parseInt(binarray.substr(_i, 6), 2) || 0) % charmap128.length;
        returnStr = charmap128[binCode] + returnStr;
    }

    returnStr = returnStr.replace(/\.+$/, '');
    var returnStrLen = returnStr.length;

    if (length * 5 < returnStrLen && returnStrLen <= (length + 1) * 5 || returnStrLen > 20 && length === 3) {
        return returnStr;
    } else {
        throw new Error("wrong length of decoded string");
    }
}

/**
  Normalize and validate decimal string (potentially large values).  Should
  avoid internationalization issues if possible but will be safe and
  throw an error for an invalid number.

  Normalization removes extra zeros or decimal.

  @return {string} value
*/
function UDecimalString(value) {
    assert(value != null, "value is required");
    value = value === "object" && value.toString ? value.toString() : String(value);

    if (value[0] === ".") {
        value = '0' + value;
    }

    var part = value.split(".");
    assert(part.length <= 2, 'invalid decimal ' + value);
    assert(/^\d+(,?\d)*\d*$/.test(part[0]), 'invalid decimal ' + value);

    if (part.length === 2) {
        assert(/^\d*$/.test(part[1]), 'invalid decimal ' + value);
        part[1] = part[1].replace(/0+$/, ""); // remove suffixing zeros
        if (part[1] === "") {
            part.pop();
        }
    }

    part[0] = part[0].replace(/^0*/, ""); // remove leading zeros
    if (part[0] === "") {
        part[0] = "0";
    }
    return part.join(".");
}

/**
  Ensure a fixed number of decimal places.  Safe for large numbers.

  @see ./format.test.js

  @example UDecimalPad(10.2, 3) === '10.200'

  @arg {number|string|object.toString} value
  @arg {number} precision - number of decimal places
  @return {string} decimal part is added and zero padded to match precision
*/
function UDecimalPad(num, precision) {
    var value = UDecimalString(num);
    assert.equal("number", typeof precision === 'undefined' ? 'undefined' : (0, _typeof3.default)(precision), "precision");

    var part = value.split(".");

    if (precision === 0 && part.length === 1) {
        return part[0];
    }

    if (part.length === 1) {
        return part[0] + '.' + "0".repeat(precision);
    } else {
        var pad = precision - part[1].length;
        assert(pad >= 0, 'decimal \'' + value + '\' exceeds precision ' + precision);
        return part[0] + '.' + part[1] + "0".repeat(pad);
    }
}

/** Ensures proper trailing zeros then removes decimal place. */
function UDecimalImply(value, precision) {
    return UDecimalPad(value, precision).replace(".", "");
}

/**
  Put the decimal place back in its position and return the normalized number
  string (with any unnecessary zeros or an unnecessary decimal removed).

  @arg {string|number|value.toString} value 10000
  @arg {number} precision 4
  @return {number} 1.0000
*/
function UDecimalUnimply(value, precision) {
    assert(value != null, "value is required");
    value = value === "object" && value.toString ? value.toString() : String(value);
    assert(/^\d+$/.test(value), 'invalid whole number ' + value);

    // Ensure minimum length
    var pad = precision - value.length;
    if (pad > 0) {
        value = '' + "0".repeat(pad) + value;
    }

    var dotIdx = value.length - precision;
    value = value.slice(0, dotIdx) + '.' + value.slice(dotIdx);
    return UDecimalString(value); // Normalize
}

/**
  @arg {string} assetSymbol - 4,SYM
  @arg {number} [precision = null] - expected precision or mismatch AssertionError

  @example assert.deepEqual(parseAssetSymbol('SYM'), {precision: null, symbol: 'SYM'})
  @example assert.deepEqual(parseAssetSymbol('4,SYM'), {precision: 4, symbol: 'SYM'})
  @throws AssertionError
  @throws TypeError
*/
function parseAssetSymbol(assetSymbol) {
    var precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    assert.equal(typeof assetSymbol === 'undefined' ? 'undefined' : (0, _typeof3.default)(assetSymbol), "string", "Asset symbol should be string");

    if (assetSymbol.indexOf(",") === -1) {
        assetSymbol = ',' + assetSymbol; // null precision
    }
    var v = assetSymbol.split(",");
    assert(v.length === 2, 'Asset symbol "' + assetSymbol + '" may have a precision like this: 4,SYM');

    var symbolPrecision = v[0] == "" ? null : parseInt(v[0]);
    var symbol = v[1];

    if (precision != null) {
        assert.equal(precision, symbolPrecision, "Asset symbol precision mismatch");
    } else {
        precision = symbolPrecision;
    }

    if (precision != null) {
        assert.equal(typeof precision === 'undefined' ? 'undefined' : (0, _typeof3.default)(precision), "number", "precision");
        assert(precision > -1, "precision must be positive");
    }

    assert(/^[A-Z]+$/.test(symbol), "Asset symbol should contain only uppercase letters A-Z");
    assert(precision <= 18, "Precision should be 18 characters or less");
    assert(symbol.length <= 7, "Asset symbol is 7 characters or less");

    return { precision: precision, symbol: symbol };
}
/* Encode EVT Address in address.cpp */
function encodeAddress(str) {

    /* Check avalibility of evt_address */
    if (typeof str !== "string" || str.length !== 53 || !str.startsWith("EVT")) throw new Error("EVTAddress should be a string with length 53 starts with EVT.");
    str = str.substr(3);

    if (str === "0".repeat(50)) return Buffer.from([0, 0]); // 0000
    else if (str[0] === "0") return encodeGeneratedAddressToBin("EVT" + str); // generated address
    var buf = Buffer.concat([Buffer.from([1, 0]), base58.decode(str)]); // normal
    //console.log(buf)
    return buf.slice(0, buf.length - 4);
}
/* Decode EVT Address in address.cpp */
function decodeAddress(bytes) {

    if (bytes.length === 2 && bytes.equals(Buffer.from([0, 0]))) return "EVT" + "0".repeat(50); // 0000
    else if (bytes.slice(0, 2).equals(Buffer.from([2, 0]))) return decodeGeneratedAddressFromBin(bytes); // generated address
    return "EVT" + KeyUtils.checkEncode(bytes.slice(2));
}

function encodeGeneratedAddressToBin(str) {
    var _encodeGeneratedAddre = encodeGeneratedAddressToJson(str),
        prefix = _encodeGeneratedAddre.prefix,
        key = _encodeGeneratedAddre.key,
        nonce = _encodeGeneratedAddre.nonce;

    var bNonce = new Buffer(4);
    var bPrefix = new ByteBuffer(8);
    var bKey = encodeName128(key);
    bNonce.writeUInt32LE(nonce);
    bPrefix.writeUint64(encodeName(prefix));

    var result = "02" + bPrefix.buffer.toString("hex") + bNonce.toString("hex") + bKey.toString("hex");
    return Buffer.from(result, "hex");
}

function decodeGeneratedAddressFromBin(bytes) {

    if (!Buffer.isBuffer(bytes)) throw new Error("only bytes can be passed in");

    var byteHex = bytes.toString("hex");
    if (!byteHex.startsWith("02")) throw new Error("wrong type of address");
    byteHex = byteHex.substr(2);

    // parse Prefix path
    var prefix = decodeName(Long.fromString(byteHex.substr(0, 16), true, 16).toString());
    byteHex = byteHex.substr(16);

    // parse Nonce path
    var nonce = Buffer.from(byteHex.substr(0, 8), "hex").readUInt32LE(0);
    byteHex = byteHex.substr(8);

    // parse Key path
    var key = decodeName128(byteHex);

    return decodeGeneratedAddressFromJson({ key: key, nonce: nonce, prefix: prefix });
}

function encodeGeneratedAddressToJson(str) {

    if (!str.startsWith("EVT0") || str.length !== 53 || str === "EVT" + "0".repeat(50)) throw new Error("incorrect generated address");
    str = str.substr(4);

    // trim 0 on the left
    var _t = 0;
    while (str.length > _t && str[_t] === "0") {
        _t++;
    }str = str.substr(_t);

    // split bytes
    var bBin = base58.decode(str);
    var bCheck = new Buffer(4);
    var bNonce = new Buffer(4);
    var bPrefix = new Buffer(8);
    var bKey = new Buffer(16);
    bBin.copy(bCheck, 0, 0, 4);
    bBin.copy(bNonce, 0, 4, 8);
    bBin.copy(bPrefix, 0, 8, 16);
    bBin.copy(bKey, 0, 16, 32);

    // check sum
    if (bCheck.toString('hex') !== new RIPEMD160().update(Buffer.concat([bPrefix, bKey, bNonce])).digest('hex').substr(0, 8)) throw new Error("check sum failed");

    var prefix = decodeName(Long.fromString(bPrefix.toString('hex'), true, 16).toString());
    var nonce = bNonce.readUInt32LE(0);
    var key = decodeName128(bKey.toString("hex"));

    return { prefix: prefix, key: key, nonce: nonce };
}

function decodeGeneratedAddressFromJson() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$prefix = _ref.prefix,
        prefix = _ref$prefix === undefined ? null : _ref$prefix,
        _ref$key = _ref.key,
        key = _ref$key === undefined ? null : _ref$key,
        _ref$nonce = _ref.nonce,
        nonce = _ref$nonce === undefined ? null : _ref$nonce;

    if (!prefix || !key || !(0, _isInteger2.default)(nonce) || nonce < 0) throw new Error("incorrect json format of generated address");

    var bCheck = new Buffer(4);
    var bNonce = new Buffer(4);
    var bPrefix = new ByteBuffer(8);
    var bKey = new Buffer(16);

    encodeName128(key).copy(bKey, 0);
    bNonce.writeUInt32LE(nonce);
    bPrefix.writeUint64(encodeName(prefix));
    bCheck = Buffer.from(new RIPEMD160().update(Buffer.concat([bPrefix.buffer, bKey, bNonce])).digest('hex').substr(0, 8), 'hex');

    return "EVT" + base58.encode(Buffer.concat([bCheck, bNonce, bPrefix.buffer, bKey])).padStart(50, "0");
}