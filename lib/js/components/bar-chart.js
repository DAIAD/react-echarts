'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// A convenience wrapper for bar-only charts 

var React = require('react');

var Chart = require('./cartesian-chart.js');

var BarChart = function BarChart(props) {
  return React.createElement(Chart, _extends({}, props, {
    series: props.series.map(function (s) {
      return _extends({}, s, { type: 'bar' });
    })
  }));
};

module.exports = BarChart;