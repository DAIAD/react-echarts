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

var _config = config.reports.measurements;

var PropTypes = React.PropTypes;
var propTypes = { 
  field: PropTypes.oneOf(_.keys(_config.fields)),
  level: PropTypes.oneOf(_.keys(_config.levels)),
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
      legend: {
        title: _.template('<%=metric%> of <%=label%>'),
      },
      xAxis: {
        dateformat: {
          'minute': 'HH:MM',
          'hour': 'HH:00',
          'day': 'DD/MM',
          'week': '[W]W/YY', //'dd DD/MM/YYYY',
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
    finished: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    scaleXAxis: PropTypes.bool,
  }), 
  
  getDefaultProps: function () {
    return {
      width: 850,
      height: 350,
      series: [],
      finished: true,
      scaleXAxis: false,
    };
  },

  render: function () {
    var defaults = this.constructor.defaults;
    var {field, level, reportName} = this.props;
    
    var {title, unit} = _config.fields[field];
    
    var {xaxisData, series} = this._consolidateData();
    xaxisData || (xaxisData = []);
    series = (series || []).map(s => ({
      name: defaults.legend.title(s),
      symbolSize: 0,
      smooth: false,
      data: s.data,
    }));

    var xf = defaults.xAxis.dateformat[level];

    return (
       <div id={['chart', field, level, reportName].join('--')}>
         <echarts.LineChart
            width={this.props.width}
            height={this.props.height}
            loading={this.props.finished? null : {text: 'Loading data...'}}
            tooltip={false}
            xAxis={{
              data: xaxisData,
              boundaryGap: true, 
              formatter: (t) => (moment(t).format(xf)),
            }}
            yAxis={{
              name: title + (unit? (' (' + unit + ')') : ''),
              numTicks: 4,
              formatter: unit? ((y) => (y.toFixed(1) + ' ' + unit)) : null,
            }}
            series={series}
        />
      </div>
    );
  },

  // Helpers

  _consolidateData: function () {
    var result = {xaxisData: null, series: null};
    var {field, level, reportName, series, scaleXAxis} = this.props;
    
    if (!series || !series.length || series.every(s => !s.data.length))
      return result; // no data available
 
    var report = config.reports.measurements.levels[level].reports[reportName];
    var {bucket, duration} = config.levels[level];
    var [d, durationUnit] = duration;
    var d = moment.duration(d, durationUnit);

    // Use a sorted (by timestamp t) copy of series data [t,y]
    
    series = series.map(s => (_.extend({}, s, {
      data: s.data.slice(0).sort((p1, p2) => (p1[0] - p2[0])),
    })));

    // Find time span
    
    var start, end;
    if (scaleXAxis) {
      start = _.min(series.map(s => s.data[0][0]));
      end = _.max(series.map(s => s.data[s.data.length -1][0]));
    } else {
      start = _.min(series.map(s => s.timespan[0]));
      end = _.max(series.map(s => s.timespan[1]));
    }
    
    var startx = moment(start).startOf(bucket);
    var endx = moment(end).endOf(bucket);
    
    // Generate x-axis data,
    
    result.xaxisData = [];
    for (let m = startx; m < endx; m.add(d)) {
      result.xaxisData.push(m.valueOf());
    }

    // Collect points in level-wide buckets, then consolidate
    
    var groupInBuckets = (data, boundaries) => {
      // Group y values into buckets defined by x-axis boundaries:
      var N = boundaries.length;
      // For i=0..N-2 all y with (b[i] <= y < b[i+1]) fall into bucket #i ((i+1)-th)
      var by = []; // hold buckets of y values
      for (var i = 1, j = 0; i < N; i++) {
        by.push([]);
        while (j < data.length && data[j][0] < boundaries[i]) {
          by[i - 1].push(data[j][1]);
          j++;
        }
      }
      // The last (N-th) bucket will always be empty
      by.push([]);
      return by;
    };

    var cf = config.consolidateFn[report.consolidate]; 
    
    result.series = series.map(s => (
      _.extend({}, s, {
        data: groupInBuckets(s.data, result.xaxisData).map(cf),
      })
    ));
    
    return result;
  },

});

// Container components

var actions = require('../actions/reports-measurements');

Panel = ReactRedux.connect(
  (state, ownProps) => {
    var {field, level, reportName} = ownProps;
    var key = _config.computeKey(field, level, reportName); 
    var _state = state.reports.measurements[key];
    return !_state? {} : {
      timespan: _state.timespan,
    };
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
    var {field, level, reportName} = ownProps;
    var key = _config.computeKey(field, level, reportName); 
    var _state = state.reports.measurements[key];
    return !_state? {} : {
      finished: _state.finished,
      series: _state.series,
    };
  },
  null
)(Chart);

// Export

module.exports = {Panel, Chart};
