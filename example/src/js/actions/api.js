'use strict';

var _ = require('lodash');
var fetch = require('fetch');
var sprintf = require('sprintf');

// A proxy for the action API exposed (under /api/action) by the server.

var defaults = {
  requestHeaders: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
};

var invokeAction = function (actionName, data, headers={}) {
  var p = fetch('/api/action/' + actionName, {
    method: 'POST',
    headers: _.extend({}, defaults.requestHeaders, headers),
    body: JSON.stringify(data)}
  );
  return p.then(
    res => (res.json()), 
    reason => {
      throw sprintf('Cannot fetch: %s', reason); // propagate this error
    }
  );
}

module.exports = {invokeAction};
