# react-echarts
Reusable chart (presentational) components based on ECharts (https://ecomfe.github.io/echarts/index-en.html).

## Quickstart

Install the module via NPM, directly from the GIT url:

    npm install --save git+https://github.com/daiad/react-echarts.git

Require a component class:

```javascript
var {LineChart} = require('react-echarts');
...
```

## Components

### LineChart

Represents a line/area chart. 

#### Properties - LineChart

Properties related to the portal (i.e. container) element:

| Name | Required | Type | Description | Example |
| ---- | -------- | ---- | ----------- | --------|
| `width` | Yes | `Number`, `String` | The width (pixels) of the container element. | `250` |
| `height` | Yes | `Number`, `String` | The height (pixels) of the container element. | `250` |

Property callbacks:

| Name | Required | Type | Description | Example |
| ---- | -------- | ---- | ----------- | --------|
| `refreshData` | No | `function()` | A callback that can be invoked by the component to explicitly request fresh data | `()=>(dispatch(refreshData("Foo")))` |

Properties for the chart (a simplified subset of those supported by ECharts):

| Name | Required | Type | Description | Example |
| ---- | -------- | ---- | ----------- | --------|
| `xAxis.data` | No | `array` | An array of distinct (aka `category`) values that `x` can take | `['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']` |
| `xAxis.name` | No | `String` | Name X axis | `Time (s)` |
| `xAxis.scale` | No | `Boolean` | Scale axis according to supplied series data (meaningless if `xAxis.data` is supplied) | `true` |
| `xAxis.formatter` | No | `(x)=>(<String>)` | Formatter callback for x values | `(x)=>(x.toString() + 'Km')` |
| `xAxis.labelFilter` | No | `(i, x) => (<Boolean>)` | Decide if a label should be shown on the X axis. | `(i) => (i % 2 == 0)` |
| `xAxis.numTicks` | No | `Number` | A hint for the number of ticks on X axis | `5` |
| `xAxis.boundaryGap` | No | `Boolean` | Add a gap between min/max x value and axis boundaries | `false` |
| `xAxis.min` | No | `Number` | A maximum for displayed x values (meaningless if `xAxis.data` is supplied) | `0` |
| `xAxis.max` | No | `Number` | A minimum for displayed x values (meaningless if `xAxis.data` is supplied) | `5.0` |
| `yAxis.name` | No | `String` | Name Y axis | `Velocity` |
| `yAxis.scale` | No | `Boolean` | Scale axis according to supplied series data | `true` |
| `yAxis.formatter` | No | `(y)=>(<String>)` | Formatter callback for y values | `(y)=>(y.toString() + 'lit')` |
| `yAxis.numTicks` | No | `Number` | A hint for the number of ticks on y axis | `5` |
| `yAxis.splitArea` | No | `Boolean` | Split grid area to alternate zones defined by horizontal lines at Y axis ticks| `true` |
| `yAxis.min` | No | `Number` | A maximum for displayed y values | `-100` |
| `yAxis.max` | No | `Number` | A minimum for displayed y values | `+100` |
| `grid.x` | No | `String` or `Number` | See [ECharts - grid.x](http://echarts.baidu.com/echarts2/doc/option-en.html#tooltip-line1~grid.x) | `15%` | 
| `grid.y` | No | `String` or `Number` | See [ECharts - grid.y](http://echarts.baidu.com/echarts2/doc/option-en.html#tooltip-line1~grid.y) | `10%` | 
| `grid.x2` | No | `String` or `Number` | See [ECharts - grid.x2](http://echarts.baidu.com/echarts2/doc/option-en.html#tooltip-line1~grid.x2) | `15%` | 
| `grid.y2` | No | `String` or `Number` | See [ECharts - grid.y2](http://echarts.baidu.com/echarts2/doc/option-en.html#tooltip-line1~grid.y2) | `10%` | 
| `color` | No | `Array` of `String` | A palette of preferred colors | `['#C23531', '#2F4554']` |
| `tooltip` | No | `Boolean` | Display tooltips for data points or marker points/lines | `true` |
| `smooth` | No | `Boolean` | Smoothen lines for all series (spline interpolation) | `false` |
| `lineWidth` | No | `Number` | The line width (in pixels) of all plotted series | `2` |
| `legend` | No | `Boolean` or `Array` | Display legend. If an array is supplied, then it can control the order and layout of items (a nested array generates a legend that wraps over multiple lines) | `true`, `[['A', 'B'], ['C', 'D']]`, `['A', 'C', 'D', 'B']`|

The `series` property is an array that provides the actual data to be plotted:

| Name | Required | Type | Description | Example |
| ---- | -------- | ---- | ----------- | --------|
| `series.0.type` | Yes | `String` | The type of the plot for this series. One of: `line`, `bar`, `scatter` | `line` |
| `series.0.name` | Yes | `String` | The name of this dataset | `Temperature - Athens` |
| `series.0.data` | Yes | `Array` | The data points. See [note](#note---series-data) | `[11.0, 11.5, 13, 14, 13, 15, 17]` |
| `series.0.yAxisIndex` | No | `Number` | The Y axis that a series corresponds to. This is meaningfull only if a dual Y axis is provided as `yAxis` property. | `0` or `1`|
| `series.0.color` | No | `String` or `(name, data, dataIndex)=>(<String>)` | The color for this line/bars. | `'#C23531'` |
| `series.0.smooth` | No | `Boolean` | Smooth line for this series (spline interpolation) | `false` |
| `series.0.fill` | No | `Number` | Fill areas with the given opacity | `null` or `0.55`|
| `series.0.symbolSize` | No | `Number` | Radius for symbols for (x,y) points | `4` |
| `series.0.symbol` | No | `String` | Choose a symbol for (x,y) points. One of: `circle`, `rectangle`, `triangle`, `diamond`, `emptyCircle`, `emptyRectangle`, `emptyTriangle`, `emptyDiamond` | `emptyCircle` |
| `series.0.lineWidth` | No | `Number` | The width (pixels) for this line | `false` |
| `series.0.label` | No | `Object` or `Boolean`| Describe labels for points on cartesian plane. If present, each (x, y) point is labeled. | `{position: "top"}` |
| `series.0.label.position` | No | `String` | Specify a position for labels (relative to point). One of: `top`, `bottom`, `left`, `right`, `inside`, `insideTop`, `insideBottom` | `top` |
| `series.0.label.formatter` | No | `(y)=>(<String>)` | Provide a formatter for labels | `() => y.toFixed(1)` |
| `series.0.mark.points` | No | `Object` | Describe marker points | `[{type: "max", name: "Max Temperature"}]` |
| `series.0.mark.lines` | No | `Object` | Describe marker lines | `[{type: "min", name: "Min Temperature"}]` |

Properties for the status of plotted data: 

| Name | Required | Type | Description | Example |
| ---- | -------- | ---- | ----------- | --------|
| `loading`| No | `Object` or `Boolean` | Provide a progress visual feedback (spinner, progressbar) | `{text: "Loading data...", progress: 0.7}` |

#### Example - LineChart

```jsx
<LineChart 
    width='500px'
    height='300px'
    legend: {[
        ['Athens', 'Thesalloniki'],
        ['Herakleion'],
    ]}
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
        {
            name: 'Herakleion',
            data: [15.0, 18.5, 19.5, 24.7, 26, 29, 31.5],
        },
    ]}
/>
```

#### Note - Series Data

The expected `series.X.data` shape is completely different depending on `xAxis.data` (see also [ECharts - xAxis type](http://echarts.baidu.com/echarts2/doc/option-en.html#tooltip-line1~xAxis-i)). 

We have 2 cases:

1. If `xAxis.data` is supplied (thus, fully describing the value domain of x as a set of distinct values), then `series.X.data` (for all series!) should be an array of numbers mapped 1-1 to the set of x values. This is a _category_ x axis. Example: `[5.0, 8.5, 13.5, 14.7, 16, 19, 21.5]` mapping to `['Mo','Tu','We','Th','Fr','Sa','Su']` 

2. If `xAxis.data` is missing, this implies that each one of the series will carry its own data points (i.e pairs of (x,y) numerical values). This is a _value_ x axis. Example: some (rougly stepped at `0.5`) measurements: `[[0.0, 15.6], [0.43, 19.1], [0.97, 18.8], [1.52, 17], [2.10, 17.6]]`

#### Note - Dual Y axis

In some cases, we want to plot different series on a dual Y axis (on the same categorical X axis). For these cases, the `yAxis` property can be provided as a pair (as array) of yAxis-shaped properties (see above documentation).

## Development - Quickstart 

Install Grunt locally (and use a symlink for convenience):

    npm install grunt-cli grunt
    ./grunt

Install all project dependencies:

    npm install

Build everything:

    ./grunt build

Deploy for the local development Express server:

    ./grunt deploy

Start development server:
    
    npm run example
