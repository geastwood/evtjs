const {
  encodeGeneratedAddressToBin,
  decodeGeneratedAddressFromBin,
  encodeGeneratedAddressToJson,
  decodeGeneratedAddressFromJson,
} = require('./format');

module.exports = {
  GeneratedAddress: {
      toJSON: encodeGeneratedAddressToJson,
      fromJSON: decodeGeneratedAddressFromJson,
      toBin: encodeGeneratedAddressToBin,
      fromBin: decodeGeneratedAddressFromBin
  }
};