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
var TimeSpan = require('../timespan');

var PropTypes = React.PropTypes;
var propTypes = { 
  field: PropTypes.oneOf(_.keys(config.reports.measurements.fields)),
  level: PropTypes.oneOf(_.keys(config.reports.measurements.levels)),
  reportName: PropTypes.string,
};

// Presentational components

var Panel = React.createClass({
  
  statics: {
    
    errors: {
      TIMESPAN_INVALID: -1,
      TIMESPAN_TOO_NARROW: -2,
      TIMESPAN_TOO_WIDE: -3,
    },
  
    defaults: {
      
      datetime: {
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm', 
        inputSize: 13, 
      },  
      
    },
    
    timespanOptions: [].concat(
      Array.from(TimeSpan.common.entries()).map(_.spread(
        (name, u) => ({value: name, text: u.title})
      )),
      [
        {value: '', text: 'Custom...'}
      ]
    ),

    checkTimespan: function (val, level, N=4) {
      var errors = this.errors;
      var [t0, t1] = this.computeTimespan(val);
      
      var dt = t1.valueOf() - t0.valueOf();
      if (dt <= 0)
        return errors.TIMESPAN_INVALID;
      
      var dl = Granularity.fromName(level).valueOf();
      if (dl >= dt)
        return errors.TIMESPAN_TOO_NARROW;
      
      if (dl * Math.pow(10, N) < dt)
        return errors.TIMESPAN_TOO_WIDE; // N orders of magnitude bigger than dl
      
      return 0;
    },
 
    computeTimespan: function (val) {
      // Convert to a pair of moment instances
      if (_.isString(val)) {
        return TimeSpan.fromName(val).toRange();
      } else if (_.isArray(val)) {
        var t0 = _.isNumber(val[0])? moment(val[0]) : val[0]; 
        var t1 = _.isNumber(val[1])? moment(val[1]) : val[1]; 
        return [t0, t1];
      }
    },
  },
  
  propTypes: _.extend({}, propTypes, {
    timespan: PropTypes.oneOfType([
      PropTypes.oneOf(TimeSpan.commonNames()),
      (props, propName, componentName) => ( 
        (PropTypes.arrayOf(PropTypes.number)(props, propName, componentName)) ||
        ((props[propName].length == 2)? null : (new Error(propName + ' should be an array of length 2')))
      ),
    ]),
    population: PropTypes.string, // Todo
  }),
  
  // Lifecycle

  getInitialState: function () {
    return {
      dirty: false,
      error: null,
      errorMessage: null,
      timespan: this.props.timespan,
    };
  },

  getDefaultProps: function () {
    return {
      timespan: 'month',
      population: null,
    };
  },
  
  componentDidMount: function () {
    this.props.initializeReport();
    this.props.refreshData();
  },
 
  componentWillReceiveProps: function (nextProps) {

    // Check if moving to another report
    if (
      (nextProps.field != this.props.field) || 
      (nextProps.level != this.props.level) ||
      (nextProps.reportName != this.props.reportName)
    ) {
      this.setState({dirty: false, error: null, errorMessage: null});
      nextProps.initializeReport();
      setTimeout(nextProps.refreshData, 100);
    }
    
    // Reset timespan
    if (nextProps.timespan != this.props.timespan) {
      this.setState({timespan: nextProps.timespan});
    }
  },

  render: function () {
    var cls = this.constructor;
    var {field, level, reportName} = this.props;
    var {timespan, dirty, error, errorMessage} = this.state;
    var [t0, t1] = cls.computeTimespan(timespan);
   
    var datetimeProps = {
      closeOnSelect: true,
      dateFormat: cls.defaults.datetime.dateFormat,
      timeFormat: cls.defaults.datetime.timeFormat,
      inputProps: {
        size: cls.defaults.datetime.inputSize,
        disabled: _.isString(timespan)? 'disabled' : null, 
      },
    };
    
    var timespanOptions = cls.timespanOptions.filter(o => (
      !o.value || cls.checkTimespan(o.value, level) >= 0
    ));

    var helpParagraph;
    if (errorMessage) {
      helpParagraph = (<p className="help text-danger">{errorMessage}</p>);
    } else if (dirty) {
      helpParagraph = (<p className="help text-info">Parameters have changed. Refresh to redraw data!</p>); 
    } else {
      helpParagraph = (<p className="help text-muted">Refresh to redraw data.</p>);
    }

    return (
      <form className="form-inline chart-panel" 
        id={['panel', field, level, reportName].join('--')} 
       >
        <div className="form-group">
          <label>Time Span:</label>
          &nbsp;
          <Select
            className='select-timespan'
            value={_.isString(timespan)? timespan : ''}
            onChange={(val) => (this._setTimespan(val? (val) : ([t0, t1])))} 
           >
            {timespanOptions.map(o => (<option value={o.value} key={o.value}>{o.text}</option>))}
          </Select>
          &nbsp;
          <DatetimeInput {...datetimeProps} 
            value={t0.toDate()} 
            onChange={(val) => (this._setTimespan([val, t1]))} 
           />
          &nbsp;
          <DatetimeInput {...datetimeProps} 
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
          <Button onClick={this._refresh} disabled={!!error}>
            <Glyphicon glyph="refresh" />&nbsp;Refresh
          </Button>
        </div>
        {helpParagraph}
      </form>
    )
  },
  
  // Helpers

  // Event handlers

  _setTimespan: function (val) {
    var cls = this.constructor;
    var errors = cls.errors;
    var error = null, errorMessage = null, ts = null;
    
    // Validate
    if (_.isString(val)) {
      // Assume a symbolic name is always valid
      ts = val;
    } else if (_.isArray(val)) {
      // Check if given timespan is a valid range 
      console.assert(val.length == 2 && val.every(t => moment.isMoment(t)), 
        'Expected a pair of moment instances');
      error = cls.checkTimespan(val, this.props.level);
      switch (error) {
        case errors.TIMESPAN_INVALID:
          errorMessage = 'The given timespan is invalid.'
          break;
        case errors.TIMESPAN_TOO_NARROW:
          errorMessage = 'The given timespan is too narrow.'
          break;
        case errors.TIMESPAN_TOO_WIDE: 
          errorMessage = 'The given timespan is too wide.'
          break;
        case 0:
        default:
          ts = [val[0].valueOf(), val[1].valueOf()];
          break;
      }
    }
    
    // Set state and decide if must setTimespan()
    if (ts != null) {
      // The input is valid
      this.props.setTimespan(ts);
    }
    this.setState({dirty: true, timespan: val, error, errorMessage});
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
    finished: PropTypes.oneOfType([PropTypes.bool, PropTypes.number])
  }), 
  
  getDefaultProps: function () {
    return {
      width: 800,
      height: 350,
      series: [],
      finished: true,
    };
  },

  render: function () {
    var cls = this.constructor;
    var _config = config.reports.measurements;
    var {field, level, reportName, series, finished} = this.props;

    var {title, unit} = _config.fields[field];
    var xf = cls.defaults.xAxis.dateformat[level]; // Fixme at consolidation level

    var pilot = _.first(series);
    return (
       <div id={['chart', field, level, reportName].join('--')}>
         <echarts.LineChart
            width={this.props.width}
            height={this.props.height}
            loading={finished? false : {text: 'Processing data...'}}
            xAxis={{
              numTicks: pilot? Math.min(6, pilot.data.length) : 0,
              formatter: (t) => (moment(t).format(xf)),
            }}
            yAxis={{
              name: title + ((unit)?(' (' + unit + ')') : ''),
              numTicks: 4,
              formatter: (unit)? ((y) => (y.toFixed(1) + ' ' + unit)) : null,
            }}
            series={(series || []).map(s => ({
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
    var key = _config.computeKey(field, level, reportName); 
    var _state = state.reports.measurements[key];
    return !_state? {} : _.pick(_state, ['timespan']);
  }, 
  (dispatch, ownProps) => {
    var {field, level, reportName} = ownProps;
    return {
      initializeReport: () => (
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
    var key = _config.computeKey(field, level, reportName); 
    var _state = state.reports.measurements[key];
    return !_state? {} : _.pick(_state, ['series', 'finished']);
  },
  null
)(Chart);

// Export

module.exports = {Panel, Chart};
