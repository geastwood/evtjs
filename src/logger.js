let time = null;

module.exports = {
    verbose(msg) {
        if (this.writeLog) {
            console.log("[" + new Date() + "] " + this.calculateTimeDiff() + msg);
        }
    },

    calculateTimeDiff() {
        if (time) {
            let timeNow = new Date().valueOf();
            let ret = timeNow - time;
            time = timeNow;

            return "+" + ret + "ms ";
        }
        else {
            time = new Date().valueOf();

            return "";
        }
    }
}
