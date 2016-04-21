
var api = require('./api-client/action.js');

// Define actions

var actions = {

  // Plain actions
  
  requestData: (source, t=null) => ({
    type: 'REQUEST_DATA',
    source: source, 
    timestamp: (t || new Date()).getTime(),
  }),
  
  setData: (source, series, t=null) => ({
    type: 'SET_DATA',
    source: source,
    timestamp: (t || new Date()).getTime(), 
    series: series,
  }),
  
  setGranularity: (source, name) => ({
    type: 'SET_GRANULARITY',
    source: source,
    name: name,
  }),
  
  setTimespan: (source, timespan) => ({
    type: 'SET_TIMESPAN',
    source: source,
    timespan: timespan,
  }),

  // Complex actions: functions processed by thunk middleware
  
  refreshData: (source) => (dispatch, getState) => {
    var state = getState();
    dispatch(actions.requestData(source, new Date()));
    api.queryStats({
      source: source,
      metric: state.temperature.metric,
      granularity: state.temperature.granularity,
      timespan: state.temperature.timespan,
    }).then(res => {
      if (!res.error) {
        dispatch(actions.setData(source, res.result.series, new Date()));
      } else {
        // do something on a failed api request
      }
    })
  },
};

module.exports = actions;
