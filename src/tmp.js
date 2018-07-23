let sha256 = require("./sha256.min");

let ret = sha256(new Uint8Array([ 2, 3, 4, 5 ]));

console.log(ret);
