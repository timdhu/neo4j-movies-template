var _ = require('lodash');
var dbUtils = require('../neo4j/dbUtils');

var NodeType = require('../models/neo4j/nodeType');
var RelationshipType = require('../models/neo4j/relationshipType');

// Export one node with details about the node
var _singleNodeWithDetails = function (record) {}


// Export many nodes and relationships
function manyNodes(neo4jResult) {
    return neo4jResult.records.map(r => new NodeType(r.get('node')))
}

// Get all nodes of a particular type
var getAllOneNodeType = function (session, nodeLabel) {
  var query = [
    'MATCH (node:',
    nodeLabel,
    ')',
    'RETURN node'
  ].join(' ')
  return session
    .run('MATCH (asset:Asset) RETURN asset')
    .then(r => manyAssets(r));
};

// Get all nodes and relationships one step away from start node
var getAllOneDistNeighbours = function (session, nodeLabel, startId) {
  var query = [
    'MATCH (start:',
    nodelLabel,
    ' {_id: {startID}})',
    '-[relationship:]-(neighbours:)',
    'RETURN relationship, [start,neighbours] AS node'
  ].join(' ');

  return session.run (query, {
      startID: parseInt(startId)
    }).then(result => {
      if (!_.isEmpty(result.records)) {
        var result={};

      }
    });
}

// get all nodes of a particular type and relationships one step away from start point
var getAllOneDistNeighboursByType {}

// get all nodes and relationships two steps away from the start point
var getAllTwoDistNeighbours {}

// Do a search depending on a max and min value for something
var getByMaxMin {}

// Do a search depending on a string match
var getByStringMatch {}

// get all nodes and properties in a shortest path between two nodes
var getShortestPath {}

// Export exposed functions
