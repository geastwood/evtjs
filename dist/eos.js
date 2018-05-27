(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Eos = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"../package.json":2}],2:[function(require,module,exports){
module.exports={
  "name": "evtjs",
  "version": "0.0.1",
  "description": "Javascript API Bindings for the everiToken blockchain.",
  "main": "lib/index.js",
  "scripts": {
    "test": "mocha --use_strict src/*.test.js",
    "test_lib": "mocha --use_strict lib/*.test.js",
    "coverage": "nyc --reporter=html npm test",
    "coveralls": "npm run coverage && cat ./coverage/lcov.info | ./node_modules/.bin/coveralls",
    "build": "babel --copy-files src --out-dir lib",
    "build_browser": "npm run build && mkdir -p dist && browserify -o dist/eos.js -s Eos lib/index.js",
    "build_browser_test": "npm run build && mkdir -p dist && browserify -o dist/test.js lib/*.test.js",
    "docs": "jsdoc2md src/format.js > docs/index.md",
    "prepublishOnly": "npm run build_browser && npm run test_lib && npm run docs"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/EOSIO/eosjs.git"
  },
  "keywords": [
    "EOS",
    "Blockchain"
  ],
  "author": "",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/EOSIO/eosjs/issues"
  },
  "homepage": "https://github.com/EOSIO/eosjs#readme",
  "devDependencies": {
    "babel-cli": "^6.26.0",
    "babel-core": "^6.26.0",
    "babel-plugin-syntax-async-functions": "^6.13.0",
    "babel-plugin-transform-regenerator": "^6.26.0",
    "babel-preset-es2015": "^6.24.1",
    "browserify": "^14.4.0",
    "camel-case": "^3.0.0",
    "coveralls": "^3.0.0",
    "eosjs-keygen": "^1.2.0",
    "jsdoc-to-markdown": "^3.0.4",
    "mocha": "^3.4.2",
    "nyc": "^11.4.1"
  },
  "dependencies": {
    "babel-polyfill": "^6.26.0",
    "binaryen": "^37.0.0",
    "create-hash": "^1.1.3",
    "eosjs-api": "^6.0.1",
    "eosjs-ecc": "^4.0.0",
    "fcbuffer": "^2.2.0"
  },
  "babel": {
    "presets": [
      "es2015"
    ],
    "plugins": [
      "syntax-async-functions",
      "transform-regenerator"
    ]
  }
}

},{}]},{},[1])(1)
});