// A convenience wrapper for line-only charts 

var React = require('react');

var Chart = require('./cartesian-chart.js');

var LineChart = (props) => (
  <Chart
    {...props}
    series={
      props.series.map((s) => ({...s, type: 'line'}))
    }
  />
)

module.exports = LineChart;
