'use strict';

var _ = require('lodash');

var config = require('../config-reports');
var api = require('../api-client');

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
    
    var _config = config.reports.measurements.levels[level].reports[reportName];
    var key = config.reports.measurements.getKey(field, level, reportName);
    var _state = state.reports.measurements[key];
    
    var requestedAt = new Date();
    if (_state.requested && (requestedAt.getTime() - _state.requested < 1e+3)) {
      console.info('Skipping refresh requests arriving too fast...');
      return;
    }

    dispatch(actions.requestData(field, level, reportName, requestedAt));
    
    api.queryMeasurements({
      granularity: _config.queryParams.time.granularity,
      metrics: _config.queryParams.metrics,
      timespan: _state.timespan,
    }).then(res => {
      var receivedAt = new Date();
      if (!res.errors.length) {
        var data = _.flatten(_.zip(['METER', 'DEVICE'], [res.meters, res.devices]).map(u => {
          var [source, rs] = u, metrics = _config.metrics;
          return !rs? [] : _.flatten(metrics.map(metric => (
            rs.map(r => ({
              metric,
              source,
              label: r.label,
              data: r.points.map(p => ([p.timestamp, p[field][metric]]))
            }))
          )));
        }));
        dispatch(actions.setData(field, level, reportName, data, receivedAt));
      } else {
        console.error('Failed to refresh data for ' + key + ':', res.errors);
      }
    })
  },
};

module.exports = actions;
