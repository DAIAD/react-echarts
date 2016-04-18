
var actions = {

  // Plain actions

  updateRoute: (path) => ({
    type: 'CHANGE_ROUTE',
    routePath: path || window.location.hash.substr(1),
  }),
  
  requestTemperatureData: (t) => ({
    type: 'REQUEST_TEMPERATURE_DATA',
    timestamp: t.getTime(),
  }),
  
  setTemperatureData: (series, t) => ({
    type: 'SET_TEMPERATURE_DATA',
    timestamp: t.getTime(), 
    series: series,
  }),

  // Complex actions: functions processed by thunk middleware
  
  refreshTemperatureData: () => (dispatch, getState) => {
    dispatch(actions.requestTemperatureData(new Date()));
    fetch('/api/action/stats/Temperature/daily')
      .then(res => res.json())
      .then(res => {
        if (!res.err) {
          dispatch(actions.setTemperatureData(res.result, new Date()));
        } else {
          // do something on a failed api request
        }
      })
  },
};

module.exports = actions;
