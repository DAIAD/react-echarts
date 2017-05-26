'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// A convenience wrapper for line-only charts 

var React = require('react');

var Chart = require('./cartesian-chart.js');

var LineChart = function LineChart(props) {
  return React.createElement(Chart, _extends({}, props, {
    series: props.series.map(function (s) {
      return _extends({}, s, { type: 'line' });
    })
  }));
};

module.exports = LineChart;