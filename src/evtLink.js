
const ecc = require("./ecc/index");
const qrcode = require("qrcode");
const BigInteger = require("bigi");

const qrPrefix = "https://evt.li/";

class EvtLink {

}

/**
 * Convert a buffer to base10 representation.
 * @param {Buffer} buffer The buffer-like object to be converted.
 */
EvtLink.b2dec = function(buffer) {
    if (buffer.length == 0) return "";
    let ret = BigInteger.fromBuffer(buffer).toString(10);
    if (ret == "0") ret = "";

    let i = 0;
    while (buffer[i++] == 0) {
        ret = "0" + ret;
    }

    return ret;
};

/**
 * Convert a base10 representation to buffer.
 * @param {string} base10 string.
 */
EvtLink.dec2b = function(base10) {
    // get count of 0
    let zeroCount = 0, i = 0;

    while (base10[i++] === "0") {
        zeroCount++;
    }
    
    let buf = new BigInteger(base10, 10).toBuffer(0);

    return Buffer.concat([ Buffer.alloc(zeroCount, 0), buf ]);
};

/**
 * create a buffer representing a segment.
 * Different typeKey has different data type, this is the detail:
 * 0   - 40    1-byte unsigned integer
 * 41  - 90   4-byte unsigned integer
 * 91  - 155  string
 * 156 - 180  byte string
 * > 180     remained
 * 
 * @param {*} typeKey the typeKey, different key has different type and meanings (0 - 254)
 * @param {*} value the value, must has the right data type according to typeKey
 */
