'use strict';

var _ = require('lodash');
var sprintf = require('sprintf');

var population = require('../population');
var config = require('../config-reports');
var Granularity = require('../granularity'); 
var api = require('./api');
  
var utility = new population.Utility(config.utility.name, config.utility.id); 

var queryStats = function (source, q={}) { 
  
  // Todo Build query to target Action API
  var q1 = {};
  
  return api.invokeAction('query-stats', q1).then(
    res => (
      // Todo shape result
      null
    )
  );
};

var queryMeasurements = function (source, field, q={}) {
  var defaults = queryMeasurements.defaults;
   
  // Validate parameters

  q = queryMeasurements.validate(q);

  // Build query to target Action API
  // Todo Allow groups (i.e. cluster groups) inside our utility.
  
  var q1 = {
    ...defaults.api.queryParams ,
    source,
    time: {
      start: q.timespan[0], 
      end: q.timespan[1], 
      granularity: q.granularity,
    },
    population: [
      utility.toJSON(),
    ],
  };
 
  if (q.ranking) {
    q1.population = _.flatten(q1.population.map(p => {
      var g = population.Group.fromString(p.label);
      return q.ranking.map(r => {
        var r1 = {limit: 3, type: 'TOP', ...r, field}; 
        return {...p, 
          label: [g, new population.Ranking(r1)].join('/'),
          ranking: r1,
        };
      })
    }));
  }

  // Send query, shape result

  return api.invokeAction('query-measurements', q1).then(
    res => {
      if (res.errors.length) 
        throw 'The request is rejected: ' + res.errors[0].description; 
      
      // Include common params for all series
      var params = {source, timespan: q.timespan, granularity: q.granularity}; 

      // Shape result
      var resultSets = (source == 'DEVICE')? res.devices : res.meters;
      var res1 = (resultSets || []).map(rs => {
        var [g, rr] = population.fromString(rs.label);
        console.assert((q.ranking && rr) || (!q.ranking && !rr), 
          'Check ranking descriptor');
        if (rr) {
          // Shape a result with ranking on users
          var points = rs.points.map(p => ({
            timestamp: p.timestamp,
            values: p.users.map(u => u[rr.field][rr.metric]).sort(rr.comparator),
          }));
          return _.times(rr.limit, (i) => ({
            ...params,
            metric: rr.metric,
            label: g.toString(),
            ranking: {...rr.toJSON(), index: i},
            data: points.map(p => ([p.timestamp, p.values[i] || null])),
          }));
        } else {   
          // Shape a normal timerseries result for requested metrics
          return q.metrics.map(metric => ({
            ...params,
            metric,
            label: g.toString(),
            data: rs.points.map(p => ([p.timestamp, p[field][metric]])),
          }));
        }
      });
      return _.flatten(res1);
    }
  );
};

queryMeasurements.defaults = {
  api: {
    queryParams: {
      metrics: ['SUM', 'COUNT', 'AVERAGE', 'MIN', 'MAX'],
    },
  },
};

queryMeasurements.validators = {
  granularity: (granularity, q) => (
    Granularity.fromName(granularity.toLowerCase())?
      null : (new Error('Unknown granularity'))
  ),
  timespan: ([t0, t1], q) => ( 
    (_.isNumber(t0) && _.isNumber(t1))?
      null : (new Error('Cannot read timespan'))
  ),
  metrics: (metrics, q) => {
    if (q.ranking) {
      return null; // a metric is n/a when a ranking is requested
    }
    if (!metrics || !_.isArray(metrics) || !metrics.length) {
      return new Error('A metric must be specified');
    }
    var metric1 = metrics.find(m => (config.metrics.indexOf(m) < 0));
    return !metric1? null : (new Error(sprintf('Unknown metric (%s)', metric1)));
  },
  ranking: (ranking, q) => (
    (!ranking || (_.isArray(ranking) && 
        ranking.every(r => (r.type && (config.metrics.indexOf(r.metric || '') >= 0)))
      )
    )? null : (new Error('Expected a ranking as an array of {type, metric}'))
  ),
  population: (p, q) => (null),
};

queryMeasurements.validate = function (q) {
  
  var err = null;
  _.forEach(queryMeasurements.validators, (validator, paramName) => (
    err = validator.call(undefined, q[paramName], q),
    err && console.error(err.message, q[paramName]),
    !err // break on error
  ));
  
  if (err) {
    throw err;
  }

  return q;
};

module.exports = {queryStats, queryMeasurements};
