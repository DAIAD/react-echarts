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

// A ECharts-based chart implemented as a React portal component
var Chart = React.createClass({
  
  statics: {
    limits: {
      numSeries: 8, // per chart
      numLegendItemsPerLine: 4,
    },
    defaults: {
      // Provide class-level defaults for props (simplified subset of ECharts options)
      // Note: This part feeds getDefaultProps() method needed for React.
      props: {
        grid: {
          x: '10%', 
          y: '30', 
          x2: '8%',
          y2: '30',
        },
        color: [
          '#C23531', '#2F4554', '#61A0A8', '#ECA63F', '#41B024', 
          '#DD4BCF', '#30EC9F', '#ECE030', '#ED2868', '#34B4F1',
        ],
        tooltip: true,
        legend: true,
        xAxis: {
          numTicks: 10,
          boundaryGap: false,
        },
        yAxis: {
          numTicks: 5,
        },
        smooth: false, // override per-series
        lineWidth: 2,
      }, 
      // Provide class-level defaults for ECharts chart options
      options: {
        legend: {
          padding: 5,
          itemHeight: 12,
          itemGap: 6,
          itemWidth: 35,
          backgroundColor: '#FFF',
          borderColor: '#CCC',
          borderWidth: 0,
          textStyle: {
            fontSize: 11,
            fontFamily: 'monospace', // needed only for vertical alignment
          },
          x: 'center',
          y: 0,
        },
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
          type: 'line',
          smooth: false,
          symbol: 'emptyCircle',
          symbolSize: 4,
        },
      },
      // Provide class-level defaults for messages, titles etc (lodash templates).
      templates: {
        pointTooltip: _.template('<%= seriesName %> <br/><%= x %>: <%= y %>'),
        valueTooltip: _.template('<%= seriesName %> <br/><%= name %>: <%= y %>'),
      },
      messages: {
        loadingText: 'Loading data...',
      },
    },

    propsToOptions: function (props)
    {
      // Build ECharts-specific options based on props passed to a component
      
      var opts = _.extend({}, 
        this.propsToAxisOptions(props),
        this.propsToTooltipOptions(props),
        this.propsToSeries(props)
      );
      
      // Perform a final pass to adjust options previously built
      
      opts = this.adjustOptions(opts);

      return opts;
    },
    
    adjustOptions: function (opts) {
      // Note: This method modifies options in-place! 
      
      var {grid, legend} = opts;

      // Adjust grid according to legend data
       
      if (legend.data) {
        // Re-adjust grid.y according to number of line breaks in legend
        let n = legend.data.filter(name => (name == '')).length;
        grid.y = parseInt(grid.y) +
          2 * legend.padding + (n + 1) * (legend.itemGap + legend.itemHeight);
      }
      
      return opts
    },
    
    propsToAxisOptions: function (props)
    {
      const defaults = this.defaults.options;
      return {
        animation: false,
        calculable: false,
        grid: {...props.grid},
        xAxis: [{
          name: props.xAxis.name, 
          type: props.xAxis.data? 'category' : 'value',
          boundaryGap: (props.xAxis.boundaryGap == null)? 
            defaults.xAxis.boundaryGap : props.xAxis.boundaryGap,
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
      
      var {templates, options: defaultOptions} = this.defaults;
      
      var fx = props.xAxis.formatter || (x => x.toString());
      var fy = props.yAxis.formatter || (y => y.toString());
      var formatter = (p) => {
        if (_.isArray(p.value)) {
          // Tooltip for a point
          return templates.pointTooltip({
            seriesName: p.seriesName,
            x: fx(p.value[0]),
            y: fy(p.value[1]),
          })
        } else {
          // Tooltip for a named value.
          // (a mark line or y value of a category chart)
          return templates.valueTooltip({
            seriesName: p.seriesName,
            name: _.isNumber(p.name)? fx(p.name) : p.name,
            y: fy(p.value)
          })
        } 
      }; 
      
      return {tooltip: {...defaultOptions.tooltip, formatter}};
    },

    propsToSeries: function (props)
    {
      var {delimiter, flattener} = util;

      const defaults = this.defaults.options;
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
        
        var color = new rgbcolor(y.color || props.color[i]);
        color.alpha = (y.fill == null)? 1.0 : y.fill;
        
        return {
          name: y.name,
          type: defaults.series.type,
          data,
          symbol: y.symbol || defaults.series.symbol,
          symbolSize: (y.symbolSize == null)? 
            defaults.series.symbolSize : y.symbolSize,
          smooth: (y.smooth == null)?
            ((props.smooth == null)? defaults.series.smooth : props.smooth) : y.smooth,
          itemStyle: {
            normal: {
              color: color.toRGB(),
              areaStyle: (y.fill == null)? null : {
                color: color.toRGBA(),
              },
              lineStyle: {
                width: (y.lineWidth == null)? (props.lineWidth) : (y.lineWidth),
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
      });
      
      series = series.filter(y => y); //omit malformed series (mapped to null)

      // Build legend options based on series.
      // For readability, insert line breaks every L items.

      if (legend === false) {
        // Hide
        legend = {show: false};
      } else if (legend == null || legend === true) {
        // By default, simply provide the names of all series.
        let names = series.map(y => y.name);
        legend = {
          ...defaults.legend,
          data: (names.length > L)? names.reduce(delimiter(L, ''), []) : names
        };
      } else if (_.isArray(legend)) {
        // The layout is described as an array of names
        if (legend.every(v => _.isString(v))) {
          // Assume a flat array of series names
          legend = {
            ...defaults.legend,
            data: (legend.length > L)? 
              legend.reduce(delimiter(L, ''), []) : legend,
          };
        } else {
          // Assume a nested array that explicitly describes layout (line breaks)
          legend = {
            ...defaults.legend,
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
    legend: PropTypes.oneOfType([
      PropTypes.bool, 
      PropTypes.array, // as: ['A', 'B', 'C', 'D'] or [['A', 'B'], ['C', 'D']]
    ]),
    loading: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.shape({text: PropTypes.string}),
    ]),
    xAxis: PropTypes.shape({
      data: PropTypes.array,
      formatter: PropTypes.func,
      boundaryGap: PropTypes.bool,
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
  },
  
  componentWillUnmount: function ()
  {
    this._destroyChart();
    this._el = null;
  },

  componentWillReceiveProps: function (nextProps)
  {
    develop && console.debug('Received new props for <Chart>...')
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
    
    develop && console.info('Redrawing <Chart> from nextProps...')
    
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
