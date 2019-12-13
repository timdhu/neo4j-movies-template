var express = require('express')
  , path = require('path')
  , routes = require('./routes')
  , new_route = require('./routes/cypher_queries')
  , nconf = require('./config')
  , swaggerJSDoc = require('swagger-jsdoc')
  , methodOverride = require('method-override')
  , errorHandler = require('errorhandler')
  , bodyParser = require('body-parser')
  // , setAuthUser = require('./middlewares/setAuthUser')
  , neo4jSessionCleanup = require('./middlewares/neo4jSessionCleanup')
  , writeError = require('./helpers/response').writeError;

var app = express()
  , api = express();

app.use(nconf.get('api_path'), api);

var swaggerDefinition = {
  info: {
    title: 'Neo4j Movie Demo API (Node/Express)',
    version: '1.0.0',
    description: '',
  },
  host: 'localhost:3000',
  basePath: '/',
};

// options for the swagger docs
var options = {
  // import swaggerDefinitions
  swaggerDefinition: swaggerDefinition,
  // path to the API docs
  apis: ['./routes/*.js'],
};

// initialize swagger-jsdoc
var swaggerSpec = swaggerJSDoc(options);

// serve swagger
api.get('/swagger.json', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/docs', express.static(path.join(__dirname, 'swaggerui')));
app.set('port', nconf.get('PORT'));

api.use(bodyParser.json());
api.use(methodOverride());

//enable CORS
api.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

//api custom middlewares:
// api.use(setAuthUser);
api.use(neo4jSessionCleanup);

// api routes for nodes:
api.get('/nodes/label/:nodeLabel', routes.cypher_queries.list );
api.get('/nodes/id/:id', routes.cypher_queries.findNodeByID);
api.get('/nodes/labelid/:nodeLabel/:id', routes.cypher_queries.findNodeByIDandLabel);
api.get('/nodes/neighbours/:nodeLabel/:id/:edgeList', routes.cypher_queries.findAllOneDistNeighbours);
api.get('/nodes/neighbours/:nodeLabel/:id/:neighbourLabel/:edgeList', routes.cypher_queries.findAllOneDistNeighboursByType);
api.get('/nodes/neighbours2/:nodeLabel/:id/:edgeList', routes.cypher_queries.findAllTwoDistNeighbours);
api.get('/nodes/range/:nodeLabel/:property/:min/:max', routes.cypher_queries.findByMaxMinProperty);
api.get('/nodes/match/:nodeLabel/:property/:stringMatch', routes.cypher_queries.findByStringMatch);
api.get('/nodes/shortestPath/:startLabel/:startID/:endLabel/:endID/:edgeList', routes.cypher_queries.findShortestPath);
api.get('/nodes/shortestPathProperties/:startLabel/:startProperty/:startValue/:endLabel/:endProperty/:endValue', routes.cypher_queries.findShortestPathWithProperties);
api.get('/nodes/community/:communityID', routes.cypher_queries.findCommunity);
api.get('/nodes/communityFromID/:nodeID', routes.cypher_queries.findCommunityFromID);
api.get('/nodes/metagraph', routes.cypher_queries.findMetagraph)

// api routes for lists:
api.get('/lists/labels', routes.cypher_queries.findLabels);
api.get('/lists/edges', routes.cypher_queries.findEdges);
api.get('/lists/nodeProperties', routes.cypher_queries.findNodeProperties);
api.get('/lists/edgeProperties', routes.cypher_queries.findEdgeProperties);
api.get('/lists/nodePropertiesLabel/:nodeLabel', routes.cypher_queries.findNodePropertiesLabel);
api.get('/lists/edgePropertiesLabel/:edgeType', routes.cypher_queries.findEdgePropertiesLabel);
api.get('/lists/edgesLabel/:nodeLabel', routes.cypher_queries.findEdgesLabel);

//api error handler
api.use(function(err, req, res, next) {
  if(err && err.status) {
    writeError(res, err);
  }
  else next(err);
});

app.listen(app.get('port'), () => {
  console.log('Express server listening on port ' + app.get('port') + ' see docs at /docs');
});
