var Redux = require('redux');
var ReduxLogger = require('redux-logger');
var ReduxThunk = require('redux-thunk');

var reducers = require('./reducers');

var rootReducer = Redux.combineReducers({
  stats: reducers.reduceStats,
});

// Create and configure store

var initialState = {
  stats: {
    'water': {
      granularity: 'day',
      metric: 'avg',
      timespan: 'week',
      invalid: false,   // flag data that need to be refreshed
      finished: null,   // timestamp of last successfull update of series data
      requested: null,  // timestamp of last successfull attempt to fetch series data
      series: null,
    },
    'energy': {
      granularity: 'day',
      metric: 'avg',
      timespan: 'week',
      invalid: false,
      finished: null,
      requested: null,
      series: null,
    },
  },
};

var middleware = [
  ReduxThunk.default,
  ReduxLogger(),
];

var store = Redux.createStore(
  rootReducer,
  initialState,
  Redux.applyMiddleware(...middleware));

// Export

module.exports = store;
