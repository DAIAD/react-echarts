'use strict';

var _ = require('lodash');
var moment = require('moment');
var path = require('path');
var sprintf = require('sprintf');
var fetch = require('isomorphic-fetch'); 
var express = require('express');
var logger = require('morgan');
var reqparser = require('body-parser');

var makeApiProxy = function (options) {
  var {apiUrl, credentials, utility} = options;
  
  return {
    queryMeasurements: function (granularity, timespan) {
      
      // Assume timespan ia a pair of moment instances
      var [t0, t1] = timespan;

      // Build request
      
      var headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      var payload = {
        credentials,
        query: {
          time: {
            start: t0.valueOf(),
            end: t1.valueOf(),
            granularity: granularity
          },
          // This always post queries in the scope of the current utility
          // Todo: allow (sub)groups inside this utility
          population: [
            {
              "type": "UTILITY",
              "label": "UTILITY:" + utility.name,
              "utility": utility.id,
            }
          ],
          source: 'METER', // METER/DEVICE
          metrics: ["SUM", "COUNT", "MIN", "MAX", "AVERAGE"],
        }, 
      };
      
      // Send request and return a promise

      var p = fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
      });

      debugger; 
      
      return p.then(
        res => (res.json()),
        res => (undefined)
      );
    },
  }
};

var makeApp = function (appconfig) {

  var app = express();
  var docRoot = appconfig.docRoot;
  
  // Create a proxy that sends API requests to backend
  
  var apiProxy = makeApiProxy(appconfig.backend);
 
  // Define middleware

  app.use(logger('combined'));

  docRoot.forEach((p) => {
    app.use(express.static(p, {maxAge: '1d'}));
  });

  app.use(reqparser.json()); // for parsing application/json
  
  // Define routes
  
  app.get('/', function (req, res) {
    res.sendFile(path.join(docRoot[0], 'index.html'));
  });
  
  app.get('/api/action/echo', function (req, res) {
    res.json({message: (req.query.message || null)});
  });

  app.post('/api/action/echo', function (req, res) {
    res.json({message: (req.body.message || null)});
  });

  app.post('/api/action/query-stats', function (req, res) {
    res.json({errors: ['Not implemented']}); // Todo
  });
  
  app.post('/api/action/query-measurements', function (req, res) {
    var Granularity = require('./granularity.js');

    var q = _.extend({}, {granularity: 'day', timespan: 'week'}, req.body);
    
    var t0, t1, dt, granularity;

    switch (q.timespan) {
      case 'hour':
        // interpret as last hour
        t1 = moment(), t0 = t1.clone().add(-1, 'hour');
        break;
      case 'day':
        // interpret as current day
        t0 = moment().startOf('day'), t1 = t0.clone().add(1, 'day');
        break;
      case 'week':
        // interpret as current week
        t0 = moment().startOf('isoweek'), t1 = t0.clone().add(7, 'day');
        break;
      case 'month':
        // interpret as current month
        t0 = moment().startOf('month'), t1 = t0.clone().add(1, 'month');
        break;
      case 'year':
        // interpret as current year
        t0 = moment().startOf('year'), t1 = t0.clone().add(1, 'year');
        break;
      default:
        // interpret as a literal range
        t0 = moment(q.timespan[0]), t1 = moment(q.timespan[1]);
        break;
    }
    dt = t1 - t0; // millis

    granularity = Granularity.fromName(q.granularity.toLowerCase());
    if (granularity == null) {
      res.json({
        errors: [sprintf('No such granularity: %s', q.granularity)
      ]
      });
    } else if (granularity.valueOf() > dt) {
      res.json({
        errors: [
          sprintf('Too narrow timespan (%s) for given granularity (%s)',
            moment.duration(dt).humanize(), q.granularity)
        ],
      });
    } else {
      apiProxy.queryMeasurements(q.granularity, [t0, t1]).then(
        (r1) => {
          if (r1 == null) {
            res.json({
              errors: ['Unexpected error from backend'],
            });
          } else {
            res.json(r1);
          }
        }
      );
    }
  });
  
  return app;
};

module.exports = makeApp;
