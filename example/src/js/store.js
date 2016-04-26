var Redux = global.Redux || require('redux');
var ReduxLogger = global.reduxLogger || require('redux-logger');
var ReduxThunk = global.ReduxThunk || require('redux-thunk');

var reducers = require('./reducers');

var rootReducer = Redux.combineReducers({
  stats: reducers.reduceStats,
});

// Create and configure store

var initialState = {
  stats: {
    consumption: {
      info: {
        name: 'consumption',
        title: 'Water Consumption',
        description: 'The set of measurements on water consumption',
        unit: 'm3',
      },
      granularity: 'day',
      metric: 'avg',
      timespan: 'week',
      invalid: false,   // flag data that need to be refreshed
      finished: null,   // timestamp of last successfull update of series data
      requested: null,  // timestamp of last successfull attempt to fetch series data
      series: null,
    },
    energy: {
      info: {
        name: 'energy',
        title: 'Energy',
        description: 'The set of measurements for energy consumption',
        unit: 'kW' 
      },
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
