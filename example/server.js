var config = require('./config');
var app = require('./src/js/app')(config.app);

app.listen(config.server.port, config.server.address, () => {
  console.info(
    'Listening to ' + config.server.address + ':' + config.server.port);
})

