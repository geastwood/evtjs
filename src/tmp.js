/*const Structs = require("./structs");

let structs = Structs({ });
console.log(structs);

let trans = {

};*/

async function test() {
    const ecc = require("./ecc/index");

    let ret = await ecc.randomKey();
    let pub = ecc.privateToPublic(ret);
    console.log(pub);
}

test();
