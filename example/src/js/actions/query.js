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
  var [start, end] = timespan;

  // Build query
  var q = {
    time: {start, end, granularity},
    population: [
      utility.toJSON(),
      // Todo Allow groups (i.e. cluster groups) inside our utility.
    ],
    source: 'METER',
    metrics: ['SUM', 'COUNT', 'AVERAGE', 'MIN', 'MAX'],
  };
 
  if (ranking) {
    console.assert(_.isArray(ranking) && ranking.length, 
      'Expected an array describing a ranking');
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
      if (res.errors.length) {
        var reason = _.first(res.errors).description;
        throw sprintf('The request is rejected: %s', reason); 
      }
      
      // Shape result for all sources
      var res1 = _.mapValues(
        {
          'METER': (res.meters || []), 
          'DEVICE': (res.devices || []),
        }, 
        (rs, source) => {
          var rs1;
          if (ranking) {
            // Todo
            rs1 = null;
          } else {
            rs1 = metrics.map(metric => (
              rs.map(r => ({
                timespan,
                granularity,
                metric,
                source,
                label: r.label,
                data: r.points.map(p => (
                  [p.timestamp, p[field][metric]]
                )),
              }))
            ));
            rs1 = _.flatten(rs1);
          }
          return rs1;
        }
      );
      
      // Flatten 
      return _.flatten(_.values(res1));
    }
  );
};

module.exports = {queryStats, queryMeasurements};
