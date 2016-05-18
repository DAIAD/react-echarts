'use strict';

var _ = require('lodash');
var sprintf = require('sprintf');

var ActionTypes = require('../action-types');
var TimeSpan = require('../timespan');
var population = require('../population');
var {queryMeasurements} = require('../query');

// Define actions

var actions = {

  // Plain actions
  
  initialize: (field, level, reportName, defaults) => ({
    type: ActionTypes.reports.measurements.INITIALIZE,
    field,
    level,
    reportName,
    timespan: defaults.timespan,
    population: defaults.population,
  }),
  
  requestData: (field, level, reportName, t=null) => ({
    type: ActionTypes.reports.measurements.REQUEST_DATA,
    field,
    level,
    reportName,
    timestamp: (t || new Date()).getTime(),
  }),
  
  setData: (field, level, reportName, data, t=null) => ({
    type: ActionTypes.reports.measurements.SET_DATA,
    field,
    level,
    reportName,
    data,
    timestamp: (t || new Date()).getTime(),
  }),

  setDataError: (field, level, reportName, errors, t=null) => ({
    type: ActionTypes.reports.measurements.SET_DATA,
    field,
    level,
    reportName,
    errors,
    timestamp: (t || new Date()).getTime(),
  }),

  setTimespan: (field, level, reportName, timespan) => ({
    type: ActionTypes.reports.measurements.SET_TIMESPAN,
    field,
    level,
    reportName,
    timespan,
  }),
  
  setSource: (field, level, reportName, source) => ({
    type: ActionTypes.reports.measurements.SET_SOURCE,
    field,
    level,
    reportName,
    source,
  }),

  setPopulation: (field, level, reportName, population) => ({
    type: ActionTypes.reports.measurements.SET_POPULATION,
    field,
    level,
    reportName,
    population,
  }),

  // Complex actions: functions processed by thunk middleware
  
  refreshData: (field, level, reportName) => (dispatch, getState) => {
    var state = getState();
    
    var _state = state.reports.measurements;
    
    var {config} = state;
    var _config = config.reports.byType.measurements;
    
    var key = _state._computeKey(field, level, reportName);
    var report = _config.levels[level].reports[reportName];
    
    var {timespan, source, requested, population: target} = _state[key];

    var now = new Date();
    if (requested && (now.getTime() - requested < 1e+3)) {
      console.info('Skipping refresh requests arriving too fast...');
      return Promise.resolve();
    } 
    
    if (!target) {
      // Assume target is the entire utility
      target = new population.Utility(config.utility.key, config.utility.name);
    } else if (target instanceof population.Cluster) {
      // Expand to all groups inside target cluster
      target = config.utility.clusters
        .find(c => (c.key == target.key))
          .groups.map(g => (new population.ClusterGroup(target.key, g.key)));
    } else {
      console.assert(target instanceof population.Group, 
        'Expected an instance of population.Group');
    }
   
    var q = {
      granularity: report.queryParams.time.granularity,
      timespan: _.isString(timespan)? TimeSpan.fromName(timespan).toRange(true) : timespan,
      metrics: report.metrics,
      ranking: report.queryParams.population.ranking,
      population: _.flatten([target]),
    };
    
    dispatch(actions.requestData(field, level, reportName, now));
    
    return queryMeasurements(source, field, q, _config).then(
      (data) => (
        dispatch(actions.setData(field, level, reportName, data))
      ),
      (reason) => (
        console.error(sprintf('Cannot refresh data for %s: %s', key, reason)),
        dispatch(actions.setDataError(field, level, reportName, [reason]))
      )
    );
  },
};

module.exports = actions;
