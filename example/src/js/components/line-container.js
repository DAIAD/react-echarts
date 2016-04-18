var ReactRedux = global.ReactRedux || require('react-redux');

var charts = require('./react-echarts');
var LineChart = charts.LineChart;

const mapStateToProps = (state, ownProps) => ({
  series: state.temperature.series,
});

const mapDispatchToProps = null;

module.exports = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(LineChart);
