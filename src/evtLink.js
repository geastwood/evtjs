
const ecc = require("./ecc/index");
const qrcode = require("qrcode");
const BigInteger = require("./bigi");
const EvtKey = require("./key");
const randomBytes = require("randombytes");
const qrPrefix = "https://evt.li/";
const baseUsed = 42;

class EvtLink {
}

/**
 * Convert a buffer to base10 representation.
 * @param {Buffer} buffer The buffer-like object to be converted.
 */
EvtLink.b2dec = function(buffer) {
    if (buffer.length == 0) return "";
    let ret = BigInteger.fromBuffer(buffer).toString(baseUsed);
    if (ret == "0") ret = "";

    let i = 0;
    while (buffer[i++] == 0) {
        ret = "0" + ret;
    }

    //console.log("+++" + ret);

    return ret.toUpperCase();
};

/**
 * Convert a base10 representation to buffer.
 * @param {string} base10 string.
 */
EvtLink.dec2b = function(base42) {
    if (base42 == "") return new Buffer();

    let zeroCount = 0, i = 0;

    while (base42[i++] === "0") {
        zeroCount++;
    }

    let alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$+-/:*";
    let b10bn = new BigInteger();
    let baseBN = BigInteger.fromHex("2a");

    for (let i = 0; i < base42.length; ++i) {
        let index = alphabet.indexOf(base42[i]);
        if (index == -1) throw new Error("Decode from base42 to binary failed: base42 out of range");

        b10bn = b10bn.multiply(baseBN).add(new BigInteger(index.toString(), 10));
    }
    
    let buf = b10bn.toBuffer(0);
    let ret = Buffer.concat([ Buffer.alloc(zeroCount, 0), buf ]);

    return ret;
};

/**
 * create a buffer representing a segment.
 * Different typeKey has different data type, this is the detail:
 * 0   - 20    1-byte unsigned integer
 * 21  - 40    2-byte unsigned integer (BE)
 * 41  - 90    4-byte unsigned integer (BE)
 * 91  - 155   string
 * 156 - 165   uuid
 * 166 - 180   byte string
 * > 180      remained
 * 
 * @param {*} typeKey the typeKey, different key has different type and meanings (0 - 254)
 * @param {*} value the value, must has the right data type according to typeKey
 */
function createSegment(typeKey, value) {
    // 1-byte unsigned integer
    if (typeKey <= 20) {
        return (new Buffer([ typeKey, value ]));
    }
    // 2-byte unsigned integer
    if (typeKey <= 40) {
        let content = new Buffer(3);
        content.writeUInt8(typeKey, 0);
        content.writeUInt16BE(value, 1);
        return (content);
    }
    // 4-byte unsigned integer
    else if (typeKey <= 90) {
        let content = new Buffer(5);
        content.writeUInt8(typeKey, 0);
        content.writeUInt32BE(value, 1);
        return (content);
    }
    // string
    else if (typeKey <= 155) {
        let content = Buffer.from(value);
        let header = new Buffer([ typeKey, content.length ]);
        return (Buffer.concat([ header, content ]));
    }
    // uuid
    else if (typeKey <= 165) {
        return (Buffer.concat([ new Buffer( [ typeKey ] ), value ]));
    }
    // byte string
    else if (typeKey <= 180) {
        let content = value;
        let header = new Buffer([ typeKey, content.length ]);
        return (Buffer.concat([ header, content ]));
    }
    else {
        throw new Error("typeKey not supported");
    }
}

/**
 * Parse a segment and convert it into json.
 * @param {Buffer} buffer 
 * @param {number} offset 
 */
