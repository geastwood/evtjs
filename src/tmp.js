
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
async function t() {
    console.log(await EVT.default.EvtKey.signHash("00".repeat(32), "5J1by7KRQujRdXrurEsvEr2zQGcdPaMJRjewER6XsAR2eCcpt3D", "hex"));
    console.log(await EVT.default.EvtKey.signHash("00".repeat(32), "5J1by7KRQujRdXrurEsvEr2zQGcdPaMJRjewER6XsAR2eCcpt3D", "hex"));
    console.log(await EVT.default.EvtKey.signHash("00".repeat(32), "5J1by7KRQujRdXrurEsvEr2zQGcdPaMJRjewER6XsAR2eCcpt3D", "hex"));

}
t();
