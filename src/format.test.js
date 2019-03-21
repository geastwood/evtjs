/* eslint-env mocha */
const assert = require('assert')
const {
  encodeName, decodeName, encodeNameHex, decodeNameHex,
  isName, UDecimalPad, UDecimalUnimply,
  parseAssetSymbol, encodeName128, decodeName128,
  encodeAddress, decodeAddress,
  encodeGeneratedAddressToBin,
  decodeGeneratedAddressFromBin,
  encodeGeneratedAddressToJson,
  decodeGeneratedAddressFromJson,
} = require('./format')

describe('format', () => {
  // In isname111111k, 'k' overflows the last 4 bits of the name
  describe('name', () => {
    const nameFixture = {
      isname: ['isname111111o', 'a', '1', '5', 'sam5', 'sam', 'adam.applejjj'],
      noname: ['isname111111p', undefined, null, 1, '6', 'a6', ' ']
    }

    it('isName', () => {
      for(let name of nameFixture.isname) {
        assert(isName(name, err => console.log(err)), name)
      }
      for(let name of nameFixture.noname) {
        assert(!isName(name), name)
      }
    })

    it('encode / decode', () => {
      assert.equal('58923', encodeName('eos'), 'encode')
      assert.equal('e62b', encodeNameHex('eos'), 'encode hex')
      assert.equal(decodeName(encodeName('eos')), 'eos', 'decode')

      assert.equal('b298e982a4', encodeNameHex('transfer'), 'encode')
      assert.equal(decodeNameHex('b298e982a4'), 'transfer', 'decode')

      for(let name of nameFixture.isname) {
        assert.equal(decodeName(encodeName(name)), name)
        assert.equal(decodeNameHex(encodeNameHex(name)), name)
      }
      for(let name of nameFixture.isname) {
        assert.equal(decodeName(encodeName(name, false), false), name)
      }
      assert(decodeName(1))
      throws(() => decodeName(Number.MAX_SAFE_INTEGER + 1), /overflow/)
      throws(() => decodeName({}), /Long, Number or String/)
    })
  })

  it('UDecimalPad', () => {
    assert.throws(() => UDecimalPad(), /value is required/)
    assert.throws(() => UDecimalPad(1), /precision/)
    assert.throws(() => UDecimalPad('$10', 0), /invalid decimal/)
    assert.throws(() => UDecimalPad('1.1.', 0), /invalid decimal/)
    assert.throws(() => UDecimalPad('1.1,1', 0), /invalid decimal/)
    assert.throws(() => UDecimalPad('1.11', 1), /exceeds precision/)

    const decFixtures = [
      {value: 1, precision: 0, answer: '1'},
      {value: '1', precision: 0, answer: '1'},
      {value: '1.', precision: 0, answer: '1'},
      {value: '1.0', precision: 0, answer: '1'},
      {value: '1456.0', precision: 0, answer: '1456'},
      {value: '1,456.0', precision: 0, answer: '1,456'},

      // does not validate commas
      {value: '1,4,5,6', precision: 0, answer: '1,4,5,6'},
      {value: '1,4,5,6.0', precision: 0, answer: '1,4,5,6'},

      {value: 1, precision: 1, answer: '1.0'},
      {value: '1', precision: 1, answer: '1.0'},
      {value: '1.', precision: 1, answer: '1.0'},
      {value: '1.0', precision: 1, answer: '1.0'},
      {value: '1.10', precision: 1, answer: '1.1'},

      {value: '1.1', precision: 2, answer: '1.10'},
      {value: '1.10', precision: 2, answer: '1.10'},
      {value: '1.01', precision: 2, answer: '1.01'},

      {value: '1', precision: 3, answer: '1.000'},

    ]
    for(const test of decFixtures) {
      const {answer, value, precision} = test
      assert.equal(UDecimalPad(value, precision), answer, JSON.stringify(test))
    }
  })

  it('UDecimalUnimply', () => {
    assert.throws(() => UDecimalUnimply('1.', 1), /invalid whole number/)
    assert.throws(() => UDecimalUnimply('.1', 1), /invalid whole number/)
    assert.throws(() => UDecimalUnimply('1.1', 1), /invalid whole number/)

    const decFixtures = [
      {value: 1, precision: 0, answer: '1'},
      {value: '1', precision: 0, answer: '1'},
      {value: '10', precision: 0, answer: '10'},

      {value: 1, precision: 1, answer: '0.1'},
      {value: '10', precision: 1, answer: '1'},

      {value: '11', precision: 2, answer: '0.11'},
      {value: '110', precision: 2, answer: '1.1'},
      {value: '101', precision: 2, answer: '1.01'},
      {value: '0101', precision: 2, answer: '1.01'},
    ]
    for(const test of decFixtures) {
      const {answer, value, precision} = test
      assert.equal(UDecimalUnimply(value, precision), answer, JSON.stringify(test))
    }
  })

  it('parseAssetSymbol', () => {
    // assert.deepEqual(parseAssetSymbol('SYM'), {precision: null, symbol: 'SYM'})
    // assert.deepEqual(parseAssetSymbol('SYM#4'), {precision: 4, symbol: 'SYM'})

    // assert.throws(() => parseAssetSymbol(369), /should be string/)
    // assert.throws(() => parseAssetSymbol('SYM#2', 2), /precision like this/)
    // assert.throws(() => parseAssetSymbol('SYM#4', 2), /Asset symbol precision mismatch/)
    // assert.throws(() => parseAssetSymbol('sym'), /only uppercase/)
    // assert.throws(() => parseAssetSymbol('19,SYM'), /18 characters or less/)
    // assert.throws(() => parseAssetSymbol('TOOLONGSYM'), /7 characters or less/)
  })

  it('name128', () => {

    assert.deepEqual(encodeName128('123').toString("hex"), "0c440100".padStart(8, 0))
    assert.deepEqual(encodeName128('12345').toString("hex"), "0c44611c".padStart(8, 0))
    assert.deepEqual(encodeName128('123456').toString("hex"), "0d44611c08000000".padStart(16, 0))
    assert.deepEqual(encodeName128('1234567890').toString("hex"), "0d44611c48a22c02".padStart(16, 0))
    assert.deepEqual(encodeName128('1234567890A').toString("hex"), "0e44611c48a22c8209000000".padStart(24, 0))
    assert.deepEqual(encodeName128('11111111111').toString("hex"), "0ec3300cc3300cc300000000".padStart(24, 0))
    assert.deepEqual(encodeName128('1234567890ABCDE').toString("hex"), "0e44611c48a22c8279a2a90a".padStart(24, 0))
    assert.deepEqual(encodeName128('1234567890ABCDEF').toString("hex"), "0f44611c48a22c8279a2a9ba02000000".padStart(32, 0))
    assert.deepEqual(encodeName128('1234567890ABCDEFGHIJK').toString("hex"), "0f44611c48a22c8279a2a9bab2adfbc2".padStart(32, 0))

    assert.deepEqual(decodeName128("0c440100"), '123')
    assert.deepEqual(decodeName128("0c44611c"), '12345')
    assert.deepEqual(decodeName128("0d44611c08000000"), '123456')
    assert.deepEqual(decodeName128("0d44611c48a22c02"), '1234567890')
    assert.deepEqual(decodeName128("0e44611c48a22c8209000000"), '1234567890A')
    assert.deepEqual(decodeName128("0ec3300cc3300cc300000000"), '11111111111')
    assert.deepEqual(decodeName128("0e44611c48a22c8279a2a90a"), '1234567890ABCDE')
    assert.deepEqual(decodeName128("0f44611c48a22c8279a2a9ba02000000"), '1234567890ABCDEF')
    assert.deepEqual(decodeName128("0f44611c48a22c8279a2a9bab2adfbc2"), '1234567890ABCDEFGHIJK')
    
  })

  it('evtaddress', () => {
      
    assert.deepEqual(encodeAddress("EVT6Qz3wuRjyN6gaU3P3XRxpnEZnM4oPxortemaWDwFRvsv2FxgND").toString('hex'), "010002c8f031561c4758c9551cff47246f2c347189fe684c04da35cf88e813f810e3c2")
    assert.deepEqual(encodeAddress("EVT7rbe5ZqAEtwQT6Tw39R29vojFqrCQasK3nT5s2pEzXh1BABXHF").toString('hex'), "01000386cb0bbed3c087475efbae3c51f6825deb3be68ae013411fd509f3e361139e88")
    assert.deepEqual(encodeAddress("EVT0000009tDnxK74wjkVZidAeyT339HkhMozkmdkju2pFx32QS95").toString('hex'), "020000008589745c35000000000c000000")
    assert.deepEqual(encodeAddress("EVT000000AiCjTBuNN92tpgeqUZjaMuxkvNr5Tgsv9hTqv5Zkub9R").toString('hex'), "02000000600c113adf2f0000001b9d2210c50281c2420d956074000000")
    assert.deepEqual(encodeAddress("EVT00000000000000000000000000000000000000000000000000").toString('hex'), "0000")
    
    assert.deepEqual("EVT00000000000000000000000000000000000000000000000000", decodeAddress(Buffer.from("0000", "hex")))
    assert.deepEqual("EVT0000009tDnxK74wjkVZidAeyT339HkhMozkmdkju2pFx32QS95", decodeAddress(Buffer.from("020000008589745c35000000000c000000", "hex")))
    assert.deepEqual("EVT000000AiCjTBuNN92tpgeqUZjaMuxkvNr5Tgsv9hTqv5Zkub9R", decodeAddress(Buffer.from("02000000600c113adf2f0000001b9d2210c50281c2420d956074000000", "hex")))
    assert.deepEqual("EVT6Qz3wuRjyN6gaU3P3XRxpnEZnM4oPxortemaWDwFRvsv2FxgND", decodeAddress(Buffer.from("010002c8f031561c4758c9551cff47246f2c347189fe684c04da35cf88e813f810e3c2", "hex")))
    assert.deepEqual("EVT7rbe5ZqAEtwQT6Tw39R29vojFqrCQasK3nT5s2pEzXh1BABXHF", decodeAddress(Buffer.from("01000386cb0bbed3c087475efbae3c51f6825deb3be68ae013411fd509f3e361139e88", "hex")))

  })

  it('generatedAddress', () => {

      assert.deepEqual(encodeGeneratedAddressToBin("EVT0000009tDnxK74wjkVZidAeyT339HkhMozkmdkju2pFx32QS95").toString('hex'), "020000008589745c35000000000c000000");
      assert.deepEqual(decodeGeneratedAddressFromBin(Buffer.from("020000008589745c35000000000c000000", "hex")), "EVT0000009tDnxK74wjkVZidAeyT339HkhMozkmdkju2pFx32QS95");
      
      assert.deepEqual(encodeGeneratedAddressToBin("EVT000000AiCjTBuNN92tpgeqUZjaMuxkvNr5Tgsv9hTqv5Zkub9R").toString('hex'), "02000000600c113adf2f0000001b9d2210c50281c2420d956074000000");
      assert.deepEqual(decodeGeneratedAddressFromBin(Buffer.from("02000000600c113adf2f0000001b9d2210c50281c2420d956074000000", "hex")), "EVT000000AiCjTBuNN92tpgeqUZjaMuxkvNr5Tgsv9hTqv5Zkub9R");
      
      assert.deepEqual(encodeGeneratedAddressToJson("EVT0000009tDnxK74wjkVZidAeyT339HkhMozkmdkju2pFx32QS95"), {prefix: "fungible", key: "1", nonce: 0});
      assert.deepEqual(decodeGeneratedAddressFromJson({prefix: "fungible", key: "1", nonce: 0}), "EVT0000009tDnxK74wjkVZidAeyT339HkhMozkmdkju2pFx32QS95");
      
      assert.deepEqual(encodeGeneratedAddressToJson("EVT000000AiCjTBuNN92tpgeqUZjaMuxkvNr5Tgsv9hTqv5Zkub9R"), {prefix: "123abcc", key: "4r80239eu09i1j04r", nonce: 47});
      assert.deepEqual(decodeGeneratedAddressFromJson({prefix: "123abcc", key: "4r80239eu09i1j04r", nonce: 47}), "EVT000000AiCjTBuNN92tpgeqUZjaMuxkvNr5Tgsv9hTqv5Zkub9R");
    
  })

})

function hexNumToStr(num) {
    return num.toString("16").padStart(32, 0)
}

/* istanbul ignore next */
function throws (fn, match) {
  try {
    fn()
    assert(false, 'Expecting error')
  } catch (error) {
    if (!match.test(error)) {
      error.message = `Error did not match ${match}\n${error.message}`
      throw error
    }
  }
}
