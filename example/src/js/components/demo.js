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
      width: parseInt(this.props.width * 0.7),
      height: Math.max(parseInt(this.props.height * 0.33), 250), 
      legend: true, 
      theme: themes.get(this.props.theme),
    };
    
    return (
      <div>
        
        <div className="demo chart-wrapper" key={"chart-1/" + this.props.theme} id="chart-1-wrapper">
          <h4>{'Demo 1: Line charts - Value X axis'}</h4>
          <echarts.Chart {...chartProps} 
            xAxis={{
              numTicks: 10,
              formatter: (x) => (x.toFixed(1)),
              boundaryGap: [0.1, 0.1],
            }}
            yAxis={{
              name: "Demo 1",
              numTicks: 8,
              formatter: (y) => (y.toFixed(1)),
              min: 0.0,
            }}
            series={[
              {
                name: 'Town A',
                fill: 0.33,
                data: [
                  [0.20, 2.23], [0.50, 2.70], [0.70, 2.99], [0.91, 3.35], [1.02, 3.79], 
                  [1.19, 3.98], [1.50, 4.20], [1.71, 4.05], [1.89, 3.91], [2.01, 3.77],
                ],
              },
              {
                name: 'Town B',
                fill: null,
                symbol: 'rectangle',
                symbolSize: 9,
                smooth: true,
                data: [
                  [0.25, 2.46], [0.55, 2.90], [0.75, 3.20], [0.90, 3.55], [1.10, 3.89],
                  [1.19, 4.07], [1.55, 4.30], [1.79, 4.24], [1.93, 4.10], [2.03, 3.97],
                ],
              },
            ]}
          />
        </div>
        
        <div className="demo chart-wrapper" key={"chart-2/" + this.props.theme} id="chart-2-wrapper">
          <h4>{'Demo 2: Line charts - Category X axis'}</h4>
          <echarts.Chart {...chartProps}
            xAxis={{
              data: ['A', 'B', 'C', 'D', 'E', 'F'],
              formatter: (x) => (x.toLowerCase()),
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
                data: [
                  8.70, 9.58, 10.11, 10.40, 10.97, 10.18,
                ],
              },
            ]}
          />
        </div>

        <div className="demo chart-wrapper" key={"chart-3/" + this.props.theme} id="chart-3-wrapper">
          <h4>{'Demo 3: Line charts - Category X axis - Dual Y axis'}</h4>
          <echarts.Chart {...chartProps}
            legend={[
              ['Temperature - Station A', 'Temperature - Station B'], 
              ['Humidity']
            ]}
            xAxis={{
              data: ['A', 'B', 'C', 'D', 'E', 'F'],
            }}
            yAxis={[
              {
                name: "Temperature (C)",
                numTicks: 4,
                formatter: (y) => (y.toFixed(1) + 'C'),
                splitArea: false,
                min: 5.0,
                max: 20.0,
              },
              {
                name: "Humidity (%)",
                numTicks: 4,
                formatter: (y) => (y.toFixed(0) + '%'),
                min: 40.0,
                max: 100.0,
                splitArea: true,
              },
            ]}
            series={[
               {
                name: 'Temperature - Station A',
                data: [
                  9.85, 12.34, 12.90, 15.2, 14.08, 13.85,
                ],
              },
              {
                name: 'Temperature - Station B',
                data: [
                  10.26, 12.55, 13.40, 16.50, 14.95, 14.10,
                ],
              },
              {
                name: 'Humidity',
                data: [
                  50.81, 55.58, 60.34, 61.56, 57.91, 57.07,
                ],
                smooth: true,
                yAxisIndex: 1, // corresponds to 2nd Y axis
              },            
            ]}
          />
        </div>
        
        <div className="demo chart-wrapper" key={"chart-4/" + this.props.theme} id="chart-4-wrapper">
          <h4>{'Demo 4: Bar charts'}</h4>
          <echarts.Chart {...chartProps}
            xAxis={{
              data: ['A', 'B', 'C', 'D', 'E', 'F'],
              boundaryGap: [1, 1],
            }}
            yAxis={{
              name: "Demo 4",
              numTicks: 4,
              formatter: (y) => (y.toFixed(2)),
              //min: 5.0, 
              //max: 15.0,
            }}
            tooltip={false}
            series={[
              {
                name: 'Town A',
                type: 'bar',
                label: false,
                color: '#6DE3E6',
                data: [
                  10.16, 10.39, 10.42, 10.56, 11.08, 11.85,
                ],
              },
              {
                name: 'Town B',
                type: 'bar',
                label: true,
                data: [
                  8.70, 9.58, 10.11, 10.40, 10.97, 11.46,
                ],
              },
              {
                name: 'Town C',
                type: 'bar',
                label: {
                  position: 'top',
                  formatter: (y) => (y.toFixed(1))
                },
                data: [
                  9.50, 10.45, 10.41, 12.82, 11.33, 12.90,
                ],
              },
            ]}
          />
        </div>
      
        <div className="demo chart-wrapper" key={"chart-5/" + this.props.theme} id="chart-5-wrapper">
          <h4>{'Demo 5: Bar charts - Color Palette'}</h4>
          <echarts.Chart {...chartProps}
            xAxis={{
              data: ['A', 'B', 'C', 'D', 'E', 'F'],
              boundaryGap: [1, 1],
            }}
            yAxis={{
              name: "Demo 5",
              numTicks: 4,
              formatter: (y) => (y.toFixed(2)),
            }}
            tooltip={false}
            series={[
              {
                name: 'Town A',
                type: 'bar',
                label: true,
                color: (name, data, dataIndex) => {
                  // Colorize on value levels
                  var value = Number(data);
                  return (value < 10)? '#99CBEA' : (value < 11)? '#4D9CCD' : '#0F5A88';
                },
                data: [
                  9.76, 10.39, 10.90, 10.15, 11.08, 11.95,
                ],
              },
              {
                name: 'Town B',
                type: 'bar',
                color: (name, data, dataIndex) => {
                  // Colorize on category 
                  return ({
                    'A': '#ECA3A3', 'B': '#CC5D5D', 'C': '#CC8F5D',
                    'D': '#EAD731', 'E': '#92BD21', 'F': '#388E37',
                  })[name];
                },
                data: [
                  8.70, 9.58, 10.11, 10.40, 10.97, 11.46,
                ],

              },
            ]}
          />
        </div>
        
        <div className="demo chart-wrapper" key={"chart-6/" + this.props.theme} id="chart-6-wrapper">
          <h4>{'Demo 6: Bar charts - Horizontal View'}</h4>
          <echarts.Chart {...chartProps}
            horizontal={true}
            height={Math.max(parseInt(this.props.height * 0.50), 400)} /* make it a bit taller */
            xAxis={{
              data: ['A', 'B', 'C', 'D', 'E', 'F'],
              boundaryGap: [1, 1],
            }}
            yAxis={{
              name: "Demo 6",
              numTicks: 6,
              min: 8.0,
              max: 14.0,
              formatter: (y) => (y.toFixed(2)),
            }}
            tooltip={false}
            series={[
              {
                name: 'Town A',
                type: 'bar',
                label: true,
                data: [
                  9.76, 10.49, 10.30, 10.15, 11.08, 11.95,
                ],
              },
              {
                name: 'Town B',
                type: 'bar',
                label: true,
                data: [
                  8.70, 9.58, 10.11, 10.40, 10.97, 11.46,
                ],

              },
            ]}
          />
        </div>
     
      </div>
    );
  },
});

var Demo = React.createClass({
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
    {
      theme: state.demo.theme,
      width: state.demo.width,
      height: state.demo.height,
    }
  ), 
)(Charts);

// Exports

module.exports = Demo;
