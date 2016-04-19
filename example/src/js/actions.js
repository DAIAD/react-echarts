
var api = require('./api-client/action.js');

// Define actions

var actions = {

  // Plain actions
  
  requestTemperatureData: (t) => ({
    type: 'TEMPERATURE/REQUEST_DATA',
    timestamp: t.getTime(),
  }),
  
  setTemperatureData: (series, t) => ({
    type: 'TEMPERATURE/SET_DATA',
    timestamp: t.getTime(), 
    series: series,
  }),
  
  setTemperatureGranularity: (name) => ({
    type: 'TEMPERATURE/SET_GRANULARITY',
    name: name,
  }),
  
  setTemperatureTimespan: (timespan) => ({
    type: 'TEMPERATURE/SET_TIMESPAN',
    timespan: timespan,
  }),

  // Complex actions: functions processed by thunk middleware
  
  refreshTemperatureData: () => (dispatch, getState) => {
    var state = getState();
    dispatch(actions.requestTemperatureData(new Date()));
    api.queryStats({
      source: 'temperature',
      metric: state.temperature.metric,
      granularity: state.temperature.granularity,
      timespan: state.temperature.timespan,
    }).then(res => {
      if (!res.error) {
        dispatch(actions.setTemperatureData(res.result.series, new Date()));
      } else {
        // do something on a failed api request
      }
    })
  },
};

module.exports = actions;
