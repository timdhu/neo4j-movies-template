// extracts the data from the query results.
// Makes all number type data usable in Javascript

var _ = require('lodash');

var NodeType = module.exports = function (_node) {
  _.extend(this, _node);
  // Construct an ID for each of the nodes
  if (this.identity) {
    this.id = this.identity.toInt();
  };

  // Properties that are on all nodes
  if (this.properties.community) {
    this.properties.community = this.properties.community.toNumber();
  };
  if (this.properties.pagerank) {
    this.properties.pagerank = this.properties.pagerank.toNumber();
  };

  // Properties on asset nodes
  if (this.properties.nearest_powerline_distance_km) {
    this.properties.nearest_powerline_distance_km = this.properties.nearest_powerline_distance_km.toNumber();
  }
  if (this.properties.age_years) {
    this.properties.age_years = this.properties.age_years.toNumber();
  }
  if (this.properties.lon) {
    this.properties.lon = this.properties.lon.toNumber();
  }
  if (this.properties.lat) {
    this.properties.lat = this.properties.lat.toNumber();
  }
  if (this.properties.depth_meters) {
    this.properties.depth_meters = this.properties.depth_meters.toNumber();
  }
  if (this.properties.year_of_commissioning) {
    this.properties.year_of_commissioning = this.properties.year_of_commissioning.toNumber();
  }
  if (this.properties.value_usd) {
    this.properties.value_usd = this.properties.value_usd.toNumber();
  }
  if (this.properties.employee_count) {
    this.properties.employee_count = this.properties.employee_count.toNumber();
  }

  // Properties on company Nodes
  if (this.properties.market_capitalization_usd) {
    this.properties.market_capitalization_usd = this.properties.market_capitalization_usd.toNumber();
  };
};
