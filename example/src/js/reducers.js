var _ = global.lodash || require('lodash');

var reduceStats = function (state={}, action)
{
  var source = action.source;
  if (source == null || !state.hasOwnProperty(source))
    return state;
  
  var sourcestate1 = null;
  switch (action.type) {
    case 'REQUEST_DATA':
      sourcestate1 = _.extend({}, state[source], {
        finished: false,
        requested: action.timestamp,
        series: state.series, // keep previous data until update arrives
      });
      break;
    case 'SET_DATA':
      sourcestate1 = _.extend({}, state[source], {
        finished: action.timestamp,
        invalid: false,
        series: action.series,
      });
      break;
    case 'SET_GRANULARITY':
      sourcestate1 = _.extend({}, state[source], {
        granularity: action.name,
        invalid: (state.granularity == action.name),
      });
      break;
    case 'SET_TIMESPAN':
      sourcestate1 = _.extend({}, state[source], {
        timespan: action.timespan,
        invalid: (state.timespan == action.timespan),
      });
      break;
    default:
      break;
  }

  // Compute new state
  var state1 = state;
  if (sourcestate1 != null) {
    // The state for the selected source has changed
    state1 = _.extend({}, state, {[source]: sourcestate1});
  }

  return state1;
}

module.exports = {reduceStats}
