'use strict';

var _ = require('lodash');
var sprintf = require('sprintf');

var population = require('../population');
var config = require('../config-reports');
var api = require('./api');
  
var utility = new population.Utility(config.utility.name, config.utility.id); 

var queryStats = function (timespan, granularity) { 
  
  // Todo build query
  var q = {};
  
  return api.invokeAction('query-stats', q).then(
    res => (
      // Todo shape result
      null
    )
  );
};

var queryMeasurements = function (field, metrics, timespan, granularity, ranking) {
  var defaults = queryMeasurements.defaults;
  var [start, end] = timespan;
  
  // Build query
  
  var q = _.extend({}, defaults.queryParams, {
    time: {start, end, granularity},
    population: [
      utility.toJSON(),
      // Todo Allow groups (i.e. cluster groups) inside our utility.
    ],
  });
 
  if (ranking) {
    q.population = _.flatten(q.population.map(p => {
      var g = population.Group.fromString(p.label);
      return ranking.map(r => {
        var r1 = _.extend({limit: 3}, r, {field}); 
        return _.extend({}, p, {
          label: [g, new population.Ranking(r1)].join('/'),
          ranking: r1,
        });
      })
    }));
  }

  // Send query, shape result

  return api.invokeAction('query-measurements', q).then(
    res => {
      if (res.errors.length) 
        throw 'The request is rejected: ' + res.errors[0].description; 
      
      var params = {timespan, granularity}; // common for all series

      // Shape result for all sources
      var res1 = _.mapValues(
        {'METER': res.meters, 'DEVICE': res.devices}, 
        (resultSets, source) => _.flatten((resultSets || []).map(rs => {
          var [g, rr] = population.fromString(rs.label);
          console.assert((ranking && rr) || (!ranking && !rr), 'Check ranking descriptor');
          if (rr) {
            // Shape a result with ranking on users
            var points = rs.points.map(p => ({
              timestamp: p.timestamp,
              values: p.users.map(u => u[rr.field][rr.metric]).sort(rr.comparator),
            }));
            return _.times(rr.limit, (i) => ({
              ...params,
              source,
              metric: rr.metric,
              label: g.toString(),
              ranking: {...rr.toJSON(), index: i},
              data: points.map(p => ([p.timestamp, p.values[i] || null])),
            }));
          } else {   
            // Shape a normal timerseries result on metrics
            return metrics.map(metric => ({
              ...params,
              source,
              metric,
              label: g.toString(),
              data: rs.points.map(p => ([p.timestamp, p[field][metric]])),
            }));
          }
        }))
      );
      // Flatten 
      return _.flatten(_.values(res1));
    }
  );
};

queryMeasurements.defaults = {
  queryParams: {
    source: 'METER',
    metrics: ['SUM', 'COUNT', 'AVERAGE', 'MIN', 'MAX'],
  },
  
};

module.exports = {queryStats, queryMeasurements};
