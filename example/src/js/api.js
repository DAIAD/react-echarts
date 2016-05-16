'use strict';

var _ = require('lodash');
var fetch = require('fetch');
var sprintf = require('sprintf');

// A proxy for the action API exposed (under /api/action) by the server.

var defaults = {
  requestHeaders: {
    'Accept': 'application/json',
  },
};

var getConfiguration = function (entityName) {
  var p = fetch('/api/configuration/' + entityName, {
    headers: defaults.requestHeaders,
  });
  return p.then(
    res => (res.json()),
    reason => {
      throw sprintf(
        'Cannot fetch configuration for "%s": %s', entityName, reason);
    }
  );
};

var invokeAction = function (actionName, data, headers={}) {
  var headers = {
    ...defaults.requestHeaders,
    'Content-Type': 'application/json',
  };
  var p = fetch('/api/action/' + actionName, {
    method: 'POST',
    headers: _.extend({}, defaults.requestHeaders, headers),
    body: JSON.stringify(data)}
  );
  return p.then(
    res => (res.json()), 
    reason => {
      throw sprintf(
        'Cannot invoke action "%s": %s', actionName, reason);
    }
  );
}

module.exports = {getConfiguration, invokeAction};
