var assert = require('assert');
var test = require('../parse.js');
//TODO function does not exist yet
var toTest = test.urlToXpathObj;


// test all simple objects { node, way, relation }

var simpleNodeString = "/node";
var expected = { object: "node" };
assert.equal(toTest(simpleNodeString), expected);

var simpleNodeStringiTrail = "/node/";
var expected = { object: "node" };
assert.equal(toTest(simpleNodeStringTrail), expected);

var simpleWayString = "/way";
var expected = { object: "way" };
assert.equal(toTest(simpleWayString), expected);

var simpleWayStringTrail = "/way/";
var expected = { object: "way" };
assert.equal(toTest(simpleWayStringTrail), expected);

var simpleRelationString = "/relation";
var expected = { object: "relation" };
assert.equal(toTest(simpleRelationString), expected);

var simpleRelationStringTrail = "/relation/";
var expected = { object: "relation" };
assert.equal(toTest(simpleRelationStringTrail), expectedi);

// TODO invalid object eg not (node, way, relation)

var nodeWithBbox = "/node[bbox=0,51.5,0.25,51.75]";
var expected = { object: "node", bbox: {left:0, bottom:51.5, right:0.25, top:51.75} };
assert.equal(toTest(nodeWithBbox), expected);

var nodeWithSimpleTag = "/node[key=value]";
var expected = { object: "node", tag: { key:["key"], value:["value"]}}; 
assert.equals(toTest(nodeWithSimpleTag), expected);

var nodeWithTwoValues = "/node[tag=foo|bar]";
var expected = { object: "node", tag: { key:["key"], value:["foo", "bar"]}};
assert.equals(toTest(nodeWithTwoValues), expected);

var nodeWithTwoKeys = "/node[foo,bar=value]";
var expected = { object: "node", tag: { key:["foo", "bar"], value:["value"]}};
assert.equals(toTest(nodeWithTwoKeys), expected);

var tagCrossProduct = "/node[key1,key2=value1,value2]";
var expected = { object: "node", tag: {key:["key1", "key2"], value:["value1", "value2"]}};
assert.equals(toTest(tagCrossProduct), expected);

var nodeBboxTag = "/node[bbox=0,0,0,0][key=value]";
var nodeTagBbox = "/node[bbox=0,0,0,0][key=value]";
var expected = { object: "node", bbox: {left:0,bottom:0,right:0,top:0}, tag: {key:["key"], value:["value"]}};
assert.equals(toTest(nodeBboxTag), expected);
assert.equals(toTest(nodeTagBbox), expected);


