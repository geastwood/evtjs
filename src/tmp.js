// const Structs = require("./structs");
// const Fcbuffer = require("fcbuffer");

// let structs = Structs({ });
// let structstransaction = structs.structs.transaction;


// let trans = {
//     actions: [

//     ],
//     expiration: (new Date(new Date().valueOf() + 100000)).toISOString().substr(0, 19),
//     ref_block_num: 2389,
//     ref_block_prefix: 34232322,
//     payer: "EVT6Qz3wuRjyN6gaU3P3XRxpnEZnM4oPxortemaWDwFRvsv2FxgND",
//     max_charge: 1000000
// };

// let obj = structstransaction.fromObject(trans);
// let buffer = Fcbuffer.toBuffer(structstransaction, obj);
// console.log(buffer);

const EVT = require(".");

const wif = "5J1by7KRQujRdXrurEsvEr2zQGcdPaMJRjewER6XsAR2eCcpt3D"; // EVT6Qz3wuRjyN6gaU3P3XRxpnEZnM4oPxortemaWDwFRvsv2FxgND
const wif2 = "5JVC3ivLUT2zq3yEXkwJ2ihukZq5reufC3iW26hbVHvjepFXsiu"; // EVT7rbe5ZqAEtwQT6Tw39R29vojFqrCQasK3nT5s2pEzXh1BABXHF
const wif3 = "5K3nUWxfkUjfLQu9PL6NZLKWV41PiFyuQdrckArA59jz19M6zgq";
const publicKey = EVT.EvtKey.privateToPublic(wif);
const network = {
    host: "testnet1.everitoken.io",
    port: 9999,
    protocol: "http"
};

async function test() {
    let evtLink = EVT.EvtLink;
    let linkId = await evtLink.getUniqueLinkId();

    let link = await evtLink.getEvtLinkForEveriPay({
        symbol: 1,
        maxAmount: 10000000,
        keyProvider: [ wif ],
        linkId
    });

    // execute the pay
    const apiCaller = EVT({
        endpoint: network,
        keyProvider: [ wif2 ],
        networkTimeout: 10000
    });

    console.log("haha2");

    let trx = await apiCaller.pushTransaction(
        { maxCharge: 1000000 },
        new EVT.EvtAction(
            "everipay",
            {
                link: link.rawText,
                "payee": EVT.EvtKey.privateToPublic(wif2),
                "number": "1.00000 S#1"
            }
        )
    );

    let trxId = transactionId;

    apiCaller.getTransactionDetailById()

    console.log("haha" + JSON.stringify(trx));

    // wait for the status
    let promises = [], count = 20;
    for (let i = 0; i < count; ++i) {
        promises.push(apiCaller.getStatusOfEvtLink({
            linkId
        }));
    }
    
    let statuses = await Promise.all(promises);
    
    /*let status = await apiCaller.getStatusOfEvtLink({
        linkId
    });*/


    console.log("!!!!!" + JSON.stringify(statuses[count - 1], null, 2));
}

test();
