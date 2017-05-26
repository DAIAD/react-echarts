'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _ = require('lodash');
var React = require('react');
var ReactDOM = require('react-dom');
var echarts = require('echarts');
var rgbcolor = require('rgbcolor');
var sprintf = require('sprintf');

var develop = !(process.env.NODE_ENV == 'production');

var PropTypes = React.PropTypes;

var util = require('../util');
var validators = require('../validators');

var xaxisPropType = PropTypes.shape({
  name: PropTypes.string,
  data: PropTypes.array,
  formatter: PropTypes.func,
  boundaryGap: PropTypes.oneOfType([PropTypes.bool, PropTypes.arrayOf(PropTypes.number)]),
  numTicks: PropTypes.number,
  scale: PropTypes.bool,
  min: PropTypes.number,
  max: PropTypes.number
});

var yaxisPropType = PropTypes.shape({
  name: PropTypes.string,
  formatter: PropTypes.func,
  numTicks: PropTypes.number,
  splitArea: PropTypes.bool,
  scale: PropTypes.bool,
  min: PropTypes.number,
  max: PropTypes.number
});

var seriesPropType = PropTypes.shape({
  type: PropTypes.oneOf(['line', 'bar', 'scatter']),
  name: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired, // further checks must be performed at runtime
  yAxisIndex: PropTypes.number, // meaningfull if a dual Y axis is provided
  color: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  fill: PropTypes.number, // area opacity
  smooth: PropTypes.bool, // per-series
  symbolSize: PropTypes.number,
  symbol: PropTypes.oneOf(['circle', 'rectangle', 'triangle', 'diamond', 'emptyCircle', 'emptyRectangle', 'emptyTriangle', 'emptyDiamond']),
  label: PropTypes.oneOfType([PropTypes.bool, PropTypes.shape({
    position: PropTypes.oneOf(['left', 'right', 'top', 'bottom', 'inside', 'insideTop', 'insideBottom']),
    formatter: PropTypes.func
  })]),
  lineWidth: PropTypes.number, // pixels
  lineType: PropTypes.oneOf(['solid', 'dotted', 'dashed']),
  mark: PropTypes.shape({
    points: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.oneOf(['min', 'max']),
      name: PropTypes.string
    })),
    lines: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.oneOf(['min', 'max', 'avg']),
      name: PropTypes.string
    }))
  })
});

var gridPropType = PropTypes.shape({
  x: PropTypes.string,
  y: PropTypes.string,
  x2: PropTypes.string,
  y2: PropTypes.string
});

var imageOptionsPropType = PropTypes.shape({
  type: PropTypes.string,
  pixelRatio: PropTypes.number, // pixels
  backgroundColor: PropTypes.string
});

