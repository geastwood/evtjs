const Structs = require("./structs");
const Fcbuffer = require("fcbuffer");

let structs = Structs({ });
let structstransaction = structs.structs.transaction;


let trans = {
    actions: [

    ],
    expiration: (new Date(new Date().valueOf() + 100000)).toISOString().substr(0, 19),
    ref_block_num: 2389,
    ref_block_prefix: 34232322,
    payer: "EVT6Qz3wuRjyN6gaU3P3XRxpnEZnM4oPxortemaWDwFRvsv2FxgND",
    max_charge: 1000000
};

let obj = structstransaction.fromObject(trans);
let buffer = Fcbuffer.toBuffer(structstransaction, obj);
console.log(buffer);
