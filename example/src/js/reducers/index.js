var Redux = require('redux');

module.exports = Redux.combineReducers({
  config: require('./config'),
  reports: require('./reports'),
});

