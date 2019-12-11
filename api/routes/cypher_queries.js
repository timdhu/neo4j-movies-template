// cypher_queries.js
var Cypher_Queries = require('../models/cypher_queries')
  , _ = require('lodash')
  , writeResponse = require('../helpers/response').writeResponse
  , writeError = require('../helpers/response').writeError
  , loginRequired = require('../middlewares/loginRequired')
  , dbUtils = require('../neo4j/dbUtils');

 /**
  * @swagger
  * definition:
  *   Output:
  *     type: object
  *     properties:
  *       nodes:
  *         type: array
  *         items:
  *           type: object
  *           properties:
  *             identity:
  *               type: object
  *               properties:
  *                 low: integer
  *                 high: integer
  *             labels:
  *               type: array
  *               items: string
  *             properties:
  *               type: object
  *               properties:
  *                 id:
  *                   type: object
  *                   properties:
  *                     low: integer
  *                     high: integer
  *       relationships:
  *         type: array
  *         items:
  *           type: object
  *           properties:
  *             identity:
  *               type: object
  *               properties:
  *                 low: integer
  *                 high: integer
  *             start:
  *               type: object
  *               properties:
  *                 low: integer
  *                 high: integer
  *             end:
  *               type: object
  *               properties:
  *                 low: integer
  *                 high: integer
  *             type:
  *               type: string
  *             properties:
  *               type: object
  *               properties:
  *                 id:
  *                   type: object
  *                   properties:
  *                     low: integer
  *                     high: integer
  */

/**
 * @swagger
 * /api/v0/nodes/label/{nodeLabel}:
 *   get:
 *     tags:
 *     - nodes
 *     description: Find all nodes with a particular label
 *     summary: Find all nodes with a particular label
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: nodeLabel
 *         description: label of nodes
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A list of nodes with a particular node label
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Output'
 *       404:
 *          description: Node label not found
 */
exports.list = function (req, res, next) {
  var nodeLabel = req.params.nodeLabel;
  Cypher_Queries.getAllOneNodeType(dbUtils.getSession(req),nodeLabel)
    .then(response => writeResponse(res, response))
    .catch(next);
};

/**
 * @swagger
 * /api/v0/nodes/id/{id}:
 *   get:
 *     tags:
 *     - nodes
 *     description: Find node by ID
 *     summary: Find node by ID
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: neo4j ID of node
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: A node
 *         schema:
 *           $ref: '#/definitions/Output'
 *       404:
 *         description: node not found
 */
exports.findNodeByID = function (req, res, next) {
  Cypher_Queries.getNodeByID(dbUtils.getSession(req), req.params.id)
    .then(response => writeResponse(res, response))
    .catch(next);
};

/**
 * @swagger
 * /api/v0/nodes/labelid/{nodeLabel}/{id}:
 *   get:
 *     tags:
 *     - nodes
 *     description: Find node by label and ID
 *     summary: Find node by label and ID
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: neo4j ID of node
 *         in: path
 *         required: true
 *         type: integer
 *       - name: nodeLabel
 *         description: label of node
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: A node
 *         schema:
 *           $ref: '#/definitions/Output'
 *       404:
 *         description: node not found
 */
exports.findNodeByIDandLabel= function (req, res, next) {
  Cypher_Queries.getNodeByIDandLabel(dbUtils.getSession(req), req.params.id, req.params.nodeLabel)
    .then(response => writeResponse(res, response))
    .catch(next);
};

/**
 * @swagger
 * /api/v0/nodes/neighbours/{nodeLabel}/{id}:
 *   get:
 *     tags:
 *     - nodes
 *     description: Returns all nodes related to node given by label and id
 *     summary: Returns all nodes related to node given by label and id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: nodeLabel
 *         description: label of nodes
 *         in: path
 *         required: true
 *         type: string
 *       - name: id
 *         description: neo4j ID of node
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: All nodes and their relationships with start node
 *         schema:
 *           $ref: '#/definitions/Output'
 *       404:
 *         description: node not found
 */
