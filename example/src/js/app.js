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

module.exports = app
