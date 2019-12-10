// extracts just the data from the query results

var _ = require('lodash');

// Make all numbers in javascript
var Asset = module.exports = function (_node, myRating) {
  _.extend(this, _node.properties);

  if (this.id) {
    this.id = this.identity.toInt();
  }
  if (this.nearest_powerline_distance_km) {
    this.nearest_powerline_distance_km = this.nearest_powerline_distance_km.toNumber();
  }
  if (this.age_years) {
    this.age_years = this.age_years.toNumber();
  }
  if (this.lon) {
    this.lon = this.lon.toNumber();
  }
  if (this.lat) {
    this.lat = this.lat.toNumber();
  }
  if (this.depth_meters) {
    this.depth_meters = this.depth_meters.toNumber();
  }
  if (this.year_of_commissioning) {
    this.year_of_commissioning = this.year_of_commissioning.toNumber();
  }
  if (this.value_usd) {
    this.value_usd = this.value_usd.toNumber();
  }
  if (this.pagerank) {
    this.pagerank = this.pagerank.toNumber();
  }
  if (this.community) {
    this.community = this.community.toNumber();
  }
  if (this.employee_count) {
    this.employee_count = this.employee_count.toNumber();
  }
};
