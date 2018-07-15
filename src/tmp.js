/*const Structs = require("./structs");

let structs = Structs({ });
console.log(structs);

let trans = {

};*/

const utils = require("./evtUtils");

async function test() {
    utils.getEveriPassText({ privateKey: "5JgWJptxZENHR69oZsPSeVTXScRx7jYPMTjPTKAjW2JFnjEhoDZ", domainName: "testdomain", tokenName: "testtoken" }, (err, res) => {
        console.log(res);
    });

    utils.getEveriPassImage({ privateKey: "5JgWJptxZENHR69oZsPSeVTXScRx7jYPMTjPTKAjW2JFnjEhoDZ", domainName: "testdomain", tokenName: "testtoken" }, (err, res) => {
        console.log(res);
    });
}

test();
 