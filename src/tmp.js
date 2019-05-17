
const EVT = require(".");

const t = EVT.EvtKey.privateKeyFromBuffer("f3a1cce59d01ce5bd93c93b47d1b01c3f1a1169ec0713df2e8e08deef6dc888f");
const p = EVT.EvtKey.publicKeyFromCompressedBuffer("036bac55d258d15441cc79b78b929aedb777b15142392590e4bb0a2350cbe86935");


console.log({t, p, h:  EVT.EvtKey.privateToPublic(t)});
