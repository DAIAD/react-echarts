var Redux = global.Redux || require('redux');
var ReduxLogger = global.reduxLogger || require('redux-logger');
var ReduxThunk = global.ReduxThunk || require('redux-thunk');

var reducers = require('./reducers');

var rootReducer = Redux.combineReducers({
  temperature: reducers.reduceTemperatureStats,
});

// Create and configure store

var initialState = {
  temperature: {
    granularity: 'day',
    metric: 'avg',
    timespan: 'week',
    invalid: false,   // flag data that need to be refreshed
    finished: null,   // timestamp of last successfull update of series data
    requested: null,  // timestamp of last successfull attempt to fetch series data
    series: null,
  }
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
