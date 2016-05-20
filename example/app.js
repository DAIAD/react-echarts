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
  var {apiUrl, credentials, timezone, utility} = options;
  
  return {
    queryMeasurements: function (query) {
      
      var p = fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({credentials, timezone, query}),
      });
      
      return p.then(res => (res.json()), res => (undefined));
    },
  }
};

var makeApp = function (config) {

  var app = express();
  var docRoot = config.docRoot;
  
  // Create a proxy that forwards API requests to backend
  
  var apiProxy = makeApiProxy(config.backend);
 
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
  
  app.get('/api/configuration/utility', function (req, res) {
    // In reality, this would be retreived from the database
    var utility = require('./config/utility.json');
    res.json({errors: null, utility});
  });
  
  app.post('/api/action/query-stats', function (req, res) {
    res.json({errors: ['Not implemented']}); // Todo
  });
  
  app.get('/api/action/echo', function (req, res) {
    res.json({message: (req.query.message || null)});
  });

  app.post('/api/action/echo', function (req, res) {
    res.json({message: (req.body.message || null)});
  });
 
  app.post('/api/action/query-measurements', function (req, res) {
    var Granularity = require('./src/js/granularity.js');

    var q = req.body;
    var t0 = q.time.start, t1 = q.time.end, dt = t1 - t0; 

    var granularity = Granularity.fromName(q.time.granularity.toLowerCase());
    if (granularity == null) {
      res.json({
        errors: [sprintf('No such granularity: %s', q.time.granularity)
      ]
      });
    } else if (granularity.valueOf() > dt) {
      res.json({
        errors: [
          sprintf('Too narrow timespan (%s) for given granularity (%s)',
            moment.duration(dt).humanize(), q.time.granularity)
        ],
      });
    } else {
      apiProxy.queryMeasurements(q).then(
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
