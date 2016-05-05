var _ = require('lodash');
var fetch = require('fetch');

var config = require('./config-reports');

// A proxy for the action API exposed (under /api/action) by the server.
// Note that *all* functions return promises.

var defaults = {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
};

var invokeAction = function (actionName, data, headers={})
{
  var p = fetch('/api/action/' + actionName, {
    method: 'POST',
    headers: _.extend({}, defaults.headers, headers),
    body: JSON.stringify(data)}
  );
  return p.then(res => res.json(), res => (undefined));
}

var api = {
  
  queryStats: function (q={})
  { 
    return invokeAction('query-stats', q);
  },
  
  queryMeasurements: function (q={})
  { 
    return invokeAction('query-measurements', q);
  },
};

module.exports = api;
