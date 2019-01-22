let EvtLink = require("./evtLink");

/**
 * represents a everiToken action
 */
class EvtAction {
    /**
     * initialize a new EvtAction instance
     * @param {string} actionName abi structure of the action
     * @param {object} abi abi structure of the action
     * @param {string} domain the `domain` value of the action
     * @param {string} key the `key` value of the action
     */
    constructor(actionName, abi, domain = null, key = null) {
        // check parameters
        if (!actionName || actionName.length > 13) throw new Error("invalid actionName");
        if (!abi || (typeof abi !== "object")) throw new Error("invalid abi");

        this.actionName = actionName;
        this.abi = abi;
        this.domain = domain;
        this.key = key; 
    }

    async calculateDomainAndKey() {
        if (!this.domain || !this.key) {
            // use mapper to determine the `domain` and `key` field
            if (!domainKeyMappers[this.actionName]) {
                throw new Error(`When you create EvtAction for action "${this.actionName}", the parameter "domain" and "key" of the constructor of EvtAction could not be ignored. See https://www.everitoken.io/developers/apis,_sdks_and_tools/javascript_sdk_reference#pushtransaction-config-actions-promise and look into EvtAction part.`);
            }
            let ret = { };
            await Promise.resolve(domainKeyMappers[this.actionName]({ action: this.actionName, args: this.abi }, ret));
 
            this.domain = ret.domain;
            this.key = ret.key;
        }

        if (!this.domain || (typeof this.domain !== "string")) throw new Error("domain is invalid or not provided in EvtAction");
        if (Number.isInteger(this.key)) {
            this.key = String(this.key);
        }
        if (!this.key || (typeof this.key !== "string")) throw new Error("key is invalid or not provided in EvtAction");
    }
}

const domainKeyMappers = {
    "newdomain": (action, transfered) => {
        transfered.domain = action.args.name;
        transfered.key = ".create";
    },

    "updatedomain": (action, transfered) => {
        transfered.domain = action.args.name;
        transfered.key = ".update";
    },

    "issuetoken": (action, transfered) => {
        transfered.domain = action.args.domain;
        transfered.key = ".issue";
    },

    "newgroup": (action, transfered) => {
        transfered.domain = ".group";
        transfered.key = action.args.name;
    },

    "updategroup": (action, transfered) => {
        transfered.domain = ".group";
        transfered.key = action.args.name;
    },

    "newfungible": (action, transfered) => {
        transfered.domain = ".fungible";
        // remove precision for `key`
        let splited = action.args.sym.split("#");
        if (splited.length != 2) {
            throw new Error("Invalid parameter for sym");
        }
        transfered.key = splited[1];
    },

    "issuefungible": (action, transfered) => {
        transfered.domain = ".fungible";
        // remove precision for `key`
        let splited = action.args.number.split("#");
        if (splited.length != 2) {
            throw new Error("Invalid parameter for number");
        }
        transfered.key = splited[1];
    },

    "updfungible": (action, transfered) => {
        transfered.domain = ".fungible";
        transfered.key = String(action.args.sym_id);

        if (!transfered.key) {
            throw new Error("sym_id is needed for action `updfungible`");
        }
    },

    "transferft": (action, transfered) => {
        transfered.domain = ".fungible";
        transfered.key = String(action.args.number.split("#")[1]);

        if (!transfered.key) {
            throw new Error("number is invalid");
        }
    },

    "transfer": (action, transfered) => {
        transfered.domain = action.args.domain;
        transfered.key = action.args.name;
    },

    "destroytoken": (action, transfered) => {
        transfered.domain = action.args.domain;
        transfered.key = action.args.name;
    },

    "evt2pevt": (action, transfered) => {
        transfered.domain = ".fungible";
        transfered.key = "1";
    },

    "newsuspend": (action, transfered) => {
        transfered.domain = ".suspend";
        transfered.key = action.args.name;
    },

    "aprvsuspend": (action, transfered) => {
        transfered.domain = ".suspend";
        transfered.key = action.args.name;
    },

    "cancelsuspend": (action, transfered) => {
        transfered.domain = ".suspend";
        transfered.key = action.args.name;
    },

    "execsuspend": (action, transfered) => {
        transfered.domain = ".suspend";
        transfered.key = action.args.name;
    },

    "newlock": (action, transfered) => {
        transfered.domain = ".lock";
        transfered.key = action.args.name;
    },

    "aprvlock": (action, transfered) => {
        transfered.domain = ".lock";
        transfered.key = action.args.name;
    },

    "tryunlock": (action, transfered) => {
        transfered.domain = ".lock";
        transfered.key = action.args.name;
    },

    "everipass": async (action, transfered) => {
        let parsed = await EvtLink.parseEvtLink(action.args.link, { recoverPublicKeys: false });

        if (parsed == null || (parsed.flag & 2) !== 2) {
            throw new Error("Invalid EvtLink: This link is not for everiPass");
        }

        let domainNameSeg = parsed.segments.find(x => x.typeKey == 91);
        let tokenNameSeg = parsed.segments.find(x => x.typeKey == 92);

        if (domainNameSeg == undefined || tokenNameSeg == undefined) {
            throw new Error("Invalid EvtLink: No domainName or / and tokenName in the link");
        }

        transfered.domain = domainNameSeg.value;
        transfered.key = tokenNameSeg.value;

        return "";
    },

    "everipay": async (action, transfered) => {
        let parsed = await EvtLink.parseEvtLink(action.args.link, { recoverPublicKeys: false });

        if (parsed == null || (parsed.flag & 4) !== 4) {
            throw new Error("Invalid EvtLink: This link is not for everiPay");
        }

        let symbolSeg = parsed.segments.find(x => x.typeKey == 44);

        if (symbolSeg == undefined || parseInt(symbolSeg.value).toString() != symbolSeg.value ) {
            throw new Error("Invalid EvtLink: No symbol in the link (integer)");
        }

        transfered.domain = ".fungible";
        transfered.key = String(symbolSeg.value);

        return "";
    },

    "recycleft": (action, transfered) => {
        transfered.domain = ".fungible";
        transfered.key = String(action.args.number.split("#")[1]);

        if (!transfered.key) {
            throw new Error("number is invalid");
        }
    },

    "destroyft": (action, transfered) => {
        transfered.domain = ".fungible";
        transfered.key = String(action.args.number.split("#")[1]);

        if (!transfered.key) {
            throw new Error("number is invalid");
        }
    },

    "newlock": (action, transfered) => {
        transfered.domain = ".lock";
        transfered.key = String(action.args.name);

        if (!transfered.key) {
            throw new Error("proposal name is invalid");
        }

        if (!String(action.args.proposer)) {
            throw new Error("proposal proposer cannot be empty");
        }
    },

    "aprvlock": (action, transfered) => {
        transfered.domain = ".lock";
        transfered.key = String(action.args.name);

        if (!transfered.key) {
            throw new Error("proposal name is invalid");
        }

        if (!String(action.args.approver)) {
            throw new Error("proposal approver cannot be empty");
        }
    },

    "tryunlock": (action, transfered) => {
        transfered.domain = ".lock";
        transfered.key = String(action.args.name);

        if (!transfered.key) {
            throw new Error("proposal name is invalid");
        }

        if (!String(action.args.executor)) {
            throw new Error("proposal executor cannot be empty");
        }
    },

};

class TransferFungibleTokenAction extends EvtAction {
    constructor(options) {
        super("transferft", { from: options.from, to: options.to, memo: options.memo, number: options.number });
    }
}


module.exports = {
    EvtAction,
    EvtActions: {
        TransferFungibleTokenAction
    }
};