exports.findAllOneDistNeighbours = function (req, res, next) {
  var id = req.params.id;
  if (!id) throw {message: 'Invalid id', status: 400};

  Cypher_Queries.getAllOneDistNeighbours(dbUtils.getSession(req), req.params.nodeLabel, id)
    .then(response => writeResponse(res, response))
    .catch(next);
};

/**
 * @swagger
 * /api/v0/nodes/neighbours/{nodeLabel}/{id}/{neighbourLabel}:
 *   get:
 *     tags:
 *     - nodes
 *     description: Returns all nodes of given label related to node given by label and id
 *     summary: Returns all nodes of given label related to node given by label and id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: nodeLabel
 *         description: label of nodes
 *         in: path
 *         required: true
 *         type: string
 *       - name: id
 *         description: neo4j ID of node
 *         in: path
 *         required: true
 *         type: integer
 *       - name: neighbourLabel
 *         description: label of neighbours
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: All nodes of a given label and their relationships with start node
 *         schema:
 *           $ref: '#/definitions/Output'
 *       404:
 *         description: node not found
 */
exports.findAllOneDistNeighboursByType = function (req, res, next) {
  var id = req.params.id;
  if (!id) throw {message: 'Invalid id', status: 400};
  Cypher_Queries.getAllOneDistNeighboursByType(dbUtils.getSession(req), req.params.nodeLabel, id, req.params.neighbourLabel)
    .then(response => writeResponse(res, response))
    .catch(next);
};


/**
 * @swagger
 * /api/v0/nodes/neighbours2/{nodeLabel}/{id}:
 *   get:
 *     tags:
 *     - nodes
 *     description: Returns all nodes related to node given by label and id
 *     summary: Returns all nodes related to node given by label and id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: nodeLabel
 *         description: label of nodes
 *         in: path
 *         required: true
 *         type: string
 *       - name: id
 *         description: neo4j ID of node
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: All nodes and their relationships with start node
 *         schema:
 *           $ref: '#/definitions/Output'
 *       404:
 *         description: node not found
 */
exports.findAllTwoDistNeighbours = function (req, res, next) {
  var id = req.params.id;
  if (!id) throw {message: 'Invalid id', status: 400};

  Cypher_Queries.getAllTwoDistNeighbours(dbUtils.getSession(req), req.params.nodeLabel, id)
    .then(response => writeResponse(res, response))
    .catch(next);
};

/**
 * @swagger
 * /api/v0/nodes/range/{nodeLabel}/{property}/{min}/{max}:
 *   get:
 *     tags:
 *     - nodes
 *     description: Returns nodes of distance 2 where a given property is within a range
 *     summary: Returns nodes of distance 2 where a given property is within a range
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: nodeLabel
 *         description: label of nodes
 *         in: path
 *         required: true
 *         type: string
 *       - name: property
 *         description: property of interest
 *         in: path
 *         required: true
 *         type: string
 *       - name: min
 *         description: Start of range
 *         in: path
 *         required: true
 *         type: string
 *       - name: max
 *         description: End of range
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A list of nodes
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Output'
 *       400:
 *         description: Error message(s)
 */
exports.findByMaxMinProperty = function (req, res, next) {
  var min = req.params.min;
  var max = req.params.max;

  if (!min) throw {message: 'Invalid min', status: 400};
  if (!max) throw {message: 'Invalid max', status: 400};

  Cypher_Queries.getByMaxMinProperty(dbUtils.getSession(req), req.params.nodeLabel, req.params.property, min, max)
    .then(response => writeResponse(res, response))
    .catch(next);
};

/**
 * @swagger
 * /api/v0/nodes/match/{nodeLabel}/{property}/{stringMatch}:
 *   get:
 *     tags:
 *     - nodes
 *     description: Returns a node with a string match of a given property
 *     summary: Returns a node with a string match of a given property
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: nodeLabel
 *         description: label of nodes
 *         in: path
 *         required: true
 *         type: string
 *       - name: property
 *         description: property of interest
 *         in: path
 *         required: true
 *         type: string
 *       - name: stringMatch
 *         description: string to match
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A list of nodes with the matching property
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Output'
 *       400:
 *         description: Error message(s)
 */
