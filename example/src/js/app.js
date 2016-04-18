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

app.get('/api/action/stats/Temperature/daily', function (req, res) {
  // Mock daily temperature stats for 2 towns 
  var zeros = (new Array(7)).fill(.0);
  res.json({
    error: null,
    result: [
      {
        name: 'Αθήνα',
        data: zeros.map((v, i) => (
          1.8 * i + 0.2 * i * i + (Math.random() - 0.5) * 1.5 + 15.0
        )),
      },
      {
        name: 'Θεσσαλονίκη',
        data: zeros.map((v, i) => (
          1.1 * i + (Math.random() - 0.5) * 1.5 + 9.0
        )),
      }
    ],
  });
});

module.exports = app
