var _ = global.lodash || require('lodash');

var reduceTemperatureStats = function (state={}, action)
{
  switch (action.type) {
    case 'TEMPERATURE/REQUEST_DATA':
      return _.extend({}, state, {
        finished: false,
        requested: action.timestamp,
        series: state.series, // keep previous data until update arrives
      });
      break;
    case 'TEMPERATURE/SET_DATA':
      return _.extend({}, state, {
        finished: action.timestamp,
        invalid: false,
        series: action.series,
      });
      break;
    case 'TEMPERATURE/SET_GRANULARITY':
      return _.extend({}, state, {
        granularity: action.name,
        invalid: (state.granularity == action.name),
      });
      break;
    case 'TEMPERATURE/SET_TIMESPAN':
      return _.extend({}, state, {
        timespan: action.timespan,
        invalid: (state.timespan == action.timespan),
      });
      break;
    default:
      return state;
      break;
  }
}

module.exports = {reduceTemperatureStats}
