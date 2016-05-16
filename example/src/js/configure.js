'use strict';

var sprintf = require('sprintf');

var api = require('./api');

var configure = function (entityName) {
  
  return api.getConfiguration(entityName).then(
    res => {
      if (res.errors && res.errors.length) {
        throw 'The request is rejected: ' + res.errors[0].description;    
      }
      return res;
    }
  );
};

module.exports = configure;
