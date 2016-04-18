var React = global.React || require('react');
var ReactRedux = global.ReactRedux || require('react-redux');

var actions = require('../actions');
var LineChart = require('./line-container');

// Presentational component

var Root = React.createClass({
  render: function ()
  {
    return (
      <div>
        <section id='sec-1'>
          <h3>Example #1: Lines/Areas</h3>
          <LineChart 
            xAxis={{
              data: ['Mo','Tu','We','Th','Fr','Sa','Su'],
            }}
            yAxis={{
              name: 'Temperature (' + this.props.name + ')',
              numTicks: 3,
              //min: 0,
              //max: 30,
              formatter: (y) => (y.toString() + '°C')
            }}
            refreshData={this.props.refreshData}
           />
          <div className="panel">
            <button 
              onClick={(ev) => (this.props.refreshData(), false)}
             >Refresh</button>
            <button 
              onClick={(ev) => (console.info('Cleanup'), false)}
             >Cleanup</button>
          </div>
        </section>
      </div>
    );
  }
});

// Container component

const mapStateToProps = (state, ownProps) => ({
  route: state.route,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  refreshData: function () {
    console.info('Loading series data...');
    dispatch(actions.refreshTemperatureData());
  },
});

module.exports = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(Root)
