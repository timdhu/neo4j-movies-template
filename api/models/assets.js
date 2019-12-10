var _ = require('lodash');
var dbUtils = require('../neo4j/dbUtils');

var Asset = require('../models/neo4j/asset');
var Person = require('../models/neo4j/person');
var Project = require('../models/neo4j/project');
var Company = require('../models/neo4j/company');
var City = require('../models/neo4j/city');
var Country = require('../models/neo4j/country');
var Province = require('../models/neo4j/province');
var Subregion = require('../models/neo4j/subregion');
var Region = require('../models/neo4j/region');

var _singleAssetWithDetails = function (record) {
  if (record.length) {
    var result = {};
    _.extend(result, new Asset(record.get('asset')));

    result.owners = _.map(record.get('owners'), record => {
      return new Company(record);
    });
    result.operators = _.map(record.get('operators'), record => {
      return new Company(record);
    });
    result.contractors = _.map(record.get('contractors'), record => {
      return new Company(record);
    });
    result.contacts = _.map(record.get('contacts'), record => {
      return new Person(record);
    });
    result.related = _.map(record.get('related'), record => {
      return new Asset(record);
    });
    result.cities = _.map(record.get('cities'), record => {
      return new City(record);
    });
    result.countries = _.map(record.get('countries'), record => {
      return new Country(record);
    });
    result.subregions = _.map(record.get('subregions'), record => {
      return new Subregion(record);
    });
    result.regions = _.map(record.get('regions'), record => {
      return new Region(record);
    });
    return result;
  } else {
    return null;
  }
};

function manyAssets(neo4jResult) {
  return neo4jResult.records.map(r => new Asset(r.get('asset')))
}

// Cypher query functions

// get all assets
var getAll = function (session) {
  return session
    .run('MATCH (asset:Asset) RETURN asset')
    .then(r => manyAssets(r));
};

// get a single asset by id along with all information about the asset
var getById = function (session, assetId) {
  var query = [
    'MATCH (asset:Asset {id: {assetId}})',
    'OPTIONAL MATCH (asset)-[:IN_PROJECT]-(project:Project)',
    'OPTIONAL MATCH (asset)-[:OWNED_BY]-(owner:Company)',
    'OPTIONAL MATCH (asset)-[:OPERATED_BY]-(operator:Company)',
    'OPTIONAL MATCH (asset)-[:HAS_CONTRACT_IN]-(contractor:Company)',
    'OPTIONAL MATCH (asset)-[:CONTACT_FOR]-(contact:Person)',
    'OPTIONAL MATCH (asset)-[:IN_CITY]-(city:City)',
    'OPTIONAL MATCH (asset)-[:IN_PROVINCE]-(province:Province)',
    'OPTIONAL MATCH (asset)-[:IN_COUNTRY]-(country:Country)',
    'OPTIONAL MATCH (asset)-[:IN_SUBREGION]-(subregion:Subregion)',
    'OPTIONAL MATCH (asset)-[:IN_REGION]-(region:Region)',
    'OPTIONAL MATCH (related:Asset)-[:OWNED_BY|:OPERATED_BY|:HAS_CONTRACT_IN]-(company)',
    'WITH DISTINCT asset,',
    'project, owner, operator, contractor, contact, city, province, country, subregion, region, related, count(related) AS countRelated',
    'ORDER BY countRelated DESC',
    'RETURN DISTINCT asset,',
    'collect(DISTINCT project) AS projects, ',
    'collect(DISTINCT owner) AS owners,',
    'collect(DISTINCT operator) AS operators,',
    'collect(DISTINCT contractor) AS contractors,',
    'collect(DISTINCT contact) AS contacts,',
    'collect(DISTINCT city) AS cities,',
    'collect(DISTINCT country) AS countries,',
    'collect(DISTINCT subregion) AS subregions,',
    'collect(DISTINCT region) AS regions,',
    'collect(DISTINCT related) AS related,',
  ].join('\n');

  return session.run(query, {
    movieId: parseInt(assetId)
  }).then(result => {
    if (!_.isEmpty(result.records)) {
      return _singleAssetWithDetails(result.records[0]);
    }
    else {
      throw {message: 'asset not found', status: 404}
    }
  });
};

// Get assets by Country
var getByCountry = function(session, countryId) {
  var query = [
    'MATCH (asset:Asset)-[:IN_COUNTRY]->(country:Country)',
    'WHERE country.id = {countryId}',
    'RETURN asset'
  ].join('\n');

  return session.run(query, {
    countryId: parseInt(countryId)
  }).then(result => manyAssets(result));
};