function parseSegment(buffer, offset) {
    let typeKey = buffer[offset];

    if (typeKey <= 20) {
        if (buffer[offset + 1] == undefined) throw new Error("ParseError: No value for uint8");
        return { typeKey: typeKey, value: buffer[offset + 1], bufferLength: 2 };
    }
    if (typeKey <= 40) {
        if (buffer[offset + 2] == undefined) throw new Error("ParseError: Incomplete value for uint16");
        return { typeKey: typeKey, value: buffer.readUInt16BE(offset + 1), bufferLength: 3 };
    }
    else if (typeKey <= 90) {
        if (buffer[offset + 4] == undefined) throw new Error("ParseError: Incomplete value for uint32");
        return { typeKey: typeKey, value: buffer.readUInt32BE(offset + 1), bufferLength: 5 };
    }
    else if (typeKey <= 155) {
        if (buffer[offset + 1] == undefined) throw new Error("ParseError: Incomplete length value for string");
        let len = buffer.readUInt8(offset + 1);
        if (buffer[offset + 1 + len] == undefined) throw new Error("ParseError: Incomplete value for string");
        let value = buffer.toString("utf8", offset + 2, offset + 2 + len);

        return { typeKey: typeKey, value: value, bufferLength: 2 + len };
    }
    else if (typeKey <= 165) {
        if (buffer[offset + 16] == undefined) throw new Error("ParseError: Incomplete value for uuid");
        let len = 16;
        let value = new Buffer(len);
        buffer.copy(value, 0, offset + 1, offset + 1 + len);

        return { typeKey: typeKey, value: value, bufferLength: 1 + len };
    }
    else if (typeKey <= 180) {
        if (buffer[offset + 1] == undefined) throw new Error("ParseError: Incomplete length value for byte string");
        let len = buffer.readUInt8(offset + 1);
        if (buffer[offset + len + 1] == undefined) throw new Error("ParseError: Incomplete value for byte string");
        let value = new Buffer(len);
        buffer.copy(value, 0, offset + 2, offset + 2 + len);

        return { typeKey: typeKey, value: value, bufferLength: 2 + len };
    }
    else {
        throw new Error("typeKey not supported");
    }
}

/**
 * Parse a buffer to a array of segments
 * @param {Buffer} buffer 
 */
function parseSegments(buffer) {
    if (buffer.length == 0) throw new Error("bad segments stream");

    let pointer = 0;
    let segments = [ ];

    while (pointer < buffer.length) {
        let seg = parseSegment(buffer, pointer);
        segments.push(seg);
        pointer += seg.bufferLength;
        delete seg.bufferLength;
    }

    if (pointer != buffer.length) {
        throw new Error("Bad / incomplete segments");
    }

    return segments;
}

/**
 * Parse a everiToken's QRCode Text
 * @param {string} text 
 */
function parseQRCode(text, options) {
    if (text.length < 3 || text.length > 2000) throw new Error("Invalid length of EvtLink");

    let textSplited = text.split("_");
    if (textSplited.length > 2) return null;

    let rawText;

    if (textSplited[0].startsWith(qrPrefix)) {
        rawText = textSplited[0].substr(qrPrefix.length);
    }
    else {
        rawText = textSplited[0];
    }
    
    // decode segments base42
    let segmentsBytes = EvtLink.dec2b(rawText);
    if (segmentsBytes.length < 2) throw new Error("no flag in segment");
    let flag = segmentsBytes.readInt16BE(0);
    
    if ((flag & 1) == 0) { // check version of EvtLink
        throw new Error("The EvtLink is invalid or its version is newer than version 1 and is not supported by evtjs yet");
    }
    let segmentsBytesRaw = new Buffer(segmentsBytes.length - 2);
    segmentsBytes.copy(segmentsBytesRaw, 0, 2, segmentsBytes.length);

    let publicKeys = [ ];
    let signatures = [ ];

    if (textSplited[1]) {
        let buf = EvtLink.dec2b(textSplited[1]);
        let i = 0;

        if (buf.length % 65 !== 0) {
            throw new Error("length of signature is invalid");
        }

        while (i * 65 < buf.length) {
            let current = new Buffer(65);
            buf.copy(current, 0, i * 65, i * 65 + 65);
            let signature = ecc.Signature.fromBuffer(current);
            signatures.push(signature.toString());

            if (!options || options.recoverPublicKeys) {
                publicKeys.push(signature.recover(segmentsBytes).toString());
            }

            ++i;
        }
    }

    return { flag, segments: parseSegments(segmentsBytesRaw), publicKeys, signatures };
}

/**
 * Calculate the value of keyProvider
 * @param {string | string[] | function} keyProvider
 * @returns {string[]}
 */
async function __calcKeyProvider(keyProvider) {
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
        if (!EvtKey.isValidPrivateKey(key)) {
            throw new Error("Invalid private key");
        }
    }

    return keyProvider;
}

/**
 * @param {number} flag The flag of EvtLink
 * @param {Buffer[]} segments List of segments
 * @param {object} params QR options
 */
async function __getQRCode(flag, segments, params) {
    // sort by key
    segments = segments.sort((x, y) => {
        return x[0] - y[0];
    });

    if (params.keyProvider) {
        params.keyProvider = await __calcKeyProvider(params.keyProvider);

        if (params.keyProvider.length > 3) {
            throw new Error("Exceed max private key limit: 3");
        }
    }

    let flagBuffer = new Buffer(2);
    flagBuffer.writeInt16BE(flag, 0);

    let segmentsBytes = Buffer.concat([ flagBuffer ].concat(segments));
    let _qrPrefix = "";

    if ((flag & 16) == 16) {
        _qrPrefix = qrPrefix;
    }

    let text = `${_qrPrefix}${EvtLink.b2dec(segmentsBytes)}`;

    if (params.keyProvider && params.keyProvider.length > 0) {
        let sigBufs = [];

        for (let i = 0; i < params.keyProvider.length; ++i) {
            let key = params.keyProvider[i];
            let sig = await ecc.sign(segmentsBytes, key);
            sigBufs.push(ecc.Signature.from(sig).toBuffer());
        }
        
        text += "_" + EvtLink.b2dec(Buffer.concat(sigBufs));
    }

    return text;
}