// A ECharts-based chart implemented as a React portal component
var Chart = React.createClass({
  displayName: 'Chart',


  statics: {
    limits: {
      numSeries: 8, // per chart
      numLegendItemsPerLine: 4
    },
    messages: {
      loadingText: 'Loading data...'
    },
    // Provide class-level defaults for messages, titles etc (lodash templates).
    templates: {
      pointTooltip: _.template('<%= seriesName %> <br/><%= x %>: <%= y %>'),
      valueTooltip: _.template('<%= seriesName %> <br/><%= name %>: <%= y %>')
    },
    defaults: {
      series: {
        type: 'line'
      },
      xAxis: {
        scale: true
      },
      yAxis: {
        splitArea: true,
        scale: true
      },
      legend: {
        data: null,
        padding: 5,
        itemGap: 5,
        itemHeight: 35
      }
    },

    propsToTheme: function propsToTheme(props) {
      var theme = _.cloneDeep(props.theme);

      theme = _.defaultsDeep(theme, {
        scatter: {
          itemStyle: {
            normal: {},
            emphasis: {}
          }
        },
        line: {
          itemStyle: {
            normal: {
              label: {}
            },
            emphasis: {}
          }
        },
        bar: {
          normal: {
            label: {}
          },
          emphasis: {}
        }
      });

      return theme;
    },

    propsToOptions: function propsToOptions(props) {
      // Build echarts-specific options based on props passed to component

      var opts = _.extend({}, {
        animation: false,
        calculable: false
      }, this.propsToAxisOptions(props), this.propsToTooltipOptions(props), this.propsToSeries(props));

      // Perform a final pass to adjust previously built options

      opts = this.adjustOptions(opts, props);

      return opts;
    },

    adjustOptions: function adjustOptions(opts, props) {
      // Note: This method modifies options in-place! 

      // 1. Adjust grid according to legend data

      var grid = opts.grid;


      var legend = _extends({}, this.defaults.legend, props.theme.legend, opts.legend);

      if (legend.data) {
        // Re-adjust grid.y according to number of line breaks in legend
        var n = legend.data.filter(function (name) {
          return name == '';
        }).length;
        var y0 = _.isString(grid.y) && grid.y.endsWith('%') ? parseInt(grid.y) * 0.01 * parseInt(props.height) : grid.y;
        var h = parseInt(legend.itemGap) + parseInt(legend.itemHeight);
        grid.y = parseInt(y0 || 0) + 2 * legend.padding + (n + 1) * h;
      }

      // 2. Swap axes, if horizontal view is enabled

      if (props.horizontal) {
        var xAxis = opts.xAxis,
            yAxis = opts.yAxis;

        opts.yAxis = xAxis;
        opts.xAxis = yAxis;
      }

      return opts;
    },

    propsToAxisOptions: function propsToAxisOptions(props) {
      var defaults = this.defaults;

      var axisType = props.xAxis.data ? 'category' : 'value';
      var opts = {};

      opts.grid = _extends({}, props.theme.grid, props.grid);

      var xax1 = {
        type: axisType,
        name: props.xAxis.name,
        data: props.xAxis.data,
        boundaryGap: props.xAxis.boundaryGap,
        splitNumber: axisType == 'category' || !_.isNumber(props.xAxis.numTicks) ? null : Number(props.xAxis.numTicks) - 1,
        axisTick: {
          show: true,
          interval: 'auto'
        },
        axisLabel: {
          formatter: props.xAxis.formatter,
          interval: axisType == 'value' ? null : props.xAxis.labelFilter || 'auto'
        },
        scale: props.xAxis.scale == null ? defaults.xAxis.scale : props.xAxis.scale,
        min: props.xAxis.min,
        max: props.xAxis.max
      };

      opts.xAxis = [xax1];

      opts.yAxis = (_.isArray(props.yAxis) ? props.yAxis.slice(0, 2) : [props.yAxis]).map(function (y) {
        return {
          type: 'value',
          name: y.name,
          splitArea: {
            show: y.splitArea == null ? defaults.yAxis.splitArea : Boolean(y.splitArea)
          },
          splitNumber: !_.isNumber(y.numTicks) ? null : Number(y.numTicks) - 1,
          axisLabel: {
            formatter: y.formatter
          },
          scale: y.scale == null ? defaults.yAxis.scale : y.scale,
          min: y.min,
          max: y.max
        };
      });

      return opts;
    },

    propsToTooltipOptions: function propsToTooltipOptions(props) {
      var _this = this;

      if (!props.tooltip) return { tooltip: false };

      var fx = props.xAxis.formatter || function (x) {
        return x.toString();
      };
      var fy = props.yAxis.formatter || function (y) {
        return y.toString();
      };
      var formatter = function formatter(p) {
        if (_.isArray(p.value)) {
          // Tooltip for a point
          return _this.templates.pointTooltip({
            seriesName: p.seriesName,
            x: fx(p.value[0]),
            y: fy(p.value[1])
          });
        } else {
          // Tooltip for a named value.
          // (a mark line or y value of a category chart)
          return _this.templates.valueTooltip({
            seriesName: p.seriesName,
            name: _.isNumber(p.name) ? fx(p.name) : p.name,
            y: fy(p.value)
          });
        }
      };

      return { tooltip: { formatter: formatter } };
    },

    propsToSeries: function propsToSeries(props) {
      var _this2 = this;

      var delimiter = util.delimiter,
          flattener = util.flattener;
      var defaults = this.defaults;
      var _limits = this.limits,
          N = _limits.numSeries,
          L = _limits.numLegendItemsPerLine;
      var series = props.series,
          legend = props.legend,
          theme = props.theme;


      if (series == null) {
        series = [];
      } else if (series.length > N) {
        console.warn(sprintf('Unable to plot more than %d series per chart', N));
        series = series.slice(0, N);
      }

      var colors = props.color || theme.color; // chart-wide palette

      // Build options for all provided series

      series = series.map(function (y, i) {
        var type = y.type || defaults.series.type; // line, bar, scatter

        var data = _this2._checkData(props.xAxis.data, y.data);
        if (!data) return null;

        // Colorize

        var color = null,
            rgba = null;
        if (y.color != null && _.isFunction(y.color)) {
          // A user-provided function for coloring: wrap to what ECharts expects
          color = function color(p) {
            return y.color(p.name, p.data, p.dataIndex);
          };
        } else {
          // A simple color: turn into rgba
          rgba = new rgbcolor(y.color || colors[i]);
          rgba.alpha = y.fill == null ? 1.0 : y.fill;
          color = rgba.toRGB();
        }

        // Provide labels for points

        var label = y.label ? _.isObject(y.label) ? y.label : {} : null;
        if (label != null) {
          (function () {
            var yf = label.formatter || props.yAxis.formatter;
            label = {
              show: true,
              position: label.position || (props.horizontal ? 'right' : 'top'),
              formatter: yf == null ? null : function (p) {
                return p.data ? yf(p.data) : null;
              }
            };
            label = _.defaults(label, theme[type].itemStyle.normal.label);
          })();
        }

        // Build options for this series 

        var r = {
          type: type,
          data: data,
          name: y.name,
          itemStyle: {
            normal: {
              color: color,
              label: label,
              areaStyle: y.fill == null || rgba == null ? null : {
                color: rgba.toRGBA()
              },
              lineStyle: rgba == null ? {} : {
                color: rgba.toRGB()
              }
            }
          },
          markPoint: !(y.mark && y.mark.points) ? null : {
            data: y.mark.points.map(function (y1) {
              return { name: y1.name, type: y1.type };
            }) },
          markLine: !(y.mark && y.mark.lines) ? null : {
            data: y.mark.lines.map(function (y1) {
              return { name: y1.name, type: y1.type };
            }) }
        };

        if (_.isString(y.symbol)) r.symbol = y.symbol;

        if (_.isNumber(y.symbolSize)) r.symbolSize = y.symbolSize;

        if (_.isBoolean(y.smooth)) r.smooth = y.smooth;

        if (_.isNumber(y.yAxisIndex)) r.yAxisIndex = y.yAxisIndex;

        var lineWidth = y.lineWidth || props.lineWidth;
        if (_.isNumber(lineWidth)) r.itemStyle.normal.lineStyle.width = lineWidth;

        var lineType = y.lineType || props.lineType;
        if (_.isString(lineType)) r.itemStyle.normal.lineStyle.type = lineType;

        return r;
      });

      series = series.filter(function (y) {
        return y;
      }); //omit malformed series (mapped to null)

      // Build legend options based on supplied series.
      // For readability, insert line breaks every L items.

      if (legend === false) {
        // Hide
        legend = { show: false };
      } else if (legend == null || legend === true) {
        // By default, simply provide the names of all series.
        var names = series.map(function (y) {
          return y.name;
        });
        legend = {
          data: names.length > L ? names.reduce(delimiter(L, ''), []) : names
        };
      } else if (_.isArray(legend)) {
        // The layout is described as an array of names
        if (legend.every(function (v) {
          return _.isString(v);
        })) {
          // Assume a flat array of series names
          legend = {
            data: legend.length > L ? legend.reduce(delimiter(L, ''), []) : legend
          };
        } else {
          // Assume a nested array that explicitly describes layout (line breaks)
          legend = {
            data: legend.reduce(flattener(''), [])
          };
        }
      } else {
        legend = null;
      }

      if (legend.data) {
        (function () {
          // Format names to appear in a table layout (pad to maximum length)
          var n = _.max(legend.data.map(function (name) {
            return name.length;
          }));
          legend.formatter = function (name) {
            return _.padEnd(name, n, ' ');
          };
        })();
      }

      // Done
      return { legend: legend, series: series };
    },

    _checkData: function _checkData(xaxisData, data) {
      // Check if supplied (series) data is according to x-axis type
      if (xaxisData) {
        // Expect array of numbers paired to x-axis data (xAxis.type=category)
        data = data.map(function (v) {
          return v == '-' || v == null ? null : Number(v);
        });
        if (data.length != xaxisData.length || data.some(function (v) {
          return isNaN(v);
        })) data = null; // invalidate the entire array
      } else {
        // Expect array of [x, y] pairs (xAxis.type=value)
        data = data.filter(function (p) {
          return Array.isArray(p) && p.length == 2;
        }).map(function (p) {
          return [Number(p[0]), Number(p[1])];
        });
      }
      return data;
    },

    propsToLoadingOptions: function propsToLoadingOptions(props) {
      // Consider as loading only if received 'loading' prop
      var opts = null;
      if (_.isObject(props.loading)) {
        var text = props.loading.text;
        opts = {
          effect: 'spin',
          text: text || this.messages.loadingText
        };
      }
      return opts;
    }
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
    theme: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    legend: PropTypes.oneOfType([PropTypes.bool, PropTypes.array]),
    loading: PropTypes.oneOfType([PropTypes.bool, PropTypes.shape({ text: PropTypes.string })]),
    xAxis: xaxisPropType,
    yAxis: PropTypes.oneOfType([yaxisPropType, PropTypes.arrayOf(yaxisPropType)]),
    grid: gridPropType,
    color: PropTypes.arrayOf(PropTypes.string),
    tooltip: PropTypes.bool,
    horizontal: PropTypes.bool,
    onPointClick: PropTypes.func,
    smooth: PropTypes.bool, // fallback for series
    lineWidth: PropTypes.number, // fallback for series (pixels)
    lineType: PropTypes.oneOf([// fallback for series
    'solid', 'dotted', 'dashed']),
    renderAsImage: PropTypes.bool,
    imageOptions: imageOptionsPropType,
    series: PropTypes.arrayOf(seriesPropType)
  },

  // Lifecycle

  getDefaultProps: function getDefaultProps() {
    // Note: getDefaultProps is a class method (`this` is the component class)
    var defaults = this.defaults;


    return {
      prefix: 'chart',
      loading: false,
      theme: require('../theme/default'),
      grid: {},
      tooltip: true,
      horizontal: false,
      legend: true,
      xAxis: _extends({}, defaults.xAxis, {
        numTicks: 10,
        labelFilter: 'auto'
      }),
      yAxis: _extends({}, defaults.yAxis, {
        numTicks: 5
      }),
      smooth: false, // override per-series
      lineWidth: 2,
      lineType: 'solid',
      renderAsImage: false,
      imageOptions: {
        type: 'png',
        pixelRatio: 5,
        backgroundColor: '#fff'
      }
    };
  },

  componentWillMount: function componentWillMount() {
    var randomString = util.randomString;

    develop && console.debug('About to mount <Chart>...');
    this._id = this.props.id ? this.props.id : this.props.prefix + '-' + randomString();
  },

  componentDidMount: function componentDidMount() {
    this._initializeChart();
    this._redrawChart(this.props);
  },

  componentWillUnmount: function componentWillUnmount() {
    this._chart.off('CLICK');
    this._destroyChart();
    this._el = null;
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    develop && console.debug('Received new props for <Chart>...');

    // Check if viewport has changed
    if (nextProps.width != this.props.width || nextProps.height != this.props.height) {
      this._resize(nextProps.width, nextProps.height);
    }

    // Redraw chart
    this._redrawChart(nextProps);
  },

  shouldComponentUpdate: function shouldComponentUpdate() {
    return false;
  },

  componentWillUpdate: function componentWillUpdate() {
    console.assert(false, 'Unexpected update!');
  },

  render: function render() {
    var _this3 = this;

    develop && console.debug('Rendering <Chart>...');
    return React.createElement('div', {
      id: this._id,
      ref: function ref(el) {
        _this3._el = el;
      },
      className: ['portal', this.props.prefix].join(' '),
      style: {
        width: this.props.width,
        height: this.props.height
      }
    });
  },

  // Internal methods: lifecycle of ECharts instance

  _resize: function _resize(width, height) {
    console.assert(this._el != null, 'The DOM element must be mounted!');
    this._el.style.width = width.toString() + "px";
    this._el.style.height = height.toString() + "px";

    console.assert(this._chart != null, 'The ECharts instance must be initialized!');
    this._chart.resize();
  },

  _initializeChart: function _initializeChart() {
    var _this4 = this;

    var cls = this.constructor;

    console.assert(this._el != null, 'Invalid parent DOM element');
    console.assert(this._chart == null, 'Expected an empty EChart instance');

    var theme = cls.propsToTheme(this.props);
    this._chart = echarts.init(this._el, theme);

    _.isFunction(this.props.onPointClick) && this._chart.on('CLICK', function (p) {
      _this4.props.onPointClick(p.seriesIndex, p.dataIndex);
    });

    if (_.isFunction(this.props.refreshData)) {
      // Can refresh itself: fire a request for fresh series data.
      this.props.refreshData();
    }
  },

  _redrawChart: function _redrawChart(nextProps) {
    var cls = this.constructor;
    var options = null;

    develop && console.debug('Redrawing <Chart> from nextProps...');

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

    if (nextProps.renderAsImage) {
      this._renderAsImage(nextProps.imageOptions);
    }
  },

  _renderAsImage: function _renderAsImage(imageOptions) {
    // this version of echarts does not support direct renderAsImage
    // render image as base-64
    var img = document.createElement('img');
    var src = this._chart.getDataURL(imageOptions);

    img.setAttribute('src', src);
    img.setAttribute('id', this._id);
    img.setAttribute('width', '100%');
    img.setAttribute('max-height', '100%');

    var parent = document.getElementById(this._id).parentNode;
    parent.removeChild(parent.childNodes[0]);
    parent.appendChild(img);
  },

  _destroyChart: function _destroyChart() {
    this._chart.dispose();
    this._chart = null;
  }
});

module.exports = Chart;