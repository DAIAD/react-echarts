'use strict';

var _ = require('lodash');
var moment = require('moment');
var React = require('react');
var ReactRedux = require('react-redux');
var ReactBootstrap = require('react-bootstrap');
var {Button, Glyphicon} = ReactBootstrap;
var DatetimeInput = require('react-datetime');

var Select = require('react-controls/select-dropdown');

var echarts = require('./react-echarts');
var config = require('../config-reports');
var Granularity = require('../granularity');

var PropTypes = React.PropTypes;
var propTypes = { 
  field: PropTypes.oneOf(_.keys(config.reports.measurements.fields)),
  level: PropTypes.oneOf(_.keys(config.reports.measurements.levels)),
  reportName: PropTypes.string,
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
    
    messages: {
      INVALID_TIMESPAN: 'The given timespan is invalid. Please, fix it.',
      REFRESH_CHANGED: 'Your parameters have changed. Refresh to redraw data!',
      REFRESH: 'Refresh to redraw data',
    },
  
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
    
    filterLevel: function (r, level) {
      r = this.computeTimespan(r);
      var dr = r[1].valueOf() - r[0].valueOf();
      var dg = Granularity.fromName(level).valueOf();
      if (dg > dr)
        return false;
      if (dg * 1e+3 < dr)
        return false; // more than 3 orders of magnitude
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
    return {
      timespan: 'month',
    };
  },
  
  componentDidMount: function () {
    this.props.initialize();
    this.props.refreshData();
  },
 
  componentDidUpdate: function (prevProps) {
    // Note:
    // The following will not lead to an infinite loop since these specific
    // (injected) function props are supposed to be idemponent.
    
    // If moved to another report: reset state, initialize report and refresh data
    if (
      (prevProps.field != this.props.field) || 
      (prevProps.level != this.props.level) ||
      (prevProps.reportName != this.props.reportName)
    ) {
      this.setState({dirty: false});
      this.props.initialize();
      this.props.refreshData();
    }
  },

  render: function ()
  {
    var cls = this.constructor;
    
    var datetimeProps = {
      closeOnSelect: true,
      dateFormat: cls.defaults.datetime.dateFormat,
      timeFormat: cls.defaults.datetime.timeFormat,
      inputProps: {
        size: cls.defaults.datetime.inputSize,
      },
    };
    var {field, level, reportName} = this.props;
    var [t0, t1] = cls.computeTimespan(this.props.timespan);
    
    _.isString(this.props.timespan) && (datetimeProps.inputProps.disabled = 'disabled');

    var helpParagraph;
    if (t1 < t0) {
      helpParagraph = (<p className="help text-danger">{cls.messages.INVALID_TIMESPAN}</p>);
    } else if (this.state.dirty) {
      helpParagraph = (<p className="help text-warning">{cls.messages.REFRESH_CHANGED}</p>); 
    } else {
      helpParagraph = (<p className="help text-muted">{cls.messages.REFRESH}</p>);
    }
    
    // Todo: Filter timespan options by either level or consolidation level 

    return (
      <form 
        className="form-inline chart-panel"
        id={'panel--' + [field, level, reportName].join('-')} 
       >
        <div className="form-group">
          <label>Time Span:</label>
          &nbsp;
          <Select
            className='select-timespan'
            value={_.isString(this.props.timespan)? this.props.timespan : ''}
            options={cls.defaults.timespan.options}
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
        {/* Todo
        <div className="form-group">
          <label>Group By:</label> 
          &nbsp;
          <Select
            className='select-groupby'
            value={this.props.groupby}
            onChange={this._setPopulation}
           >
            {groupbyOptions}
          </Select> 
        </div>
        */}
        <div className="form-group">
          <Button onClick={this._refresh}><Glyphicon glyph="refresh" />&nbsp;Refresh</Button>
        </div>
        {helpParagraph}
      </form>
    )
  },
  
  // Helpers

  // Event handlers

  _setTimespan: function (val) {
    var r = _.isString(val)? val: [val[0].valueOf(), val[1].valueOf()];
    this.props.setTimespan(r);
    this.setState({dirty: true});
  },

  _refresh: function () {
    this.props.refreshData();
    this.setState({dirty: false});
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
    width: PropTypes.number,
    height: PropTypes.number,
    series: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      metric: PropTypes.oneOf(['MIN', 'MAX', 'AVERAGE', 'SUM', 'COUNT']),
      source: PropTypes.oneOf(['METER', 'DEVICE']),
      data: PropTypes.arrayOf(
        PropTypes.arrayOf(PropTypes.number)
      ),
    })),
  }), 
  
  getDefaultProps: function () {
    return {
      width: 800,
      height: 350,
      timespan: 'month',
      series: [],
    };
  },

  render: function ()
  {
    var cls = this.constructor;
    var _config = config.reports.measurements;
    var {field, level, reportName, series} = this.props;

    var {title, unit} = _config.fields[field];
    var xf = cls.defaults.xAxis.dateformat[level]; // Fixme at consolidation level
    
    var pilot = _.first(series);
    return (
       <div id={'chart--' + [field, level, reportName].join('--')}>
         <echarts.LineChart 
            width={this.props.width}
            height={this.props.height}
            xAxis={{
              numTicks: pilot? Math.min(6, pilot.data.length) : 0,
              formatter: (t) => (moment(t).format(xf)),
            }}
            yAxis={{
              name: title + ((unit)?(' (' + unit + ')') : ''),
              numTicks: 4,
              formatter: (unit)? ((y) => (y.toFixed(1) + ' ' + unit)) : null,
            }}
            series={series.map(s => ({
              name: s.metric + ' of ' + s.label,
              data: s.data,
            }))}
        />
      </div>
    );
  },

  // Helpers
});

// Container components

var actions = require('../actions/reports-measurements');

Panel = ReactRedux.connect(
  (state, ownProps) => {
    var _config = config.reports.measurements;
    var {field, level, reportName} = ownProps;
    var key = _config.getKey(field, level, reportName); 
    var _state = state.reports.measurements[key];

    return !_state? {} : {
      timespan: _state.timespan,
    };
  }, 
  (dispatch, ownProps) => {
    var {field, level, reportName} = ownProps;
    
    return {
      initialize: () => (
        dispatch(actions.initialize(field, level, reportName))),
      setTimespan: (ts) => (
        dispatch(actions.setTimespan(field, level, reportName, ts))),
      refreshData: () => (
        dispatch(actions.refreshData(field, level, reportName))), 
    };
  }
)(Panel);

Chart = ReactRedux.connect(
  (state, ownProps) => {
    var _config = config.reports.measurements;
    var {field, level, reportName} = ownProps;
    var key = _config.getKey(field, level, reportName); 
    var _state = state.reports.measurements[key];
    
    return !_state? {} : {
      timespan: _state.timespan,
      series: _state.series || [],
    };
  },
  null
)(Chart);

// Export

module.exports = {Panel, Chart};
