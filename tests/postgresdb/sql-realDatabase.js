var fs = require('fs');
var path = require('path');
var PostgresDb = require('../../lib/postgresdb/postgresdb').PostgresDb;

var log4js = require('log4js')();
var log = log4js.getLogger('sql-realDatabase');

var async_testing = require('async_testing');
var wrap = async_testing.wrap;

var configPath = '../../etc/my-config.json';
var absConfPath = path.resolve(__dirname, configPath);
var config = JSON.parse(fs.readFileSync(absConfPath));
var connString = config.connectionString;


// for details please read `petra.osm`
// all contains nodes [1..7]
var allBbox = { left: 7, bottom: 47, right: 14, top: 54};
// bottom contains nodes [4,5,7]
var bottomBbox = { left: 7, bottom: 47, right: 14, top: 51};
// top contains node [1,2,3,6]
var topBbox = { left: 7, bottom: 51, right: 14, top: 54};
// left contains nodes [1,2,4]
var leftBbox = { left: 7, bottom: 47, right: 9.49, top: 54};
// right contains nodes [3,5,6,7]
var rightBbox = { left: 9.5, bottom: 47, right: 14, top: 54};
// empty contains nodes []
var emptyBbox = { left: -11.43, bottom: 49.81, right: 0.95, top: 59 };

var node1 = {
    id: 1,
    lat: 51.415,
    lon: 9.427,
    version: 1,
    uid: 291857,
    changeset: 123456,
    timestamp: '2011-05-26T16:47:48.000Z',  // ???
    tags: {
        key: ['amenity', 'name'],
        value: ['hospital', 'Wilhelminenspital']
        }
    }
};

var node2 = {
    id: 2,
    lat: 53.6,
    lon: 7.2,
    version: 1,
    uid: 291857,
    changeset: 123456, 
    timestamp: '2011-05-26T16:47:48.000Z',  // ???
    tags: {}
};

var node3 = {
    id: 3,
    lat: 53.875,
    lon: 13.9108,
    version: 1,
    uid: 291857,
    changeset: 123456, 
    timestamp: null,
    tags: {
        key: ['amenity', 'name'],
        value: ['hotel', 'HomeSweetHome']
    }
};

var node4 = {
    id: 4,
    lat: 47.999,
    lon: 7.8526,
    version: 1,
    uid: 291857,
    changeset: 123456, 
    timestamp: null,
    tags: {
        key: ['amenity', 'name'],
        value: ['hotel', 'WalthersTruckStop'];
    }
};

var node5 = {
    id: 5,
    lat: 49.7,
    lon: 13.4,
    version: 1,
    uid: 291857,
    changeset: 123456, 
    timestamp: null,
    tags: {
        key: ['amenity', 'name'],
        value: ['bar', 'Lucies']
    }
};

var node6 = {
    id: 6,
    lat: 53.33,
    lon: 11.52,
    version: 1,
    uid: 291857,
    changeset: 123456, 
    timestamp: null,
    tags: {
        key: ['building', 'name'],
        value: ['emblem', 'BrandenburgerTor']
    }
};

var node7 = {
    id: 7,
    lat: 48.13,
    lon: 11.7,
    version: 1,
    uid: 291857,
    changeset: 123456, 
    timestamp: null,
    tags: {
        key: ['amenity', 'name'],
        value: ['hospital', 'HeisseSchwestern']
    }
};

//Berlin - Kassel - Munich
var way1 = {
	id: 123,
	version: 3,
	uid: 291857,
	changeset: 2211,
	timestamp: null,
	nodes: [ 1,6,7 ],
	tags: {}	
};

//Norden - Waldkirchen
var way2 = {
	id: 456,
	version: 3,
	uid: 291857,
	changeset: 2211,
	timestamp: null,
	nodes: [ 2,5 ],
	tags: {}	
};

//Norden - Usedom
var way3 = {
	id: 789,
	version: 3,
	uid: 291857,
	changeset: 2211,
	timestamp: null,
	nodes: [ 2,3 ],
	tags: {
	    key: ['value'],
	    value: ['Strandweg']
	}
};

