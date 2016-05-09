'use strict';

var Granularity = require('../granularity');
var api = require('./api');

// Define actions

var actions = {
  
  // Constants

  PREFIX: 'SYSTEM',

  // Plain actions
  
  initialize: (level, reportName) => ({
    type: actions.PREFIX + '/' + 'INITIALIZE',
    level,
    reportName,
  }),
 
  requestData: (level, reportName, t=null) => ({
    type: actions.PREFIX + '/' + 'REQUEST_DATA',
    level,
    reportName,
    timestamp: (t || new Date()).getTime(),
  }),
  
  setData: (level, reportName, data, t=null) => ({
    type: actions.PREFIX + '/' + 'SET_DATA',
    level,
    reportName,
    data,
    timestamp: (t || new Date()).getTime(), 
  }),
  
  setTimespan: (level, reportName, timespan) => ({
    type: actions.PREFIX + '/' + 'SET_TIMESPAN',
    level,
    reportName,
    timespan: timespan,
  }),

  // Complex actions: functions processed by thunk middleware
  
  refreshData: (level, reportName) => (dispatch, getState) => {
    var state = getState();
    
    var _config = config.reports.system;
    var report = _config.levels[level].reports[reportName];
    var key = _config.computeKey(level, reportName);
    var _state = state.reports.system[key];

    dispatch(actions.requestData(level, reportName, new Date()));
    
    // Todo

    api.queryStats({
      timespan: _state.timespan,
    }).then(res => {
      if (!res.error) {
        dispatch(actions.setData(level, reportName, res.result.series, new Date()));
      } else {
        // Do something on a failed api request
      }
    })
  },
};

module.exports = actions;
