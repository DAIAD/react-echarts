'use strict';

var _ = require('lodash');
var React = require('react');
var ReactDOM = require('react-dom');
var echarts = require('echarts');
var rgbcolor = require('rgbcolor');
var sprintf = require('sprintf');

const develop = !(process.env.NODE_ENV == 'production');

var PropTypes = React.PropTypes;

var util = require('../util');
var validators = require('../validators');

var xaxisPropType = PropTypes.shape({
  name: PropTypes.string,
  data: PropTypes.array,
  formatter: PropTypes.func,
  boundaryGap: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.arrayOf(PropTypes.number),
  ]),
  numTicks: PropTypes.number,
  scale: PropTypes.bool,
  min: PropTypes.number,
  max: PropTypes.number,
});

var yaxisPropType = PropTypes.shape({
  name: PropTypes.string,
  formatter: PropTypes.func,
  numTicks: PropTypes.number,
  splitArea: PropTypes.bool,
  scale: PropTypes.bool,
  min: PropTypes.number,
  max: PropTypes.number,
});

var seriesPropType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired, // further checks must be performed at runtime
  yAxisIndex: PropTypes.number, // meaningfull if a dual Y axis is provided
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
});

var gridPropType = PropTypes.shape({
  x:  PropTypes.string,
  y:  PropTypes.string,
  x2:  PropTypes.string,
  y2:  PropTypes.string,
});

