var _ = require('lodash');
var dbUtils = require('../neo4j/dbUtils');

var NodeType = require('../models/neo4j/nodeType');
var RelationshipType = require('../models/neo4j/relationshipType');

// Export one node and information about the node
var _singleNode = function (record) {
  if (record.length) {
    var result = {};
    _.extend(result, new NodeType(record.get('node')));
    return result;
  } else {
    return null;
  }
};


// Export many nodes and relationships
function returnNodesAndRelationships(neo4jResult) {
  var result = {};
  if (neo4jResult.records.some(r => r.keys[0]==='node')) {
    result.nodes = neo4jResult.records.map(r =>
      new NodeType(r.get('node'))
    )
  };

    if (neo4jResult.records.some(r => r.keys[1]==='relationship')) {
    result.relationships = neo4jResult.records.map(r => new RelationshipType(r.get('relationship')))
  };

  // Bug: if there are nodes and relationships then the results are stored differently

  return result;
};

// Get all nodes of a particular type
var getAllOneNodeType = function (session, nodeLabel="Movie") {
  var query = [
    'MATCH (node:',
    nodeLabel,
    ') ',
    'RETURN collect(DISTINCT node) AS node'
  ].join('');

  return session
    .run(query)
    .then(r => returnNodesAndRelationships(r));
};


// get a single node by ID.
var getNodeByID = function(session, nodeId) {
  var query = [
    'MATCH (node',
    ') ',
    'WHERE id(node)={nodeId} ',
    'RETURN collect(DISTINCT node) AS node'
  ].join('');

  return session
  .run(query, {nodeId:parseInt(nodeId)})
  .then(result => {
    if (!_.isEmpty(result.records)) {
      return _singleNode(result.records[0]);
    }
    else {
      throw {message: 'node not found', status: 404}
    }
  });
};

// get a single node by ID and label.
var getNodeByIDandLabel = function(session, nodeId, nodeLabel) {
  var query = [
    'MATCH (node:',
    nodeLabel,
    ') ',
    'WHERE node.id={nodeId} ',
    'RETURN collect(DISTINCT node) AS node'
  ].join('');

  return session
  .run(query, {nodeId:parseInt(nodeId)})
  .then(result => {
    if (!_.isEmpty(result.records)) {
      return _singleNode(result.records[0]);
    }
    else {
      throw {message: 'node not found', status: 404}
    }
  });
};

// Get all nodes and relationships one step away from start node
var getAllOneDistNeighbours = function (session, startLabel, startId) {
  var query = [
    'MATCH (start:',
    startLabel,
    ') ',
    'WHERE id(start)={startId} ',
    'WITH start ',
    'MATCH (start)-[relationship]-(neighbours) ',
    'WITH relationship, [start,neighbours] AS nodes ',
    'UNWIND nodes AS node ',
    'RETURN collect(DISTINCT node) AS node, ',
    'collect(DISTINCT relationship) AS relationship'
  ].join('');
  return session.run (query, {
      startId: parseInt(startId)
    }).then(result => returnNodesAndRelationships(result));
};

// get all nodes of a particular type and relationships one step away from start point
var getAllOneDistNeighboursByType = function (session, startLabel, startId, neighbourLabel) {
  var query = [
    'MATCH (start:',
    startLabel,
    ') ',
    'WHERE id(start)={startId} ',
    'WITH start ',
    'MATCH (start)-[relationship]-(neighbours:',
    neighbourLabel,
    ') ',
    'WITH relationship, [start,neighbours] AS nodes ',
    'UNWIND nodes AS node ',
    'RETURN collect(DISTINCT node) AS node, ',
    'collect(DISTINCT relationship) AS relationship'
  ].join('');
  return session.run (query, {
      startId: parseInt(startId)
    }).then(result => returnNodesAndRelationships(result));
};

// get all nodes and relationships two steps away from the start point
var getAllTwoDistNeighbours = function (session, startLabel, startId) {
  var query = [
    'MATCH (start:',
    startLabel,
    ') ',
    'WHERE id(start)={startId} ',
    'WITH start ',
    'MATCH (start)-[relationship *1..2]-(neighbours) ',
    'WITH relationship, [start,neighbours] AS nodes ',
    'UNWIND nodes AS node ',
    'RETURN collect(DISTINCT node) AS node, ',
    'collect(DISTINCT relationship) AS relationship'
  ].join('');
  return session.run (query, {
      startId: parseInt(startId)
    }).then(result => returnNodesAndRelationships(result));
};

