// extracts the data from the query results.
// Makes all number type data usable in Javascript

var _ = require('lodash');

var RelationshipType = module.exports = function (_node) {
  _.extend(this, _node);
  // Construct an ID for each of the nodes
  if (this.identity) {
    this.id = this.identity.toInt();
  };

  if (this.start) {
    this.from = this.start.toInt();
  };

  if (this.end) {
    this.to = this.end.toInt();
  };
};
