var React = require('react');
var ReactRedux = require('react-redux');

var {Button, Glyphicon} = require('react-bootstrap');
var Select = require('react-controls/select-dropdown');

var echarts = require('./react-echarts');

var actions = require('../actions');

var themes = require('../theme/index');

var Form = React.createClass({
  
  getDefaultProps: function () {
    return {
      theme: 'default',
    };
  },

  getInitialState: function () {
    return {
      theme: this.props.theme,
    };
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState({theme: nextProps.theme});
  },

  render: function ()
  {
    return (
      <form className="form-inline">
        <div className="form-group">
          <label>Pick Theme:</label>
          &nbsp;
          <Select
            className='select-theme'
            value={this.state.theme}
            options={new Map(Array.from(themes.keys()).map(t => ([t, t])))}
            onChange={(val) => (this.setState({theme: val}))} 
           />
          &nbsp;
          <Button bsStyle="primary" onClick={this._setTheme}>Apply!</Button>
        </div>
      </form>
    );  
  },

  _setTheme: function (val)
  {
    this.props.setTheme(this.state.theme);
  },
});

var Charts = React.createClass({
  
  getDefaultProps: function () {
    return {
      theme: 'default',
    };
  },
 
  render: function ()
  {
    var chartProps = {
      width: 780, 
      height: 280, 
      legend: true, 
      theme: themes.get(this.props.theme),
    };
    
    return (
      <div>
        <div key={"chart-1/" + this.props.theme} id="chart-1-wrapper">
          <h4>{'Demo 1: Line charts - Value axis'}</h4>
          <echarts.LineChart {...chartProps} 
            xAxis={{
              numTicks: 10,
              formatter: (x) => (x.toFixed(1)),
              boundaryGap: [0.1, 0.1],
            }}
            yAxis={{
              name: "Demo 1",
              numTicks: 8,
              formatter: (y) => (y.toFixed(1)),
            }}
            series={[
              {
                name: 'Town A',
                fill: 0.33,
                data: [
                  [0.2, 2.23],
                  [0.5, 2.70],
                  [0.7, 2.99],
                  [0.91, 3.35],
                  [1.02, 3.79],
                  [1.19, 3.98],
                  [1.50, 4.20],
                  [1.71, 4.05],
                  [1.89, 3.91],
                  [2.01, 3.77],
                ],
              },
              {
                name: 'Town B',
                fill: null,
                symbol: 'rectangle',
                symbolSize: 8,
                smooth: true,
                data: [
                  [0.25, 2.46],
                  [0.55, 2.90],
                  [0.75, 3.20],
                  [0.90, 3.55],
                  [1.10, 3.89],
                  [1.19, 4.07],
                  [1.55, 4.30],
                  [1.79, 4.24],
                  [1.93, 4.10],
                  [2.03, 3.97],
                ],
              },
            ]}
          />
        </div>
        
        <div key={"chart-2/" + this.props.theme} id="chart-2-wrapper">
          <h4>{'Demo 2: Line charts - Category axis'}</h4>
          <echarts.LineChart {...chartProps}
            xAxis={{
              data: ['A', 'B', 'C', 'D', 'E', 'F'],
              formatter: (x) => (x.toLowerCase()),
              boundaryGap: true,
            }}
            yAxis={{
              name: "Demo 2",
              numTicks: 4,
              formatter: (y) => (y.toFixed(1)),
            }}
            series={[
              {
                name: 'Town A',
                fill: 0.33,
                data: [
                  10.16, 10.39, 10.42, 10.56, 11.08, 11.85,
                ],
              },
              {
                name: 'Town B',
                fill: 0.33,
                data: [
                  8.70, 9.58, 10.11, 10.40, 10.97, 11.46,
                ],
              },
            ]}
          />
        </div>
      </div>
    )
  },
});

// Containers

Form = ReactRedux.connect(
  (state, ownProps) => (
    {theme: state.demo.theme}
  ), 
  (dispatch, ownProps) => ({
    setTheme: (val) => (dispatch(actions.setTheme(val))),
  })
)(Form);

Charts = ReactRedux.connect(
  (state, ownProps) => (
    {theme: state.demo.theme}
  ), 
)(Charts);

// Exports

module.exports = React.createClass({
  render: function ()
  {
    return (
      <div>
        <Form />
        <Charts />
      </div>
    );
  }
});
