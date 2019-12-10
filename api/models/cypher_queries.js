var _ = require('lodash');
var dbUtils = require('../neo4j/dbUtils');

var NodeType = require('../models/neo4j/nodeType');
var RelationshipType = require('../models/neo4j/relationshipType');

// Export one node and information about the node
var _singleNode = function (record) {
  if (record.length) {
    var result = {};
    _.extend(result, new Node(record.get('node')));
    return result;
  } else {
    return null;
  }
};

// Export many nodes and relationships
function returnNodesAndRelationships(neo4jResult) {
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
    .then(r => returnNodesAndRelationships(r));
};

// get a single node by ID.
var getNodeByID = function(session,nodeLabel, nodeID) {
  var query = [
    'MATCH (node:',
    nodeLabel,
    ')',
    'WHERE id(node)={nodeId}',
    'RETURN node'
  ].join(' ')
  return session
  .run(query, {nodeID:nodeID})
  .then(result => {
    if (!_.isEmpty(result.records)) {
      return _singleNode(result.records[0]);
    }
    else {
      throw {message: 'node not found', status: 404}
    }
  });

// Get all nodes and relationships one step away from start node
var getAllOneDistNeighbours = function (session, startLabel, startId) {
  var query = [
    'MATCH (start:',
    startLabel,
    ')',
    '-[relationship:]-(neighbours:)',
    'WHERE id(start)={startId}',
    'RETURN relationship, [start,neighbours] AS node'
  ].join(' ');

  return session.run (query, {
      startID: parseInt(startId)
    }).then(result => returnNodesAndRelationships(result));
}

// get all nodes of a particular type and relationships one step away from start point
var getAllOneDistNeighboursByType = function (session, startLabel, startId, neighbourLabel) {
  var query = [
    'MATCH (start:',
    startLabel,
    ')',
    '-[relationship:]-(neighbours:',
    neighbourLabel,
    ')',
    'WHERE id(start)={startId}',
    'RETURN relationship, [start,neighbours] AS node'
  ].join(' ');

  return session.run (query, {
      startID: parseInt(startId)
    }).then(result => returnNodesAndRelationships(result));
}

// get all nodes and relationships two steps away from the start point
var getAllTwoDistNeighbours  = function (session, startLabel, startId) {
  var query = [
    'MATCH (start:',
    startLabel,
    ')',
    '-[relationship:1..2*]-(neighbours:)',
    'WHERE id(start)={startId)}',
    'RETURN relationship, [start,neighbours] AS node'
  ].join(' ');

  return session.run (query, {
      startID: parseInt(startId)
    }).then(result => returnNodesAndRelationships(result));
}

// Do a search depending on a max and min value for something
var getByMaxMin = function (session, nodeLabel, property, min, max) {
  var query = [
    'MATCH (node:',
    nodeLabel,
    ')',
    'WHERE node.' + property ' > {min} AND node.' property ' < {max}',
    'RETURN node'
  ].join('\n');

  return session.run(query, {
    min: parseInt(min || 0),
    max: parseInt(max || 0)
  }).then(result => returnNodesAndRelationships(result))
};
// Do a search depending on a string match
var getByStringMatch = function (session, nodeLabel, property, stringMatch) {
  var query = [
    'MATCH (node:',
    nodeLabel,
    ')',
    'WHERE node.' + property ' = {stringMatch}',
    'RETURN node'
  ].join('\n');

  return session.run(query, {
    stringMatch: stringMatch
  }).then(result => returnNodesAndRelationships(result))
}

// get all nodes and properties in a shortest path between two nodes
var getShortestPath = function (session, startLabel, startID, endLabel, endID, relationships) {
  query = [
    'MATCH path=shortestPath((start:',
    startLabel,
    ' {_id:{startID}})',
    '-[:'
    relationships.join('|:')
    '*0..10]-(end:',
    endLabel,
    ' {_id:{endID}}))',
    'RETURN path'
  ].join(' ');

  return session.run(query, {
    startID: parseInt(startID),
    endID: parseInt(endID)
  }).then(result => returnNodesAndRelationships(result))
}

// Get all nodes in one community and any relationships in the community
var getCommunity = function (session, communityID) {
  query = [
    'MATCH (node1 {community:{communityID}})',
    'WITH node1'
    'MATCH (node1)-[relationship]-(node2: {community:{communityID}})',
    'RETURN relationship, [node1,node2] AS node'
  ]
}

// Export exposed functions
module.exports = {
  getAllOneNodeType: getAllOneNodeType,
  getNodeByID: getNodeByID,
  getAllOneDistNeighbours: getAllOneDistNeighbours,
  getAllOneDistNeighboursByType: getAllOneDistNeighboursByType,
  getAllTwoDistNeighbours: getAllTwoDistNeighbours,
  getByMaxMin: getByMaxMin,
  getByStringMatch: getByStringMatch,
  getShortestPath: getShortestPath,
  getCommunity: getCommunity
};
