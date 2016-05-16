'use strict';

var _ = require('lodash');

var ActionTypes = require('../action-types');

var assertInitialized = (state, key) => (
  console.assert(_.isObject(state[key]), 
    'Expected an initialized entry for report: ' + key)
);

var reduce = function (state={}, action) {
 
  var type = _.findKey(ActionTypes.reports.measurements, v => (v == action.type));
  if (!type)
    return state; // not interested

  var {field, level, reportName} = action;
  if (field == null || level == null || reportName == null)
    return state; // malformed action; dont touch state

  var key = state._computeKey(field, level, reportName);
  var r = null; // updated entry for key
  switch (type) {
    case 'INITIALIZE':
      // Initialize parameters for report (field, level, reportName)
      // See more on the meaning of each field at store.js.
      if (!(key in state)) {
        // Not initialized; make a new entry
        r = {
          source: 'meter',  // as default
          timespan: action.timespan || 'week',
          population: null, 
          series: null,
          invalid: true,
          requested: null,
          requests: 0,
          finished: null,
          errors: null,
        };
      } 
      break;
    case 'REQUEST_DATA':
      assertInitialized(state, key);
      // Keep current series data, until fresh arrive
      r = _.extend({}, state[key], {
        finished: false,
        requested: action.timestamp,
      });
      r.requests = r.requests + 1;
      break;
    case 'SET_DATA':
      assertInitialized(state, key);
      r = _.extend({}, state[key], {
        finished: action.timestamp,
        invalid: false,
        series: action.errors? null : action.data,
        errors: action.errors? action.errors : null,
      });
      break;
    case 'SET_SOURCE':
      assertInitialized(state, key);
      if (state[key].source != action.source) {
        r = _.extend({}, state[key], {
          source: action.source,
          invalid: true
        });
      } 
      break;
    case 'SET_TIMESPAN':
      assertInitialized(state, key);
      if (state[key].timespan != action.timespan) {
        r = _.extend({}, state[key], {
          timespan: action.timespan,
          invalid: true
        });
      } 
      break;
    default:
      // Unknown action; dont touch state
      break;
  }
  
  // Compute new state, if entry r is touched
  return r? _.extend({}, state, {[key]: r}) : state;
}

module.exports = reduce;
