
var reduceRoute = function (state='stats/daily', action)
{
  switch (action.type) {
    case 'CHANGE_ROUTE':
      return action.routePath;
      break;
    default:
      return state;
      break;
  }
}

var reduceTemperatureStats = function (state={_finished: null, series: []}, action)
{
  switch (action.type) {
    case 'REQUEST_TEMPERATURE_DATA':
      return {
        _finished: false,
        _requested: action.timestamp,
        series: state.series, // keep previous data snapshot
      };
      break;
    case 'SET_TEMPERATURE_DATA':
      return {
        _finished: action.timestamp,
        _requested: state._requested,
        series: action.series,
      };
      break;
    default:
      return state;
      break;
  }
}

module.exports = {reduceRoute, reduceTemperatureStats}
