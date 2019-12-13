// extracts the data from the query results.
// Makes all number type data usable in Javascript

var _ = require('lodash');

var DictType = module.exports = function (_dict) {
  output = {}
  output[_dict.get('value')] = _dict.get('key').toInt()
  return output
};
