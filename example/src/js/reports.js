'use strict';

var _ = require('lodash');

var reports = {
  
  measurements: {
    computeKey: function (field, level, reportName, key) {
      var kp = [field, level, reportName];
      if (_.isArray(key))
        kp.push(...key);
      else
        kp.push(key);
      return kp.join('/');
    },
  },
  
  system: {
    computeKey: function (level, reportName) {
      return [level, reportName].join('/');
    },
  },
};

module.exports = reports;
