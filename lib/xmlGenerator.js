var config;

var builder = require('xmlbuilder');
//set up logger
var log4js = require('log4js')(); //note the need to call the function
//log4js.addAppender(log4js.fileAppender('osm-xapi.log'), 'cheese');

var log = log4js.getLogger('xmlGenerator');
// TODO how to get log level from main's config?

var XmlGenerator = function XmlGenerator() {
};// Konstruktor(Protoyp)

module.exports.XmlGenerator = XmlGenerator;

XmlGenerator.prototype.createNode = function (node) {
    log.debug(node);
    var xmlNode = builder.begin('node')
        .att('id', node.id)
        .att('lat', node.lat)
        .att('lon', node.lon);
        if (node.version){
            xmlNode.att('version', node.version);
        }
        if (node.uid){
            xmlNode.att('uid', node.uid);
        }
        if (node.user){
            xmlNode.att('user', node.user);
        }
        if (node.changesteId){
            xmlNode.att('changesetId', node.changesetId);
        }
        if (node.timestamp){
            xmlNode.att('timestamp', node.timestamp);
        }

    if(node.tags) {
        node.tags.forEach(function(tuple){
            xmlNode.ele('tag')
            .att('k',escape(tuple.key))
            .att('v',escape(tuple.value));
        });
    }
    return builder.toString();
};

// FIXME: make this shit working
XmlGenerator.prototype.createWay = function (row) {
    var xmlWay = builder.begin('way')
        .att('id', row.id);
        if (row.version){
            xmlWay.att('version', row.version);
        }
        if (row.uid){
            xmlWay.att('uid', row.uid);
        }
        if (row.user){
            xmlWay.att('user', row.user);
        }
        if (row.changesteId){
            xmlWay.att('changesetId', row.changesetId);
        }
        if (row.timestamp){
            xmlWay.att('timestamp', row.timestamp);
        }
//        row.nodes.forEach(function(node){
//            xmlWay.ele('node');
//        });
    if(row.tags) {
        row.tags.forEach(function(tuple){
            xmlWay.ele('tag')
            .att('k',escape(tuple.key))
            .att('v',escape(tuple.value));
        });
    }

    //temp = row.nodes.replace("{","").replace("}","").split(",");
    //for(var i=0;i<temp.length;i++) {
    //    way.ele('nd').att('ref',temp[i]);
    //}
    return builder.toString();
};

// new
XmlGenerator.prototype.createRelation = function (row) {
    var xmlWay = builder.begin('relation')
        .att('id', row.id);
        if (row.version){
            xmlWay.att('version', row.version);
        }
        if (row.uid){
            xmlWay.att('uid', row.uid);
        }
        if (row.user){
            xmlWay.att('user', row.user);
        }
        if (row.changesteId){
            xmlWay.att('changesetId', row.changesetId);
        }
        if (row.timestamp){
            xmlWay.att('timestamp', row.timestamp);
        }

        if(row.tags) {
            row.tags.forEach(function(tuple){
                xmlWay.ele('tag')
                .att('k',escape(tuple.key))
                .att('v',escape(tuple.value));
            });
        }
    return builder.toString();
};

//header for xml response with information about xapi instance...
XmlGenerator.prototype.createHeader = function createHeader() {
    var header = "<?xml version='1.0' standalone='no'?>";
    var tmp = builder.begin('osm')
        .att('version',this.config.version)
        .att('generator',this.config.generator)
        .att('xmlns:xapi',this.config.namespace)
        .att('xapi:uri','')
        .att('xapi:planetDate','')
        .att('xapi:copyright',this.config.copyright)
        .att('xapi:instance',this.config.instance);
    header = header + tmp.toString();
    return header.substr(0,header.length-2) + " >";

};

 // vim:set ts=4 sw=4 expandtab: