'use strict';

var _ = require('lodash');

var config = require('../config-reports').reports.measurements;

var actions = require('../actions/reports-measurements');

var assertInitialized = (r, key) => (
  console.assert(_.isObject(r), 'Expected an initialized entry for report: ' + key)
);

var reduce = function (state={}, action) {

  var type = action.type.split('/');
  if (type.length < 2 || type[0] != actions.PREFIX)
    return state; // not interested in this action

  var {field, level, reportName} = action;
  if (field == null || level == null || reportName == null)
    return state; // malformed action; dont touch state

  var r = null, key = config.computeKey(field, level, reportName);
  if (key in state) {
    // Clone existing state for (field, level, reportName)
    r = _.extend({}, state[key]);
  } 
  
  switch (type[1]) {
    case 'INITIALIZE':
      // Initialize parameters for report (field, level, reportName)
      // See more on the meaning of each field at store.js.
      if (r == null) {
        r = { // new entry
          source: 'meter',  // as default
          timespan: config.levels[level].reports[reportName].timespan,  // as default
          population: null, 
          series: null,
          invalid: true,
          requested: null,
          requests: 0,
          finished: null,
          errors: null,
        };
      } else {
        r = null; // already initialized; dont touch state
      }
      break;
    case 'REQUEST_DATA':
      assertInitialized(r, key);
      // Keep current series data, until fresh arrive
      _.extend(r, {
        finished: false,
        requested: action.timestamp,
        requests: r.requests + 1,
      });
      break;
    case 'SET_DATA':
      assertInitialized(r, key);
      _.extend(r, {
        finished: action.timestamp,
        invalid: false,
        series: action.data,
        errors: null,
      });
      break;
    case 'SET_ERROR':
      assertInitialized(r, key);
      _.extend(r, {
        finished: action.timestamp,
        invalid: false,
        series: null,
        errors: action.errors,
      });
      break;
    case 'SET_SOURCE':
      assertInitialized(r, key);
      if (r.source != action.source) {
       _.extend(r, {source: action.source, invalid: true});
      } else {
        r = null;
      }
      break;
    case 'SET_TIMESPAN':
      assertInitialized(r, key);
      if (r.timespan != action.timespan) {
        _.extend(r, {timespan: action.timespan, invalid: true});
      } else {
        r = null; // unchanged; dont touch state
      }
      break;
    default:
      r = null; // unknown action; dont touch state
      break;
  }
  
  // Compute new state, if r is touched
  return r? _.extend({}, state, {[key]: r}) : state;
}

module.exports = reduce;
