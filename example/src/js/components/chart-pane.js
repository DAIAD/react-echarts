'use strict';

var _ = require('lodash');
var moment = require('moment');

var React = require('react');
var ReactRedux = require('react-redux');
var ReactBootstrap = require('react-bootstrap');
var {Button, Glyphicon} = ReactBootstrap;
var DatetimeInput = require('react-datetime');

var Select = require('react-controls/select-dropdown');

var PropTypes = React.PropTypes;

var actions = require('../actions');
var echarts = require('./react-echarts');

var sourceMeta = require('../source-metadata');
var Granularity = require('../granularity');

var theme = require('../theme/example');

var propTypes = { 
  source: PropTypes.oneOf(['water', 'energy']),
  granularity: PropTypes.oneOf(Granularity.names()),
  timespan: PropTypes.oneOfType([
    PropTypes.oneOf(['hour', 'day', 'week', 'month', 'quarter', 'year']),
    (props, propName, componentName) => ( 
      (PropTypes.arrayOf(PropTypes.number)(props, propName, componentName)) ||
      ((props[propName].length == 2)? 
        (null) : (new Error(propName + ' should be an array of length 2'))
      )
    ),
  ]),
};

// Presentational components

var Panel = React.createClass({
  
  statics: {
    
    defaults: {
      datetime: {
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm', 
        inputSize: 13, 
      },  
      timespan: {
        options: new Map([
          ['hour', 'This hour'],
          ['day', 'This day'],
          ['week', 'This week'],
          ['month', 'This month'],
          ['year', 'This year'],
          ['', 'Custom...'],
        ]),
      },
    },
    
    filterGranularity: function (r, name) {
      r = this.computeTimespan(r);
      var dr = r[1].valueOf() - r[0].valueOf();
      var dg = Granularity.fromName(name).valueOf();
      if (dg > dr)
        return false;
      if (dg * 1e+3 < dr)
        return false; // more than 3 orders of magnitude less
      return true;
    },
 
    computeTimespan: function (val) {
      // Compute the actual timespan as a pair of Epoch timestamps
      var t0, t1;
      if (_.isString(val)) {
        // Translate a symbolic name to a timespan
        switch (val) {
          case 'hour':
            t0 = moment().startOf('hour');
            t1 = t0.clone().add(1, 'hour');
            break;
          default:
          case 'day':
            t0 = moment().startOf('day');
            t1 = t0.clone().add(1, 'day');
            break;
          case 'week':
            t0 = moment().startOf('isoweek');
            t1 = t0.clone().add(1, 'week');
            break;
          case 'month':
            t0 = moment().startOf('month');
            t1 = t0.clone().add(1, 'month');
            break;
          case 'year':
            t0 = moment().startOf('year');
            t1 = t0.clone().add(1, 'year');
            break;
        }
      } else if (_.isArray(val)) {
        t0 = _.isNumber(val[0])? moment(val[0]) : val[0]; 
        t1 = _.isNumber(val[1])? moment(val[1]) : val[1]; 
      }
      return [t0, t1];
    },
  },
  
  propTypes: _.extend({}, propTypes, {
    /* more props */
  }),
  
  // Lifecycle

  getInitialState: function () {
    return {
      dirty: false
    };
  },

  getDefaultProps: function () {
    return {};
  },
  
  componentDidMount: function () {
    this.props.refreshData();
  },
  
  render: function ()
  {
    var cls = this.constructor;
    var defaults = this.constructor.defaults;
    
    var datetimeProps = {
      closeOnSelect: true,
      dateFormat: defaults.datetime.dateFormat,
      timeFormat: defaults.datetime.timeFormat,
      inputProps: {
        size: defaults.datetime.inputSize,
      },
    };
    
    var [t0, t1] = this.constructor.computeTimespan(this.props.timespan);
    
    _.isString(this.props.timespan) && (datetimeProps.inputProps.disabled = 'disabled');
    
    var filterGranularity = cls.filterGranularity.bind(cls, [t0, t1]);
    var granularityOptions = Granularity.names().map(v => (
      <option key={v} value={v} disabled={filterGranularity(v)? null : true}>{v}</option>
    ));

    var helpParagraph;
    if (t1 < t0) {
      helpParagraph = (
        <p className="help text-danger">The given timespan is invalid. Please, fix it.</p> 
      );
    } else if (this.state.dirty) {
      helpParagraph = (
        <p className="help text-warning">Your parameters have changed. Press <i>Refresh</i> to redraw data!</p> 
      ); 
    } else {
      helpParagraph = (
        <p className="help text-muted">Press <i>Refresh</i> to redraw data</p>
      );
    }

    return (
      <form className="form-inline chart-panel" id={'panel-' + this.props.source} >
        <div className="form-group">
          <label>Time Span:</label>
          &nbsp;
          <Select
            className='select-timespan'
            value={_.isString(this.props.timespan)? this.props.timespan : ''}
            options={defaults.timespan.options}
            onChange={(val) => (this._setTimespan(val? (val) : ([t0, t1])))} 
           />
          &nbsp;{/*&nbsp;From:&nbsp;*/}
          <DatetimeInput 
            {...datetimeProps} 
            value={t0.toDate()} 
            onChange={(val) => (this._setTimespan([val, t1]))} 
           />
          &nbsp;{/*&nbsp;To:&nbsp;*/}
          <DatetimeInput 
            {...datetimeProps} 
            value={t1.toDate()}
            onChange={(val) => (this._setTimespan([t0, val]))} 
           />
        </div>
        <div className="form-group">
          <label>Granularity:</label> 
          &nbsp;
          <Select
            className='select-granularity'
            value={this.props.granularity}
            onChange={this._setGranularity}
           >
            {granularityOptions}
          </Select> 
        </div>
        <div className="form-group">
          <Button onClick={this._refresh}><Glyphicon glyph="refresh" />&nbsp;Refresh</Button>
          &nbsp;
          <Button onClick={this._saveAsImage}><Glyphicon glyph="save"/>&nbsp;Save as image</Button>
        </div>
        {helpParagraph}
      </form>
    )
  },
  
  // Event handlers

  _setTimespan: function (val) {
    var cls = this.constructor;

    var r = _.isString(val)? val: [val[0].valueOf(), val[1].valueOf()];
    this.props.setTimespan(r);
    
    // Check if granularity needs to be re-assigned along with the timespan
    var filterGranularity = cls.filterGranularity.bind(cls, val);
    if (!filterGranularity(this.props.granularity)) {
      var g = Granularity.names().find(filterGranularity);
      if (g)
        this.props.setGranularity(g);
    }

    this.setState({dirty: true});
  },

  _setGranularity: function (val) {
    this.props.setGranularity(val);
    this.setState({dirty: true});
  },

  _refresh: function () {
    this.props.refreshData();
    this.setState({dirty: false});
    return false;
  },
  
  _saveAsImage: function () {
    return false;
  },

}); 

