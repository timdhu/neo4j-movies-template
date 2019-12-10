// extracts just the data from the query results

var _ = require('lodash');

var Project = module.exports = function (_node) {
  _.extend(this, _node.properties);
  if (this.id) {
    this.id = this.identity.toInt();
  };
  if (this.community) {
    this.community = this.community.toNumber();
  };
  if (this.pagerank) {
    this.pagerank = this.pagerank.toNumber();
  };
};
