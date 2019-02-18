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
      fromBin: function(data, encoding="buffer") {
        /* Supporting buffer, base64, hex formats */
        if (encoding !== "buffer") {
            data = Buffer.from(data, encoding);
        }
        return decodeGeneratedAddressFromBin(data);
      }
  }
};