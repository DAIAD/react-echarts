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
    temperature: {
      info: {
        name: 'temperature',
        title: 'Temperature',
        description: 'The set of measurements on temperature',
        unit: '°C',
      },
      granularity: 'day',
      metric: 'avg',
      timespan: 'week',
      invalid: false,   // flag data that need to be refreshed
      finished: null,   // timestamp of last successfull update of series data
      requested: null,  // timestamp of last successfull attempt to fetch series data
      series: null,
    },
    humidity: {
      info: {
        name: 'humidity',
        title: 'Humidity',
        description: 'The set of measurements for relative humidity',
        unit: null, // unit-less 
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
