'use strict';

module.exports = {

  color: ['#C23531', '#2F4554', '#61A0A8', '#ECA63F', '#41B024', '#DD4BCF', '#30EC9F', '#ECE030', '#ED2868', '#34B4F1'],

  grid: {
    x: '12%',
    y: '9%',
    x2: '9%',
    y2: '9%',
    borderColor: '#bbb'
  },

  legend: {
    padding: 10,
    itemHeight: 12,
    itemGap: 6,
    itemWidth: 35,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 0,
    textStyle: {
      fontSize: 12,
      fontFamily: 'serif'
    },
    x: 'center',
    y: 0
  },

  tooltip: {
    trigger: 'item',
    borderRadius: 1,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    textStyle: {
      fontSize: 10,
      color: '#fff'
    }
  },

  categoryAxis: {
    boundaryGap: false,
    nameTextStyle: {
      fontSize: 13
    },
    axisLine: {
      show: true,
      lineStyle: {
        color: '#555',
        width: 2,
        type: 'solid'
      }
    },
    axisTick: {
      show: true,
      interval: 'auto',
      inside: false,
      length: 5,
      lineStyle: {
        color: '#333',
        width: 1
      }
    },
    axisLabel: {
      show: true,
      interval: 'auto',
      rotate: 0,
      margin: 8,
      textStyle: {
        color: '#333',
        fontSize: 11,
        fontFamily: 'sans-serif'
      }
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['rgba(255,255,255,0.3)', 'rgba(200,200,200,0.2)']
      }
    }
  },

  valueAxis: {
    boundaryGap: [0, 0],
    nameTextStyle: {
      fontSize: 13
    },
    axisLine: {
      show: true,
      lineStyle: {
        color: '#555',
        width: 2,
        type: 'solid'
      }
    },
    axisTick: {
      show: true,
      interval: 'auto',
      inside: false,
      length: 5,
      lineStyle: {
        color: '#333',
        width: 1
      }
    },
    axisLabel: {
      show: true,
      interval: 'auto',
      rotate: 0,
      margin: 8,
      textStyle: {
        color: '#333',
        fontSize: 11,
        fontFamily: 'sans-serif'
      }
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['rgba(255,255,255,0.3)', 'rgba(200,200,200,0.2)']
      }
    }
  },

  line: {
    itemStyle: {
      normal: {
        lineStyle: {
          width: 2,
          type: 'solid'
        }
      },
      emphasis: {}
    },
    smooth: false,
    symbol: 'emptyCircle',
    symbolSize: 4
  },

  bar: {
    barMinHeight: 0,
    //barGap: '10%',
    barCategoryGap: '40%',
    itemStyle: {
      normal: {
        barBorderWidth: 0,
        barBorderRadius: 0
      },
      emphasis: {}
    }
  },

  symbolList: ['circle', 'rectangle', 'triangle', 'diamond', 'emptyCircle', 'emptyRectangle', 'emptyTriangle', 'emptyDiamond']

};