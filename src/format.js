const assert = require('assert');
const BN = require('bn.js');
const ByteBuffer = require('bytebuffer');
const basex = require('base-x');
const RIPEMD160 = require('ripemd160');
const {Long} = ByteBuffer;
const KeyUtils = require("./ecc/key_utils");

const BASE58_STR = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const base58 = basex(BASE58_STR);

module.exports = {
  ULong,
  isName,
  encodeGroup,
  encodeName, // encode human readable name to uint64 (number string)
  decodeName, // decode from uint64 to human readable
  encodeName128,
  decodeName128,
  encodeAddress,
  decodeAddress,
  encodeGeneratedAddressToBin,
  decodeGeneratedAddressFromBin,
  encodeGeneratedAddressToJson,
  decodeGeneratedAddressFromJson,
  encodeAuthorizerRef,
  encodeNameHex: name => Long.fromString(encodeName(name), true).toString(16),
  decodeNameHex: (hex, littleEndian = true) =>
    decodeName(Long.fromString(hex, true, 16).toString(), littleEndian),
  UDecimalString,
  UDecimalPad,
  UDecimalImply,
  UDecimalUnimply,
  parseAssetSymbol
};

function ULong(value, unsigned = true, radix = 10) {
    if(typeof value === "number") {
    // Some JSON libs use numbers for values under 53 bits or strings for larger.
    // Accomidate but double-check it..
        if(value > Number.MAX_SAFE_INTEGER)
            throw new TypeError("value parameter overflow");

        value = Long.fromString(String(value), unsigned, radix);
    } else if(typeof value === "string") {
        value = Long.fromString(value, unsigned, radix);
    } else if(!Long.isLong(value)) {
        throw new TypeError("value parameter is a requied Long, Number or String");
    }
    return value;
}

function isName(str, err) {
    try {
        encodeName(str);
        return true;
    } catch(error) {
        if(err) {
            err(error);
        }
        return false;
    }
}

const charmap = '.abcdefghijklmnopqrstuvwxyz12345'
const charmap128 = '.-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const charidx = ch => {
  const idx = charmap.indexOf(ch);
  if(idx === -1)
    throw new TypeError(`Invalid character: '${ch}'`);
  
  return idx;
}
const charidx128 = ch => {
  const idx = charmap128.indexOf(ch);
  if(idx === -1)
    throw new TypeError(`Invalid character: '${ch}'`);
  
  return idx;
}

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
function encodeName(name, littleEndian = true) {
    if(typeof name !== "string")
        throw new TypeError("name parameter is a required string");

    if(name.length > 13)
        throw new TypeError("A name can be up to 13 characters long");

    let bitstr = "";
    for(let i = 0; i <= 12; i++) { // process all 64 bits (even if name is short)
        const c = i < name.length ? charidx(name[i]) : 0;
        const bitlen = i < 12 ? 5 : 4;
        let bits = Number(c).toString(2);
        if(bits.length > bitlen) {
            throw new TypeError("Invalid name " + name);
        }
        bits = "0".repeat(bitlen - bits.length) + bits;
        bitstr += bits;
    }

    const value = Long.fromString(bitstr, true, 2);

    // convert to LITTLE_ENDIAN
    let leHex = "";
    const bytes = littleEndian ? value.toBytesLE() : value.toBytesBE();
    for(const b of bytes) {
        const n = Number(b).toString(16);
        leHex += (n.length === 1 ? "0" : "") + n;
    }

    const ulName = Long.fromString(leHex, true, 16).toString();

    // console.log('encodeName', name, value.toString(), ulName.toString(), JSON.stringify(bitstr.split(/(.....)/).slice(1)))
    return ulName.toString();
}

