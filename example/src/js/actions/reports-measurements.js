'use strict';

var _ = require('lodash');
var sprintf = require('sprintf');

var config = require('../config-reports');
var TimeSpan = require('../timespan');
var {queryStats, queryMeasurements} = require('./query');

var _config = config.reports.measurements;

// Define actions

var actions = {

  // Constants

  PREFIX: 'MEASUREMENTS',

  // Plain actions
  
  initialize: (field, level, reportName) => ({
    type: actions.PREFIX + '/' + 'INITIALIZE',
    field,
    level,
    reportName,
  }),
  
  requestData: (field, level, reportName, t=null) => ({
    type: actions.PREFIX + '/' + 'REQUEST_DATA',
    field,
    level,
    reportName,
    timestamp: (t || new Date()).getTime(),
  }),
  
  setData: (field, level, reportName, data, t=null) => ({
    type: actions.PREFIX + '/' + 'SET_DATA',
    field,
    level,
    reportName,
    data,
    timestamp: (t || new Date()).getTime(),
  }),
  
  setTimespan: (field, level, reportName, timespan) => ({
    type: actions.PREFIX + '/' + 'SET_TIMESPAN',
    field,
    level,
    reportName,
    timespan: timespan,
  }),

  // Complex actions: functions processed by thunk middleware
  
  refreshData: (field, level, reportName) => (dispatch, getState) => {
    var state = getState();
    var report = _config.levels[level].reports[reportName];
    var key = _config.computeKey(field, level, reportName);
    var _state = state.reports.measurements[key];
    
    var requestedAt = new Date();
    if (_state.requested && (requestedAt.getTime() - _state.requested < 1e+3)) {
      console.info('Skipping refresh requests arriving too fast...');
      return;
    } 

    dispatch(actions.requestData(field, level, reportName, requestedAt));
    
    var granularity = report.queryParams.time.granularity;
    var timespan = _.isString(_state.timespan)? 
      TimeSpan.fromName(_state.timespan).toRange(true) : _state.timespan;
    var metrics = report.metrics;
    var rank = report.queryParams.population.ranking;

    queryMeasurements(field, metrics, timespan, granularity, rank).then(
      (data) => {
        if (data) {
          var receivedAt = new Date();
          dispatch(actions.setData(field, level, reportName, data, receivedAt));
        }
      },
      (reason) => {
        console.error(sprintf(
          'Cannot refresh data for report %s: %s', key, reason
        ));
      }
    );
  },
};

module.exports = actions;
