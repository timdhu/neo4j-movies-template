var _ = require('lodash');
var dbUtils = require('../neo4j/dbUtils');

var NodeType = require('../models/neo4j/nodeType');
var RelationshipType = require('../models/neo4j/relationshipType');

// Export one node with details about the node
var _singleNodeWithDetails = function (record) {}


// Export many nodes and relationships
function manyNodes(neo4jResult) {
  var result = {};
  result.nodes = neo4jResult.records.map(r => new NodeType(r.get('node')))
  result.relationships = neo4jResult.records.map(r => new RelationshipType(r.get('relationship')))
  return result
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
    .run(query)
    .then(r => manyAssets(r));
};

// get a single node by ID, provide Label to speed up query
var getNodeByID = function(session,nodeLabel, nodeID) {
  var query = [
    'MATCH (node:',
    nodeLabel,
    ')',
    'WHERE id(node)=',
    nodeID.toStr(),
    'RETURN node'
  ]

}

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

// Get all nodes in one community and any relationships in the community
var getCommunity {}

// Export exposed functions
