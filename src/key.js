

const ecc = require('eosjs-ecc');

class EvtKey {

}

/**
 * Convert from private key to public key
 * @param {*} privateKey privateKey in WIF format
 */
EvtKey.privateToPublic = function(privateKeyInWif) {
    return "EVT" + ecc.privateToPublic(privateKeyInWif).substr(3);
}

/**
 * Generates a private key for evt and returns a Promise, the return value is a WIF
 */
EvtKey.randomPrivateKey = async function() {
    return await ecc.randomKey();
};

/**
 * Generates a private key for evt in specific seed. Note: for a same seed, the private key will always be the same.
 * @param {*} seed 
 */
EvtKey.seedPrivateKey = function(seed) {
    return ecc.seedPrivate(seed)
}

/**
 * Check if a public key is valid.
 * @param {*} key public key
 */
EvtKey.isValidPublicKey = function(key) {
    if (typeof key !== 'string' || key.length < 8) return false;
    if (!key.startsWith("EVT")) return false;

    return ecc.isValidPublic('EVT' + key.substr(3)) || ecc.isValidPublic('EOS' + key.substr(3));
}

/**
 * Check if a public key is valid.
 * @param {*} key wif format of a private key
 */
EvtKey.isValidPrivateKey = function(key) {
    return ecc.isValidPrivate(key)
}

module.exports = EvtKey;