/**
  @arg {Long|String|number} value uint64
  @return {string}
*/
function decodeName(value, littleEndian = true) {
    value = ULong(value);

    // convert from LITTLE_ENDIAN
    let beHex = "";
    const bytes = littleEndian ? value.toBytesLE() : value.toBytesBE();
    for(const b of bytes) {
        const n = Number(b).toString(16);
        beHex += (n.length === 1 ? "0" : "") + n;
    }
    beHex += "0".repeat(16 - beHex.length);

    const fiveBits = Long.fromNumber(0x1f, true);
    const fourBits = Long.fromNumber(0x0f, true);
    const beValue = Long.fromString(beHex, true, 16);

    let str = "";
    let tmp = beValue;

    for(let i = 0; i <= 12; i++) {
        const c = charmap[tmp.and(i === 0 ? fourBits : fiveBits)];
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
    if(typeof name !== 'string')
      throw new TypeError('name parameter is a required string');
  
    if(name.length > 21)
      throw new TypeError('A name can be up to 21 characters long');
  
    let bitstr = '';
    for(let i = 0; i < 21; i++) { // process all 64 bits (even if name is short)
      const c = i < name.length ? charidx128(name[i]) : 0;
      let bits = Number(c).toString(2);
      if (bits.length > 6) {
        throw new TypeError('Invalid name ' + name);
      }
      bits = '0'.repeat(6 - bits.length) + bits;
      bitstr = bits + bitstr;
    }

    let cutSize = 4;
    if (name.length <= 5) {
        bitstr += "00"
        cutSize = 4
    } else if (name.length <= 10) {
        bitstr += "01"
        cutSize = 8
    } else if (name.length <= 15) {
        bitstr += "10"
        cutSize = 12
    } else {
        bitstr += "11"
        cutSize = 16
    }

    let bn = new BN(bitstr, 2);
    // bn = bn.toTwos(128);
    return bn.toArrayLike(Buffer, 'le', 128 / 8 / 16 * cutSize);
}
  
/**
  * @arg {Long|String|number} value uint64
  * @return {string}
  */
function decodeName128(value) {

    // construct binary string
    let bn = new BN(value, 16)
    let bfarray = bn.toArrayLike(Buffer, 'le', value.length / 2)
    let binarray = "";
    for (let i = 0; i < bfarray.byteLength; i++) {
        binarray += bfarray[i].toString(2).padStart(8, "0");
    }

    // remove 2 bits length indicator
    let length = parseInt(binarray.substr(binarray.length - 2), 2);
    binarray = binarray.substr(0, binarray.length - 2);

    // calculate pad start of '0'
    let padStart = (Math.floor(binarray.length / 6 + 1) * 6 - binarray.length) % 6;
    binarray = "0".repeat(padStart) + binarray;

    // build str
    let returnStr = "";
    for (let i = 0; i < binarray.length; i += 6) {
        let binCode = (parseInt(binarray.substr(i, 6), 2) || 0) % charmap128.length;
        returnStr = charmap128[binCode] + returnStr;
    }
    
    returnStr = returnStr.replace(/\.+$/, '');
    let returnStrLen = returnStr.length;

    if ((length * 5 < returnStrLen && returnStrLen <= (length+1) * 5) || (returnStrLen > 20) && length === 3) {
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


    if(value[0] === ".") {
        value = `0${value}`;
    }

    const part = value.split(".");
    assert(part.length <= 2, `invalid decimal ${value}`);
    assert(/^\d+(,?\d)*\d*$/.test(part[0]), `invalid decimal ${value}`);

    if(part.length === 2) {
        assert(/^\d*$/.test(part[1]), `invalid decimal ${value}`);
        part[1] = part[1].replace(/0+$/, "");// remove suffixing zeros
        if(part[1] === "") {
            part.pop();
        }
    }

    part[0] = part[0].replace(/^0*/, "");// remove leading zeros
    if(part[0] === "") {
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
    const value = UDecimalString(num);
    assert.equal("number", typeof precision, "precision");

    const part = value.split(".");

    if(precision === 0 && part.length === 1) {
        return part[0];
    }

    if(part.length === 1) {
        return `${part[0]}.${"0".repeat(precision)}`;
    } else {
        const pad = precision - part[1].length;
        assert(pad >= 0, `decimal '${value}' exceeds precision ${precision}`);
        return `${part[0]}.${part[1]}${"0".repeat(pad)}`;
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
    assert(/^\d+$/.test(value), `invalid whole number ${value}`);

    // Ensure minimum length
    const pad = precision - value.length;
    if(pad > 0) {
        value = `${"0".repeat(pad)}${value}`;
    }

    const dotIdx = value.length - precision;
    value = `${value.slice(0, dotIdx)}.${value.slice(dotIdx)}`;
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
function parseAssetSymbol(assetSymbol, precision = null) {
    assert.equal(typeof assetSymbol, "string", "Asset symbol should be string");

    if(assetSymbol.indexOf(",") === -1) {
        assetSymbol = `,${assetSymbol}`; // null precision
    }
    const v = assetSymbol.split(",");
    assert(v.length === 2, `Asset symbol "${assetSymbol}" may have a precision like this: 4,SYM`);

    let symbolPrecision = v[0] == "" ? null : parseInt(v[0]);
    let symbol = v[1];

    if(precision != null) {
        assert.equal(precision, symbolPrecision, "Asset symbol precision mismatch");
    } else {
        precision = symbolPrecision;
    }

    if(precision != null) {
        assert.equal(typeof precision, "number", "precision");
        assert(precision > -1, "precision must be positive");
    }
    
    if (!/^[0-9]+$/.test(symbol)) {
        if (/^S#[0-9]+$/.test(symbol)) {
            symbol = symbol.replace("S#", "");
        } else {
            throw new Error(`Asset symbol should looks like 'S#{num}', but got ${symbol}.`);
        }
    }
    assert(precision <= 18, "Precision should be 18 characters or less");
    assert(symbol.length <= 7, "Asset symbol is 7 characters or less");

    return {precision, symbol};
}
/* Encode EVT Address in address.cpp */
function encodeAddress(str) {

    /* Check avalibility of evt_address */
    if (typeof str !== "string" || str.length !== 53 || !str.startsWith("EVT")) throw new Error("EVTAddress should be a string with length 53 starts with EVT.");
    str = str.substr(3);

    if (str === "0".repeat(50)) return Buffer.from([0, 0]); // 0000
    else if (str[0] === "0") return encodeGeneratedAddressToBin("EVT" + str); // generated address
    let buf = Buffer.concat([Buffer.from([1, 0]), base58.decode(str)]); // normal
    //console.log(buf)
    return buf.slice(0, buf.length - 4);

}
/* Decode EVT Address in address.cpp */
function decodeAddress(bytes) {

    if (bytes.length === 2 && bytes.equals(Buffer.from([0,0]))) return "EVT" + "0".repeat(50); // 0000
    else if (bytes.slice(0, 2).equals(Buffer.from([2,0]))) return decodeGeneratedAddressFromBin(bytes); // generated address
    return "EVT"+KeyUtils.checkEncode(bytes.slice(2));

}

function encodeGeneratedAddressToBin(str) {

    let {prefix, key, nonce} = encodeGeneratedAddressToJson(str);

    let bNonce = new Buffer(4);
    let bPrefix = new ByteBuffer(8);
    let bKey = encodeName128(key);
    bNonce.writeUInt32LE(nonce);
    bPrefix.writeUint64(encodeName(prefix));

    let result = "02" + bPrefix.buffer.toString("hex") + bNonce.toString("hex") + bKey.toString("hex");
    return Buffer.from(result, "hex");

}

function decodeGeneratedAddressFromBin(bytes) {

    if (!Buffer.isBuffer(bytes)) throw new Error("only bytes can be passed in");

    let byteHex = bytes.toString("hex");
    if (!byteHex.startsWith("02")) throw new Error("wrong type of address");
    byteHex = byteHex.substr(2);

    // parse Prefix path
    let prefix = decodeName(Long.fromString(byteHex.substr(0, 16), true, 16).toString());
    byteHex = byteHex.substr(16);

    // parse Nonce path
    let nonce = Buffer.from(byteHex.substr(0, 8), "hex").readUInt32LE(0);
    byteHex = byteHex.substr(8);

    // parse Key path
    let key = decodeName128(byteHex);

    return decodeGeneratedAddressFromJson({key, nonce, prefix});

}

function encodeGeneratedAddressToJson(str) {

    if (!str.startsWith("EVT0") || str.length !== 53 || str === ("EVT" + "0".repeat(50))) throw new Error("incorrect generated address");
    str = str.substr(4);

    // trim 0 on the left
    let _t = 0;
    while(str.length > _t && str[_t] === "0") _t ++;
    str = str.substr(_t);

    // split bytes
    let bBin = base58.decode(str);
    let bCheck = new Buffer(4);
    let bNonce = new Buffer(4);
    let bPrefix = new Buffer(8);
    let bKey = new Buffer(16);
    bBin.copy(bCheck, 0, 0, 4);
    bBin.copy(bNonce, 0, 4, 8);
    bBin.copy(bPrefix, 0, 8, 16);
    bBin.copy(bKey, 0, 16, 32);

    // check sum
    if (bCheck.toString('hex') !== (new RIPEMD160().update(Buffer.concat([bPrefix, bKey, bNonce])).digest('hex').substr(0, 8))) throw new Error("check sum failed");

    let prefix = decodeName(Long.fromString(bPrefix.toString('hex'), true, 16).toString());
    let nonce = bNonce.readUInt32LE(0);
    let key = decodeName128(bKey.toString("hex"));

    return {prefix, key, nonce};

}

function decodeGeneratedAddressFromJson({prefix=null, key=null, nonce=null}={}) {

    if (!prefix || !key || !Number.isInteger(nonce) || nonce < 0) throw new Error("incorrect json format of generated address");

    let bCheck = new Buffer(4);
    let bNonce = new Buffer(4);
    let bPrefix = new ByteBuffer(8);
    let bKey = new Buffer(16);

    encodeName128(key).copy(bKey, 0);
    bNonce.writeUInt32LE(nonce);
    bPrefix.writeUint64(encodeName(prefix));
    bCheck = Buffer.from(new RIPEMD160().update(Buffer.concat([bPrefix.buffer, bKey, bNonce])).digest('hex').substr(0, 8), 'hex');

    return "EVT" + base58.encode(Buffer.concat([bCheck, bNonce, bPrefix.buffer, bKey])).padStart(50, "0");
    
}

function encodeAuthorizerRef(str) {

    /* Check avalibility of authorizer_ref */
    if (typeof str !== "string" || !/^\[[AG]\]\ [\.\w]+$/.test(str)) throw new Error("authorizer_ref format error, it should look like '[A] EVTxxxxx' OR '[G] xxxxxx'.");
    let type = str.split(" ")[0][1].trim();
    let content = str.split(" ")[1].trim();

    let prefix = null;
    let suffix = null;
    if (type === "A") {
        // [A] Type, [01,ADDRESS]
        prefix = Buffer.from([]);
        suffix = encodeAddress(content);
    } else if (type === "G") {
        if (content === ".OWNER") {
            // [G] .OWNER Type, 00[00]
            prefix = Buffer.from([0]);
            suffix = Buffer.from([0]);
        } else {
            // [G] Type, 02[NAME128]
            prefix = Buffer.from([2]);
            suffix = encodeName128(content);
        }
    } else {
        throw new Error("authorizer_ref type error, it can be either [A] or [G]");
    }
    return Buffer.concat([prefix, suffix]);

}

function getKeys(node, config) {
    if (node.nodes) {
        return node.nodes.reduce((prev, curr) => prev = prev.concat(getKeys(curr, config)), []);
    } else if (node.key) {
        let tmp = node.key;
        node.key = config.keyIndex++;
        return [tmp];
    } else {
        throw new Error("Invalid Group Node Object.");
    }
}

function packNodeValue(value) {
    return `${parseInt(value) || 0}`.padStart(4, '0');
}

function encodeGroupNode(root, keys) {
    let queue = [root];
    let res = [];
    while (queue.length) {
        let node = queue.pop(0);
        let hexCode = packNodeValue(node.weight) +
            packNodeValue(node.threshold) +
            packNodeValue(node.key || node.weight) + 
            packNodeValue((node.nodes || []).length);
        res.push(hexCode);
        if (node.nodes && node.nodes.length) {
            queue = queue.concat(node.nodes);
        }
    }
    res[0] = substr(4);
    return res;
}

function encodeGroup(root) {
    
    let config = { keyIndex: 0 };
    let keys = getKeys(root, config);
    
    let nodes = encodeGroupNode(root, keys, true);
    let hex = `${nodes.length}00`.padStart(4, '0') + nodes.join('') + '00' + keys.map(k => encodeGeneratedAddressToBin(k).toString('hex').substr(2));
    console.log(hex);

    return Buffer.from(hex, 'hex');
}

// 01 00 000900010000 00 00

// 04 00 000600010002 0003000000000000 0003000800030001 0003000000010000 00 02000386cb0bbed3c087475efbae3c51f6825deb3be68ae013411fd509f3e361139e880002c8f031561c4758c9551cff47246f2c347189fe684c04da35cf88e813f810e3c200

// 04 00 000600010002 0003000800030001 0003000000010000 0003000000000000 00 020002c8f031561c4758c9551cff47246f2c347189fe684c04da35cf88e813f810e3c2000386cb0bbed3c087475efbae3c51f6825deb3be68ae013411fd509f3e361139e8800

// 04 00 000600010002 0003000800030001 0003000000010000 0003000000000000 00 02000386cb0bbed3c087475efbae3c51f6825deb3be68ae013411fd509f3e361139e880002c8f031561c4758c9551cff47246f2c347189fe684c04da35cf88e813f810e3c200

// 04 00 000600010003 0003000000000000 0003000000010000 0003000000020000 00 030002c8f031561c4758c9551cff47246f2c347189fe684c04da35cf88e813f810e3c20002c8f031561c4758c9551cff47246f2c347189fe684c04da35cf88e813f810e3c20002c8f031561c4758c9551cff47246f2c347189fe684c04da35cf88e813f810e3c200

// 05 00 000600010004 0003000000000000 0003000000010000 0003000000020000 0003000000030000 00 040002c8f031561c4758c9551cff47246f2c347189fe684c04da35cf88e813f810e3c20002c8f031561c4758c9551cff47246f2c347189fe684c04da35cf88e813f810e3c20002c8f031561c4758c9551cff47246f2c347189fe684c04da35cf88e813f810e3c20002c8f031561c4758c9551cff47246f2c347189fe684c04da35cf88e813f810e3c200

// 0X 00 (WEIGHT)THRD INDEXSIZE

// {
//     "threshold": 8,
//     "weight": 3,
//     "nodes": [
//         {
//             "key": Key.privateToPublic(wif),
//             "weight": 3
//         }
//     ]
// },
// {
//     "key": Key.privateToPublic(wif2),
//     "weight": 3
// },

// 0400 000600010