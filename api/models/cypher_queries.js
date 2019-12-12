var _ = require('lodash');
var dbUtils = require('../neo4j/dbUtils');

var NodeType = require('../models/neo4j/nodeType');
var EdgeType = require('../models/neo4j/edgeType');

// Export one node and information about the node
var _singleNode = function (record) {
  if (record.length) {
    var output = {};
    // This seems unnecessary, can we simplify?
    _.extend(output, new NodeType(record.get('node')));
    var result = {}
    result.nodes = Object.values(output[0]);
    return result;
  } else {
    return null;
  }
};


// Export many nodes and edges
function returnNodesAndEdges(neo4jResult) {
  var result = {};
  if (neo4jResult.records.some(r => r.keys[0]==='node')) {
    result.nodes = neo4jResult.records.map(r =>
      new NodeType(r.get('node'))
    )
    result.nodes = result.nodes[0]
  };

    if (neo4jResult.records.some(r => r.keys[1]==='edge')) {
    result.edges = neo4jResult.records.map(r => new EdgeType(r.get('edge')))
    result.edges = result.edges[0]
  };

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
    .then(r => returnNodesAndEdges(r));
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

// Get all nodes and edges one step away from start node
var getAllOneDistNeighbours = function (session, startLabel, startId, edgeList) {

  if (edgeList==='{edgeList}') {edgeList = []}
  else {edgeList = edgeList.split("\n");
  edgeList = edgeList.map(i => ':' + i)}

  var edgeString= edgeList.join('|')

  var query = [
    'MATCH (start:',
    startLabel,
    ') ',
    'WHERE id(start)={startId} ',
    'WITH start ',
    'MATCH (start)-[edge',
    edgeString,
    ']-(neighbours) ',
    'WITH edge, [start,neighbours] AS nodes ',
    'UNWIND nodes AS node ',
    'RETURN collect(DISTINCT node) AS node, ',
    'collect(DISTINCT edge) AS edge'
  ].join('');
  return session.run (query, {
      startId: parseInt(startId)
    }).then(result => returnNodesAndEdges(result));
};

// get all nodes of a particular type and edges one step away from start point
var getAllOneDistNeighboursByType = function (session, startLabel, startId, neighbourLabel, edgeList) {

  if (edgeList==='{edgeList}') {edgeList = []}
  else {edgeList = edgeList.split("\n");
  edgeList = edgeList.map(i => ':' + i)}

  var edgeString= edgeList.join('|')

  var query = [
    'MATCH (start:',
    startLabel,
    ') ',
    'WHERE id(start)={startId} ',
    'WITH start ',
    'MATCH (start)-[edge',
    edgeString,
    ']-(neighbours:',
    neighbourLabel,
    ') ',
    'WITH edge, [start,neighbours] AS nodes ',
    'UNWIND nodes AS node ',
    'RETURN collect(DISTINCT node) AS node, ',
    'collect(DISTINCT edge) AS edge'
  ].join('');
  return session.run (query, {
      startId: parseInt(startId)
    }).then(result => returnNodesAndEdges(result));
};

// get all nodes and edges two steps away from the start point
var getAllTwoDistNeighbours = function (session, startLabel, startId, edgeList) {


    if (edgeList==='{edgeList}') {edgeList = []}
    else {edgeList = edgeList.split("\n");
    edgeList = edgeList.map(i => ':' + i)}

    var edgeString= edgeList.join('|')

  var query = [
    'MATCH (start:',
    startLabel,
    ') ',
    'WHERE id(start)={startId} ',
    'WITH start ',
    'MATCH (start)-[edge',
    edgeString,
    ' *1..2]-(neighbours) ',
    'WITH edge, [start,neighbours] AS nodes ',
    'UNWIND nodes AS node ',
    'RETURN collect(DISTINCT node) AS node, ',
    'collect(DISTINCT edge) AS edge'
  ].join('');
  return session.run (query, {
      startId: parseInt(startId)
    }).then(result => returnNodesAndEdges(result));
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
  }).then(result => returnNodesAndEdges(result));
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
  }).then(result => returnNodesAndEdges(result));
};

// get all nodes and properties in a shortest path between two nodes
var getShortestPath = function (session, startLabel, startID, endLabel, endID, edgeList) {

  if (edgeList==='{edgeList}') {edgeList = []}
  else {edgeList = edgeList.split("\n");
  edgeList = edgeList.map(i => ':' + i)}

  var edgeString= edgeList.join('|')

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
    edgeString,
    '*]-(end) ) ',
    'WITH relationships(p) AS edges, nodes(p) AS nodes ',
    'UNWIND edges AS edge ',
    'UNWIND nodes AS node ',
    'RETURN collect(DISTINCT node) AS node, ',
    'collect(DISTINCT edge) AS edge'
  ].join(' ');
  return session.run(query, {
    startID: parseInt(startID),
    endID: parseInt(endID)
  }).then(result => returnNodesAndEdges(result));
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
    'WITH relationships(p) AS edges, nodes(p) AS nodes ',
    'UNWIND edges AS edge ',
    'UNWIND nodes AS node ',
    'RETURN collect(DISTINCT node) AS node, ',
    'collect(DISTINCT edge) AS edge'
  ].join(' ');
  return session.run(query, {
    startValue: startValue,
    endValue: endValue
  }).then(result => returnNodesAndEdges(result));
};

// Get all nodes in one community and any edges in the community
var getCommunity = function (session, communityID) {
  var query = [
    'MATCH (node1 {community:{communityID}})',
    'WITH node1',
    'MATCH (node1)-[edge]-(node2 {community:{communityID}})',
    'WITH edge, [node1,node2] AS nodes',
    'UNWIND nodes AS node ',
    'RETURN collect(DISTINCT node) AS node, ',
    'collect(DISTINCT edge) AS edge'
  ].join(' ');

  return session.run(query, {
    communityID: parseInt(communityID)
  }).then(result => returnNodesAndEdges(result));
};

// TODO:
// Queries:
//         neighbour queries with different edges
//         include edges in shortest path query
//         query to list particular properties of nodes
//         query to list all labels
//         query to list all relationships
// perform community algorithm on subgraph (stream results?)


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
