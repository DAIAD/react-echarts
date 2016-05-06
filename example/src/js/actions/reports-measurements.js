'use strict';

var _ = require('lodash');

var config = require('../config-reports');
var api = require('../api-client');
var TimeSpan = require('../timespan');

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
    
    var _config = config.reports.measurements;
    var report = _config.levels[level].reports[reportName];
    var key = _config.computeKey(field, level, reportName);
    var _state = state.reports.measurements[key];
    
    var requestedAt = new Date();
    if (_state.requested && (requestedAt.getTime() - _state.requested < 1e+3)) {
      console.info('Skipping refresh requests arriving too fast...');
      return;
    } else {
      console.info('About to refresh data for report ' + key);
    }

    dispatch(actions.requestData(field, level, reportName, requestedAt));
    
    var granularity = report.queryParams.time.granularity;
    var timespan = _.isString(_state.timespan)? 
      TimeSpan.fromName(_state.timespan).toRange(true) : _state.timespan;
    
    api.queryMeasurements({timespan, granularity}).then(res => {
      var receivedAt = new Date();
      if (!res.errors.length) {
        var data = _.flatten(_.zip(['METER', 'DEVICE'], [res.meters, res.devices]).map(
          _.spread((source, rs) => (
            !rs? [] : _.flatten(report.metrics.map(metric => (
              rs.map(r => ({
                granularity,
                metric,
                source,
                label: r.label,
                data: r.points.map(p => ([p.timestamp, p[field][metric]]))
              }))
            ))))
          )
        ));
        dispatch(actions.setData(field, level, reportName, data, receivedAt));
      } else {
        console.error('Failed to refresh data for ' + key + ':', res.errors);
      }
    });
  },
};

module.exports = actions;