/**
 * parse EvtLink's text
 * @param {object} params the text of EvtLink
 */
EvtLink.parseEvtLink = async function(text, options) {
    // console.log("[parseEvtLink] " + text);
    return parseQRCode(text, options);
};

EvtLink.validateEveriPassUnsafe = async function validateEveriPassUnsafe(options) {
    // parse
    if (!options.parsedEvtLink) {
        options.parsedEvtLink = await EvtLink.parseEvtLink(options.evtLink);
    }

    // check time
    let timestamp, domain, tokenName;

    try {
        if (!(options.parsedEvtLink.flag & 2)) {
            throw new Error("Flag is not correct for everiPass");
        }
        timestamp = options.parsedEvtLink.segments.filter(x => x.typeKey == 42)[0].value * 1000 || 0;
        domain = options.parsedEvtLink.segments.filter(x => x.typeKey == 91)[0].value;
        tokenName = options.parsedEvtLink.segments.filter(x => x.typeKey == 92)[0].value;
    }
    catch (e) {
        throw new Error("everiPass is in wrong format: the evtLink is not a well-formatted everiPass string.");
    }

    if (Math.abs(timestamp - new Date().getTime()) > 60000) {
        throw new Error("everiPass is expired");
    }

    // check if the public key really has the token.
    if (options.parsedEvtLink.publicKeys.length !== 1) {
        throw new Error("For unsafe validation of everiPass, evtLink must have one and only one signature.");
    }
    
    let list = await options.apiCaller.getOwnedTokens(options.parsedEvtLink.publicKeys); // TODO!!

    if (list.filter(x => x.domain == domain && x.name == tokenName).length == 1) {
        return { valid: true, domain, name: tokenName };
    }

    return { valid: false, domain, name: tokenName };
};

// list of available typeKey:
// typeKey      description
// 41           flag
//      1       protocol version 1 (required)
//      2       everiPass
//      4       everiPay
//      8       should destory the NFT after validate the token in everiPass
//      16      collection code
// 42           unix timestamp in seconds
// 43           max allowed amount for payment (optionl)
// 44           symbol id to be paid in everiPay (for example: "5")
// 91           domain name to be validated in everiPass
// 92           token  name to be validated in everiPass
// 94           max allowed amount for payment (optionl, string format remained only for amount >= 2 ^ 32)
// 95           public key (address) for receiving points or coins
// 156          global-unique link id

/**
 * Get a cryptography-strong unique link id that is mostly unique.
 */
EvtLink.getUniqueLinkId = async function() {
    let ret = randomBytes(16);

    return ret.toString("hex");
};

/**
 * get everiPass's text from specific private key and token name
 * @deprecated
 * @param {object} params the params of the pass
 */
EvtLink.getEveriPassText = async function(params) {
    if (!params) throw new Error("Invalid params");

    let byteSegments = [ ];

    if (params.autoDestroying !== true && params.autoDestroying !== false) {
        throw new Error("Must specify the value of autoDestroying");
    }
    /*if (!params.linkId || params.linkId.length !== 32) {
        throw new Error("linkId is required");
    }*/

    // add segments
    let flag = (1 + 2 + (params.autoDestroying ? 8 : 0));                            // everiPass
    byteSegments.push(createSegment(42, Math.floor(new Date().valueOf() / 1000) ));  // timestamp
    if (params.domainName) byteSegments.push(createSegment(91, params.domainName));  // domainName for everiPass
    if (params.tokenName) byteSegments.push(createSegment(92, params.tokenName));    // tokenName for everiPass
    // byteSegments.push(createSegment(156, Buffer.from(params.linkId, "hex") ));       // random link id 

    // convert buffer of segments to text using base10
    return {
        rawText: await __getQRCode(flag, byteSegments, params)
    };
};

/**
 * get everiPay's text from specific private key and token name
 * @param {object} params the params of the everiPay QRCode
 */
EvtLink.getEvtLinkForEveriPass = EvtLink.getEveriPassText;

/**
 * get everiPay's text from specific private key and token name
 * @deprecated
 * @param {object} params the params of the everiPay QRCode
 */
