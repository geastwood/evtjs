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
        if (!actionName || actionName.length > 13) throw new Error("invalid actionName");
        if (!abi || (typeof abi !== "object")) throw new Error("invalid abi");

        if (!domain && !key) {
            // use mapper to determine the `domain` and `key` field
            if (!domainKeyMappers[actionName]) {
                throw new Error(`For action "${actionName}", parameter "domain" and "key" could not be ignored.`);
            }
            let ret = { };
            domainKeyMappers[actionName]({ action: actionName, args: abi }, ret);
 
            domain = ret.domain;
            key = ret.key;
        }
        if (!domain || (typeof domain !== "string")) throw new Error("invalid domain");
        if (!key || (typeof key !== "string")) throw new Error("invalid key");

        this.actionName = actionName;
        this.abi = abi;
        this.domain = domain;
        this.key = key;
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
    }
};

module.exports = EvtAction;
