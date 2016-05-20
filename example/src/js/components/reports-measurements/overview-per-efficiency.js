'use strict';

var _ = require('lodash');
var React = require('react');
var ReactRedux = require('react-redux');

var reports = require('../../reports');
var echarts = require('../react-echarts');
var MeasurementValue = require('../measurement-value');

var PropTypes = React.PropTypes;
var {seriesPropType, timespanPropType} = require('../../prop-types');
var reportPropType = PropTypes.shape({
  level: PropTypes.string,
  name: PropTypes.string,
  series: seriesPropType,
  timespan: timespanPropType,
});    

var {computeKey} = reports.measurements;

const FIELD = 'volume';

const REPORT_KEY = 'overview-per-efficiency';

//
// Presentational component
//

var GroupPerEfficiencyView = React.createClass({
  
  propTypes: {},
  
  contextTypes: {config: PropTypes.object},

  componentDidMount: function () {
    console.info('GroupPerEfficiencyView mounted')
  },

  render: function () {
    
    var {config} = this.context;
    var {unit} = config.reports.byType.measurements.fields[FIELD];
    
    // Todo

    return (
      <div>Hello per-efficiency view!</div>
    );
  },

});

//
// Container component
//

var actions = require('../../actions/reports-measurements');

// Todo

// Export

module.exports = GroupPerEfficiencyView;
