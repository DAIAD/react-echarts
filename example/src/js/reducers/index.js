var Redux = require('redux');

module.exports = Redux.combineReducers({
  reports: require('./reports'),
});

