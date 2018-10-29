'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var assert = require('assert');
var Structs = require('./structs');

module.exports = AssetCache;

function AssetCache(network) {
  var cache = {
    'SYS@eosio.token': { precision: 4 },
    'EOS@eosio.token': { precision: 4 }

    /** @return {Promise} {precision} */
  };function lookupAsync(symbol, account) {
    assert(symbol, 'required symbol');
    assert(account, 'required account');

    if (account === 'eosio') {
      account = 'eosio.token';
    }

    var extendedAsset = symbol + '@' + account;

    if (cache[extendedAsset] != null) {
      return _promise2.default.resolve(cache[extendedAsset]);
    }

    var statsPromise = network.getCurrencyStats(account, symbol).then(function (result) {
      var stats = result[symbol];
      assert(stats, 'Missing currency stats for asset: ' + extendedAsset);

      var max_supply = stats.max_supply;


      assert.equal(typeof max_supply === 'undefined' ? 'undefined' : (0, _typeof3.default)(max_supply), 'string', 'Expecting max_supply string in currency stats: ' + result);

      assert(new RegExp('^[0-9]+(.[0-9]+)? ' + symbol + '$').test(max_supply), 'Expecting max_supply string like 10000.0000 SYM, instead got: ' + max_supply);

      var _max_supply$split = max_supply.split(' '),
          _max_supply$split2 = (0, _slicedToArray3.default)(_max_supply$split, 1),
          supply = _max_supply$split2[0];

      var _supply$split = supply.split('.'),
          _supply$split2 = (0, _slicedToArray3.default)(_supply$split, 2),
          _supply$split2$ = _supply$split2[1],
          decimalstr = _supply$split2$ === undefined ? '' : _supply$split2$;

      var precision = decimalstr.length;

      assert(precision >= 0 && precision <= 18, 'unable to determine precision from string: ' + max_supply);

      return cache[extendedAsset] = { precision: precision };
    });
    promises.push(statsPromise);
    return cache[extendedAsset] = statsPromise;
  }

  function lookup(symbol, account) {
    assert(symbol, 'required symbol');
    assert(account, 'required account');

    if (account === 'eosio') {
      account = 'eosio.token';
    }

    var extendedAsset = symbol + '@' + account;

    var c = cache[extendedAsset];
    if (c != null) {
      return c;
    }
    if (c instanceof _promise2.default) {
      return undefined;
    }
    return null;
  }

  return {
    lookupAsync: lookupAsync,
    lookup: lookup
  };
}

var promises = [];

AssetCache.resolve = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
  return _regenerator2.default.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return _promise2.default.all(promises);

        case 2:
          promises = [];

        case 3:
        case 'end':
          return _context.stop();
      }
    }
  }, _callee, this);
}));