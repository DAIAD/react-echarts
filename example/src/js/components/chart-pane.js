var _ = global.lodash || require('lodash');

var React = global.React || require('react');
var ReactRedux = global.ReactRedux || require('react-redux');
var {FormGroup, ControlLabel, FormControl, HelpBlock, Select, Button} = ReactBootstrap; // Fixme

var PropTypes = React.PropTypes;

var actions = require('../actions');
var echarts = require('./react-echarts');
var Granularity = require('../granularity');

var propTypes = { 
  source: PropTypes.oneOf(['temperature', 'humidity']),
  granularity: PropTypes.oneOf(Granularity.names()),
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
  
  propTypes: propTypes,
  
  render: function ()
  {
    return (
      <form className="form-inline chart-panel" id={'panel-' + this.props.source} >
        <div className="form-group">
          <label>Time Span:</label>
          <select className="form-control-1" id={'input-' + this.props.source + '-timespan'} >
            {['day', 'week', 'month', 'year'].map(v => (<option key={v} value={v}>{v}</option>))}
            <option key="custom" value="custom">specify...</option>
          </select>
          <input type="text" className="form-control-1" disabled='disabled' placeholder="12/01/2015-13/01/2015"/>
        </div>
        &nbsp;
        <div className="form-group">
          <label>Granularity:</label> 
          <select className="form-control-1" id={'input-' + this.props.source + '-granularity'} >
            {Granularity.names().map(v => (<option key={v} value={v}>{v}</option>))}
          </select>
        </div>
        &nbsp;&nbsp;
        <Button>Refresh</Button>
        &nbsp;
        <Button>Clean</Button>
      </form>
    )
  },
}); 

var Chart = React.createClass({
  
  propTypes: propTypes,

  render: function ()
  {
    return (
      <p>Plot <code>{this.props.source}</code>...</p>
    );
  }
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


// Export

module.exports = {Panel, Chart};
