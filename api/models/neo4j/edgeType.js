// extracts the data from the query results.
// Makes all number type data usable in Javascript

var _ = require('lodash');

var EdgeType = module.exports = function (_edge) {
  _edge.map(r => {
    if (r.identity) {r.identity= r.identity.toInt()};
    if (r.start) {r.start= r.start.toInt()};
    if (r.end) {r.end= r.end.toInt()};
    if (r.type) {r.type = r.type.replace('_',' ').toLowerCase()}
    if (r.properties) {

    // apoc metagraph call
    if (r.properties.count) {r.properties.count = r.properties.count.toNumber()};
    }
  })

  return _edge
};