// get assets by subregions
var getBySubregion = function(session, subregionId) {
  var query = [
    'MATCH (asset:Asset)-[:IN_SUBREGION]->(subregion:Subregion)',
    'WHERE subregion.id = {subregionId}',
    'RETURN asset'
  ].join('\n');

  return session.run(query, {
    subregionId: parseInt(subregionId)
  }).then(result => manyAssets(result));
};

// get assets by regions
var getByRegion = function(session, regionId) {
  var query = [
    'MATCH (asset:Asset)-[:IN_REGION]->(region:Region)',
    'WHERE region.id = {regionId}',
    'RETURN asset'
  ].join('\n');

  return session.run(query, {
    regionId: parseInt(regionId)
  }).then(result => manyAssets(result));
};

// get assets by company
var getByCompany = function(session, companyId) {
  var query = [
    'MATCH (asset:Asset)-[:OWNED_BY|OPERATED_BY|HAS_CONTRACT_IN]-(company:Company)',
    'WHERE company.id = {companyId}',
    'RETURN asset'
  ].join('\n');

  return session.run(query, {
    companyId: parseInt(companyId)
  }).then(result => manyAssets(result));
};

// get assets by contact
var getByPerson= function(session, personId) {
  var query = [
    'MATCH (asset:Asset)-[:CONTACT_FOR]-(person:Person)',
    'WHERE person.id = {personId}',
    'RETURN asset'
  ].join('\n');

  return session.run(query, {
    personId: parseInt(personId)
  }).then(result => manyAssets(result));
};

// get assets by year of commissioning
var getByCommissionYear = function (session, start, end) {
  var query = [
    'MATCH (asset:Asset)',
    'WHERE asset.year_of_commissioning > {start} AND asset.year_of_commissioning < {end}',
    'RETURN asset'
  ].join('\n');

  return session.run(query, {
    start: parseInt(start || 0),
    end: parseInt(end || 0)
  }).then(result => manyAssets(result))
};

// get assets by value
var getByValue = function (session, min, max) {
  var query = [
    'MATCH (asset:Asset)',
    'WHERE asset.value_usd > {min} AND asset.value_usd < {max}',
    'RETURN asset'
  ].join('\n');

  return session.run(query, {
    min: parseInt(min || 0),
    max: parseInt(max || 0)
  }).then(result => manyAssets(result))
};

// get assets by employee count
var getByEmployeeCount = function (session, min, max) {
  var query = [
    'MATCH (asset:Asset)',
    'WHERE asset.employee_count > {min} AND asset.employee_count < {max}',
    'RETURN asset'
  ].join('\n');

  return session.run(query, {
    min: parseInt(min || 0),
    max: parseInt(max || 0)
  }).then(result => manyAssets(result))
};

// get assets by status
var getByPerson= function(session, status) {
  var query = [
    'MATCH (asset:Asset)',
    'WHERE asset.status = {status}',
    'RETURN asset'
  ].join('\n');

  return session.run(query, {
    status: status
  }).then(result => manyAssets(result));
};

// get assets by Community
var getByPerson= function(session, communityID) {
  var query = [
    'MATCH (asset:Asset)',
    'WHERE asset.community = {communityID}',
    'RETURN asset'
  ].join('\n');

  return session.run(query, {
    genreId: parseInt(communityId)
  }).then(result => manyAssets(result));
};

// Find shortest path between two assets only via given relationships
// Note: returns a path object, may be better to modify this in the future depending on visualisation
var getAssetAssetSP = function (session, asset1Id, asset2Id, relationships) {
//needs to be optimized
  var query = [
    'MATCH p = shortestPath( (asset1:Asset {id:{asset1Id} })-[:',
    relationships.join("|:"),
    ']-(asset2:Asset {id:{asset2Id} }) )',
    'WITH p',
    'WHERE length(p)> 1',
    'RETURN p',
  ].join('\n');

  return session.run(query, {
    asset1Id: parseInt(asset1Id),
    asset2Id: parseInt(asset2Id)
  }).then(result => _manyPeople(result))
};

// Find shortest path between asset and person etc
var getAssetAssetSP = function (session, assetId, personId, relationships) {
//needs to be optimized
  var query = [
    'MATCH p = shortestPath( (asset:Asset {id:{assetId} })-[:',
    relationships.join("|:"),
    ']-(end: {id:{endId} }) )',
    'WITH p',
    'WHERE length(p)> 1',
    'RETURN p',
  ].join('\n');

  return session.run(query, {
    assetId: parseInt(assetId),
    personId: parseInt(endId)
  }).then(result => _manyPeople(result))
};


// Export exposed functions
