// extracts just the data from the query results

var _ = require('lodash');

var City = module.exports = function (_node) {
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
  if (this.market_capitalization_usd) {
    this.market_capitalization_usd = this.market_capitalization_usd.toNumber();
  };
};
