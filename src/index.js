/**
 * EVTJS: JavaScript API Binding for everiToken blockchain
 * 
 * Copyright(C) everiToken core team
 * under MIT license
 * 
 * This project is based on some projects under MIT license
 * For detail, please visit our github or read README.md for
 * more informatino.
 */

try {
    require("babel-polyfill");
}
catch(e) {
    if(e.message.indexOf('only one instance of babel-polyfill is allowed') === -1) {
        console.error(e)
    }
}
const pkg = require('../package.json');
const { APICaller } = require("./apiCaller");
const EvtConfig = require("./evtConfig");
const EvtKey = require("./key");

// Global EVT Object for exporting
let EVT = function(config) {
    return new APICaller(config);
};

EVT = Object.assign(EVT, {
    version: pkg.version,
    APICaller,
    EvtConfig,
    EvtKey
});

module.exports = EVT;
