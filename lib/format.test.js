'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _maxSafeInteger = require('babel-runtime/core-js/number/max-safe-integer');

var _maxSafeInteger2 = _interopRequireDefault(_maxSafeInteger);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-env mocha */
var assert = require('assert');

var _require = require('./format'),
    encodeName = _require.encodeName,
    decodeName = _require.decodeName,
    encodeNameHex = _require.encodeNameHex,
    decodeNameHex = _require.decodeNameHex,
    isName = _require.isName,
    UDecimalPad = _require.UDecimalPad,
    UDecimalUnimply = _require.UDecimalUnimply,
    parseAssetSymbol = _require.parseAssetSymbol,
    encodeName128 = _require.encodeName128,
    decodeName128 = _require.decodeName128,
    encodeAddress = _require.encodeAddress,
    decodeAddress = _require.decodeAddress,
    encodeGeneratedAddressToBin = _require.encodeGeneratedAddressToBin,
    decodeGeneratedAddressFromBin = _require.decodeGeneratedAddressFromBin,
    encodeGeneratedAddressToJson = _require.encodeGeneratedAddressToJson,
    decodeGeneratedAddressFromJson = _require.decodeGeneratedAddressFromJson;

describe('format', function () {
  // In isname111111k, 'k' overflows the last 4 bits of the name
  describe('name', function () {
    var nameFixture = {
      isname: ['isname111111o', 'a', '1', '5', 'sam5', 'sam', 'adam.applejjj'],
      noname: ['isname111111p', undefined, null, 1, '6', 'a6', ' ']
    };

    it('isName', function () {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator3.default)(nameFixture.isname), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var name = _step.value;

          assert(isName(name, function (err) {
            return console.log(err);
          }), name);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = (0, _getIterator3.default)(nameFixture.noname), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _name = _step2.value;

          assert(!isName(_name), _name);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    });

    it('encode / decode', function () {
      assert.equal('58923', encodeName('eos'), 'encode');
      assert.equal('e62b', encodeNameHex('eos'), 'encode hex');
      assert.equal(decodeName(encodeName('eos')), 'eos', 'decode');

      assert.equal('b298e982a4', encodeNameHex('transfer'), 'encode');
      assert.equal(decodeNameHex('b298e982a4'), 'transfer', 'decode');

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = (0, _getIterator3.default)(nameFixture.isname), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var name = _step3.value;

          assert.equal(decodeName(encodeName(name)), name);
          assert.equal(decodeNameHex(encodeNameHex(name)), name);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = (0, _getIterator3.default)(nameFixture.isname), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var _name2 = _step4.value;

          assert.equal(decodeName(encodeName(_name2, false), false), _name2);
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      assert(decodeName(1));
      throws(function () {
        return decodeName(_maxSafeInteger2.default + 1);
      }, /overflow/);
      throws(function () {
        return decodeName({});
      }, /Long, Number or String/);
    });
  });

  it('UDecimalPad', function () {
    assert.throws(function () {
      return UDecimalPad();
    }, /value is required/);
    assert.throws(function () {
      return UDecimalPad(1);
    }, /precision/);
    assert.throws(function () {
      return UDecimalPad('$10', 0);
    }, /invalid decimal/);
    assert.throws(function () {
      return UDecimalPad('1.1.', 0);
    }, /invalid decimal/);
    assert.throws(function () {
      return UDecimalPad('1.1,1', 0);
    }, /invalid decimal/);
    assert.throws(function () {
      return UDecimalPad('1.11', 1);
    }, /exceeds precision/);

    var decFixtures = [{ value: 1, precision: 0, answer: '1' }, { value: '1', precision: 0, answer: '1' }, { value: '1.', precision: 0, answer: '1' }, { value: '1.0', precision: 0, answer: '1' }, { value: '1456.0', precision: 0, answer: '1456' }, { value: '1,456.0', precision: 0, answer: '1,456' },

    // does not validate commas
    { value: '1,4,5,6', precision: 0, answer: '1,4,5,6' }, { value: '1,4,5,6.0', precision: 0, answer: '1,4,5,6' }, { value: 1, precision: 1, answer: '1.0' }, { value: '1', precision: 1, answer: '1.0' }, { value: '1.', precision: 1, answer: '1.0' }, { value: '1.0', precision: 1, answer: '1.0' }, { value: '1.10', precision: 1, answer: '1.1' }, { value: '1.1', precision: 2, answer: '1.10' }, { value: '1.10', precision: 2, answer: '1.10' }, { value: '1.01', precision: 2, answer: '1.01' }, { value: '1', precision: 3, answer: '1.000' }];
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = (0, _getIterator3.default)(decFixtures), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        var test = _step5.value;
        var answer = test.answer,
            value = test.value,
            precision = test.precision;

        assert.equal(UDecimalPad(value, precision), answer, (0, _stringify2.default)(test));
      }
    } catch (err) {
      _didIteratorError5 = true;
      _iteratorError5 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion5 && _iterator5.return) {
          _iterator5.return();
        }
      } finally {
        if (_didIteratorError5) {
          throw _iteratorError5;
        }
      }
    }
  });

  it('UDecimalUnimply', function () {
    assert.throws(function () {
      return UDecimalUnimply('1.', 1);
    }, /invalid whole number/);
    assert.throws(function () {
      return UDecimalUnimply('.1', 1);
    }, /invalid whole number/);
    assert.throws(function () {
      return UDecimalUnimply('1.1', 1);
    }, /invalid whole number/);

    var decFixtures = [{ value: 1, precision: 0, answer: '1' }, { value: '1', precision: 0, answer: '1' }, { value: '10', precision: 0, answer: '10' }, { value: 1, precision: 1, answer: '0.1' }, { value: '10', precision: 1, answer: '1' }, { value: '11', precision: 2, answer: '0.11' }, { value: '110', precision: 2, answer: '1.1' }, { value: '101', precision: 2, answer: '1.01' }, { value: '0101', precision: 2, answer: '1.01' }];
    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
      for (var _iterator6 = (0, _getIterator3.default)(decFixtures), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
        var test = _step6.value;
        var answer = test.answer,
            value = test.value,
            precision = test.precision;

        assert.equal(UDecimalUnimply(value, precision), answer, (0, _stringify2.default)(test));
      }
    } catch (err) {
      _didIteratorError6 = true;
      _iteratorError6 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion6 && _iterator6.return) {
          _iterator6.return();
        }
      } finally {
        if (_didIteratorError6) {
          throw _iteratorError6;
        }
      }
    }
  });

  it('parseAssetSymbol', function () {
    // assert.deepEqual(parseAssetSymbol('SYM'), {precision: null, symbol: 'SYM'})
    // assert.deepEqual(parseAssetSymbol('SYM#4'), {precision: 4, symbol: 'SYM'})

    // assert.throws(() => parseAssetSymbol(369), /should be string/)
    // assert.throws(() => parseAssetSymbol('SYM#2', 2), /precision like this/)
    // assert.throws(() => parseAssetSymbol('SYM#4', 2), /Asset symbol precision mismatch/)
    // assert.throws(() => parseAssetSymbol('sym'), /only uppercase/)
    // assert.throws(() => parseAssetSymbol('19,SYM'), /18 characters or less/)
    // assert.throws(() => parseAssetSymbol('TOOLONGSYM'), /7 characters or less/)
  });

  it('name128', function () {

    assert.deepEqual(encodeName128('123').toString("hex"), "0c440100".padStart(8, 0));
    assert.deepEqual(encodeName128('12345').toString("hex"), "0c44611c".padStart(8, 0));
    assert.deepEqual(encodeName128('123456').toString("hex"), "0d44611c08000000".padStart(16, 0));
    assert.deepEqual(encodeName128('1234567890').toString("hex"), "0d44611c48a22c02".padStart(16, 0));
    assert.deepEqual(encodeName128('1234567890A').toString("hex"), "0e44611c48a22c8209000000".padStart(24, 0));
    assert.deepEqual(encodeName128('11111111111').toString("hex"), "0ec3300cc3300cc300000000".padStart(24, 0));
    assert.deepEqual(encodeName128('1234567890ABCDE').toString("hex"), "0e44611c48a22c8279a2a90a".padStart(24, 0));
    assert.deepEqual(encodeName128('1234567890ABCDEF').toString("hex"), "0f44611c48a22c8279a2a9ba02000000".padStart(32, 0));
    assert.deepEqual(encodeName128('1234567890ABCDEFGHIJK').toString("hex"), "0f44611c48a22c8279a2a9bab2adfbc2".padStart(32, 0));

    assert.deepEqual(decodeName128("0c440100"), '123');
    assert.deepEqual(decodeName128("0c44611c"), '12345');
    assert.deepEqual(decodeName128("0d44611c08000000"), '123456');
    assert.deepEqual(decodeName128("0d44611c48a22c02"), '1234567890');
    assert.deepEqual(decodeName128("0e44611c48a22c8209000000"), '1234567890A');
    assert.deepEqual(decodeName128("0ec3300cc3300cc300000000"), '11111111111');
    assert.deepEqual(decodeName128("0e44611c48a22c8279a2a90a"), '1234567890ABCDE');
    assert.deepEqual(decodeName128("0f44611c48a22c8279a2a9ba02000000"), '1234567890ABCDEF');
    assert.deepEqual(decodeName128("0f44611c48a22c8279a2a9bab2adfbc2"), '1234567890ABCDEFGHIJK');
  });

  it('evtaddress', function () {

    assert.deepEqual(encodeAddress("EVT6Qz3wuRjyN6gaU3P3XRxpnEZnM4oPxortemaWDwFRvsv2FxgND").toString('hex'), "010002c8f031561c4758c9551cff47246f2c347189fe684c04da35cf88e813f810e3c2");
    assert.deepEqual(encodeAddress("EVT7rbe5ZqAEtwQT6Tw39R29vojFqrCQasK3nT5s2pEzXh1BABXHF").toString('hex'), "01000386cb0bbed3c087475efbae3c51f6825deb3be68ae013411fd509f3e361139e88");
    assert.deepEqual(encodeAddress("EVT0000009tDnxK74wjkVZidAeyT339HkhMozkmdkju2pFx32QS95").toString('hex'), "020000008589745c35000000000c000000");
    assert.deepEqual(encodeAddress("EVT000000AiCjTBuNN92tpgeqUZjaMuxkvNr5Tgsv9hTqv5Zkub9R").toString('hex'), "02000000600c113adf2f0000001b9d2210c50281c2420d956074000000");
    assert.deepEqual(encodeAddress("EVT00000000000000000000000000000000000000000000000000").toString('hex'), "0000");

    assert.deepEqual("EVT00000000000000000000000000000000000000000000000000", decodeAddress(Buffer.from("0000", "hex")));
    assert.deepEqual("EVT0000009tDnxK74wjkVZidAeyT339HkhMozkmdkju2pFx32QS95", decodeAddress(Buffer.from("020000008589745c35000000000c000000", "hex")));
    assert.deepEqual("EVT000000AiCjTBuNN92tpgeqUZjaMuxkvNr5Tgsv9hTqv5Zkub9R", decodeAddress(Buffer.from("02000000600c113adf2f0000001b9d2210c50281c2420d956074000000", "hex")));
    assert.deepEqual("EVT6Qz3wuRjyN6gaU3P3XRxpnEZnM4oPxortemaWDwFRvsv2FxgND", decodeAddress(Buffer.from("010002c8f031561c4758c9551cff47246f2c347189fe684c04da35cf88e813f810e3c2", "hex")));
    assert.deepEqual("EVT7rbe5ZqAEtwQT6Tw39R29vojFqrCQasK3nT5s2pEzXh1BABXHF", decodeAddress(Buffer.from("01000386cb0bbed3c087475efbae3c51f6825deb3be68ae013411fd509f3e361139e88", "hex")));
  });

  it('generatedAddress', function () {

    assert.deepEqual(encodeGeneratedAddressToBin("EVT0000009tDnxK74wjkVZidAeyT339HkhMozkmdkju2pFx32QS95").toString('hex'), "020000008589745c35000000000c000000");
    assert.deepEqual(decodeGeneratedAddressFromBin(Buffer.from("020000008589745c35000000000c000000", "hex")), "EVT0000009tDnxK74wjkVZidAeyT339HkhMozkmdkju2pFx32QS95");

    assert.deepEqual(encodeGeneratedAddressToBin("EVT000000AiCjTBuNN92tpgeqUZjaMuxkvNr5Tgsv9hTqv5Zkub9R").toString('hex'), "02000000600c113adf2f0000001b9d2210c50281c2420d956074000000");
    assert.deepEqual(decodeGeneratedAddressFromBin(Buffer.from("02000000600c113adf2f0000001b9d2210c50281c2420d956074000000", "hex")), "EVT000000AiCjTBuNN92tpgeqUZjaMuxkvNr5Tgsv9hTqv5Zkub9R");

    assert.deepEqual(encodeGeneratedAddressToJson("EVT0000009tDnxK74wjkVZidAeyT339HkhMozkmdkju2pFx32QS95"), { prefix: "fungible", key: "1", nonce: 0 });
    assert.deepEqual(decodeGeneratedAddressFromJson({ prefix: "fungible", key: "1", nonce: 0 }), "EVT0000009tDnxK74wjkVZidAeyT339HkhMozkmdkju2pFx32QS95");

    assert.deepEqual(encodeGeneratedAddressToJson("EVT000000AiCjTBuNN92tpgeqUZjaMuxkvNr5Tgsv9hTqv5Zkub9R"), { prefix: "123abcc", key: "4r80239eu09i1j04r", nonce: 47 });
    assert.deepEqual(decodeGeneratedAddressFromJson({ prefix: "123abcc", key: "4r80239eu09i1j04r", nonce: 47 }), "EVT000000AiCjTBuNN92tpgeqUZjaMuxkvNr5Tgsv9hTqv5Zkub9R");
  });
});

function hexNumToStr(num) {
  return num.toString("16").padStart(32, 0);
}

/* istanbul ignore next */
function throws(fn, match) {
  try {
    fn();
    assert(false, 'Expecting error');
  } catch (error) {
    if (!match.test(error)) {
      error.message = 'Error did not match ' + match + '\n' + error.message;
      throw error;
    }
  }
}