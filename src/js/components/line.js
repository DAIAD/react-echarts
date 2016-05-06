'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var echarts = require('echarts');
var _ = require('lodash');
var rgbcolor = require('rgbcolor');

const development = !(process.env.NODE_ENV == 'production');

var PropTypes = React.PropTypes;

var {randomString} = require('../util');
var validators = require('../validators');

// A ECharts-based chart implemented as a React portal component
var Chart = React.createClass({
  
  statics: {
    limits: {
      numSeries: 8, // per chart
    },
    defaults: {
      // Provide class-level defaults for props (simplified subset of ECharts options)
      // Note: This part feeds getDefaultProps() method needed for React.
      props: {
        grid: {
          x: '12%', 
          y: '10%', 
          y2: '10%', 
          x2: '12%',
        },
        color: [
          '#C23531', '#2F4554', '#61A0A8', '#ECA63F', '#41B024', 
          '#DD4BCF', '#30EC9F', '#ECE030', '#ED2868', '#34B4F1',
        ],
        tooltip: true,
        xAxis: {
          numTicks: 10,
        },
        yAxis: {
          numTicks: 5,
        },
        smooth: false, // override per-series
        lineWidth: 2,
      }, 
      // Provide class-level fallbacks for ECharts chart options
      options: {
        yAxis: {
          splitArea: {show: true},
          splitNumber: 5,
          scale: true,
        },
        xAxis: {
          boundaryGap: false,
          splitNumber: 10,
          scale: true,
        },
        tooltip: {
          trigger: 'item',
          borderRadius: 1,
          padding: 5,
          textStyle: {fontSize: 10},
        },
        series: {
          smooth: false,
          symbol: 'emptyCircle',
          symbolSize: 4,
        },
      },
      // Provide class-level defaults for messages, titles etc (lodash templates).
      templates: {
        pointTooltip: '<%= seriesName %> <br/><%= x %>: <%= y %>',
        lineTooltip: '<%= seriesName %> <br/><%= name %>: <%= y %',
      },
      messages: {
        loadingText: 'Loading data...',
      },
    },

    propsToOptions: function (props)
    {
      // Build options for (ECharts) chart based on props passed to a component
      return _.extend(
        {}, 
        this.propsToAxisOptions(props),
        this.propsToTooltipOptions(props),
        this.propsToSeries(props)
      );
    },
    
    propsToAxisOptions: function (props)
    {
      var defaults = this.defaults.options;
      return {
        animation: false,
        calculable: false,
        grid: props.grid,
        xAxis: [{
          name: props.xAxis.name, 
          type: props.xAxis.data? 'category' : 'value',
          boundaryGap: defaults.xAxis.boundaryGap,
          data: props.xAxis.data,
          splitNumber: props.xAxis.data? null : ((props.xAxis.numTicks == null)? 
            defaults.xAxis.splitNumber : props.xAxis.numTicks),
          axisLabel: {
            formatter: props.xAxis.formatter
          },
          scale: defaults.xAxis.scale,
          min: props.xAxis.min, 
          max: props.xAxis.max,
        }],
        yAxis: [{
          type: 'value',
          name: props.yAxis.name, 
          splitArea: defaults.yAxis.splitArea,
          splitNumber: (props.yAxis.numTicks == null)? 
            defaults.yAxis.splitNumber : props.yAxis.numTicks,
          axisLabel: {
            formatter: props.yAxis.formatter
          },
          scale: defaults.yAxis.scale,
          min: props.yAxis.min, 
          max: props.yAxis.max,
        }],
      };
    },
    
    propsToTooltipOptions: function (props)
    {
      if (!props.tooltip)
        return {tooltip: false};
      
      var defaults = this.defaults;
      var opts = _.extend({}, defaults.options.tooltip);
      
      var fx = props.xAxis.formatter || (x => x.toString());
      var fy = props.yAxis.formatter || (y => y.toString());
      var markupForPoint = _.template(defaults.templates.pointTooltip);
      var markupForLine = _.template(defaults.templates.lineTooltip);
      
      opts.formatter = (p) => {
        if (_.isArray(p.value)) {
          // Tooltip for a point
          return markupForPoint({
            seriesName: p.seriesName,
            x: fx(p.value[0]),
            y: fy(p.value[1]),
          })
        } else {
          // Tooltip for a line (?)
          return markupForLine({
            seriesName: p.seriesName,
            name: p.name,
            y: fy(p.value)
          })
        } 
      }; 
      
      return {tooltip: opts};
    },

    propsToSeries: function (props)
    {
      var defaults = this.defaults.options;
      var N = this.limits.numSeries;
      var series = props.series || [];
      
      series = (series.length > N)? series.slice(0, N) : series;
      return {
        legend: {data: series.map(y => y.name)},
        series: series
          .map((y, i) => {
            var color = new rgbcolor(y.color || props.color[i]);
            color.alpha = (y.fill == null)? 1.0 : y.fill;
            var data = this._checkData(props, y.data);
            return data? {
              name: y.name,
              type: 'line',
              symbol: y.symbol || defaults.series.symbol,
              symbolSize: (y.symbolSize == null)? (defaults.series.symbolSize) : (y.symbolSize),
              smooth: (y.smooth == null)? 
                ((props.smooth == null)? defaults.series.smooth : props.smooth) : (y.smooth), 
              itemStyle: {
                normal: {
                  areaStyle: (y.fill == null)? null : {
                    color: color.toRGBA(),
                  },
                  lineStyle: {
                    width: (y.lineWidth == null)? (props.lineWidth) : (y.lineWidth),
                    color: color.toRGB(),
                  },
                }
              },
              data: data,
              markPoint: (y.mark && y.mark.points)? y.mark.points.map(y1 => ({
                name: y1.name, type: y1.type,
              })) : null,
              markLine: (y.mark && y.mark.lines)? y.mark.lines.map(y1 => ({
                name: y1.name, type: y1.type, 
              })) : null,
            } : null; // return null if data is invalid
        })
        .filter(y => y), // omit malformed series (mapped to null)
      };
    },
    
    _checkData: function (props, data)
    {
      // Check if supplied (series) data is according to x-axis type
      if (props.xAxis.data) {
        // Expect array of numbers paired to x-axis data (aAxis.type=category)
        data = data.map(v => ((v == '-' || v == null)? null : Number(v)));
        if (data.length != props.xAxis.data.length || data.some(v => isNaN(v)))
          data = null; // invalidate the entire array
      } else {
        // Expect array of [x, y] pairs (xAxis.type=value)
        data = data.filter(p => (Array.isArray(p) && p.length == 2))
          .map(p => ([Number(p[0]), Number(p[1])]));
      }
      return data;
    },

    propsToLoadingOptions: function (props) 
    {
      var opts = null;
      if (
        _.isEmpty(props.series) || // no data present
        _.isObject(props.loading)  // or explicitly received 'loading' prop
      ) {
        var text = props.loading? props.loading.text : null;
        opts = {
          effect: 'spin',
          text: text || this.defaults.messages.loadingText,
        };
      }
      return opts;
    },
  },

  propTypes: {
    // Properties for the container (i.e. portal) element
    id: PropTypes.string,
    prefix: PropTypes.string,
    width: validators.validateDimension,
    height: validators.validateDimension,
    // Properties injected from parent for callbacks
    refreshData: PropTypes.func,
    // Properties for various chart options:
    // This is a (simplified) subset of the options provided by ECharts
    theme: PropTypes.string,
    loading: PropTypes.shape({text: PropTypes.string}),
    xAxis: PropTypes.shape({
      data: PropTypes.array,
      formatter: PropTypes.func,
      numTicks: PropTypes.number,
      min: PropTypes.number,
      max: PropTypes.number,
    }),
    yAxis: PropTypes.shape({
      formatter: PropTypes.func,
      numTicks: PropTypes.number,
      min: PropTypes.number,
      max: PropTypes.number,
    }),
    grid: PropTypes.shape({
      x:  PropTypes.string,
      y:  PropTypes.string,
      x2:  PropTypes.string,
      y2:  PropTypes.string,
    }),
    color: PropTypes.arrayOf(PropTypes.string),
    tooltip: PropTypes.bool,
    smooth: PropTypes.bool, // fallback for series
    lineWidth: PropTypes.number, // fallback for series (pixels)
    series: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      data: PropTypes.array.isRequired, // further checks must be performed at runtime
      color: PropTypes.string,
      fill: PropTypes.number, // area opacity
      smooth: PropTypes.bool, // per-series
      symbolSize: PropTypes.number, 
      symbol: PropTypes.oneOf([
        'circle', 'rectangle', 'triangle', 'diamond',
        'emptyCircle', 'emptyRectangle', 'emptyTriangle', 'emptyDiamond',
      ]),
      lineWidth: PropTypes.number, // pixels
      mark: PropTypes.shape({
        points: PropTypes.arrayOf(PropTypes.shape({
          type: PropTypes.oneOf(['min', 'max']),
          name: PropTypes.string,
        })), 
        lines:  PropTypes.arrayOf(PropTypes.shape({
          type: PropTypes.oneOf(['min', 'max', 'avg']),
          name: PropTypes.string, 
        })),
      }),
    })),
  },

  // Lifecycle
  
  getDefaultProps: function ()
  {
    // Note: getDefaultProps is a class method (`this` is the component class)

    return _.extend(
      {
        prefix: 'chart',
        theme: 'default',
        loading: false,
      },
      // Provide class-level defaults
      this.defaults.props, 
      // Provide example values for "xAxis", "yAxis", "series" props; 
      // in reality, these props will be provided by a parent component!
      {
        xAxis: {
          // An axis of `category` type 
          data: ['A','B','C','D','E','F','G'], 
          numTicks: 10,
        },
        yAxis: {
          numTicks: 5,
          formatter: (y) => (y.toString() + '°C'),
        },
        series: [
          {
            name: 'Sample #1',
            smooth: true,
            fill: 0.4,
            data: [11.0, 11.5, 13, 14, 13, 15, 17],
          },
          {
            name: 'Sample #2',
            data: [5.0, 8.5, 13.5, 14.7, 16, 19, 21.5],
          },
        ],
      }
    );
  },

  componentWillMount: function ()
  {
    development && console.debug('About to mount <Chart>...');
    if (!this.props.id)
      this._id = (this.props.id)? 
        (this.props.id) : (this.props.prefix + '-' + randomString());
  },

  componentDidMount: function ()
  {
    this._el = ReactDOM.findDOMNode(this);
    this._initializeChart();
  },
  
  componentWillUnmount: function ()
  {
    this._destroyChart();
    this._el = null;
  },

  componentWillReceiveProps: function (nextProps)
  {
    development && console.debug('Received new props for <Chart>...')
    this._redrawChart(nextProps);
  },

  shouldComponentUpdate: function ()
  {
    return false;
  },

  componentWillUpdate: function()
  {
    console.assert(false, 'Unexpected update!');
  },

  render: function ()
  {
    development && console.debug('Rendering <Chart>...');
    return (
      <div id={this._id}
        className={['portal', this.props.prefix].join(' ')}
        style={{
          width: this.props.width,
          height: this.props.height
        }}
       >
      </div>
    );
  },
  
  // Internal methods: lifecycle of ECharts instance

  _initializeChart: function ()
  {
    console.assert(this._chart == null, 'Expected an empty EChart instance');
    this._chart = echarts.init(this._el, this.props.theme);
    
    if (_.isFunction(this.props.refreshData)) {
      // Can refresh itself: fire a request for fresh series data.
      this.props.refreshData();
    }
    
    // Regardless of data, draw chart based on current props.
    this._redrawChart(this.props);
  },
  
  _redrawChart: function (nextProps)
  { 
    var cls = this.constructor;
    var options = null;
    
    development && console.info('Redrawing <Chart> from nextProps...')
    
    // Reset chart from received props
    options = cls.propsToOptions(nextProps);
    this._chart.setOption(options, true);
    
    // Reset loading status
    options = cls.propsToLoadingOptions(nextProps);
    if (!options) {
      this._chart.hideLoading();
    } else {
      this._chart.showLoading(options);
    }
  },

  _destroyChart: function ()
  {
    this._chart.dispose();
    this._chart = null;
  },
});

module.exports = Chart;
