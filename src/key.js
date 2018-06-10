

const ecc = require('eosjs-ecc');

class EvtKey {

}

/**
 * Convert from private key to public key
 * @param {*} privateKey 
 */
EvtKey.privateToPublic = function(privateKey) {
    return "EVT" + ecc.privateToPublic(privateKey).substr(3);
}

/**
 * Generates a private key for evt and returns a Promise
 */
EvtKey.randomPrivateKey = async function() {
    return await ecc.randomKey();
};

module.exports = EvtKey;
