var Redux = require('redux');
var ReduxLogger = require('redux-logger');
var ReduxThunk = require('redux-thunk');

// Create and configure store

var initialState = {
  config: {
    utility: {},
    reports: {},
  },
  reports: {
    measurements: {
      _computeKey: (field, level, reportName) => ([field, level, reportName].join('/')),
      // "<field>/<level>/<reportName>": {
      //   timespan,
      //   source,     // source of measurements, i.e 'meter' or 'device'
      //   population, // target (instance of population.Group or population.Cluster)
      //   series,     // collection of data points
      //   invalid,    // flag data that need to be refreshed
      //   requested,  // timestamp of last attempt to fetch series data
      //   requests,   // the number of requests, so far
      //   finished,   // timestamp of last fullfilled (successfull/failed) attempt, or false if pending
      //   errors,     // errors during last attempt to fetch series data
      // }
    },
    system: {
      _computeKey: (level, reportName) => ([level, reportName].join('/')),
      // "<level>/<reportName>": {
      //   source,
      //   timespan,
      //   series,
      //   invalid,
      //   requested,
      //   requests,
      //   finished,
      //   errors,
      // }
    },
  }
};

var middleware = [
  ReduxThunk.default,
  ReduxLogger(),
];

var rootReducer = require('./reducers/index');

var store = Redux.createStore(
  rootReducer,
  initialState,
  Redux.applyMiddleware(...middleware));

// Export

module.exports = store;
