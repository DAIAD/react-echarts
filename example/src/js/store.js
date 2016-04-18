var Redux = global.Redux || require('redux');
var ReduxLogger = global.reduxLogger || require('redux-logger');
var ReduxThunk = global.ReduxThunk || require('redux-thunk');

var reducers = require('./reducers');

var rootReducer = Redux.combineReducers({
  route: reducers.reduceRoute,
  temperature: reducers.reduceTemperatureStats,
});

// Create and configure store

var initialState = {};

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