var Chart = React.createClass({
  
  statics: {
    defaults: {
      xAxis: {
        dateformat: {
          'minute': 'HH:MM',
          'hour': 'HH:00',
          'day': 'DD/MM/YYYY',
          'week': 'DD/MM/YYYY',
          'month': 'MM/YYYY',
          'quarter': 'Qo YYYY',
          'year': 'YYYY',
        },
      }
    },
  }, 

  propTypes: _.extend({}, propTypes, {
    series: PropTypes.array,
  }), 

  render: function ()
  {
    var defaults = this.constructor.defaults;
    var {title, unit} = sourceMeta[this.props.source];
    var xf = defaults.xAxis.dateformat[this.props.granularity];
    
    var pilot = (this.props.series || [])[0];   
    return (
       <div id={'chart-' + this.props.source}>
         <echarts.LineChart 
            width={750}
            height={340}
            //theme={theme}
            legend={true}
            xAxis={{
              numTicks: pilot? Math.min(6, pilot.data.length) : 0,
              formatter: (t) => (moment(t).format(xf)),
            }}
            yAxis={{
              name: title + ((unit)?(' (' + unit + ')') : ''),
              numTicks: 4,
              formatter: (unit)? ((y) => (y.toFixed(2) + ' ' + unit)) : null,
            }}
            series={this.props.series}
        />
      </div>
    );
  },

  // Helpers
});

// Container components

Panel = ReactRedux.connect(
  (state, ownProps) => (
    _.pick(state.stats[ownProps.source], ['granularity', 'timespan'])
  ), 
  (dispatch, ownProps) => ({
    setGranularity: (g) => (dispatch(actions.setGranularity(ownProps.source, g))),
    setTimespan: (ts) => (dispatch(actions.setTimespan(ownProps.source, ts))),
    refreshData: () => (dispatch(actions.refreshData(ownProps.source))) 
  })
)(Panel);

Chart = ReactRedux.connect(
  (state, ownProps) => (
    _.pick(state.stats[ownProps.source], ['granularity', 'timespan', 'series'])
  ),
  null
)(Chart);

// Export

module.exports = {Panel, Chart};
