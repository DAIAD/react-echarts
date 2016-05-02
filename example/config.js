// Load the raw JSON configuration, tranform it and export it

var path = require('path');

var config = require('./config.json');

var appconfig = config.app;

// Resolve every path as local, normalize as absolute
appconfig.docRoot = appconfig.docRoot.map(p => path.resolve(__dirname, p));

module.exports = config