var relation1 = {
    id: 1111,
    version: 17,
    uid: 291857,
    changeset: 5334067,
    timestamp: null,
    tags: {
        key: ['note', 'type'],
        value: ['OstDeutschland', 'multipolygon']
    },
    members: {
        {type: "node", ref: 1, role: "" },
        {type: "node", ref: 6, role: "" },
        {type: "way", ref: 123 },
        {type: "way", ref: 789 }      
    }
};

var relation2 = {
    id: 1112,
    version: 17,
    uid: 291857,
    changeset: 5334067,
    timestamp: null,
    tags: {
        key: ['note', 'type'],
        value: ['WestDeutschland', 'multipolygon']
    },
    members: {
        {type: "node", ref: 2, role: "" },
        {type: "node", ref: 3, role: "" },
        {type: "node", ref: 4, role: "" },
        {type: "node", ref: 5, role: "" },
        {type: "node", ref: 7, role: "" },
        {type: "way", ref: 123 },
        {type: "way", ref: 456 },
        {type: "way", ref: 789 }
    }
}

// contains nodes [1,7]
var tagHospital = {key: ['amenity'], value: ['hospital'] };
// contains nodes [6]
var tagEmblem = {key: ['building'], value: ['emblem'] };
// contains nodes [3,4]
var tagHotel = {key: ['amenity'], value: ['hotel']};

function countNumberOfNodes(emitter, cb) {
    var count = 0;
    emitter.on('node', function() { count++; });
    emitter.on('end', function() { cb(count); });
}

function testForCount(request, count, test) {
    test.db.executeRequest(request, function(error, emitter) {
        countNumberOfNodes(emitter, function(res) {
            test.equal(count, res);
            test.finish();
        });
    });
}

function testForError(request, test) {
    test.db.executeRequest(request, function(error, emitter) {
        test.ok(error == null, "there is an error in the callback " + JSON.stringify(error)); 
        test.ok(emitter !== null, "emitter in the callback is null");
        test.finish();
    });
}

var nodesErrorSuite = {
    'nodes only': function(test) {
        var request = { object: 'node' };
        testForError(request, test);
        },
     'node and bbox': function(test) {
        var request = { object: 'node', bbox: allBbox };
        testForError(request, test);
    },
    'nodes and tag': function(test) {
        var request = { object: 'node', tag: tagHospital };
        testForError(request, test);
    },
    'node tag and bbox': function(test) {
        var request  = { object: 'node', tag: tagHospital, bbox: allBbox };
        testForError(request, test);
    },
};

var nodesCountSuite = {
   'nodes: all nodes (7 in db)': function(test) {
        var request = { object: 'node' };
        testForCount(request, 7, test);
    },
    'nodes: all nodes in a big bbox (should contain all nodes)': function(test) {
        var request = { object: 'node', bbox: allBbox };
        testForCount(request, 7, test);
    },
    'nodes: test empty bbox': function(test) {
        var request = { object: 'node', bbox: emptyBbox };
        testForCount(request, 0, test);
    },
    'nodes: all nodes with a special tag': function(test) {
        var request = { object: 'node', tag: tagHospital };
        testForCount(request, 2, test);
    },
    'nodes: all nodes with a tag and a bbox': function(test) {
        // should return id 7
        var request = {object: 'node', tag: tagHospital, bbox: bottomBbox };
        testForCount(request, 1, test);
    }
};

var relationErrorSuite = {
    'test for error while requesting all relations': function(test) {
        var request = { object: 'relation' };
        testForError(request, test);
    }
};

var wayErrorSuite = {
    'test for error while requesting all ways': function(test) {
        var request = { object: 'way' };
        testForError(request, test);
    }
};

function suiteUp(suite) {
    return wrap({
        suite: suite,
        setup: setup,
        teardown: teardown
    });
}

var setup = function(test, done) {
    test.db = new PostgresDb(connString);
    done();
};

var teardown = function(test, done) {
    test.db.end();
    done();
};

exports.nodesError = suiteUp(nodesErrorSuite);
exports.nodesCount = suiteUp(nodesCountSuite);
// exports.relationsError = suiteUp(relationErrorSuite);
exports.wayError = suiteUp(wayErrorSuite);

if (module == require.main) {
    return require('async_testing').run(__filename, process.ARGV);
}
