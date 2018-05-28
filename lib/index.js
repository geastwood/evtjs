'use strict';

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
} catch (e) {
    if (e.message.indexOf('only one instance of babel-polyfill is allowed') === -1) {
        console.error(e);
    }
}
var pkg = require('../package.json');

var _require = require("./apiCaller"),
    APICaller = _require.APICaller;

// Global EVT Object for exporting


var EVT = function EVT(config) {
    return new APICaller(config);
};

EVT = Object.assign(EVT, {
    version: pkg.version,
    APICaller: APICaller
});

module.exports = EVT;