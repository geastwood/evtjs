'use strict';

/* eslint-env mocha */
var assert = require('assert');
var fs = require('fs');
var EVT = require('.');

var _require = require('eosjs-keygen'),
    Keystore = _require.Keystore;

var ByteBuffer = require('bytebuffer');
var Fcbuffer = require('fcbuffer');
var Key = require("./key");