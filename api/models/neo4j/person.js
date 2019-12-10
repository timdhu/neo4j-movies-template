// extracts just the data from the query results

var _ = require('lodash');

var Person = module.exports = function (_node) {
  _.extend(this, _node.properties);
  if (this.id) {
    this.id = this.id.toInt();
  };
  if (this.community) {
    this.community = this.community.toNumber();
  };
  if (this.pagerank) {
    this.pagerank = this.pagerank.toNumber();
  };
};
