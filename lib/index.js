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

var pkg = require('../package.json');

// Global EVT Object for exporting
var EVT = {
  version: pkg.version
};

module.exports = EVT;

console.log(JSON.stringify(EVT, null, 4));