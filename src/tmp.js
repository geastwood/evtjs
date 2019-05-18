
const EVT = require(".");

// async function test() {
//     let caller = EVT({});

//     console.time("h");
//     for (let i = 0; i < 30; ++i) {
//         let r = await caller.__chainAbiJsonToBin({
//             action: "transferft", args: {
//                 "from": "EVT6s645MbiHEdFyZzyV94pUdaPtqu6AvcgupAtrjotAXTUMfTkzw",
//                 "to": "EVT6s645MbiHEdFyZzyV94pUdaPtqu6AvcgupAtrjotAXTUMfTkzw",
//                 "number": "1.00000 S#1",
//                 "memo": "2529361"
//             }
//         }, true);

//         console.log(r);
//     }

//     console.timeEnd("h");
// }

// test();

let fs = require("fs");
let lines = fs.readFileSync("E:\\tmp.txt", { encoding: 'utf8' }).split('\n');

async function t(){
    for (let i = 0; i < lines.length; ++i) {
        if (lines[i]) {
            let splited = lines[i].split("_");
            console.log("segm:" + EVT.EvtLink.dec2b(splited[0]).toString("hex"));
            console.log("sign:" + EVT.EvtLink.dec2b(splited[1]).toString("hex"));
        }
    }
}

t();
