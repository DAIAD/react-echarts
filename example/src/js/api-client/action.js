var _ = require('lodash');
var fetch = require('fetch');

var sourceMeta = require('../source-metadata');

const sourceNames = _.keys(sourceMeta);

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
    q = _.extend({}, {
      metric: 'avg',
      granularity: 'day',
      time: 'week',
    }, q);
    
    // Check if q is sane

    if (q.source == null || sourceNames.indexOf(q.source) < 0)
      return Promise.reject('Unknown source: ' + q.source);
    
    // Post!
    return invokeAction('query-stats', q);
  }
};

module.exports = api;