EvtLink.getEveriPayText = async function(params) {
    if (!params) throw new Error("Invalid params");

    let byteSegments = [ ];

    if (!params.symbol || !Number.isInteger(params.symbol)) {
        throw new Error("Must specify the value of symbol (integer)");
    }
    if (!params.linkId || params.linkId.length !== 32) {
        throw new Error("linkId is required");
    }
    if (!params.maxAmount || !Number.isInteger(params.maxAmount)) {
        throw new Error("maxAmount is required, and must be a integer");
    }

    // add segments
    let flag =  (1 + 4);  // everiPay
    byteSegments.push(createSegment(42, Math.floor(new Date().valueOf() / 1000) ));  // timestamp
    byteSegments.push(createSegment(44, params.symbol.toString()));  // symbol for everiPay

    if (params.maxAmount && params.maxAmount < 4294967295) 
        byteSegments.push(createSegment(43, params.maxAmount));  // max amount
    if (params.maxAmount && params.maxAmount >= 4294967295) 
        byteSegments.push(createSegment(94, params.maxAmount.toString()));  // max amount
    
    byteSegments.push(createSegment(156, Buffer.from(params.linkId, "hex") ));         // random link id 

    // convert buffer of segments to text using base10
    return {
        rawText: await __getQRCode(flag, byteSegments, params)
    };
};

/**
 * get everiPay's text from specific private key and token name
 * @param {object} params the params of the everiPay QRCode
 */
EvtLink.getEvtLinkForEveriPay = EvtLink.getEveriPayText;

/**
 * get evt link for payee code
 * @param {object} params the params of the pass
 */
EvtLink.getEvtLinkForPayeeCode = async function(params) {
    if (!params) throw new Error("Invalid params");

    let byteSegments = [ ];

    if (!params.address || typeof params.address !== "string") {
        throw new Error("Must specify the value of address");
    }

    // add segments
    let flag = 1 + 16;  // collection code
    byteSegments.push(createSegment(95, params.address) );  // payeeCode
    delete params.keyProvider;

    if (params.fungibleId) {
        if (!Number.isInteger(params.fungibleId)) throw new Error("fungibleId must be a integer");

        byteSegments.push(createSegment(45, params.fungibleId) );
    }
    if (params.amount) {
        if (typeof params.amount !== "string") throw new Error("amount must be a decimal string with proper precision (like asset type doing)");
        if (!params.fungibleId) throw new Error("If amount is provided, fungibleId is required.");

        byteSegments.push(createSegment(96, params.amount) );
    }

    // convert buffer of segments to text using base10
    return {
        rawText: await __getQRCode(flag, byteSegments, params)
    };
};


/**
 * get everiPass's qr code image address from specific private key and token name
 * @param {object} params the params of the pass
 */
EvtLink.getEVTLinkQrImage = function(qrType, qrParams, imgParams, callback) {
    let intervalId;
    if (imgParams.autoReload) {
        intervalId = setInterval(() => EvtLink.getEVTLinkQrImage(qrType, qrParams, Object.assign(imgParams, { autoReload: false, intervalId }), callback), 5000);
    }

    let errorCorrectionLevel = "M";
    let func;

    switch (qrType) {
    case "everiPass":
        func = EvtLink.getEvtLinkForEveriPass;
        break;
    case "everiPay":
        func = EvtLink.getEvtLinkForEveriPay;
        break;
    case "payeeCode":
        func = EvtLink.getEvtLinkForPayeeCode;
        break;
    default:
        throw new Error("invalid QR Type");
    }

    let time = new Date().valueOf();
    
    func(qrParams)
        .then((res) => {
            time = (new Date().valueOf()) - time;

            if (res.rawText.length > 300) {
                errorCorrectionLevel = "M";
            }
            if (res.rawText.length > 260) {
                errorCorrectionLevel = "L";
            }

            if (imgParams.canvas) {
                qrcode.toCanvas(imgParams.canvas, res.rawText, { errorCorrectionLevel, scale: 16, "color": { dark: "#000000" } }, (err) => {
                    callback(err, { rawText: res.rawText, timeConsumed: time, intervalId: intervalId || imgParams.intervalId } );
                });
            }
            else {
                qrcode.toDataURL(res.rawText, { errorCorrectionLevel, scale: 16, "color": { dark: "#000000" } }, (err, url) => {
                    callback(err, { dataUrl: url, rawText: res.rawText, timeConsumed: time, intervalId: intervalId || imgParams.intervalId } );
                });
            }
        })
        .catch((e) => {
            callback(e);
        });

    return { intervalId, autoReloadInterval: 5000 };
};

module.exports = EvtLink;
