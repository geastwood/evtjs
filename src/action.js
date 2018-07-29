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
                throw new Error(`For action "${this.actionName}", parameter "domain" and "key" could not be ignored.`);
            }
            let ret = { };
            await Promise.resolve(domainKeyMappers[this.actionName]({ action: this.actionName, args: this.abi }, ret));
 
            this.domain = ret.domain;
            this.key = ret.key;
        }

        if (!this.domain || (typeof this.domain !== "string")) throw new Error("invalid domain");
        if (!this.key || (typeof this.key !== "string")) throw new Error("invalid key");
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
        let splited = action.args.sym.split(",");
        if (splited.length != 2) {
            throw new Error("Invalid parameter for sym");
        }
        transfered.key = splited[1];
    },

    "updfungible": (action, transfered) => {
        transfered.domain = ".fungible";
        // remove precision for `key`
        let splited = action.args.sym.split(",");
        if (splited.length != 2) {
            throw new Error("Invalid parameter for sym");
        }
        transfered.key = splited[1];
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
        transfered.key = "EVT";
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

    "everipass": async (action, transfered) => {
        let parsed = await EvtLink.parseEvtLink(action.args.link);

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
        let parsed = await EvtLink.parseEvtLink(action.args.link);

        if (parsed == null || (parsed.flag & 4) !== 4) {
            throw new Error("Invalid EvtLink: This link is not for everiPay");
        }

        let symbolSeg = parsed.segments.find(x => x.typeKey == 93);

        if (symbolSeg == undefined) {
            throw new Error("Invalid EvtLink: No symbol in the link");
        }

        if (symbolSeg.value.indexOf(",") > 0) {
            symbolSeg.value = symbolSeg.value.substr(symbolSeg.value.indexOf(",") + 1);
        }

        transfered.domain = ".fungible";
        transfered.key = symbolSeg.value;

        return "";
    },
};

module.exports = EvtAction;
