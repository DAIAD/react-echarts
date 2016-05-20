'use strict';

var _ = require('lodash');
var sprintf = require('sprintf');
var moment = require('moment');

var ActionTypes = require('../action-types');
var population = require('../population');
var {queryMeasurements} = require('../query');

// Define actions

var actions = {

  // Plain actions
  
  totals: {
    requestData: (t=null) => ({
      type: ActionTypes.overview.utility.totals.REQUEST_DATA,
      timestamp: (t || new Date()).getTime(),
    }),
    
    setData: (data, t=null) => ({
      type: ActionTypes.overview.utility.totals.SET_DATA,
      data,
      timestamp: (t || new Date()).getTime(),
    }),

    setDataError: (errors, t=null) => ({
      type: ActionTypes.overview.utility.totals.SET_DATA,
      errors,
      timestamp: (t || new Date()).getTime(),
    }),
  },

  // Complex actions: functions processed by thunk middleware
  
  totals: {
    refreshData: () => (dispatch, getState) => {
      var state = getState();
      
      var _state = state.overview.utility.totals;
      var {config} = state;
      var _config = config.reports.byType.measurements;

      var now = moment();
      var target = new population.Utility(config.utility.key, config.utility.name);
      
      var t1e = now.clone().startOf('day'), t1s = t1e.clone().add(-2, 'day');
      var q1 = {
        granularity: 'hour',
        timespan: [t1s.valueOf(), t1e.valueOf()],
        population: [target],
      };
      
      var t2e = now.clone().startOf('isoweek'), t2s = t2e.clone().add(-2, 'week');
      var q2 = {
        granularity: 'day',
        timespan: [t2s.valueOf(), t2e.valueOf()],
        population: [target],
      };

      dispatch(actions.totals.requestData(now.valueOf()));
      
      var p1 = queryMeasurements('meter', 'volume', q1, _config);
      var p2 = queryMeasurements('meter', 'volume', q2, _config);
      
      return Promise.all([p1, p2]).then(
        ([res1, res2]) => (
          null // Todo
        ),
        (reason) => (
          null // Todo
        )
      );
    },

  },
};

module.exports = actions;
