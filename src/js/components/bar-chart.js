// A convenience wrapper for bar-only charts 

var React = require('react');

var Chart = require('./cartesian-chart.js');

var BarChart = (props) => (
  <Chart
    {...props}
    series={
      props.series.map((s) => ({...s, type: 'bar'}))
    }
  />
)

module.exports = BarChart;
