'use strict';

var _ = require('lodash');
var React = require('react');
var ReactRedux = require('react-redux');
var ReactBootstrap = require('react-bootstrap');
var {Button, Glyphicon, Panel, PanelGroup} = ReactBootstrap;

var PropTypes = React.PropTypes;

//
// Presentational components
//

var MeasurementValue = React.createClass({
  
  propTypes: {
    title: PropTypes.string.isRequired,
    field: PropTypes.string.isRequired,
    unit: PropTypes.string.isRequired,
    values: PropTypes.arrayOf(PropTypes.number),
    // Appearence
    borderColor: PropTypes.string,
  },

  getDefaultProps: function () {
    return {
      borderColor: '#71BAD4',
    };
  },

  render: function () {
    var {title, field, unit, values, borderColor} = this.props;
    
    var [y0, y1] = values, dy = y0 - y1;
    return (
      <div className="measurement-value" style={{borderColor: borderColor}}>
        <div className="title">{title}</div>
        <div className="current-value">
          <span className="value">{y0.toFixed(1)}</span>&nbsp;
          <span className="unit">{unit}</span>
        </div>
        <div className="delta">
          <span className={'sign' + ' ' + ((dy < 0)? 'negative' : 'non-negative')}>
            <Glyphicon glyph={(dy < 0)? 'circle-arrow-down' : 'circle-arrow-up'} />
          </span>&nbsp;
          <span className="value">{Math.abs(dy).toFixed(1)}</span>&nbsp;
          <span className="unit">{unit}</span>
        </div>
      </div>
    ); 
  } 
}); 

var Overview = React.createClass({

  statics: {
  },
  
  contextTypes: {
    config: PropTypes.object,
  },

  render: function () {
    
    var {config} = this.context;
    
    var {name: field, unit} = config.reports.byType.measurements.fields['volume'];
    
    return (
      <PanelGroup accordion defaultActiveKey="1">
        <Panel 
          header="Water Consumption - Total" 
          eventKey="1"
          id="overview-measurerments-total"
          animation={false}
          onEnter={() => (console.info('Entering panel'))}
         >
          <div className="clearfix">
            <h4>Measurements</h4>
            <MeasurementValue
              title="Day" field={field} unit={unit} values={[11.2, 12.1]} 
             />
            <MeasurementValue 
              title="Week" field={field} unit={unit} values={[80.3, 72.5]} 
             />
            <MeasurementValue
              title="Month" field={field} unit={unit} values={[300, 321]} 
             />
            <MeasurementValue
              title="Year" field={field} unit={unit} values={[1000, 1050]} 
             />
          </div>
          <div>
            <h4>Forecasts</h4>
          </div>
        </Panel>
        <Panel header="Water Consumption - Peak" eventKey="2"
          onEnter={() => (console.info('Entering panel'))} 
         >
          Todo
        </Panel>
        <Panel header="Water Consumption - Historical Comparison" eventKey="3">
          Todo
        </Panel>
      </PanelGroup>    
    );
  },

});

//
// Container components
//

module.exports = {Overview};
