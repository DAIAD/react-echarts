var _ = global.lodash || require('lodash');

var React = global.React || require('react');
var ReactRedux = global.ReactRedux || require('react-redux');
var ReactBootstrap = global.ReactBootstrap || require('react-bootstrap');
var {Button, Glyphicon} = ReactBootstrap;
var DatetimeInput = global.ReactDatetime || require('react-datetime');
var Select = require('react-controls/select-dropdown');

var PropTypes = React.PropTypes;

var actions = require('../actions');
var echarts = require('./react-echarts');
var Granularity = require('../granularity');

var propTypes = { 
  source: PropTypes.oneOf(['temperature', 'humidity']),
  granularity: PropTypes.oneOf(Granularity.names()),
  info: PropTypes.shape({
    name: PropTypes.string,
    title: PropTypes.string,
    unit: PropTypes.string,
  }),
  timespan: PropTypes.oneOfType([
    PropTypes.oneOf(['day', 'week', 'month', 'year']),
    (props, propName, componentName) => ( 
      (PropTypes.arrayOf(PropTypes.number)(props, propName, componentName)) ||
      ((props[propName].length == 2)? (null) : (new Error(propName + ' should be an array of length 2')))
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
    
    computeTimespan: function (val) {
      // Compute the actual timespan as a pair of Epoch timestamps
      var t0, t1;
      if (_.isString(val)) {
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
        t0 = moment(val[0]); 
        t1 = moment(val[1]);
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
  
  render: function ()
  {
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
    
    var helpParagraph;
    if (t1 < t0) {
      helpParagraph = (
        <p className="help text-danger">The given timespan is invalid. Please, fix it.</p> 
      );
    } /*else if (this.state.dirty) {
      helpParagraph = (
        <p className="help text-warning">Your parameters have changed. Press <i>Refresh</i> to redraw data!</p> 
      ); 
    }*/ else {
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
            onChange={(val) => (
              this._setTimespan(val? (val) : ([t0.valueOf(), t1.valueOf()]))
            )} 
           />
          &nbsp; 
          {/*&nbsp;From:&nbsp;*/}
          <DatetimeInput 
            {...datetimeProps} 
            value={t0.toDate()} 
            onChange={(val) => (
              this._setTimespan([val.valueOf(), t1.valueOf()])
            )} 
           />
          &nbsp; 
          {/*&nbsp;To:&nbsp;*/}
          <DatetimeInput 
            {...datetimeProps} 
            value={t1.toDate()}
            onChange={(val) => (
              this._setTimespan([t0.valueOf(), val.valueOf()])
            )} 
           />
        </div>
        <div className="form-group">
          <label>Granularity:</label> 
          &nbsp;
          <Select
            className='select-granularity'
            value={this.props.granularity}
            options={Granularity.names()}
            onChange={this._setGranularity}
           />
        </div>
        <div className="form-group">
          <Button title="Refresh" 
            onClick={this._refresh}
           >
            <Glyphicon glyph="refresh" />&nbsp;Refresh
          </Button>
          &nbsp;
          <Button title="Save as image" 
            onClick={this._saveAsImage}
           >
            <Glyphicon glyph="save"/>&nbsp;Save
          </Button>
        </div>
        {helpParagraph}
      </form>
    )
  },

  // Event handlers

  _setTimespan: function (val) {
    this.props.setTimespan(val);
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
    console.info('Save as image ...');
    return false;
  },

}); 

var Chart = React.createClass({
  
  propTypes: _.extend({}, propTypes, {
    series: PropTypes.array, // Todo shape elements
  }),

  render: function ()
  {
    var info = this.props.info;
    var yf = (info.unit)? ((y) => (y.toString() + ' ' + info.unit)) : null;
    var pilot = (this.props.series || [])[0];
    return (
       <echarts.LineChart 
          width={750}
          height={350}
          xAxis={{
              numTicks: 5,
              min: pilot? (pilot.data[0][0]) : null,
              max: pilot? (pilot.data[pilot.data.length - 1][0]) : null,
              formatter: (t) => (moment(t).format('DD/MM/YYYY')), // Todo according to granularity 
          }}
          yAxis={{
              name: info.title,
              numTicks: 3,
              formatter: yf,
          }}
          series={this.props.series} // Fixme names?
      />
    );
    /*
    return (
      <echarts.LineChart 
          width={750}
          height={350}
          xAxis={{
              numTicks: 5,
              data: ['Mo','Tu','We','Th','Fr','Sa','Su'],
          }}
          yAxis={{
              name: "Temperature",
              numTicks: 3,
              formatter: (y) => (y.toString() + " oC")
          }}
          series={[
              {
                  name: 'Athens',
                  smooth: true,
                  fill: 0.4,
                  data: [11.0, 11.5, 13, 14, 13, 15, 17],
                  mark: {
                      lines: [{type: "max", name: "Max Temperature"}],
                  },
              },
              {
                  name: 'Thesalloniki',
                  data: [5.0, 8.5, 13.5, 14.7, 16, 19, 21.5],
              },
          ]}
      />
  );*/
}
});

// Container components

Panel = ReactRedux.connect(
  (state, ownProps) => (
    _.pick(state.stats[ownProps.source], ['granularity', 'timespan', 'info'])
  ), 
  (dispatch, ownProps) => ({
    setGranularity: (g) => (dispatch(actions.setGranularity(ownProps.source, g))),
    setTimespan: (ts) => (dispatch(actions.setTimespan(ownProps.source, ts))),
    refreshData: () => (dispatch(actions.refreshData(ownProps.source))) 
  })
)(Panel);

Chart = ReactRedux.connect(
  (state, ownProps) => (
    _.pick(state.stats[ownProps.source], ['granularity', 'timespan', 'info', 'series'])
  ),
  null
)(Chart);

// Export

module.exports = {Panel, Chart};
