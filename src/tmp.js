
const EVT = require(".");
const { createECDH } = require('crypto');

const t = EVT.EvtKey.privateKeyFromBuffer("f3a1cce59d01ce5bd93c93b47d1b01c3f1a1169ec0713df2e8e08deef6dc888f");
const p = EVT.EvtKey.publicKeyFromCompressedBuffer("036bac55d258d15441cc79b78b929aedb777b15142392590e4bb0a2350cbe86935");


console.time("privateToPublic");
console.log({t, p, h:  EVT.EvtKey.privateToPublic(t)});
console.log({t, p, h:  EVT.EvtKey.privateToPublic(t)});
console.log({t, p, h:  EVT.EvtKey.privateToPublic(t)});
console.log({t, p, h:  EVT.EvtKey.privateToPublic(t)});
console.log({t, p, h:  EVT.EvtKey.privateToPublic(t)});
console.log({t, p, h:  EVT.EvtKey.privateToPublic(t)});
console.log({t, p, h:  EVT.EvtKey.privateToPublic(t)});
console.log({t, p, h:  EVT.EvtKey.privateToPublic(t)});
console.log({t, p, h:  EVT.EvtKey.privateToPublic(t)});
console.log({t, p, h:  EVT.EvtKey.privateToPublic(t)});
console.timeEnd("privateToPublic");


function getPublicKey2(t) {
    const ecdh = createECDH('secp256k1');
    ecdh.setPrivateKey(EVT.EvtKey.privateKeyToBufferHex(t), 'hex');
    return EVT.EvtKey.publicKeyFromCompressedBuffer(ecdh.getPublicKey('hex', 'compressed'));
}

console.time("privateToPublic2");
console.log({t, p, h:  getPublicKey2(t)});
console.log({t, p, h:  getPublicKey2(t)});
console.log({t, p, h:  getPublicKey2(t)});
console.log({t, p, h:  getPublicKey2(t)});
console.log({t, p, h:  getPublicKey2(t)});
console.log({t, p, h:  getPublicKey2(t)});
console.log({t, p, h:  getPublicKey2(t)});
console.log({t, p, h:  getPublicKey2(t)});
console.log({t, p, h:  getPublicKey2(t)});
console.log({t, p, h:  getPublicKey2(t)});
console.timeEnd("privateToPublic2");