exports.findByStringMatch = function (req, res, next) {
  var stringMatch = req.params.stringMatch;
  if (!stringMatch) throw {message: 'Invalid id', status: 400};

  Cypher_Queries.getByStringMatch(dbUtils.getSession(req), req.params.nodeLabel, req.params.property, stringMatch)
    .then(response => writeResponse(res, response))
    .catch(next);
};

/**
 * @swagger
 * /api/v0/nodes/shortestPath/{startLabel}/{startID}/{endLabel}/{endID}/{relationshipList}:
 *   get:
 *     tags:
 *     - nodes
 *     description: Returns path from node 1 to node 2 using node IDs.
 *     summary: Returns path from node 1 to node 2 using node IDs.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: startLabel
 *         description: Label of the start node
 *         in: path
 *         required: true
 *         type: string
 *       - name: endLabel
 *         description: Label of the end node
 *         in: path
 *         required: true
 *         type: string
 *       - name: startID
 *         description: neo4j ID of start node
 *         in: path
 *         required: true
 *         type: integer
 *       - name: endID
 *         description: neo4j ID of end node
 *         in: path
 *         required: true
 *         type: integer
 *       - name: relationshipList
 *         description: array of relationships allowed in query
 *         in: path
 *         required: false
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: matrix
 *         explode: true
 *     responses:
 *       200:
 *         description: A list of nodes and relationships
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Output'
 */
exports.findShortestPath = function (req, res, next) {
  var startID = req.params.startID;
  var endID = req.params.endID;
  var relationshipList = req.params.relationshipList;
  if (!startID) throw {message: 'Invalid id', status: 400};
  if (!endID) throw {message: 'Invalid id', status: 400};
  Cypher_Queries.getShortestPath(dbUtils.getSession(req), req.params.startLabel, startID, req.params.endLabel, endID, relationshipList)
    .then(response => writeResponse(res, response))
    .catch(next);
};

/**
 * @swagger
 * /api/v0/nodes/shortestPathProperties/{startLabel}/{startProperty}/{startValue}/{endLabel}/{endProperty}/{endValue}:
 *   get:
 *     tags:
 *     - nodes
 *     description: Returns path from node 1 to node 2 using properties. Only accepts string values
 *     summary: Returns path from node 1 to node 2 using properties. Only accepts string values
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: startLabel
 *         description: Label of the start node
 *         in: path
 *         required: true
 *         type: string
 *       - name: endLabel
 *         description: Label of the end node
 *         in: path
 *         required: true
 *         type: string
 *       - name: startProperty
 *         description: property of start node
 *         in: path
 *         required: true
 *         type: string
 *       - name: endProperty
 *         description: property of end node
 *         in: path
 *         required: true
 *         type: string
 *       - name: startValue
 *         description: value of start property
 *         in: path
 *         required: true
 *         type: string
 *       - name: endValue
 *         description: value of end property
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A list of nodes and relationships
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Output'
 */
exports.findShortestPathWithProperties = function (req, res, next) {
  var startValue = req.params.startValue;
  var endValue = req.params.endValue;
  if (!startValue) throw {message: 'Invalid value', status: 400};
  if (!endValue) throw {message: 'Invalid value', status: 400};
  Cypher_Queries.getShortestPathWithProperties(dbUtils.getSession(req), req.params.startLabel, req.params.startProperty, startValue, req.params.endLabel,req.params.endProperty, endValue)
    .then(response => writeResponse(res, response))
    .catch(next);
};


/**
 * @swagger
 * /api/v0/nodes/community/{communityID}:
 *   get:
 *     tags:
 *     - nodes
 *     description: Find all nodes and relationships by community ID
 *     summary: Find all nodes and relationships by community ID
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: communityID
 *         description: ID of community
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Nodes and relationships in the community
 *         schema:
 *           $ref: '#/definitions/Output'
 *       404:
 *         description: node not found
 */
exports.findCommunity= function (req, res, next) {
  console.log(req.params)
  Cypher_Queries.getCommunity(dbUtils.getSession(req), req.params.communityID)
    .then(response => writeResponse(res, response))
    .catch(next);
};
