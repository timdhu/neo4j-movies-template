/**
 * Convert Gephi to Vis.
 *
 * @param inputJSON - The parsed JSON data.
 * @param inputOptions - Additional options.
 *
 * @returns The converted data ready to be used in Vis.
 */
function parseNeo4j(inputJSON, inputOptions) {


// Default options for parsing
var options = {
  nodes : {
    id : 'identity',
    group : 'labels',
    label: 'labels',
    value: 1,
    title: 'properties',
    attributes: 'properties'
  },
  edges : {
    id: 'identity',
    from: 'start',
    to: 'end',
    label: 'type',
    value: 1,
    title: 'properties',
    attributes: 'properties'
  }
};

// Replace defaults with any options given
if (inputOptions!=null) {
  if (inputOptions.nodes!=null) {
    if (inputOptions.nodes.group!=null) {
      options.nodes.group = inputOptions.nodes.group
    }
    if (inputOptions.nodes.label!=null) {
      options.nodes.label = inputOptions.nodes.label
    }
    if (inputOptions.nodes.value!=null) {
      options.nodes.value = inputOptions.nodes.value
    }
    if (inputOptions.nodes.title!=null) {
      options.nodes.title = inputOptions.nodes.title
    }
    if (inputOptions.nodes.attributes!=null) {
      options.nodes.attributes = inputOptions.nodes.attributes
    }
  };
  if (inputOptions.edges!=null) {
    if (inputOptions.edges.label!=null) {
      options.edges.label = inputOptions.edges.label
    }
    if (inputOptions.edges.value!=null) {
      options.edges.value = inputOptions.edges.value
    }
    if (inputOptions.edges.title!=null) {
      options.edges.title = inputOptions.edges.title
    }
    if (inputOptions.edges.attributes!=null) {
      options.edges.attributes = inputOptions.edges.attributes
    }
  }
};

const gEdges = inputJSON.edges;
const vEdges = gEdges.map(

    gEdge => {
      const vEdge = {
        // to, from and id are always the same
        id: gEdge.identity,
        to: gEdge.end,
        from: gEdge.start
      }

      // Label of edges
      if (Array.isArray(Object.byString(gEdge, options.edges.label))) {
        vEdge.label = Object.byString(gEdge, options.edges.label)[0]
      } else {
        vEdge.label = Object.byString(gEdge, options.edges.label)
      }

      // Value determining size of edge
      if (typeof(options.edges.value)==='number') {
        vEdge.value = options.edges.value
      } else {
        vEdge.value = Object.byString(gEdge, options.edges.value)
      }

      // For the title (when you hover over an edge)
      if (options.edges.title==='properties') {
        vEdge.title = ''
        for (let key in gEdge.properties) {
    			if (gEdge.properties.hasOwnProperty(key)) {
    				vEdge.title += `<strong>${key}:</strong> ${gEdge.properties[key]}<br>`;
    			}
    		}
      } else {
        vEdge.title = Object.byString(gEdge, options.edges.title)
      }

      // store the properties in vEdge
      vEdge.attributes = Object.byString(gEdge, options.edges.attributes)

      return vEdge
    }
);

const gNodes = inputJSON.nodes;
const vNodes = gNodes.map(
  gNode => {
    const vNode = {
      id: gNode.identity
    }

    // Label of nodes (could be an array if it uses Neo4j labels)
    if (Array.isArray(Object.byString(gNode, options.nodes.label))) {
      vNode.label = Object.byString(gNode, options.nodes.label)[0]
    } else {
      vNode.label = Object.byString(gNode, options.nodes.label)
    }

    if (Array.isArray(Object.byString(gNode, options.nodes.group))) {
      vNode.group = Object.byString(gNode, options.nodes.group)[0]
    } else {
      vNode.group = Object.byString(gNode, options.nodes.group)
    }

    // Value determining size of edge
    if (typeof(options.nodes.value)==='number') {
      vNode.value = options.nodes.value
    } else {
      vNode.value = Object.byString(gNode, options.nodes.value)
    }

    // For the title (when you hover over an edge)
    if (options.nodes.title==='properties') {
      vNode.title = ''
      for (let key in gNode.properties) {
        if (gNode.properties.hasOwnProperty(key)) {
          vNode.title += `<strong>${key}:</strong> ${gNode.properties[key]}<br>`;
        }
      }
    } else {
      vNode.title = Object.byString(gNode, options.nodes.title)
    }

    // store the properties in vEdge
    vNode.attributes = Object.byString(gNode, options.nodes.attributes)

    return vNode
  }
);


return { nodes: vNodes, edges: vEdges }

}

Object.byString = function(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
}
