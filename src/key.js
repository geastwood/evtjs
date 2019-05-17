

const ecc = require("./ecc/index");

class EvtKey {

}

/**
 * Convert from private key to public key
 * @param {*} privateKey privateKey in WIF format
 */
EvtKey.privateToPublic = function(privateKeyInWif) {
    return "EVT" + ecc.privateToPublic(privateKeyInWif).substr(3);
};

/**
 * Generates a private key for evt and returns a Promise, the return value is a WIF
 */
EvtKey.randomPrivateKey = async function() {
    ecc.initialize();
    return await ecc.randomKey();
};

/**
 * Generates a private key for evt from a Buffer
 */
EvtKey.privateKeyFromBuffer = function(bufferHex) {
    return ecc.PrivateKey.fromBuffer(new Buffer(bufferHex, "hex")).toString();
};

/**
 * Generates a public key for evt from a Buffer
 */
EvtKey.publicKeyFromCompressedBuffer = function(bufferHex) {
    return ecc.PublicKey.fromBuffer(new Buffer(bufferHex, "hex")).toString();
};

/**
 * Generates a private key for evt in specific seed. Note: The same seed produces the same private key every time. At least 128 random bits should be used to produce a good private key.
 * @param {string} seed The seed string
 */
EvtKey.seedPrivateKey = function(seed) {
    return ecc.seedPrivate(seed);
};

/**
 * Check if a public key is valid.
 * @param {*} key public key
 */
EvtKey.isValidPublicKey = function(key) {
    if (typeof key !== "string" || key.length < 8) return false;
    if (!key.startsWith("EVT")) return false;

    return ecc.isValidPublic("EVT" + key.substr(3)) || ecc.isValidPublic("EOS" + key.substr(3));
};

EvtKey.sign = function(buf, privateKey, encoding) {
    return ecc.sign(buf, privateKey, encoding);
};

EvtKey.signHash = function(buf, privateKey, encoding) {
    return ecc.signHash(buf, privateKey, encoding);
};

/**
 * Check if a address is valid.
 * @param {*} key address
 */
EvtKey.isValidAddress = function(address) {
    if (typeof address !== "string" || address.length < 8) return false;
    if (!address.startsWith("EVT")) return false;

    if (address === "EVT00000000000000000000000000000000000000000000000000") return true;
    if (address.length == 53 && address[3] == "0") return true;

    return ecc.isValidPublic("EVT" + address.substr(3)) || ecc.isValidPublic("EOS" + address.substr(3));
};


/**
 * return safe random bytes as hex.
 */
EvtKey.random32BytesAsHex = async function() {
    await ecc.initialize();
    return ecc.key_utils.random32ByteBuffer({ safe: true }).toString("hex");
};

/**
 * return safe random bytes.
 */
EvtKey.random32Bytes = async function() {
    await ecc.initialize();
    return ecc.key_utils.random32ByteBuffer({ safe: true });
};

/**
 * return a promise that resolves a safe random string to be used in name128 format.
 */
EvtKey.randomName128 = async function() {
    await ecc.initialize();

    let buffer = ecc.key_utils.random32ByteBuffer({ safe: true });
    let range = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.-";
    let ret = "";

    for (let i = 0; i < 21; ++i) {
        ret += range[buffer.readUInt8(i) % range.length];
    }

    return ret;
};
 
/**
 * Check if a public key is valid.
 * @param {*} key wif format of a private key
 */
EvtKey.isValidPrivateKey = function(key) {
    return ecc.isValidPrivate(key);
};

/**
 * return the address representing a null address.
 */
EvtKey.getNullAddress = function() {
    return "EVT00000000000000000000000000000000000000000000000000";
};

module.exports = EvtKey;
