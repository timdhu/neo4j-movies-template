// movies.js
var Cypher_Queries = require('../models/cypher_queries')
  , _ = require('lodash')
  , writeResponse = require('../helpers/response').writeResponse
  , writeError = require('../helpers/response').writeError
  , loginRequired = require('../middlewares/loginRequired')
  , dbUtils = require('../neo4j/dbUtils');

/**
 * @swagger
 * definition:
 *   Node:
 *     type: object
 *     properties:
 *       id:
 *         type: integer
 *       properties:
 *         type: object
 */

/**
 * @swagger
 * /api/v0/nodes/{nodeLabel}:
 *   get:
 *     tags:
 *     - nodes
 *     description: Find all nodes with a particular label
 *     summary: Find all nodes with a particular label
 *     parameters:
 *       - name: nodeLabel
 *         description: label of nodes
 *         in: path
 *         required: true
 *         type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: A list of nodes with a particular node label
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Node'
 *       404:
 *          description: Node label not found
 */
exports.list = function (req, res, next) {
  Cypher_Queries.getAllOneNodeType(dbUtils.getSession(req),req.params.nodeLabel)
    .then(response => writeResponse(res, response))
    .catch(next);
};

/**
 * @swagger
 * /api/v0/nodes/{nodeLabel}/{id}:
 *   get:
 *     tags:
 *     - nodes
 *     description: Find node by label and ID
 *     summary: Find node by label and ID
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
 *         description: A node
 *         schema:
 *           $ref: '#/definitions/node'
 *       404:
 *         description: node not found
 */
exports.findNodeByID = function (req, res, next) {
  Cypher_Queries.getNodeByID(dbUtils.getSession(req), req.params.nodeLabel, req.params.id)
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
 *           $ref: '#/definitions/node'
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
 *       - name: neighbourLabel
 *         description: label of neighbours
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: All nodes of a given label and their relationships with start node
 *         schema:
 *           $ref: '#/definitions/node'
 *       404:
 *         description: node not found
 */
exports.findAllOneDistNeighboursByType = function (req, res, next) {
  var id = req.params.id;
  if (!id) throw {message: 'Invalid id', status: 400};

  Cypher_Queries.getAllOneDistNeighbours(dbUtils.getSession(req), req.params.nodeLabel, id, req.params.neighbourLabel)
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
 *           $ref: '#/definitions/node'
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
 *     description: Returns nodes where a given property is within a range
 *     summary: Returns nodes where a given property is within a range
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: nodeLabel
 *         description: label of nodes
 *         in: path
 *         required: true
 *         type: string
 *       - name: property
 *         description: property of interes
 *         in: path
 *         required: true
 *         type: string
 *       - name: min
 *         description: Start of range
 *         in: path
 *         required: true
 *         type: integer
 *       - name: max
 *         description: End of range
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: A list of nodes
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/node'
 *       400:
 *         description: Error message(s)
 */
exports.findByMaxMin = function (req, res, next) {
  var min = req.params.min;
  var max = req.params.max;

  if (!min) throw {message: 'Invalid min', status: 400};
  if (!max) throw {message: 'Invalid max', status: 400};

  Cypher_Queries.getByMaxMin(dbUtils.getSession(req), start, end)
    .then(response => writeResponse(res, response))
    .catch(next);
};

/**
 * @swagger
 * /api/v0/nodes/{nodeLabel}/{property}/{stringMatch}:
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
 *             $ref: '#/definitions/Node'
 *       400:
 *         description: Error message(s)
 */
exports.findByStringMatch = function (req, res, next) {
  var stringMatch = req.params.stringMatch;
  if (!stringMatch) throw {message: 'Invalid id', status: 400};

  Movies.getByStringMatch(dbUtils.getSession(req), req.params.nodeLabel, req.params.property, stringMatch)
    .then(response => writeResponse(res, response))
    .catch(next);
};

/**
 * @swagger
 * /api/v0/nodes/shortestPath:
 *   get:
 *     tags:
 *     - nodes
 *     description: Returns path from node 1 to node 2.
 *     summary: Returns path from node 1 to node 2.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: startLabel
 *         description: Label of the start node
 *         in: query
 *         required: true
 *         type: string
 *       - name: endLabel
 *         description: Label of the end node
 *         in: query
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
 *       - name: relationships
 *         description: array of relationships of interest
 *         in: path
 *         required: true
 *         type: array
 *     responses:
 *       200:
 *         description: A list of nodes and relationships
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/node'
 */
exports.findShortestPath = function (req, res, next) {
  var startID = req.params.startID;
  var endID = req.params.endID;
    if (!startID) throw {message: 'Invalid id', status: 400};
  if (!endID) throw {message: 'Invalid id', status: 400};
  People.getShortestPath(dbUtils.getSession(req), req.params.startLabel, startID, req.params.endLabel, endID, req.params.relationships)
    .then(response => writeResponse(res, response))
    .catch(next);
};

/**
 * @swagger
 * /api/v0/nodes/{community}:
 *   get:
 *     tags:
 *     - nodes
 *     description: Find nodes and relationships in a given community
 *     summary: Find nodes and relationships in a given community
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: community
 *         description: ID of community
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: A node
 *         schema:
 *           $ref: '#/definitions/node'
 *       404:
 *         description: node not found
 */
exports.findCommunity= function (req, res, next) {
  Cypher_Queries.getNodeByID(dbUtils.getSession(req), req.params.community)
    .then(response => writeResponse(res, response))
    .catch(next);
};
