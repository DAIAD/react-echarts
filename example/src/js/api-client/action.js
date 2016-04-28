var _ = global.lodash || require('lodash');

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
    // Todo Move somewhere else, e.g. to state
    const sources = [
      'water', 'energy'
    ];
    
    q = _.extend({}, {
      metric: 'avg',
      granularity: 'day',
      time: 'week',
    }, q);
    
    // Check if q is sane

    if (q.source == null || sources.indexOf(q.source) < 0)
      return Promise.reject('Unknown source: ' + q.source);
    
    // Post!
    return invokeAction('query-stats', q);
  }
};

module.exports = api;
