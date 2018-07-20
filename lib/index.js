"use strict";

/**
 * EVTJS: JavaScript API Binding for everiToken blockchain
 * 
 * Copyright(C) everiToken core team
 * under MIT license
 * 
 * This project includes some projects under MIT license.
 * Visit our github or read README.md for more information.
 */

try {
    require("babel-polyfill");
} catch (e) {
    if (e.message.indexOf("only one instance of babel-polyfill is allowed") === -1) {
        console.error(e);
    }
}
var pkg = require("../package.json");

var _require = require("./apiCaller"),
    APICaller = _require.APICaller;

var EvtConfig = require("./evtConfig");
var EvtKey = require("./key");
var EvtAction = require("./action");
var QR = require("./qr");

// Global EVT Object for exporting
var EVT = function EVT(config) {
    return new APICaller(config);
};

EVT = Object.assign(EVT, {
    version: pkg.version,
    APICaller: APICaller,
    EvtConfig: EvtConfig,
    EvtKey: EvtKey,
    EvtAction: EvtAction,
    QR: QR
});

module.exports = EVT;