// A ECharts-based chart implemented as a React portal component
var Chart = React.createClass({
  
  statics: {
    limits: {
      numSeries: 8, // per chart
      numLegendItemsPerLine: 4,
    },
    messages: {
      loadingText: 'Loading data...',
    },
    // Provide class-level defaults for messages, titles etc (lodash templates).
    templates: {
      pointTooltip: _.template('<%= seriesName %> <br/><%= x %>: <%= y %>'),
      valueTooltip: _.template('<%= seriesName %> <br/><%= name %>: <%= y %>'),
    },
    defaults: {
      series: {
        type: 'line',
      },
      xAxis: {
        scale: true,
      },
      yAxis: {
        splitArea: true,
        scale: true,
      },
      legend: { 
        data: null,
        padding: 5,
        itemGap: 5,
        itemHeight: 35,
      },
    },

    propsToOptions: function (props)
    {
      // Build ECharts-specific options based on props passed to a component
      var opts = _.extend({}, 
        {
          animation: false, 
          calculable: false,
        },
        this.propsToAxisOptions(props),
        this.propsToTooltipOptions(props),
        this.propsToSeries(props)
      );
      
      // Perform a final pass to adjust options previously built
      
      opts = this.adjustOptions(opts, props);

      return opts;
    },
    
    adjustOptions: function (opts, props) {
      // Note: This method modifies options in-place! 
      
      var {grid} = opts;
      var legend = {
        ...this.defaults.legend,
        ...props.theme.legend, 
        ...opts.legend,
      };

      // Try to adjust grid according to legend data
      if (legend.data) {
        // Re-adjust grid.y according to number of line breaks in legend
        let n = legend.data.filter(name => (name == '')).length;
        let y0 = (_.isString(grid.y) && grid.y.endsWith('%'))? 
          (parseInt(grid.y) * 0.01 * parseInt(props.height)) : (grid.y);
        let h = parseInt(legend.itemGap) + parseInt(legend.itemHeight);
        grid.y = parseInt(y0 || 0) + 2 * legend.padding + (n + 1) * h;
      }
      
      return opts
    },
    
    propsToAxisOptions: function (props)
    {
      var {defaults} = this;
      var axisType = props.xAxis.data? 'category' : 'value';
      var opts = {};
        
      opts.grid = {...props.theme.grid, ...props.grid};

      var xax1 = {
        type: axisType,
        name: props.xAxis.name, 
        data: props.xAxis.data,
        boundaryGap: props.xAxis.boundaryGap, 
        splitNumber: (axisType == 'category' || !_.isNumber(props.xAxis.numTicks))? 
          null : (Number(props.xAxis.numTicks) - 1),
        axisTick: {
          show: true,
          interval: 'auto',
        },
        axisLabel: {
          formatter: props.xAxis.formatter,
          interval: (axisType == 'value')? null : (props.xAxis.labelFilter || 'auto'),
        },
        scale: (props.xAxis.scale == null)? defaults.xAxis.scale : props.xAxis.scale,
        min: props.xAxis.min, 
        max: props.xAxis.max,
      };
   
      opts.xAxis = [xax1];
      
      opts.yAxis = (_.isArray(props.yAxis)? (props.yAxis.slice(0, 2)) : ([props.yAxis]))
        .map(y => ({
          type: 'value',
          name: y.name, 
          splitArea: {
            show: (y.splitArea == null)? defaults.yAxis.splitArea : Boolean(y.splitArea),
          },
          splitNumber: !_.isNumber(y.numTicks)? null : (Number(y.numTicks) - 1),
          axisLabel: {
            formatter: y.formatter
          },
          scale: (y.scale == null)? defaults.yAxis.scale : y.scale,
          min: y.min, 
          max: y.max,
        }))

      return opts;
    },
    
    propsToTooltipOptions: function (props)
    {
      if (!props.tooltip)
        return {tooltip: false};
      
      var fx = props.xAxis.formatter || (x => x.toString());
      var fy = props.yAxis.formatter || (y => y.toString());
      var formatter = (p) => {
        if (_.isArray(p.value)) {
          // Tooltip for a point
          return this.templates.pointTooltip({
            seriesName: p.seriesName,
            x: fx(p.value[0]),
            y: fy(p.value[1]),
          })
        } else {
          // Tooltip for a named value.
          // (a mark line or y value of a category chart)
          return this.templates.valueTooltip({
            seriesName: p.seriesName,
            name: _.isNumber(p.name)? fx(p.name) : p.name,
            y: fy(p.value)
          })
        } 
      }; 
      
      return {tooltip: {formatter}};
    },

    propsToSeries: function (props)
    {
      var {delimiter, flattener} = util;

      const {defaults} = this;
      const {numSeries: N, numLegendItemsPerLine: L} = this.limits;
      
      var {series, legend} = props;
      
      if (series == null) {
        series = [];
      } else if (series.length > N) {
        console.warn(sprintf('Unable to plot more than %d series per chart', N));
        series = series.slice(0, N);
      }
      
      // Build series options

      series = series.map((y, i) => {
        var data = this._checkData(props.xAxis.data, y.data); 
        if (!data)
          return null;
        
        var color = new rgbcolor(y.color || (props.color || props.theme.color)[i]);
        color.alpha = (y.fill == null)? 1.0 : y.fill;
        
        var r = {
          type: y.type || defaults.series.type,
          name: y.name,
          data,
          itemStyle: {
            normal: {
              color: color.toRGB(),
              areaStyle: (y.fill == null)? null : {
                color: color.toRGBA(),
              },
              lineStyle: {
                color: color.toRGB(),
              },
            }
          },
          markPoint: !(y.mark && y.mark.points)? null : {
            data: y.mark.points.map(y1 => ({name: y1.name, type: y1.type})
          )},
          markLine: !(y.mark && y.mark.lines)? null : {
            data: y.mark.lines.map(y1 => ({name: y1.name, type: y1.type})
          )},
        };
       
        _.isString(y.symbol) && (r.symbol = y.symbol); 
        
        _.isNumber(y.symbolSize) && (r.symbolSize = y.symbolSize);

        _.isBoolean(y.smooth) && (r.smooth = y.smooth);
        
        _.isNumber(y.yAxisIndex) && (r.yAxisIndex = y.yAxisIndex);

        var lineWidth = y.lineWidth || props.lineWidth;
        _.isNumber(lineWidth) && (r.itemStyle.normal.lineStyle.width = lineWidth);

        return r;
      });
      
      series = series.filter(y => y); //omit malformed series (mapped to null)

      // Build legend options based on supplied series.
      // For readability, insert line breaks every L items.

      if (legend === false) {
        // Hide
        legend = {show: false};
      } else if (legend == null || legend === true) {
        // By default, simply provide the names of all series.
        let names = series.map(y => y.name);
        legend = {
          data: (names.length > L)? names.reduce(delimiter(L, ''), []) : names
        };
      } else if (_.isArray(legend)) {
        // The layout is described as an array of names
        if (legend.every(v => _.isString(v))) {
          // Assume a flat array of series names
          legend = {
            data: (legend.length > L)? 
              legend.reduce(delimiter(L, ''), []) : legend,
          };
        } else {
          // Assume a nested array that explicitly describes layout (line breaks)
          legend = {
            data: legend.reduce(flattener(''), []),
          };
        }
      } else {
        legend = null;
      }
      
      if (legend.data) {
        // Format names to appear in a table layout (pad to maximum length)
        let n = _.max(legend.data.map(name => name.length)); 
        legend.formatter = (name) => (_.padEnd(name, n, ' '));
      }

      // Done
      return {legend, series};
    },
    
    _checkData: function (xaxisData, data)
    {
      // Check if supplied (series) data is according to x-axis type
      if (xaxisData) {
        // Expect array of numbers paired to x-axis data (aAxis.type=category)
        data = data.map(v => ((v == '-' || v == null)? null : Number(v)));
        if (data.length != xaxisData.length || data.some(v => isNaN(v)))
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
      // Consider as loading only if received 'loading' prop
      var opts = null;
      if (_.isObject(props.loading)) {
        var text = props.loading.text;
        opts = {
          effect: 'spin',
          text: text || this.messages.loadingText,
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
    // Properties for charting: a simplified subset of the options provided by ECharts
    theme: PropTypes.oneOfType([
      PropTypes.string, 
      PropTypes.object
    ]),
    legend: PropTypes.oneOfType([
      PropTypes.bool, 
      PropTypes.array, // as: ['A', 'B', 'C', 'D'] or [['A', 'B'], ['C', 'D']]
    ]),
    loading: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.shape({text: PropTypes.string}),
    ]),
    xAxis: xaxisPropType,
    yAxis: PropTypes.oneOfType([
      yaxisPropType,
      PropTypes.arrayOf(yaxisPropType), // a pair of Y axis (dual Y axis)
    ]),
    grid: gridPropType, 
    color: PropTypes.arrayOf(PropTypes.string),
    tooltip: PropTypes.bool,
    smooth: PropTypes.bool, // fallback for series
    lineWidth: PropTypes.number, // fallback for series (pixels)
    series: PropTypes.arrayOf(seriesPropType),
  },

  // Lifecycle
  
  getDefaultProps: function ()
  {
    // Note: getDefaultProps is a class method (`this` is the component class)
    var {defaults} = this;

    return {
      prefix: 'chart',
      loading: false,
      theme: require('../theme/default'),
      grid: {},
      tooltip: true,
      legend: true,
      xAxis: {
        ...defaults.xAxis,
        numTicks: 10,
        labelFilter: 'auto',
      },
      yAxis: {
        ...defaults.yAxis,
        numTicks: 5,
      },
      smooth: false, // override per-series
      lineWidth: 2,
    };
  },

  componentWillMount: function ()
  {
    var {randomString} = util;
    develop && console.debug('About to mount <Chart>...');
    if (!this.props.id)
      this._id = (this.props.id)? 
        (this.props.id) : (this.props.prefix + '-' + randomString());
  },

  componentDidMount: function ()
  {
    this._el = ReactDOM.findDOMNode(this);
    this._initializeChart();
    this._redrawChart(this.props);
  },
  
  componentWillUnmount: function ()
  {
    this._destroyChart();
    this._el = null;
  },

  componentWillReceiveProps: function (nextProps)
  {
    develop && console.debug('Received new props for <Chart>...')
    
    // Check if viewport has changed
    if (nextProps.width != this.props.width || nextProps.height != this.props.height) {
      this._resize(nextProps.width, nextProps.height);
    }

    // Redraw chart
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
    develop && console.debug('Rendering <Chart>...');
    return (
      <div 
        id={this._id}
        className={['portal', this.props.prefix].join(' ')}
        style={{
          width: this.props.width,
          height: this.props.height
        }}
       />
    );
  },
  
  // Internal methods: lifecycle of ECharts instance

  _resize: function (width, height)
  {
    console.assert(this._el != null, 'The DOM element must be mounted!');
    this._el.style.width = width.toString() + "px";
    this._el.style.height = height.toString() + "px";
    
    console.assert(this._chart != null, 'The ECharts instance must be initialized!');
    this._chart.resize();
  },
  
  _initializeChart: function ()
  {
    console.assert(this._chart == null, 'Expected an empty EChart instance');
    
    var theme = _.cloneDeep(this.props.theme);
    this._chart = echarts.init(this._el, theme);
    
    if (_.isFunction(this.props.refreshData)) {
      // Can refresh itself: fire a request for fresh series data.
      this.props.refreshData();
    }
  },
  
  _redrawChart: function (nextProps)
  { 
    var cls = this.constructor;
    var options = null;
    
    develop && console.debug('Redrawing <Chart> from nextProps...')
    
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
