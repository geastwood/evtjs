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
        transfered.domain = "group";
        transfered.key = action.args.name;
    },

    "updategroup": (action, transfered) => {
        transfered.domain = "group";
        transfered.key = action.args.name;
    },

    "newfungible": (action, transfered) => {
        transfered.domain = "fungible";
        transfered.key = action.args.sym;
    },

    "updfungible": (action, transfered) => {
        transfered.domain = "fungible";
        transfered.key = action.args.sym;
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
        transfered.domain = "fungible";
        transfered.key = "EVT";
    }
};

module.exports = EvtAction;
