

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

module.exports = EvtKey;
