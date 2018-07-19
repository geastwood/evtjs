/*const Structs = require("./structs");

let structs = Structs({ });
console.log(structs);

let trans = {

};*/

const utils = require("./evtUtils");
const EVT = require(".");

const wif = "5JgWJptxZENHR69oZsPSeVTXScRx7jYPMTjPTKAjW2JFnjEhoDZ";
const publicKey = EVT.EvtKey.privateToPublic(wif);
const hash = require("./ecc/hash");
const privatekey = require("./ecc/key_private");

async function test() {
    console.log(utils.b2dec([]));
    console.log(utils.b2dec([0]));
    console.log(utils.b2dec([0, 29, 1, 0, 0]));
    console.log(utils.b2dec([0, 0, 29, 1]));
    console.log(utils.b2dec([0, 1, 2, 3, 4, 29, 253, 10, 29, 21, 88, 81, 39, 91, 0, 0, 58 ]));
    console.log(utils.b2dec([0, 1, 2, 3, 4, 29, 253, 10, 29, 21, 88, 81, 39, 91, 0, 0, 58, 0, 1, 2, 3, 4, 29, 253, 10, 29, 21, 88, 81, 39, 91, 0, 0, 58, 0, 1, 2, 3, 4, 29, 253, 10, 29, 21, 88, 81, 39, 91, 0, 0, 58 ]));

    console.log(utils.dec2b("0"));
    console.log(utils.dec2b("0486604800"));
    console.log(utils.dec2b("007425"));
    console.log(utils.dec2b("01339673762924417817569473779336216634"));
    console.log(utils.dec2b("010166181816266612325167406510771294739951378748488940999127934581325874520444959111330619703326020693147767512145854522"));

    utils.getEveriPassText({ privateKey: "5JgWJptxZENHR69oZsPSeVTXScRx7jYPMTjPTKAjW2JFnjEhoDZ", domainName: "testdomain", tokenName: "testtoken" }, (err, res) => {
        console.log(res);
    });

    /*utils.getEveriPassImage({ privateKey: "5JgWJptxZENHR69oZsPSeVTXScRx7jYPMTjPTKAjW2JFnjEhoDZ", domainName: "testdomain", tokenName: "testtoken" }, (err, res) => {
        console.log(res);
    });*/

    
}

test();
