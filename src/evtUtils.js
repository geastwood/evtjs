
const ecc = require("./ecc/index");
const qrcode = require("qrcode");
const base91 = require("./base91");

class EvtUtils {

}

let protoRoot = null;

/**
 * get everiPass's text from specific private key and token name
 * @param {object} params the params of the pass
 */
EvtUtils.getEveriPassText = function(params, callback) {
    // structure of the pass text:
    // [format_version] 1 byte (now is always 1)
    // [content] zone
    //     [flag]  2 bytes (version, function and so on)
    //     [time]  4 bytes (varies according to the flag)
    //     [nonce] 8 bytes
    //     []
    // [sig] zone

    if (!params) throw new Error("Invalid params");
    if (!params.privateKey) throw new Error("privateKey is required");
    if (!params.domainName) throw new Error("domainName is required");
    if (!params.tokenName) throw new Error("tokenName is required");
    
    let t = parseInt(new Date().valueOf() / 1000);
    let sig = ecc.sign(t.toString(), params.privateKey);
    let sigBuf = ecc.Signature.from(sig).toBuffer();
    let tbuf = new Buffer(4);
    tbuf.writeUInt32BE(t, 0);
    let t85 = base91.encode(tbuf);

    callback(null, `evt://p1?${t85}|${params.domain}|${params.tokenName}|` + base91.encode(sigBuf));

    // sig = ecc.Signature.from(sig).toBuffer().toString("base64");

    let protoLoaded = () => {
        // Obtain a message type
        var struct = protoRoot.lookupType("evtjs.PassOrPayMessage");

        // Exemplary payload
        var payload = { version: 0, flag: 1, time: t, signature: sigBuf, domainName: params.domainName, tokenName: params.tokenName };

        // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
        var errMsg = struct.verify(payload);
        if (errMsg) {
            callback(errMsg);
        }

        // Create a new message
        var message = struct.create(payload); // or use .fromObject if conversion is necessary

        // Encode a message to an Uint8Array (browser) or Buffer (node)
        var buffer = struct.encode(message).finish();
        console.log(payload);
        callback(null, ascii85.encode(buffer).toString()); // 
    };

    if (protoRoot == null) {
        protobuf.load("./src/schema/qrPassOrPay.proto", function(err, root) {
            if (!err) {
                protoRoot = root;
                protoLoaded();
            }
            else {
                callback(err);
            }
        });
    }
    else {
        protoLoaded();
    }

    // return `evt://p1?${t}|${params.domain}|${params.tokenName}|` + sig;
};

/**
 * get everiPass's qr code image address from specific private key and token name
 * @param {object} params the params of the pass
 */
EvtUtils.getEveriPassImage = function(params, callback) {
    EvtUtils.getEveriPassText(params, (err, res) => {
        if (err) {
            callback(err);
        }

        qrcode.toDataURL(res, { errorCorrectionLevel: "Q" }, (err, res) => {
            callback(err, res);
        });
    });
};

module.exports = EvtUtils;
