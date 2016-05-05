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
      //   population, // target population
      //   series,     // collection of data points
      //   invalid,    // flag data that need to be refreshed
      //   requested,  // timestamp of last successfull attempt to fetch series data
      //   finished    // timestamp of last successfull update of series data 
      // }
    },
    system: {
      // "<level>/<reportName>": {
      //   timespan,
      //   series,
      //   invalid,
      //   requested,
      //   finished
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