// Do a search depending on a max and min value for something
var getByMaxMinProperty = function (session, nodeLabel, property, min, max) {
  var query = [
    'MATCH (node:',
    nodeLabel,
    ') ',
    'WHERE node.' + property + ' > {min} AND node.' + property + ' < {max} ',
    'RETURN collect(DISTINCT node) AS node'
  ].join('');
  return session.run(query, {
    min: parseInt(min),
    max: parseInt(max)
  }).then(result => returnNodesAndRelationships(result));
};

// Do a search depending on a string match
var getByStringMatch = function (session, nodeLabel, property, stringMatch) {
  var query = [
    'MATCH (node:',
    nodeLabel,
    ') ',
    'WHERE node.' + property + ' = {stringMatch} ',
    'RETURN collect(DISTINCT node) AS node'
  ].join('');
  return session.run(query, {
    stringMatch: stringMatch
  }).then(result => returnNodesAndRelationships(result));
};

// get all nodes and properties in a shortest path between two nodes
var getShortestPath = function (session, startLabel, startID, endLabel, endID, relationshipList) {

  if (relationshipList==='{relationshipList}') {relationshipList = []}
  else {relationshipList = relationshipList.split("\n");
  relationshipList = relationshipList.map(i => ':' + i)}

  var relationshipString= relationshipList.join('|')

  var query = [
    'MATCH (start:',
    startLabel,
    ') ',
    'WHERE id(start)={startID} ',
    'WITH start ',
    'MATCH (end:',
    endLabel,
    ') ',
    'WHERE id(end)={endID} ',
    'WITH start, end ',
    'MATCH p = shortestPath( (start)-[',
    relationshipString,
    '*]-(end) ) ',
    'WITH relationships(p) AS relationships, nodes(p) AS nodes ',
    'UNWIND relationships AS relationship ',
    'UNWIND nodes AS node ',
    'RETURN collect(DISTINCT node) AS node, ',
    'collect(DISTINCT relationship) AS relationship'
  ].join(' ');
  return session.run(query, {
    startID: parseInt(startID),
    endID: parseInt(endID)
  }).then(result => returnNodesAndRelationships(result));
};

// get  shortest path with nodes identified by a property.
var getShortestPathWithProperties = function (session, startLabel, startProperty, startValue, endLabel, endProperty, endValue) {
  var query = [
    'MATCH p = shortestPath( (p1:',
    startLabel,
    '{',
    startProperty,
    ':{startValue}})-[*]-(target:',
    endLabel,
    '{',
    endProperty,
    ':{endValue}}) ) ',
    'WITH relationships(p) AS relationships, nodes(p) AS nodes ',
    'UNWIND relationships AS relationship ',
    'UNWIND nodes AS node ',
    'RETURN collect(DISTINCT node) AS node, ',
    'collect(DISTINCT relationship) AS relationship'
  ].join(' ');
  return session.run(query, {
    startValue: startValue,
    endValue: endValue
  }).then(result => returnNodesAndRelationships(result));
};

// Get all nodes in one community and any relationships in the community
var getCommunity = function (session, communityID) {
  var query = [
    'MATCH (node1 {community:{communityID}})',
    'WITH node1',
    'MATCH (node1)-[relationship]-(node2 {community:{communityID}})',
    'WITH relationship, [node1,node2] AS nodes',
    'UNWIND nodes AS node ',
    'RETURN collect(DISTINCT node) AS node, ',
    'collect(DISTINCT relationship) AS relationship'
  ].join(' ');

  return session.run(query, {
    communityID: parseInt(communityID)
  }).then(result => returnNodesAndRelationships(result));
};

// export exposed functions
module.exports = {
  getAllOneNodeType: getAllOneNodeType,
  getNodeByID: getNodeByID,
  getNodeByIDandLabel: getNodeByIDandLabel,
  getAllOneDistNeighbours: getAllOneDistNeighbours,
  getAllOneDistNeighboursByType: getAllOneDistNeighboursByType,
  getAllTwoDistNeighbours: getAllTwoDistNeighbours,
  getByMaxMinProperty: getByMaxMinProperty,
  getByStringMatch: getByStringMatch,
  getShortestPath: getShortestPath,
  getShortestPathWithProperties: getShortestPathWithProperties,
  getCommunity: getCommunity
};
