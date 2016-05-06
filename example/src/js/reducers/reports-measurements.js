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
      if (r == null) {
        r = { // new entry
          timespan: config.levels[level].reports[reportName].timespan,  // as default
          population: null, // target population (Todo)
          series: null,     // collection of data points
          invalid: true,    // data that needs to be refreshed?
          requested: null,  // time of last successfull attempt to fetch series
          finished: null,   // time of last successfull update of series
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
      });
      break;
    case 'SET_DATA':
      assertInitialized(r, key);
      _.extend(r, {
        finished: action.timestamp,
        invalid: false,
        series: action.data, // Todo: re-shape result?
      });
      break;
    case 'SET_TIMESPAN':
      assertInitialized(r, key);
      if (r.timespan != action.timespan) {
        _.extend(r, {
          timespan: action.timespan,
          invalid: true,
        });
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
