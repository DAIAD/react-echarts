var _ = require('lodash');
var moment = require('moment');
var path = require('path');
var express = require('express');
var logger = require('morgan');
var reqparser = require('body-parser');

var app = express();

var docRoot = path.join(__dirname, '..', '..', 'public', 'www');

app.use(logger('combined'));

app.use(express.static(docRoot));

app.use(reqparser.json()); // for parsing application/json

app.get('/', function (req, res) {
  res.sendFile(path.join(docRoot, 'index.html'));
});

app.get('/api/action/echo', function (req, res) {
  res.json({message: (req.query.message || null)});
});

app.post('/api/action/echo', function (req, res) {
  res.json({message: (req.body.message || null)});
});

app.post('/api/action/query-stats', function (req, res) {
  'use strict';
  var Granularity = require('./granularity.js');
  
  var q = _.extend({}, {
    source: 'consumption',
    metric: 'avg',
    granularity: 'day',
    timespan: 'week',
  }, req.body);
  
  var result, t0, t1, dt, granularity;
  
  switch (q.timespan) {
    case 'day':
      t0 = moment().startOf('day'), t1 = t0.clone().add(1, 'day');
      break;
    case 'week':
      t0 = moment().startOf('isoweek'), t1 = t0.clone().add(7, 'day');
      break;
    case 'month':
      t0 = moment().startOf('month'), t1 = t0.clone().add(1, 'month');
      break;
    case 'year':
      t0 = moment().startOf('year'), t1 = t0.clone().add(1, 'year');
      break;
    default:
      t0 = moment(q.timespan[0]), t1 = moment(q.timespan[1]);
      break;
  }
  dt = t1 - t0; // millis

  granularity = Granularity.fromName(q.granularity);
  if (granularity == null) {
    result = {
      error: 'No such granularity: ' + q.granularity
    };
  } else if (granularity.valueOf() > dt) {
    result = {
      error: 'Too narrow timespan (' + dt.humanize() + ') for given granularity (' + q.granularity + ')',
    };
  } else {
    // Slide-down t0 to a closest multiple of granularity unit
    t0 = t0.startOf(granularity.unit)
    // Slide-up t1 to the closest multiple of granularity unit
    t1 = t1.endOf(granularity.unit).add(1, 'ms');
    // Compute number of data points
    dt = t1 - t0;
    let n = Math.ceil(dt / granularity.valueOf());
    let zeros = (new Array(n)).fill(0); 
    // Generate result!
    result = {
      error: null,
      request: {
        timespan: q.timespan,
        granularity: q.granularity,
      },
      result: {
        timespan: [t0.valueOf(), t1.valueOf()],
        granularity: q.granularity,
        // Mock an API response
        series: [
          {
            name: 'Group A',
            data: zeros.map((_zero, i) => (
              [
                t0.clone().add(i * granularity.quantity, granularity.unit).valueOf(),
                1.8 * i + 0.2 * i * i + (Math.random() - 0.5) * 1.5 + 15.0,
              ]
            )),
          },
          {
            name: 'Group B', 
            data: zeros.map((_zero, i) => (
              [
                t0.clone().add(i * granularity.quantity, granularity.unit).valueOf(),
                1.21 * i + 0.15 * i * i + (Math.random() - 0.5) * 1.5 + 8.2,
              ]
            )),
          }
        ],
      },
    };
  }

  res.json(result);
});

module.exports = app