function createSegment(typeKey, value) {
    // 1-byte unsigned integer
    if (typeKey <= 40) {
        return (new Buffer([ typeKey, value ]));
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
    // byte string
    else if (typeKey <= 180) {
        let content = value;
        let header = new Buffer([ typeKey, content.length ]);
        return (Buffer.concat([ header, content ]));
    }
}

/**
 * Parse a segment and convert it into json.
 * @param {Buffer} buffer 
 * @param {number} offset 
 */
function parseSegment(buffer, offset) {
    let typeKey = buffer[offset];

    if (typeKey == null) return null;

    if (typeKey <= 40) {
        return { typeKey: typeKey, value: buffer[offset + 1], bufferLength: 2 };
    }
    else if (typeKey <= 90) {
        return { typeKey: typeKey, value: buffer.readUInt32BE(offset + 1), bufferLength: 5 };
    }
    else if (typeKey <= 155) {
        let len = buffer.readUInt8(offset + 1);
        let value = buffer.toString("utf8", offset + 2, offset + 2 + len);

        return { typeKey: typeKey, value: value, bufferLength: 2 + len };
    }
    else {
        let len = buffer.readUInt8(offset + 1);
        let value = new Buffer(len);
        buffer.copy(value, 0, offset + 2, offset + 2 + len);

        return { typeKey: typeKey, value: value, bufferLength: 2 + len };
    }
}

/**
 * Parse a buffer to a array of segments
 * @param {Buffer} buffer 
 */
function parseSegments(buffer) {
    let pointer = 0;
    let segments = [ ];
    while (pointer < buffer.length) {
        let seg = parseSegment(buffer, pointer);
        segments.push(seg);
        pointer += seg.bufferLength;
    }

    return segments;
}

/**
 * Parse a everiToken's QRCode Text
 * @param {string} text 
 */
function parseQRCode(text) {
    let textSplited = text.split("-");
    if (textSplited.length > 2) return null;

    if (!textSplited[0].startsWith(qrPrefix)) return null;
    let rawText = textSplited[0].substr(qrPrefix.length);

    // validate signature
    let publicKeys = [ ];
    if (textSplited[1]) {
        while (textSplited[1].length > 0) {
            let current = textSplited[1].substr(0, 65);
            textSplited[1] = textSplited[1].substr(65);
            let signature = ecc.Signature.fromBuffer(EvtLink.dec2b(current));
            publicKeys.push(signature.recover(textSplited[0], "utf8").toString());
        }
    }

    return { segment: parseSegments(EvtLink.dec2b(rawText)), publicKeys };
}

function isFunction(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === "[object Function]";
}

async function getQRCode(segments, params) {
    if (params.keyProvider) {
        if (!Array.isArray(params.keyProvider)) {
            params.keyProvider = [ params.keyProvider ];
        }

        if (params.keyProvider.length > 3) {
            throw new Error("Exceed max private key limit: 3");
        }

        for (let i = 0; i < params.keyProvider.length; ++i) {
            if (isFunction(params.keyProvider[i])) {
                params.keyProvider[i] = params.keyProvider[i]();
            }
            params.keyProvider[i] = await Promise.resolve(params.keyProvider[i]);

            if (!params.keyProvider[i] || (typeof params.keyProvider[i] !== "string")) {
                throw new Error("invalid private key found");
            }
        }
    }

    let text = `${qrPrefix}${EvtLink.b2dec(Buffer.concat(segments))}`;

    if (params.keyProvider && params.keyProvider.length > 0) {
        let sigBufs = [];

        for (let i = 0; i < params.keyProvider.length; ++i) {
            let sig = ecc.sign(text, params.keyProvider[i]);
            sigBufs.push(ecc.Signature.from(sig).toBuffer());
        }
        
        text += "-" + EvtLink.b2dec(Buffer.concat(sigBufs));
    }

    return text;
}

/**
 * get QRCode's decoded text
 * @param {object} params the text of qr code
 */
EvtLink.parseEvtLink = async function(text) {
    return parseQRCode(text);
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
// 91           domain name to be validated in everiPass
// 92           token  name to be validated in everiPass
// 93           symbol name to be paid in everiPay (for example: "5,EVT")
// 94           max allowed amount for payment (optionl, string format remained only for amount >= 2 ^ 32)
// 95           public key (address) for receiving points or coins

/**
 * get everiPass's text from specific private key and token name
 * @param {object} params the params of the pass
 */
EvtLink.getEveriPassText = async function(params) {
    if (!params) throw new Error("Invalid params");

    let byteSegments = [ ];

    if (params.autoDestroying !== true && params.autoDestroying !== false) {
        throw new Error("Must specify the value of autoDestroying");
    }

    // add segments
    byteSegments.push(createSegment(41, (1 + 2 + params.autoDestroying ? 8 : 0) ));  // everiPass
    byteSegments.push(createSegment(42, parseInt(new Date().valueOf() / 1000)));     // timestamp
    if (params.domainName) byteSegments.push(createSegment(91, params.domainName));  // domainName for everiPass
    if (params.tokenName) byteSegments.push(createSegment(92, params.tokenName));    // tokenName for everiPass

    // convert buffer of segments to text using base10
    return {
        rawText: await getQRCode(byteSegments, params)
    };
};

/**
 * get everiPay's text from specific private key and token name
 * @param {object} params the params of the everiPay QRCode
 */
EvtLink.getEveriPayText = async function(params) {
    if (!params) throw new Error("Invalid params");

    let byteSegments = [ ];

    if (!params.symbol) {
        throw new Error("Must specify the value of symbol");
    }

    // add segments
    byteSegments.push(createSegment(41, (1 + 4) ));  // everiPay
    byteSegments.push(createSegment(42, parseInt(new Date().valueOf() / 1000)));     // timestamp
    byteSegments.push(createSegment(93, params.symbol));  // symbol for everiPay
    if (params.maxAmount && params.maxAmount < 4294967295) byteSegments.push(createSegment(43, params.maxAmount));  // max amount
    if (params.maxAmount && params.maxAmount >= 4294967295) byteSegments.push(createSegment(94, params.maxAmount.toString()));  // max amount

    // convert buffer of segments to text using base10
    return {
        rawText: await getQRCode(byteSegments, params)
    };
};

/**
 * get everiPass's collection qr code
 * @param {object} params the params of the pass
 */
EvtLink.getAddressCodeTextForReceiver = async function(params) {
    if (!params) throw new Error("Invalid params");

    let byteSegments = [ ];

    if (!params.address || typeof params.address !== "string") {
        throw new Error("Must specify the value of address");
    }

    // add segments
    byteSegments.push(createSegment(41, 1 + 16 ));  // collection code
    byteSegments.push(createSegment(95, params.address) );  // collectionQr
    delete params.keyProvider;

    // convert buffer of segments to text using base10
    return {
        rawText: await getQRCode(byteSegments, params)
    };
};


/**
 * get everiPass's qr code image address from specific private key and token name
 * @param {object} params the params of the pass
 */
EvtLink.getEVTLinkQrImage = function(qrType, qrParams, imgParams, callback) {
    let intervalId;
    if (imgParams.autoReload) {
        intervalId = setInterval(() => EvtLink.getEVTQrImage(qrType, qrParams, Object.assign(imgParams, { autoReload: false }), callback), 5000);
    }

    let errorCorrectionLevel = "Q";
    let func;

    switch (qrType) {
    case "everiPass":
        func = EvtLink.getEveriPassText;
        break;
    case "everiPay":
        func = EvtLink.getEveriPayText;
        break;
    case "addressOfReceiver":
        func = EvtLink.getAddressCodeTextForReceiver;
        break;
    default:
        throw new Error("invalid QR Type");
    }
    
    func(qrParams)
        .then((res) => {
            console.log(res.rawText);

            if (res.rawText.length > 300) {
                errorCorrectionLevel = "M";
            }
            if (res.rawText.length > 400) {
                errorCorrectionLevel = "L";
            }

            if (imgParams.canvas) {
                qrcode.toCanvas(imgParams.canvas, res.rawText, { errorCorrectionLevel, scale: 8, "color": { dark: "#3d226d" } }, (err) => {
                    callback(err, { rawText: res.rawText } );
                });
            }
            else {
                qrcode.toDataURL(res.rawText, { errorCorrectionLevel, scale: 8, "color": { dark: "#3d226d" } }, (err, url) => {
                    callback(err, { dataUrl: url, rawText: res.rawText } );
                });
            }
        })
        .catch((e) => {
            callback(e);
        });

    return intervalId;
};

module.exports = EvtLink;
