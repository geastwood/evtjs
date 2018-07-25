"use strict";

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * EVTJS: JavaScript API Binding for everiToken blockchain
 * 
 * Copyright(C) everiToken core team
 * under MIT license
 * 
 * This project includes some projects under MIT license.
 * Visit our github or read README.md for more information.
 */
var pkg = require("../package.json");

var _require = require("./apiCaller"),
    APICaller = _require.APICaller;

var EvtConfig = require("./evtConfig");
var EvtKey = require("./key");
var EvtAction = require("./action");
var EvtLink = require("./evtLink");

// Global EVT Object for exporting
var EVT = function EVT(config) {
    return new APICaller(config);
};

EVT = (0, _assign2.default)(EVT, {
    version: pkg.version,
    APICaller: APICaller,
    EvtConfig: EvtConfig,
    EvtKey: EvtKey,
    EvtAction: EvtAction,
    EvtLink: EvtLink
});

module.exports = EVT;