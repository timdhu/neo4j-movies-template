// extracts the data from the query results.
// Makes all number type data usable in Javascript

var _ = require('lodash');

var NodeType = module.exports = function (_node) {
  // _.extend(this, _node);
  // Convert all Neo4j numbers to numbers in javascript
  _node.map(r => {
    if (r.identity) {r.identity= r.identity.toInt()};
    if (r.properties) {

      // properties for new database
      if (r.properties.community) {r.properties.community = r.properties.community.toInt()};
      if (r.properties.pagerank) {r.properties.pagerank = r.properties.pagerank.toNumber()};
      if (r.properties.nearest_powerline_distance_km) {r.properties.nearest_powerline_distance_km = r.properties.nearest_powerline_distance_km.toNumber()};
      if (r.properties.age_years) {r.properties.age_years = r.properties.age_years.toNumber()};
      if (r.properties.lon) {r.properties.lon = r.properties.lon.toNumber()};
      if (r.properties.lat) {r.properties.lat = r.properties.lat.toNumber()};
      if (r.properties.depth_meters) {r.properties.depth_meters = r.properties.depth_meters.toNumber()};
      if (r.properties.year_of_commissioning) {r.properties.year_of_commissioning = r.properties.year_of_commissioning.toNumber()};
      if (r.properties.value_usd) {r.properties.value_usd = r.properties.value_usd.toNumber()};
      if (r.properties.employee_count) {r.properties.employee_count = r.properties.employee_count.toNumber()};
      if (r.properties.market_capitalization_usd) {r.properties.market_capitalization_usd = r.properties.market_capitalization_usd.toNumber()};

      // properties for movie database
      if (r.properties.born) {r.properties.born = r.properties.born.toNumber()};
      if (r.properties.id) {r.properties.id = r.properties.id.toNumber()};
      if (r.properties.duration) {r.properties.duration = r.properties.duration.toNumber()};

    };
  })

  return _node
};
