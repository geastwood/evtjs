/**
 * EVTJS: JavaScript API Binding for everiToken blockchain
 * 
 * Copyright(C) everiToken core team
 * under MIT license
 * 
 * This project includes some projects under MIT license.
 * Visit our github or read README.md for more information.
 */
const pkg = require("../package.json");
const { APICaller } = require("./apiCaller");
const EvtConfig = require("./evtConfig");
const EvtKey = require("./key");
const { EvtAction, EvtActions } = require("./action");
const EvtLink = require("./evtLink");

// Global EVT Object for exporting
let EVT = function(config) {
    return new APICaller(config);
};

EVT = Object.assign(EVT, {
    version: pkg.version,
    APICaller,
    EvtConfig,
    EvtKey,
    EvtAction,
    EvtActions,
    EvtLink
});

module.exports = EVT;
