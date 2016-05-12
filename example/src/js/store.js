var Redux = require('redux');
var ReduxLogger = require('redux-logger');
var ReduxThunk = require('redux-thunk');

var config = require('./config-reports');

// Create and configure store

var initialState = {
  reports: {
    measurements: {
      // "<field>/<level>/<reportName>": {
      //   timespan,
      //   source,     // source of measurements, i.e 'meter' or 'device'
      //   population, // target population
      //   series,     // collection of data points
      //   invalid,    // flag data that need to be refreshed
      //   requested,  // timestamp of last attempt to fetch series data
      //   requests,   // the number of requests, so far
      //   finished,   // timestamp of last fullfilled (successfull/failed) attempt, or false if pending
      //   errors,     // errors during last attempt to fetch series data
      // }
    },
    system: {
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
