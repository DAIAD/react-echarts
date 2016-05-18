var mirrorToPath = require('./util/path-mirror.js');

module.exports = mirrorToPath({
  
  config: {
    utility: {
      REQUEST_CONFIGURATION: null,
      SET_CONFIGURATION: null,
    },
    reports: {
      SET_CONFIGURATION: null,
    },
  },

  reports: {
    measurements: {
      INITIALIZE: null,
      SET_SOURCE: null,
      SET_TIMESPAN: null,
      SET_POPULATION: null,
      REQUEST_DATA: null,
      SET_DATA: null,
    },

    system: {
      INITIALIZE: null, 
      REQUEST_DATA: null,
      SET_DATA: null,
    },
  },
 
});
