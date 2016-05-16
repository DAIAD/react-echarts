var path = require('path');

// Load the raw JSON configuration and transform it

var config = require('./config/service.json');

// Resolve every path as local, normalize as absolute

config.docRoot = config.docRoot.map(p => path.resolve(__dirname, p));

// Load app

var app = require('./app')(config);

// Serve

app.listen(config.server.port, config.server.address, () => {
  console.info(
    'Listening to ' + config.server.address + ':' + config.server.port);
});

